import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === "production" ? ".envproduction" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
console.log(`[env-config] Loaded environment from ${envFile}`);
