export type Session = {
  id: string;
  goal: string;
  plannedMin: number;
  focusedMin: number;
  completed: boolean;
  date: number;
};

export type Stats = {
  sessions: Session[];
  xp: number;
  streak: number;
  bestStreak: number;
  lastDay: string | null;
};

export type Settings = {
  name: string;
  mainGoal: string;
};

export type ActiveSession = {
  goal: string;
  totalMs: number;
  endAt: number;
};

export type Result = {
  completed: boolean;
  goal: string;
  plannedMin: number;
  focusedMin: number;
  xpGained: number;
  streak: number;
  level: number;
  leveledUp: boolean;
};

export type Tab = 'home' | 'history' | 'settings';
