
import { calculusMapNodes } from '../client/src/data/calculus-map-data';

// Mock types matching the frontend
interface Quiz {
    id: number;
    title: string;
    subcategoryId: number | null;
}

async function auditCalculusMap() {
    const CATEGORY_ID = 4; // Calculus
    const API_URL = 'http://127.0.0.1:5000/api/categories/4/quizzes'; // Use IP

    console.log(`Fetching quizzes for Category ${CATEGORY_ID}...`);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
        }

        const quizzes: Quiz[] = await response.json();
        console.log(`Total Calculus Quizzes Found in DB: ${quizzes.length}`);

        const mappedQuizIds = new Set<number>();
        const nodeCoverage: Record<string, number> = {};

        // initialize node counts
        calculusMapNodes.forEach(node => {
            nodeCoverage[node.id] = 0;
        });

        // Check mapping logic
        quizzes.forEach(quiz => {
            let isMapped = false;

            // Clean quiz title for easier matching debugging
            const cleanTitle = quiz.title.toLowerCase();

            calculusMapNodes.forEach(node => {
                if (node.subcategoryId) {
                    if (quiz.subcategoryId === node.subcategoryId) {
                        // Subcategory matches. Check keywords.
                        let matchesKeywords = true;

                        // SPECIAL DEBUG: Log logic for Subcategory 111 (Derivatives)
                        // if (quiz.subcategoryId === 111) {
                        //    console.log(`Checking Quiz ${quiz.id} ("${quiz.title}") against Node ${node.id}`);
                        // }

                        if (node.filterKeywords && node.filterKeywords.length > 0) {
                            const keywords = node.filterKeywords.map(k => k.toLowerCase());
                            matchesKeywords = keywords.some(k => cleanTitle.includes(k));
                        }

                        if (matchesKeywords) {
                            // Prevent double counting if multiple nodes match (first match wins in UI usually, 
                            // depending on how I implemented getFilteredQuizzes. 
                            // Actually quiz-list filters *node by node*, so a quiz can appear in multiple nodes if logic overlaps.
                            // But usually we want to see if it appears *at least once*.
                            mappedQuizIds.add(quiz.id);
                            nodeCoverage[node.id]++;
                            isMapped = true;
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
            const node = calculusMapNodes.find(n => n.id === nodeId);
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

auditCalculusMap();
