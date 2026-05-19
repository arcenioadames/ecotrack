import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Camera, CameraType, BarCodeScanningResult } from 'expo-camera';
import {
  useCameraPermissions,
  useScannerState,
  useBarcodeScanner,
  useProductLookup,
} from '../hooks';
import { BarcodeData } from '../types';

/**
 * ScannerScreen - Pantalla de escaneo de códigos de barras
 * Maneja:
 * - Solicitud de permisos de cámara
 * - Escaneo en tiempo real con detección de formatos
 * - Debounce para evitar duplicados
 * - Validación de códigos de barras
 * - Búsqueda de producto y fallback manual
 */
interface ScannerScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export function ScannerScreen({ navigation }: ScannerScreenProps): React.ReactElement {
  const { status, isLoading, error: permissionError, requestPermission } = useCameraPermissions();
  const { setScanState, setError } = useScannerState();
  const cameraRef = useRef<React.ElementRef<typeof Camera> | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const {
    product,
    isLoading: isLookupLoading,
    error: lookupError,
    notFound,
    lookupProduct,
    clearLookupError,
  } = useProductLookup();

  const onBarcodeProcessed = useCallback(
    async (barcode: BarcodeData): Promise<void> => {
      setIsScanning(false);
      setScanState('idle');
      await lookupProduct(barcode.value);
    },
    [lookupProduct, setScanState],
  );

  const { lastBarcode, error: barcodeError, handleBarcodeDetected, clearError } = useBarcodeScanner(
    500,
    onBarcodeProcessed,
  );

  const handleBarcodeScan = (scanningResult: BarCodeScanningResult): void => {
    if (!scanningResult.data) {
      return;
    }

    setIsScanning(true);
    setScanState('processing');
    handleBarcodeDetected(scanningResult.data);
  };

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

  const handleManualLookup = async (): Promise<void> => {
    setScanState('processing');
    await lookupProduct(manualCode);
    setScanState('idle');
  };

  const handleRegisterProduct = (barcode: string): void => {
    const normalizedBarcode = barcode.trim();
    if (!normalizedBarcode) {
      return;
    }

    navigation.navigate('ProductRegistration', { barcode: normalizedBarcode });
  };

  const registerBarcode = lastBarcode?.value || manualCode.trim();

  const renderManualFallback = (): React.ReactElement => (
    <View style={styles.manualContainer}>
      <Text style={styles.sectionTitle}>Ingresar código manualmente</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese código de barras"
        placeholderTextColor="#999"
        value={manualCode}
        onChangeText={(value) => setManualCode(value)}
        keyboardType="default"
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleManualLookup}
      />
      <TouchableOpacity
        style={[styles.primaryButton, styles.manualButton]}
        onPress={handleManualLookup}
        disabled={isLookupLoading || manualCode.trim().length === 0}
      >
        <Text style={styles.buttonText}>{isLookupLoading ? 'Buscando...' : 'Buscar producto'}</Text>
      </TouchableOpacity>

      {notFound && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            No se encontró producto con ese código. Registra uno nuevo si lo deseas.
          </Text>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.registerButton]}
            onPress={() => handleRegisterProduct(registerBarcode)}
            disabled={!registerBarcode}
          >
            <Text style={styles.buttonText}>Registrar producto</Text>
          </TouchableOpacity>
        </View>
      )}

      {lookupError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{lookupError}</Text>
          <TouchableOpacity onPress={clearLookupError}>
            <Text style={styles.errorDismiss}>Descartar</Text>
          </TouchableOpacity>
        </View>
      )}

      {product && (
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productMeta}>Código: {product.barcode}</Text>
          <Text style={styles.productMeta}>Categoría: {product.category.name}</Text>
          <Text style={styles.productMeta}>Vence: {new Date(product.expirationDate).toLocaleDateString('es-ES')}</Text>
        </View>
      )}
    </View>
  );

  const renderPendingPermissions = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.title}>Verificando permisos...</Text>
      </View>
    </SafeAreaView>
  );

  const renderDeniedPermissions = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📷</Text>
        </View>
        <Text style={styles.title}>Acceso a cámara requerido</Text>
        <Text style={styles.description}>
          {permissionError || 'No tenemos permisos para acceder a tu cámara'}
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>Habilitar Cámara</Text>
        </TouchableOpacity>

        {renderManualFallback()}
      </ScrollView>
    </SafeAreaView>
  );

  const renderScanner = (): React.ReactElement => (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Escanear Código de Barras</Text>
          <Text style={styles.headerSubtitle}>Apunta la cámara al código de barras</Text>
        </View>

        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.back}
            barCodeScannerSettings={{
              barCodeTypes: ['ean13', 'upca', 'code128'],
            }}
            onBarCodeScanned={handleBarcodeScan}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </Camera>
        </View>

        {isScanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.scanningText}>Procesando código...</Text>
          </View>
        )}

        {lastBarcode && !isScanning && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Código detectado: {lastBarcode.value}</Text>
            <Text style={styles.formatText}>[{lastBarcode.format.toUpperCase()}]</Text>
          </View>
        )}

        {barcodeError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{barcodeError.message}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>Descartar</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderManualFallback()}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (isLoading) {
    return renderPendingPermissions();
  }

  if (status === 'denied') {
    return renderDeniedPermissions();
  }

  if (status === 'granted') {
    return renderScanner();
  }

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
  successBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderTopWidth: 1,
    borderTopColor: '#388E3C',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  formatText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
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
  manualContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#121212',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  manualButton: {
    marginTop: 12,
  },
  alertBanner: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#424242',
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
  },
  productCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#333',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  productMeta: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
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
  registerButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
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
