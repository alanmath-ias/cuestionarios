
import { questions } from "../shared/schema";
import { like } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Load .envproduction explicitly
const envPath = path.resolve(process.cwd(), ".envproduction");
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .envproduction:", result.error);
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .envproduction!");
    process.exit(1);
}

// Initialize DB locally
const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
    console.log("Clearing generic hints from database...");

    // Update hint1
    const result1 = await db.update(questions)
        .set({ hint1: null })
        .where(like(questions.hint1, "%Lee atentamente el enunciado%"))
        .returning({ id: questions.id });

    console.log(`Cleared hint1 for ${result1.length} questions.`);

    // Update explanation
    const result2 = await db.update(questions)
        .set({ explanation: null })
        .where(like(questions.explanation, "%Revisa el procedimiento paso a paso%"))
        .returning({ id: questions.id });

    console.log(`Cleared explanation for ${result2.length} questions.`);

    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
