
import "dotenv/config";
import { db } from "../db.js";
import { quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    try {
        const results = await db.select().from(quizzes).where(eq(quizzes.categoryId, 4));
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error executing query:", error);
    } finally {
        process.exit(0);
    }
}

main();
