
import "dotenv/config";
import { db } from "../db.js";
import { quizzes, questions } from "../../shared/schema.js";
import { eq, count } from "drizzle-orm";

async function verifyTrigQuiz() {
    console.log("Verifying Trigonometry Quiz (ID 280)...");

    try {
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, 280)
        });

        if (quiz) {
            console.log(`✅ Quiz found: ${quiz.title}`);
            console.log(`   Subcategory ID: ${quiz.subcategoryId}`);
        } else {
            console.error("❌ Quiz 280 NOT found!");
        }

        const qCount = await db.select({ count: count() })
            .from(questions)
            .where(eq(questions.quizId, 280));

        console.log(`✅ Total Questions: ${qCount[0].count}`);

        if (qCount[0].count === 36) {
            console.log("   (Expected 36 questions - Correct)");
        } else {
            console.warn(`   (Expected 36 questions - Found ${qCount[0].count})`);
        }

    } catch (error) {
        console.error("Error verifying quiz:", error);
    }
}

verifyTrigQuiz();
