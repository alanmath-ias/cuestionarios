
import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgres://postgres:LbG7KjvVYb2WcCERh9lTWq4dSx1HKjKJZkiyehLcJ8Iu3MaRjLVEnzlCAzs5QFMq@178.156.147.25:5432/postgres";

const pool = new Pool({
    connectionString,
});

async function checkSchema() {
    try {
        const res = await pool.query(`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_progress';
    `);

        console.log("Columns in student_progress:");
        res.rows.forEach(row => {
            console.log(`[${row.table_schema}] ${row.column_name} (${row.data_type})`);
        });

        console.log("\nChecking for questions with NULL content...");
        const nullContentRes = await pool.query('SELECT id, quiz_id FROM questions WHERE content IS NULL');
        if (nullContentRes.rows.length > 0) {
            console.log("Found questions with NULL content:", nullContentRes.rows);
        } else {
            console.log("No questions with NULL content found.");
        }

        console.log("\nChecking for questions with EMPTY content...");
        const emptyContentRes = await pool.query("SELECT id, quiz_id FROM questions WHERE content = ''");
        if (emptyContentRes.rows.length > 0) {
            console.log("Found questions with EMPTY content:", emptyContentRes.rows);
        } else {
            console.log("No questions with EMPTY content found.");
        }

        pool.end();
    } catch (err) {
        console.error("Error querying schema:", err);
        pool.end();
    }
}

checkSchema();
