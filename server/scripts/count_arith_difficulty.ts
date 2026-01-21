
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq, and, count } from "drizzle-orm";

async function countDifficulty() {
    console.log("Counting questions by difficulty for Quiz 278 (Arithmetic)...");

    try {
        const diff1 = await db.select({ count: count() })
            .from(questions)
            .where(and(eq(questions.quizId, 278), eq(questions.difficulty, 1)));

        const diff2 = await db.select({ count: count() })
            .from(questions)
            .where(and(eq(questions.quizId, 278), eq(questions.difficulty, 2)));

        const diff3 = await db.select({ count: count() })
            .from(questions)
            .where(and(eq(questions.quizId, 278), eq(questions.difficulty, 3)));

        console.log(`Difficulty 1 (Easy): ${diff1[0].count}`);
        console.log(`Difficulty 2 (Medium): ${diff2[0].count}`);
        console.log(`Difficulty 3 (Hard): ${diff3[0].count}`);
    } catch (error) {
        console.error("Error counting difficulty:", error);
    }
}

countDifficulty();
