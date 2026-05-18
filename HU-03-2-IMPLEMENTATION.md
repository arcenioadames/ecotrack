# HU-03.2 - Implementar Escaneo Compatible EAN-13, UPC-A y Code128

## Resumen Técnico

Se ha implementado el flujo completo de escaneo de códigos de barras con soporte para múltiples formatos, validación de checksums, y prevención de duplicados mediante debouncing.

## Cambios Implementados

### 1. Servicio de Barcode (src/services/barcode.service.ts)

#### Funciones Principales

- ✅ `detectBarcodeFormat()` - Detecta automáticamente el formato del código
  - EAN-13: 13 dígitos
  - UPC-A: 12 dígitos
  - Code128: Caracteres ASCII imprimibles

- ✅ `isValidBarcode()` - Validación básica de formato

- ✅ `validateEAN13()` - Valida checksum de EAN-13
  - Algoritmo: Multiplicar por 1 o 3 alternadamente
  - Calcula dígito verificador

- ✅ `validateUPCA()` - Valida checksum de UPC-A
  - Similar a EAN-13 con 12 dígitos

- ✅ `validateBarcodeChecksum()` - Validación genérica por formato

- ✅ `processBarcodeData()` - Procesa y normaliza código escaneado
  - Retorna `BarcodeData` si es válido
  - Incluye timestamp y formato detectado

- ✅ `isDuplicateBarcode()` - Previene lecturas duplicadas
  - Compara valor normalizado y ventana de tiempo
  - Configurable (por defecto 500ms)

### 2. Hook useBarcodeScanner (src/hooks/useBarcodeScanner.ts)

```typescript
const {
  lastBarcode,        // Último código escaneado exitosamente
  isProcessing,       // Estado de procesamiento
  error,              // Error si existe
  handleBarcodeDetected,    // Función para procesar código raw
  clearError,         // Limpiar estado de error
  reset,              // Reiniciar hook
} = useBarcodeScanner(debounceMs, onBarcodeProcessed);
```

#### Características

- ✅ Debounce configurable (defecto 500ms)
- ✅ Prevención de duplicados consecutivos
- ✅ Callback opcional al procesar código
- ✅ Cleanup automático de timeouts
- ✅ Manejo de errores con mensajes descriptivos

### 3. Validadores Zod (src/validators/index.ts)

```typescript
// Validadores individuales
BarcodeSchema             // Validación completa con checksum
BarcodeFormatSchema       // Validación de formato
ScannedBarcodeSchema      // Esquema de datos escaneados
ScannerErrorSchema        // Esquema de errores
```

#### Validaciones Incluidas

- ✅ Longitud: 3-128 caracteres
- ✅ Checksum válido según formato
- ✅ Formato soportado (no 'unknown')
- ✅ Mensajes de error en español

### 4. ScannerScreen Actualizada (src/screens/ScannerScreen.tsx)

#### Flujo Mejorado

```
Camera -> onBarcodeScanned -> handleBarcodeScan -> 
  handleBarcodeDetected -> processBarcodeData -> 
    onBarcodeProcessed -> UI Update
```

#### Estados Visuales

- ✅ **Escaneando**: Indica detección en progreso
- ✅ **Exitoso**: Muestra código y formato detectado
- ✅ **Error**: Mensaje con motivo del fallo

#### Caracteres Soportados

```
barcodeScannerSettings={{
  barcodeTypes: ['ean13', 'upca', 'code128']
}}
```

### 5. Dependencias Agregadas

- ✅ `zod@^4.4.0` - Validación en móvil

## Tipos Definidos

### BarcodeData (src/types/index.ts)

```typescript
interface BarcodeData {
  value: string;              // Código escaneado
  format: BarcodeFormat;      // Formato detectado
  timestamp: number;          // Timestamp de escaneo
}

type BarcodeFormat = 'ean13' | 'upca' | 'code128' | 'unknown';
```

### ScannerError (src/types/index.ts)

```typescript
interface ScannerError {
  code: 'permission_denied' | 'camera_error' | 'invalid_format' | 'unknown';
  message: string;
}
```

## Ejemplos de Uso

### Escanear Producto

```typescript
const { handleBarcodeDetected, lastBarcode, error } = useBarcodeScanner(
  500,
  (barcode) => {
    console.log(`✅ Producto detectado: ${barcode.value}`);
    // Llamar API para buscar producto
    searchProductByBarcode(barcode.value);
  }
);

// En ScannerScreen:
<CameraView onBarcodeScanned={(result) => {
  handleBarcodeDetected(result.barcodes[0].value);
}} />
```

### Validar Manualmente

```typescript
import { BarcodeSchema } from '@validators';

try {
  const validated = BarcodeSchema.parse('5901234123457');
  console.log('✅ Válido:', validated);
} catch (err) {
  if (err instanceof z.ZodError) {
    console.error('❌ Error:', err.errors[0].message);
  }
}
```

## Algoritmos de Checksum

### EAN-13

```
1. Tomar primeros 12 dígitos
2. Multiplicar posiciones pares (0-indexed) por 3, impares por 1
3. Sumar todos los resultados
4. Restar de 10 (módulo 10)
5. Comparar con dígito 13
```

### UPC-A

```
Similar a EAN-13 pero:
- 11 dígitos en vez de 12
- Multiplicadores invertidos (3,1,3,1...)
```

## Flujo de Validación

```
Raw Value
  ↓
processBarcodeData()
  ├─ Detectar formato
  ├─ Validar checksum
  ├─ Verificar duplicados
  ├─ Normalizar valor
  └─ Retornar BarcodeData o null
  ↓
Si válido → onBarcodeProcessed callback
Si inválido → Mostrar error en UI
```

## Riesgos Detectados

### 1. **Barcode Scanner en Expo nativo**
- ⚠️ `expo-camera` usa barcode scanner nativo del SO
- ✅ Solución: Compatible con Android Expo SDK 50

### 2. **Rendimiento en loops rápidos**
- ⚠️ Múltiples escaneos en corto tiempo
- ✅ Solución: Debounce + validación de duplicados

### 3. **Formatos ambiguos**
- ⚠️ UPC-A (12 dígitos) vs EAN-13 (13 dígitos) podrían confundirse
- ✅ Solución: Validar checksum según formato detectado

### 4. **Permisos en tiempo real**
- ⚠️ Si permisos se revocan durante escaneo
- ✅ Solución: Manejar error en CameraView

## Archivos Modificados

```
mobile/
├── package.json (zod agregado)
├── src/
│   ├── hooks/
│   │   ├── useBarcodeScanner.ts (NUEVO)
│   │   └── index.ts (ACTUALIZADO)
│   ├── screens/
│   │   └── ScannerScreen.tsx (ACTUALIZADO)
│   ├── services/
│   │   └── barcode.service.ts (NUEVO)
│   ├── types/
│   │   └── index.ts (ACTUALIZADO)
│   └── validators/
│       └── index.ts (ACTUALIZADO)
```

## Testing Manual

### Test 1: Escanear EAN-13 válido
```
Código: 5901234123457
Esperado: ✅ Mostrar código y [EAN13]
```

### Test 2: Escanear código duplicado
```
Escanear mismo código dos veces en < 500ms
Esperado: ⚠️ "Código duplicado detectado"
```

### Test 3: Escanear formato inválido
```
Código: ABC123
Esperado: ❌ "Formato de código inválido"
```

### Test 4: Escanear sin permisos
```
Revocar permisos de cámara
Esperado: Mostrar pantalla de solicitud
```

## Próximos Pasos (HU-03.3)

- [ ] Integración con API backend para buscar productos
- [ ] Autocompletado de formulario con datos del producto
- [ ] Fallback a entrada manual si falla escaneo
- [ ] Navegación después de escaneo exitoso
- [ ] Toast/snackbar para feedback visual
