# Tasks: Tactical Zen & Progressive Disclosure Redesign

## Phase 1: Diccionario Rioplatense LGBT 2026 (Foundations & Copy)
- [x] 1.1 Actualizar `src/lib/i18n/translations.ts` reemplazando términos ibéricos/acartonados por jerga queer argentina 2026 ("Zumbidos", "Agenda", "Radar", "0% Fantasmas", "Pone lugar", "Modo Discreto", "Morbos").
- [x] 1.2 Actualizar `src/components/navigation/BrutalistNav.tsx` con las etiquetas renovadas ("Radar", "Zumbidos", "Chat", "Agenda", "Mi Perfil").
- [x] 1.3 Verificar consistencia de tipos en tests unitarios de i18n (`translations.test.ts`) y suite completa.

## Phase 2: Cabecera Táctica Zen & Menú de Acciones Rápidas (Header Refactor)
- [x] 2.1 Refactorizar `src/components/brand/BrutalistHeader.tsx` para eliminar la botonera saturada de 5 micro-botones.
- [x] 2.2 Implementar una Cápsula de Usuario unificada (44px) con menú táctico desplegable (Audio Sub-bass, Pase QR, Verificación 3D, Unlimited, Sesión).
- [x] 2.3 Mantener la zona central vacía cuando no haya emergencias activas (solo activa ante PIN de encuentro o Guardián en marcha).

## Phase 3: Tarjeta Táctica Zen & Despeje de Grilla (Component Craft)
- [x] 3.1 Refactorizar `src/components/matrix/ProfileCard.tsx` aplicando Progressive Disclosure Nivel 1:
  - Eliminar los 4 botones de acción apiñados en el pie de la tarjeta.
  - Implementar exactamente UN botón de acción primario ("Sintonizar" con feedback sub-bass).
  - Reducir badges visibles a lo esencial (Nombre, edad, rol y si pone lugar/viaja).
  - Trasladar morbos mutuos, badges de salud profundos y veredictos al Dossier (Nivel 2).
- [x] 3.2 Despejar `src/app/page.tsx` unificando los banners apilados de trayecto/cita en píldoras contextuales no invasivas.

## Phase 4: Coherencia de Flujos en Dossier, Zumbidos y Chat (Integration)
- [x] 4.1 Ajustar `src/components/profile/ProfileDetailModal.tsx` como el hogar natural de la Tríada de Compatibilidad completa y el acuerdo Pre-Flight.
- [x] 4.2 Actualizar `src/components/pulses/PulseCard.tsx` y `PulsesView.tsx` adaptados a la terminología de "Zumbidos" ("Aceptar Zumbido ⚡" / "Paso, gracias").
- [x] 4.3 Verificar que el banner fijado de acuerdo previo en `DarkroomChatModal.tsx` mantenga diseño limpio y compacto.

## Phase 5: Validación, Tests & Documentación (DoD Gate)
- [x] 5.1 Ejecutar `npm run typecheck` garantizando 0 errores de TypeScript.
- [x] 5.2 Actualizar y ejecutar la suite completa de pruebas unitarias (`npm run test`) logrando 100% de tests pasando.
- [x] 5.3 Registrar el cambio en `docs/contexto/registro-de-features.md` y documentar ADR en `docs/contexto/decisiones.md`.
