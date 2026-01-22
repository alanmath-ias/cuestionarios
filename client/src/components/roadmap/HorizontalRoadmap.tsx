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
                className="w-full overflow-x-auto pb-8 px-4 flex items-center scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-slate-800/30 hover:scrollbar-thumb-blue-500/50"
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

                        return (
                            <div key={node.id} className="relative flex flex-col items-center group min-w-[160px] z-10">
                                {/* Node Circle */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={isLocked ? undefined : node.onClick}
                                                className={cn(
                                                    "relative w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 bg-slate-950",
                                                    isCompleted && "border-green-500 shadow-green-500/20",
                                                    isAvailable && "border-blue-500 shadow-blue-500/40 scale-110",
                                                    isLocked && "border-slate-700 grayscale opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                                                {isAvailable && <Play className="w-5 h-5 text-blue-400 fill-blue-400/20 ml-1" />}
                                                {isLocked && <Lock className="w-5 h-5 text-slate-500" />}

                                                {/* Ripple Effect for Available */}
                                                {isAvailable && (
                                                    <>
                                                        <span className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping-slow" />
                                                        <span className="absolute -inset-2 rounded-full border border-blue-400/30 animate-pulse" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-slate-900 border-slate-800 text-slate-200">
                                            <p>{node.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">{isLocked ? "Bloqueado" : "Click para ver"}</p>
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
                                        isCompleted ? "text-green-400" : isAvailable ? "text-blue-300" : "text-slate-500"
                                    )}>
                                        {node.title}
                                    </p>

                                    {/* Mini Progress Bar for Available Node */}
                                    {isAvailable && node.progress !== undefined && (
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="bg-blue-500 h-full rounded-full"
                                                style={{ width: `${node.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Connector Arrow (Visual only, for direction) */}
                                {!isLast && (
                                    <div className="absolute top-6 -right-[50%] translate-x-1/2 -translate-y-1/2 z-0">
                                        <ChevronRight className={cn(
                                            "w-4 h-4",
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
