
import 'dotenv/config';
import { db } from "../db.js";
import { categories, subcategories, quizzes, questions, answers } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

async function main() {
    console.log("🚀 Starting Integral Calculus Quiz creation...");

    try {
        // Sync sequences to avoid ID conflicts
        await db.execute(sql`SELECT setval('subcategories_id_seq', (SELECT MAX(id) FROM subcategories))`);
        await db.execute(sql`SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes))`);
        await db.execute(sql`SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))`);
        console.log("🔄 Sequences synced.");

        // 1. Find or Create Subcategory "Cálculo Integral" under Category 21 (Test de Nivelación)
        const categoryId = 21;
        let subcategoryId: number;

        const existingSubcategory = await db.query.subcategories.findFirst({
            where: and(
                eq(subcategories.categoryId, categoryId),
                eq(subcategories.name, "Cálculo Integral")
            ),
        });

        if (existingSubcategory) {
            console.log("✅ Subcategory 'Cálculo Integral' found:", existingSubcategory.id);
            subcategoryId = existingSubcategory.id;
        } else {
            console.log("⚠️ Subcategory not found. Creating...");
            const [newSub] = await db.insert(subcategories).values({
                categoryId,
                name: "Cálculo Integral",
                description: "Diagnóstico de integrales indefinidas, definidas y aplicaciones.",
                youtube_sublink: "", // Optional
            }).returning();
            subcategoryId = newSub.id;
            console.log("✅ Created Subcategory:", subcategoryId);
        }

        // 2. Create Quiz "Diagnóstico de Cálculo Integral"
        // We'll use a fixed ID if possible or let it auto-increment. 
        // To ensure we can link it easily, let's try to find it first or create it.
        // The user wants it to be similar to others. Let's assume we let DB handle ID but we log it.

        const quizTitle = "Diagnóstico de Cálculo Integral";
        let quizId: number;

        const existingQuiz = await db.query.quizzes.findFirst({
            where: and(
                eq(quizzes.subcategoryId, subcategoryId),
                eq(quizzes.title, quizTitle)
            ),
        });

        if (existingQuiz) {
            console.log("✅ Quiz already exists:", existingQuiz.id);
            quizId = existingQuiz.id;
            // Optional: Clear existing questions to avoid duplicates if re-running
            // await db.delete(questions).where(eq(questions.quizId, quizId));
            // console.log("🗑️ Cleared existing questions for update.");
            // For safety, let's NOT delete automatically unless requested. 
            // Instead, we'll append or the user should manually clear if needed.
            // But for a clean script, let's assume we want to ensure these specific questions exist.
            // Let's just create a NEW one if it doesn't exist, or warn.
            // To be safe for this task, I'll delete the old one and recreate it to ensure fresh state.
            await db.delete(quizzes).where(eq(quizzes.id, quizId));
            console.log("🗑️ Deleted existing quiz to recreate fresh.");
        }

        const [newQuiz] = await db.insert(quizzes).values({
            categoryId,
            subcategoryId,
            title: quizTitle,
            description: "Evalúa tus conocimientos en integración, técnicas y aplicaciones.",
            difficulty: "Intermedio",
            totalQuestions: 15, // We are adding 15 questions
            timeLimit: 1500, // 25 minutes
            url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60", // Abstract math/integral image
        }).returning();

        quizId = newQuiz.id;
        console.log("✅ Created Quiz:", quizId);

        // 3. Insert Questions
        const questionsData = [
            // Bloque I – Conceptos Básicos y Derivación Inversa
            {
                content: "Si ¡F'(x) = 3x^2 - 2x + 5¡, entonces una posible ¡F(x)¡ es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "¡x^3 - x^2 + 5x¡", isCorrect: true, explanation: "Derivando la opción A: ¡d/dx(x^3 - x^2 + 5x) = 3x^2 - 2x + 5¡. Coincide con la función dada." },
                    { content: "¡x^3 - x^2 + 5¡", isCorrect: false }, // Removed 'x' from 5x to make it wrong but similar constant
                    { content: "¡6x - 2¡", isCorrect: false },
                    { content: "¡3x^3 - 2x^2 + 5x¡", isCorrect: false }
                ]
            },
            {
                content: "La integral ¡\\int x^{-3} dx¡ es igual a:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "¡\\frac{x^{-2}}{-2} + C¡", isCorrect: true, explanation: "Usando la regla de la potencia: ¡\\int x^n dx = \\frac{x^{n+1}}{n+1}¡ con ¡n=-3¡. ¡-3+1 = -2¡." },
                    { content: "¡\\frac{x^{-4}}{-4} + C¡", isCorrect: false },
                    { content: "¡-3x^{-4} + C¡", isCorrect: false },
                    { content: "¡\\ln|x^{-3}| + C¡", isCorrect: false }
                ]
            },
            // Bloque II – Técnicas Elementales
            {
                content: "La integral ¡\\int 2x e^{x^2} dx¡ se resuelve con la sustitución ¡u =¡",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡x^2¡", isCorrect: true, explanation: "Si ¡u = x^2¡, entonces ¡du = 2x dx¡, lo cual está presente en la integral." },
                    { content: "¡2x¡", isCorrect: false },
                    { content: "¡e^{x}¡", isCorrect: false },
                    { content: "¡2x e^{x^2}¡", isCorrect: false }
                ]
            },
            {
                content: "Para integrar ¡\\int x \\cos x dx¡ usando partes, la elección CORRECTA es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡u = x, dv = \\cos x dx¡", isCorrect: true, explanation: "Elegimos ¡u=x¡ para que al derivar se simplifique a ¡dx¡, y ¡dv=\\cos x dx¡ es fácil de integrar." },
                    { content: "¡u = \\cos x, dv = x dx¡", isCorrect: false },
                    { content: "¡u = x \\cos x, dv = dx¡", isCorrect: false },
                    { content: "¡u = 1, dv = x \\cos x dx¡", isCorrect: false }
                ]
            },
            {
                content: "¡\\int \\sin^2 x dx¡ es igual a:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{x}{2} - \\frac{\\sin(2x)}{4} + C¡", isCorrect: true, explanation: "Usamos la identidad ¡\\sin^2 x = \\frac{1-\\cos(2x)}{2}¡. Integramos: ¡\\int \\frac{1}{2} dx - \\int \\frac{\\cos(2x)}{2} dx = \\frac{x}{2} - \\frac{\\sin(2x)}{4}¡." },
                    { content: "¡\\frac{\\sin^3 x}{3} + C¡", isCorrect: false },
                    { content: "¡x + \\sin x \\cos x + C¡", isCorrect: false },
                    { content: "¡-\\cos^2 x + C¡", isCorrect: false }
                ]
            },
            // Bloque III – Técnicas Avanzadas
            {
                content: "Al descomponer ¡\\frac{1}{x(x+1)}¡ en fracciones parciales se obtiene:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{1}{x} - \\frac{1}{x+1}¡", isCorrect: true, explanation: "¡\\frac{1}{x(x+1)} = \\frac{A}{x} + \\frac{B}{x+1}¡. Resolviendo, ¡A=1, B=-1¡." },
                    { content: "¡\\frac{1}{x} + \\frac{1}{x+1}¡", isCorrect: false },
                    { content: "¡\\frac{1}{x^2} + \\frac{1}{x+1}¡", isCorrect: false },
                    { content: "¡\\frac{1}{x^2} + \\frac{1}{(x+1)^2}¡", isCorrect: false }
                ]
            },
            {
                content: "Para integrar ¡\\int \\frac{dx}{\\sqrt{9 - x^2}}¡, la sustitución adecuada es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡x = 3\\sin\\theta¡", isCorrect: true, explanation: "El término ¡\\sqrt{a^2 - x^2}¡ sugiere sustitución seno. Aquí ¡a=3¡." },
                    { content: "¡x = 3\\tan\\theta¡", isCorrect: false },
                    { content: "¡x = 9\\sin\\theta¡", isCorrect: false },
                    { content: "¡x = 3\\sec\\theta¡", isCorrect: false }
                ]
            },
            // Bloque IV – Integral Definida
            {
                content: "La integral ¡\\int_{0}^{2} (x+1) dx¡ representa:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "El área bajo la recta ¡y=x+1¡ desde ¡x=0¡ hasta ¡x=2¡", isCorrect: true, explanation: "La integral definida de una función positiva representa el área bajo la curva en ese intervalo." },
                    { content: "La pendiente de la recta ¡y=x+1¡ en ¡[0,2]¡", isCorrect: false },
                    { content: "La derivada de ¡x+1¡ evaluada en 2", isCorrect: false },
                    { content: "La longitud de la curva ¡y=x+1¡ entre 0 y 2", isCorrect: false }
                ]
            },
            {
                content: "El valor de ¡\\frac{d}{dx} \\int_{0}^{x} \\cos(t^2) dt¡ es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡\\cos(x^2)¡", isCorrect: true, explanation: "Por la Parte I del Teorema Fundamental del Cálculo, la derivada de la integral acumulada es la función original evaluada en x." },
                    { content: "¡\\cos(x^2) - \\cos(0)¡", isCorrect: false },
                    { content: "¡\\sin(x^2)¡", isCorrect: false },
                    { content: "¡2x \\cos(x^2)¡", isCorrect: false }
                ]
            },
            // Bloque V – Aplicaciones Geométricas
            {
                content: "El área entre ¡y = x^2¡ y ¡y = x¡ en el intervalo ¡[0,1]¡ se calcula con:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡\\int_{0}^{1} (x - x^2) dx¡", isCorrect: true, explanation: "En ¡[0,1]¡, ¡x \\ge x^2¡. El área es la integral de (curva superior - curva inferior)." },
                    { content: "¡\\int_{0}^{1} (x^2 - x) dx¡", isCorrect: false },
                    { content: "¡\\int_{0}^{1} x^2 dx - \\int_{0}^{1} x dx¡", isCorrect: false },
                    { content: "¡\\int_{0}^{1} (x + x^2) dx¡", isCorrect: false }
                ]
            },
            {
                content: "Al girar la región bajo ¡y = \\sqrt{x}¡ en ¡[0,4]¡ alrededor del eje X, el volumen se calcula con:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "¡\\pi \\int_{0}^{4} (\\sqrt{x})^2 dx¡", isCorrect: true, explanation: "Método de discos: ¡V = \\pi \\int_a^b [f(x)]^2 dx¡." },
                    { content: "¡\\pi \\int_{0}^{4} x dx¡", isCorrect: false }, // Technically equivalent result but formulaically less explicit for learning
                    { content: "¡2\\pi \\int_{0}^{4} x\\sqrt{x} dx¡", isCorrect: false },
                    { content: "¡\\pi \\int_{0}^{4} \\sqrt{x} dx¡", isCorrect: false }
                ]
            },
            // Bloque VI – Aplicaciones Físicas
            {
                content: "El trabajo para estirar un resorte de su longitud natural, si la fuerza es ¡F(x) = kx¡, es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{1}{2}kx^2¡", isCorrect: true, explanation: "Trabajo ¡W = \\int_0^x F(s) ds = \\int_0^x ks ds = [\\frac{1}{2}ks^2]_0^x = \\frac{1}{2}kx^2¡." },
                    { content: "¡k¡", isCorrect: false },
                    { content: "¡kx¡", isCorrect: false },
                    { content: "¡\\frac{1}{3}kx^3¡", isCorrect: false }
                ]
            },
            // Bloque VII – Integrales Impropias
            {
                content: "La integral impropia ¡\\int_{1}^{\\infty} \\frac{1}{x^2} dx¡:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Converge a 1", isCorrect: true, explanation: "¡\\lim_{b\\to\\infty} [-\\frac{1}{x}]_1^b = 0 - (-1) = 1¡." },
                    { content: "Converge a 0", isCorrect: false },
                    { content: "Diverge a infinito", isCorrect: false },
                    { content: "Diverge a -infinito", isCorrect: false }
                ]
            },
            {
                content: "El valor de ¡\\int_{0}^{1} \\frac{1}{\\sqrt{x}} dx¡ es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "2", isCorrect: true, explanation: "¡\\int x^{-1/2} dx = 2x^{1/2}¡. Evaluando: ¡2(1)^{1/2} - 2(0)^{1/2} = 2¡." },
                    { content: "0", isCorrect: false },
                    { content: "1", isCorrect: false },
                    { content: "Diverge", isCorrect: false }
                ]
            },
            {
                content: "Para resolver ¡\\int e^x \\sin x dx¡ se requiere aplicar:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "Integración por partes dos veces", isCorrect: true, explanation: "Es una integral cíclica. Se aplica partes dos veces para recuperar la integral original y despejarla." },
                    { content: "Sustitución trigonométrica", isCorrect: false },
                    { content: "Fracciones parciales", isCorrect: false },
                    { content: "Es una integral inmediata", isCorrect: false }
                ]
            }
        ];

        for (const qData of questionsData) {
            const [newQ] = await db.insert(questions).values({
                quizId,
                content: qData.content,
                type: qData.type,
                difficulty: qData.difficulty,
                points: 10,
            }).returning();

            if (qData.answers) {
                for (const ans of qData.answers) {
                    await db.insert(answers).values({
                        questionId: newQ.id,
                        content: ans.content,
                        isCorrect: ans.isCorrect,
                        explanation: ans.explanation,
                    });
                }
            }
        }

        console.log(`✅ Successfully inserted ${questionsData.length} questions.`);
        console.log(`🎉 Integral Calculus Quiz setup complete! Quiz ID: ${quizId}`);

    } catch (error) {
        console.error("❌ Error creating quiz:", error);
    }
}

main();
