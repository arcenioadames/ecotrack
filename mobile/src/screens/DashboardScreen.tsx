import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { apiClient } from '../services/axios';
import { useAuth } from '../services/auth-context';

interface DashboardData {
  totalProducts: number;
  productsExpiring: number;
  productsExpired: number;
}

export function DashboardScreen({ navigation }: any) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/analytics/dashboard');
      setData(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Error', 'Error al cerrar sesión');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Productos</Text>
          <Text style={styles.cardValue}>{data?.totalProducts || 0}</Text>
        </View>

        <View style={[styles.card, styles.cardWarning]}>
          <Text style={styles.cardLabel}>Próximos a Vencer</Text>
          <Text style={styles.cardValue}>{data?.productsExpiring || 0}</Text>
        </View>

        <View style={[styles.card, styles.cardDanger]}>
          <Text style={styles.cardLabel}>Vencidos</Text>
          <Text style={styles.cardValue}>{data?.productsExpired || 0}</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.actionButtonText}>Ver Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Expiring')}
        >
          <Text style={styles.actionButtonText}>Próximos a Vencer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.actionButtonText}>Categorías</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
  },
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
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
