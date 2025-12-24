
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.envproduction' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL not found in environment variables");
}

if (!connectionString) {
    console.error('DATABASE_URL not found in .envproduction');
    process.exit(1);
}

console.log('Testing connection to:', connectionString.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

const sql = postgres(connectionString);

async function testConnection() {
    try {
        const result = await sql`SELECT 1 as connected`;
        console.log('Connection successful!', result);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await sql.end();
    }
}

testConnection();
