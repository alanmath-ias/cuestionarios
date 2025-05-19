import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { initializeTestData } from "./init-data.js";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path'; // Importa path para manejar rutas
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is working' });
});

// Endpoint temporal para probar la conexión a la base de datos
app.get('/api/test-db', async (_req, res) => {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Si estás usando SSL
   });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ status: 'error', message: error.message });
    } else {
      res.status(500).json({ status: 'error', message: 'Unknown error occurred' });
    }
  }
});

// Session middleware usando PostgreSQL
const PgStore = PgSession(session);
app.use(session({
  secret: process.env.SESSION_SECRET || "alanmath-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 86400000, // 1 día
  },
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ssl: { rejectUnauthorized: false }, // Si estás usando SSL
  } as any),
}));
console.log("Intentando conectar a la base de datos:", process.env.DATABASE_URL);

//endpoint temporal para verificar variables env de railway
app.get('/api/env', (_req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    VITE_API_URL: process.env.VITE_API_URL,
  });
});

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await initializeTestData();
  } catch (error) {
    console.error("Error al inicializar datos:", error);
  }

  registerRoutes(app);

  // Middleware para servir archivos estáticos en producción
  if (app.get("env") === "development") {
    const server = createServer(app);
    await setupVite(app, server);
    server.listen(5000, 'localhost', () => {
      log(`serving on http://localhost:5000`);
    });
  } else {
    const clientPath = path.resolve(__dirname, "../client");
    app.use(express.static(clientPath)); // Sirve archivos estáticos desde dist/client

    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(clientPath, "index.html")); // Devuelve index.html para rutas no manejadas
    });

    app.listen(5000, () => {
      log(`Production server running on http://localhost:5000`);
    });
  }
})();