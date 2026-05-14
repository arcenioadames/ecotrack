// ============================================================================
// API CLIENT - FUNCIONES HELPER PARA LOS ENDPOINTS
// ============================================================================

import apiClient from './axios';
import type {
  User,
  PolicyAcceptanceAudit,
  UserAnonymizationAudit,
  AuditListParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'STAFF';
    acceptedPolicy: boolean;
  }) => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', payload);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        user: User;
        accessToken: string;
        refreshToken?: string;
      }>
    >('/auth/login', { email, password });
    return response.data;
  },

  refresh: async (refreshToken?: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        accessToken: string;
        refreshToken?: string;
      }>
    >('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken?: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout', { refreshToken });
    return response.data;
  },

  logoutAll: async (refreshToken?: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout-all', { refreshToken });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },
};

// ============================================================================
// PRIVACIDAD ENDPOINTS
// ============================================================================

export const privacyApi = {
  anonymizeMe: async (payload: {
    confirmAnonymization: boolean;
    reason?: string;
  }) => {
    const response = await apiClient.delete<ApiResponse<{ anonymizedAt: string }>>('/privacy/me', {
      data: payload,
    });
    return response.data;
  },

  getAuditsPolicyAcceptance: async (params: Partial<AuditListParams> = {}) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<PolicyAcceptanceAudit>>
    >('/privacy/audits/policy', { params });
    return response.data;
  },

  getAuditsAnonymization: async (params: Partial<AuditListParams> = {}) => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<UserAnonymizationAudit>>
    >('/privacy/audits/anonymization', { params });
    return response.data;
  },
};

// ============================================================================
// LEGAL ENDPOINTS
// ============================================================================

export const legalApi = {
  getPrivacyPolicy: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        version: string;
        content: string;
        updatedAt: string;
      }>
    >('/legal/privacy-policy');
    return response.data;
  },

  getTermsOfService: async () => {
    const response = await apiClient.get<
      ApiResponse<{
        version: string;
        content: string;
        updatedAt: string;
      }>
    >('/legal/terms-of-service');
    return response.data;
  },
};

// ============================================================================
// SEGURIDAD & HEALTH
// ============================================================================

export const healthApi = {
  getHealth: async () => {
    const response = await apiClient.get<ApiResponse<{ status: string }>>('/health');
    return response.data;
  },
};

export default {
  auth: authApi,
  privacy: privacyApi,
  legal: legalApi,
  health: healthApi,
};
