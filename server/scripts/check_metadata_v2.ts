
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

        console.log("Checking Diagnostic Quizzes (278, 279, 280)...");
        const quizzes = await db.execute(sql`
            SELECT q.id, q.title, q.category_id, c.name as category_name, q.subcategory_id, s.name as subcategory_name
            FROM quizzes q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN subcategories s ON q.subcategory_id = s.id
            WHERE q.id IN (278, 279, 280)
        `);
        console.log("Diagnostic Quizzes:", quizzes);

        console.log("Checking Categories...");
        const categories = await db.execute(sql`SELECT * FROM categories ORDER BY id`);
        console.log("Categories:", categories);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
