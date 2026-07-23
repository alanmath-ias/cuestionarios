
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { ArithmeticNode } from '../../data/arithmetic-map-data';
import { CheckCircle, Lock, Play, Star, Shield, Hexagon, Box, Trophy, ArrowRight, MousePointerClick, BookOpen, Crown, Construction, Maximize, ZoomIn, ZoomOut, RotateCcw, LayoutDashboard, Search, X, CheckCircle2, AlertTriangle, PlayCircle, Medal, Award } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, Plus, Search as SearchIcon, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface SkillTreeViewProps {
    nodes: ArithmeticNode[];
    progressMap: Record<string, 'locked' | 'available' | 'completed' | 'in_progress'>;
    onNodeClick: (node: ArithmeticNode, highlightedQuizId?: number) => void;
    title: string;
    description?: string;
    allQuizzes?: any[]; // Passed from parent
    isAdmin?: boolean;
    subcategories?: any[]; // For admin tooltips
    categoryId: number; // For mapping identification
    nodeMappings?: any[]; // Dynamic content overrides
    allQuizzesForAdmin?: any[]; // For inviting quizzes from other categories
}

export function SkillTreeView({ 
    nodes, progressMap, onNodeClick, title, description, 
    allQuizzes = [], isAdmin = false, subcategories = [], 
    categoryId, nodeMappings = [], allQuizzesForAdmin = [] 
}: SkillTreeViewProps) {
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
    const [isInteractive, setIsInteractive] = useState(false);
    
    // Node configuration state
    const [configNode, setConfigNode] = useState<ArithmeticNode | null>(null);
    const queryClient = useQueryClient();

    const upsertMappingMutation = useMutation({
        mutationFn: async (mapping: any) => {
            const res = await fetch('/api/node-mappings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mapping)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al guardar el vínculo');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/node-mappings/${categoryId}`] });
            setConfigNode(null);
        }
    });

    const [showReloadButton, setShowReloadButton] = useState(false);
    const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(1000);
    const [triggeredFamilies, setTriggeredFamilies] = useState<Set<string>>(new Set());
    const [celebratingNodeId, setCelebratingNodeId] = useState<string | null>(null);
    const [celebratingQuizTitle, setCelebratingQuizTitle] = useState<string>('');
    const [celebratingUnitTitle, setCelebratingUnitTitle] = useState<string>('');
    const [showCelebrationDialog, setShowCelebrationDialog] = useState(false);
    const [processedScrollId, setProcessedScrollId] = useState<string | null>(null); // state for scroll
    const [processedCelebrationId, setProcessedCelebrationId] = useState<string | null>(null); // state for node/family celebrate
    const [celebrationType, setCelebrationType] = useState<'node' | 'family' | 'quiz' | 'double'>('node'); // type of celebration
    const [showSilverMedal, setShowSilverMedal] = useState(false); // State for silver medal overlay
    const [showGoldMedal, setShowGoldMedal] = useState(false); // State for gold medal overlay
    const [showSilverCup, setShowSilverCup] = useState(false); // State for silver cup trophy overlay
    const [pendingSequence, setPendingSequence] = useState<'none' | 'silver' | 'gold' | 'silver_then_gold' | 'silver_then_gold_then_cup'>('none');
    const [processedSilverMedalId, setProcessedSilverMedalId] = useState<string | null>(null); // To avoid repeat
    const [showLastWorkedHint, setShowLastWorkedHint] = useState<string | null>(null); // Friendly indicator
    const lastWorkedScrollProcessed = useRef<boolean>(false);

    const silverCupDeliveryImage = useMemo(() => {
        if (categoryId === 2) return "/aritmetica_imagenes/entrega_copa_plata_algebra.png";
        if (categoryId === 4) return "/aritmetica_imagenes/entrega_copa_plata_calculo_diferencial.png";
        return "/aritmetica_imagenes/entrega_copa_plata.png";
    }, [categoryId]);

    const silverCupTrophyImage = useMemo(() => {
        if (categoryId === 2) return "/aritmetica_imagenes/copa_de_plata_trofeo_algebra.png";
        if (categoryId === 4) return "/aritmetica_imagenes/copa_de_plata_trofeo_calculo_diferencial.png";
        return "/aritmetica_imagenes/copa_de_plata_trofeo.png";
    }, [categoryId]);

    const dialogImageSrc = useMemo(() => {
        if (celebrationType === 'family') return silverCupDeliveryImage;
        if (celebrationType === 'double') return "/aritmetica_imagenes/alanmath_medallas_plata_y_oro.png";
        if (celebrationType === 'quiz') return "/aritmetica_imagenes/alanmath_medalla_plata.png";
        return "/aritmetica_imagenes/alanmath_medalla_oro.png";
    }, [celebrationType, silverCupDeliveryImage]);

    const handleCloseCelebrationDialog = () => {
        setShowCelebrationDialog(false);

        if (pendingSequence === 'silver') {
            setShowSilverMedal(true);
            setTimeout(() => setShowSilverMedal(false), 3800);
        } else if (pendingSequence === 'gold') {
            setShowGoldMedal(true);
            setTimeout(() => setShowGoldMedal(false), 3800);
        } else if (pendingSequence === 'silver_then_gold') {
            setShowSilverMedal(true);
            setTimeout(() => {
                setShowSilverMedal(false);
                setTimeout(() => {
                    setShowGoldMedal(true);
                    setTimeout(() => setShowGoldMedal(false), 3800);
                }, 300);
            }, 3800);
        } else if (pendingSequence === 'silver_then_gold_then_cup') {
            // Plata → Oro → Copa de Plata (centro pantalla)
            setShowSilverMedal(true);
            setTimeout(() => {
                setShowSilverMedal(false);
                setTimeout(() => {
                    setShowGoldMedal(true);
                    setTimeout(() => {
                        setShowGoldMedal(false);
                        setTimeout(() => {
                            setShowSilverCup(true);
                            fireFamilyFireworks();
                            setTimeout(() => setShowSilverCup(false), 5000);
                        }, 300);
                    }, 3800);
                }, 300);
            }, 3800);
        }
        setPendingSequence('none');
    };

    // Calculate Multi-purpose progress metrics
    const { totalVisibleQuizzes, nodeProgress, nodeAverages, nodeCompletedCount, nodeTotalQuizzes } = React.useMemo(() => {
        if (!allQuizzes || allQuizzes.length === 0) return { totalVisibleQuizzes: 0, nodeProgress: {}, nodeAverages: {}, nodeCompletedCount: {}, nodeTotalQuizzes: {} };
        const mappedQuizIds = new Set<number>();
        const progressMapLocal: Record<string, number> = {};
        const averagesMapLocal: Record<string, number> = {};
        const completedCountMapLocal: Record<string, number> = {};
        const totalQuizzesMapLocal: Record<string, number> = {};

        // Helper to get all descendant IDs recursively
        const getDescendantIds = (rootId: string) => {
            const descendants: string[] = [rootId];
            const queue = [rootId];
            const visited = new Set<string>();

            while (queue.length > 0) {
                const currentId = queue.shift()!;
                if (visited.has(currentId)) continue;
                visited.add(currentId);

                const children = nodes.filter(n => n.requires.includes(currentId));
                for (const child of children) {
                    if (child.behavior !== 'container') {
                        descendants.push(child.id);
                        queue.push(child.id);
                    }
                }
            }
            return descendants;
        };

        nodes.forEach(node => {
            let contextQuizzes: any[] = [];
            
            // Get dynamic mappings for this node
            const mapping = nodeMappings?.find(m => m.nodeId === node.id);
            const dynamicSubIds = mapping?.additionalSubcategories || [];
            const dynamicQuizIds = mapping?.additionalQuizzes || [];
            const overrideSubId = mapping?.subcategoryId;

            if (node.behavior === 'container') {
                // For containers, we aggregate EVERY individual quiz in their family branch
                const familyIds = getDescendantIds(node.id);
                const familyNodes = nodes.filter(n => familyIds.includes(n.id));

                familyNodes.forEach(fn => {
                    const fnMapping = nodeMappings?.find(m => m.nodeId === fn.id);
                    const fnSubIds = fnMapping?.additionalSubcategories || fn.additionalSubcategories || [];
                    const fnSubId = fnMapping?.subcategoryId || fn.subcategoryId;
                    const fnGuestQuizzes = fnMapping?.additionalQuizzes || [];

                    let nodeMatches = allQuizzes.filter(q =>
                        Number(q.subcategoryId) === Number(fnSubId) ||
                        (fnSubIds && fnSubIds.map(Number).includes(Number(q.subcategoryId))) ||
                        fnGuestQuizzes.map(Number).includes(Number(q.id))
                    );

                    // No keyword filtering needed anymore


                    contextQuizzes.push(...nodeMatches);
                });

                // Deduplicate quizzes if they appear in multiple related nodes
                const seenIds = new Set();
                contextQuizzes = contextQuizzes.filter(q => {
                    if (seenIds.has(q.id)) return false;
                    seenIds.add(q.id);
                    return true;
                });
            } else {
                const subId = (mapping && mapping.subcategoryId !== undefined) ? mapping.subcategoryId : node.subcategoryId;
                const subIds = dynamicSubIds.length > 0 ? dynamicSubIds : (node.additionalSubcategories || []);
                
                const hasSub = !!(subId || subIds.length > 0 || dynamicQuizIds.length > 0);
                if (!hasSub) return;

                contextQuizzes = allQuizzes.filter(q =>
                    Number(q.subcategoryId) === Number(subId) ||
                    (subIds && subIds.map(Number).includes(Number(q.subcategoryId))) ||
                    dynamicQuizIds.map(Number).includes(Number(q.id))
                );

                // No keyword filtering needed anymore

            }

            if (contextQuizzes.length > 0) {
                const completedQuizzes = contextQuizzes.filter(q => q.status === 'completed');
                const doneCount = completedQuizzes.length;

                progressMapLocal[node.id] = (doneCount / contextQuizzes.length) * 100;
                completedCountMapLocal[node.id] = doneCount;
                totalQuizzesMapLocal[node.id] = contextQuizzes.length;

                if (doneCount > 0) {
                    const totalScore = completedQuizzes.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
                    averagesMapLocal[node.id] = totalScore / doneCount;
                }

                contextQuizzes.forEach(q => mappedQuizIds.add(q.id));
            }
        });

        return {
            totalVisibleQuizzes: mappedQuizIds.size,
            nodeProgress: progressMapLocal,
            nodeAverages: averagesMapLocal,
            nodeCompletedCount: completedCountMapLocal,
            nodeTotalQuizzes: totalQuizzesMapLocal
        };
    }, [nodes, allQuizzes, nodeMappings]);

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
                // 1. It is NOT a Container Node (Stop at next parent section/family boundary)
                // 2. We haven't seen it yet
                const isBlockingNode = child.behavior === 'container';

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

    // Responsive Layout Config Helper
    const calculateLayout = (w: number) => {
        if (w >= 1280) return { width: 1100, rowHeight: 180, spread: 4.5, viewportWidth: w, initialScale: 1 };
        if (w >= 768) return { width: 950, rowHeight: 170, spread: 4, viewportWidth: w, initialScale: 1 };

        // Mobile: Use 0.7 scale to ensure visibility of first 3 nodes
        return { width: 1000, rowHeight: 180, spread: 4, viewportWidth: w, initialScale: 0.7 };
    };

    const [layout, setLayout] = React.useState(() => calculateLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));

    React.useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const newWidth = entry.contentRect.width;
                setContainerWidth(newWidth);
                setLayout(calculateLayout(newWidth));
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { width: MAP_WIDTH, rowHeight: ROW_HEIGHT, spread: SPREAD, viewportWidth: VIEWPORT_WIDTH, initialScale: INITIAL_SCALE } = layout;
    const CENTER_X = MAP_WIDTH / 2;
    // Calculate exact offset to align map center with container center (Title midpoint)
    // Account for initialScale when calculating center offset
    const initialX = (containerWidth - (MAP_WIDTH * INITIAL_SCALE)) / 2;

    // Helper to get coordinates
    const getNodePos = (node: ArithmeticNode) => ({
        x: CENTER_X + (node.xOffset || 0) * SPREAD,
        y: node.level * ROW_HEIGHT + 95
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
        if (isLocked && node.level !== 33) return;

        // Otherwise open functionality
        onNodeClick(node);
    };

    const triggerReloadButton = () => {
        setShowReloadButton(true);
        if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = setTimeout(() => {
            setShowReloadButton(false);
        }, 4000);
    };

    const fireFamilyFireworks = () => {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 10000 };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 80 * (timeLeft / duration);
            // Force origin higher up so it falls through the view
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: 0.2 } });
        }, 250);
    };

    useEffect(() => {
        return () => {
            if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
        };
    }, []);

    // Handle Focus and Celebration Trigger from URL
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const focusId = searchParams.get('focusNode');
        const source = searchParams.get('source');
        const quizTitleParam = searchParams.get('quizTitle');

        if (!focusId || nodes.length === 0) return;

        const targetNode = nodes.find(n => n.id === focusId);
        if (!targetNode) return;

        // 1. Process Smooth Scroll (Only once per focusId)
        if (focusId !== processedScrollId) {
            setProcessedScrollId(focusId);
            setTimeout(() => {
                const element = document.getElementById(`node-container-${focusId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);

            // Clean URL after a delay to prevent "sticky" parameters (like source=quiz)
            setTimeout(() => {
                const newUrl = window.location.pathname + window.location.search.replace(/([?&])(focusNode|source|quizTitle)=[^&]+(&|$)/g, '$1').replace(/[?&]$/, '');
                window.history.replaceState({}, '', newUrl);
            }, 6000);
        }

        // 2. Process Celebrations & Overlay Trigger Sequences
        if (focusId !== processedCelebrationId) {
            const isNodeCompleted = 
                searchParams.get('nodeCompleted') === 'true' ||
                progressMap[focusId] === 'completed' || 
                (nodeProgress[focusId] !== undefined && nodeProgress[focusId] >= 99.9) || 
                (nodeTotalQuizzes[focusId] > 0 && nodeCompletedCount[focusId] === nodeTotalQuizzes[focusId]);

            const titleQuiz = quizTitleParam ? decodeURIComponent(quizTitleParam) : (targetNode.label || "cuestionario");

            // CHECK FAMILY COMPLETION
            const findParentContainer = (startNodeId: string): ArithmeticNode | null => {
                const queue = [startNodeId];
                const visited = new Set<string>();
                while (queue.length > 0) {
                    const cid = queue.shift()!;
                    if (visited.has(cid)) continue;
                    visited.add(cid);
                    const cnode = nodes.find(n => n.id === cid);
                    if (!cnode) continue;
                    for (const rid of cnode.requires) {
                        const rnode = nodes.find(n => n.id === rid);
                        if (rnode?.behavior === 'container') return rnode;
                        queue.push(rid);
                    }
                }
                return null;
            };

            const parentContainer = findParentContainer(focusId);
            const isFamilyMastery =
                searchParams.get('familyCompleted') === 'true' ||
                (parentContainer ? (progressMap[parentContainer.id] === 'completed') : false);

            if (source === 'quiz') {
                setProcessedCelebrationId(focusId);
                setCelebratingNodeId(focusId);
                setCelebratingQuizTitle(titleQuiz);
                const parentLabel = parentContainer?.label || 'la unidad';
                setCelebratingUnitTitle(parentLabel);

                if (isFamilyMastery) {
                    setCelebrationType('family');
                    setPendingSequence('silver_then_gold_then_cup');
                } else if (isNodeCompleted) {
                    // Double reward (Quiz + Subtopic/Node completed!)
                    setCelebrationType('double');
                    setPendingSequence('silver_then_gold');
                } else {
                    // Quiz only completed
                    setCelebrationType('quiz');
                    setPendingSequence('silver');
                }

                setTimeout(() => {
                    setShowCelebrationDialog(true);
                    if (isFamilyMastery) {
                        fireFamilyFireworks();
                    } else {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
                        });
                    }
                    const newUrl = window.location.pathname + window.location.search.replace(/([?&])(focusNode|source|quizTitle|nodeCompleted|familyCompleted)=[^&]+(&|$)/g, '$1').replace(/[?&]$/, '');
                    window.history.replaceState({}, '', newUrl);
                }, 700);

            } else if (isNodeCompleted) {
                const parentLabel = parentContainer?.label || 'la unidad';
                setCelebratingUnitTitle(parentLabel);
                // Subtopic/Node only completed
                setProcessedCelebrationId(focusId);
                setCelebratingNodeId(focusId);
                setCelebrationType(isFamilyMastery ? 'family' : 'node');
                setPendingSequence(isFamilyMastery ? 'silver_then_gold_then_cup' : 'silver_then_gold');

                setTimeout(() => {
                    setShowCelebrationDialog(true);
                    if (isFamilyMastery) {
                        fireFamilyFireworks();
                    } else {
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#f59e0b', '#eab308', '#ec4899']
                        });
                    }
                    const newUrl = window.location.pathname + window.location.search.replace(/([?&])(focusNode|source)=[^&]+(&|$)/g, '$1').replace(/[?&]$/, '');
                    window.history.replaceState({}, '', newUrl);
                }, 700);
            }
        }
    }, [nodes, allQuizzes, processedScrollId, processedCelebrationId, nodeProgress, progressMap]);

    // NEW Logic: Automatic Scroll to Last Worked Node (if no focusNode in URL)
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const focusId = searchParams.get('focusNode');
        const hasSubId = searchParams.get('subId');
        const hasNodeId = searchParams.get('nodeId');

        // If we have a focusNode, a subId (open dialog), or nodeId, we consider the "initial focus" 
        // as handled by the URL and we should NOT trigger the automatic "Last Worked" scroll later.
        if (focusId || hasSubId || hasNodeId) {
            lastWorkedScrollProcessed.current = true;
            return;
        }

        // We skip if nodes aren't ready or if we already processed the scroll for this mount.
        if (nodes.length === 0 || allQuizzes.length === 0 || lastWorkedScrollProcessed.current) return;

        // Find most recent interaction
        const recentQuiz = [...allQuizzes]
            .filter(q => q.status !== 'not_started')
            .sort((a, b) => {
                // Priority 1: Recent completion
                if (a.completedAt && b.completedAt) {
                    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
                }
                if (a.completedAt) return -1;
                if (b.completedAt) return 1;
                
                // Priority 2: Most recently started (highest progressId)
                return (b.progressId || 0) - (a.progressId || 0);
            })[0];
            
        if (!recentQuiz) return;
        
        // Find node for this quiz
        let targetNode = nodes.find(n => n.subcategoryId === recentQuiz.subcategoryId);
        if (!targetNode && recentQuiz.subcategoryId) {
            targetNode = nodes.find(n => n.additionalSubcategories?.includes(recentQuiz.subcategoryId));
        }

        if (targetNode) {
            lastWorkedScrollProcessed.current = true;
            const nodeId = targetNode.id;
            
            setTimeout(() => {
                const element = document.getElementById(`node-container-${nodeId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Show a friendly hint
                    setShowLastWorkedHint(nodeId);
                    setTimeout(() => setShowLastWorkedHint(null), 5000);
                }
            }, 800);
        }
    }, [nodes, allQuizzes]);

    // Calculate a Set of all quiz IDs that belong to this specific roadmap
    // (Native, additional subcategories, or guest quizzes)
    const mapQuizIds = useMemo(() => {
        const ids = new Set<number>();
        if (!nodes || !allQuizzes) return ids;

        // 1. Pre-calculate criteria for all nodes to avoid repeated finds/maps
        const criteriaList = nodes.map(node => {
            const mapping = nodeMappings?.find(m => m.nodeId === node.id);
            const subId = mapping ? mapping.subcategoryId : node.subcategoryId;
            const additionalSubs = mapping?.additionalSubcategories || node.additionalSubcategories || [];
            const guestQuizzes = mapping?.additionalQuizzes || [];
            
            return {
                subId: subId ? Number(subId) : null,
                additionalSubs: additionalSubs.map(Number),
                guestQuizzes: guestQuizzes.map(Number)
            };
        });

        // 2. Single pass over quizzes to check against all criteria
        allQuizzes.forEach(q => {
            if (!q) return;
            const qSubId = q.subcategoryId ? Number(q.subcategoryId) : null;
            const qId = Number(q.id);

            for (const criteria of criteriaList) {
                const matches = 
                    (criteria.subId !== null && qSubId === criteria.subId) ||
                    (qSubId !== null && criteria.additionalSubs.includes(qSubId)) ||
                    (criteria.guestQuizzes.includes(qId));

                if (matches) {
                    ids.add(qId);
                    break; // Move to next quiz
                }
            }
        });

        return ids;
    }, [nodes, nodeMappings, allQuizzes]);

    // Search Logic
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const filteredQuizzes = useMemo(() => {
        if (!searchQuery.trim() || !allQuizzes) return [];
        const lowerQuery = searchQuery.toLowerCase();
        
        return allQuizzes
            .filter(q => {
                if (!q) return false;
                
                // CRITICAL: Only include quizzes that actually belong to this roadmap
                // (Native quizzes, additional subcategories, or explicitly invited guest quizzes)
                if (!mapQuizIds.has(q.id)) return false;

                // Match by title OR exact ID
                return q.title.toLowerCase().includes(lowerQuery) || 
                       q.id.toString() === searchQuery.trim();
            })
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .slice(0, 10);
    }, [searchQuery, allQuizzes]);

    // Handle click outside to close search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSelect = (quiz: any) => {
        // Find the node that contains this quiz (considering static data and dynamic mappings)
        let targetNode = nodes.find(n => {
            const mapping = nodeMappings?.find(m => m.nodeId === n.id);
            const subId = mapping ? mapping.subcategoryId : n.subcategoryId;
            const additionalSubs = mapping?.additionalSubcategories || n.additionalSubcategories || [];
            const guestQuizzes = mapping?.additionalQuizzes || [];
            
            return Number(subId) === Number(quiz.subcategoryId) ||
                   (additionalSubs && additionalSubs.map(Number).includes(Number(quiz.subcategoryId))) ||
                   (guestQuizzes && guestQuizzes.map(Number).includes(Number(quiz.id)));
        });

        if (targetNode) {
            setSearchQuery("");
            setIsSearchFocused(false);
            // Open dialog and highlight quiz - NO panning per user request
            onNodeClick(targetNode, quiz.id);
        }
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div
                ref={containerRef}
                className="relative w-full min-h-[600px] flex flex-col items-center bg-transparent pt-6 pb-8"
                onClick={() => setHighlightedNodeId(null)} // Click outside clears highlight
            >
            {styles}

            {/* Header */}
            <div className="text-center mb-2 z-10 relative px-4 pointer-events-none">
                <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 pb-4 mb-1 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {title}
                </h2>
                {description && (
                    <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div
                className="w-full relative"
            >
                {/* Silver Cup Trophy Overlay (Center of screen, fixed) */}
                <AnimatePresence>
                    {showSilverCup && (
                        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/75 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.3, rotate: -35 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    scale: [0.3, 1.25, 1.1, 0.5],
                                    rotate: [-35, 10, -10, 20]
                                }}
                                transition={{
                                    duration: 5.0,
                                    times: [0, 0.15, 0.85, 1],
                                    ease: "easeOut"
                                }}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="relative">
                                    {/* Large Glowing backdrop */}
                                    <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                                    
                                    {/* Circular Trophy Disc Badge */}
                                    <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-8 border-slate-200/50 bg-slate-950/95 flex items-center justify-center shadow-[0_0_90px_rgba(203,213,225,0.8)] backdrop-blur-md">
                                        <img 
                                            src={silverCupTrophyImage} 
                                            alt="Copa de Plata" 
                                            className="w-44 h-44 md:w-48 md:h-48 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.8)]"
                                        />
                                    </div>
                                    
                                    {/* Double Burst Rings */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-72 md:h-72 border-4 border-white/20 rounded-full animate-ping scale-125" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-72 md:h-72 border-2 border-blue-400/20 rounded-full animate-ping scale-150" />
                                </div>
                                <h3 className="mt-8 text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-wide">
                                    ¡COPA DE PLATA OBTENIDA!
                                </h3>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Celebration Dialog Modal */}
                <AnimatePresence>
                    {showCelebrationDialog && celebratingNodeId && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center relative overflow-hidden"
                            >
                                {/* Decoration */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

                                <div className="mb-6 relative inline-block">
                                    <div className={cn(
                                        "absolute inset-0 blur-3xl rounded-full scale-110",
                                        celebrationType === 'family' ? "bg-slate-400/30" : "bg-yellow-500/30"
                                    )} />
                                    <div className="relative p-1 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-black w-56 h-56 flex items-center justify-center">
                                        <img 
                                            src={dialogImageSrc} 
                                            alt="Celebración" 
                                            className="w-full h-full object-cover object-top scale-[1.28] origin-top rounded-2xl"
                                        />
                                        {/* NO OVERLAY BADGE ON TOP OF IMAGE PER USER SPECIFICATION */}
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 2.5 }}
                                        className={cn(
                                            "absolute -top-2 -right-2 p-2 rounded-full shadow-xl border-2 z-10",
                                            celebrationType === 'family' ? "bg-slate-200 border-slate-400 text-slate-900" : "bg-yellow-400 border-yellow-600 text-slate-900"
                                        )}
                                    >
                                        {celebrationType === 'family' ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5 fill-current" />}
                                    </motion.div>
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                                    {celebrationType === 'family' && '¡UNIDAD COMPLETADA!'}
                                    {celebrationType === 'double' && '¡DOBLE LOGRO ALCANZADO!'}
                                    {celebrationType === 'quiz' && '¡CUESTIONARIO COMPLETADO!'}
                                    {celebrationType === 'node' && '¡TEMA COMPLETADO!'}
                                </h2>

                                <p className="text-slate-300 mb-6 font-medium leading-relaxed text-sm">
                                    {celebrationType === 'family' && (
                                        <>
                                            <span className="block text-yellow-300 font-black text-base mb-1">¡Genial!</span>
                                            Luego de un gran trabajo y mucha disciplina has logrado terminar la unidad <span className="text-yellow-400 font-bold">"{celebratingUnitTitle}"</span> completamente. ¡Sigue así, campeón! 🏆
                                        </>
                                    )}
                                    {celebrationType === 'double' && (
                                        <>
                                            ¡Increíble! Has completado el cuestionario <span className="text-yellow-400 font-bold">"{celebratingQuizTitle}"</span> y además has dominado el subtema <span className="text-yellow-400 font-bold">"{nodes.find(n => n.id === celebratingNodeId)?.label}"</span>. ¡Premio doble!
                                        </>
                                    )}
                                    {celebrationType === 'quiz' && (
                                        <>
                                            Genial, has completado el cuestionario <span className="text-yellow-400 font-bold">"{celebratingQuizTitle}"</span>, ¡vamos por el tema completo!
                                        </>
                                    )}
                                    {celebrationType === 'node' && (
                                        <>
                                            Has demostrado gran maestría en <span className="text-yellow-400 font-bold">"{nodes.find(n => n.id === celebratingNodeId)?.label}"</span>. ¡Sigue así!
                                        </>
                                    )}
                                </p>

                                <Button
                                    onClick={handleCloseCelebrationDialog}
                                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-slate-950 font-black py-6 rounded-2xl shadow-[0_10px_20px_rgba(202,138,4,0.3)] transition-all hover:scale-[1.02] active:scale-95 text-base tracking-wider uppercase"
                                >
                                    {celebrationType === 'quiz' && '🥈 ¡A ver mi Medalla de Plata!'}
                                    {(celebrationType === 'double' || celebrationType === 'node') && '🥇🥈 ¡Dame mis Medallas!'}
                                    {celebrationType === 'family' && '🏆 ¡Quiero mi Copa de Plata!'}
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


                {/* Search Bar - Top Right above Legend */}
                <div className="md:absolute md:top-[110px] md:right-4 relative mt-4 md:mt-0 mb-4 md:mb-0 z-[90] flex flex-col items-center md:items-end gap-2 pointer-events-auto px-2 sm:px-4 w-full md:w-auto">
                    <div
                        ref={searchRef}
                        className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-xs"
                    >
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-10 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 shadow-2xl backdrop-blur-md transition-all"
                                placeholder="Buscar cuestionario..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchFocused(true);
                                }}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchFocused && searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-3 w-full max-w-[280px] sm:max-w-[320px] bg-slate-900/95 border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar z-[100]"
                                >
                                    <div className="px-3 py-2 border-b border-slate-800 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                                        Resultados en el Mapa ({filteredQuizzes.length})
                                    </div>
                                    {filteredQuizzes.length > 0 ? (
                                        <div className="py-2">
                                            {filteredQuizzes.map(quiz => {
                                                const isCompleted = quiz.status === 'completed';
                                                return (
                                                    <button
                                                        key={quiz.id}
                                                        onClick={() => handleSearchSelect(quiz)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-800/50 transition-all flex items-start gap-3 group border-b border-white/5 last:border-0"
                                                    >
                                                        <div className={cn(
                                                            "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border shrink-0",
                                                            isCompleted ? "bg-green-500/10 border-green-500/30" : "bg-blue-500/10 border-blue-500/30"
                                                        )}>
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                            ) : (
                                                                <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-slate-200 group-hover:text-white leading-tight">
                                                                {quiz.title}
                                                            </div>
                                                            {quiz.description && (
                                                                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 italic">
                                                                    {quiz.description}
                                                                </div>
                                                            )}
                                                            <div className={cn(
                                                                "text-[10px] font-bold uppercase tracking-wider mt-1",
                                                                isCompleted ? "text-green-500" : "text-blue-400"
                                                            )}>
                                                                {isCompleted ? "Actividad Reciente" : "Actividad Pendiente"}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <AlertTriangle className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">No encontramos "{searchQuery}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Legend - Responsive Position */}
                <div className="md:absolute md:top-[180px] md:right-4 relative mt-4 mx-auto w-fit inset-auto z-50 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl min-w-[200px] pointer-events-auto">
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
                    className="w-full relative"
                >
                    {/* Fixed Reload Button - Appears on interaction */}
                    <AnimatePresence>
                        {showReloadButton && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, y: 0 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: -20, y: 0 }}
                                className="fixed left-6 bottom-8 z-[110] pointer-events-auto"
                            >
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="secondary"
                                    className="w-14 h-14 rounded-full bg-slate-900/90 border-2 border-blue-500/40 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-blue-600 hover:text-white transition-all backdrop-blur-xl flex items-center justify-center p-0 group"
                                    title="Recargar página"
                                >
                                    <RotateCcw className="w-7 h-7 group-hover:rotate-[-45deg] transition-transform duration-300" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TransformWrapper
                        key={`${INITIAL_SCALE}-${containerWidth}`} // Force re-init on layout change
                        ref={transformRef}
                        initialScale={INITIAL_SCALE}
                        initialPositionX={initialX}
                        initialPositionY={50}
                        minScale={0.4}
                        maxScale={2}
                        centerOnInit={false} // Disable auto-center to use our calculated initialX
                        limitToBounds={false}
                        wheel={{ step: 0.1, disabled: !isInteractive }}
                        panning={{ disabled: !isInteractive }}
                        doubleClick={{ disabled: !isInteractive }}
                        onPanning={triggerReloadButton}
                        onZoom={triggerReloadButton}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                {/* Floating Controls */}
                                <div className="absolute bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-auto">
                                    <div className="flex items-center gap-3 justify-end group/hint">
                                        {!isInteractive && (
                                            <div className="hidden md:block bg-slate-900/90 text-blue-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-500/30 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-right-2 duration-500 pointer-events-none whitespace-nowrap">
                                                Click derecho para interactuar ↗
                                            </div>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => setIsInteractive(!isInteractive)}
                                            className={cn(
                                                "rounded-full border shadow-xl transition-all duration-300 shrink-0",
                                                isInteractive
                                                    ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-500"
                                                    : "bg-slate-900/80 border-slate-700 text-slate-400 hover:bg-slate-800"
                                            )}
                                            title={isInteractive ? "Desactivar Zoom/Pan (Usar Scroll página)" : "Activar Zoom/Pan Interactivo"}
                                        >
                                            {isInteractive ? <MousePointerClick className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                                        </Button>
                                    </div>

                                    <div className={cn(
                                        "flex flex-col gap-2 transition-all duration-300",
                                        !isInteractive && "opacity-0 pointer-events-none scale-90 translate-y-4"
                                    )}>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => zoomIn()}
                                            className="rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 shadow-xl"
                                            title="Acercar"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => zoomOut()}
                                            className="rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 shadow-xl"
                                            title="Alejar"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => resetTransform()}
                                            className="rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 shadow-xl"
                                            title="Restablecer vista"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <TransformComponent
                                    wrapperClass="!w-full !max-w-none !h-auto !min-h-[600px] cursor-grab active:cursor-grabbing"
                                    contentClass="!w-full min-w-full"
                                >
                                    <div
                                        className={cn(
                                            "relative overflow-visible pb-10 transition-all duration-300",
                                            !isInteractive ? "opacity-90" : "opacity-100"
                                        )}
                                        style={{ width: MAP_WIDTH, height: totalHeight }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setIsInteractive(!isInteractive);
                                        }}
                                    >

                                        {/* Silver / Gold Medal Node Overlays (Positioned directly on top of target node in map) */}
                                        {celebratingNodeId && (() => {
                                            const targetNode = nodes.find(n => n.id === celebratingNodeId);
                                            if (!targetNode) return null;
                                            const pos = getNodePos(targetNode);

                                            return (
                                                <>
                                                    {/* Silver Medal Overlay */}
                                                    <AnimatePresence>
                                                        {showSilverMedal && (
                                                            <div 
                                                                className="absolute z-[10000] pointer-events-none flex items-center justify-center"
                                                                style={{
                                                                    left: pos.x,
                                                                    top: pos.y,
                                                                    transform: 'translate(-50%, -50%)'
                                                                }}
                                                            >
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                                                                    animate={{
                                                                        opacity: [0, 1, 1, 0],
                                                                        scale: [0.4, 1.25, 1.1, 0.7],
                                                                        rotate: [-25, 0, 0, 15]
                                                                    }}
                                                                    transition={{
                                                                        duration: 3.8,
                                                                        times: [0, 0.2, 0.8, 1],
                                                                        ease: "easeOut"
                                                                    }}
                                                                    className="flex flex-col items-center"
                                                                >
                                                                    <div className="relative">
                                                                        {/* Outer Glow */}
                                                                        <div className="absolute inset-0 bg-slate-300/40 blur-3xl rounded-full scale-150 animate-pulse" />

                                                                        {/* Medal Circular Disc Badge */}
                                                                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-slate-200/50 bg-slate-950/90 flex items-center justify-center shadow-[0_0_60px_rgba(203,213,225,0.6)] backdrop-blur-md">
                                                                            <Medal className="w-28 h-28 text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]" />
                                                                        </div>

                                                                        {/* Particle Burst Effects */}
                                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/40 rounded-full animate-ping scale-150" />
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Gold Medal Overlay */}
                                                    <AnimatePresence>
                                                        {showGoldMedal && (
                                                            <div 
                                                                className="absolute z-[10000] pointer-events-none flex items-center justify-center"
                                                                style={{
                                                                    left: pos.x,
                                                                    top: pos.y,
                                                                    transform: 'translate(-50%, -50%)'
                                                                }}
                                                            >
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                                                                    animate={{
                                                                        opacity: [0, 1, 1, 0],
                                                                        scale: [0.4, 1.25, 1.1, 0.7],
                                                                        rotate: [-25, 0, 0, 15]
                                                                    }}
                                                                    transition={{
                                                                        duration: 3.8,
                                                                        times: [0, 0.2, 0.8, 1],
                                                                        ease: "easeOut"
                                                                    }}
                                                                    className="flex flex-col items-center"
                                                                >
                                                                    <div className="relative">
                                                                        {/* Outer Gold Glow */}
                                                                        <div className="absolute inset-0 bg-yellow-500/50 blur-3xl rounded-full scale-150 animate-pulse" />

                                                                        {/* Medal Circular Disc Badge */}
                                                                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-400/60 bg-slate-950/90 flex items-center justify-center shadow-[0_0_70px_rgba(234,179,8,0.7)] backdrop-blur-md">
                                                                            <Award className="w-28 h-28 text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_30px_rgba(234,179,8,0.9)]" />
                                                                        </div>

                                                                        {/* Particle Burst Effects */}
                                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-yellow-400/50 rounded-full animate-ping scale-150" />
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </>
                                            );
                                        })()}

                                        {/* SVG Connections Layer */}
                                        <svg
                                            width={MAP_WIDTH}
                                            height={totalHeight}
                                            className="absolute top-0 left-0 pointer-events-none z-0 overflow-visible"
                                            viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}
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
                                            const isLocked = status === 'locked' && node.level !== 33;

                                            const isHighlighted = highlightedSet.has(node.id);

                                            return (
                                                <Tooltip key={node.id}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            id={`node-container-${node.id}`}
                                                            style={{
                                                                position: 'absolute',
                                                                left: pos.x,
                                                                top: pos.y,
                                                                transform: 'translate(-50%, -50%)',
                                                                zIndex: isHighlighted ? 30 : 10
                                                            }}
                                                        >
                                                            <motion.div
                                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                        whileInView={isCompleted ? {
                                                            opacity: 1,
                                                            scale: [1, 1.4, 1],
                                                            y: 0,
                                                            filter: ["brightness(1)", "brightness(2.5)", "brightness(1)"],
                                                        } : {
                                                            opacity: 1,
                                                            scale: 1,
                                                            y: 0,
                                                            filter: "brightness(1)"
                                                        }}
                                                        viewport={{ once: true, amount: 0.1 }}
                                                        onViewportEnter={() => {
                                                            if (node.behavior === 'container' && isCompleted && !triggeredFamilies.has(node.id)) {
                                                                // Delayed trigger to ensure user is looking at the screen after scroll
                                                                setTimeout(() => fireFamilyFireworks(), 400);
                                                                setTriggeredFamilies(prev => new Set(prev).add(node.id));
                                                            }
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            ease: "easeInOut",
                                                            times: [0, 0.5, 1],
                                                            opacity: { duration: 0.6 },
                                                            y: { type: 'spring', damping: 20 }
                                                        }}
                                                        className="flex flex-col items-center justify-center p-4 relative" // Use padding to avoid cropping shadows
                                                    >
                                                        {/* Tooltip for Locked Items ("Próximamente") */}
                                                        <div className="relative group">
                                                            {(() => {
                                                                const mapping = nodeMappings?.find(m => m.nodeId === node.id);
                                                                const isSpecial = mapping ? mapping.isSpecial : (node.type === 'critical');

                                                                return (
                                                                    <motion.button
                                                                        layoutId={`node-${node.id}`}
                                                                        whileHover={isAvailable ? { scale: 1.15 } : {}}
                                                                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                                                                        onClick={(e) => handleNodeInteraction(e, node, isLocked)}
                                                                        disabled={isLocked && !isAdmin}
                                                                        className={cn(
                                                                            "relative flex items-center justify-center shadow-lg transition-all duration-300 hover:brightness-125",
                                                                            node.id.endsWith('mastery')
                                                                                ? "w-28 h-28 hover:shadow-[0_0_35px_rgba(192,38,211,0.6)]"
                                                                                : "w-20 h-20 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                                                                            (isSpecial && node.behavior === 'container') ? 'hexagon-mask' :
                                                                                node.behavior === 'container' ? 'rotate-45 rounded-2xl' : 'rounded-full',

                                                                            (!node.id.endsWith('mastery') && isLocked) && "cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                                                                            (node.id.endsWith('mastery') || !isLocked) && "cursor-pointer",

                                                                            isHighlighted ? "ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-950 shadow-[0_0_40px_rgba(251,191,36,0.6)] scale-110" : "",
                                                                            !isHighlighted && isCompleted ? "shadow-[0_0_30px_#22c55e]" :
                                                                                !isHighlighted && isInProgress ? "shadow-[0_0_30px_#2dd4bf]" :
                                                                                    node.id.endsWith('mastery') ? "shadow-[0_0_50px_rgba(192,38,211,0.8)] animate-pulse" :
                                                                                        !isHighlighted && isAvailable ? (
                                                                                            isSpecial ? "shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse-slow" :
                                                                                                "shadow-[0_0_30px_#3b82f6]"
                                                                                        ) : ""
                                                                        )}
                                                                        style={{
                                                                            background: isHighlighted ? 'linear-gradient(135deg, #b45309, #f59e0b)' :
                                                                                node.id.endsWith('mastery') ? 'linear-gradient(135deg, #4c1d95, #701a75, #db2777)' :
                                                                                    isCompleted ? 'linear-gradient(135deg, #1f2937, #064e3b)' :
                                                                                        isInProgress ? 'linear-gradient(135deg, #134e4a, #2dd4bf)' :
                                                                                            isAvailable ? (
                                                                                                isSpecial ? 'linear-gradient(135deg, #881337, #f43f5e)' :
                                                                                                    'linear-gradient(135deg, #1e3a8a, #3b82f6)'
                                                                                            ) : isLocked ? 'linear-gradient(135deg, #1e293b, #451a03)' : '#1e293b',

                                                                            border: `3px solid ${isHighlighted ? '#fbbf24' :
                                                                                node.id.endsWith('mastery') ? '#fbbf24' :
                                                                                    isCompleted ? '#4ade80' :
                                                                                        isInProgress ? '#5eead4' :
                                                                                            isAvailable ? (isSpecial ? '#fb7185' : '#3b82f6') :
                                                                                                isLocked ? '#f59e0b' : '#475569'
                                                                                }`
                                                                        }}
                                                                    >
                                                                        <div className={cn("flex items-center justify-center", node.behavior === 'container' && !isSpecial && "-rotate-45")}>
                                                                            {isCompleted && !node.id.endsWith('mastery') ? (
                                                                                <CheckCircle className="w-8 h-8 text-green-400" />
                                                                            ) : node.id.endsWith('mastery') ? (
                                                                                <motion.div
                                                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                                                >
                                                                                    <Crown className="w-14 h-14 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
                                                                                </motion.div>
                                                                            ) : isLocked ? (
                                                                                <Construction className="w-8 h-8 text-amber-500" />
                                                                            ) : (
                                                                                isSpecial ? <Star className="w-8 h-8 text-white fill-white/20" /> :
                                                                                    node.type === 'evaluation' ? <Trophy className="w-8 h-8 text-purple-400 fill-purple-400/20" /> :
                                                                                        node.behavior === 'container' ? <BookOpen className="w-8 h-8 text-white fill-white/10" /> :
                                                                                            <Play className="w-8 h-8 text-white fill-white" />
                                                                            )}
                                                                        </div>
                                                                    </motion.button>
                                                                );
                                                            })()}

                                                            {isLocked && !node.id.endsWith('mastery') && (
                                                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-slate-700 z-50">
                                                                    Próximamente
                                                                </div>
                                                            )}

                                                            {/* Admin Subcategory Tooltip */}
                                                            {isAdmin && (() => {
                                                                const mapping = nodeMappings?.find(m => m.nodeId === node.id);
                                                                const subId = mapping ? mapping.subcategoryId : node.subcategoryId;
                                                                const additionalSubs = mapping?.additionalSubcategories || node.additionalSubcategories || [];
                                                                const guestQuizzes = mapping?.additionalQuizzes || [];
                                                                
                                                                if (!subId && additionalSubs.length === 0 && guestQuizzes.length === 0) return null;

                                                                return (
                                                                    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/95 text-white text-[10px] p-2 rounded-lg whitespace-nowrap pointer-events-none border border-blue-500/50 z-[100] shadow-xl backdrop-blur-sm">
                                                                        <div className="font-bold border-b border-blue-400/30 mb-1 pb-1 flex items-center gap-1 text-blue-300">
                                                                            <Shield className="w-3 h-3" /> Contenido Vinculado
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            {[subId, ...additionalSubs].filter(Boolean).map(id => {
                                                                                const sub = subcategories.find(s => Number(s.id) === Number(id));
                                                                                return (
                                                                                    <div key={id} className="flex items-center gap-2">
                                                                                        <span className="bg-blue-500/30 px-1 rounded text-[9px] font-mono">SUB: {id}</span>
                                                                                        <span className="text-blue-100">{sub?.name || 'ID no encontrado'}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            {Array.isArray(guestQuizzes) && guestQuizzes.length > 0 && (
                                                                                <div className="pt-1 mt-1 border-t border-blue-400/20">
                                                                                    {guestQuizzes.map((guestId: any) => {
                                                                                        const quiz = (allQuizzesForAdmin || []).find((q: any) => Number(q.id) === Number(guestId));
                                                                                        return (
                                                                                            <div key={guestId} className="flex items-center gap-2">
                                                                                                <span className="bg-pink-500/30 px-1 rounded text-[9px] font-mono text-pink-200">GUEST: {guestId}</span>
                                                                                                <span className="text-pink-100 max-w-[120px] truncate">{quiz?.title || 'Invitado'}</span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}

                                                            {/* Admin Config Button */}
                                                            {isAdmin && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                                                    whileTap={{ scale: 0.8 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setConfigNode(node);
                                                                    }}
                                                                    className="absolute -top-2 -right-2 z-[110] bg-slate-900 border border-slate-700 text-blue-400 p-1.5 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
                                                                    title="Configurar Contenido del Nodo"
                                                                >
                                                                    <Settings className="w-4 h-4" />
                                                                </motion.button>
                                                            )}

                                                            {/* Friendly "Last Worked" Hint */}
                                                            <AnimatePresence>
                                                                {showLastWorkedHint === node.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.5, y: 10, x: "-50%" }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                                                                        exit={{ opacity: 0, scale: 0.5, y: 10, x: "-50%" }}
                                                                        className="absolute bottom-full mb-2 left-1/2 z-[1000] pointer-events-none flex flex-col items-center"
                                                                    >
                                                                        <div className="bg-blue-600 text-white text-[10px] md:text-[11px] font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_4px_15px_rgba(59,130,246,0.5)] flex items-center gap-2 whitespace-nowrap border border-blue-400">
                                                                            <Box className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                                            ¡Aquí estuviste la última vez!
                                                                        </div>
                                                                        {/* The "Punta" (Arrow) - Centered naturally by the flex-col parent */}
                                                                        <div className="w-0 h-0 border-[6px] border-transparent border-t-blue-600 -mt-[1px]" />
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
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

                                                        {/* Label under node - Closer to progress bar and includes score */}
                                                        <div className="mt-1 w-32 md:w-40 text-center pointer-events-none flex flex-col items-center">
                                                            <div className={cn(
                                                                "inline-flex flex-col items-center px-3 py-1 rounded-xl text-[10px] md:text-xs font-bold border backdrop-blur-md shadow-sm transition-colors duration-300 leading-tight",
                                                                isHighlighted ? "bg-yellow-950/50 border-yellow-500/50 text-yellow-200" :
                                                                    isCompleted ? "bg-green-950/50 border-green-500/50 text-green-300" :
                                                                        isAvailable ? "bg-blue-950/50 border-blue-500/50 text-blue-200" :
                                                                            isLocked ? "bg-amber-950/50 border-amber-600/50 text-amber-400" :
                                                                                "bg-slate-900/50 border-slate-700 text-slate-500"
                                                            )}>
                                                                <span className="whitespace-pre-line">{nodeMappings?.find(m => m.nodeId === node.id)?.overrideLabel || node.label}</span>
                                                                
                                                                {nodeAverages[node.id] !== undefined && (isCompleted || (node.behavior === 'container' && nodeProgress[node.id] > 0)) && (
                                                                    <span className="text-[11px] md:text-[12px] font-black text-yellow-400 mt-1 pb-0.5 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                                                                        {nodeAverages[node.id].toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="top"
                                                        className="bg-slate-900/95 border border-slate-700 text-white p-3 rounded-xl shadow-2xl backdrop-blur-md z-[1001]"
                                                    >
                                                        <div className="flex flex-col gap-1 min-w-[140px]">
                                                            <p className="font-bold text-sm text-blue-400 border-b border-white/10 pb-1 mb-1">{nodeMappings?.find(m => m.nodeId === node.id)?.overrideLabel || node.label}</p>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-400">Promedio:</span>
                                                                <span className="font-mono font-bold text-white text-sm">
                                                                    {nodeAverages[node.id] ? nodeAverages[node.id].toFixed(1) : '---'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-400">Completados:</span>
                                                                <span className="font-mono text-white">
                                                                    {nodeCompletedCount[node.id] || 0} / {nodeTotalQuizzes[node.id] || 0}
                                                                </span>
                                                            </div>
                                                            {nodeProgress[node.id] > 0 && (
                                                                <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-blue-500" 
                                                                        style={{ width: `${nodeProgress[node.id]}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}

                                    </div>
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                </div>
            </div>
            </div>
            
            {isAdmin && configNode && (
                <NodeConfigDialog
                    node={configNode}
                    categoryId={categoryId}
                    mapping={nodeMappings?.find(m => m.nodeId === configNode.id)}
                    allQuizzes={allQuizzesForAdmin?.length > 0 ? allQuizzesForAdmin : allQuizzes}
                    subcategories={subcategories}
                    onClose={() => setConfigNode(null)}
                    onSave={(data) => upsertMappingMutation.mutate(data)}
                    isLoading={upsertMappingMutation.isPending}
                />
            )}
        </TooltipProvider>
    );
}

function NodeConfigDialog({
    node,
    categoryId,
    mapping,
    allQuizzes,
    subcategories,
    onClose,
    onSave,
    isLoading
}: {
    node: ArithmeticNode,
    categoryId: number,
    mapping?: any,
    allQuizzes: any[],
    subcategories: any[],
    onClose: () => void,
    onSave: (data: any) => void,
    isLoading: boolean
}) {
    const [overrideLabel, setOverrideLabel] = useState(mapping?.overrideLabel || node.label);
    const [isSpecial, setIsSpecial] = useState<boolean>(mapping?.isSpecial ?? false);
    const [subId, setSubId] = useState(() => {
        if (mapping) return mapping.subcategoryId?.toString() || "";
        return node.subcategoryId?.toString() || "";
    });
    const [subSearch, setSubSearch] = useState("");
    const [quizSearch, setQuizSearch] = useState("");
    const [additionalSubs, setAdditionalSubs] = useState<number[]>(mapping?.additionalSubcategories || node.additionalSubcategories || []);
    const [additionalQuizzes, setAdditionalQuizzes] = useState<number[]>(mapping?.additionalQuizzes || []);
    const { toast } = useToast();

    const filteredQuizzes = useMemo(() => {
        const search = quizSearch.trim().toLowerCase();
        if (!search) return [];
        
        const source = Array.isArray(allQuizzes) ? allQuizzes : [];
        
        return source.filter(q => {
            if (!q) return false;
            const title = (q.title || "").toLowerCase();
            const idStr = (q.id || "").toString();
            
            const categoryName = (q.category?.name || q.categoryName || "").toLowerCase();
            const matches = title.includes(search) || idStr.includes(search) || categoryName.includes(search);
            const alreadyAdded = (additionalQuizzes || []).includes(q.id);
            
            return matches && !alreadyAdded;
        }).slice(0, 15);
    }, [quizSearch, allQuizzes, additionalQuizzes]);

    const filteredSubs = useMemo(() => {
        if (!subSearch.trim()) return [];
        const lowerSearch = subSearch.toLowerCase();
        return subcategories.filter(s =>
            (s.name.toLowerCase().includes(lowerSearch) || s.id.toString() === subSearch) &&
            !additionalSubs.includes(s.id) &&
            s.id.toString() !== subId
        ).slice(0, 10);
    }, [subSearch, subcategories, additionalSubs, subId]);

    const handleSave = () => {
        onSave({
            mapId: categoryId,
            nodeId: node.id,
            subcategoryId: subId ? parseInt(subId) : null,
            additionalSubcategories: additionalSubs,
            additionalQuizzes: additionalQuizzes,
            overrideLabel: overrideLabel,
            isSpecial: isSpecial
        });
        toast({
            title: "Configuración guardada",
            description: `Se han actualizado los vínculos para el nodo ${overrideLabel || node.label}.`,
        });
    };

    return (
        <Dialog open={!!node} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] w-[95vw] h-[85vh] bg-slate-900 border-slate-700 text-white flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-blue-400 animate-spin-slow" />
                        Configurar Nodo: {overrideLabel || node.label}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Gestiona qué contenido y apariencia tiene este nodo.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-8 py-4 pb-12">
                        {/* Configuración de Nodo Especial (Estrella) */}
                        <div className="flex items-center justify-between bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                            <div className="space-y-1 pr-4">
                                <Label className="text-rose-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                    <Star className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                                    Nodo Especial (Estrella / Importancia Mayor)
                                </Label>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    Destaca este nodo con resplandor especial rosado e ícono de estrella en el mapa.
                                </p>
                            </div>
                            <Switch
                                checked={isSpecial}
                                onCheckedChange={setIsSpecial}
                                className="data-[state=checked]:bg-rose-500 data-[state=unchecked]:bg-slate-950 hover:data-[state=unchecked]:bg-slate-800 border-2 border-slate-700 transition-colors"
                            />
                        </div>

                        {/* Edición de Nombre del Nodo */}
                        <div className="space-y-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
                            <Label className="text-blue-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <Box className="w-3 h-3" />
                                Nombre del Nodo en el Mapa
                            </Label>
                            <Input
                                value={overrideLabel}
                                onChange={(e) => setOverrideLabel(e.target.value)}
                                placeholder="Nombre personalizado para este nodo..."
                                className="bg-slate-950 border-slate-800 focus:ring-blue-500/50 text-blue-100 font-bold"
                            />
                            <p className="text-[10px] text-slate-500 italic">Este nombre reemplazará al original ("{node.label}") en el mapa.</p>
                        </div>
                        {/* Subcategoría Principal */}
                        <div className="space-y-3 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                            <Label className="text-blue-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                Subcategoría Principal (ID o Nombre)
                            </Label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    value={subId}
                                    onChange={(e) => setSubId(e.target.value)}
                                    placeholder="ID de la subcategoría..."
                                    className="bg-slate-950 border-slate-800 pl-10 focus:ring-blue-500/50"
                                />
                                {subId && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-medium max-w-[200px] truncate">
                                        {subcategories.find(s => s.id.toString() === subId)?.name || 'ID no encontrado'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subcategorías Adicionales */}
                        <div className="space-y-4 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                            <Label className="text-purple-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                                Subcategorías Adicionales
                            </Label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Busca subcategoría por nombre o ID..."
                                    value={subSearch}
                                    onChange={(e) => setSubSearch(e.target.value)}
                                    className="bg-slate-950 border-slate-800 pl-10 focus:ring-purple-500/50"
                                />
                            </div>

                            {subSearch && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-1 max-h-40 overflow-y-auto shadow-2xl"
                                >
                                    {filteredSubs.length > 0 ? (
                                        filteredSubs.map(s => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between p-2 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors group"
                                                onClick={() => {
                                                    setAdditionalSubs([...additionalSubs, s.id]);
                                                    setSubSearch("");
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">{s.name}</span>
                                                    <span className="text-[9px] text-slate-500">ID: {s.id}</span>
                                                </div>
                                                <Plus className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-slate-600 text-xs italic">
                                            No se encontraron subcategorías
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {additionalSubs.length === 0 && <p className="text-[10px] text-slate-500 italic">No hay subcategorías adicionales.</p>}
                                {additionalSubs.map(id => {
                                    const sub = subcategories.find(s => s.id === id);
                                    return (
                                        <Badge key={id} variant="secondary" className="bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-200 flex items-center gap-2 px-3 py-1.5 group transition-all">
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[9px] text-purple-400/70 font-mono font-bold">ID: {id}</span>
                                                <span className="text-xs font-semibold">{sub?.name || 'Cargando...'}</span>
                                            </div>
                                            <X className="w-3.5 h-3.5 cursor-pointer text-purple-500/50 group-hover:text-red-400 transition-colors" onClick={() => setAdditionalSubs(additionalSubs.filter(s => s !== id))} />
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Invitados (Quizzes Específicos) */}
                        <div className="space-y-4 bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between">
                                <Label className="text-pink-300 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
                                    Cuestionarios Invitados
                                </Label>
                                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-white/5">
                                    {allQuizzes?.length || 0} disponibles
                                </span>
                            </div>
                            
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Nombre, ID o Materia (ej: Álgebra)..."
                                    value={quizSearch}
                                    onChange={(e) => setQuizSearch(e.target.value)}
                                    className="bg-slate-950 border-slate-800 pl-10 focus:ring-pink-500/50"
                                />
                            </div>

                            {quizSearch && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-950 border border-slate-800 rounded-xl p-1 max-h-48 overflow-y-auto shadow-2xl"
                                >
                                    {filteredQuizzes.length > 0 ? (
                                        filteredQuizzes.map(q => (
                                            <div
                                                key={q.id}
                                                className="flex items-center justify-between p-2.5 hover:bg-slate-900 rounded-lg cursor-pointer group"
                                                onClick={() => {
                                                    setAdditionalQuizzes([...additionalQuizzes, q.id]);
                                                    setQuizSearch("");
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-200 group-hover:text-pink-400 transition-colors">{q.title}</span>
                                                    <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-0.5">
                                                        <span className="bg-slate-800 px-1.5 rounded">ID: {q.id}</span>
                                                        <span className="text-slate-400 font-bold uppercase">{q.category?.name || q.categoryName || 'Materia'}</span>
                                                    </div>
                                                </div>
                                                <Plus className="w-3.5 h-3.5 text-pink-400 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-600 text-xs italic">
                                            No se encontraron resultados
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {additionalQuizzes.map(id => {
                                    const q = allQuizzes.find(aq => aq.id === id);
                                    return (
                                        <Badge key={id} variant="outline" className="border-pink-500/30 bg-pink-500/5 text-pink-300 flex items-center gap-2 px-2 py-1 group transition-all">
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[9px] text-pink-500/50 font-mono">ID: {id}</span>
                                                <span className="text-xs truncate max-w-[120px]">{q?.title || `Quiz #${id}`}</span>
                                            </div>
                                            <X className="w-3 h-3 cursor-pointer text-pink-700 group-hover:text-red-400" onClick={() => setAdditionalQuizzes(additionalQuizzes.filter(qid => qid !== id))} />
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between shrink-0">
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 shadow-[0_0_20px_rgba(37,99,235,0.3)] border-0"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </div>
                        ) : 'Aplicar Vínculos'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
