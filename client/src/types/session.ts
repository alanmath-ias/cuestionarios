export interface UserSession {
    userId: number;
    role: string;
    username: string;
    name: string;
    email?: string;
  }
  
  export interface AuthResponse {
    user: Omit<UserSession, 'userId'> & { id: number };
    token?: string;
  }

  
  //chat gpt quices a usuarios
  // client/src/types/index.ts
  export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  //fin chat gpt quices a usuarios
  