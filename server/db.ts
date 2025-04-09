import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Connection string se toma de variables de entorno
const connectionString = process.env.DATABASE_URL || "";

// Cliente de postgres
const client = postgres(connectionString, { max: 1 });

// Cliente de Drizzle
export const db = drizzle(client, { schema });