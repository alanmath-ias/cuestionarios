
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function fixAlgebraQuizCategory() {
    console.log("Starting Algebra Quiz Category Fix...");

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
        console.log(`Current Category: ${quiz.categoryId}, Subcategory: ${quiz.subcategoryId}`);

        await db.update(quizzes)
            .set({
                categoryId: 21,
                subcategoryId: 250
            })
            .where(eq(quizzes.id, quiz.id));

        console.log("Quiz updated successfully.");
        console.log("New Category: 21, New Subcategory: 250");

    } catch (error) {
        console.error("Error updating Algebra Quiz:", error);
    }
}

fixAlgebraQuizCategory();
