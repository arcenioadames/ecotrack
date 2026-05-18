import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';

export type PermissionStatus = 'granted' | 'denied' | 'pending';

export interface CameraPermissionState {
  status: PermissionStatus;
  isLoading: boolean;
  error: string | null;
}

export interface UseCameraPermissionsReturn extends CameraPermissionState {
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook para gestionar permisos de cámara en Expo
 * Maneja estados: granted, denied, pending
 * Evita solicitar permisos múltiples veces
 * Compatible con Expo SDK 50 + TypeScript strict
 */
export function useCameraPermissions(): UseCameraPermissionsReturn {
  const [state, setState] = useState<CameraPermissionState>({
    status: 'pending',
    isLoading: true,
    error: null,
  });

  // Revisar permisos al montar el componente
  useEffect(() => {
    let isMounted = true;

    const checkPermissions = async (): Promise<void> => {
      try {
        const permission = await Camera.getCameraPermissionsAsync();

        if (!isMounted) return;

        if (permission.granted) {
          setState({
            status: 'granted',
            isLoading: false,
            error: null,
          });
        } else if (permission.canAskAgain) {
          setState({
            status: 'pending',
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            status: 'denied',
            isLoading: false,
            error: 'Permisos de cámara denegados permanentemente',
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setState({
          status: 'denied',
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Solicita permisos de cámara de manera explícita
   * Retorna true si se otorgaron permisos, false en caso contrario
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const permission = await Camera.requestCameraPermissionsAsync();

      if (permission.granted) {
        setState({
          status: 'granted',
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState({
          status: 'denied',
          isLoading: false,
          error: permission.canAskAgain
            ? 'Permisos de cámara no otorgados'
            : 'Permisos de cámara denegados permanentemente. Habilita en configuración.',
        });
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al solicitar permisos';
      setState({
        status: 'denied',
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
  };
}
