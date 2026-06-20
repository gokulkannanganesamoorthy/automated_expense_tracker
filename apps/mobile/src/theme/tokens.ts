/**
 * Design tokens for the expense tracker.
 * Dark-first fintech aesthetic with premium gradients.
 */

// ═══════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════

export const colors = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#13131F',
  surfaceElevated: '#1C1C2E',
  surfaceHover: '#252540',

  // Borders
  border: 'rgba(255, 255, 255, 0.07)',
  borderFocused: 'rgba(167, 139, 250, 0.4)',

  // Accent — Purple gradient family
  accentPrimary: '#A78BFA',
  accentSecondary: '#7C3AED',
  accentTertiary: '#6D28D9',
  accentSubtle: 'rgba(167, 139, 250, 0.12)',
  accentGlow: 'rgba(167, 139, 250, 0.25)',

  // Semantic
  success: '#34D399',
  successSubtle: 'rgba(52, 211, 153, 0.12)',
  warning: '#F59E0B',
  warningSubtle: 'rgba(245, 158, 11, 0.12)',
  danger: '#FF6B35',
  dangerSubtle: 'rgba(255, 107, 53, 0.12)',
  dangerHigh: '#EF4444',
  dangerHighSubtle: 'rgba(239, 68, 68, 0.12)',
  info: '#60A5FA',
  infoSubtle: 'rgba(96, 165, 250, 0.12)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  textInverse: '#0A0A0F',

  // Budget ring colors
  budgetHealthy: '#34D399',
  budgetWarning: '#F59E0B',
  budgetDanger: '#FF6B35',
  budgetExceeded: '#EF4444',

  // Transaction type
  debit: '#FF6B35',
  credit: '#34D399',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',

  // Shimmer
  shimmerBase: '#1C1C2E',
  shimmerHighlight: '#252540',

  // Specific UI elements
  tabBarBackground: '#0D0D14',
  tabBarBorder: 'rgba(255, 255, 255, 0.05)',
  cardBackground: '#13131F',
  inputBackground: '#1C1C2E',
  badgeBackground: '#7C3AED',
} as const;

// ═══════════════════════════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════════════════════════

export const gradients = {
  accent: ['#A78BFA', '#7C3AED'] as const,
  accentDiagonal: {
    colors: ['#A78BFA', '#7C3AED'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  surface: ['#13131F', '#0A0A0F'] as const,
  success: ['#34D399', '#059669'] as const,
  danger: ['#FF6B35', '#EF4444'] as const,
  warm: ['#F59E0B', '#FF6B35'] as const,
  premium: ['#A78BFA', '#EC4899'] as const,
  balanceCard: ['#1C1C2E', '#252540'] as const,
} as const;

// ═══════════════════════════════════════════════════════════
// SPACING (4px base grid)
// ═══════════════════════════════════════════════════════════

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
} as const;

// ═══════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  pill: 50,
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════════════
// SHADOWS (via react-native-shadow-2)
// ═══════════════════════════════════════════════════════════

export const shadows = {
  sm: {
    distance: 2,
    startColor: 'rgba(0, 0, 0, 0.15)',
    offset: [0, 1] as const,
  },
  md: {
    distance: 4,
    startColor: 'rgba(0, 0, 0, 0.2)',
    offset: [0, 2] as const,
  },
  lg: {
    distance: 8,
    startColor: 'rgba(0, 0, 0, 0.25)',
    offset: [0, 4] as const,
  },
  xl: {
    distance: 16,
    startColor: 'rgba(0, 0, 0, 0.3)',
    offset: [0, 8] as const,
  },
  glow: {
    distance: 12,
    startColor: 'rgba(167, 139, 250, 0.15)',
    offset: [0, 0] as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════
// ICON SIZES
// ═══════════════════════════════════════════════════════════

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ═══════════════════════════════════════════════════════════
// Z-INDEX LAYERS
// ═══════════════════════════════════════════════════════════

export const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  banner: 20,
  modal: 50,
  toast: 100,
  overlay: 200,
} as const;

// ═══════════════════════════════════════════════════════════
// HITSLOP (touch targets)
// ═══════════════════════════════════════════════════════════

export const hitSlop = {
  sm: { top: 8, right: 8, bottom: 8, left: 8 },
  md: { top: 12, right: 12, bottom: 12, left: 12 },
  lg: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;
