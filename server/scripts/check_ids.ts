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
        const { sql } = await import("drizzle-orm");

        const qz = await db.execute(sql`SELECT MAX(id) as max_id FROM quizzes`);
        const qs = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        const ans = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);

        console.log(`Max Quiz ID: ${qz[0].max_id}`);
        console.log(`Max Question ID: ${qs[0].max_id}`);
        console.log(`Max Answer ID: ${ans[0].max_id}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
