
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { quizzes, subcategories } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load env vars
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    console.log("Fetching quizzes for Category ID 1 (Aritmética)...");

    const results = await db.select({
        id: quizzes.id,
        title: quizzes.title,
        subcategoryId: quizzes.subcategoryId,
        subcategoryName: subcategories.name
    })
        .from(quizzes)
        .leftJoin(subcategories, eq(quizzes.subcategoryId, subcategories.id))
        .where(eq(quizzes.categoryId, 1));

    console.log("\nFound Quizzes:");
    results.forEach(q => {
        console.log(`[Sub: ${q.subcategoryName} (${q.subcategoryId})] Quiz ID: ${q.id} | Title: "${q.title}"`);
    });

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
