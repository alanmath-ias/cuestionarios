import { 
  users, categories, quizzes, questions, answers, studentProgress, studentAnswers,
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Quiz, type InsertQuiz,
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type StudentProgress, type InsertStudentProgress,
  type StudentAnswer, type InsertStudentAnswer,
} from "@shared/schema";

import { db } from "./db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { IStorage } from "./storage";
import { userQuizzes } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import type { QuizResult } from "@/shared/quiz-types";
import type { QuizAnswerResult } from "@/shared/quiz-types";

//chat gpt calificaciones
import { quizSubmissions } from "@shared/schema";
import { quizFeedback } from "@shared/schema"; 

//chat gpt dashboard personalizado
import { userCategories } from "../shared/schema";
import { subcategories, Subcategory } from "../shared/schema";

 // Asegúrate que esté importado

 interface QuizWithRelations extends Quiz {
  category?: Category | null;
  subcategory?: Subcategory | null;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserById(userId: number) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
  
    return result.length > 0 ? result[0] : undefined;
  }
  

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const result = await db.update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }
  
  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
  //subcategory methods
  async getAllSubcategories() {
    return db.select().from(subcategories).leftJoin(categories, eq(subcategories.categoryId, categories.id));
  }
  
  async getSubcategoriesByCategory(categoryId: number) {
    return db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
  }
  
  async createSubcategory({ name, categoryId, description }: { name: string; categoryId: number; description?: string }) {
    return db.insert(subcategories).values({ name, categoryId, description }).returning();
  }
  
  
  async deleteSubcategory(id: number) {
    return db.delete(subcategories).where(eq(subcategories.id, id));
  }
  
  async updateSubcategory(id: number, name: string, description?: string) {
    await db
      .update(subcategories)
      .set({ name, description })
      .where(eq(subcategories.id, id));
  }
  
  //Entrenamiento por subcategorias:
  async getTrainingQuestionsByCategoryAndSubcategory(categoryId: number, subcategoryId: number) {
    console.log('🔍 Verificando quizzes para:', { categoryId, subcategoryId });
    
    const quizzesInCategoryAndSubcategory = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(
        and(
          eq(quizzes.categoryId, categoryId),
          eq(quizzes.subcategoryId, subcategoryId)
        )
      )
      .catch(err => {
        console.error('❌ Error en consulta quizzes:', err);
        throw err;
      });
  
    console.log('📊 Quizzes encontrados:', quizzesInCategoryAndSubcategory);
  
    if (quizzesInCategoryAndSubcategory.length === 0) {
      console.warn('⚠️ No hay quizzes para:', { categoryId, subcategoryId });
      return [];
    }
  
    const quizIds = quizzesInCategoryAndSubcategory.map(q => q.id);
  
    // 2. Obtener preguntas asociadas a esos quizzes
    const questionsList = await db
      .select({
        id: questions.id,
        content: questions.content,
        type: questions.type,
        difficulty: questions.difficulty,
        points: questions.points,
        quizId: questions.quizId, // Asegurarnos de incluir quizId
      })
      .from(questions)
      .where(inArray(questions.quizId, quizIds));
  
    if (questionsList.length === 0) {
      return [];
    }
  
    // 3. Obtener opciones de student_answers
    const questionIds = questionsList.map(q => q.id);
    const optionsRaw = await db
      .select({
        id: answers.id,
        questionId: answers.questionId,
        text: answers.content,
        isCorrect: answers.isCorrect,
      })
      .from(answers)
      .where(inArray(answers.questionId, questionIds));
  
    // 4. Asociar opciones a cada pregunta
    const questionsWithOptions = questionsList.map(q => ({
      ...q,
      options: optionsRaw
        .filter(opt => opt.questionId === q.id)
        .map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
    }));
  
    // 5. Aleatorizar y limitar a 20 preguntas
    return questionsWithOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
  }
  

  // Quiz methods
  /*async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes);
  }*///esta funcionaba perfecto antes de la navegacion con subcategorias
  async getQuizzes(): Promise<QuizWithRelations[]> {
    const results = await db.select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      categoryId: quizzes.categoryId,
      subcategoryId: quizzes.subcategoryId,
      timeLimit: quizzes.timeLimit,
      difficulty: quizzes.difficulty,
      totalQuestions: quizzes.totalQuestions,
      isPublic: quizzes.isPublic,
      category: categories,
      subcategory: subcategories
    })
    .from(quizzes)
    .leftJoin(categories, eq(quizzes.categoryId, categories.id))
    .leftJoin(subcategories, eq(quizzes.subcategoryId, subcategories.id));
  
    return results;
  }

  async getQuizzesBySubcategory(subcategoryId: number): Promise<Quiz[]> {
    return await db.select()
      .from(quizzes)
      .where(eq(quizzes.subcategoryId, subcategoryId));
  }
  
  async getPublicQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.isPublic, true));
  }
  
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.categoryId, categoryId));
  }
  
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }
  
  async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
    const result = await db.update(quizzes)
      .set(quiz)
      .where(eq(quizzes.id, id))
      .returning();
    return result[0];
  }
  
  async deleteQuiz(id: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }
  
  //chat gpt cuestionarios a usuarios

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async getUserQuizzes(userId: number): Promise<Quiz[]> {
    const result = await db
      .select()
      .from(quizzes)
      .innerJoin(studentProgress, eq(quizzes.id, studentProgress.quizId))
      .where(eq(studentProgress.userId, userId));
      
    // Como devuelve un array de objetos con .quizzes y .studentProgress, sacamos solo los quices
    return result.map(row => row.quizzes);
  }
   
  constructor(private readonly db: ReturnType<typeof drizzle>) {}

  async assignQuizToUser(userId: number, quizId: number) {
    try {
      await this.db.insert(userQuizzes).values({ userId, quizId }).onConflictDoNothing();
    } catch (error) {
      console.error("DB Error in assignQuizToUser:", error);
      throw error;
    }
  }
  
  
  async removeQuizFromUser(userId: number, quizId: number) {
    await db.delete(userQuizzes).where(
      and(eq(userQuizzes.userId, userId), eq(userQuizzes.quizId, quizId))
    );
  }
  

  async getUsersAssignedToQuiz(quizId: number) {
    const result = await this.db
      .select()
      .from(userQuizzes)
      .where(eq(userQuizzes.quizId, quizId));
    return result;
  }



  //fin chat gpt cuestionarios a usuarios

//chat gpt dashboar personalizado
async getCategoriesByUserId(userId: number) {
  const result = await this.db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(userCategories)
    .innerJoin(categories, eq(userCategories.categoryId, categories.id))
    .where(eq(userCategories.userId, userId));

  return result;
}

async getQuizzesByUserId(userId: number) {
  const result = await this.db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      categoryId: quizzes.categoryId,
      difficulty: quizzes.difficulty,
      status: studentProgress.status,
      reviewed: quizSubmissions.reviewed,
      progressId: studentProgress.id, // <- Aquí está el cambio clave
      completedAt: studentProgress.completedAt, // <- Añade esta línea
    })
    .from(userQuizzes)
    .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
    .leftJoin(studentProgress, and(
      eq(studentProgress.userId, userId),
      eq(studentProgress.quizId, quizzes.id)
    ))
    .leftJoin(quizSubmissions, and(
      eq(quizSubmissions.userId, userId),
      eq(quizSubmissions.quizId, quizzes.id)
    ))
    .where(eq(userQuizzes.userId, userId));
   // .orderBy(desc(quizzes.id)) la idea es que sean llevados en orden, revisar esto mas adelante
  return result;
}


//fin chat gpt dashboard

  // Question methods
  async getQuestionsByQuiz(quizId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }
  
  async getQuestion(id: number): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question).returning();
    return result[0];
  }
  
  async updateQuestion(id: number, question: Partial<Question>): Promise<Question> {
    const result = await db.update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return result[0];
  }
  
  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }
  
  // Answer methods
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.questionId, questionId));
  }
  
  async getAnswer(id: number): Promise<Answer | undefined> {
    const result = await db.select().from(answers).where(eq(answers.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const result = await db.insert(answers).values(answer).returning();
    return result[0];
  }
  
  async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer> {
    const result = await db.update(answers)
      .set(answer)
      .where(eq(answers.id, id))
      .returning();
    return result[0];
  }
  
  async deleteAnswer(id: number): Promise<void> {
    await db.delete(answers).where(eq(answers.id, id));
  }
  
  // Student Progress methods
  async getStudentProgress(userId: number): Promise<StudentProgress[]> {
    return await db.select().from(studentProgress).where(eq(studentProgress.userId, userId));
  }
  
  async getStudentProgressByQuiz(userId: number, quizId: number): Promise<StudentProgress | undefined> {
    const result = await db.select().from(studentProgress).where(
      and(
        eq(studentProgress.userId, userId),
        eq(studentProgress.quizId, quizId)
      )
    );
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress> {
    // Preparar los datos para Drizzle
    const insertData = {
      ...progress,
      completedAt: progress.completedAt
        ? new Date(progress.completedAt).toISOString()
        : null
    };
    
    const result = await db.insert(studentProgress)
      .values(insertData)
      .returning();
    
    return result[0];
    
  }
  
  async updateStudentProgress(id: number, progress: Partial<StudentProgress>): Promise<StudentProgress> {
    // Verificar que el progreso existe
    const existingProgress = await this.getStudentProgress(id);
    if (!existingProgress) {
      throw new Error(`Student progress with id ${id} not found`);
    }
    
    // Preparar los datos para Drizzle
    const updateData = {
  ...progress,
  completedAt: progress.completedAt
    ? new Date(progress.completedAt).toISOString()
    : null
};

const result = await db.update(studentProgress)
  .set(updateData)
  .where(eq(studentProgress.id, id))
  .returning();

return result[0];

  }
  
  // Student Answer methods
  async getStudentAnswersByProgress(progressId: number): Promise<StudentAnswer[]> {
    return await db.select().from(studentAnswers).where(eq(studentAnswers.progressId, progressId));
  }
  
  async createStudentAnswer(answer: InsertStudentAnswer): Promise<StudentAnswer> {
    const result = await db.insert(studentAnswers).values(answer).returning();
    return result[0];
  }

//deep seek respuestas correctas en quiz-results creo que puedo eliminar esto porque al final se uso el endppint de quiz
async getQuizResults(progressId: number): Promise<QuizResult | null> {
  // 1. Definir tipo explícito para la consulta
  type ProgressWithRelations = {
    id: number;
    userId: number;
    quizId: number;
    status: 'not_started' | 'in_progress' | 'completed';
    score?: number;
    completedQuestions: number;
    timeSpent?: number;
    completedAt?: Date;
    quiz: {
      id: number;
      title: string;
      description: string;
      categoryId: number;
      timeLimit: number;
      difficulty: string;
      totalQuestions: number;
      isPublic: boolean | null;    // Añadir esto
      subcategoryId: number | null // Añadir esto
    };
    answers: Array<{
      id: number;
      progressId: number;
      questionId: number;
      answerId: number | null;
      isCorrect: boolean;
      variables: Record<string, number>;
      timeSpent: number;
      question: {
        id: number;
        content: string;
        type: string;
        difficulty: number;
        variables: Record<string, number>; // Añadido
        quizId: number; // Añadido
        points: number;
        imageUrl: string | null; // Añadido
      };
      answerDetails: {
        id: number;
        questionId: number; // Añadido
        content: string;
        isCorrect: boolean;
        explanation: string | null;
      } | null;
    }>;
  };

  // 2. Realizar consulta con tipo explícito
  // 2. Modifica la consulta para incluir todos los campos necesarios
const progressWithRelations = await db.query.studentProgress.findFirst({
  where: eq(studentProgress.id, progressId),
  with: {
    quiz: {
      columns: {
        id: true,
        title: true,
        description: true,
        categoryId: true,
        timeLimit: true,
        difficulty: true,
        totalQuestions: true,
        isPublic: true,
        subcategoryId: true
      }
    },
    answers: {
      with: {
        question: true,
        answerDetails: true
      }
    }
  }
}) as unknown as ProgressWithRelations | null;

  if (!progressWithRelations || !progressWithRelations.answers) return null;

  // 3. Procesar respuestas con tipo seguro
  const enrichedAnswers: QuizAnswerResult[] = await Promise.all(
    progressWithRelations.answers.map(async (answer): Promise<QuizAnswerResult> => {
      const correctAnswer = await db.query.answers.findFirst({
        where: and(
          eq(answers.questionId, answer.questionId),
          eq(answers.isCorrect, true)
        )
      })?? null;

      return {
        ...answer,
        question: answer.question,
        answerDetails: answer.answerDetails,
        correctAnswer
      };
    })
  );

  // 4. Retornar estructura tipada correctamente
  return {
    progress: {
      id: progressWithRelations.id,
      userId: progressWithRelations.userId,
      quizId: progressWithRelations.quizId,
      status: progressWithRelations.status,
      score: progressWithRelations.score ?? null,
      completedQuestions: progressWithRelations.completedQuestions,
      timeSpent: progressWithRelations.timeSpent ?? null,
      completedAt: progressWithRelations.completedAt?.toISOString() ?? null
    },
    quiz: progressWithRelations.quiz,
    answers: enrichedAnswers
  };
}
//fin deep seek respuestas correctas en quiz-results creo que puedo eliminar esto porque al final se uso el endppint de quiz

//chat gpt calificaciones
//guardar la entrega del quiz desde active-quiz.tsx
async saveQuizSubmission({ userId, quizId, score, progressId }: {
  userId: number;
  quizId: number;
  score: number;
  progressId: number;
}) {
  await db.insert(quizSubmissions).values({
    userId,
    quizId,
    score,
    completedAt: new Date().toISOString(), // Convertir Date a string ISO
    progressId,
  });
}

//recoger la entrega del quiz desde Calificar
async getQuizSubmissionsForAdmin() {
  const results = await db
    .select({
      id: quizSubmissions.id,
      userId: quizSubmissions.userId,
      quizId: quizSubmissions.quizId,
      score: quizSubmissions.score,
      completedAt: quizSubmissions.completedAt,
      reviewed: quizSubmissions.reviewed,
      feedback: quizSubmissions.feedback,
      progressId: quizSubmissions.progressId, // <-- Agregado
      user: {
        name: users.name,
      },
      quiz: {
        title: quizzes.title,
      },
      progress: {
        id: studentProgress.id,
        score: studentProgress.score,
      },
    })
    .from(quizSubmissions)
    .leftJoin(users, eq(users.id, quizSubmissions.userId))
    .leftJoin(quizzes, eq(quizzes.id, quizSubmissions.quizId))
    .leftJoin(studentProgress, eq(studentProgress.id, quizSubmissions.progressId));

  return results;
}

//ver el progreso del estudiante en cuestion:
async getProgressById(progressId: number) {
  return await db.query.studentProgress.findFirst({
    where: (p, { eq }) => eq(p.id, progressId),
  });
}


//recoger todas las entregas del quiz desde Calificar
// En DatabaseStorage.ts

async getAllQuizSubmissions() {
  return await this.db.select().from(quizSubmissions);
}
//funcion para la retroalimentacion de los quiz por medio de un prompt
//insertar el feed back en la base de datos
async saveQuizFeedback({ progressId, text }: { progressId: string; text: string }) {
  try {
    await this.db.insert(quizFeedback).values({
      progressId: Number(progressId),   // Conversión a número
      feedback: text,                   // Asegúrate que 'feedback' sea el nombre correcto del campo
      createdAt: new Date().toISOString(), // Opción 1: Convertir a string ISO
      // O alternativamente:
      // createdAt: sql`now()`,         // Opción 2: Usar función de base de datos
      // createdAt: new Date(),         // Opción 3: Solo si el esquema lo permite
    });
  } catch (err) {
    console.error("❌ Error al insertar feedback:", err);
    throw err;
  }
}




//funcion para que los usuarios vean el feedback:
async getQuizFeedback(progressId: number) {
  const [feedback] = await this.db
    .select()
    .from(quizFeedback)
    .where(eq(quizFeedback.progressId, progressId));
  return feedback;
}


async getAllProgresses() {
  const progresses = await this.db.select().from(studentProgress);
  return progresses;
}

//chat gpt metodos para adminquizresults:
/*async getProgressById(progressId: number) {
  return await this.db.query.studentProgress.findFirst({
    where: (p, { eq }) => eq(p.id, progressId),
  });
}*/



async getStudentAnswers(progressId: number) {
  return await this.db
    .select({
      id: studentAnswers.id,
      questionId: studentAnswers.questionId,
      questionContent: questions.content,
      answerId: studentAnswers.answerId,
      answerContent: answers.content,
      answerExplanation: answers.explanation,
      isCorrect: studentAnswers.isCorrect,
      timeSpent: studentAnswers.timeSpent,
    })
    .from(studentAnswers)
    .leftJoin(questions, eq(studentAnswers.questionId, questions.id))
    .leftJoin(answers, eq(studentAnswers.answerId, answers.id))
    .where(eq(studentAnswers.progressId, progressId));
}

//notificaciones y borrado de las card:
async markSubmissionAsReviewed(progressId: number) {
  await db
    .update(quizSubmissions)
    .set({ reviewed: true })
    .where(eq(quizSubmissions.progressId, progressId));
}

async deleteSubmissionByProgressId(progressId: number) {
  await db
    .delete(quizSubmissions)
    .where(eq(quizSubmissions.progressId, progressId));
}


//fin chat gpt calificaciones

//Metodo para dashboard del admin:
async countAssignedQuizzes() {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userQuizzes);
  return result[0].count;
}

async countCompletedQuizzes() {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(studentProgress)
    .where(eq(studentProgress.status, 'completed'));
  return result[0].count;
}

async countPendingReview() {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(quizSubmissions)
    .where(eq(quizSubmissions.reviewed, false));
  return result[0].count;
}

async getRecentPendingSubmissions() {
  const result = await db
    .select({
      id: quizSubmissions.id,
      userName: users.name,
      quizTitle: quizzes.title,
      submittedAt: quizSubmissions.completedAt,
      progressId: studentProgress.id,
    })
    .from(quizSubmissions)
    .innerJoin(studentProgress, eq(quizSubmissions.progressId, studentProgress.id))
    .innerJoin(users, eq(quizSubmissions.userId, users.id))
    .innerJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
    .where(eq(quizSubmissions.reviewed, false))
    .orderBy(desc(quizSubmissions.completedAt))
    .limit(5);

  return result;
}

async getUserProgressSummary() {
  const allUsers = await this.db.select().from(users);

  const summaries = await Promise.all(
    allUsers.map(async (user) => {
      const assignedQuizzes = await this.db
        .select({ quizId: userQuizzes.quizId })
        .from(userQuizzes)
        .where(eq(userQuizzes.userId, user.id));

      const quizIds = assignedQuizzes.map((q) => q.quizId);

      const progresses = await this.db
        .select({ status: studentProgress.status })
        .from(studentProgress)
        .where(eq(studentProgress.userId, user.id));

      const completed = progresses.filter((p) => p.status === 'completed').length;
      const assigned = quizIds.length;
      const pending = assigned - completed;

      return {
        userId: user.id,
        name: user.name,
        assigned,
        completed,
        pending,
      };
    })
  );

  return summaries;
}



}