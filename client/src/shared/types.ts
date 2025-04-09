// Definiciones de tipos para la aplicación

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string | null;
  role?: string;
  createdAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  colorClass?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  timeLimit: number;
  difficulty: string;
  totalQuestions: number;
  isPublic: boolean | null;
}

export interface Question {
  id: number;
  content: string;
  type: string;
  quizId: number;
  difficulty: number;
  points: number;
  variables?: Record<string, number>;
}

export interface Answer {
  id: number;
  content: string;
  questionId: number;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface StudentProgress {
  id: number;
  userId: number;
  quizId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  completedQuestions: number | null;
  timeSpent: number | null;
  completedAt: Date | null;
}

export interface StudentAnswer {
  id: number;
  progressId: number;
  questionId: number;
  answerId: number | null;
  isCorrect: boolean | null;
  timeSpent: number | null;
  variables?: Record<string, number>;
}