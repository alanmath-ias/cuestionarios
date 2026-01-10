
import 'dotenv/config'; // Load env vars
import { db } from "../server/db";
import { questions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function checkQuizQuestions() {
    try {
        console.log("Checking questions for quiz 278...");
        console.log("Database URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");

        const result = await db.select().from(questions).where(eq(questions.quizId, 278));
        console.log(`Found ${result.length} questions for quiz 278.`);

        if (result.length > 0) {
            console.log("First question sample:", result[0]);
        } else {
            console.log("No questions found. This explains why the quiz is empty.");
        }
    } catch (error) {
        console.error("Error checking database:", error);
    }
    process.exit(0);
}

checkQuizQuestions();
