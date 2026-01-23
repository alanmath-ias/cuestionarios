
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

        console.log(`Starting RE-CREATION of Question Bank for Quiz ${quizId}...`);

        // 1. Cleanup existing questions AND answers for this quiz
        const questionsToDelete = await db.execute(sql`SELECT id FROM questions WHERE quiz_id = ${quizId}`);
        const qIds = questionsToDelete.map(q => q.id);

        if (qIds.length > 0) {
            console.log(`Found ${qIds.length} existing questions. Deleting...`);
            for (const qId of qIds) {
                await db.execute(sql`DELETE FROM answers WHERE question_id = ${qId}`);
            }
            await db.execute(sql`DELETE FROM questions WHERE quiz_id = ${quizId}`);
        }

        // 2. Get Max IDs
        const maxQ = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        let nextQuestionId = (Number(maxQ[0].max_id) || 0) + 1;

        const maxA = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);
        let nextAnswerId = (Number(maxA[0].max_id) || 0) + 1;

        // 3. Define Questions Pool (Mixed Difficulty)
        // Difficulty 1: Basic / Period I
        // Difficulty 2: Intermediate / Period II
        // Difficulty 3: Advanced / Period III

        const questions = [
            // --- DIFFICULTY 1 (Basic) ---
            // Existing
            {
                text: "La solución de la inecuación $|x - 2| < 3$ es:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q1_Inecuacion.png",
                difficulty: 1,
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
                difficulty: 1,
                answers: [
                    { text: "$f(x) = ax^2 + bx + c$", isCorrect: false },
                    { text: "$f(x) = mx + b$", isCorrect: true },
                    { text: "$f(x) = a/x$", isCorrect: false },
                    { text: "$f(x) = \\sqrt{x}$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál de las siguientes funciones es exponencial?",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$f(x) = x^3$", isCorrect: false },
                    { text: "$f(x) = \\ln(x)$", isCorrect: false },
                    { text: "$f(x) = 2^x$", isCorrect: true },
                    { text: "$f(x) = \\sqrt{x}$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es el dominio de la función $f(x) = \\frac{1}{x-3}$?",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "Todos los reales", isCorrect: false },
                    { text: "$\\mathbb{R} - \\{3\\}$", isCorrect: true },
                    { text: "$\\mathbb{R} - \\{0\\}$", isCorrect: false },
                    { text: "$(3, \\infty)$", isCorrect: false }
                ]
            },
            {
                text: "El valor de $\\lim_{x \\to 2} (3x - 5)$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$1$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$-1$", isCorrect: false },
                    { text: "$6$", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x) = x^2$, entonces $f(x+h)$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$x^2 + h$", isCorrect: false },
                    { text: "$x^2 + h^2$", isCorrect: false },
                    { text: "$x^2 + 2xh + h^2$", isCorrect: true },
                    { text: "$2x + h$", isCorrect: false }
                ]
            },
            {
                text: "La derivada de una constante $f(x) = k$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$k$", isCorrect: false },
                    { text: "$1$", isCorrect: false },
                    { text: "$0$", isCorrect: true },
                    { text: "$x$", isCorrect: false }
                ]
            },
            {
                text: "Una función es inyectiva si:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "Todos los valores de y están en el dominio", isCorrect: false },
                    { text: "Distintos valores de x producen distintos valores de y", isCorrect: true },
                    { text: "Su gráfica corta el eje x una sola vez", isCorrect: false },
                    { text: "Tiene inversa siempre", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = x^3$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$3x^2$", isCorrect: true },
                    { text: "$x^2$", isCorrect: false },
                    { text: "$3x$", isCorrect: false },
                    { text: "$x^3$", isCorrect: false }
                ]
            },
            {
                text: "Resuelve la inecuación $2x - 5 > 3$.",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$x > 4$", isCorrect: true },
                    { text: "$x < 4$", isCorrect: false },
                    { text: "$x > 1$", isCorrect: false },
                    { text: "$x > -1$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es el vértice de la parábola dada por $y = x^2 - 4x + 3$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q3_Parabola.png",
                difficulty: 1,
                answers: [
                    { text: "$(2, -1)$", isCorrect: true },
                    { text: "$(-2, -1)$", isCorrect: false },
                    { text: "$(-2, 15)$", isCorrect: false },
                    { text: "$(4, 3)$", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x) = x + 1$ y $g(x) = x^2$, entonces $(f \\circ g)(x)$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$x^2 + 1$", isCorrect: true },
                    { text: "$(x + 1)^2$", isCorrect: false },
                    { text: "$x^2 + x$", isCorrect: false },
                    { text: "$x + x^2$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál de las siguientes gráficas representa una función par?",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$f(x) = x^2$", isCorrect: true },
                    { text: "$f(x) = x^3$", isCorrect: false },
                    { text: "$f(x) = \\sin(x)$", isCorrect: false },
                    { text: "$f(x) = e^x$", isCorrect: false }
                ]
            },
            {
                text: "El dominio de $f(x) = \\sqrt{x-2}$ es:",
                image: null,
                difficulty: 1,
                answers: [
                    { text: "$[2, \\infty)$", isCorrect: true },
                    { text: "$(2, \\infty)$", isCorrect: false },
                    { text: "$(-\\infty, 2]$", isCorrect: false },
                    { text: "$\\mathbb{R}$", isCorrect: false }
                ]
            },

            // --- DIFFICULTY 2 (Intermediate) ---
            {
                text: "Sea $f(x) = \\begin{cases} x+1 & x < 0 \\\\ x^2 & x \\geq 0 \\end{cases}$. ¿Cuál es el valor de $f(-1) + f(1)$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q5_Trozos.png",
                difficulty: 2,
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
                difficulty: 2,
                answers: [
                    { text: "$f(x) = x^2$", isCorrect: false },
                    { text: "$f(x) = |x|$", isCorrect: false },
                    { text: "$f(x) = x^3$", isCorrect: true },
                    { text: "$f(x) = \\sin(x)$", isCorrect: false }
                ]
            },
            {
                text: "El valor de $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$ es:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q9_Limite.png",
                difficulty: 2,
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
                difficulty: 2,
                answers: [
                    { text: "$2$", isCorrect: true },
                    { text: "$5$", isCorrect: false },
                    { text: "No existe", isCorrect: false },
                    { text: "$0$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es la asíntota horizontal de la función $f(x) = \\frac{3x^2 - 2x}{2x^2 + 1}$?",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q12_Asintota.png",
                difficulty: 2,
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
                difficulty: 2,
                answers: [
                    { text: "$0$", isCorrect: false },
                    { text: "$2$", isCorrect: true },
                    { text: "$-2$", isCorrect: false },
                    { text: "Cualquier real", isCorrect: false }
                ]
            },
            {
                text: "La derivada de una función en un punto representa:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q15_DerivadaConcepto.png",
                difficulty: 2,
                answers: [
                    { text: "El área bajo la curva", isCorrect: false },
                    { text: "La pendiente de la recta tangente", isCorrect: true },
                    { text: "El valor máximo de la función", isCorrect: false },
                    { text: "La asíntota horizontal", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = (x^3 + 2x)(x - 5)$ es:",
                image: null,
                difficulty: 2,
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
                difficulty: 2,
                answers: [
                    { text: "$\\cos(3x^2)$", isCorrect: false },
                    { text: "$6x \\cos(3x^2)$", isCorrect: true },
                    { text: "$\\cos(6x)$", isCorrect: false },
                    { text: "$3x \\cos(3x^2)$", isCorrect: false }
                ]
            },
            {
                text: "Calcula el límite: $\\lim_{x \\to \\infty} \\frac{2x^3 + 1}{5x^3 - x}$.",
                image: null,
                difficulty: 2,
                answers: [
                    { text: "$2/5$", isCorrect: true },
                    { text: "$\\infty$", isCorrect: false },
                    { text: "$0$", isCorrect: false },
                    { text: "$2$", isCorrect: false }
                ]
            },
            {
                text: "Encuentra la ecuación de la recta tangente a $y = x^2$ en $x=1$.",
                image: null,
                difficulty: 2,
                answers: [
                    { text: "$y = 2x - 1$", isCorrect: true },
                    { text: "$y = 2x$", isCorrect: false },
                    { text: "$y = x + 1$", isCorrect: false },
                    { text: "$y = 2x + 1$", isCorrect: false }
                ]
            },
            {
                text: "Si $x^2 + y^2 = 25$, entonces $y'$ (derivada implícita) es:",
                image: null,
                difficulty: 2,
                answers: [
                    { text: "$-x/y$", isCorrect: true },
                    { text: "$x/y$", isCorrect: false },
                    { text: "$-y/x$", isCorrect: false },
                    { text: "$2x$", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = e^{2x}$ es:",
                image: null,
                difficulty: 2,
                answers: [
                    { text: "$2e^{2x}$", isCorrect: true },
                    { text: "$e^{2x}$", isCorrect: false },
                    { text: "$e^x$", isCorrect: false },
                    { text: "$2xe^{2x}$", isCorrect: false }
                ]
            },
            {
                text: "Calcula $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$.",
                image: null,
                difficulty: 2,
                answers: [
                    { text: "$1$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$\\infty$", isCorrect: false },
                    { text: "No existe", isCorrect: false }
                ]
            },

            // --- DIFFICULTY 3 (Advanced) ---
            {
                text: "Los puntos críticos de la función $f(x) = x^3 - 3x$ son:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q20_PuntosCriticos.png",
                difficulty: 3,
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
                difficulty: 3,
                answers: [
                    { text: "Mínimo relativo", isCorrect: false },
                    { text: "Máximo relativo", isCorrect: true },
                    { text: "Punto de inflexión", isCorrect: false },
                    { text: "Asíntota vertical", isCorrect: false }
                ]
            },
            {
                text: "Se desea construir una caja sin tapa a partir de una lámina cuadrada de 30 cm de lado, cortando cuadrados de lado $x$ en las esquinas. La función volumen es:",
                image: "https://imagenes.alanmath.com/test_diagnosticos/calculo/C21_P281_Q22_Caja.png",
                difficulty: 3,
                answers: [
                    { text: "$V(x) = x(30 - x)^2$", isCorrect: false },
                    { text: "$V(x) = x(30 - 2x)^2$", isCorrect: true },
                    { text: "$V(x) = 4x^3 - 120x^2 + 900x$", isCorrect: false },
                    { text: "$V(x) = 30x^2 - 2x^3$", isCorrect: false }
                ]
            },
            {
                text: "La derivada de $f(x) = \\ln(x^2 + 1)$ es:",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$\\frac{2x}{x^2 + 1}$", isCorrect: true },
                    { text: "$\\frac{1}{x^2 + 1}$", isCorrect: false },
                    { text: "$\\frac{2x}{x}$", isCorrect: false },
                    { text: "$2x$", isCorrect: false }
                ]
            },
            {
                text: "Si el radio de un círculo crece a razón de 2 cm/s, ¿a qué razón crece el área cuando $r=10$ cm?",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$40\\pi$ cm$^2$/s", isCorrect: true },
                    { text: "$20\\pi$ cm$^2$/s", isCorrect: false },
                    { text: "$100\\pi$ cm$^2$/s", isCorrect: false },
                    { text: "$2\\pi$ cm$^2$/s", isCorrect: false }
                ]
            },
            {
                text: "Determina los intervalos de concavidad hacia arriba para $f(x) = x^3 - 6x^2$.",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$(2, \\infty)$", isCorrect: true },
                    { text: "$(-\\infty, 2)$", isCorrect: false },
                    { text: "$(0, 4)$", isCorrect: false },
                    { text: "$(-\\infty, 0)$", isCorrect: false }
                ]
            },
            {
                text: "Calcula la segunda derivada de $f(x) = \\sin(2x)$.",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$-4\\sin(2x)$", isCorrect: true },
                    { text: "$2\\cos(2x)$", isCorrect: false },
                    { text: "$-2\\sin(2x)$", isCorrect: false },
                    { text: "$4\\cos(2x)$", isCorrect: false }
                ]
            },
            {
                text: "Encuentra el valor máximo de $f(x) = -x^2 + 4x - 5$.",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$-1$", isCorrect: true },
                    { text: "$2$", isCorrect: false },
                    { text: "$-5$", isCorrect: false },
                    { text: "$0$", isCorrect: false }
                ]
            },
            {
                text: "Si $f(x)$ es continua en $[a,b]$ y $f(a) < 0 < f(b)$, entonces por el Teorema del Valor Intermedio:",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "Existe $c$ en $(a,b)$ tal que $f(c) = 0$", isCorrect: true },
                    { text: "$f(x)$ es creciente", isCorrect: false },
                    { text: "$f(x)$ tiene un máximo", isCorrect: false },
                    { text: "$f'(c) = 0$", isCorrect: false }
                ]
            },
            {
                text: "Calcula $\\lim_{x \to 0} \\frac{1 - \\cos(x)}{x^2}$.",
                image: null,
                difficulty: 3,
                answers: [
                    { text: "$1/2$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$1$", isCorrect: false },
                    { text: "$\\infty$", isCorrect: false }
                ]
            }
        ];

        for (const q of questions) {
            await db.execute(sql`
                INSERT INTO questions (id, quiz_id, content, image_url, type, difficulty, points)
                VALUES (${nextQuestionId}, ${quizId}, ${q.text}, ${q.image}, 'multiple_choice', ${q.difficulty}, 10)
            `);
            console.log(`Inserted Question ${nextQuestionId} (Diff: ${q.difficulty})`);

            for (const a of q.answers) {
                await db.execute(sql`
                    INSERT INTO answers (id, question_id, content, is_correct)
                    VALUES (${nextAnswerId}, ${nextQuestionId}, ${a.text}, ${a.isCorrect})
                `);
                nextAnswerId++;
            }
            nextQuestionId++;
        }

        // Update total questions count (for display) and time_limit (1500 seconds = 25 mins)
        // Note: total_questions in quiz table is usually the number of questions *displayed* to the user in these diagnostic tests,
        // but sometimes it reflects the pool size. 
        // Based on create_trig_quiz.ts, it sets totalQuestions: 12.
        // So we should set it to 12.
        await db.execute(sql`
            UPDATE quizzes 
            SET total_questions = 12,
                time_limit = 1500
            WHERE id = ${quizId}
        `);
        console.log("Updated quiz configuration (12 questions, 25 mins).");

        console.log("Done recreating Quiz 281 Question Bank!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
