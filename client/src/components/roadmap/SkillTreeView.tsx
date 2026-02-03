
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArithmeticNode } from '../../data/arithmetic-map-data';
import { CheckCircle, Lock, Play, Star, Shield, Hexagon, Box, Trophy, ArrowRight, MousePointerClick, BookOpen, Crown } from 'lucide-react';
import React, { useState } from 'react';

interface SkillTreeViewProps {
    nodes: ArithmeticNode[];
    progressMap: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'>;
    onNodeClick: (node: ArithmeticNode) => void;
    title: string;
    description?: string;
    allQuizzes?: any[]; // Passed from parent
    isAdmin?: boolean;
}

export function SkillTreeView({ nodes, progressMap, onNodeClick, title, description, allQuizzes = [], isAdmin = false }: SkillTreeViewProps) {
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

    // Calculate Total Visible Quizzes (Unique Count)
    const totalVisibleQuizzes = React.useMemo(() => {
        if (!allQuizzes || allQuizzes.length === 0) return 0;

        const mappedQuizIds = new Set<number>();

        // Iterate every node to find which quizzes it "captures"
        // Iterate every node to find which quizzes it "captures"
        nodes.forEach(node => {
            if (!node.subcategoryId && (!node.additionalSubcategories || node.additionalSubcategories.length === 0)) return; // Skip purely structural nodes

            // 1. Gather Candidate Quizzes (Primary + Additional Subcategories)
            let matchingQuizzes = allQuizzes.filter(q =>
                q.subcategoryId === node.subcategoryId ||
                (node.additionalSubcategories && node.additionalSubcategories.includes(q.subcategoryId))
            );

            // 2. Apply Inclusion Keywords
            if (node.filterKeywords && node.filterKeywords.length > 0) {
                const keywords = node.filterKeywords.map(k => k.toLowerCase());
                matchingQuizzes = matchingQuizzes.filter(q =>
                    keywords.some((k: string) => q.title.toLowerCase().includes(k))
                );
            }

            // 3. Apply Exclusion Keywords
            if (node.excludeKeywords && node.excludeKeywords.length > 0) {
                const excludeKeys = node.excludeKeywords.map(k => k.toLowerCase());
                matchingQuizzes = matchingQuizzes.filter(q =>
                    !excludeKeys.some((k: string) => q.title.toLowerCase().includes(k))
                );
            }

            // Add matched IDs to set
            matchingQuizzes.forEach(q => mappedQuizIds.add(q.id));
        });

        return mappedQuizIds.size;
    }, [nodes, allQuizzes]);

    // Get highlighted nodes recursively (stops at next container)
    const getHighlightedNodes = (rootId: string | null): Set<string> => {
        if (!rootId) return new Set();

        const highlighted = new Set<string>();
        const queue = [rootId];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            highlighted.add(currentId);

            // Find direct children: nodes that require the currentId
            const children = nodes.filter(n => n.requires.includes(currentId));

            for (const child of children) {
                // Traverse down IF:
                // 1. It is NOT a Critical Node (Stop at major section boundaries like Continuity)
                // 2. We haven't seen it yet
                const isBlockingNode = child.type === 'critical';

                if (!isBlockingNode && !highlighted.has(child.id) && !queue.includes(child.id)) {
                    queue.push(child.id);
                }
            }
        }

        return highlighted;
    };

    const highlightedSet = React.useMemo(() => getHighlightedNodes(highlightedNodeId), [highlightedNodeId, nodes]);

    // Styles for custom shapes
    const styles = (
        <style>
            {`
        .hexagon-mask {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .clip-hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}
        </style>
    );

    // Constants for layout
    const ROW_HEIGHT = 160;
    const CENTER_X = 400; // SVG canvas center

    // Helper to get coordinates
    const getNodePos = (node: ArithmeticNode) => ({
        x: CENTER_X + (node.xOffset || 0) * 3, // Multiplier for spread
        y: node.level * ROW_HEIGHT + 100
    });

    const totalHeight = (Math.max(...nodes.map(n => n.level)) + 1) * ROW_HEIGHT + 200;

    // Handle interaction
    const handleNodeInteraction = (e: React.MouseEvent, node: ArithmeticNode, isLocked: boolean) => {
        e.stopPropagation(); // Prevent background click from clearing highlight

        // Highlight logic: toggle if same, otherwise set new
        setHighlightedNodeId(prev => prev === node.id ? null : node.id);

        // If container -> Just highlight (already handled above), no navigation logic needed explicitly here if pure container
        if (node.behavior === 'container') {
            return;
        }

        // If locked content -> Do nothing (Visual feedback handled by UI)
        if (isLocked) return;

        // Otherwise open functionality
        onNodeClick(node);
    };

    return (
        <div
            className="relative w-full min-h-[600px] flex flex-col items-center bg-transparent py-8"
            onClick={() => setHighlightedNodeId(null)} // Click outside clears highlight
        >
            {styles}

            {/* Header */}
            <div className="text-center mb-8 z-10 relative px-4 pointer-events-none">
                <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-50 bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl max-w-[200px] pointer-events-auto">
                <h4 className="text-slate-300 font-bold mb-3 text-sm uppercase tracking-wider border-b border-slate-700 pb-2">Leyenda</h4>
                <div className="flex flex-col gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                        </div>
                        <span>Dominado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center">
                            <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                        <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-slate-500" />
                        </div>
                        <span>Próximamente</span>
                    </div>
                    <div className="h-px bg-slate-700 my-1" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                        </div>
                        <span>Básico</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 hexagon-mask border-2 border-yellow-500 bg-yellow-900/20 flex items-center justify-center">
                            <Hexagon className="w-3 h-3 text-yellow-500" />
                        </div>
                        <span>Crítico</span>
                    </div>

                    {/* Total Counter */}
                    {totalVisibleQuizzes > 0 && (
                        <>
                            <div className="h-px bg-slate-700 my-1" />
                            <div className="flex items-center gap-2 text-indigo-300 font-medium">
                                <div className="w-6 h-6 rounded-full border-2 border-indigo-500/50 flex items-center justify-center bg-indigo-500/10">
                                    <BookOpen className="w-3 h-3" />
                                </div>
                                <span>Total: {totalVisibleQuizzes}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="relative w-full max-w-4xl mx-auto overflow-visible" style={{ height: totalHeight }}>

                {/* SVG Connections Layer */}
                <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
                    viewBox={`0 0 800 ${totalHeight}`}
                    preserveAspectRatio="xMidYMin meet"
                >
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {nodes.map(node => {
                        return node.requires.map(reqId => {
                            const parent = nodes.find(n => n.id === reqId);
                            if (!parent) return null;

                            const pPos = getNodePos(parent);
                            const cPos = getNodePos(node);
                            const midY = (pPos.y + cPos.y) / 2;
                            const isUnlocked = progressMap[parent.id] === 'completed';

                            // Highlight connection if both parent and child are in the highlight set
                            const isHighlighted = highlightedSet.has(parent.id) && highlightedSet.has(node.id);

                            return (
                                <motion.path
                                    key={`${parent.id}-${node.id}`}
                                    d={`M ${pPos.x} ${pPos.y + 40} C ${pPos.x} ${midY}, ${cPos.x} ${midY}, ${cPos.x} ${cPos.y - 40}`}
                                    fill="none"
                                    stroke={isHighlighted ? "#fbbf24" : (isUnlocked || isAdmin) ? "#3b82f6" : "rgba(71, 85, 105, 0.5)"} // Amber for highlight
                                    strokeWidth={isHighlighted ? "5" : "3"}
                                    strokeLinecap="round"
                                    strokeDasharray={(isUnlocked || isAdmin || isHighlighted) ? "none" : "6 4"}
                                    filter={isHighlighted ? "url(#glow)" : undefined}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            );
                        });
                    })}
                </svg>

                {/* Nodes Layer */}
                {nodes.map((node, index) => {
                    const pos = getNodePos(node);
                    let status = progressMap[node.id] || 'locked';

                    const isAvailable = status === 'available';
                    const isCompleted = status === 'completed';
                    // Special Logic: If node is container and has children, check if it should be locked?
                    // Implementation in quiz-list.tsx handles the status calculation. 
                    // Here we just render based on status map.
                    const isLocked = status === 'locked';

                    const isHighlighted = highlightedSet.has(node.id);

                    let ShapeIcon = CheckCircle;
                    let shapeClass = "rounded-full";
                    if (node.type === 'critical') {
                        ShapeIcon = Hexagon;
                        shapeClass = "clip-hexagon";
                    } else if (node.type === 'evaluation') {
                        ShapeIcon = Shield;
                        shapeClass = "rounded-xl rotate-45";
                    } else if (node.type === 'applied') {
                        ShapeIcon = Box;
                        shapeClass = "rounded-xl";
                    }

                    return (
                        <React.Fragment key={node.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, type: 'spring' }}
                                style={{
                                    position: 'absolute',
                                    left: pos.x,
                                    top: pos.y,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                className="z-10 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                            >
                                {/* Tooltip for Locked Items ("Próximamente") */}
                                <div className="relative group">
                                    <motion.button
                                        layoutId={`node-${node.id}`}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleNodeInteraction(e, node, isLocked)}
                                        className={cn(
                                            "relative w-20 h-20 flex items-center justify-center shadow-lg transition-all duration-300 hover:brightness-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                                            // Handle Shapes:
                                            // 1. Critical Parent -> Hexagon
                                            // 2. Normal Parent -> Diamond
                                            // 3. Child (Critical or Normal) -> Circle
                                            (node.type === 'critical' && node.behavior === 'container') ? 'hexagon-mask' :
                                                node.behavior === 'container' ? 'rotate-45 rounded-2xl' : 'rounded-full',

                                            isLocked && "grayscale opacity-70 cursor-not-allowed",
                                            !isLocked && "cursor-pointer",

                                            // Highlight (Amber) overrides everything
                                            isHighlighted ? "ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.6)] scale-110" : "",

                                            // Completion (Green)
                                            !isHighlighted && isCompleted ? "shadow-[0_0_30px_#22c55e]" :

                                                // Available (Blue usually, but Red for Critical Quizzes)
                                                !isHighlighted && isAvailable ? (
                                                    node.type === 'critical' ? "shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse-slow" : // Red shadow for critical quiz
                                                        "shadow-[0_0_30px_#3b82f6]" // Blue for normal
                                                ) : ""
                                        )}
                                        style={{
                                            background: isHighlighted ? 'linear-gradient(135deg, #b45309, #f59e0b)' : // Amber
                                                isCompleted ? 'linear-gradient(135deg, #1f2937, #064e3b)' :
                                                    isAvailable ? (
                                                        // Red gradient for Critical Quizzes, Blue for others
                                                        node.type === 'critical' ? 'linear-gradient(135deg, #881337, #f43f5e)' :
                                                            'linear-gradient(135deg, #1e3a8a, #3b82f6)'
                                                    ) : '#1e293b',

                                            border: `3px solid ${isHighlighted ? '#fbbf24' :
                                                isCompleted ? '#4ade80' :
                                                    isAvailable ? (node.type === 'critical' ? '#fb7185' : '#3b82f6') : // Rose border for critical
                                                        '#475569'
                                                }`
                                        }}
                                    >
                                        {/* Icon Logic - Counter-rotate for diamond shape only if it is a container */}
                                        <div className={cn("flex items-center justify-center", node.behavior === 'container' && !(node.type === 'critical' && node.behavior === 'container') && "-rotate-45")}>
                                            {isCompleted ? (
                                                <CheckCircle className="w-8 h-8 text-green-400" />
                                            ) : isLocked ? (
                                                <Lock className="w-6 h-6 text-slate-500" />
                                            ) : (
                                                // Icon Selection
                                                (node.type === 'critical' && node.behavior === 'container') ? <Hexagon className="w-8 h-8 text-yellow-400 fill-yellow-400/20" /> :
                                                    node.type === 'critical' ? <Star className="w-8 h-8 text-white fill-white/20" /> : // Star for Critical Quiz
                                                        node.type === 'evaluation' ? <Trophy className="w-8 h-8 text-purple-400 fill-purple-400/20" /> :
                                                            node.behavior === 'container' ? <BookOpen className="w-8 h-8 text-white fill-white/10" /> :
                                                                <Play className="w-8 h-8 text-white fill-white" />
                                            )}
                                        </div>
                                    </motion.button>

                                    {/* Hover Tooltip for Locked Nodes */}
                                    {isLocked && (
                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-slate-700 z-50">
                                            Próximamente
                                        </div>
                                    )}
                                </div>

                                {/* Label under node */}
                                <div className="absolute top-24 w-40 text-center pointer-events-none">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-colors duration-300",
                                        isHighlighted ? "bg-yellow-950/50 border-yellow-500/50 text-yellow-200" :
                                            isCompleted ? "bg-green-950/50 border-green-500/50 text-green-300" :
                                                isAvailable ? "bg-blue-950/50 border-blue-500/50 text-blue-200" :
                                                    "bg-slate-900/50 border-slate-700 text-slate-500"
                                    )}>
                                        {node.label}
                                    </span>
                                </div>

                                {/* Helper text for Containers if highlighted */}
                                {highlightedNodeId === node.id && node.behavior === 'container' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-12 bg-yellow-900/80 text-yellow-200 text-[10px] px-2 py-1 rounded border border-yellow-700 whitespace-nowrap pointer-events-none"
                                    >
                                        Selecciona un tema abajo 👇
                                    </motion.div>
                                )}

                            </motion.div>
                        </React.Fragment>
                    );
                })}

            </div>
        </div>
    );
}
