
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";

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
        const quizId = 281;

        // 1. Check Quiz Metadata
        const quiz = await db.execute(sql`SELECT * FROM quizzes WHERE id = ${quizId}`);
        console.log("Quiz Metadata:", quiz);

        // 2. Check Question Count
        const questions = await db.execute(sql`SELECT id, content FROM questions WHERE quiz_id = ${quizId} ORDER BY id`);
        console.log(`Total Questions: ${questions.length}`);

        // 3. Check Answers for the first few questions
        if (questions.length > 0) {
            for (let i = 0; i < Math.min(3, questions.length); i++) {
                const q = questions[i] as any;
                const qId = q.id;
                const answers = await db.execute(sql`SELECT id, content, is_correct FROM answers WHERE question_id = ${qId}`);
                console.log(`Question ${qId} ("${q.content.substring(0, 20)}...") has ${answers.length} answers.`);
                console.log(answers);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
