import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  centerLabel,
  centerValue,
}: DonutChartProps): React.ReactElement {
  
  const { paths, total } = useMemo(() => {
    if (!data || data.length === 0) return { paths: [], total: 0 };

    const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
    const center = size / 2;
    const radius = center - strokeWidth;
    
    let currentAngle = -Math.PI / 2; // Start at 12 o'clock (-90 deg)
    
    const calculatedPaths = data.map((item) => {
      const percentage = item.value / totalValue;
      const sweepAngle = percentage * 2 * Math.PI;
      
      const path = Skia.Path.Make();
      path.addArc(
        Skia.XYWHRect(strokeWidth, strokeWidth, size - strokeWidth * 2, size - strokeWidth * 2),
        (currentAngle * 180) / Math.PI,
        (sweepAngle * 180) / Math.PI
      );
      
      currentAngle += sweepAngle;
      
      return {
        path,
        color: item.color,
      };
    });

    return { paths: calculatedPaths, total: totalValue };
  }, [data, size, strokeWidth]);

  if (!data || data.length === 0 || total === 0) {
    return (
      <View style={[styles.emptyContainer, { height: size, width: size, borderRadius: size / 2 }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {paths.map((item, index) => (
          <Path
            key={index}
            path={item.path}
            color={item.color}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="butt"
          />
        ))}
      </Canvas>
      
      {(centerLabel || centerValue) && (
        <View style={[styles.centerContent, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
          {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
          {centerValue && <Text style={styles.centerValue}>{centerValue}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHover,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  centerValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
