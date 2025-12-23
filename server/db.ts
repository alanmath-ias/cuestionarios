import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js"; // Usar el esquema compartido

// Connection string se toma de variables de entorno
const connectionString = "postgres://postgres:CuestionariosAlan67@178.156.147.25:5432/postgres";

// Cliente de postgres
const client = postgres(connectionString, { max: 1 });

// Cliente de Drizzle
export const db = drizzle(client, { schema });

export type DbClient = typeof db;//anadido por deepseek para adminquizresults