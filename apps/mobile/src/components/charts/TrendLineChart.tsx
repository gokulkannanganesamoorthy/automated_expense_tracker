import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Path, Skia, LinearGradient, vec } from '@shopify/react-native-skia';
import { colors, radius, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface DataPoint {
  date: string; // ISO or short date
  value: number;
}

interface TrendLineChartProps {
  data: DataPoint[];
  height?: number;
  width?: number;
  lineColor?: string;
}

export function TrendLineChart({
  data,
  height = 200,
  width = 300,
  lineColor = colors.primary,
}: TrendLineChartProps): React.ReactElement {
  
  const { linePath, fillPath } = useMemo(() => {
    const lPath = Skia.Path.Make();
    const fPath = Skia.Path.Make();
    
    if (!data || data.length < 2) return { linePath: lPath, fillPath: fPath };

    const max = Math.max(...data.map(d => d.value), 1);
    const min = Math.min(...data.map(d => d.value), 0);
    const range = max - min;
    
    const paddingX = 10;
    const paddingY = 20;
    const availableWidth = width - (paddingX * 2);
    const availableHeight = height - (paddingY * 2);
    
    const stepX = availableWidth / (data.length - 1);
    
    data.forEach((item, index) => {
      const normalizedValue = range === 0 ? 0.5 : (item.value - min) / range;
      const x = paddingX + (index * stepX);
      const y = paddingY + (availableHeight - (normalizedValue * availableHeight));
      
      if (index === 0) {
        lPath.moveTo(x, y);
        fPath.moveTo(x, y);
      } else {
        // Simple straight lines for now, bezier curves require calculating control points
        lPath.lineTo(x, y);
        fPath.lineTo(x, y);
      }
    });

    // Complete the fill path
    fPath.lineTo(paddingX + availableWidth, height);
    fPath.lineTo(paddingX, height);
    fPath.close();

    return { linePath: lPath, fillPath: fPath };
  }, [data, height, width]);

  if (!data || data.length < 2) {
    return (
      <View style={[styles.emptyContainer, { height, width }]}>
        <Text style={styles.emptyText}>Not enough data for trend</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        {/* Fill Gradient */}
        <Path path={fillPath}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[`${lineColor}40`, `${lineColor}00`]} // 40% to 0% opacity
          />
        </Path>
        
        {/* Main Line */}
        <Path 
          path={linePath} 
          color={lineColor} 
          style="stroke" 
          strokeWidth={3} 
          strokeJoin="round"
          strokeCap="round"
        />
      </Canvas>
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
});
