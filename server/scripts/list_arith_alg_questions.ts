
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq, inArray } from "drizzle-orm";

async function listQuestions() {
    console.log("Fetching questions for Quiz 278 (Arithmetic) and 279 (Algebra)...");

    try {
        const qs = await db.select().from(questions).where(inArray(questions.quizId, [278, 279]));

        console.log("\n--- Quiz 278 (Arithmetic) ---");
        qs.filter(q => q.quizId === 278).forEach(q => {
            console.log(`[${q.id}] ${q.content}`);
        });

        console.log("\n--- Quiz 279 (Algebra) ---");
        qs.filter(q => q.quizId === 279).forEach(q => {
            console.log(`[${q.id}] ${q.content}`);
        });

    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

listQuestions();
