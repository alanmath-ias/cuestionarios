import { motion } from 'framer-motion';
import { CheckCircle, Lock, Play, Star, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRef, useEffect } from 'react';
import { RoadmapNode } from '@/types/types';

interface HorizontalRoadmapProps {
    nodes: RoadmapNode[];
    title?: string;
    className?: string;
    onClose?: () => void;
}

export function HorizontalRoadmap({ nodes, title, className, onClose }: HorizontalRoadmapProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the available node on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const availableNodeIndex = nodes.findIndex(n => n.status === 'available');
            if (availableNodeIndex !== -1) {
                // Calculate position to center the node
                const nodeWidth = 200; // Approximate width of a node section
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

            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto py-8 px-4 flex items-center scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-slate-800/30 hover:scrollbar-thumb-blue-500/50"
            >
                <div className="flex items-center relative min-w-full">
                    {/* Connecting Line Background */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 w-full z-0" />

                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 z-0 transition-all duration-1000"
                        style={{
                            width: `${(nodes.filter(n => n.status === 'completed').length / (nodes.length - 1 || 1)) * 100}%`
                        }}
                    />

                    {nodes.map((node, index) => {
                        const isCompleted = node.status === 'completed';
                        const isAvailable = node.status === 'available';
                        const isLocked = node.status === 'locked';
                        const isLast = index === nodes.length - 1;

                        // Determine Shape and Style
                        const isCritical = node.nodeType === 'critical';
                        const isContainer = node.behavior === 'container';

                        // Shape Logic
                        const isHexagon = isCritical && isContainer;
                        const isDiamond = isContainer && !isHexagon;
                        const isCircle = !isHexagon && !isDiamond;

                        // Color Logic
                        let borderColor = "border-slate-700";
                        let shadowColor = "";
                        let iconColor = "text-slate-500";
                        let rippleColor = "border-blue-500/50";

                        if (isCompleted) {
                            borderColor = "border-green-500";
                            shadowColor = "shadow-green-500/20";
                            iconColor = "text-green-500";
                        } else if (isAvailable) {
                            if (isCritical) {
                                borderColor = "border-rose-500";
                                shadowColor = "shadow-rose-500/40";
                                iconColor = "text-rose-500";
                                rippleColor = "border-rose-500/50";
                            } else {
                                borderColor = "border-blue-500";
                                shadowColor = "shadow-blue-500/40";
                                iconColor = "text-blue-400";
                                rippleColor = "border-blue-500/50";
                            }
                        }

                        return (
                            <div key={node.id} className="relative flex flex-col items-center group min-w-[160px] z-10">
                                {/* Node Shape */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={isLocked ? undefined : node.onClick}
                                                className={cn(
                                                    "relative w-14 h-14 flex items-center justify-center border-4 shadow-lg transition-all duration-300 bg-slate-950",
                                                    borderColor,
                                                    shadowColor,
                                                    isLocked && "grayscale opacity-60 cursor-not-allowed",
                                                    isAvailable && "scale-110",

                                                    // Shape Classes
                                                    isCircle && "rounded-full",
                                                    isDiamond && "rounded-xl rotate-45",
                                                    isHexagon && "clip-hexagon" // Assuming global class or fallback
                                                )}
                                                style={isHexagon ? {
                                                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                                    borderRadius: 0,
                                                    border: 'none', // Clip path cuts border, so we might need a background simulated border?
                                                    // For consistency with existing map: if clip-path is used, border is tricky.
                                                    // SkillTreeView used inline styles. 
                                                    // Let's use a simpler approach for Hexagon if clip-path is hard with border:
                                                    // Just use a Hexagon SVG background or wrapper?
                                                    // Or simpler: Standardize on Diamond/Circle for now unless Hexagon is critical.
                                                    // Re-reading SkillTreeView: it uses `clip-hexagon` class. 
                                                    // If I lack that class, I'll stick to style.
                                                } : {}}
                                            >
                                                {/* Inner Content (Counter-rotate if Diamond) */}
                                                <div className={cn(
                                                    "flex items-center justify-center w-full h-full",
                                                    isDiamond && "-rotate-45"
                                                )}>
                                                    {isCompleted && <CheckCircle className={cn("w-6 h-6", iconColor)} />}

                                                    {isAvailable && (
                                                        <Play className={cn("w-6 h-6 ml-1 fill-current opacity-80", iconColor)} />
                                                    )}

                                                    {isLocked && <Lock className={cn("w-5 h-5", iconColor)} />}
                                                </div>

                                                {/* Ripple Effect for Available */}
                                                {isAvailable && (
                                                    <>
                                                        <span className={cn(
                                                            "absolute inset-0 border-2 animate-ping-slow pointer-events-none",
                                                            rippleColor,
                                                            isCircle && "rounded-full",
                                                            isDiamond && "rounded-xl",
                                                            isHexagon && "clip-hexagon" // won't work perfectly with clip-path
                                                        )} />
                                                    </>
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <p className="font-bold">{node.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {isLocked ? "Bloqueado" : isCompleted ? "Completado" : "Click para continuar"}
                                                {isCritical && <span className="block text-rose-400 font-bold mt-1">¡Hito Crítico!</span>}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Title & Progress */}
                                <div className={cn(
                                    "mt-4 text-center px-2 transition-all duration-300 max-w-[140px]",
                                    isAvailable ? "opacity-100 transform translate-y-0" : "opacity-70 group-hover:opacity-100"
                                )}>
                                    <p className={cn(
                                        "text-xs font-bold truncate w-full mb-1",
                                        isCompleted ? "text-green-400" : isAvailable ? (isCritical ? "text-rose-400" : "text-blue-300") : "text-slate-500"
                                    )}>
                                        {node.title}
                                    </p>

                                    {/* Mini Progress Bar */}
                                    {isAvailable && node.progress !== undefined && (
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                            <div
                                                className={cn("h-full rounded-full", isCritical ? "bg-rose-500" : "bg-blue-500")}
                                                style={{ width: `${node.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Connector Arrow */}
                                {!isLast && (
                                    <div className="absolute top-7 -right-[50%] translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                                        <ChevronRight className={cn(
                                            "w-5 h-5",
                                            isCompleted ? "text-green-500/50" : "text-slate-700"
                                        )} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
