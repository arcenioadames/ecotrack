import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { apiClient } from '../services/axios';

interface ExpiringProduct {
  id: string;
  name: string;
  category: { name: string };
  expiryDate: string;
  daysUntilExpiry: number;
}

export function ExpiringScreen() {
  const [products, setProducts] = useState<ExpiringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchExpiringProducts();
  }, []);

  const fetchExpiringProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products/expiring?days=3');
      setProducts(response.data.items || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos próximos a vencer');
      console.error('Expiring products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpiringProducts();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  const getUrgency = (days: number) => {
    if (days <= 0) return { color: '#d32f2f', label: 'VENCIDO' };
    if (days <= 3) return { color: '#d32f2f', label: 'URGENTE' };
    if (days <= 7) return { color: '#f57c00', label: 'PRÓXIMO' };
    return { color: '#2e7d32', label: 'OK' };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>✓ Todos los productos están en buen estado</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {products.map((product) => {
            const urgency = getUrgency(product.daysUntilExpiry);
            return (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.header}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View
                    style={[
                      styles.urgencyBadge,
                      { backgroundColor: urgency.color },
                    ]}
                  >
                    <Text style={styles.urgencyText}>{urgency.label}</Text>
                  </View>
                </View>

                <Text style={styles.productCategory}>
                  {product.category?.name || 'Sin categoría'}
                </Text>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vence:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(product.expiryDate)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Días restantes:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            product.daysUntilExpiry <= 3
                              ? '#d32f2f'
                              : '#2e7d32',
                        },
                      ]}
                    >
                      {product.daysUntilExpiry} días
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderTopWidth: 3,
    borderTopColor: '#f57c00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  urgencyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  urgencyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  productCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
