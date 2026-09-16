/**
 * quiz-node-lookup.ts
 * Builds a lookup map: subcategoryId → { topic, unit }
 * using all curriculum map data files (arithmetic, algebra, calculus, integral, statistics).
 *
 * - "topic" = the label of the quiz_list node that owns this subcategoryId
 * - "unit"  = the label of the nearest container-type ancestor in the requires chain
 */

import { arithmeticMapNodes } from '@/data/arithmetic-map-data';
import { algebraMapNodes } from '@/data/algebra-map-data';
import { calculusMapNodes } from '@/data/calculus-map-data';
import { integralCalculusMapNodes } from '@/data/integral-calculus-map-data';
import { statisticsMapNodes } from '@/data/statistics-map-data';
import type { ArithmeticNode } from '@/data/arithmetic-map-data';

export interface NodeMeta {
    topic: string;
    unit: string;
    subject: string;
}

function buildLookup(nodes: ArithmeticNode[], subject: string): Map<number, NodeMeta> {
    const lookup = new Map<number, NodeMeta>();

    // Index all nodes by id for quick parent lookup
    const byId = new Map<string, ArithmeticNode>();
    for (const node of nodes) {
        byId.set(node.id, node);
    }

    // Find the nearest container ancestor of a node
    function findUnit(node: ArithmeticNode, visited = new Set<string>()): string {
        if (visited.has(node.id)) return '';
        visited.add(node.id);
        for (const parentId of node.requires) {
            const parent = byId.get(parentId);
            if (!parent) continue;
            if (parent.behavior === 'container') return parent.label;
            const ancestor = findUnit(parent, visited);
            if (ancestor) return ancestor;
        }
        return '';
    }

    for (const node of nodes) {
        if (node.behavior !== 'quiz_list') continue;

        const subcatIds: number[] = [];
        if (node.subcategoryId) subcatIds.push(node.subcategoryId);
        if (node.additionalSubcategories) subcatIds.push(...node.additionalSubcategories);

        const unit = findUnit(node);

        for (const id of subcatIds) {
            if (!lookup.has(id)) {
                lookup.set(id, { topic: node.label, unit, subject });
            }
        }
    }

    return lookup;
}

// Combine all subjects into one unified lookup
const allLookups = [
    buildLookup(arithmeticMapNodes, 'Aritmética'),
    buildLookup(algebraMapNodes, 'Álgebra'),
    buildLookup(calculusMapNodes, 'Cálculo Diferencial'),
    buildLookup(integralCalculusMapNodes, 'Cálculo Integral'),
    buildLookup(statisticsMapNodes, 'Estadística'),
];

export const subcategoryNodeMap = new Map<number, NodeMeta>();
for (const lk of allLookups) {
    lk.forEach((meta, id) => {
        if (!subcategoryNodeMap.has(id)) {
            subcategoryNodeMap.set(id, meta);
        }
    });
}

/** Returns { topic, unit, subject } for a given subcategoryId, or null if not found. */
export function getNodeMeta(subcategoryId?: number | null): NodeMeta | null {
    if (!subcategoryId) return null;
    return subcategoryNodeMap.get(subcategoryId) ?? null;
}

/**
 * Returns tailored Tailwind text color for each subject matching the roadmap theme.
 */
export function getSubjectColor(subject?: string | null): string {
    if (!subject) return 'text-sky-400';
    const s = subject.toLowerCase();
    if (s.includes('aritmética') || s.includes('aritmetica')) return 'text-sky-400';
    if (s.includes('álgebra') || s.includes('algebra')) return 'text-purple-400';
    if (s.includes('trigonometría') || s.includes('trigonometria')) return 'text-indigo-400';
    if (s.includes('diferencial')) return 'text-pink-400';
    if (s.includes('integral')) return 'text-teal-400';
    if (s.includes('estadística') || s.includes('estadistica')) return 'text-cyan-400';
    if (s.includes('física') || s.includes('fisica')) return 'text-orange-400';
    if (s.includes('cálculo') || s.includes('calculo')) return 'text-emerald-400';
    return 'text-blue-400';
}
