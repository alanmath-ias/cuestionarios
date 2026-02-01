
import "dotenv/config";
import { db } from "../server/db";
import { quizzes, subcategories } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Fetching Calculus Content (Category ID 4)...");

    // 1. Get Calculus Subcategories
    const calculusSubs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 4));
    const subIds = calculusSubs.map(s => s.id);
    console.log(`Found ${calculusSubs.length} subcategories: [${subIds.join(', ')}]`);

    // 2. Get Quizzes
    const allQuizzes = await db.select().from(quizzes);
    const calculusQuizzes = allQuizzes.filter(q => q.subcategoryId && subIds.includes(q.subcategoryId));

    console.log(`Found ${calculusQuizzes.length} total Calculus quizzes.`);

    console.log("\n--- QUIZZES BY SUBCATEGORY ---");

    for (const sub of calculusSubs) {
        const subQuizzes = calculusQuizzes.filter(q => q.subcategoryId === sub.id);
        console.log(`\n[${sub.id}] ${sub.name.toUpperCase()} (${subQuizzes.length} quizzes)`);

        subQuizzes.forEach(q => {
            console.log(`  - [Q:${q.id}] "${q.title}"`);
        });
    }

    process.exit(0);
}

main().catch(console.error);
