
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function listAlgebraQuestions() {
    console.log("Listing first 5 Algebra questions for inspection...");
    const qs = await db.select().from(questions).where(eq(questions.quizId, 279)).limit(5);
    qs.forEach(q => {
        console.log(`[${q.id}] ${q.content}`);
    });
}

listAlgebraQuestions();
