# 🌐 CONFIGURACION DE NETWORKING - ECOTRACK MOBILE

**Estado:** Backend en `http://localhost:3000` (Express + Prisma)

---

## 📋 TABLA RAPIDA - QUÉ USAR EN CADA CASO

| Escenario | URL | Comando | Notas |
|-----------|-----|---------|-------|
| **Android Emulator** | `10.0.2.2:3000` | Sin .env (default) | Solo emulador, no dispositivo |
| **iOS Simulator** | `127.0.0.1:3000` | `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 npm start` | Solo Mac |
| **Expo Go en WiFi** | `192.168.X.X:3000` | `EXPO_PUBLIC_API_URL=http://192.168.X.X:3000 npm start` | Remplaza X.X con tu IP |
| **Expo Go Tunnel** | URL pública | Configura en EAS | Para internet pública |
| **APK Desarrollo** | `192.168.X.X:3000` | Build con env var | Mismo WiFi |
| **APK Producción** | URL pública | Config en CI/CD | Backend en internet |

---

## 🔧 CONFIGURACION PASO A PASO

### 1. ANDROID EMULATOR (Default - Recomendado para testing)

**El emulador usa `10.0.2.2` para acceder al host.**

```bash
# Opción 1: Sin configuración (usa default)
npm start

# Luego en Expo CLI: Presiona 'a' para Android Emulator
```

**¿Cómo funciona?**
- Expo/Metro detecta que es Android Emulator
- app.config.js retorna `10.0.2.2:3000`
- axios.ts conecta a `http://10.0.2.2:3000`
- ✅ Backend en Windows/Mac/Linux acepta en `localhost:3000`

**Verificación:**
```bash
# En el emulador, en Expo console verás:
# [Axios Init] Final apiUrl: http://10.0.2.2:3000
```

---

### 2. iOS SIMULATOR (Mac)

```bash
# iOS Simulator en Mac puede usar localhost
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 npm start

# Luego: Presiona 'i' en Expo CLI
```

**¿Por qué `127.0.0.1` y no `10.0.2.2`?**
- iOS Simulator usa `127.0.0.1` para host (diferente a Android)
- `10.0.2.2` es solo para Android Emulator

---

### 3. EXPO GO EN DISPOSITIVO FISICO (Mismo WiFi)

**Requisitos:**
- Backend corriendo en tu máquina (Windows/Mac/Linux)
- Dispositivo en el MISMO WiFi
- Conocer tu IP local del backend

**Pasos:**

```bash
# 1. Encuentra tu IP local
# Windows:
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)

# Mac/Linux:
ifconfig
# Busca inet (ej: 192.168.1.100)

# 2. Inicia backend (si no está corriendo)
cd backend
npm start
# Debe mostrar: "Servidor corriendo en http://localhost:3000"

# 3. En OTRA terminal, configura mobile con tu IP
cd mobile
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000 npm start

# 4. En Expo CLI:
# Presiona 'w' para QR code
# Abre Expo Go en tu teléfono
# Escanea QR

# 5. Verifica en console:
# [Axios Init] Final apiUrl: http://192.168.1.100:3000
```

**⚠️ IMPORTANTE:**
- Usa tu IP REAL, no `localhost` ni `127.0.0.1`
- Ambas máquinas deben estar en MISMO WiFi
- Firewall de Windows/Mac: permitir puerto 3000

---

### 4. EXPO GO VIA TUNNEL (Internet Pública)

Para cuando no estés en mismo WiFi:

```bash
# En terminal mobile:
npm start

# En Expo CLI presiona: 't' para Tunnel
# Expo genera URL pública (ej: https://u.expo.dev/...")

# En otro dispositivo, escanea ese QR
```

**¿Backend remoto?**

Si backend está en servidor remoto (`api.ecotrack.com`):

```bash
cd mobile
EXPO_PUBLIC_API_URL=https://api.ecotrack.com npm start

# Luego: presiona 't' en Expo CLI
```

---

### 5. BUILD APK PREVIEW (Desarrollo)

Para probar APK antes de producción:

```bash
cd mobile

# Opción A: Con emulador local
# (sin cambios en .env)
npm run build:preview

# Opción B: Con IP local en WiFi
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000 npm run build:preview

# Opción C: Con URL remota
EXPO_PUBLIC_API_URL=https://api.ecotrack.com npm run build:preview
```

**Luego:**
1. EAS genera APK
2. Descárgalo en dispositivo
3. Instala: `adb install app.apk`
4. Abre app - debe conectarse al backend

---

### 6. BUILD APK PRODUCCION

Para release final en Play Store:

```bash
cd mobile

# Configurar URL de backend remoto
EXPO_PUBLIC_API_URL=https://api.ecotrack.com npm run build:android
```

---

## 🔍 DEBUGGING

### Ver qué URL está usando la app

**En Expo Go Console:**
```bash
# Mientras app está abierta en Expo Go:
# Abre Dev Menu: Shake device (iOS) o Menu button (Android)
# Busca "View all logs" o "Logs"
# Busca línea: "[Axios Init] Final apiUrl: ..."
```

### Probar conectividad

**Desde teléfono en mismo WiFi:**

Android (adb):
```bash
adb shell
ping 192.168.1.100:3000
# o
curl http://192.168.1.100:3000/health
```

**Test directo en app:**

En LoginScreen, intenta login con:
- Email: `admin@ecotrack.com`
- Password: (tu contraseña de testing)

Si funciona login → URL está correcta

---

## 📝 ARCHIVOS MODIFICADOS

- `mobile/app.json` - Removido hardcoded `apiUrl`
- `mobile/app.config.js` - Lógica inteligente de detección
- `mobile/.env.example` - Documentación completa
- `mobile/src/services/axios.ts` - Agregado logging

---

## 🚨 PROBLEMAS COMUNES

### "Cannot connect to server" en Expo Go

**Causas posibles:**
1. ❌ IP incorrecta - verifica con `ipconfig`
2. ❌ Dispositivo en WiFi diferente - deben estar en MISMO WiFi
3. ❌ Firewall bloqueando puerto 3000 - abre firewall en tu PC
4. ❌ Backend no corriendo - verifica `npm start` en backend/

**Solución:**

```bash
# 1. Verifica IP real
ipconfig | findstr IPv4

# 2. Verifica backend está corriendo
curl http://localhost:3000/health

# 3. Verifica conectividad desde dispositivo
# (adb si Android, o ping directo)

# 4. Reinicia Expo:
npm start
# Presiona 'c' para limpiar cache
```

### "CORS error" en network tab

**Backend en Express necesita CORS correctamente configurado:**

En `backend/src/app.ts` debe haber:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.100', ...],
  credentials: true,
}));
```

---

## ✅ VALIDACION FINAL

Cuando hayas configurado todo:

```bash
# Terminal 1: Backend
cd backend
npm start
# Debe mostrar: "Servidor corriendo en http://localhost:3000"

# Terminal 2: Mobile
cd mobile
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000 npm start
# (reemplaza IP con la tuya)

# Terminal 3: Testing
curl -X POST http://192.168.1.100:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecotrack.com","password":"123456"}'
# Debe retornar: { accessToken, refreshToken }
```

**En Expo Go:**
1. Escanea QR
2. App carga
3. LoginScreen aparece
4. Intenta login - debe pasar a DashboardScreen
5. Verifica en console: `[Axios Init] Final apiUrl: http://192.168.1.100:3000`

---

## 🎯 SIGUIENTE PASO

1. ✅ Configuración de URL está correcta
2. ✅ Permisos Android correctos
3. ✅ axios.ts con refresh token OK
4. **→ Ahora:** Prueba con Expo Go en emulador/dispositivo
5. **→ Luego:** Genera APK preview con EAS

