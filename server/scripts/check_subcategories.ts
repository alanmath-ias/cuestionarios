
import "dotenv/config";
import { db } from "../db.js";
import { subcategories } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function checkSubcategories() {
    console.log("Checking Subcategories for Category 21 (Diagnóstico)...");

    try {
        const categoryId = 21;
        const subs = await db.query.subcategories.findMany({
            where: eq(subcategories.categoryId, categoryId)
        });

        console.log(`Found ${subs.length} subcategories:`);
        subs.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}`);
        });

    } catch (error) {
        console.error("Error checking subcategories:", error);
    }
}

checkSubcategories();
