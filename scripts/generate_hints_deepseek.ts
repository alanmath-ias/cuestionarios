

import { questions, answers } from "../shared/schema";
import { eq, like } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Load .envproduction explicitly (for BOTH DB and API key)
const envPath = path.resolve(process.cwd(), ".envproduction");
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .envproduction:", result.error);
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .envproduction!");
    process.exit(1);
}

// Initialize DB locally using .envproduction credentials
const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/chat/completions";

if (!DEEPSEEK_API_KEY) {
    console.error("Error: DEEPSEEK_API_KEY environment variable is not set.");
    process.exit(1);
}

async function generateHint(questionContent: string, answers: any) {
    const prompt = `
    You are a helpful tutor for a math/science quiz.
    Given the following question and its answers, provide two hints in Spanish:
    1. "hint1": A subtle hint that guides the student without giving away the answer.
    2. "explanation": A more detailed explanation or a strong hint that clarifies the concept.

    Question: "${questionContent}"
    Answers: ${JSON.stringify(answers)}

    Return ONLY a JSON object with keys "hint1" and "explanation". Do not include markdown formatting.
  `;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful assistant that outputs JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Clean up markdown code blocks if present
        const jsonString = content.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating hint:", error);
        return null;
    }
}

async function main() {
    console.log("Fetching questions with generic hints...");

    // Fetch questions with the placeholder text
    const questionsToUpdate = await db.select().from(questions).where(like(questions.hint1, "%Lee atentamente el enunciado%"));

    console.log(`Found ${questionsToUpdate.length} questions to update.`);

    for (const q of questionsToUpdate) {
        console.log(`Processing Question ID ${q.id}...`);

        // Fetch answers for this question
        const questionAnswers = await db.select().from(answers).where(eq(answers.questionId, q.id));

        const hints = await generateHint(q.content, questionAnswers);

        if (hints && hints.hint1 && hints.explanation) {
            console.log(`  Generated Hint 1: ${hints.hint1.substring(0, 50)}...`);
            console.log(`  Generated Explanation: ${hints.explanation.substring(0, 50)}...`);

            await db.update(questions)
                .set({
                    hint1: hints.hint1,
                    explanation: hints.explanation,
                    hint2: null // Clear hint2 if we are using explanation as the "super hint"
                })
                .where(eq(questions.id, q.id));

            console.log("  Updated in DB.");
        } else {
            console.log("  Failed to generate hints.");
        }

        // Add a small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
