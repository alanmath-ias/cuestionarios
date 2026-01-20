
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

async function countDifficulty() {
    console.log("Counting Algebra Quiz Questions (ID 279) by Difficulty...");

    try {
        const quizId = 279;
        const allQuestions = await db.query.questions.findMany({
            where: eq(questions.quizId, quizId)
        });

        const diff1 = allQuestions.filter(q => q.difficulty === 1).length;
        const diff2 = allQuestions.filter(q => q.difficulty === 2).length;
        const diff3 = allQuestions.filter(q => q.difficulty === 3).length;

        console.log(`Total Questions: ${allQuestions.length}`);
        console.log(`Difficulty 1 (Easy): ${diff1}`);
        console.log(`Difficulty 2 (Medium): ${diff2}`);
        console.log(`Difficulty 3 (Hard): ${diff3}`);

        if (diff1 < 4 || diff2 < 4 || diff3 < 4) {
            console.warn("WARNING: One or more difficulties have fewer than 4 questions. Randomization will be limited.");
        } else {
            console.log("Pool sizes look sufficient for 4-4-4 selection.");
        }

    } catch (error) {
        console.error("Error counting questions:", error);
    }
}

countDifficulty();
