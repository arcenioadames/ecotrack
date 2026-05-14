// ============================================================================
// TIPOS E INTERFACES - ECOTRACK WEB & MOBILE
// ============================================================================

// ============================================================================
// AUTENTICACION
// ============================================================================

export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  acceptedPolicy: boolean;
  policyAcceptedAt: string | null;
  policyVersion: string | null;
  anonymizedAt: string | null;
  anonymizedReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  acceptedPolicy: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================================================
// PRIVACIDAD & AUDITORIAS
// ============================================================================

export interface PolicyAcceptanceAudit {
  id: string;
  userId: string;
  policyVersion: string;
  acceptedAt: string;
  acceptedIp: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface UserAnonymizationAudit {
  id: string;
  targetUserId: string;
  actorUserId: string | null;
  anonymizedAt: string;
  anonymizedIp: string | null;
  userAgent: string | null;
  reason: string | null;
  createdAt: string;
}

export interface AnonymizationInput {
  confirmAnonymization: boolean;
  reason?: string;
}

export interface AuditListParams {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  userId?: string;
  policyVersion?: string;
  actorUserId?: string;
  targetUserId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// RESPUESTAS API
// ============================================================================

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: string;
}
