import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Lock, Play, Star, ChevronRight, X, Construction, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRef, useEffect, useState, useMemo } from 'react';
import { RoadmapNode } from '@/types/types';

interface HorizontalRoadmapProps {
    nodes: RoadmapNode[];
    title?: string;
    categoryName?: string;
    className?: string;
    onClose?: () => void;
}

export function HorizontalRoadmap({ nodes, title, categoryName, className, onClose }: HorizontalRoadmapProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeGroupId, setActiveGroupId] = useState<string | number | null>(null);

    // Grouping logic: A group starts with a parent (container/critical) and includes following children
    const groupMap = useMemo(() => {
        const map: Record<string | number, string | number> = {};
        let currentParentId: string | number | null = null;

        nodes.forEach(node => {
            const isParent = node.behavior === 'container' || node.nodeType === 'critical';
            if (isParent) {
                currentParentId = node.id;
            }
            if (currentParentId) {
                map[node.id] = currentParentId;
            }
        });
        return map;
    }, [nodes]);

    // Auto-scroll to the available node on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const availableNodeIndex = nodes.findIndex(n => n.status === 'available');
            if (availableNodeIndex !== -1) {
                const nodeWidth = 160;
                const containerWidth = scrollContainerRef.current.clientWidth;
                const scrollPos = (availableNodeIndex * nodeWidth) - (containerWidth / 2) + (nodeWidth / 2);

                scrollContainerRef.current.scrollTo({
                    left: Math.max(0, scrollPos),
                    behavior: 'smooth'
                });
            }
        }
    }, [nodes]);

    return (
        <div className={cn("w-full py-6 relative", className)}>
            <div className="flex items-center justify-between mb-6 px-4">
                {title && (
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                    </div>
                )}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {nodes.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 px-6 text-center"
                >
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-slate-900/50 p-4 rounded-full border border-blue-500/30 backdrop-blur-sm"
                        >
                            <Sparkles className="w-10 h-10 text-blue-400" />
                        </motion.div>
                    </div>

                    <h4 className="text-lg md:text-xl font-bold text-white mb-1 italic">
                        "Cada gran viaje comienza con un primer paso..."
                    </h4>
                    <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                        Muy pronto iniciarás el recorrido por esta fascinante aventura de <span className="text-blue-400 font-bold">{categoryName || 'esta materia'}</span>. Estamos preparando el mapa más épico para tu aprendizaje.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full border border-blue-500/30 text-xs font-medium animate-pulse">
                        <Construction className="w-3.5 h-3.5" />
                        Mapa en construcción
                    </div>
                </motion.div>
            ) : (
                <div
                    ref={scrollContainerRef}
                    className="w-full overflow-x-auto py-8 px-4 flex items-center scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-slate-800/30 hover:scrollbar-thumb-blue-500/50"
                >
                    <div className="flex items-center relative min-w-full">
                        {nodes.map((node, index) => {
                            const isCompleted = node.status === 'completed';
                            const isAvailable = node.status === 'available';
                            const isPartial = node.status === 'partial';
                            const isLocked = node.status === 'locked';

                            const isCritical = node.nodeType === 'critical';
                            const isContainer = node.behavior === 'container';

                            const isHexagon = isCritical && isContainer;
                            const isDiamond = isContainer && !isHexagon;
                            const isCircle = !isHexagon && !isDiamond;

                            const groupId = groupMap[node.id];
                            const isActive = activeGroupId === groupId;

                            // Connector Logic: Only connect to next if same group
                            const nextNode = nodes[index + 1];
                            const hasSameGroupConnector = nextNode && groupMap[nextNode.id] === groupId;

                            let borderColor = "border-slate-700";
                            let shadowColor = "";
                            let iconColor = "text-slate-500";
                            let rippleColor = "border-blue-500/50";

                            if (isCompleted) {
                                borderColor = "border-green-500";
                                shadowColor = isActive ? "shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "shadow-green-500/10";
                                iconColor = "text-green-500";
                            } else if (isPartial) {
                                borderColor = "border-amber-500";
                                shadowColor = isActive ? "shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "shadow-amber-500/10";
                                iconColor = "text-amber-500";
                                rippleColor = "border-amber-500/50";
                            } else if (isAvailable || !isLocked) {
                                if (isCritical) {
                                    borderColor = "border-rose-500";
                                    shadowColor = isActive ? "shadow-[0_0_25px_rgba(244,63,94,0.5)]" : "shadow-rose-500/20";
                                    iconColor = "text-rose-500";
                                    rippleColor = "border-rose-500/50";
                                } else {
                                    borderColor = "border-blue-500";
                                    shadowColor = isActive ? "shadow-[0_0_25px_rgba(59,130,246,0.5)]" : "shadow-blue-500/20";
                                    iconColor = "text-blue-400";
                                    rippleColor = "border-blue-500/50";
                                }
                            }

                            return (
                                <div key={node.id} className="relative flex flex-col items-center group min-w-[160px] z-10">
                                    {/* Connector Line (Group-based) */}
                                    {hasSameGroupConnector && (
                                        <div className="absolute top-7 left-[50%] w-full h-[3px] z-0 overflow-hidden pointer-events-none">
                                            <div className={cn(
                                                "w-full h-full transition-all duration-500",
                                                isActive
                                                    ? (isCritical ? "bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                                                        isPartial ? "bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                                                            "bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.5)]")
                                                    : "bg-slate-800"
                                            )} />
                                        </div>
                                    )}

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onMouseEnter={() => groupId && setActiveGroupId(groupId)}
                                                    onMouseLeave={() => setActiveGroupId(null)}
                                                    onClick={() => {
                                                        if (groupId) setActiveGroupId(groupId);
                                                        node.onClick();
                                                    }}
                                                    className={cn(
                                                        "relative w-14 h-14 flex items-center justify-center border-4 shadow-lg transition-all duration-500 bg-slate-950",
                                                        borderColor,
                                                        shadowColor,
                                                        isLocked ? "grayscale opacity-50 cursor-default" : "cursor-pointer",
                                                        (isAvailable || isActive || isPartial) && "scale-110",
                                                        isActive && "border-opacity-100",

                                                        isCircle && "rounded-full",
                                                        isDiamond && "rounded-xl rotate-45",
                                                        isHexagon && "clip-hexagon"
                                                    )}
                                                    style={isHexagon ? {
                                                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                                        borderRadius: 0,
                                                        border: 'none',
                                                    } : {}}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center w-full h-full",
                                                        isDiamond && "-rotate-45"
                                                    )}>
                                                        {isCompleted && <CheckCircle className={cn("w-6 h-6", iconColor)} />}
                                                        {isPartial && <Construction className={cn("w-6 h-6", iconColor)} />}
                                                        {isAvailable && (
                                                            <Play className={cn("w-6 h-6 ml-1 fill-current opacity-80", iconColor)} />
                                                        )}
                                                        {isLocked && <Lock className={cn("w-5 h-5", iconColor)} />}
                                                    </div>

                                                    {(isAvailable || isActive || isPartial) && !isLocked && (
                                                        <span className={cn(
                                                            "absolute inset-0 border-2 animate-ping-slow pointer-events-none",
                                                            rippleColor,
                                                            isCircle && "rounded-full",
                                                            isDiamond && "rounded-xl"
                                                        )} />
                                                    )}
                                                </motion.button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200">
                                                <p className="font-bold">{node.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {isLocked ? "Próximamente" :
                                                        isPartial ? "Tema con contenido parcial - Explorar" :
                                                            isCompleted ? "Completado" : "Click para explorar"}
                                                    {isCritical && <span className="block text-rose-400 font-bold mt-1">¡Hito Crítico!</span>}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className={cn(
                                        "mt-4 text-center px-2 transition-all duration-500 max-w-[140px]",
                                        (isAvailable || isActive || isPartial) ? "opacity-100 transform translate-y-0" : "opacity-70 group-hover:opacity-100"
                                    )}>
                                        <p className={cn(
                                            "text-[10px] font-bold truncate w-full mb-1 uppercase tracking-wider",
                                            isCompleted ? "text-green-400" :
                                                isPartial ? "text-amber-400" :
                                                    (isAvailable || isActive) ? (isCritical ? "text-rose-400" : "text-blue-300") : "text-slate-500"
                                        )}>
                                            {node.title}
                                        </p>

                                        {(isAvailable || isPartial) && node.progress !== undefined && (
                                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${node.progress}%` }}
                                                    className={cn("h-full rounded-full",
                                                        isCritical ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                                                            isPartial ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                                                                "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
