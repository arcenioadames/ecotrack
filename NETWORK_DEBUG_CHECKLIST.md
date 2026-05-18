# 🚀 EcoTrack - Checklist de Debugging de Conectividad

## 📋 VERIFICACIÓN PASO A PASO

### ✅ PASO 1: CONFIGURACIÓN DEL BACKEND
- [ ] Backend ejecutándose: `cd backend && npm run dev`
- [ ] Puerto correcto: `http://localhost:3000`
- [ ] API Docs accesible: `http://localhost:3000/api-docs`
- [ ] HOST configurado como `0.0.0.0` en `.env`
- [ ] CORS_ORIGIN incluye tu IP local

**Comando para verificar:**
```bash
# Desde otra terminal
curl http://localhost:3000/health || echo "Backend no responde"
```

### ✅ PASO 2: CONFIGURACIÓN DE RED LOCAL
- [ ] Encuentra tu IP local:
  - Windows: `ipconfig`
  - Mac/Linux: `ifconfig` o `ip addr`
- [ ] Busca IP que empiece con `192.168.X.X` o `10.X.X.X`
- [ ] Backend accesible desde red: `http://[TU-IP]:3000/api-docs`

**Comando para verificar:**
```bash
# Reemplaza TU_IP con tu IP real
curl http://192.168.1.100:3000/health
```

### ✅ PASO 3: CONFIGURACIÓN DEL MÓVIL
- [ ] Archivo `.env` correcto:
  ```
  EXPO_PUBLIC_API_URL=http://[TU-IP]:3000
  ```
- [ ] App.config.js actualizado
- [ ] Cache de Expo limpiado: `npx expo start --lan --clear`

### ✅ PASO 4: INICIO DE EXPO
- [ ] Comando correcto: `npx expo start --lan --clear`
- [ ] QR code visible en terminal
- [ ] Metro bundler funcionando
- [ ] No errores de "Unable to resolve"

### ✅ PASO 5: CONEXIÓN DESDE DISPOSITIVO
- [ ] Expo Go instalado en dispositivo
- [ ] Dispositivo en MISMA red WiFi que la PC
- [ ] Escanear QR code con Expo Go
- [ ] App carga sin errores de assets

### ✅ PASO 6: TESTING DE API
- [ ] Abrir DevTools en Expo: `m` en terminal
- [ ] Verificar logs de red en console
- [ ] Intentar login/register
- [ ] Verificar requests en Network tab

**Logs esperados en Expo DevTools:**
```
🚀 API Request: { method: "POST", url: "/auth/login", ... }
✅ API Response: { status: 200, ... }
```

---

## 🔍 DIAGNÓSTICO DE ERRORES COMUNES

### ❌ "Network request failed"
**Causa:** IP incorrecta en EXPO_PUBLIC_API_URL
**Solución:**
```bash
# Ejecutar helper de red
node scripts/network-config.js

# Actualizar .env con la IP correcta
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### ❌ "Connection refused" / "ECONNREFUSED"
**Causa:** Backend no accesible desde red
**Solución:**
- Verificar HOST=0.0.0.0 en backend/.env
- Reiniciar backend
- Verificar firewall bloquea puerto 3000

### ❌ "Timeout" / "ETIMEDOUT"
**Causa:** Dispositivo no puede alcanzar la IP
**Solución:**
- Verificar misma red WiFi
- Probar ping desde dispositivo: `ping 192.168.1.100`
- Desactivar VPN si está activa

### ❌ "CORS error"
**Causa:** CORS no configurado para la IP del dispositivo
**Solución:**
```bash
# En backend/.env
CORS_ORIGIN=http://localhost:3000,http://192.168.1.100:3000,exp://*
```

### ❌ "Unable to resolve expo-modules-core"
**Causa:** Cache corrupto de Metro
**Solución:**
```bash
cd mobile
rm -rf node_modules/.cache .expo
npm install
npx expo install --fix
npx expo start --lan --clear
```

---

## 🛠️ HERRAMIENTAS DE DEBUGGING

### 1. Helper de Configuración de Red
```bash
node scripts/network-config.js
```

### 2. Testing Manual desde Dispositivo
```bash
# Instalar app HTTP testing (ej: "HTTP Request Shortcuts")
# Crear request GET a: http://[TU-IP]:3000/health
```

### 3. Logs del Backend
```bash
cd backend
npm run dev  # Ver logs de requests entrantes
```

### 4. Logs de Expo
```bash
# En terminal de Expo, presiona 'd' para debugger
# O presiona 'm' para menu y ver logs
```

### 5. Testing con cURL
```bash
# Test desde PC
curl http://localhost:3000/health

# Test desde red local
curl http://192.168.1.100:3000/health
```

---

## 📱 CONFIGURACIONES POR ENTORNO

### Desarrollo Local (Expo Go)
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_DEBUG_API=true
```

### Android Emulator
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### iOS Simulator
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Producción
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://api.ecotrack.com
```

---

## 🚨 PROBLEMAS AVANZADOS

### Firewall Bloqueando
**Windows:**
```powershell
# Abrir puerto 3000
New-NetFirewallRule -DisplayName "EcoTrack Backend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**Linux/Mac:**
```bash
# Verificar si puerto está abierto
sudo netstat -tlnp | grep :3000
```

### IP Dinámica
Si tu IP cambia frecuentemente:
```bash
# Usar hostname local (solo misma red)
EXPO_PUBLIC_API_URL=http://tu-pc.local:3000

# O configurar IP estática en el router
```

### Problemas de DNS
```bash
# Usar IP directa en lugar de localhost
# Evitar usar nombres de dominio para desarrollo local
```

---

## 📞 SOLUCIÓN RÁPIDA

Si nada funciona, ejecuta:

```bash
# 1. Detectar configuración de red
node scripts/network-config.js

# 2. Actualizar configuraciones según output

# 3. Reiniciar todo
cd backend && npm run dev &
cd mobile && npx expo start --lan --clear
```

¿Sigues teniendo problemas? Comparte los logs de error específicos.