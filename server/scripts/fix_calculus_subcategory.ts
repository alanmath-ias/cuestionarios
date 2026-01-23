
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

        // 1. Ensure Subcategory 252 exists
        const categoryId = 21;
        const subcategoryId = 252;
        const subcategoryName = "Cálculo";

        const existingSub = await db.execute(sql`SELECT id FROM subcategories WHERE id = ${subcategoryId}`);
        if (existingSub.length > 0) {
            console.log(`Subcategory ${subcategoryId} exists. Updating name/category if needed...`);
            await db.execute(sql`
                UPDATE subcategories 
                SET name = ${subcategoryName}, category_id = ${categoryId}
                WHERE id = ${subcategoryId}
            `);
        } else {
            console.log(`Creating Subcategory ${subcategoryId}...`);
            await db.execute(sql`INSERT INTO subcategories (id, name, category_id) VALUES (${subcategoryId}, ${subcategoryName}, ${categoryId})`);
        }

        // 2. Update/Create Quiz 281
        const quizId = 281;
        const quizTitle = "Diagnóstico de Cálculo";
        const quizDesc = "Evalúa tus conocimientos en cálculo diferencial e integral. Periodo I.";

        const existingQuiz = await db.execute(sql`SELECT id FROM quizzes WHERE id = ${quizId}`);
        if (existingQuiz.length > 0) {
            console.log(`Quiz ${quizId} exists. Updating subcategory...`);
            await db.execute(sql`
                UPDATE quizzes 
                SET subcategory_id = ${subcategoryId}, category_id = ${categoryId}
                WHERE id = ${quizId}
            `);
        } else {
            await db.execute(sql`
                INSERT INTO quizzes (id, title, description, category_id, subcategory_id, difficulty, time_limit, total_questions)
                VALUES (${quizId}, ${quizTitle}, ${quizDesc}, ${categoryId}, ${subcategoryId}, 'intermediate', 20, 10)
            `);
            console.log(`Created Quiz ${quizId}`);
        }

        // 3. Questions (Already inserted, but good to have the list for reference or re-run if needed)
        // We will skip re-inserting questions to avoid duplicates or deletion of valid data if this is just a metadata fix.
        // But if the user wants to ensure the content is there, we can leave the question logic commented out or check counts.

        console.log("Updated Quiz 281 to use Subcategory 252 and Category 21.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
