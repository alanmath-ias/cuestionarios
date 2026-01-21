
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq, inArray } from "drizzle-orm";

async function ensureConfig() {
    console.log("Checking and updating configuration for Algebra (279) and Trigonometry (280)...");

    const targetQuizzes = [279, 280];

    try {
        // Update totalQuestions to 12 for both quizzes
        await db.update(quizzes)
            .set({ totalQuestions: 12 })
            .where(inArray(quizzes.id, targetQuizzes));

        console.log("✅ Updated totalQuestions to 12 for quizzes:", targetQuizzes);

        // Verify
        const updatedQuizzes = await db.select().from(quizzes).where(inArray(quizzes.id, targetQuizzes));
        updatedQuizzes.forEach(q => {
            console.log(`Quiz [${q.id}] ${q.title}: totalQuestions = ${q.totalQuestions}`);
        });

    } catch (error) {
        console.error("Error updating configuration:", error);
    }
}

ensureConfig();
