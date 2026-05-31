import { FC, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { AnalyticsDashboardData } from '../../hooks/useDashboard';

export type StatusChartProps = {
  inventoryStatusDistribution: AnalyticsDashboardData['inventoryStatusDistribution'];
};

const STATUS_CONFIG = [
  { key: 'ok', label: 'OK', color: '#2e7d32' },
  { key: 'expiring', label: 'Por vencer', color: '#f57c00' },
  { key: 'expired', label: 'Vencidos', color: '#d32f2f' },
] as const;

type StatusKey = (typeof STATUS_CONFIG)[number]['key'];

type StatusBar = {
  label: string;
  value: number;
  normalizedWidth: number;
  color: string;
};

export const StatusChart: FC<StatusChartProps> = ({
  inventoryStatusDistribution,
}) => {
  const bars: StatusBar[] = useMemo(() => {
    const dist = inventoryStatusDistribution;
    const total = (dist?.ok ?? 0) + (dist?.expiring ?? 0) + (dist?.expired ?? 0);

    return STATUS_CONFIG.map((cfg) => {
      const value = (dist?.[cfg.key as StatusKey] ?? 0) as number;
      const normalizedWidth = total > 0 ? value / total : 0;
      return {
        label: cfg.label,
        value,
        normalizedWidth,
        color: cfg.color,
      };
    });
  }, [inventoryStatusDistribution]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de inventario</Text>

      <View style={styles.stackTrack}>
        {bars.map((bar) => (
          <View
            key={bar.label}
            style={[
              styles.stackSegment,
              {
                backgroundColor: bar.color,
                flex: bar.normalizedWidth,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {bars.map((bar) => (
          <View key={bar.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: bar.color }]} />
            <Text style={styles.legendText}>
              {bar.label} ({bar.value})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  stackTrack: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stackSegment: {
    height: '100%',
  },
  legend: {
    marginTop: 12,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
});

