# Tasks: Bento Radar Táctico & Desasfixia Mobile (FEAT-180)

## Phase 1: Higiene, Poda de Código Muerto & Regla 8
- [x] 1.1 Eliminar el archivo huérfano `src/components/filters/DynamicFilterDrawer.tsx`.
- [x] 1.2 Remover la importación dinámica y el estado `isFilterDrawerOpen` de `src/components/modals/ModalHost.tsx` y `src/context/domains/RadarMatrixContext.tsx`.
- [x] 1.3 Reemplazar botones nativos `<button>` por `BrutalistButton` con touch target ≥44px en `src/components/radar/EnRouteBanner.tsx`, `UpcomingEncounterBanner.tsx`, `TravelModeModal.tsx` y `EnRouteTrackerModal.tsx`.
- [x] 1.4 Validar compilación de tipos con `npm run typecheck`.

## Phase 2: Desasfixia de la Grilla & Quick Peek Bento Sheet
- [x] 2.1 Crear el componente `src/components/matrix/ProfileBentoQuickPeek.tsx` (carrusel de fotos, nota de voz, ficha de hospedaje, morbos mutuos, y botones [Chatear] y [Coordinar Cita]).
- [x] 2.2 Refactorizar `src/components/matrix/ProfileCard.tsx` eliminando el botón "Coordinar" directo para evitar toques accidentales, manteniendo Toque cinético (⚡), Favorito (★) y tap a Quick Peek.
- [x] 2.3 Conectar el singleton de `ProfileBentoQuickPeek` en `src/components/matrix/ProfileGrid.tsx`.
- [x] 2.4 Reorganizar los bloques de `src/components/matrix/RadarBottomCommandBar.tsx` (1. Rol ➔ 2. Distancia & Viajero ➔ 3. Logística ➔ 4. Orden ➔ 5. Morbos colapsables ➔ 6. Clima/Sustancias).

## Phase 3: Rediseño de Coordinación de Cita (Rendezvous Single-Screen)
- [x] 3.1 Refactorizar `src/components/chat/RendezvousSheet.tsx` de 3 pantallas a un formulario Bento de pantalla única (Dónde, Cuándo, Puntos Claros, Guardián SOS).
- [x] 3.2 Verificar que el envío del ticket y pre-flight checklist funcione transparentemente hacia el chat del contacto.

## Phase 4: Localización Rioplatense 2026 & Contextos
- [x] 4.1 Actualizar claves y textos en `src/lib/i18n/translations.ts` ("Salidas & Joda Hoy", "Puntos Claros", "Coordinar Cita", "Se mueven / Van a donde estés", "Acá al toque", "Cero plantones", "Pase de Cita", "Limpiar filtros").
- [x] 4.2 Sincronizar textos en `src/context/domains/RadarMatrixContext.tsx` (`intentClusters` y labels locales).

## Phase 5: Verificación, Tests & Registro Vivo
- [x] 5.1 Ejecutar `npm run typecheck` asegurando 0 errores.
- [x] 5.2 Ejecutar suite completa de Vitest (`npm run test`) manteniendo el 100% de tests en verde.
- [x] 5.3 Actualizar `docs/contexto/registro-de-features.md` y documentar ADR en `docs/contexto/decisiones.md`.
- [x] 5.4 Registrar persistencia en Engram (`mem_save`).
