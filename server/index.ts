import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import memorystore from "memorystore";
import { initializeTestData } from "./init-data";
import PgSession from "connect-pg-simple";
import postgres from "postgres";

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware setup usando PostgreSQL
const PgStore = PgSession(session);
app.use(session({
  secret: "alanmath-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 86400000 // 1 day
  },
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true
  })
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
    // Inicializar datos de prueba en la base de datos
    await initializeTestData();
  } catch (error) {
    console.error("Error al inicializar datos:", error);
  }

  registerRoutes(app);  // Registro de rutas

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Configuración de Vite en desarrollo
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  // Configuración del puerto para Railway/Render
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080; // 8080 para Railway, 5000 para desarrollo local

  if (isNaN(port)) {
    console.error('Invalid PORT environment variable');
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on ${process.env.NODE_ENV === 'production' ? 'Railway' : 'localhost'}:${port}`);
  });
})();