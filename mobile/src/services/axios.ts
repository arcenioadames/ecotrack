// ============================================================================
// CONFIGURACION DE AXIOS CON INTERCEPTOR DE REFRESH TOKEN (REACT NATIVE)
// ============================================================================

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================================
// TIPOS
// ============================================================================

export interface AxiosConfigOptions {
  baseURL: string;
  useSecureStore?: boolean;
}

interface PendingRequest {
  config: any;
  resolve: (value: AxiosResponse<any>) => void;
  reject: (reason?: any) => void;
}

// ============================================================================
// ESTADO GLOBAL DEL INTERCEPTOR
// ============================================================================

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: AxiosError | null, _token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(prom.config);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const storage = {
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch {
      return null;
    }
  },

  setAccessToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('accessToken', token);
    } catch {
      console.error('Error saving access token');
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('refreshToken');
    } catch {
      return null;
    }
  },

  setRefreshToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('refreshToken', token);
    } catch {
      console.error('Error saving refresh token');
    }
  },

  removeAccessToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
    } catch {
      console.error('Error removing access token');
    }
  },

  removeRefreshToken: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('refreshToken');
    } catch {
      console.error('Error removing refresh token');
    }
  },

  removeAll: async (): Promise<void> => {
    try {
      await storage.removeAccessToken();
      await storage.removeRefreshToken();
    } catch {
      console.error('Error removing all tokens');
    }
  },
};

// ============================================================================
// FACTORY PARA CREAR INSTANCIA DE AXIOS
// ============================================================================

export const createAxiosInstance = (options: AxiosConfigOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL: options.baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ========================================================================
  // REQUEST INTERCEPTOR
  // ========================================================================

  instance.interceptors.request.use(
    async (config) => {
      const accessToken = await storage.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ========================================================================
  // RESPONSE INTERCEPTOR
  // ========================================================================

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Si no es 401 o ya reintentamos, rechazar
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Marcar que ya reintentamos
      originalRequest._retry = true;

      if (isRefreshing) {
        // Encolar la solicitud mientras se refresca el token
        return new Promise((resolve, reject) => {
          failedQueue.push({
            config: originalRequest,
            resolve,
            reject,
          });
        }).then((config) => instance(config as any));
      }

      isRefreshing = true;

      try {
        // Obtener refresh token
        const refreshToken = await storage.getRefreshToken();

        // Solicitar nuevo access token
        const refreshResponse = await instance.post('/auth/refresh', {
          refreshToken: refreshToken || undefined,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Guardar tokens
        await storage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await storage.setRefreshToken(newRefreshToken);
        }

        // Actualizar header de autorización
        instance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Procesar cola de solicitudes en espera
        processQueue(null, newAccessToken);

        // Reintentar solicitud original con nuevo token
        return instance(originalRequest);
      } catch (err) {
        // Error en refresh token - limpiar y rechazar
        await storage.removeAll();
        delete instance.defaults.headers.common.Authorization;

        processQueue(err as AxiosError, null);

        // Lanzar evento de logout
        throw new Error('Token refresh failed');
      }
    }
  );

  return instance;
};

// ============================================================================
// INSTANCIA DEFAULT (A USAR EN LA APLICACION)
// ============================================================================

export const apiClient = createAxiosInstance({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  useSecureStore: true,
});

export { storage };
export default apiClient;
