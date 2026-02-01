
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq } from "drizzle-orm";
// Assume local import works via tsx
import { algebraMapNodes } from "../client/src/data/algebra-map-data";

async function main() {
    console.log("🔍 Starting Algebra Map Coverage Audit...");

    // 1. Fetch Algebra Category Quizzes
    // We use the same logic as previous script to get ALL Algebra-related quizzes
    const algebraSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 2));
    const subIds = algebraSubs.map(s => s.id);
    const allQuizzes = await db.select().from(quizzes);
    const algebraQuizzes = allQuizzes.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`📚 Found ${algebraQuizzes.length} total Algebra quizzes in DB.`);
    console.log(`🧩 Found ${algebraMapNodes.length} nodes in Algebra Map.\n`);

    const orphans: any[] = [];
    const coveredQuizzes = new Set<number>();
    const nodesWithContent: Record<string, number> = {};

    // 2. Simulation Logic
    // For each quiz, try to find a home in the map nodes
    for (const quiz of algebraQuizzes) {
        if (!quiz.subcategoryId) continue;

        let matchedNode = null;

        // Iterate all nodes to find match
        for (const node of algebraMapNodes) {
            if (!node.subcategoryId) continue; // Node must map to data

            // 1. Subcategory Match
            if (node.subcategoryId === quiz.subcategoryId) {
                // 2. Keyword Match (if keywords exist)
                if (node.filterKeywords && node.filterKeywords.length > 0) {
                    const keywords = node.filterKeywords.map(k => k.toLowerCase());
                    const titleLower = quiz.title.toLowerCase();

                    const hasMatch = keywords.some(k => titleLower.includes(k));
                    if (hasMatch) {
                        matchedNode = node;
                        break; // Found a home (first match wins logic)
                    }
                } else {
                    // No keywords = Catch-all for that subcategory
                    matchedNode = node;
                    break;
                }
            }
        }

        if (matchedNode) {
            coveredQuizzes.add(quiz.id);
            nodesWithContent[matchedNode.id] = (nodesWithContent[matchedNode.id] || 0) + 1;
        } else {
            orphans.push(quiz);
        }
    }

    // 3. Report
    console.log("✅ COVERAGE REPORT:");
    console.log(`Mapped Quizzes: ${coveredQuizzes.size} / ${algebraQuizzes.length}`);
    console.log(`Orphaned Quizzes: ${orphans.length}`);

    if (orphans.length > 0) {
        console.log("\n⚠️ ORPHANED QUIZZES (Not displayed in Map):");
        orphans.forEach(q => {
            const subName = algebraSubs.find(s => s.id === q.subcategoryId)?.name;
            console.log(`[Q:${q.id}] "${q.title}" (Sub: ${q.subcategoryId} - ${subName})`);
        });
    } else {
        console.log("\n🎉 ALL QUIZZES ARE MAPPED!");
    }

    console.log("\n📊 NODE DISTRIBUTION:");
    Object.keys(nodesWithContent).forEach(nodeId => {
        console.log(`Node ${nodeId}: ${nodesWithContent[nodeId]} quizzes`);
    });

    process.exit(0);
}

main().catch(console.error);
