# Registro de Decisiones de Arquitectura y Diseño (ADR) — VESSEL (Activo)

Historial cronológico de las decisiones técnicas y de producto vigentes en el ecosistema **VESSEL**.

> [!IMPORTANT]
> **Regla de Guarda Estructural**: Si un requerimiento o ajuste implica un cambio importante (arquitectura, paleta semántica, cambio de framework o borrado de archivos), se DEBE solicitar autorización explícita al usuario antes de ejecutarlo y registrarlo en este documento.

> [!NOTE]
> **Archivo Histórico Completo**: El registro histórico íntegro con más de 120 decisiones arquitectónicas previas (ADR-001 a ADR-123) está preservado en [decisiones-historicas.md](./historico/decisiones-historicas.md).

---

## 🏛️ Decisiones Fundacionales del Sistema

### [ADR-001] · [2026-08-23 14:14] Arquitectura Base y Posicionamiento de Marca
- **Decisión**: Estética berlinesa brutalista de lujo con Next.js 16 (App Router), React 19, Tailwind CSS v4 y Web Audio API para simulación sonora sub-bass (45-80Hz).
- **Motivación**: Crear una experiencia sensorial, táctil e íntima radicalmente distinta de las apps masivas.

### [ADR-002] · [2026-08-23 14:19] Estrategia Cross-Platform & PWA
- **Decisión**: Prototipado web responsive optimizado para PWA con arquitectura adaptable y Service Worker con política Network-First y purga de caché forzada.
- **Motivación**: Máxima velocidad de iteración con base de código compartible hacia tiendas móviles.

### [ADR-004] · [2026-08-23 14:35] Motor de Síntesis Sub-Bass y Estados Corporales
- **Decisión**: Implementación de estados reactivos (`open`, `occupied`, `dormant`) con modulación acústica Web Audio API (`SubBassAudioEngine`) y microinteracciones *Hold-to-Fill*.
- **Motivación**: Comunicación no verbal instantánea y feedback háptico carnal.

### [ADR-007] · [2026-08-23 15:39] Cuotas de Álbumes en Plan Gratuito vs VESSEL UNLIMITED
- **Decisión**: Restricción estricta de 1 galería pública y 1 álbum con llave (privado) para cuentas gratuitas vía `UserAlbumManager`; 99 perfiles libres en matriz.
- **Motivación**: Modelo de sostenibilidad y propuesta de valor de suscripción Premium.

### [ADR-008] · [2026-08-23 15:52] Verificación de Identidad y Avatares Estilizados
- **Decisión**: Protocolo Anti-Bot con OAuth cruzado, liveness 3D facial y opción de avatares artísticos para proteger la privacidad facial pública.
- **Motivación**: Eliminar perfiles falsos sin obligar a exponer el rostro al público general.

### [ADR-010] · [2026-08-23 16:17] Diario de Citas (Date Diary) y Calendario
- **Decisión**: Bitácora personal 100% privada local-first con evaluación de química, satisfacción, seguimiento de vínculos y recordatorios preventivos de PrEP (cada 90 días).
- **Motivación**: Reflexión íntima, autocuidado y salud sexual.

### [ADR-011] · [2026-08-23 16:34] Indexación Google S2 y Motor de Ahorro de Batería
- **Decisión**: Discretización espacial en celdas de ~152m (Google S2 / Geohash 7) y `BatteryStateEngine` de 4 modos dinámicos.
- **Motivación**: Escudo anti-triangulación y optimización del consumo de batería.

### [ADR-016] · [2026-08-23 20:00] Arquitectura i18n y Configuración Global
- **Decisión**: Soporte nativo para Español Rioplatense (`es`) e Inglés (`en`), sistema métrico/imperial y Cloud Sync E2E.
- **Motivación**: Expansión internacional y adaptabilidad del usuario.

---

## ⚡ Decisiones Activas del Sprint Actual (Octubre 2026)

### [ADR-124] · [2026-10-04 14:35] Rediseño de Flujos Centrado en el Usuario (De-Grindrización de VESSEL: Radar de Sintonía, Tríada de Compatibilidad y Doble Consentimiento Action-First)
- **Decisión**:
  1. Reemplazo de StatusToggle por IntentHubSelector con 4 modos operativos excluyentes (`now`, `nightlife`, `kink`, `stealth`) y gatillo 'Listo YA' (45 min, sub-bass 55Hz).
  2. Racimos de Intención en la Matriz (`ProfileGrid.tsx`) eliminando la cuadrícula euclidiana monótona.
  3. Tríada de Compatibilidad en Tarjeta de Perfil (`ProfileCard.tsx`): micro-ficha de hospedaje, badges de Pre-Flight y botón primario 'Sintonizar'.
  4. Doble Consentimiento Obligatorio en Zumbidos/Pulsos (`PulseCard.tsx`) y fijación de dinámicas acordadas en chat.
- **Motivación**: Superar el modelo mental de compras por dopamina visual heredado de Grindr, priorizando encuentros seguros y sin fricción.

### [ADR-125] · [2026-10-04 15:20] Rediseño Táctico Zen (Progressive Disclosure Radical) & Vernáculo Rioplatense Queer 2026
- **Decisión**:
  1. Progressive Disclosure en 3 Niveles: Nivel 1 (Radar y Tarjeta Zen con exactamente 1 botón de acción), Nivel 2 (Dossier Profundo en modal), Nivel 3 (Pacto previo en chat).
  2. Cabecera Zen con cápsula de usuario de 44px (`BrutalistHeader.tsx`).
  3. Localización Rioplatense Queer 2026 en todo el sistema ("Zumbidos", "Agenda", "Radar", "Pone Lugar", "0% Fantasmas", "Morbos y Fetiches").
- **Motivación**: Erradicar la sobrecarga sensorial e informativa y conectar auténticamente con la comunidad LGBT+ argentina.

### [ADR-126] · [2026-10-06 23:20] Centro Táctico Unificado de Filtros Fullscreen (Cero Scroll Horizontal) y Estandarización de Biblioteca Atómica UX
- **Decisión**:
  1. Ventana Flotante de Filtros 100% Fullscreen (`TacticalBottomSheet.tsx`) con scroll estrictamente vertical y sticky header/footer.
  2. Erradicación total de `overflow-x-auto` en la barra de comandos y estructuración en 7 bloques numerados.
  3. Estandarización obligatoria en biblioteca de componentes (`@/components/ui/`): creación de `SegmentedTabGroup`, extensión de `BrutalistButton` y `TacticalBadge`.
- **Motivación**: Consistencia ergonómica y eliminación de fricción táctil en pantallas móviles.

### [ADR-127] · [2026-10-07 00:30] Refinamiento Ergonómico, Desenrollado de Filtros de Primer Nivel y Aislamiento de Gestos Táctiles en App Shell 2.0
- **Decisión**:
  1. Aislamiento estricto de swipe-down de cierre confinado exclusivamente a la manija de arrastre; scroll vertical interno 100% libre de interferencias.
  2. Poda del botón redundante "Avanzados" y títulos de bloques claros en lenguaje común.
  3. Rediseño del criterio de orden a ancho completo con `SortSegmentedControl.tsx` y desenrollado de morbos, sustancias y distancia sin acordeón colapsable.
- **Motivación**: Respetar las leyes de Fitts y Hick en dispositivos móviles de 360-414px.

### [ADR-128] · [2026-10-07 01:45] Estandarización de la Vista Toques: Primitivas UI, Respuesta In-Place sin Bouncing, Guarda Antiborrado y Vernáculo Rioplatense 2026
- **Decisión**:
  1. Estandarización 100% en biblioteca (`@/components/ui/`): selector con `SegmentedTabGroup`, botones `BrutalistButton`, insignias `TacticalBadge`.
  2. Erradicación de bouncing UX: respuesta in-place en la tarjeta con síntesis sub-bass (60Hz) sin expulsar forzosamente al usuario al chat.
  3. Guarda de seguridad antiborrado con `BrutalistModal` para `clearAllReadPulses`.
  4. Vernáculo rioplatense 2026 ("Devolver toque ⚡", "Coordinar cita", "Paso, che").
- **Motivación**: Cumplir la Regla 8 y agilizar el triage de toques con una sola mano.

### [ADR-129] · [2026-10-07 02:15] Reingeniería Modular de la Vista Chat: Descomposición de Monolito, Estandarización en Biblioteca UI y Localización Rioplatense 2026
- **Decisión**:
  1. Descomposición del monolito `DarkroomChatModal.tsx` en 5 submódulos atómicos testeables (`ChatHeader`, `ChatTacticalMenu`, `ChatMessageItem`, `ChatMessageStream`, `ChatQuickActionBar`, `ChatInputBar`).
  2. Erradicación de nested interactive controls (separación de botón de avatar de botón de chat para accesibilidad WCAG).
  3. Estandarización con `SegmentedTabGroup`, `TacticalAvatar`, `BrutalistButton`.
  4. Localización rioplatense 2026 ("Cierre tranqui ✌️ (Cero ghosting)", "Tienen lugar 🏠", "Foto de 1 sola vista").
- **Motivación**: Eliminar cuellos de botella de re-render en tipeo en dispositivos móviles y modularizar la arquitectura de chat.

### [ADR-130] · [2026-10-07 02:28] Estandarización Integral de la Ventana de Asistente de Encuentro (RendezvousSheet), Modo Express (1 Toque) y Persistencia SOS Local
- **Decisión**:
  1. Estandarización 100% en biblioteca UI (`SegmentedTabGroup`, `TacticalAvatar`, `BrutalistButton`, `BrutalistInput`).
  2. Incorporación de "Modo Express (1 Toque)" para agendar cita inmediata (+30m) sin pasar por 3 pasos si los datos ya están configurados.
  3. Eliminación de PIN SOS hardcodeado; persistencia local del contacto SOS y PIN en el dispositivo (zero re-typing).
- **Motivación**: Elevar la seguridad física y agilizar la coordinación espontánea de encuentros.

### [ADR-131] · [2026-10-07 02:35] Invariante de Versionado Obligatorio al Subir a Main, Purga Forzada de Caché en Clientes y Telemetría en Admin
- **Decisión**:
  1. Invariante formal: actualización mandatoria de versión del sistema (`systemVersion.ts`, `sw.js`, `package.json` vía `npm run version:sync`) en cada push a `main`.
  2. Forzado inmediato en navegadores: comparación de versión y `buildTimestamp` con invalidación de CacheStorage y reload reactivo.
  3. Telemetría en `/admin` en pestaña "Versión & Despliegues".
- **Motivación**: Garantizar que ningún usuario navegue código obsoleto o desincronizado con el backend.

### [ADR-132] · [2026-10-07 02:45] Rediseño Táctico Unificado de 'Mi Perfil' (Alternativa B), Live Hero Card y Primitivas BrutalistSwitch y BrutalistSelect
- **Decisión**:
  1. Arquitectura táctica unificada: eliminación de selector "Fácil vs Avanzado", integración con Live Hero Card WYSIWYG.
  2. 4 solapas tácticas directas (`BioTab`, `AlbumsTab`, `LogisticsTab`, `BoundariesTab`).
  3. Creación de nuevas primitivas oficiales `BrutalistSwitch.tsx` y `BrutalistSelect.tsx` (Regla #8).
- **Motivación**: Eliminar saltos cognitivos y previsualizar en tiempo real el perfil propio.

### [ADR-133] · [2026-10-07 03:00] Integración Inline de '¿Cómo es mi casa?' y Reingeniería Táctica del Gestor de Álbumes (Alternativa 1)
- **Decisión**:
  1. Integración in-place de la logística de vivienda en `LogisticsTab.tsx` eliminando `HostCardModal`.
  2. Supresión definitiva de banda sonora y clima acústico por sobrecarga innecesaria.
  3. Erradicación del término confuso "bóveda" por "Fotos & Álbumes" y "Álbum con Llave 🔑".
  4. Selector de filtrado con `SegmentedTabGroup` en `UserAlbumManager.tsx`.
- **Motivación**: Cargar la logística hogareña sin ventanas emergentes y clarificar la privacidad de álbumes.

### [ADR-134] · [2026-10-07 14:40] Reubicación de Configuración de la App en Píldora Superior y Desacoplamiento de Modales con React Portal (z-[70])
- **Decisión**:
  1. Integración de Configuración de la App en el menú de usuario de `BrutalistHeader.tsx`.
  2. Desacoplamiento estructural de modales con `createPortal(..., document.body)` a `z-[70]`, erradicando el atrapamiento en Stacking Context de animaciones CSS.
- **Motivación**: Resolver el bug de modales tapados por solapas fijas y centralizar la configuración.

### [ADR-136] · [2026-10-07 15:35] Integración Nativa de Ajustes de Sesión y App en Pestañas de Mi Perfil y Agrupación de Controles Beta/Prueba en Píldora Superior
- **Decisión**:
  1. Erradicación de modales fragmentados; opciones reubicadas naturalmente en `BioTab.tsx` (preferencias de idioma y unidades) y `BoundariesTab.tsx` (sesión, audio, nube, backups).
  2. Creación de `TestEnvironmentMenuSection.tsx` en la píldora superior para aislar controles de prueba de la experiencia de usuario final.
- **Motivación**: Eliminar ventanas emergentes para la gestión del perfil propio.

### [ADR-137] · [2026-10-07 16:45] Auditoría Integral Mobile-First: Poda de Código Muerto, Optimización de Rendimiento O(1), Estandarización de Primitivas UI y Saneamiento de Tokens
- **Decisión**:
  1. Eliminación física de `EasyProfileCardView.tsx` (637 LOC huérfanas) y blindaje de timer parásito en cabecera.
  2. Optimización de búsqueda en `ProfileGrid.tsx` precomputando mapa de perfiles en $O(1)$.
  3. Estandarización con `BrutalistButton` y `BrutalistInput` en modales restantes; targets táctiles $\ge 44\text{px}$.
  4. Saneamiento de tokens hex arbitrarios por `bg-obsidian-surface`.
- **Motivación**: Garantizar 60 FPS y consumo mínimo de batería en dispositivos móviles de gama de entrada en Argentina.

### [ADR-138] · [2026-10-07 17:45] Jerarquía Estricta de Stacking Context: Elevación de DarkroomChatModal (z-[60]) y Estandarización de Capa de Modales (z-[70])
- **Decisión**:
  1. `DarkroomChatModal.tsx` y `ProfileDetailModal.tsx` elevados a `z-[60]` para cubrir `BrutalistHeader` (`z-50`), revelando `ChatHeader` sin solapamiento.
  2. Diálogos y modales secundarios estandarizados en `z-[70]`.
- **Motivación**: Corregir la oclusión visual de la cabecera de chat provocada por colisión de stacking context.

### [ADR-139] · [2026-10-07 19:00] Refactor Modular Ergonómico In-Place de Mi Perfil (Alternativa A) y Cumplimiento Estricto de Invariante 8
- **Decisión**:
  1. Captura directa de foto de portada en 1 tap con `CoverPhotoSelectorModal.tsx` (`capture="user"`).
  2. Sincronización bidireccional entre `myProfile.mobility` y `myHostCard.hasPlace` entre pestañas `BioTab` y `LogisticsTab`.
  3. Erradicación del 100% de controles ad-hoc en los 8 submódulos de Mi Perfil hacia la biblioteca común (`BrutalistButton`, `BrutalistSwitch`, `SegmentedTabGroup`).
  4. Microcopias rioplatenses 2026 ("Modo Cuidado SOS", "Pongo casa", "Álbum señuelo").
- **Motivación**: Eliminar fricciones en la edición de perfil en mobile y garantizar la estandarización absoluta con la biblioteca del design system.

### [ADR-140] · [2026-10-08 00:45] Reingeniería Bento Hub Táctico de Mi Perfil: Desacoplamiento Estricto de Ajustes de Sistema, Hero Bento Compacto con Medidor de Completitud y Action Sheet de Portada (FEAT-179)
- **Decisión**:
  1. Separación rigurosa de dominios: erradicación total de configuraciones de sistema (audio analógico sub-bass, sincronización en la nube, backups JSON, purga de datos, sesión Google, idioma y unidades de medida) de las solapas de `BioTab.tsx` y `BoundariesTab.tsx`. Todos estos controles quedan centralizados exclusivamente en `AppSettingsModal.tsx`.
  2. Hero Bento Compacto en `ProtocolView.tsx`: reducción ergonómica del avatar (80x112px en mobile), medidor reactivo de completitud táctica de perfil (0–100%), indicador de estado en tiempo real ("En línea y con ganas" vs "Modo Sigilo") y contenedor bento con división táctica para Niebla y Vibe de Voz 5s.
  3. Action Sheet Directo para Portada (`CoverPhotoSelectorModal.tsx`): captura en 1 tap con cámara (`capture="user"`), carga desde galería WebP y selección directa de fotos públicas existentes sin salir del modal ni conmutar a la solapa de fotos.
  4. Actualización del lenguaje a Rioplatense contemporáneo 2026 enfocado en usuarios de 20 a 35 años ("Tus Álbumes", "Comodidades del depto", "Cosas a mano en casa", "Límites y despedida sin drama", "Karma & Cero Plantones", "Botón de Auxilio (SOS)").
- **Motivación**: Eliminar la sobrecarga cognitiva y duplicación de código en la edición del perfil de usuario, garantizar objetivos táctiles $\ge 44\text{px}$ en el Thumb Zone y brindar una experiencia fluida sin bifurcaciones innecesarias.

### [ADR-141] · [2026-10-08 02:15] Reingeniería Bento Radar Táctico Mobile (Alternativa 2 - Opción A: Bento Puro): Tarjeta Limpia, Cabecera Compacta a 36px con Scroll, Billboard Colapsable y Coordinación Single-Screen (FEAT-180)
- **Decisión**:
  1. Grilla y Bento Quick Peek (`ProfileBentoQuickPeek.tsx`): Poda integral de la franja pesada de botones inferiores (`TIRAR ONDA` y favoritos) en la tarjeta (`ProfileCard.tsx`) para erradicar toques accidentales y maximizar la visibilidad de la foto. El tap en cualquier parte de la tarjeta abre el Quick Peek flotante con fotos HD, reproductor `VoiceVibePlayer`, logística de hospedaje, morbos compartidos y botones de acción tácticos (`Chatear`, `Coordinar Cita`, `Tirar Onda` y `Guardar Favorito`). Botón sutil de favoritos integrado en la esquina superior derecha junto a `TelemetryPill`.
  2. Cabecera Compacta a 36px con Scroll (`BrutalistHeader.tsx` & `page.tsx`): Al hacer scroll hacia abajo, la cabecera se compacta dinámicamente a 36px mostrando `BENTO RADAR // [ZONA]` y acceso rápido a filtros `[ ⚡ Filtros (N) ]`, liberando el 90% del viewport para los perfiles.
  3. Barra Superior del Radar y Bento Billboard Colapsable (`ProfileGrid.tsx`): Montaje en primer nivel del sub-header de zona con trigger de filtros y el cartel interactivo colapsable `🍸 SALIDAS & JODA HOY: [Evento] (Darkroom activo)` con acceso a la agenda y botón de cierre táctico.
  4. Barra de Comandos del Radar (`RadarBottomCommandBar.tsx`): Sincronización bidireccional con `isFilterDrawerOpen` para apertura atómica desde cualquier disparador, y reordenamiento en 6 bloques jerárquicos con catálogo de morbos colapsable (-600px de scroll).
  5. Coordinación de Cita Single-Screen (`RendezvousSheet.tsx`): Sustitución del wizard secuencial de 3 pasos por un formulario Bento táctico en pantalla única (Lugar, Horario, Puntos Claros, Guardián SOS) con botón de despacho atómico ("Confirmar y Blindar Encuentro 🔥" / "Mandar Propuesta de Cita ⚡").
  6. Higiene, Regla 8 y Localización: Poda de 690 LOC de `DynamicFilterDrawer.tsx`, migración total a `BrutalistButton` ($\ge 44\text{px}$) y homogeneización en español rioplatense contemporáneo 2026.
- **Motivación**: Erradicar los cuellos de botella de fricción y el scroll infinito en mobile, evitar toques involuntarios, acelerar la coordinación segura de encuentros y consolidar la biblioteca de diseño con lenguaje rioplatense contemporáneo.

### [ADR-142] · [2026-10-09 19:25] Mandato de Arquitectura 2026: Hooks Atómicos Granulares, Rutas Reales de App Router y Offloading del Main Thread (FEAT-185)
- **Decisión**:
  1. **Erradicación Definitiva de `useVessel`**: Prohibición de monolitos en Context API. Todo componente debe consumir exclusivamente hooks atómicos por dominio (`useAuth`, `useRadarMatrix`, `useChat`, etc.). Componentes densos (`ProfileCard`) desacoplados con props memorizadas (`PureProfileCard`).
  2. **App Router Real de Next.js 16**: Sustitución de vistas SPA encapsuladas en `useState(activeView)` por rutas reales (`/radar`, `/pulses`, `/chat`, `/diary`, `/account`) bajo `AppShell.tsx`, con navegación vía `useRouter().push()` y `startViewTransition` nativo, habilitando deep-linking e historial del navegador.
  3. **Protección del Main Thread y Optimización de Assets**:
     - Formatos AVIF/WebP adaptativos en Next Image con fallback seguro en desarrollo local.
     - Web Workers dedicados (`proximityWorkerClient.ts`) para cálculos masivos Haversine y proximidad del radar en background.
     - Desacople de I/O pesada y sincronizaciones desde `localStorage` hacia IndexedDB (`offlineMutationQueue.ts`), protegiendo la métrica INP y la síntesis acústica de `SubBassAudioEngine`.
### [ADR-143] · [2026-10-09 20:30] Síntesis AudioWorklet en Hilo de Audio, Háptica Contextual y Aceleración de Pruebas con `vmThreads` (FEAT-186)
- **Decisión**:
  1. **AudioWorklet de Síntesis Sub-Bass**: Migración de la generación de ondas senoidales analógicas (45-80Hz) hacia un hilo de renderizado de audio dedicado (`SubBassWorkletProcessor` en `public/audio-processors/sub-bass-processor.js`), desacoplando el motor sonoro del bucle de eventos de JavaScript y garantizando cero jitter auditivo en scroll rápido. Fallback transparente a osciladores nativos en entornos sin soporte.
  2. **Envelopes Hápticos Contextuales**: Sincronización de vibración táctil con la fase ascendente del oscilador sub-bass según tipo de evento: Pulso Leve `[12]`, Cita Inminente `[20, 40, 20]` y Alerta de Seguridad `[40, 60, 80]`.
  3. **Aceleración de Vitest vía `vmThreads`**: Configuración de `pool: 'vmThreads'` en `vitest.config.mts`, permitiendo aislar suites de pruebas mediante contextos de máquinas virtuales de Node y reutilizar la inicialización de Happy-DOM. La suite completa (537 tests en 87 archivos) se redujo de ~12.0s a **3.8s** sin advertencias de entorno.
  4. **Retención de Webpack en Dev**: Preservación explícita de `next dev --webpack` en `package.json` tras comprobar que el motor Rust de Turbopack en Next.js 16 colisiona con `@tailwindcss/postcss` v4 (Error Conocido #19).
### [ADR-144] · [2026-10-09 23:00] Desacoplamiento de ModalHost, Dominio Canónico de Movilidad y Blindaje Multidimensional v2.7.0 (FEAT-188)
- **Decisión**:
  1. **Sub-hosts de Modales Desacoplados por Dominio**: Reemplazo de la suscripción monolítica de 7 contextos en `ModalHost.tsx` por 7 sub-hosts memoizados (`RadarModalHost`, `ChatModalHost`, `AuthModalHost`, `SafetyModalHost`, `LogisticsModalHost`, `SettingsModalHost`, `DiaryModalHost`). Cada sub-host solo escucha a su propio contexto, aislando las mutaciones de alta frecuencia (mensajes de chat o ticks de geolocalización) del resto del árbol de overlays.
  2. **Módulo Canónico de Movilidad (`src/lib/geo/mobility.ts`)**: Introducción de `CanonicalMobilityKey` ("host_only" | "travel_only" | "host_and_travel" | "club_cruising" | "unspecified") y funciones puras (`normalizeMobilityKey`, `hasHostingCapability`, `canTravel`, `isInClubOrCruising`), eliminando expresiones regulares ad-hoc y divergencias entre componentes.
  3. **Blindaje de Seguridad y Erradicación de Fugas**: Validación estricta de `request.auth.token.email_verified == true` en `isAdmin()` (`firestore.rules`), eliminación de `process.env.NEXT_PUBLIC_ADMIN_PASSCODE` para impedir filtraciones en bundles de cliente, y tipado estricto en restauraciones de agenda (`ProfileDossier`).
  4. **Protección del Main Thread y Semántica Accesible**: Eliminación de `framer-motion` en `ProfileCard.tsx` (reemplazado por CSS transforms), delegado del cálculo Haversine a Web Worker en segundo plano, títulos semánticos `<h3>` en perfiles para lectores de pantalla y desasfixia de `user-select: text` para párrafos, notas y mensajes en `globals.css`.
- **Motivación**: Cumplir con la totalidad de los hallazgos y prioridades (P0 a P3) de la Auditoría Técnica Multidimensional de VESSEL (v2.7.0), erradicando re-renders parásitos en la grilla y garantizando una base de código robusta, accesible y testeada al 100%.




