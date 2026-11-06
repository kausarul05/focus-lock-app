import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Dimensions, Modal, StyleSheet, Text, Vibration, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, radius, shadow } from '../theme';
import { ActiveSession, Settings } from '../types';
import { formatClock, formatLeft } from '../format';
import { buildPersuade, buildTips } from '../content';
import Ring from '../components/Ring';
import Tree from '../components/Tree';
import Button from '../components/Button';

const QUIT_DELAY = 5; // seconds the "Give up" button stays locked
const MAX_PAUSE_MS = 120000; // most time the confirm sheet can add back to the clock
const { width } = Dimensions.get('window');
const RING = Math.min(304, width - 72);

type Props = {
  session: ActiveSession;
  settings: Settings;
  onShiftEnd: (newEndAt: number) => void;
  onFinish: () => void;
  onQuit: (remainingMs: number) => void;
};

export default function TimerScreen({ session, settings, onShiftEnd, onFinish, onQuit }: Props) {
  useKeepAwake();
  const tips = useMemo(() => buildTips(settings.name, settings.mainGoal), [settings]);
  // The effect below ticks immediately on mount and corrects this
  const [remaining, setRemaining] = useState(session.totalMs);
  const [confirming, setConfirming] = useState(false);
  const [pausedAt, setPausedAt] = useState(0);
  const [persuade, setPersuade] = useState('');
  const [lock, setLock] = useState(QUIT_DELAY);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const done = useRef(false);
  const tickRef = useRef(() => {});
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  // The clock is frozen while the confirmation sheet is open
  useEffect(() => {
    if (confirming) {
      tickRef.current = () => {};
      return;
    }
    const tick = () => {
      const left = session.endAt - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0 && !done.current) {
        done.current = true;
        Vibration.vibrate([0, 400, 200, 400]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        finishRef.current();
      }
    };
    tickRef.current = tick;
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [confirming, session.endAt]);

  // The countdown is wall-clock based, so leaving the app, locking the phone or
  // even restarting the device never stops it. Re-check the moment we are back.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tickRef.current();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 20000);
    return () => clearInterval(id);
  }, [tips]);

  useEffect(() => {
    if (!confirming) return;
    const id = setInterval(() => setLock((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [confirming]);

  const askStop = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    const left = Math.max(0, session.endAt - Date.now());
    setPausedAt(Date.now());
    setLock(QUIT_DELAY);
    setPersuade(buildPersuade(settings.name, settings.mainGoal, formatLeft(left), session.goal));
    setConfirming(true);
  }, [session, settings]);

  const keepGoing = () => {
    // Give back the time the sheet was open, but capped: the sheet is for a few
    // seconds of second-guessing, not a way to park the timer indefinitely
    onShiftEnd(session.endAt + Math.min(Date.now() - pausedAt, MAX_PAUSE_MS));
    setConfirming(false);
  };

  const progress = 1 - remaining / session.totalMs;
  const clock = formatClock(remaining);

  return (
    <View style={styles.wrap}>
      <View style={styles.tag}>
        <View style={styles.tagDot} />
        <Text style={styles.tagTxt} numberOfLines={2}>
          {session.goal}
        </Text>
      </View>

      <View style={{ marginTop: 26 }}>
        <Ring size={RING} stroke={Math.round(RING * 0.055)} progress={progress}>
          <Tree size={RING * 0.5} stage={progress} />
          <Text style={[styles.clock, clock.length > 5 && styles.clockLong]}>{clock}</Text>
          <Text style={styles.pct}>{Math.floor(progress * 100)}% grown</Text>
        </Ring>
      </View>

      <Text style={styles.growing}>Your tree is growing</Text>
      <Text style={styles.tip}>{tips[tipIdx % tips.length]}</Text>

      <Text style={styles.keepsRunning}>
        Close the app or lock your phone — this keeps running.
      </Text>

      <Button label="Give up" variant="ghost" onPress={askStop} style={styles.stopBtn} />

      <Modal visible={confirming} transparent animationType="fade" onRequestClose={keepGoing}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Tree size={84} stage={Math.max(0.3, progress)} withered />
            <Text style={styles.cardTitle}>Your tree will wither</Text>
            <Text style={styles.cardBody}>{persuade}</Text>

            <View style={styles.goalBox}>
              <Text style={styles.goalBoxLbl}>RIGHT NOW</Text>
              <Text style={styles.goalBoxTxt}>{session.goal}</Text>
              {!!settings.mainGoal && (
                <>
                  <Text style={[styles.goalBoxLbl, { marginTop: 10 }]}>BIG GOAL</Text>
                  <Text style={styles.goalBoxTxt}>{settings.mainGoal}</Text>
                </>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                label={lock > 0 ? 'Give up (' + lock + ')' : 'Give up'}
                variant="ghost"
                compact
                disabled={lock > 0}
                onPress={() => {
                  setConfirming(false);
                  onQuit(Math.max(0, session.endAt - pausedAt));
                }}
                style={styles.action}
              />
              <Button label="No" variant="primary" compact onPress={keepGoing} style={styles.action} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 26 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    maxWidth: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 18,
    ...shadow.card,
  },
  tagDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.leaf },
  tagTxt: { flexShrink: 1, color: colors.text, fontSize: 15, fontWeight: '700' },

  clock: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  clockLong: { fontSize: 34 },
  pct: { color: colors.muted, marginTop: 1, fontSize: 12.5, fontWeight: '600', letterSpacing: 0.5 },

  growing: { color: colors.primaryDeep, fontSize: 15, fontWeight: '800', marginTop: 26 },
  tip: {
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14.5,
    lineHeight: 21,
    paddingHorizontal: 10,
  },

  keepsRunning: {
    position: 'absolute',
    bottom: 94,
    left: 24,
    right: 24,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  stopBtn: { position: 'absolute', bottom: 26, left: 24, right: 24 },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(46,58,43,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.bg,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
    ...shadow.raised,
  },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  cardBody: {
    color: colors.textSoft,
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 14,
  },
  actions: { flexDirection: 'row', alignSelf: 'stretch', gap: 10 },
  action: { flex: 1, paddingHorizontal: 10 },
  goalBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 15,
    marginBottom: 16,
    ...shadow.card,
  },
  goalBoxLbl: { color: colors.muted, fontSize: 10.5, letterSpacing: 1.4, fontWeight: '700' },
  goalBoxTxt: { color: colors.text, fontSize: 15.5, fontWeight: '600', marginTop: 4 },
});
