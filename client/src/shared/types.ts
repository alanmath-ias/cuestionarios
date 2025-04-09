// Tipos compartidos para la aplicación cliente

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  role?: string;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  colorClass: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  timeLimit: number;
  difficulty: string; // "basic", "intermediate", "advanced"
  totalQuestions: number;
  isPublic?: boolean;
}

export interface Question {
  id: number;
  content: string;
  type: string; // "multiple_choice", "equation", etc.
  difficulty: number;
  points: number;
  quizId: number;
  variables?: Record<string, any>;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  content: string;
  questionId: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface StudentProgress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  completedQuestions: number;
  timeSpent?: number;
  completedAt?: Date;
  quiz?: Quiz;
}

export interface StudentAnswer {
  id: number;
  progressId: number;
  questionId: number;
  answerId?: number;
  isCorrect?: boolean;
  timeSpent?: number;
  variables?: Record<string, any>;
  question?: Question;
  answerDetails?: Answer;
}