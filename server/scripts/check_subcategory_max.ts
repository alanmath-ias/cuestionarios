
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

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

async function main() {
    try {
        const { db } = await import("../db.js");
        const sub = await db.execute(sql`SELECT MAX(id) as max_id FROM subcategories`);
        console.log(`Max Subcategory ID: ${sub[0].max_id}`);

        // Check if "Cálculo" subcategory exists under Category 21
        const existing = await db.execute(sql`
            SELECT * FROM subcategories WHERE category_id = 21 AND name = 'Cálculo'
        `);
        console.log("Existing 'Cálculo' subcategory under Cat 21:", existing);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
