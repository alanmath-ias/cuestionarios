import "./env-config.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Adding tourStatus column...");
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tour_status JSONB DEFAULT '{}'`);
        console.log("Migration successful");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
