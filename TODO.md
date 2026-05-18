# TODO - Poblar base de datos (seed)

- [x] Actualizar `backend/src/scripts/seed.ts` para insertar también **categorías y productos** (demo data).
- [x] Hacer el seed consistente/seguro: limpiar `Product` y `Category` antes de insertar (borrado similar al de usuarios).
- [x] Reutilizar usuarios seed (ADMIN) como `createdBy` para los productos.
- [x] Asegurar fechas de expiración variadas (algunos vencidos y otros por vencer) para que el dashboard funcione.
- [ ] Ejecutar `backend` migraciones si hace falta y correr `npm run db:seed`.
- [ ] Validar rápidamente que existan categorías/productos (vía endpoints o queries).

