import { db } from "./server/db.js";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🚀 Iniciando migración manual de la base de datos...");

  try {
    // Agregar columna 'can_create_ai_quizzes' a la tabla 'users'
    console.log("Adding 'can_create_ai_quizzes' to 'users'...");
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS can_create_ai_quizzes BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    // Agregar columna 'is_ai_generated' a la tabla 'quizzes'
    console.log("Adding 'is_ai_generated' to 'quizzes'...");
    await db.execute(sql`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
    `);

    // Agregar columna 'created_by_user_id' a la tabla 'quizzes'
    console.log("Adding 'created_by_user_id' to 'quizzes'...");
    await db.execute(sql`
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
    `);

    console.log("✅ Migración completada con éxito.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

migrate();
