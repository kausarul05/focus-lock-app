// Forest-style nature palette: warm paper background, deep green ink, leafy accents
export const colors = {
  bg: '#F7F3E8',
  bg2: '#EFE8D7',
  sky: '#DCEBDA',
  skyTop: '#CFE4EC',

  card: '#FFFFFF',
  cardSoft: '#F3EEE1',
  cardBorder: 'rgba(46,58,43,0.09)',

  primary: '#4F9D69',
  primaryDeep: '#3A7A50',
  primarySoft: '#E4F0E5',

  leaf: '#7FB069',
  leafDark: '#3F7A4F',
  bark: '#8A6141',
  barkDark: '#6B4A31',

  warn: '#C96F5B',
  warnSoft: '#F7E7E2',
  gold: '#E3A93C',
  wither: '#B5A68C',
  witherDark: '#8C7D66',

  text: '#2E3A2B',
  textSoft: '#55624F',
  muted: '#8B9585',
  track: '#E7E0CF',
  white: '#FFFFFF',
};

export const radius = { sm: 12, md: 18, lg: 26, xl: 34, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#2E3A2B',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#2E3A2B',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
} as const;
