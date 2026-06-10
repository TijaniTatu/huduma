import { MD3LightTheme } from 'react-native-paper';

// ---------------------------------------------------------------------------
// Huduma design system
// Brand: warm orange wordmark + charcoal mark + steel-blue tagline (see logo).
// ---------------------------------------------------------------------------

export const colors = {
  primary: '#E8771E',        // Huduma orange
  primaryDark: '#C75F12',
  primaryContainer: '#FFE7D2',
  onPrimary: '#FFFFFF',

  charcoal: '#26333B',       // brand dark (logo mark)
  steel: '#5B7C99',          // tagline blue (secondary accent)

  success: '#16A34A',
  successContainer: '#DCFCE7',
  warning: '#F59E0B',
  danger: '#DC2626',
  dangerContainer: '#FEE2E2',
  star: '#F5A623',

  background: '#F4F6F8',      // app background
  surface: '#FFFFFF',         // cards / sheets
  surfaceAlt: '#EDF1F4',      // subtle fills, chips

  text: '#1B262C',           // primary text (near-charcoal)
  textMuted: '#64757F',      // secondary text
  textFaint: '#9AA7AF',      // hints / disabled
  border: '#E3E8EC',
  white: '#FFFFFF',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export const typography = {
  display: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text },
  h3: { fontSize: 17, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted },
  caption: { fontSize: 12.5, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' },
};

export const shadow = {
  card: {
    shadowColor: '#0B1F2A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#0B1F2A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  none: { shadowColor: 'transparent', elevation: 0 },
};

// react-native-paper MD3 theme wired to the brand palette
export const paperTheme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.charcoal,
    onSecondary: colors.white,
    secondaryContainer: colors.surfaceAlt,
    onSecondaryContainer: colors.charcoal,
    tertiary: colors.steel,
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceAlt,
    onSurfaceVariant: colors.textMuted,
    surfaceDisabled: colors.surfaceAlt,
    outline: colors.border,
    outlineVariant: colors.border,
    error: colors.danger,
    errorContainer: colors.dangerContainer,
    backdrop: 'rgba(15, 31, 42, 0.4)',
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
};

export default paperTheme;
