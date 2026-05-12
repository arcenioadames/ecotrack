# EcoTrack - Sistema Completo

Repositorio de código abierto para **EcoTrack**, una plataforma empresarial de rastreo ambiental con arquitectura N-Tier (Backend Express + Frontends React/React Native).

## 🏗️ Estructura General

```
EcoTrack/
├── README.md                 # Este archivo
├── backend/                  # Express.js + TypeScript
├── web/                      # React + Vite + TypeScript
└── mobile/                   # React Native + Expo + TypeScript
```

## 🎯 Componentes Principales

### Backend (Express.js + Prisma)

**Estado**: ✅ Producción lista - 66/66 tests pasando

**Características**:
- Autenticación JWT con refresh token rotation
- Replay attack detection
- RBAC (Admin/Staff)
- GDPR compliance (anonymization + audits)
- HTTPS enforcement + Security headers
- CI/CD pipeline (GitHub Actions)

**Documentación**: Ver [backend/README.md](backend/README.md)

### Frontend Web (React + Vite)

**Estado**: 🆕 Estructura escalable lista

**Características**:
- Componentes reutilizables con TypeScript
- Autenticación automática con interceptor Axios
- React Context para estado global
- Validación con Zod
- Responsive design con Tailwind CSS

**Documentación**: Ver [web/README.md](web/README.md)

### Frontend Mobile (React Native + Expo)

**Estado**: 🆕 Estructura escalable lista

**Características**:
- Componentes nativos con React Native
- Almacenamiento seguro con Expo Secure Store
- Autenticación automática con interceptor Axios
- React Context para estado global
- NativeWind para estilos tipo Tailwind

**Documentación**: Ver [mobile/README.md](mobile/README.md)
