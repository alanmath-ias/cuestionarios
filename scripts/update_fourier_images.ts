
import dotenv from "dotenv";
import { eq, and, gte, lte } from "drizzle-orm";

// Load environment variables first
dotenv.config({ path: ".envproduction" });

async function updateFourierImages() {
    console.log("Starting Fourier image URL update...");

    // Dynamically import db and schema after dotenv config
    const { db } = await import("../server/db");
    const { questions } = await import("../shared/schema");

    try {
        // 1. Fetch all questions for quizzes 263-273
        const targetQuestions = await db
            .select()
            .from(questions)
            .where(
                and(
                    gte(questions.quizId, 263),
                    lte(questions.quizId, 273)
                )
            );

        console.log(`Found ${targetQuestions.length} questions in the target range (Quiz IDs 263-273).`);

        let updatedCount = 0;

        for (const question of targetQuestions) {
            if (question.imageUrl && question.imageUrl.includes("/ecuaciones_diferenciales/")) {
                const newImageUrl = question.imageUrl.replace(
                    "/ecuaciones_diferenciales/",
                    "/fourier/"
                );

                await db
                    .update(questions)
                    .set({ imageUrl: newImageUrl })
                    .where(eq(questions.id, question.id));

                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} image URLs.`);

    } catch (error) {
        console.error("Error updating image URLs:", error);
    } finally {
        process.exit(0);
    }
}

updateFourierImages();
