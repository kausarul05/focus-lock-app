export const LEVEL_TITLES = [
  'Beginner',
  'Getting Focused',
  'Focus Fighter',
  'Deep Worker',
  'Time Master',
  'Unstoppable',
  'Legend',
];

export const XP_PER_LEVEL = 180;

export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const levelTitle = (level: number) =>
  LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Prefix a sentence with the user's name, keeping capitalisation right
const withName = (name: string, text: string) =>
  name ? `${name}, ${text}` : text.charAt(0).toUpperCase() + text.slice(1);

export const greeting = (name: string) => {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
};

// Rotating lines on the timer screen. They lean on the user's main goal when set.
export const buildTips = (name: string, mainGoal: string): string[] => {
  const tips = [
    'Keep your phone away. This time is only yours.',
    'One task. One focus. Everything else can wait.',
    'It feels hard now. It will feel great later.',
    'Distractions will come. Just keep coming back.',
    'Sip some water, sit up straight, keep going.',
  ];
  if (mainGoal) {
    tips.push(
      `Remember why you started: ${mainGoal}.`,
      withName(name, `this session is one more step toward: ${mainGoal}.`),
      `Every focused minute builds the person who achieves: ${mainGoal}.`,
    );
  }
  return tips;
};

// Shown when the user taps Stop
export const buildPersuade = (name: string, mainGoal: string, left: string, goal: string) => {
  const lines = [
    withName(name, `only ${left} left. Quitting now wastes the effort you already put in.`),
    withName(name, `you've come this far. Stopping now means starting over later.`),
    `The urge to quit passes. "${goal}" stays finished forever.`,
    withName(name, `${left} to go. You can do this.`),
  ];
  if (mainGoal) {
    lines.push(
      `You told yourself: ${mainGoal}. Don't break that promise for ${left}.`,
      withName(name, `your big goal is "${mainGoal}". This session is part of it.`),
      `People who reach "${mainGoal}" are the ones who finish sessions like this.`,
    );
  }
  return pick(lines);
};

export const PRAISE = [
  'You said you would, and you did. That is real strength.',
  'Every session like this changes who you are becoming.',
  'Most people never finish what they start. You did.',
  'Proud of you. Take a well-deserved break.',
  'Promise made, promise kept.',
];

export const QUIT_LINES = [
  "That's okay. Come back and try again.",
  'What you did still counts. Do not give up.',
  'Next time, start with a smaller target and finish it.',
];

export const REWARD_BADGES = [
  { min: 0, name: 'Focus Medal' },
  { min: 60, name: 'Golden Trophy' },
  { min: 120, name: 'Diamond Mind' },
  { min: 180, name: 'Focus Champion' },
];
