import { BarcodeFormat, BarcodeData } from '@types';

/**
 * Servicio para validación y procesamiento de códigos de barras
 * Soporta: EAN-13, UPC-A, Code128
 */

const BARCODE_PATTERNS = {
  ean13: /^\d{13}$/,
  upca: /^\d{12}$/,
  code128: /^[\x00-\x7F]+$/, // ASCII printable
};

/**
 * Detecta el formato de un código de barras basado en su valor
 */
export function detectBarcodeFormat(value: string): BarcodeFormat {
  const cleanValue = value.trim();

  if (BARCODE_PATTERNS.ean13.test(cleanValue)) {
    return 'ean13';
  }

  if (BARCODE_PATTERNS.upca.test(cleanValue)) {
    return 'upca';
  }

  if (cleanValue.length > 0 && BARCODE_PATTERNS.code128.test(cleanValue)) {
    return 'code128';
  }

  return 'unknown';
}

/**
 * Valida si un código de barras es válido para los formatos soportados
 */
export function isValidBarcode(value: string): boolean {
  const format = detectBarcodeFormat(value);
  return format !== 'unknown';
}

/**
 * Calcula el dígito verificador para EAN-13
 * Algoritmo estándar: multiplicar por 1 o 3 alternadamente, sumar y calcular módulo 10
 */
export function validateEAN13(value: string): boolean {
  if (!BARCODE_PATTERNS.ean13.test(value)) {
    return false;
  }

  const digits = value.slice(0, 12);
  let sum = 0;

  for (let i = 0; i < digits.length; i += 1) {
    const digit = parseInt(digits[i], 10);
    const multiplier = i % 2 === 0 ? 1 : 3;
    sum += digit * multiplier;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(value[12], 10) === checkDigit;
}

/**
 * Calcula el dígito verificador para UPC-A
 * Similar a EAN-13 pero con 12 dígitos
 */
export function validateUPCA(value: string): boolean {
  if (!BARCODE_PATTERNS.upca.test(value)) {
    return false;
  }

  const digits = value.slice(0, 11);
  let sum = 0;

  for (let i = 0; i < digits.length; i += 1) {
    const digit = parseInt(digits[i], 10);
    const multiplier = i % 2 === 0 ? 3 : 1;
    sum += digit * multiplier;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(value[11], 10) === checkDigit;
}

/**
 * Valida la estructura de un código de barras con checksum
 */
export function validateBarcodeChecksum(value: string): boolean {
  const format = detectBarcodeFormat(value);

  switch (format) {
    case 'ean13':
      return validateEAN13(value);
    case 'upca':
      return validateUPCA(value);
    case 'code128':
      // Code128 puede tener checksum opcional, aceptamos cualquier formato válido
      return BARCODE_PATTERNS.code128.test(value) && value.length >= 3;
    default:
      return false;
  }
}

/**
 * Procesa y normaliza un código de barras escaneado
 * Retorna BarcodeData si es válido, null si no
 */
export function processBarcodeData(rawValue: string): BarcodeData | null {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  const format = detectBarcodeFormat(value);

  if (format === 'unknown') {
    return null;
  }

  // Validar checksum
  if (!validateBarcodeChecksum(value)) {
    return null;
  }

  return {
    value,
    format,
    timestamp: Date.now(),
  };
}

/**
 * Normaliza un código para comparación
 * Útil para debouncing y evitar duplicados
 */
export function normalizeBarcodeForComparison(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Determina si dos códigos escaneados son potencialmente duplicados
 * Compara valor normalizado y ventana de tiempo
 */
export function isDuplicateBarcode(
  current: BarcodeData,
  previous: BarcodeData | null,
  debounceMs: number = 500,
): boolean {
  if (!previous) {
    return false;
  }

  const timeDiff = current.timestamp - previous.timestamp;
  const normalizedMatch =
    normalizeBarcodeForComparison(current.value) === normalizeBarcodeForComparison(previous.value);

  return normalizedMatch && timeDiff < debounceMs;
}
