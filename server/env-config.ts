import dotenv from 'dotenv';
import path from 'path';

// Ensure entire Node runtime evaluates dates in Colombia (UTC-5)
process.env.TZ = 'America/Bogota';

const envFile = process.env.NODE_ENV === "production" ? ".envproduction" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
console.log(`[env-config] Loaded environment from ${envFile} (Timezone: ${process.env.TZ})`);
