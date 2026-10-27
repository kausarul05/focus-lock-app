import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, Vibration, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, radius } from '../theme';
import { ActiveSession, Settings } from '../types';
import { formatClock, formatLeft } from '../format';
import { buildPersuade, buildTips } from '../content';
import Ring from '../components/Ring';
import Button from '../components/Button';

const QUIT_DELAY = 5; // seconds the "Stop anyway" button stays locked

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
  const [remaining, setRemaining] = useState(Math.max(0, session.endAt - Date.now()));
  const [confirming, setConfirming] = useState(false);
  const [pausedAt, setPausedAt] = useState(0);
  const [persuade, setPersuade] = useState('');
  const [lock, setLock] = useState(QUIT_DELAY);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const done = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // The clock is frozen while the confirmation sheet is open
  useEffect(() => {
    if (confirming) return;
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
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [confirming, session.endAt]);

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 20000);
    return () => clearInterval(id);
  }, [tips]);

  useEffect(() => {
    if (!confirming) return;
    setLock(QUIT_DELAY);
    const id = setInterval(() => setLock((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [confirming]);

  const askStop = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    const left = Math.max(0, session.endAt - Date.now());
    setPausedAt(Date.now());
    setPersuade(buildPersuade(settings.name, settings.mainGoal, formatLeft(left), session.goal));
    setConfirming(true);
  }, [session, settings]);

  const keepGoing = () => {
    // Push the end time forward by however long the sheet was open
    onShiftEnd(session.endAt + (Date.now() - pausedAt));
    setConfirming(false);
  };

  const progress = 1 - remaining / session.totalMs;

  return (
    <View style={styles.wrap}>
      <Text style={styles.tag}>FOCUSING</Text>
      <Text style={styles.goal} numberOfLines={3}>
        {session.goal}
      </Text>

      <View style={{ marginTop: 40 }}>
        <Ring size={280} stroke={10} progress={progress}>
          <Text style={styles.clock}>{formatClock(remaining)}</Text>
          <Text style={styles.pct}>{Math.floor(progress * 100)}% complete</Text>
        </Ring>
      </View>

      <Text style={styles.tip}>{tips[tipIdx % tips.length]}</Text>

      <Button label="Stop" variant="ghost" onPress={askStop} style={styles.stopBtn} />

      <Modal visible={confirming} transparent animationType="fade" onRequestClose={keepGoing}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>Want to give up?</Text>
            <Text style={styles.sheetBody}>{persuade}</Text>
            <View style={styles.goalBox}>
              <Text style={styles.goalBoxLbl}>RIGHT NOW</Text>
              <Text style={styles.goalBoxTxt}>{session.goal}</Text>
              {!!settings.mainGoal && (
                <>
                  <Text style={[styles.goalBoxLbl, { marginTop: 12 }]}>BIG GOAL</Text>
                  <Text style={styles.goalBoxTxt}>{settings.mainGoal}</Text>
                </>
              )}
            </View>
            <Button label="Keep going" variant="success" onPress={keepGoing} style={{ alignSelf: 'stretch' }} />
            <Button
              label={lock > 0 ? `Stop anyway (${lock})` : 'Stop anyway'}
              variant="ghost"
              disabled={lock > 0}
              onPress={() => {
                setConfirming(false);
                onQuit(Math.max(0, session.endAt - pausedAt));
              }}
              style={{ marginTop: 10, alignSelf: 'stretch' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  tag: { color: colors.accent, fontWeight: '700', letterSpacing: 3, fontSize: 12 },
  goal: { color: colors.text, fontSize: 20, fontWeight: '600', textAlign: 'center', marginTop: 10, lineHeight: 28 },
  clock: { color: colors.text, fontSize: 58, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pct: { color: colors.muted, marginTop: 4, fontSize: 14 },
  tip: { color: colors.muted, textAlign: 'center', marginTop: 36, fontSize: 15, lineHeight: 22, paddingHorizontal: 16 },
  stopBtn: { position: 'absolute', bottom: 28, left: 24, right: 24 },
  backdrop: { flex: 1, backgroundColor: '#000000B3', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#121936',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  grabber: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.cardBorder, marginBottom: 20 },
  sheetTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sheetBody: { color: colors.muted, fontSize: 16, textAlign: 'center', lineHeight: 23, marginVertical: 14 },
  goalBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
  },
  goalBoxLbl: { color: colors.muted, fontSize: 11, letterSpacing: 1.5 },
  goalBoxTxt: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 },
});
