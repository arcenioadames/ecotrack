import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ExpiringScreen } from '../screens/ExpiringScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { ProductRegistrationScreen } from '../screens/ProductRegistrationScreen';


const Stack = createNativeStackNavigator();

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'EcoTrack Dashboard',
        }}
      />
      <Stack.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Productos',
        }}
      />
      <Stack.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{
          title: 'Escanear Código',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Expiring" 
        component={ExpiringScreen}
        options={{
          title: 'Próximos a Vencer',
        }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          title: 'Categorías',
        }}
      />
      <Stack.Screen
        name="ProductRegistration"
        component={ProductRegistrationScreen}
        options={{
          title: 'Registrar Producto',
        }}
      />

    </Stack.Navigator>
  );
}
