import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

// Distant tree line: [x, scale]
const RIDGE: [number, number][] = [
  [18, 0.9], [52, 1.15], [88, 0.8], [124, 1.05], [166, 0.85],
  [206, 1.2], [248, 0.9], [284, 1.1], [322, 0.85], [358, 1.0], [390, 0.9],
];

const Pine = ({ x, s }: { x: number; s: number }) => (
  <G opacity={0.5}>
    <Path d={`M${x} ${652 - 46 * s} L${x + 15 * s} ${660} L${x - 15 * s} ${660} Z`} fill="#9CBE93" />
    <Path d={`M${x} ${652 - 30 * s} L${x + 12 * s} ${648} L${x - 12 * s} ${648} Z`} fill="#8AB183" />
  </G>
);

// Soft daylight meadow, drawn as vector so the app still needs no image assets
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
          <Stop offset="0" stopColor="#D9EAEF" />
          <Stop offset="0.42" stopColor="#F0F0E3" />
          <Stop offset="1" stopColor="#F7F3E8" />
        </LinearGradient>
        <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFE5A8" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#FFE5A8" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="hillA" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#CFE3C4" />
          <Stop offset="1" stopColor="#BFD9B6" />
        </LinearGradient>
        <LinearGradient id="hillB" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B4D2A8" />
          <Stop offset="1" stopColor="#A4C799" />
        </LinearGradient>
      </Defs>

      <Rect width="400" height="800" fill="url(#sky)" />
      <Circle cx="330" cy="70" r="210" fill="url(#sun)" />
      <Circle cx="330" cy="70" r="26" fill="#FFD98A" opacity="0.55" />

      <G opacity="0.55" fill="#FFFFFF">
        <Ellipse cx="90" cy="150" rx="46" ry="16" />
        <Ellipse cx="120" cy="142" rx="30" ry="18" />
        <Ellipse cx="286" cy="236" rx="38" ry="13" />
        <Ellipse cx="310" cy="230" rx="24" ry="15" />
      </G>

      {RIDGE.map(([x, s], i) => (
        <Pine key={i} x={x} s={s} />
      ))}

      <Path d="M0 660 C 80 628 150 650 230 662 C 300 672 350 656 400 644 L400 800 L0 800 Z" fill="url(#hillA)" />
      <Path d="M0 716 C 90 690 180 712 260 722 C 322 730 364 718 400 708 L400 800 L0 800 Z" fill="url(#hillB)" />
      <Path d="M0 768 C 110 748 210 768 300 772 C 346 774 376 766 400 760 L400 800 L0 800 Z" fill="#93BB89" opacity="0.9" />
    </Svg>
  );
}
