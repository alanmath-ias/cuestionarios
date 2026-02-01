
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
    console.log("Fetching Algebra Content...");

    // 1. Get Algebra Subcategories (Category ID 2)
    const algebraSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 2));
    const subIds = algebraSubs.map(s => s.id);
    console.log(`Found ${algebraSubs.length} subcategories: [${subIds.join(', ')}]`);

    // 2. Get ALL quizzes and filter manually (safest way to catch mismatched categoryIds)
    const allQuizzes = await db.select().from(quizzes);
    const algebraQuizzes = allQuizzes.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`Found ${algebraQuizzes.length} quizzes belonging to Algebra subcategories.`);

    console.log("\n--- QUIZZES BY SUBCATEGORY ---");

    for (const sub of algebraSubs) {
        const subQuizzes = algebraQuizzes.filter(q => q.subcategoryId === sub.id);
        console.log(`\n[${sub.id}] ${sub.name.toUpperCase()} (${subQuizzes.length} quizzes)`);
        if (subQuizzes.length === 0) console.log("  (⚠️ NO QUIZZES FOUND)");

        subQuizzes.forEach(q => {
            console.log(`  - [Q:${q.id}] "${q.title}"`);
        });
    }

    process.exit(0);
}

main().catch(console.error);
