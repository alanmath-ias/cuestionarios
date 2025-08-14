import { users, categories, quizzes, questions, answers, studentProgress, studentAnswers, } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { userQuizzes } from "../shared/schema.js";
//chat gpt calificaciones
import { quizSubmissions } from "../shared/schema.js";
import { quizFeedback } from "../shared/schema.js";
//chat gpt dashboard personalizado
import { userCategories } from "../shared/schema.js";
import { subcategories } from "../shared/schema.js";
import { parents } from "../shared/schema.js";
export class DatabaseStorage {
    // User methods
    async getUsers() {
        return await db.select().from(users);
    }
    async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result.length > 0 ? result[0] : undefined;
    }
    async getUserById(userId) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.id, userId));
        return result.length > 0 ? result[0] : undefined;
    }
    async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result.length > 0 ? result[0] : undefined;
    }
    async createUser(user) {
        const result = await db.insert(users).values(user).returning();
        return result[0];
    }
    async updateUser(id, userData) {
        const result = await db
            .update(users)
            .set(userData)
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }
    // Category methods
    async getCategories() {
        return await db.select().from(categories);
    }
    async getCategory(id) {
        const result = await db.select().from(categories).where(eq(categories.id, id));
        return result.length > 0 ? result[0] : undefined;
    }
    async createCategory(category) {
        const result = await db.insert(categories).values(category).returning();
        return result[0];
    }
    async updateCategory(id, category) {
        const result = await db.update(categories)
            .set(category)
            .where(eq(categories.id, id))
            .returning();
        return result[0];
    }
    async deleteCategory(id) {
        await db.delete(categories).where(eq(categories.id, id));
    }
    //subcategory methods
    async getAllSubcategories() {
        return db
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
    async getSubcategoriesByCategory(categoryId) {
        return db
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
    async createSubcategory({ name, categoryId, description, youtube_sublink }) {
        return db
            .insert(subcategories)
            .values({ name, categoryId, description, youtube_sublink }) // Incluye el nuevo campo
            .returning();
    }
    async deleteSubcategory(id) {
        return db.delete(subcategories).where(eq(subcategories.id, id));
    }
    async updateSubcategory(id, name, description, youtube_sublink) {
        await db
            .update(subcategories)
            .set({ name, description, youtube_sublink }) // Incluye el nuevo campo
            .where(eq(subcategories.id, id));
    }
    //Entrenamiento por subcategorias:
    async getTrainingQuestionsByCategoryAndSubcategory(categoryId, subcategoryId) {
        //console.log('🔍 Verificando quizzes para:', { categoryId, subcategoryId });
        const quizzesInCategoryAndSubcategory = await db
            .select({ id: quizzes.id })
            .from(quizzes)
            .where(and(eq(quizzes.categoryId, categoryId), eq(quizzes.subcategoryId, subcategoryId)))
            .catch(err => {
            console.error('❌ Error en consulta quizzes:', err);
            throw err;
        });
        //console.log('📊 Quizzes encontrados:', quizzesInCategoryAndSubcategory);
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
    }*/ //esta funcionaba perfecto antes de la navegacion con subcategorias
    async getQuizzes() {
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
            subcategory: subcategories,
            url: quizzes.url, // <-- agregado
        })
            .from(quizzes)
            .leftJoin(categories, eq(quizzes.categoryId, categories.id))
            .leftJoin(subcategories, eq(quizzes.subcategoryId, subcategories.id));
        return results;
    }
    async getQuizzesBySubcategory(subcategoryId) {
        return await db.select()
            .from(quizzes)
            .where(eq(quizzes.subcategoryId, subcategoryId));
    }
    async getPublicQuizzes() {
        return await db.select().from(quizzes).where(eq(quizzes.isPublic, true));
    }
    async getQuizzesByCategory(categoryId) {
        return await db.select().from(quizzes).where(eq(quizzes.categoryId, categoryId));
    }
    async getQuiz(id) {
        const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
        return result.length > 0 ? result[0] : undefined;
    }
    async createQuiz(quiz) {
        const result = await db.insert(quizzes).values(quiz).returning();
        return result[0];
    }
    async updateQuiz(id, quiz) {
        const result = await db.update(quizzes)
            .set(quiz)
            .where(eq(quizzes.id, id))
            .returning();
        return result[0];
    }
    async deleteQuiz(id) {
        await db.delete(quizzes).where(eq(quizzes.id, id));
    }
    //chat gpt cuestionarios a usuarios
    async getAllUsers() {
        return db.select().from(users);
    }
    async getUserQuizzes(userId) {
        const result = await db
            .select()
            .from(quizzes)
            .innerJoin(studentProgress, eq(quizzes.id, studentProgress.quizId))
            .where(eq(studentProgress.userId, userId));
        // Como devuelve un array de objetos con .quizzes y .studentProgress, sacamos solo los quices
        return result.map(row => row.quizzes);
    }
    constructor(db) {
        this.db = db;
    }
    async assignQuizToUser(userId, quizId) {
        try {
            await this.db.insert(userQuizzes).values({ userId, quizId }).onConflictDoNothing();
        }
        catch (error) {
            console.error("DB Error in assignQuizToUser:", error);
            throw error;
        }
    }
    async removeQuizFromUser(userId, quizId) {
        await db.delete(userQuizzes).where(and(eq(userQuizzes.userId, userId), eq(userQuizzes.quizId, quizId)));
    }
    async getUsersAssignedToQuiz(quizId) {
        const result = await this.db
            .select()
            .from(userQuizzes)
            .where(eq(userQuizzes.quizId, quizId));
        return result;
    }
    //fin chat gpt cuestionarios a usuarios
    //chat gpt dashboar personalizado
    async getCategoriesByUserId(userId) {
        const result = await this.db
            .select({
            id: categories.id,
            name: categories.name,
            youtubeLink: categories.youtubeLink, // Incluye youtubeLink
        })
            .from(userCategories)
            .innerJoin(categories, eq(userCategories.categoryId, categories.id))
            .where(eq(userCategories.userId, userId));
        return result;
    }
    async getQuizzesByUserId(userId) {
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
            url: quizzes.url, // ← Añade esta línea
        })
            .from(userQuizzes)
            .innerJoin(quizzes, eq(userQuizzes.quizId, quizzes.id))
            .leftJoin(studentProgress, and(eq(studentProgress.userId, userId), eq(studentProgress.quizId, quizzes.id)))
            .leftJoin(quizSubmissions, and(eq(quizSubmissions.userId, userId), eq(quizSubmissions.quizId, quizzes.id)))
            .where(eq(userQuizzes.userId, userId));
        // .orderBy(desc(quizzes.id)) la idea es que sean llevados en orden, revisar esto mas adelante
        return result;
    }
    //fin chat gpt dashboard
    // Question methods
    async getQuestionsByQuiz(quizId) {
        return await db.select().from(questions).where(eq(questions.quizId, quizId));
    }
    async getQuestion(id) {
        const result = await db.select().from(questions).where(eq(questions.id, id));
        return result.length > 0 ? result[0] : undefined;
    }
    async createQuestion(question) {
        const result = await db.insert(questions).values(question).returning();
        return result[0];
    }
    async updateQuestion(id, question) {
        const result = await db.update(questions)
            .set(question)
            .where(eq(questions.id, id))
            .returning();
        return result[0];
    }
    async deleteQuestion(id) {
        await db.delete(questions).where(eq(questions.id, id));
    }
    // Answer methods
    async getAnswersByQuestion(questionId) {
        return await db.select().from(answers).where(eq(answers.questionId, questionId));
    }
    async getAnswer(id) {
        const result = await db.select().from(answers).where(eq(answers.id, id));
        return result.length > 0 ? result[0] : undefined;
    }
    async createAnswer(answer) {
        const result = await db.insert(answers).values(answer).returning();
        return result[0];
    }
    async updateAnswer(id, answer) {
        const result = await db.update(answers)
            .set(answer)
            .where(eq(answers.id, id))
            .returning();
        return result[0];
    }
    async deleteAnswer(id) {
        await db.delete(answers).where(eq(answers.id, id));
    }
    // Student Progress methods
    async getStudentProgress(userId) {
        return await db.select().from(studentProgress).where(eq(studentProgress.userId, userId));
    }
    async getStudentProgressByQuiz(userId, quizId) {
        const result = await db.select().from(studentProgress).where(and(eq(studentProgress.userId, userId), eq(studentProgress.quizId, quizId)));
        return result.length > 0 ? result[0] : undefined;
    }
    async createStudentProgress(progress) {
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
    async updateStudentProgress(id, progress) {
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
    async getStudentAnswersByProgress(progressId) {
        return await db.select().from(studentAnswers).where(eq(studentAnswers.progressId, progressId));
    }
    async createStudentAnswer(answer) {
        const result = await db.insert(studentAnswers).values(answer).returning();
        return result[0];
    }
    //deep seek respuestas correctas en quiz-results creo que puedo eliminar esto porque al final se uso el endppint de quiz
    async getQuizResults(progressId) {
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
                        subcategoryId: true,
                        url: true // <-- agregado
                    }
                },
                answers: {
                    with: {
                        question: true,
                        answerDetails: true
                    }
                }
            }
        });
        if (!progressWithRelations || !progressWithRelations.answers)
            return null;
        // 3. Procesar respuestas con tipo seguro
        const enrichedAnswers = await Promise.all(progressWithRelations.answers.map(async (answer) => {
            const correctAnswer = await db.query.answers.findFirst({
                where: and(eq(answers.questionId, answer.questionId), eq(answers.isCorrect, true))
            }) ?? null;
            return {
                ...answer,
                question: answer.question,
                answerDetails: answer.answerDetails,
                correctAnswer
            };
        }));
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
    async saveQuizSubmission({ userId, quizId, score, progressId }) {
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
    async getProgressById(progressId) {
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
    async saveQuizFeedback({ progressId, text }) {
        try {
            await this.db.insert(quizFeedback).values({
                progressId: Number(progressId), // Conversión a número
                feedback: text, // Asegúrate que 'feedback' sea el nombre correcto del campo
                createdAt: new Date().toISOString(), // Opción 1: Convertir a string ISO
                // O alternativamente:
                // createdAt: sql`now()`,         // Opción 2: Usar función de base de datos
                // createdAt: new Date(),         // Opción 3: Solo si el esquema lo permite
            });
        }
        catch (err) {
            console.error("❌ Error al insertar feedback:", err);
            throw err;
        }
    }
    //funcion para que los usuarios vean el feedback:
    async getQuizFeedback(progressId) {
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
    async getStudentAnswers(progressId) {
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
    async markSubmissionAsReviewed(progressId) {
        await db
            .update(quizSubmissions)
            .set({ reviewed: true })
            .where(eq(quizSubmissions.progressId, progressId));
    }
    async deleteSubmissionByProgressId(progressId) {
        await db
            .delete(quizSubmissions)
            .where(eq(quizSubmissions.progressId, progressId));
    }
    //fin chat gpt calificaciones
    //Metodo para dashboard del admin:
    async countAssignedQuizzes() {
        const result = await db.select({ count: sql `count(*)` })
            .from(userQuizzes);
        return result[0].count;
    }
    async countCompletedQuizzes() {
        const result = await db.select({ count: sql `count(*)` })
            .from(studentProgress)
            .where(eq(studentProgress.status, 'completed'));
        return result[0].count;
    }
    async countPendingReview() {
        const result = await db.select({ count: sql `count(*)` })
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
        const summaries = await Promise.all(allUsers.map(async (user) => {
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
        }));
        return summaries;
    }
    async registerParentWithChild(parent, child) {
        // Validar que los usernames no existan
        const [existingParent] = await this.db.select().from(users).where(eq(users.username, parent.username));
        const [existingChild] = await this.db.select().from(users).where(eq(users.username, child.username));
        if (existingParent || existingChild) {
            throw new Error('Nombre de usuario ya está en uso');
        }
        // Hash de contraseñas
        //const parentPassword = await bcrypt.hash(parent.password, 10);
        //const childPassword = await bcrypt.hash(child.password, 10);
        // Insertar hijo
        const [childUser] = await this.db.insert(users).values({
            username: child.username,
            password: child.password, //para password hasheada usar childPassword
            name: child.name,
            email: child.email,
            role: 'student'
        }).returning();
        // Insertar padre
        const [parentUser] = await this.db.insert(users).values({
            username: parent.username,
            password: parent.password, //para password hasheada usar parentPassword
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
    async getChildByParentId(parentId) {
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
        }
        catch (error) {
            console.error('Error en getChildByParentId:', error);
            throw new Error('Failed to get child by parent ID');
        }
    }
}
