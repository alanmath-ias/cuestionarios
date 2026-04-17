import { storage } from "./storage.js";
import { db } from "./db.js";
import { users, quizzes, questions as questionsTable, answers } from "../shared/schema.js";
import { eq } from "drizzle-orm";

// Ayudante para limpiar y parsear JSON de la IA de forma robusta
export function cleanAiJson(content: string) {
  let cleaned = content.trim();
  
  // 1. Eliminar bloques de Markdown si existen
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*\n?/, '').replace(/\n?```$/, '');
  }
  
  cleaned = cleaned.trim();

  // 2. Corregir escapes de barra invertida comunes en LaTeX que rompen JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    const fixedContent = cleaned.replace(/\\(?![\\\/bfnrtu])/g, '\\\\');
    try {
      return JSON.parse(fixedContent);
    } catch (secondError) {
      console.error("Fallo definitivo en parseo AI JSON:", secondError);
      throw secondError;
    }
  }
}

export async function generateAiQuizData(params: {
  topicDescription: string;
  categoryName: string;
  subcategoryName?: string;
  difficulty: string;
  questionCount: number;
}) {
  const { topicDescription, categoryName, subcategoryName, difficulty, questionCount } = params;

  const difficultyMap: Record<string, string> = {
    'easy': 'Principiante',
    'medium': 'Intermedio',
    'hard': 'Avanzado/Olimpiada'
  };

  const prompt = `Actúa como un profesor de matemáticas experto y creativo. Crea un cuestionario de alta calidad.
TEMA: ${topicDescription}
MATERIA: ${categoryName}
SUBTEMA GENERAL: ${subcategoryName || 'General'}
DIFICULTAD: ${difficultyMap[difficulty] || 'Intermedio'}
NÚMERO DE PREGUNTAS: ${questionCount}

REQUISITOS TÉCNICOS:
1. Usa texto plano para los enunciados y explicaciones. Reserva la notación LaTeX solo para lo que sea estrictamente necesario (fracciones, raíces, potencias, logaritmos o fórmulas complejas).
2. MUY IMPORTANTE: La apertura y el CIERRE del bloque de LaTeX debe ser EXACTAMENTE el mismo carácter ¡ (no uses ! ni otros símbolos). Ejemplo: ¡\frac{a}{b}¡
3. Todas las preguntas deben ser de tipo 'multiple_choice' con exactamente 4 opciones.
4. El lenguaje debe ser claro, educativo y en español.
5. Las opciones de respuesta deben estar bien pensadas (incluye distractores comunes).
6. Incluye una breve explicación pedagógica de la respuesta correcta (máximo 2 líneas).
7. Prioriza ejercicios técnicos directos. Evita enunciados extensos, historias o contextos innecesarios.

DEVUELVE ÚNICAMENTE UN OBJETO JSON CON ESTE FORMATO (sin markdown):
{
  "title": "Un título creativo para el cuestionario",
  "description": "Una breve descripción motivadora",
  "questions": [
    {
      "content": "Texto de la pregunta...",
      "explanation": "Explicación de por qué la respuesta es correcta...",
      "options": [
        { "text": "Opción 1", "isCorrect": true },
        { "text": "Opción 2", "isCorrect": false },
        { "text": "Opción 3", "isCorrect": false },
        { "text": "Opción 4", "isCorrect": false }
      ]
    }
  ]
}`;

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DeepSeek API key not configured");

  const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    console.error("DeepSeek API Error:", errText);
    throw new Error("Error al contactar con el genio de la IA.");
  }

  const aiData: any = await aiResponse.json();
  try {
    return cleanAiJson(aiData.choices[0].message.content);
  } catch (e) {
    console.error("JSON Parsing Error from AI:", aiData.choices[0].message.content);
    throw new Error("La IA generó un formato inválido. Por favor intenta de nuevo.");
  }
}
