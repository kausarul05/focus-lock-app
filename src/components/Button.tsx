import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
};

const BG = {
  primary: colors.primary,
  success: colors.accent,
  danger: colors.warn,
  ghost: 'transparent',
};

export default function Button({ label, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BG[variant] },
        variant === 'ghost' && { borderWidth: 1.5, borderColor: colors.cardBorder },
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'success' && { color: colors.bg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
