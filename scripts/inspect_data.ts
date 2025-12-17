
import { db } from "../server/db";
import { quizzes, questions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("--- Inspecting Quizzes ---");
    const allQuizzes = await db.select().from(quizzes);
    allQuizzes.forEach(q => {
        console.log(`Quiz ID: ${q.id}, Title: ${q.title}, TimeLimit: ${q.timeLimit}`);
    });

    console.log("\n--- Inspecting Questions (First 5) ---");
    const allQuestions = await db.select().from(questions).limit(5);
    allQuestions.forEach(q => {
        console.log(`Question ID: ${q.id}, QuizID: ${q.quizId}, Hint1: "${q.hint1}", Hint2: "${q.hint2}", Explanation: "${q.explanation}"`);
    });
}

main().catch(console.error).finally(() => process.exit());
