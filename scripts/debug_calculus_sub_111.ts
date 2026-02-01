
import "dotenv/config";
import { db } from "../server/db";
import { quizzes } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🔍 Inspecting 'Reglas de Derivación' (Subcategory 111)...");

    const results = await db.select().from(quizzes).where(eq(quizzes.subcategoryId, 111));

    console.log(`Found ${results.length} quizzes.`);
    results.forEach(q => {
        console.log(`[${q.id}] "${q.title}"`);
    });

    process.exit(0);
}

main().catch(console.error);
