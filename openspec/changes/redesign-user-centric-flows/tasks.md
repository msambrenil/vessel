# Tasks: Rediseño de Flujos Centrado en el Usuario (De-Grindrización de VESSEL)

## Phase 1: Modelos, Tipos & Estado de Sintonía (Foundations)
- [x] 1.1 Extender `src/types/vessel.ts` con `OperatingIntentMode` (`now` | `nightlife` | `kink` | `stealth`), `IntentClusterGroup` y metadatos de compatibilidad.
- [x] 1.2 Actualizar `src/context/domains/RadarMatrixContext.tsx` incorporando el estado `operatingIntent`, el conmutador con audio sub-bass y el agrupador reactivo de perfiles por racimos de intención.
- [x] 1.3 Añadir claves de internacionalización tipadas en `src/lib/i18n/translations.ts` (es/en) para los 4 modos de sintonía, racimos y acciones de doble consentimiento.

## Phase 2: El Radar de Sintonías e Intenciones (UI & Navigation)
- [x] 2.1 Crear `src/components/matrix/IntentHubSelector.tsx` con micro-interacciones brutalistas, targets táctiles de 48px y resonancia sub-bass a 55Hz.
- [x] 2.2 Reemplazar el `StatusToggle` en `src/app/page.tsx` e integrar `IntentHubSelector.tsx` en la cabecera operativa.
- [x] 2.3 Refactorizar `src/components/matrix/ProfileGrid.tsx` para renderizar perfiles en racimos intencionales ("Con Lugar Ahora", "Listos para Salir", "Hotspots de Fiesta", "Sintonía Kink Coincidente") en vez de una cuadrícula euclidiana monótona.
- [x] 2.4 Integrar la cartelera de eventos nocturnos y clubes dentro del modo `nightlife` sin forzar al usuario a abandonar el radar.

## Phase 3: La Tarjeta Táctica de Compatibilidad (Component Craft)
- [x] 3.1 Actualizar `src/components/matrix/ProfileCard.tsx` para exponer la Tríada de Compatibilidad:
  - Micro-ficha de hospedaje ("Recibe Solo", "Lugar Confort", "Puede Viajar").
  - Micro-chips de rol, prácticas y barreras (Pre-Flight visible de un vistazo).
  - Contador de disponibilidad horaria inmediata ("Listo próximos 60m").
- [x] 3.2 Incorporar botón primario "Sintonizar" en la tarjeta que despliegue el acuerdo de Pre-Flight en 3 taps.

## Phase 4: Conexión Action-First & Doble Consentimiento (Chat & Pulses)
- [x] 4.1 Modificar el flujo de contacto en `ProfileDetailModal.tsx` para que el CTA principal sea "Enviar Pulso de Sintonía con Pre-Flight".
- [x] 4.2 Enriquecer `src/components/pulses/PulsesView.tsx` y `PulseCard.tsx` con la tarjeta de revisión de sintonía y botones de acción rápida ("Aceptar Sintonía" / "Declinar con Respeto").
- [x] 4.3 Vincular la aceptación del pulso con la creación del Darkroom Chat y la fijación de las dinámicas acordadas en la cabecera del chat.

## Phase 5: Validación, Calidad & Tests (DoD Gate)
- [x] 5.1 Ejecutar `npm run typecheck` garantizando 0 errores de TypeScript y estricto tipado.
- [x] 5.2 Ejecutar la suite completa de Vitest (`npm run test`) actualizando o creando tests unitarios para los nuevos componentes y verificando que los 353+ tests pasen al 100%.
- [x] 5.3 Validar ergonomía visual, modo oscuro estricto y touch targets (Impeccable Craft Floor) en mobile viewport.
- [x] 5.4 Registrar el cambio en `docs/contexto/registro-de-features.md` y documentar ADR en `docs/contexto/decisiones.md`.

