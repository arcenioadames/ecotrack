# 📚 EcoTrack - Documentación Completa

**Última actualización**: 13 de mayo de 2026  
**Versión**: 2.1 - Análisis Completo  
**Estado**: ✅ Producción Activa

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Setup Inicial](#setup-inicial)
4. [Flujos Principales](#flujos-principales)
5. [Validaciones y Testing](#validaciones-y-testing)
6. [Guía de Desarrollo](#guía-de-desarrollo)
7. [Deployment](#deployment)

---

## 🎯 Visión General

**EcoTrack** es una plataforma empresarial de rastreo ambiental con arquitectura N-Tier:
- **Backend**: Express.js + TypeScript + Prisma (✅ Producción)
- **Frontend Web**: React + Vite (🆕 Scaffolding)
- **Frontend Mobile**: React Native + Expo (🆕 Scaffolding)

### Estado del Proyecto

| Componente | Estado | Tests | Detalle |
|-----------|--------|-------|---------|
| Backend | ✅ Producción | 20 suites / 117 ✅ | HU-01 a HU-16 implementadas |
| Web Frontend | 🆕 Scaffolding | - | Estructura base lista |
| Mobile Frontend | 🆕 Scaffolding | - | Estructura base lista |
| CI/CD Pipeline | ✅ Activo | Automático | GitHub Actions v5 |
| Deployment | 🆕 Ready | - | Supabase PostgreSQL soportado |

### Características Principales

- ✅ **Autenticación JWT** con refresh tokens rotados y persistencia en BD
- ✅ **RBAC** (ADMIN/STAFF) con validación en cada endpoint
- ✅ **Gestión de Inventario** (Categorías, Productos, Alertas, Analytics)
- ✅ **Exportación** a PDF/Excel con Strategy Pattern
- ✅ **Privacidad GDPR** - Anonimización y auditoría completa
- ✅ **20 Test Suites** - 117 tests con 83.62% coverage
- ✅ **CI/CD Automatizado** - GitHub Actions v5
- ✅ **Documentación Swagger** - OpenAPI 3.0

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
EcoTrack/
├── backend/                     # Express.js API (✅ Producción)
│   ├── src/
│   │   ├── app.ts             # Express config (CORS, Helmet, etc)
│   │   ├── server.ts          # HTTP server entry
│   │   ├── env.ts             # Environment validation
│   │   ├── config/
│   │   │   └── swagger.ts     # OpenAPI spec
│   │   ├── controllers/       # HTTP handlers
│   │   ├── services/          # Business logic + export strategies
│   │   ├── repositories/      # Data layer (Prisma)
│   │   ├── routes/            # Express routes
│   │   ├── validators/        # Zod schemas
│   │   ├── middlewares/       # Auth, HTTPS
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helpers
│   │   └── scripts/           # Seed, audit
│   ├── tests/
│   │   ├── unit/              # 13 test suites
│   │   └── integration/       # 7 test suites
│   ├── prisma/
│   │   ├── schema.prisma      # 5 models
│   │   ├── migrations/        # 6 migrations applied
│   │   └── client.ts          # Singleton
│   └── package.json
├── web/                         # React 18 + Vite (🆕)
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── services/          # Axios client
│   │   ├── types/
│   │   └── validators/
│   └── package.json
├── mobile/                      # React Native + Expo (🆕)
│   ├── src/
│   │   ├── services/          # Axios + Secure Store
│   │   ├── types/
│   │   └── validators/
│   ├── app.json               # Expo config
│   └── package.json
├── .github/workflows/           # GitHub Actions CI/CD (v5)
├── DOCUMENTATION.md             # 📘 Este archivo
├── README.md
├── SETUP.md
└── .git/
```

### Stack Tecnológico

#### Backend
- **Runtime**: Node.js 22.x LTS
- **Framework**: Express.js 5.2.1
- **Lenguaje**: TypeScript 6.0.3 (strict mode)
- **BD**: PostgreSQL + **Prisma ORM 6.19.3** (type-safe, NO PostgREST)
  - ✅ Soporta Supabase (managed + connection pooling)
  - ✅ Soporta PostgreSQL local (desarrollo/Docker)
- **Seguridad**: bcrypt 6.0.0, JWT 9.0.3, Helmet 8.1.0
- **Validación**: Zod 4.4.3
- **Testing**: Jest 30.4.2 + Supertest 7.2.2
- **Export**: PDFKit 0.18.0 + ExcelJS 4.4.0
- **Docs**: Swagger UI 5.0.1 + Swagger JSDoc 6.2.8
- **Otros**: Morgan (logging), CORS, dotenv

#### Frontend Web
- **Framework**: React 18 + Vite 5
- **Lenguaje**: TypeScript 5.3
- **HTTP**: Axios 1.6
- **UI**: Tailwind CSS 3.3
- **Validación**: Zod 4.4.3
- **Routing**: React Router 6.20

#### Frontend Mobile
- **Framework**: React Native 0.73 + Expo 50
- **Lenguaje**: TypeScript 5.3
- **HTTP**: Axios 1.6
- **Storage**: Expo Secure Store 13.0
- **UI**: NativeWind 2.0 (Tailwind para RN)
- **Navigation**: React Navigation 6.1

---

## 🚀 Setup Inicial

### Requisitos Previos

- Node.js 18+ (recomendado 22 LTS)
- npm 10+
- PostgreSQL 16+ O Supabase PostgreSQL
- Git

### Instalación Backend

```bash
cd backend
npm install
```

**Configurar variables (.env)**:

**Opción A: Supabase PostgreSQL** (Recomendado)
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
PORT=3000
NODE_ENV=development
ACCESS_TOKEN_SECRET="tu-super-secreto-aqui"
REFRESH_TOKEN_SECRET="tu-super-secreto-aqui"
BCRYPT_SALT_ROUNDS=12
POLICY_VERSION=1
CORS_ORIGIN=http://localhost:5173
REFRESH_TOKEN_COOKIE=0
REFRESH_TOKEN_TTL_SECONDS=604800
```

**Opción B: PostgreSQL Local**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecotrack"
DIRECT_URL="postgresql://user:password@localhost:5432/ecotrack"
# (resto igual que Opción A)
```

**Ejecutar migraciones e iniciar**:
```bash
npm run prisma:migrate
npm run dev
```

Backend disponible en: http://localhost:3000  
Swagger docs: http://localhost:3000/api-docs

### Instalación Frontend Web

```bash
cd web
npm install
# Crear .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm run dev
```

Frontend disponible en: http://localhost:5173

### Instalación Frontend Mobile

```bash
cd mobile
npm install
# Crear .env.local
echo "VITE_API_URL=http://localhost:3000" > .env.local
npm start
```

Escanear código QR con Expo Go (iOS) o presionar `a` para Android.

---

## 🔄 Flujos Principales

### 1. Autenticación (HU-01, HU-02)

**Base de datos**:
```prisma
model User {
  id              String @id @default(uuid())
  email           String @unique
  passwordHash    String          # bcrypt
  role            Role            # ADMIN | STAFF
  acceptedPolicy  Boolean         # Obligatorio
  policyAcceptedAt DateTime?      # Fecha aceptación
  policyVersion   String?
  anonymizedAt    DateTime?       # Derecho al olvido
  isActive        Boolean @default(true)
  
  refreshTokens   RefreshToken[]
  products        Product[]
}

model RefreshToken {
  id        String @id @default(cuid())
  userId    String
  tokenHash String              # Hash del token
  expiresAt DateTime            # TTL configurable
  revoked   Boolean @default(false)
  
  @@index([userId, tokenHash, expiresAt])
}
```

**Flujo de login**:
```bash
POST /auth/login
{ "email": "...", "password": "..." }

# Response: accessToken (15 min) + refreshToken (7 días) + user
```

**Rotación automática**: Cada refresh invalida el anterior (ataque de replay prevenido)

### 2. Gestión de Inventario (HU-04, HU-08, HU-13)

**Modelos**:
```prisma
model Category {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  products    Product[]
}

model Product {
  id             String @id @default(cuid())
  name           String
  barcode        String @unique        # Código único
  expirationDate DateTime              # Validado como futuro
  categoryId     String
  createdBy      String                # Trazabilidad
  
  category Category @relation(...)
  creator  User @relation(...)
  
  # Índices para performance
  @@index([name, barcode, expirationDate, categoryId])
}
```

**Endpoints**:
- `GET /categories` - Listar con conteo de productos
- `POST /categories` - Crear (validación de nombre único)
- `PATCH /categories/{id}` - Actualizar
- `DELETE /categories/{id}` - Eliminar si no tiene productos

- `GET /products` - Listar con filtros (search, categoryId, dateRange)
- `POST /products` - Crear (validar expiración futura)
- `PATCH /products/{id}` - Actualizar
- `DELETE /products/{id}` - Eliminar

**Filtros de productos**:
- `search`: búsqueda en nombre y barcode (case-insensitive)
- `categoryId`: filtro por categoría
- `startDate`/`endDate`: rango de expiración
- `page`/`limit`: paginación (default 10)

### 3. Alertas y Analytics (HU-05, HU-07)

**Productos próximos a vencer** (HU-05):
```bash
GET /products/expiring?days=30

# Retorna productos que vencen en próximos 30 días
# Ordenados por fecha de vencimiento ascendente
```

**Dashboard** (HU-07):
```bash
GET /analytics/dashboard

# Retorna:
# - totalProducts: Número total
# - productsByCategory: Conteo por categoría
# - expiringProducts: Próximos a vencer (7 días)
# - expiredProducts: Ya vencidos
# - inventoryStatus: OK | EXPIRING | EXPIRED
```

**Cálculo de estado**:
- `EXPIRED`: Fecha de vencimiento < hoy (UTC)
- `EXPIRING`: Vence en próximos N días (configurable, default 7)
- `OK`: Resto

### 4. Exportación (HU-14)

**Strategy Pattern**:
```typescript
interface ExportStrategy {
  export(products: Product[]): Promise<Buffer>;
}

class PdfStrategy implements ExportStrategy { /* PDFKit */ }
class ExcelStrategy implements ExportStrategy { /* ExcelJS */ }
```

**Endpoints**:
```bash
# PDF
GET /products/export/pdf?status=expired

# Excel
GET /products/export/excel?status=all

# Parámetro status: "expired" | "all"
# Response: Binary file + Content-Disposition header
```

### 5. Privacidad y Compliance (HU-16)

**Modelos de auditoría**:
```prisma
model PolicyAcceptanceAudit {
  id            String @id
  userId        String
  policyVersion String
  acceptedAt    DateTime
  acceptedIp    String?        # Opcional
  userAgent     String?        # Opcional
}

model UserAnonymizationAudit {
  id            String @id
  targetUserId  String
  actorUserId   String?        # Quién solicitó
  anonymizedAt  DateTime
  reason        String?
}
```

**Anonimización (Derecho al Olvido)**:
```bash
DELETE /privacy/me
{ "confirmAnonymization": true, "reason": "RIGHT_TO_BE_FORGOTTEN" }

# Resultado:
# - Name: "Usuario anonimizado"
# - Email: "anon-{uuid}@privacy.ecotrack.invalid"
# - isActive: false
# - Auditoría guardada en UserAnonymizationAudit
```

**Política de Privacidad**:
```bash
GET /legal/privacy
# Retorna página legal con versión activa
```

---

## ✅ Validaciones y Testing

### Tests

| Suite | Tests | Status | Detalle |
|-------|-------|--------|---------|
| Auth Integration | 8 | ✅ | Register, login, refresh, logout |
| Product Integration | 12 | ✅ | CRUD, filtros, paginación |
| Category Integration | 6 | ✅ | CRUD, conteo |
| Analytics Integration | 2 | ✅ | Dashboard |
| Export Integration | 4 | ✅ | PDF, Excel |
| Auth Validators | 20 | ✅ | 100% coverage |
| JWT Utils | 18 | ✅ | Encode, decode, rotate |
| Product Service | 8 | ✅ | Business logic |
| Category Service | 4 | ✅ | CRUD, validation |
| Analytics Service | 2 | ✅ | Dashboard metrics |
| Export Service | 3 | ✅ | PDF/Excel generation |
| Inventory Status | 4 | ✅ | Status calculation |
| Security HTTPS | 2 | ✅ | HTTPS enforcement |
| Privacy/Legal | 2 | ✅ | GET /legal/privacy |
| **TOTAL** | **117** | **✅** | **20 suites** |

### Calidad de Código

| Validación | Resultado | Detalle |
|-----------|-----------|---------|
| ESLint | ✅ PASS | 0 errores, 0 warnings |
| TypeScript Build | ✅ PASS | `npm run build` sin errores |
| Prisma Schema | ✅ PASS | 5 models, 6 migrations |
| npm audit | ✅ PASS | 0 high vulnerabilities |
| Test Coverage | ✅ 83.62% | Líneas 83.16%, Branches 55.97%, Functions 86.39% |
| Swagger Docs | ✅ ACTIVE | http://localhost:3000/api-docs |

### Compliance

| Historia | Estado | Detalle |
|---------|--------|---------|
| HU-01 | ✅ DONE | ADMIN registra STAFF + política obligatoria |
| HU-02 | ✅ DONE | Login + JWT + refresh tokens rotados |
| HU-04 | ✅ DONE | Crear productos con validación |
| HU-05 | ✅ DONE | Alertas de vencimiento |
| HU-07 | ✅ DONE | Dashboard de analytics |
| HU-08 | ✅ DONE | Actualizar/eliminar productos |
| HU-11 | ✅ DONE | CI/CD GitHub Actions v5 |
| HU-13 | ✅ DONE | Gestión de categorías |
| HU-14 | ✅ DONE | Exportación PDF/Excel |
| HU-16 | ✅ DONE | Privacidad, GDPR, anonimización |

---

## 🛠️ Guía de Desarrollo

### Comandos Backend

```bash
# Dev
npm run dev                    # ts-node-dev con reload automático
npm run dev:api-docs          # Dev + muestra URL Swagger

# Build y start
npm run build                 # TypeScript → dist/
npm start                     # Ejecutar dist/src/server.js

# Validación
npm run lint                  # ESLint
npm run lint:fix              # Auto-fix
npm test                      # Jest (20 suites, 117 tests)
npm run test:watch            # Jest watch mode
npm run test:coverage         # Coverage report

# DB
npm run prisma:migrate        # Migraciones interactivas
npm run prisma:generate       # Regenerar Prisma Client
npm run db:seed              # Seed script

# Auditoría
npm run audit                # npm audit --audit-level=high
npm run audit:pii            # Script auditoría PII
```

### Estructura de Carpetas Backend

```
src/
├── app.ts                    # Express config
├── server.ts                 # HTTP listen
├── env.ts                    # Env validation
├── config/
│   └── swagger.ts           # OpenAPI spec
├── controllers/             # HTTP handlers
├── services/                # Business logic + export/
├── repositories/            # Data layer
├── routes/                  # Express routes
├── validators/              # Zod schemas
├── middlewares/             # Auth, security
├── types/                   # TypeScript interfaces
├── utils/                   # Helpers
└── scripts/                 # Seed, audit
```

### Patrones de Código

**Repository + Service + Controller**:
```typescript
// Controller
router.get('/', authenticate, async (req, res) => {
  const data = await service.list(req.query);
  res.json(data);
});

// Service
async list(filters) {
  const items = await repository.findMany(filters);
  return items.map(i => new ResponseDto(i));
}

// Repository
async findMany(filters) {
  return prisma.model.findMany({
    where: buildWhereClause(filters),
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit,
  });
}
```

**Strategy Pattern (Export)**:
```typescript
const strategy = format === 'pdf' ? new PdfStrategy() : new ExcelStrategy();
const buffer = await strategy.export(products);
```

---

## 🚀 Deployment

### Opción A: Supabase (Recomendado)

1. Crear proyecto en https://supabase.com
2. Copiar DATABASE_URL y DIRECT_URL
3. Configurar en .env
4. `npm run prisma:migrate deploy`
5. Deploy a Vercel/Railway/Render

### Opción B: Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/src/server.js"]
```

### Opción C: Vercel/Railway/Render

- Conectar repo de GitHub
- Configurar variables de entorno
- Deploy automático en push a main

---

## 📞 Soporte

### Documentación
- Express: https://expressjs.com
- Prisma: https://www.prisma.io/docs
- TypeScript: https://www.typescriptlang.org
- Jest: https://jestjs.io
- React: https://react.dev

### Recursos del Proyecto
- GitHub: https://github.com/arcenioadames/ecotrack
- Issues: https://github.com/arcenioadames/ecotrack/issues
- Swagger: http://localhost:3000/api-docs
- CI/CD: https://github.com/arcenioadames/ecotrack/actions

---

**Última actualización**: 13 de mayo de 2026  
**Versión**: 2.1 - Análisis Completo  
**Licencia**: Proyecto interno EcoTrack
