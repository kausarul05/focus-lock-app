import React, { useEffect, useMemo, useRef } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient, Line, Stop } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  size: number;
  minutes: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  step?: number;
  children?: React.ReactNode;
};

const TAU = Math.PI * 2;

// Forest-style time dial: a full turn is `max` minutes, drag the ring to set the duration
export default function Dial({
  size,
  minutes,
  onChange,
  min = 5,
  max = 180,
  step = 5,
  children,
}: Props) {
  const stroke = Math.round(size * 0.055);
  const R = size / 2 - stroke * 2.1; // radius of the progress arc
  const tickOut = size / 2 - stroke * 0.5;
  const tickIn = tickOut - stroke * 0.85;
  const c = TAU * R;
  const p = Math.min(1, Math.max(0, minutes / max));

  // Touch handlers read the newest value and callback through this box
  const live = useRef({ minutes, onChange });
  useEffect(() => {
    live.current.minutes = minutes;
    live.current.onChange = onChange;
  }, [minutes, onChange]);

  // x/y are relative to this view: the dial's children are pointerEvents="none",
  // so it stays the touch target for the whole gesture
  const commit = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.locationX - size / 2;
    const dy = e.nativeEvent.locationY - size / 2;
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    let a = Math.atan2(dx, -dy);
    if (a < 0) a += TAU;
    let v = Math.round(((a / TAU) * max) / step) * step;

    // The top of the dial is both 0 and max, so a drag must never jump across it
    const prev = live.current.minutes;
    if (prev > max * 0.75 && v < max * 0.25) v = max;
    else if (prev < max * 0.25 && v > max * 0.75) v = min;

    v = Math.min(max, Math.max(min, v));
    if (v !== prev) {
      live.current.minutes = v;
      Haptics.selectionAsync().catch(() => {});
      live.current.onChange(v);
    }
  };

  // Only the ring band grabs the gesture, so the middle of the dial stays tappable
  const onBand = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    return Math.hypot(locationX - size / 2, locationY - size / 2) > R - stroke * 2.4;
  };

  const ticks = useMemo(() => {
    const n = Math.round(max / step);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * TAU;
      const major = i % 6 === 0;
      const len = major ? 1 : 0.58;
      const sin = Math.sin(a);
      const cos = -Math.cos(a);
      return {
        i,
        on: (i / n) * max <= minutes,
        major,
        x1: size / 2 + sin * tickOut,
        y1: size / 2 + cos * tickOut,
        x2: size / 2 + sin * (tickOut - (tickOut - tickIn) * len),
        y2: size / 2 + cos * (tickOut - (tickOut - tickIn) * len),
      };
    });
  }, [max, step, minutes, size, tickOut, tickIn]);

  const knobA = p * TAU;
  const knobX = size / 2 + Math.sin(knobA) * R;
  const knobY = size / 2 - Math.cos(knobA) * R;

  return (
    <View
      style={{ width: size, height: size }}
      onStartShouldSetResponder={onBand}
      onMoveShouldSetResponder={onBand}
      onResponderGrant={commit}
      onResponderMove={commit}
      // Keep the drag once it starts, so a surrounding ScrollView cannot steal it
      onResponderTerminationRequest={() => false}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="dialArc" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.leaf} />
              <Stop offset="1" stopColor={colors.primaryDeep} />
            </LinearGradient>
          </Defs>

          {ticks.map((t) => (
            <Line
              key={t.i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.on ? colors.primary : colors.track}
              strokeWidth={t.major ? 2.6 : 1.6}
              strokeLinecap="round"
            />
          ))}

          <Circle cx={size / 2} cy={size / 2} r={R} stroke={colors.track} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke="url(#dialArc)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - p)}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />

          <Circle cx={knobX} cy={knobY} r={stroke * 0.96} fill={colors.white} />
          <Circle cx={knobX} cy={knobY} r={stroke * 0.96} stroke={colors.primaryDeep} strokeWidth={2.4} fill="none" />
          <Circle cx={knobX} cy={knobY} r={stroke * 0.34} fill={colors.primary} />
        </Svg>
      </View>

      <View pointerEvents="box-none" style={styles.center}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
