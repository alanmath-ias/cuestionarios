
import 'dotenv/config';
import { db } from "../db.js";
import { quizzes, subcategories } from "../schema.js";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🚀 Starting Subcategory Fix for Quiz 283...");

    try {
        const targetSubcategoryId = 253;
        const quizId = 283;

        // 1. Verify Subcategory 253 exists
        const subcategory = await db.query.subcategories.findFirst({
            where: eq(subcategories.id, targetSubcategoryId),
        });

        if (!subcategory) {
            console.error(`❌ Subcategory ${targetSubcategoryId} NOT found! Aborting.`);
            // Optional: Create it if it doesn't exist, but user said it does.
            // For now, let's just create it if missing to be safe, or fail.
            // User said "olvidé indicarte que es la subcategoria 253", implying it exists or should be that ID.
            // Let's try to create it with that ID if possible, or just fail.
            // Since ID is serial, we can't easily force it unless we use explicit insert.
            // Let's assume it exists as per user instruction.
            return;
        }

        console.log(`✅ Subcategory ${targetSubcategoryId} found: "${subcategory.name}"`);

        // 2. Update Quiz 283
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, quizId),
        });

        if (!quiz) {
            console.error(`❌ Quiz ${quizId} NOT found!`);
            return;
        }

        console.log(`Found Quiz: "${quiz.title}" (Current Subcategory: ${quiz.subcategoryId})`);

        await db.update(quizzes)
            .set({ subcategoryId: targetSubcategoryId })
            .where(eq(quizzes.id, quizId));

        console.log(`✅ Successfully updated Quiz ${quizId} to Subcategory ${targetSubcategoryId}.`);

    } catch (error) {
        console.error("❌ Error updating quiz:", error);
    }
}

main();
