# 🎯 EcoTrack Backend - Production Ready

[![Backend CI](https://github.com/arcenioadames/ecotrack/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/arcenioadames/ecotrack/actions/workflows/backend-ci.yml)

## 📋 Descripción

Backend de EcoTrack con autenticación JWT completa, gestión de inventario, exportación PDF/Excel, GDPR compliance y CI/CD automático listo para producción.

**Estado**: ✅ 20 test suites, 117 tests, 83.62% coverage

## ✨ Características Implementadas

- ✅ **HU-01/HU-02**: Autenticación ADMIN/STAFF + JWT + refresh tokens rotados
- ✅ **HU-04/HU-08/HU-13**: Gestión de inventario (Categorías, Productos)
- ✅ **HU-05/HU-07**: Alertas de vencimiento + Dashboard analytics
- ✅ **HU-11**: CI/CD GitHub Actions v5
- ✅ **HU-14**: Exportación a PDF/Excel con Strategy Pattern
- ✅ **HU-16**: Privacidad, GDPR, anonimización con auditoría

## 🔐 Flujo de Sesión

- `POST /auth/login` emite access token (15 min) y refresh token (7 días) persistido en BD
- `POST /auth/refresh` rota el refresh token actual e invalida el anterior (previene replay attacks)
- `POST /auth/logout` revoca la sesión actual
- `POST /auth/logout-all` revoca todas las sesiones del usuario

En producción, el backend emite refresh token en cookie `HttpOnly`, `SameSite=Strict` y `Secure`.

## 🛡️ Privacidad y Cumplimiento GDPR (HU-16)

Implementación completa de GDPR con:

- ✅ Checkbox obligatorio en registro: `Acepto términos y política de tratamiento de datos`
- ✅ Política visible en `GET /legal/privacy`
- ✅ Persistencia de aceptación con fecha, hora, versión y IP opcional
- ✅ Auditoría en tabla `PolicyAcceptanceAudit`
- ✅ Endpoint de derecho al olvido: `DELETE /privacy/me` anonimiza la cuenta
- ✅ Auditoría de anonimización en tabla `UserAnonymizationAudit`
- ✅ HTTPS obligatorio en producción con TLS 1.2+

### Flujo legal completo

1. El administrador abre la página legal y revisa la versión activa de la política.
2. En el formulario de registro marca el checkbox obligatorio.
3. El backend guarda la aceptación en `User` y en `PolicyAcceptanceAudit`.
4. Si el usuario ejerce su derecho al olvido, `DELETE /privacy/me` anonimiza la cuenta.
5. La auditoría de anonimización queda en `UserAnonymizationAudit` y se conservan solo los registros legalmente requeridos.

### Ejemplo frontend

```html
<form method="post" action="/auth/register">
   <input name="name" placeholder="Nombre" required />
   <input name="email" type="email" placeholder="Correo" required />
   <input name="password" type="password" placeholder="Contraseña" required />

   <label>
      <input type="checkbox" name="acceptedPolicy" required />
      Acepto términos y política de tratamiento de datos
   </label>

   <a href="/legal/privacy" target="_blank" rel="noreferrer">
      Ver política de tratamiento de datos
   </a>

   <button type="submit">Crear cuenta</button>
</form>
```

### Ejemplos request/response

Registro:

```bash
curl -X POST http://localhost:3000/auth/register \
   -H "Authorization: Bearer <admin-jwt>" \
   -H "Content-Type: application/json" \
   -d '{
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "password": "SecurePass123",
      "role": "STAFF",
      "acceptedPolicy": true
   }'
```

Respuesta esperada:

```json
{
   "message": "User created",
   "user": {
      "id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "STAFF",
      "acceptedPolicy": true,
      "policyAcceptedAt": "2026-05-11T00:00:00.000Z",
      "policyVersion": "1",
      "anonymizedAt": null,
      "anonymizedReason": null,
      "isActive": true,
      "createdAt": "2026-05-11T00:00:00.000Z",
      "updatedAt": "2026-05-11T00:00:00.000Z"
   }
}
```

Anonimización:

```bash
curl -X DELETE http://localhost:3000/privacy/me \
   -H "Authorization: Bearer <access-jwt>" \
   -H "Content-Type: application/json" \
   -d '{
      "confirmAnonymization": true,
      "reason": "Derecho al olvido"
   }'
```

Respuesta esperada:

```json
{
   "message": "User anonymized",
   "user": {
      "id": "...",
      "name": "Usuario anonimizado",
      "email": "anon-...@privacy.ecotrack.invalid",
      "role": "STAFF",
      "acceptedPolicy": true,
      "policyAcceptedAt": "2026-05-11T00:00:00.000Z",
      "policyVersion": "1",
      "anonymizedAt": "2026-05-11T00:10:00.000Z",
      "anonymizedReason": "RIGHT_TO_BE_FORGOTTEN",
      "isActive": false,
      "createdAt": "2026-05-11T00:00:00.000Z",
      "updatedAt": "2026-05-11T00:10:00.000Z"
   }
}
```

## � Validaciones de Calidad

| Validación | Resultado | Detalle |
|-----------|-----------|---------|
| **Tests** | ✅ 117/117 | 20 suites (unit + integration) |
| **Coverage** | ✅ 83.62% | Líneas 83.16%, Branches 55.97% |
| **ESLint** | ✅ PASS | 0 errores, 0 warnings |
| **TypeScript** | ✅ PASS | Strict mode, sin errores |
| **npm audit** | ✅ PASS | 0 high vulnerabilities |
| **Prisma** | ✅ VALID | 5 models, 6 migrations |
| **Swagger** | ✅ ACTIVE | http://localhost:3000/api-docs |

## 📈 Estadísticas del Proyecto

- **Líneas de código**: ~10,000+ (src/)
- **Controladores**: 5 (auth, products, categories, analytics, privacy)
- **Services**: 7 (con export strategy pattern)
- **Repositories**: 3 (data layer)
- **Validators**: 5 (Zod schemas)
- **Rutas**: 7 principales
- **Modelos Prisma**: 5 (User, Category, Product, RefreshToken, Audit*)
- **Migraciones**: 6 aplicadas
- **Índices DB**: 11+

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 22.x LTS (soporta Node 18+)
- npm 10+
- Supabase PostgreSQL (producción) O PostgreSQL local (desarrollo)
- Git

### Instalación
```bash
cd backend
npm install
```

### Variables de Entorno

#### Opción A: Supabase PostgreSQL (Recomendado para Producción)
```bash
cp .env.example .env
# Edita .env y reemplaza:
# - [PROJECT_REF] con tu PROJECT_REF de Supabase
# - [REGION] con tu región (p. ej. "aws-1-us-west-2")
# - [YOUR-PASSWORD] con tu password de Supabase
```

Obtén las URLs desde Supabase Dashboard > Settings > Database:
- **DATABASE_URL** (Connection Pooling - PgBouncer): para runtime
- **DIRECT_URL** (Connection - Direct): para Prisma migrate/db push

#### Opción B: PostgreSQL Local (Desarrollo)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecotrack"
DIRECT_URL="postgresql://user:password@localhost:5432/ecotrack"
PORT=3000
NODE_ENV=development
ACCESS_TOKEN_SECRET="your-secret-key-here"
REFRESH_TOKEN_SECRET="your-refresh-secret-key-here"
BCRYPT_SALT_ROUNDS=12
POLICY_VERSION=1
CORS_ORIGIN=http://localhost:5173
REFRESH_TOKEN_COOKIE=0
REFRESH_TOKEN_COOKIE_SECURE=0
REFRESH_TOKEN_TTL_SECONDS=604800
```

### Configuración Supabase
1. Accede a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings > Database**
4. Copia la **Connection string**:
   - Usa `?pgbouncer=true` para CONNECTION_POOLING → DATABASE_URL
   - Usa conexión directa (sin pooling) → DIRECT_URL
5. Añade `?sslmode=require` si no está incluído
6. Actualiza `.env` con las URLs y tu contraseña

### Secrets y variables de GitHub Actions

Configura en el repositorio estos secrets/variables para CI/CD:

| Nombre | Tipo | Uso |
|--------|------|-----|
| `CI_WEBHOOK_URL` | Secret | Webhook de Discord o Slack para notificaciones |
| `CI_WEBHOOK_KIND` | Variable | `discord` o `slack` |

Consulta [la guía de branch protection](docs/devops/github-branch-protection.md) para convertir la CI en un required check antes del merge.

El workflow también usa variables internas para CI en GitHub Actions:
- `NODE_ENV=test`
- `DATABASE_URL` de PostgreSQL de prueba
- `DIRECT_URL` de PostgreSQL de prueba
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `BCRYPT_SALT_ROUNDS`
- `POLICY_VERSION`
- `CORS_ORIGIN`

---

## 📦 npm Scripts

### Desarrollo
```bash
npm run dev
# ↳ Inicia servidor con hot-reload (ts-node-dev)
# ↳ Puerto: 3000
# ↳ Carpeta: src/
```

### Linting & Formateo
```bash
npm run lint
# ↳ Ejecuta ESLint en src/ y tests/
# ↳ Detecta errores de estilo y lógica

npm run lint:fix
# ↳ Auto-fix de errores corregibles
# ↳ Formatea quotes, semicolons, etc.
```

### Testing
```bash
npm test
# ↳ Ejecuta Jest una vez

npm run test:watch
# ↳ Modo watch (automático al cambiar archivos)

npm run test:coverage
# ↳ Genera reporte de cobertura en coverage/
```

### Build & Deploy
```bash
npm run build
# ↳ Compila TypeScript → dist/

npm start
# ↳ Ejecuta desde dist/ (producción)
```

### Auditoría de Seguridad
```bash
npm run audit
# ↳ Verifica vulnerabilidades HIGH/CRITICAL
# ↳ Falla si encuentra vulnerabilidades

npm run audit:pii
# ↳ Genera un reporte heurístico de posibles campos PII desde prisma/schema.prisma
```

### Database (Prisma)
```bash
npm run prisma:generate
# ↳ Regenera Prisma Client desde schema.prisma

npm run prisma:migrate
# ↳ Ejecuta migraciones pendientes (interactivo)

npm run db:seed
# ↳ Ejecuta seed script con datos de ejemplo
```

## 🔌 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar usuario STAFF (solo ADMIN)
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refrescar tokens
- `POST /auth/logout` - Logout actual
- `POST /auth/logout-all` - Logout global

### Inventario
- `GET /categories` - Listar categorías
- `POST /categories` - Crear categoría
- `GET /products` - Listar productos (con filtros)
- `POST /products` - Crear producto
- `GET /products/expiring` - Productos próximos a vencer
- `GET /products/export/pdf` - Exportar a PDF
- `GET /products/export/excel` - Exportar a Excel

### Analytics & Privacidad
- `GET /analytics/dashboard` - Dashboard de métricas
- `GET /legal/privacy` - Política de privacidad
- `DELETE /privacy/me` - Anonimizar cuenta (derecho al olvido)

**Documentación interactiva**: http://localhost:3000/api-docs (Swagger UI)

### Qué Sucede Automáticamente

Cuando haces `git push` a `main` o `develop`:

```
1. GitHub Actions se dispara
   ↓
2. Checkout de código
   ↓
3. Setup Node.js 20.x
   ↓
4. npm install
   ↓
5. Lint → Test → Build → Audit
   ↓
6. Si TODO pasa ✅ → PR puede ser mergeado
7. Si algo falla ❌ → PR bloqueado hasta fix
```

### Requisitos para Merge

Todos estos DEBEN pasar:

| Etapa | Comando | Falla Si |
|-------|---------|----------|
| **Lint** | `npm run lint` | Errores de estilo |
| **Build** | `npm run build` | TypeScript no compila |
| **Test** | `npm test` | Tests fallan |
| **Audit** | `npm audit --audit-level=high` | Vulnerabilidades CRITICAL |
| **HTTPS/TLS** | `REQUIRE_HTTPS=1` en producción | Tráfico no seguro |

---

## 📂 Estructura de Tests

Los tests deben ir en `tests/` o dentro de `src/` con sufijo `.test.ts`:

```
backend/
├── tests/
│   ├── auth.test.ts              # ✅ Detectado por Jest
│   └── __tests__/
│       └── utils.spec.ts         # ✅ También detectado
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── auth.controller.test.ts  # ✅ Detectado
│   └── services/
│       └── auth.service.test.ts     # ✅ Detectado
```

### Crear un Test
```typescript
// tests/auth.test.ts
import { describe, it, expect } from "@jest/globals";

describe("Auth Service", () => {
  it("should register a user", () => {
    expect(true).toBe(true);
  });
});
```

### Ejecutar Tests
```bash
# Una vez
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

---

## 🔍 ESLint Configuration

**Archivo**: `eslint.config.js`

**Características:**
- ✅ TypeScript parser
- ✅ Detección de unused variables
- ✅ Enforcement de código limpio
- ✅ Quotes dobles ("string")
- ✅ Semicolons requeridos
- ✅ No `var`, solo `const`/`let`

**Cómo Arreglar Errores**
```bash
# Ver errores
npm run lint

# Auto-fix (cuando sea posible)
npm run lint:fix

# Algunos errores requieren fix manual
```

---

## 🧪 Jest Configuration

**Archivo**: `jest.config.js`

**Características:**
- ✅ TypeScript support (ts-jest)
- ✅ Node.js environment
- ✅ Coverage reports (HTML, LCOV)
- ✅ 10s timeout para async tests
- ✅ Auto-discovery en src/ y tests/

---

## 🚀 GitHub Actions Workflow

**Archivo**: `.github/workflows/backend-ci.yml`

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main` o `develop`
- Solo si hay cambios en `backend/`

**Runing Localmente**
```bash
# Simular lo que hace GitHub Actions
npm run lint && npm run build && npm test -- --coverage && npm audit
```

---

## 🐛 Debugging

### Errores Comunes

#### ❌ "ESLint couldn't find an eslint.config.js"
```bash
# Solución: estás usando ESLint v9+
# El archivo debe existir en backend/
ls eslint.config.js  # debe mostrar el archivo
```

#### ❌ "Tests not found"
```bash
# Solución: Jest no encuentra tests/
# Crea la carpeta si no existe
mkdir -p tests
```

#### ❌ "TypeScript compilation error"
```bash
# Solución: verificar tipos
npx tsc --noEmit

# Arreglar errores de tipos manualmente
# (no hay auto-fix para estos)
```

#### ❌ "npm audit found X vulnerabilities"
```bash
# Solución: actualizar paquetes
npm update

# O instalar parche de seguridad
npm audit fix
```

---

## 📊 Métricas

### Coverage Goals (Recomendado)
```
Statements   : 70%+
Branches     : 60%+
Functions    : 70%+
Lines        : 70%+
```

### Ver Coverage Report
```bash
npm run test:coverage
# Luego abre coverage/index.html en el navegador
```

---

## 🔒 Seguridad

### npm audit
```bash
npm run audit  # Verifica HIGH/CRITICAL

npm audit      # Todo (incluyendo LOW/MEDIUM)

npm audit fix  # Auto-fix cuando sea posible
```

### Secrets Management
**NUNCA commitear**:
- `.env` (git-ignored)
- Claves secretas
- Tokens
- Passwords

**Github Secrets** (para CI/CD):
- Usar GitHub Actions secrets
- No hardcodear en archivos

---

## 📈 Next Steps

- [ ] Escribir tests para auth endpoints
- [ ] Configurar Docker
- [ ] Deploy a Fly.io
- [ ] Frontend CI/CD pipeline

---

## 📞 Soporte

Para problemas o dudas:
1. Verificar `.env` está configurado
2. Ejecutar `npm install` nuevamente
3. Revisar logs de GitHub Actions
4. Revisar `PHASE_10_SUMMARY.md`

---

**Status**: ✅ Phase 10 Complete - Ready for Production
