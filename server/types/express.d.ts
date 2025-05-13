/*import { User } from "../../shared/types";

//chat gpt dashboard personalizado
import "express";
import "express-session";

declare module "express" {
  export interface Request {
    user?: { id: number };
  }
}
//

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; // Esto evita que sea tratado como un módulo global

//chat gpt entrenamiento
// types/express-session.d.ts


declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: string;
      // agrega más campos si los usas
    };
  }
}


declare module "express-session" {
  interface SessionData {
    userId: number;
    role?: "admin" | "user";
  }
}


*///funcinaba bien esto antes de adminquizreview
// types/express-session.d.ts
import "express";
import "express-session";
import { User } from "@/shared/types"; // Ajusta el path si es necesario

// Agrega propiedad `user` al objeto Request de Express (si la usas para guardar información del usuario)
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Extiende los datos de sesión de express-session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    role?: "admin" | "user" | "student"; // puedes agregar otros roles si los usas
    username?: string;
  }
}

export {}; // evita conflicto de ámbito global
