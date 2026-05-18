# EcoTrack Demo Freeze Report

Fecha: 2026-05-17
Estado: Demo Release Candidate (pre-demo freeze)

---
## Estado final

- **Backend**: ✅ dev server en `http://localhost:3000` responde `/health` (200)
- **Mobile**: ✅ Expo SDK 50, scripts `start:lan` y `start:tunnel` disponibles
- **Expo LAN**: ✅ Metro publica `exp://<LAN_IP>:8081` cuando se usa `start:lan` (auto-detect)
- **Tunnel**: ✅ disponible (`expo start --tunnel`) como fallback
- **Auth**: ✅ login y refresh token flow verificados en ambiente local
- **Refresh**: ✅ flujo de refresh token probado
- **Healthcheck**: ✅ `mobile/scripts/demo-check.js` ejecutable y devuelve estado
- **VSCode Tasks**: ✅ `Backend Dev`, `Mobile Start LAN`, `Mobile Start Tunnel`, `Demo Healthcheck`, `Full Demo Stack` (con precheck)
- **APK Preview / EAS**: ⚠️ preparado (perfil `preview` en `eas.json`, `android.package` en `app.json`), requiere `eas login` y verificación de dependencias nativas antes de build

---
## Riesgos reales restantes

- AP isolation en la Wi‑Fi de demo (los dispositivos no alcanzan al PC). Impacto: alto. Mitigación: hotspot del móvil o usar tunnel.
- Adaptadores virtuales (Hamachi, Docker, WSL) alteran IP detectable. Impacto: medio. Mitigación: desactivar adaptadores o usar script `start-lan` que prioriza 192.168.* / 10.*.
- Firewall / políticas corporativas bloqueando puertos (8081, 19000‑19002). Impacto: medio-alto. Mitigación: ejecutar `open-expo-firewall.ps1` como admin.
- EAS build fallos por dependencias nativas o credenciales. Impacto: alto para APK; mitigación: validar `expo prebuild` y `eas login` antes.

---
## Checklist definitivo de demo (ejecutable)

1. Abrir PowerShell como Administrator.
2. Pull y dependencias:
   - `git pull`
   - `cd backend && npm ci`
   - `cd ../mobile && npm ci`
3. Ejecutar firewall helper (Admin):
```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\open-expo-firewall.ps1
```
4. VSCode → Terminal → Run Task → `Full Demo Stack` (esto ejecuta `Demo Healthcheck` y, si OK, levanta backend + mobile).
5. Ejecutar (opcional) `Demo Healthcheck` manual:
```bash
cd mobile
npm run demo:check
```
6. En el móvil (misma Wi‑Fi): abrir Expo Go y escanear QR o abrir `exp://<LAN_IP>:8081` (usar IP indicada por healthcheck).
7. Probar flujo E2E: Login → Dashboard → Products → Categories → Expiring → Logout → Reopen → Session restore.
8. Si algo falla, seguir el plan de recuperación rápido abajo.

---
## Quick Recovery (menos de 2 minutos)

Escenarios y pasos rápidos:

- Expo Go no conecta / QR no abre:
  1. Ejecutar `cd mobile && npm run demo:check` → ver Local IP y Metro status.
  2. Si Metro en `127.0.0.1`, detener y re-lanzar con `npm run start:lan` (o usar `Mobile Start Tunnel` task).
  3. Si sigue en 127.0.0.1, comprobar que `start-lan.js` detectó IP; si no, exportar explícito en la sesión:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.x.y"
npx expo start --lan --clear
```

- Metro en 127.0.0.1:
  - Revisar salida de `start-lan` (imprime detected local ip). Si no coincide, desactivar adaptadores virtuales y relanzar.

- Backend offline / login falla:
  - En VSCode ver consola `Backend Dev` task; si no está corriendo, arrancar `Backend Dev` task.
  - Ejecutar `curl http://localhost:3000/health` desde el PC.

- WiFi distinta / AP isolation:
  - Cambiar móvil a hotspot del PC o usar `npm run start:tunnel`.

- Firewall:
  - Ejecutar script firewall helper (Admin) o abrir puertos 8081/19000/19001/19002.

- Tunnel fallback rápido:
  - Run Task → `Mobile Start Tunnel`.

---
## Probabilidad real de éxito (estimación)

- En entorno controlado (misma red Wi‑Fi sin AP isolation, firewall local controlado): **~90%**.
- En red corporativa con restricciones/isolación: **~40%**.
- Con fallback a Tunnel y/o APK preview listo: efectivo **>=95%** en la práctica.

---
## Recomendaciones finales (mínimas)

- Mantener el PC y dispositivo conectados a la misma red y desactivar VPNs/Hamachi durante la demo.
- Ejecutar el firewall helper antes de comenzar.
- Tener `Mobile Start Tunnel` listo como fallback y preparar `eas build --profile preview` si el túnel falla.
- Mantener batería y desactivar sleep.

---

Generado automáticamente por la preparación pre-demo. Sigue el checklist.
