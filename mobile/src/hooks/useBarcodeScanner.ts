import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BarcodeData,
  ScannerError,
} from '@types';
import {
  processBarcodeData,
  isDuplicateBarcode,
} from '@services/barcode.service';

export interface UseBarcodeScannerReturn {
  lastBarcode: BarcodeData | null;
  isProcessing: boolean;
  error: ScannerError | null;
  handleBarcodeDetected: (rawValue: string) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook para manejar escaneo de códigos de barras con debounce
 * - Evita duplicados consecutivos
 * - Valida formatos (EAN-13, UPC-A, Code128)
 * - Maneja errores de formato inválido
 * - Procesa datos normalizados
 */
export function useBarcodeScanner(
  debounceMs: number = 500,
  onBarcodeProcessed?: (barcode: BarcodeData) => void,
): UseBarcodeScannerReturn {
  const [lastBarcode, setLastBarcode] = useState<BarcodeData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ScannerError | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousBarcodeRef = useRef<BarcodeData | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const reset = useCallback((): void => {
    setLastBarcode(null);
    setError(null);
    previousBarcodeRef.current = null;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  const handleBarcodeDetected = useCallback(
    (rawValue: string): void => {
      // Limpiar timeout previo para evitar procesamiento duplicado
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      setIsProcessing(true);

      // Aplicar debounce
      debounceTimeoutRef.current = setTimeout(() => {
        try {
          // Procesar el código de barras
          const processedBarcode = processBarcodeData(rawValue);

          if (!processedBarcode) {
            setError({
              code: 'invalid_format',
              message: `Formato de código inválido: ${rawValue}. Soportamos EAN-13, UPC-A y Code128.`,
            });
            setIsProcessing(false);
            return;
          }

          // Verificar si es duplicado
          if (isDuplicateBarcode(processedBarcode, previousBarcodeRef.current, debounceMs)) {
            setError({
              code: 'invalid_format',
              message: 'Código duplicado detectado. Espera un momento para escanear de nuevo.',
            });
            setIsProcessing(false);
            return;
          }

          // Actualizar estado
          setLastBarcode(processedBarcode);
          previousBarcodeRef.current = processedBarcode;
          setError(null);

          // Callback opcional
          if (onBarcodeProcessed) {
            onBarcodeProcessed(processedBarcode);
          }

          setIsProcessing(false);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          setError({
            code: 'unknown',
            message: errorMessage,
          });
          setIsProcessing(false);
        }
      }, debounceMs);
    },
    [debounceMs, onBarcodeProcessed],
  );

  return {
    lastBarcode,
    isProcessing,
    error,
    handleBarcodeDetected,
    clearError,
    reset,
  };
}
