
import { db } from "./server/db";
import { questions, answers } from "./shared/schema";
import { eq } from "drizzle-orm";

async function fetchQuiz49() {
    try {
        const quizQuestions = await db.query.questions.findMany({
            where: eq(questions.quizId, 49),
            with: {
                answers: true
            }
        });

        quizQuestions.forEach(q => {
            console.log(`Q[${q.id}]: ${q.content}`);
            q.answers.forEach(a => {
                console.log(`  A[${a.id}]: ${a.content}`);
            });
            console.log('---');
        });
    } catch (error) {
        console.error("Error fetching quiz:", error);
    }
    process.exit(0);
}

fetchQuiz49();
