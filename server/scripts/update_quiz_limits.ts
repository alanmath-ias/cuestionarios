
import 'dotenv/config';
import { db } from "../db.js";
import { quizzes } from "../schema.js";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🚀 Updating Quiz Limits...");

    try {
        // 1. Update Statistics (ID 285)
        // Ensure it shows 15 questions (it has 15 total, so it will show all)
        // Time: 25 mins (1500s) is already set, but let's confirm.
        await db.update(quizzes)
            .set({
                totalQuestions: 15,
                timeLimit: 1500 // 25 mins
            })
            .where(eq(quizzes.id, 285));
        console.log("✅ Updated Statistics (285): 15 questions, 25 mins.");

        // 2. Update Mechanical Physics (ID 286)
        // It has 35 questions in DB. We want to show 15 to the user.
        // Time: Reduce from 40 mins to 25 mins (1500s) for 15 questions.
        await db.update(quizzes)
            .set({
                totalQuestions: 15, // This triggers the 5/5/5 distribution logic
                timeLimit: 1500 // 25 mins
            })
            .where(eq(quizzes.id, 286));
        console.log("✅ Updated Mechanical Physics (286): 15 questions (from pool of 35), 25 mins.");

    } catch (error) {
        console.error("❌ Error updating quizzes:", error);
    }
}

main();
