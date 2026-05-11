# TODO_SPRINT2_HARDENING

## Paso 1: Aislar rutas de testing
- [x] Crear `backend/src/routes/testing.routes.ts` con endpoints /protected/*
- [x] Registrar router SOLO cuando `process.env.NODE_ENV === 'test'`
- [x] Eliminar endpoints /protected/* duplicados desde `backend/src/app.ts`

## Paso 2: Hardening de DB para integration tests
- [x] Actualizar `backend/tests/integration/_setup.ts` para: verificar/crear database test y ejecutar `prisma migrate deploy`
- [ ] Añadir dependencia `pg` (y @types si aplica) a `backend/package.json`


## Paso 3: CI GitHub Actions
- [ ] Corregir/reemplazar `backend/.github/workflows/backend-ci.yml` para incluir: services postgres, lint, build, test, npm audit

## Paso 4: Typings globales `req.user`
- [ ] Verificar que jest/ts-jest reconozcan `src/types/express/index.d.ts` (ajustar jest/tsconfig si falla)

## Paso 5: Validación local
- [ ] `cd backend && npm run build`
- [ ] `cd backend && npm test`

