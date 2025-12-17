
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Fetching user 'alan'...");
    const user = await db.select().from(users).where(eq(users.username, 'alan'));

    if (user.length === 0) {
        console.log("User 'alan' not found.");
    } else {
        console.log("User found:", JSON.stringify(user[0], null, 2));
        console.log("hintCredits value:", user[0].hintCredits);
        console.log("Type of hintCredits:", typeof user[0].hintCredits);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
