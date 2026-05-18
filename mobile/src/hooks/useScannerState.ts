import { useState } from 'react';

export type ScannerState = 'idle' | 'scanning' | 'processing' | 'error';

export interface ScannerStateReturn {
  state: ScannerState;
  errorMessage: string | null;
  setScanState: (newState: ScannerState) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

/**
 * Hook para gestionar el estado visual del scanner
 * Estados: idle, scanning, processing, error
 */
export function useScannerState(): ScannerStateReturn {
  const [state, setState] = useState<ScannerState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setScanState = (newState: ScannerState): void => {
    setState(newState);
  };

  const setError = (message: string | null): void => {
    setErrorMessage(message);
    if (message) {
      setState('error');
    } else {
      setState('idle');
    }
  };

  const reset = (): void => {
    setState('idle');
    setErrorMessage(null);
  };

  return {
    state,
    errorMessage,
    setScanState,
    setError,
    reset,
  };
}
