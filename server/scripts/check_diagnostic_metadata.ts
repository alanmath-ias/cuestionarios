
import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function main() {
    try {
        const quizzes = await db.execute(sql`
            SELECT q.id, q.title, q.category_id, c.name as category_name, q.subcategory_id, s.name as subcategory_name
            FROM quizzes q
            LEFT JOIN categories c ON q.category_id = c.id
            LEFT JOIN subcategories s ON q.subcategory_id = s.id
            WHERE q.id IN (278, 279, 280)
        `);
        console.log("Diagnostic Quizzes:", quizzes);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
