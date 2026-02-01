
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq } from "drizzle-orm";
import { algebraMapNodes } from "../client/src/data/algebra-map-data";

// MOCK Frontend Logic from quiz-list.tsx
function getFilteredQuizzesForNode(node: any, allQuizzes: any[]) {
    let contextQuizzes = allQuizzes.filter(q => q.subcategoryId === node.subcategoryId);

    if (node.filterKeywords && node.filterKeywords.length > 0) {
        const keywords = node.filterKeywords.map((k: string) => k.toLowerCase());
        contextQuizzes = contextQuizzes.filter(q =>
            keywords.some((k: string) => q.title.toLowerCase().includes(k))
        );
    }
    return contextQuizzes;
}

async function main() {
    console.log("🐞 Debugging Frontend Logic for Cramer & Gráfico...");

    // 1. Fetch Data
    const algebraSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 2));
    const subIds = algebraSubs.map(s => s.id);
    const allQuizzesDB = await db.select().from(quizzes);
    const algebraQuizzes = allQuizzesDB.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`Loaded ${algebraQuizzes.length} Algebra quizzes.`);

    // 2. Debug Specific Nodes
    const targets = ['a10-3-grafico', 'a10-4-cramer', 'a10-sistemas'];

    for (const targetId of targets) {
        const node = algebraMapNodes.find(n => n.id === targetId);
        if (!node) {
            console.error(`❌ Node ${targetId} not found in map data.`);
            continue;
        }

        console.log(`\n--- Node: ${node.label} (${node.id}) ---`);
        console.log(`Subcategory: ${node.subcategoryId}`);
        console.log(`Keywords: ${JSON.stringify(node.filterKeywords)}`);
        console.log(`Requires: ${JSON.stringify(node.requires)}`);

        const matchingQuizzes = getFilteredQuizzesForNode(node, algebraQuizzes);
        console.log(`Frontend Filter Matches: ${matchingQuizzes.length}`);

        matchingQuizzes.forEach(q => {
            console.log(`  MATCH: [${q.id}] "${q.title}" (Sub: ${q.subcategoryId})`);
        });

        if (matchingQuizzes.length === 0) {
            console.log("  ⚠️ NO MATCHES found with frontend logic!");
            // Check strict subcategory matches without keywords to see if keywords are the problem
            const strictSubMatches = algebraQuizzes.filter(q => q.subcategoryId === node.subcategoryId);
            console.log(`  (Subcategory matches ignoring keywords: ${strictSubMatches.length})`);
            strictSubMatches.forEach(q => console.log(`   - Candidate: "${q.title}"`));
        }
    }
    process.exit(0);
}

main().catch(console.error);
