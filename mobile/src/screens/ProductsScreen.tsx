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

interface Product {
  id: string;
  name: string;
  category: { name: string };
  expiryDate: string;
}

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts(response.data.items || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
      console.error('Products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
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

  const isExpired = (dateString: string) => {
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
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
          <Text style={styles.emptyText}>No hay productos</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {products.map((product) => (
            <View
              key={product.id}
              style={[
                styles.productCard,
                isExpired(product.expiryDate) && styles.productCardExpired,
              ]}
            >
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>
                {product.category?.name || 'Sin categoría'}
              </Text>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Vence:</Text>
                <Text
                  style={[
                    styles.date,
                    isExpired(product.expiryDate) && styles.dateExpired,
                  ]}
                >
                  {formatDate(product.expiryDate)}
                </Text>
              </View>
            </View>
          ))}
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
    color: '#999',
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
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  productCardExpired: {
    borderLeftColor: '#d32f2f',
    opacity: 0.7,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  dateExpired: {
    color: '#d32f2f',
  },
});
