import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  quizzes, Quiz, InsertQuiz,
  questions, Question, InsertQuestion,
  answers, Answer, InsertAnswer,
  studentProgress, StudentProgress, InsertStudentProgress,
  studentAnswers, StudentAnswer, InsertStudentAnswer,
  questionReports, QuestionReport, InsertQuestionReport
} from "../shared/schema.js";
import { db } from './db.js';
import { Child } from '../shared/quiz-types.js';

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Quiz methods
  getQuizzes(): Promise<Quiz[]>;
  getPublicQuizzes(): Promise<Quiz[]>;
  getQuizzesByCategory(categoryId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz>;
  deleteQuiz(id: number): Promise<void>;

  // User Quiz Assignment
  getUserQuizzes(userId: number): Promise<Quiz[]>;
  assignQuizToUser(userId: number, quizId: number): Promise<void>;
  removeQuizFromUser(userId: number, quizId: number): Promise<void>;

  // Question methods
  getQuestionsByQuiz(quizId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<Question>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;

  // Answer methods
  getAnswersByQuestion(questionId: number): Promise<Answer[]>;
  getAnswer(id: number): Promise<Answer | undefined>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer>;
  deleteAnswer(id: number): Promise<void>;

  // Student Progress methods
  getStudentProgress(userId: number): Promise<StudentProgress[]>;
  getStudentProgressByQuiz(userId: number, quizId: number): Promise<StudentProgress | undefined>;
  createStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  updateStudentProgress(id: number, progress: Partial<StudentProgress>): Promise<StudentProgress>;
  deleteStudentProgress(id: number): Promise<void>;

  // Student Answer methods
  getStudentAnswersByProgress(progressId: number): Promise<StudentAnswer[]>;
  createStudentAnswer(answer: InsertStudentAnswer): Promise<StudentAnswer>;

  // Extended methods
  getAllUsers(): Promise<User[]>;
  getUsersAssignedToQuiz(quizId: number): Promise<any[]>;
  getCategoriesByUserId(userId: number): Promise<any[]>;
  getQuizzesByUserId(userId: number): Promise<any[]>;
  updateUserCategories(userId: number, categoryIds: number[]): Promise<void>;

  // Subcategory methods
  getAllSubcategories(): Promise<any[]>;
  getSubcategoriesByCategory(categoryId: number): Promise<any[]>;
  createSubcategory(data: { name: string; categoryId: number; description?: string; youtube_sublink?: string | null }): Promise<any>;
  deleteSubcategory(id: number): Promise<void>;
  updateSubcategory(id: number, name: string, description?: string, youtube_sublink?: string | null): Promise<void>;
  getQuizzesBySubcategory(subcategoryId: number): Promise<Quiz[]>;
  getTrainingQuestionsByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<any[]>;

  // Parent/Child methods
  registerParentWithChild(parent: any, child: any): Promise<any>;
  getChildByParentId(parentId: number): Promise<Child | null>;

  // Dashboard/Admin methods
  getUserProgressSummary(): Promise<any[]>;
  countAssignedQuizzes(): Promise<number>;
  countCompletedQuizzes(): Promise<number>;
  countPendingReview(): Promise<number>;
  getRecentPendingSubmissions(): Promise<any[]>;

  // Quiz Submission/Feedback methods
  saveQuizSubmission(submission: any): Promise<void>;
  getQuizSubmissionsForAdmin(): Promise<any[]>;
  getAllQuizSubmissions(): Promise<any[]>;
  saveQuizFeedback(feedback: { progressId: number | string; text: string }): Promise<void>;
  getQuizFeedback(progressId: number): Promise<any>;
  markSubmissionAsReviewed(progressId: number): Promise<void>;
  deleteSubmissionByProgressId(progressId: number): Promise<void>;
  getQuizResults(progressId: number): Promise<any>;
  getStudentAnswers(progressId: number): Promise<any>;
  backfillQuizSubmissions(): Promise<void>;

  // Dashboard Analytics
  getStudentsAtRisk(limit?: number): Promise<any[]>;
  getRecentActivity(limit?: number): Promise<any[]>;

  // Search methods
  searchUsers(query: string): Promise<User[]>;
  searchQuizzes(query: string): Promise<Quiz[]>;

  // Hint methods
  updateUserHintCredits(userId: number, credits: number): Promise<void>;
  updateQuestionHints(questionId: number, hints: { hint1?: string, hint2?: string, hint3?: string, explanation?: string }): Promise<void>;
  updateUserTourStatus(userId: number, tourType: string): Promise<void>;

  // Question Reports
  createQuestionReport(report: InsertQuestionReport): Promise<QuestionReport>;
  getQuestionReports(): Promise<QuestionReport[]>;
  updateQuestionReportStatus(id: number, status: string): Promise<QuestionReport>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private quizzes: Map<number, Quiz>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private studentProgress: Map<number, StudentProgress>;
  private studentAnswers: Map<number, StudentAnswer>;

  private userId: number;
  private categoryId: number;
  private quizId: number;
  private questionId: number;
  private answerId: number;
  private progressId: number;
  private studentAnswerId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.quizzes = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.studentProgress = new Map();
    this.studentAnswers = new Map();

    this.userId = 1;
    this.categoryId = 1;
    this.quizId = 1;
    this.questionId = 1;
    this.answerId = 1;
    this.progressId = 1;
    this.studentAnswerId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  // Dummy implementations for extended methods
  async getAllUsers(): Promise<User[]> { return Array.from(this.users.values()); }
  async getUsersAssignedToQuiz(quizId: number): Promise<any[]> { return []; }
  async getCategoriesByUserId(userId: number): Promise<any[]> { return []; }
  async getQuizzesByUserId(userId: number): Promise<any[]> { return []; }
  async updateUserCategories(userId: number, categoryIds: number[]): Promise<void> { }

  async getAllSubcategories(): Promise<any[]> { return []; }
  async getSubcategoriesByCategory(categoryId: number): Promise<any[]> { return []; }
  async createSubcategory(data: any): Promise<any> { throw new Error("Not implemented"); }
  async deleteSubcategory(id: number): Promise<void> { }
  async updateSubcategory(id: number, name: string): Promise<void> { }
  async getQuizzesBySubcategory(subcategoryId: number): Promise<Quiz[]> { return []; }
  async getTrainingQuestionsByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<any[]> { return []; }

  async registerParentWithChild(parent: any, child: any): Promise<any> { throw new Error("Not implemented"); }
  async getChildByParentId(parentId: number): Promise<Child | null> { return null; }

  async getUserProgressSummary(): Promise<any[]> { return []; }
  async countAssignedQuizzes(): Promise<number> { return 0; }
  async countCompletedQuizzes(): Promise<number> { return 0; }
  async countPendingReview(): Promise<number> { return 0; }
  async getRecentPendingSubmissions(): Promise<any[]> { return []; }

  async saveQuizSubmission(submission: any): Promise<void> { }
  async getQuizSubmissionsForAdmin(): Promise<any[]> { return []; }
  async getAllQuizSubmissions(): Promise<any[]> { return []; }
  async saveQuizFeedback(feedback: any): Promise<void> { }
  async getQuizFeedback(progressId: number): Promise<any> { return null; }
  async markSubmissionAsReviewed(progressId: number): Promise<void> { }
  async deleteSubmissionByProgressId(progressId: number): Promise<void> { }
  async getQuizResults(progressId: number): Promise<any> { return null; }
  async getStudentAnswers(progressId: number): Promise<any> { return []; }

  async getStudentsAtRisk(limit: number = 5): Promise<any[]> { return []; }
  async getRecentActivity(limit: number = 10): Promise<any[]> { return []; }

  async searchUsers(query: string): Promise<User[]> { return []; }
  async searchQuizzes(query: string): Promise<Quiz[]> { return []; }



  private async initializeData() {
    try {
      // Create default admin user
      const admin = await this.createUser({
        username: "admin",
        password: "admin123",
        name: "Administrador",
        email: "admin@alanmath.com"
      });

      // Create sample student
      const student = await this.createUser({
        username: "estudiante",
        password: "estudiante123",
        name: "María González",
        email: "maria@example.com"
      });

      // Create categories
      const algebra = await this.createCategory({
        name: "Álgebra",
        description: "Ecuaciones, polinomios y sistemas lineales",
        colorClass: "primary"
      });

      const geometria = await this.createCategory({
        name: "Geometría",
        description: "Figuras, ángulos y teoremas básicos",
        colorClass: "secondary"
      });

      const calculo = await this.createCategory({
        name: "Cálculo",
        description: "Límites, derivadas e integrales",
        colorClass: "accent"
      });

      // Create quizzes for Algebra
      const ecuacionesQuiz = await this.createQuiz({
        title: "Ecuaciones de primer grado",
        description: "Resuelve ecuaciones lineales con una incógnita.",
        categoryId: algebra.id,
        timeLimit: 15,
        difficulty: "basic",
        totalQuestions: 10
      });

      const sistemasQuiz = await this.createQuiz({
        title: "Sistemas de ecuaciones",
        description: "Resuelve sistemas lineales de dos ecuaciones.",
        categoryId: algebra.id,
        timeLimit: 20,
        difficulty: "intermediate",
        totalQuestions: 8
      });

      const polinomiosQuiz = await this.createQuiz({
        title: "Polinomios",
        description: "Operaciones con polinomios y factorización.",
        categoryId: algebra.id,
        timeLimit: 25,
        difficulty: "intermediate",
        totalQuestions: 12
      });

      // Create geometry quizzes
      const triangulosQuiz = await this.createQuiz({
        title: "Triángulos",
        description: "Propiedades y cálculos con triángulos.",
        categoryId: geometria.id,
        timeLimit: 20,
        difficulty: "basic",
        totalQuestions: 10
      });

      const circulosQuiz = await this.createQuiz({
        title: "Círculos y áreas",
        description: "Cálculo de áreas y perímetros.",
        categoryId: geometria.id,
        timeLimit: 25,
        difficulty: "intermediate",
        totalQuestions: 8
      });

      // Create calculus quizzes
      const limitesQuiz = await this.createQuiz({
        title: "Límites",
        description: "Cálculo y propiedades de límites.",
        categoryId: calculo.id,
        timeLimit: 30,
        difficulty: "intermediate",
        totalQuestions: 10
      });

      const derivadasQuiz = await this.createQuiz({
        title: "Derivadas",
        description: "Reglas de derivación y aplicaciones.",
        categoryId: calculo.id,
        timeLimit: 35,
        difficulty: "advanced",
        totalQuestions: 12
      });

    } catch (error) {
      console.error("Error inicializando datos:", error);
    }

    // Crear preguntas y respuestas para el quiz de ecuaciones
    try {
      const quizzes = await this.getQuizzesByCategory(1); // Álgebra

      if (quizzes.length > 0) {
        const ecuacionesQuiz = quizzes[0];

        // Create sample questions
        const q1 = await this.createQuestion({
          quizId: ecuacionesQuiz.id,
          content: "Resuelve la siguiente ecuación: {a}x + {b} = {c}",
          type: "equation",
          difficulty: 1,
          points: 5,
          variables: {
            a: { min: 1, max: 10 },
            b: { min: 1, max: 20 },
            c: { min: 10, max: 50 }
          }
        });

        await this.createAnswer({
          questionId: q1.id,
          content: "x = {answer}",
          isCorrect: true,
          explanation: "Para resolver {a}x + {b} = {c}, despejamos x: {a}x = {c} - {b}, entonces x = ({c} - {b}) / {a}"
        });

        await this.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer1}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Debes despejar x correctamente."
        });

        await this.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer2}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Recuerda que debes despejar la variable x."
        });

        await this.createAnswer({
          questionId: q1.id,
          content: "x = {wrongAnswer3}",
          isCorrect: false,
          explanation: "Esta respuesta es incorrecta. Revisa tus cálculos."
        });

        const q2 = await this.createQuestion({
          quizId: ecuacionesQuiz.id,
          content: "Resuelve: {a}x - {b} = {c}",
          type: "equation",
          difficulty: 1,
          points: 5,
          variables: {
            a: { min: 1, max: 10 },
            b: { min: 1, max: 20 },
            c: { min: -10, max: 30 }
          }
        });

        // Create sample progress
        const estudiantes = await this.getUsers();
        if (estudiantes.length > 1) {
          const maria = estudiantes[1];

          await this.createStudentProgress({
            userId: maria.id,
            quizId: ecuacionesQuiz.id,
            status: "completed",
            score: 90,
            completedQuestions: 10,
            timeSpent: 720,
            completedAt: new Date()
          });

          const quizzesList = await this.getQuizzes();
          if (quizzesList.length > 1) {
            await this.createStudentProgress({
              userId: maria.id,
              quizId: quizzesList[1].id,
              status: "in_progress",
              completedQuestions: 4,
              timeSpent: 480,
            });
          }
        }
      } else {
        console.error("No se encontraron quizzes de álgebra para crear preguntas");
      }
    } catch (error) {
      console.error("Error creando preguntas de muestra:", error);
    }
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      role: insertUser.role ?? "student",
      createdAt: new Date().toISOString(),
      hintCredits: 50,
      tourStatus: {}
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = {
      ...category,
      id,
      youtubeLink: category.youtubeLink ?? null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Quiz methods
  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    const catId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    const result = Array.from(this.quizzes.values()).filter(
      (quiz) => {
        const quizCatId = typeof quiz.categoryId === 'string' ? parseInt(quiz.categoryId) : quiz.categoryId;
        return quizCatId === catId;
      }
    );
    return result;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizId++;
    const categoryId = typeof quiz.categoryId === 'string' ? parseInt(quiz.categoryId) : quiz.categoryId;
    const subcategoryId = quiz.subcategoryId ?? null;

    const newQuiz: Quiz = {
      ...quiz,
      id,
      categoryId,
      subcategoryId,
      isPublic: quiz.isPublic ?? null,
      url: null
    };

    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  // Question methods
  async getQuestionsByQuiz(quizId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.quizId === quizId
    );
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const newQuestion: Question = {
      id,
      difficulty: question.difficulty,
      type: question.type,
      quizId: question.quizId,
      content: question.content,
      points: question.points ?? 0,
      variables: question.variables ?? {},
      imageUrl: question.imageUrl ?? null,
      explanation: null,
      hint1: null,
      hint2: null,
      hint3: null,
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  // Answer methods
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.questionId === questionId
    );
  }

  async getAnswer(id: number): Promise<Answer | undefined> {
    return this.answers.get(id);
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = this.answerId++;
    const newAnswer: Answer = {
      id,
      content: answer.content,
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
      explanation: answer.explanation ?? null,
    };
    this.answers.set(id, newAnswer);
    return newAnswer;
  }

  // Student Progress methods
  async getStudentProgress(userId: number): Promise<StudentProgress[]> {
    return Array.from(this.studentProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async getStudentProgressByQuiz(userId: number, quizId: number): Promise<StudentProgress | undefined> {
    return Array.from(this.studentProgress.values()).find(
      (progress) => progress.userId === userId && progress.quizId === quizId
    );
  }

  async createStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress> {
    const id = this.progressId++;
    const newProgress: StudentProgress = {
      id,
      status: progress.status,
      quizId: progress.quizId,
      userId: progress.userId,
      score: progress.score ?? null,
      completedQuestions: progress.completedQuestions ?? null,
      timeSpent: progress.timeSpent ?? null,
      completedAt: progress.completedAt?.toISOString() ?? null,
      hintsUsed: 0,
      isMini: false,
      assignedQuestionIds: null
    };
    this.studentProgress.set(id, newProgress);
    return newProgress;
  }

  async updateStudentProgress(id: number, progress: Partial<StudentProgress>): Promise<StudentProgress> {
    const existingProgress = this.studentProgress.get(id);
    if (!existingProgress) {
      throw new Error(`Student progress with id ${id} not found`);
    }
    const updatedProgress: StudentProgress = { ...existingProgress, ...progress };
    this.studentProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  async deleteStudentProgress(id: number): Promise<void> {
    this.studentProgress.delete(id);
  }

  // Student Answer methods
  async getStudentAnswersByProgress(progressId: number): Promise<StudentAnswer[]> {
    return Array.from(this.studentAnswers.values()).filter(
      (answer) => answer.progressId === progressId
    );
  }

  async createStudentAnswer(answer: InsertStudentAnswer): Promise<StudentAnswer> {
    const id = this.studentAnswerId++;
    const newAnswer: StudentAnswer = {
      id,
      variables: answer.variables ?? {},
      questionId: answer.questionId,
      isCorrect: answer.isCorrect ?? null,
      timeSpent: answer.timeSpent ?? null,
      progressId: answer.progressId,
      answerId: answer.answerId ?? null,
      hintsUsed: 0
    };
    this.studentAnswers.set(id, newAnswer);
    return newAnswer;
  }

  // Methods not implemented in MemStorage
  async updateCategory(id: number, category: Partial<Category>): Promise<Category> { throw new Error("Method not implemented."); }
  async deleteCategory(id: number): Promise<void> { throw new Error("Method not implemented."); }
  async getPublicQuizzes(): Promise<Quiz[]> { throw new Error("Method not implemented."); }
  async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> { throw new Error("Method not implemented."); }
  async deleteQuiz(id: number): Promise<void> { throw new Error("Method not implemented."); }
  async getUserQuizzes(userId: number): Promise<Quiz[]> { throw new Error("Method not implemented."); }
  async assignQuizToUser(userId: number, quizId: number): Promise<void> { throw new Error("Method not implemented."); }
  async removeQuizFromUser(userId: number, quizId: number): Promise<void> { throw new Error("Method not implemented."); }
  async updateQuestion(id: number, question: Partial<Question>): Promise<Question> { throw new Error("Method not implemented."); }
  async deleteQuestion(id: number): Promise<void> { throw new Error("Method not implemented."); }
  async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer> { throw new Error("Method not implemented."); }
  async deleteAnswer(id: number): Promise<void> { throw new Error("Method not implemented."); }
  async backfillQuizSubmissions(): Promise<void> { throw new Error("Method not implemented."); }
  async updateUserHintCredits(userId: number, credits: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.hintCredits = credits;
      this.users.set(userId, user);
    }
  }
  async updateQuestionHints(questionId: number, hints: any): Promise<void> { }
  async updateUserTourStatus(userId: number, tourType: string): Promise<void> { }

  // Question Reports
  async createQuestionReport(report: InsertQuestionReport): Promise<QuestionReport> { throw new Error("Method not implemented."); }
  async getQuestionReports(): Promise<QuestionReport[]> { return []; }
  async updateQuestionReportStatus(id: number, status: string): Promise<QuestionReport> { throw new Error("Method not implemented."); }
}

import { DatabaseStorage } from "./database-storage.js";

export const storage = new DatabaseStorage(db);

export const getUsersAssignedToQuiz = async (quizId: number) => {
  try {
    return await storage.getUsersAssignedToQuiz(quizId);
  } catch (error) {
    console.error("Error in getUsersAssignedToQuiz:", error);
    throw error;
  }
};

export const getCategoriesByUserId = async (userId: number) => {
  try {
    return await storage.getCategoriesByUserId(userId);
  } catch (error) {
    console.error("Error en getCategoriesByUserId:", error);
    throw error;
  }
};

export const getQuizzesByUserId = async (userId: number) => {
  try {
    return await storage.getQuizzesByUserId(userId);
  } catch (error) {
    console.error("Error en getQuizzesByUserId:", error);
    throw error;
  }
};
