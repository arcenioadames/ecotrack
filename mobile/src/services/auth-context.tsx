// ============================================================================
// AUTH CONTEXT - GESTION DE SESION Y AUTENTICACION (REACT NATIVE)
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, storage } from './axios';
import type {
  User,
  AuthContextType,
  RegisterInput,
  LoginInput,
} from '../types';

// ============================================================================
// CREAR CONTEXTO
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estado
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // LOGOUT
  // ========================================================================

  const logout = useCallback(async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (accessToken || refreshToken) {
        await apiClient.post('/auth/logout', {
          refreshToken: refreshToken || undefined,
        }).catch(() => {
          // Ignorar errores en logout
        });
      }
    } finally {
      // Limpiar estado
      setUser(null);
      setAccessToken(null);
      setError(null);
      await storage.removeAll();
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [accessToken]);

  // ========================================================================
  // INICIALIZACION - RESTAURAR SESION DEL SECURE STORE
  // ========================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccessToken = await storage.getAccessToken();

        if (storedAccessToken) {
          setAccessToken(storedAccessToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${storedAccessToken}`;

          // Intentar obtener datos del usuario
          try {
            const userResponse = await apiClient.get('/auth/me');
            if (userResponse.data?.user) {
              setUser(userResponse.data.user);
            }
          } catch (err) {
            console.error('Error fetching user:', err);
            // Continuar sin usuario si la solicitud falla
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Limpiar storage corrupto
        await storage.removeAll();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ========================================================================
  // REGISTRO
  // ========================================================================

  const register = useCallback(async (input: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/register', input);

      // No guardamos tokens en register porque el ADMIN registra al usuario
      // El usuario debe hacer login después
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Error al registrar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // LOGIN
  // ========================================================================

  const login = useCallback(async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', input);
      const { accessToken: newAccessToken, refreshToken } = response.data;

      // Guardar tokens
      await storage.setAccessToken(newAccessToken);
      if (refreshToken) {
        await storage.setRefreshToken(refreshToken);
      }

      // Actualizar cliente Axios
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      setAccessToken(newAccessToken);

      // Hacer solicitud a un endpoint que devuelva el usuario
      const userResponse = await apiClient.get('/auth/me').catch(() => null);
      if (userResponse?.data?.user) {
        setUser(userResponse.data.user);
      }

      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Email o contraseña incorrectos';
      setError(errorMessage);
      setAccessToken(null);
      setUser(null);
      await storage.removeAll();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // REFRESH TOKEN
  // ========================================================================

  const refresh = useCallback(async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken || undefined,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      await storage.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        await storage.setRefreshToken(newRefreshToken);
      }

      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      setAccessToken(newAccessToken);
      setError(null);
    } catch (err: any) {
      setError('No se pudo renovar la sesión');
      logout();
      throw err;
    }
  }, [logout]);

  // ========================================================================
  // LOGOUT ALL
  // ========================================================================

  const logoutAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const refreshToken = await storage.getRefreshToken();
      await apiClient.post('/auth/logout-all', {
        refreshToken: refreshToken || undefined,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cerrar sesión en todos los dispositivos';
      setError(errorMessage);
      throw err;
    } finally {
      // Limpiar estado siempre
      setUser(null);
      setAccessToken(null);
      await storage.removeAll();
      delete apiClient.defaults.headers.common.Authorization;
      setIsLoading(false);
    }
  }, []);

  // ========================================================================
  // LIMPIAR ERROR
  // ========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================================================
  // VALOR DEL CONTEXTO
  // ========================================================================

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    error,
    register,
    login,
    refresh,
    logout,
    logoutAll,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK PARA USAR EL CONTEXTO
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
