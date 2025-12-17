
import { db } from "./server/db";
import { quizzes, questions } from "./shared/schema";
import { eq, count } from "drizzle-orm";

async function main() {
    const allQuizzes = await db.select().from(quizzes);

    console.log(`Total Quizzes: ${allQuizzes.length}`);

    for (const quiz of allQuizzes) {
        const questionCount = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.quizId, quiz.id));

        console.log(`Quiz ID: ${quiz.id}, Title: "${quiz.title}", Questions: ${questionCount[0].count}`);
    }

    process.exit(0);
}

main().catch(console.error);
