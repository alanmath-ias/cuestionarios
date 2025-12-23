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
        const { quizzes, questions, answers } = await import("../../shared/schema.js");
        const { eq, sql } = await import("drizzle-orm");

        const quizId = 278;

        // 1. Fix Time Limit (20 minutes -> 1200 seconds)
        await db.update(quizzes)
            .set({ timeLimit: 1200 })
            .where(eq(quizzes.id, quizId));
        console.log("Updated Quiz time limit to 1200 seconds.");

        // 2. Fix Math Delimiters in Questions ($ -> ¡)
        const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, quizId));

        for (const q of quizQuestions) {
            let newContent = q.content.replace(/\$/g, "¡");
            if (newContent !== q.content) {
                await db.update(questions)
                    .set({ content: newContent })
                    .where(eq(questions.id, q.id));
                console.log(`Updated Question ${q.id} content.`);
            }

            // Fix Answers for this question
            const qAnswers = await db.select().from(answers).where(eq(answers.questionId, q.id));
            for (const a of qAnswers) {
                let updated = false;
                let newAnswerContent = a.content;
                let newExplanation = a.explanation;

                if (a.content.includes("$")) {
                    newAnswerContent = a.content.replace(/\$/g, "¡");
                    updated = true;
                }
                if (a.explanation && a.explanation.includes("$")) {
                    newExplanation = a.explanation.replace(/\$/g, "¡");
                    updated = true;
                }

                if (updated) {
                    await db.update(answers)
                        .set({
                            content: newAnswerContent,
                            explanation: newExplanation
                        })
                        .where(eq(answers.id, a.id));
                    console.log(`Updated Answer ${a.id}.`);
                }
            }
        }

        console.log("Fixes completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing arithmetic test:", error);
        process.exit(1);
    }
}

main();
