import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  quizzes, Quiz, InsertQuiz,
  questions, Question, InsertQuestion,
  answers, Answer, InsertAnswer,
  studentProgress, StudentProgress, InsertStudentProgress,
  studentAnswers, StudentAnswer, InsertStudentAnswer
} from "./schema.js";
import { db } from './db.js'; // Aquí cambiamos la extensión al usar importaciones locales
import { Child } from '../shared/quiz-types.js'; // Ajusta la ruta

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  //getChildByParentId(parentId: number): Promise<Child | null>;
  
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

  
//chat gpt quices a usuarios
getUserQuizzes(userId: number): Promise<Quiz[]>;
assignQuizToUser(userId: number, quizId: number): Promise<void>;

removeQuizFromUser(userId: number, quizId: number): Promise<void>;



//const storage = new DatabaseStorage(db);

// Función para obtener los usuarios asignados a un quiz


//fin chat gpt quices a usuarios
  
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
  
  // Student Answer methods
  getStudentAnswersByProgress(progressId: number): Promise<StudentAnswer[]>;
  createStudentAnswer(answer: InsertStudentAnswer): Promise<StudentAnswer>;


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
  
  private async initializeData() {
    try {
      // Create default admin user
      const admin = await this.createUser({
        username: "admin",
        password: "admin123",
        name: "Administrador",
        email: "admin@alanmath.com"
      });
      //console.log(`Usuario creado: ${admin.username}, ID: ${admin.id}`);
      
      // Create sample student
      const student = await this.createUser({
        username: "estudiante",
        password: "estudiante123",
        name: "María González",
        email: "maria@example.com"
      });
      //console.log(`Usuario creado: ${student.username}, ID: ${student.id}`);
      
      // Create categories
      const algebra = await this.createCategory({
        name: "Álgebra",
        description: "Ecuaciones, polinomios y sistemas lineales",
        colorClass: "primary" // primary color class
      });
      //console.log(`Categoría creada: ${algebra.name}, ID: ${algebra.id}`);
      
      const geometria = await this.createCategory({
        name: "Geometría",
        description: "Figuras, ángulos y teoremas básicos",
        colorClass: "secondary" // secondary color class
      });
      //console.log(`Categoría creada: ${geometria.name}, ID: ${geometria.id}`);
      
      const calculo = await this.createCategory({
        name: "Cálculo",
        description: "Límites, derivadas e integrales",
        colorClass: "accent" // accent color class
      });
      //console.log(`Categoría creada: ${calculo.name}, ID: ${calculo.id}`);
      
      // Create quizzes for Algebra
      const ecuacionesQuiz = await this.createQuiz({
        title: "Ecuaciones de primer grado",
        description: "Resuelve ecuaciones lineales con una incógnita.",
        categoryId: algebra.id,
        timeLimit: 15,
        difficulty: "basic",
        totalQuestions: 10
      });
      //console.log(`Quiz creado: ${ecuacionesQuiz.title}, Categoría ID: ${ecuacionesQuiz.categoryId}`);
      
      const sistemasQuiz = await this.createQuiz({
        title: "Sistemas de ecuaciones",
        description: "Resuelve sistemas lineales de dos ecuaciones.",
        categoryId: algebra.id,
        timeLimit: 20,
        difficulty: "intermediate",
        totalQuestions: 8
      });
      //console.log(`Quiz creado: ${sistemasQuiz.title}, Categoría ID: ${sistemasQuiz.categoryId}`);
      
      const polinomiosQuiz = await this.createQuiz({
        title: "Polinomios",
        description: "Operaciones con polinomios y factorización.",
        categoryId: algebra.id,
        timeLimit: 25,
        difficulty: "intermediate",
        totalQuestions: 12
      });
      //console.log(`Quiz creado: ${polinomiosQuiz.title}, Categoría ID: ${polinomiosQuiz.categoryId}`);
      
      // Create geometry quizzes
      const triangulosQuiz = await this.createQuiz({
        title: "Triángulos",
        description: "Propiedades y cálculos con triángulos.",
        categoryId: geometria.id,
        timeLimit: 20,
        difficulty: "basic",
        totalQuestions: 10
      });
      //console.log(`Quiz creado: ${triangulosQuiz.title}, Categoría ID: ${triangulosQuiz.categoryId}`);
      
      const circulosQuiz = await this.createQuiz({
        title: "Círculos y áreas",
        description: "Cálculo de áreas y perímetros.",
        categoryId: geometria.id,
        timeLimit: 25,
        difficulty: "intermediate",
        totalQuestions: 8
      });
      //console.log(`Quiz creado: ${circulosQuiz.title}, Categoría ID: ${circulosQuiz.categoryId}`);
      
      // Create calculus quizzes
      const limitesQuiz = await this.createQuiz({
        title: "Límites",
        description: "Cálculo y propiedades de límites.",
        categoryId: calculo.id,
        timeLimit: 30,
        difficulty: "intermediate",
        totalQuestions: 10
      });
      //console.log(`Quiz creado: ${limitesQuiz.title}, Categoría ID: ${limitesQuiz.categoryId}`);
      
      const derivadasQuiz = await this.createQuiz({
        title: "Derivadas",
        description: "Reglas de derivación y aplicaciones.",
        categoryId: calculo.id,
        timeLimit: 35,
        difficulty: "advanced",
        totalQuestions: 12
      });
      //console.log(`Quiz creado: ${derivadasQuiz.title}, Categoría ID: ${derivadasQuiz.categoryId}`);
      
    } catch (error) {
      console.error("Error inicializando datos:", error);
    }
    
    // Crear preguntas y respuestas para el quiz de ecuaciones
    try {
      // Obtenemos el primer quiz (ecuaciones) creado anteriormente
      const quizzes = await this.getQuizzesByCategory(1); // Álgebra
      
      if (quizzes.length > 0) {
        const ecuacionesQuiz = quizzes[0];
        
        // Create sample questions for ecuaciones quiz
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
        
        // Create sample answers for the first question
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
        
        // Create more questions for ecuaciones quiz
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
        
        // Create sample progress for the student
        const estudiantes = await this.getUsers();
        if (estudiantes.length > 1) { // Asegurar que hay al menos 2 usuarios (admin y María)
          const maria = estudiantes[1]; // Student María (id 2)
          
          await this.createStudentProgress({
            userId: maria.id,
            quizId: ecuacionesQuiz.id,
            status: "completed",
            score: 90,
            completedQuestions: 10,
            timeSpent: 720, // 12 minutes in seconds
            completedAt: new Date()
          });
          
          const quizzesList = await this.getQuizzes();
          if (quizzesList.length > 1) {
            await this.createStudentProgress({
              userId: maria.id,
              quizId: quizzesList[1].id, // Sistemas de ecuaciones (id 2)
              status: "in_progress",
              completedQuestions: 4,
              timeSpent: 480, // 8 minutes in seconds
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
      email: insertUser.email ?? null,        // Asegura que sea string o null
      role: insertUser.role ?? "student",     // Asegura que no sea undefined
      createdAt: new Date().toISOString()
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
      youtubeLink: category.youtubeLink ?? null // Asigna null si es undefined
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Quiz methods
  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }
  
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    // Asegurarse de que categoryId es un número
    const catId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    
    const result = Array.from(this.quizzes.values()).filter(
      (quiz) => {
        const quizCatId = typeof quiz.categoryId === 'string' ? parseInt(quiz.categoryId) : quiz.categoryId;
        //console.log(`Comparando quiz ${quiz.title}: ${quizCatId} con categoría: ${catId}`);
        return quizCatId === catId;
      }
    );
    
    //console.log(`Encontrados ${result.length} quizzes para la categoría ${catId}`);
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
      subcategoryId, // asegúrate de que siempre esté presente
      isPublic: quiz.isPublic ?? null, // también importante si puede venir undefined
      url: null // asignamos null porque no viene del input
    };
  
    this.quizzes.set(id, newQuiz);
    //console.log(`Creando quiz: ${newQuiz.title}, categoryId: ${newQuiz.categoryId}`);
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
      completedAt: progress.completedAt?.toISOString() ?? null, // Asegura string | null
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
      variables: answer.variables ?? {}, // default: objeto vacío
      questionId: answer.questionId,
      isCorrect: answer.isCorrect ?? null, // default: null
      timeSpent: answer.timeSpent ?? null, // default: null
      progressId: answer.progressId,
      answerId: answer.answerId ?? null, // default: null
    };
    this.studentAnswers.set(id, newAnswer);
    return newAnswer;
  }
  
// Category methods
async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
  throw new Error("Method not implemented.");
}

async deleteCategory(id: number): Promise<void> {
  throw new Error("Method not implemented.");
}

// Quiz methods
async getPublicQuizzes(): Promise<Quiz[]> {
  throw new Error("Method not implemented.");
}

async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
  throw new Error("Method not implemented.");
}

async deleteQuiz(id: number): Promise<void> {
  throw new Error("Method not implemented.");
}

// Métodos de asignación de quizzes a usuarios
async getUserQuizzes(userId: number): Promise<Quiz[]> {
  throw new Error("Method not implemented.");
}

async assignQuizToUser(userId: number, quizId: number): Promise<void> {
  throw new Error("Method not implemented.");
}

async removeQuizFromUser(userId: number, quizId: number): Promise<void> {
  throw new Error("Method not implemented.");
}
// Question methods
async updateQuestion(id: number, question: Partial<Question>): Promise<Question> {
  throw new Error("Method not implemented.");
}

async deleteQuestion(id: number): Promise<void> {
  throw new Error("Method not implemented.");
}

// Answer methods
async updateAnswer(id: number, answer: Partial<Answer>): Promise<Answer> {
  throw new Error("Method not implemented.");
}

async deleteAnswer(id: number): Promise<void> {
  throw new Error("Method not implemented.");
}




}

// Importar la implementación de almacenamiento de base de datos
import { DatabaseStorage } from "./database-storage.js";

// Usar almacenamiento de base de datos en lugar de memoria
export const storage = new DatabaseStorage(db);

export const getUsersAssignedToQuiz = async (quizId: number) => {
  try {
    return await storage.getUsersAssignedToQuiz(quizId);
  } catch (error) {
    console.error("Error in getUsersAssignedToQuiz:", error);
    throw error;
  }
};

//chat gpt dashboard personalizado
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

//fin chat gpt dashboard personalizado
