
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function checkMetadata() {
    console.log("Checking metadata for Quiz 278...");

    try {
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, 278)
        });

        console.log("Quiz Metadata:", quiz);
    } catch (error) {
        console.error("Error checking metadata:", error);
    }
}

checkMetadata();
