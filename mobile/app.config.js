import 'dotenv/config';

export default ({ config }) => {
  /**
   * CONFIGURACIÓN DE API URL PARA DIFERENTES ENTORNOS
   *
   * DETECCIÓN AUTOMÁTICA POR ENTORNO:
   *
   * 1. EXPO_PUBLIC_API_URL (variable de entorno - máxima prioridad)
   * 2. Detección automática basada en plataforma y modo
   *
   * VALORES RECOMENDADOS POR ESCENARIO:
   *
   * 📱 DISPOSITIVO FÍSICO (Android/iOS) - MISMA RED WIFI:
   *    - Encuentra la IP de tu computadora: ipconfig (Windows) / ifconfig (Mac/Linux)
   *    - Busca la IP que comienza con 192.168.X.X o 10.0.X.X
   *    - Ejemplo: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   *
   * 🤖 ANDROID EMULATOR (Android Studio):
   *    - Usa 10.0.2.2 (IP especial del emulador)
   *    - Ejemplo: EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
   *
   * 🍎 IOS SIMULATOR:
   *    - Usa localhost o 127.0.0.1
   *    - Ejemplo: EXPO_PUBLIC_API_URL=http://localhost:3000
   *
   * 🌐 EXPO TUNNEL (para testing remoto):
   *    - npx expo start --tunnel
   *    - No necesitas configurar EXPO_PUBLIC_API_URL
   *
   * 🔧 DESARROLLO LOCAL (Expo Go):
   *    - Configura la IP de tu máquina en la misma red
   */

  // Función para detectar automáticamente la IP local
  const getLocalIp = () => {
    try {
      const os = require('os');
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          const isIPv4 = iface.family === "IPv4" || iface.family === 4;
          // IPv4, no interna, no loopback (Node puede reportar family como 4)
          if (isIPv4 && !iface.internal && iface.address !== "127.0.0.1") {
            // Preferir IPs que empiecen con 192.168 o 10.
            if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
              return iface.address;
            }
          }
        }
      }
      return 'localhost'; // fallback
    } catch {
      return 'localhost';
    }
  };

  // Lógica de detección automática
  let apiUrl;

  if (process.env.EXPO_PUBLIC_API_URL) {
    // 1. Variable de entorno explícita
    apiUrl = process.env.EXPO_PUBLIC_API_URL;
  } else {
    // 2. Detección automática
    const localIp = getLocalIp();
    apiUrl = `http://${localIp}:3000`;
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
    },
  };
};

// Nota: Metro/Expo usa `REACT_NATIVE_PACKAGER_HOSTNAME` para decidir la URL publicada (exp://...)
// Si Metro publica 127.0.0.1, exportar REACT_NATIVE_PACKAGER_HOSTNAME con la IP LAN en la misma shell.
// Ejemplo PowerShell: $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.20.25"
