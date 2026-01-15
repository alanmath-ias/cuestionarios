import { motion } from 'framer-motion';
import { CheckCircle, Lock, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoadmapNode {
    id: number;
    title: string;
    description: string;
    status: 'locked' | 'available' | 'completed';
    type: 'subcategory' | 'quiz';
    progress?: number;
    onClick: () => void;
}

interface RoadmapViewProps {
    nodes: RoadmapNode[];
    title: string;
    description?: string;
}

export function RoadmapView({ nodes, title, description }: RoadmapViewProps) {
    // Calculate path height based on nodes count (approximate)
    const pathHeight = nodes.length * 160 + 200;

    return (
        <div className="relative w-full min-h-[600px] py-4 px-4 flex flex-col items-center overflow-hidden">
            {/* Header - Moved up */}
            <div className="text-center mb-12 z-10 relative">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 tracking-tight filter drop-shadow-lg">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>

            {/* Path Container */}
            <div className="relative w-full max-w-3xl mx-auto" style={{ height: pathHeight }}>

                {/* Animated SVG Path */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <svg
                        className="w-full h-full absolute top-0 left-0"
                        viewBox={`0 0 800 ${pathHeight}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#eab308" stopOpacity="0.8" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            {/* Arrow Markers */}
                            <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                            </marker>
                            <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                            </marker>
                        </defs>

                        {/* Background Path (Dim) */}
                        <path
                            d={`M 400 0 
                               ${nodes.map((_, i) => {
                                const y = i * 160 + 80;
                                const nextY = (i + 1) * 160 + 80;
                                const isLeft = i % 2 === 0;
                                // Create a winding path
                                return `C ${isLeft ? 200 : 600} ${y}, ${isLeft ? 600 : 200} ${y}, 400 ${nextY}`;
                            }).join(' ')}
                               L 400 ${pathHeight}`}
                            fill="none"
                            stroke="rgba(30, 41, 59, 0.3)"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />

                        {/* Dashed Connecting Lines with Arrows */}
                        {nodes.map((node, i) => {
                            if (i === nodes.length - 1) return null; // Don't draw line from last node

                            const nextNode = nodes[i + 1];
                            const isNextCompleted = nextNode.status === 'completed';
                            const lineColor = isNextCompleted ? '#22c55e' : '#ef4444'; // Green if next is completed, Red otherwise
                            const markerId = isNextCompleted ? 'url(#arrow-green)' : 'url(#arrow-red)';

                            // Coordinates
                            const startY = i * 160 + 80 + 50; // Bottom of current node circle (approx)
                            const endY = (i + 1) * 160 + 80 - 50; // Top of next node circle (approx)

                            return (
                                <line
                                    key={`line-${i}`}
                                    x1="400"
                                    y1={startY}
                                    x2="400"
                                    y2={endY}
                                    stroke={lineColor}
                                    strokeWidth="4"
                                    strokeDasharray="8 6"
                                    markerEnd={markerId}
                                />
                            );
                        })}

                        {/* Animated Foreground Path (Kept for background glow effect, maybe reduce opacity) */}
                        <motion.path
                            d={`M 400 0 
                               ${nodes.map((_, i) => {
                                const y = i * 160 + 80;
                                const nextY = (i + 1) * 160 + 80;
                                const isLeft = i % 2 === 0;
                                return `C ${isLeft ? 200 : 600} ${y}, ${isLeft ? 600 : 200} ${y}, 400 ${nextY}`;
                            }).join(' ')}
                               L 400 ${pathHeight}`}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                            opacity="0.3"
                        />
                    </svg>
                </div>

                {nodes.map((node, index) => {
                    const isLeft = index % 2 === 0;
                    const isCompleted = node.status === 'completed';
                    const isAvailable = node.status === 'available';
                    const isLocked = node.status === 'locked';

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8, x: isLeft ? -50 : 50 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            style={{ position: 'absolute', top: index * 160, width: '100%', height: '160px' }}
                            className={cn(
                                "flex items-center z-20",
                                isLeft ? "justify-start md:justify-end md:pr-[50%] md:-mr-[40px]" : "justify-start md:justify-start md:pl-[50%] md:-ml-[40px]"
                            )}
                        >
                            {/* Node Content Container */}
                            <div
                                className={cn(
                                    "flex items-center gap-6 w-full md:w-auto group",
                                    isLeft ? "flex-row md:flex-row-reverse md:text-right" : "flex-row"
                                )}
                            >
                                {/* The Node Circle */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.15, rotate: isAvailable ? 15 : 0 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={isLocked ? undefined : node.onClick}
                                                className={cn(
                                                    "relative flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 z-20",
                                                    isCompleted && "bg-slate-900 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]",
                                                    isAvailable && "bg-slate-900 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-pulse-slow",
                                                    isLocked && "bg-slate-900/80 border-slate-700 grayscale opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                {isCompleted && <CheckCircle className="w-10 h-10 text-green-500" />}
                                                {isAvailable && <Play className="w-10 h-10 text-blue-400 fill-blue-400/20 ml-1" />}
                                                {isLocked && <Lock className="w-8 h-8 text-slate-500" />}

                                                {/* Ripple Effect for Available */}
                                                {isAvailable && (
                                                    <>
                                                        <span className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping-slow" />
                                                        <span className="absolute -inset-2 rounded-full border border-blue-400/30 animate-pulse" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent side={isLeft ? "left" : "right"} className="bg-slate-900 border-slate-800 text-slate-200">
                                            <p>{isLocked ? "Completa los anteriores para desbloquear" : "Click para ver cuestionarios"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Text Content */}
                                <div className={cn(
                                    "flex-1 md:flex-none md:w-72 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                                    isCompleted ? "bg-green-950/30 border-green-500/30 shadow-lg shadow-green-900/20" :
                                        isAvailable ? "bg-blue-950/40 border-blue-500/40 shadow-lg shadow-blue-900/20" :
                                            "bg-slate-900/60 border-slate-800/60 opacity-60"
                                )}>
                                    <h3 className={cn(
                                        "text-xl font-bold mb-2",
                                        isCompleted ? "text-green-400" : isAvailable ? "text-blue-300" : "text-slate-400"
                                    )}>
                                        {node.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                                        {node.description}
                                    </p>

                                    {node.progress !== undefined && node.progress > 0 && (
                                        <div className="mt-4 w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${node.progress}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Final Trophy Node */}
                <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ position: 'absolute', top: nodes.length * 160 }}
                    className="left-1/2 -translate-x-1/2 z-20 pt-12 pb-20"
                >
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-300/30 to-orange-600/30 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-[0_0_60px_rgba(234,179,8,0.5)] animate-pulse-slow">
                        <Star className="w-16 h-16 text-yellow-400 fill-yellow-400" />
                        <div className="absolute inset-0 rounded-full border-t-2 border-white/50 animate-spin-slow" />
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
