import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useCameraPermissions, useScannerState } from '@hooks';

/**
 * ScannerScreen - Pantalla de escaneo de códigos de barras
 * Maneja:
 * - Solicitud de permisos de cámara
 * - Visualización de estado
 * - Manejo de errores de permisos y cámara
 * - Interfaz limpia para escaneo
 */
export function ScannerScreen(): React.ReactElement {
  const { status, isLoading, error: permissionError, requestPermission } = useCameraPermissions();
  const { state, errorMessage, setScanState, setError } = useScannerState();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);

  /**
   * Maneja la solicitud de permisos
   * Permite al usuario habilitar la cámara si no tienen permisos
   */
  const handleRequestPermission = async (): Promise<void> => {
    const granted = await requestPermission();
    if (!granted) {
      setError('No fue posible obtener permisos de cámara');
      Alert.alert(
        'Permisos Requeridos',
        'Para usar el scanner necesitamos acceso a tu cámara. Habilítalo en configuración.',
        [{ text: 'OK' }],
      );
    }
  };

  /**
   * Renderiza pantalla de espera (permisos en progreso)
   */
  const renderPendingPermissions = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.title}>Verificando permisos...</Text>
      </View>
    </SafeAreaView>
  );

  /**
   * Renderiza pantalla de permisos denegados
   */
  const renderDeniedPermissions = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📷</Text>
        </View>
        <Text style={styles.title}>Acceso a cámara requerido</Text>
        <Text style={styles.description}>{permissionError || 'No tenemos permisos para acceder a tu cámara'}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>Habilitar Cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  /**
   * Renderiza la pantalla del scanner con la cámara
   */
  const renderScanner = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear Código de Barras</Text>
        <Text style={styles.headerSubtitle}>Apunta la cámara al código de barras</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'upca', 'code128'],
          }}
          onBarcodeScanned={() => {
            // Handler será implementado en HU-03.2
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </CameraView>
      </View>

      {/* Estado de escaneo */}
      {isScanning && (
        <View style={styles.scanningIndicator}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.scanningText}>Procesando código...</Text>
        </View>
      )}

      {/* Mostrar errores */}
      {state === 'error' && errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>Descartar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            // Navegación será implementada más adelante
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Flujo de permisos
  if (isLoading) {
    return renderPendingPermissions();
  }

  if (status === 'denied') {
    return renderDeniedPermissions();
  }

  if (status === 'granted') {
    return renderScanner();
  }

  // Fallback
  return renderPendingPermissions();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4CAF50',
    borderWidth: 3,
    top: '25%',
    left: '15%',
  },
  topRight: {
    top: '25%',
    left: 'auto',
    right: '15%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: 'auto',
    bottom: '25%',
    left: '15%',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    top: 'auto',
    bottom: '25%',
    left: 'auto',
    right: '15%',
    borderWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
  },
  scanningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f44336',
    borderTopWidth: 1,
    borderTopColor: '#d32f2f',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  errorDismiss: {
    marginLeft: 16,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconText: {
    fontSize: 64,
  },
});
