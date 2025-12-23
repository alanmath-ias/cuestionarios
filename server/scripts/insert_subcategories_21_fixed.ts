import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Load .env manually
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
}

async function main() {
    try {
        const { db } = await import("../db.js");
        const { subcategories } = await import("../../shared/schema.js");
        const { sql } = await import("drizzle-orm");

        // Get current max ID
        const result = await db.execute(sql`SELECT MAX(id) as max_id FROM subcategories`);
        const maxId = Number(result[0].max_id) || 0;
        let nextId = Math.max(maxId + 1, 249);

        console.log(`Current max ID: ${maxId}. Starting insertion at ID: ${nextId}`);

        const subsToInsert = [
            { name: 'Aritmética Nivelación', desc: 'Operaciones básicas y números.' },
            { name: 'Álgebra Nivelación', desc: 'Expresiones algebraicas y ecuaciones.' },
            { name: 'Trigonometría Nivelación', desc: 'Relaciones entre ángulos y lados.' },
            { name: 'Cálculo Diferencial Nivelación', desc: 'Límites y derivadas.' },
            { name: 'Cálculo Integral Nivelación', desc: 'Integrales y sus aplicaciones.' },
            { name: 'Ecuaciones Diferenciales Nivelación', desc: 'Ecuaciones con derivadas.' },
            { name: 'Física Mecánica Nivelación', desc: 'Movimiento y fuerzas.' },
            { name: 'Geometría Analítica Nivelación', desc: 'Geometría con coordenadas.' },
            { name: 'Álgebra Lineal Nivelación', desc: 'Vectores y matrices.' },
            { name: 'Series de Fourier Nivelación', desc: 'Análisis de series periódicas.' },
            { name: 'Geometría Nivelación', desc: 'Figuras y espacio.' },
            { name: 'Estadística Nivelación', desc: 'Análisis de datos y probabilidad.' }
        ];

        for (const sub of subsToInsert) {
            await db.insert(subcategories).values({
                id: nextId,
                name: sub.name,
                categoryId: 21,
                description: sub.desc
            }).onConflictDoNothing();
            console.log(`Inserted ${sub.name} with ID ${nextId}`);
            nextId++;
        }

        console.log("Subcategories inserted successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting subcategories:", error);
        process.exit(1);
    }
}

main();
