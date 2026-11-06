import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  size: number;
  stroke: number;
  progress: number;
  /** Number of tick marks drawn outside the ring; 0 hides them */
  ticks?: number;
  children?: React.ReactNode;
};

const TAU = Math.PI * 2;

export default function Ring({ size, stroke, progress, ticks = 36, children }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  const r = size / 2 - stroke * 2.1;
  const c = TAU * r;
  const tickOut = size / 2 - stroke * 0.5;
  const tickIn = tickOut - stroke * 0.8;

  const marks = useMemo(
    () =>
      Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * TAU;
        const sin = Math.sin(a);
        const cos = -Math.cos(a);
        const major = i % 6 === 0;
        const len = major ? 1 : 0.58;
        return {
          i,
          on: i / ticks <= p,
          major,
          x1: size / 2 + sin * tickOut,
          y1: size / 2 + cos * tickOut,
          x2: size / 2 + sin * (tickOut - (tickOut - tickIn) * len),
          y2: size / 2 + cos * (tickOut - (tickOut - tickIn) * len),
        };
      }),
    [ticks, p, size, tickOut, tickIn],
  );

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View pointerEvents="none" style={{ position: 'absolute' }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ringArc" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.leaf} />
              <Stop offset="1" stopColor={colors.primaryDeep} />
            </LinearGradient>
          </Defs>

          {marks.map((m) => (
            <Line
              key={m.i}
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              stroke={m.on ? colors.primary : colors.track}
              strokeWidth={m.major ? 2.6 : 1.6}
              strokeLinecap="round"
            />
          ))}

          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ringArc)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - p)}
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}
