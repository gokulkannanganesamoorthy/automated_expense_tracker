import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Skia } from '@shopify/react-native-skia';
import { colors, radius, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';

interface HeatmapDataPoint {
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  hourOfDay: number; // 0 to 23
  intensity: number; // 0 to 1
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  width?: number;
  height?: number;
  baseColor?: string; // Hex color without alpha, e.g., '#4F46E5'
}

export function HeatmapChart({
  data,
  width = 300,
  height = 150,
  baseColor = colors.primary,
}: HeatmapChartProps): React.ReactElement {
  
  const { path } = useMemo(() => {
    const p = Skia.Path.Make();
    if (!data || data.length === 0) return { path: p };

    const paddingX = 24; // Space for Y axis labels
    const paddingY = 20; // Space for X axis labels
    
    const cellWidth = (width - paddingX) / 7;
    const cellHeight = (height - paddingY) / 24;
    const cellPadding = 1;
    
    data.forEach((item) => {
      // Scale intensity to opacity (min 0.1 so it's visible, max 1.0)
      const opacity = Math.max(0.1, item.intensity);
      // Convert hex to 8-digit hex string (AARRGGBB) for Skia, but React Native Skia 
      // usually prefers defining colors in `<Path>` or using Paint.
      // For a single path with multiple colors, we need multiple paths or a custom paint.
      // Since Skia <Path> takes a single color, we actually need to render a <Path> for each intensity level,
      // or group them. For simplicity, we'll draw individual rects outside the memo if we need distinct colors,
      // OR we can group by opacity buckets.
    });

    return { path: p };
  }, [data, width, height]);

  // Group data by opacity bucket to minimize Path nodes
  const pathsByOpacity = useMemo(() => {
    const buckets = new Map<number, ReturnType<typeof Skia.Path.Make>>();
    
    if (!data || data.length === 0) return [];

    const paddingX = 30; 
    const paddingY = 20; 
    const cellWidth = (width - paddingX) / 7;
    const cellHeight = (height - paddingY) / 6; // Group hours into 4-hour blocks for visual simplicity
    const cellPadding = 2;
    
    data.forEach((item) => {
      // Group hours: 0-3=0, 4-7=1, 8-11=2, 12-15=3, 16-19=4, 20-23=5
      const timeBlock = Math.floor(item.hourOfDay / 4);
      
      const x = paddingX + (item.dayOfWeek * cellWidth) + cellPadding;
      const y = (timeBlock * cellHeight) + cellPadding;
      
      // Bucket by 10% increments
      const alphaBucket = Math.ceil(Math.max(0.1, item.intensity) * 10) / 10;
      
      if (!buckets.has(alphaBucket)) {
        buckets.set(alphaBucket, Skia.Path.Make());
      }
      
      const p = buckets.get(alphaBucket)!;
      p.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(x, y, cellWidth - cellPadding * 2, cellHeight - cellPadding * 2),
          4, 4
        )
      );
    });

    return Array.from(buckets.entries()).map(([opacity, path]) => {
      // Convert opacity to hex string (e.g. 0.5 -> '80')
      const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
      // Assuming baseColor is '#RRGGBB'
      const colorWithAlpha = `${baseColor}${alphaHex}`;
      return { path, color: colorWithAlpha };
    });
  }, [data, width, height, baseColor]);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const times = ['Night', 'Morn', 'Noon', 'Eve'];

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height, width }]}>
        <Text style={styles.emptyText}>No heatmap data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        {/* Y Axis Labels */}
        <View style={[styles.yAxis, { height: height - 20 }]}>
          {times.map((t, i) => (
            <Text key={i} style={styles.axisLabel}>{t}</Text>
          ))}
        </View>

        {/* Chart */}
        <Canvas style={{ width: width - 30, height: height - 20 }}>
          {pathsByOpacity.map((item, index) => (
            <Path key={index} path={item.path} color={item.color} />
          ))}
        </Canvas>
      </View>

      {/* X Axis Labels */}
      <View style={[styles.xAxis, { width: width - 30, marginLeft: 30 }]}>
        {days.map((d, i) => (
          <Text key={i} style={[styles.axisLabel, { width: (width - 30) / 7, textAlign: 'center' }]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
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
  yAxis: {
    width: 30,
    justifyContent: 'space-around',
    paddingRight: 4,
  },
  xAxis: {
    flexDirection: 'row',
    marginTop: 4,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
  },
});
