export interface SpeakingLog {
  id: string;
  user_id: string;
  group_id: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in seconds
}

export interface SpeakingState {
  isSpeaking: boolean;
  speakingUserId: string | null;
  startTime: number | null;
}
