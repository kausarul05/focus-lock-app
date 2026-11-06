import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radius, shadow } from '../theme';
import { Tab } from '../types';

type IconProps = { color: string };

const PlantIcon = ({ color }: IconProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M12 21v-7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path
      d="M12 14c0-3.3-2.7-6-6-6 0 3.3 2.7 6 6 6zm0 0c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z"
      fill={color}
    />
    <Circle cx={12} cy={5} r={2.4} fill={color} />
  </Svg>
);

const ForestIcon = ({ color }: IconProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M7 17.5V21M17 17.5V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M7 3.5l4.2 7.2H2.8L7 3.5zm0 5l3.4 6H3.6l3.4-6z" fill={color} />
    <Path d="M17 7l3.6 6.2h-7.2L17 7zm0 4.4l3 5.1h-6l3-5.1z" fill={color} opacity={0.75} />
  </Svg>
);

const MeIcon = ({ color }: IconProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={3.6} fill={color} />
    <Path d="M4.5 20c0-4.1 3.4-6.4 7.5-6.4s7.5 2.3 7.5 6.4H4.5z" fill={color} opacity={0.8} />
  </Svg>
);

const TABS: { key: Tab; label: string; Icon: (p: IconProps) => React.JSX.Element }[] = [
  { key: 'home', label: 'Plant', Icon: PlantIcon },
  { key: 'history', label: 'Forest', Icon: ForestIcon },
  { key: 'settings', label: 'Me', Icon: MeIcon },
];

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {TABS.map(({ key, label, Icon }) => {
          const on = key === tab;
          return (
            <Pressable
              key={key}
              style={({ pressed }) => [styles.item, on && styles.itemOn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                if (!on) Haptics.selectionAsync().catch(() => {});
                onChange(key);
              }}
            >
              <Icon color={on ? colors.primaryDeep : colors.muted} />
              <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 10, paddingTop: 4 },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 7,
    ...shadow.card,
  },
  item: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: 'center', gap: 3 },
  itemOn: { backgroundColor: colors.primarySoft },
  label: { color: colors.muted, fontWeight: '700', fontSize: 11.5, letterSpacing: 0.3 },
  labelOn: { color: colors.primaryDeep },
});
