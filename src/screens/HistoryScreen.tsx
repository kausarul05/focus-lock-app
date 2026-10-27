import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { Stats } from '../types';
import { levelFromXp, levelTitle } from '../content';
import { formatDuration } from '../format';

const dayLabel = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function HistoryScreen({ stats }: { stats: Stats }) {
  const totalMin = stats.sessions.reduce((a, s) => a + s.focusedMin, 0);
  const completed = stats.sessions.filter((s) => s.completed).length;
  const level = levelFromXp(stats.xp);

  const groups = useMemo(() => {
    const out: { label: string; items: Stats['sessions'] }[] = [];
    for (const s of stats.sessions) {
      const label = dayLabel(s.date);
      const g = out[out.length - 1];
      if (g && g.label === label) g.items.push(s);
      else out.push({ label, items: [s] });
    }
    return out;
  }, [stats.sessions]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>History</Text>

      <View style={styles.summary}>
        <Cell value={formatDuration(totalMin)} label="Total focus" />
        <View style={styles.vline} />
        <Cell value={String(completed)} label="Completed" />
        <View style={styles.vline} />
        <Cell value={String(stats.streak)} label="Day streak" />
      </View>
      <Text style={styles.levelLine}>
        Level {level} · {levelTitle(level)} · Best streak {stats.bestStreak}
      </Text>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySub}>Finish your first focus session and it will show up here.</Text>
        </View>
      ) : (
        groups.map((g) => (
          <View key={g.label + g.items[0].id}>
            <Text style={styles.day}>{g.label}</Text>
            {g.items.map((s) => (
              <View key={s.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: s.completed ? colors.accent : colors.muted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.goal} numberOfLines={1}>
                    {s.goal}
                  </Text>
                  <Text style={styles.meta}>
                    {s.completed ? 'Completed' : 'Stopped early'} ·{' '}
                    {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.dur}>
                  {formatDuration(s.focusedMin)}
                  <Text style={styles.durOf}> / {formatDuration(s.plannedMin)}</Text>
                </Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const Cell = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={styles.cellVal}>{value}</Text>
    <Text style={styles.cellLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
  },
  vline: { width: 1, height: 30, backgroundColor: colors.cardBorder },
  cellVal: { color: colors.text, fontSize: 22, fontWeight: '700' },
  cellLbl: { color: colors.muted, fontSize: 12, marginTop: 2 },
  levelLine: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 12 },
  day: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 28, marginBottom: 6, letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  goal: { color: colors.text, fontSize: 16, fontWeight: '500' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  dur: { color: colors.text, fontSize: 15, fontWeight: '700' },
  durOf: { color: colors.muted, fontWeight: '400' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptySub: { color: colors.muted, fontSize: 14, marginTop: 6, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
});
