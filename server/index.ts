import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { initializeTestData } from "./init-data.js";
import { createServer } from "http";

import dotenv from 'dotenv';
import path from 'path'; // Importa path para manejar rutas
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is working' });
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
  }),
}));

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
    const clientPath = path.resolve(__dirname, "../dist/client");
    app.use(express.static(clientPath)); // Sirve archivos estáticos desde dist/client

    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(clientPath, "index.html")); // Devuelve index.html para rutas no manejadas
    });

    app.listen(5000, () => {
      log(`Production server running on http://localhost:5000`);
    });
  }
})();