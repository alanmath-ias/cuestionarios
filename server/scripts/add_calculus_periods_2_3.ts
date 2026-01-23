
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

        // Get current max IDs
        const maxQ = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        let nextQuestionId = (Number(maxQ[0].max_id) || 0) + 1;

        const maxA = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);
        let nextAnswerId = (Number(maxA[0].max_id) || 0) + 1;

        // Period II Questions
        const p2_questions = [
            {
                text: "Observa la gráfica. ¿Cuál es el valor del límite $\\lim_{x \\to 2} f(x)$?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q11_LimiteGrafico.png",
                answers: [
                    { text: "$3$", isCorrect: true },
                    { text: "$1$", isCorrect: false },
                    { text: "No existe", isCorrect: false },
                    { text: "$2$", isCorrect: false }
                ]
            },
            {
                text: "Calcula el límite usando propiedades: $\\lim_{x \\to 3} (2x^2 - 5x + 1)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q12_PropiedadesLim.png",
                answers: [
                    { text: "$4$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$10$", isCorrect: false },
                    { text: "$-2$", isCorrect: false }
                ]
            },
            {
                text: "Dada $f(x) = \\begin{cases} x+1 & x < 1 \\\\ x^2 & x \\geq 1 \\end{cases}$, calcula $\\lim_{x \\to 1^-} f(x)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q13_LimiteLateral.png",
                answers: [
                    { text: "$2$", isCorrect: true },
                    { text: "$1$", isCorrect: false },
                    { text: "$0$", isCorrect: false },
                    { text: "No existe", isCorrect: false }
                ]
            },
            {
                text: "Resuelve el límite indeterminado: $\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q14_TecnicaLimite.png",
                answers: [
                    { text: "$4$", isCorrect: true },
                    { text: "$0$", isCorrect: false },
                    { text: "$2$", isCorrect: false },
                    { text: "Indeterminado", isCorrect: false }
                ]
            },
            {
                text: "Identifica la asíntota vertical de la función $f(x) = \\frac{1}{x-3}$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q15_Asintota.png",
                answers: [
                    { text: "$x = 3$", isCorrect: true },
                    { text: "$y = 3$", isCorrect: false },
                    { text: "$x = 0$", isCorrect: false },
                    { text: "$y = 0$", isCorrect: false }
                ]
            },
            {
                text: "Calcula el límite trigonométrico: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q16_LimTrig.png",
                answers: [
                    { text: "$5$", isCorrect: true },
                    { text: "$1$", isCorrect: false },
                    { text: "$0$", isCorrect: false },
                    { text: "$1/5$", isCorrect: false }
                ]
            },
            {
                text: "¿En qué punto es discontinua la función mostrada en la gráfica?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q17_Continuidad.png",
                answers: [
                    { text: "$x = 1$", isCorrect: true },
                    { text: "$x = 0$", isCorrect: false },
                    { text: "$x = 2$", isCorrect: false },
                    { text: "Es continua en todo R", isCorrect: false }
                ]
            },
            {
                text: "La derivada de una función en un punto representa geométricamente:",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q18_ConceptoDerivada.png",
                answers: [
                    { text: "La pendiente de la recta tangente en ese punto.", isCorrect: true },
                    { text: "El área bajo la curva.", isCorrect: false },
                    { text: "La pendiente de la recta secante.", isCorrect: false },
                    { text: "El valor de la función en ese punto.", isCorrect: false }
                ]
            },
            {
                text: "Calcula la derivada de $f(x) = 3x^4 - 2x^2 + 5$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q19_DerivadaPotencia.png",
                answers: [
                    { text: "$12x^3 - 4x$", isCorrect: true },
                    { text: "$12x^4 - 4x^2$", isCorrect: false },
                    { text: "$3x^3 - 2x$", isCorrect: false },
                    { text: "$4x^3 - 2x$", isCorrect: false }
                ]
            },
            {
                text: "Aplica la regla del producto para derivar $f(x) = x e^x$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q20_ReglaProducto.png",
                answers: [
                    { text: "$e^x(x + 1)$", isCorrect: true },
                    { text: "$e^x$", isCorrect: false },
                    { text: "$x e^x$", isCorrect: false },
                    { text: "$e^x + 1$", isCorrect: false }
                ]
            },
            {
                text: "Usa la regla de la cadena para derivar $f(x) = (2x + 1)^3$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q21_ReglaCadena.png",
                answers: [
                    { text: "$6(2x + 1)^2$", isCorrect: true },
                    { text: "$3(2x + 1)^2$", isCorrect: false },
                    { text: "$3(2x + 1)^2 \\cdot 2x$", isCorrect: false },
                    { text: "$6(2x + 1)$", isCorrect: false }
                ]
            },
            {
                text: "Encuentra la derivada implícita $y'$ de la ecuación $x^2 + y^2 = 25$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q22_DerivadaImplicita.png",
                answers: [
                    { text: "$-\\frac{x}{y}$", isCorrect: true },
                    { text: "$\\frac{x}{y}$", isCorrect: false },
                    { text: "$-\\frac{y}{x}$", isCorrect: false },
                    { text: "$2x + 2y$", isCorrect: false }
                ]
            },
            {
                text: "Calcula la segunda derivada $f''(x)$ si $f(x) = \\sin(x)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q23_OrdenSuperior.png",
                answers: [
                    { text: "$-\\sin(x)$", isCorrect: true },
                    { text: "$\\cos(x)$", isCorrect: false },
                    { text: "$-\\cos(x)$", isCorrect: false },
                    { text: "$\\sin(x)$", isCorrect: false }
                ]
            }
        ];

        // Period III Questions
        const p3_questions = [
            {
                text: "Observa la gráfica. ¿En qué intervalo la función es estrictamente creciente?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q24_Crecimiento.png",
                answers: [
                    { text: "$(0, 2)$", isCorrect: true },
                    { text: "$(-\\infty, 0)$", isCorrect: false },
                    { text: "$(2, \\infty)$", isCorrect: false },
                    { text: "$(-1, 1)$", isCorrect: false }
                ]
            },
            {
                text: "Determina la concavidad de $f(x) = x^3$ en el intervalo $(0, \\infty)$.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q25_Concavidad.png",
                answers: [
                    { text: "Cóncava hacia arriba", isCorrect: true },
                    { text: "Cóncava hacia abajo", isCorrect: false },
                    { text: "No tiene concavidad", isCorrect: false },
                    { text: "Constante", isCorrect: false }
                ]
            },
            {
                text: "Según el criterio de la segunda derivada, si $f'(c) = 0$ y $f''(c) > 0$, entonces en $x=c$ hay un:",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q26_Criterio2da.png",
                answers: [
                    { text: "Mínimo local", isCorrect: true },
                    { text: "Máximo local", isCorrect: false },
                    { text: "Punto de inflexión", isCorrect: false },
                    { text: "Asíntota", isCorrect: false }
                ]
            },
            {
                text: "Identifica el máximo absoluto de la función en el intervalo cerrado mostrado.",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q27_MaximosMinimos.png",
                answers: [
                    { text: "El punto más alto de la gráfica", isCorrect: true },
                    { text: "El punto más bajo", isCorrect: false },
                    { text: "Donde la derivada es cero", isCorrect: false },
                    { text: "Los extremos del intervalo solamente", isCorrect: false }
                ]
            },
            {
                text: "Se quiere cercar un terreno rectangular con 20m de valla. ¿Cuál es el área máxima posible?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q28_Optimizacion.png",
                answers: [
                    { text: "$25 m^2$", isCorrect: true },
                    { text: "$20 m^2$", isCorrect: false },
                    { text: "$100 m^2$", isCorrect: false },
                    { text: "$10 m^2$", isCorrect: false }
                ]
            },
            {
                text: "El radio de un círculo aumenta a razón de 1 cm/s. ¿A qué razón aumenta el área cuando r = 5 cm?",
                image: "https://imagenes.alanmath.com/calculo/C21_P281_Q29_RazonCambio.png",
                answers: [
                    { text: "$10\\pi$ cm²/s", isCorrect: true },
                    { text: "$5\\pi$ cm²/s", isCorrect: false },
                    { text: "$25\\pi$ cm²/s", isCorrect: false },
                    { text: "$2\\pi$ cm²/s", isCorrect: false }
                ]
            }
        ];

        const all_questions = [...p2_questions, ...p3_questions];

        for (const q of all_questions) {
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

        console.log("Done inserting Period II and III questions!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
