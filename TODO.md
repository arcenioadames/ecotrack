# Sprint 3 - TODO (ECOTRACK)

## HU-07 Dashboard Admin
- [ ] Implementar analytics DTOs / types
- [ ] Implementar analytics service con queries optimizadas y endpoint GET /analytics/dashboard
- [ ] Implementar controller + rutas con authorize(Admin)
- [ ] Implementar UI dashboard web (cards + charts)
- [ ] Implementar auto-refresh (polling cada 60s) con cleanup
- [ ] Agregar integration tests dashboard analytics (incluye auth/RBAC)

## HU-09 Filtros avanzados
- [ ] Implementar inventory-filter.validator.ts y validadores (pagination, categories, search, date range)
- [ ] Implementar filtering service en products.service.ts con where dinámico y paginación
- [ ] Exponer GET /products con filtros avanzados
- [ ] UI web: InventoryFilters + useInventoryFilters
- [ ] Sincronizar filtros con URL/Router
- [ ] Tests de filtros (incluye validación de query y edge cases)

## HU-12 Push notifications
- [ ] Configurar expo-notifications (permisos + listeners)
- [ ] Implementar usePushNotifications.ts (token + persistencia backend)
- [ ] Backend: persistencia push tokens (schema.prisma + services)
- [ ] Backend: notification delivery service con retry básico + logging
- [ ] Foreground/background handling + deep linking
- [ ] Tests de push notifications

## Fix técnico en progreso (para asegurar CI)
- [x] Ajustar backend/src/app.ts para que requireHttps se aplique cuando REQUIRE_HTTPS=1
- [ ] Confirmar: npm run lint OK
- [ ] Confirmar: npm run build OK
- [x] Confirmar: npm test OK
- [x] Confirmar: prisma validate OK
- [x] Confirmar: prisma generate OK
- [ ] Preparar commit/push siguiendo la regla de commit exacto

