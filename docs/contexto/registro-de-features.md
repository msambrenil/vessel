# Registro de Features, Entregas y Control de Estado — Sistema VESSEL
*(Feature Ledger & Release Tracker — Sprint Activo)*

Este documento constituye la **fuente única de verdad (Single Source of Truth)** sobre las características, soluciones y refactors del **sprint activo**.

> [!NOTE]
> **Archivo Histórico Completo**: El inventario histórico íntegro con más de 178 entregas anteriores (BASE-001 a FEAT-178) está preservado en [registro-de-features-historico.md](./historico/registro-de-features-historico.md).

---

## 📌 Estándar Operativo de Registro (SOP)

Cada vez que se implemente una nueva característica o fix relevante en el sprint activo, agregar una entrada formal con:
- **ID y Fecha**
- **Tipo y Módulo**
- **Estado Actual y Descripción**
- **Componentes y Archivos Clave**
- **Criterios de Aceptación & Verificación (DoD)**

---

## 📊 Matriz Resumen del Sprint Activo

| **FEAT-188** | 2026-10-09 | `ModalHost.tsx`, `mobility.ts`, `ProfileCard.tsx`, `RadarMatrixContext.tsx`, `ChatContext.tsx`, `firestore.rules`, `globals.css`, `vitest.config.mts` | Ejecución Total de la Auditoría Técnica Multidimensional v2.7.0: Desacoplamiento de ModalHost en sub-hosts atómicos por dominio, arquitectura canónica de movilidad (cero regex ad-hoc), Web Worker off-main-thread en Radar, erradicación de framer-motion en cards, blindaje isAdmin() con email_verified, ampliación de cobertura Vitest y semántica accesible (h3 + user-select) | **100%** ✅ |
| **FEAT-187** | 2026-10-09 | `verify-passcode/route.ts`, `AdminAuthGuard.tsx`, `ProfileCard.tsx`, `ProfileGrid.tsx`, `QuickShareQrModal.tsx`, `BrutalistButton.tsx`, `PlacesGrid.tsx`, `authService.ts`, `diaryBackupCrypto.ts` | Aplicación Integral de Auditoría Técnica Multidimensional: Hardening criptográfico (timingSafeEqual + rate limiting), validación segura de sesión en Admin con expiración, erradicación total de `any` en `src/`, carga diferida (lazy mounting) de modales pesados en reposo, expansión ergonómica de touch targets en botones (WCAG 2.5.5) y roles ARIA en sub-modales | **100%** ✅ |
| **FEAT-186** | 2026-10-09 | `SubBassAudioEngine`, `sub-bass-processor.js`, `vitest.config.mts`, `localStorageSync`, `AppShell`, `package.json` | Modernización 2026 (Fases 4 y 5) & Corrección de Hidratación SSR: AudioWorklet multihilo de baja latencia con fallback y háptica táctica contextual, optimización Vitest con `vmThreads` (3.8s suite), y solución de asimetría de entorno local en SSR | **100%** ✅ |
| **FEAT-185** | 2026-10-09 | `ProfileCard`, `ProfileGrid`, `RadarMatrixContext`, `offlineMutationQueue`, `localStorageSync`, `globals.css`, `next.config.ts`, `ProtocolView` | Modernización Arquitectónica 2026: Desacoplamiento de renderizado puro (`PureProfileCard`), eliminación de cascadas de contexto, optimización responsiva Next/Image (AVIF/WebP + blur), persistencia pesada asíncrona en IndexedDB, navegación con View Transitions API y deep linking con historial nativo | **100%** ✅ |
| **FEAT-184** | 2026-10-09 | `BrutalistModal`, `BrutalistTextarea`, `BrutalistSelect`, `BrutalistSwitch`, `TacticalAvatar`, `TacticalMenuItem`, `DarkroomListView`, `ProfileCard`, `ChatTacticalMenu` | Estandarización Universal de Componentes de Usuario (Fases 1 a 4): Erradicación de elementos ad-hoc, adopción obligatoria de biblioteca (`@/components/ui/`), 15 modales tácticos unificados, switches, selects, textareas y botones brutalistas | **100%** ✅ |
| **FEAT-183** | 2026-10-09 | `SafetyContext`, `LogisticsContext`, `ModalHost`, `RendezvousSheet`, `IdentityVerificationModal`, `systemVersion` | Poda Táctica del Core: Extirpación de 7 módulos satélite redundantes (Alerta Trago Adulterado, Baliza Óptica, Wingman AI, Conexiones Perdidas, After Hours, Dead-Man Switch y Avatares de Catálogo), desasfixia arquitectónica y versión v2.7.0 | **100%** ✅ |
| **FEAT-182** | 2026-10-09 | `DateDiaryView`, `DiaryEntryCard`, `translations` | Mi Agenda: Arquitectura de 3 Pestañas Cronológicas (Próximas | Historial | Salud & Doxy) + Bento Card de Métricas & Química, Erradicación de Redundancias y Calibración Rioplatense 2026 | **100%** ✅ |
| **FEAT-181** | 2026-10-08 | `ProfileGrid`, `ProfileCard`, `BrutalistHeader`, `RadarBottomCommandBar`, `translations` | Radar Táctico Zen (Alternativa A): Switcher 1-tap Gente/Boliches, carrusel de filtros rápidos horizontal en thumb-zone, toque rápido 1-tap directo en cards, desasfixia vertical mobile | **100%** ✅ |
| **FIX-046** | 2026-10-08 | `ChatContext`, `RadarMatrixContext`, `SafetyContext`, `SubBassAudioEngine`, `BrutalistHeader` | Corrección de error de concurrencia React 19: extracción de efectos secundarios de audio de updaters de estado y desacoplamiento con `queueMicrotask` | **100%** ✅ |
| **FEAT-180** | 2026-10-08 | `ProfileBentoQuickPeek`, `ProfileCard`, `RadarBottomCommandBar`, `RendezvousSheet`, `translations` | Bento Radar Táctico: Quick Peek Bento 1-Tap desde Grilla, Command Bar ergonómico con morbos colapsables, coordinación single-screen | **100%** ✅ |
| **FEAT-179** | 2026-10-08 | `ProtocolView`, `BioTab`, `BoundariesTab`, `LogisticsTab`, `CoverPhotoSelectorModal` | Reingeniería Bento Hub de Mi Perfil: Separación de Identidad vs Ajustes, Hero Bento compacto con medidor de completitud, selector 1-tap | **100%** ✅ |

---

### [FEAT-188] · [2026-10-09] Ejecución Total de la Auditoría Técnica Multidimensional & Arquitectónica v2.7.0
- **Tipo**: `Architecture Refactor (P2)`, `Performance & Web Workers (P1)`, `Security Hardening (P0)`, `DX & a11y (P3)`
- **Módulo / Eje**: `Modals Architecture`, `Geospatial Mobility`, `Core Web Vitals`, `Testing Suite & a11y`
- **Estado Actual**: `100% — Completado & Verificado (553/553 Tests en Verde, 0 Errores de Tipos)`
- **Descripción**:
  1. **Seguridad y Cierre de Brechas (P0)**:
     - En `firestore.rules`: agregada verificación obligatoria de `request.auth.token.email_verified == true` en `isAdmin()` para neutralizar usurpación de privilegios de administrador mediante cuentas no verificadas.
     - En `adminService.ts` y API routes: retirada definitiva del fallback a `process.env.NEXT_PUBLIC_ADMIN_PASSCODE` para impedir la exposición accidental de claves maestras en bundles del cliente.
     - En `DiaryContext.tsx`: tipado estricto eliminando `Record<string, any>` a favor de `Record<string, Partial<ProfileDossier>>` y validación en tiempo de ejecución al restaurar copias de seguridad.
  2. **Rendimiento Crítico & Protección del Main Thread (P1)**:
     - En `ProfileCard.tsx`: erradicación completa de `framer-motion` a favor de CSS transforms acelerados por hardware en Tailwind CSS v4 (`transition-transform duration-200`, `active:scale-125`), reduciendo el costo de reconciliación en la grilla del radar.
     - En `RadarMatrixContext.tsx`: desacople de `myCoordinates` de la suscripción en tiempo real de Firestore (evitando reintegros continuos de listeners ante fluctuaciones del GPS) y delegación del cálculo Haversine al Web Worker en segundo plano `proximityWorkerClient.ts`.
     - En `ChatContext.tsx` y `BrutalistNav.tsx`: agregado del selector atómico y memorizado `unreadMessagesCount: number` para eliminar la iteración O(N) de todo el diccionario de mensajes en la barra de navegación.
  3. **Arquitectura de Estado & Desacoplamiento de Modales (P2)**:
     - En `ModalHost.tsx`: particionado en 7 sub-hosts memoizados por dominio (`RadarModalHost`, `ChatModalHost`, `AuthModalHost`, `SafetyModalHost`, `LogisticsModalHost`, `SettingsModalHost`, `DiaryModalHost`), asegurando que mutaciones de alta frecuencia (mensajes de chat o ticks GPS) no causen re-renders en cascada de los demás modales del sistema.
     - En `src/lib/geo/mobility.ts`: creación del módulo canónico de movilidad con uniones tipadas (`CanonicalMobilityKey`), normalización resiliente (`normalizeMobilityKey`) y helpers universales (`hasHostingCapability`, `canTravel`, `isInClubOrCruising`), eliminando expresiones regulares ad-hoc inconsistentes en 7 componentes.
  4. **DX, Accesibilidad & Suite de Pruebas (P3)**:
     - En `vitest.config.mts`: ampliación de cobertura para supervisar `src/lib`, `src/context` y `src/components`.
     - En `ProfileCard.tsx`: adopción de encabezados semánticos `<h3>` para nombres de perfil, habilitando navegación jerárquica por voz/lectores de pantalla en la grilla.
     - En `globals.css`: habilitación de selección de texto (`user-select: text`) en párrafos, inputs, articulos y notas, preservando el comportamiento no-seleccionable exclusivamente en controles táctiles.
- **Componentes y Archivos Clave**:
  - `src/components/modals/ModalHost.tsx`
  - `src/lib/geo/mobility.ts`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/context/domains/ChatContext.tsx`
  - `src/app/globals.css`
  - `vitest.config.mts`
  - `tests/unit/geo/mobility.test.ts`
- **Criterios de Aceptación (DoD)**:
  - 100% de la suite de pruebas unitarias en verde (90 suites, 553 tests).
  - Cero errores de compilación estricta de TypeScript (`npm run typecheck`).
  - Cero cascada de renders en `ModalHost` al emitir mensajes de chat o actualizar coordenadas.

---

### [FEAT-187] · [2026-10-09] Aplicación Integral de Auditoría Técnica Multidimensional: Hardening Admin, Cero `any`, Montaje Lazy de Modales y Accesibilidad WCAG 2.5.5
- **Tipo**: `Security Hardening (P0)`, `Code Quality & Strict Types (P1)`, `Performance & Lazy Mounting (P1)`, `Accessibility WCAG (P2)`
- **Módulo / Eje**: `Admin API & Guard`, `Type System`, `Modals & Shell`, `Design System & Buttons`
- **Estado Actual**: `100% — Completado & Verificado (545/545 Tests en Verde, 0 Errores de Tipos)`
- **Descripción**:
  1. **Seguridad y Hardening en Consola Administrativa (P0)**:
     - En `src/app/api/admin/verify-passcode/route.ts`: sustitución de la comparación simple `===` por `crypto.timingSafeEqual` con buffers para neutralizar ataques de temporización (Timing Attacks). Incorporación de rate limiting en memoria (10 intentos fallidos por ventana de 5 minutos) contra ataques de fuerza bruta.
     - En `src/components/admin/AdminAuthGuard.tsx`: erradicación de la verificación insegura por string plano (`"authorized"`). Adopción de `AdminSessionPayload` con timestamp y expiración forzada de 2 horas (`ADMIN_SESSION_MAX_AGE_MS`).
  2. **Erradicación Total de `any` & Tipado Estricto de Dominio (P1)**:
     - En `src/components/matrix/ProfileCard.tsx` y `ProfileGrid.tsx`: tipado estricto de `mutualMatches` como `readonly KinkMutualMatch[]` y `STATIC_EMPTY_MATCHES` inmutable.
     - En `src/lib/firebase/authService.ts`: eliminación de `as any` en perfiles por defecto, empleando uniones discriminadas (`RoleType`, `YoSoyType`, `MobilityType`, `HivStatusType`).
     - En `src/lib/security/diaryBackupCrypto.ts`: adopción estricta de `BufferSource` en Web Crypto API para salt, iv y ciphertext.
     - En `src/types/vessel.ts` y `PlacesGrid.tsx`: agregado de `computedDistance?: number` a `TacticalHotspot` eliminando casts inseguros.
     - En `src/context/domains/AuthContext.tsx` y `RadarMatrixContext.tsx`: agregado de `substanceAtmosphere` a `MyProfileState`, permitiendo llamadas 100% tipadas a `updateMyProfile`.
     - Deprecación formal de `useVessel()` con advertencia explicativa apuntando a los 7 hooks de dominio.
  3. **Optimización de Rendimiento & Montaje Lazy (P1)**:
     - En `src/components/profile/QuickShareQrModal.tsx`: desacoplamiento entre el trigger ligero y el contenido (`QuickShareQrModalContent`). Cuando el modal está cerrado, no se evalúan los hooks de 4 dominios (`useAuth`, `useRadarMatrix`, `useChat`, `useSettings`) ni se calcula la matriz QR, ahorrando cientos de renders parásitos en `ModalHost.tsx`.
  4. **Accesibilidad y Ergonomía Táctil (P2)**:
     - En `src/components/ui/BrutalistButton.tsx`: adición del atributo `aria-busy` durante `isLoading` e `isSaving`, y expansión ergonómica del touch target en tamaños `compact` y `compact-icon` mediante pseudo-elementos (`after:absolute after:-inset-1.5`) para cumplir la cota mínima de 44×44px de WCAG 2.5.5 en mobile.
     - En `src/components/matrix/PlacesGrid.tsx`: incorporación de roles semánticos `role="dialog"` y `aria-modal="true"` en los tres sub-modales de proponer, reportar y calificar lugares.
- **Componentes y Archivos Clave**:
  - `src/app/api/admin/verify-passcode/route.ts`
  - `src/components/admin/AdminAuthGuard.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/profile/QuickShareQrModal.tsx`
  - `src/components/ui/BrutalistButton.tsx`
  - `src/components/matrix/PlacesGrid.tsx`
  - `src/lib/firebase/authService.ts`
  - `src/lib/security/diaryBackupCrypto.ts`
  - `src/types/vessel.ts`
  - `src/context/domains/AuthContext.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`

---

### [FEAT-186] · [2026-10-09] Modernización 2026 (Fases 4 y 5): AudioWorklet Multihilo, Háptica Táctica Contextual, Optimización Vitest `vmThreads` & Resolución de Hidratación SSR
- **Tipo**: `Architecture Modernization`, `Audio Engine & Haptics`, `Developer Experience & Testing`, `Bug Fix (Hydration)`
- **Módulo / Eje**: `Audio Sub-Bass`, `Tooling & Vitest`, `Storage Sync`, `App Shell`, `Turbopack Audit`
- **Estado Actual**: `100% — Completado & Verificado (537/537 Tests en Verde)`
- **Descripción**:
  1. **Resolución de Errores de Hidratación SSR**:
     - *Error 1 (Guardia VIP `BetaVipGateScreen`)*: Se condicionó la visualización de la pantalla VIP en `AppShell.tsx` a `isMounted && appMode === "real" && (!isAuthenticated || !vipGateUnlocked)`, evitando que el servidor renderice la pantalla de bloqueo y el cliente monte la app principal.
     - *Error 2 (Discrepancia en `userCodename` y contador de toques en `BrutalistHeader` y `BrutalistNav`)*: En `src/lib/storage/localStorageSync.ts`, `isLocalEnvironment()` evaluaba a `false` en SSR porque `typeof window === "undefined"`, asumiendo modo `"real"` en el servidor mientras el cliente evaluaba `"test"` (`localhost:3001`). Se incorporó `isDevEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "development"`, garantizando que el estado inicial en desarrollo sea simétrico entre SSR y cliente.
     - *Error 3 (Badge de mensajes no leídos en `BrutalistNav`)*: En `src/context/domains/ChatContext.tsx`, `useState` invocaba sincrónicamente `loadFromStorage`, devolviendo `{}` en SSR y el historial de chat con mensajes sin leer en el cliente durante la hidratación inicial. Se unificó la inicialización en `useState(INITIAL_MESSAGES)` delegando la carga a `useEffect` (post-mount), y se protegió la renderización de badges en `BrutalistNav.tsx` con la guarda `isMounted` para pulsos, chats y agenda.
  2. **Experiencia Sensorial, AudioWorklet & Háptica Táctica (Fase 4)**:
     - Creación de `public/audio-processors/sub-bass-processor.js` (`SubBassWorkletProcessor`) para síntesis analógica sub-bass (45-80Hz) en hilo de tiempo real fuera del Main Thread.
     - En `SubBassAudioEngine.ts`, carga dinámica del módulo de AudioWorklet, creación de `AudioWorkletNode` y fallback automático transparente a osciladores nativos en navegadores sin soporte.
     - Envelopes hápticos contextuales sincronizados con la fase ascendente del oscilador: Pulso Leve `[12]`, Encuentro Inminente `[20, 40, 20]` y Alerta de Seguridad `[40, 60, 80]`.
  3. **Tooling, DX & Optimización de Vitest (Fase 5)**:
     - Configuración de `pool: 'vmThreads'` en `vitest.config.mts`: tiempo de ejecución de la suite completa reducido de ~12.0s a **3.8s** en 87 suites (538 pruebas), eliminando la recreación redundante de Happy-DOM.
     - Auditoría técnica de Turbopack: Se corroboró que `@tailwindcss/postcss` v4 detona un panic interno en el loader de Turbopack (Error Conocido #19). Por estabilidad y consistencia, se mantiene intencionalmente `--webpack` en `next dev`.
- **Componentes y Archivos Clave**:
  - `src/lib/audio/SubBassAudioEngine.ts`
  - `public/audio-processors/sub-bass-processor.js`
  - `tests/unit/audio/SubBassAudioEngine.test.ts`
  - `vitest.config.mts`
  - `src/lib/storage/localStorageSync.ts`
  - `src/components/shell/AppShell.tsx`
  - `src/context/domains/ChatContext.tsx`
  - `src/components/navigation/BrutalistNav.tsx`
  - `tests/unit/ui/BrutalistNav.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - Cero errores de hidratación reportados en la consola.
  - Cero errores de TypeScript (`npm run typecheck`).
  - 100% de tests en verde (538/538 pruebas pasando en Vitest en 3.4s).

---

### [FEAT-185] · [2026-10-09] Modernización Arquitectónica 2026: Aislamiento de Renderizado, Pipeline AVIF/WebP, Respaldo Asíncrono IndexedDB & View Transitions API
- **Tipo**: `Architecture Modernization`, `Performance & Reactivity`, `Storage & Pipeline`
- **Módulo / Eje**: `Radar/Matrix`, `Navigation`, `App Shell`, `Storage & Offline Sync`, `Next.js Config`
- **Estado Actual**: `100% — Completado & Verificado (100% Tests en Verde)`
- **Descripción**: Implementación integral del Plan de Modernización 2026 en 4 fases:
  1. **Aislamiento de Renderizado & Reactividad (Fase 1)**:
     - Desacoplamiento total de `ProfileCard` respecto a `useChat()` y `useDiary()`, evitando tormentas de re-renderizado en las 100+ tarjetas de la Matrix al recibir mensajes o actualizar el diario.
     - Separación arquitectónica en `PureProfileCard` (componente puramente presentacional memorizado con `React.memo`), `ConnectedProfileCard` y enrutador inteligente `ProfileCard`.
     - Migración de vistas principales (`page.tsx`, `ModalHost.tsx`, `PulsesView.tsx`, `DateDiaryView.tsx`, `ProtocolView.tsx`) desde el hook monolítico `useVessel()` hacia hooks de dominio atómicos (`useRadarMatrix`, `useAuth`, `useSettings`, `useLogistics`, `useDiary`, `useChat`, `useSafety`).
  2. **Pipeline de Recursos y Offloading Fuera del Hilo Principal (Fase 2)**:
     - Optimización de imágenes en Next.js con soporte nativo de formatos AVIF y WebP (`next.config.ts`).
     - Eliminación del flag estático `unoptimized={true}` para orígenes permitidos (Unsplash, Google Storage), incorporando marcadores difuminados (`blurDataURL`) para garantizar CLS = 0.
     - Persistencia asíncrona permanente en `IndexedDB` para la cola de mutaciones offline (`offlineMutationQueue.ts`) y colecciones pesadas (`localStorageSync.ts`), previniendo bloqueos del hilo principal.
  3. **Navegación Fluida con View Transitions & Historial Nativo (Fase 3)**:
     - Integración de `document.startViewTransition` en `setActiveView` para transiciones de pantalla con aceleración por hardware y respeto de `prefers-reduced-motion`.
     - Sincronización bidireccional de vistas con URL (`?view=...`), habilitando soporte nativo del botón "Atrás/Adelante" del navegador (`popstate`) y enlaces directos.
  4. **Consultas de Contenedor & Primitivas Modernas (Fase 4)**:
     - Adopción de `@container` queries en `ProfileGrid` (`@xs`, `@md`, `@lg`) para escalado adaptativo en cualquier ancho de contenedor o ventana dividida.
- **Componentes y Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/lib/sync/offlineMutationQueue.ts`
  - `src/lib/storage/localStorageSync.ts`
  - `src/app/globals.css`
  - `next.config.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - Cero errores en verificación estricta de tipos TypeScript (`npm run typecheck`).
  - 100% de la suite de pruebas unitarias y de integración en verde (86/86 suites, 531 tests superados en Vitest).

---

### [FEAT-184] · [2026-10-09] Estandarización Universal de Componentes de Usuario (Fases 1 a 4): Erradicación de Elementos Ad-Hoc & Adopción de Biblioteca Brutalista
- **Tipo**: `Design System Standardization`, `Code Hygiene & Refactor`, `A11y & Ergonomics`
- **Módulo / Eje**: `Design System (@/components/ui/)`, `Chat`, `Radar/Matrix`, `Settings`, `Logistics`, `Diary`, `Safety`, `Subscription`, `Auth`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Ejecución completa y ordenada del plan de 4 fases para garantizar cumplimiento riguroso de la Regla 8 ("Cero Elementos Ad-Hoc") e Impeccable UI v4.3.1 en toda la aplicación de usuario:
  1. **Fase 1 (Nuevas Primitivas & Extensiones de Biblioteca)**:
     - Creación de `BrutalistTextarea` (`src/components/ui/BrutalistTextarea.tsx`) con estados brutalistas, feedback táctil y límite de caracteres.
     - Extensión de `TacticalAvatar` con soporte unificado para `bodyState` ("open" | "occupied" | "dormant") y `statusBadge` sin recorte por overflow.
     - Extensión de `BrutalistModal` con soporte para variantes (`standard` | `fullscreen`), `customHeader`, `footer` y `closeButtonAriaLabel` personalizable.
     - Extensión de `BrutalistInput` con `containerClassName?: string`.
  2. **Fase 2 (Migración de Formularios, Switches, Textareas y Selects)**:
     - 6/6 switches nativos migrados a `BrutalistSwitch` (`LocationPrivacySection`, `AppSettingsSection`, `ItsExposureModal`, `AppSettingsModal`).
     - 11/11 textareas nativos migrados a `BrutalistTextarea` (`BioTab`, `LogisticsTab`, `KinksTab`, `PendingTestimonialsManager`, `WriteTestimonialModal`, `CreateDiaryEntryModal`, `LoverDossierModal`, `BetaFeedbackModal`).
     - 7/7 selects nativos migrados a `BrutalistSelect` (`LocationPrivacySection`, `LogisticsTab`, `SubstanceAtmosphereSelector`, `ExitProtocolSelector`, `CreateDiaryEntryModal`).
  3. **Fase 3 (Estandarización de 15 Modales & Overlays Ad-Hoc a `BrutalistModal`)**:
     - Migración completa de modales con wrappers `fixed inset-0` manuales a `BrutalistModal`: `TravelModeModal`, `EnRouteTrackerModal`, `GeoBatteryModal`, `AppSettingsModal`, `AppModeModal`, `HostCardModal`, `VoiceVibeRecorderModal`, `ItsExposureModal`, `WriteTestimonialModal`, `DuoLinkModal`, `VesselWrappedModal`, `HarmReductionModal`, `UnlimitedPaywallModal`, `IdentityVerificationModal`, `LivenessVerificationModal`.
  4. **Fase 4 (Estandarización de Botones y Micro-Badges Tácticos)**:
     - Migración de opciones de `ChatTacticalMenu` a `TacticalMenuItem` y botón de cierre a `BrutalistButton`.
     - Migración de micro-acciones 1-tap (Toque directo, Chat directo) y toggle de favoritos en `ProfileCard` a `BrutalistButton`.
     - Migración de tags y estados en `DarkroomListView` a `TacticalBadge` y delegación del indicador corporal a `TacticalAvatar` mediante `bodyState`.
- **Componentes & Archivos Clave**:
  - `src/components/ui/BrutalistModal.tsx`
  - `src/components/ui/BrutalistTextarea.tsx`
  - `src/components/ui/BrutalistSelect.tsx`
  - `src/components/ui/BrutalistSwitch.tsx`
  - `src/components/ui/TacticalAvatar.tsx`
  - `src/components/ui/TacticalMenuItem.tsx`
  - `src/components/chat/ChatTacticalMenu.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/matrix/ProfileCard.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas en verde (`npm run test` 517/517 tests pasando en 83 archivos).
  - [x] Cero elementos interactivos o de formulario ad-hoc en vistas de usuario.
  - [x] Persistencia en memoria Engram registrada y juzgada.

---

### [FEAT-183] · [2026-10-09] Poda Táctica del Core: Extirpación de 7 Módulos Satélite Redundantes, Desasfixia Arquitectónica Zen y Versión v2.7.0
- **Tipo**: `Architecture & Refactor (Poda Táctica)`, `UX Simplification`, `Security Refactor`
- **Módulo / Eje**: `Core`, `Seguridad Ligera`, `Suite Nightlife`, `Autenticación Biométrica`, `Design System`, `Release v2.7.0`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Auditoría integral y poda profunda de 7 características satélite que generaban sobrecarga cognitiva y dispersión en la propuesta de valor de VESSEL:
  1. **Suite de Fiesta Desmalezada**: Eliminación completa de Alerta de Trago Adulterado (`SpikedDrinkAlertModal`), Baliza Óptica (`OpticalBeaconModal`), Wingman AI (`WingmanModal`), Conexiones Perdidas (`MissedConnectionsModal`) y After Hours (`AfterHoursModal`), junto con la barra de accesos rápidos del modal de boliches y eventos.
  2. **Derogación de Guardián Silencioso & Dead-Man Switch**: Eliminación de `SafetyBeaconModal`, `BeaconCountdownWidget`, `DuressPinSettingsModal` y `AppDisguiseSection` (pantalla señuelo / bloc de notas). Erradicación de falsos positivos y alarmas parásitas por temporizadores olvidados.
  3. **Seguridad Ligera & Respeto por el Flujo**: Conservación del Modo Sigilo Inmediato (1-tap para apagar transmisiones y ocultar presencia) y transformación del Bento 4 en el pacto de cita a **Telemetría "Voy en Camino"** (notificación en vivo al salir y aviso discreto a menos de 50m sin compartir GPS continuo).
  4. **Unificación de Privacidad Facial Biométrica**: Eliminación de avatares estilizados/ficticios de catálogo (`StyledAvatar`, `STYLED_AVATARS_CATALOG`) para erradicar cuentas impersonales. El estándar es 100% humano: foto real obligatoria con toggle a Modo Niebla (desenfoque facial calibrado) a elección del usuario.
  5. **Limpieza Profunda de Contextos**: Remoción de más de 600 líneas de estado huérfano, timers y listeners parásitos en `SafetyContext.tsx` y `LogisticsContext.tsx`.
  6. **Preservación para Próxima Fase**: Preservadas las características de Testimonios Post-Encuentro (`TestimonialsSection`) y Métricas de Química (`VesselWrappedModal`) para su posterior rediseño y simplificación en el próximo paso.
  7. **Release v2.7.0 & Purga SW**: Incremento a versión `v2.7.0`, sincronización automática con Service Worker (`npm run version:sync`), paso del test suite con 509/509 tests en verde y 0 errores en `npm run typecheck`.
- **Componentes & Archivos Clave**:
  - `src/components/modals/ModalHost.tsx`
  - `src/context/domains/SafetyContext.tsx`
  - `src/context/domains/LogisticsContext.tsx`
  - `src/components/chat/RendezvousSheet.tsx`
  - `src/components/auth/IdentityVerificationModal.tsx`
  - `src/components/nightlife/NightlifeEventsModal.tsx`
  - `src/lib/version/systemVersion.ts`
  - `REGLAS_DE_NEGOCIO.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas en verde (`npm run test` 509/509 tests pasando en 82 archivos).
  - [x] Service Worker y package.json sincronizados con versión `v2.7.0` (`npm run version:sync`).
  - [x] Reglas de negocio actualizadas en `REGLAS_DE_NEGOCIO.md` (Sección 5 y Sección 10).
  - [x] 9 archivos de modales y widgets obsoletos borrados del repositorio sin imports huérfanos.

---

### [FEAT-182] · [2026-10-09] Mi Agenda: Arquitectura de 3 Pestañas Cronológicas (Próximas | Historial | Salud & Doxy), Bento Card de Métricas & Química Integrado y Calibración Rioplatense 2026
- **Tipo**: `Enhancement (Mejora/Refactor)`, `Mobile UX/UI`, `Arquitectura de Agenda / Bitácora Privada`
- **Módulo / Eje**: `Mi Agenda`, `Bitácora Privada`, `Cifrado AES-256`, `Mobile UX/UI`, `Design System & Primitivas`, `Localización Rioplatense 2026`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Simplificación integral y desasfixia de la vista de agenda (`DateDiaryView.tsx`) pasando de 4 solapas confusas a un modelo estrictamente cronológico de 3 pestañas, enriquecido con el Bento de métricas íntimas:
  1. **Arquitectura Cronológica de 3 Pestañas (Touch Targets de 48px)**:
     - `[ ⚡ Próximas (N) ]`: Dedicado 100% a citas futuras. Hero Card inminente con cuenta regresiva en vivo, avatar con acceso a ficha privada y 4 acciones de pulgar (`[📍 Ver punto]`, `[⏳ +30m]`, `[🤝 Me bajo con onda]`, `[💬 Chat]`). Lista de citas subsiguientes y botón destacado `[+ Agendar otra salida]`. Zero duplicación de historial.
     - `[ 📖 Historial (N) ]`: Archivo privado y memoria de encuentros concretados.
     - `[ 💚 Salud & Doxy ]`: Prevención y reducción de daños (Tracker Doxy-PEP 72h, PrEP, chequeos médicos trimestrales y alertas de exposición anónimas).
  2. **Bento Card de Métricas & Resumen de Química**: Tarjeta de Dark Luxury brutalista integrada al inicio de *Historial*, con 4 KPIs (Satisfacción Media, Química Corporal, Total Encuentros, Tasa de Repetición), botón de apertura rápida de `Vessel Wrapped ✨` y acceso a desglose de testimonios de la comunidad.
  3. **Erradicación de la Tautología ("Mi Agenda" dentro de "Mi Agenda") y del Misterio de "Fuego 🔥"**: Renombrado limpio y transparente; las métricas analíticas se integran orgánicamente en el archivo histórico y en un acceso táctico directo en la cabecera (`[🔥 Métricas]`), liberando espacio en la barra superior.
  4. **Carrusel Horizontal de Vínculos Frecuentes**: Burbujas de 56px (`w-14 h-14`) para amantes con química comprobada, ranking numérico, medallas y revancha rápida en 1 tap.
  5. **Feed Cronológico de Citas Pasadas con Filtros Tácticos**: Buscador en vivo, filtros rápidos de fecha (`Todos`, `7 días`, `30 días`, `Este año`, `Rango personalizado`), toggle de `Solo Favoritos` y tarjetas `DiaryEntryCard` con botones de calificación rápida $\ge 44\times 44\text{px}$.
  6. **Calibración Rioplatense Vernácula 2026**: "Próximas", "Historial", "Salud & Doxy", "Me bajo con onda", "Mis Vínculos", "Ficha Privada", "Agendar otra salida", "Quiero la Revancha".
  7. **Cobertura y Estabilidad**: 511/511 tests en verde en Vitest (82 suites) y 0 errores en `npm run typecheck`.
- **Componentes & Archivos Clave**:
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/diary/DiaryEntryCard.tsx`
  - `src/lib/i18n/translations.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas en verde (`npm run test` 511/511 tests pasando en 82 archivos).
  - [x] Touch targets móviles $\ge 44\text{px}$ (*Craft Floor* de Impeccable UI).
  - [x] Erradicación de pestañas redundantes y solapamientos conceptuales.
  - [x] Integración armoniosa del Bento de Métricas y Wrapped sin contaminar la barra de navegación principal.

---

### [FEAT-181] · [2026-10-08] Radar Táctico Zen (Alternativa A): Switcher 1-Tap Gente/Boliches, Carrusel Horizontal de Filtros Rápidos, Micro-Acciones Duales 1-Tap (Toque + Chat) en Cards, Erradicación de Peek Bar Redundante y Desasfixia Vertical Mobile
- **Tipo**: `Enhancement (Mejora/Refactor)`, `Mobile UX/UI`, `Arquitectura Radar`
- **Módulo / Eje**: `Radar`, `Matriz`, `Design System & Primitivas`, `Audio & Háptica`, `Localización Rioplatense 2026`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Implementación integral y fidedigna de la "Alternativa A: Radar Táctico Zen" para la vista Radar móvil y flujos satélite:
  1. **Erradicación del Peek Bar Inferior Redundante**: En `TacticalBottomSheet` y `RadarBottomCommandBar`, adición de la propiedad `hidePeekBar={true}`. Se eliminó la barra flotante `[PINTA YA] [FILTRAR ^]` que bloqueaba perfiles y duplicaba los filtros del carrusel superior, dejando el sheet disponible a pantalla completa únicamente al pulsar `[⚙️ Filtros]`. Reducción del padding inferior a `pb-24 sm:pb-28`.
  2. **Micro-Acciones Duales 1-Tap en Cards**: En `ProfileCard.tsx`, incorporación de los dos botones directos en el pie de cada tarjeta: `[🔥 Toque]` (`quick-toque-btn` con audio sub-bass analógico de 65Hz) y `[💬 Chat]` (`quick-chat-btn` con apertura directa de Darkroom Chat), preservando el clic general en el cuerpo de la tarjeta para abrir el preview/dossier.
  3. **Switcher Segmentado 1-Tap de Ancho Completo**: En `ProfileGrid.tsx`, el selector de pestañas `[ 👥 Gente (N) ]` vs `[ 🍸 Boliches & Joda (M) ]` se distribuyó a ancho completo en grid de 2 columnas con bordes brutalistas y badges de cantidad en tiempo real.
  4. **Poda de Cartelera Redundante en Gente**: Se removió el billboard nocturno de la pestaña de personas (`isBillboardVisible = false`), ganando más de 70px verticales y dirigiendo la cartelera nocturna a la pestaña especializada de Boliches.
  5. **Header Ultraliviano con Ubicación Dinámica**: En `BrutalistHeader.tsx`, integración de `VESSEL ⚡ PALERMO SOHO` (o la ciudad activa con apertura en 1 tap del modal de viaje) junto al botón de disponibilidad `[⚡ LISTO YA]`.
  6. **Jerga y Calibración Rioplatense 2026**: Términos fluidos sin spanglish ni acartonamiento ("Pinta ya", "Pone casa", "Cero plantones", "Morbos mutuos", "Boliches & Joda").
  7. **Cobertura y Estabilidad**: 510/510 tests en verde en Vitest (82 suites) y 0 errores en `npm run typecheck`.
- **Componentes & Archivos Clave**:
  - `src/components/ui/design-system/TacticalBottomSheet.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/matrix/RadarBottomCommandBar.tsx`
  - `src/lib/i18n/translations.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas en verde (`npm run test` 510/510 tests pasando en 82 archivos).
  - [x] Target táctiles móviles $\ge 44\times 44\text{px}$.
  - [x] Cero duplicación de botones de filtro y navegación fluida entre personas y lugares en 1 tap.

---

### [FIX-046] · [2026-10-08] Desacoplamiento de Concurrencia React: Eliminación de Side-Effects en Updaters Funcionales y Notificación Asíncrona de Audio
- **Tipo**: `Bug Fix (Corrección)`, `Core / Concurrencia React`, `Audio Engine`
- **Módulo / Eje**: `Chat Darkroom`, `Radar`, `Seguridad`, `Audio & Háptica`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Corrección del error crítico de React: *"Cannot update a component (BrutalistHeader) while rendering a different component (ChatProvider)"*:
  1. **Causa Raíz**: En `ChatContext.tsx`, `audioEngine.playChatMessageSound()` se ejecutaba de forma síncrona dentro de la función actualizadora pura `setChatMessages((prev) => ...)`. Esto invocaba `initContext()`, el cual notificaba síncronamente a los oyentes de desbloqueo de audio (`unlockListeners`). Uno de los oyentes era `BrutalistHeader` (`setIsAudioUnlocked`), disparando un `setState` durante el render activo de `ChatProvider`.
  2. **Pureza en Updaters**: Se extrajo la reproducción de audio fuera de `setChatMessages`, usando `chatMessagesRef` para detectar mensajes entrantes sin efectos secundarios dentro del updater.
  3. **Saneamiento Preventivo en Cascada**: Misma corrección aplicada en `RadarMatrixContext.tsx` (`playNudgeReceived`), `SafetyContext.tsx` (`toggleStealthMode`, `toggleSound`) y modales de verificación biométrica.
  4. **Defensa Asíncrona en SubBassAudioEngine**: Se centralizó la notificación de oyentes en `notifyUnlockListeners`, difiriendo su despacho a `queueMicrotask` para asegurar que las notificaciones de hardware jamás coincidan con una fase de render de React.
- **Componentes & Archivos Clave**:
  - `src/context/domains/ChatContext.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/context/domains/SafetyContext.tsx`
  - `src/lib/audio/SubBassAudioEngine.ts`
  - `src/components/auth/IdentityVerificationModal.tsx`
  - `src/components/auth/LivenessVerificationModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas en verde (`npm run test` 504/504 tests pasando).
  - [x] Zero llamadas a `audioEngine` o `setState` dentro de funciones actualizadoras de estado.

---

### [FEAT-180] · [2026-10-08] Bento Radar Táctico & Desasfixia Mobile: Quick Peek Bento 1-Tap, Command Bar Ergonómico con Morbos Colapsables, Coordinación de Cita Single-Screen y Localización Rioplatense 2026
- **Tipo**: `Enhancement (Mejora/Refactor)`, `Mobile UX/UI`, `Arquitectura Radar`
- **Módulo / Eje**: `Radar`, `Matriz`, `Chat Darkroom`, `Mobile UX/UI`, `Design System & Primitivas`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Rediseño e implementación integral de la "Alternativa 2: Bento Radar Táctico" para la vista Radar móvil y flujos dependientes:
  1. **Higiene y Poda de Código Muerto (Regla 8)**: Eliminación del archivo huérfano `DynamicFilterDrawer.tsx` (690 LOC) y su estado residual en `ModalHost.tsx`. Reemplazo de todos los botones HTML nativos por `BrutalistButton` con touch target $\ge 44\text{px}$ en `EnRouteBanner.tsx`, `UpcomingEncounterBanner.tsx`, `TravelModeModal.tsx` y `EnRouteTrackerModal.tsx`.
  2. **Quick Peek Bento Sheet (`ProfileBentoQuickPeek.tsx`)**: Ficha táctica emergente montada como singleton en `ProfileGrid.tsx`. Al tocar una card, presenta fotos en carrusel, audio de voz 5s, comodidades del depto, morbos en común y dos acciones directas de 48px: `[💬 Chatear]` y `[⚡ Coordinar Cita]`.
  3. **Desasfixia de la Tarjeta (`ProfileCard.tsx`)**: Eliminación del botón directo "Coordinar" para evitar disparos accidentales del acuerdo previo. Reemplazo por botón cinético de 1-Tap Toque de Rol (`transmitSignal` / "Tirar Onda") + Favorito (★).
  4. **Reorganización Ergonómica de Filtros (`RadarBottomCommandBar.tsx`)**: Reestructuración en 6 bloques lógicos priorizados según frecuencia real de uso en smartphones: (1) Rol y posición, (2) Distancia máxima & Modo Viajero, (3) Preferencias y logística rápida, (4) Criterio de ordenamiento, (5) Morbos y fetiches con acordeón colapsable y buscador, y (6) Onda y sustancias.
  5. **Pacto de Cita en Pantalla Única (`RendezvousSheet.tsx`)**: Eliminación del wizard de 3 pantallas con botones "Continuar" / "Atrás", reemplazándolo por una vista Bento unificada de pantalla única con despacho atómico (Lugar, Horario, Puntos Claros, Guardián SOS) y erradicación de elementos ad-hoc.
  6. **Localización Vernácula Rioplatense 2026**: Integración de terminología moderna argentina para usuarios de 20 a 35 años: "Salidas & Joda Hoy", "Puntos Claros", "Coordinar Cita", "Se mueven / Van a donde estés", "Acá al toque", "Cero plantones" y "Limpiar filtros".
  7. **Validación Rigurosa**: 504/504 tests unitarios y de integración pasando en verde (82 suites en Vitest) y compilación estricta sin errores en TypeScript (`npm run typecheck`).
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileBentoQuickPeek.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/matrix/RadarBottomCommandBar.tsx`
  - `src/components/chat/RendezvousSheet.tsx`
  - `src/components/radar/EnRouteBanner.tsx`
  - `src/components/radar/UpcomingEncounterBanner.tsx`
  - `src/components/radar/TravelModeModal.tsx`
  - `src/components/radar/EnRouteTrackerModal.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/lib/i18n/translations.ts`

---

### [FEAT-179] · [2026-10-08] Reingeniería Bento Hub de Mi Perfil: Separación Estricta de Identidad vs Ajustes de Sistema, Hero Bento Compacto con Medidor de Completitud, Selector de Portada 1-Tap y Jerga Rioplatense 2026
- **Tipo**: `Enhancement (Mejora/Refactor)`, `Mobile UX/UI`, `Arquitectura de Perfil`
- **Módulo / Eje**: `Perfil & Cuenta`, `Mobile UX/UI`, `Design System & Primitivas`
- **Estado Actual**: `100% — Completado & Verificado`
- **Descripción**: Rediseño e implementación del modelo arquitectónico "Bento Hub Táctico" para la vista de "Mi Perfil" (`ProtocolView.tsx`) y submódulos satélite:
  1. **Separación Estricta de Identidad vs Ajustes (REQ-1)**: Poda de más de 300 líneas de código duplicado de configuraciones de sistema (audio analógico sub-bass, sincronización en nube, exportar/importar backup JSON, purga de datos, sesión Google OAuth, idioma de interfaz y unidades de medida) de `BioTab.tsx` y `BoundariesTab.tsx`, unificándolos exclusivamente en el panel global `AppSettingsModal.tsx`.
  2. **Hero Bento Compacto & Medidor de Completitud Táctica (REQ-2)**: Reducción vertical del avatar a 20x28 (80x112px), incorporación de barra reactiva de completitud del perfil (0–100%), estado táctico en tiempo real ("En línea y con ganas" vs "Modo Sigilo"), badges de confianza ("Pongo Casa", "Verificado", "Karma") y división bento inferior para Niebla y Audio 5s.
  3. **Action Sheet Directo de Foto de Portada (REQ-3)**: Refinamiento de `CoverPhotoSelectorModal.tsx` como Action Sheet para cámara instantánea, selector de galería y carrusel de fotos públicas en 1 toque.
  4. **Coherencia en Logística & Morbos (REQ-4)**: Unificación reactiva de `myHostCard.hasPlace` con `myProfile.mobility` y reorganización de comodidades del espacio.
  5. **Calibración Rioplatense 2026 (REQ-5)**: Actualización de strings a jerga contemporánea argentina (20–35 años): "Tus Álbumes", "Comodidades del depto", "Cosas a mano en casa", "Límites y despedida sin drama", "Contextura física", "Altura (cm)", "Karma & Cero Plantones", "Botón de Auxilio (SOS)", "Guardar cambios".
  6. **Cobertura y Estabilidad**: 505/505 tests en verde en Vitest (82 suites) y 0 errores en `npm run typecheck`.
- **Componentes & Archivos Clave**:
  - `src/components/account/ProtocolView.tsx`
  - `src/components/account/tabs/BioTab.tsx`
  - `src/components/account/tabs/BoundariesTab.tsx`
  - `src/components/account/tabs/LogisticsTab.tsx`
  - `src/components/account/tabs/ReputationTab.tsx`
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/account/CoverPhotoSelectorModal.tsx`
  - `src/lib/i18n/translations.ts`
