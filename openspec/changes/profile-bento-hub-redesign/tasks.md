# Tasks: Profile Bento Hub Redesign

## Phase 1: Poda de Duplicaciones de Sistema (Settings Cleanup)
- [x] 1.1 Podar sección 5 (Ajustes de app: idioma y unidades) de `src/components/account/tabs/BioTab.tsx`.
- [x] 1.2 Podar secciones 3, 4 y 5 (Sesión Google, Audio/Háptica, Nube/Backups) de `src/components/account/tabs/BoundariesTab.tsx`.
- [x] 1.3 Verificar que `AppSettingsModal.tsx` / `AppSettingsSection.tsx` retenga todas esas opciones funcionales sin regresiones.
- [x] 1.4 Validar tipos con `npm run typecheck`.

## Phase 2: Rediseño del Bento Hero & Action Sheet de Portada
- [x] 2.1 Refactorizar `CoverPhotoSelectorModal.tsx` a un Bottom Sheet directo (Cámara inmediata, Galería del celu, Fotos de álbumes).
- [x] 2.2 Rediseñar el Hero Card en `src/components/account/ProtocolView.tsx` con arquitectura Bento compacta, medidor de salud/completitud del perfil y triggers limpios.
- [x] 2.3 Validar que el cambio de foto actualice avatar y portada en 1 toque.

## Phase 3: Unificación de Logística, Movilidad & Copy Rioplatense 2026
- [x] 3.1 Unificar la sincronización de movilidad ("Pongo casa" / "Voy yo") entre `BioTab.tsx` y `LogisticsTab.tsx`.
- [x] 3.2 Actualizar copy de `src/lib/i18n/translations.ts` a rioplatense contemporáneo 2026 ("Tus Álbumes", "Cosas a mano en casa", "Comodidades del depto", "Límites y despedida sin drama", "Contextura física", "Altura").
- [x] 3.3 Actualizar labels y descripciones en `UserAlbumManager.tsx`, `LogisticsTab.tsx`, `ReputationTab.tsx` y `BoundariesTab.tsx`.

## Phase 4: Verificación Integral & Cierre
- [x] 4.1 Ejecutar `npm run typecheck` asegurando 0 errores.
- [x] 4.2 Ejecutar suite completa de tests (`npm run test`) manteniendo 100% verde (505/505 tests pasados).
- [x] 4.3 Actualizar `docs/contexto/registro-de-features.md` y ADR en `docs/contexto/decisiones.md`.
- [x] 4.4 Guardar memoria persistente en Engram (`mem_save`).
