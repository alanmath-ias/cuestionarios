import express, { type Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";  // Asegúrate de que si lo usas, la ruta tenga la extensión .js
import { z } from "zod";
import {
  insertUserSchema,
  insertStudentProgressSchema,
  insertStudentAnswerSchema
} from "../shared/schema.js";
import * as expressSession from "express-session";
import { eq, sql, and, or, isNull, isNotNull } from "drizzle-orm";

import { db } from "./db.js";
import { userCategories, categories, quizzes } from "../shared/schema.js";
import { users } from "../shared/schema.js";
import { getUsersAssignedToQuiz } from './storage.js'; // Ruta ajustada para usar .js
//chat gpt entrenamiento
import { questions as questionsTable } from "../shared/schema.js";
import { inArray } from "drizzle-orm";
//deep seek entrenamiento:

import { answers } from "../shared/schema.js"; // Asegúrate de importar correctamente

//chat gpt dashboar personalizado
import { requireAuth } from "./middleware/requireAuth.js";
//fin chat gpt dashboar personalizado

//chat gpt cuestionarios a usuarios
import { DatabaseStorage } from './database-storage.js'; // Ruta ajustada para usar .js
import { createSubscriptionPreference, getPayment } from './mercadopago.js';

//fin chat gpt cuestionarios a usuarios

//chat gpt dashboar personalizado
import { User, studentAnswers } from "../shared/schema.js"; // Asegúrate de que este tipo esté bien definido
import { userQuizzes, studentProgress, quizSubmissions, parents } from "../shared/schema.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
//import bcrypt from 'bcrypt';




declare global {
  namespace Express {
    interface Request {
      user?: User;
      role?: string;
    }
  }
}

// Extend the SessionData interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
    originalAdminId?: number;
  }
}

// Create a custom Request type that includes session
type Request = ExpressRequest & {
  session: expressSession.Session & Partial<expressSession.SessionData>
};

type Answer = {
  id: number;
  content: string;
  questionId: number;
  // otras propiedades...
};

type ProgressWithQuiz = typeof studentProgress.$inferSelect & {
  quiz: {
    id: number;
    title: string;
  };
};




const publicQuizIds = [278, 279, 280, 281, 282, 283, 285, 286];

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Middleware para verificar si el usuario es administrador
  const requireAdmin = async (req: Request, res: Response, next: () => void) => {
    const userId = req.session.userId;

    if (!userId) {
      console.warn("⚠️ Usuario no autenticado");
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await storage.getUser(userId);

      if (!user || user.role !== 'admin') {
        console.warn("⛔ No tiene rol de administrador");
        return res.status(403).json({ message: "Admin access required" });
      }

      next();
    } catch (error) {
      console.error("❌ Admin check error:", error);
      res.status(500).json({ message: "Error checking admin permissions" });
    }
  };

  // Authentication endpoints
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Authenticate user
      req.session.userId = user.id;

      //const validRoles = ["admin", "user", "student"] as const;
      const validRoles = ["admin", "user", "student", "parent"] as const;

      if (validRoles.includes(user.role as any)) {
        req.session.role = user.role as typeof validRoles[number];
      } else {
        req.session.role = "student"; // o un valor por defecto
      }

      // Send user info without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });


  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const userCount = (await storage.getUsers()).length;
      const isFirstUser = userCount === 0;

      const assignedRole = isFirstUser ? "admin" : (userData.role || "student");

      const validRoles = ["admin", "user", "student"] as const;
      const safeRole = validRoles.includes(assignedRole as any)
        ? assignedRole as typeof validRoles[number]
        : "student";

      const userWithRole = {
        ...userData,
        role: safeRole,
      };

      const newUser = await storage.createUser(userWithRole);

      // Auto login con validación de rol
      req.session.userId = newUser.id;
      req.session.role = safeRole;

      const { password: _, ...userWithoutPassword } = newUser;

      // Enviar correo de bienvenida
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && newUser.email) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: parseInt(process.env.SMTP_PORT || "587") === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const bannerUrl = "https://imagenes.alanmath.com/nueva-actividad.jpg";

          await transporter.sendMail({
            from: `"AlanMath" <${process.env.SMTP_USER}>`,
            to: newUser.email,
            subject: "¡Bienvenido a la familia AlanMath! 🚀",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="${bannerUrl}" alt="Bienvenido a AlanMath" style="max-width: 250px; height: auto; border-radius: 8px;">
                </div>
                
                <h1 style="color: #4F46E5; text-align: center;">¡Hola ${newUser.name || newUser.username}!</h1>
                
                <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                  Estamos muy felices de que te hayas unido a <strong>AlanMath</strong>. 
                  Aquí encontrarás un espacio diseñado para potenciar tu aprendizaje de una manera divertida y efectiva.
                </p>

                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #111827; margin-top: 0;">¿Qué puedes hacer aquí?</h3>
                  <ul style="color: #4B5563; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">🧠 <strong>Ejercicios Adaptativos:</strong> Practica a tu propio ritmo.</li>
                    <li style="margin-bottom: 10px;">📊 <strong>Sigue tu Progreso:</strong> Mira cómo mejoras día a día.</li>
                    <li style="margin-bottom: 10px;">🏆 <strong>Supera Retos:</strong> Gana confianza en cada tema.</li>
                  </ul>
                </div>

                <p style="text-align: center; font-weight: bold; color: #4F46E5; font-size: 18px;">
                  ¡Tu camino hacia el dominio de las matemáticas comienza hoy!
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://app.alanmath.com/" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Ir a la App</a>
                  <a href="https://alanmath.com/" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visitar Sitio Web</a>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #6B7280; text-align: center;">
                  Este es un mensaje automático de bienvenida. ¡Nos vemos en clase!
                </p>
              </div>
            `,
          });
          console.log(`📧 Welcome email sent to ${newUser.email}`);
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // No fallamos el registro si el correo falla
        }
      }

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
    }
  });

  // Password Recovery
  apiRouter.post("/auth/forgot-password", async (req: Request, res: Response) => {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: "Email and Username are required" });
    }

    try {
      // Find user by username
      const usersList = await storage.getAllUsers();
      const user = usersList.find(u => u.username === username);

      // Verify user exists AND email matches
      if (!user || user.email !== email) {
        // Return generic error to prevent enumeration, or specific if desired (user asked for specific check but security best practice is generic)
        // User explicitly asked: "debería en dicha recuperación intorducirse el correo real que se registro al inicio y que coincida con dicho nombre de usuario y ahí si dejar enviar el correo, en otro caso avisar en el formulario de recuperación que ese no es el correo de dicho usuario"
        // So we will return a specific error if they don't match, as requested, although it leaks some info.
        return res.status(400).json({ message: "The provided email does not match the registered email for this username." });
      }

      // Generate token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
      });

      // Send email (Mock for now)
      const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;

      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: parseInt(process.env.SMTP_PORT || "587") === 465, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"AlanMath" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Restablecer Contraseña - AlanMath",
          html: `
            <h1>Restablecer Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña en AlanMath.</p>
            <p>Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Si no solicitaste esto, puedes ignorar este correo.</p>
            <p>El enlace expirará en 1 hora.</p>
          `,
        });
        console.log(`📧 Email sent to ${email}`);
      } else {
        console.log("---------------------------------------------------");
        console.log("🔑 PASSWORD RESET LINK (MOCK EMAIL SERVICE - MISSING CREDENTIALS)");
        console.log(`To: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log("---------------------------------------------------");
      }

      res.json({ message: "If an account exists with this email, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Error processing request" });
    }
  });

  apiRouter.post("/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    try {
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      if (new Date(resetToken.expiresAt) < new Date()) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ message: "Token expired" });
      }

      // Update password
      // Note: Storing as plain text to match existing system behavior. 
      // TODO: Upgrade entire system to use hashed passwords.
      await storage.updateUser(resetToken.userId, { password: newPassword });
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  });

  apiRouter.get("/auth/me", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password but WITH role and tourStatus
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        role: user.role,
        hintCredits: user.hintCredits,
        tourStatus: user.tourStatus || {},
        isImpersonating: !!req.session.originalAdminId
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });

    }
  });

  // Add /me endpoint as alias for /auth/me (since dashboard uses it)
  apiRouter.get("/me", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        role: user.role,
        hintCredits: user.hintCredits,
        tourStatus: user.tourStatus || {},
        isImpersonating: !!req.session.originalAdminId
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });
    }
  });

  apiRouter.post("/user/tour-seen", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    const { tourType } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!tourType) {
      return res.status(400).json({ message: "Tour type is required" });
    }

    try {
      await storage.updateUserTourStatus(userId, tourType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating tour status:", error);
      res.status(500).json({ message: "Error updating tour status" });
    }
  });
  // Add the /user endpoint as well
  apiRouter.get("/user", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        tourStatus: user.tourStatus || {},
        isImpersonating: !!req.session.originalAdminId
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });
    }
  });

  // Math Tip Endpoint
  apiRouter.get("/user/math-tip", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
      // 1. Get recent completed quizzes (fetch more to allow random selection)
      const allProgress = await storage.getStudentProgress(userId);
      const completedProgress = allProgress
        .filter(p => p.status === "completed" && p.score !== null)
        .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
        .slice(0, 10); // Get last 10 to have variety



      if (completedProgress.length === 0) {
        return res.json({ tip: "¡Bienvenido! Completa tu primer cuestionario para recibir tips personalizados." });
      }

      // 2. Pick ONE random quiz to focus on
      const randomProgress = completedProgress[Math.floor(Math.random() * completedProgress.length)];
      const quiz = await storage.getQuiz(randomProgress.quizId);

      if (!quiz) return res.json({ tip: "Sigue practicando para mejorar tus habilidades matemáticas." });

      // 3. Get context for this specific quiz
      let context = `El estudiante completó el cuestionario "${quiz.title}".`;

      // Check for mistakes in this specific attempt
      const answers = await storage.getStudentAnswersByProgress(randomProgress.id);
      const wrongAnswers = answers.filter(a => a.isCorrect === false);

      if (wrongAnswers.length > 0) {
        const questionIds = wrongAnswers.slice(0, 2).map(m => m.questionId);
        const questions = await Promise.all(questionIds.map(id => storage.getQuestion(id)));

        context += " Tuvo errores en preguntas sobre: ";
        context += questions.map(q => q?.content.replace(/¡/g, '').substring(0, 50) + "...").join(" y ");
      } else {
        context += " Respondió todo correctamente.";
      }

      console.log(`[MathTip] Selected topic: ${quiz.title}`);

      // 4. Generate Tip with DeepSeek
      const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.json({ tip: "Recuerda revisar siempre los signos en tus operaciones." });
      }

      const prompt = `Actúa como un profesor experto de matemáticas. Genera un "Tip Matemático" valioso y pedagógico sobre el tema específico proporcionado.
Contexto: ${context}

Objetivo: Que el estudiante entienda realmente la idea clave o un proceso fundamental para resolver este tipo de problemas.
Requisitos:
1. Explicación Clara: Explica el "por qué" o el "cómo" de forma sencilla pero profunda. Evita enunciados vacíos.
2. Ejemplo Concreto: Incluye un ejemplo breve que ilustre perfectamente el concepto. No solo una ecuación, sino una pequeña demostración de la idea.
3. Conexión: Si hubo errores, explica cómo evitarlos específicamente.
4. Formato LaTeX: Usa signos de exclamación invertidos (¡...¡) para TODA la notación matemática. Ejemplo: ¡x^2 + 1¡.

Longitud: Máximo 40-50 palabras. Conciso pero útil.
Tono: Alentador, profesional y educativo.`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[MathTip] DeepSeek API error: ${response.status}`, errText);
        throw new Error("DeepSeek API error");
      }

      const data = await response.json();
      const tip = data.choices?.[0]?.message?.content?.trim() || "La práctica hace al maestro.";

      res.json({ tip });

    } catch (error) {
      console.error("[MathTip] Error generating math tip:", error);
      res.json({ tip: "¡Sigue esforzándote! Cada error es una oportunidad de aprender." });
    }
  });

  // AI Diagnosis Endpoint
  apiRouter.post("/generate-diagnosis", async (req: Request, res: Response) => {
    try {
      const { quizTitle, score, totalQuestions, wrongAnswers } = req.body;

      // Basic validation
      if (typeof score !== 'number' || !Array.isArray(wrongAnswers)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      // If no errors, return generic positive message
      if (wrongAnswers.length === 0) {
        return res.json({
          diagnosis: "¡Excelente trabajo! Demuestras un dominio sólido de los temas evaluados. Estás listo para avanzar a conceptos más complejos."
        });
      }

      const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.json({
          diagnosis: "Detectamos algunos errores. Te recomendamos revisar los temas donde fallaste y practicar más."
        });
      }

      // Construct prompt for DeepSeek
      const context = `
        Cuestionario: "${quizTitle}"
        Nota: ${score}/${totalQuestions}
        Preguntas falladas y sus temas/contenido:
        ${wrongAnswers.map((a: any) => `- ${a.question.replace(/¡/g, '')}`).join('\n')}
      `;

      const prompt = `
        Actúa como un profesor de matemáticas experto.
        Analiza los errores del estudiante en el cuestionario "${quizTitle}".
        
        Contexto:
        ${context}

        Tu tarea:
        1. Identifica los 2 o 3 temas PRINCIPALES donde falló.
        2. Para cada tema, da un consejo muy breve (máx 10 palabras).
        3. Devuelve SOLO un JSON válido con este formato (sin markdown):
        [
          { "topic": "Nombre del Tema", "status": "danger", "message": "Consejo breve" },
          { "topic": "Nombre del Tema 2", "status": "danger", "message": "Consejo breve" }
        ]
      `;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 300,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error("DeepSeek API error");
      }

      const data = await response.json();
      let diagnosisContent = data.choices?.[0]?.message?.content?.trim();

      // Clean up markdown code blocks if present
      if (diagnosisContent.startsWith('```json')) {
        diagnosisContent = diagnosisContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (diagnosisContent.startsWith('```')) {
        diagnosisContent = diagnosisContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      let diagnosis;
      try {
        diagnosis = JSON.parse(diagnosisContent);
        // Ensure it's an array (DeepSeek might wrap it in an object sometimes)
        if (!Array.isArray(diagnosis) && diagnosis.diagnosis) {
          diagnosis = diagnosis.diagnosis;
        }
      } catch (e) {
        console.error("Error parsing AI JSON:", e);
        // Fallback text if JSON fails
        diagnosis = "Revisa los temas marcados en rojo en el detalle de abajo.";
      }

      res.json({ diagnosis });

    } catch (error) {
      console.error("[Diagnosis] Error generating diagnosis:", error);
      res.json({
        diagnosis: "Detectamos algunos conceptos que necesitan refuerzo. Con práctica constante y explicaciones claras, subirás de nivel rápidamente."
      });
    }
  });

  // Get all users (Admin only)
  apiRouter.get("/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Return users without passwords
      const safeUsers = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Get specific user progress (Admin only)
  apiRouter.get("/users/:userId/progress", requireAdmin, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const progress = await storage.getStudentProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });

  // Delete user (Admin only)
  apiRouter.delete("/users/:userId", requireAdmin, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }

      // Elimina la cookie de sesión en el navegador
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Endpoint temporal para actualizar el rol del usuario
  apiRouter.post("/auth/make-admin", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Actualizar el rol del usuario
      await storage.updateUser(userId, { role: 'admin' });

      const updatedUser = await storage.getUser(userId);
      const { password: _, ...userWithoutPassword } = updatedUser!;

      res.json({
        message: "Usuario promovido a administrador",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error actualizando rol de usuario:", error);
      res.status(500).json({ message: "Error al actualizar el rol" });
    }
  });

  // Admin Send Email Endpoint
  apiRouter.post("/admin/send-email", requireAdmin, async (req: Request, res: Response) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "To, Subject, and Message are required" });
    }

    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error("SMTP credentials not configured");
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: parseInt(process.env.SMTP_PORT || "587") === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"AlanMath" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`, // Simple text to HTML conversion
      });

      console.log(`📧 Admin sent email to ${to}`);
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error sending email" });
    }
  });

  // Mercado Pago Routes
  apiRouter.post("/create-preference", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { planName, price } = req.body;

      if (!planName || !price) {
        return res.status(400).json({ message: "Plan name and price are required" });
      }

      const preference = await createSubscriptionPreference(user, planName, price);
      res.json({ id: preference.id });
    } catch (error) {
      console.error("Error creating preference:", error);
      res.status(500).json({ message: "Error creating preference" });
    }
  });

  apiRouter.post("/webhook/mercadopago", async (req: Request, res: Response) => {
    const { type, data } = req.body;
    const topic = req.query.topic || type;
    const id = req.query.id || data?.id;

    try {
      if (topic === 'payment' && id) {
        const payment = await getPayment(id as string);

        if (payment.status === 'approved') {
          const userId = Number(payment.external_reference);
          const plan = payment.metadata.plan || 'premium';

          // Calculate end date (1 month from now)
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          await storage.updateUserSubscription(userId, 'active', plan, endDate.toISOString());
          console.log(`User ${userId} subscription updated to active.`);
        }
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  });

  // Manual verification endpoint for local development
  apiRouter.post("/verify-payment", requireAuth, async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    try {
      const payment = await getPayment(paymentId);

      if (payment.status === 'approved') {
        const userId = Number(payment.external_reference);

        // Verify the user is verifying their own payment
        if (userId !== req.user!.id) {
          return res.status(403).json({ message: "Unauthorized verification" });
        }

        const plan = payment.metadata.plan || 'premium';

        // Calculate end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await storage.updateUserSubscription(userId, 'active', plan, endDate.toISOString());
        console.log(`[Manual Verify] User ${userId} subscription updated to active.`);

        res.json({ success: true, status: 'approved' });
      } else {
        res.json({ success: false, status: payment.status });
      }
    } catch (error) {
      console.error("Manual verification error:", error);
      res.status(500).json({ message: "Error verifying payment" });
    }
  });
  //Obtener el nombre del usuario
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const userId = req.user.id;

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        hintCredits: user.hintCredits,
      });
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });


  // Categories endpoints
  apiRouter.get("/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Categories fetch error:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  //Subcategories endpoints
  // Obtener todas las subcategorías
  app.get('/api/admin/subcategories', async (req, res) => {
    try {
      const subcategories = await storage.getAllSubcategories();
      //console.log("✅ Subcategorías obtenidas:", subcategories);
      res.json(subcategories);
    } catch (err) {
      console.error("❌ Error al obtener los Temas:", err);
      res.status(500).json({ error: "Error al obtener los Temas" });
    }
  });


  // Crear una nueva subcategoría
  app.post('/api/admin/subcategories', async (req, res) => {
    const { name, categoryId, description, youtube_sublink } = req.body;

    try {
      const subcategory = await storage.createSubcategory({ name, categoryId, description, youtube_sublink });
      res.json(subcategory);
    } catch (err) {
      console.error("❌ Error al crear subcategoría:", err);
      res.status(500).json({ error: "Error al crear el tema" });
    }
  });

  // Obtener subcategorías por categoría
  app.get('/api/admin/subcategories/by-category/:categoryId', async (req, res) => {
    const categoryId = Number(req.params.categoryId);
    //console.log("🔍 Buscando subcategorías de la categoría:", categoryId);

    try {
      const subcategories = await storage.getSubcategoriesByCategory(categoryId);
      //console.log(`✅ Subcategorías para categoría ${categoryId}:`, subcategories);
      res.json(subcategories);
    } catch (err) {
      console.error("❌ Error al obtener los Temas por Materia:", err);
      res.status(500).json({ error: "Error al obtener los Temas por Materia" });
    }
  });

  // Eliminar una subcategoría
  app.delete('/api/admin/subcategories/:id', async (req, res) => {
    const id = Number(req.params.id);
    //console.log("🗑️ Eliminando subcategoría con ID:", id);

    try {
      await storage.deleteSubcategory(id);
      //console.log("✅ Subcategoría eliminada");
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error al eliminar el tema:", err);
      res.status(500).json({ error: "Error al eliminar el tema" });
    }
  });

  app.put('/api/admin/subcategories/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name, description, youtube_sublink } = req.body;

    if (!name || isNaN(id)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    try {
      await storage.updateSubcategory(id, name, description, youtube_sublink);
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error al actualizar el tema:", err);
      res.status(500).json({ error: "Error al actualizar el tema" });
    }
  });

  //Entrenamiento por Subcategorías:
  app.get('/api/training-subcategory/:categoryId/:subcategoryId', async (req, res) => {
    const categoryId = Number(req.params.categoryId);
    const subcategoryId = Number(req.params.subcategoryId);


    if (isNaN(categoryId) || isNaN(subcategoryId)) {
      console.error('❌ IDs inválidos:', {
        categoryId,
        subcategoryId,
        rawParams: req.params
      });
      return res.status(400).json({
        error: "IDs inválidos",
        details: {
          received: req.params,
          converted: { categoryId, subcategoryId }
        }
      });
    }

    try {

      const questions = await storage.getTrainingQuestionsByCategoryAndSubcategory(categoryId, subcategoryId);

      res.json({
        questions,
        metadata: {
          categoryId,
          subcategoryId,
          questionCount: questions.length
        }
      });

    } catch (err) {
      if (err instanceof Error) {
        console.error('❌ Error al obtener preguntas:', {
          error: err.message,
          stack: err.stack,
          params: req.params,
          timestamp: new Date().toISOString()
        });

        res.status(500).json({
          error: "Error al obtener preguntas",
          details: {
            categoryId,
            subcategoryId,
            internalError: process.env.NODE_ENV === 'development' ? err.message : undefined
          }
        });
      } else {
        console.error('❌ Error desconocido al obtener preguntas:', {
          error: err,
          params: req.params,
          timestamp: new Date().toISOString()
        });

        res.status(500).json({
          error: "Error desconocido al obtener preguntas",
          details: {
            categoryId,
            subcategoryId,
            internalError: process.env.NODE_ENV === 'development' ? JSON.stringify(err) : undefined
          }
        });
      }
    } finally {

    }
  });


  // Quizzes endpoints
  apiRouter.get("/quizzes", async (_req: Request, res: Response) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Quizzes fetch error:", error);
      res.status(500).json({ message: "Error fetching quizzes" });
    }
  });

  // Ruta para obtener cuestionarios públicos
  apiRouter.get("/public/quizzes", async (_req: Request, res: Response) => {
    try {
      const quizzes = await storage.getPublicQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Public quizzes fetch error:", error);
      res.status(500).json({ message: "Error fetching public quizzes" });
    }
  });

  apiRouter.get("/categories/:categoryId/quizzes", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    try {
      const category = await storage.getCategory(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const userId = req.session.userId;
      const quizzes = await storage.getQuizzesByCategory(categoryId, userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Category quizzes fetch error:", error);
      res.status(500).json({ message: "Error fetching quizzes for category" });
    }
  });

  // Quiz details endpoint
  apiRouter.get("/quizzes/:quizId", async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json(quiz);
    } catch (error) {
      console.error("Quiz fetch error:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });

  apiRouter.get("/quizzes/:quizId/questions", async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    // Check authentication
    if (!req.session.userId && !publicQuizIds.includes(quizId)) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const quiz = await storage.getQuiz(quizId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const questions = await storage.getQuestionsByQuiz(quizId);
      const mode = req.query.mode as string;

      // If mini mode, shuffle and take 50%
      let selectedQuestions = questions;

      // Special handling for Placement Tests (Category 21) or Public Quizzes
      if (quiz.categoryId === 21 || publicQuizIds.includes(quizId)) {
        // Group by difficulty
        const diff1 = questions.filter(q => q.difficulty === 1);
        const diff2 = questions.filter(q => q.difficulty === 2);
        const diff3 = questions.filter(q => q.difficulty === 3);

        // Determine distribution based on total questions
        let count1 = 3, count2 = 4, count3 = 3; // Default for 10 questions

        if (quiz.totalQuestions === 12) {
          count1 = 4;
          count2 = 4;
          count3 = 4;
        } else if (quiz.totalQuestions === 15) {
          count1 = 5;
          count2 = 5;
          count3 = 5;
        } else if (quiz.totalQuestions === 20) {
          count1 = 6;
          count2 = 8;
          count3 = 6;
        }

        // Fisher-Yates shuffle function
        const shuffleArray = <T>(array: T[]): T[] => {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
        };

        // Select random subset from each difficulty using proper shuffle
        const selectedDiff1 = shuffleArray(diff1).slice(0, Math.min(count1, diff1.length));
        const selectedDiff2 = shuffleArray(diff2).slice(0, Math.min(count2, diff2.length));
        const selectedDiff3 = shuffleArray(diff3).slice(0, Math.min(count3, diff3.length));

        // Combine and sort by difficulty ascending
        selectedQuestions = [...selectedDiff1, ...selectedDiff2, ...selectedDiff3]
          .sort((a, b) => a.difficulty - b.difficulty);
      } else if (mode === 'mini') {
        const count = Math.ceil(questions.length * 0.5);
        selectedQuestions = questions
          .sort(() => 0.5 - Math.random())
          .slice(0, count);
      }

      // Generate actual questions with random values
      const randomizedQuestions = await Promise.all(selectedQuestions.map(async (question) => {
        // Clone question to avoid modifying original
        const { variables, ...questionData } = question;

        // Generate random values for variables
        const variableValues: Record<string, number> = {};
        let processedContent = questionData.content;

        if (variables) {
          for (const [varName, varRange] of Object.entries(variables)) {
            const min = varRange.min;
            const max = varRange.max;
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            variableValues[varName] = value;

            // Replace placeholders in content
            processedContent = processedContent.replace(
              new RegExp(`\\{${varName}\\}`, 'g'),
              value.toString()
            );
          }
        }

        // Get answers for this question
        const answers = await storage.getAnswersByQuestion(question.id);

        // Process answers with variables
        const processedAnswers = answers.map(answer => {
          let processedContent = answer.content;
          let processedExplanation = answer.explanation || '';

          if (variables && variableValues) {
            // Process correct answer's content (calculate actual answer)
            if (answer.isCorrect && answer.content.includes('{answer}')) {
              // For simple linear equations like ax + b = c
              if (question.type === 'equation') {
                let a = variableValues['a'] || 1;
                let b = variableValues['b'] || 0;
                let c = variableValues['c'] || 0;

                // Calculate x = (c - b) / a
                const actualAnswer = (c - b) / a;
                processedContent = processedContent.replace('{answer}', actualAnswer.toString());
              }
            }

            // Generate wrong answers that are close to correct
            if (!answer.isCorrect) {
              if (answer.content.includes('{wrongAnswer1}')) {
                const a = variableValues['a'] || 1;
                const b = variableValues['b'] || 0;
                const c = variableValues['c'] || 0;

                // Slightly off answer - add 1 or 2 to correct answer
                const correctAnswer = (c - b) / a;
                const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : 2);
                processedContent = processedContent.replace('{wrongAnswer1}', wrongAnswer.toString());
              }

              if (answer.content.includes('{wrongAnswer2}')) {
                const a = variableValues['a'] || 1;
                const b = variableValues['b'] || 0;
                const c = variableValues['c'] || 0;

                // Different wrong approach - subtract instead of add
                const wrongAnswer = (c + b) / a;
                processedContent = processedContent.replace('{wrongAnswer2}', wrongAnswer.toString());
              }

              if (answer.content.includes('{wrongAnswer3}')) {
                const a = variableValues['a'] || 1;
                const b = variableValues['b'] || 0;
                const c = variableValues['c'] || 0;

                // Another wrong approach - invert the operation
                const wrongAnswer = (b - c) / a;
                processedContent = processedContent.replace('{wrongAnswer3}', Math.abs(wrongAnswer).toString());
              }
            }

            // Replace any remaining variables in content and explanation
            for (const [varName, value] of Object.entries(variableValues)) {
              processedContent = processedContent.replace(
                new RegExp(`\\{${varName}\\}`, 'g'),
                value.toString()
              );

              processedExplanation = processedExplanation.replace(
                new RegExp(`\\{${varName}\\}`, 'g'),
                value.toString()
              );
            }
          }

          return {
            ...answer,
            content: processedContent,
            explanation: processedExplanation
          };
        });

        return {
          ...questionData,
          content: processedContent,
          answers: processedAnswers,
          variables: variableValues
        };
      }));

      res.json(randomizedQuestions);
    } catch (error) {
      console.error("Quiz questions fetch error:", error);
      res.status(500).json({ message: "Error fetching quiz questions" });
    }
  });

  // Student progress endpoints
  apiRouter.get("/progress", async (req: Request, res: Response) => {
    const userId = req.session.userId;


    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const progress = await storage.getStudentProgress(userId);

      // Enrich progress data with quiz information
      const enrichedProgress = await Promise.all(progress.map(async (p) => {
        const quiz = await storage.getQuiz(p.quizId);
        return {
          ...p,
          quiz
        };
      }));

      res.json(enrichedProgress);
    } catch (error) {
      console.error("Progress fetch error:", error);
      res.status(500).json({ message: "Error fetching student progress" });
    }
  });

  apiRouter.get("/progress/:quizId", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    const quizId = parseInt(req.params.quizId);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const progress = await storage.getStudentProgressByQuiz(userId, quizId);

      if (!progress) {
        return res.json(null); // No progress yet
      }

      const answers = await storage.getStudentAnswersByProgress(progress.id);

      res.json({
        ...progress,
        answers
      });
    } catch (error) {
      console.error("Quiz progress fetch error:", error);
      res.status(500).json({ message: "Error fetching quiz progress" });
    }
  });

  //deep seek mejora active-quiz:
  apiRouter.post("/progress", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admin Mode: Ignore progress saving
    if (userId === 1) {
      return res.json({
        id: -1,
        userId: 1,
        quizId: req.body.quizId,
        status: 'in_progress',
        completedQuestions: 0,
        timeSpent: 0
      });
    }

    try {
      // Validar datos con Zod (completedAt es tipo Date)
      const progressData = insertStudentProgressSchema.parse({
        ...req.body,
        userId,
      });

      const mode = req.body.mode || 'standard';

      // Verificar progreso existente
      const existingProgress = await storage.getStudentProgressByQuiz(
        userId,
        progressData.quizId
      );

      // Convertir Date a string solo si existe
      const progressForStorage = {
        ...progressData,
        completedAt: progressData.completedAt
          ? progressData.completedAt.toISOString()
          : undefined,
        mode, // Add mode to storage object
      };

      if (existingProgress) {
        // Actualizar progreso existente
        const updatedProgress = await storage.updateStudentProgress(
          existingProgress.id,
          progressForStorage
        );

        // Si se completó (y no estaba completo antes), guardar en quizSubmissions y dar crédito
        if (progressForStorage.status === 'completed' && existingProgress.status !== 'completed') {
          await storage.saveQuizSubmission({
            userId: userId,
            quizId: progressData.quizId,
            score: progressData.score || 0,
            progressId: existingProgress.id
          });

          // Calculate credits based on score and mode
          let creditsEarned = 0;
          const score = progressData.score || 0;

          if (mode === 'mini') {
            if (score > 8) creditsEarned = 2;
          } else {
            // Standard
            if (score >= 9) creditsEarned = 3;
            else if (score >= 8) creditsEarned = 2;
            else if (score >= 7) creditsEarned = 1;
          }

          // Check for "All Tasks Completed" bonus
          const assignedQuizzes = await storage.getQuizzesByUserId(userId);
          const userProgress = await storage.getStudentProgress(userId);

          // Check if there are any quizzes that are NOT completed
          // We just updated the current quiz to completed, so it should be reflected in userProgress if we re-fetched, 
          // but userProgress here is from the *start* of the request (if we fetched it). 
          // Actually we didn't fetch all progress, only specific progress.
          // So we need to fetch all progress now to be sure.
          const allUserProgress = await storage.getStudentProgress(userId);

          const hasPendingTasks = assignedQuizzes.some(q => {
            const p = allUserProgress.find(prog => prog.quizId === q.id);
            return !p || p.status !== 'completed';
          });

          if (!hasPendingTasks) {
            creditsEarned += 5;
          }

          if (creditsEarned > 0) {
            const user = await storage.getUser(userId);
            if (user) {
              await storage.updateUserHintCredits(userId, user.hintCredits + creditsEarned);
            }
          }
        }

        return res.json(updatedProgress);
      }

      // Crear nuevo progreso
      const newProgress = await storage.createStudentProgress(progressData);

      // Si se completó, guardar en quizSubmissions y dar crédito
      if (progressForStorage.status === 'completed') {
        await storage.saveQuizSubmission({
          userId: userId,
          quizId: progressData.quizId,
          score: progressData.score || 0,
          progressId: newProgress.id
        });

        // Calculate credits based on score and mode
        let creditsEarned = 0;
        const score = progressData.score || 0;

        if (mode === 'mini') {
          if (score > 8) creditsEarned = 2;
        } else {
          // Standard
          if (score >= 9) creditsEarned = 3;
          else if (score >= 8) creditsEarned = 2;
          else if (score >= 7) creditsEarned = 1;
        }

        // Check for "All Tasks Completed" bonus
        const assignedQuizzes = await storage.getQuizzesByUserId(userId);
        const allUserProgress = await storage.getStudentProgress(userId);

        const hasPendingTasks = assignedQuizzes.some(q => {
          const p = allUserProgress.find(prog => prog.quizId === q.id);
          return !p || p.status !== 'completed';
        });

        if (!hasPendingTasks) {
          creditsEarned += 5;
        }

        if (creditsEarned > 0) {
          const user = await storage.getUser(userId);
          if (user) {
            await storage.updateUserHintCredits(userId, user.hintCredits + creditsEarned);
          }
        }
      }

      res.status(201).json(newProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid progress data",
          errors: error.errors,
        });
      }

      console.error("Progress creation error:", error);
      res.status(500).json({
        message: "Error creating/updating progress",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Delete progress (Reset)
  apiRouter.delete("/progress/:id", requireAdmin, async (req: Request, res: Response) => {
    const progressId = parseInt(req.params.id);
    if (isNaN(progressId)) {
      return res.status(400).json({ message: "Invalid progress ID" });
    }

    try {
      await storage.deleteStudentProgress(progressId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting progress:", error);
      res.status(500).json({ message: "Error deleting progress" });
    }
  });



  // Eliminar asignación de cuestionario (Eliminar definitivamente)
  apiRouter.delete("/admin/assignments", requireAdmin, async (req, res) => {
    const { userId, quizId } = req.body;

    if (!userId || !quizId) {
      return res.status(400).json({ message: "UserId and QuizId are required" });
    }

    try {
      // Primero eliminar el progreso si existe
      const progress = await storage.getStudentProgressByQuiz(userId, quizId);
      if (progress) {
        await storage.deleteStudentProgress(progress.id);
      }

      // Luego eliminar la asignación
      await storage.removeQuizFromUser(userId, quizId);

      res.status(204).end();
    } catch (err) {
      console.error("Error removing assignment:", err);
      res.status(500).json({ message: "Error removing assignment" });
    }
  });

  // fin deep seek mejora active-quiz

  // DeepSeek API proxy endpoint
  apiRouter.post("/explain-answer", async (req: Request, res: Response) => {
    const { questionId, question, correctAnswer, quizTitle } = req.body;

    if (!question || !correctAnswer || !quizTitle) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      // 1. Check if explanation already exists in DB (if questionId provided)
      if (questionId) {
        const existingQuestion = await storage.getQuestion(questionId);
        if (existingQuestion && existingQuestion.explanation) {
          console.log(`Returning cached explanation for question ${questionId}`);
          return res.json({ content: existingQuestion.explanation });
        }
      }

      const prompt = `Eres un tutor experto en ${quizTitle}. Resuelve este problema paso a paso:

**Contexto del Cuestionario:** ${quizTitle}
**Problema:** ${question.replace(/¡/g, '')}
**Respuesta Correcta:** ${correctAnswer.replace(/¡/g, '')}

Instrucciones:
1. Usa métodos específicos de ${quizTitle}
2. Muestra máximo 6 pasos numerados
3. Usa notación LaTeX (¡...¡) para matemáticas inline y (¡¡...¡¡) para bloque. NO uses $ o $$.
4. Comienza directamente con la solución, no escribas "Solución", simplemente inicia con los pasos correspondientes
5. Cuando escribas algo como:  a = x y b = y No olvides usar Latex dos veces, una para a = x y otra para b = y, de modo que la "y" de la conjunción queda por fuera del Latex
6. No uses ninguna palabra en inglés nunca, asegúrate de escribir las palabras correspondientes y adecuadas en español

Ejemplo de formato:
1. Identificamos: ¡x^2 + bx + c! (problema de ${quizTitle})
2. Aplicamos: ¡fórmula!
3. Resolvemos: ¡operación!`;

      const apiKey = process.env.VITE_DEEPSEEK_API_KEY;

      if (!apiKey) {
        console.error("DeepSeek API key not found in environment variables");
        return res.status(500).json({ message: "Server configuration error" });
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`DeepSeek API error: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('La API no devolvió contenido');
      }

      let generatedExplanation = data.choices[0].message.content;

      // Post-process to enforce symmetric delimiters ¡...¡
      // Fix block math: ¡¡...!! -> ¡¡...¡¡
      generatedExplanation = generatedExplanation.replace(/¡¡([\s\S]*?)!!/g, '¡¡$1¡¡');
      // Fix inline math: ¡...! -> ¡...¡
      generatedExplanation = generatedExplanation.replace(/¡([^¡]+?)!/g, '¡$1¡');
      // Fix mixed or dollar signs if any: $...$ -> ¡...¡ (basic fallback)
      generatedExplanation = generatedExplanation.replace(/\$([^$]+?)\$/g, '¡$1¡');

      // 2. Save explanation to DB (if questionId provided)
      if (questionId) {
        try {
          await storage.updateQuestionExplanation(questionId, generatedExplanation);
          console.log(`Cached explanation for question ${questionId}`);
        } catch (dbError) {
          console.error("Error caching explanation:", dbError);
          // Continue execution, don't fail the request if caching fails
        }
      }

      res.json({ content: generatedExplanation });
    } catch (error) {
      console.error("Error generating explanation:", error);
      res.status(500).json({ message: "Error generating explanation" });
    }
  });

  // Hint System Endpoint
  apiRouter.post("/hints/request", async (req: Request, res: Response) => {
    // console.error("DEBUG: Received hint request:", JSON.stringify(req.body));
    const userId = req.session.userId;
    const { questionId, hintType, hintIndex, progressId } = req.body;

    // if (!userId) return res.status(401).json({ message: "Authentication required" });
    if (!questionId || !hintType || !hintIndex) return res.status(400).json({ message: "Missing required fields" });

    try {
      // 1. Check if question belongs to a public quiz
      const question = await storage.getQuestion(questionId);
      if (!question) return res.status(404).json({ message: "Question not found" });

      // const publicQuizIds = [278, 279, 280]; // Removed to use global variable
      const isPublicQuiz = publicQuizIds.includes(question.quizId);

      if (!userId && !isPublicQuiz) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // If public quiz and no user, skip credit check and tracking
      if (isPublicQuiz && !userId) {
        let hintContent = '';
        let hintField: 'hint1' | 'hint2' | 'hint3' | null = null;

        if (hintIndex === 1) hintField = 'hint1';
        else if (hintIndex === 2) hintField = 'hint2';
        else if (hintIndex === 3) hintField = 'hint3';

        if (!hintField) return res.status(400).json({ message: "Invalid hint index" });

        const isGenericHint = question[hintField] && (question[hintField] as string).includes("Lee atentamente el enunciado");

        if (question[hintField] && !isGenericHint) {
          hintContent = question[hintField] as string;
        } else {
          // Generate with DeepSeek (Copying logic from below)
          // Note: We might want to refactor this into a helper function to avoid duplication
          // For now, I'll just duplicate the generation logic or rely on the existing flow if I can structure it right.
          // Let's restructure to reuse the generation logic below.
        }

        // Actually, let's just let it fall through to the generation logic
        // We just need to bypass the user/credit checks.
      }

      let user: any = null;
      if (userId) {
        user = await storage.getUser(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
      }

      // Check if hint already unlocked (only for logged in users)
      let isAlreadyUnlocked = false;
      let studentAnswer: any = null;

      if (userId && progressId) {
        studentAnswer = (await storage.getStudentAnswersByProgress(progressId)).find(a => a.questionId === questionId);

        if (!studentAnswer) {
          // console.log("Creating new student answer for hint request...");
          studentAnswer = await storage.createStudentAnswer({
            progressId,
            questionId,
            answerId: null,
            isCorrect: null,
            hintsUsed: 0,
            variables: {}
          });
        }
        isAlreadyUnlocked = studentAnswer.hintsUsed >= hintIndex;
      }

      // 1. Check Credits (only if not unlocked and not public/guest)
      const cost = hintType === 'super' ? 2 : 1;
      if (userId && !isAlreadyUnlocked && user.hintCredits < cost) {
        return res.status(403).json({ message: "Insufficient credits", currentCredits: user.hintCredits });
      }

      // 2. Check Cache
      // Question already fetched above

      let hintContent = '';
      let hintField: 'hint1' | 'hint2' | 'hint3' | null = null;

      if (hintIndex === 1) hintField = 'hint1';
      else if (hintIndex === 2) hintField = 'hint2';
      else if (hintIndex === 3) hintField = 'hint3';

      if (!hintField) return res.status(400).json({ message: "Invalid hint index" });

      // Check if hint exists and is NOT a generic placeholder
      const isGenericHint = question[hintField] && (question[hintField] as string).includes("Lee atentamente el enunciado");

      if (question[hintField] && !isGenericHint) {
        hintContent = question[hintField] as string;
      } else {
        // Generate with DeepSeek
        console.log(`Generating ${hintField} for question ${questionId} using DeepSeek...`);
        const quiz = await storage.getQuiz(question.quizId);
        const answers = await storage.getAnswersByQuestion(questionId);
        const correctAnswer = answers.find(a => a.isCorrect)?.content || "No especificada";

        const prompt = `Eres un tutor experto. El estudiante necesita una pista para esta pregunta de ${quiz?.title || 'Matemáticas'}:
        
        Pregunta: ${question.content.replace(/¡/g, '')}
        Respuesta Correcta: ${correctAnswer.replace(/¡/g, '')}
        
        Genera una ${hintType === 'super' ? 'SÚPER PISTA (muy reveladora pero sin dar la respuesta directa)' : 'PISTA (una ayuda sutil para guiar al estudiante)'}.
        La pista debe ser breve (máximo 2 frases) y en Español.
        NO des la respuesta final.`;

        const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
        if (!apiKey) {
          console.error("DeepSeek API key missing in environment variables");
          throw new Error("DeepSeek API key missing");
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            max_tokens: 150,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("DeepSeek API error:", response.status, errorText);
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        hintContent = data.choices?.[0]?.message?.content || "No se pudo generar la pista.";

        console.log(`Generated hint content: ${hintContent}`);

        // Save to DB (Cache)
        await storage.updateQuestionHints(questionId, { [hintField]: hintContent });
      }

      // 5. Deduct Credits & Update Usage (only if not unlocked AND user exists)
      if (userId && user && !isAlreadyUnlocked && studentAnswer) {
        console.log("Updating user hint credits...");
        console.log(`userId: ${userId}, newCredits: ${user.hintCredits - cost}`);
        await storage.updateUserHintCredits(userId, user.hintCredits - cost);

        console.log("Updating hintsUsed in studentAnswer...");
        console.log(`studentAnswerId: ${studentAnswer.id}, hintsUsed: ${hintIndex}`);
        // Update hintsUsed in studentAnswer
        await db.update(studentAnswers)
          .set({ hintsUsed: hintIndex })
          .where(eq(studentAnswers.id, studentAnswer.id));
      }

      console.log("Sending response...");
      res.json({
        content: hintContent,
        remainingCredits: (userId && user && !isAlreadyUnlocked) ? user.hintCredits - cost : (user ? user.hintCredits : null)
      });

    } catch (error) {
      console.error("Hint request error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: `Error processing hint request: ${errorMessage}` });
    }
  });

  // Student answers endpoint
  apiRouter.post("/answers", async (req: Request, res: Response) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admin Mode: Ignore answer saving
    if (userId === 1) {
      return res.json({ message: "Admin answer ignored" });
    }

    try {
      const answerData = insertStudentAnswerSchema.parse(req.body);

      // Verify progress belongs to user
      const progress = await storage.getStudentProgress(userId)
        .then(progresses => progresses.find(p => p.id === answerData.progressId));

      if (!progress) {
        return res.status(403).json({ message: "Not authorized to submit answers for this progress" });
      }

      const answer = await storage.createStudentAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      console.error("Answer creation error:", error);
      res.status(500).json({ message: "Error submitting answer" });
    }
  });

  apiRouter.get("/results/:progressId", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    const progressId = parseInt(req.params.progressId);
    const childId = req.query.user_id ? parseInt(req.query.user_id as string) : null;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (isNaN(progressId)) {
      return res.status(400).json({ message: "Invalid progress ID" });
    }

    // Fetch user to confirm role
    const user = await storage.getUser(userId);
    const userRole = user?.role;

    try {
      let progress;

      console.log(`[DEBUG] /results/${progressId} - User: ${userId}, Role: ${userRole}`);

      if (userRole === "admin") {
        // Admin puede ver cualquier progreso
        console.log(`[DEBUG] Fetching progress ${progressId} for admin`);
        progress = await storage.getStudentProgressById(progressId);
        console.log(`[DEBUG] Progress found:`, progress ? "Yes" : "No");
      } else if (userRole === "parent" && childId) {
        // Verificar que el childId pertenece al padre autenticado
        const parentChild = await storage.getChildByParentId(userId);
        if (!parentChild || parentChild.id !== childId) {
          return res.status(403).json({ message: "Not authorized to view these results" });
        }

        // Obtener el progreso del hijo
        const childProgresses = await storage.getStudentProgress(childId);
        progress = childProgresses.find((p) => p.id === progressId);
      } else if (userRole === "student" || userRole === "user") {
        // Usuario normal solo puede ver sus propios progresos
        const userProgresses = await storage.getStudentProgress(userId);
        progress = userProgresses.find((p) => p.id === progressId);
      } else {
        return res.status(403).json({ message: "Not authorized to view these results" });
      }

      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      const quiz = await storage.getQuiz(progress.quizId);
      const answers = await storage.getStudentAnswersByProgress(progressId);

      // Obtener detalles de las preguntas para cada respuesta
      const detailedAnswers = await Promise.all(
        answers.map(async (answer) => {
          const question = await storage.getQuestion(answer.questionId);
          const answerDetails = answer.answerId ? await storage.getAnswer(answer.answerId) : null;

          return {
            ...answer,
            question,
            answerDetails,
          };
        })
      );

      res.json({
        progress,
        quiz,
        answers: detailedAnswers,
      });
    } catch (error) {
      console.error("Results fetch error:", error);
      res.status(500).json({ message: "Error fetching quiz results" });
    }
  });





  // API para gestionar categorías
  apiRouter.get("/admin/categories", requireAdmin, async (req: Request, res: Response) => {
    try {
      const allCategories = await storage.getCategories();
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  apiRouter.post("/admin/categories", requireAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = req.body;
      const newCategory = await storage.createCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Category creation error:", error);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  apiRouter.put("/admin/categories/:id", requireAdmin, async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    try {
      const categoryData = req.body;
      const category = await storage.updateCategory(categoryId, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Category update error:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  apiRouter.delete("/admin/categories/:id", requireAdmin, async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    try {
      await storage.deleteCategory(categoryId);
      res.status(204).end();
    } catch (error) {
      console.error("Category deletion error:", error);
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  apiRouter.get("/users/:userId/categories", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    //console.log("🧪 userId recibido1:", req.params.userId, "➡️ convertido a:", userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    try {
      const userCats = await db
        .select()
        .from(userCategories)
        .where(eq(userCategories.userId, userId))
        .leftJoin(categories, eq(userCategories.categoryId, categories.id));

      res.json(userCats || []); // Siempre devuelve un array
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        message: "Error al obtener materias",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  apiRouter.put("/users/:userId/categories", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { categoryIds } = req.body;
    //console.log("🧪 userId recibido2:", req.params.userId, "➡️ convertido a:", userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ message: "categoryIds must be an array" });
    }

    try {
      // Transaction para asegurar consistencia
      await db.transaction(async (tx) => {
        // Eliminar relaciones existentes
        await tx
          .delete(userCategories)
          .where(eq(userCategories.userId, userId));

        // Insertar nuevas relaciones si hay categorías seleccionadas
        if (categoryIds.length > 0) {
          const inserts = categoryIds.map(categoryId => ({
            userId,
            categoryId
          }));

          await tx.insert(userCategories).values(inserts);
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error("User categories update error:", error);
      res.status(500).json({ message: "Error updating user categories" });
    }
  });
  //fin deep seek

  //turno chatgpt
  apiRouter.get("/admin/users-with-categories", requireAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios
      const allUsers = await db.select().from(users);

      // Obtener todas las relaciones usuario-categoría
      const userCats = await db
        .select()
        .from(userCategories)
        .leftJoin(categories, eq(userCategories.categoryId, categories.id));

      // Agrupar categorías por usuario
      const userMap = new Map<number, any[]>();

      for (const uc of userCats) {
        const uid = uc.user_categories.userId;
        const cat = uc.categories;

        if (!userMap.has(uid)) {
          userMap.set(uid, []);
        }

        if (cat) {
          userMap.get(uid)!.push(cat);
        }
      }

      // Combinar usuarios con sus categorías
      const result = allUsers.map(user => ({
        user,
        categories: userMap.get(user.id) || []
      }));

      res.json(result);
    } catch (error) {
      console.error("Error al obtener usuarios con materias:", error);
      res.status(500).json({ message: "Error al obtener usuarios con materias" });
    }
  });

  //fin chatgpt



  // API para gestionar quizzes
  apiRouter.post("/admin/quizzes", requireAdmin, async (req: Request, res: Response) => {
    try {
      const quizData = req.body;
      const newQuiz = await storage.createQuiz(quizData);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error("Quiz creation error:", error);
      res.status(500).json({ message: "Error creating quiz" });
    }
  });

  apiRouter.put("/admin/quizzes/:id", requireAdmin, async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const quizData = req.body;
      const quiz = await storage.updateQuiz(quizId, quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Quiz update error:", error);
      res.status(500).json({ message: "Error updating quiz" });
    }
  });

  apiRouter.delete("/admin/quizzes/:id", requireAdmin, async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      await storage.deleteQuiz(quizId);
      res.status(204).end();
    } catch (error) {
      console.error("Quiz deletion error:", error);
      res.status(500).json({ message: "Error deleting quiz" });
    }
  });

  apiRouter.get("/quizzes/by-subcategory/:subcategoryId", async (req, res) => {
    const subcategoryId = parseInt(req.params.subcategoryId);
    const quizzes = await storage.getQuizzesBySubcategory(subcategoryId);
    res.json(quizzes);
    let { userId, quizId } = req.body;

    // Fallback to query parameters if body is empty (common in some clients for DELETE)
    if (!userId && req.query.userId) userId = parseInt(req.query.userId as string);
    if (!quizId && req.query.quizId) quizId = parseInt(req.query.quizId as string);

    if (!userId || !quizId) return res.status(400).json({ message: "Missing data" });

    try {
      await storage.removeQuizFromUser(userId, quizId);
      res.status(204).end();
    } catch (err) {
      console.error("Error removing quiz:", err);
      res.status(500).json({ message: "Error removing quiz" });
    }
  });

  // Eliminar usuario y todos sus datos asociados
  apiRouter.delete("/admin/users/:userId", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    try {
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Rutas para Calificar (Quiz Submissions)
  apiRouter.post("/admin/backfill-submissions", requireAdmin, async (req, res) => {
    try {
      await storage.backfillQuizSubmissions();
      res.json({ message: "Backfill completed successfully" });
    } catch (error) {
      console.error("Backfill error:", error);
      res.status(500).json({ message: "Error backfilling submissions" });
    }
  });

  apiRouter.get("/admin/quiz-submissions", requireAdmin, async (req, res) => {
    try {
      console.log("Fetching quiz submissions...");
      const submissions = await storage.getAllQuizSubmissions();
      console.log(`Found ${submissions.length} submissions.`);
      res.json(submissions);
    } catch (err) {
      console.error("Error fetching quiz submissions:", err);
      res.status(500).json({ message: "Error fetching quiz submissions" });
    }
  });

  apiRouter.patch("/quiz-submissions/:progressId/reviewed", requireAdmin, async (req, res) => {
    const progressId = parseInt(req.params.progressId);
    if (isNaN(progressId)) return res.status(400).json({ message: "Invalid progress ID" });

    try {
      await storage.markSubmissionAsReviewed(progressId);
      res.json({ success: true });
    } catch (err) {
      console.error("Error marking submission as reviewed:", err);
      res.status(500).json({ message: "Error updating submission" });
    }
  });

  apiRouter.delete("/quiz-submissions/:progressId", requireAdmin, async (req, res) => {
    const progressId = parseInt(req.params.progressId);
    if (isNaN(progressId)) return res.status(400).json({ message: "Invalid progress ID" });

    try {
      await storage.deleteSubmissionByProgressId(progressId);
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting submission:", err);
      res.status(500).json({ message: "Error deleting submission" });
    }
  });

  // Actualizar categorías de usuario
  apiRouter.put("/admin/users/:userId/categories", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { categoryIds } = req.body;

    if (isNaN(userId) || !Array.isArray(categoryIds)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    try {
      await storage.updateUserCategories(userId, categoryIds);
      res.json({ success: true });
    } catch (err) {
      console.error("Error updating user categories:", err);
      res.status(500).json({ message: "Error updating user categories" });
    }
  });

  // Eliminar progreso de usuario (admin)
  apiRouter.delete("/admin/progress/:progressId", requireAdmin, async (req, res) => {
    const progressId = parseInt(req.params.progressId);
    if (isNaN(progressId)) return res.status(400).json({ message: "Invalid progress ID" });

    try {
      await storage.deleteStudentProgress(progressId);
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting progress:", err);
      res.status(500).json({ message: "Error deleting progress" });
    }
  });

  // Obtener datos del dashboard de un usuario específico (para admin)
  apiRouter.get("/admin/users/:userId/dashboard", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

    try {
      const [quizzes, categories] = await Promise.all([
        storage.getQuizzesByUserId(userId),
        storage.getCategoriesByUserId(userId)
      ]);

      res.json({ quizzes, categories });
    } catch (err) {
      console.error("Error fetching user dashboard data:", err);
      res.status(500).json({ message: "Error fetching user dashboard data" });
    }
  });

  apiRouter.patch("/users/:id/credits", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { credits } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (typeof credits !== 'number') {
      return res.status(400).json({ message: "Credits must be a number" });
    }

    try {
      const updatedUser = await storage.updateUserCredits(userId, credits);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user credits:", error);
      res.status(500).json({ message: "Error updating user credits" });
    }
  });

  // Nuevos endpoints para el Dashboard Refactorizado
  apiRouter.get("/admin/students-at-risk", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const students = await storage.getStudentsAtRisk(limit);
      res.json(students);
    } catch (err) {
      console.error("Error fetching students at risk:", err);
      res.status(500).json({ message: "Error fetching students at risk" });
    }
  });

  apiRouter.get("/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      res.status(500).json({ message: "Error fetching recent activity" });
    }
  });

  // Search Routes
  apiRouter.get("/admin/search/users", requireAdmin, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) return res.json([]);

      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (err) {
      console.error("Error searching users:", err);
      res.status(500).json({ message: "Error searching users" });
    }
  });

  apiRouter.get("/search/quizzes", requireAuth, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) return res.json([]);

      const userId = req.session.userId;
      const quizzes = await storage.searchQuizzes(query, userId);
      res.json(quizzes);
    } catch (err) {
      console.error("Error searching quizzes:", err);
      res.status(500).json({ message: "Error searching quizzes" });
    }
  });

  // Eliminar un progreso específico (tarea completada)
  apiRouter.delete("/admin/progress/:progressId", requireAdmin, async (req, res) => {
    const progressId = parseInt(req.params.progressId);
    if (isNaN(progressId)) return res.status(400).json({ message: "Invalid progress ID" });

    try {
      await storage.deleteStudentProgress(progressId);
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting progress:", err);
      res.status(500).json({ message: "Error deleting progress" });
    }
  });


  // Asignar un quiz a un usuario
  // Asignar múltiples quizzes a un usuario con notificación por correo
  apiRouter.post("/admin/users/:userId/quizzes", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { quizIds } = req.body;

    if (isNaN(userId) || !Array.isArray(quizIds)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const results = [];

      for (const quizId of quizIds) {
        // Asignar quiz
        await storage.assignQuizToUser(userId, quizId);

        // Obtener detalles del quiz para el correo
        const quiz = await storage.getQuiz(quizId);

        if (quiz && user.email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          try {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || "587"),
              secure: parseInt(process.env.SMTP_PORT || "587") === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            const imageUrl = quiz.url ? `<img src="${quiz.url}" alt="Quiz Image" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 8px;">` : '';
            const bannerUrl = "https://imagenes.alanmath.com/nueva-actividad.jpg";

            await transporter.sendMail({
              from: `"AlanMath" <${process.env.SMTP_USER}>`,
              to: user.email,
              subject: `Nuevo Cuestionario Asignado: ${quiz.title}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${bannerUrl}" alt="Nueva Actividad" style="max-width: 250px; height: auto; border-radius: 8px;">
                  </div>
                  <h1 style="color: #4F46E5; text-align: center;">¡Nuevo Reto Asignado!</h1>
                  <p>Hola ${user.name},</p>
                  <p>Se te ha asignado un nuevo cuestionario para practicar:</p>
                  
                  <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0; color: #111827;">${quiz.title}</h2>
                    <p style="margin-bottom: 5px;"><strong>Dificultad:</strong> ${quiz.difficulty}</p>
                    <p style="margin-bottom: 0;"><strong>Preguntas:</strong> ${quiz.totalQuestions}</p>
                  </div>

                  <p>¡Tú puedes lograrlo! La práctica hace al maestro.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://app.alanmath.com/" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Ir a la App</a>
                    <a href="https://alanmath.com/" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visitar Sitio Web</a>
                  </div>

                  ${imageUrl}
                  
                  <p style="margin-top: 30px; font-size: 12px; color: #6B7280; text-align: center;">
                    Este es un mensaje automático de AlanMath.
                  </p>
                </div>
              `,
            });
            console.log(`📧 Notification email sent to ${user.email} for quiz ${quizId}`);
          } catch (emailError) {
            console.error(`Failed to send email for quiz ${quizId}:`, emailError);
            // No fallamos la request si falla el correo, solo logueamos
          }
        }
        results.push(quizId);
      }

      res.json({ message: "Quizzes assigned successfully", assigned: results });
    } catch (err) {
      console.error("Error assigning quizzes:", err);
      res.status(500).json({ message: "Error assigning quizzes", error: String(err) });
    }
  });




  // Suponiendo que estás usando Express en tu backend

  app.get('/api/admin/users/quizzes/:quizId', async (req, res) => {
    const quizId = Number(req.params.quizId);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      // Aquí deberías hacer una consulta a la base de datos para obtener los usuarios asignados a este quiz
      const usersAssigned = await getUsersAssignedToQuiz(quizId);  // Asume que esta función obtiene los usuarios desde tu base de datos

      // Devuelve la lista de usuarios asignados
      res.json(usersAssigned);
    } catch (error) {
      console.error('Error fetching assigned users:', error);
      res.status(500).json({ message: 'Error fetching assigned users' });
    }
  });


  //fin chat gpt asignar cuestionarios a usuarios

  //chat gpt dashboard personalizado
  // Obtener categorías asignadas al usuario autenticado
  app.get("/api/user/categories", requireAuth, async (req, res) => {
    try {

      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }


      //const userId = req.user.id;
      // Cambio principal: Permitir user_id como parámetro opcional
      const userId = req.query.user_id ? Number(req.query.user_id) : (req.user as any).id; // Línea modificada

      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías del usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Obtener cuestionarios asignados al usuario autenticado
  app.get("/api/user/quizzes", requireAuth, async (req, res) => {
    try {

      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }


      //const userId = req.user.id;
      // Cambio principal: Permitir user_id como parámetro opcional
      const userId = req.query.user_id ? Number(req.query.user_id) : req.user!.id; // Línea modificada

      const quizzes = await storage.getQuizzesByUserId(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error al obtener quizzes del usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  //fin chat gpt

  //deep seek entrenamiento estilo active-quiz

  app.get("/api/training/:categoryId", requireAuth, async (req: Request, res: Response) => {
    try {
      const categoryId = Number(req.params.categoryId);
      if (isNaN(categoryId)) return res.status(400).json({ message: "ID inválido" });

      // 1. Obtener quizzes de la categoría
      const quizzesInCategory = await db
        .select({ id: quizzes.id })
        .from(quizzes)
        .where(eq(quizzes.categoryId, categoryId));

      if (quizzesInCategory.length === 0) {
        return res.status(404).json({ message: "No hay quizzes para esta categoría" });
      }

      const quizIds = quizzesInCategory.map(q => q.id);

      // 2. Obtener preguntas con sus respuestas (usando la tabla answers)
      const questionsWithAnswers = await db.transaction(async (tx) => {
        const questions = await tx
          .select()
          .from(questionsTable)
          .where(inArray(questionsTable.quizId, quizIds));

        const questionsData = await Promise.all(
          questions.map(async (question) => {
            const answersList = await tx
              .select()
              .from(answers)
              .where(eq(answers.questionId, question.id));

            return {
              ...question,
              options: answersList.map(a => ({
                id: a.id,
                text: a.content, // Mapea content → text para el frontend
                isCorrect: a.isCorrect,
                explanation: a.explanation
              }))
            };
          })
        );

        return questionsData;
      });

      // 3. Seleccionar 20 preguntas aleatorias
      const shuffled = questionsWithAnswers.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 20);

      res.json({ questions: selected });
    } catch (err) {
      console.error("Error en entrenamiento:", err);

      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      res.status(500).json({
        code: "TRAINING_ERROR",
        message: "Error al obtener preguntas",
        details: errorMessage
      });
    }

  });
  //fin deep seek entrenamiento estilo active-quiz

  // API para gestionar preguntas
  apiRouter.get("/admin/questions", requireAdmin, async (req: Request, res: Response) => {
    const quizId = parseInt(req.query.quizId as string);

    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    try {
      const questions = await storage.getQuestionsByQuiz(quizId);

      // Obtener respuestas para cada pregunta
      const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
        const answers = await storage.getAnswersByQuestion(question.id);
        return {
          ...question,
          answers
        };
      }));

      res.json(questionsWithAnswers);
    } catch (error) {
      console.error("Questions fetch error:", error);
      res.status(500).json({ message: "Error fetching questions" });
    }
  });


  //deep seek me ayuda error crear preguntas
  apiRouter.post("/admin/questions", requireAdmin, async (req: Request, res: Response) => {
    //console.log("📦 Datos recibidos en el body:", req.body);

    try {
      const { answers = [], ...questionData } = req.body;

      // Validación básica
      if (!questionData.quizId || isNaN(parseInt(questionData.quizId))) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }

      if (!['multiple_choice', 'text', 'formula'].includes(questionData.type)) {
        return res.status(400).json({ message: "Invalid question type" });
      }

      // Crear pregunta principal
      const newQuestion = await storage.createQuestion({
        ...questionData,
        quizId: parseInt(questionData.quizId)
      });

      // Manejo de respuestas
      let createdAnswers: (Answer | null)[] = [];

      if (questionData.type === 'multiple_choice' && Array.isArray(answers)) {
        try {
          createdAnswers = await Promise.all(
            answers.map(async (answer) => {
              try {
                return await storage.createAnswer({
                  ...answer,
                  questionId: newQuestion.id
                });
              } catch (error) {
                console.error(`Failed to create answer: ${answer.content}`, error);
                return null; // Devuelve null para respuestas fallidas
              }
            })
          );
          // Filtrar respuestas nulas (las que fallaron)
          createdAnswers = createdAnswers.filter(answer => answer !== null);
        } catch (error) {
          console.error("Error creating answers:", error);
          // Continuamos aunque falle alguna respuesta
        }
      }

      res.status(201).json({
        ...newQuestion,
        answers: createdAnswers
      });

    } catch (error) {
      console.error("Question creation error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      res.status(500).json({
        message: "Error creating question",
        error: errorMessage
      });
    }

  });
  //fin deep seek me ayuda error crear preguntas

  apiRouter.put("/admin/questions/:id", requireAdmin, async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.id);
    const { answers: submittedAnswers = [], ...questionData } = req.body;

    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    try {
      // 1. Update Question Details
      const updatedQuestion = await storage.updateQuestion(questionId, {
        ...questionData,
        quizId: parseInt(questionData.quizId)
      });

      // 2. Synchronize Answers
      // Fetch existing answers from DB
      const existingAnswers = await storage.getAnswersByQuestion(questionId);
      const existingAnswerIds = new Set(existingAnswers.map(a => a.id));

      const submittedAnswerIds = new Set(
        submittedAnswers
          .filter((a: any) => a.id)
          .map((a: any) => a.id)
      );

      // A. Delete answers that are in DB but not in submission
      const answersToDelete = existingAnswers.filter(a => !submittedAnswerIds.has(a.id));
      await Promise.all(answersToDelete.map(a => storage.deleteAnswer(a.id)));

      // B. Update existing answers and Create new ones
      const processedAnswers = await Promise.all(submittedAnswers.map(async (answer: any) => {
        if (answer.id && existingAnswerIds.has(answer.id)) {
          // Update existing
          return await storage.updateAnswer(answer.id, {
            content: answer.content,
            isCorrect: answer.isCorrect,
            explanation: answer.explanation,
            questionId: questionId // Ensure it stays linked
          });
        } else {
          // Create new
          return await storage.createAnswer({
            content: answer.content,
            isCorrect: answer.isCorrect,
            explanation: answer.explanation,
            questionId: questionId
          });
        }
      }));

      res.json({
        ...updatedQuestion,
        answers: processedAnswers
      });

    } catch (error) {
      console.error("Question update error:", error);
      res.status(500).json({ message: "Error updating question" });
    }
  });

  apiRouter.delete("/admin/questions/:id", requireAdmin, async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.id);

    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    try {
      // Eliminar respuestas asociadas
      const answers = await storage.getAnswersByQuestion(questionId);
      await Promise.all(answers.map(answer => storage.deleteAnswer(answer.id)));

      // Eliminar la pregunta
      await storage.deleteQuestion(questionId);
      res.status(204).end();
    } catch (error) {
      console.error("Question deletion error:", error);
      res.status(500).json({ message: "Error deleting question" });
    }
  });

  //chat gpt calificaciones
  // Dentro de setupRoutes(app, storage)
  //active-quiz entrega datos del quiz recien hecho:
  app.post("/api/quiz-submission", async (req, res) => {
    const { userId, quizId, score, progressId } = req.body;


    /*console.log("📥 Datos recibidos en /api/quiz-submission:", {
      userId,
      quizId,
      score,
      progressId,
      typeofScore: typeof score,
    });*/

    if (!userId || !quizId || typeof score !== "number" || !progressId) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    // Admin Mode: Ignore submission
    if (userId === 1) {
      return res.status(200).json({ success: true, message: "Admin submission ignored" });
    }

    try {
      await storage.saveQuizSubmission({ userId, quizId, score, progressId });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error guardando quiz submission:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  // Reportes de errores
  apiRouter.post("/reports", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autorizado");

      const report = await storage.createQuestionReport({
        ...req.body,
        userId: req.user.id,
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).send("Error al crear el reporte");
    }
  });

  apiRouter.get("/admin/reports", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log("GET /admin/reports - User:", req.user?.id, "Role:", req.user?.role);
      if (!req.user || req.user.role !== "admin") {
        console.log("Access denied for user:", req.user?.id);
        return res.status(403).send("No autorizado");
      }

      const reports = await storage.getQuestionReports();
      console.log("Reports found:", reports.length);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).send("Error al obtener reportes");
    }
  });

  apiRouter.patch("/admin/reports/:id", async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== "admin") return res.status(403).send("No autorizado");

      const reportId = parseInt(req.params.id);
      const { status } = req.body;

      const updatedReport = await storage.updateQuestionReportStatus(reportId, status);
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).send("Error al actualizar el reporte");
    }
  });

  apiRouter.get("/admin/reports/:id/details", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).send("No autenticado");

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") return res.status(403).send("No autorizado");

      const reportId = parseInt(req.params.id);
      const report = await storage.getQuestionReportDetails(reportId);

      if (!report) return res.status(404).send("Reporte no encontrado");

      res.json(report);
    } catch (error) {
      console.error("Error fetching report details:", error);
      res.status(500).send("Error al obtener detalles del reporte");
    }
  });

  apiRouter.post("/admin/reports/:id/solve-ai", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).send("No autenticado");

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") return res.status(403).send("No autorizado");

      const reportId = parseInt(req.params.id);
      const report = await storage.getQuestionReportDetails(reportId);

      if (!report || !report.question) return res.status(404).send("Reporte o pregunta no encontrada");

      const question = report.question;
      const answers = question.answers || [];

      // Prepare prompt for DeepSeek
      const prompt = `
        Actúa como un profesor experto de matemáticas. Analiza la siguiente pregunta y sus opciones de respuesta.
        Resuelve el problema paso a paso y determina cuál es la respuesta correcta.
        
        Pregunta: ${question.content}
        Tipo: ${question.type}
        
        Opciones:
        ${answers.map((a: any) => `- ${a.content} (Correcta: ${a.isCorrect})`).join('\n')}
        
        Tu respuesta debe tener este formato:
        **Análisis:** [Tu explicación paso a paso]
        **Conclusión:** [Cuál es la opción correcta y por qué]
        **Veredicto:** [Indica si la pregunta o las respuestas tienen algún error]

        IMPORTANTE:
        - Usa notación LaTeX encerrada entre signos de exclamación invertidos (¡...¡) para todas las expresiones matemáticas. Ejemplo: ¡x^2 + 2x + 1 = 0¡
        - NO uses $...$ ni \\(...\\) para matemáticas.
        - Asegúrate de que el contenido matemático se renderice correctamente con este formato.
      `;

      const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "API Key de DeepSeek no configurada" });
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: "system", content: "Eres un asistente experto en matemáticas y pedagogía." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} `);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      res.json({ aiResponse });

    } catch (error) {
      console.error("Error calling AI solver:", error);
      res.status(500).json({ error: "Error al consultar a la IA" });
    }
  });

  //y ahora Calificaciones pide los datos anteriormente creados:
  app.get("/api/admin/quiz-submissions", async (req, res) => {
    try {
      const submissions = await storage.getQuizSubmissionsForAdmin(); // Lo implementamos en storage
      res.json(submissions);
    } catch (error) {
      console.error("Error al obtener submissions:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  // Update user categories
  app.put("/api/admin/users/:userId/categories", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { categoryIds } = req.body;

    if (isNaN(userId) || !Array.isArray(categoryIds)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      await storage.updateUserCategories(userId, categoryIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  //recoge todo lo que debe calificar y lo lleva al componente calificaciones
  app.get("/api/quiz-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllQuizSubmissions();
      res.status(200).json(submissions);
    } catch (error) {
      console.error("Error obteniendo quiz submissions:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  //retroalimentacion por medio de un prompt
  // En routes.ts
  app.post("/api/quiz-feedback", async (req, res) => {
    const { progressId, text } = req.body;

    if (!progressId || !text) {
      return res.status(400).json({ error: "Datos incompletos o inválidos" });
    }

    try {
      await storage.saveQuizFeedback({ progressId, text });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error guardando el feedback:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  //mostrar el feedback a los usuarios
  app.get("/api/quiz-feedback/:progressId", async (req, res) => {
    const { progressId } = req.params;

    try {
      const feedback = await storage.getQuizFeedback(Number(progressId));
      res.status(200).json(feedback);
    } catch (error) {
      console.error("Error obteniendo el feedback:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });

  //Notificaciones y borrado en las card:
  // PATCH: Marcar como revisado
  app.patch('/api/quiz-submissions/:progressId/reviewed', async (req: ExpressRequest, res: Response) => {
    const progressId = Number(req.params.progressId);
    await storage.markSubmissionAsReviewed(progressId);
    res.json({ success: true });
  });


  // DELETE /api/quiz-submissions/:progressId
  app.delete('/api/quiz-submissions/:progressId', async (req: ExpressRequest, res: Response) => {
    const progressId = Number(req.params.progressId);
    await storage.deleteSubmissionByProgressId(progressId);
    res.json({ success: true });
  });


  app.get("/api/user/alerts", requireAuth, async (req, res) => {
    try {

      //const userId = req.user?.id;
      const userId = req.query.user_id ? Number(req.query.user_id) : req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const pendingTasks = await db
        .select()
        .from(userQuizzes)
        .leftJoin(studentProgress, and(
          eq(studentProgress.quizId, userQuizzes.quizId),
          eq(studentProgress.userId, userId)
        ))
        .where(and(
          eq(userQuizzes.userId, userId),
          or(
            isNull(studentProgress.status),
            eq(studentProgress.status, 'in_progress')
          )
        ));

      const feedbacks = await db
        .select()
        .from(quizSubmissions)
        .where(and(
          eq(quizSubmissions.userId, userId),
          isNotNull(quizSubmissions.feedback)
        ));

      res.json({
        hasPendingTasks: pendingTasks.length > 0,
        hasFeedback: feedbacks.length > 0,
      });
    } catch (error) {
      console.error("Error al obtener alertas:", error);
      res.status(500).json({ error: "Error interno" });
    }
  });
  //fin chat gpt calificaciones

  //Apis para dashboard admin:

  app.get('/api/admin/dashboard-kpis', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);

      const totalAssigned = await storage.countAssignedQuizzes();
      const completed = await storage.countCompletedQuizzes();
      const pendingReview = await storage.countPendingReview();
      const pendingReports = await storage.countPendingReports();

      res.json({ totalAssigned, completed, pendingReview, pendingReports });
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      res.status(500).json({ error: 'Error al obtener KPIs' });
    }
  });


  app.get('/api/admin/recent-pending-submissions', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);
      const submissions = await storage.getRecentPendingSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error('Error al obtener envíos pendientes:', error);
      res.status(500).json({ error: 'Error al obtener envíos' });
    }
  });

  app.get('/api/admin/user-progress-summary', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);
      const data = await storage.getUserProgressSummary();
      res.json(data);
    } catch (err) {
      console.error('Error al obtener resumen de progreso:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  app.get('/api/admin/students-at-risk', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const students = await storage.getStudentsAtRisk(limit);
      res.json(students);
    } catch (error) {
      console.error('Error al obtener estudiantes en riesgo:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

  app.get('/api/admin/student-history/:userId/:subcategoryId', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);
      const userId = parseInt(req.params.userId);
      const subcategoryId = parseInt(req.params.subcategoryId);

      if (isNaN(userId) || isNaN(subcategoryId)) {
        return res.status(400).json({ error: "IDs inválidos" });
      }

      const history = await storage.getStudentHistoryBySubcategory(userId, subcategoryId);
      res.json(history);
    } catch (error) {
      console.error('Error al obtener historial del estudiante:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

  app.get('/api/admin/recent-activity', async (req, res) => {
    try {
      const storage = new DatabaseStorage(db);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

  //para la creacion de usuario  padre e hijo desde el admin:
  app.post('/api/auth/register-parent', requireAdmin, async (req, res) => {
    const { parent, child } = req.body;

    try {
      const result = await storage.registerParentWithChild(parent, child);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al registrar padre e hijo:', error);
      res.status(500).json({ error: 'Error al registrar padre e hijo' });
    }
  });



  app.get('/api/parent/child', requireAuth, async (req: Request, res: Response) => {
    try {
      // 2. Validar que req.user existe
      if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const parentId = req.user.id;
      const child = await storage.getChildByParentId(parentId);

      if (!child) {
        return res.status(404).json({ error: 'No se encontró un hijo asociado a este padre' });
      }

      res.status(200).json({
        child_id: child.id,
        child_name: child.name
      });
    } catch (error) {
      console.error('Error al obtener hijo del padre:', error);
      res.status(500).json({ error: 'Error al obtener información del hijo' });
    }
  });

  // En tu archivo de rutas principal (ej: server.ts o app.ts)
  // Obtener respuestas guardadas de un progreso específico

  ENDPOINT:
  // Obtener respuestas guardadas de un progreso específico
  app.get("/api/progress/:progressId/answers", requireAuth, async (req, res) => {
    try {
      const progressId = Number(req.params.progressId);
      const userId = req.query.user_id ? Number(req.query.user_id) : req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "No autenticado" });
      }

      // Verificar que el progreso pertenece al usuario
      const progress = await db.select().from(studentProgress).where(
        and(
          eq(studentProgress.id, progressId),
          eq(studentProgress.userId, userId)
        )
      );

      if (!progress || progress.length === 0) {
        return res.status(404).json({ error: "Progreso no encontrado" });
      }

      // Obtener todas las respuestas asociadas a este progreso
      const answers = await db.select().from(studentAnswers).where(
        eq(studentAnswers.progressId, progressId)
      );

      res.json(answers);
    } catch (error) {
      console.error("Error al cargar respuestas:", error);
      res.status(500).json({ error: "Error al cargar respuestas" });
    }
  });

  // Get user categories
  app.get("/api/users/:userId/categories", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    try {
      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching user categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update user categories (matching frontend expectation)
  app.put("/api/users/:userId/categories", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { categoryIds } = req.body;
    if (isNaN(userId) || !Array.isArray(categoryIds)) return res.status(400).json({ error: "Invalid input" });
    try {
      await storage.updateUserCategories(userId, categoryIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Impersonate user endpoint
  app.post("/api/admin/impersonate/:userId", requireAdmin, async (req: Request, res: Response) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set the session user ID to the target user
      req.session.originalAdminId = req.session.userId;
      req.session.userId = targetUserId;

      // Save the session explicitly to ensure it persists before response
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ message: `Impersonating ${targetUser.username}`, user: targetUser });
      });

    } catch (error) {
      console.error("Impersonation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stop impersonating endpoint
  app.post("/api/admin/stop-impersonating", async (req: Request, res: Response) => {
    try {
      if (!req.session.originalAdminId) {
        return res.status(400).json({ message: "Not currently impersonating" });
      }

      req.session.userId = req.session.originalAdminId;
      req.session.originalAdminId = undefined;

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        res.json({ message: "Impersonation stopped" });
      });
    } catch (error) {
      console.error("Stop impersonation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
