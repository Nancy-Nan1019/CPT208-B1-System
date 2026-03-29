// Scoring constants
export const SCORE_PER_SECOND = 10; // points per second of speaking

// Speaking heartbeat interval in ms
export const SPEAKING_HEARTBEAT_INTERVAL = 200;

// Silence thresholds (in seconds)
export const INDIVIDUAL_SILENCE_THRESHOLD = 60;
export const GROUP_SILENCE_THRESHOLD = 30;
export const TIME_WARNING_THRESHOLD = 0.8; // 80% of total time elapsed

// Group size constraints
export const MIN_GROUP_SIZE = 2;
export const MAX_GROUP_SIZE = 8;
export const DEFAULT_GROUP_SIZE = 4;

// Session status
export const SESSION_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// User roles
export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

// Personality types
export const PERSONALITY = {
  EXTROVERT: 'E',
  INTROVERT: 'I',
} as const;

// Animation speeds for AI avatars (pixels per second)
export const AVATAR_BASE_SPEED = 50;
export const AVATAR_MAX_SPEED = 300;
