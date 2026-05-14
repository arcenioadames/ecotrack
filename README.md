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

**Estado**: ✅ Producción lista - 117/117 tests pasando (20 suites)

**Características**:
- Autenticación JWT con refresh token rotation e invalidación de anterior
- RBAC (ADMIN/STAFF) en cada endpoint
- GDPR compliance (anonimización + auditorías completas)
- HTTPS enforcement + Security headers (Helmet)
- Gestión de inventario (Categorías, Productos, Alertas, Analytics)
- Exportación a PDF/Excel con Strategy Pattern
- CI/CD pipeline (GitHub Actions v5)
- 83.62% test coverage
- 6 migraciones Prisma aplicadas

**Documentación**: Ver [DOCUMENTATION.md](DOCUMENTATION.md)

### Frontend Web (React + Vite)

**Estado**: 🆕 Estructura scaffolding lista

**Características**:
- Componentes reutilizables con TypeScript + React 18
- Autenticación automática con interceptor Axios
- React Context para estado global
- Validación con Zod
- Responsive design con Tailwind CSS 3.3
- React Router 6 para navegación

**Stack**: React 18 + Vite 5 + TypeScript 5.3 + Tailwind CSS

### Frontend Mobile (React Native + Expo)

**Estado**: 🆕 Estructura scaffolding lista

**Características**:
- Componentes nativos con React Native 0.73
- Almacenamiento seguro con Expo Secure Store 13
- Autenticación automática con interceptor Axios
- React Context para estado global
- NativeWind 2.0 para estilos tipo Tailwind

**Stack**: React Native 0.73 + Expo 50 + TypeScript 5.3 + Expo Secure Store
