import { client } from "./db.js";

/**
 * Sincroniza automáticamente las secuencias de PostgreSQL con el valor MAX(id)
 * de las tablas que pueden recibir inserciones con IDs explícitos (migraciones, cargas masivas, etc.).
 * Se ejecuta una sola vez al arrancar el servidor en milisegundos.
 */
export async function syncDatabaseSequences(): Promise<void> {
  const targetTables = [
    { table: "node_content_mappings", sequence: "node_content_mappings_id_seq", column: "id" },
    { table: "quizzes", sequence: "quizzes_id_seq", column: "id" },
    { table: "questions", sequence: "questions_id_seq", column: "id" },
    { table: "answers", sequence: "answers_id_seq", column: "id" },
    { table: "subcategories", sequence: "subcategories_id_seq", column: "id" },
    { table: "categories", sequence: "categories_id_seq", column: "id" },
  ];

  for (const item of targetTables) {
    try {
      const maxRes = await client.unsafe(`SELECT COALESCE(MAX(${item.column}), 0) as max_val FROM "${item.table}"`);
      const seqRes = await client.unsafe(`SELECT last_value FROM "${item.sequence}"`);
      const maxVal = Number(maxRes[0]?.max_val ?? 0);
      const lastVal = Number(seqRes[0]?.last_value ?? 0);

      if (maxVal > lastVal) {
        await client.unsafe(`SELECT setval('${item.sequence}', ${maxVal}, true)`);
        console.log(`⚡ [DB-SEQ] Secuencia '${item.sequence}' sincronizada: ${lastVal} -> ${maxVal}`);
      }
    } catch {
      // Ignorar si la tabla o secuencia no existe
    }
  }
}
