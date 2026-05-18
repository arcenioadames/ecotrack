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

interface Category {
  id: string;
  name: string;
  description?: string;
}

export function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
      console.error('Categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
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
      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay categorías</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {categories.map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={[styles.colorBadge, { backgroundColor: colors[index % colors.length] }]} />
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{category.name}</Text>
                {category.description && (
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const colors = ['#2e7d32', '#1976d2', '#f57c00', '#7b1fa2', '#c62828', '#00838f'];

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
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBadge: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#999',
  },
});
