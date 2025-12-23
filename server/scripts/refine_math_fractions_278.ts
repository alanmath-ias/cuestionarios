import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Load .env manually
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

async function main() {
    try {
        const { db } = await import("../db.js");
        const { questions, answers } = await import("../../shared/schema.js");
        const { eq } = await import("drizzle-orm");

        const quizId = 278;

        // Fix Fractions in Answers
        const quizAnswers = await db.select({
            id: answers.id,
            content: answers.content
        })
            .from(answers)
            .innerJoin(questions, eq(answers.questionId, questions.id))
            .where(eq(questions.quizId, quizId));

        for (const a of quizAnswers) {
            let newContent = a.content;
            let updated = false;

            // Enclose bare fractions if not already enclosed
            // Regex for simple fractions like 1/6, 3/4, etc.
            if (/^\d+\/\d+$/.test(newContent) && !newContent.includes('¡')) {
                newContent = `¡${newContent}¡`;
                updated = true;
            }

            if (updated) {
                await db.update(answers)
                    .set({ content: newContent })
                    .where(eq(answers.id, a.id));
                console.log(`Fixed Fraction Answer ${a.id}: "${a.content}" -> "${newContent}"`);
            }
        }

        console.log("Fraction refinement completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error refining fractions:", error);
        process.exit(1);
    }
}

main();
