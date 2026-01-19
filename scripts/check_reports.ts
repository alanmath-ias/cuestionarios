
import 'dotenv/config';
import { db } from "../server/db";
import { questionReports, users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function checkReports() {
    try {
        console.log("Checking question reports...");
        const reports = await db.select().from(questionReports);
        console.log(`Total reports found: ${reports.length}`);

        if (reports.length > 0) {
            console.log("Reports details:");
            for (const report of reports) {
                const user = await db.select().from(users).where(eq(users.id, report.userId));
                console.log(`- ID: ${report.id}, UserID: ${report.userId} (${user[0]?.username}), QuizID: ${report.quizId}, Status: ${report.status}, Desc: ${report.description}`);
            }
        } else {
            console.log("No reports found in the database.");
        }

        const adminUser = await db.select().from(users).where(eq(users.id, 2));
        if (adminUser.length > 0) {
            console.log(`User ID 2 (alan) role: ${adminUser[0].role}`);
        } else {
            console.log("User ID 2 not found.");
        }

    } catch (error) {
        console.error("Error checking reports:", error);
    } finally {
        process.exit(0);
    }
}

checkReports();
