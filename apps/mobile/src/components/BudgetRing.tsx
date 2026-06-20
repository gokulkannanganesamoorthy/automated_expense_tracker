import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia, Paint, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography } from '../theme';

interface BudgetRingProps {
  spent: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function BudgetRing({
  spent,
  total,
  size = 200,
  strokeWidth = 16,
}: BudgetRingProps): React.ReactElement {
  const center = size / 2;
  const radius = center - strokeWidth;
  
  // Calculate percentage, maxing at 1 (100%)
  const percentage = Math.min(spent / (total || 1), 1);
  
  // Is over budget?
  const isOverBudget = spent > total;
  
  // Animation state
  const progress = useSharedValue(0);

  useEffect(() => {
    // Spring to target percentage on mount or update
    progress.value = withSpring(percentage, {
      damping: 15,
      stiffness: 90,
    });
  }, [percentage, progress]);

  // Background Ring Path
  const bgPath = Skia.Path.Make();
  bgPath.addCircle(center, center, radius);

  // Determine color based on progress
  const getColor = () => {
    if (isOverBudget) return colors.error;
    if (percentage > 0.85) return colors.warning;
    return colors.primary;
  };

  const ringColor = getColor();

  // Create arc for progress
  // Since Skia paths in React Native Skia can't easily animate raw sweeping arcs via Reanimated natively without a custom layout effect,
  // the typical workaround is animating the strokeDashoffset on a full circle, or generating the path per frame.
  
  // For a simple solid animation, strokeDashoffset is best.
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background Track */}
        <Path
          path={bgPath}
          color={colors.border}
          style="stroke"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Ring */}
        <Path
          path={bgPath}
          color={ringColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={progress}
          // Rotate -90deg to start at 12 o'clock
          transform={[{ rotate: -Math.PI / 2 }, { translateX: -size }, { translateY: 0 }]}
          origin={{ x: center, y: center }}
        />
      </Canvas>
      
      {/* Inner Content */}
      <View style={styles.innerContent}>
        <Text style={styles.spentText}>
          {isOverBudget ? 'Over budget' : 'Remaining'}
        </Text>
        <Text style={[styles.amountText, { color: isOverBudget ? colors.error : colors.textPrimary }]}>
          ₹{((total - spent) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spentText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountText: {
    ...typography.h2,
    fontWeight: '700',
  },
});
