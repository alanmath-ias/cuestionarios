
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Load .env manually
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

async function main() {
    try {
        const { db } = await import("../db.js");

        // 1. Ensure Subcategory
        const categoryId = 21;
        const subcategoryName = "Cálculo";
        let subcategoryId;

        const existingSub = await db.execute(sql`SELECT id FROM subcategories WHERE category_id = ${categoryId} AND name = ${subcategoryName}`);
        if (existingSub.length > 0) {
            subcategoryId = existingSub[0].id;
            console.log(`Using existing subcategory ID: ${subcategoryId}`);
        } else {
            const maxSub = await db.execute(sql`SELECT MAX(id) as max_id FROM subcategories`);
            subcategoryId = (Number(maxSub[0].max_id) || 0) + 1;
            await db.execute(sql`INSERT INTO subcategories (id, name, category_id) VALUES (${subcategoryId}, ${subcategoryName}, ${categoryId})`);
            console.log(`Created new subcategory ID: ${subcategoryId}`);
        }

        // 2. Create Quiz
        const quizId = 281;
        const quizTitle = "Diagnóstico de Cálculo";
        const quizDesc = "Evalúa tus conocimientos en cálculo diferencial e integral. Periodo I.";

        const existingQuiz = await db.execute(sql`SELECT id FROM quizzes WHERE id = ${quizId}`);
        if (existingQuiz.length > 0) {
            console.log(`Quiz ${quizId} already exists. Skipping creation.`);
        } else {
            await db.execute(sql`
                INSERT INTO quizzes (id, title, description, category_id, subcategory_id, difficulty, time_limit, total_questions)
                VALUES (${quizId}, ${quizTitle}, ${quizDesc}, ${categoryId}, ${subcategoryId}, 'intermediate', 20, 10)
            `);
            console.log(`Created Quiz ${quizId}`);
        }

        // 3. Get Max IDs
        const maxQ = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        let nextQuestionId = (Number(maxQ[0].max_id) || 0) + 1;

        const maxA = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);
        let nextAnswerId = (Number(maxA[0].max_id) || 0) + 1;

        // 4. Define Questions
        const questions = [
            {
                text: "Resuelve la inecuación lineal: $3x - 7 \\geq 5x + 3$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q1_Inecuacion.png",
                answers: [
                    { text: "$x \\leq -5$", isCorrect: true },
                    { text: "$x \\geq -5$", isCorrect: false },
                    { text: "$x \\leq 5$", isCorrect: false },
                    { text: "$x \\geq 5$", isCorrect: false }
                ]
            },
            {
                text: "Determina el conjunto solución de la inecuación con valor absoluto: $|2x - 4| < 6$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q2_ValorAbsoluto.png",
                answers: [
                    { text: "$(-1, 5)$", isCorrect: true },
                    { text: "$[-1, 5]$", isCorrect: false },
                    { text: "$(-\\infty, -1) \\cup (5, \\infty)$", isCorrect: false },
                    { text: "$(-5, 1)$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es la ecuación de la recta que pasa por los puntos $(1, 2)$ y $(3, 6)$?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q3_Recta.png",
                answers: [
                    { text: "$y = 2x$", isCorrect: true },
                    { text: "$y = 2x + 1$", isCorrect: false },
                    { text: "$y = 4x - 2$", isCorrect: false },
                    { text: "$y = x + 1$", isCorrect: false }
                ]
            },
            {
                text: "Encuentra las coordenadas del vértice de la parábola $f(x) = x^2 - 6x + 5$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q4_Parabola.png",
                answers: [
                    { text: "$(3, -4)$", isCorrect: true },
                    { text: "$(-3, 4)$", isCorrect: false },
                    { text: "$(3, 4)$", isCorrect: false },
                    { text: "$(-3, -4)$", isCorrect: false }
                ]
            },
            {
                text: "Determina el dominio de la función racional $f(x) = \\frac{x+1}{x^2-4}$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q5_Racional.png",
                answers: [
                    { text: "$\\mathbb{R} - \\{-2, 2\\}$", isCorrect: true },
                    { text: "$\\mathbb{R} - \\{2\\}$", isCorrect: false },
                    { text: "$\\mathbb{R} - \\{-2\\}$", isCorrect: false },
                    { text: "$\\mathbb{R}$", isCorrect: false }
                ]
            },
            {
                text: "Simplifica la expresión usando propiedades de logaritmos: $\\log_2(8) + \\log_2(4)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q6_Logaritmo.png",
                answers: [
                    { text: "$5$", isCorrect: true },
                    { text: "$12$", isCorrect: false },
                    { text: "$6$", isCorrect: false },
                    { text: "$32$", isCorrect: false }
                ]
            },
            {
                text: "Dada la función $f(x) = \\begin{cases} 2x & x < 1 \\\\ 3 & x \\geq 1 \\end{cases}$, evalúa $f(0) + f(2)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q7_Trozos.png",
                answers: [
                    { text: "$3$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$5$", isCorrect: false },
                    { text: "$2$", isCorrect: false }
                ]
            },
            {
                text: "Observa la gráfica. ¿Es esta función inyectiva (uno a uno)?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q8_Inyectiva.png",
                answers: [
                    { text: "No, porque una recta horizontal corta la gráfica en más de un punto.", isCorrect: true },
                    { text: "Sí, porque a cada x le corresponde una y.", isCorrect: false },
                    { text: "Sí, porque es continua.", isCorrect: false },
                    { text: "No, porque no pasa por el origen.", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x) = 3x^2 + 2$ y $g(x) = 2x - 1$, calcula $(f - g)(x)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q9_Operaciones.png",
                answers: [
                    { text: "$3x^2 - 2x + 3$", isCorrect: true },
                    { text: "$3x^2 + 2x + 1$", isCorrect: false },
                    { text: "$3x^2 - 2x + 1$", isCorrect: false },
                    { text: "$x^2 + 3$", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x) = \\sqrt{x}$ y $g(x) = x + 1$, ¿cuál es el dominio de $(f \\circ g)(x)$?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q10_Composicion.png",
                answers: [
                    { text: "$[-1, \\infty)$", isCorrect: true },
                    { text: "$[0, \\infty)$", isCorrect: false },
                    { text: "$(-\\infty, -1]$", isCorrect: false },
                    { text: "$\\mathbb{R}$", isCorrect: false }
                ]
            }
        ];

        // 5. Insert Loop
        // Cleanup existing questions for this quiz to avoid duplicates on re-run
        await db.execute(sql`DELETE FROM questions WHERE quiz_id = ${quizId}`);
        console.log(`Cleaned up existing questions for Quiz ${quizId}`);

        for (const q of questions) {
            await db.execute(sql`
                INSERT INTO questions (id, quiz_id, content, image_url, type, difficulty, points)
                VALUES (${nextQuestionId}, ${quizId}, ${q.text}, ${q.image}, 'multiple_choice', 1, 10)
            `);
            console.log(`Inserted Question ${nextQuestionId}`);

            for (const a of q.answers) {
                await db.execute(sql`
                    INSERT INTO answers (id, question_id, content, is_correct)
                    VALUES (${nextAnswerId}, ${nextQuestionId}, ${a.text}, ${a.isCorrect})
                `);
                nextAnswerId++;
            }
            nextQuestionId++;
        }

        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
