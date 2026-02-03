import {
  users, categories, quizzes, questions, answers, studentProgress, studentAnswers,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Quiz, type InsertQuiz,
  type Question, type InsertQuestion,
  type Answer, type InsertAnswer,
  type StudentProgress, type InsertStudentProgress,
  type StudentAnswer, type InsertStudentAnswer,
  questionReports, type QuestionReport, type InsertQuestionReport,
  passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken,
} from "../shared/schema.js";

import { db, DbClient } from "./db.js";
import { eq, and, desc, inArray, sql, ilike, or, isNotNull } from "drizzle-orm";
import { IStorage } from "./storage.js";
import { userQuizzes } from "../shared/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import type { QuizResult } from "../shared/quiz-types.js";
import type { QuizAnswerResult } from "../shared/quiz-types.js";

//chat gpt calificaciones
import { quizSubmissions } from "../shared/schema.js";
import { quizFeedback } from "../shared/schema.js";

//chat gpt dashboard personalizado
import { userCategories } from "../shared/schema.js";
import { subcategories, Subcategory } from "../shared/schema.js";
import { parents } from "../shared/schema.js";
import bcrypt from 'bcryptjs';
import { Child } from '../shared/quiz-types.js'; // Ajusta la ruta
import { Pool } from 'pg';

interface QuizWithRelations extends Quiz {
  category?: Category | null;
  subcategory?: Subcategory | null;
}

export class DatabaseStorage implements IStorage {
  constructor(private readonly db: DbClient) { }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const result = await this.db.update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, id));
  }
  //subcategory methods
  async getAllSubcategories() {
    return this.db
      .select({
        id: subcategories.id,
        name: subcategories.name,
        description: subcategories.description,
        categoryId: subcategories.categoryId,
        youtube_sublink: subcategories.youtube_sublink, // Incluye el nuevo campo
      })
      .from(subcategories)
      .leftJoin(categories, eq(subcategories.categoryId, categories.id));
  }

  async getSubcategoriesByCategory(categoryId: number) {
    return this.db
      .select({
        id: subcategories.id,
        name: subcategories.name,
        description: subcategories.description,
        categoryId: subcategories.categoryId,
        youtube_sublink: subcategories.youtube_sublink, // Incluye el nuevo campo
      })
      .from(subcategories)
      .where(eq(subcategories.categoryId, categoryId));
  }

  async createSubcategory({ name, categoryId, description, youtube_sublink }: { name: string; categoryId: number; description?: string; youtube_sublink?: string | null }) {
    return this.db
      .insert(subcategories)
      .values({ name, categoryId, description, youtube_sublink }) // Incluye el nuevo campo
      .returning();
  }


  async deleteSubcategory(id: number): Promise<void> {
    await this.db.delete(subcategories).where(eq(subcategories.id, id));
  }

  async updateSubcategory(id: number, name: string, description?: string, youtube_sublink?: string | null) {
    await this.db
      .update(subcategories)
      .set({ name, description, youtube_sublink }) // Incluye el nuevo campo
      .where(eq(subcategories.id, id));
  }

  //Entrenamiento por subcategorias:
  async getTrainingQuestionsByCategoryAndSubcategory(categoryId: number, subcategoryId: number) {
    //console.log('ðŸ” Verificando quizzes para:', { categoryId, subcategoryId });

    const quizzesInCategoryAndSubcategory = await this.db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(
        and(
          eq(quizzes.categoryId, categoryId),
          eq(quizzes.subcategoryId, subcategoryId)
        )
      )
      .catch(err => {
        console.error('âŒ Error en consulta quizzes:', err);
        throw err;
      });

    //console.log('ðŸ“Š Quizzes encontrados:', quizzesInCategoryAndSubcategory);

    if (quizzesInCategoryAndSubcategory.length === 0) {
      console.warn('âš ï¸ No hay quizzes para:', { categoryId, subcategoryId });
      return [];
    }

    const quizIds = quizzesInCategoryAndSubcategory.map(q => q.id);

    // 2. Obtener preguntas asociadas a esos quizzes
    const questionsList = await this.db
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
    const optionsRaw = await this.db
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
    return await this.db.select().from(quizzes);
  }*///esta funcionaba perfecto antes de la navegacion con subcategorias
  async getQuizzes(): Promise<QuizWithRelations[]> {
    const results = await this.db.select({
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
      subcategory: subcategories,
      url: quizzes.url, // <-- agregado
    })
      .from(quizzes)
      .leftJoin(categories, eq(quizzes.categoryId, categories.id))
      .leftJoin(subcategories, eq(quizzes.subcategoryId, subcategories.id));

    return results;
  }

  async getQuizzesBySubcategory(subcategoryId: number): Promise<Quiz[]> {
    return await this.db.select()
      .from(quizzes)
      .where(eq(quizzes.subcategoryId, subcategoryId));
  }

  async getPublicQuizzes(): Promise<Quiz[]> {
    return await this.db.select().from(quizzes).where(eq(quizzes.isPublic, true));
  }

  async getQuizzesByCategory(categoryId: number, userId?: number): Promise<any[]> {
    if (!userId) {
      return await this.db.select().from(quizzes).where(eq(quizzes.categoryId, categoryId));
    }

    const results = await this.db
      .select()
      .from(quizzes)
      .leftJoin(studentProgress, and(
        eq(quizzes.id, studentProgress.quizId),
        eq(studentProgress.userId, userId)
      ))
      .leftJoin(userQuizzes, and(
        eq(quizzes.id, userQuizzes.quizId),
        eq(userQuizzes.userId, userId)
      ))
      .where(eq(quizzes.categoryId, categoryId));

    return results.map(row => {
      const quiz = row.quizzes;
      const progress = row.student_progress;
      const assignment = row.user_quizzes;

      let status = 'optional';
      if (progress?.status === 'completed') {
        status = 'completed';
      } else if (assignment) {
        status = 'pending';
      }
      return {
        ...quiz,
        userStatus: status,
        score: progress?.score,
        timeSpent: progress?.timeSpent,
        completedAt: progress?.completedAt,
        progressId: progress?.id
      };
    });
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await this.db.select().from(quizzes).where(eq(quizzes.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await this.db.insert(quizzes).values(quiz).returning();
    return result[0];
  }

  async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
    const result = await this.db.update(quizzes)
      .set(quiz)
      .where(eq(quizzes.id, id))
      .returning();
    return result[0];
  }

  async deleteQuiz(id: number): Promise<void> {
    await this.db.delete(quizzes).where(eq(quizzes.id, id));
  }

  //chat gpt cuestionarios a usuarios

  async getUsers(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async updateUserCredits(id: number, credits: number): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ hintCredits: credits })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async updateUserSubscription(userId: number, status: string, plan: string, endDate: string): Promise<User> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        subscriptionStatus: status,
        subscriptionPlan: plan,
        subscriptionEndDate: endDate,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with id ${userId} not found`);
    }

    return updatedUser;
  }

  async getUserQuizzes(userId: number): Promise<Quiz[]> {
    const result = await this.db
      .select()
      .from(quizzes)
      .innerJoin(studentProgress, eq(quizzes.id, studentProgress.quizId))
      .where(eq(studentProgress.userId, userId));

    // Como devuelve un array de objetos con .quizzes y .studentProgress, sacamos solo los quices
    return result.map(row => row.quizzes);
  }

  async assignQuizToUser(userId: number, quizId: number) {
    try {
      await this.db.insert(userQuizzes).values({ userId, quizId }).onConflictDoNothing();
    } catch (error) {
      console.error("DB Error in assignQuizToUser:", error);
      throw error;
    }
  }


  async removeQuizFromUser(userId: number, quizId: number) {
    await this.db.delete(userQuizzes).where(
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
        description: categories.description,
        colorClass: categories.colorClass,
        youtubeLink: categories.youtubeLink,
      })
      .from(userCategories)
      .innerJoin(categories, eq(userCategories.categoryId, categories.id))
      .where(eq(userCategories.userId, userId));

    return result;
  }

  async updateUserCategories(userId: number, categoryIds: number[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(userCategories).where(eq(userCategories.userId, userId));
      if (categoryIds.length > 0) {
        await tx.insert(userCategories).values(
          categoryIds.map((categoryId) => ({
            userId,
            categoryId,
          }))
        );
      }
    });
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
        progressId: studentProgress.id,
        completedQuestions: sql<number>`(SELECT COUNT(DISTINCT question_id) FROM student_answers WHERE student_answers.progress_id = ${studentProgress.id})`.mapWith(Number),
        score: studentProgress.score,
        timeSpent: studentProgress.timeSpent,
        completedAt: studentProgress.completedAt,
        url: quizzes.url,
        feedback: quizFeedback.feedback,
        totalQuestions: quizzes.totalQuestions,
        description: quizzes.description,
        subcategoryId: quizzes.subcategoryId,
      })
      .from(quizzes)
      .leftJoin(userQuizzes, and(
        eq(userQuizzes.quizId, quizzes.id),
        eq(userQuizzes.userId, userId)
      ))
      .leftJoin(studentProgress, and(
        eq(studentProgress.userId, userId),
        eq(studentProgress.quizId, quizzes.id)
      ))
      .leftJoin(quizSubmissions, and(
        eq(quizSubmissions.userId, userId),
        eq(quizSubmissions.quizId, quizzes.id)
      ))
      .leftJoin(quizFeedback, eq(quizFeedback.progressId, studentProgress.id))
      .where(or(
        isNotNull(userQuizzes.quizId),
        isNotNull(studentProgress.id)
      ));

    // Deduplicate by quiz id, prioritizing completed status
    const uniqueResult = Array.from(
      result.reduce((map, item) => {
        const existing = map.get(item.id);
        if (!existing) {
          map.set(item.id, item);
        } else {
          // Priority: Completed > In Progress > Not Started
          const getPriority = (status: string | null) => {
            if (status === 'completed') return 3;
            if (status === 'in_progress') return 2;
            return 1;
          };

          const existingPriority = getPriority(existing.status);
          const currentPriority = getPriority(item.status);

          if (currentPriority > existingPriority) {
            // If upgrading status (e.g. In Progress -> Completed), preserve the highest completedQuestions count
            // This handles cases where the completed record might have 0 questions (due to a bug) but an in_progress record has valid count
            const merged = { ...item };
            if ((merged.completedQuestions || 0) < (existing.completedQuestions || 0)) {
              merged.completedQuestions = existing.completedQuestions;
            }
            map.set(item.id, merged);
          } else if (currentPriority === existingPriority) {
            // Tie-breaking:
            // If completed, pick latest completedAt
            if (item.status === 'completed') {
              const existingDate = existing.completedAt ? new Date(existing.completedAt).getTime() : 0;
              const currentDate = item.completedAt ? new Date(item.completedAt).getTime() : 0;
              if (currentDate > existingDate) {
                map.set(item.id, item);
              }
            }
            // If in_progress or null
            else {
              // Prioritize higher completedQuestions
              const currentQuestions = item.completedQuestions || 0;
              const existingQuestions = existing.completedQuestions || 0;

              if (currentQuestions > existingQuestions) {
                map.set(item.id, item);
              } else if (currentQuestions === existingQuestions) {
                // Fallback to latest progressId (latest attempt)
                if ((item.progressId || 0) > (existing.progressId || 0)) {
                  map.set(item.id, item);
                }
              }
            }
          }
        }
        return map;
      }, new Map<number, typeof result[0]>()).values()
    );

    return uniqueResult.map(q => ({
      ...q,
      userStatus: q.status === 'completed' ? 'completed' : 'pending'
    }));
  }


  //fin chat gpt dashboard

  // Question methods
  async getQuestionsByQuiz(quizId: number): Promise<Question[]> {
    return await this.db.select().from(questions).where(eq(questions.quizId, quizId));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const result = await this.db.select().from(questions).where(eq(questions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await this.db.insert(questions).values(question).returning();
    return result[0];
  }

  async updateQuestion(id: number, question: Partial<Question>): Promise<Question> {
    const result = await this.db.update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return result[0];
  }

  async updateQuestionExplanation(id: number, explanation: string): Promise<Question> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ explanation })
      .where(eq(questions.id, id))
      .returning();

    if (!updatedQuestion) {
      throw new Error("Question not found");
    }

    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.db.delete(questions).where(eq(questions.id, id));
  }

  // Answer methods
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    return await this.db.select().from(answers).where(eq(answers.questionId, questionId));
  }

  async getAnswer(id: number): Promise<Answer | undefined> {
    const result = await this.db.select().from(answers).where(eq(answers.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const result = await this.db.insert(answers).values(answer).returning();
    return result[0];
  }

  async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer> {
    const result = await this.db.update(answers)
      .set(answer)
      .where(eq(answers.id, id))
      .returning();
    return result[0];
  }

  async deleteAnswer(id: number): Promise<void> {
    await this.db.delete(answers).where(eq(answers.id, id));
  }

  // Student Progress methods
  async getStudentProgress(userId: number): Promise<StudentProgress[]> {
    return await this.db.select().from(studentProgress).where(eq(studentProgress.userId, userId));
  }

  async getStudentProgressByQuiz(userId: number, quizId: number): Promise<StudentProgress | undefined> {
    const result = await this.db.select().from(studentProgress).where(
      and(
        eq(studentProgress.userId, userId),
        eq(studentProgress.quizId, quizId)
      )
    );
    return result.length > 0 ? result[0] : undefined;
  }

  async getStudentProgressById(id: number): Promise<StudentProgress | undefined> {
    const result = await this.db.select().from(studentProgress).where(eq(studentProgress.id, id));
    return result[0];
  }

  async createStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress> {
    const insertData = {
      ...progress,
      completedAt: progress.completedAt
        ? new Date(progress.completedAt).toISOString()
        : null
    };

    const result = await this.db.insert(studentProgress)
      .values(insertData)
      .returning();

    return result[0];
  }

  async updateStudentProgress(id: number, progress: Partial<StudentProgress>): Promise<StudentProgress> {
    // 1. Prepare update data
    const updateData: any = { ...progress };

    // Handle completedAt conversion only if it's defined
    if (progress.completedAt !== undefined) {
      updateData.completedAt = progress.completedAt
        ? new Date(progress.completedAt).toISOString()
        : null;
    }

    // 2. Fetch current progress to prevent regression
    const [currentProgress] = await this.db
      .select()
      .from(studentProgress)
      .where(eq(studentProgress.id, id));

    if (currentProgress) {
      // Prevent reverting from 'completed' to 'in_progress'
      if (currentProgress.status === 'completed' && progress.status === 'in_progress') {
        delete updateData.status;
        delete updateData.completedAt; // Don't touch completion date either
        delete updateData.score; // Don't overwrite score with partial update
      }

      // If we are completing, ensure we don't lose the date
      if (updateData.status === 'completed' && !updateData.completedAt && !currentProgress.completedAt) {
        updateData.completedAt = new Date().toISOString();
      }
    }

    const result = await this.db.update(studentProgress)
      .set(updateData)
      .where(eq(studentProgress.id, id))
      .returning();

    return result[0];
  }

  async deleteStudentProgress(id: number): Promise<void> {
    await this.db.delete(studentAnswers).where(eq(studentAnswers.progressId, id));
    await this.db.delete(studentProgress).where(eq(studentProgress.id, id));
  }

  async getStudentAnswersByProgress(progressId: number): Promise<StudentAnswer[]> {
    return await this.db.select().from(studentAnswers).where(eq(studentAnswers.progressId, progressId));
  }

  async createStudentAnswer(answer: InsertStudentAnswer): Promise<StudentAnswer> {
    // Check if answer already exists for this progress and question
    const existingAnswer = await this.db.select()
      .from(studentAnswers)
      .where(and(
        eq(studentAnswers.progressId, answer.progressId),
        eq(studentAnswers.questionId, answer.questionId)
      ))
      .limit(1);

    if (existingAnswer.length > 0) {
      // Update existing answer
      const result = await this.db.update(studentAnswers)
        .set(answer)
        .where(eq(studentAnswers.id, existingAnswer[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new answer
      const result = await this.db.insert(studentAnswers).values(answer).returning();
      return result[0];
    }
  }

  async getQuizResults(progressId: number): Promise<QuizResult | null> {
    type ProgressWithRelations = {
      id: number;
      userId: number;
      quizId: number;
      status: 'not_started' | 'in_progress' | 'completed';
      score?: number;
      completedQuestions: number;
      timeSpent?: number;
      completedAt?: Date;
      hintsUsed: number;
      isMini: boolean | null;
      assignedQuestionIds: unknown;
      quiz: {
        id: number;
        title: string;
        description: string;
        categoryId: number;
        timeLimit: number;
        difficulty: string;
        totalQuestions: number;
        isPublic: boolean | null;
        subcategoryId: number | null;
        url: string | null;
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
          variables: Record<string, number>;
          quizId: number;
          points: number;
          imageUrl: string | null;
          explanation: string | null;
          hint1: string | null;
          hint2: string | null;
          hint3: string | null;
        };
        answerDetails: {
          id: number;
          questionId: number;
          content: string;
          isCorrect: boolean;
          explanation: string | null;
        } | null;
      }>;
    };

    const progressWithRelations = await this.db.query.studentProgress.findFirst({
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
            subcategoryId: true,
            url: true
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

    const enrichedAnswers: QuizAnswerResult[] = await Promise.all(
      progressWithRelations.answers.map(async (answer): Promise<QuizAnswerResult> => {
        const correctAnswer = await this.db.query.answers.findFirst({
          where: and(
            eq(answers.questionId, answer.questionId),
            eq(answers.isCorrect, true)
          )
        }) ?? null;

        return {
          ...answer,
          question: answer.question,
          answerDetails: answer.answerDetails,
          correctAnswer
        };
      })
    );

    return {
      progress: {
        id: progressWithRelations.id,
        userId: progressWithRelations.userId,
        quizId: progressWithRelations.quizId,
        status: progressWithRelations.status,
        score: progressWithRelations.score ?? null,
        completedQuestions: progressWithRelations.completedQuestions,
        timeSpent: progressWithRelations.timeSpent ?? null,
        completedAt: progressWithRelations.completedAt?.toISOString() ?? null,
        hintsUsed: progressWithRelations.hintsUsed,
        isMini: progressWithRelations.isMini ?? false,
        assignedQuestionIds: progressWithRelations.assignedQuestionIds ?? null
      },
      quiz: progressWithRelations.quiz,
      answers: enrichedAnswers
    };
  }

  async saveQuizFeedback({ progressId, text }: { progressId: string; text: string }) {
    try {
      // First delete any existing feedback for this progressId to avoid duplicates
      // and ensure we only have the latest one
      await this.db
        .delete(quizFeedback)
        .where(eq(quizFeedback.progressId, Number(progressId)));

      // Then insert the new feedback
      await this.db.insert(quizFeedback).values({
        progressId: Number(progressId),
        feedback: text,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ Error al insertar feedback:", err);
      throw err;
    }
  }

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

  async markSubmissionAsReviewed(progressId: number) {
    await this.db
      .update(quizSubmissions)
      .set({ reviewed: true })
      .where(eq(quizSubmissions.progressId, progressId));
  }

  async deleteSubmissionByProgressId(progressId: number) {
    await this.db
      .delete(quizSubmissions)
      .where(eq(quizSubmissions.progressId, progressId));
  }

  //Metodo para dashboard del admin:
  async countAssignedQuizzes() {
    const result = await this.db.select({ count: sql`count(*)` })
      .from(userQuizzes);
    return Number(result[0].count);
  }

  async countCompletedQuizzes() {
    const result = await this.db.select({ count: sql`count(*)` })
      .from(studentProgress)
      .where(eq(studentProgress.status, 'completed'));
    return Number(result[0].count);
  }

  async countPendingReview() {
    const result = await this.db.select({ count: sql`count(*)` })
      .from(quizSubmissions)
      .where(eq(quizSubmissions.reviewed, false));
    return Number(result[0].count);
  }

  async countPendingReports() {
    const result = await this.db.select({ count: sql`count(*)` })
      .from(questionReports)
      .where(eq(questionReports.status, 'pending'));
    return Number(result[0].count);
  }

  async getRecentPendingSubmissions() {
    // Fetch more results to allow for deduplication
    const rawResults = await this.db
      .select({
        id: quizSubmissions.id,
        userId: users.id, // Need userId for deduplication
        userName: users.name,
        quizId: quizzes.id, // Need quizId for deduplication
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
      .limit(50); // Fetch more to filter duplicates

    // Deduplicate: keep only the latest submission per user per quiz
    const uniqueSubmissions = new Map();

    for (const sub of rawResults) {
      const key = `${sub.userId}-${sub.quizId}`;
      if (!uniqueSubmissions.has(key)) {
        uniqueSubmissions.set(key, sub);
      }
    }

    // Convert back to array and take top 5
    return Array.from(uniqueSubmissions.values()).slice(0, 5);
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

  async getStudentsAtRisk(limit: number = 5) {
    // Definición de "En Riesgo": Nota <= 7.0

    const lowScores = await this.db
      .select({
        userId: studentProgress.userId,
        userName: users.name,
        quizTitle: quizzes.title,
        score: studentProgress.score,
        completedAt: studentProgress.completedAt,
        subcategoryId: quizzes.subcategoryId, // Added subcategoryId
      })
      .from(studentProgress)
      .innerJoin(users, eq(studentProgress.userId, users.id))
      .innerJoin(quizzes, eq(studentProgress.quizId, quizzes.id))
      .where(and(
        eq(studentProgress.status, 'completed'),
        sql`${studentProgress.score} <= 7.0`
      ))
      .orderBy(desc(studentProgress.completedAt))
      .limit(limit);

    return lowScores;
  }

  async getStudentHistoryBySubcategory(userId: number, subcategoryId: number) {
    return await this.db
      .select({
        quizId: quizzes.id,
        quizTitle: quizzes.title,
        score: studentProgress.score,
        completedAt: studentProgress.completedAt,
        progressId: studentProgress.id,
      })
      .from(studentProgress)
      .innerJoin(quizzes, eq(studentProgress.quizId, quizzes.id))
      .where(and(
        eq(studentProgress.userId, userId),
        eq(quizzes.subcategoryId, subcategoryId),
        eq(studentProgress.status, 'completed')
      ))
      .orderBy(desc(studentProgress.completedAt));
  }

  async getRecentActivity(limit: number = 10) {
    const activity = await this.db
      .select({
        id: studentProgress.id,
        userId: studentProgress.userId,
        userName: users.name,
        quizTitle: quizzes.title,
        status: studentProgress.status,
        score: studentProgress.score,
        completedAt: studentProgress.completedAt,
      })
      .from(studentProgress)
      .innerJoin(users, eq(studentProgress.userId, users.id))
      .innerJoin(quizzes, eq(studentProgress.quizId, quizzes.id))
      .where(eq(studentProgress.status, 'completed')) // Solo mostrar completados por ahora para reducir ruido
      .orderBy(desc(studentProgress.completedAt))
      .limit(limit);

    return activity;
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query) return [];
    const searchPattern = `%${query}%`;
    return await this.db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.name, searchPattern),
          ilike(users.username, searchPattern),
          ilike(users.email, searchPattern)
        )
      )
      .limit(10);
  }

  async searchQuizzes(query: string, userId?: number): Promise<any[]> {
    if (!query) return [];
    const searchPattern = `%${query}%`;

    if (!userId) {
      return await this.db
        .select()
        .from(quizzes)
        .where(
          or(
            ilike(quizzes.title, searchPattern),
            ilike(quizzes.description, searchPattern)
          )
        )
        .limit(10);
    }

    const results = await this.db
      .select()
      .from(quizzes)
      .leftJoin(studentProgress, and(
        eq(quizzes.id, studentProgress.quizId),
        eq(studentProgress.userId, userId)
      ))
      .leftJoin(userQuizzes, and(
        eq(quizzes.id, userQuizzes.quizId),
        eq(userQuizzes.userId, userId)
      ))
      .where(
        or(
          ilike(quizzes.title, searchPattern),
          ilike(quizzes.description, searchPattern)
        )
      )
      .limit(10);

    return results.map(row => {
      const quiz = row.quizzes;
      const progress = row.student_progress;
      const assignment = row.user_quizzes;

      let status = 'optional';
      if (progress?.status === 'completed') {
        status = 'completed';
      } else if (assignment) {
        status = 'pending';
      }
      return {
        ...quiz,
        userStatus: status,
        score: progress?.score,
        timeSpent: progress?.timeSpent,
        completedAt: progress?.completedAt,
        progressId: progress?.id
      };
    });
  }

  async registerParentWithChild(
    parent: { username: string, password: string, name: string, email?: string },
    child: { username: string, password: string, name: string, email?: string }
  ) {
    // Validar que los usernames no existan
    const [existingParent] = await this.db.select().from(users).where(eq(users.username, parent.username));
    const [existingChild] = await this.db.select().from(users).where(eq(users.username, child.username));

    if (existingParent || existingChild) {
      throw new Error('Nombre de usuario ya está en uso');
    }

    // Insertar hijo
    const [childUser] = await this.db.insert(users).values({
      username: child.username,
      password: child.password,
      name: child.name,
      email: child.email,
      role: 'student'
    }).returning();

    // Insertar padre
    const [parentUser] = await this.db.insert(users).values({
      username: parent.username,
      password: parent.password,
      name: parent.name,
      email: parent.email,
      role: 'parent'
    }).returning();

    // Enlazar en tabla parents
    await this.db.insert(parents).values({
      name: parent.name,
      userId: parentUser.id,
      childId: childUser.id,
    });

    return { success: true, parentId: parentUser.id, childId: childUser.id };
  }

  async getChildByParentId(parentId: number): Promise<Child | null> {
    try {
      const result = await this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(parents)
        .innerJoin(users, eq(parents.childId, users.id))
        .where(eq(parents.userId, parentId));

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error en getChildByParentId:', error);
      throw new Error('Failed to get child by parent ID');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(ilike(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const result = await this.db.update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.googleId, googleId));
    return result.length > 0 ? result[0] : undefined;
  }

  async updateUserGoogleId(userId: number, googleId: string): Promise<void> {
    await this.db.update(users)
      .set({ googleId })
      .where(eq(users.id, userId));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(ilike(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteUser(id: number): Promise<void> {
    await this.db.delete(studentAnswers).where(
      inArray(
        studentAnswers.progressId,
        this.db.select({ id: studentProgress.id }).from(studentProgress).where(eq(studentProgress.userId, id))
      )
    );
    await this.db.delete(studentProgress).where(eq(studentProgress.userId, id));
    await this.db.delete(userQuizzes).where(eq(userQuizzes.userId, id));
    await this.db.delete(userCategories).where(eq(userCategories.userId, id));
    await this.db.delete(users).where(eq(users.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }

  async saveQuizSubmission(submission: { userId: number; quizId: number; score: number; progressId: number }): Promise<void> {
    // Check if submission already exists for this progressId
    const existing = await this.db.query.quizSubmissions.findFirst({
      where: eq(quizSubmissions.progressId, submission.progressId)
    });

    if (existing) {
      // Update existing submission
      await this.db
        .update(quizSubmissions)
        .set({
          score: submission.score,
          completedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(quizSubmissions.id, existing.id));
    } else {
      // Insert new submission
      await this.db.insert(quizSubmissions).values({
        userId: submission.userId,
        quizId: submission.quizId,
        score: submission.score,
        progressId: submission.progressId,
      });
    }
  }

  async getQuizSubmissionsForAdmin(): Promise<any[]> {
    const results = await this.db
      .select({
        submissionId: quizSubmissions.id,
        userId: quizSubmissions.userId,
        userName: users.name,
        quizId: quizSubmissions.quizId,
        quizTitle: quizzes.title,
        score: quizSubmissions.score,
        completedAt: quizSubmissions.completedAt,
        reviewed: quizSubmissions.reviewed,
        progressId: quizSubmissions.progressId,
        timeSpent: studentProgress.timeSpent,
      })
      .from(quizSubmissions)
      .leftJoin(users, eq(quizSubmissions.userId, users.id))
      .leftJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
      .leftJoin(studentProgress, eq(quizSubmissions.progressId, studentProgress.id))
      .orderBy(desc(quizSubmissions.completedAt));

    return results.map(row => ({
      progress: {
        id: row.progressId,
        userId: row.userId,
        timeSpent: row.timeSpent,
        score: row.score,
      },
      quiz: {
        id: row.quizId,
        title: row.quizTitle,
      },
      user: {
        id: row.userId,
        name: row.userName,
      },
      completedAt: row.completedAt,
      reviewed: row.reviewed,
    }));
  }

  async getAllQuizSubmissions(): Promise<any[]> {
    const results = await this.db
      .select({
        submissionId: quizSubmissions.id,
        userId: quizSubmissions.userId,
        userName: users.name,
        quizId: quizSubmissions.quizId,
        quizTitle: quizzes.title,
        score: quizSubmissions.score,
        completedAt: quizSubmissions.completedAt,
        reviewed: quizSubmissions.reviewed,
        progressId: quizSubmissions.progressId,
        timeSpent: studentProgress.timeSpent,
      })
      .from(quizSubmissions)
      .leftJoin(users, eq(quizSubmissions.userId, users.id))
      .leftJoin(quizzes, eq(quizSubmissions.quizId, quizzes.id))
      .leftJoin(studentProgress, eq(quizSubmissions.progressId, studentProgress.id))
      .orderBy(desc(quizSubmissions.completedAt));

    return results.map(row => ({
      progress: {
        id: row.progressId,
        userId: row.userId,
        timeSpent: row.timeSpent,
        score: row.score,
      },
      quiz: {
        id: row.quizId,
        title: row.quizTitle,
      },
      user: {
        id: row.userId,
        name: row.userName,
      },
      completedAt: row.completedAt,
      reviewed: row.reviewed,
    }));
  }



  async backfillQuizSubmissions(): Promise<void> {
    const completedProgress = await this.db.select()
      .from(studentProgress)
      .where(eq(studentProgress.status, 'completed'));

    for (const progress of completedProgress) {
      const existing = await this.db.select()
        .from(quizSubmissions)
        .where(eq(quizSubmissions.progressId, progress.id));

      if (existing.length === 0) {
        await this.db.insert(quizSubmissions).values({
          userId: progress.userId,
          quizId: progress.quizId,
          progressId: progress.id,
          score: progress.score || 0,
          completedAt: progress.completedAt || new Date().toISOString(),
          reviewed: false
        });
      }
    }
  }

  async updateUserHintCredits(userId: number, credits: number): Promise<void> {
    await this.db
      .update(users)
      .set({ hintCredits: credits })
      .where(eq(users.id, userId));
  }

  async updateQuestionHints(questionId: number, hints: { hint1?: string, hint2?: string, hint3?: string, explanation?: string }): Promise<void> {
    // Remove undefined values to avoid UNDEFINED_VALUE error in postgres.js
    const cleanHints = Object.fromEntries(
      Object.entries(hints).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(cleanHints).length === 0) return;

    await this.db
      .update(questions)
      .set(cleanHints)
      .where(eq(questions.id, questionId));
  }

  async updateUserTourStatus(userId: number, tourType: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const currentStatus = (user.tourStatus as Record<string, boolean>) || {};
    const newStatus = { ...currentStatus, [tourType]: true };

    await this.db
      .update(users)
      .set({ tourStatus: newStatus })
      .where(eq(users.id, userId));
  }

  // Question Reports
  async createQuestionReport(report: InsertQuestionReport): Promise<QuestionReport> {
    const result = await this.db.insert(questionReports).values(report).returning();
    return result[0];
  }

  async getQuestionReports(): Promise<QuestionReport[]> {
    return await this.db.select().from(questionReports).orderBy(desc(questionReports.createdAt));
  }

  async updateQuestionReportStatus(id: number, status: string): Promise<QuestionReport> {
    const result = await this.db
      .update(questionReports)
      .set({ status })
      .where(eq(questionReports.id, id))
      .returning();
    return result[0];
  }

  async getQuestionReportDetails(id: number): Promise<any> {
    const report = await this.db.query.questionReports.findFirst({
      where: eq(questionReports.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        },
        quiz: {
          columns: {
            id: true,
            title: true
          }
        },
        question: {
          with: {
            answers: true
          }
        }
      }
    });

    return report;
  }




  // Password Reset Methods
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const result = await this.db.insert(passwordResetTokens).values(token).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await this.db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result.length > 0 ? result[0] : undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }
}
