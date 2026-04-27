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
    Eres un experto en pedagogía matemática y generación de contenido educativo.
    Tu tarea es generar un cuestionario altamente específico basado en la siguiente descripción proporcionada por el usuario:
    DESCRIPCIÓN DEL TEMA: "${topicDescription}"
    
    REGLAS ESTRICTAS:
    1. Las preguntas DEBEN ajustarse exactamente al tema: "${topicDescription}".
    2. Todo el contenido matemático debe usar delimitadores de apertura y cierre ¡¡ (ejemplo: ¡¡x + 2 = 5¡¡).
    3. NUNCA uses el símbolo $ para fórmulas matemáticas.
    4. Usa únicamente el símbolo de EURO (€) si se requiere una unidad monetaria.
    5. No mezcles palabras y números dentro de los delimitadores ¡¡ (ejemplo incorrecto: ¡¡3 Euros¡¡, correcto: ¡¡3¡¡ Euros o ¡¡3¡¡ ¡¡Euros¡¡).
    
    Genera ${questionCount} preguntas en formato JSON.
6.  **ALEATORIZACIÓN CRÍTICA**: La posición de la respuesta correcta (isCorrect: true) DEBE SER ALEATORIA para cada pregunta (no siempre la primera, ni siempre la misma posición).
7.  Todas las preguntas deben ser de tipo 'multiple_choice' con exactamente 4 opciones.
8.  El lenguaje debe ser claro, educativo y en español.
9.  Las opciones de respuesta deben estar bien pensadas (incluye distractores comunes).
10. **UNICIDAD OBLIGATORIA**: Los textos de las 4 opciones deben ser COMPLETAMENTE distintos entre sí. Nunca repitas el mismo valor o texto.
11. Incluye una breve explicación pedagógica de la respuesta correcta (máximo 2 líneas).
12. Prioriza ejercicios técnicos directos. Evita enunciados extensos, historias o contextos innecesarios.
13. **IMPORTANTE**: No uses nunca los signos de exclamación '¡' ni '!' para puntuación de texto. Úsalos ÚNICAMENTE para delimitar fórmulas matemáticas en LaTeX (ejemplo: ¡¡ x^2 ¡¡).

DEVUELVE ÚNICAMENTE UN OBJETO JSON CON ESTE FORMATO (sin markdown):
{
  "title": "Un título creativo para el cuestionario",
  "description": "Una breve descripción motivadora",
  "questions": [
    {
      "content": "Texto de la pregunta...",
      "explanation": "Explicación de por qué la respuesta es correcta...",
      "options": [
        { "content": "Distractor 1", "isCorrect": false },
        { "content": "Distractor 2", "isCorrect": false },
        { "content": "Respuesta Correcta", "isCorrect": true },
        { "content": "Distractor 3", "isCorrect": false }
      ]
    }
  ]
}`;

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DeepSeek API key not configured");

  // Hard timeout: 25s — production reverse proxies often cut connections at 30s
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let aiResponse: Response;
  try {
    aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal,
    });
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      throw new Error('La IA tardó demasiado. Intenta de nuevo.');
    }
    throw fetchError;
  }
  clearTimeout(timeoutId);

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
