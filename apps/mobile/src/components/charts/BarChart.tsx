import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  width?: number;
  barColor?: string;
  showLabels?: boolean;
}

export function BarChart({
  data,
  height = 200,
  width = 300,
  barColor = colors.primary,
  showLabels = true,
}: BarChartProps): React.ReactElement {
  
  // Calculate paths
  const { path, maxValue } = useMemo(() => {
    const p = Skia.Path.Make();
    if (!data || data.length === 0) return { path: p, maxValue: 0 };

    const max = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    
    // Chart dimensions
    const padding = 10;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (showLabels ? 30 : 10);
    
    const barWidth = Math.max((availableWidth / data.length) - 8, 4);
    
    data.forEach((item, index) => {
      const normalizedValue = item.value / max;
      const barHeight = Math.max(normalizedValue * availableHeight, 4); // Min height of 4
      
      const x = padding + (index * (availableWidth / data.length)) + ((availableWidth / data.length) - barWidth) / 2;
      const y = availableHeight - barHeight;
      
      // Draw rounded rect
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(x, y, barWidth, barHeight),
          4, 4 // Border radius
        )
      );
    });

    return { path: p, maxValue: max };
  }, [data, height, width, showLabels]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height, width }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height: height - (showLabels ? 20 : 0) }}>
        <Path path={path} color={barColor} />
      </Canvas>
      
      {showLabels && (
        <View style={[styles.labelsContainer, { width }]}>
          {data.map((item, index) => (
            <Text 
              key={index} 
              style={[styles.label, { width: width / data.length }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          ))}
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
    borderRadius: radius.md,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 10,
  },
});
