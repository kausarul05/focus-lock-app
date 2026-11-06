import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  size: number;
  /** 0 = seed in the soil, 1 = fully grown tree */
  stage: number;
  /** Draw it dried out, for an abandoned session */
  withered?: boolean;
  /** Hide the soil mound and grass tufts */
  bare?: boolean;
};

const GROUND = 90;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

// A tree that grows with `stage`, drawn as vector so it stays sharp at any size
export default function Tree({ size, stage, withered, bare }: Props) {
  const t = clamp(stage);
  const seed = t < 0.07;

  const trunkH = 5 + 42 * t;
  const trunkTop = GROUND - trunkH;
  const trunkW = 2.4 + 5.6 * t;
  const r = 4 + 19 * t;

  const bark = withered ? colors.witherDark : colors.bark;
  const front = withered ? colors.wither : colors.leaf;
  const back = withered ? colors.witherDark : colors.leafDark;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {!bare && (
        <>
          <Ellipse cx="50" cy={GROUND + 2} rx={16 + 14 * t} ry={4 + 2 * t} fill="#000" opacity={0.07} />
          <Path
            d={`M${34 - 8 * t} ${GROUND} Q50 ${GROUND - 7 - 2 * t} ${66 + 8 * t} ${GROUND} Z`}
            fill={withered ? '#CFC4AC' : '#C9A882'}
            opacity={0.7}
          />
        </>
      )}

      {seed ? (
        <Ellipse cx="50" cy={GROUND - 4} rx="5.4" ry="6.6" fill={bark} />
      ) : (
        <G>
          {/* trunk */}
          <Path
            d={`M${50 - trunkW / 2} ${GROUND} Q${50 - trunkW / 2 - 0.8} ${trunkTop + 4} ${50 - trunkW / 2.6} ${trunkTop}
                L${50 + trunkW / 2.6} ${trunkTop} Q${50 + trunkW / 2 + 0.8} ${trunkTop + 4} ${50 + trunkW / 2} ${GROUND} Z`}
            fill={bark}
          />
          {/* branches appear once it is past the sapling stage */}
          {t > 0.45 && (
            <>
              <Path
                d={`M50 ${trunkTop + 10} L${50 - r * 0.52} ${trunkTop + 2}`}
                stroke={bark}
                strokeWidth={1.6 * t}
                strokeLinecap="round"
              />
              <Path
                d={`M50 ${trunkTop + 14} L${50 + r * 0.52} ${trunkTop + 6}`}
                stroke={bark}
                strokeWidth={1.6 * t}
                strokeLinecap="round"
              />
            </>
          )}

          {t < 0.22 ? (
            // sprout: two small leaves on a slim stem
            <>
              <Ellipse
                cx={50 - 4.6}
                cy={trunkTop + 1}
                rx="5"
                ry="3"
                fill={front}
                transform={`rotate(-26 ${50 - 4.6} ${trunkTop + 1})`}
              />
              <Ellipse
                cx={50 + 4.6}
                cy={trunkTop + 1}
                rx="5"
                ry="3"
                fill={back}
                transform={`rotate(26 ${50 + 4.6} ${trunkTop + 1})`}
              />
            </>
          ) : (
            // canopy: overlapping blobs, darker tone behind for depth
            <G opacity={withered ? 0.85 : 1}>
              <Circle cx={50 - r * 0.46} cy={trunkTop - r * 1.08} r={r * 0.64} fill={back} />
              <Circle cx={50 + r * 0.46} cy={trunkTop - r * 1.08} r={r * 0.64} fill={back} />
              <Circle cx={50 - r * 0.8} cy={trunkTop - r * 0.18} r={r * 0.72} fill={back} />
              <Circle cx={50 + r * 0.8} cy={trunkTop - r * 0.18} r={r * 0.72} fill={front} />
              <Circle cx={50} cy={trunkTop - r * 0.62} r={r} fill={front} />
              <Circle cx={50 - r * 0.3} cy={trunkTop - r * 0.95} r={r * 0.5} fill={front} opacity={0.9} />
            </G>
          )}
        </G>
      )}

      {/* a couple of leaves on the ground once the tree has dried out */}
      {withered && !bare && (
        <>
          <Ellipse cx="33" cy={GROUND - 1} rx="3.4" ry="2" fill={colors.wither} transform="rotate(-20 33 89)" />
          <Ellipse cx="68" cy={GROUND - 2} rx="3" ry="1.8" fill={colors.witherDark} transform="rotate(16 68 88)" />
        </>
      )}

      {!bare && !withered && (
        <>
          <Path d={`M30 ${GROUND} q2.5 -5 5 -6`} stroke={colors.leaf} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <Path d={`M70 ${GROUND} q-2.5 -5 -5 -6`} stroke={colors.leafDark} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  );
}
