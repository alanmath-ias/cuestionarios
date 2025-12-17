
import { config } from 'dotenv';
import path from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { questions, answers } from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';

config({ path: path.resolve(process.cwd(), '.envproduction') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL not found in .envproduction');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    console.log('Fetching questions for quiz 174...');
    const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, 174));
    console.log(`Found ${quizQuestions.length} questions.`);

    const questionIds = quizQuestions.map(q => q.id);

    // Fix Questions
    for (const q of quizQuestions) {
        if (q.content.includes('\\\\')) {
            const newContent = q.content.replace(/\\\\/g, '\\');
            console.log(`Fixing question ${q.id}...`);
            await db.update(questions)
                .set({ content: newContent })
                .where(eq(questions.id, q.id));
        }
    }

    // Fix Answers
    if (questionIds.length > 0) {
        console.log('Fetching answers...');
        const quizAnswers = await db.select().from(answers).where(inArray(answers.questionId, questionIds));
        console.log(`Found ${quizAnswers.length} answers.`);

        for (const a of quizAnswers) {
            if (a.content.includes('\\\\')) {
                const newContent = a.content.replace(/\\\\/g, '\\');
                console.log(`Fixing answer ${a.id}...`);
                await db.update(answers)
                    .set({ content: newContent })
                    .where(eq(answers.id, a.id));
            }
        }
    }

    console.log('Done!');
    process.exit(0);
}

main().catch(console.error);
