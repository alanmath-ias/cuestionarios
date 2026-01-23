
import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function main() {
    try {
        const categories = await db.execute(sql`SELECT * FROM categories ORDER BY id`);
        console.log("Categories:", categories);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
