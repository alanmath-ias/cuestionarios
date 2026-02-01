
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Fetching Arithmetic Content (Category ID 1)...");

    // 1. Get Arithmetic Subcategories (Category ID 1)
    const arithmeticSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 1));
    const subIds = arithmeticSubs.map(s => s.id);
    console.log(`Found ${arithmeticSubs.length} subcategories: [${subIds.join(', ')}]`);

    // 2. Get ALL quizzes and filter manually to be safe
    const allQuizzes = await db.select().from(quizzes);
    const arithmeticQuizzes = allQuizzes.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`Found ${arithmeticQuizzes.length} quizzes belonging to Arithmetic subcategories.`);

    console.log("\n--- QUIZZES BY SUBCATEGORY ---");

    let totalQuizzes = 0;
    for (const sub of arithmeticSubs) {
        const subQuizzes = arithmeticQuizzes.filter(q => q.subcategoryId === sub.id);
        console.log(`\n[${sub.id}] ${sub.name.toUpperCase()} (${subQuizzes.length} quizzes)`);
        if (subQuizzes.length === 0) console.log("  (⚠️ NO QUIZZES FOUND)");

        subQuizzes.forEach(q => {
            console.log(`  - [Q:${q.id}] "${q.title}"`);
        });
        totalQuizzes += subQuizzes.length;
    }

    console.log(`\nTotal Arithmetic Quizzes Verified: ${totalQuizzes}`);

    process.exit(0);
}

main().catch(console.error);
