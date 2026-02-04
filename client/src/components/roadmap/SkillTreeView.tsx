
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArithmeticNode } from '../../data/arithmetic-map-data';
import { CheckCircle, Lock, Play, Star, Shield, Hexagon, Box, Trophy, ArrowRight, MousePointerClick, BookOpen, Crown, Construction } from 'lucide-react';
import React, { useState } from 'react';

interface SkillTreeViewProps {
    nodes: ArithmeticNode[];
    progressMap: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'>;
    onNodeClick: (node: ArithmeticNode) => void;
    title: string;
    description?: string;
    allQuizzes?: any[]; // Passed from parent
    isAdmin?: boolean;
    subcategories?: any[]; // For admin tooltips
}

export function SkillTreeView({ nodes, progressMap, onNodeClick, title, description, allQuizzes = [], isAdmin = false, subcategories = [] }: SkillTreeViewProps) {
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

    // Calculate Total Visible Quizzes and Node Progress
    const { totalVisibleQuizzes, nodeProgress } = React.useMemo(() => {
        if (!allQuizzes || allQuizzes.length === 0) return { totalVisibleQuizzes: 0, nodeProgress: {} };

        const mappedQuizIds = new Set<number>();
        const progressMapLocal: Record<string, number> = {};

        // Iterate every node to find which quizzes it "captures"
        nodes.forEach(node => {
            if (!node.subcategoryId && (!node.additionalSubcategories || node.additionalSubcategories.length === 0)) {
                progressMapLocal[node.id] = 0;
                return; // Skip purely structural nodes
            }

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

            // Calculate progress for this node
            if (matchingQuizzes.length > 0) {
                const completedCount = matchingQuizzes.filter(q => q.status === 'completed').length;
                progressMapLocal[node.id] = (completedCount / matchingQuizzes.length) * 100;
            } else {
                progressMapLocal[node.id] = 0;
            }

            // Add matched IDs to total count set
            matchingQuizzes.forEach(q => mappedQuizIds.add(q.id));
        });

        return {
            totalVisibleQuizzes: mappedQuizIds.size,
            nodeProgress: progressMapLocal
        };
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
                // 1. It is NOT a Critical Node (Stop at major section boundaries)
                // 2. It is NOT a Container Node (Stop at next parent section)
                // 3. We haven't seen it yet
                const isBlockingNode = child.type === 'critical' || child.behavior === 'container';

                if (!isBlockingNode && !highlighted.has(child.id) && !queue.includes(child.id)) {
                    queue.push(child.id);
                }
            }
        }

        return highlighted;
    };

    const highlightedSet = React.useMemo(() => getHighlightedNodes(highlightedNodeId), [highlightedNodeId, nodes]);

    // Ref for the scrollable container to auto-center on mobile
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        const centerMap = () => {
            if (scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const scrollWidth = container.scrollWidth;
                const clientWidth = container.clientWidth;
                if (scrollWidth > clientWidth) {
                    container.scrollLeft = (scrollWidth - clientWidth) / 2;
                }
            }
        };

        // Execute after a short delay to ensure DOM layout is ready
        const timer = setTimeout(() => {
            requestAnimationFrame(centerMap);
        }, 300); // Increased delay for stability

        return () => clearTimeout(timer);
    }, [title]); // Re-center if map changes or on mount

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

    // Responsive Layout Config
    const [layout, setLayout] = React.useState({ width: 800, rowHeight: 160, spread: 3 });

    React.useEffect(() => {
        const updateLayout = () => {
            const w = window.innerWidth;
            if (w >= 1280) setLayout({ width: 1100, rowHeight: 180, spread: 4.5 });
            else if (w >= 768) setLayout({ width: 950, rowHeight: 170, spread: 4 });
            else setLayout({ width: 800, rowHeight: 160, spread: 3 });
        };
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    const { width: MAP_WIDTH, rowHeight: ROW_HEIGHT, spread: SPREAD } = layout;
    const CENTER_X = MAP_WIDTH / 2;

    // Helper to get coordinates
    const getNodePos = (node: ArithmeticNode) => ({
        x: CENTER_X + (node.xOffset || 0) * SPREAD,
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

            {/* Legend - Responsive Position */}
            <div className="md:absolute md:top-4 md:right-4 relative mt-4 mx-auto w-fit inset-auto z-50 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl min-w-[200px] pointer-events-auto">
                <h4 className="text-slate-300 font-bold mb-3 text-xs uppercase tracking-wider border-b border-slate-700 pb-2">Leyenda</h4>
                <div className="flex flex-col gap-3 text-[11px] text-slate-400 font-medium">
                    {/* Parent Nodes */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-2xl rotate-45 border-2 border-slate-500 bg-slate-800 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5 -rotate-45 text-slate-300" />
                        </div>
                        <span>Temas Principales</span>
                    </div>

                    {/* Blue Play - Not Started */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                        </div>
                        <span>Disponible sin iniciar</span>
                    </div>

                    {/* Soft Green Play - In Progress */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-[#5eead4] shadow-[0_0_10px_rgba(45,212,191,0.3)] flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-[#2dd4bf] fill-[#2dd4bf] ml-0.5" />
                        </div>
                        <span>Disponible iniciado</span>
                    </div>

                    {/* Green Check - Completed */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <span>Completado</span>
                    </div>

                    {/* Critical - Hexagon */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 hexagon-mask border-2 border-red-400 bg-red-900/20 flex items-center justify-center">
                            <Hexagon className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span>Crítico</span>
                    </div>

                    {/* Featured - Star */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-yellow-400 flex items-center justify-center">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
                        </div>
                        <span>Destacado</span>
                    </div>

                    {/* Locked - Under Construction */}
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center justify-center">
                            <Construction className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span>Próximamente</span>
                    </div>

                    {/* Total Counter */}
                    {totalVisibleQuizzes > 0 && (
                        <>
                            <div className="h-px bg-slate-700 my-1" />
                            <div className="flex items-center gap-2 text-indigo-300 font-medium justify-center pt-1">
                                <BookOpen className="w-4 h-4" />
                                <span>Total: {totalVisibleQuizzes} Cuestionarios</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto overflow-y-hidden pb-10"
            >
                <div
                    className="relative mx-auto overflow-visible transition-all duration-500 ease-in-out"
                    style={{ width: MAP_WIDTH, height: totalHeight }}
                >

                    {/* SVG Connections Layer */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
                        viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}
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
                                        d={`M ${pPos.x} ${pPos.y} C ${pPos.x} ${midY}, ${cPos.x} ${midY}, ${cPos.x} ${cPos.y}`}
                                        fill="none"
                                        stroke={isHighlighted ? "#fbbf24" : (isUnlocked) ? "#3b82f6" : "rgba(71, 85, 105, 0.5)"} // Amber for highlight
                                        strokeWidth={isHighlighted ? "5" : "3"}
                                        strokeLinecap="round"
                                        strokeDasharray={isHighlighted ? "none" : "6 4"}
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
                        const isInProgress = status === 'in_progress';
                        const isLocked = status === 'locked';

                        const isHighlighted = highlightedSet.has(node.id);

                        return (
                            <div
                                key={node.id}
                                style={{
                                    position: 'absolute',
                                    left: pos.x,
                                    top: pos.y,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: isHighlighted ? 30 : 10
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0, y: 20 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05, type: 'spring' }}
                                    className="flex flex-col items-center justify-center p-4" // Use padding to avoid cropping shadows
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
                                                (node.type === 'critical' && node.behavior === 'container') ? 'hexagon-mask' :
                                                    node.behavior === 'container' ? 'rotate-45 rounded-2xl' : 'rounded-full',

                                                isLocked && "cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                                                !isLocked && "cursor-pointer",

                                                isHighlighted ? "ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.6)] scale-110" : "",
                                                !isHighlighted && isCompleted ? "shadow-[0_0_30px_#22c55e]" :
                                                    !isHighlighted && isInProgress ? "shadow-[0_0_30px_#2dd4bf]" :
                                                        !isHighlighted && isAvailable ? (
                                                            node.type === 'critical' ? "shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse-slow" :
                                                                "shadow-[0_0_30px_#3b82f6]"
                                                        ) : ""
                                            )}
                                            style={{
                                                background: isHighlighted ? 'linear-gradient(135deg, #b45309, #f59e0b)' :
                                                    isCompleted ? 'linear-gradient(135deg, #1f2937, #064e3b)' :
                                                        isInProgress ? 'linear-gradient(135deg, #134e4a, #2dd4bf)' :
                                                            isAvailable ? (
                                                                node.type === 'critical' ? 'linear-gradient(135deg, #881337, #f43f5e)' :
                                                                    'linear-gradient(135deg, #1e3a8a, #3b82f6)'
                                                            ) : isLocked ? 'linear-gradient(135deg, #1e293b, #451a03)' : '#1e293b',

                                                border: `3px solid ${isHighlighted ? '#fbbf24' :
                                                    isCompleted ? '#4ade80' :
                                                        isInProgress ? '#5eead4' :
                                                            isAvailable ? (node.type === 'critical' ? '#fb7185' : '#3b82f6') :
                                                                isLocked ? '#f59e0b' : '#475569'
                                                    }`
                                            }}
                                        >
                                            <div className={cn("flex items-center justify-center", node.behavior === 'container' && !(node.type === 'critical' && node.behavior === 'container') && "-rotate-45")}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                                ) : isLocked ? (
                                                    <Construction className="w-8 h-8 text-amber-500" />
                                                ) : (
                                                    (node.type === 'critical' && node.behavior === 'container') ? <Hexagon className="w-8 h-8 text-yellow-400 fill-yellow-400/20" /> :
                                                        node.type === 'critical' ? <Star className="w-8 h-8 text-white fill-white/20" /> :
                                                            node.type === 'evaluation' ? <Trophy className="w-8 h-8 text-purple-400 fill-purple-400/20" /> :
                                                                node.behavior === 'container' ? <BookOpen className="w-8 h-8 text-white fill-white/10" /> :
                                                                    <Play className="w-8 h-8 text-white fill-white" />
                                                )}
                                            </div>
                                        </motion.button>

                                        {isLocked && (
                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-slate-700 z-50">
                                                Próximamente
                                            </div>
                                        )}

                                        {/* Admin Subcategory Tooltip */}
                                        {isAdmin && (node.subcategoryId || (node.additionalSubcategories && node.additionalSubcategories.length > 0)) && (
                                            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/95 text-white text-[10px] p-2 rounded-lg whitespace-nowrap pointer-events-none border border-blue-500/50 z-[100] shadow-xl backdrop-blur-sm">
                                                <div className="font-bold border-b border-blue-400/30 mb-1 pb-1 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Subcategorías Vinculadas
                                                </div>
                                                <div className="space-y-1">
                                                    {[node.subcategoryId, ...(node.additionalSubcategories || [])].filter(Boolean).map(id => {
                                                        const sub = subcategories.find(s => s.id === id);
                                                        return (
                                                            <div key={id} className="flex items-center gap-2">
                                                                <span className="bg-blue-500/30 px-1 rounded text-[9px] font-mono">ID: {id}</span>
                                                                <span className="text-blue-100">{sub?.name || 'Cargando...'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    {nodeProgress[node.id] > 0 && !isLocked && (
                                        <div className="w-16 h-1.5 bg-slate-900/60 rounded-full mt-2 overflow-hidden border border-white/10 shadow-inner z-20">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${nodeProgress[node.id]}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                                                        isInProgress ? "bg-gradient-to-r from-teal-400 to-cyan-400" :
                                                            "bg-gradient-to-r from-blue-500 to-indigo-500"
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Label under node - Simple flow positioning */}
                                    <div className="mt-4 w-40 text-center pointer-events-none">
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-colors duration-300",
                                            isHighlighted ? "bg-yellow-950/50 border-yellow-500/50 text-yellow-200" :
                                                isCompleted ? "bg-green-950/50 border-green-500/50 text-green-300" :
                                                    isAvailable ? "bg-blue-950/50 border-blue-500/50 text-blue-200" :
                                                        isLocked ? "bg-amber-950/50 border-amber-600/50 text-amber-400" :
                                                            "bg-slate-900/50 border-slate-700 text-slate-500"
                                        )}>
                                            {node.label}
                                        </span>
                                    </div>

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
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}
