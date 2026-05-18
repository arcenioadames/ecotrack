# EcoTrack Mobile

App móvil Expo + React Native para el sistema de inventario EcoTrack.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Android Studio (para emulador) o dispositivo real
- Backend EcoTrack corriendo en `http://192.168.1.100:3000`

### Instalación

```bash
cd mobile
npm install
```

### Configuración

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

Editar `.env` con la URL correcta del backend:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

> **IMPORTANTE**: Reemplaza `192.168.1.100` con la IP de tu máquina donde corre el backend.

### Ejecutar la App

#### En navegador web (desarrollo rápido):
```bash
npm start
npm run web
```

#### En Android (emulador):
```bash
npm start
npm run android
```

#### En iOS (macOS solo):
```bash
npm start
npm run ios
```

## 📁 Estructura de Carpetas

```
mobile/
├── App.tsx                 # App raíz con NavigationContainer
├── app.json                # Configuración Expo
├── eas.json                # Configuración build Expo
├── babel.config.js         # Configuración Babel
├── package.json            # Dependencias
├── tsconfig.json           # TypeScript config
│
├── src/
│   ├── screens/           # Pantallas de la app
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── ExpiringScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   └── SplashScreen.tsx
│   │
│   ├── navigation/        # Stacks de navegación
│   │   ├── AuthStack.tsx
│   │   └── AppStack.tsx
│   │
│   ├── services/          # Servicios (Axios, Auth)
│   │   ├── axios.ts       # Configuración HTTP + interceptores
│   │   └── auth-context.tsx # Contexto de autenticación
│   │
│   └── types/             # TypeScript types
│       └── index.ts
```

## 🔐 Autenticación

### Login Demo

```
Email: admin@ecotrack.com
Password: Test@123!
```

El login usa el backend real en `POST /auth/login`.

Los tokens se guardan en **SecureStore** (almacenamiento seguro del dispositivo).

## 📱 Pantallas

### 1. **Login**
- Formulario email/contraseña
- Conecta con backend real
- Manejo de errores

### 2. **Dashboard**
- Estadísticas: Total productos, próximos a vencer, vencidos
- Botón Salir (logout)
- Navegación a otras pantallas

### 3. **Productos**
- Lista de todos los productos
- Muestra: nombre, categoría, fecha vencimiento
- Pull-to-refresh
- Indicador visual de productos vencidos

### 4. **Próximos a Vencer**
- Lista productos que vencen en 30 días
- Indicador de urgencia (URGENTE, PRÓXIMO, OK)
- Muestra días restantes

### 5. **Categorías**
- Lista todas las categorías
- Código de colores para cada categoría
- Pull-to-refresh

## 🔌 Integración Backend

La app consume los siguientes endpoints:

```
GET    /analytics/dashboard     → Dashboard data
GET    /products                → Lista de productos
GET    /products/expiring?days=30 → Productos próximos a vencer
GET    /categories              → Lista de categorías
POST   /auth/login              → Iniciar sesión
POST   /auth/logout             → Cerrar sesión
GET    /auth/me                 → Datos del usuario autenticado
```

Los tokens JWT se manejan automáticamente con interceptores en axios.

## 📦 Dependencias Principales

```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native": "^0.74.0",
  "expo": "^51.0.0",
  "axios": "^1.6.0",
  "expo-secure-store": "^13.0.0",
  "react-native-gesture-handler": "~2.14.0",
  "react-native-reanimated": "~3.8.0",
  "react-native-safe-area-context": "^4.8.0",
  "react-native-screens": "^3.30.0"
}
```

**NO incluye**: expo-router, redux, zustand, nativewind (arquitectura minimalista)

## 🏗️ Compilar APK

### Preview (development):
```bash
eas build --platform android --profile preview
```

### Production:
```bash
eas build --platform android
```

Requiere:
1. Cuenta Expo (`expo login`)
2. Proyecto vinculado a Expo (`eas project create`)

## 🐛 Troubleshooting

### Metro bundler lento
```bash
npm start -- --clear
```

### Puerto ocupado (8081)
```bash
npm start -- --port 8090
```

### SecureStore no funciona
- En Android: requiere configuración del proyecto
- En emulador: usar `AsyncStorage` como fallback

### Backend no responde
- Verificar que backend corre en `http://192.168.1.100:3000`
- Cambiar IP en `.env` si es necesario
- En emulador Android: usar `10.0.2.2` en lugar de `localhost`

## ✅ Features Implementados

- ✅ Login con JWT (backend real)
- ✅ Almacenamiento seguro de tokens (SecureStore)
- ✅ Auto-refresh de tokens con interceptor
- ✅ Dashboard con estadísticas
- ✅ Listado de productos
- ✅ Productos próximos a vencer
- ✅ Listado de categorías
- ✅ Logout
- ✅ Pull-to-refresh en listas
- ✅ Manejo de errores
- ✅ Loading states

## ❌ NOT Included

- Expo Router (stack simple)
- Redux / Zustand (Context API + hooks)
- NativeWind (StyleSheet + inline styles)
- Push notifications
- Offline support
- Edición de productos
- Gráficos avanzados

## 📝 Notas

- La app es **minimalista y enfocada en demo**
- TypeScript **strict mode** activado
- Responsive design con StyleSheet de React Native
- Compatible Android 6+ / iOS 13+

## 🤝 Soporte

Para issues o preguntas, ver backend en `/backend`

---

**Estado**: ✅ READY - App funcional y conectada al backend real
