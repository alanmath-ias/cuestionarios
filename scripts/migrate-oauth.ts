import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Running migration...");
    try {
        await db.execute(sql`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);
        console.log("Made password optional.");
    } catch (e) {
        console.log("Error making password optional (might already be):", e);
    }

    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`);
        console.log("Added google_id column.");
    } catch (e) {
        console.log("Error adding google_id:", e);
    }

    console.log("Migration complete");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
