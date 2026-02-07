import "dotenv/config";
import postgres from "postgres";

async function main() {
    const sql = postgres(process.env.DATABASE_URL!);
    const res = await sql`SELECT id, name FROM categories WHERE name ILIKE '%Integral%'`;
    console.log(res);
    await sql.end();
}

main().catch(console.error);
