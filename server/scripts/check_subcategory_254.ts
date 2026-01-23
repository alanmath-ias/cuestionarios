
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Load .env manually
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

import { db } from "../db.js";
import { subcategories } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function main() {
    try {
        const subId = 254;
        const existing = await db.select().from(subcategories).where(eq(subcategories.id, subId));

        if (existing.length > 0) {
            console.log(`Subcategory ${subId} exists:`, existing[0]);
        } else {
            console.log(`Subcategory ${subId} does not exist. Creating...`);
            await db.insert(subcategories).values({
                id: subId,
                name: "Ecuaciones Diferenciales",
                categoryId: 21,
                description: "Diagnóstico de Ecuaciones Diferenciales"
            });
            console.log("Created Subcategory 254.");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
