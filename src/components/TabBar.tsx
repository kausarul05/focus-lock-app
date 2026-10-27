import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';
import { Tab } from '../types';

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Timer' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' },
];

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable
              key={t.key}
              style={[styles.item, on && styles.itemOn]}
              onPress={() => {
                if (!on) Haptics.selectionAsync().catch(() => {});
                onChange(t.key);
              }}
            >
              <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 6 },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18,25,54,0.92)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 5,
  },
  item: { flex: 1, paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center' },
  itemOn: { backgroundColor: colors.primary },
  label: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  labelOn: { color: colors.text },
});
