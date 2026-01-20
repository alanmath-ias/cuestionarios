
import "dotenv/config";
import { db } from "../db.js";
import { questions, quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function checkAlgebraQuestions() {
    console.log("Checking Algebra Quiz Questions (ID 279)...");

    try {
        const quizId = 279;
        const quizQuestions = await db.query.questions.findMany({
            where: eq(questions.quizId, quizId),
            orderBy: questions.difficulty
        });

        console.log(`Found ${quizQuestions.length} questions for Quiz ID ${quizId}:`);

        quizQuestions.forEach(q => {
            console.log(`[Diff ${q.difficulty}] ${q.content.substring(0, 60)}...`);
        });

    } catch (error) {
        console.error("Error checking questions:", error);
    }
}

checkAlgebraQuestions();
