
import "dotenv/config";
import { db } from "../db.js";
import { questions, answers, quizzes } from "../../shared/schema.js";
import { eq, like } from "drizzle-orm";

async function replaceNonAlgebraQuestions() {
    console.log("Starting Algebra Question Replacement...");

    try {
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

        // 1. Identify Questions to Delete
        const questionsToDelete = [
            "Expresa el número ¡0.0003¡ en notación científica.",
            "Simplifica el radical: ¡\\sqrt{50}¡",
            "Realiza la multiplicación de números complejos: ¡(2+i)(2-i)¡"
        ];

        for (const content of questionsToDelete) {
            const q = await db.query.questions.findFirst({
                where: (questions, { and, eq, like }) => and(
                    eq(questions.quizId, quizId),
                    like(questions.content, `${content}%`)
                )
            });

            if (q) {
                console.log(`Deleting question: ${q.content}`);
                // Delete answers first (cascade should handle it, but being safe)
                await db.delete(answers).where(eq(answers.questionId, q.id));
                await db.delete(questions).where(eq(questions.id, q.id));
            } else {
                console.log(`Question not found for deletion: ${content}`);
            }
        }

        // 2. Insert New Questions
        const newQuestions = [
            // Replacement for Scientific Notation (Diff 2) -> Equation of a Line
            {
                content: "Encuentra la ecuación de la recta que pasa por los puntos (1, 2) y (3, 6).",
                difficulty: 2,
                answers: [
                    { content: "¡y = 2x¡", isCorrect: true }, // m=(6-2)/(3-1)=4/2=2. y-2=2(x-1) -> y=2x
                    { content: "¡y = 2x + 1¡", isCorrect: false },
                    { content: "¡y = 3x - 1¡", isCorrect: false },
                    { content: "¡y = x + 1¡", isCorrect: false }
                ]
            },
            // Replacement for Radicals (Diff 2) -> System of Equations
            {
                content: "Resuelve el sistema de ecuaciones:\n¡3x - y = 10¡\n¡2x + y = 5¡",
                difficulty: 2,
                answers: [
                    { content: "¡x = 3, y = -1¡", isCorrect: true }, // 5x=15 -> x=3. 6+y=5 -> y=-1
                    { content: "¡x = 2, y = 1¡", isCorrect: false },
                    { content: "¡x = 3, y = 1¡", isCorrect: false },
                    { content: "¡x = 5, y = 5¡", isCorrect: false }
                ]
            },
            // Replacement for Complex Numbers (Diff 3) -> Inverse Function
            {
                content: "Si ¡f(x) = 2x + 1¡, encuentra la función inversa ¡f^{-1}(x)¡.",
                difficulty: 3,
                answers: [
                    { content: "¡\\frac{x-1}{2}¡", isCorrect: true }, // y=2x+1 -> x=(y-1)/2
                    { content: "¡\\frac{x+1}{2}¡", isCorrect: false },
                    { content: "¡2x - 1¡", isCorrect: false },
                    { content: "¡\\frac{1}{2x+1}¡", isCorrect: false }
                ]
            }
        ];

        for (const q of newQuestions) {
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

        console.log("Replacement complete.");

    } catch (error) {
        console.error("Error replacing questions:", error);
    }
}

replaceNonAlgebraQuestions();
