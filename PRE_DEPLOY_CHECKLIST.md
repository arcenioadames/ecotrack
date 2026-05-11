# ✅ PRE-DEPLOY CHECKLIST: Supabase Migration

**Use this checklist before deploying to production**

---

## 📋 CONFIGURACIÓN LOCAL (Antes de Push)

### .env Setup
- [ ] `.env` existe en `backend/`
- [ ] DATABASE_URL tiene `?pgbouncer=true&sslmode=require`
- [ ] DIRECT_URL existe y es diferente a DATABASE_URL
- [ ] [PASSWORD] reemplazado con valor real
- [ ] [PROJECT_REF] reemplazado con ID Supabase
- [ ] [REGION] reemplazado (ej: aws-1-us-west-2)
- [ ] NODE_ENV = development
- [ ] ACCESS_TOKEN_SECRET ≠ vacío
- [ ] REFRESH_TOKEN_SECRET ≠ vacío

### Validaciones Locales
- [ ] `npm run build` ✅ PASS (0 errores)
- [ ] `npm run lint` ✅ PASS (0 errores)
- [ ] `npx prisma validate` ✅ PASS
- [ ] `npx prisma generate` ✅ PASS
- [ ] `.env` ✅ NO commiteado (en .gitignore)
- [ ] `.env.example` ✅ Tiene placeholders (NO passwords)

---

## 🗄️ DATABASE (Después de actualizar .env)

### Migraciones
- [ ] `npx prisma migrate deploy` ejecutado exitosamente
- [ ] Tabla "User" creada en Supabase
- [ ] Tabla "Role" enum creada en Supabase
- [ ] Índice "User_email_key" creado
- [ ] `SELECT * FROM "User";` retorna 0 filas (expected)

### Conexión
- [ ] Puedo conectarme desde CLI: `psql [DATABASE_URL]`
- [ ] DIRECT_URL funciona para migraciones
- [ ] PgBouncer pooling activo en Supabase Dashboard

---

## 🧪 TESTING

### Unit Tests
- [ ] `npm test` ✅ PASS (46/46 tests)
- [ ] Coverage ≥ 90%
- [ ] Ningún test usa localhost
- [ ] No hay hardcoded database URLs

### Integration Tests
- [ ] Tests detectan automáticamente Supabase (checks isSupabaseHost)
- [ ] DIRECT_URL validado por _setup.ts
- [ ] Migrations ejecutadas correctamente
- [ ] No hay conflictos con test DB

---

## 🔐 SEGURIDAD

### Secrets Management
- [ ] ACCESS_TOKEN_SECRET no es "super_access_secret"
- [ ] REFRESH_TOKEN_SECRET no es "super_refresh_secret"
- [ ] Passwords NO en .env commiteado
- [ ] .env en .gitignore verificado

### GitHub Actions Secrets
- [ ] SUPABASE_DATABASE_URL configurado (con pgbouncer)
- [ ] SUPABASE_DIRECT_URL configurado
- [ ] Secretos están en: Settings > Secrets and variables > Actions
- [ ] Secrets NO en .github/workflows/ inline

### Code Security
- [ ] No hay `process.env.DATABASE_URL` hardcodeado en src/
- [ ] No hay Supabase API keys en código
- [ ] No hay service_role keys expuestas
- [ ] No hay credentials en comentarios

---

## 🚀 CI/CD PIPELINE

### Workflow Validation
- [ ] `.github/workflows/backend-ci.yml` existe
- [ ] Workflow tiene DATABASE_URL env var
- [ ] Workflow tiene DIRECT_URL env var
- [ ] PostgreSQL service configurado correctamente
- [ ] Triggers: main, develop, PRs están OK

### Pipeline Stages
- [ ] Stage 1: Checkout ✅
- [ ] Stage 2: Setup Node 20 ✅
- [ ] Stage 3: Install dependencies ✅
- [ ] Stage 4: Lint ✅
- [ ] Stage 5: Build ✅
- [ ] Stage 6: Prisma migrate deploy ✅
- [ ] Stage 7: Tests ✅
- [ ] Stage 8: Audit ✅

---

## 📁 ARCHITECTURE INTEGRITY

### Express & Prisma
- [ ] `src/app.ts` NO tienen breaking changes
- [ ] `src/server.ts` importa env primero
- [ ] `prisma/client.ts` singleton intacto
- [ ] `prisma/schema.prisma` tiene directUrl config

### Auth System
- [ ] JWT tokens funcionan sin cambios
- [ ] bcrypt hashing intacto
- [ ] Zod validation intacto
- [ ] RBAC middleware intacto
- [ ] /auth/register endpoint funciona
- [ ] /auth/login endpoint funciona
- [ ] /auth/refresh endpoint funciona

### Routes & Middleware
- [ ] GET /health retorna { status: "ok" }
- [ ] Middleware order intacto (cors → helmet → morgan → json)
- [ ] Testing routes solo en NODE_ENV=test
- [ ] CORS_ORIGIN configurable desde .env

---

## 🔄 GIT & DEPLOYMENT

### Repository
- [ ] Branch: main/develop está actualizado
- [ ] `.env` NO está en git (en .gitignore)
- [ ] `.env.example` SÍ está en git
- [ ] Commits son atomicos y descriptivos

### Before Push
- [ ] Último commit: `npm test` ✅ PASS
- [ ] Último commit: `npm run build` ✅ PASS
- [ ] Último commit: `npm run lint` ✅ PASS
- [ ] `git status` limpio (solo cambios validados)

### After Push
- [ ] GitHub Actions workflow iniciado
- [ ] Lint stage: ✅ PASS
- [ ] Build stage: ✅ PASS
- [ ] Migrate stage: ✅ PASS (Prisma migrate ejecutado)
- [ ] Test stage: ✅ PASS

---

## 📊 PRODUCTION READINESS

### Monitoring
- [ ] Supabase Dashboard accesible
- [ ] Connection pooling visible en stats
- [ ] Query logs visible si hay errores
- [ ] Backup strategy definida

### Performance
- [ ] PgBouncer pooling reduce latency
- [ ] CONNECTION_POOLING modo activo en Supabase
- [ ] No hay "Too many connections" errors
- [ ] Tests pasan en < 30 segundos

### Fallback Plan
- [ ] Tengo backup de data local (si viniera de PostgreSQL local)
- [ ] Tengo reverse migration plan
- [ ] Puedo revertir a PostgreSQL local si es necesario
- [ ] Documentación de rollback disponible

---

## 🎯 FINAL VERIFICATION

### Complete Checklist
- [ ] Todos los items anteriores: ✅ CHECKED
- [ ] `.env` configurado correctamente
- [ ] Todas las validaciones: PASS
- [ ] Arquitectura: INTACTA
- [ ] Tests: PASSING
- [ ] CI/CD: READY

### Green Light for Deploy?

**YES ✅** → Proceed to production  
**NO ❌** → Fix failures and re-validate

---

## 🚨 ROLLBACK PLAN (Si algo falla)

### Paso 1: Identificar problema
```bash
# Check logs
npm test
npm run build
npx prisma validate
```

### Paso 2: Revertir cambios
```bash
# Si fue commit reciente
git revert <COMMIT_HASH>
git push

# Vuelves a PostgreSQL local (si tienes backup)
```

### Paso 3: Investigar raíz
```bash
# Revisa MIGRATION_SUPABASE_FINAL_REPORT.md
# Revisa QUICK_START_SUPABASE.md (troubleshooting)
# Checkea Supabase Dashboard status
```

---

## 📞 COMMON ISSUES & FIXES

### Issue: "DIRECT_URL is required for Supabase"
```
✅ FIX: Agrega DIRECT_URL a .env
```

### Issue: "psql: error: connection refused"
```
✅ FIX: Valida que DATABASE_URL sea correcto
✅ FIX: Verifica ?sslmode=require
```

### Issue: "Too many connections"
```
✅ FIX: PgBouncer pooling debe estar activo
✅ FIX: Chequea Supabase Dashboard > Connection info
```

### Issue: "Tests failing after migration"
```
✅ FIX: npm test usa _setup.ts que detecta Supabase
✅ FIX: Si falla, verifica DIRECT_URL está en .env
```

---

## ✅ SIGN-OFF

- [ ] **Developer**: Validé completamente localmente
- [ ] **QA**: Ejecuté tests y validaciones
- [ ] **DevOps**: Configuré GitHub Actions secrets
- [ ] **Lead**: Aprobó migración a Supabase

**Date**: ___________  
**Status**: ✅ READY FOR PRODUCTION

---

**Mantén este checklist para futuras migraciones y troubleshooting.**
