
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function updateTotalQuestions() {
    console.log("Updating totalQuestions for Quiz 278 (Arithmetic) to 12...");

    try {
        await db.update(quizzes)
            .set({ totalQuestions: 12 })
            .where(eq(quizzes.id, 278));

        console.log("✅ Updated totalQuestions to 12.");
    } catch (error) {
        console.error("Error updating quiz:", error);
    }
}

updateTotalQuestions();
