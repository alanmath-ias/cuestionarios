import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
        const { quizzes, questions, answers } = await import("../../shared/schema.js");
        const { sql } = await import("drizzle-orm");

        // 1. Create the Quiz
        const quizId = 278; // Next available ID
        await db.insert(quizzes).values({
            id: quizId,
            title: "Test de Nivelación: Aritmética",
            description: "Evaluación de conocimientos fundamentales de aritmética.",
            categoryId: 21,
            subcategoryId: 249, // Aritmética Nivelación
            difficulty: "medium",
            timeLimit: 20,
            totalQuestions: 10,
        }).onConflictDoNothing();

        console.log(`Created Quiz: Test de Nivelación: Aritmética (ID: ${quizId})`);

        // 2. Define Questions
        const questionsData = [
            // Bloque 1 (Usuario - Asignando dificultad estimada)
            {
                difficulty: 1,
                content: "¿Cuál es el valor de la expresión? $6 + 2 \\times (5 - 3)$",
                options: [
                    { content: "10", isCorrect: true, explanation: "Primero el paréntesis: $(5-3)=2$. Luego multiplicación: $2 \\times 2 = 4$. Finalmente suma: $6 + 4 = 10$." },
                    { content: "14", isCorrect: false },
                    { content: "16", isCorrect: false },
                    { content: "20", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál es el resultado de la operación? $-4 + 7 - 3$",
                options: [
                    { content: "0", isCorrect: true, explanation: "$-4 + 7 = 3$. Luego $3 - 3 = 0$." },
                    { content: "-14", isCorrect: false },
                    { content: "2", isCorrect: false },
                    { content: "10", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál de los siguientes números es mayor?",
                options: [
                    { content: "$3/4$", isCorrect: true, explanation: "$3/4 = 0.75$. $5/8 = 0.625$. $2/3 \\approx 0.66$. $0.75$ es el mayor." },
                    { content: "$5/8$", isCorrect: false },
                    { content: "0.7", isCorrect: false },
                    { content: "$2/3$", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál es el resultado de: $3/4 + 1/2$?",
                options: [
                    { content: "$5/4$", isCorrect: true, explanation: "$1/2 = 2/4$. Entonces $3/4 + 2/4 = 5/4$." },
                    { content: "$4/6$", isCorrect: false },
                    { content: "$4/8$", isCorrect: false },
                    { content: "$3/6$", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál es el valor de: $0.25 \\times 0.4$?",
                options: [
                    { content: "0.1", isCorrect: true, explanation: "$25 \\times 4 = 100$. Hay 3 decimales en total (2 en 0.25, 1 en 0.4). Recorremos la coma 3 lugares: $0.100 = 0.1$." },
                    { content: "0.01", isCorrect: false },
                    { content: "1", isCorrect: false },
                    { content: "0.65", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Un número se multiplica por 3 y luego se le resta 5, obteniendo como resultado 16. ¿Cuál es el número?",
                options: [
                    { content: "7", isCorrect: true, explanation: "$3x - 5 = 16 \\rightarrow 3x = 21 \\rightarrow x = 7$." },
                    { content: "5", isCorrect: false },
                    { content: "9", isCorrect: false },
                    { content: "11", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Un artículo cuesta $80 y tiene un descuento del 25%. ¿Cuál es el precio final?",
                options: [
                    { content: "$60", isCorrect: true, explanation: "25% de 80 es $80/4 = 20$. Precio final: $80 - 20 = 60$." },
                    { content: "$55", isCorrect: false },
                    { content: "$65", isCorrect: false },
                    { content: "$70", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Si 4 cuadernos cuestan $12, ¿cuánto cuestan 10 cuadernos?",
                options: [
                    { content: "$30", isCorrect: true, explanation: "Cada cuaderno cuesta $12/4 = 3$. 10 cuadernos cuestan $10 \\times 3 = 30$." },
                    { content: "$24", isCorrect: false },
                    { content: "$36", isCorrect: false },
                    { content: "$40", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Sin hacer cálculos exactos, ¿cuál de las siguientes expresiones es mayor?",
                options: [
                    { content: "$4 \\times 25$", isCorrect: true, explanation: "A) $\\approx 95$. B) 90. C) 100. La mayor es C." },
                    { content: "$5 \\times 19$", isCorrect: false },
                    { content: "$10 \\times 9$", isCorrect: false },
                    { content: "Todas son iguales", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "¿Cuál de las siguientes afirmaciones es verdadera?",
                options: [
                    { content: "El 20% de 50 es 10", isCorrect: true, explanation: "$0.2 \\times 50 = 10$." },
                    { content: "$1/3 + 1/3 = 1/6$", isCorrect: false },
                    { content: "$0.5 \\times 0.2 = 0.01$", isCorrect: false },
                    { content: "$2/3 = 6$", isCorrect: false }
                ]
            },
            // Bloque 2 (Usuario - Niveles)
            {
                difficulty: 1,
                content: "Calcula: $6 - 2 \\times (1 + 1/2)$",
                options: [
                    { content: "3", isCorrect: true, explanation: "$1 + 0.5 = 1.5$. $2 \\times 1.5 = 3$. $6 - 3 = 3$." },
                    { content: "4.5", isCorrect: false },
                    { content: "5", isCorrect: false },
                    { content: "7", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "Si un artículo cuesta $80 y tiene un descuento del 25%, ¿cuál es su precio final?", // Duplicada intencionalmente o similar
                options: [
                    { content: "$60", isCorrect: true, explanation: "$80 - 20 = 60$." },
                    { content: "$20", isCorrect: false },
                    { content: "$55", isCorrect: false },
                    { content: "$65", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál es el valor de $\\sqrt{25} + 2^3$?",
                options: [
                    { content: "13", isCorrect: true, explanation: "$5 + 8 = 13$." },
                    { content: "7", isCorrect: false },
                    { content: "10", isCorrect: false },
                    { content: "33", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "Si 5 cuadernos cuestan $15, ¿cuánto cuestan 8 cuadernos?",
                options: [
                    { content: "$24", isCorrect: true, explanation: "$15/5 = 3$ cada uno. $8 \\times 3 = 24$." },
                    { content: "$18", isCorrect: false },
                    { content: "$20", isCorrect: false },
                    { content: "$40", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Simplifica: $\\frac{2/3 + 1/6}{3/4 - 1/2}$",
                options: [
                    { content: "$10/3$", isCorrect: true, explanation: "Num: $4/6 + 1/6 = 5/6$. Den: $3/4 - 2/4 = 1/4$. $(5/6) / (1/4) = 20/6 = 10/3$." },
                    { content: "$5/3$", isCorrect: false },
                    { content: "$3/5$", isCorrect: false },
                    { content: "5", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "El precio de un producto aumenta un 20% y luego disminuye un 20%. Comparado con el original, el precio final es:",
                options: [
                    { content: "4% menor", isCorrect: true, explanation: "$1.2 \\times 0.8 = 0.96$. Es un 96% del original, o sea, 4% menor." },
                    { content: "4% mayor", isCorrect: false },
                    { content: "el mismo", isCorrect: false },
                    { content: "10% menor", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Si $\\log_2(x) = 3$, entonces el valor de $x$ es:",
                options: [
                    { content: "8", isCorrect: true, explanation: "$2^3 = 8$." },
                    { content: "6", isCorrect: false },
                    { content: "9", isCorrect: false },
                    { content: "12", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "¿Cuál es el menor entero positivo por el que se debe multiplicar 12 para obtener un cuadrado perfecto?",
                options: [
                    { content: "3", isCorrect: true, explanation: "$12 = 2^2 \\times 3$. Falta un 3 para que sea $2^2 \\times 3^2 = 36$." },
                    { content: "2", isCorrect: false },
                    { content: "6", isCorrect: false },
                    { content: "12", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "Si $a = 2 \\times 10^3$ y $b = 5 \\times 10^{-2}$, ¿cuál es el valor de $a \\cdot b$?",
                options: [
                    { content: "$1 \\times 10^2$", isCorrect: true, explanation: "$2 \\times 5 = 10$. $10^3 \\times 10^{-2} = 10^1$. $10 \\times 10^1 = 100 = 1 \\times 10^2$." },
                    { content: "$1 \\times 10^{-2}$", isCorrect: false },
                    { content: "$1 \\times 10^{-1}$", isCorrect: false },
                    { content: "1", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "Un estanque se llena en 6 horas con una llave y en 4 horas con otra. Juntas tardan:",
                options: [
                    { content: "2.4 horas", isCorrect: true, explanation: "$1/T = 1/6 + 1/4 = 5/12$. $T = 12/5 = 2.4$." },
                    { content: "2 horas", isCorrect: false },
                    { content: "2.5 horas", isCorrect: false },
                    { content: "5 horas", isCorrect: false }
                ]
            },
            // Bloque 3 (IA)
            {
                difficulty: 1,
                content: "¿Cuál es el MCM de 4, 6 y 8?",
                options: [
                    { content: "24", isCorrect: true, explanation: "24 es el menor número divisible por 4, 6 y 8." },
                    { content: "12", isCorrect: false },
                    { content: "48", isCorrect: false },
                    { content: "16", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "Si 1 metro equivale a 100 cm, ¿cuántos cm hay en 3.5 metros?",
                options: [
                    { content: "350 cm", isCorrect: true, explanation: "$3.5 \\times 100 = 350$." },
                    { content: "35 cm", isCorrect: false },
                    { content: "3500 cm", isCorrect: false },
                    { content: "3.5 cm", isCorrect: false }
                ]
            },
            {
                difficulty: 1,
                content: "¿Cuál es el promedio de 10, 15, 20 y 25?",
                options: [
                    { content: "17.5", isCorrect: true, explanation: "$(10+15+20+25)/4 = 70/4 = 17.5$." },
                    { content: "15", isCorrect: false },
                    { content: "20", isCorrect: false },
                    { content: "18", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Si 3 pintores tardan 12 días, ¿cuánto cuestan 9 pintores?", // Corrección: ¿cuánto tardarán?
                options: [
                    { content: "4 días", isCorrect: true, explanation: "$3 \\times 12 = 36$ días-hombre. $36 / 9 = 4$." },
                    { content: "36 días", isCorrect: false },
                    { content: "9 días", isCorrect: false },
                    { content: "6 días", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Un artículo de $100 tiene dos descuentos sucesivos del 10% y 10%. ¿Precio final?",
                options: [
                    { content: "$81", isCorrect: true, explanation: "$100 \\times 0.9 \\times 0.9 = 81$." },
                    { content: "$80", isCorrect: false },
                    { content: "$90", isCorrect: false },
                    { content: "$85", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Si $3x + 5 = 20$, ¿cuánto vale $x$?",
                options: [
                    { content: "5", isCorrect: true, explanation: "$3x = 15 \\rightarrow x = 5$." },
                    { content: "3", isCorrect: false },
                    { content: "15", isCorrect: false },
                    { content: "4", isCorrect: false }
                ]
            },
            {
                difficulty: 2,
                content: "Un cuadrado tiene perímetro 20 cm. ¿Su área?",
                options: [
                    { content: "25", isCorrect: true, explanation: "Lado = 5. Área = $5^2 = 25$." },
                    { content: "20", isCorrect: false },
                    { content: "16", isCorrect: false },
                    { content: "100", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "¿A qué es igual $2^{-3}$?",
                options: [
                    { content: "1/8", isCorrect: true, explanation: "$1/2^3 = 1/8$." },
                    { content: "-6", isCorrect: false },
                    { content: "-8", isCorrect: false },
                    { content: "1/6", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "Calcula $\\sqrt{0.0004}$",
                options: [
                    { content: "0.02", isCorrect: true, explanation: "$\\sqrt{4/10000} = 2/100 = 0.02$." },
                    { content: "0.002", isCorrect: false },
                    { content: "0.2", isCorrect: false },
                    { content: "0.04", isCorrect: false }
                ]
            },
            {
                difficulty: 3,
                content: "2 litros al 50% y 3 litros al 20%. ¿Concentración final?",
                options: [
                    { content: "32%", isCorrect: true, explanation: "$(1 + 0.6) / 5 = 1.6 / 5 = 0.32$." },
                    { content: "35%", isCorrect: false },
                    { content: "30%", isCorrect: false },
                    { content: "40%", isCorrect: false }
                ]
            }
        ];

        // 3. Insert Questions and Answers
        let questionId = 3724; // Starting ID
        let answerId = 18777; // Starting ID

        for (const q of questionsData) {
            // Insert Question
            await db.insert(questions).values({
                id: questionId,
                quizId: quizId,
                content: q.content,
                points: 10,
                type: "multiple_choice",
                difficulty: q.difficulty,
            }).onConflictDoNothing();

            console.log(`Inserted Question ID: ${questionId}`);

            // Insert Answers
            for (const opt of q.options) {
                await db.insert(answers).values({
                    id: answerId,
                    questionId: questionId,
                    content: opt.content,
                    isCorrect: opt.isCorrect,
                    explanation: opt.explanation || null,
                }).onConflictDoNothing();
                answerId++;
            }
            questionId++;
        }

        console.log("All questions inserted successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting questions:", error);
        process.exit(1);
    }
}

main();
