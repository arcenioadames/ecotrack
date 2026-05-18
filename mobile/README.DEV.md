# Mobile — Local Development (EcoTrack)

This file documents the stable, reproducible workflow for running the mobile app locally on Windows.

## Quick start (LAN - stable)

1. Ensure your PC and device are on the same Wi‑Fi network.
2. From the repository root (Windows PowerShell or Git Bash):

```powershell
cd mobile
npm install
npm run start:lan
```

- `npm run start:lan` runs `node ./scripts/start-lan.js`, which auto-detects a non-loopback IPv4 address (prefers `192.168.*` / `10.*`) and sets `REACT_NATIVE_PACKAGER_HOSTNAME` for Expo before launching.
- This avoids manual `set`/`$env:` and works across PowerShell, CMD and Git Bash.

## Commands

- LAN (recommended for local network devices):

```bash
npm run start:lan
```

- Tunnel (fallback when LAN fails or across networks):

```bash
npm run start:tunnel
```

- Clear cache / debug:

```bash
npm run start:clear
```

## Troubleshooting checklist (Windows)

1. If Metro prints `exp://127.0.0.1:8081`:
   - Ensure you launched via `npm run start:lan` (the script prints the chosen host).
   - Or export manually in the same shell before running:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.20.25"
npx expo start --lan --clear
```

2. Network adapters & VPNs
   - Disable Hamachi, any VPNs, or virtual adapters temporarily if you see wrong IPs.
   - Check `ipconfig /all` and `node -e "console.log(require('os').networkInterfaces())"` to verify detected IP.

3. Firewall
   - Ensure Windows Firewall allows inbound to Node/Expo or open TCP 8081 for LAN during dev:

```powershell
New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

4. If device cannot connect
   - Verify device ping or HTTP to `http://<PC_IP>:3000` (backend) and `http://<PC_IP>:8081` (Metro)
   - Try `expo start --tunnel` as fallback

## VSCode tasks

- Use the workspace Tasks (`Terminal → Run Task`) to start services quickly:
   - `Backend Dev` — runs the backend in `backend/` (ts-node-dev)
   - `Mobile Start LAN` — starts Expo LAN (`npm run start:lan`) in `mobile/`
   - `Mobile Start Tunnel` — starts Expo tunnel
   - `Full Demo Stack` — starts backend + mobile (parallel)

## Firewall helper

- Use the PowerShell helper to create firewall rules (run as Administrator):

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\open-expo-firewall.ps1
```

This script ensures rules for ports `8081`, `19000`, `19001`, `19002` without duplicating existing rules.

## Demo healthcheck

- Use the demo healthcheck script before the demo to validate services and environment:

```bash
cd mobile
npm run demo:check
```

It validates `http://localhost:3000/health`, TCP to Metro on `8081`, shows detected LAN IP and `EXPO_PUBLIC_API_URL` from `.env`.

## APK Preview / EAS readiness (explicit)

Before running `eas build --platform android --profile preview` ensure:

- `eas-cli` installed and authenticated: `npm i -g eas-cli && eas login`
- `mobile/app.json` contains `android.package` (package name) — already set to `com.ecotrack.mobile`.
- `eas.json` contains a `preview` profile — present.
- App assets exist (icons, adaptive icon, splash) — check `mobile/assets/`.
- No missing native-only dependencies for preview builds.

If all above are satisfied, this command should run:

```bash
cd mobile
eas build --platform android --profile preview
```


## app.config.js and env

- `EXPO_PUBLIC_API_URL` is read from `mobile/.env` or environment.
- `app.config.js` is purposely conservative: it detects local IP for runtime API URL but does NOT control Metro/packager host.
- For runtime debugging, set `EXPO_PUBLIC_API_URL` to your machine IP when testing on a physical device.

## APK / Demo readiness (tomorrow checklist)

1. EAS config: `eas.json` includes `preview` profile. Good.
2. Ensure `eas-cli` installed and logged in: `npm i -g eas-cli && eas login`.
3. For a fast APK preview use profile `preview`:

```bash
cd mobile
eas build --platform android --profile preview
```

4. Confirm SDK / deps:
   - Expo SDK 50 present in `package.json` (`expo: ^50.0.0`).
   - Node `>=18`.

## Risks remaining

- If multiple virtual adapters exist (Hamachi, Docker, WSL), detection may pick a different interface—script prefers `192.168.*` and `10.*` addresses but cannot cover all exotic cases.
- Firewall/antivirus policies on the machine or network restrictions may still block device connectivity.

## Quick troubleshooting commands (copy/paste)

```powershell
# show interfaces
ipconfig /all
# what Node sees
node -e "console.log(JSON.stringify(require('os').networkInterfaces(), null, 2))"
# start LAN (auto-detect)
npm run start:lan
# start tunnel
npm run start:tunnel
# open firewall port for Metro
New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

---

If you want, I can also add a short `mobile/.vscode/tasks.json` task to run `npm run start:lan` from VSCode. Would you like that?