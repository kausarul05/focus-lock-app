import React, { useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius } from '../theme';

const ITEM_H = 48;
const VISIBLE = 5;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

type WheelProps = { count: number; value: number; onChange: (v: number) => void; label: string };

function Wheel({ count, value, onChange, label }: WheelProps) {
  const scrollY = useRef(new Animated.Value(value * ITEM_H)).current;
  const last = useRef(value);
  const ref = useRef<React.ComponentRef<typeof Animated.ScrollView>>(null);
  const data = useRef(Array.from({ length: count }, (_, i) => i)).current;

  const indexOf = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    Math.min(count - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / ITEM_H)));

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => onChange(indexOf(e));

  return (
    <View style={styles.col}>
      <Animated.ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: PAD }}
        contentOffset={{ x: 0, y: value * ITEM_H }}
        // contentOffset is iOS-only, so also jump to the saved value on Android
        onLayout={() => ref.current?.scrollTo({ y: value * ITEM_H, animated: false })}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const idx = indexOf(e);
            if (idx !== last.current) {
              last.current = idx;
              Haptics.selectionAsync().catch(() => {});
            }
          },
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
      >
        {data.map((item) => {
          const c = item * ITEM_H;
          const range = [c - 2 * ITEM_H, c - ITEM_H, c, c + ITEM_H, c + 2 * ITEM_H];
          return (
            <Animated.Text
              key={item}
              style={[
                styles.num,
                {
                  opacity: scrollY.interpolate({ inputRange: range, outputRange: [0.12, 0.38, 1, 0.38, 0.12], extrapolate: 'clamp' }),
                  transform: [
                    { scale: scrollY.interpolate({ inputRange: range, outputRange: [0.78, 0.9, 1.08, 0.9, 0.78], extrapolate: 'clamp' }) },
                  ],
                },
              ]}
            >
              {String(item).padStart(2, '0')}
            </Animated.Text>
          );
        })}
      </Animated.ScrollView>
      <Text style={styles.unit}>{label}</Text>
    </View>
  );
}

type Props = { seconds: number; onChange: (seconds: number) => void };

// iOS-style timer picker: hours, minutes, seconds wheels
export default function WheelPicker({ seconds, onChange }: Props) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <View style={styles.wrap}>
      <View pointerEvents="none" style={styles.band} />
      <View style={styles.row}>
        <Wheel count={24} value={h} label="hr" onChange={(v) => onChange(v * 3600 + m * 60 + s)} />
        <Wheel count={60} value={m} label="min" onChange={(v) => onChange(h * 3600 + v * 60 + s)} />
        <Wheel count={60} value={s} label="sec" onChange={(v) => onChange(h * 3600 + m * 60 + v)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: ITEM_H * VISIBLE, justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD,
    height: ITEM_H,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: { flexDirection: 'row', justifyContent: 'center', height: ITEM_H * VISIBLE },
  col: { width: 104, height: ITEM_H * VISIBLE },
  num: {
    height: ITEM_H,
    lineHeight: ITEM_H,
    textAlign: 'center',
    color: colors.text,
    fontSize: 30,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    paddingRight: 30,
  },
  unit: {
    position: 'absolute',
    right: 14,
    top: PAD,
    height: ITEM_H,
    lineHeight: ITEM_H,
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
