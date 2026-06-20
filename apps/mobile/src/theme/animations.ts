import { AccessibilityInfo } from 'react-native';
import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

/**
 * Animation configuration system.
 * All animations respect reduced motion preferences.
 */

// ═══════════════════════════════════════════════════════════
// SPRING CONFIGS
// ═══════════════════════════════════════════════════════════

export const springConfigs = {
  /** Default spring for most transitions */
  default: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  } satisfies WithSpringConfig,

  /** Snappy spring for quick interactions */
  snappy: {
    damping: 25,
    stiffness: 300,
    mass: 0.8,
  } satisfies WithSpringConfig,

  /** Gentle spring for modals/sheets */
  gentle: {
    damping: 18,
    stiffness: 150,
    mass: 1,
  } satisfies WithSpringConfig,

  /** Bouncy spring for playful elements */
  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.9,
  } satisfies WithSpringConfig,

  /** Heavy spring for large elements */
  heavy: {
    damping: 28,
    stiffness: 180,
    mass: 1.2,
  } satisfies WithSpringConfig,

  /** Modal sheet slide up */
  sheet: {
    damping: 22,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
  } satisfies WithSpringConfig,
} as const;

// ═══════════════════════════════════════════════════════════
// TIMING CONFIGS
// ═══════════════════════════════════════════════════════════

export const timingConfigs = {
  /** Fast fade/scale */
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Normal transition */
  normal: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Slow/deliberate */
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,

  /** Chart draw-on animation */
  chartDraw: {
    duration: 600,
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  } satisfies WithTimingConfig,

  /** Number counting animation */
  counting: {
    duration: 800,
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  } satisfies WithTimingConfig,

  /** Skeleton shimmer */
  shimmer: {
    duration: 1200,
    easing: Easing.linear,
  } satisfies WithTimingConfig,
} as const;

// ═══════════════════════════════════════════════════════════
// STAGGER CONFIG
// ═══════════════════════════════════════════════════════════

export const staggerConfig = {
  /** Stagger delay between list items */
  listItemDelay: 50,

  /** Max items to stagger (performance) */
  maxItems: 10,

  /** Stagger slide-up offset */
  slideOffset: 20,
} as const;

// ═══════════════════════════════════════════════════════════
// REDUCED MOTION HELPER
// ═══════════════════════════════════════════════════════════

let isReducedMotionEnabled = false;

// Listen for reduced motion changes
AccessibilityInfo.isReduceMotionEnabled().then((value) => {
  isReducedMotionEnabled = value;
});

AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
  isReducedMotionEnabled = value;
});

/**
 * Check if reduced motion is enabled.
 * When true, skip all animations and transitions.
 */
export function shouldAnimate(): boolean {
  return !isReducedMotionEnabled;
}

/**
 * Get animation duration that respects reduced motion.
 * Returns 0 if reduced motion is enabled.
 */
export function getAnimationDuration(duration: number): number {
  return isReducedMotionEnabled ? 0 : duration;
}

/**
 * Get spring config that respects reduced motion.
 * Returns a very stiff spring (instant) if reduced motion is enabled.
 */
export function getSpringConfig(config: WithSpringConfig): WithSpringConfig {
  if (isReducedMotionEnabled) {
    return {
      ...config,
      damping: 100,
      stiffness: 1000,
      mass: 0.1,
    };
  }
  return config;
}
