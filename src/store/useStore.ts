import { create } from 'zustand';
import type { User, Session, Score } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Current session
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;

  // Current group ID
  currentGroupId: string | null;
  setCurrentGroupId: (groupId: string | null) => void;

  // Scores in current session
  scores: Score[];
  setScores: (scores: Score[]) => void;
  updateScore: (userId: string, score: number) => void;

  // Speaking state (who is currently speaking in the group)
  speakingUserId: string | null;
  setSpeakingUserId: (userId: string | null) => void;

  // AI guidance
  aiGuidance: string | null;
  aiGuidanceLoading: boolean;
  setAiGuidance: (guidance: string | null) => void;
  setAiGuidanceLoading: (loading: boolean) => void;

  // Session timer
  timeRemaining: number; // seconds
  setTimeRemaining: (time: number) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  currentGroupId: null,
  setCurrentGroupId: (groupId) => set({ currentGroupId: groupId }),

  scores: [],
  setScores: (scores) => set({ scores }),
  updateScore: (userId, score) =>
    set((state) => ({
      scores: state.scores.map((s) =>
        s.user_id === userId ? { ...s, total_score: score } : s
      ),
    })),

  speakingUserId: null,
  setSpeakingUserId: (userId) => set({ speakingUserId: userId }),

  aiGuidance: null,
  aiGuidanceLoading: false,
  setAiGuidance: (guidance) => set({ aiGuidance: guidance }),
  setAiGuidanceLoading: (loading) => set({ aiGuidanceLoading: loading }),

  timeRemaining: 0,
  setTimeRemaining: (time) => set({ timeRemaining: time }),
}));
