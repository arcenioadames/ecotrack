# EcoTrack — Auditoría Técnica Completa (Backend + Mobile + Expo/APK + CI/CD)

> Estado: **FINAL (sin cambios de comportamiento / sin refactors masivos)**

## 0) Evidencia disponible (del repo)
- Backend en `backend/src/` (Express + TypeScript).
- Prisma presente en `backend/prisma/`.
- JWT access/refresh presente (tests unit/integration lo ejercitan).
- Tests con Jest/Supertest:
  - Existe suite de integración y unidad.
  - Confirmación local: `npm test -- --runInBand` ✅ **PASS (117/117)** e incluye integración de export `GET /products/export`.
- Export HU-14 preparatorio existe y está marcado como **IN PROGRESS**.
- Mobile en `mobile/` con Expo/React Native.
- `mobile/app.json` existe.
- `mobile/eas.json` **no existe** (impacta EAS build).
- `.github/workflows` no fue detectado en el repo (impacta CI/CD verificable).

---

## 1) Estado real del Backend

### 1.1 Qué funciona realmente (demostrado por tests)
**Auth**
- Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`.
- Validación: Zod + errores genéricos para evitar enumeración.
- Cobertura: integration/unit PASS.

**RBAC / Authorization**
- Roles: `ADMIN`, `STAFF`.
- Protecciones: middleware `authenticate` + `authorize`.
- Cobertura: integration PASS.

**Products**
- CRUD: `POST /products`, `GET /products`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id`.
- Filters/paginación/expiring: `GET /products/expiring` y queries por filtros.
- Export: `GET /products/export?format=pdf|excel`.
- Cobertura: `backend/tests/integration/products.test.ts` PASS.

**Export**
- Los tests validan:
  - status **200**
  - headers `Content-Disposition` con extensión `.pdf` o `.xlsx`
  - headers `Content-Type` con `application/pdf` o `spreadsheetml`

**Analytics**
- `GET /analytics/dashboard` — integración PASS.

**Privacy/GDPR**
- `GET /legal/privacy` — integración PASS.
- `privacy/anonymize`, `privacy/audits/*` — integración PASS.

**Security**
- HTTPS hardening — integración PASS.

### 1.2 Qué está parcial (HU-14)
**HU-14 (export preparatorio / arquitectura)**
- Existe arquitectura preparatoria en:
  - `backend/src/exporters/strategies/*`
  - `backend/src/services/report.service.ts`
- Riesgo: puede existir stubs/throws en código IN PROGRESS.
- Sin embargo:
  - el endpoint real `GET /products/export` permanece CI-safe porque el flujo funcional usado por tests es el que vive en `backend/src/services/export/*`.

---

## 2) Riesgos críticos (pueden romper demo o entrega si se toca código)

### CRÍTICO A — Activación accidental de stubs HU-14
Archivos:
- `backend/src/exporters/strategies/pdf-export.strategy.ts`
- `backend/src/exporters/strategies/excel-export.strategy.ts`
- `backend/src/services/report.service.ts`

Riesgo:
- Un cambio futuro en imports/wiring/barrel/index puede hacer que el endpoint export real deje de usar `src/services/export/*` y termine usando el stub IN PROGRESS (o trigger de throw).

Impacto:
- Rompe comportamiento observable del endpoint export.

### CRÍTICO B — Duplicación de subsistemas de export
- Real: `backend/src/services/export/*` (PDFKit/ExcelJS).
- Preparación: `backend/src/exporters/strategies/*` + `backend/src/services/report.service.ts`.

Riesgo:
- Duplicación aumenta superficie de regresión (cambios pequeños de wiring pueden cruzar subsistemas).

### CRÍTICO C — CI/CD no verificable
- No se detectaron workflows `.github`.

Impacto:
- “CI verde” no es demostrable como pipeline en repo.

---

## 3) Riesgos medios

### Medio 1 — Logs en consola con posible riesgo de privacidad
- Se observa `console.warn` en servicios auth/privacy.
- Aunque los tests pasan, para demo y cumplimiento GDPR conviene controlar qué campos se registran.

### Medio 2 — Cobertura HU-18 incompleta
- Existe integración PASS para endpoints principales.
- Pero aún no hay evidencia formal (coverage vs rutas) de:
  - tests negativos para rol STAFF sobre `/products/export`
  - cobertura de rutas auxiliares.

---

## 4) Riesgos menores
- Tamaño de controllers (punto de regresión por cambios futuros).
- Posibles inconsistencias de middlewares (si se amplía el set de endpoints).

---

## 5) Endpoints sin cobertura (limitación de evidencia)
Con la evidencia disponible en este análisis:
- Los endpoints principales están cubiertos por integración.
- Para afirmar “sin cobertura” de forma 100% exacta se requiere:
  - `npm run test:coverage`
  - y cruzar con `backend/src/routes/**/*.ts`.

Recomendación no intrusiva:
- generar coverage (unit+integration) y listar gaps.

---

## 6) Qué falta para HU-18 real
- Tests de integración con enfoque en:
  - casos negativos de autorización (ej. STAFF → 403 en `/products/export`)
  - validación estricta de query params (format, status, rangos de fechas)
  - verificación adicional de export (contenido mínimo) cuando se habilite HU-14 completo.

---

## 7) Qué falta para “production-ready” (sin refactor masivo)
1) **Guardrails HU-14**
   - Evitar que stubs preparatorios puedan entrar al flujo real por accidente.
   - Documentación explícita + runtime checks si se instancian (sin cambiar comportamiento actual).

2) **CI/CD verificable**
   - Confirmar workflows en `.github/workflows` o crear evidencia.

3) **EAS build reproducible**
   - Requerido para APK instalable (ver sección Expo).

---

## 8) Estado del frontend móvil (Expo / React Native)

### 8.1 Evidencia real
- `mobile/app.json` existe con:
  - `slug: ecotrack`
  - `scheme: ecotrack`
  - iconos/splash (rutas en `./assets/...`)
  - `extra.apiUrl` y cookie/refresh token vía env

### 8.2 Hallazgo crítico: `eas.json` ausente
- `mobile/eas.json` no existe.
- Scripts en `mobile/package.json` asumen EAS:
  - `eas build --platform ios/android`

Impacto:
- Construcción APK/IPA vía EAS **no garantizada**.

---

## 9) Demo funcional: qué mostrar mañana sin miedo

**Backend (READY FOR DEMO)**
- Login (register/login/refresh)
- Dashboard analytics
- Productos CRUD + filtros/paginación
- Alertas/expiring
- Export PDF/Excel (contrato HTTP validado por integración)
- GDPR/privacy endpoints principales (según UI que consuma la API)

**Evitar (alto riesgo por HU-14 preparatorio)**
- cualquier feature que en el futuro intente usar `backend/src/exporters/strategies/*` o `report.service.ts` como export real.

---

## 10) Lista exacta de archivos problemáticos
- `backend/src/exporters/strategies/pdf-export.strategy.ts` (HU-14 IN PROGRESS)
- `backend/src/exporters/strategies/excel-export.strategy.ts` (HU-14 IN PROGRESS)
- `backend/src/services/report.service.ts` (HU-14 IN PROGRESS)
- `backend/src/controllers/product.controller.ts` (wiring export endpoint)
- `mobile/eas.json` (ausente; requerido para EAS builds en el repo)

---

## 11) Veredicto final

- **READY FOR DEMO**: ✅ (backend)
- **APK instalable (Expo/EAS)**: ❌ **NO garantizado** (falta `mobile/eas.json`)
- **CI/CD GitHub Actions real**: ❌ **NO verificable** (no `.github/workflows` detectado)

**Veredicto global:** **PARTIAL**

---

## 12) Recomendaciones mínimas (sin cambiar comportamiento observable)
1) Blindar HU-14 stubs para impedir activación accidental.
2) Generar evidencia de coverage (`npm run test:coverage`) y cerrar gaps mínimos de HU-18.
3) Asegurar EAS build:
   - agregar `mobile/eas.json` o ajustar scripts a un flujo que funcione con lo disponible.
4) Confirmar pipeline CI/CD creando/validando `.github/workflows`.

