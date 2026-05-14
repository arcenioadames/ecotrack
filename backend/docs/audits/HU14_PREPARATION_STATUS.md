# HU-14 — Exportación PDF/Excel (Preparación / IN PROGRESS)

## Estado
- **HU-14 = PARTIAL / IN PROGRESS**
- **Export real funcional (para CI/tests):** actualmente vive en `backend/src/services/export/*` y se mantiene para no romper endpoints ni tests.

## Objetivo
- Stabilizar `GET /products/export` para que CI y tests vuelvan a **PASS**.
- Preparar la arquitectura futura (interfaces/estrategias/orquestador) sin reemplazar todavía el flujo actual.

## Ya hecho (preparación)
- Estructura preparatoria creada/ajustada:
  - `backend/src/exporters/strategies/export-strategy.interface.ts`
  - `backend/src/exporters/strategies/pdf-export.strategy.ts` (**stub preparatorio**, no streaming real)
  - `backend/src/exporters/strategies/excel-export.strategy.ts` (**stub preparatorio**, no streaming real)
  - `backend/src/services/report.service.ts` (**IN PROGRESS**, no habilitado para el endpoint actual)

## Pendiente (cuando HU-14 esté listo)
- Reemplazar gradualmente `src/services/export/*` por `src/exporters/strategies/*` + `ReportService`.
- Implementar streaming/chunking real en PDF/Excel.
- Agregar paginación/cursor builder para Prisma.
- Actualizar tests unitarios específicos del builder/strategias (sin depender del buffer completo).

## Riesgos
- Generar Buffer completo en memoria puede fallar para grandes volúmenes.
- Reemplazar el flujo actual sin staging puede romper contratos/headers/200 esperado por integración.

