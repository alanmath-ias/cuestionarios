
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq, count } from "drizzle-orm";

async function checkCount() {
    console.log("Checking question count for Quiz 278 (Arithmetic)...");

    try {
        const result = await db.select({ count: count() })
            .from(questions)
            .where(eq(questions.quizId, 278));

        console.log(`Total questions for Quiz 278: ${result[0].count}`);
    } catch (error) {
        console.error("Error checking count:", error);
    }
}

checkCount();
