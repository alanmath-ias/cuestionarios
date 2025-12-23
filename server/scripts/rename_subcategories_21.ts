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

        // Get all subcategories for Category 21
        const subs = await db.select().from(subcategories).where(eq(subcategories.categoryId, 21));

        console.log(`Found ${subs.length} subcategories to rename.`);

        for (const sub of subs) {
            if (!sub.name.includes("Nivelación")) {
                const newName = `${sub.name} Nivelación`;
                await db.update(subcategories)
                    .set({ name: newName })
                    .where(eq(subcategories.id, sub.id));
                console.log(`Renamed "${sub.name}" to "${newName}"`);
            } else {
                console.log(`Skipping "${sub.name}" (already renamed)`);
            }
        }

        console.log("Renaming completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error renaming subcategories:", error);
        process.exit(1);
    }
}

main();
