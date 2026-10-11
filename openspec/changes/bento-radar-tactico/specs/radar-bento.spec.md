# Specification: Bento Radar Táctico

## Scenario 1: Quick Peek Bento desde la Grilla
- **GIVEN** que el usuario navega la vista Radar en un dispositivo móvil,
- **WHEN** toca una tarjeta de perfil (`ProfileCard`),
- **THEN** no se dispara un wizard de cita prematuro, sino que se despliega el `ProfileBentoQuickPeek` desde la base de la pantalla,
- **AND** el Quick Peek exhibe las fotos, reproductor de audio de perfil (si existe), ficha de hospedaje (si recibe solo/ducha/ascensor), afinidad de morbos mutuos y dos acciones claras de pie: `[💬 Chatear]` y `[⚡ Coordinar Cita]`.

## Scenario 2: Pacto de Cita en Pantalla Única (Rendezvous Bento)
- **GIVEN** que el usuario decide coordinar un encuentro con un perfil afín,
- **WHEN** presiona el botón "Coordinar Cita ⚡" (en Quick Peek o en la ficha completa),
- **THEN** se abre la hoja de cita en una sola vista Bento compacta sin wizards de 3 pasos,
- **AND** permite seleccionar en un tap: dónde (pongo lugar / ponés lugar / punto medio), cuándo (ya en 30m / hoy a la noche), acuerdos de cuidados (preservativos / PrEP / morbos acordados) y Guardián SOS (toggle rápido),
- **AND** al pulsar "Mandar Propuesta de Cita", envía el ticket con pre-flight checklist al chat del destinatario en una sola acción atómica.

## Scenario 3: Desasfixia y Reordenamiento Lógico del Command Bar
- **GIVEN** que el usuario abre la barra de comandos táctica (`RadarBottomCommandBar`),
- **WHEN** inspecciona los bloques de filtrado,
- **THEN** encuentra en primer lugar el filtro de "Rol y Posición" (Activo, Pasivo, Versátil), seguido de "Distancia Máxima & Modo Viajero", "Logística Clave" (con lugar, cero plantones, verificados 3D), "Criterio de Orden", "Morbos y Fetiches" colapsables y "Clima y Sustancias",
- **AND** el botón de aplicación de filtros y el contador de resultados permanecen siempre visibles y accionables con una sola mano.

## Scenario 4: Erradicación de Código Ad-hoc y Regla 8
- **GIVEN** los banners activos de trayecto (`EnRouteBanner`) y próxima cita (`UpcomingEncounterBanner`),
- **WHEN** se renderizan en la vista del Radar,
- **THEN** todos los elementos interactivos utilizan la primitiva `BrutalistButton` de la biblioteca con áreas táctiles mínimas de 44×44px,
- **AND** `DynamicFilterDrawer.tsx` no existe en el bundle ni en el árbol de hidratación.

## Scenario 5: Localización Vernácula Rioplatense 2026
- **GIVEN** que la app opera en idioma español (`es`),
- **WHEN** el usuario lee los textos de la vista Radar,
- **THEN** no encuentra anglicismos innecesarios ni formalismos fríos,
- **AND** visualiza términos vernáculos auténticos: "Salidas & Joda Hoy", "Puntos Claros", "Coordinar Cita", "Se mueven / Van a donde estés", "Acá al toque", "Cero plantones" y "Pase de Cita".
