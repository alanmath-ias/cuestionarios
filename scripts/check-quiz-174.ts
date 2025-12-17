import { config } from 'dotenv';
import path from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { questions } from '../shared/schema';
import { eq } from 'drizzle-orm';

config({ path: path.resolve(process.cwd(), '.envproduction') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL not found in .envproduction');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    const res = await db.select().from(questions).where(eq(questions.quizId, 174));
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
}

main().catch(console.error);
