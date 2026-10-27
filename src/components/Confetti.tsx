import React, { useEffect, useMemo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');
const PALETTE = [colors.primary, colors.accent, colors.gold, colors.warn, '#4DA3FF', '#FF8AD8'];

export default function Confetti({ count = 45 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        x: Math.random() * width,
        size: 6 + Math.random() * 8,
        color: PALETTE[i % PALETTE.length],
        delay: Math.random() * 900,
        duration: 2400 + Math.random() * 1800,
        drift: (Math.random() - 0.5) * 120,
        spin: Math.random() * 6 + 2,
        anim: new Animated.Value(0),
      })),
    [count],
  );

  useEffect(() => {
    pieces.forEach((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(),
    );
  }, [pieces]);

  return (
    <>
      {pieces.map((p) => (
        <Animated.View
          key={p.key}
          pointerEvents="none"
          style={[
            styles.piece,
            {
              left: p.x,
              width: p.size,
              height: p.size * 1.6,
              backgroundColor: p.color,
              opacity: p.anim.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }) },
                { translateX: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 360}deg`] }) },
              ],
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, borderRadius: 2 },
});
