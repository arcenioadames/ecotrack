# GitHub Branch Protection para EcoTrack

Este documento explica cómo dejar el pipeline de EcoTrack como una barrera real de entrega, no solo como un workflow informativo.

## Objetivo

Bloquear merges hacia `main` cuando el backend CI falle y exigir revisión humana antes de integrar cambios.

## Checks requeridos

El workflow principal es `.github/workflows/backend-ci.yml`. Debes configurarlo como required check para la rama protegida.

### Pasos en GitHub

1. Abre el repositorio en GitHub.
2. Ve a `Settings` > `Branches`.
3. En `Branch protection rules`, crea o edita la regla para `main`.
4. Activa `Require a pull request before merging`.
5. Activa `Require status checks to pass before merging`.
6. Selecciona el check del workflow `EcoTrack Backend CI/CD`.
7. Activa `Require branches to be up to date before merging` si quieres evitar merges contra un `main` desactualizado.
8. Activa `Require pull request reviews before merging`.
9. Define al menos 1 approval obligatorio.
10. Guarda la regla.

## Bloqueo de merge si CI falla

Con la regla anterior, GitHub impedirá el merge si alguno de estos pasos falla:

- `npm ci`
- `npx prisma generate`
- `npm run lint`
- `npm run test:coverage`
- `npm run build`
- `npm audit --audit-level=high`

## Secrets y variables requeridas

### Secrets

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`
- `CI_WEBHOOK_URL`

### Variables

- `CI_WEBHOOK_KIND` con valor `discord` o `slack`

## Notificaciones

Si configuras `CI_WEBHOOK_URL`, el workflow enviará una notificación opcional al finalizar con éxito o con fallo.

## Recomendación operativa

Para un entorno productivo, combina:

- Branch protection activa
- Required checks obligatorios
- 1 o más reviewers
- Secrets de CI cargados
- Variables de entorno de producción separadas de CI
