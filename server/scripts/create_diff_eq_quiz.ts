
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

        const quizId = 282;
        const categoryId = 21;
        const subcategoryId = 254;

        console.log(`Starting creation of Differential Equations Quiz ${quizId}...`);

        // 1. Ensure Subcategory Exists
        const subCheck = await db.execute(sql`SELECT id FROM subcategories WHERE id = ${subcategoryId}`);
        if (subCheck.length === 0) {
            console.log(`Creating Subcategory ${subcategoryId}...`);
            await db.execute(sql`
                INSERT INTO subcategories (id, name, category_id, description)
                VALUES (${subcategoryId}, 'Ecuaciones Diferenciales', ${categoryId}, 'Diagnóstico de Ecuaciones Diferenciales')
             `);
        }

        // 2. Cleanup existing quiz/questions
        const questionsToDelete = await db.execute(sql`SELECT id FROM questions WHERE quiz_id = ${quizId}`);
        const qIds = questionsToDelete.map(q => q.id);

        if (qIds.length > 0) {
            console.log(`Found ${qIds.length} existing questions. Deleting...`);
            for (const qId of qIds) {
                await db.execute(sql`DELETE FROM answers WHERE question_id = ${qId}`);
            }
            await db.execute(sql`DELETE FROM questions WHERE quiz_id = ${quizId}`);
        }

        // Delete quiz if exists to reset metadata
        await db.execute(sql`DELETE FROM quizzes WHERE id = ${quizId}`);

        // 3. Create Quiz
        await db.execute(sql`
            INSERT INTO quizzes (id, title, description, category_id, subcategory_id, difficulty, time_limit, total_questions, is_public)
            VALUES (${quizId}, 'Diagnóstico de Ecuaciones Diferenciales', 'Evalúa tus conocimientos en EDOs de primer y segundo orden, aplicaciones y transformadas.', ${categoryId}, ${subcategoryId}, 'intermediate', 1500, 12, false)
        `);
        console.log("Quiz created.");

        // 4. Get Max IDs
        const maxQ = await db.execute(sql`SELECT MAX(id) as max_id FROM questions`);
        let nextQuestionId = (Number(maxQ[0].max_id) || 0) + 1;

        const maxA = await db.execute(sql`SELECT MAX(id) as max_id FROM answers`);
        let nextAnswerId = (Number(maxA[0].max_id) || 0) + 1;

        // 5. Define Questions Pool
        const questions = [
            // --- BLOCK I & II: FUNDAMENTALS & FIRST ORDER (Basic/Intermediate) ---
            {
                text: "¿Cuál de las siguientes es una ecuación diferencial?",
                difficulty: 1,
                answers: [
                    { text: "$y' = 3x^2$", isCorrect: true },
                    { text: "$x^2 + y = 0$", isCorrect: false },
                    { text: "$2x - 5 = 0$", isCorrect: false },
                    { text: "$x^3 + 4 = 7$", isCorrect: false }
                ]
            },
            {
                text: "Una ecuación diferencial es parcial si:",
                difficulty: 1,
                answers: [
                    { text: "Involucra derivadas parciales respecto a más de una variable independiente", isCorrect: true },
                    { text: "Tiene derivadas de orden mayor que uno", isCorrect: false },
                    { text: "No puede resolverse analíticamente", isCorrect: false },
                    { text: "Es no lineal", isCorrect: false }
                ]
            },
            {
                text: "El orden de la ecuación $y'' + 3y' - y = 0$ es:",
                difficulty: 1,
                answers: [
                    { text: "2", isCorrect: true },
                    { text: "1", isCorrect: false },
                    { text: "3", isCorrect: false },
                    { text: "No tiene orden", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál de las siguientes ecuaciones es lineal?",
                difficulty: 1,
                answers: [
                    { text: "$y' + y = x$", isCorrect: true },
                    { text: "$y' + y^2 = x$", isCorrect: false },
                    { text: "$(y')^2 = x$", isCorrect: false },
                    { text: "$yy' = x$", isCorrect: false }
                ]
            },
            {
                text: "La solución general de una ecuación diferencial de primer orden contiene:",
                difficulty: 1,
                answers: [
                    { text: "Una constante arbitraria", isCorrect: true },
                    { text: "Valores numéricos fijos", isCorrect: false },
                    { text: "Solo una función específica", isCorrect: false },
                    { text: "Ninguna constante", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál ecuación es separable?",
                difficulty: 1,
                answers: [
                    { text: "$y' = xy$", isCorrect: true },
                    { text: "$y' = x + y$", isCorrect: false },
                    { text: "$y' + y = x$", isCorrect: false },
                    { text: "$y' = x/y + 1$", isCorrect: false }
                ]
            },
            {
                text: "Una ecuación diferencial es homogénea si puede escribirse como:",
                difficulty: 1,
                answers: [
                    { text: "$y' = f(x/y)$", isCorrect: true },
                    { text: "$y' = f(x) + g(y)$", isCorrect: false },
                    { text: "$y' + y = x$", isCorrect: false },
                    { text: "$y' = f(x)$", isCorrect: false }
                ]
            },
            {
                text: "Una ecuación $M(x,y)dx + N(x,y)dy = 0$ es exacta si:",
                difficulty: 2,
                answers: [
                    { text: "$\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}$", isCorrect: true },
                    { text: "$\\frac{\\partial M}{\\partial x} = \\frac{\\partial N}{\\partial y}$", isCorrect: false },
                    { text: "$M = N$", isCorrect: false },
                    { text: "Depende solo de x", isCorrect: false }
                ]
            },
            {
                text: "La forma estándar de una ecuación diferencial lineal de primer orden es:",
                difficulty: 1,
                answers: [
                    { text: "$y' + P(x)y = Q(x)$", isCorrect: true },
                    { text: "$y' = xy$", isCorrect: false },
                    { text: "$Mdx + Ndy = 0$", isCorrect: false },
                    { text: "$y'' + ay = 0$", isCorrect: false }
                ]
            },
            {
                text: "Un modelo de crecimiento exponencial cumple la ecuación:",
                difficulty: 1,
                answers: [
                    { text: "$y' = ky$", isCorrect: true },
                    { text: "$y' = ky^2$", isCorrect: false },
                    { text: "$y' = k/x$", isCorrect: false },
                    { text: "$y' = k + y$", isCorrect: false }
                ]
            },
            {
                text: "La solución general de $y' = 2x$ es:",
                difficulty: 1,
                answers: [
                    { text: "$y = x^2 + C$", isCorrect: true },
                    { text: "$y = x^2$", isCorrect: false },
                    { text: "$y = 2x + C$", isCorrect: false },
                    { text: "$y = x^2 + 2x + C$", isCorrect: false }
                ]
            },
            {
                text: "La solución general de $y' = x/y$ es:",
                difficulty: 2,
                answers: [
                    { text: "$y^2 = x^2 + C$", isCorrect: true },
                    { text: "$y = x^2/2 + C$", isCorrect: false },
                    { text: "$y = \\pm \\sqrt{x^2 + C}$", isCorrect: false }, // Duplicate logically but distinct text
                    { text: "$\\ln|y| = \\ln|x| + C$", isCorrect: false }
                ]
            },
            {
                text: "¿Cuál es una ecuación homogénea de grado cero?",
                difficulty: 2,
                answers: [
                    { text: "$y' = \\frac{x^2 + y^2}{xy}$", isCorrect: true },
                    { text: "$y' = x^2 + y^2$", isCorrect: false },
                    { text: "$y' = e^{x+y}$", isCorrect: false },
                    { text: "$y' = \\frac{y}{x+1}$", isCorrect: false }
                ]
            },
            {
                text: "Para la ecuación lineal $y' + 2xy = x$, un factor integrante es:",
                difficulty: 2,
                answers: [
                    { text: "$e^{x^2}$", isCorrect: true },
                    { text: "$e^x$", isCorrect: false },
                    { text: "$e^{2x}$", isCorrect: false },
                    { text: "$e^{2x^2}$", isCorrect: false }
                ]
            },
            {
                text: "En la ley de enfriamiento de Newton $T' = k(T - T_a)$, la constante k es:",
                difficulty: 1,
                answers: [
                    { text: "Negativa", isCorrect: true },
                    { text: "Positiva", isCorrect: false },
                    { text: "Cero", isCorrect: false },
                    { text: "Variable", isCorrect: false }
                ]
            },
            {
                text: "En un circuito RC sin fuente, la carga decae:",
                difficulty: 2,
                answers: [
                    { text: "Exponencialmente", isCorrect: true },
                    { text: "Linealmente", isCorrect: false },
                    { text: "Cuadráticamente", isCorrect: false },
                    { text: "No cambia", isCorrect: false }
                ]
            },

            // --- BLOCK III & IV: SECOND ORDER & APPLICATIONS (Intermediate/Advanced) ---
            {
                text: "Una ecuación diferencial lineal homogénea de segundo orden con coeficientes constantes tiene la forma:",
                difficulty: 2,
                answers: [
                    { text: "$ay'' + by' + cy = 0$", isCorrect: true },
                    { text: "$ay' + by = 0$", isCorrect: false },
                    { text: "$y'' = f(x,y)$", isCorrect: false },
                    { text: "$(y'')^2 + y = 0$", isCorrect: false }
                ]
            },
            {
                text: "Si la ecuación característica tiene raíces complejas $\\alpha \\pm \\beta i$, la solución general es:",
                difficulty: 2,
                answers: [
                    { text: "$e^{\\alpha x}(C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x))$", isCorrect: true },
                    { text: "$C_1 e^{\\alpha x} + C_2 e^{\\beta x}$", isCorrect: false },
                    { text: "$C_1 x + C_2$", isCorrect: false },
                    { text: "$C_1 e^x$", isCorrect: false }
                ]
            },
            {
                text: "El movimiento armónico simple está asociado a una ecuación del tipo:",
                difficulty: 2,
                answers: [
                    { text: "$y'' + ky = 0$", isCorrect: true },
                    { text: "$y' + ky = 0$", isCorrect: false },
                    { text: "$y'' + ky' = 0$", isCorrect: false },
                    { text: "$(y'')^2 + y = 0$", isCorrect: false }
                ]
            },
            {
                text: "La solución general de $y'' - y = 0$ es:",
                difficulty: 2,
                answers: [
                    { text: "$C_1 e^x + C_2 e^{-x}$", isCorrect: true },
                    { text: "$C_1 \\cos x + C_2 \\sin x$", isCorrect: false },
                    { text: "$(C_1 + C_2 x)e^x$", isCorrect: false },
                    { text: "$e^x(C_1 \\cos x + C_2 \\sin x)$", isCorrect: false }
                ]
            },
            {
                text: "Si las raíces características son $r = 2 \\pm 3i$, la solución es:",
                difficulty: 2,
                answers: [
                    { text: "$e^{2x}(C_1 \\cos 3x + C_2 \\sin 3x)$", isCorrect: true },
                    { text: "$e^{3x}(C_1 \\cos 2x + C_2 \\sin 2x)$", isCorrect: false },
                    { text: "$C_1 e^{2x} + C_2 e^{3x}$", isCorrect: false },
                    { text: "$e^{2x}(C_1 + C_2 x)$", isCorrect: false }
                ]
            },
            {
                text: "Para $y'' + y = 3x^2$, una forma de solución particular es:",
                difficulty: 3,
                answers: [
                    { text: "$Ax^2 + Bx + C$", isCorrect: true },
                    { text: "$Ae^x$", isCorrect: false },
                    { text: "$A \\cos x + B \\sin x$", isCorrect: false },
                    { text: "$x(Ax^2 + Bx + C)$", isCorrect: false }
                ]
            },
            {
                text: "Un campo direccional representa:",
                difficulty: 1,
                answers: [
                    { text: "Pendientes de soluciones en distintos puntos", isCorrect: true },
                    { text: "Soluciones exactas de la ecuación", isCorrect: false },
                    { text: "Valores máximos de la función", isCorrect: false },
                    { text: "Asíntotas de la solución", isCorrect: false }
                ]
            },
            {
                text: "Un punto de equilibrio es asintóticamente estable si:",
                difficulty: 3,
                answers: [
                    { text: "Todas las soluciones cercanas se acercan a él cuando $t \\to \\infty$", isCorrect: true },
                    { text: "Todas las soluciones cercanas se alejan de él", isCorrect: false },
                    { text: "Las soluciones oscilan alrededor de él", isCorrect: false },
                    { text: "La derivada es positiva en ese punto", isCorrect: false }
                ]
            },
            {
                text: "La Transformada de Laplace se usa principalmente para:",
                difficulty: 2,
                answers: [
                    { text: "Resolver ecuaciones diferenciales con condiciones iniciales", isCorrect: true },
                    { text: "Resolver ecuaciones algebraicas", isCorrect: false },
                    { text: "Factorizar polinomios", isCorrect: false },
                    { text: "Estudiar límites", isCorrect: false }
                ]
            },

            // --- NEW QUESTIONS TO FILL TOPICS ---
            // Euler-Cauchy
            {
                text: "La ecuación de Euler-Cauchy tiene la forma:",
                difficulty: 3,
                answers: [
                    { text: "$x^2 y'' + ax y' + by = 0$", isCorrect: true },
                    { text: "$y'' + ay' + by = 0$", isCorrect: false },
                    { text: "$x y'' + y' = 0$", isCorrect: false },
                    { text: "$y'' + xy = 0$", isCorrect: false }
                ]
            },
            // Systems
            {
                text: "Un sistema de ecuaciones diferenciales lineales se puede escribir como:",
                difficulty: 3,
                answers: [
                    { text: "$X' = AX$", isCorrect: true },
                    { text: "$X' = X^2$", isCorrect: false },
                    { text: "$X' = A + X$", isCorrect: false },
                    { text: "$X = AX'$", isCorrect: false }
                ]
            },
            // Existence and Uniqueness
            {
                text: "El Teorema de Existencia y Unicidad garantiza solución única si:",
                difficulty: 3,
                answers: [
                    { text: "$f(x,y)$ y $\\frac{\\partial f}{\\partial y}$ son continuas", isCorrect: true },
                    { text: "Solo $f(x,y)$ es continua", isCorrect: false },
                    { text: "La ecuación es lineal", isCorrect: false },
                    { text: "La ecuación es separable", isCorrect: false }
                ]
            },
            // Wronskian
            {
                text: "Si el Wronskiano de dos soluciones es diferente de cero, entonces:",
                difficulty: 2,
                answers: [
                    { text: "Las soluciones son linealmente independientes", isCorrect: true },
                    { text: "Las soluciones son linealmente dependientes", isCorrect: false },
                    { text: "No forman un conjunto fundamental", isCorrect: false },
                    { text: "La ecuación no tiene solución", isCorrect: false }
                ]
            },
            // Variation of Parameters
            {
                text: "El método de variación de parámetros sirve para:",
                difficulty: 3,
                answers: [
                    { text: "Encontrar una solución particular de una EDO no homogénea", isCorrect: true },
                    { text: "Encontrar la solución homogénea", isCorrect: false },
                    { text: "Resolver ecuaciones separables", isCorrect: false },
                    { text: "Calcular el Wronskiano", isCorrect: false }
                ]
            },
            // Bernoulli
            {
                text: "Una ecuación de Bernoulli $y' + P(x)y = Q(x)y^n$ se linealiza con la sustitución:",
                difficulty: 3,
                answers: [
                    { text: "$u = y^{1-n}$", isCorrect: true },
                    { text: "$u = y^n$", isCorrect: false },
                    { text: "$u = \\ln y$", isCorrect: false },
                    { text: "$u = e^y$", isCorrect: false }
                ]
            },
            // Laplace Transform Definition
            {
                text: "La definición de la Transformada de Laplace de $f(t)$ es:",
                difficulty: 2,
                answers: [
                    { text: "$\\int_0^\\infty e^{-st} f(t) dt$", isCorrect: true },
                    { text: "$\\int_{-\\infty}^\\infty e^{-st} f(t) dt$", isCorrect: false },
                    { text: "$\\int_0^\\infty e^{st} f(t) dt$", isCorrect: false },
                    { text: "$\\frac{d}{dt} f(t)$", isCorrect: false }
                ]
            },
            // Laplace of Derivative
            {
                text: "$\\mathcal{L}\\{f'(t)\\}$ es igual a:",
                difficulty: 3,
                answers: [
                    { text: "$sF(s) - f(0)$", isCorrect: true },
                    { text: "$sF(s)$", isCorrect: false },
                    { text: "$F(s) - f(0)$", isCorrect: false },
                    { text: "$F'(s)$", isCorrect: false }
                ]
            },
            // RLC Circuit
            {
                text: "En un circuito RLC serie, la ecuación para la carga $q$ es:",
                difficulty: 3,
                answers: [
                    { text: "$Lq'' + Rq' + \\frac{1}{C}q = E(t)$", isCorrect: true },
                    { text: "$Lq'' + Rq' = E(t)$", isCorrect: false },
                    { text: "$Rq' + \\frac{1}{C}q = E(t)$", isCorrect: false },
                    { text: "$q'' + q = 0$", isCorrect: false }
                ]
            },
            // Resonance
            {
                text: "La resonancia ocurre en un sistema mecánico o eléctrico cuando:",
                difficulty: 2,
                answers: [
                    { text: "La frecuencia de la fuerza externa iguala la frecuencia natural", isCorrect: true },
                    { text: "No hay amortiguamiento", isCorrect: false },
                    { text: "La fuerza externa es cero", isCorrect: false },
                    { text: "El sistema es sobreamortiguado", isCorrect: false }
                ]
            },
            // Orthogonal Trajectories
            {
                text: "Las trayectorias ortogonales a una familia de curvas $y=cx$ son:",
                difficulty: 2,
                answers: [
                    { text: "$x^2 + y^2 = k$ (Círculos)", isCorrect: true },
                    { text: "$y = kx$", isCorrect: false },
                    { text: "$y = x + k$", isCorrect: false },
                    { text: "$xy = k$", isCorrect: false }
                ]
            },
            // Logistic Equation
            {
                text: "La ecuación logística $P' = rP(1 - P/K)$ modela:",
                difficulty: 2,
                answers: [
                    { text: "Crecimiento poblacional con capacidad de carga", isCorrect: true },
                    { text: "Crecimiento exponencial ilimitado", isCorrect: false },
                    { text: "Decaimiento radiactivo", isCorrect: false },
                    { text: "Oscilaciones armónicas", isCorrect: false }
                ]
            },
            // Reduction of Order
            {
                text: "Si se conoce una solución $y_1$ de una EDO lineal homogénea, se puede hallar una segunda solución $y_2$ usando:",
                difficulty: 3,
                answers: [
                    { text: "Reducción de orden", isCorrect: true },
                    { text: "Separación de variables", isCorrect: false },
                    { text: "Transformada de Laplace", isCorrect: false },
                    { text: "Método de Euler", isCorrect: false }
                ]
            },
            // Undetermined Coefficients Condition
            {
                text: "El método de coeficientes indeterminados se usa cuando la función forzante $g(x)$ es:",
                difficulty: 2,
                answers: [
                    { text: "Polinomio, exponencial, seno o coseno", isCorrect: true },
                    { text: "Cualquier función continua", isCorrect: false },
                    { text: "Discontinua", isCorrect: false },
                    { text: "Logarítmica", isCorrect: false }
                ]
            },
            // Boundary Value Problems
            {
                text: "Un problema de valores en la frontera (PVF) especifica condiciones en:",
                difficulty: 2,
                answers: [
                    { text: "Dos puntos diferentes", isCorrect: true },
                    { text: "Un solo punto (condiciones iniciales)", isCorrect: false },
                    { text: "Ningún punto", isCorrect: false },
                    { text: "El infinito", isCorrect: false }
                ]
            }
        ];

        for (const q of questions) {
            await db.execute(sql`
                INSERT INTO questions (id, quiz_id, content, image_url, type, difficulty, points)
                VALUES (${nextQuestionId}, ${quizId}, ${q.text}, ${null}, 'multiple_choice', ${q.difficulty}, 10)
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

        console.log("Done creating Differential Equations Quiz!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
