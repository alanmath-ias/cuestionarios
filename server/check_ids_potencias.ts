import "./env-config.js";
import { db } from "./db.js";
import { quizzes, questions, answers } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function checkIds() {
    const maxQuizId = await db.execute(sql`SELECT MAX(id) FROM quizzes`);
    const maxQuestionId = await db.execute(sql`SELECT MAX(id) FROM questions`);
    const maxAnswerId = await db.execute(sql`SELECT MAX(id) FROM answers`);

    console.log("Max Quiz ID:", maxQuizId[0].max);
    console.log("Max Question ID:", maxQuestionId[0].max);
    console.log("Max Answer ID:", maxAnswerId[0].max);

    process.exit(0);
}

checkIds().catch(err => {
    console.error(err);
    process.exit(1);
});
