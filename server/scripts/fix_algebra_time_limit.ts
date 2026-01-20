
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function fixAlgebraTimeLimit() {
    console.log("Starting Algebra Quiz Time Limit Fix...");

    try {
        const title = "Diagnóstico de Álgebra";
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.title, title)
        });

        if (!quiz) {
            console.error("Quiz not found!");
            return;
        }

        console.log(`Updating Quiz ID: ${quiz.id}`);
        console.log(`Current Time Limit: ${quiz.timeLimit} seconds`);

        // Set to 20 minutes = 1200 seconds
        const newTimeLimit = 20 * 60;

        await db.update(quizzes)
            .set({
                timeLimit: newTimeLimit
            })
            .where(eq(quizzes.id, quiz.id));

        console.log(`Quiz updated successfully.`);
        console.log(`New Time Limit: ${newTimeLimit} seconds (20 minutes)`);

    } catch (error) {
        console.error("Error updating Algebra Quiz:", error);
    }
}

fixAlgebraTimeLimit();
