import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, shadow } from '../theme';
import { Settings, Stats } from '../types';
import { greeting } from '../content';
import { formatClock } from '../format';
import { loadDraft, saveDraft } from '../storage';
import Button from '../components/Button';
import Dial from '../components/Dial';
import Tree from '../components/Tree';
import WheelPicker from '../components/WheelPicker';

const { width } = Dimensions.get('window');
const DIAL = Math.min(306, width - 76);
const MAX_MIN = 180;

type Props = { settings: Settings; stats: Stats; onStart: (goal: string, seconds: number) => void };

export default function HomeScreen({ settings, stats, onStart }: Props) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [goal, setGoal] = useState('');
  const [exact, setExact] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  // The wheel reads its start position once, so mount it after the saved draft loads
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadDraft().then((d) => {
      if (d) {
        setGoal(d.goal);
        setSeconds(d.seconds ?? 25 * 60);
      }
      setReady(true);
    });
  }, []);

  // The label sits under a tall dial, so lift it clear of the keyboard.
  // Android resizes the window and iOS pads it; either way the end of the
  // list is where the input and the Plant button are.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () =>
      scrollRef.current?.scrollToEnd({ animated: true }),
    );
    return () => sub.remove();
  }, []);

  const start = () => {
    const g = goal.trim() || 'Focus session';
    saveDraft({ goal: goal.trim(), seconds });
    onStart(g, seconds);
  };

  const clock = formatClock(seconds * 1000);
  const minutes = Math.max(1, Math.round(seconds / 60));
  // A longer session plants a bigger tree, so the preview grows with the dial
  const preview = 0.34 + 0.66 * Math.min(1, minutes / MAX_MIN);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>{greeting(settings.name)}</Text>
            <Text style={styles.main} numberOfLines={2}>
              {settings.mainGoal || 'Plant a tree and keep it alive.'}
            </Text>
          </View>
          <View style={styles.streak}>
            <Tree size={20} stage={0.85} bare />
            <Text style={styles.streakTxt}>{stats.streak}</Text>
          </View>
        </View>

        <View style={styles.dialWrap}>
          <Dial size={DIAL} minutes={minutes} max={MAX_MIN} step={5} onChange={(m) => setSeconds(m * 60)}>
            <Tree size={DIAL * 0.46} stage={preview} />
            {/* An hours reading is wider, so it steps down to clear the dial knob */}
            <Text style={[styles.clock, clock.length > 5 && styles.clockLong]}>{clock}</Text>
            <Text style={styles.clockSub}>drag the ring</Text>
          </Dial>
        </View>

        <Pressable onPress={() => setExact(true)} style={styles.exactBtn}>
          <Text style={styles.exactTxt}>Set exact time</Text>
        </Pressable>

        <View style={styles.tag}>
          <View style={styles.tagDot} />
          <TextInput
            value={goal}
            onChangeText={setGoal}
            placeholder="What are you focusing on?"
            placeholderTextColor={colors.muted}
            style={styles.tagInput}
            maxLength={120}
          />
        </View>

        <Button label="Plant" onPress={start} disabled={seconds < 1} style={{ marginTop: 20 }} />
        <Text style={styles.note}>
          Your tree keeps growing even if you close the app or lock your phone.
        </Text>
      </ScrollView>

      <Modal visible={exact} transparent animationType="slide" onRequestClose={() => setExact(false)}>
        <View style={styles.backdrop}>
          {/* Only the area above the sheet closes it: a Pressable around the
              sheet would swallow the wheel's drag gestures */}
          <Pressable style={{ flex: 1 }} onPress={() => setExact(false)} />
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>Exact time</Text>
            {ready && <WheelPicker seconds={seconds} onChange={setSeconds} />}
            <Button
              label="Done"
              onPress={() => setExact(false)}
              style={{ alignSelf: 'stretch', marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  hello: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  main: { color: colors.textSoft, fontSize: 14.5, marginTop: 5, lineHeight: 20 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    ...shadow.card,
  },
  streakTxt: { color: colors.primaryDeep, fontWeight: '800', fontSize: 14 },

  dialWrap: { alignItems: 'center', marginTop: 22 },
  clock: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  clockLong: { fontSize: 30 },
  clockSub: { color: colors.muted, fontSize: 11.5, fontWeight: '600', letterSpacing: 1, marginTop: 1 },

  exactBtn: { alignSelf: 'center', marginTop: 14, paddingVertical: 6, paddingHorizontal: 14 },
  exactTxt: {
    color: colors.primaryDeep,
    fontSize: 13.5,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  tagDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.leaf },
  tagInput: { flex: 1, paddingVertical: 16, color: colors.text, fontSize: 15.5, fontWeight: '500' },

  note: { color: colors.muted, fontSize: 12.5, textAlign: 'center', marginTop: 12 },

  backdrop: { flex: 1, backgroundColor: 'rgba(46,58,43,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    paddingBottom: 34,
    alignItems: 'center',
  },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.track, marginBottom: 14 },
  sheetTitle: { color: colors.text, fontSize: 19, fontWeight: '800', marginBottom: 6 },
});
