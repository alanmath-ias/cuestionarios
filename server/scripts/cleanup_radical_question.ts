
import "dotenv/config";
import { db } from "../db.js";
import { questions, answers, quizzes } from "../../shared/schema.js";
import { eq, like, and } from "drizzle-orm";

async function cleanupRadicalQuestion() {
    console.log("Cleaning up Radical Question...");

    try {
        const title = "Diagnóstico de Álgebra";
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.title, title)
        });

        if (!quiz) {
            console.error("Quiz not found!");
            return;
        }

        const quizId = quiz.id;

        // Find by broader match
        const q = await db.query.questions.findFirst({
            where: (questions, { and, eq, like }) => and(
                eq(questions.quizId, quizId),
                like(questions.content, "%radical%50%")
            )
        });

        if (q) {
            console.log(`Deleting question: ${q.content}`);
            await db.delete(answers).where(eq(answers.questionId, q.id));
            await db.delete(questions).where(eq(questions.id, q.id));
            console.log("Deleted successfully.");
        } else {
            console.log("Radical question not found.");
        }

    } catch (error) {
        console.error("Error cleaning up:", error);
    }
}

cleanupRadicalQuestion();
