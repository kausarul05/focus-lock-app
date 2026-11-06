import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadow } from '../theme';

type Variant = 'primary' | 'ghost' | 'danger' | 'success' | 'soft';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Tighter padding and label, for two buttons sharing a row */
  compact?: boolean;
  style?: ViewStyle;
};

const GRADIENT: Partial<Record<Variant, readonly [string, string]>> = {
  primary: [colors.leaf, colors.primaryDeep],
  success: [colors.leaf, colors.primary],
  danger: ['#D98471', colors.warn],
};

const FLAT: Partial<Record<Variant, string>> = {
  ghost: 'transparent',
  soft: colors.white,
};

export default function Button({ label, onPress, variant = 'primary', disabled, compact, style }: Props) {
  const gradient = GRADIENT[variant];
  const filled = !!gradient;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.baseCompact,
        !filled && { backgroundColor: FLAT[variant] },
        variant === 'ghost' && styles.ghost,
        variant === 'soft' && shadow.card,
        filled && shadow.raised,
        filled && { shadowColor: variant === 'danger' ? colors.warn : colors.primaryDeep },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.975 }], opacity: 0.94 },
        style,
      ]}
    >
      {gradient && (
        <View style={styles.fillWrap}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <Text
        numberOfLines={1}
        style={[styles.label, compact && styles.labelCompact, filled ? styles.labelOn : styles.labelOff]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  baseCompact: { paddingVertical: 16, paddingHorizontal: 10 },
  ghost: { borderWidth: 1.6, borderColor: 'rgba(79,157,105,0.35)' },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  labelCompact: { fontSize: 15.5, letterSpacing: 0.2 },
  labelOn: { color: colors.white },
  labelOff: { color: colors.primaryDeep },
});
