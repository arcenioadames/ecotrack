#!/usr/bin/env node

/**
 * EcoTrack - Network Configuration Helper
 *
 * Este script ayuda a configurar la conectividad entre el backend y la app móvil.
 * Ejecuta: node scripts/network-config.js
 */

const os = require('os');

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networks = [];

  console.log('🔍 DETECTANDO CONFIGURACIÓN DE RED...\n');

  for (const [name, ifaceList] of Object.entries(interfaces)) {
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        networks.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac
        });
      }
    }
  }

  return networks;
}

function findBestLocalIp(networks) {
  // Priorizar IPs de redes locales comunes
  const priorityOrder = [
    (ip) => ip.startsWith('192.168.'),
    (ip) => ip.startsWith('10.'),
    (ip) => ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31,
  ];

  for (const priorityFn of priorityOrder) {
    const match = networks.find(net => priorityFn(net.address));
    if (match) return match;
  }

  // Fallback a la primera IPv4 no localhost
  return networks.find(net => net.address !== '127.0.0.1') || networks[0];
}

function generateConfig(bestIp) {
  const backendUrl = `http://${bestIp.address}:3000`;

  console.log('📋 CONFIGURACIÓN RECOMENDADA:\n');

  console.log('1️⃣ BACKEND (.env):');
  console.log(`   HOST=0.0.0.0`);
  console.log(`   CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,${backendUrl},http://10.0.2.2:3000,exp://*`);
  console.log('');

  console.log('2️⃣ MOBILE (.env):');
  console.log(`   EXPO_PUBLIC_API_URL=${backendUrl}`);
  console.log('');

  console.log('3️⃣ VERIFICACIÓN:');
  console.log(`   Backend debería estar accesible en: ${backendUrl}`);
  console.log(`   Prueba desde el navegador: ${backendUrl}/api-docs`);
  console.log('');

  console.log('4️⃣ COMANDOS PARA INICIAR:');
  console.log('   # Terminal 1 - Backend');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('   # Terminal 2 - Mobile');
  console.log('   cd mobile && npx expo start --lan --clear');
  console.log('');

  console.log('5️⃣ TESTING DESDE DISPOSITIVO:');
  console.log(`   - Escanea QR code con Expo Go`);
  console.log(`   - La app debería conectarse automáticamente a ${backendUrl}`);
  console.log('');

  console.log('⚠️  NOTAS IMPORTANTES:');
  console.log('   - Asegúrate de que el firewall permita conexiones en puerto 3000');
  console.log('   - El dispositivo móvil debe estar en la MISMA red WiFi');
  console.log('   - Si usas VPN, desactívala para testing local');
  console.log('   - Para Android Emulator, usa: EXPO_PUBLIC_API_URL=http://10.0.2.2:3000');
}

function main() {
  console.log('🚀 EcoTrack - Network Configuration Helper\n');

  const networks = getNetworkInfo();

  if (networks.length === 0) {
    console.log('❌ No se encontraron interfaces de red activas.');
    console.log('💡 Verifica tu conexión a internet.');
    return;
  }

  console.log('📊 INTERFACES DE RED ENCONTRADAS:');
  networks.forEach((net, index) => {
    console.log(`   ${index + 1}. ${net.interface}: ${net.address} (Máscara: ${net.netmask})`);
  });
  console.log('');

  const bestIp = findBestLocalIp(networks);

  if (!bestIp) {
    console.log('❌ No se pudo determinar una IP local adecuada.');
    return;
  }

  console.log(`✅ IP RECOMENDADA: ${bestIp.address} (Interface: ${bestIp.interface})`);
  console.log('');

  generateConfig(bestIp);

  console.log('🔧 ¿Necesitas ayuda adicional?');
  console.log('   - Si usas Windows: ipconfig');
  console.log('   - Si usas Mac/Linux: ifconfig o ip addr');
  console.log('   - Busca la IP que comience con 192.168.X.X o 10.X.X.X');
}

if (require.main === module) {
  main();
}

module.exports = { getNetworkInfo, findBestLocalIp };