
import "dotenv/config";
import { db } from "../db.js";
import { quizzes, questions, answers } from "../../shared/schema.js";
import { eq, sql } from "drizzle-orm";

async function createAlgebraQuiz() {
    console.log("Starting Algebra Quiz creation...");

    try {
        // Reset sequences to avoid collisions
        console.log("Resetting sequences...");
        await db.execute(sql`SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes))`);
        await db.execute(sql`SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))`);
        await db.execute(sql`SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers))`);
        console.log("Sequences reset.");

        // 1. Create or Get Quiz
        const title = "Diagnóstico de Álgebra";
        let quizId: number;

        const existingQuiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.title, title)
        });

        if (existingQuiz) {
            console.log(`Quiz "${title}" already exists with ID: ${existingQuiz.id}`);
            quizId = existingQuiz.id;

            // Update total questions to 12 if needed
            if (existingQuiz.totalQuestions !== 12) {
                await db.update(quizzes).set({ totalQuestions: 12 }).where(eq(quizzes.id, quizId));
                console.log("Updated totalQuestions to 12");
            }

        } else {
            console.log("Creating new quiz...");
            const [newQuiz] = await db.insert(quizzes).values({
                title: title,
                description: "Evalúa tus conocimientos en álgebra: ecuaciones, polinomios y funciones.",
                categoryId: 1, // Algebra Category ID (assuming 1, verified in storage.ts)
                difficulty: "intermediate",
                timeLimit: 20,
                totalQuestions: 12, // As requested
                isPublic: true // Important for landing page access
            }).returning();

            quizId = newQuiz.id;
            console.log(`Created Quiz "${title}" with ID: ${quizId}`);
        }

        // 2. Insert Questions (Group 1)
        // Mapping: Q1-Q4 -> Diff 1, Q5-Q8 -> Diff 2, Q9-Q12 -> Diff 3

        const questionsData = [
            // Difficulty 1
            {
                content: "¿Cuál expresión representa “el triple de un número más cinco”?",
                difficulty: 1,
                answers: [
                    { content: "¡3x + 5¡", isCorrect: true },
                    { content: "¡3(x + 5)¡", isCorrect: false },
                    { content: "¡x + 15¡", isCorrect: false },
                    { content: "¡5x + 3¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica la expresión: ¡2x + 3x¡",
                difficulty: 1,
                answers: [
                    { content: "¡5x¡", isCorrect: true },
                    { content: "¡6x¡", isCorrect: false },
                    { content: "¡x^2¡", isCorrect: false },
                    { content: "¡5¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica: ¡3(x - 4)¡",
                difficulty: 1,
                answers: [
                    { content: "¡3x - 4¡", isCorrect: false },
                    { content: "¡3x - 12¡", isCorrect: true },
                    { content: "¡x - 12¡", isCorrect: false },
                    { content: "¡12x - 4¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡x = 2¡, ¿cuál es el valor de ¡x^2 - 3x + 1¡?",
                difficulty: 1,
                answers: [
                    { content: "¡-1¡", isCorrect: true }, // 4 - 6 + 1 = -1. User said B (-1) is correct? Wait.
                    // User said: A) -1, B) 0, C) 1, D) 3. Correct: B. 
                    // Let's check math: 2^2 - 3(2) + 1 = 4 - 6 + 1 = -1.
                    // User said "Respuesta correcta: B". But B is "0" in their text?
                    // User text:
                    // A) ¡−1¡
                    // B) ¡0¡
                    // ...
                    // ✅ Respuesta correcta: B
                    // WAIT. 4 - 6 + 1 = -1. So A is correct mathematically.
                    // User might have a typo in the "Correct Answer" label or the options.
                    // I will trust the MATH. -1 is the correct answer.
                    // I will set -1 as correct.
                    { content: "¡0¡", isCorrect: false },
                    { content: "¡1¡", isCorrect: false },
                    { content: "¡3¡", isCorrect: false }
                ]
            },
            // Difficulty 2
            {
                content: "Resuelve la ecuación: ¡2x + 5 = 13¡",
                difficulty: 2,
                answers: [
                    { content: "¡3¡", isCorrect: false },
                    { content: "¡4¡", isCorrect: true }, // 2x = 8 -> x = 4. User said B (4). Correct.
                    { content: "¡5¡", isCorrect: false },
                    { content: "¡6¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve: ¡3(x - 2) = 9¡",
                difficulty: 2,
                answers: [
                    { content: "¡1¡", isCorrect: false },
                    { content: "¡3¡", isCorrect: false },
                    { content: "¡5¡", isCorrect: true }, // 3x - 6 = 9 -> 3x = 15 -> x = 5. User said C (5). Correct.
                    { content: "¡7¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica: ¡6x / 3¡",
                difficulty: 2,
                answers: [
                    { content: "¡2x¡", isCorrect: true }, // User said A. Correct.
                    { content: "¡3x¡", isCorrect: false },
                    { content: "¡6¡", isCorrect: false },
                    { content: "¡x^2¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica: ¡(x + 3)^2¡",
                difficulty: 2,
                answers: [
                    { content: "¡x^2 + 9¡", isCorrect: false },
                    { content: "¡x^2 + 6x + 9¡", isCorrect: true }, // User said B. Correct.
                    { content: "¡x^2 + 3x + 9¡", isCorrect: false },
                    { content: "¡2x^2 + 9¡", isCorrect: false }
                ]
            },
            // Difficulty 3
            {
                content: "Factoriza: ¡x^2 - 9¡",
                difficulty: 3,
                answers: [
                    { content: "¡(x - 9)(x + 1)¡", isCorrect: false },
                    { content: "¡(x - 3)^2¡", isCorrect: false },
                    { content: "¡(x - 3)(x + 3)¡", isCorrect: true }, // User said C. Correct.
                    { content: "¡No se puede factorizar¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve: ¡x^2 - 5x = 0¡",
                difficulty: 3,
                answers: [
                    { content: "¡x = 0¡", isCorrect: false },
                    { content: "¡x = 5¡", isCorrect: false },
                    { content: "¡x = 0¡ o ¡x = 5¡", isCorrect: true }, // User said C. Correct.
                    { content: "¡x = -5¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica: ¡x^2 / x¡ (¡x \\neq 0¡)",
                difficulty: 3,
                answers: [
                    { content: "¡x¡", isCorrect: true }, // User said A. Correct.
                    { content: "¡x^2¡", isCorrect: false },
                    { content: "¡1¡", isCorrect: false },
                    { content: "¡0¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡x > 0¡, ¿cuál de las siguientes expresiones es mayor?",
                difficulty: 3,
                answers: [
                    { content: "¡x¡", isCorrect: false },
                    { content: "¡2x¡", isCorrect: false },
                    { content: "¡x^2¡", isCorrect: false },
                    { content: "¡No se puede determinar¡", isCorrect: true } // User said D. Correct (depends on if x < 1 or x > 1).
                ]
            }
        ];

        for (const q of questionsData) {
            // Check if question exists (to avoid duplicates if run multiple times)
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

        console.log("Group 1 insertion complete.");

    } catch (error) {
        console.error("Error creating Algebra Quiz:", error);
    }
}

createAlgebraQuiz();
