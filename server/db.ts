import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js"; // Agregado .js a la importación de schema

// Connection string se toma de variables de entorno
const connectionString = process.env.DATABASE_URL || "";

// Cliente de postgres
const client = postgres(connectionString, { max: 1 });

// Cliente de Drizzle
export const db = drizzle(client, { schema });

export type DbClient = typeof db;//anadido por deepseek para adminquizresults