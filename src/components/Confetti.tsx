import React, { useEffect, useMemo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');
const PALETTE = [colors.leaf, colors.primary, colors.leafDark, colors.gold, '#B8D38A', '#DCCB7A'];

// Scattered once when the module loads, so render stays free of random values
const SHAPES = Array.from({ length: 64 }, (_, i) => ({
  x: Math.random() * width,
  size: 9 + Math.random() * 9,
  color: PALETTE[i % PALETTE.length],
  delay: Math.random() * 1000,
  duration: 2800 + Math.random() * 2200,
  drift: (Math.random() - 0.5) * 160,
  spin: Math.random() * 3 + 1.5,
  tilt: Math.random() * 90,
}));

// Leaves drifting down, used when a session is completed
export default function Confetti({ count = 38 }: { count?: number }) {
  const leaves = useMemo(
    () =>
      SHAPES.slice(0, Math.min(count, SHAPES.length)).map((s, i) => ({
        ...s,
        key: i,
        anim: new Animated.Value(0),
      })),
    [count],
  );

  useEffect(() => {
    leaves.forEach((l) =>
      Animated.timing(l.anim, {
        toValue: 1,
        duration: l.duration,
        delay: l.delay,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(),
    );
  }, [leaves]);

  return (
    <>
      {leaves.map((l) => (
        <Animated.View
          key={l.key}
          pointerEvents="none"
          style={[
            styles.leaf,
            {
              left: l.x,
              width: l.size,
              height: l.size * 1.35,
              borderRadius: l.size,
              backgroundColor: l.color,
              opacity: l.anim.interpolate({
                inputRange: [0, 0.06, 0.82, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: l.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, height + 50],
                  }),
                },
                {
                  translateX: l.anim.interpolate({
                    inputRange: [0, 0.35, 0.7, 1],
                    outputRange: [0, l.drift, -l.drift * 0.6, l.drift * 0.3],
                  }),
                },
                {
                  rotate: l.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [l.tilt + 'deg', l.tilt + l.spin * 360 + 'deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  // One square corner turns the blob into a leaf silhouette
  leaf: { position: 'absolute', top: 0, borderBottomRightRadius: 1 },
});
