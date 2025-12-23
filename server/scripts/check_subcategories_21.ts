import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

async function main() {
    try {
        const { db } = await import("../db.js");
        const { subcategories } = await import("../../shared/schema.js");
        const { eq } = await import("drizzle-orm");

        const results = await db.select().from(subcategories).where(eq(subcategories.categoryId, 21));
        console.log(`Found ${results.length} subcategories for Category 21:`);
        results.forEach((sub: any) => {
            console.log(`ID: ${sub.id}, Name: ${sub.name}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error checking subcategories:", error);
        process.exit(1);
    }
}

main();
