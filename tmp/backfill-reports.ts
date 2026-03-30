import "dotenv/config";
import { db } from "../server/db";
import { users, questionReports } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
    console.log("Iniciando contabilización de reportes antiguos...");

    // Get all users
    const allUsers = await db.select().from(users);

    for (const user of allUsers) {
        // Count reports for this user
        const reports = await db.select().from(questionReports).where(eq(questionReports.userId, user.id));
        const count = reports.length;

        if (count > 0) {
            // Update user's totalReports
            await db.update(users)
                .set({ totalReports: count })
                .where(eq(users.id, user.id));
            console.log(`Usuario ${user.username} (ID: ${user.id}): ${count} reportes actualizados.`);
        }
    }

    console.log("¡Proceso completado exitosamente!");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
