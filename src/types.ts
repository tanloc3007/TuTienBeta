export interface CharacterLog {
  id: string;
  time: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

export interface ActiveBuff {
  type: 'elixir' | 'tea' | 'focus';
  expireTime: number;
  label: string;
}

export interface CultivationTier {
  id: number;
  name: string;
  maxSubLevel: number;
  baseRate: number;
  requiredIelts: number;
  titleViet: string;
}

export interface PracticeQuestion {
  id: string;
  category: 'vocabulary' | 'speaking' | 'writing';
  topic: string;
  question: string;
  options?: string[]; // for vocabulary MCQ
  answerIndex?: number; // for MCQ
  hint: string;
  context?: string;
}

export interface BreakthroughChallenge {
  title: string;
  description: string;
  requirement: string;
  placeholder: string;
}

export interface FocusSessionState {
  startTime: number;
  durationMs: number;
  isActive: boolean;
}

export interface CultivationState {
  name: string;
  daoPath: 'vocabulary' | 'speaking' | 'writing';
  tier: number; // 1-7 (Luyện Khí to Hợp Thể)
  subLevel: number; // Tầng 1-9
  tuVi: number;
  tuViRequired: number;
  spiritStones: number;
  tamMa: number; // 0-100
  lastUpdate: number;
  activeBuffs: ActiveBuff[];
  logs: CharacterLog[];
  
  // Custom Statistics for IELTS Scholar
  studyMinutes: number;
  beQuanCount: number;
  backlashCount: number;
  answeredCount: number;
  
  // Extra client support
  tiers?: CultivationTier[];
  challenges?: Record<number, BreakthroughChallenge>;
  currentSession?: FocusSessionState | null;
}
