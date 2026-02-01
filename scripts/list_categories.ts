
import "dotenv/config";
import { db } from "../server/db";
import { categories } from "../shared/schema";

async function main() {
    const cats = await db.select().from(categories);
    console.log("Categories:", cats);
    process.exit(0);
}
main().catch(console.error);
