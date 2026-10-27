import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

const STARS: [number, number, number][] = [
  [40, 90, 1.4], [120, 40, 1], [210, 120, 1.6], [330, 70, 1.2], [370, 190, 1],
  [70, 230, 1], [290, 260, 1.4], [160, 310, 1], [350, 360, 1.2], [20, 400, 1],
  [250, 430, 1], [100, 470, 1.4],
];

// Night-sky scene with soft glows and layered hills, drawn as vector so no asset is needed
export default function Background() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#050818" />
          <Stop offset="0.6" stopColor="#0E1431" />
          <Stop offset="1" stopColor="#1B1B4B" />
        </LinearGradient>
        <RadialGradient id="glowA" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#7C5CFF" stopOpacity="0.22" />
          <Stop offset="1" stopColor="#7C5CFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowB" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#2DD4A8" stopOpacity="0.14" />
          <Stop offset="1" stopColor="#2DD4A8" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="400" height="800" fill="url(#sky)" />
      <Circle cx="340" cy="60" r="300" fill="url(#glowA)" />
      <Circle cx="40" cy="520" r="260" fill="url(#glowB)" />
      {STARS.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.55} />
      ))}
      <Path d="M0 640 C 70 590 140 600 210 630 C 290 665 340 620 400 600 L400 800 L0 800 Z" fill="#16164A" opacity="0.7" />
      <Path d="M0 700 C 90 660 170 690 250 705 C 320 718 360 690 400 675 L400 800 L0 800 Z" fill="#0F1237" opacity="0.9" />
      <Path d="M0 760 C 100 735 200 760 290 765 C 340 768 375 755 400 748 L400 800 L0 800 Z" fill="#090B24" />
    </Svg>
  );
}
