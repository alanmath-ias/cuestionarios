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
    // Generate path points based on nodes
    // We'll use a simple vertical zigzag pattern for responsiveness
    // For desktop, we can make it more winding. For now, let's stick to a central winding path.

    return (
        <div className="relative w-full min-h-[600px] py-10 px-4 flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-16 z-10">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h2>
                {description && <p className="text-slate-400 max-w-lg mx-auto">{description}</p>}
            </div>

            {/* Path Container */}
            <div className="relative w-full max-w-3xl flex flex-col items-center space-y-16 md:space-y-24">

                {/* Connecting Line (Absolute) */}
                <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-slate-800/50 rounded-full -z-10" />

                {/* Animated Progress Line (Optional - could be complex to calculate exact height) */}
                {/* <motion.div 
            className="absolute top-0 left-1/2 w-1 -translate-x-1/2 bg-blue-500/50 rounded-full -z-10 origin-top"
            initial={{ height: 0 }}
            animate={{ height: '50%' }} // Dynamic based on progress
        /> */}

                {nodes.map((node, index) => {
                    const isLeft = index % 2 === 0;
                    const isCompleted = node.status === 'completed';
                    const isAvailable = node.status === 'available';
                    const isLocked = node.status === 'locked';

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                "relative w-full flex items-center",
                                isLeft ? "justify-start md:justify-end md:pr-[50%] md:-mr-[40px]" : "justify-start md:justify-start md:pl-[50%] md:-ml-[40px]"
                            )}
                        >
                            {/* Connector Line to Center (Desktop only) */}
                            <div className={cn(
                                "hidden md:block absolute top-1/2 h-0.5 bg-slate-700 w-[calc(50%-40px)] -z-10",
                                isLeft ? "right-0 origin-right" : "left-0 origin-left",
                                isCompleted ? "bg-blue-500/50" : "bg-slate-800"
                            )} />

                            {/* Node Content Container */}
                            <div
                                className={cn(
                                    "flex items-center gap-4 w-full md:w-auto",
                                    isLeft ? "flex-row md:flex-row-reverse md:text-right" : "flex-row"
                                )}
                            >
                                {/* The Node Circle */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={isLocked ? undefined : node.onClick}
                                                className={cn(
                                                    "relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 z-20",
                                                    isCompleted && "bg-slate-900 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]",
                                                    isAvailable && "bg-slate-900 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] animate-pulse-slow",
                                                    isLocked && "bg-slate-900/50 border-slate-700 grayscale opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                {isCompleted && <CheckCircle className="w-8 h-8 text-green-500" />}
                                                {isAvailable && <Play className="w-8 h-8 text-blue-400 fill-blue-400/20 ml-1" />}
                                                {isLocked && <Lock className="w-6 h-6 text-slate-500" />}

                                                {/* Ripple Effect for Available */}
                                                {isAvailable && (
                                                    <span className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping-slow" />
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent side={isLeft ? "left" : "right"} className="bg-slate-900 border-slate-800 text-slate-200">
                                            <p>{isLocked ? "Completa los anteriores para desbloquear" : "Click para iniciar"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Text Content */}
                                <div className={cn(
                                    "flex-1 md:flex-none md:w-64 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300",
                                    isCompleted ? "bg-green-950/20 border-green-500/20" :
                                        isAvailable ? "bg-blue-950/30 border-blue-500/30 shadow-lg shadow-blue-900/10" :
                                            "bg-slate-900/40 border-slate-800/50 opacity-60"
                                )}>
                                    <h3 className={cn(
                                        "text-lg font-bold mb-1",
                                        isCompleted ? "text-green-400" : isAvailable ? "text-blue-300" : "text-slate-400"
                                    )}>
                                        {node.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">
                                        {node.description}
                                    </p>

                                    {node.progress !== undefined && node.progress > 0 && (
                                        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full"
                                                style={{ width: `${node.progress}%` }}
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
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-20 pt-8"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                        <Star className="w-12 h-12 text-yellow-400 fill-yellow-400/20" />
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
