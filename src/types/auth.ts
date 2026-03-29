export type UserRole = 'teacher' | 'student';
export type Personality = 'E' | 'I';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  personality: Personality | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
