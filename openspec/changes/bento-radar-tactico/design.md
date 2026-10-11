# Technical Design: Bento Radar Táctico

## Architecture Overview
La arquitectura de "Bento Radar Táctico" resuelve la sobrecarga cognitiva y la asfixia del viewport en mobile mediante tres intervenciones nucleares:

1. **Separación de Responsabilidades en el Descubrimiento (`ProfileCard` vs `ProfileBentoQuickPeek` vs `ProfileDetailModal`):**
   - `ProfileCard`: Responsabilidad única de escaneo visual rápido. Muestra foto full-bleed, telemetría S2, rol, badges clave y acciones cinéticas en 1 toque (⚡ Toque de rol con feedback háptico y ★ Favoritos). Se elimina el botón de coordinación directa para prevenir toques accidentales y compromiso prematuro.
   - `ProfileBentoQuickPeek`: Hoja Bento singleton montada en `ProfileGrid`. Se despliega al tocar la tarjeta. Ofrece un resumen enriquecido en 3 segundos (3 fotos en carrusel, audio de voz 5s, ficha de hospedaje, morbos mutuos) con dos botones de acción de 48px: `[💬 Chatear]` y `[⚡ Coordinar Cita]`, más la opción de expandir a la Ficha Completa (`ProfileDetailModal`).
   - `ProfileDetailModal`: Conserva la ficha analítica completa (Dossier, Testimonios, Bóveda Privada, Ajuste de Límites).

2. **Reingeniería de `RendezvousSheet` a Bento Single-Screen:**
   - Se reemplaza el estado `currentStep: 1 | 2 | 3` por una vista monolítica modular en 4 módulos Bento interconectados:
     - Bento A (Lugar): Selector segmentado `[Pongo casa 🏠] [Ponés casa 🚗] [Punto medio 📍]`.
     - Bento B (Tiempo): Chips rápidos de hora `[Ya en 30m ⚡] [Hoy 22:00 🌙] [Tarde 01:00 🔥] [Otra hora 🕒]`.
     - Bento C (Puntos Claros): Chips rápidos de cuidados (Preservativos, Bareback/PrEP, Oral, Masajes).
     - Bento D (Guardián SOS): Switch directo para activar Guardián de seguridad con temporizador predeterminado (60m) sin obligar a llenar números de teléfono cada vez.
   - Acción al pie: `BrutalistButton` primario "Mandar Propuesta de Cita ⚡".

3. **Reorganización Ergonómica de `RadarBottomCommandBar`:**
   - Jerarquía basada en frecuencia de uso real:
     - Bloque 1: Rol Táctico (Activo, Pasivo, Versátil, etc.).
     - Bloque 2: Distancia Máxima (Slider 0.5km - 20km) + Acceso a Modo Viajero.
     - Bloque 3: Logística y Preferencias (Con lugar, Cero plantones, Verificados 3D, Favoritos, Morbos mutuos).
     - Bloque 4: Criterio de Ordenamiento (Cerca, Activos, Afinidad).
     - Bloque 5: Morbos y Fetiches (Acordeón colapsable con buscador para evitar scroll kilométrico).
     - Bloque 6: Clima y Sustancias (Reducción de daños).

4. **Poda y Cumplimiento de la Regla 8:**
   - Eliminación física de `src/components/filters/DynamicFilterDrawer.tsx`.
   - Normalización de banners y modales (`EnRouteBanner`, `UpcomingEncounterBanner`, `TravelModeModal`, `EnRouteTrackerModal`) con primitivas `BrutalistButton`.
