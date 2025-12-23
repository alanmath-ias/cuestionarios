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
        const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, quizId));

        console.log(`\n--- Questions for Quiz ${quizId} ---\n`);
        for (const q of quizQuestions) {
            console.log(`Q[${q.id}]: ${q.content}`);
            const qAnswers = await db.select().from(answers).where(eq(answers.questionId, q.id));
            for (const a of qAnswers) {
                console.log(`  A[${a.id}] (${a.isCorrect ? 'Correct' : 'Wrong'}): ${a.content}`);
                if (a.explanation) {
                    console.log(`    Expl: ${a.explanation}`);
                }
            }
            console.log("");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error inspecting quiz:", error);
        process.exit(1);
    }
}

main();
