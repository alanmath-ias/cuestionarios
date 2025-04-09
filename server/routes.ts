import express, { type Express, Request as ExpressRequest, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertStudentProgressSchema, 
  insertStudentAnswerSchema 
} from "@shared/schema";
import * as expressSession from "express-session";

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
      
      // Authenticate user (simple for demo)
      req.session.userId = user.id;
      
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
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Auto login
      req.session.userId = newUser.id;
      
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
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Error checking authentication" });
    }
  });
  
  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
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
  
  apiRouter.post("/progress", async (req: Request, res: Response) => {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const progressData = insertStudentProgressSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if there's existing progress
      const existingProgress = await storage.getStudentProgressByQuiz(userId, progressData.quizId);
      
      if (existingProgress) {
        // Update existing progress
        const updatedProgress = await storage.updateStudentProgress(existingProgress.id, progressData);
        return res.json(updatedProgress);
      }
      
      // Create new progress
      const newProgress = await storage.createStudentProgress(progressData);
      res.status(201).json(newProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      console.error("Progress creation error:", error);
      res.status(500).json({ message: "Error creating/updating progress" });
    }
  });
  
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
    const progressId = parseInt(req.params.progressId);
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (isNaN(progressId)) {
      return res.status(400).json({ message: "Invalid progress ID" });
    }
    
    try {
      // Verify progress belongs to user
      const progress = await storage.getStudentProgress(userId)
        .then(progresses => progresses.find(p => p.id === progressId));
      
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
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      // En un sistema real, verificaríamos un campo de rol o permisos
      // Por ahora, hacemos que el usuario con ID 1 sea administrador
      if (!user || user.id !== 1) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin check error:", error);
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
  
  apiRouter.post("/admin/questions", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { answers, ...questionData } = req.body;
      
      // Crear pregunta
      const newQuestion = await storage.createQuestion({
        ...questionData,
        quizId: parseInt(questionData.quizId)
      });
      
      // Crear respuestas asociadas
      const createdAnswers = await Promise.all(answers.map((answer: any) => 
        storage.createAnswer({
          ...answer,
          questionId: newQuestion.id
        })
      ));
      
      res.status(201).json({
        ...newQuestion,
        answers: createdAnswers
      });
    } catch (error) {
      console.error("Question creation error:", error);
      res.status(500).json({ message: "Error creating question" });
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

  const httpServer = createServer(app);
  return httpServer;
}
