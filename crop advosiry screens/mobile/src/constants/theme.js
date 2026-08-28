// ─── Crop Advisory Design Tokens ─────────────────────────────────────────────
// Matches the HTML design exactly

export const Colors = {
  // Dark backgrounds
  black:   '#080c08',
  surface: '#111511',
  card:    '#161e16',
  border:  '#1f2b1f',
  muted:   '#2a382a',

  // Accent – leaf green
  leaf:    '#4ade80',
  leafDim: '#163322',
  leafMid: '#22c55e',

  // Secondary accents
  soil:    '#c8a96e',
  soilDim: '#2a1f0a',
  sky:     '#38bdf8',
  skyDim:  '#0c2233',

  // Status
  danger:  '#f87171',
  warn:    '#fbbf24',

  // Text
  white:   '#eef5ee',
  grey:    '#7a9a7a',
  grey2:   '#a8bfa8',
};

export const AdminColors = {
  bg:      '#f6f8f6',
  surface: '#ffffff',
  border:  '#e2ebe2',
  green:   '#166534',
  greenLt: '#dcfce7',
  text:    '#1a2e1a',
  grey:    '#4a6a4a',
  greyLt:  '#888888',
};

export const Fonts = {
  display: 'Syne_800ExtraBold',
  body:    'Inter_400Regular',
  medium:  'Inter_500Medium',
  semibold:'Inter_600SemiBold',
  bold:    'Inter_700Bold',
  mono:    'JetBrainsMono_400Regular',
  monoBold:'JetBrainsMono_600SemiBold',
};

export const Spacing = {
  xs: 4,  sm: 8,  md: 12,
  lg: 16, xl: 20, xxl: 28,
};

export const Radius = {
  sm: 8, md: 11, lg: 14,
  xl: 16, pill: 20, phone: 40,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
};
