import { 
  users, categories, quizzes, questions, answers, studentProgress, studentAnswers,
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Quiz, type InsertQuiz,
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type StudentProgress, type InsertStudentProgress,
  type StudentAnswer, type InsertStudentAnswer
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { IStorage } from "./storage";
import { userQuizzes } from '@shared/schema';
import { drizzle } from "drizzle-orm/postgres-js";


//chat gpt dashboard personalizado
import { userCategories } from "../shared/schema";
//fin chat gpt dashboard personalizado


export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
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
  
  // Quiz methods
  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes);
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
    })
    .from(userQuizzes)
    .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
    .where(eq(userQuizzes.userId, userId));

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
    const result = await db.insert(studentProgress).values(progress).returning();
    return result[0];
  }
  
  async updateStudentProgress(id: number, progress: Partial<StudentProgress>): Promise<StudentProgress> {
    // Asegurarse de que el progreso existe
    const existingProgress = await this.getStudentProgress(id);
    if (!existingProgress) {
      throw new Error(`Student progress with id ${id} not found`);
    }
    
    // Actualizar el progreso
    const result = await db.update(studentProgress)
      .set(progress)
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
}