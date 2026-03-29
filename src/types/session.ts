export type SessionStatus = 'waiting' | 'in_progress' | 'completed';

export interface Session {
  id: string;
  topic: string;
  duration: number; // in minutes
  groupSize: number;
  status: SessionStatus;
  teacher_id: string;
  created_at: string;
  started_at?: string;
}

export interface CreateSessionInput {
  topic: string;
  duration: number;
  groupSize: number;
}
