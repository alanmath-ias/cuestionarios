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

        // 1. Fix Unclosed Delimiters in Answers
        const quizAnswers = await db.select({
            id: answers.id,
            content: answers.content,
            explanation: answers.explanation
        })
            .from(answers)
            .innerJoin(questions, eq(answers.questionId, questions.id))
            .where(eq(questions.quizId, quizId));

        for (const a of quizAnswers) {
            let newContent = a.content;
            let updated = false;

            // Fix unclosed starting delimiter
            if (newContent.startsWith('¡') && !newContent.endsWith('¡')) {
                newContent += '¡';
                updated = true;
            }

            // Enclose bare numbers/percentages if not already enclosed
            // Simple check: if it looks like a number/percent and has no delimiters
            if (/^-?\d+(\.\d+)?%?$/.test(newContent) && !newContent.includes('¡')) {
                newContent = `¡${newContent}¡`;
                updated = true;
            }

            if (updated) {
                await db.update(answers)
                    .set({ content: newContent })
                    .where(eq(answers.id, a.id));
                console.log(`Fixed Answer ${a.id}: "${a.content}" -> "${newContent}"`);
            }
        }

        // 2. Specific Question Fixes
        const specificFixes = [
            {
                id: 3730,
                content: "Un artículo cuesta ¡80¡ y tiene un descuento del ¡25%¡. ¿Cuál es el precio final?"
            },
            {
                id: 3731,
                content: "Si ¡4¡ cuadernos cuestan ¡12¡, ¿cuánto cuestan ¡10¡ cuadernos?"
            },
            {
                id: 3735,
                content: "Si un artículo cuesta ¡80¡ y tiene un descuento del ¡25%¡, ¿cuál es su precio final?"
            },
            {
                id: 3737,
                content: "Si ¡5¡ cuadernos cuestan ¡15¡, ¿cuánto cuestan ¡8¡ cuadernos?"
            },
            {
                id: 3748,
                content: "Un artículo de ¡100¡ tiene dos descuentos sucesivos del ¡10%¡ y ¡10%¡. ¿Precio final?"
            }
        ];

        for (const fix of specificFixes) {
            await db.update(questions)
                .set({ content: fix.content })
                .where(eq(questions.id, fix.id));
            console.log(`Fixed Question ${fix.id}`);
        }

        console.log("Refinement completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error refining math delimiters:", error);
        process.exit(1);
    }
}

main();
