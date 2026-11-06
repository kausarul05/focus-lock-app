import React, { useEffect, useMemo } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow } from '../theme';
import { Result, Settings } from '../types';
import { formatDuration } from '../format';
import { levelTitle, REWARD_BADGES } from '../content';
import Confetti from '../components/Confetti';
import Button from '../components/Button';
import Tree from '../components/Tree';

type Props = { result: Result; settings: Settings; onDone: () => void };

export default function ResultScreen({ result, settings, onDone }: Props) {
  const pop = useMemo(() => new Animated.Value(0), []);
  const badge = useMemo(
    () => [...REWARD_BADGES].reverse().find((b) => result.plannedMin >= b.min)!,
    [result.plannedMin],
  );

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    if (result.completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [pop, result.completed]);

  const title = result.completed
    ? settings.name
      ? 'Well done, ' + settings.name
      : 'Tree planted'
    : 'Your tree withered';

  // A partly finished session leaves a half-grown, dried-out tree
  const stage = result.completed
    ? 1
    : Math.max(0.25, Math.min(0.9, result.focusedMin / Math.max(1, result.plannedMin)));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Animated.View style={[styles.treeWrap, { transform: [{ scale: pop }] }]}>
          <Tree size={168} stage={stage} withered={!result.completed} />
        </Animated.View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.line}>{result.line}</Text>

        <View style={styles.statsRow}>
          <Cell label="Focused" value={formatDuration(result.focusedMin)} />
          <View style={styles.vline} />
          <Cell label="Planned" value={formatDuration(result.plannedMin)} />
          <View style={styles.vline} />
          <Cell label="XP earned" value={'+' + result.xpGained} color={colors.primaryDeep} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLbl}>SESSION</Text>
          <Text style={styles.cardTxt}>{result.goal}</Text>
        </View>

        {result.completed && (
          <View style={[styles.card, styles.rewardCard]}>
            <Text style={[styles.cardLbl, { color: colors.gold }]}>REWARD UNLOCKED</Text>
            <Text style={[styles.cardTxt, { color: '#B9821F' }]}>{badge.name}</Text>
            {!!settings.mainGoal && (
              <Text style={styles.myReward}>One step closer to: {settings.mainGoal}</Text>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          {result.streak} day streak · Level {result.level} {levelTitle(result.level)}
        </Text>
        {result.leveledUp && <Text style={styles.levelUp}>Level up!</Text>}

        <Button
          label={result.completed ? 'Done' : 'Try again'}
          onPress={onDone}
          style={{ marginTop: 26, alignSelf: 'stretch' }}
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
  wrap: { padding: 24, alignItems: 'center', paddingTop: 34, paddingBottom: 32 },
  treeWrap: { alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  line: {
    color: colors.textSoft,
    fontSize: 15.5,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 26,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 14,
    paddingVertical: 18,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  vline: { width: 1, height: 28, backgroundColor: colors.cardBorder },
  cellVal: { color: colors.text, fontSize: 21, fontWeight: '800' },
  cellLbl: { color: colors.muted, fontSize: 11.5, marginTop: 3, fontWeight: '600' },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 12,
    ...shadow.card,
  },
  rewardCard: { backgroundColor: '#FDF4DF' },
  cardLbl: { color: colors.muted, fontSize: 10.5, letterSpacing: 1.4, fontWeight: '700' },
  cardTxt: { color: colors.text, fontSize: 17.5, fontWeight: '700', marginTop: 6 },
  myReward: { color: colors.textSoft, marginTop: 8, fontSize: 14.5, lineHeight: 21 },
  footer: { color: colors.muted, fontSize: 13.5, marginTop: 14, fontWeight: '600' },
  levelUp: { color: colors.primaryDeep, fontWeight: '800', marginTop: 6 },
});
