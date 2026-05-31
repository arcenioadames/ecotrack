import { FC, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { AnalyticsDashboardData } from '../../hooks/useDashboard';

export type CategoryChartProps = {
  productsByCategory: AnalyticsDashboardData['productsByCategory'];
};

type BarItem = {
  categoryName: string;
  count: number;
  normalizedWidth: number;
};

export const CategoryChart: FC<CategoryChartProps> = ({ productsByCategory }) => {
  const bars: BarItem[] = useMemo(() => {
    const items = productsByCategory ?? [];
    const max = items.reduce((acc, it) => Math.max(acc, it.count), 0);

    return items
      .slice()
      .sort((a, b) => b.count - a.count)
      .map((it) => {
        const normalizedWidth = max > 0 ? it.count / max : 0;
        return {
          categoryName: it.categoryName,
          count: it.count,
          normalizedWidth,
        };
      });
  }, [productsByCategory]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías</Text>

      {bars.length === 0 ? (
        <Text style={styles.emptyText}>Sin categorías</Text>
      ) : (
        <View style={styles.barsContainer}>
          {bars.map((bar) => (
            <View key={bar.categoryName} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {bar.categoryName}
              </Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      flex: bar.normalizedWidth,
                    },
                  ]}
                />
                {/* Remaining space is implicitly the flex track */}
              </View>

              <Text style={styles.value}>{bar.count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 10,
  },
  barsContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 120,
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    backgroundColor: '#2e7d32',
  },
  value: {
    width: 44,
    textAlign: 'right',
    fontSize: 13,
    color: '#333',
    fontWeight: '700',
  },
});

