import "./env-config.js";
import { db } from "./db.js";
import { quizzes, questions, answers } from "../shared/schema.js";

async function insertQuiz() {
    console.log("[START] Inserting Potencias Quiz...");

    try {
        // 1. Insert Quiz (Handling partial execution)
        await db.insert(quizzes).values({
            id: 360,
            subcategoryId: 8,
            categoryId: 1,
            title: "Propiedades de las Potencias",
            description: "Domina las leyes de los exponentes: productos, divisiones, potencias de potencias y exponentes negativos.",
            difficulty: "intermedio",
            timeLimit: 2400,
            sortOrder: 1,
            totalQuestions: 10,
        } as any).onConflictDoNothing({ target: quizzes.id });
        console.log("[INFO] Quiz 360 insertion attempted (skipped if exists).");

        const quizQuestions = [
            {
                id: 4712,
                content: "¿Cuál es el resultado de simplificar la expresión ¡(2^3 \\cdot 3^2)^2¡?",
                points: 10,
                difficulty: 1,
                ans: [
                    { content: "¡2^6 \\cdot 3^4¡", isCorrect: true, explanation: "Aplicamos la propiedad ¡(a \\cdot b)^n = a^n \\cdot b^n¡. Así, ¡(2^3)^2 = 2^6¡ y ¡(3^2)^2 = 3^4¡." },
                    { content: "¡2^5 \\cdot 3^4¡", isCorrect: false, explanation: "Error: se sumaron los exponentes ¡3+2¡ en lugar de multiplicarlos ¡3 \\cdot 2¡." },
                    { content: "¡2^6 \\cdot 3^2¡", isCorrect: false },
                    { content: "¡6^{10}¡", isCorrect: false }
                ]
            },
            {
                id: 4713,
                content: "Simplifica la siguiente división elevada a una potencia: ¡(\\frac{2^3}{3^2})^2¡",
                points: 10,
                difficulty: 1,
                ans: [
                    { content: "¡\\frac{2^6}{3^4}¡", isCorrect: true, explanation: "La potencia de un cociente afecta tanto al numerador como al denominador: ¡(\\frac{a}{b})^n = \\frac{a^n}{b^n}¡." },
                    { content: "¡\\frac{2^5}{3^4}¡", isCorrect: false },
                    { content: "¡\\frac{4^3}{9^2}¡", isCorrect: false },
                    { content: "¡2^6 \\cdot 3^{-2}¡", isCorrect: false }
                ]
            },
            {
                id: 4714,
                content: "Calcula el valor de la expresión: ¡(2^2 + 3^2)^2¡. ¡¡¡Ten mucho cuidado con la suma!!!",
                points: 10,
                difficulty: 2,
                ans: [
                    { content: "¡169¡", isCorrect: true, explanation: "Primero resolvemos lo de adentro: ¡4 + 9 = 13¡. Luego ¡13^2 = 169¡. Recuerda: ¡(a+b)^n \\neq a^n + b^n¡." },
                    { content: "¡2^4 + 3^4 = 97¡", isCorrect: false, explanation: "¡ERROR COMÚN!¡ No puedes distribuir la potencia en una suma." },
                    { content: "¡25¡", isCorrect: false },
                    { content: "¡144¡", isCorrect: false }
                ]
            },
            {
                id: 4715,
                content: "Resuelve la potencia de una potencia: ¡(((-2)^2)^3)^2¡",
                points: 10,
                difficulty: 2,
                ans: [
                    { content: "¡(-2)^{12}¡", isCorrect: true, explanation: "Multiplicamos todos los exponentes: ¡2 \\cdot 3 \\cdot 2 = 12¡. Como el exponente final es par, el resultado será positivo." },
                    { content: "¡(-2)^7¡", isCorrect: false, explanation: "Error: se sumaron los exponentes ¡2+3+2 = 7¡." },
                    { content: "¡-2^{12}¡", isCorrect: false },
                    { content: "¡2^8¡", isCorrect: false }
                ]
            },
            {
                id: 4716,
                content: "Simplifica y resuelve: ¡(\\frac{2^3}{3^3})^{-2} \\cdot (\\frac{3^4}{2^5})^2 \\cdot 3^2 \\cdot 2^{-3}¡",
                points: 10,
                difficulty: 3,
                ans: [
                    { content: "¡\\frac{3^{16}}{2^{19}}¡", isCorrect: true, explanation: "Paso a paso: ¡(2^{-6} \\cdot 3^6) \\cdot (3^8 \\cdot 2^{-10}) \\cdot 3^2 \\cdot 2^{-3} = 2^{-6-10-3} \\cdot 3^{6+8+2} = 2^{-19} \\cdot 3^{16}¡." },
                    { content: "¡\\frac{3^{14}}{2^{17}}¡", isCorrect: false },
                    { content: "¡\\frac{3^6}{2^9}¡", isCorrect: false },
                    { content: "¡2^{19} \\cdot 3^{-16}¡", isCorrect: false }
                ]
            },
            {
                id: 4717,
                content: "Observa la imagen y selecciona el resultado simplificado de la operación mostrada.",
                imageUrl: "https://imagenes.alanmath.com/aritmética/C1_P4717_Q6_Expresion_Potencias.png",
                points: 10,
                difficulty: 3,
                ans: [
                    { content: "¡2^{42} \\cdot 3^{36}¡", isCorrect: true, explanation: "Simplificamos dentro: ¡(2^{10} \\cdot 3^3)^2 / (3^{-6} \\cdot 2^6) = (2^{20} \\cdot 3^6) / (3^{-6} \\cdot 2^6) = 2^{14} \\cdot 3^{12}¡. Finalmente ¡(2^{14} \\cdot 3^{12})^3 = 2^{42} \\cdot 3^{36}¡." },
                    { content: "¡2^{30} \\cdot 3^{24}¡", isCorrect: false },
                    { content: "¡2^{24} \\cdot 3^{18}¡", isCorrect: false },
                    { content: "¡2^{18} \\cdot 3^{24}¡", isCorrect: false }
                ]
            },
            {
                id: 4718,
                content: "¿Cuál de las siguientes igualdades es CORRECTA?",
                points: 10,
                difficulty: 2,
                ans: [
                    { content: "¡5^{-2} = \\frac{1}{25}¡", isCorrect: true, explanation: "¡a^{-n} = \\frac{1}{a^n}¡. Por lo tanto, ¡5^{-2} = \\frac{1}{5^2} = \\frac{1}{25}¡." },
                    { content: "¡5^{-2} = -25¡", isCorrect: false, explanation: "¡ERROR!¡ Un exponente negativo no hace que el número sea negativo, sino que lo invierte." },
                    { content: "¡5^{-2} = -10¡", isCorrect: false },
                    { content: "¡5^{-2} = 0.5¡", isCorrect: false }
                ]
            },
            {
                id: 4719,
                content: "Halla el error en el siguiente razonamiento: ¡2^3 \\cdot 2^4 = 4^7¡. ¿Por qué es incorrecto?",
                points: 10,
                difficulty: 2,
                ans: [
                    { content: "Porque se multiplicaron las bases; debería ser ¡2^7¡", isCorrect: true, explanation: "Al multiplicar potencias de la misma base, se mantiene la base y se suman los exponentes: ¡a^n \\cdot a^m = a^{n+m}¡." },
                    { content: "Porque el exponente debería ser ¡12¡", isCorrect: false },
                    { content: "Porque el resultado es ¡4^{12}¡", isCorrect: false },
                    { content: "Es correcto, no hay error", isCorrect: false }
                ]
            },
            {
                id: 4720,
                content: "Observa el cubo de la imagen. Si cada arista mide ¡2^3¡ cm, ¿cuál es su volumen expresado como una sola potencia de 2?",
                imageUrl: "https://imagenes.alanmath.com/aritmética/C1_P4720_Q9_Volumen_Cubo.png",
                points: 10,
                difficulty: 2,
                ans: [
                    { content: "¡2^9¡ cm³", isCorrect: true, explanation: "El volumen de un cubo es ¡L^3¡. Entonces: ¡(2^3)^3 = 2^{3 \\cdot 3} = 2^9¡." },
                    { content: "¡2^6¡ cm³", isCorrect: false },
                    { content: "¡8^3¡ cm³", isCorrect: false },
                    { content: "¡2^{27}¡ cm³", isCorrect: false }
                ]
            },
            {
                id: 4721,
                content: "Analiza la imagen. ¿Cuál es el error conceptual que cometió el estudiante al resolver la suma?",
                imageUrl: "https://imagenes.alanmath.com/aritmética/C1_P4721_Q10_Error_Potencias.png",
                points: 10,
                difficulty: 3,
                ans: [
                    { content: "Trató la potencia de una suma como si fuera un producto", isCorrect: true, explanation: "Intentó aplicar ¡(a+b)^n = a^n + b^n¡, lo cual es falso. Se debe resolver la suma interna primero o usar productos notables." },
                    { content: "Multiplicó mal los exponentes interamente", isCorrect: false },
                    { content: "El resultado real es ¡2^9 + 3^9¡", isCorrect: false },
                    { content: "No hay error, la igualdad es válida", isCorrect: false }
                ]
            }
        ];

        let answerId = 22560;
        for (const q of quizQuestions) {
            const { ans, ...questionData } = q;
            // Using try-catch per question to handle partially existing questions as well
            try {
                await db.insert(questions).values({
                    ...questionData,
                    quizId: 360,
                    type: "multiple_choice"
                } as any).onConflictDoNothing({ target: questions.id });

                for (const a of ans) {
                    await db.insert(answers).values({
                        id: answerId++,
                        questionId: q.id,
                        content: a.content,
                        isCorrect: a.isCorrect,
                        explanation: a.explanation || null
                    } as any).onConflictDoNothing({ target: answers.id });
                }
                console.log(`[SUCCESS] Question ${q.id} and its answers inserted.`);
            } catch (qErr) {
                console.error(`[ERROR] Question ${q.id} insertion failed:`, qErr);
            }
        }

        console.log("[FINISH] Potencias Quiz (ID 360) inserted with 10 questions.");
    } catch (e) {
        console.error("[ERROR] Insertion failed:", e);
    } finally {
        process.exit(0);
    }
}

insertQuiz();
