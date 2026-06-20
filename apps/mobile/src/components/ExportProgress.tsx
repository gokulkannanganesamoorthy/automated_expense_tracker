import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

export type ExportStatus = 'idle' | 'preparing' | 'generating' | 'saving' | 'complete' | 'error';

interface ExportProgressProps {
  status: ExportStatus;
  progress: number; // 0 to 100
  title?: string;
}

export function ExportProgress({
  status,
  progress,
  title = 'Exporting Data',
}: ExportProgressProps): React.ReactElement {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 500 });
  }, [progress, animatedProgress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Waiting to start...';
      case 'preparing': return 'Preparing data...';
      case 'generating': return 'Generating file...';
      case 'saving': return 'Saving file...';
      case 'complete': return 'Export complete!';
      case 'error': return 'Failed to export.';
      default: return '';
    }
  };

  const getStatusColor = () => {
    if (status === 'error') return colors.error;
    if (status === 'complete') return colors.success;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.barFill,
            progressStyle,
            { backgroundColor: getStatusColor() }
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {status !== 'error' && status !== 'complete' && (
          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  barContainer: {
    height: 8,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    ...typography.labelMedium,
    fontWeight: '500',
  },
  percentageText: {
    ...typography.monoMedium,
    color: colors.textSecondary,
  },
});
