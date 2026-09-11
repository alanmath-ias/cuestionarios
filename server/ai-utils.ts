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

  // 2. Corregir escapes de barra invertida en LaTeX que rompen JSON.parse.
  // Solo preservamos \" \\ \/ y \uXXXX (escapes JSON reales).
  // NO excluimos \t \n \r \b \f porque en matemáticas son siempre comandos
  // LaTeX (\times, \to, \nabla, \beta, \frac, \begin...) y nunca control chars.
  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    const fixedContent = cleaned.replace(/\\(?!["\\/u])/g, '\\\\');
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
    2. Todo el contenido matemático debe usar delimitadores de apertura y cierre ¡ (un solo símbolo de exclamación invertido, ejemplo: ¡x + 2 = 5¡). NO uses doble ¡¡.
    3. NUNCA uses el símbolo $ para fórmulas matemáticas.
    4. Usa únicamente el símbolo de EURO (€) si se requiere una unidad monetaria.
    5. No mezcles palabras y números dentro de los delimitadores ¡ (ejemplo incorrecto: ¡3 Euros¡, correcto: ¡3¡ Euros o ¡3¡ ¡Euros¡).
    
    Genera ${questionCount} preguntas en formato JSON.
    6.  **ALEATORIZACIÓN CRÍTICA**: La posición de la respuesta correcta (isCorrect: true) DEBE SER ALEATORIA para cada pregunta (no siempre la primera, ni siempre la misma posición).
    7.  Todas las preguntas deben ser de tipo 'multiple_choice' con exactamente 4 opciones.
    8.  El lenguaje debe ser claro, educativo y en español.
    9.  Las opciones de respuesta deben estar bien pensadas (incluye distractores comunes).
    10. ⚠️ **UNICIDAD ABSOLUTA Y OBLIGATORIA DE LAS 4 OPCIONES (PROHIBIDO DUPLICAR O REPETIR)**:
        - Las 4 opciones ("options") de CADA pregunta DEBEN SER ESTRICTAMENTE DIFERENTES Y MUTUAMENTE EXCLUYENTES entre sí, tanto en valor numérico o algebraico como en redacción textual.
        - **CERO TOLERANCIA A REPETICIONES**: Queda TERMINANTEMENTE PROHIBIDO que un distractor ("isCorrect: false") sea idéntico, equivalente o tenga el mismo texto o resultado que la respuesta correcta ("isCorrect: true").
        - Queda TERMINANTEMENTE PROHIBIDO que existan dos distractores idénticos entre sí.
        - Ejemplo de error grave a evitar: si la respuesta correcta es ¡4¡, NINGÚN distractor puede ser ¡4¡ ni ¡\\frac{8}{2}¡ ni ¡2+2¡. Si la respuesta es ¡2x + 1¡, ningún distractor puede ser ¡2x + 1¡ ni ¡1 + 2x¡.
        - Antes de emitir el JSON, revisa minuciosamente cada una de las 4 opciones para asegurar que las cuatro sean 100% distintas.
        - Cada pregunta debe contener EXACTAMENTE UNA opción con "isCorrect": true y EXACTAMENTE TRES opciones con "isCorrect": false.
    11. Incluye una breve explicación pedagógica de la respuesta correcta (máximo 2 líneas).
    12. Prioriza ejercicios técnicos directos. Evita enunciados extensos, historias o contextos innecesarios.
    13. **IMPORTANTE**: No uses nunca los signos de exclamación '¡' ni '!' para puntuación de texto. Úsalos ÚNICAMENTE para delimitar fórmulas matemáticas en LaTeX (ejemplo: ¡ x^2 ¡).
    14. **LATEX CRÍTICO**: Al generar código LaTeX dentro del JSON, DEBES escapar las barras invertidas con doble barra (ejemplo: \\frac, \\sqrt, \\mathbb, \\cdot, \\leq, \\geq, \\neq, \\approx, \\boxed). NUNCA escribas funciones matemáticas sin su barra invertida (incorrecto: sqrt, frac, boxed; correcto: \\sqrt, \\frac, \\boxed).

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
    const parsed = cleanAiJson(aiData.choices[0].message.content);
    return sanitizeAndDeduplicateQuiz(parsed);
  } catch (e) {
    console.error("JSON Parsing Error from AI:", aiData.choices[0].message.content);
    throw new Error("La IA generó un formato inválido. Por favor intenta de nuevo.");
  }
}

function normalizeOpt(text: string): string {
  return String(text || '')
    .trim()
    .replace(/^¡\s*/, '¡')
    .replace(/\s*¡$/, '¡')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function sanitizeAndDeduplicateQuiz(data: any): any {
  if (!data || !Array.isArray(data.questions)) return data;

  for (const q of data.questions) {
    if (!Array.isArray(q.options) || q.options.length === 0) continue;

    // 1. Ensure exactly one correct answer
    const correctIndices: number[] = [];
    q.options.forEach((opt: any, idx: number) => {
      if (opt && opt.isCorrect === true) {
        correctIndices.push(idx);
      }
    });

    if (correctIndices.length === 0) {
      if (q.options[0]) q.options[0].isCorrect = true;
    } else if (correctIndices.length > 1) {
      for (let i = 1; i < correctIndices.length; i++) {
        const dupCorrectIdx = correctIndices[i];
        if (q.options[dupCorrectIdx]) {
          q.options[dupCorrectIdx].isCorrect = false;
        }
      }
    }

    // 2. Identify correct option content
    const correctOpt = q.options.find((o: any) => o && o.isCorrect === true);
    const correctNorm = correctOpt ? normalizeOpt(correctOpt.content) : '';

    // 3. Deduplicate options
    const seenContents = new Set<string>();
    if (correctNorm) {
      seenContents.add(correctNorm);
    }

    q.options.forEach((opt: any) => {
      if (!opt) return;
      if (opt.isCorrect === true) return; // Keep correct as anchor

      const optContent = String(opt.content || '').trim();
      const norm = normalizeOpt(optContent);

      // If duplicate of correct answer or duplicate of previous distractor
      if (seenContents.has(norm) || (norm === correctNorm && correctNorm !== '')) {
        console.warn(`⚠️ [AI DEDUPLICATOR] Duplicate option detected: "${optContent}". Fixing distractor...`);
        const fixedContent = alterMathContent(optContent, seenContents);
        opt.content = fixedContent;
        seenContents.add(normalizeOpt(fixedContent));
      } else {
        seenContents.add(norm);
      }
    });

    // 4. Ensure we have exactly 4 options
    if (q.options.length < 4) {
      let counter = 1;
      while (q.options.length < 4) {
        const filler = `¡${counter * 3}¡`;
        if (!seenContents.has(normalizeOpt(filler))) {
          q.options.push({ content: filler, isCorrect: false });
          seenContents.add(normalizeOpt(filler));
        }
        counter++;
      }
    } else if (q.options.length > 4) {
      const correct = q.options.filter((o: any) => o.isCorrect);
      const distractors = q.options.filter((o: any) => !o.isCorrect).slice(0, 3);
      q.options = [...correct, ...distractors];
    }
  }

  return data;
}

function alterMathContent(content: string, seen: Set<string>): string {
  // If content contains a number, offset it
  const numMatch = content.match(/(-?\d+)/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 7, -7, 10, -10];
    for (const off of offsets) {
      const candidateVal = num + off;
      const candidate = content.replace(numMatch[1], String(candidateVal));
      if (!seen.has(normalizeOpt(candidate))) {
        return candidate;
      }
    }
  }

  // If algebraic or text, add alternative modifiers
  const modifiers = [
    (c: string) => c.includes('+') ? c.replace(/\+/, '-') : (c.includes('-') ? c.replace(/-/, '+') : `-${c}`),
    (c: string) => c.includes('¡') ? c.replace(/¡(.*?)¡/, '¡2($1)¡') : `2(${c})`,
    (c: string) => c.includes('¡') ? c.replace(/¡(.*?)¡/, '¡$1 + 1¡') : `${c} + 1`,
    (c: string) => c.includes('¡') ? c.replace(/¡(.*?)¡/, '¡$1 - 1¡') : `${c} - 1`,
    (c: string) => `¡${c.replace(/¡/g, '')} + 2¡`
  ];

  for (const mod of modifiers) {
    const candidate = mod(content);
    if (!seen.has(normalizeOpt(candidate))) {
      return candidate;
    }
  }

  // Safe distinct fallback
  let salt = 1;
  while (salt < 100) {
    const fallback = `¡${Math.floor(Math.random() * 80) + 10 + salt}¡`;
    if (!seen.has(normalizeOpt(fallback))) {
      return fallback;
    }
    salt++;
  }
  return `¡${Date.now() % 100}¡`;
}
