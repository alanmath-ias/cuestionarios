import { arithmeticMapNodes } from '../data/arithmetic-map-data';
import { algebraMapNodes } from '../data/algebra-map-data';
import { calculusMapNodes } from '../data/calculus-map-data';
import { Category, Quiz, UserQuiz } from '@/types/types';

// Map of categories to their ground-truth data
const MAP_DATA: Record<number, any[]> = {
    1: arithmeticMapNodes,
    2: algebraMapNodes,
    4: calculusMapNodes
};

export interface PerformanceItem {
    id: string | number;
    label: string;
    score: number;
}

export interface MasteryStats {
    silverMedals: number;   // Quizzes completed (only those in map)
    goldMedals: number;     // Children Nodes (quiz_list) completed
    silverTrophies: number; // Parent Nodes (container) completed
    goldTrophies: number;   // Full Map completed
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
 * Filter quizzes that belong to a specific map node based on subcategoryId and keywords.
 */
function getQuizzesForNode(node: any, allQuizzes: Quiz[]) {
    if (!node.subcategoryId && (!node.additionalSubcategories || node.additionalSubcategories.length === 0)) {
        return [];
    }

    let matches = allQuizzes.filter(q =>
        q.subcategoryId === node.subcategoryId ||
        (node.additionalSubcategories && node.additionalSubcategories.includes(q.subcategoryId!))
    );

    if (node.filterKeywords && node.filterKeywords.length > 0) {
        const keywords = node.filterKeywords.map((k: string) => k.toLowerCase());
        matches = matches.filter(q => {
            const title = q.title.toLowerCase();
            const inKeywords = keywords.some((k: string) => title.includes(k));
            if (!inKeywords) return false;

            if (node.excludeKeywords) {
                const exclude = node.excludeKeywords.map((k: string) => k.toLowerCase());
                if (exclude.some((k: string) => title.includes(k))) return false;
            }
            return true;
        });
    }
    return matches;
}

export function calculateMasteryStats(
    categoryId: number,
    allQuizzes: any[], // User-quizzes with status
    availableQuizzes: Quiz[] // All base quizzes for category
): MasteryStats {
    const nodes = MAP_DATA[categoryId] || [];
    if (nodes.length === 0) return { 
        silverMedals: 0, goldMedals: 0, silverTrophies: 0, goldTrophies: 0, progress: 0, 
        totalQuizzes: 0, completedQuizzes: 0, totalAverage: 0, bestQuizzes: [], worstQuizzes: [], 
        strongestNodes: [], weakestNodes: [], strongestUnits: [], weakestUnits: [], pendingNodes: [] 
    };

    const categoryBaseQuizzes = availableQuizzes.filter(q => q.categoryId === categoryId);
    const userProgressMap = new Map(allQuizzes.map(q => [q.id, q]));

    // 1. Identify "Children" (Gold Medals) and calculate their averages
    const childNodes = nodes.filter(n => n.behavior === 'quiz_list');
    const nodeStats = childNodes.map(node => {
        const nodeQuizzes = getQuizzesForNode(node, categoryBaseQuizzes);
        if (nodeQuizzes.length === 0) return { id: node.id, label: node.label, complete: false, quizzes: [], average: 0, completedCount: 0 };
        
        const completed = nodeQuizzes.filter(q => userProgressMap.get(q.id)?.status === 'completed');
        const complete = completed.length === nodeQuizzes.length && nodeQuizzes.length > 0;
        
        let average = 0;
        if (completed.length > 0) {
            const totalScore = completed.reduce((sum, q) => sum + (Number(userProgressMap.get(q.id)?.score) || 0), 0);
            average = totalScore / completed.length;
        }

        return { id: node.id, label: node.label, complete, quizzes: nodeQuizzes, average, completedCount: completed.length };
    });

    const goldMedals = nodeStats.filter(s => s.complete).length;

    // 2. Identify "Parents" (Silver Trophies) and calculate Unit Performance
    const parentNodes = nodes.filter(n => n.behavior === 'container');
    const unitStats = parentNodes.map(parent => {
        // A parent's performance is the average of its immediate child nodes
        const dependentNodes = nodes.filter(n => n.requires && n.requires.includes(parent.id));
        const dependentStats = dependentNodes.map(dn => nodeStats.find(ns => ns.id === dn.id)).filter(Boolean);
        
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
            const userQuiz = userProgressMap.get(q.id);
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
        .filter(n => n.behavior === 'quiz_list')
        .filter(n => !nodeStats.find(s => s.id === n.id)?.complete)
        .slice(0, 5)
        .map(n => n.label);

    // 4. Gold Trophy
    const isMapComplete = unitStats.length > 0 && unitStats.every(u => u.complete);

    return {
        silverMedals: completedQuizzesCount,
        goldMedals,
        silverTrophies,
        goldTrophies: isMapComplete ? 1 : 0,
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
