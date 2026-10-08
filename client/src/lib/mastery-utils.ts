import { arithmeticMapNodes } from '../data/arithmetic-map-data';
import { algebraMapNodes } from '../data/algebra-map-data';
import { calculusMapNodes } from '../data/calculus-map-data';
import { integralCalculusMapNodes } from '../data/integral-calculus-map-data';
import { statisticsMapNodes } from '../data/statistics-map-data';
import { grade1MapNodes } from '../data/grade-1-map-data';
import { grade2MapNodes } from '../data/grade-2-map-data';
import { grade3MapNodes } from '../data/grade-3-map-data';
import { grade4MapNodes } from '../data/grade-4-map-data';
import { grade5MapNodes } from '../data/grade-5-map-data';
import { grade6MapNodes } from '../data/grade-6-map-data';
import { grade7MapNodes } from '../data/grade-7-map-data';
import { grade8MapNodes } from '../data/grade-8-map-data';
import { grade9MapNodes } from '../data/grade-9-map-data';
import { Category, Quiz, UserQuiz } from '@/types/types';

// Map of categories to their ground-truth data
const MAP_DATA: Record<number, any[]> = {
    1: arithmeticMapNodes,
    2: algebraMapNodes,
    4: calculusMapNodes,
    5: integralCalculusMapNodes,
    9: statisticsMapNodes,
    19: statisticsMapNodes
};

export interface GradeAwardConfig {
    key: string;              // e.g. 'grade-1'
    shortLabel: string;       // e.g. '1°'
    name: string;             // e.g. '1° Primero'
    title: string;            // e.g. 'Primero de Primaria'
    icon: string;             // emoji
    color: string;            // Badge accent colors
    nodes: any[];
}

export const CATEGORY_GRADES: Record<number, GradeAwardConfig[]> = {
    1: [
        { key: 'grade-1', shortLabel: '1°', name: '1° Primero', title: 'Primero de Primaria', icon: '🎒', color: 'from-amber-400 to-yellow-500', nodes: grade1MapNodes },
        { key: 'grade-2', shortLabel: '2°', name: '2° Segundo', title: 'Segundo de Primaria', icon: '🚀', color: 'from-orange-400 to-amber-500', nodes: grade2MapNodes },
        { key: 'grade-3', shortLabel: '3°', name: '3° Tercero', title: 'Tercero de Primaria', icon: '🎯', color: 'from-emerald-400 to-teal-500', nodes: grade3MapNodes },
        { key: 'grade-4', shortLabel: '4°', name: '4° Cuarto', title: 'Cuarto de Primaria', icon: '🧭', color: 'from-blue-400 to-cyan-500', nodes: grade4MapNodes },
        { key: 'grade-5', shortLabel: '5°', name: '5° Quinto', title: 'Quinto de Primaria', icon: '💡', color: 'from-indigo-400 to-blue-500', nodes: grade5MapNodes },
        { key: 'grade-6', shortLabel: '6°', name: '6° Sexto', title: 'Sexto de Primaria', icon: '🔬', color: 'from-purple-400 to-pink-500', nodes: grade6MapNodes },
        { key: 'grade-7', shortLabel: '7°', name: '7° Séptimo', title: 'Séptimo de Primaria', icon: '⚔️', color: 'from-rose-400 to-red-500', nodes: grade7MapNodes },
    ],
    2: [
        { key: 'grade-8', shortLabel: '8°', name: '8° Octavo', title: 'Octavo Grado', icon: '📐', color: 'from-cyan-400 to-blue-500', nodes: grade8MapNodes },
        { key: 'grade-9', shortLabel: '9°', name: '9° Noveno', title: 'Noveno Grado', icon: '🔮', color: 'from-purple-400 to-indigo-500', nodes: grade9MapNodes },
    ]
};

export function getGradeNodes(gradeLevel?: string | number | null): any[] | null {
    if (!gradeLevel) return null;
    const str = String(gradeLevel).trim().toLowerCase();
    const match = str.match(/grade-?([1-9])/i) || str.match(/\b([1-9])\b/);
    if (!match) return null;
    const num = match[1];
    switch (num) {
        case '1': return grade1MapNodes;
        case '2': return grade2MapNodes;
        case '3': return grade3MapNodes;
        case '4': return grade4MapNodes;
        case '5': return grade5MapNodes;
        case '6': return grade6MapNodes;
        case '7': return grade7MapNodes;
        case '8': return grade8MapNodes;
        case '9': return grade9MapNodes;
        default: return null;
    }
}

export function isGradeRoadmap(gradeLevel?: string | number | null, nodes?: any[]): boolean {
    if (gradeLevel && getGradeNodes(gradeLevel)) return true;
    if (nodes && nodes.length > 0) {
        return nodes.some(n => typeof n.id === 'string' && /^g[1-9]-/.test(n.id));
    }
    return false;
}

export function findGradeForQuiz(quizId: number | string, subcategoryId?: number | string | null): {
    gradeKey: string;
    gradeNum: string;
    node: any;
    nodes: any[];
    parentContainer: any;
} | null {
    const qId = Number(quizId);
    const sId = subcategoryId != null ? Number(subcategoryId) : null;
    const allGrades = [...CATEGORY_GRADES[1], ...CATEGORY_GRADES[2]];

    for (const g of allGrades) {
        const nodes = g.nodes;
        for (const node of nodes) {
            if (node.id.endsWith('mastery') || node.behavior === 'container') continue;
            const matchesQuiz = Array.isArray(node.additionalQuizzes) && node.additionalQuizzes.map(Number).includes(qId);
            const matchesSub = sId !== null && (
                Number(node.subcategoryId) === sId ||
                (Array.isArray(node.additionalSubcategories) && node.additionalSubcategories.map(Number).includes(sId))
            );

            if (matchesQuiz || matchesSub) {
                // Find parent container
                let parent: any = null;
                const queue = [node.id];
                const visited = new Set<string>();
                while (queue.length > 0) {
                    const cid = queue.shift()!;
                    if (visited.has(cid)) continue;
                    visited.add(cid);
                    const cnode = nodes.find(n => n.id === cid);
                    if (!cnode || !cnode.requires) continue;
                    for (const rid of cnode.requires) {
                        const rnode = nodes.find(n => n.id === rid);
                        if (rnode?.behavior === 'container') {
                            parent = rnode;
                            break;
                        }
                        queue.push(rid);
                    }
                    if (parent) break;
                }

                return {
                    gradeKey: g.key,
                    gradeNum: g.key.replace('grade-', ''),
                    node,
                    nodes,
                    parentContainer: parent
                };
            }
        }
    }
    return null;
}

export function getArithmeticQuizIds(allQuizzes: any[], nodeMappings?: any[]): Set<number> {
    const ids = new Set<number>();
    arithmeticMapNodes.forEach(node => {
        if (node.id.endsWith('mastery')) return;
        const qList = getQuizzesForNode(node, allQuizzes, nodeMappings);
        qList.forEach(q => ids.add(Number(q.id)));
    });
    return ids;
}

export function getAlgebraQuizIds(allQuizzes: any[], nodeMappings?: any[]): Set<number> {
    const ids = new Set<number>();
    algebraMapNodes.forEach(node => {
        if (node.id.endsWith('mastery')) return;
        const qList = getQuizzesForNode(node, allQuizzes, nodeMappings);
        qList.forEach(q => ids.add(Number(q.id)));
    });
    return ids;
}

export interface PerformanceItem {
    id: string | number;
    label: string;
    score: number;
}

export interface MasteryStats {
    silverMedals: number;   // Quizzes completed (only those in map)
    goldMedals: number;     // Children Nodes (quiz_list) completed
    silverTrophies: number; // Parent Nodes (container) completed
    goldTrophies: number;   // Full Map completed (real-time)

    // Copa persistida: true si el mapa fue completado alguna vez, aunque luego
    // el admin haya añadido contenido nuevo sin completar.
    earnedGoldTrophy: boolean;

    // true cuando el mapa fue ganado previamente PERO ahora hay nodos sin completar
    // (porque el admin añadió quizzes nuevos después de que el estudiante completó el mapa)
    hasPendingNewContent: boolean;

    // Labels de los nodos con contenido nuevo (para tooltip y scroll)
    newContentNodes: string[];

    progress: number;       // Percent
    totalQuizzes: number;
    completedQuizzes: number;

    // Detailed Stats for Cofre
    totalAverage: number;
    bestQuizzes: PerformanceItem[];
    worstQuizzes: PerformanceItem[];
    strongestNodes: PerformanceItem[];
    weakestNodes: PerformanceItem[];
    strongestUnits: PerformanceItem[];
    weakestUnits: PerformanceItem[];
    pendingNodes: string[]; // Labels of available nodes not yet completed
}

/**
 * Filter quizzes that belong to a specific map node based on subcategoryId, additional subcategories, and guest quizzes.
 */
export function getQuizzesForNode(node: any, allQuizzes: any[], nodeMappings?: any[]) {
    const mapping = nodeMappings?.find(m => m.nodeId === node.id);
    const subId = (mapping && mapping.subcategoryId !== undefined && mapping.subcategoryId !== null)
        ? mapping.subcategoryId
        : node.subcategoryId;

    const additionalSubs = (mapping?.additionalSubcategories && mapping.additionalSubcategories.length > 0)
        ? mapping.additionalSubcategories
        : (node.additionalSubcategories || []);

    const guestQuizzes = (mapping?.additionalQuizzes && mapping.additionalQuizzes.length > 0)
        ? mapping.additionalQuizzes
        : (node.additionalQuizzes || []);

    if (!subId && additionalSubs.length === 0 && guestQuizzes.length === 0) {
        return [];
    }

    const subIdNum = subId ? Number(subId) : null;
    const addSubNums = additionalSubs.map(Number);
    const guestNums = guestQuizzes.map(Number);

    return (allQuizzes || []).filter(q => {
        if (!q) return false;
        const qSubId = q.subcategoryId ? Number(q.subcategoryId) : null;
        const qId = Number(q.id);
        return (
            (subIdNum !== null && qSubId === subIdNum) ||
            (qSubId !== null && addSubNums.includes(qSubId)) ||
            (guestNums.includes(qId))
        );
    });
}

export function calculateMasteryStats(
    categoryId: number,
    allQuizzes: any[], // User-quizzes with status
    availableQuizzes?: Quiz[], // All base quizzes in platform
    nodeMappings?: any[],
    wasPreviouslyCompleted?: boolean, // true si tourStatus.completedMaps[categoryId] existe
    customNodes?: any[] // Optional: para calcular estadísticas de un subcofre por grado
): MasteryStats {
    const emptyResult: MasteryStats = {
        silverMedals: 0, goldMedals: 0, silverTrophies: 0, goldTrophies: 0,
        earnedGoldTrophy: !!wasPreviouslyCompleted,
        hasPendingNewContent: false,
        newContentNodes: [],
        progress: wasPreviouslyCompleted ? 100 : 0,
        totalQuizzes: 0, completedQuizzes: 0, totalAverage: 0,
        bestQuizzes: [], worstQuizzes: [],
        strongestNodes: [], weakestNodes: [], strongestUnits: [], weakestUnits: [], pendingNodes: []
    };

    const rawNodes = customNodes || MAP_DATA[categoryId] || [];
    const nodes = rawNodes.filter(n => !n.id.endsWith('mastery'));
    if (nodes.length === 0) return emptyResult;

    // Combine availableQuizzes and allQuizzes to have the complete pool of quizzes (including guest quizzes)
    const quizPoolMap = new Map<number, any>();
    (allQuizzes || []).forEach(q => { if (q && q.id) quizPoolMap.set(Number(q.id), q); });
    (availableQuizzes || []).forEach(q => {
        if (q && q.id && !quizPoolMap.has(Number(q.id))) quizPoolMap.set(Number(q.id), q);
    });
    const quizPool = Array.from(quizPoolMap.values());

    const userProgressMap = new Map((allQuizzes || []).map(q => [Number(q.id), q]));

    // 1. Identify non-container nodes (Gold Medals / topics) and calculate their averages
    const childNodes = nodes.filter(n => n.behavior !== 'container');
    const nodeStats = childNodes.map(node => {
        const nodeQuizzes = getQuizzesForNode(node, quizPool, nodeMappings);
        if (nodeQuizzes.length === 0) return { id: node.id, label: node.label, complete: false, quizzes: [], average: 0, completedCount: 0 };
        
        const completed = nodeQuizzes.filter(q => userProgressMap.get(Number(q.id))?.status === 'completed');
        const complete = completed.length === nodeQuizzes.length && nodeQuizzes.length > 0;
        
        let average = 0;
        if (completed.length > 0) {
            const totalScore = completed.reduce((sum, q) => sum + (Number(userProgressMap.get(Number(q.id))?.score) || 0), 0);
            average = totalScore / completed.length;
        }

        return { id: node.id, label: node.label, complete, quizzes: nodeQuizzes, average, completedCount: completed.length };
    });

    const goldMedals = nodeStats.filter(s => s.complete).length;

    // 2. Identify "Parents" (Silver Trophies) and calculate Unit Performance
    const parentNodes = nodes.filter(n => n.behavior === 'container');
    const unitStats = parentNodes.map(parent => {
        // Collect all descendant nodes of this unit (stopping at another container boundary or mastery)
        const familyNodeIds: string[] = [];
        const queue = [parent.id];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            const children = nodes.filter(n => n.requires && n.requires.includes(currentId));
            for (const child of children) {
                if (child.behavior === 'container' || child.id.endsWith('mastery')) continue;
                if (!familyNodeIds.includes(child.id)) {
                    familyNodeIds.push(child.id);
                }
                queue.push(child.id);
            }
        }

        const dependentStats = familyNodeIds.map(nid => nodeStats.find(ns => ns.id === nid)).filter(Boolean);
        
        let average = 0;
        const performedNodes = dependentStats.filter(ns => ns!.completedCount > 0);
        if (performedNodes.length > 0) {
            average = performedNodes.reduce((s, ns) => s + ns!.average, 0) / performedNodes.length;
        }

        const complete = dependentStats.length > 0 && dependentStats.every(s => s!.complete);
        return { id: parent.id, label: parent.label, average, complete, performedCount: performedNodes.length };
    });

    const silverTrophies = unitStats.filter(u => u.complete).length;

    // Strongest/Weakest Units (Only show weakest if score < 8.0)
    const activeUnits = unitStats.filter(u => u.performedCount > 0);
    const strongestUnits = [...activeUnits].sort((a,b) => b.average - a.average).slice(0, 3).map(u => ({ id: u.id, label: u.label, score: u.average }));
    const weakestUnits = [...activeUnits]
        .filter(u => u.average < 8.0)
        .sort((a,b) => a.average - b.average)
        .slice(0, 3)
        .map(u => ({ id: u.id, label: u.label, score: u.average }));

    // 3. Silver Medals & General Averages
    const allMapQuizzes: PerformanceItem[] = [];
    const completedMapQuizzes: PerformanceItem[] = [];

    nodeStats.forEach(ns => {
        ns.quizzes.forEach(q => {
            const userQuiz = userProgressMap.get(Number(q.id));
            const score = Number(userQuiz?.score) || 0;
            const item = { id: q.id, label: q.title, score };
            
            allMapQuizzes.push(item);
            if (userQuiz?.status === 'completed') {
                completedMapQuizzes.push(item);
            }
        });
    });

    // Deduplicate quizzes sharing nodes
    const uniqueCompleted = Array.from(new Map(completedMapQuizzes.map(q => [q.id, q])).values());
    const uniqueAll = Array.from(new Map(allMapQuizzes.map(q => [q.id, q])).values());

    const totalQuizzes = uniqueAll.length;
    const completedQuizzesCount = uniqueCompleted.length;
    const progress = totalQuizzes > 0 ? (completedQuizzesCount / totalQuizzes) * 100 : 0;

    const totalAverage = uniqueCompleted.length > 0 
        ? uniqueCompleted.reduce((sum, q) => sum + q.score, 0) / uniqueCompleted.length 
        : 0;

    // Best/Worst Quizzes (Only show worst if score < 8.0)
    const sortedQuizzes = [...uniqueCompleted].sort((a, b) => b.score - a.score);
    const bestQuizzes = sortedQuizzes.slice(0, 3);
    const worstQuizzes = [...uniqueCompleted]
        .filter(q => q.score < 8.0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

    // Strongest/Weakest Nodes (Topics) (Only show weakest if score < 8.0)
    const completedNodes = nodeStats.filter(ns => ns.completedCount > 0);
    const sortedNodes = [...completedNodes].sort((a, b) => b.average - a.average);
    const strongestNodes = sortedNodes.slice(0, 3).map(n => ({ id: n.id, label: n.label, score: n.average }));
    const weakestNodes = [...completedNodes]
        .filter(n => n.average < 8.0)
        .sort((a, b) => a.average - b.average)
        .slice(0, 3)
        .map(n => ({ id: n.id, label: n.label, score: n.average }));

    // Pending units (Incomplete nodes)
    const pendingNodes = nodes
        .filter(n => n.behavior !== 'container')
        .filter(n => !nodeStats.find(s => s.id === n.id)?.complete)
        .slice(0, 5)
        .map(n => n.label);

    // 4. Gold Trophy (real-time)
    const isMapComplete = unitStats.length > 0 && unitStats.every(u => u.complete);
    const goldTrophies = isMapComplete ? 1 : 0;

    // 5. Earned Gold Trophy (persisted logro)
    // true si el mapa está actualmente completo OR si fue completado antes
    const earnedGoldTrophy = isMapComplete || !!wasPreviouslyCompleted;

    // 6. Pending new content detection
    // Ocurre cuando el estudiante ganó la copa pero el admin añadió quizzes que aún no ha hecho
    const hasPendingNewContent = !!wasPreviouslyCompleted && !isMapComplete;

    // Nodos que tienen quizzes sin completar y existen en el mapa (contenido añadido)
    const newContentNodes = hasPendingNewContent
        ? nodeStats
            .filter(ns => !ns.complete && ns.quizzes.length > 0)
            .map(ns => ns.label)
        : [];

    return {
        silverMedals: completedQuizzesCount,
        goldMedals,
        silverTrophies,
        goldTrophies,
        earnedGoldTrophy,
        hasPendingNewContent,
        newContentNodes,
        progress,
        totalQuizzes,
        completedQuizzes: completedQuizzesCount,
        totalAverage,
        bestQuizzes,
        worstQuizzes,
        strongestNodes,
        weakestNodes,
        strongestUnits,
        weakestUnits,
        pendingNodes
    };
}


// Map of categories to their ground-truth data
