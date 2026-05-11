# 🎯 EcoTrack Backend - Phase 10 CI/CD Setup

[![Backend CI](https://github.com/arcenioadames/ecotrack/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/arcenioadames/ecotrack/actions/workflows/backend-ci.yml)

## 📋 Descripción

Este es el backend de EcoTrack con CI/CD, autenticación JWT con refresh tokens persistidos y cumplimiento de privacidad listos para auditoría técnica.

## 🔐 Flujo de sesión

- `POST /auth/login` emite access token y refresh token persistido.
- `POST /auth/refresh` rota el refresh token actual e invalida el anterior.
- `POST /auth/logout` revoca la sesión actual.
- `POST /auth/logout-all` revoca todas las sesiones del usuario.

En producción, el backend puede emitir refresh token en cookie `HttpOnly`, `SameSite=Strict` y `Secure`.

## 🛡️ HU-16 - Privacidad y cumplimiento

La historia de usuario queda cubierta con estos componentes:

- Checkbox obligatorio en el registro: `Acepto términos y política de tratamiento de datos`.
- Política visible en [la página legal](http://localhost:3000/legal/privacy).
- Persistencia de aceptación con fecha, hora, versión de política e IP opcional.
- Auditoría separada de aceptación y anonimización.
- Endpoint de derecho al olvido para anonimizar la cuenta autenticada.
- HTTPS obligatorio en producción, TLS 1.2+ detrás del proxy y protección básica de API.

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

## 🔔 Estado del pipeline

El workflow se dispara en `pull_request` hacia `main` y `develop`, y en `push` hacia `main`.

Stages ejecutados en orden:
- `install`
- `lint`
- `test`
- `build`
- `audit`

Si quieres notificaciones automáticas, define un webhook opcional para Discord o Slack con una de estas opciones:
- `CI_WEBHOOK_URL` como secret de GitHub
- `CI_WEBHOOK_KIND` como variable de repositorio con valor `discord` o `slack`

Si no configuras webhook, el pipeline sigue funcionando sin notificaciones.

El workflow usa `npm install`, `npm run lint`, `npm run test`, `npm run build` y `npm audit --audit-level=high`.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 20.x LTS
- npm 10.x
- Supabase PostgreSQL (producción) O PostgreSQL local (desarrollo)

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

### Prisma
```bash
npm run prisma:generate
# ↳ Genera types desde schema.prisma

npm run prisma:migrate
# ↳ Ejecuta migraciones pendientes
```

---

## 🎯 Workflow CI/CD

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
