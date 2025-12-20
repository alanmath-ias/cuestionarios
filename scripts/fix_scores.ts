import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".envproduction" : ".env";
console.log(`Loading environment from ${envFile}...`);
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import('../server/db');
    const { studentProgress, quizSubmissions, studentAnswers, questions } = await import('../shared/schema');
    const { eq, sql } = await import('drizzle-orm');

    console.log('Starting score fix migration...');

    try {
        // 1. Alter table columns to allow decimals
        console.log('Altering table columns...');
        await db.execute(sql`ALTER TABLE student_progress ALTER COLUMN score TYPE numeric(4,1)`);
        await db.execute(sql`ALTER TABLE quiz_submissions ALTER COLUMN score TYPE numeric(4,1)`);
        console.log('Columns altered successfully.');

        // 2. Fetch all progress
        console.log('Fetching progress records...');
        const progresses = await db.select().from(studentProgress);

        for (const progress of progresses) {
            if (progress.status !== 'completed') continue;

            // Fetch answers
            const answers = await db.select().from(studentAnswers).where(eq(studentAnswers.progressId, progress.id));

            // Calculate unweighted score (to match quiz-results.tsx logic: correct / total_answers)
            // Note: quiz-results.tsx uses results.answers.length as denominator
            const totalQuestionsCount = answers.length;
            const correctAnswersCount = answers.filter(a => a.isCorrect).length;

            if (totalQuestionsCount === 0) {
                console.warn(`Total answers is 0 for progress ${progress.id}, skipping...`);
                continue;
            }

            // Calculate precise score (unweighted)
            let preciseScore = Number(((correctAnswersCount / totalQuestionsCount) * 10).toFixed(1));

            // Clamp score to max 10 (in case of data anomalies like duplicate correct answers)
            if (preciseScore > 10) {
                console.warn(`Score > 10 detected for progress ${progress.id} (${preciseScore}), clamping to 10.`);
                preciseScore = 10;
            }

            console.log(`Progress ${progress.id}: Correct ${correctAnswersCount}/${totalQuestionsCount} -> Score ${preciseScore}`);

            // Update progress
            await db.update(studentProgress)
                .set({ score: preciseScore })
                .where(eq(studentProgress.id, progress.id));

            // Update submission if exists
            await db.update(quizSubmissions)
                .set({ score: preciseScore })
                .where(eq(quizSubmissions.progressId, progress.id));
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
