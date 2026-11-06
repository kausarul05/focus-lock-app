import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../theme';
import { Stats } from '../types';
import { levelFromXp, levelTitle, XP_PER_LEVEL } from '../content';
import { formatDuration } from '../format';
import Tree from '../components/Tree';

const MAX_TREES_PER_DAY = 14;

const dayLabel = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

// Bigger plans grow bigger trees in the forest grid
const stageOf = (plannedMin: number) => Math.min(1, 0.36 + (plannedMin / 120) * 0.64);

export default function HistoryScreen({ stats }: { stats: Stats }) {
  const totalMin = stats.sessions.reduce((a, s) => a + s.focusedMin, 0);
  const completed = stats.sessions.filter((s) => s.completed).length;
  const level = levelFromXp(stats.xp);
  const inLevel = (stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL;

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
      <Text style={styles.title}>My Forest</Text>
      <Text style={styles.sub}>Every finished session plants a tree here.</Text>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Cell value={formatDuration(totalMin)} label="Total focus" />
          <View style={styles.vline} />
          <Cell value={String(completed)} label="Trees" />
          <View style={styles.vline} />
          <Cell value={String(stats.streak)} label="Day streak" />
        </View>

        <View style={styles.levelBlock}>
          <View style={styles.levelHead}>
            <Text style={styles.levelTxt}>
              Level {level} · {levelTitle(level)}
            </Text>
            <Text style={styles.levelMeta}>Best streak {stats.bestStreak}</Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${Math.round(inLevel * 100)}%` }]} />
          </View>
        </View>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Tree size={120} stage={0.03} />
          <Text style={styles.emptyTitle}>Your forest is empty</Text>
          <Text style={styles.emptySub}>Finish your first session and your first tree grows here.</Text>
        </View>
      ) : (
        groups.map((g) => {
          const shown = g.items.slice(0, MAX_TREES_PER_DAY);
          const extra = g.items.length - shown.length;
          const dayMin = g.items.reduce((a, s) => a + s.focusedMin, 0);

          return (
            <View key={g.label + g.items[0].id} style={styles.group}>
              <View style={styles.dayHead}>
                <Text style={styles.day}>{g.label}</Text>
                <Text style={styles.dayMeta}>{formatDuration(dayMin)}</Text>
              </View>

              <View style={styles.grid}>
                {shown.map((s) => (
                  <Tree key={s.id} size={44} stage={stageOf(s.plannedMin)} withered={!s.completed} />
                ))}
                {extra > 0 && <Text style={styles.more}>+{extra}</Text>}
              </View>

              {g.items.map((s) => (
                <View key={s.id} style={styles.row}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: s.completed ? colors.primary : colors.wither },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goal} numberOfLines={1}>
                      {s.goal}
                    </Text>
                    <Text style={styles.meta}>
                      {s.completed ? 'Tree planted' : 'Withered'} ·{' '}
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
          );
        })
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
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  sub: { color: colors.textSoft, fontSize: 14, marginTop: 4 },

  summary: {
    marginTop: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  vline: { width: 1, height: 30, backgroundColor: colors.cardBorder },
  cellVal: { color: colors.text, fontSize: 21, fontWeight: '800' },
  cellLbl: { color: colors.muted, fontSize: 11.5, marginTop: 3, fontWeight: '600' },

  levelBlock: { marginTop: 18, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 14 },
  levelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelTxt: { color: colors.primaryDeep, fontSize: 13.5, fontWeight: '800' },
  levelMeta: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: 9,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.leaf },

  group: { marginTop: 26 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { color: colors.text, fontSize: 14.5, fontWeight: '800' },
  dayMeta: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.md,
  },
  more: { color: colors.muted, fontSize: 13, fontWeight: '700', alignSelf: 'center', marginLeft: 6 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  goal: { color: colors.text, fontSize: 15.5, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3, fontWeight: '500' },
  dur: { color: colors.text, fontSize: 14.5, fontWeight: '800' },
  durOf: { color: colors.muted, fontWeight: '500' },

  empty: { alignItems: 'center', marginTop: 56 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 6 },
  emptySub: {
    color: colors.textSoft,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 28,
    lineHeight: 20,
  },
});
