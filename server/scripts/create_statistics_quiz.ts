
import 'dotenv/config';
import { db } from "../db.js";
import { categories, subcategories, quizzes, questions, answers } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

async function main() {
    console.log("🚀 Starting Statistics Quiz creation...");

    try {
        // Sync sequences to avoid ID conflicts
        await db.execute(sql`SELECT setval('subcategories_id_seq', (SELECT MAX(id) FROM subcategories))`);
        await db.execute(sql`SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes))`);
        await db.execute(sql`SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))`);
        await db.execute(sql`SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers))`);
        console.log("🔄 Sequences synced.");

        // 1. Find or Create Subcategory "Estadística" (ID 260) under Category 21
        const categoryId = 21;
        const targetSubcategoryId = 260;
        let subcategoryId: number;

        const existingSubcategory = await db.query.subcategories.findFirst({
            where: eq(subcategories.id, targetSubcategoryId),
        });

        if (existingSubcategory) {
            console.log("✅ Subcategory 'Estadística' found:", existingSubcategory.id);
            subcategoryId = existingSubcategory.id;
        } else {
            console.log("⚠️ Subcategory not found. Creating with specific ID...");
            // We need to force the ID if possible, or just create it and hope it matches if we reset sequence?
            // Actually, if we want a specific ID (260), we should try to insert it explicitly if the DB allows.
            // But usually serial columns ignore explicit inserts unless we handle it carefully.
            // However, for this script, let's just create it normally and see what ID we get, 
            // OR if the user specifically requested 260, we might need to check if we can force it.
            // Given the previous task, let's just create it and if it's not 260, we'll log it.
            // BUT, the user said "subcategory 260". If it doesn't exist, we should probably just create it.

            // Let's try to insert with the ID if it's not taken.
            // Note: Drizzle might not let us easily force ID on serial unless we use raw SQL or specific config.
            // Let's just insert normally.
            const [newSub] = await db.insert(subcategories).values({
                categoryId,
                name: "Estadística",
                description: "Diagnóstico de estadística descriptiva, probabilidad e inferencia.",
                youtube_sublink: "",
            }).returning();
            subcategoryId = newSub.id;
            console.log("✅ Created Subcategory:", subcategoryId);

            if (subcategoryId !== targetSubcategoryId) {
                console.warn(`⚠️ Created subcategory ID (${subcategoryId}) does NOT match requested ID (${targetSubcategoryId}). You may need to update the plan or script.`);
            }
        }

        // 2. Create Quiz "Diagnóstico de Estadística"
        const quizTitle = "Diagnóstico de Estadística";
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
            // Recreate to ensure fresh questions
            await db.delete(quizzes).where(eq(quizzes.id, quizId));
            console.log("🗑️ Deleted existing quiz to recreate fresh.");
        }

        const [newQuiz] = await db.insert(quizzes).values({
            categoryId,
            subcategoryId,
            title: quizTitle,
            description: "Evalúa tus conocimientos en estadística descriptiva, probabilidad e inferencia.",
            difficulty: "Intermedio",
            totalQuestions: 15,
            timeLimit: 1500, // 25 minutes
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60", // Data/Statistics image
        }).returning();

        quizId = newQuiz.id;
        console.log("✅ Created Quiz:", quizId);

        // 3. Insert Questions
        const questionsData = [
            // Bloque I – Fundamentos
            {
                content: "Un investigador calcula el promedio de edad de todos los estudiantes de una universidad a partir de los registros administrativos. Esto es un ejemplo de:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Estadística descriptiva", isCorrect: true, explanation: "Se describe la población completa sin hacer inferencias sobre un grupo mayor." },
                    { content: "Estadística inferencial", isCorrect: false },
                    { content: "Muestreo aleatorio", isCorrect: false },
                    { content: "Probabilidad", isCorrect: false }
                ]
            },
            {
                content: "En un estudio sobre hábitos de lectura, se registra 'número de libros leídos en el último mes'. Esta variable es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Cuantitativa discreta", isCorrect: true, explanation: "Se cuenta un número entero de libros (0, 1, 2...), no admite valores intermedios como 1.5 libros leídos." },
                    { content: "Cualitativa nominal", isCorrect: false },
                    { content: "Cualitativa ordinal", isCorrect: false },
                    { content: "Cuantitativa continua", isCorrect: false }
                ]
            },
            // Bloque II – Organización
            {
                content: "En un diagrama de caja (boxplot), la línea dentro de la caja representa:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La mediana", isCorrect: true, explanation: "La línea central marca el segundo cuartil (Q2), que es la mediana de los datos." },
                    { content: "La media", isCorrect: false },
                    { content: "La moda", isCorrect: false },
                    { content: "El promedio entre el máximo y el mínimo", isCorrect: false }
                ]
            },
            {
                content: "Si la frecuencia relativa acumulada para una clase es 0.75, significa que:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "El 75% de los datos son menores o iguales al límite superior de esa clase.", isCorrect: true, explanation: "La frecuencia acumulada suma las frecuencias anteriores, indicando la proporción de datos hasta ese punto." },
                    { content: "El 75% de los datos son iguales al valor de esa clase.", isCorrect: false },
                    { content: "El 75% de los datos están en esa clase.", isCorrect: false },
                    { content: "La clase tiene una frecuencia absoluta de 75.", isCorrect: false }
                ]
            },
            // Bloque III – Medidas Descriptivas
            {
                content: "En un conjunto de datos sobre ingresos, si se incluye el sueldo extremadamente alto del CEO, la medida de tendencia central menos afectada será:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La mediana", isCorrect: true, explanation: "La mediana es una medida robusta que no se ve afectada por valores extremos (outliers), a diferencia de la media." },
                    { content: "La media", isCorrect: false },
                    { content: "La moda", isCorrect: false },
                    { content: "La varianza", isCorrect: false }
                ]
            },
            {
                content: "Se tienen dos cursos con el mismo promedio en un examen. El Curso A tiene una desviación estándar de 2 puntos y el Curso B de 10 puntos. La interpretación correcta es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Las notas en el Curso A están más concentradas cerca del promedio.", isCorrect: true, explanation: "Una menor desviación estándar indica que los datos están menos dispersos respecto a la media." },
                    { content: "El Curso B tuvo mejores notas.", isCorrect: false },
                    { content: "Las notas en el Curso B son más fáciles de predecir.", isCorrect: false },
                    { content: "La mediana del Curso A es mayor.", isCorrect: false }
                ]
            },
            // Bloque IV – Análisis e Interpretación
            {
                content: "Según el criterio del IQR, un dato se considera un valor atípico (outlier) leve si está:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Por debajo de ¡Q1 - 1.5 \\times IQR¡ o por encima de ¡Q3 + 1.5 \\times IQR¡", isCorrect: true, explanation: "Es la regla estándar para detectar outliers en un diagrama de caja." },
                    { content: "Por debajo del mínimo o por encima del máximo.", isCorrect: false },
                    { content: "Más allá de 2 desviaciones estándar de la media.", isCorrect: false },
                    { content: "Entre Q1 y Q3.", isCorrect: false }
                ]
            },
            // Bloque V – Probabilidad
            {
                content: "La probabilidad de que llueva dado que el cielo está nublado se escribe como:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡P(\\text{lluvia} | \\text{nublado})¡", isCorrect: true, explanation: "La barra vertical '|' denota probabilidad condicional: probabilidad de A dado B." },
                    { content: "¡P(\\text{nublado})¡", isCorrect: false },
                    { content: "¡P(\\text{lluvia} \\cap \\text{nublado})¡", isCorrect: false },
                    { content: "¡P(\\text{nublado} | \\text{lluvia})¡", isCorrect: false }
                ]
            },
            {
                content: "Si dos eventos A y B son independientes, entonces ¡P(A \\cap B) =¡",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡P(A) \\cdot P(B)¡", isCorrect: true, explanation: "Para eventos independientes, la probabilidad de la intersección es el producto de las probabilidades individuales." },
                    { content: "¡P(A) + P(B)¡", isCorrect: false },
                    { content: "¡P(A) \\cdot P(B|A)¡", isCorrect: false }, // General rule, but specifically P(B) for independent
                    { content: "¡P(B) - P(A)¡", isCorrect: false }
                ]
            },
            // Bloque VI – Variables Aleatorias
            {
                content: "La variable 'número de caras al lanzar una moneda 10 veces' sigue una distribución:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Binomial", isCorrect: true, explanation: "Cumple las condiciones: n ensayos fijos, dos resultados posibles (cara/cruz), probabilidad constante e independencia." },
                    { content: "Normal", isCorrect: false },
                    { content: "Poisson", isCorrect: false },
                    { content: "Uniforme", isCorrect: false }
                ]
            },
            {
                content: "En una distribución normal estándar (media=0, desv. estándar=1), aproximadamente el 95% de los datos se encuentran entre:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "-2 y 2", isCorrect: true, explanation: "Según la regla empírica, aproximadamente el 95% de los datos están dentro de 2 desviaciones estándar de la media (exactamente 1.96)." },
                    { content: "-1 y 1", isCorrect: false },
                    { content: "-3 y 3", isCorrect: false },
                    { content: "0 y 1", isCorrect: false }
                ]
            },
            // Bloque VII – Estadística Inferencial
            {
                content: "Un intervalo de confianza del 95% para la estatura media de adultos es [165, 175] cm. La interpretación correcta es:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "Con un 95% de confianza, la media poblacional está entre 165 y 175 cm.", isCorrect: true, explanation: "El nivel de confianza se refiere al método: si repitiéramos el estudio muchas veces, el 95% de los intervalos calculados contendrían la media real." },
                    { content: "El 95% de los adultos mide entre 165 y 175 cm.", isCorrect: false },
                    { content: "Hay un 95% de probabilidad de que la media poblacional esté entre 165 y 175 cm.", isCorrect: false }, // Common misconception (Bayesian vs Frequentist)
                    { content: "La media muestral es 170 cm con certeza.", isCorrect: false }
                ]
            },
            {
                content: "En una prueba para ver si un nuevo fármaco es mejor que el actual, la hipótesis alternativa ¡H_a¡ sería:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "La eficacia del nuevo fármaco es mayor que la del actual.", isCorrect: true, explanation: "La hipótesis alternativa es lo que el investigador quiere demostrar (que hay efecto o mejora)." },
                    { content: "La eficacia del nuevo fármaco es igual a la del actual.", isCorrect: false },
                    { content: "La eficacia del nuevo fármaco es menor que la del actual.", isCorrect: false },
                    { content: "No hay diferencia entre los fármacos.", isCorrect: false }
                ]
            },
            // Bloque VIII – Relación entre Variables
            {
                content: "Si se calcula un coeficiente de correlación lineal ¡r = -0.87¡ entre horas de estudio y número de errores en un examen, se concluye que:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Hay una relación lineal fuerte y negativa.", isCorrect: true, explanation: "El valor absoluto cercano a 1 indica fuerza, y el signo negativo indica que a más horas de estudio, menos errores." },
                    { content: "Hay una relación lineal fuerte y positiva.", isCorrect: false },
                    { content: "No hay relación lineal.", isCorrect: false },
                    { content: "Estudiar más causa más errores.", isCorrect: false }
                ]
            },
            // Bloque IX – Puente a Avanzado
            {
                content: "El Teorema Central del Límite establece que, para muestras grandes, la distribución de la media muestral se aproxima a:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "Una distribución Normal", isCorrect: true, explanation: "Es el teorema fundamental: la media de muestras grandes sigue una distribución normal, independientemente de la distribución original de la población." },
                    { content: "Una distribución Binomial", isCorrect: false },
                    { content: "Una distribución igual a la población", isCorrect: false },
                    { content: "Una distribución con mayor varianza que la población", isCorrect: false }
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
        console.log(`🎉 Statistics Quiz setup complete! Quiz ID: ${quizId}`);

    } catch (error) {
        console.error("❌ Error creating quiz:", error);
    }
}

main();
