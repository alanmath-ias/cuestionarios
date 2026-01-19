
import 'dotenv/config';
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function makeAdmin() {
    try {
        console.log("Updating user ID 2 (alan) to admin...");
        await db.update(users)
            .set({ role: 'admin' })
            .where(eq(users.id, 2));

        console.log("User updated successfully.");

        const updatedUser = await db.select().from(users).where(eq(users.id, 2));
        console.log(`New role for user ID 2: ${updatedUser[0]?.role}`);

    } catch (error) {
        console.error("Error updating user:", error);
    } finally {
        process.exit(0);
    }
}

makeAdmin();
