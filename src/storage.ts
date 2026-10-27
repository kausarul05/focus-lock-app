import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveSession, Settings, Stats } from './types';

const STATS_KEY = 'focuslock:stats';
const ACTIVE_KEY = 'focuslock:active';
const DRAFT_KEY = 'focuslock:draft';
const SETTINGS_KEY = 'focuslock:settings';

export const emptyStats: Stats = {
  sessions: [],
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastDay: null,
};

export const emptySettings: Settings = { name: '', mainGoal: '' };

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const read = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) =>
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

export const loadStats = () => read<Stats>(STATS_KEY, emptyStats);
export const saveStats = (s: Stats) => write(STATS_KEY, s);

export const loadSettings = () => read<Settings>(SETTINGS_KEY, emptySettings);
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

export const loadActive = () => read<ActiveSession | null>(ACTIVE_KEY, null);
export const saveActive = (a: ActiveSession) => write(ACTIVE_KEY, a);
export const clearActive = () => AsyncStorage.removeItem(ACTIVE_KEY).catch(() => {});

export type Draft = { goal: string; seconds: number };
export const loadDraft = () => read<Draft | null>(DRAFT_KEY, null);
export const saveDraft = (d: Draft) => write(DRAFT_KEY, d);
