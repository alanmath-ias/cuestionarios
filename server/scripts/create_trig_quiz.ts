
import "dotenv/config";
import { db } from "../db.js";
import { quizzes, questions, answers } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

async function createTrigQuiz() {
    console.log("Creating Trigonometry Diagnostic Quiz...");

    try {
        // 1. Create Quiz
        const quizData = {
            id: 280,
            title: "Diagnóstico de Trigonometría",
            description: "Evalúa tus conocimientos en ángulos, funciones trigonométricas, identidades y resolución de triángulos.",
            categoryId: 21, // Diagnóstico
            subcategoryId: 251, // Trigonometría Nivelación
            difficulty: "medium",
            timeLimit: 1200, // 20 minutes
            totalQuestions: 12, // Select 12 from pool
            points: 100,
            passingScore: 60,
            isActive: true
        };

        // Check if exists
        const existingQuiz = await db.query.quizzes.findFirst({
            where: eq(quizzes.id, quizData.id)
        });

        if (!existingQuiz) {
            await db.insert(quizzes).values(quizData);
            console.log(`Quiz created with ID: ${quizData.id}`);
        } else {
            console.log(`Quiz ID ${quizData.id} already exists. Updating...`);
            await db.update(quizzes).set(quizData).where(eq(quizzes.id, quizData.id));
        }

        // Reset sequences if needed (optional, but good practice)
        // await db.execute(sql`SELECT setval('questions_id_seq', (SELECT MAX(id) FROM questions))`);
        // await db.execute(sql`SELECT setval('answers_id_seq', (SELECT MAX(id) FROM answers))`);

        // 2. Define Questions (36 total)
        const questionsList = [
            // --- PERIOD I: FUNDAMENTALS ---
            // Easy (4)
            {
                content: "Convierte ¡45^\\circ¡ a radianes.",
                difficulty: 1,
                answers: [
                    { content: "¡\\frac{\\pi}{4}¡", isCorrect: true },
                    { content: "¡\\frac{\\pi}{3}¡", isCorrect: false },
                    { content: "¡\\frac{\\pi}{6}¡", isCorrect: false },
                    { content: "¡\\frac{\\pi}{2}¡", isCorrect: false }
                ]
            },
            {
                content: "En un triángulo rectángulo, ¿qué razón trigonométrica relaciona el cateto opuesto con la hipotenusa?",
                difficulty: 1,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q1_Right_Triangle.png",
                answers: [
                    { content: "Seno", isCorrect: true },
                    { content: "Coseno", isCorrect: false },
                    { content: "Tangente", isCorrect: false },
                    { content: "Secante", isCorrect: false }
                ]
            },
            {
                content: "¿Cuál es el valor de ¡\\sin(30^\\circ)¡?",
                difficulty: 1,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q8_Unit_Circle.png",
                answers: [
                    { content: "¡\\frac{1}{2}¡", isCorrect: true },
                    { content: "¡\\frac{\\sqrt{3}}{2}¡", isCorrect: false },
                    { content: "¡\\frac{\\sqrt{2}}{2}¡", isCorrect: false },
                    { content: "¡1¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡\\tan(\\theta) = 1¡ y ¡\\theta¡ es agudo, ¿cuánto vale ¡\\theta¡?",
                difficulty: 1,
                answers: [
                    { content: "¡45^\\circ¡", isCorrect: true },
                    { content: "¡30^\\circ¡", isCorrect: false },
                    { content: "¡60^\\circ¡", isCorrect: false },
                    { content: "¡90^\\circ¡", isCorrect: false }
                ]
            },
            // Medium (4)
            {
                content: "Un observador ve la cima de un edificio con un ángulo de elevación de 30°. Si está a 50m de la base, ¿cuál es la altura aproximada del edificio?",
                difficulty: 2,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q5_Angle_Elevation.png",
                answers: [
                    { content: "¡50 \\tan(30^\\circ) \\approx 28.8m¡", isCorrect: true },
                    { content: "¡50 \\sin(30^\\circ) = 25m¡", isCorrect: false },
                    { content: "¡50 \\cos(30^\\circ) \\approx 43.3m¡", isCorrect: false },
                    { content: "¡50m¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica la expresión: ¡\\sin^2(x) + \\cos^2(x) + \\tan^2(x)¡",
                difficulty: 2,
                answers: [
                    { content: "¡\\sec^2(x)¡", isCorrect: true }, // 1 + tan^2 = sec^2
                    { content: "¡1¡", isCorrect: false },
                    { content: "¡\\cot^2(x)¡", isCorrect: false },
                    { content: "¡\\csc^2(x)¡", isCorrect: false }
                ]
            },
            {
                content: "Calcula el valor exacto de ¡\\cos(75^\\circ)¡ usando la identidad de suma de ángulos.",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{\\sqrt{6} - \\sqrt{2}}{4}¡", isCorrect: true }, // cos(45+30) = cos45cos30 - sin45sin30
                    { content: "¡\\frac{\\sqrt{6} + \\sqrt{2}}{4}¡", isCorrect: false },
                    { content: "¡\\frac{\\sqrt{2} - \\sqrt{6}}{4}¡", isCorrect: false },
                    { content: "¡\\frac{1}{4}¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡\\sec(\\theta) = 2¡, ¿cuál es el valor de ¡\\cos(\\theta)¡?",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{1}{2}¡", isCorrect: true },
                    { content: "¡2¡", isCorrect: false },
                    { content: "¡\\frac{\\sqrt{3}}{2}¡", isCorrect: false },
                    { content: "¡-2¡", isCorrect: false }
                ]
            },
            // Hard (4)
            {
                content: "Demuestra o selecciona la identidad equivalente a: ¡\\frac{1 - \\cos(2x)}{2}¡",
                difficulty: 3,
                answers: [
                    { content: "¡\\sin^2(x)¡", isCorrect: true },
                    { content: "¡\\cos^2(x)¡", isCorrect: false },
                    { content: "¡\\tan^2(x)¡", isCorrect: false },
                    { content: "¡1¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve para ¡x¡ en ¡[0, 2\\pi]¡: ¡2\\sin^2(x) - \\sin(x) - 1 = 0¡",
                difficulty: 3,
                answers: [
                    { content: "¡x = \\frac{\\pi}{2}, \\frac{7\\pi}{6}, \\frac{11\\pi}{6}¡", isCorrect: true },
                    { content: "¡x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}, \\frac{3\\pi}{2}¡", isCorrect: false },
                    { content: "¡x = 0, \\pi, 2\\pi¡", isCorrect: false },
                    { content: "¡x = \\frac{\\pi}{3}, \\frac{5\\pi}{3}¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡\\tan(\\alpha) = \\frac{1}{2}¡ y ¡\\tan(\\beta) = \\frac{1}{3}¡, calcula ¡\\tan(\\alpha + \\beta)¡.",
                difficulty: 3,
                answers: [
                    { content: "¡1¡", isCorrect: true }, // (1/2 + 1/3) / (1 - 1/6) = (5/6)/(5/6) = 1
                    { content: "¡\\frac{5}{6}¡", isCorrect: false },
                    { content: "¡\\frac{1}{6}¡", isCorrect: false },
                    { content: "¡\\infty¡", isCorrect: false }
                ]
            },
            {
                content: "Determina el periodo de la función ¡f(x) = 3\\sin(4x - \\pi) + 2¡.",
                difficulty: 3,
                answers: [
                    { content: "¡\\frac{\\pi}{2}¡", isCorrect: true }, // 2pi / 4
                    { content: "¡2\\pi¡", isCorrect: false },
                    { content: "¡4\\pi¡", isCorrect: false },
                    { content: "¡\\pi¡", isCorrect: false }
                ]
            },

            // --- PERIOD II: FUNCTIONS & EQUATIONS ---
            // Easy (4)
            {
                content: "¿Cuál es el ángulo de referencia para ¡150^\\circ¡?",
                difficulty: 1,
                answers: [
                    { content: "¡30^\\circ¡", isCorrect: true },
                    { content: "¡60^\\circ¡", isCorrect: false },
                    { content: "¡45^\\circ¡", isCorrect: false },
                    { content: "¡-30^\\circ¡", isCorrect: false }
                ]
            },
            {
                content: "¿En qué cuadrante el seno es positivo y el coseno es negativo?",
                difficulty: 1,
                answers: [
                    { content: "II Cuadrante", isCorrect: true },
                    { content: "I Cuadrante", isCorrect: false },
                    { content: "III Cuadrante", isCorrect: false },
                    { content: "IV Cuadrante", isCorrect: false }
                ]
            },
            {
                content: "La gráfica de ¡y = \\sin(x)¡ cruza el eje x en:",
                difficulty: 1,
                answers: [
                    { content: "¡x = 0, \\pi, 2\\pi...¡", isCorrect: true },
                    { content: "¡x = \\frac{\\pi}{2}, \\frac{3\\pi}{2}...¡", isCorrect: false },
                    { content: "¡x = \\frac{\\pi}{4}, \\frac{5\\pi}{4}...¡", isCorrect: false },
                    { content: "Nunca cruza el eje x", isCorrect: false }
                ]
            },
            {
                content: "¿Cuál es el rango de la función ¡y = \\cos(x)¡?",
                difficulty: 1,
                answers: [
                    { content: "¡[-1, 1]¡", isCorrect: true },
                    { content: "¡(-\\infty, \\infty)¡", isCorrect: false },
                    { content: "¡[0, 1]¡", isCorrect: false },
                    { content: "¡[-1, 0]¡", isCorrect: false }
                ]
            },
            // Medium (4)
            {
                content: "Identifica la amplitud de la función ¡y = -2\\cos(3x)¡.",
                difficulty: 2,
                answers: [
                    { content: "¡2¡", isCorrect: true },
                    { content: "¡-2¡", isCorrect: false },
                    { content: "¡3¡", isCorrect: false },
                    { content: "¡6¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve la ecuación simple: ¡2\\cos(x) = 1¡ en el primer cuadrante.",
                difficulty: 2,
                answers: [
                    { content: "¡60^\\circ¡", isCorrect: true },
                    { content: "¡30^\\circ¡", isCorrect: false },
                    { content: "¡45^\\circ¡", isCorrect: false },
                    { content: "¡90^\\circ¡", isCorrect: false }
                ]
            },
            {
                content: "¿Cuál es el desfase de la función ¡y = \\sin(x - \\frac{\\pi}{2})¡?",
                difficulty: 2,
                answers: [
                    { content: "¡\\frac{\\pi}{2}¡ a la derecha", isCorrect: true },
                    { content: "¡\\frac{\\pi}{2}¡ a la izquierda", isCorrect: false },
                    { content: "¡\\pi¡ a la derecha", isCorrect: false },
                    { content: "No tiene desfase", isCorrect: false }
                ]
            },
            {
                content: "Calcula ¡\\arcsin(\\frac{\\sqrt{2}}{2})¡.",
                difficulty: 2,
                answers: [
                    { content: "¡45^\\circ¡", isCorrect: true },
                    { content: "¡30^\\circ¡", isCorrect: false },
                    { content: "¡60^\\circ¡", isCorrect: false },
                    { content: "¡90^\\circ¡", isCorrect: false }
                ]
            },
            // Hard (4)
            {
                content: "Resuelve el sistema: ¡\\sin(x) + \\cos(y) = 1¡ y ¡\\sin(x) - \\cos(y) = 0¡ para ¡x, y¡ agudos.",
                difficulty: 3,
                answers: [
                    { content: "¡x = 30^\\circ, y = 60^\\circ¡", isCorrect: true }, // 2sin(x)=1 -> sin(x)=1/2 -> x=30. cos(y)=1/2 -> y=60
                    { content: "¡x = 60^\\circ, y = 30^\\circ¡", isCorrect: false },
                    { content: "¡x = 45^\\circ, y = 45^\\circ¡", isCorrect: false },
                    { content: "¡x = 90^\\circ, y = 0^\\circ¡", isCorrect: false }
                ]
            },
            {
                content: "Encuentra la solución general de ¡\\tan(3x) = 1¡.",
                difficulty: 3,
                answers: [
                    { content: "¡x = \\frac{\\pi}{12} + \\frac{n\\pi}{3}¡", isCorrect: true },
                    { content: "¡x = \\frac{\\pi}{4} + n\\pi¡", isCorrect: false },
                    { content: "¡x = \\frac{\\pi}{12} + n\\pi¡", isCorrect: false },
                    { content: "¡x = \\frac{\\pi}{3} + n\\pi¡", isCorrect: false }
                ]
            },
            {
                content: "Simplifica: ¡\\frac{\\sin(2x)}{1 + \\cos(2x)}¡",
                difficulty: 3,
                answers: [
                    { content: "¡\\tan(x)¡", isCorrect: true }, // 2sinxcosx / (1 + 2cos^2x - 1) = 2sinxcosx / 2cos^2x = tanx
                    { content: "¡\\cot(x)¡", isCorrect: false },
                    { content: "¡\\sin(x)¡", isCorrect: false },
                    { content: "¡\\cos(x)¡", isCorrect: false }
                ]
            },
            {
                content: "Si ¡\\sin(x) = \\frac{3}{5}¡ y ¡x¡ está en el II cuadrante, calcula ¡\\cos(2x)¡.",
                difficulty: 3,
                answers: [
                    { content: "¡\\frac{7}{25}¡", isCorrect: true }, // cos2x = 1 - 2sin^2x = 1 - 2(9/25) = 1 - 18/25 = 7/25
                    { content: "¡-\\frac{7}{25}¡", isCorrect: false },
                    { content: "¡\\frac{24}{25}¡", isCorrect: false },
                    { content: "¡-\\frac{24}{25}¡", isCorrect: false }
                ]
            },

            // --- PERIOD III: ADVANCED TOPICS ---
            // Easy (4)
            {
                content: "En un triángulo oblicuángulo, si conocemos dos ángulos y un lado no incluido, ¿qué ley usamos?",
                difficulty: 1,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q25_Sine_Law.png",
                answers: [
                    { content: "Ley de Senos", isCorrect: true },
                    { content: "Ley de Cosenos", isCorrect: false },
                    { content: "Teorema de Pitágoras", isCorrect: false },
                    { content: "Ley de Tangentes", isCorrect: false }
                ]
            },
            {
                content: "Calcula el área de un triángulo con lados 3 y 4, y ángulo comprendido de 30°.",
                difficulty: 1,
                answers: [
                    { content: "¡3¡", isCorrect: true }, // 0.5 * 3 * 4 * sin(30) = 6 * 0.5 = 3
                    { content: "¡6¡", isCorrect: false },
                    { content: "¡12¡", isCorrect: false },
                    { content: "¡1.5¡", isCorrect: false }
                ]
            },
            {
                content: "¿Qué cónica representa la ecuación ¡x^2 + y^2 = 9¡?",
                difficulty: 1,
                answers: [
                    { content: "Circunferencia", isCorrect: true },
                    { content: "Elipse", isCorrect: false },
                    { content: "Parábola", isCorrect: false },
                    { content: "Hipérbola", isCorrect: false }
                ]
            },
            {
                content: "La forma polar del número complejo ¡z = 1 + i¡ es:",
                difficulty: 1,
                answers: [
                    { content: "¡\\sqrt{2}(\\cos 45^\\circ + i \\sin 45^\\circ)¡", isCorrect: true },
                    { content: "¡2(\\cos 30^\\circ + i \\sin 30^\\circ)¡", isCorrect: false },
                    { content: "¡1(\\cos 90^\\circ + i \\sin 90^\\circ)¡", isCorrect: false },
                    { content: "¡\\sqrt{2}(\\cos 60^\\circ + i \\sin 60^\\circ)¡", isCorrect: false }
                ]
            },
            // Medium (4)
            {
                content: "Usa la Ley de Cosenos para hallar el lado ¡c¡ si ¡a=3, b=4, C=60^\\circ¡.",
                difficulty: 2,
                answers: [
                    { content: "¡\\sqrt{13}¡", isCorrect: true }, // c^2 = 9 + 16 - 2*3*4*0.5 = 25 - 12 = 13
                    { content: "¡5¡", isCorrect: false },
                    { content: "¡\\sqrt{37}¡", isCorrect: false },
                    { content: "¡7¡", isCorrect: false }
                ]
            },
            {
                content: "Identifica la cónica: ¡y = x^2 - 4x + 3¡.",
                difficulty: 2,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q30_Parabola.png",
                answers: [
                    { content: "Parábola", isCorrect: true },
                    { content: "Elipse", isCorrect: false },
                    { content: "Hipérbola", isCorrect: false },
                    { content: "Recta", isCorrect: false }
                ]
            },
            {
                content: "Convierte el punto polar ¡(4, 60^\\circ)¡ a coordenadas rectangulares.",
                difficulty: 2,
                answers: [
                    { content: "¡(2, 2\\sqrt{3})¡", isCorrect: true },
                    { content: "¡(2\\sqrt{3}, 2)¡", isCorrect: false },
                    { content: "¡(2, 2)¡", isCorrect: false },
                    { content: "¡(4, 4)¡", isCorrect: false }
                ]
            },
            {
                content: "Identifica la cónica: ¡\\frac{x^2}{16} + \\frac{y^2}{4} = 1¡.",
                difficulty: 2,
                imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q32_Ellipse.png",
                answers: [
                    { content: "Elipse", isCorrect: true },
                    { content: "Hipérbola", isCorrect: false },
                    { content: "Circunferencia", isCorrect: false },
                    { content: "Parábola", isCorrect: false }
                ]
            },
            // Hard (4)
            {
                content: "Calcula ¡(1+i)^{10}¡ usando el Teorema de De Moivre.",
                difficulty: 3,
                answers: [
                    { content: "¡32i¡", isCorrect: true }, // (sqrt2 cis 45)^10 = 32 cis 450 = 32 cis 90 = 32i
                    { content: "¡-32i¡", isCorrect: false },
                    { content: "¡32¡", isCorrect: false },
                    { content: "¡-32¡", isCorrect: false }
                ]
            },
            {
                content: "Encuentra los focos de la hipérbola ¡\\frac{x^2}{9} - \\frac{y^2}{16} = 1¡.",
                difficulty: 3,
                answers: [
                    { content: "¡(\\pm 5, 0)¡", isCorrect: true }, // c^2 = 9+16=25 -> c=5
                    { content: "¡(0, \\pm 5)¡", isCorrect: false },
                    { content: "¡(\\pm 3, 0)¡", isCorrect: false },
                    { content: "¡(\\pm 4, 0)¡", isCorrect: false }
                ]
            },
            {
                content: "Resuelve el triángulo (halla B) si ¡a=10, b=15, A=30^\\circ¡ (Caso ambiguo).",
                difficulty: 3,
                answers: [
                    { content: "Dos soluciones: ¡48.6^\\circ¡ o ¡131.4^\\circ¡", isCorrect: true }, // sinB = 15sin30/10 = 0.75. B=48.6 or 180-48.6
                    { content: "Una solución: ¡48.6^\\circ¡", isCorrect: false },
                    { content: "No tiene solución", isCorrect: false },
                    { content: "Una solución: ¡90^\\circ¡", isCorrect: false }
                ]
            },
            {
                content: "Determina la ecuación de la elipse con vértices en ¡(\\pm 5, 0)¡ y focos en ¡(\\pm 3, 0)¡.",
                difficulty: 3,
                answers: [
                    { content: "¡\\frac{x^2}{25} + \\frac{y^2}{16} = 1¡", isCorrect: true }, // a=5, c=3 -> b^2 = 25-9=16
                    { content: "¡\\frac{x^2}{25} + \\frac{y^2}{9} = 1¡", isCorrect: false },
                    { content: "¡\\frac{x^2}{16} + \\frac{y^2}{25} = 1¡", isCorrect: false },
                    { content: "¡\\frac{x^2}{9} + \\frac{y^2}{25} = 1¡", isCorrect: false }
                ]
            }
        ];

        // 3. Insert Questions
        for (const q of questionsList) {
            // Check for duplicates
            const existingQ = await db.query.questions.findFirst({
                where: (questions, { and, eq }) => and(
                    eq(questions.quizId, quizData.id),
                    eq(questions.content, q.content)
                )
            });

            if (existingQ) {
                console.log(`Question "${q.content.substring(0, 20)}..." already exists.`);
                continue;
            }

            const [newQ] = await db.insert(questions).values({
                quizId: quizData.id,
                content: q.content,
                type: "multiple_choice",
                difficulty: q.difficulty,
                points: 10,
                imageUrl: q.imageUrl || null
            }).returning();

            for (const a of q.answers) {
                await db.insert(answers).values({
                    questionId: newQ.id,
                    content: a.content,
                    isCorrect: a.isCorrect
                });
            }
            console.log(`Inserted question: ${q.content.substring(0, 30)}...`);
        }

        console.log("Trigonometry Quiz created successfully.");

    } catch (error) {
        console.error("Error creating quiz:", error);
    }
}

createTrigQuiz();
