# Proposal: Bento Radar Táctico & Desasfixia Mobile (FEAT-180)

## Intent
Transformar la vista central del Radar (`ProfileGrid.tsx`) y sus vistas, ventanas y menús dependientes en una experiencia ergonómica "Bento Radar Táctico" de alto rendimiento para dispositivos móviles (360px–430px). Eliminar la asfixia de espacio vertical generada por drawers sobredimensionados y botones compitiendo en tarjetas compactas; podar código muerto (`DynamicFilterDrawer.tsx`); estandarizar botones nativos ad-hoc según la Regla 8 (Impeccable UI); desacoplar el flujo de cita introduciendo un **Quick Peek Bento Sheet** y transformando `RendezvousSheet.tsx` de un wizard burocrático de 3 pasos a un formulario Bento de 1 pantalla; y modernizar todo el lenguaje a español rioplatense 2026 para usuarios de 20 a 35 años en Argentina.

## Scope
- `src/components/matrix/ProfileGrid.tsx`: Desasfixia vertical, integración del Quick Peek Bento Sheet singleton y simplificación del árbol de renderizado.
- `src/components/matrix/ProfileCard.tsx`: Poda del botón *"⚡ Coordinar"* directo sobre la tarjeta (que provocaba toques accidentales y apertura de wizards prematuros), reemplazándolo por apertura del Quick Peek Bento o Ficha Completa, manteniendo el toque rápido (⚡) y favoritos (★).
- `src/components/matrix/ProfileBentoQuickPeek.tsx` (Nuevo): Bottom sheet Bento con vista rápida de fotos, reproductor de audio de voz, Ficha de Hospedaje (ducha, privacidad, ascensor), morbos mutuos destacados y acciones directas `[💬 Chatear]` y `[⚡ Coordinar Cita]`.
- `src/components/matrix/RadarBottomCommandBar.tsx`: Reordenamiento lógico de bloques (1. Rol y posición ➔ 2. Distancia y modo viajero ➔ 3. Logística clave ➔ 4. Orden ➔ 5. Morbos colapsables ➔ 6. Clima y sustancias) y compactación del peek para no asfixiar las tarjetas.
- `src/components/chat/RendezvousSheet.tsx`: Rediseño de 3 pantallas a un Bento Pacto de Cita en **1 sola pantalla** (¿Dónde?, ¿Cuándo?, Puntos Claros, Guardián SOS) con 1 tap de confirmación.
- `src/components/filters/DynamicFilterDrawer.tsx`: Poda de 690 líneas de código huérfano nunca disparado.
- `src/components/modals/ModalHost.tsx` & `src/context/domains/RadarMatrixContext.tsx`: Remoción de importación y estado huérfano de `DynamicFilterDrawer`.
- `src/components/radar/EnRouteBanner.tsx`, `UpcomingEncounterBanner.tsx`, `TravelModeModal.tsx`, `EnRouteTrackerModal.tsx`: Reemplazo de `<button>` ad-hoc por `BrutalistButton` con touch targets ≥44px (Regla 8).
- `src/lib/i18n/translations.ts` & `src/context/domains/RadarMatrixContext.tsx`: Sincronización de copy rioplatense 2026 ("Salidas & Joda Hoy", "Puntos Claros", "Coordinar Cita", "Se mueven / Van a donde estés", "Acá al toque", "Cero plantones", "Pase de Cita", "Limpiar filtros").

## Target Archetypes Impact
- **Mateo (Dev Tech, Palermo, 29)**: Cero micro-stuttering, apertura instantánea de Quick Peek y coordinación de cita en 1 solo tap sin wizards lentos.
- **Facundo (Pibe Fit de Barrio, Lanús, 24)**: Uso mobile seguro con una sola mano en transporte público; ve al instante si el perfil "Pone casa" o "Recibe solo" desde el Quick Peek sin gastar megas.
- **Santi (Raver Queer, 22)**: Sección "Salidas & Joda Hoy" con acceso rápido a fiestas y darkrooms sin terminología fría ni burocracia.
- **Ignacio (Corporativo Discreto, 34) & Bruno (Cruisero Urbano, 27)**: Modo Discreto transparente con foto protegida y cero exposición de dirección exacta (Google S2 Geohash).
