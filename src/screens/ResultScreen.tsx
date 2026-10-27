import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';
import { Result, Settings } from '../types';
import { formatDuration } from '../format';
import { levelTitle, pick, PRAISE, QUIT_LINES, REWARD_BADGES } from '../content';
import Confetti from '../components/Confetti';
import Button from '../components/Button';

type Props = { result: Result; settings: Settings; onDone: () => void };

export default function ResultScreen({ result, settings, onDone }: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const line = useRef(result.completed ? pick(PRAISE) : pick(QUIT_LINES)).current;
  const badge = [...REWARD_BADGES].reverse().find((b) => result.plannedMin >= b.min)!;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    if (result.completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [pop, result.completed]);

  const title = result.completed
    ? settings.name
      ? `Well done, ${settings.name}`
      : 'Goal complete'
    : 'Session ended';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Animated.View
          style={[
            styles.icon,
            { transform: [{ scale: pop }] },
            { backgroundColor: result.completed ? colors.accent : colors.card },
          ]}
        >
          <Text style={[styles.iconTxt, { color: result.completed ? colors.bg : colors.muted }]}>
            {result.completed ? '✓' : '–'}
          </Text>
        </Animated.View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.line}>{line}</Text>

        <View style={styles.statsRow}>
          <Cell label="Focused" value={formatDuration(result.focusedMin)} />
          <View style={styles.vline} />
          <Cell label="Planned" value={formatDuration(result.plannedMin)} />
          <View style={styles.vline} />
          <Cell label="XP earned" value={`+${result.xpGained}`} color={colors.accent} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>SESSION</Text>
          <Text style={styles.cardTxt}>{result.goal}</Text>
        </View>

        {result.completed && (
          <View style={[styles.card, styles.rewardCard]}>
            <Text style={[styles.cardLbl, { color: colors.gold }]}>REWARD UNLOCKED</Text>
            <Text style={[styles.cardTxt, { color: colors.gold }]}>{badge.name}</Text>
            {!!settings.mainGoal && <Text style={styles.myReward}>One step closer to: {settings.mainGoal}</Text>}
          </View>
        )}

        <Text style={styles.footer}>
          {result.streak} day streak · Level {result.level} {levelTitle(result.level)}
        </Text>
        {result.leveledUp && <Text style={styles.levelUp}>Level up!</Text>}

        <Button
          label={result.completed ? 'Done' : 'Try again'}
          onPress={onDone}
          style={{ marginTop: 28, alignSelf: 'stretch' }}
        />
      </ScrollView>
      {result.completed && <Confetti />}
    </View>
  );
}

const Cell = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={[styles.cellVal, color ? { color } : null]}>{value}</Text>
    <Text style={styles.cellLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: 'center', paddingTop: 56 },
  icon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 48, fontWeight: '700' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 24, textAlign: 'center' },
  line: { color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 23, paddingHorizontal: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginBottom: 28 },
  vline: { width: 1, height: 28, backgroundColor: colors.cardBorder },
  cellVal: { color: colors.text, fontSize: 22, fontWeight: '700' },
  cellLbl: { color: colors.muted, fontSize: 12, marginTop: 2 },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 12,
  },
  rewardCard: { borderColor: colors.gold },
  cardLbl: { color: colors.muted, fontSize: 11, letterSpacing: 1.5 },
  cardTxt: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 6 },
  myReward: { color: colors.text, marginTop: 8, fontSize: 15 },
  footer: { color: colors.muted, fontSize: 14, marginTop: 16 },
  levelUp: { color: colors.accent, fontWeight: '700', marginTop: 8 },
});
