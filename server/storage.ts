import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  quizzes, Quiz, InsertQuiz,
  questions, Question, InsertQuestion,
  answers, Answer, InsertAnswer,
  studentProgress, StudentProgress, InsertStudentProgress,
  studentAnswers, StudentAnswer, InsertStudentAnswer
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Quiz methods
  getQuizzes(): Promise<Quiz[]>;
  getQuizzesByCategory(categoryId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Question methods
  getQuestionsByQuiz(quizId: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Answer methods
  getAnswersByQuestion(questionId: number): Promise<Answer[]>;
  getAnswer(id: number): Promise<Answer | undefined>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  
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
  
  private initializeData() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Administrador",
      email: "admin@alanmath.com"
    });
    
    // Create sample student
    this.createUser({
      username: "estudiante",
      password: "estudiante123",
      name: "María González",
      email: "maria@example.com"
    });
    
    // Create categories
    const algebra = this.createCategory({
      name: "Álgebra",
      description: "Ecuaciones, polinomios y sistemas lineales",
      colorClass: "primary" // primary color class
    });
    
    const geometria = this.createCategory({
      name: "Geometría",
      description: "Figuras, ángulos y teoremas básicos",
      colorClass: "secondary" // secondary color class
    });
    
    const calculo = this.createCategory({
      name: "Cálculo",
      description: "Límites, derivadas e integrales",
      colorClass: "accent" // accent color class
    });
    
    // Create quizzes for Algebra
    const ecuacionesQuiz = this.createQuiz({
      title: "Ecuaciones de primer grado",
      description: "Resuelve ecuaciones lineales con una incógnita.",
      categoryId: algebra.id,
      timeLimit: 15,
      difficulty: "basic",
      totalQuestions: 10
    });
    
    this.createQuiz({
      title: "Sistemas de ecuaciones",
      description: "Resuelve sistemas lineales de dos ecuaciones.",
      categoryId: algebra.id,
      timeLimit: 20,
      difficulty: "intermediate",
      totalQuestions: 8
    });
    
    this.createQuiz({
      title: "Polinomios",
      description: "Operaciones con polinomios y factorización.",
      categoryId: algebra.id,
      timeLimit: 25,
      difficulty: "intermediate",
      totalQuestions: 12
    });
    
    // Create geometry quizzes
    this.createQuiz({
      title: "Triángulos",
      description: "Propiedades y cálculos con triángulos.",
      categoryId: geometria.id,
      timeLimit: 20,
      difficulty: "basic",
      totalQuestions: 10
    });
    
    this.createQuiz({
      title: "Círculos y áreas",
      description: "Cálculo de áreas y perímetros.",
      categoryId: geometria.id,
      timeLimit: 25,
      difficulty: "intermediate",
      totalQuestions: 8
    });
    
    // Create calculus quizzes
    this.createQuiz({
      title: "Límites",
      description: "Cálculo y propiedades de límites.",
      categoryId: calculo.id,
      timeLimit: 30,
      difficulty: "intermediate",
      totalQuestions: 10
    });
    
    this.createQuiz({
      title: "Derivadas",
      description: "Reglas de derivación y aplicaciones.",
      categoryId: calculo.id,
      timeLimit: 35,
      difficulty: "advanced",
      totalQuestions: 12
    });
    
    // Create sample questions for ecuaciones quiz
    const q1 = this.createQuestion({
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
    this.createAnswer({
      questionId: q1.id,
      content: "x = {answer}",
      isCorrect: true,
      explanation: "Para resolver {a}x + {b} = {c}, despejamos x: {a}x = {c} - {b}, entonces x = ({c} - {b}) / {a}"
    });
    
    this.createAnswer({
      questionId: q1.id,
      content: "x = {wrongAnswer1}",
      isCorrect: false,
      explanation: "Esta respuesta es incorrecta. Debes despejar x correctamente."
    });
    
    this.createAnswer({
      questionId: q1.id,
      content: "x = {wrongAnswer2}",
      isCorrect: false,
      explanation: "Esta respuesta es incorrecta. Recuerda que debes despejar la variable x."
    });
    
    this.createAnswer({
      questionId: q1.id,
      content: "x = {wrongAnswer3}",
      isCorrect: false,
      explanation: "Esta respuesta es incorrecta. Revisa tus cálculos."
    });
    
    // Create more questions for ecuaciones quiz
    const q2 = this.createQuestion({
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
    this.createStudentProgress({
      userId: 2, // Student María
      quizId: ecuacionesQuiz.id,
      status: "completed",
      score: 90,
      completedQuestions: 10,
      timeSpent: 720, // 12 minutes in seconds
      completedAt: new Date()
    });
    
    this.createStudentProgress({
      userId: 2, // Student María
      quizId: 2, // Sistemas de ecuaciones
      status: "in_progress",
      completedQuestions: 4,
      timeSpent: 480, // 8 minutes in seconds
    });
  }

  // User methods
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
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
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
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Quiz methods
  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }
  
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.categoryId === categoryId
    );
  }
  
  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizId++;
    const newQuiz: Quiz = { ...quiz, id };
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
    const newQuestion: Question = { ...question, id };
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
    const newAnswer: Answer = { ...answer, id };
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
    const newProgress: StudentProgress = { ...progress, id };
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
    const newAnswer: StudentAnswer = { ...answer, id };
    this.studentAnswers.set(id, newAnswer);
    return newAnswer;
  }
}

export const storage = new MemStorage();
