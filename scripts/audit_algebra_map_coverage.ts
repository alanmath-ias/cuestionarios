
import { algebraMapNodes } from '../client/src/data/algebra-map-data';

// Mock types matching the frontend
interface Quiz {
    id: number;
    title: string;
    subcategoryId: number | null;
}

async function auditAlgebraMap() {
    const CATEGORY_ID = 2; // Algebra
    const API_URL = 'http://127.0.0.1:5000/api/categories/2/quizzes'; // Use IP to avoid resolution issues

    console.log(`Fetching quizzes for Category ${CATEGORY_ID}...`);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
        }

        const quizzes: Quiz[] = await response.json();
        console.log(`Total Algebra Quizzes Found in DB: ${quizzes.length}`);

        const mappedQuizIds = new Set<number>();
        const nodeCoverage: Record<string, number> = {};

        // initialize node counts
        algebraMapNodes.forEach(node => {
            nodeCoverage[node.id] = 0;
        });

        // Check mapping logic
        quizzes.forEach(quiz => {
            let isMapped = false;

            // Strict mapping logic from quiz-list.tsx
            algebraMapNodes.forEach(node => {
                // Logic: Must match subcategory (if node has one) AND keywords (if node has them)
                // If node has NO subcategory, it's strictly keyword based? 
                // Wait, quiz-list logic:
                // let contextQuizzes = quizzes?.filter(q => q.subcategoryId === node.subcategoryId) || [];
                // ... filter by keywords ...

                // If node has no subcategory, existing logic returns empty array! 
                // "if (!node.subcategoryId) return [];"

                if (node.subcategoryId) {
                    if (quiz.subcategoryId === node.subcategoryId) {
                        // Subcategory matches. Check keywords.
                        let matchesKeywords = true;
                        if (node.filterKeywords && node.filterKeywords.length > 0) {
                            const keywords = node.filterKeywords.map(k => k.toLowerCase());
                            matchesKeywords = keywords.some(k => quiz.title.toLowerCase().includes(k));
                        }

                        if (matchesKeywords) {
                            mappedQuizIds.add(quiz.id);
                            nodeCoverage[node.id]++;
                            isMapped = true;
                            // console.log(`  -> Mapped to ${node.id} (${node.label})`);
                        }
                    }
                }
            });

            if (!isMapped) {
                console.warn(`[ORPHAN] Quiz ID ${quiz.id}: "${quiz.title}" (Subcat: ${quiz.subcategoryId})`);
            }
        });

        console.log("\n--- Node Coverage ---");
        Object.entries(nodeCoverage).forEach(([nodeId, count]) => {
            const node = algebraMapNodes.find(n => n.id === nodeId);
            const label = node?.label || nodeId;
            if (count === 0 && node?.behavior !== 'container') {
                console.error(`[EMPTY NODE] ${label} (${nodeId}) - Subcat: ${node?.subcategoryId}, Keywords: ${node?.filterKeywords?.join(', ')}`);
            } else if (count > 0) {
                console.log(`[OK] ${label} (${nodeId}): ${count} quizzes`);
            }
        });

        console.log(`\nTotal Mapped Quizzes: ${mappedQuizIds.size} / ${quizzes.length}`);

    } catch (error) {
        console.error("Error executing audit:", error);
    }
}

auditAlgebraMap();
