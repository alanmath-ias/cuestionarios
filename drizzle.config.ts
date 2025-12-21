import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "production" ? ".envproduction" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Verifica si la variable de entorno DATABASE_URL está disponible
//console.log(process.env.DATABASE_URL);  // Esta línea imprimirá la URL en la consola

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
