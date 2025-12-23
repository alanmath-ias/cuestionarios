import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Load .env manually
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
    console.log("Loading .env file...");
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
} else {
    console.warn(".env file not found at", envPath);
}

async function main() {
    try {
        // Dynamic import to ensure env vars are loaded first
        const { db } = await import("../db.js");
        const { sql } = await import("drizzle-orm");

        const sqlPath = path.join(__dirname, "refine_subcategories_21.sql");
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");

        console.log("Executing SQL script...");
        await db.execute(sql.raw(sqlContent));

        console.log("Subcategories for Category 21 refined successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error refining subcategories:", error);
        process.exit(1);
    }
}

main();
