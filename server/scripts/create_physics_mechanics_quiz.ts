
import 'dotenv/config';
import { db } from "../db.js";
import { categories, subcategories, quizzes, questions, answers } from "../schema.js";
import { eq, and, sql } from "drizzle-orm";

async function main() {
    console.log("🚀 Starting Mechanical Physics Quiz creation...");

    try {
        // Sync sequences to avoid ID conflicts
        await db.execute(sql`SELECT setval('subcategories_id_seq', (SELECT MAX(id) FROM subcategories))`);
        await db.execute(sql`SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes))`);
        await db.execute(sql`SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))`);
        await db.execute(sql`SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers))`);
        console.log("🔄 Sequences synced.");

        // 1. Find or Create Subcategory "Física Mecánica" (ID 255) under Category 21
        const categoryId = 21;
        const targetSubcategoryId = 255;
        let subcategoryId: number;

        const existingSubcategory = await db.query.subcategories.findFirst({
            where: eq(subcategories.id, targetSubcategoryId),
        });

        if (existingSubcategory) {
            console.log("✅ Subcategory 'Física Mecánica' found:", existingSubcategory.id);
            subcategoryId = existingSubcategory.id;
            // Update name if needed
            if (existingSubcategory.name !== "Física Mecánica") {
                await db.update(subcategories).set({ name: "Física Mecánica" }).where(eq(subcategories.id, subcategoryId));
                console.log("🔄 Updated subcategory name to 'Física Mecánica'");
            }
        } else {
            console.log("⚠️ Subcategory not found. Creating...");
            const [newSub] = await db.insert(subcategories).values({
                categoryId,
                name: "Física Mecánica",
                description: "Diagnóstico de cinemática, dinámica, energía y movimiento.",
                youtube_sublink: "",
            }).returning();
            subcategoryId = newSub.id;
            console.log("✅ Created Subcategory:", subcategoryId);

            if (subcategoryId !== targetSubcategoryId) {
                console.warn(`⚠️ Created subcategory ID (${subcategoryId}) does NOT match requested ID (${targetSubcategoryId}).`);
            }
        }

        // 2. Create Quiz "Diagnóstico de Física Mecánica"
        const quizTitle = "Diagnóstico de Física Mecánica";
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
            description: "Evalúa tus conocimientos en mecánica clásica: cinemática, dinámica y energía.",
            difficulty: "Intermedio",
            totalQuestions: 35,
            timeLimit: 2400, // 40 minutes (given the length)
            url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=60", // Physics/Mechanics image
        }).returning();

        quizId = newQuiz.id;
        console.log("✅ Created Quiz:", quizId);

        // 3. Insert Questions
        const questionsData = [
            // --- PART 1: BASIC DIAGNOSTIC (20 Questions) ---
            // Bloque I – Magnitudes y fundamentos
            {
                content: "¿Cuál de las siguientes es una magnitud vectorial?",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Velocidad", isCorrect: true, explanation: "La velocidad tiene magnitud, dirección y sentido." },
                    { content: "Masa", isCorrect: false },
                    { content: "Tiempo", isCorrect: false },
                    { content: "Temperatura", isCorrect: false }
                ]
            },
            {
                content: "En el Sistema Internacional, la unidad de fuerza es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "N", isCorrect: true, explanation: "El Newton (N) es la unidad de fuerza en el SI." },
                    { content: "kg", isCorrect: false },
                    { content: "J", isCorrect: false },
                    { content: "W", isCorrect: false }
                ]
            },
            {
                content: "Un vector queda completamente definido por:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Magnitud, dirección y sentido", isCorrect: true, explanation: "Son las tres características que definen a un vector." },
                    { content: "Su magnitud", isCorrect: false },
                    { content: "Su dirección", isCorrect: false },
                    { content: "Su sentido", isCorrect: false }
                ]
            },
            // Bloque II – Cinemática en una dimensión
            {
                content: "La velocidad es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "El cambio de posición respecto al tiempo", isCorrect: true, explanation: "Definición cinemática de velocidad." },
                    { content: "El cambio de posición", isCorrect: false },
                    { content: "La distancia recorrida", isCorrect: false },
                    { content: "La aceleración del movimiento", isCorrect: false }
                ]
            },
            {
                content: "Un objeto se mueve con velocidad constante. ¿Cuál es su aceleración?",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Cero", isCorrect: true, explanation: "Si la velocidad no cambia, la aceleración es nula." },
                    { content: "Positiva", isCorrect: false },
                    { content: "Negativa", isCorrect: false },
                    { content: "Variable", isCorrect: false }
                ]
            },
            {
                content: "En un movimiento rectilíneo uniformemente acelerado (MRUA), la aceleración es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Constante", isCorrect: true, explanation: "Es la característica definitoria del MRUA." },
                    { content: "Cero", isCorrect: false },
                    { content: "Variable", isCorrect: false },
                    { content: "Infinita", isCorrect: false }
                ]
            },
            // Bloque III – Cinemática en dos dimensiones
            {
                content: "En el movimiento parabólico, la aceleración horizontal es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Cero", isCorrect: true, explanation: "No hay fuerzas horizontales (ignorando aire), por tanto a_x = 0." },
                    { content: "Igual a g", isCorrect: false },
                    { content: "Variable", isCorrect: false },
                    { content: "Igual a la velocidad inicial", isCorrect: false }
                ]
            },
            {
                content: "La trayectoria de un proyectil ideal (sin rozamiento) es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Parabólica", isCorrect: true, explanation: "La combinación de MRU horizontal y MRUA vertical resulta en una parábola." },
                    { content: "Circular", isCorrect: false },
                    { content: "Rectilínea", isCorrect: false },
                    { content: "Elíptica", isCorrect: false }
                ]
            },
            // Bloque IV – Leyes de Newton
            {
                content: "La Primera Ley de Newton se conoce como:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Ley de la inercia", isCorrect: true, explanation: "Establece que un cuerpo mantiene su estado de movimiento a menos que actúe una fuerza." },
                    { content: "Ley de acción y reacción", isCorrect: false },
                    { content: "Ley fundamental de la dinámica", isCorrect: false },
                    { content: "Ley de la aceleración", isCorrect: false }
                ]
            },
            {
                content: "Si la fuerza neta sobre un cuerpo es cero, entonces:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Se mueve con velocidad constante", isCorrect: true, explanation: "Si F_net = 0, a = 0, por lo tanto v = constante (puede ser 0 o no)." },
                    { content: "Está en reposo necesariamente", isCorrect: false },
                    { content: "Tiene aceleración constante", isCorrect: false },
                    { content: "Aumenta su energía cinética", isCorrect: false }
                ]
            },
            {
                content: "La Segunda Ley de Newton establece que:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "La fuerza es proporcional a la aceleración", isCorrect: true, explanation: "F = ma." },
                    { content: "Toda acción tiene una reacción", isCorrect: false },
                    { content: "La fuerza es proporcional a la velocidad", isCorrect: false },
                    { content: "La masa depende de la velocidad", isCorrect: false }
                ]
            },
            // Bloque V – Trabajo y energía
            {
                content: "El trabajo mecánico se define como:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Fuerza por distancia en la dirección del movimiento", isCorrect: true, explanation: "W = F * d * cos(theta)." },
                    { content: "Fuerza por tiempo", isCorrect: false },
                    { content: "Masa por aceleración", isCorrect: false },
                    { content: "Energía por tiempo", isCorrect: false }
                ]
            },
            {
                content: "La energía cinética depende de:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "La velocidad", isCorrect: true, explanation: "Ec = 1/2 m v^2." },
                    { content: "La posición", isCorrect: false },
                    { content: "La altura", isCorrect: false },
                    { content: "La aceleración", isCorrect: false }
                ]
            },
            {
                content: "En ausencia de fuerzas no conservativas, se conserva:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La energía mecánica", isCorrect: true, explanation: "La suma de cinética y potencial permanece constante." },
                    { content: "La velocidad", isCorrect: false },
                    { content: "La aceleración", isCorrect: false },
                    { content: "El trabajo", isCorrect: false }
                ]
            },
            // Bloque VI – Cantidad de movimiento
            {
                content: "La cantidad de movimiento lineal es:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Vectorial", isCorrect: true, explanation: "p = mv, y como v es vector, p también lo es." },
                    { content: "Escalar", isCorrect: false },
                    { content: "Siempre positiva", isCorrect: false },
                    { content: "Independiente de la masa", isCorrect: false }
                ]
            },
            {
                content: "En una colisión perfectamente elástica se conserva:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Ambas", isCorrect: true, explanation: "Se conserva tanto la cantidad de movimiento como la energía cinética." },
                    { content: "Solo la energía", isCorrect: false },
                    { content: "Solo la cantidad de movimiento", isCorrect: false },
                    { content: "Ninguna", isCorrect: false }
                ]
            },
            // Bloque VII – Movimiento circular y gravitación
            {
                content: "En un movimiento circular uniforme, la aceleración es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Radial hacia el centro", isCorrect: true, explanation: "Es la aceleración centrípeta, responsable del cambio de dirección." },
                    { content: "Tangencial", isCorrect: false },
                    { content: "Nula", isCorrect: false },
                    { content: "Radial hacia afuera", isCorrect: false }
                ]
            },
            {
                content: "La fuerza que mantiene un cuerpo en movimiento circular se llama:",
                type: "multiple_choice",
                difficulty: 1,
                answers: [
                    { content: "Centrípeta", isCorrect: true, explanation: "Fuerza neta dirigida al centro de curvatura." },
                    { content: "Gravitatoria", isCorrect: false },
                    { content: "Normal", isCorrect: false },
                    { content: "Centrífuga", isCorrect: false }
                ]
            },
            {
                content: "La Ley de Gravitación Universal establece que la fuerza gravitatoria es proporcional:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Al producto de las masas", isCorrect: true, explanation: "F = G * (m1*m2) / r^2." },
                    { content: "A la suma de las masas", isCorrect: false },
                    { content: "A la distancia entre los cuerpos", isCorrect: false },
                    { content: "A la velocidad orbital", isCorrect: false }
                ]
            },
            // Bloque VIII – Estática
            {
                content: "Un cuerpo está en equilibrio estático cuando:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La suma de fuerzas y momentos es cero", isCorrect: true, explanation: "Condiciones de equilibrio: F_net = 0 y Tau_net = 0." },
                    { content: "Su velocidad es cero", isCorrect: false },
                    { content: "La suma de fuerzas es cero", isCorrect: false },
                    { content: "La suma de momentos es cero", isCorrect: false }
                ]
            },

            // --- PART 2: ADVANCED BANK (15 Questions) ---
            // Bloque I – Fundamentos
            {
                content: "La ecuación para la posición en MRUA es ¡x = x_0 + v_0 t + \\frac{1}{2} a t^2¡. Para que sea dimensionalmente correcta, las dimensiones de ¡\\frac{1}{2} a t^2¡ deben ser:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Longitud [L]", isCorrect: true, explanation: "¡[a] = LT^{-2}¡, ¡[t^2] = T^2¡. Producto: ¡L¡." },
                    { content: "Velocidad [LT⁻¹]", isCorrect: false },
                    { content: "Aceleración [LT⁻²]", isCorrect: false },
                    { content: "Tiempo [T]", isCorrect: false }
                ]
            },
            {
                content: "Un vector fuerza de 10 N forma un ángulo de 30° con el eje horizontal. Su componente vertical es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "5 N", isCorrect: true, explanation: "¡F_y = F \\sin(30°) = 10 \\cdot 0.5 = 5¡ N." },
                    { content: "10 N", isCorrect: false },
                    { content: "8.66 N", isCorrect: false },
                    { content: "0 N", isCorrect: false }
                ]
            },
            // Bloque II – Cinemática
            {
                content: "En una gráfica de velocidad vs. tiempo (v-t), el área bajo la curva representa:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Desplazamiento", isCorrect: true, explanation: "La integral de la velocidad en el tiempo es el cambio de posición." },
                    { content: "Aceleración", isCorrect: false },
                    { content: "Velocidad media", isCorrect: false },
                    { content: "Tiempo", isCorrect: false }
                ]
            },
            {
                content: "En el movimiento de un proyectil lanzado horizontalmente desde cierta altura, ¿cuál de las siguientes afirmaciones es FALSA?",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La velocidad vertical inicial es distinta de cero.", isCorrect: true, explanation: "Si se lanza horizontalmente, la componente vertical inicial es cero." },
                    { content: "La velocidad horizontal es constante.", isCorrect: false },
                    { content: "La aceleración vertical es constante.", isCorrect: false },
                    { content: "El tiempo de vuelo depende solo de la altura inicial.", isCorrect: false }
                ]
            },
            // Bloque III – Dinámica
            {
                content: "La Segunda Ley de Newton establece que ¡\\vec{F} = m\\vec{a}¡. Esto significa que:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La aceleración es directamente proporcional a la fuerza neta e inversamente proporcional a la masa.", isCorrect: true, explanation: "Es la interpretación directa de la ecuación despejando a." },
                    { content: "La fuerza es proporcional a la masa.", isCorrect: false },
                    { content: "La fuerza neta siempre es constante.", isCorrect: false },
                    { content: "La masa depende de la aceleración.", isCorrect: false }
                ]
            },
            {
                content: "Un bloque en reposo sobre un plano inclinado sin fricción. Las fuerzas que actúan sobre él son:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Peso y Normal", isCorrect: true, explanation: "Solo actúan la gravedad (peso) y la fuerza de contacto perpendicular (normal)." },
                    { content: "Peso, Normal, Fricción", isCorrect: false },
                    { content: "Peso, Normal, una fuerza a lo largo del plano", isCorrect: false },
                    { content: "Peso, Normal, y la fuerza que lo empuja hacia arriba", isCorrect: false }
                ]
            },
            // Bloque IV – Trabajo y Energía
            {
                content: "El trabajo realizado por la fuerza gravitacional al caer un objeto:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Es independiente de la trayectoria.", isCorrect: true, explanation: "La gravedad es una fuerza conservativa." },
                    { content: "Depende de la trayectoria.", isCorrect: false },
                    { content: "Es siempre cero.", isCorrect: false },
                    { content: "Solo depende de la velocidad final.", isCorrect: false }
                ]
            },
            {
                content: "Un objeto se deja caer desde el reposo. Ignorando la resistencia del aire, cuando ha caído la mitad de la altura total, su energía cinética es:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "La mitad de su energía potencial inicial", isCorrect: true, explanation: "Ha perdido la mitad de su potencial, que se ha transformado en cinética." },
                    { content: "Cero", isCorrect: false },
                    { content: "Igual a su energía potencial en ese punto", isCorrect: false }, // Also true numerically, but "half of initial potential" is the direct derivation requested
                    { content: "El doble de su energía potencial inicial", isCorrect: false }
                ]
            },
            // Bloque V – Cantidad de Movimiento
            {
                content: "En una colisión perfectamente inelástica entre dos cuerpos:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Se conserva el momento lineal, pero no la energía cinética.", isCorrect: true, explanation: "En choques inelásticos se pierde energía cinética (deformación, calor), pero p se conserva." },
                    { content: "Se conserva la energía cinética.", isCorrect: false },
                    { content: "Los cuerpos rebotan separándose.", isCorrect: false },
                    { content: "No se conserva el momento lineal.", isCorrect: false }
                ]
            },
            // Bloque VI – Movimiento Rotacional
            {
                content: "El torque es máximo cuando la fuerza se aplica:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Perpendicular al brazo de palanca", isCorrect: true, explanation: "¡\\tau = r F \\sin(\\theta)¡. Seno es máximo a 90 grados." },
                    { content: "Paralela al brazo de palanca", isCorrect: false },
                    { content: "En el punto de rotación", isCorrect: false },
                    { content: "Con un ángulo de 45°", isCorrect: false }
                ]
            },
            // Bloque VII – Oscilaciones y Ondas
            {
                content: "El período de un péndulo simple depende de:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La longitud del hilo y la gravedad", isCorrect: true, explanation: "¡T = 2\\pi \\sqrt{L/g}¡." },
                    { content: "La masa de la lenteja", isCorrect: false },
                    { content: "La amplitud de oscilación", isCorrect: false },
                    { content: "La energía inicial", isCorrect: false }
                ]
            },
            {
                content: "Para una onda mecánica, la relación entre velocidad ¡v¡, frecuencia ¡f¡ y longitud de onda ¡\\lambda¡ es:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "¡v = f \\lambda¡", isCorrect: true, explanation: "Ecuación fundamental de las ondas." },
                    { content: "¡v = f / \\lambda¡", isCorrect: false },
                    { content: "¡v = \\lambda / f¡", isCorrect: false },
                    { content: "¡v = 2\\pi f \\lambda¡", isCorrect: false }
                ]
            },
            {
                content: "Cuando dos ondas idénticas se superponen en fase, ocurre:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "Interferencia constructiva", isCorrect: true, explanation: "Las amplitudes se suman, resultando en una onda de mayor amplitud." },
                    { content: "Interferencia destructiva", isCorrect: false },
                    { content: "Reflexión", isCorrect: false },
                    { content: "Difracción", isCorrect: false }
                ]
            },
            // Bloque VIII – Cierre Conceptual
            {
                content: "La ecuación diferencial que describe un sistema masa-resorte ideal es ¡m\\frac{d^2x}{dt^2} = -kx¡. Esto implica que:",
                type: "multiple_choice",
                difficulty: 3,
                answers: [
                    { content: "La aceleración es proporcional al desplazamiento y de sentido opuesto.", isCorrect: true, explanation: "Es la definición dinámica del Movimiento Armónico Simple." },
                    { content: "La aceleración es proporcional al desplazamiento.", isCorrect: false },
                    { content: "La velocidad es constante.", isCorrect: false },
                    { content: "La fuerza restauradora es nula en el equilibrio.", isCorrect: false }
                ]
            },
            {
                content: "En un sistema masa-resorte horizontal sin fricción que oscila, cuando la masa pasa por la posición de equilibrio, se tiene que:",
                type: "multiple_choice",
                difficulty: 2,
                answers: [
                    { content: "La energía cinética es máxima y la potencial elástica es cero.", isCorrect: true, explanation: "En el equilibrio (x=0), toda la energía es cinética." },
                    { content: "La energía cinética es mínima.", isCorrect: false },
                    { content: "La energía potencial elástica es máxima.", isCorrect: false },
                    { content: "Toda la energía es potencial gravitatoria.", isCorrect: false }
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
        console.log(`🎉 Mechanical Physics Quiz setup complete! Quiz ID: ${quizId}`);

    } catch (error) {
        console.error("❌ Error creating quiz:", error);
    }
}

main();
