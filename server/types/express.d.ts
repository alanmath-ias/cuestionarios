
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

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id'>; // Solo incluye el id
      // O si necesitas más propiedades:
      // user?: Partial<User>;
    }
  }
}


export {}; // evita conflicto de ámbito global
