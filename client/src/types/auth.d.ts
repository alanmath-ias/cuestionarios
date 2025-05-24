// src/types/auth.d.ts
export interface CustomUser {
    id: number;
    name: string;
    email: string;
    role: "admin" | "student" | "parent";
  }
  
  declare module "express-session" {
    interface SessionData {
      user: CustomUser;
    }
  }
  