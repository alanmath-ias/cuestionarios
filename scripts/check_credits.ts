
import { db } from "../server/db";
import { users } from "../shared/schema";

async function main() {
    console.log("Checking user credits...");
    try {
        const allUsers = await db.select().from(users);
        console.log("Users found:", allUsers.length);
        allUsers.forEach(u => {
            console.log(`User ID: ${u.id}, Username: ${u.username}, Credits: ${u.hintCredits}`);
        });
    } catch (error) {
        console.error("Error checking credits:", error);
    }
    process.exit(0);
}

main();
