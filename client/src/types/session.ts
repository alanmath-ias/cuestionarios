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