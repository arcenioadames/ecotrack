# EcoTrack - Análisis Completo del Proyecto

**Fecha de Análisis:** 14 de mayo de 2026  
**Versión del Proyecto:** 2.1  
**Estado General:** ✅ Backend Producción, ✅ Frontend Mobile Scaffolding, 🆕 Frontend Web Scaffolding  
**Rama Actual:** test-ci

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Backend (Express.js + TypeScript + Prisma)](#backend-expressjs--typescript--prisma)
4. [Frontend Mobile (React Native + Expo)](#frontend-mobile-react-native--expo)
5. [Frontend Web (React + Vite)](#frontend-web-react--vite)
6. [Base de Datos y Modelos](#base-de-datos-y-modelos)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Testing y Calidad](#testing-y-calidad)
10. [CI/CD y DevOps](#cicd-y-devops)
11. [Configuraciones Importantes](#configuraciones-importantes)
12. [Dependencias y Tecnologías](#dependencias-y-tecnologías)
13. [Estado Actual y TODOs](#estado-actual-y-todos)
14. [Guía de Desarrollo](#guía-de-desarrollo)
15. [Riesgos y Consideraciones](#riesgos-y-consideraciones)

---

## 🎯 Visión General del Proyecto

**EcoTrack** es una plataforma empresarial de **rastreo ambiental** con arquitectura N-Tier que permite gestionar inventarios de productos con fechas de expiración, categorías, y generar reportes de analytics. Incluye cumplimiento GDPR para privacidad de datos.

### Componentes Principales

| Componente | Tecnología | Estado | Descripción |
|-----------|------------|--------|-------------|
| **Backend** | Express.js + TypeScript + Prisma | ✅ **Producción** | API REST completa con 117 tests pasando |
| **Mobile** | React Native + Expo | ✅ **Scaffolding Listo** | App móvil con navegación y autenticación |
| **Web** | React + Vite + TypeScript | 🆕 **Scaffolding Básico** | Interfaz web en desarrollo inicial |

### Características Clave

- ✅ **Autenticación JWT** con refresh tokens rotados
- ✅ **RBAC** (ADMIN/STAFF) con middleware de autorización
- ✅ **Gestión de Inventario** (Categorías, Productos, Alertas)
- ✅ **Exportación** PDF/Excel con Strategy Pattern
- ✅ **Analytics** y dashboards
- ✅ **GDPR Compliance** con anonimización y auditorías
- ✅ **CI/CD** automatizado con GitHub Actions
- ✅ **Documentación Swagger** OpenAPI 3.0

---

## 🏗️ Arquitectura General

```
EcoTrack/
├── backend/                          # 🚀 PRODUCCIÓN LISTA
│   ├── src/
│   │   ├── app.ts                   # Config Express (CORS, Helmet, Morgan)
│   │   ├── server.ts                # HTTP Server entry point
│   │   ├── env.ts                   # Validación variables entorno
│   │   ├── config/swagger.ts        # OpenAPI 3.0 documentation
│   │   ├── controllers/             # HTTP handlers (20+ endpoints)
│   │   ├── services/                # Business logic + export strategies
│   │   ├── repositories/            # Data layer (Prisma ORM)
│   │   ├── routes/                  # Express routes
│   │   ├── validators/              # Zod schemas
│   │   ├── middlewares/             # Auth, HTTPS, security
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── utils/                   # Helpers y utilities
│   │   └── scripts/                 # Seed, audit PII
│   ├── prisma/
│   │   ├── schema.prisma            # 5 modelos + 6 migraciones
│   │   ├── migrations/              # DB migrations aplicadas
│   │   └── client.ts                # Singleton Prisma client
│   ├── tests/
│   │   ├── unit/                    # 13 suites unitarias
│   │   └── integration/             # 7 suites integración
│   └── package.json                 # Scripts y dependencias
├── mobile/                          # 📱 SCAFFOLDING LISTO
│   ├── src/
│   │   ├── services/
│   │   │   ├── axios.ts             # HTTP client con JWT interceptor
│   │   │   ├── auth-context.tsx     # React Context autenticación
│   │   │   └── api.ts               # API calls específicos
│   │   ├── screens/                 # 6 pantallas (Login, Dashboard, etc.)
│   │   ├── navigation/              # React Navigation stacks
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── validators/              # Zod schemas
│   │   ├── components/              # Reutilizables
│   │   └── hooks/                   # Custom hooks
│   ├── assets/                      # Iconos y recursos
│   ├── app.json                     # Expo configuration
│   ├── app.config.js                # Dynamic config (API URL)
│   ├── .env                         # Environment variables
│   └── package.json                 # Expo + React Native deps
├── web/                             # 🖥️ SCAFFOLDING BÁSICO
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── services/                # Axios client
│   │   ├── types/                   # TypeScript types
│   │   └── validators/              # Zod schemas
│   ├── index.html                   # HTML template
│   ├── vite.config.ts               # Vite configuration
│   └── package.json                 # React + Vite deps
├── .github/workflows/               # 🔄 CI/CD
│   └── backend-ci.yml               # GitHub Actions (Ubuntu + Postgres)
├── DOCUMENTATION.md                 # 📚 Documentación completa
├── README.md                        # 📖 Overview del proyecto
└── TODO.md                          # ✅ Tareas pendientes
```

---

## 🚀 Backend (Express.js + TypeScript + Prisma)

### Estado: ✅ **PRODUCCIÓN ACTIVA**
- **Tests:** 117/117 ✅ (20 suites)
- **Coverage:** 83.62%
- **Endpoints:** 20+ funcionales
- **Base de Datos:** PostgreSQL con Prisma ORM

### Arquitectura Backend

#### 1. **Entry Points**
- `src/server.ts` - Servidor HTTP (puerto 3000)
- `src/app.ts` - Configuración Express completa

#### 2. **Capa de Presentación**
- `controllers/` - HTTP handlers (20+ controladores)
- `routes/` - Definición de rutas Express
- `middlewares/` - Auth, CORS, Helmet, security

#### 3. **Capa de Negocio**
- `services/` - Lógica de negocio
  - `auth.service.ts` - Autenticación y tokens
  - `export.service.ts` - Exportación PDF/Excel
  - `analytics.service.ts` - Métricas y dashboards
  - `privacy.service.ts` - GDPR compliance

#### 4. **Capa de Datos**
- `repositories/` - Acceso a datos con Prisma
- `prisma/schema.prisma` - Modelos y migraciones

#### 5. **Validación y Utilidades**
- `validators/` - Esquemas Zod
- `types/` - Interfaces TypeScript
- `utils/` - Helpers y utilidades

### Configuración de Seguridad

```typescript
// src/app.ts - Configuración de seguridad
app.use(cors(corsOptions()));
app.use(helmet({
  hsts: { maxAge: 15552000, includeSubDomains: true, preload: true },
  frameguard: { action: "deny" },
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" }
}));
app.use(morgan('combined'));
```

### Variables de Entorno Requeridas

```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/ecotrack"
JWT_SECRET="your-secret-key"
ACCESS_TOKEN_SECRET="access-secret"
REFRESH_TOKEN_SECRET="refresh-secret"
NODE_ENV="development|test|production"
CORS_ORIGIN="http://localhost:3000,http://localhost:8081"
```

---

## 📱 Frontend Mobile (React Native + Expo)

### Estado: ✅ **SCAFFOLDING COMPLETO**
- **Framework:** React Native 0.73.6 + Expo SDK 50
- **Navegación:** React Navigation 6
- **Estado:** React Context + Custom Hooks
- **Almacenamiento:** Expo Secure Store
- **HTTP Client:** Axios con interceptores JWT

### Estructura del Mobile

#### 1. **Configuración Expo**
```json
// app.json
{
  "expo": {
    "name": "EcoTrack",
    "slug": "ecotrack-mobile",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png" },
    "android": { "package": "com.ecotrack.mobile" },
    "ios": { "bundleIdentifier": "com.ecotrack.mobile" }
  }
}
```

#### 2. **Configuración Dinámica**
```javascript
// app.config.js
export default ({ config }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 
                 process.env.API_URL || 
                 'http://localhost:3000';
  
  return {
    ...config,
    extra: { apiUrl }
  };
};
```

#### 3. **Variables de Entorno**
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

#### 4. **Navegación y Pantallas**
- `AuthStack` - Login/Register
- `AppStack` - Dashboard, Products, Categories, Analytics
- 6 pantallas implementadas con TypeScript

#### 5. **Autenticación**
- `AuthContext` - Gestión de estado de autenticación
- `axios.ts` - Interceptor JWT con refresh automático
- `SecureStore` - Almacenamiento seguro de tokens

### Dependencias Clave

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "axios": "^1.6.0",
    "expo": "^50.0.0",
    "expo-constants": "~15.4.6",
    "expo-secure-store": "~12.8.1",
    "react": "18.2.0",
    "react-native": "0.73.6"
  }
}
```

---

## 🖥️ Frontend Web (React + Vite)

### Estado: 🆕 **SCAFFOLDING BÁSICO**
- **Framework:** React 18 + Vite 5
- **Lenguaje:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.3
- **HTTP Client:** Axios con interceptores

### Estructura Actual

```typescript
// main.tsx - Entry point básico
function App(): React.JSX.Element {
  return <div>EcoTrack Web</div>;
}
```

### Configuración Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Dependencias

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zod": "^4.4.3"
  }
}
```

---

## 🗄️ Base de Datos y Modelos

### Esquema Prisma (5 Modelos)

```prisma
// prisma/schema.prisma
model User {
  id               String    @id @default(uuid())
  name             String
  email            String    @unique
  passwordHash     String
  role             Role      // ADMIN | STAFF
  acceptedPolicy   Boolean
  // ... campos GDPR y timestamps
}

model Product {
  id             String   @id @default(cuid())
  name           String
  barcode        String   @unique
  expirationDate DateTime
  categoryId     String
  createdBy      String
  // ... timestamps
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  // ... timestamps
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String
  expiresAt DateTime
  revoked   Boolean  @default(false)
  // ... campos
}

// + PolicyAcceptanceAudit y UserAnonymizationAudit para GDPR
```

### Migraciones Aplicadas
- 6 migraciones en `prisma/migrations/`
- Base de datos: PostgreSQL
- ORM: Prisma Client con singleton

---

## 🔗 APIs y Endpoints

### Endpoints Implementados (20+)

#### Autenticación (`/auth/*`)
```
POST   /auth/register       # Registro con validación
POST   /auth/login          # Login con JWT
POST   /auth/refresh        # Refresh token
POST   /auth/logout         # Logout específico
POST   /auth/logout-all     # Logout de todos los dispositivos
```

#### Productos (`/products/*`)
```
POST   /products            # Crear producto
GET    /products            # Listar con filtros/paginación
GET    /products/:id        # Obtener producto
PATCH  /products/:id        # Actualizar producto
DELETE /products/:id        # Eliminar producto
GET    /products/expiring   # Productos por expirar
GET    /products/export     # Exportar PDF/Excel
```

#### Categorías (`/categories/*`)
```
POST   /categories           # Crear categoría
GET    /categories          # Listar categorías
GET    /categories/:id      # Obtener categoría
PATCH  /categories/:id      # Actualizar categoría
DELETE /categories/:id      # Eliminar categoría
```

#### Analytics (`/analytics/*`)
```
GET    /analytics/dashboard  # Dashboard con métricas
```

#### Privacidad/GDPR (`/privacy/*`)
```
POST   /privacy/anonymize    # Anonimizar usuario
GET    /privacy/audits      # Ver auditorías
```

### Documentación API
- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI 3.0:** Configurado en `src/config/swagger.ts`

---

## 🔐 Autenticación y Seguridad

### JWT con Refresh Tokens

#### Flujo de Autenticación
1. **Login:** Usuario envía credenciales
2. **Backend:** Valida y genera access + refresh tokens
3. **Storage:** Refresh token en BD, access en memoria/cliente
4. **Refresh:** Cliente usa refresh token para obtener nuevo access
5. **Logout:** Invalida refresh token específico o todos

#### Seguridad Implementada
- ✅ **Password Hashing:** bcrypt
- ✅ **Token Rotation:** Refresh tokens únicos por dispositivo
- ✅ **RBAC:** Roles ADMIN/STAFF con middleware
- ✅ **HTTPS Enforcement:** Helmet con HSTS
- ✅ **CORS:** Configurado por entorno
- ✅ **Rate Limiting:** Preparado (middleware disponible)
- ✅ **Input Validation:** Zod schemas
- ✅ **SQL Injection:** Prisma ORM previene
- ✅ **GDPR Compliance:** Anonimización y auditorías

### Middleware de Seguridad

```typescript
// src/middlewares/security.middleware.ts
export const authenticate = (req, res, next) => { /* JWT validation */ }
export const authorize = (...roles) => (req, res, next) => { /* RBAC */ }
export const requireHttps = (req, res, next) => { /* HTTPS redirect */ }
```

---

## 🧪 Testing y Calidad

### Suites de Testing (117 tests ✅)

#### Tests Unitarios (13 suites)
- Validadores Zod
- Servicios de negocio
- Utilidades
- Middleware de autenticación

#### Tests de Integración (7 suites)
- Endpoints completos con BD real
- Autenticación completa
- CRUD operations
- Export functionality
- GDPR compliance

### Comando de Testing
```bash
cd backend
npm test                    # Jest con configuración
npm run test:coverage      # Con reporte de cobertura
npm run test:watch         # Modo watch
```

### Configuración Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['**/tests/**/*.test.ts']
};
```

---

## 🔄 CI/CD y DevOps

### GitHub Actions Workflow

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI
on: [push, pull_request]

jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ecotrack_test
        ports: [5432:5432]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run prisma:generate
      - run: npm run prisma:migrate
      - run: npm run lint
      - run: npm run build
      - run: npm test -- --runInBand
```

### Comandos de Desarrollo

```bash
# Backend
npm run dev              # ts-node-dev con hot reload
npm run dev:api-docs     # + Swagger UI en :3000/api-docs
npm run build            # TypeScript compilation
npm run start            # Producción

# Database
npm run prisma:generate  # Generar Prisma client
npm run prisma:migrate   # Ejecutar migraciones
npm run db:seed          # Poblar datos de prueba

# Quality
npm run lint             # ESLint
npm run test             # Jest
npm run audit:pii        # Verificar datos sensibles
```

---

## ⚙️ Configuraciones Importantes

### Backend - Variables de Entorno

```bash
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/ecotrack"
JWT_SECRET="your-secret-key"
ACCESS_TOKEN_SECRET="access-secret"
REFRESH_TOKEN_SECRET="refresh-secret"
NODE_ENV="development"

# Opcionales
CORS_ORIGIN="http://localhost:3000"
DISABLE_TEST_ROUTES="0"
```

### Mobile - Configuración Expo

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Alternativas según entorno:
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3000     # Android Emulator
# EXPO_PUBLIC_API_URL=http://localhost:3000    # iOS Simulator
```

### Conexión Base de Datos

```bash
# PostgreSQL local
createdb ecotrack
psql ecotrack < schema.sql

# O con Docker
docker run -d \
  --name postgres-ecotrack \
  -e POSTGRES_DB=ecotrack \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

---

## 📦 Dependencias y Tecnologías

### Backend - Dependencias Principales

```json
{
  "@prisma/client": "^6.19.3",
  "prisma": "^6.19.3",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "zod": "^4.4.3",
  "helmet": "^8.1.0",
  "cors": "^2.8.6",
  "morgan": "^1.10.1",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "pdfkit": "^0.18.0",
  "exceljs": "^4.4.0"
}
```

### Mobile - Dependencias Expo

```json
{
  "expo": "^50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.6",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "axios": "^1.6.0",
  "expo-secure-store": "~12.8.1",
  "expo-constants": "~15.4.6"
}
```

### Web - Dependencias React

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "axios": "^1.6.0",
  "zod": "^4.4.3",
  "tailwindcss": "^3.3.0"
}
```

---

## 📝 Estado Actual y TODOs

### ✅ Completado

#### Backend (HU-01 a HU-16)
- ✅ Autenticación completa con JWT refresh
- ✅ RBAC (ADMIN/STAFF) implementado
- ✅ CRUD productos con validaciones
- ✅ Gestión de categorías
- ✅ Analytics dashboard
- ✅ Exportación PDF/Excel funcional
- ✅ GDPR compliance (anonimización + auditorías)
- ✅ Tests completos (117/117 ✅)
- ✅ CI/CD automatizado
- ✅ Documentación Swagger

#### Mobile
- ✅ Estructura scaffolding completa
- ✅ Navegación implementada
- ✅ Autenticación con contexto React
- ✅ Axios con interceptores JWT
- ✅ Configuración Expo completa
- ✅ Assets preparados

#### Web
- ✅ Estructura básica Vite + React
- ✅ Configuración TypeScript
- ✅ Dependencias base instaladas

### 🔄 En Progreso

#### HU-14 Export Module (IN PROGRESS)
```markdown
## Step 0: Confirm scope
- [x] Mantener export real existente en `src/services/export/*`
- [ ] Crear arquitectura preparatoria en `src/exporters/*` y `src/services/report.service.ts`

## Step 1: Auditar wiring actual  
- [ ] Verificar que `GET /products/export` usa el ExportService correcto

## Step 2: Implementar estructura preparatoria
- [x] Asegurar que exista `src/exporters/strategies/export-strategy.interface.ts`
- [x] Ajustar `src/exporters/strategies/pdf-export.strategy.ts` y `excel-export.strategy.ts`
- [x] Implementar `src/services/report.service.ts` como orquestador

## Step 3: Documentación
- [x] Crear `backend/docs/audits/HU14_PREPARATION_STATUS.md`

## Step 4: Lint/Build/Test
- [ ] `npm run lint`
- [ ] `npm run build` 
- [ ] `npm run test -- --runInBand`
```

### 🎯 Próximos Pasos

1. **Completar HU-14:** Stabilizar arquitectura de exportación
2. **Frontend Web:** Implementar autenticación y dashboard
3. **Mobile:** Conectar todas las pantallas con API
4. **Testing E2E:** Agregar tests end-to-end
5. **Deployment:** Configurar staging/production

---

## 🛠️ Guía de Desarrollo

### Configuración Inicial

```bash
# 1. Clonar repositorio
git clone https://github.com/arcenioadames/ecotrack.git
cd ecotrack

# 2. Backend setup
cd backend
npm install
cp .env.example .env  # Configurar variables
npm run prisma:generate
npm run prisma:migrate
npm run db:seed

# 3. Mobile setup  
cd ../mobile
npm install
cp .env.example .env  # Configurar API_URL
npx expo install --fix

# 4. Web setup
cd ../web
npm install
```

### Desarrollo Backend

```bash
cd backend
npm run dev              # Desarrollo con hot reload
npm run dev:api-docs     # + documentación en :3000/api-docs
npm run test             # Ejecutar tests
npm run lint             # Verificar código
```

### Desarrollo Mobile

```bash
cd mobile
npx expo start --lan      # Modo LAN (recomendado)
# Escanear QR con Expo Go
```

### Desarrollo Web

```bash
cd web
npm run dev              # Vite dev server en :5173
```

---

## ⚠️ Riesgos y Consideraciones

### Riesgos Críticos

#### 🚨 CRÍTICO A - Activación accidental de stubs HU-14
**Archivos afectados:**
- `backend/src/exporters/strategies/pdf-export.strategy.ts`
- `backend/src/exporters/strategies/excel-export.strategy.ts` 
- `backend/src/services/report.service.ts`

**Riesgo:** Un cambio en imports puede hacer que el endpoint export use código IN PROGRESS en lugar del funcional.

**Impacto:** Rompe exportación PDF/Excel en producción.

**Mitigación:** 
- Mantener flujo actual en `src/services/export/*`
- No cambiar wiring hasta completar HU-14
- Tests de integración validan funcionamiento actual

#### 🚨 CRÍTICO B - Duplicación de subsistemas export
**Problema:** Dos implementaciones de exportación coexisten.

**Riesgo:** Confusión y posibles bugs al mantener ambas.

**Solución:** Completar HU-14 y migrar gradualmente.

#### 🚨 CRÍTICO C - CI/CD no verificable
**Estado:** Workflow existe pero no probado en repo público.

**Riesgo:** "CI verde" no es demostrable.

**Mitigación:** Verificar workflow en pushes a main/test-ci.

### Riesgos Medios

#### ⚠️ Medio 1 - Logs con posible fuga de PII
**Ubicación:** Servicios auth/privacy pueden loggear datos sensibles.

**Mitigación:** Revisar console.warn y asegurar no se loggean passwords/emails.

#### ⚠️ Medio 2 - Dependencias desactualizadas
**Estado:** Algunas dependencias podrían necesitar actualización.

**Mitigación:** 
```bash
npm audit
npm update
```

### Consideraciones de Producción

#### Base de Datos
- PostgreSQL recomendado para producción
- Configurar connection pooling
- Backups automáticos
- Monitoring de queries lentas

#### Seguridad
- Rotar JWT secrets regularmente
- Configurar HTTPS obligatorio
- Rate limiting en producción
- Monitoring de logs de seguridad

#### Escalabilidad
- Implementar caching (Redis)
- CDN para assets estáticos
- Load balancer para múltiples instancias
- Database indexing optimizado

---

## 📞 Contacto y Soporte

**Proyecto:** EcoTrack - Plataforma de Rastreo Ambiental  
**Versión:** 2.1 - Análisis Completo  
**Fecha:** 14 de mayo de 2026  
**Repositorio:** https://github.com/arcenioadames/ecotrack  
**Rama:** test-ci  

**Estado del Proyecto:** ✅ Backend Producción, 📱 Mobile Scaffolding, 🖥️ Web Básico

---

*Este análisis proporciona toda la información necesaria para que una IA pueda entender completamente el proyecto EcoTrack y proporcionar ayuda efectiva en cualquier aspecto del desarrollo.*</content>
<parameter name="filePath">C:\EcoTrack\PROJECT_ANALYSIS.md