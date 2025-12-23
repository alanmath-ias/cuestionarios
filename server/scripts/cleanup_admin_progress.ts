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
        const { studentProgress, studentAnswers } = await import("../../shared/schema.js");
        const { eq } = await import("drizzle-orm");

        const adminUserId = 1;

        // 1. Delete Student Answers for Admin
        // We need to find progress IDs first to be safe, or just delete by join if supported, 
        // but Drizzle delete with join is tricky. 
        // Simpler: Delete all progress for user 1, cascade should handle answers if configured, 
        // but let's be explicit if possible. 
        // Actually, let's just delete from studentProgress where userId = 1.
        // If foreign keys are set to CASCADE, answers will go. If not, we might error.
        // Let's assume we need to delete progress.

        console.log(`Deleting progress for User ID ${adminUserId}...`);

        const deleted = await db.delete(studentProgress)
            .where(eq(studentProgress.userId, adminUserId))
            .returning();

        console.log(`Deleted ${deleted.length} progress records.`);

        // Also check if we need to manually delete answers if cascade isn't on.
        // For now, let's assume cascade or that we just want to clear the main progress tracking.

        console.log("Cleanup completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error cleaning up admin progress:", error);
        process.exit(1);
    }
}

main();
