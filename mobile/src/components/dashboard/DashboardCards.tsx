import { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { AnalyticsDashboardData } from '../../hooks/useDashboard';

export interface DashboardCardsProps {
  data: AnalyticsDashboardData;
}

export const DashboardCards: FC<DashboardCardsProps> = ({ data }) => {
  return (
    <View style={styles.cardsContainer}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Productos</Text>
        <Text style={styles.cardValue}>{data.totalProducts}</Text>
      </View>

      <View style={[styles.card, styles.cardWarning]}>
        <Text style={styles.cardLabel}>Próximos a Vencer</Text>
        <Text style={styles.cardValue}>{data.expiringProducts}</Text>
      </View>

      <View style={[styles.card, styles.cardDanger]}>
        <Text style={styles.cardLabel}>Vencidos</Text>
        <Text style={styles.cardValue}>{data.expiredProducts}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardWarning: {
    backgroundColor: '#f57c00',
  },
  cardDanger: {
    backgroundColor: '#d32f2f',
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});

