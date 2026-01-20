
import "dotenv/config";
import { db } from "../db.js";
import { questions, answers, quizzes } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function insertAlgebraGroup3() {
    console.log("Starting Algebra Group 3 insertion (AI Generated)...");

    try {
        // 1. Get Quiz ID
        const title = "Diagnóstico de Álgebra";
        const quiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.title, title)
        });

        if (!quiz) {
            console.error("Quiz not found!");
            return;
        }

        const quizId = quiz.id;
        console.log(`Using Quiz ID: ${quizId}`);

        // 2. Define Questions (Group 3 - 14 Questions)
        // Target Distribution: ~6 Easy, ~4 Medium, ~4 Hard to balance the bank.

        const questionsData = [
            // --- EASY (6 Questions) ---
            {
                content: "Simplifica la expresión utilizando leyes de exponentes: ¡x^3 \\cdot x^5¡",
                difficulty: 1,
                answers: [
                    { content: "¡x^8¡", isCorrect: true },
                    { content: "¡x^{15}¡", isCorrect: false },
                    { content: "¡2x^8¡", isCorrect: false },
                    { content: "¡x^2¡", isCorrect: false }
                ]
            },
            {
                content: "Evalúa la expresión ¡3x - y¡ si ¡x = 2¡ y ¡y = 5¡.",
                difficulty: 1,
                answers: [
                    { content: "¡1¡", isCorrect: true },
                    { content: "¡-1¡", isCorrect: false },
                    { content: "¡11¡", isCorrect: false },
                    { content: "¡0¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve la ecuación lineal: ¡\\frac{x}{2} = 6¡",
                difficulty: 1,
                answers: [
                    { content: "¡3¡", isCorrect: false },
                    { content: "¡12¡", isCorrect: true },
                    { content: "¡8¡", isCorrect: false },
                    { content: "¡4¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve la desigualdad: ¡x + 3 < 10¡",
                difficulty: 1,
                answers: [
                    { content: "¡x < 7¡", isCorrect: true },
                    { content: "¡x > 7¡", isCorrect: false },
                    { content: "¡x < 13¡", isCorrect: false },
                    { content: "¡x > 13¡", isCorrect: false }
                ]
            },
            {
                content: "Realiza la suma de polinomios: ¡(2x + 1) + (3x - 4)¡",
                difficulty: 1,
                answers: [
                    { content: "¡5x - 3¡", isCorrect: true },
                    { content: "¡5x + 5¡", isCorrect: false },
                    { content: "¡6x - 4¡", isCorrect: false },
                    { content: "¡5x + 3¡", isCorrect: false }
                ]
            },
            {
                content: "¿Cuál es la pendiente de la recta ¡y = 2x + 1¡?",
                difficulty: 1,
                answers: [
                    { content: "¡2¡", isCorrect: true },
                    { content: "¡1¡", isCorrect: false },
                    { content: "¡x¡", isCorrect: false },
                    { content: "¡-2¡", isCorrect: false }
                ]
            },

            // --- MEDIUM (4 Questions) ---
            {
                content: "La suma de dos números es 20 y su diferencia es 4. ¿Cuál es el número mayor?",
                difficulty: 2,
                answers: [
                    { content: "¡8¡", isCorrect: false },
                    { content: "¡10¡", isCorrect: false },
                    { content: "¡12¡", isCorrect: true }, // x+y=20, x-y=4 -> 2x=24 -> x=12
                    { content: "¡16¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica el radical: ¡\\sqrt{50}¡",
                difficulty: 2,
                answers: [
                    { content: "¡5\\sqrt{2}¡", isCorrect: true }, // 25*2
                    { content: "¡2\\sqrt{5}¡", isCorrect: false },
                    { content: "¡10\\sqrt{5}¡", isCorrect: false },
                    { content: "¡25\\sqrt{2}¡", isCorrect: false }
                ]
            },
            {
                content: "Encuentra la coordenada x del vértice de la parábola ¡y = x^2 - 4x¡",
                difficulty: 2,
                answers: [
                    { content: "¡-2¡", isCorrect: false },
                    { content: "¡2¡", isCorrect: true }, // -b/2a = 4/2 = 2
                    { content: "¡4¡", isCorrect: false },
                    { content: "¡0¡", isCorrect: false }
                ]
            },
            {
                content: "Expresa el número ¡0.0003¡ en notación científica.",
                difficulty: 2,
                answers: [
                    { content: "¡3 \\times 10^{-3}¡", isCorrect: false },
                    { content: "¡3 \\times 10^{-4}¡", isCorrect: true },
                    { content: "¡3 \\times 10^{4}¡", isCorrect: false },
                    { content: "¡0.3 \\times 10^{-3}¡", isCorrect: false }
                ]
            },

            // --- HARD (4 Questions) ---
            {
                content: "Resuelve la ecuación racional: ¡\\frac{1}{x} + \\frac{1}{2} = \\frac{3}{4}¡",
                difficulty: 3,
                answers: [
                    { content: "¡2¡", isCorrect: false },
                    { content: "¡4¡", isCorrect: true }, // 1/x = 3/4 - 2/4 = 1/4 -> x=4
                    { content: "¡8¡", isCorrect: false },
                    { content: "¡-4¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica usando propiedades de logaritmos: ¡\\log_2(8) + \\log_2(4)¡",
                difficulty: 3,
                answers: [
                    { content: "¡12¡", isCorrect: false },
                    { content: "¡32¡", isCorrect: false },
                    { content: "¡5¡", isCorrect: true }, // 3 + 2 = 5
                    { content: "¡6¡", isCorrect: false }
                ]
            },
            {
                content: "Realiza la multiplicación de números complejos: ¡(2+i)(2-i)¡",
                difficulty: 3,
                answers: [
                    { content: "¡3¡", isCorrect: false },
                    { content: "¡5¡", isCorrect: true }, // 4 - i^2 = 4 - (-1) = 5
                    { content: "¡4 - i¡", isCorrect: false },
                    { content: "¡4 + i¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve la ecuación exponencial: ¡2^{x+1} = 16¡",
                difficulty: 3,
                answers: [
                    { content: "¡3¡", isCorrect: true }, // 2^{x+1} = 2^4 -> x+1=4 -> x=3
                    { content: "¡4¡", isCorrect: false },
                    { content: "¡5¡", isCorrect: false },
                    { content: "¡2¡", isCorrect: false }
                ]
            }
        ];

        for (const q of questionsData) {
            // Check for duplicates
            const existingQ = await db.query.questions.findFirst({
                where: eq(questions.content, q.content)
            });

            if (existingQ) {
                console.log(`Question "${q.content.substring(0, 20)}..." already exists.`);
                continue;
            }

            const [newQ] = await db.insert(questions).values({
                quizId: quizId,
                content: q.content,
                type: "multiple_choice",
                difficulty: q.difficulty,
                points: 10
            }).returning();

            for (const a of q.answers) {
                await db.insert(answers).values({
                    questionId: newQ.id,
                    content: a.content,
                    isCorrect: a.isCorrect
                });
            }
            console.log(`Inserted question: ${q.content.substring(0, 30)}...`);
        }

        console.log("Group 3 insertion complete.");

    } catch (error) {
        console.error("Error inserting Algebra Group 3:", error);
    }
}

insertAlgebraGroup3();
