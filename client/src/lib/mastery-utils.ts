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

export interface MasteryStats {
    silverMedals: number;   // Quizzes completed (only those in map)
    goldMedals: number;     // Children Nodes (quiz_list) completed
    silverTrophies: number; // Parent Nodes (container) completed
    goldTrophies: number;   // Full Map completed
    progress: number;       // Percent
    totalQuizzes: number;
    completedQuizzes: number;
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
    if (nodes.length === 0) return { silverMedals: 0, goldMedals: 0, silverTrophies: 0, goldTrophies: 0, progress: 0, totalQuizzes: 0, completedQuizzes: 0 };

    // Map base quizzes for this category
    const categoryBaseQuizzes = availableQuizzes.filter(q => q.categoryId === categoryId);
    const userProgressMap = new Map(allQuizzes.map(q => [q.id, q.status]));

    // 1. Identify "Children" (Gold Medals)
    const childNodes = nodes.filter(n => n.behavior === 'quiz_list');
    const childNodeStatus = childNodes.map(node => {
        const nodeQuizzes = getQuizzesForNode(node, categoryBaseQuizzes);
        if (nodeQuizzes.length === 0) return { id: node.id, complete: false, quizzes: [] };
        const complete = nodeQuizzes.every(q => userProgressMap.get(q.id) === 'completed');
        return { id: node.id, complete, quizzes: nodeQuizzes };
    });

    const goldMedals = childNodeStatus.filter(s => s.complete).length;

    // 2. Identify "Parents" (Silver Trophies)
    const parentNodes = nodes.filter(n => n.behavior === 'container');
    const silverTrophies = parentNodes.filter(parent => {
        // A parent is complete if ALL nodes that require it are complete
        const dependants = nodes.filter(n => n.requires && n.requires.includes(parent.id));
        if (dependants.length === 0) return false; // Orphan container

        return dependants.every(dep => {
            if (dep.behavior === 'quiz_list') {
                return childNodeStatus.find(s => s.id === dep.id)?.complete;
            }
            // If it requires another container, we'd need recursion, 
            // but typically containers depend on quiz_lists or other containers in a sequence.
            // For now, let's check if all its direct children nodes are done.
            return true; // Simplified for depth 1
        });
    }).length;

    // 3. Silver Medals (Total Map Quizzes Completed)
    // Collect all unique quiz IDs that are actually in any map node
    const allMapQuizIds = new Set<number>();
    const completedMapQuizIds = new Set<number>();

    childNodeStatus.forEach(status => {
        status.quizzes.forEach(q => {
            allMapQuizIds.add(q.id);
            if (userProgressMap.get(q.id) === 'completed') {
                completedMapQuizIds.add(q.id);
            }
        });
    });

    const totalQuizzes = allMapQuizIds.size;
    const completedQuizzes = completedMapQuizIds.size;
    const progress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;

    // 4. Gold Trophy
    const isMapComplete = parentNodes.length > 0 && parentNodes.every(p => {
        const deps = nodes.filter(n => n.requires && n.requires.includes(p.id));
        return deps.length > 0 && deps.every(d => {
            if (d.behavior === 'quiz_list') return childNodeStatus.find(s => s.id === d.id)?.complete;
            return true;
        });
    });

    return {
        silverMedals: completedQuizzes,
        goldMedals,
        silverTrophies,
        goldTrophies: isMapComplete ? 1 : 0,
        progress,
        totalQuizzes,
        completedQuizzes
    };
}
