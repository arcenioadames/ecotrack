// ============================================================================
// CONFIGURACION DE AXIOS CON INTERCEPTOR DE REFRESH TOKEN
// ============================================================================

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// ============================================================================
// TIPOS
// ============================================================================

export interface AxiosConfigOptions {
  baseURL: string;
  useRefreshTokenCookie?: boolean;
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
    (config) => {
      // Obtener token de acceso del localStorage
      const accessToken = localStorage.getItem('accessToken');
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
        // Obtener refresh token según configuración
        let refreshToken: string | null = null;

        if (options.useRefreshTokenCookie) {
          // El refresh token viene en cookie (HttpOnly desde el backend)
          // No lo podemos acceder desde aquí, solo enviamos la solicitud
          // El backend incluirá automáticamente la cookie en la respuesta
        } else {
          // Obtener refresh token del localStorage
          refreshToken = localStorage.getItem('refreshToken');
        }

        // Solicitar nuevo access token
        const refreshResponse = await instance.post('/auth/refresh', {
          ...(refreshToken && { refreshToken }),
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Guardar tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken && !options.useRefreshTokenCookie) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Actualizar header de autorización
        instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Procesar cola de solicitudes en espera
        processQueue(null, accessToken);

        // Reintentar solicitud original con nuevo token
        return instance(originalRequest);
      } catch (err) {
        // Error en refresh token - limpiar y rechazar
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete instance.defaults.headers.common.Authorization;

        processQueue(err as AxiosError, null);

        // Redirigir a login mediante evento
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: 'Token refresh failed' }));

        return Promise.reject(err);
      }
    }
  );

  return instance;
};

// ============================================================================
// INSTANCIA DEFAULT (A USAR EN LA APLICACION)
// ============================================================================

export const apiClient = createAxiosInstance({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  useRefreshTokenCookie: import.meta.env.VITE_REFRESH_TOKEN_COOKIE === 'true',
});

export default apiClient;
