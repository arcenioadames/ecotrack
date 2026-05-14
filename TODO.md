# TODO - EcoTrack backend - HU-14 stabilization

## Step 0: Confirm scope
- [x] Mantener export real existente en `src/services/export/*` para que los tests de integración sigan pasando.
- [ ] Crear arquitectura preparatoria en `src/exporters/*` y `src/services/report.service.ts` sin reemplazar controllers/endpoints usados por tests.

## Step 1: Auditar wiring actual
- [ ] Verificar que `GET /products/export` usa el `ExportService` correcto (el funcional) y no las estrategias que hacen `throw`.

## Step 2: Implementar estructura preparatoria (stub / contratos)
- [x] Asegurar que exista `src/exporters/strategies/export-strategy.interface.ts`.
- [x] Ajustar `src/exporters/strategies/pdf-export.strategy.ts` y `src/exporters/strategies/excel-export.strategy.ts` para no romper build (HU-14 IN PROGRESS).
- [x] Implementar `src/services/report.service.ts` como orquestador IN PROGRESS (con TODOs), sin usarse en `/products/export`.


## Step 3: Documentación
- [x] Crear `backend/docs/audits/HU14_PREPARATION_STATUS.md`.


## Step 4: Lint/Build/Test
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test -- --runInBand`

## Step 5: Estado final
- [ ] Confirmar CI verde y que los tests de export vuelvan a PASS.

