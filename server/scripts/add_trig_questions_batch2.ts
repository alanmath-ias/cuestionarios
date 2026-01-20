
import "dotenv/config";
import { db } from "../db.js";
import { questions, answers } from "../../shared/schema.js";

const quizId = 280;

const newQuestions = [
    // --- SET 1 ---
    // Q1: Radians to degrees (Easy, Period I)
    {
        quizId,
        content: "¿Cuántos radianes equivalen a ¡180^\\circ¡?",
        difficulty: 1,
        answers: [
            { content: "¡\\pi/2¡", isCorrect: false },
            { content: "¡\\pi¡", isCorrect: true },
            { content: "¡2\\pi¡", isCorrect: false },
            { content: "¡1¡", isCorrect: false }
        ]
    },
    // Q2: Sine definition (Easy, Period I)
    {
        quizId,
        content: "En un triángulo rectángulo, el seno de un ángulo agudo se define como:",
        difficulty: 1,
        answers: [
            { content: "¡\\text{cateto adyacente} / \\text{hipotenusa}¡", isCorrect: false },
            { content: "¡\\text{cateto opuesto} / \\text{hipotenusa}¡", isCorrect: true },
            { content: "¡\\text{hipotenusa} / \\text{cateto opuesto}¡", isCorrect: false },
            { content: "¡\\text{cateto opuesto} / \\text{cateto adyacente}¡", isCorrect: false }
        ]
    },
    // Q3: Sin(30) (Easy, Period I)
    {
        quizId,
        content: "¿Cuál es el valor de ¡\\sin(30^\\circ)¡?",
        difficulty: 1,
        answers: [
            { content: "¡1¡", isCorrect: false },
            { content: "¡\\sqrt{3}/2¡", isCorrect: false },
            { content: "¡1/2¡", isCorrect: true },
            { content: "¡\\sqrt{2}/2¡", isCorrect: false }
        ]
    },
    // Q4: Identity sin^2+cos^2=1 (Easy, Period I)
    {
        quizId,
        content: "¿Cuál de las siguientes identidades es correcta?",
        difficulty: 1,
        answers: [
            { content: "¡\\sin^2x + \\cos^2x = 1¡", isCorrect: true },
            { content: "¡\\sin x + \\cos x = 1¡", isCorrect: false },
            { content: "¡\\tan x = \\sin x \\cdot \\cos x¡", isCorrect: false },
            { content: "¡1 + \\tan^2x = \\cos^2x¡", isCorrect: false }
        ]
    },
    // Q5: Angle of elevation definition (Easy, Period I)
    {
        quizId,
        content: "Un ángulo de elevación es:",
        difficulty: 1,
        answers: [
            { content: "El ángulo entre la horizontal y la línea de visión hacia abajo", isCorrect: false },
            { content: "El ángulo entre la vertical y la línea de visión", isCorrect: false },
            { content: "El ángulo entre la horizontal y la línea de visión hacia arriba", isCorrect: true },
            { content: "Un ángulo medido desde el eje y", isCorrect: false }
        ]
    },
    // Q6: Function definition (Easy, Period II)
    {
        quizId,
        content: "Una función es una relación donde:",
        difficulty: 1,
        answers: [
            { content: "Un valor de x tiene varios valores de y", isCorrect: false },
            { content: "Cada valor de x tiene un único valor de y", isCorrect: true },
            { content: "Cada valor de y tiene un único valor de x", isCorrect: false },
            { content: "x y y son independientes", isCorrect: false }
        ]
    },
    // Q7: Cos(0) (Easy, Period I)
    {
        quizId,
        content: "¿Cuál es el valor de ¡\\cos(0)¡?",
        difficulty: 1,
        answers: [
            { content: "¡0¡", isCorrect: false },
            { content: "¡1¡", isCorrect: true },
            { content: "¡-1¡", isCorrect: false },
            { content: "¡\\pi¡", isCorrect: false }
        ]
    },
    // Q8: Reference angle 210 (Medium, Period I)
    {
        quizId,
        content: "El ángulo de referencia de ¡210^\\circ¡ es:",
        difficulty: 2,
        imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q_RefAngle210.png",
        answers: [
            { content: "¡30^\\circ¡", isCorrect: true },
            { content: "¡60^\\circ¡", isCorrect: false },
            { content: "¡150^\\circ¡", isCorrect: false },
            { content: "¡210^\\circ¡", isCorrect: false }
        ]
    },
    // Q9: Transformation (Shift) (Medium, Period II)
    {
        quizId,
        content: "La función ¡y = \\sin(x - \\pi/2)¡ representa una:",
        difficulty: 2,
        answers: [
            { content: "Dilatación vertical", isCorrect: false },
            { content: "Reflexión respecto al eje x", isCorrect: false },
            { content: "Traslación horizontal", isCorrect: true },
            { content: "Contracción horizontal", isCorrect: false }
        ]
    },
    // Q10: Solve sin(x)=0 (Medium, Period II)
    {
        quizId,
        content: "Una solución de la ecuación ¡\\sin(x) = 0¡ en ¡[0, 2\\pi]¡ es:",
        difficulty: 2,
        answers: [
            { content: "¡\\pi/2¡", isCorrect: false },
            { content: "¡\\pi¡", isCorrect: true },
            { content: "¡\\pi/3¡", isCorrect: false },
            { content: "¡\\pi/6¡", isCorrect: false }
        ]
    },
    // Q11: Law of Sines formula (Easy, Period III)
    {
        quizId,
        content: "La Ley de Senos establece que:",
        difficulty: 1,
        answers: [
            { content: "¡a^2 = b^2 + c^2 - 2bc\\cos A¡", isCorrect: false },
            { content: "¡\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}¡", isCorrect: true },
            { content: "¡\\sin A + \\sin B + \\sin C = 1¡", isCorrect: false },
            { content: "¡\\cos A = b/c¡", isCorrect: false }
        ]
    },
    // Q12: Law of Cosines formula (Easy, Period III)
    {
        quizId,
        content: "La expresión correcta de la Ley de Cosenos es:",
        difficulty: 1,
        answers: [
            { content: "¡a^2 = b^2 + c^2¡", isCorrect: false },
            { content: "¡a^2 = b^2 + c^2 - 2bc\\cos A¡", isCorrect: true },
            { content: "¡a^2 = (b + c)^2¡", isCorrect: false },
            { content: "¡\\cos A = a/b¡", isCorrect: false }
        ]
    },

    // --- SET 2 ---
    // Q13: Convert 150 deg to rad (Easy, Period I)
    {
        quizId,
        content: "Convierte ¡150^\\circ¡ a radianes y simplifica.",
        difficulty: 1,
        answers: [
            { content: "¡\\frac{\\pi}{6}¡", isCorrect: false },
            { content: "¡\\frac{5\\pi}{6}¡", isCorrect: true },
            { content: "¡\\frac{2\\pi}{3}¡", isCorrect: false },
            { content: "¡\\frac{3\\pi}{4}¡", isCorrect: false }
        ]
    },
    // Q14: Csc(alpha) given sides (Medium, Period I)
    {
        quizId,
        content: "En un triángulo rectángulo, el cateto opuesto a un ángulo ¡\\alpha¡ mide 3 y la hipotenusa mide 5. ¿Cuál es el valor de ¡\\csc(\\alpha)¡?",
        difficulty: 2,
        answers: [
            { content: "¡\\frac{3}{5}¡", isCorrect: false },
            { content: "¡\\frac{4}{5}¡", isCorrect: false },
            { content: "¡\\frac{5}{4}¡", isCorrect: false },
            { content: "¡\\frac{5}{3}¡", isCorrect: true }
        ]
    },
    // Q15: Tan(60)+Cos(45) (Medium, Period I)
    {
        quizId,
        content: "¿Cuál es el valor exacto de ¡\\tan(60^\\circ) + \\cos(45^\\circ)¡?",
        difficulty: 2,
        answers: [
            { content: "¡\\frac{2 + \\sqrt{6}}{2}¡", isCorrect: false },
            { content: "¡\\frac{2 + \\sqrt{3}}{2}¡", isCorrect: false },
            { content: "¡\\sqrt{3} + \\frac{\\sqrt{2}}{2}¡", isCorrect: true },
            { content: "¡1 + \\sqrt{2}¡", isCorrect: false }
        ]
    },
    // Q16: Sec(theta) given sin (Hard, Period I)
    {
        quizId,
        content: "Si ¡\\sin(\\theta) = \\frac{1}{3}¡ y ¡\\theta¡ está en el primer cuadrante, ¿cuál es el valor de ¡\\sec(\\theta)¡?",
        difficulty: 3,
        answers: [
            { content: "¡3¡", isCorrect: false },
            { content: "¡\\frac{3\\sqrt{2}}{4}¡", isCorrect: true },
            { content: "¡\\frac{3}{2\\sqrt{2}}¡", isCorrect: false },
            { content: "¡\\frac{\\sqrt{8}}{3}¡", isCorrect: false }
        ]
    },
    // Q17: Tan(x) domain (Medium, Period II)
    {
        quizId,
        content: "¿Para cuál de los siguientes valores de ¡x¡ la función ¡f(x) = \\tan(x)¡ NO está definida?",
        difficulty: 2,
        answers: [
            { content: "¡x = 0¡", isCorrect: false },
            { content: "¡x = \\pi¡", isCorrect: false },
            { content: "¡x = \\frac{\\pi}{2}¡", isCorrect: true },
            { content: "¡x = \\frac{3\\pi}{4}¡", isCorrect: false }
        ]
    },
    // Q18: Sin(150) ref angle (Medium, Period I)
    {
        quizId,
        content: "Usando ángulos de referencia, el valor de ¡\\sin(150^\\circ)¡ es igual a:",
        difficulty: 2,
        answers: [
            { content: "¡-\\sin(30^\\circ)¡", isCorrect: false },
            { content: "¡-\\cos(60^\\circ)¡", isCorrect: false },
            { content: "¡\\sin(30^\\circ)¡", isCorrect: true },
            { content: "¡\\cos(30^\\circ)¡", isCorrect: false }
        ]
    },
    // Q19: Amplitude (Medium, Period II)
    {
        quizId,
        content: "La función ¡y = 2 + 3\\sin(4x - \\pi)¡ tiene una amplitud de:",
        difficulty: 2,
        imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q_SineAmplitude.png",
        answers: [
            { content: "¡1¡", isCorrect: false },
            { content: "¡3¡", isCorrect: true },
            { content: "¡2¡", isCorrect: false },
            { content: "¡4¡", isCorrect: false }
        ]
    },
    // Q20: Cos(75) sum identity (Hard, Period II)
    {
        quizId,
        content: "Usando la identidad para la suma, ¡\\cos(75^\\circ)¡ es igual a:",
        difficulty: 3,
        answers: [
            { content: "¡\\frac{\\sqrt{6} - \\sqrt{2}}{4}¡", isCorrect: true },
            { content: "¡\\frac{\\sqrt{6} + \\sqrt{2}}{4}¡", isCorrect: false },
            { content: "¡\\frac{\\sqrt{3} - 1}{2\\sqrt{2}}¡", isCorrect: false },
            { content: "¡\\frac{\\sqrt{3} + 1}{2\\sqrt{2}}¡", isCorrect: false }
        ]
    },
    // Q21: Solve sin(x)=1/2 general (Hard, Period II)
    {
        quizId,
        content: "La solución general de la ecuación ¡\\sin(x) = \\frac{1}{2}¡ en radianes es:",
        difficulty: 3,
        answers: [
            { content: "¡x = \\frac{\\pi}{6} + 2k\\pi¡", isCorrect: false },
            { content: "¡x = \\frac{5\\pi}{6} + 2k\\pi¡", isCorrect: false },
            { content: "¡x = \\frac{\\pi}{6} + 2k\\pi \\text{ o } x = \\frac{5\\pi}{6} + 2k\\pi¡", isCorrect: true },
            { content: "¡x = \\frac{\\pi}{3} + k\\pi¡", isCorrect: false }
        ]
    },
    // Q22: Law of Sines calc (Hard, Period III)
    {
        quizId,
        content: "En un triángulo ¡ABC¡, se sabe que ¡\\angle A = 30^\\circ¡, ¡\\angle B = 45^\\circ¡ y el lado ¡a = 10¡. ¿Cuál es la longitud aproximada del lado ¡b¡? (Usa ¡\\sqrt{2} \\approx 1.414¡)",
        difficulty: 3,
        imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q_LawSines.png",
        answers: [
            { content: "¡7.07¡", isCorrect: false },
            { content: "¡14.14¡", isCorrect: true },
            { content: "¡10¡", isCorrect: false },
            { content: "¡12.24¡", isCorrect: false }
        ]
    },
    // Q23: Law of Cosines calc angle (Hard, Period III)
    {
        quizId,
        content: "Un triángulo tiene lados de longitud 5, 6 y 7. ¿Cuál es la medida aproximada del ángulo opuesto al lado de longitud 7?",
        difficulty: 3,
        imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q_LawCosines.png",
        answers: [
            { content: "¡44.4^\\circ¡", isCorrect: false },
            { content: "¡57.1^\\circ¡", isCorrect: false },
            { content: "¡78.5^\\circ¡", isCorrect: true },
            { content: "¡101.5^\\circ¡", isCorrect: false }
        ]
    },
    // Q24: Complex number trig form (Hard, Period III)
    {
        quizId,
        content: "Si un número complejo tiene módulo 2 y argumento ¡\\frac{\\pi}{3}¡, su forma trigonométrica es:",
        difficulty: 3,
        imageUrl: "https://imagenes.alanmath.com/test_diagnosticos/trigonometria/C21_P280_Q_ComplexNum.png",
        answers: [
            { content: "¡2(\\sin(\\frac{\\pi}{3}) + i \\cos(\\frac{\\pi}{3}))¡", isCorrect: false },
            { content: "¡2(\\cos(\\frac{\\pi}{6}) + i \\sin(\\frac{\\pi}{6}))¡", isCorrect: false },
            { content: "¡2(\\cos(\\frac{\\pi}{3}) + i \\sin(\\frac{\\pi}{3}))¡", isCorrect: true },
            { content: "¡(\\cos(2) + i \\sin(2))¡", isCorrect: false }
        ]
    }
];

async function insertBatch2() {
    console.log("Inserting Batch 2 questions for Trigonometry Quiz (ID 280)...");

    try {
        for (const q of newQuestions) {
            const [question] = await db.insert(questions).values({
                quizId: q.quizId,
                content: q.content,
                difficulty: q.difficulty,
                imageUrl: q.imageUrl || null,
                points: 10,
                type: "multiple_choice"
            }).returning();

            console.log(`Inserted Question ID: ${question.id}`);

            for (const a of q.answers) {
                await db.insert(answers).values({
                    questionId: question.id,
                    content: a.content,
                    isCorrect: a.isCorrect
                });
            }
        }
        console.log("✅ Batch 2 insertion complete!");
    } catch (error) {
        console.error("Error inserting questions:", error);
    }
}

insertBatch2();
