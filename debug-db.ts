import "dotenv/config";

import { studentProgress, quizSubmissions, users, quizzes } from "./shared/schema";
import { eq, desc } from "drizzle-orm";

async function checkData() {
    // Patch DATABASE_URL if it's malformed (missing host)
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("@")) {
        console.log("Patching malformed DATABASE_URL...");
        const parts = process.env.DATABASE_URL.split(":");
        // Expected: postgres://user:password:port/db
        // parts[0] = postgres
        // parts[1] = //user
        // parts[2] = password
        // parts[3] = port/db

        if (parts.length === 4) {
            process.env.DATABASE_URL = `${parts[0]}:${parts[1]}:${parts[2]}@localhost:${parts[3]}`;
        }
    }

    // Dynamic import to ensure env var is patched before db module loads
    const { db } = await import("./server/db");

    console.log("Checking database content...");

    // Check completed progress
    const completedProgress = await db.select().from(studentProgress).where(eq(studentProgress.status, 'completed'));
    console.log(`Found ${completedProgress.length} completed student progress records.`);
    if (completedProgress.length > 0) {
        console.log("Sample progress:", completedProgress[0]);
    }

    // Check quiz submissions
    const submissions = await db.select().from(quizSubmissions);
    console.log(`Found ${submissions.length} quiz submissions.`);
    if (submissions.length > 0) {
        console.log("Sample submission:", submissions[0]);
    }

    // Check if there are any users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users.`);

    // Check if there are any quizzes
    const allQuizzes = await db.select().from(quizzes);
    console.log(`Found ${allQuizzes.length} quizzes.`);

    process.exit(0);
}

checkData().catch(console.error);
