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
