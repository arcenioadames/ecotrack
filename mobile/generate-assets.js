// Script para generar imágenes PNG válidas para Expo
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'assets');

// Crear verde EcoTrack (#2e7d32) como color base
const ecotrackGreen = '#2e7d32';

async function generateAssets() {
  try {
    // 1. Icon (1024x1024) - Para App Store
    console.log('Generando icon.png (1024x1024)...');
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 3,
        background: ecotrackGreen,
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png generado');

    // 2. Splash (1242x2436) - Pantalla de inicio
    console.log('Generando splash.png (1242x2436)...');
    await sharp({
      create: {
        width: 1242,
        height: 2436,
        channels: 3,
        background: '#ffffff',
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ splash.png generado');

    // 3. Adaptive Icon (108x108) - Android adaptive icon
    console.log('Generando adaptive-icon.png (108x108)...');
    await sharp({
      create: {
        width: 108,
        height: 108,
        channels: 3,
        background: ecotrackGreen,
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png generado');

    // 4. Favicon (32x32) - Web favicon
    console.log('Generando favicon.png (32x32)...');
    await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: ecotrackGreen,
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png generado');

    console.log('\n✅ Todos los assets generados correctamente');
  } catch (error) {
    console.error('❌ Error generando assets:', error);
    process.exit(1);
  }
}

generateAssets();
