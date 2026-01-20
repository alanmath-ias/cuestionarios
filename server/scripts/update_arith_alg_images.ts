
import "dotenv/config";
import { db } from "../db.js";
import { questions } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function updateImages() {
    console.log("Updating image URLs for Arithmetic and Algebra questions...");

    const updates = [
        // Arithmetic (Quiz 278)
        { id: 3732, url: "https://imagenes.alanmath.com/images/test_diagnosticos/aritmetica/C21_P278_Q3732.png" },
        { id: 3735, url: "https://imagenes.alanmath.com/images/test_diagnosticos/aritmetica/C21_P278_Q3735.png" },
        { id: 3739, url: "https://imagenes.alanmath.com/images/test_diagnosticos/aritmetica/C21_P278_Q3739.png" },

        // Algebra (Quiz 279)
        { id: 3781, url: "https://imagenes.alanmath.com/images/test_diagnosticos/algebra/C21_P279_Q3781.png" },
        { id: 3784, url: "https://imagenes.alanmath.com/images/test_diagnosticos/algebra/C21_P279_Q3784.png" },
        { id: 3790, url: "https://imagenes.alanmath.com/images/test_diagnosticos/algebra/C21_P279_Q3790.png" },
        { id: 3791, url: "https://imagenes.alanmath.com/images/test_diagnosticos/algebra/C21_P279_Q3791.png" }
    ];

    try {
        for (const update of updates) {
            await db.update(questions)
                .set({ imageUrl: update.url })
                .where(eq(questions.id, update.id));
            console.log(`Updated Question ID ${update.id} with URL: ${update.url}`);
        }
        console.log("✅ All images updated successfully!");
    } catch (error) {
        console.error("Error updating images:", error);
    }
}

updateImages();
