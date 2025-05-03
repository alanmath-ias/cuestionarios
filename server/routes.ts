import express, { type Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";
//import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertStudentProgressSchema, 
  insertStudentAnswerSchema 
} from "@shared/schema";
import * as expressSession from "express-session";
import { eq,sql } from "drizzle-orm";

import { db } from "./db";
import { userCategories, categories, quizzes } from "../shared/schema";
import { users } from "../shared/schema";
import { getUsersAssignedToQuiz } from './storage'; // Ajusta la ruta según dónde esté definido
//chat gpt entrenamiento
import { questions as questionsTable } from "@shared/schema";
import { inArray } from "drizzle-orm";
//deep seek entrenamiento:
import { answers } from "@shared/schema"; // Asegúrate de importar correctamente


//chat gpt dashboar personalizado
import { requireAuth } from "./middleware/requireAuth";
//fin chat gpt dashboar personalizado

//chat gpt cuestionarios a usuarios
import { DatabaseStorage } from './database-storage';

const storage = new DatabaseStorage(db);
//fin chat gpt cuestionarios a usuarios


//chat gpt dashboar personalizado
import { User } from '@/shared/types'; // Asegúrate de importar correctamente tu tipo de usuario

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

//fin chat gpt

// Extend the SessionData interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Create a custom Request type that includes session
type Request = ExpressRequest & {
  session: expressSession.Session & Partial<expressSession.SessionData>
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

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
  
      const validRoles = ["admin", "user", "student"] as const;
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
  
  /*
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Asegurarse de que solo los primeros usuarios puedan ser administradores
      // o que se requiera un código especial para ser administrador 
      // Esto es solo una forma simple de demostración
      const userCount = (await storage.getUsers()).length;
      const isFirstUser = userCount === 0;
      
      // Si es el primer usuario, asignarle rol de administrador
      // de lo contrario, mantener el rol proporcionado o usar "student" por defecto
      const userWithRole = {
        ...userData,
        role: isFirstUser ? 'admin' : (userData.role || 'student')
      };
      
      const newUser = await storage.createUser(userWithRole);
      
      // Auto login
      req.session.userId = newUser.id;
      req.session.role = user.role; // ← asegúrate de que este campo se esté seteando correctamente
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
    }
  });*/ //esta anterior auth register funcionaba bien sin calificar
  
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
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
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
      
      
      // Return user without password
      //const { password: _, ...userWithoutPassword } = user;
      //res.json(userWithoutPassword);
      // Return user without password but WITH role
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      role: user.role // Asegúrate de incluir el rol
    });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });

      
    }//fin deep seek
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
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });
    }
  });
  /*
  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });*/
  //chat gpt cierra sesion totalmente sin cookies
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
  
  //fin chat gpt cierra sesion totalmente sin cookies
  
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
      
      // En un sistema real, esto tendría más validaciones
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
      
      const quizzes = await storage.getQuizzesByCategory(categoryId);
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
  
  // Quiz questions endpoint
  apiRouter.get("/quizzes/:quizId/questions", async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);
    
    if (isNaN(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }
    
    // Check authentication
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const questions = await storage.getQuestionsByQuiz(quizId);
      
      // Generate actual questions with random values
      const randomizedQuestions = await Promise.all(questions.map(async (question) => {
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
      
      res.json(progress);
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
  
  try {
    // Parsear y validar los datos
    const progressData = insertStudentProgressSchema.parse({
      ...req.body,
      userId
    });

    // Verificar progreso existente
    const existingProgress = await storage.getStudentProgressByQuiz(userId, progressData.quizId);
    
    if (existingProgress) {
      // Actualizar progreso existente
      const updatedProgress = await storage.updateStudentProgress(
        existingProgress.id, 
        progressData
      );
      return res.json(updatedProgress);
    }
    
    // Crear nuevo progreso
    const newProgress = await storage.createStudentProgress(progressData);
    res.status(201).json(newProgress);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid progress data",
        errors: error.errors
      });
    }
    console.error("Progress creation error:", error);
    res.status(500).json({ 
      message: "Error creating/updating progress",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
// fin deep seek mejora active-quiz

  // Student answers endpoint
  apiRouter.post("/answers", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
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
    const role = req.session.role; // Asegúrate que esto está disponible en tu sesión
    const progressId = parseInt(req.params.progressId);
  
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
  
    if (isNaN(progressId)) {
      return res.status(400).json({ message: "Invalid progress ID" });
    }
  
    try {
      console.log("User ID:", userId);
console.log("Role:", role);
console.log("Requested progressId:", progressId);


      let progress;
  
      if (role === "admin") {
        // Admin puede ver cualquier progreso
        const allProgresses = await storage.getAllProgresses(); // Este método debe existir en storage
        console.log("Total progresses found:", allProgresses.length);
        progress = allProgresses.find(p => p.id === progressId);
      } else {
        // Usuario solo puede ver sus propios progresos
        const userProgresses = await storage.getStudentProgress(userId);
        progress = userProgresses.find(p => p.id === progressId);
      }
  
      if (!progress) {
        return res.status(403).json({ message: "Not authorized to view these results" });
      }
  
      const quiz = await storage.getQuiz(progress.quizId);
      const answers = await storage.getStudentAnswersByProgress(progressId);
  
      // Get question details for each answer
      const detailedAnswers = await Promise.all(answers.map(async (answer) => {
        const question = await storage.getQuestion(answer.questionId);
        const answerDetails = answer.answerId ? await storage.getAnswer(answer.answerId) : null;
  
        return {
          ...answer,
          question,
          answerDetails
        };
      }));
  
      res.json({
        progress,
        quiz,
        answers: detailedAnswers
      });
    } catch (error) {
      console.error("Results fetch error:", error);
      res.status(500).json({ message: "Error fetching quiz results" });
    }
  });
  

  // Rutas de administración 
  // Middleware para verificar si el usuario es administrador
  const requireAdmin = async (req: Request, res: Response, next: () => void) => {
    const userId = req.session.userId;
    console.log("🧩 Session userId:", userId);
  
    if (!userId) {
      console.warn("⚠️ Usuario no autenticado");
      return res.status(401).json({ message: "Authentication required" });
    }
  
    try {
      const user = await storage.getUser(userId);
      console.log("👤 Usuario autenticado:", user);
  
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
  
  
  // API para gestionar categorías
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
  console.log("🧪 userId recibido1:", req.params.userId, "➡️ convertido a:", userId);
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
      message: "Error al obtener categorías",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

apiRouter.put("/users/:userId/categories", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { categoryIds } = req.body;
  console.log("🧪 userId recibido2:", req.params.userId, "➡️ convertido a:", userId);
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
    console.error("Error al obtener usuarios con categorías:", error);
    res.status(500).json({ message: "Error al obtener usuarios con categorías" });
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
 //chat gpt asignar cuestionarios a usuarios
// Obtener los quizzes asignados a un usuario
apiRouter.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


// Asignar un quiz a un usuario
apiRouter.post("/admin/users/quizzes", requireAdmin, async (req, res) => {
  console.log("📥 Body recibido en POST /admin/users/quizzes:", req.body);
  const { userId, quizId } = req.body;
  if (!userId || !quizId) return res.status(400).json({ message: "Missing data" });

  try {
    console.log(req.body)
    await storage.assignQuizToUser(userId, quizId);
    res.status(204).end();
  } catch (err) {
    console.error("Error assigning quiz:", err); // <-- Esto lo va a mostrar en consola
    res.status(500).json({ message: "Error assigning quiz", error: String(err) }); // <-- Mostramos el error
  }
});


// Quitar un quiz de un usuario
apiRouter.delete("/admin/users/quizzes", requireAdmin, async (req, res) => {
  const { userId, quizId } = req.body;
  if (!userId || !quizId) return res.status(400).json({ message: "Missing data" });

  try {
    await storage.removeQuizFromUser(userId, quizId);
    res.status(204).end();
  } catch (err) {
    console.error("Error removing quiz:", err);
    res.status(500).json({ message: "Error removing quiz" });
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
    
        
    const userId = req.user.id;
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
    
       
    const userId = req.user.id;
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
    res.status(500).json({ 
      code: "TRAINING_ERROR",
      message: "Error al obtener preguntas",
      details: err.message 
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
      let createdAnswers = [];
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
      res.status(500).json({ 
        message: "Error creating question",
        error: error.message 
      });
    }
  });
  //fin deep seek me ayuda error crear preguntas

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


  console.log("📥 Datos recibidos en /api/quiz-submission:", {
    userId,
    quizId,
    score,
    progressId,
    typeofScore: typeof score,
  });

  if (!userId || !quizId || typeof score !== "number" || !progressId) {
    return res.status(400).json({ error: "Datos incompletos o inválidos" });
  }

  try {
    await storage.saveQuizSubmission({ userId, quizId, score, progressId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error guardando quiz submission:", error);
    res.status(500).json({ error: "Error interno" });
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



  //fin chat gpt calificaciones

  const httpServer = createServer(app);
  return httpServer;
}
