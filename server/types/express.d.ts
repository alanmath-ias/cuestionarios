import { User } from "../../shared/types";

//chat gpt dashboard personalizado
import "express";

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
import "express-session";

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

import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: number;
    role?: "admin" | "user";
  }
}


//fin chat gpt entrenamiento
