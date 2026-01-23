
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

        const quizId = 281;

        // 1. Cleanup existing questions for this quiz
        await db.execute(sql`DELETE FROM questions WHERE quiz_id = ${quizId}`);
        console.log(`Cleaned up existing questions for Quiz ${quizId}`);

        // 2. Get Max IDs
        const maxQ = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        let nextQuestionId = (Number(maxQ[0].max_id) || 0) + 1;

        const maxA = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);
        let nextAnswerId = (Number(maxA[0].max_id) || 0) + 1;

        // 3. Define Questions (Merged List)
        const questions = [
            // --- PERIOD I ---
            {
                text: "La solución de la inecuación $|x - 2| < 3$ es:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q1_Inecuacion.png",
                answers: [
                    { text: "$x < -1$", isCorrect: false },
                    { text: "$x > 5$", isCorrect: false },
                    { text: "$-1 < x < 5$", isCorrect: true },
                    { text: "$x < -1$ o $x > 5$", isCorrect: false }
                ]
            },
            {
                text: "La función lineal tiene la forma general:",
                image: null,
                answers: [
                    { text: "$f(x) = ax^2 + bx + c$", isCorrect: false },
                    { text: "$f(x) = mx + b$", isCorrect: true },
                    { text: "$f(x) = a/x$", isCorrect: false },
                    { text: "$f(x) = \\sqrt{x}$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es el vértice de la parábola dada por $y = x^2 - 4x + 3$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q3_Parabola.png",
                answers: [
                    { text: "$(2, -1)$", isCorrect: true },
                    { text: "$(-2, -1)$", isCorrect: false },
                    { text: "$(-2, 15)$", isCorrect: false },
                    { text: "$(4, 3)$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál de las siguientes funciones es exponencial?",
                image: null,
                answers: [
                    { text: "$f(x) = x^3$", isCorrect: false },
                    { text: "$f(x) = \\ln(x)$", isCorrect: false },
                    { text: "$f(x) = 2^x$", isCorrect: true },
                    { text: "$f(x) = \\sqrt{x}$", isCorrect: false }
                ]
            },
            {
                text: "Sea $f(x) = \\begin{cases} x+1 & x < 0 \\\\ x^2 & x \\geq 0 \\end{cases}$. ¿Cuál es el valor de $f(-1) + f(1)$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q5_Trozos.png",
                answers: [
                    { text: "$-1$", isCorrect: false },
                    { text: "$0$", isCorrect: false },
                    { text: "$1$", isCorrect: true },
                    { text: "$2$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál de las siguientes funciones es inyectiva en su dominio natural?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q6_Inyectiva.png",
                answers: [
                    { text: "$f(x) = x^2$", isCorrect: false },
                    { text: "$f(x) = |x|$", isCorrect: false },
                    { text: "$f(x) = x^3$", isCorrect: true },
                    { text: "$f(x) = \\sin(x)$", isCorrect: false }
                ]
            },
            {
                text: "Una función es inyectiva si:",
                image: null,
                answers: [
                    { text: "Todos los valores de y están en el dominio", isCorrect: false },
                    { text: "Distintos valores de x producen distintos valores de y", isCorrect: true },
                    { text: "Su gráfica corta el eje x una sola vez", isCorrect: false },
                    { text: "Tiene inversa siempre", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x) = x + 1$ y $g(x) = x^2$, entonces $(f \\circ g)(x)$ es:",
                image: null,
                answers: [
                    { text: "$x^2 + 1$", isCorrect: true },
                    { text: "$(x + 1)^2$", isCorrect: false },
                    { text: "$x^2 + x$", isCorrect: false },
                    { text: "$x + x^2$", isCorrect: false }
                ]
            },
            // --- PERIOD II ---
            {
                text: "El valor de $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$ es:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q9_Limite.png",
                answers: [
                    { text: "$0$", isCorrect: false },
                    { text: "$4$", isCorrect: true },
                    { text: "No existe", isCorrect: false },
                    { text: "$\\infty$", isCorrect: false }
                ]
            },
            {
                text: "Sea $f(x) = \\begin{cases} 3x-1 & x \\leq 1 \\\\ x+4 & x > 1 \\end{cases}$. ¿Cuál es el valor de $\\lim_{x \\to 1^-} f(x)$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q10_LimLateral.png",
                answers: [
                    { text: "$2$", isCorrect: true },
                    { text: "$5$", isCorrect: false },
                    { text: "No existe", isCorrect: false },
                    { text: "$0$", isCorrect: false }
                ]
            },
            {
                text: "Si $\\lim_{x \\to 0^+} f(x) = 1$ y $\\lim_{x \\to 0^-} f(x) = -1$, entonces:",
                image: null,
                answers: [
                    { text: "El límite existe", isCorrect: false },
                    { text: "El límite es 0", isCorrect: false },
                    { text: "El límite no existe", isCorrect: true },
                    { text: "La función es continua", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es la asíntota horizontal de la función $f(x) = \\frac{3x^2 - 2x}{2x^2 + 1}$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q12_Asintota.png",
                answers: [
                    { text: "$y = 0$", isCorrect: false },
                    { text: "$y = 3/2$", isCorrect: true },
                    { text: "$y = 1$", isCorrect: false },
                    { text: "No tiene", isCorrect: false }
                ]
            },
            {
                text: "Para que la función $g(x) = \\begin{cases} \\frac{x^2 - a^2}{x - a} & x \\neq a \\\\ 4 & x = a \\end{cases}$ sea continua en $x=a$, el valor de $a$ debe ser:",
                image: null,
                answers: [
                    { text: "$0$", isCorrect: false },
                    { text: "$2$", isCorrect: true },
                    { text: "$-2$", isCorrect: false },
                    { text: "Cualquier real", isCorrect: false }
                ]
            },
            {
                text: "Una función es continua en $x = a$ si:",
                image: null,
                answers: [
                    { text: "$f(a)$ existe", isCorrect: false },
                    { text: "El límite existe", isCorrect: false },
                    { text: "El límite es infinito", isCorrect: false },
                    { text: "$\\lim_{x \\to a} f(x) = f(a)$", isCorrect: true }
                ]
            },
            {
                text: "La derivada de una función en un punto representa:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q15_DerivadaConcepto.png",
                answers: [
                    { text: "El área bajo la curva", isCorrect: false },
                    { text: "La pendiente de la recta tangente", isCorrect: true },
                    { text: "El valor máximo de la función", isCorrect: false },
                    { text: "La asíntota horizontal", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = \\sqrt{x}$ en $x=4$, usando la definición, representa:",
                image: null,
                answers: [
                    { text: "La pendiente de la recta tangente a la curva en el punto $(4, 2)$", isCorrect: true },
                    { text: "La ecuación de la recta secante", isCorrect: false },
                    { text: "La rapidez media de cambio", isCorrect: false },
                    { text: "El área bajo la curva en $x=4$", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = x^3$ es:",
                image: null,
                answers: [
                    { text: "$3x^2$", isCorrect: true },
                    { text: "$x^2$", isCorrect: false },
                    { text: "$3x$", isCorrect: false },
                    { text: "$x^3$", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = (x^3 + 2x)(x - 5)$ es:",
                image: null,
                answers: [
                    { text: "$3x^2 + 2$", isCorrect: false },
                    { text: "$(3x^2+2)(1)$", isCorrect: false },
                    { text: "$4x^3 - 15x^2 + 4x - 10$", isCorrect: true },
                    { text: "$x^3 + 2x + 3x^2 + 2$", isCorrect: false }
                ]
            },
            {
                text: "Si $y = \\sin(3x^2)$, entonces $\\frac{dy}{dx} =$",
                image: null,
                answers: [
                    { text: "$\\cos(3x^2)$", isCorrect: false },
                    { text: "$6x \\cos(3x^2)$", isCorrect: true },
                    { text: "$\\cos(6x)$", isCorrect: false },
                    { text: "$3x \\cos(3x^2)$", isCorrect: false }
                ]
            },
            // --- PERIOD III ---
            {
                text: "Los puntos críticos de la función $f(x) = x^3 - 3x$ son:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q20_PuntosCriticos.png",
                answers: [
                    { text: "$x = 0$", isCorrect: false },
                    { text: "$x = \\pm 1$", isCorrect: true },
                    { text: "$x = \\pm \\sqrt{3}$", isCorrect: false },
                    { text: "No tiene", isCorrect: false }
                ]
            },
            {
                text: "Si $f'(x) = 0$ en un punto y $f''(x) < 0$, entonces el punto es:",
                image: null,
                answers: [
                    { text: "Mínimo relativo", isCorrect: false },
                    { text: "Máximo relativo", isCorrect: true },
                    { text: "Punto de inflexión", isCorrect: false },
                    { text: "Asíntota vertical", isCorrect: false }
                ]
            },
            {
                text: "Se desea construir una caja sin tapa a partir de una lámina cuadrada de 30 cm de lado, cortando cuadrados de lado $x$ en las esquinas. La función volumen es:",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q22_Caja.png",
                answers: [
                    { text: "$V(x) = x(30 - x)^2$", isCorrect: false },
                    { text: "$V(x) = x(30 - 2x)^2$", isCorrect: true },
                    { text: "$V(x) = 4x^3 - 120x^2 + 900x$", isCorrect: false },
                    { text: "$V(x) = 30x^2 - 2x^3$", isCorrect: false }
                ]
            }
        ];

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

        // Update total questions count
        await db.execute(sql`UPDATE quizzes SET total_questions = (SELECT COUNT(*) FROM questions WHERE quiz_id = ${quizId}) WHERE id = ${quizId}`);
        console.log("Updated total questions count.");

        console.log("Done inserting Final Calculus questions!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
