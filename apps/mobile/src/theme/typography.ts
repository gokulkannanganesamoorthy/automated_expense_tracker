import { Platform, TextStyle } from 'react-native';

/**
 * Platform-specific typography system.
 * iOS: SF Pro Display / Text / Mono
 * Android: Google Sans / Roboto Mono
 */

// ═══════════════════════════════════════════════════════════
// FONT FAMILIES
// ═══════════════════════════════════════════════════════════

export const fontFamilies = {
  display: Platform.select({
    ios: 'System',  // Maps to SF Pro Display
    android: 'sans-serif-medium',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'System',  // Maps to SF Pro Text
    android: 'sans-serif',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// ═══════════════════════════════════════════════════════════
// FONT SIZES
// ═══════════════════════════════════════════════════════════

export const fontSizes = {
  '2xs': 11,
  xs: 13,
  sm: 15,
  md: 17,
  lg: 22,
  xl: 28,
  '2xl': 38,
  '3xl': 48,
} as const;

// ═══════════════════════════════════════════════════════════
// LINE HEIGHTS
// ═══════════════════════════════════════════════════════════

export const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// ═══════════════════════════════════════════════════════════
// FONT WEIGHTS
// ═══════════════════════════════════════════════════════════

type FontWeight = TextStyle['fontWeight'];

export const fontWeights: Record<string, FontWeight> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY PRESETS
// ═══════════════════════════════════════════════════════════

interface TypographyPreset {
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing?: number;
}

export const typography: Record<string, TypographyPreset> = {
  // Display — for large numbers (balance, totals)
  displayLarge: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: -1,
  },
  displayMedium: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },

  // Headings
  headingLarge: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  headingMedium: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  headingSmall: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Body
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.relaxed,
  },

  // Caption
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes['2xs'],
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes['2xs'] * lineHeights.normal,
  },

  // Mono — for amounts, codes, references
  monoLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: -0.5,
  },
  monoMedium: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.tight,
  },
  monoSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },
  monoXSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.tight,
  },

  // Button
  buttonLarge: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.tight,
  },
  buttonMedium: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
  },
  buttonSmall: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.tight,
  },

  // Label
  labelLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  labelMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  labelSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes['2xs'],
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes['2xs'] * lineHeights.normal,
    letterSpacing: 0.5,
  },
} as const;
