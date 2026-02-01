
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq } from "drizzle-orm";
// Assume local import works via tsx
import { calculusMapNodes } from "../client/src/data/calculus-map-data";

async function main() {
    console.log("🔍 Starting Calculus Map Coverage Audit...");

    // 1. Fetch Calculus Category Quizzes (Category 4)
    const calculusSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 4));
    const subIds = calculusSubs.map(s => s.id);
    const allQuizzes = await db.select().from(quizzes);
    const calculusQuizzes = allQuizzes.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`📚 Found ${calculusQuizzes.length} total Calculus quizzes in DB.`);
    console.log(`🧩 Found ${calculusMapNodes.length} nodes in Calculus Map.\n`);

    const orphans: any[] = [];
    const coveredQuizzes = new Set<number>();
    const nodesWithContent: Record<string, number> = {};

    // 2. Simulation Logic
    for (const quiz of calculusQuizzes) {
        if (!quiz.subcategoryId) continue;

        let matchedNode = null;

        // Iterate all nodes to find match
        for (const node of calculusMapNodes) {
            if (!node.subcategoryId) continue;

            // 1. Subcategory Match
            if (node.subcategoryId === quiz.subcategoryId) {
                // 2. Keyword Match (if keywords exist)
                if (node.filterKeywords && node.filterKeywords.length > 0) {
                    const keywords = node.filterKeywords.map(k => k.toLowerCase());
                    const titleLower = quiz.title.toLowerCase();

                    const hasMatch = keywords.some(k => titleLower.includes(k));
                    if (hasMatch) {
                        matchedNode = node;
                        break;
                    }
                } else {
                    // No keywords = Catch-all
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
    console.log(`Mapped Quizzes: ${coveredQuizzes.size} / ${calculusQuizzes.length}`);
    console.log(`Orphaned Quizzes: ${orphans.length}`);

    if (orphans.length > 0) {
        console.log("\n⚠️ ORPHANED QUIZZES (Not displayed in Map):");
        orphans.forEach(q => {
            const subName = calculusSubs.find(s => s.id === q.subcategoryId)?.name;
            console.log(`[Q:${q.id}] "${q.title}" (Sub: ${q.subcategoryId} - ${subName})`);
        });
    } else {
        console.log("\n🎉 ALL CALCULUS QUIZZES ARE MAPPED!");
    }

    console.log("\n📊 NODE DISTRIBUTION (Top 5):");
    Object.entries(nodesWithContent)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([nodeId, count]) => {
            console.log(`Node ${nodeId}: ${count} quizzes`);
        });

    process.exit(0);
}

main().catch(console.error);
