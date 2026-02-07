import "dotenv/config";
import { db } from "./server/db";
import { categories } from "./shared/schema";

async function main() {
    const allCategories = await db.select().from(categories);
    console.log(JSON.stringify(allCategories, null, 2));
}

main().catch(console.error);
