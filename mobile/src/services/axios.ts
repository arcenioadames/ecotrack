// ============================================================================
// CONFIGURACIÓN MEJORADA DE AXIOS PARA REACT NATIVE + EXPO
// ============================================================================

import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

// ============================================================================
// CONFIGURACIÓN DE RED
// ============================================================================

const NETWORK_CONFIG = {
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '15000', 10),
};

// ============================================================================
// TIPOS
// ============================================================================

export interface AxiosConfigOptions {
  baseURL: string;
  useSecureStore?: boolean;
  enableLogging?: boolean;
}

interface PendingRequest {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse<any> | PromiseLike<AxiosResponse<any>>) => void;
  reject: (reason?: any) => void;
}

// ============================================================================
// UTILIDADES DE RED
// ============================================================================

const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && error.code !== 'ECONNABORTED';
};

const isTimeoutError = (error: AxiosError): boolean => {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
};

const getErrorMessage = (error: AxiosError): string => {
  if (isNetworkError(error)) {
    return 'Sin conexión a internet. Verifica tu conexión WiFi.';
  }
  if (isTimeoutError(error)) {
    return 'Tiempo de espera agotado. El servidor no responde.';
  }
  if (error.response?.status === 401) {
    return 'Sesión expirada. Inicia sesión nuevamente.';
  }
  if (error.response?.status === 403) {
    return 'No tienes permisos para esta acción.';
  }
  if (error.response?.status && error.response.status >= 500) {
    return 'Error del servidor. Intenta nuevamente más tarde.';
  }

  const data = error.response?.data as any;
  return data?.message || error.message || 'Error desconocido';
};

// ============================================================================
// LOGGING PARA DEBUG
// ============================================================================

const logger = {
  request: (config: AxiosRequestConfig) => {
    if (process.env.EXPO_PUBLIC_DEBUG_API === 'true') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: {
          ...config.headers,
          Authorization: config.headers?.Authorization ? '[PRESENT]' : '[MISSING]',
        },
      });
    }
  },

  response: (response: AxiosResponse) => {
    if (process.env.EXPO_PUBLIC_DEBUG_API === 'true') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        duration: Date.now() - (response.config as any).startTime,
      });
    }
  },

  error: (error: AxiosError) => {
    if (process.env.EXPO_PUBLIC_DEBUG_API === 'true') {
      console.log('❌ API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
      });
    }
  },
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
    timeout: NETWORK_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `EcoTrack-Mobile/${Constants.expoConfig?.version || '1.0.0'} (${Platform.OS}; ${Platform.Version})`,
    },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  let isRefreshing = false;
  let failedQueue: PendingRequest[] = [];

  const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(({ config, resolve, reject }) => {
      if (error) {
        reject(error);
        return;
      }

      config.headers = {
        ...(config.headers as any),
        Authorization: `Bearer ${token}`,
      } as any;

      resolve(instance(config));
    });

    failedQueue = [];
    isRefreshing = false;
  };

  instance.interceptors.request.use(
    async (config) => {
      (config as any).startTime = Date.now();

      if (options.useSecureStore) {
        const accessToken = await storage.getAccessToken();
        if (accessToken) {
          config.headers = {
            ...(config.headers as any),
            Authorization: `Bearer ${accessToken}`,
          } as any;
        }
      }

      logger.request(config);
      return config;
    },
    (error) => {
      logger.error(error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      logger.response(response);
      return response;
    },
    async (error) => {
      logger.error(error);
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (isNetworkError(error)) {
        Alert.alert('Sin Conexión', 'Verifica tu conexión a internet e intenta nuevamente.', [{ text: 'OK' }]);
        return Promise.reject(error);
      }

      if (isTimeoutError(error)) {
        Alert.alert('Tiempo Agotado', 'El servidor está tardando en responder. Intenta nuevamente.', [{ text: 'OK' }]);
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ config: originalRequest, resolve, reject });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          if (options.useSecureStore) {
            const refreshToken = await storage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const refreshResponse = await axios.post(`${options.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            await storage.setAccessToken(newAccessToken);
            if (newRefreshToken) {
              await storage.setRefreshToken(newRefreshToken);
            }

            processQueue(null, newAccessToken);
            originalRequest.headers = {
              ...(originalRequest.headers as any),
              Authorization: `Bearer ${newAccessToken}`,
            } as any;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          if (options.useSecureStore) {
            await storage.removeAll();
          }

          processQueue(refreshError as AxiosError, null);
          Alert.alert('Sesión Expirada', 'Tu sesión ha expirado. Inicia sesión nuevamente.', [{ text: 'OK' }]);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      const errorMessage = getErrorMessage(error);
      if (error.response?.status !== 401) {
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// ============================================================================
// INSTANCIA DEFAULT (A USAR EN LA APLICACIÓN)
// ============================================================================

const expoConfig = (Constants.expoConfig as any) || {};
const apiUrl =
  expoConfig.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://10.0.2.2:3000';

if (__DEV__) {
  console.log('🚀 EcoTrack Mobile - Configuración de API:');
  console.log('   expoConfig.extra.apiUrl:', (expoConfig.extra as any)?.apiUrl);
  console.log('   EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('   Final apiUrl:', apiUrl);
  console.log('   Debug mode:', process.env.EXPO_PUBLIC_DEBUG_API === 'true');
  console.log('   Timeout:', NETWORK_CONFIG.TIMEOUT + 'ms');
}

export const apiClient = createAxiosInstance({
  baseURL: apiUrl,
  useSecureStore: true,
  enableLogging: process.env.EXPO_PUBLIC_DEBUG_API === 'true',
});

export { storage };
export default apiClient;
