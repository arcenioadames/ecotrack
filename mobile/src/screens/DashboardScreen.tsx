import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useAuth } from '../services/auth-context';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { useDashboard } from '../hooks/useDashboard';

type DashboardScreenNavigation = {
  navigate: (route: string) => void;
};

type Props = {
  navigation: DashboardScreenNavigation;
};

export function DashboardScreen({ navigation }: Props) {
  const { data, loading, error, refresh } = useDashboard();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      Alert.alert('Error', message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  const isEmpty = !error && (!data || data.totalProducts === 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>No se pudo cargar el dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              void refresh();
            }}
          >
            <Text style={styles.actionButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : isEmpty ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Sin datos para mostrar</Text>
          <Text style={styles.emptyMessage}>
            No hay productos registrados o la información aún no está disponible.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              void refresh();
            }}
          >
            <Text style={styles.actionButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <DashboardCards data={data!} />
        </View>
      )}


      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.actionButtonText}>Ver Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.actionButtonText}>Escanear Producto</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
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
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
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

