
import { db } from "../server/db";
import { questions } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
    console.log("Updating missing hints...");

    // Update hint1 where it is null
    await db.update(questions)
        .set({
            hint1: "Lee atentamente el enunciado e identifica las variables conocidas.",
            explanation: "Revisa el procedimiento paso a paso para encontrar la solución correcta."
        })
        .where(isNull(questions.hint1));

    console.log("Hints updated successfully.");
}

main().catch(console.error).finally(() => process.exit());
