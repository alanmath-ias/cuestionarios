
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq, inArray } from "drizzle-orm";

async function checkDelimiters() {
    console.log("Checking delimiters for Algebra (279) and Trigonometry (280)...");

    try {
        const qs = await db.select().from(questions).where(inArray(questions.quizId, [279, 280]));

        let missingDelimiters = 0;
        let totalChecked = 0;

        qs.forEach(q => {
            totalChecked++;
            // Check if content contains math-like symbols but no delimiters (¡ or $)
            // This is a heuristic.
            const hasMath = /[=\+\-\^\\_]/.test(q.content);
            const hasDelimiters = /¡|\$/.test(q.content);

            if (hasMath && !hasDelimiters) {
                console.log(`[WARNING] Quiz ${q.quizId} Question ${q.id} might be missing delimiters:`);
                console.log(`Content: ${q.content}`);
                missingDelimiters++;
            }
        });

        console.log(`\nChecked ${totalChecked} questions.`);
        console.log(`Found ${missingDelimiters} potential issues.`);

    } catch (error) {
        console.error("Error checking delimiters:", error);
    }
}

checkDelimiters();
