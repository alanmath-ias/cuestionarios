
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { quizzes, subcategories } from "../shared/schema.js";
import { eq, asc } from "drizzle-orm";
import dotenv from "dotenv";
import fs from "fs";

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
    const results = await db.select({
        id: quizzes.id,
        title: quizzes.title,
        subcategoryId: quizzes.subcategoryId,
        subcategoryName: subcategories.name
    })
        .from(quizzes)
        .leftJoin(subcategories, eq(quizzes.subcategoryId, subcategories.id))
        .where(eq(quizzes.categoryId, 1))
        .orderBy(asc(quizzes.subcategoryId));

    fs.writeFileSync("arithmetic_quizzes.json", JSON.stringify(results, null, 2));
    console.log("Exported to arithmetic_quizzes.json");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
