# HU-14 — Exportación PDF/Excel (Pendiente)

## Estado actual
La API ya expone un endpoint de exportación (`GET /products/export`) y existe una estructura base de exportación bajo `src/services/export/*`.

**IMPORTANTE:** En este momento **NO se debe generar PDF/Excel real**. El objetivo de HU-14 es preparar la arquitectura con contratos claros para evitar deuda prematura, fugas de memoria y problemas de escalabilidad.

---

## Arquitectura futura (propuesta)

### 1) Strategy Pattern
Implementar interfaces y estrategias por formato:

- `ExportStrategy`
  - `generateStream(items): NodeJS.ReadableStream`
  - `getMimeType()`
  - `getFileExtension()`

- Estrategias:
  - `PdfExportStrategy`
  - `ExcelExportStrategy`

### 2) Report/ExportService
`ReportExportService` (o `ExportService`) orquesta:
- cálculo de query exportable (filtros reutilizables)
- construcción de iteradores/streams con paginación server-side
- delegación a la estrategia

### 3) Query reutilizable (HU-09-friendly)
- Crear un builder reutilizable `ProductExportFilters` / `ProductFilters`
- Un único `ProductWhereBuilder` para producir `Prisma.ProductWhereInput` eficiente

### 4) Streaming / memoria controlada (>500 registros)
**Requisito:** Evitar generar el documento entero en memoria.

- PDF:
  - usar PDFKit en modo stream (stream directo al response)
- Excel:
  - usar ExcelJS en modo streaming writer
- Para grandes volúmenes:
  - iterar en chunks (e.g. `take=200` por página) hasta agotar

### 5) Background jobs (opcional para escalado)
- Para >N registros o bajo carga alta:
  - encolar job (ej. BullMQ/Redis) y notificar/descargar cuando esté listo

---

## Riesgos de export síncrona (por qué NO se implementa aún)

1. **Memoria**: generar Buffer completo puede romper para >500 registros.
2. **Timeouts**: export grande en request/response puede expirar.
3. **Carga de DB**: queries sin paginación y sin índices adecuados pueden degradar.
4. **Complejidad**: PDF/Excel streaming requiere integración cuidadosa con headers y control de errores.

---

## Recomendaciones técnicas (implementación futura)

1. **Response streaming**
   - setear `Content-Disposition`, `Content-Type`
   - escribir stream al response (sin Buffer completo)

2. **Chunking**
   - `count` + `page` iterativo o cursor pagination

3. **Consistencia de timezone UTC**
   - centralizar cálculo de start-of-day UTC
   - reutilizar `inventory-status.util.ts`

4. **Tests**
   - unit tests de builder filtros
   - integration tests que verifiquen 501/placeholder mientras está pendiente
   - tests de tamaños y límites (cuando se habilite)

---

## Checklist de “Enable HU-14”
- [ ] deshabilitar placeholder (volver a export real)
- [ ] streaming PDF/Excel
- [ ] chunking + paginación server-side
- [ ] cobertura de tests
- [ ] performance check con dataset simulado

