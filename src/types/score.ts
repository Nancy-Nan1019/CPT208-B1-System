export interface Score {
  id: string;
  user_id: string;
  group_id: string;
  session_id: string;
  total_score: number;
  updated_at: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface ScoreUpdate {
  userId: string;
  delta: number;
}
