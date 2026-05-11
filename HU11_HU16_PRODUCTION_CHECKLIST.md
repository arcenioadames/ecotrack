# HU-11 / HU-16 — Checklist de Validación Operacional (DevOps/SRE)

> Objetivo: validar **de forma manual y observable** que EcoTrack backend cumple en producción **CI/CD (HU-11)** y **HTTPS/seguridad (HU-16)**.
>
> Formato: **pasos exactos → comandos → pruebas → resultados esperados → riesgos si falla → PASS/FAIL**.

---

## Preparación (antes de validar)

### 0.1 Identifica el repo y ramas
- Repo GitHub: **(usa la URL real de tu repo)**
- Ramas: `main` y `develop`

### 0.2 Verifica que el workflow existe y es el correcto
- Archivo: `.github/workflows/backend-ci.yml`

**Comando (local, opcional):**
```bash
cd backend
cat package.json
ls ../.github/workflows/backend-ci.yml
```

**Resultado esperado:** workflow presente y con steps `lint`, `test:coverage`, `build`, `npm audit`.

**PASS/FAIL:**
- PASS si el archivo existe y es el único workflow que cubre backend.
- FAIL si no existe / es otro path / no corre en PR.

---

## 1) GitHub Branch Protection (HU-11)

### 1.1 Required checks (bloqueo por tests/lint/build)
**Pasos (GitHub UI):**
1. Ve a **Repo Settings → Branches**
2. Selecciona protección para `main`
3. En **Require a pull request before merging** activa si aplica
4. En **Require status checks to pass before merging**:
   - Añade checks requeridos del workflow (ej. `Backend CI / ci` o el nombre exacto que muestra GitHub)
   - Asegura que el check que representa **tests/lint/build** está incluido

**Cómo identificar los nombres exactos de checks:**
- Abre una ejecución reciente de CI en **Actions → Workflow runs**
- Copia los nombres de los jobs/steps (GitHub muestra los “checks” finales por job).

**Resultado esperado:** un PR no puede hacer merge si el job `ci` del workflow falla.

**Riesgo si falla:** merges con código que no compila o tests rotos → incidentes en producción.

**Criterio PASS/FAIL:**
- PASS: merge bloqueado al fallar `lint`/`test`/`build`.
- FAIL: merge permitido cuando checks no pasan.

---

### 1.2 Restricción de merge (solo PR)
**Pasos:**
1. En Branch protection → activa **Require pull request reviews before merging**
2. Activa **Require status checks to pass before merging**
3. Opcional: requiere mínimo de reviewers.

**Resultado esperado:** solo via PR con checks + reviews.

**Riesgo:** cambios directos sin auditoría/revisión.

**PASS/FAIL:**
- PASS si no se permite merge directo.
- FAIL si es posible merge por push.

---

### 1.3 Restricción force push
**Pasos:**
1. Branch protection → activa **Include administrators** (si quieres cumplimiento fuerte)
2. Activa **Restrict who can push to matching branches**
3. Activa **Force push restrictions** (GitHub UI suele llamarlo “Prevent force pushes”).

**Resultado esperado:** no se puede hacer `git push --force` a `main`.

**Riesgo:** rewrite de historial; bypass de revisiones.

**PASS/FAIL:**
- PASS si `git push --force origin main` falla.
- FAIL si permite force push.

**Comando de prueba local (en rama protegida):**
```bash
git push --force origin HEAD:main
```

**Resultado esperado:** rechazo por GitHub.

---

### 1.4 Restricción de bypass
**Pasos:**
1. En Branch protection → en **Bypass restrictions**:
   - Desactiva “Allow specified actors to bypass” si es posible.
   - Si no puedes, al menos limita bypass a un admin controlado.

**Resultado esperado:** ningún actor (excepto estrictamente definido) puede bypass.

**Riesgo:** bypass de CI y protección.

**PASS/FAIL:**
- PASS si no existe bypass o está estrictamente limitado.
- FAIL si bypass está ampliamente permitido.

---

## 2) GitHub Secrets (HU-11)

> Importante: en pruebas manuales, **no imprimir secrets** (usa operaciones observables).

### 2.1 Lista de secrets/vars esperados
- Secrets:
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `CI_WEBHOOK_URL`
- Variables repo:
  - `CI_WEBHOOK_KIND` (slack/discord) — si aplica

**Pasos (GitHub UI):**
1. Repo Settings → **Secrets and variables** → **Actions**
2. Confirma que existen **exactamente**.

**Resultado esperado:** los secrets existen.

**Riesgo si falla:** tokens débiles o CI sin notificación (riesgo seguridad para prod si secrets no cargan).

**PASS/FAIL:**
- PASS: secrets presentes.
- FAIL: alguno faltante.

### 2.2 Prueba de que secrets están siendo usados (sin exponer valor)
**Pasos:**
1. Ejecuta un PR que dispare el workflow.
2. En la ejecución, revisa logs del step que necesita secrets.
   - En el workflow actual, los secrets se usan principalmente en env para tests/JWT.
3. Confirma que el build/test no falla por “Environment variable ... is required”.

**Resultado esperado:** pipeline no falla por variables requeridas.

**PASS/FAIL:**
- PASS: no hay error de env.
- FAIL: fallos de env.

---

## 3) Validación CI (HU-11) — gating real

### 3.1 Tests fallando bloquean merge
**Prueba manual (técnica):**
- Crea un PR que garantice fallo de tests (ejemplos):
  - Cambiar un assert en un test existente o
  - Introducir un bug mínimo en código bajo `src/` para romper un test.

**Pasos:**
1. Abre PR hacia `main`
2. Observa el job `ci`

**Resultado esperado:**
- Job `ci` falla.
- Check status queda en rojo.
- **Merge button deshabilitado**.

**Riesgo:** desplegar código roto.

**PASS/FAIL:**
- PASS: no se puede mergear.
- FAIL: merge posible aunque tests fallen.

---

### 3.2 Lint bloquea merge
**Prueba manual:**
- Introduce error de lint (ej. estilo no permitido o una regla típica de ESLint/TS):
  - agrega un espacio en lugar de semicolon; o
  - crea unused variable en `backend/src/*.ts`.

**Resultado esperado:**
- Step `Lint` falla.
- PR no mergeable.

**Riesgo:** estilo y posibles errores sutiles.

**PASS/FAIL:**
- PASS: merge bloqueado.
- FAIL: merge permitido.

---

### 3.3 Build bloquea merge
**Prueba manual:**
- Introduce un error TypeScript (ej. tipo incompatible) para romper `npm run build`.

**Resultado esperado:**
- Step `Build production bundle` falla.
- PR no mergeable.

**Riesgo:** runtime errors.

**PASS/FAIL:**
- PASS: merge bloqueado.
- FAIL: merge permitido.

---

## 4) Validación HTTPS / TLS / Security Headers (HU-16)

### 4.1 TLS 1.2+ (servidor real)
**Cómo validar (recomendado):**
- Usa un endpoint real (staging/producción) y ejecuta:

**Comando (desde tu máquina):**
```bash
# Reemplaza example.com por tu dominio
openssl s_client -connect example.com:443 -tls1_2 -servername example.com
```

**Resultado esperado:** handshake exitoso con TLS 1.2.

**Riesgo si falla:** vulnerabilidades por protocolos antiguos.

**PASS/FAIL:**
- PASS si TLS1.2 funciona.
- FAIL si falla o permite solo TLS1.0/1.1.

---

### 4.2 HSTS
**Pasos (curl):**
```bash
curl -I https://example.com | findstr -i Strict-Transport-Security
```

**Resultado esperado:** cabecera `Strict-Transport-Security` presente y con max-age razonable.

**Riesgo:** downgrade attacks.

**PASS/FAIL:**
- PASS si está.
- FAIL si no está.

---

### 4.3 CSP (clickjacking mitigado)
**Pasos (curl):**
```bash
curl -I https://example.com | findstr -i Content-Security-Policy
```

**Resultado esperado:** CSP presente. En código se configura con `helmet`.

**Riesgo:** XSS y data injection.

**PASS/FAIL:**
- PASS si CSP presente.
- FAIL si no.

---

### 4.4 Redirección HTTP → HTTPS
> El backend por sí mismo solo responde 426 en `requireHttps` (si enforce activo). La redirección real HTTP→HTTPS debe existir en proxy (NGINX/Cloudflare/ALB).

**Prueba:**
```bash
curl -I http://example.com
```

**Resultado esperado (dos opciones válidas según arquitectura):**
- O bien se redirige (301/308) a https, **o**
- Se devuelve 426 si el request llega al backend.

**Riesgo:** tráfico sin cifrar.

**PASS/FAIL:**
- PASS si redirige o backend responde 426.
- FAIL si responde 200/OK desde HTTP sin enforcement.

---

### 4.5 REQUIRE_HTTPS=1
**Prueba (staging):**
- Asegura que en el entorno en ejecución `REQUIRE_HTTPS=1` o `NODE_ENV=production`.

**Prueba funcional:**
1. Asegura ruta protegida (enviar request a `/auth/login` o `/privacy/...`)
2. Simula `x-forwarded-proto: http` si estás detrás de proxy

**Comando:**
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-forwarded-proto: http" \
  https://example.com/health
```

**Resultado esperado:**
- Si el request llega como HTTP o el proxy setea forwarded proto incorrecto, debe responder 426 cuando enforce.

**Riesgo:** HTTPS enforcement no funcionando.

**PASS/FAIL:**
- PASS si responde 426 bajo condición de enforce.
- FAIL si no.

---

## 5) Validación JWT / Refresh Token (rotación, logout, replay)

> Se valida sobre el comportamiento real del servicio (idealmente staging con DB).

### 5.1 Rotación refresh token
**Preparación:**
- Obtén un usuario ADMIN con credenciales de staging.

**Pasos manuales: (ejemplo con curl)**
1. Login para obtener refresh token
2. Llamar `/auth/refresh` con refresh token A
3. Guardar refresh token B
4. Llamar `/auth/refresh` nuevamente con refresh token A

**Comandos (ajusta variables):**
```bash
# 1) Login
ACCESS=$(curl -s -X POST https://example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ex.com","password":"..."}' | jq -r .accessToken)
RT=$(curl -s -X POST https://example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ex.com","password":"..."}' | jq -r .refreshToken)

# 2) Refresh A -> debe rotar
RESP_B=$(curl -s -X POST https://example.com/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$RT'"}')
RT_B=$(echo "$RESP_B" | jq -r .refreshToken)

# 4) Replay con A
RESP_REPLAY=$(curl -s -X POST https://example.com/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$RT'"}')
```

**Resultado esperado:**
- Step 2: OK 200, emisión de refresh token nuevo.
- Step 4: 401 con message **`Token revoked`** (reused path) según implementación.

**Riesgo si falla:** secuestro de token → sesión persistente.

**PASS/FAIL:**
- PASS si reuse revoca.
- FAIL si refresh A sigue siendo válido.

---

### 5.2 Revocación en logout
**Pasos:**
1. Login → refresh token A
2. Logout con refresh token A
3. Refresh con refresh token A

**Resultado esperado:**
- Logout: 200 `{message:"Logged out"}`
- Refresh post-logout: 401 `{message:"Token revoked"}` o `{message:"Invalid token"}`.

**Riesgo:** sesiones no revocadas.

**PASS/FAIL:**
- PASS si A deja de funcionar.
- FAIL si sigue funcionando.

---

### 5.3 Replay detection
> Replay detection se prueba con el mismo mecanismo de rotación: usar el refresh token viejo en refresh.

**Resultado esperado:**
- El backend detecta y revoca todas las sesiones relevantes (según `revokeAllByUser`).

**PASS/FAIL:**
- PASS si el reuse no vuelve a emitir tokens.
- FAIL si emite tokens.

---

## 6) Validación GDPR / Habeas Data (anonimización real y trazabilidad)

> Requiere DB staging y posibilidad de inspección de registros (ideal: acceso DB o logs/endpoint de auditoría).

### 6.1 Anonimización real (no solo mock)
**Pasos: (flujo staging)**
1. Crea usuario (register) con acceptedPolicy=true
2. Realiza login y obtén access token
3. Llama `DELETE /privacy/me` con `confirmAnonymization=true`
4. Verifica cambios en DB:
   - `User.isActive=false`
   - `User.name == "Usuario anonimizado"`
   - `User.email` dominio `privacy.ecotrack.invalid`
   - `User.anonymizedAt` no null
   - `User.anonymizedReason` contiene `RIGHT_TO_BE_FORGOTTEN` si no pasó motivo
5. Verifica que el usuario ya no es utilizable para login (si endpoint login valida isActive).

**Resultado esperado:**
- Cambios persistidos en DB y login rechazado (401 `Invalid credentials` o `USER_INACTIVE`).

**Riesgo si falla:** incumplimiento GDPR (no anonimiza efectivamente).

**PASS/FAIL:**
- PASS si DB evidencia anonimización.
- FAIL si datos permanecen sin cambios o login aún funciona.

---

### 6.2 Auditoría persistente
**Pasos:**
1. Tras anonimización, inspecciona tablas:
   - `UserAnonymizationAudit` debe tener un registro.
   - Campos: `targetUserId`, `actorUserId`, `anonymizedIp`, `userAgent`, `reason`, `anonymizedAt`.
2. Para aceptación de política (register), verifica `PolicyAcceptanceAudit`:
   - `acceptedIp` y `userAgent` si fueron capturados.

**Resultado esperado:**
- Auditorías creadas por HU-16, no solo en mocks.

**Riesgo:** sin trazabilidad legal.

**PASS/FAIL:**
- PASS si existe auditoría real y no se pierde.
- FAIL si no se generan o faltan campos.

---

### 6.3 Trazabilidad (endpoints admin)
**Pasos:**
1. Llama `GET /privacy/audits/anonymization` con token ADMIN
2. Verifica paginación y filtros `from/to`, `targetUserId`

**Resultado esperado:**
- Respuesta incluye los registros esperados.
- STAFF recibe 403.

**Riesgo:** exposición de datos personales.

**PASS/FAIL:**
- PASS si admin ve, staff no.
- FAIL si staff puede ver.

---

## 7) Validación Seguridad OWASP (producción)

### 7.1 Helmet
**Pasos (curl):**
```bash
curl -I https://example.com | findstr -i x-frame-options x-content-type-options x-xss-protection referrer-policy
```

**Resultado esperado:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- CSP y referrer-policy según helmet.

**Riesgo:** clickjacking/sniffing.

**PASS/FAIL:**
- PASS si headers presentes.
- FAIL si faltan.

---

### 7.2 Rate limiting
> En el código hay `basicApiProtection` que limita por `req.ip + routeKey`. Debe verificarse contra producción real.

**Prueba manual:**
1. Envía muchas requests seguidas al mismo endpoint:
   - `POST /auth/login` con credenciales incorrectas.
2. Observa respuesta 429.

**Comando (ejemplo):**
```bash
# genera carga básica (ajusta count según maxRequests)
for /L %i in (1,1,200) do curl -s -o NUL -w "%{http_code}\n" -X POST https://example.com/auth/login -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"wrong"}'
```

*(Si estás en PowerShell, usa el loop equivalente.)*

**Resultado esperado:**
- Aparece `429 Too many requests`.

**Riesgo:** DoS/bruteforce.

**PASS/FAIL:**
- PASS si rate limiting actúa.
- FAIL si nunca llega 429.

---

### 7.3 Secure cookies (refresh)
**Contexto:** según `shouldUseRefreshCookie()`, en production se usan cookies.

**Pasos: (login + captura Set-Cookie)**
1. Llama `POST /auth/login`
2. Inspecciona `Set-Cookie`

**Comando:**
```bash
curl -s -D - -o /dev/null -X POST https://example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ex.com","password":"..."}' | findstr -i "ecotrack_refresh_token"
```

**Resultado esperado:**
- `HttpOnly`
- `SameSite=Strict`
- `Path=/auth`
- `Secure` **en producción**

**Riesgo:** robo de token por XSS o MITM.

**PASS/FAIL:**
- PASS si Secure/HttpOnly/SameSite correctos.
- FAIL si falta Secure o HttpOnly.

---

### 7.4 Protección XSS
**Pasos:**
- Verifica que CSP está activa (ya cubierto en 4.3).
- Si existen endpoints que rendericen HTML: comprobar sanitización.

**Evidencia en código:** `helmet` con CSP y `frameguard: deny`.

**Prueba manual adicional:**
1. Enviar payload XSS en campos que se reflejen (si existen).
2. Confirmar que no se ejecuta.

**Resultado esperado:**
- No hay reflection ejecutable.

**Riesgo:** XSS.

**PASS/FAIL:**
- PASS si CSP bloquea y no hay ejecución.
- FAIL si se ejecuta.

---

### 7.5 Clickjacking (clickjacking)
**Pasos:**
- Validar `X-Frame-Options: DENY` y/o `frame-ancestors 'none'` en CSP.

**Comando:**
```bash
curl -I https://example.com | findstr -i "x-frame-options\|frame-ancestors"
```

**Resultado esperado:**
- `X-Frame-Options: DENY`
- `frame-ancestors 'none'` en CSP.

**Riesgo:** UI redress.

**PASS/FAIL:**
- PASS si presentes.
- FAIL si ausentes.

---

## Reporte final (cómo documentar)

Para cada sección, documenta:
- Fecha/hora
- Entorno (staging/prod)
- Evidencias (links a Actions run / capturas headers)
- Resultado PASS/FAIL
- Incidencias/mitigaciones

---

## Cierre: criterio global

- **HU-11 PASS global** si: branch protection + required checks + secrets + gating CI funcionan.
- **HU-16 PASS global** si: HTTPS enforcement + headers + rate limiting + cookies secure + GDPR anonimización real funcionan.

Se considera **FAIL global** si falla cualquier check crítico (secciones 1,2,4,5,6). 

