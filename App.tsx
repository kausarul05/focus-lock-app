import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { ActiveSession, Result, Settings, Stats, Tab } from './src/types';
import {
  clearActive,
  dayKey,
  emptySettings,
  emptyStats,
  loadActive,
  loadSettings,
  loadStats,
  saveActive,
  saveSettings,
  saveStats,
} from './src/storage';
import { levelFromXp } from './src/content';
import Background from './src/components/Background';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TimerScreen from './src/screens/TimerScreen';
import ResultScreen from './src/screens/ResultScreen';

const yesterdayKey = () => dayKey(new Date(Date.now() - 24 * 3600 * 1000));

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    Promise.all([loadStats(), loadSettings(), loadActive()]).then(([st, se, a]) => {
      setStats(st);
      setSettings(se);
      setActive(a);
      setReady(true);
    });
  }, []);

  const start = useCallback((goal: string, seconds: number) => {
    const totalMs = seconds * 1000;
    const session = { goal, totalMs, endAt: Date.now() + totalMs };
    saveActive(session);
    setActive(session);
  }, []);

  const shiftEnd = useCallback((endAt: number) => {
    setActive((a) => {
      if (!a) return a;
      const next = { ...a, endAt };
      saveActive(next);
      return next;
    });
  }, []);

  const finish = useCallback(
    (session: ActiveSession, completed: boolean, remainingMs: number) => {
      const plannedMin = Math.max(1, Math.round(session.totalMs / 60000));
      const focusedMin = completed
        ? plannedMin
        : Math.max(0, Math.floor((session.totalMs - remainingMs) / 60000));
      const xpGained = completed ? plannedMin : Math.floor(focusedMin / 4);
      const today = dayKey();

      let streak = stats.streak;
      let lastDay = stats.lastDay;
      if (completed && lastDay !== today) {
        streak = lastDay === yesterdayKey() ? streak + 1 : 1;
        lastDay = today;
      }
      const next: Stats = {
        sessions: [
          {
            id: String(Date.now()),
            goal: session.goal,
            plannedMin,
            focusedMin,
            completed,
            date: Date.now(),
          },
          ...stats.sessions,
        ].slice(0, 200),
        xp: stats.xp + xpGained,
        streak,
        bestStreak: Math.max(stats.bestStreak, streak),
        lastDay,
      };
      saveStats(next);
      clearActive();
      setStats(next);
      setActive(null);
      setResult({
        completed,
        goal: session.goal,
        plannedMin,
        focusedMin,
        xpGained,
        streak,
        level: levelFromXp(next.xp),
        leveledUp: levelFromXp(next.xp) > levelFromXp(stats.xp),
      });
    },
    [stats],
  );

  const updateSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const resetHistory = useCallback(() => {
    setStats(emptyStats);
    saveStats(emptyStats);
  }, []);

  return (
    <SafeAreaProvider>
      <Background />
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        {!ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : result ? (
          <ResultScreen result={result} settings={settings} onDone={() => setResult(null)} />
        ) : active ? (
          <TimerScreen
            session={active}
            settings={settings}
            onShiftEnd={shiftEnd}
            onFinish={() => finish(active, true, 0)}
            onQuit={(left) => finish(active, false, left)}
          />
        ) : (
          <>
            <View style={{ flex: 1 }}>
              {tab === 'home' && <HomeScreen settings={settings} onStart={start} />}
              {tab === 'history' && <HistoryScreen stats={stats} />}
              {tab === 'settings' && (
                <SettingsScreen settings={settings} onSave={updateSettings} onReset={resetHistory} />
              )}
            </View>
            <TabBar tab={tab} onChange={setTab} />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
