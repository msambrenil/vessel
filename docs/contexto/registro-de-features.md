# Registro de Features, Entregas y Control de Estado — Sistema VESSEL
*(Feature Ledger & Release Tracker)*

Este documento constituye la **fuente única de verdad (Single Source of Truth)** sobre el estado, evolución y ciclo de vida de todas las características, soluciones de fallos, refactors y mejoras técnicas implementadas en **VESSEL**.

---

## 📌 Estándar Operativo de Registro (SOP)

Cada vez que se implemente una nueva característica, se corrija una falla o se aplique una mejora arquitectónica en el código, es **mandatorio y prioritario** agregar una entrada en este documento siguiendo la estructura formal:

### Plantilla de Entrada Estándar

```markdown
### [ID-NUM] · [YYYY-MM-DD] [Título de la Característica o Fix]
- **Tipo**: `Nueva Feature` | `Bug Fix (Corrección)` | `Enhancement (Mejora/Refactor)` | `Infra/Seguridad` | `Core / Fundacional`
- **Módulo / Eje**: `Matriz` | `Radar` | `Pulsos` | `Chat Darkroom` | `Diario & Salud` | `Perfil & Cuenta` | `Seguridad & DRM` | `Logística & Encuentros` | `Monetización` | `Audio & Háptica` | `Arquitectura & Core`
- **Estado Actual**: `100% — Completado & Verificado` | `X% — En Progreso`
- **Descripción**: Resumen claro de la funcionalidad o solución, problema que resuelve y valor de usuario.
- **Componentes & Archivos Clave**:
  - `src/...`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Estados visuales e interactivos verificados (Default, Active, Disabled).
  - [x] Sincronización en memoria Engram y documentos de contexto.
```

---

## 📊 Matriz Resumen de Entregas del Sistema (Inventario Completo: 92 Features)

| **FEAT-090** | 2026-09-20 | Admin, Perfil, Morbos, Seguridad, i18n | `Feature & Major UX Refinement` | Gestor Dinámico de Morbos en Panel Admin, Rediseño Continuo de Perfil y Estandarización Rioplatense Gay 2026: (1) Gestor de Morbos/Fetiches en `/admin` con creación, edición, toggle activo/inactivo reactivo y persistencia local/remota (`kinkAdminService.ts` & `KinksManagementTab.tsx`), (2) Estandarización léxica estricta rioplatense gay 2026: "Tiene Casa" / "Pongo Casa" / "Voy a la tuya" (eliminando "choza" y jerga no porteña), "Qué te morbosea 😈", "Álbum de Nudes 🔒" / "Álbum Privado", "A pelo / Bareback (PrEP al día)", "Terminar bien la charla ✌️", (3) Rediseño de `ProfileDetailModal` a flujo continuo unificado de scroll sin tabs, (4) Coherencia total en `ProtocolView` (Mi Perfil, Álbumes, Seguridad). | **100%** ✅ |
| **FEAT-089** | 2026-09-19 | Core, UX/UI, Chat, Perfil, Salud | `Major Enhancement & Full-App Overhaul` | Auditoría Integral, Localización Rioplatense Gay 2026 y Simplificación de Flujos: (1) Estandarización de jerga rioplatense gay 2026: "Con Lugar" (para hospedaje) y "Me Hotea 🔥" (atracción sexual directa), (2) Recuperación de 30% de viewport en matriz con StatusToggle compacto de 38px, (3) Barra de chat simplificada con botón [+] táctico y botón reactivo audio/enviar, (4) Rediseño de Protocolo en 3 macro-paneles ergonómicos (Presencia, Bóvedas, Seguridad) y depuración de settings, (5) Segmentación de Date Diary en "Bitácora de Citas" vs "Salud & Cuidado" (Doxy-PEP 72h, PrEP 90d, ITS anónima), (6) Escudo de camuflaje brutalista unificado y poda de modales sobrecargados. | **100%** ✅ |

### [FEAT-090] · [2026-09-20] Gestor Dinámico de Morbos en Panel Admin, Rediseño Continuo de Perfil y Estandarización Rioplatense Gay 2026
- **Tipo**: `Nueva Feature` / `Enhancement (Mejora/Refactor)` / `UX/UI & Admin`
- **Módulo / Eje**: `Admin`, `Perfil & Cuenta`, `Kinks / Morbos`, `Seguridad & DRM`, `i18n`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  1. **Gestor Dinámico de Morbos en `/admin`**:
     - Pestaña `KinksManagementTab.tsx` en el panel de administración con navegación integrada (`AdminNav.tsx`).
     - Creación de morbos personalizados (`addCustomKink`), conmutador rápido para activar o desactivar morbos en vivo (`toggleKinkActiveStatus`), eliminación de morbos personalizados y reseteo a catálogo de fábrica (`resetKinksToDefault`).
     - Evento del sistema desacoplado `vessel_kinks_updated` que actualiza en caliente los componentes de la app (`KinksTab.tsx`, `ProfileDetailModal.tsx`) sin recargar la página.
     - Registro auditado en `AuditLog` con acciones `KINK_CREATED`, `KINK_UPDATED`, `KINK_TOGGLED`, `KINK_DELETED`.
  2. **Estandarización Rioplatense Gay 2026 Rigurosa**:
     - Reemplazo total de cualquier uso de "choza" por **"Casa"**: *"Tiene Casa 🏠"*, *"Pongo Casa 🏠"*, *"Voy a la tuya / Viajo 🚗"*, *"Pongo casa o viajo 🏠/🚗"*, *"En boliche / cruising / telo"*.
     - *"Mi Perfil"* en cabeceras y macro-pestaña de cuenta en lugar de "Mi Ficha Carnal" o "Presencia".
     - *"Qué te morbosea 😈"* / *"Morbos"* en lugar de "Qué te morbea".
     - *"Álbum de Nudes 🔒"* / *"Álbum Privado"* en lugar de "Bóveda de Nudes".
     - *"A pelo / Bareback (PrEP al día)"* en lugar de "Sin goma".
     - *"Terminar bien la charla ✌️"* en lugar de "Cortar la onda bien".
     - *"Me Hotea 🔥"* / *"Hotea"* mantenido para la atracción y deseo sexual directo.
  3. **Rediseño Ergonómico de `ProfileDetailModal`**:
     - Eliminación de la botonera segmentada de 3 pestañas (`vibe`, `logistics`, `trust`).
     - Estructura de bottom sheet continuo con scroll vertical fluido y unificado: Vibe & Biografía ➔ Hospedaje & Disponibilidad de Casa ➔ Coincidencia de Morbos mutua en tiempo real (conectada al gestor de kinks) ➔ Confianza & Protocolo Anti-Ghost.
     - Dock kinetic inferior con acción principal táctica ("🔥 Me Hotea" / "Chatear").
- **Componentes & Archivos Clave**:
  - `src/lib/kinks/kinkAdminService.ts`
  - `src/components/admin/tabs/KinksManagementTab.tsx`
  - `src/components/admin/AdminNav.tsx`
  - `src/app/admin/page.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/account/tabs/KinksTab.tsx`
  - `src/lib/i18n/translations.ts`
  - `src/data/energyCatalog.ts`
  - `src/types/admin.ts`
  - `src/types/vessel.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` — 0 errores).
  - [x] 100% de la suite de pruebas pasando (`npm run test` — 31/31 archivos, 219/219 tests).
  - [x] Linter estricto pasando (`npm run lint` — 0 errores).
  - [x] Admin `/admin` plenamente funcional y accesible para gestión de morbos.
  - [x] Sincronización en memoria Engram y documentación de arquitectura/decisiones.

### [FEAT-089] · [2026-09-19] Auditoría Integral, Localización Rioplatense Gay 2026 y Simplificación de Flujos (Fases 1 a 5)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `UX/UI & Ecosistema Core`
- **Módulo / Eje**: `Core`, `Matriz`, `Chat Darkroom`, `Perfil & Cuenta`, `Diario & Salud`, `Seguridad & DRM`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación exhaustiva del plan integral aprobado derivado de la auditoría completa de VESSEL:
  1. **Localización al Español Rioplatense Gay 2026**:
     - Hospedaje estandarizado de forma estricta e inequívoca en **`"Con Lugar"`** en filtros rápidos, tarjetas de la matriz, bio y modal de perfil.
     - Término **`"Me Hotea 🔥"` / `"Hotea"`** para la atracción sexual y química directa (pulsos, reacciones en perfil y chat).
     - Terminología identitaria porteña/argentina auténtica: *"Pinta YA"*, *"Cero Ghosteo"*, *"Cierre piola"*, *"Bóveda Íntima"*, *"Fotos Privadas con Llave"*.
  2. **Viewport Despejado & Matriz Fotográfica**:
     - Compactación de `StatusToggle.tsx` de un bloque de 3 filas a una sola línea táctica de alta densidad (~38px), recuperando más del 30% de la superficie visible para fotos de perfiles.
     - Tarjeta `ProfileCard.tsx` refinada sin popovers molestos, badge destacado `"CON LUGAR"` y botón de pulso `"🔥 Me Hotea"`.
  3. **Barra de Input Simplificada en Chat Darkroom**:
     - Sustitución de los 5 botones atestados por un botón táctico `[ + ]` con Bottom Sheet para utilidades rápidas (Coordinar Cita, Burn Mode, Pre-Flight, Guardián SOS), un campo amplio de texto y botón reactivo inteligente (Avión de envío con texto, Micrófono de audio si está vacío).
  4. **Rediseño de Protocolo / Mi Cuenta en 3 Macro-Paneles**:
     - `ProtocolView.tsx` reorganizado en 3 macro-pestañas tácticas:
       - *Presencia Pública*: Identidad, avatar con niebla, badge "Con Lugar", Ficha/Bio y Kink Matrix Ciega.
       - *Bóvedas & Archivo*: Álbumes privados, fotos con llave, auditoría y revocación instantánea en 1-tap.
       - *Soberanía & Seguridad*: Límites de conexión, Cultura Anti-Ghost (+Karma), Verificación de identidad digital y Camuflaje señuelo.
     - Depuración de `AppSettingsSection.tsx`: retiro del selector técnico "Modo Prueba vs Modo Real" de la vista de usuario regular.
  5. **Segmentación de Date Diary & Salud Preventiva**:
     - `DateDiaryView.tsx` dividido en dos pestañas superiores con navegación segmentada:
       - *"Bitácora de Citas"*: KPIs de telemetría, testimonios recibidos de la comunidad, filtros de búsqueda y tarjetas de encuentros con notas privadas revelables.
       - *"Salud & Cuidado"*: Botiquín clínico Doxy-PEP con tracking en ventana de 72h, calendario PrEP de 90 días con recordatorio trimestral de laboratorio, botón directo para Alerta de Exposición a ITS 100% anónima y pautas de reducción de daños (Chem-Chill).
  6. **Escudo de Camuflaje Unificado & Poda de MVP**:
     - `AppDisguiseModal.tsx` / `AppDisguiseSection` modernizado con estética brutalista de lujo oscuro, feedback háptico por audio y acceso a PIN de coacción.
     - Retiro de `SessionRoomModal` y `DuoLinkModal` del orquestador central `ModalHost.tsx`.
- **Componentes & Archivos Clave**:
  - `src/lib/i18n/translations.ts`
  - `src/data/roleActionCatalog.ts`
  - `src/components/matrix/StatusToggle.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/account/AppSettingsSection.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/safety/AppDisguiseModal.tsx`
  - `src/components/modals/ModalHost.tsx`
  - `tests/unit/ui/ProtocolView.test.tsx`
  - `tests/unit/ui/DateDiaryView.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Validación estricta de tipos: `npm run typecheck` (0 errores).
  - [x] Suite de pruebas unitarias e integración: 31 suites y 219 tests aprobados en verde (`npm run test`).
  - [x] Cobertura específica añadida para `ProtocolView` (6 tests) y `DateDiaryView` (8 tests).
  - [x] Ergonomía Impeccable UI: Targets táctiles $\ge 44\times 44\text{px}$, feedback sonoro con `SubBassAudioEngine`.
  - [x] Memoria persistente Engram actualizada.
| **FEAT-087** | 2026-09-19 | Perfil & Cuenta, Ergonomía, UX/UI, Audio | `Enhancement & Ergonomic Redesign (Fase 3)` | Refactor Ergonómico de ProfileDetailModal en 3 Pestañas Tácticas (Vibe, Logística, Confianza): Reestructuración del perfil extendido eliminando el scroll infinito y la sobrecarga cognitiva. Reemplazo del complejo FillMeter (hold-to-fill de 2s) por Pulso Instantáneo de 1-tap en dock persistente ($\ge 44\times 44\text{px}$). Poda de audio sintético continuo (`ambientVibe`) para respetar música externa y ahorrar batería. Navegación fluida entre identidad/deseos (`Vibe`), hospedaje/distancia/match secreto (`Logística`) y verificación 3D/salud/testimonios (`Confianza`), con CTA directo a coordinación de citas en chat. | **100%** ✅ |
| **FEAT-086** | 2026-09-19 | Chat Darkroom, Logística & Encuentros, Seguridad | `Enhancement & Flow Unification (Fase 2)` | Unificación del Flujo de Encuentros (RendezvousSheet 3 en 1): Bottom sheet wizard integral que consolida 5 modales fragmentados en un único flujo de 3 pasos: (1) Sintonía Sexual y Pre-Flight Checklist express, (2) Punto de encuentro, hospedaje y dirección segura en 2 fases (esquina pública + timbre privado revelado al llegar), (3) Blindaje de seguridad Dead-Man Switch (Guardián SOS) y telemetría de trayecto ("Voy en camino" / ETA). Despacho atómico en 1 solo tap (`Confirmar y Blindar Encuentro 🔥`) y acceso directo prioritario desde la cinta de acciones del chat. | **100%** ✅ |
| **FEAT-085** | 2026-09-19 | Ergonomía, UX/UI, Arquitectura | `Enhancement & UX Consolidation (Fase 1)` | Descongestión Táctica de Cabecera y Consolidación de Navegación a 4 Pestañas: (1) Limpieza profunda de `BrutalistHeader.tsx`, eliminando switch `TEST/REAL`, controles estáticos de `FIESTAS` y `GUARDIÁN` inactivo, y toggles redundantes de sonido y sigilo (todos preservados en el panel del sistema), (2) Reestructuración de `BrutalistNav.tsx` a 4 pestañas amplias ($\ge 48\times 48\text{px}$ por botón) bajo directivas de Impeccable UI v4.3.1 (Thumb Zone), (3) Integración completa de la bandeja interactiva de Pulsos (Recibidos y Enviados, devolución en 1-tap, badges y tiempos relativos) dentro de `DarkroomListView.tsx`. | **100%** ✅ |

### [FEAT-088] · [2026-09-19] Desmonolitización de page.tsx y Orquestador de Modales Desacoplado (ModalHost — Fase 4)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Arquitectura & Rendimiento Core`
- **Módulo / Eje**: `Arquitectura & Core`, `Performance`, `UX/UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de la Fase 4 del plan de auditoría y modernización arquitectónica de VESSEL:
  1. **Desmonolitización del Árbol Raíz (`src/app/page.tsx`)**:
     - `page.tsx` redujo su tamaño de 293 líneas a tan solo 78 líneas (-73% de reducción en el shell raíz).
     - Se removieron 24 declaraciones de `dynamic()` que saturaban el archivo principal de navegación.
     - `page.tsx` queda enfocado única y exclusivamente en el layout de vistas: `BrutalistHeader`, `EnRouteBanner` (condicional vivo), `StatusToggle` (solo en vista Grid), contenedor `main` de vistas activas, `BrutalistNav` y `<ModalHost />`.
  2. **Creación del Orquestador de Modales (`src/components/modals/ModalHost.tsx`)**:
     - Componente memoizado con `React.memo` que encapsula el montaje condicional y la carga perezosa bajo demanda (`dynamic(..., { ssr: false })`) de los más de 25 modales y overlays del sistema.
     - Organización modular clasificada en 5 dominios de negocio:
       - *Core Overlays*: `ProfileDetailModal`, `DarkroomChatModal`, `DynamicFilterDrawer`.
       - *Auth & Identidad*: `IdentityVerificationModal`, `AuthModal`, `GenderInterestOnboardingModal`, `LivenessVerificationModal`.
       - *Seguridad & Camuflaje*: `CalculatorCoverScreen`, `StealthLockScreen`, `SafetyBeaconModal`, `DuressPinSettingsModal`, `HarmReductionModal`.
       - *Suite Táctica & Logística*: `HostCardModal`, `PreFlightChecklistModal`, `VoiceVibeRecorderModal`, `EnRouteTrackerModal`, `SessionRoomModal`, `DuoLinkModal`, `TravelModeModal`, `NightlifeEventsModal`.
       - *Utilidades, Salud & Cuentas*: `AppSettingsModal`, `GeoBatteryModal`, `CreateDiaryEntryModal`, `ItsExposureModal`, `UnlimitedPaywallModal`, `VaultAuditModal`.
  3. **Optimización de Rendimiento en React 19**:
     - Aislamiento de los re-renders provocados por cambios en el estado de modales respecto de la jerarquía de navegación primaria.
     - Eliminación del costo de reconciliación de 25+ ramas condicionales en el componente raíz en cada actualización de estado.
  4. **Cobertura de Pruebas Unitarias (`tests/unit/ui/ModalHost.test.tsx`)**:
     - 6 tests unitarios que verifican: retorno nulo en ausencia de modales activos, renderizado dinámico de `AppSettingsModal`, `ProfileDetailModal`, `DarkroomChatModal`, `IdentityVerificationModal` y `CalculatorCoverScreen`.
- **Componentes & Archivos Clave**:
  - `src/components/modals/ModalHost.tsx` (Nuevo orquestador de modales)
  - `src/app/page.tsx` (Refactorizado y adelgazado a 78 líneas)
  - `tests/unit/ui/ModalHost.test.tsx` (Suite de tests unitarios dedicada)
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite Vitest completa ejecutada (30 suites, 211 tests pasando al 100%).
  - [x] Linter sin errores (`npm run lint` 0 errores).
  - [x] Sincronización en memoria Engram y documentos de contexto.

### [FEAT-087] · [2026-09-19] Refactor Ergonómico de ProfileDetailModal en 3 Pestañas (Fase 3)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Perfil & Ergonomía UI/UX`
- **Módulo / Eje**: `Perfil & Cuenta`, `Ergonomía`, `UX/UI`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de la Fase 3 del plan de auditoría y simplificación ergonómica del perfil de usuario (`src/components/profile/ProfileDetailModal.tsx`):
  1. **Segmentación Táctica en 3 Pestañas de Alto Contraste**:
     - *Pestaña `Vibe`*: Información expresiva, identidad, bio, rol sexual, deseos de hoy, límites claros, prácticas/kinks y nota de voz efímera.
     - *Pestaña `Logística`*: Hospedaje táctico (`HostCard`: si tiene lugar, comodidades, movilidad), distancia ofuscada, On-The-Clock, atmósfera de sustancias, match kink secreto encriptado, Dossier privado de notas de usuario y botón CTA de acceso rápido a coordinar cita en el chat.
     - *Pestaña `Confianza`*: Liveness 3D / verificación humana, Protocolo Anti-Ghost con Karma Score de Respeto, estado serológico y de salud preventiva (PrEP/VIH), testimonios validados entre pares y bóveda privada de fotos.
  2. **Poda de Microinteracciones Lentas y Fricción Cognitiva**:
     - Eliminación del componente `FillMeter` que exigía mantener presionado 2 segundos para enviar un pulso (fricción en frío o movimiento). Reemplazado por un botón de acción cinética de 1-tap (`audioEngine.playPulse`), con feedback táctil inmediato.
     - Poda total de la reproducción continua de frecuencias en loop (`ambientVibe`), eliminando colisiones con Spotify/Apple Music, bugs de audio persistente y consumo de batería en perfiles degradados.
  3. **Dock Inferior Ergonómico (Thumb Zone)**:
     - Dock fijo en el tercio inferior con 4 acciones esenciales con targets $\ge 44\times 44\text{px}$: Enviar Pulso Instantáneo, Solicitar/Compartir Ubicación & PIN, Registrar en Diario Íntimo, y Chatear / Desbloquear Acceso.
  4. **Cobertura de Pruebas Unitarias (`tests/unit/ui/ProfileDetailModal.test.tsx`)**:
     - 5 tests unitarios que verifican renderizado base, alternancia reactiva entre pestañas `Vibe`, `Logística` y `Confianza`, disparo del pulso instantáneo, apertura de chat y accesibilidad de cierre.
- **Componentes & Archivos Clave**:
  - `src/components/profile/ProfileDetailModal.tsx` (Refactorizado con tabs y dock fijo)
  - `tests/unit/ui/ProfileDetailModal.test.tsx` (Suite de pruebas unitarias dedicada)
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite Vitest completa ejecutada (29 suites, 205 tests pasando).
  - [x] Cumplimiento estricto con Impeccable UI v4.3.1 (Touch targets $\ge 44\times 44\text{px}$, Thumb Zone).
  - [x] Sincronización en memoria Engram y documentos de contexto.

### [FEAT-086] · [2026-09-19] Unificación del Flujo de Encuentros (RendezvousSheet 3 en 1 — Fase 2)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Flujos de Encuentros & Ergonomía`
- **Módulo / Eje**: `Chat Darkroom`, `Logística & Encuentros`, `Seguridad & DRM`, `UX/UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de la Fase 2 del plan de auditoría y simplificación de producto, resolviendo la fragmentación cognitiva de coordinar un encuentro en VESSEL:
  1. **Consolidación de 5 Modales Dispersos en un Solo Wizard (`src/components/chat/RendezvousSheet.tsx`)**:
     - Anteriormente, para coordinar una cita segura el usuario debía abrir por separado: *PreFlightChecklistModal*, *WaypointModal*, *RendezvousPinModal*, *SafetyBeaconModal* y *EnRouteModal*.
     - Ahora, `RendezvousSheet` agrupa el 100% del acuerdo previo en un bottom sheet fluido, modular y con targets $\ge 44\times 44\text{px}$ (Impeccable UI).
  2. **Estructura Táctica en 3 Pasos Consecutivos**:
     - **Paso 1: Sintonía Sexual & Pre-Flight**: Ritmo/tempo del encuentro (rápido, sesión extendida, chill), selección de prácticas deseadas (oral, penetración, masaje, fetiche, besos, voyeur), barreras de protección (PrEP, preservativo, indetectable, charlar) y vibra/ánimo.
     - **Paso 2: Logística & Dirección Segura en 2 Fases**: Selección de hospedaje (recibo en mi lugar, voy a su lugar, esquina neutra, PIN efímero). Formulario integrado de Fase 1 (esquina o punto público visible de antemano) y Fase 2 (dirección exacta y notas de timbre, que se liberan únicamente cuando la otra persona avisa llegada).
     - **Paso 3: Blindaje Guardián SOS & ETA en Camino**: Activación en 1 toque del temporizador Dead-Man Switch con selector de minutos (0, 45, 60, 90 min) y datos de contacto de auxilio local-first; toggle optativo de "Voy en Camino" con cálculo de ETA estimado (15, 25, 40 min).
  3. **Despacho Atómico en 1 Solo Tap**:
     - Botón final de alto contraste `Confirmar y Blindar Encuentro 🔥` que ejecuta en una sola transacción reactiva: `sendPreFlightChecklist`, `sendSecureWaypoint` / `sendRendezvousPin`, `startSafetyBeacon` y `startEnRoute`, reproduciendo el feedback acústico sub-bass característico (`playSignalSent`).
  4. **Puntos de Entrada Intuitivos en el Chat (`src/components/chat/DarkroomChatModal.tsx`)**:
     - Botón principal de acceso rápido `⚡ Cita` directamente en la cinta superior del chat.
     - Opción destacada con gradiente hero `Coordinar Cita (3 en 1)` dentro del menú táctico flotante.
  5. **Cobertura de Pruebas Unitarias (`tests/unit/ui/RendezvousSheet.test.tsx`)**:
     - 6 tests unitarios dedicados que validan renderizado, navegación bidireccional entre pasos, despacho atómico de acciones y accesibilidad de cierre.
- **Componentes & Archivos Clave**:
  - `src/components/chat/RendezvousSheet.tsx` (Nuevo componente wizard)
  - `src/components/chat/DarkroomChatModal.tsx` (Puntos de entrada y montaje)
  - `tests/unit/ui/RendezvousSheet.test.tsx` (Suite de tests unitarios)
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas pasando (28 suites, 200 tests pasados).
  - [x] Linter estricto validado (`npm run lint` 0 errores).
  - [x] Sincronización en memoria Engram y documentos de contexto.

| **FEAT-084** | 2026-09-19 | Psicografía de Mercado & UX | `Core / Fundacional & Ecosistema de Producto` | Formalización Exhaustiva de los 20 Arquetipos de Usuario de VESSEL para el Lanzamiento en Argentina: Documento maestro `docs/contexto/arquetipos.md` con análisis multidimensional (hardware real, salud de batería, redes 4G/5G, gustos, circuitos nocturnos, dolores frente a apps hegemónicas, hooks funcionales de VESSEL y oportunidades de backlog). | **100%** ✅ |
| **FEAT-083** | 2026-09-19 | Estilos & UI, UX/UI, Arquitectura | `Nueva Feature & Ecosistema de Diseño` | Integración, Instalación y Priorización Absoluta de la Skill Impeccable v4.3.1 (CLI v4.0.0): Autoridad N°1 en diseño UX/UI en VESSEL, modos de superficie `Operate` (App core) y `Persuade/Experience` (Showcase), batería de 22 comandos de diseño (`shape`, `critique`, `polish`, `audit`, `distill`, `harden`), validación estricta y sincronización de reglas. | **100%** ✅ |

### [FEAT-085] · [2026-09-19] Descongestión Táctica de Cabecera y Consolidación de Navegación a 4 Pestañas (Fase 1)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `UX/UI & Ergonomía Táctil`
- **Módulo / Eje**: `Estilos & UI`, `Chat Darkroom`, `Pulsos`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación inmediata de la Fase 1 del plan de auditoría ergonómica y simplificación de producto:
  1. **Limpieza Quirúrgica de Cabecera (`src/components/brand/BrutalistHeader.tsx`)**:
     - Retiro del switch de desarrollo `TEST / REAL` de la vista pública (preservado íntegramente en `AppSettingsSection.tsx`).
     - Eliminación de botones estáticos que sobrecargaban la cabecera móvil (`FIESTAS` y `GUARDIÁN` inactivo).
     - Retiro de toggles directos de sonido, modo sigilo y logout directo en la cabecera fija, protegiendo al usuario de toques accidentales y concentrando la configuración en el panel del sistema (`AppSettingsModal`).
     - Preservación exclusiva en la zona central de los widgets vivos críticos para la vida o seguridad física (*Rendezvous PIN en curso*, *Guardián Countdown* y *Reducción de Daños activa*).
  2. **Consolidación de Barra Inferior de 5 a 4 Pestañas (`src/components/navigation/BrutalistNav.tsx`)**:
     - Reorganización de la barra monolítica a 4 columnas simétricas: `Cerca` (grid), `Mensajes` (chat), `Diario` (diary) y `Perfil` (account).
     - Expansión de la superficie táctil de cada tab en +25% ($\ge 48\times 48\text{px}$), alineada estrictamente con las directivas ergonómicas de Impeccable UI v4.3.1 (Modo `Operate`, *Thumb Zone*).
     - Unificación del badge inteligente de no leídos en la pestaña de Mensajes, combinando chats pendientes y pulsos entrantes sin abrir.
  3. **Integración Completa de la Bandeja de Pulsos en el Hub de Mensajes (`src/components/chat/DarkroomListView.tsx`)**:
     - Implementación de un selector segmentado superior de alto contraste: `Conversaciones` vs `Pulsos`.
     - Bandeja completa de Pulsos Recibidos y Enviados con marcación de lectura automática, tarjetas enriquecidas con rol, protocolo de salida, distancia, botón de devolver pulso en 1-tap y botón de abrir chat efímero.
     - Riel/Banner táctico hero en la vista de Chats para acceso inmediato a nuevos pulsos recibidos.
  4. **Unificación en Runtime (`src/app/page.tsx`)**:
     - Mapeo de `activeView === "pulses"` hacia `DarkroomListView` con la sección de pulsos preseleccionada para retrocompatibilidad total sin romper enlaces externos ni atajos.
- **Componentes & Archivos Clave**:
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/navigation/BrutalistNav.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/app/page.tsx`
  - `docs/contexto/registro-de-features.md`
  - `docs/contexto/decisiones.md` (ADR-092)
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript 7 estricto validado con 0 errores (`npm run typecheck`).
  - [x] 194/194 pruebas automatizadas pasando al 100% (`npm run test`).
  - [x] ESLint con 0 errores (`npm run lint`).
  - [x] Cabecera móvil libre de desbordes horizontales y micro-botones.
  - [x] Barra inferior de 4 pestañas amplias con feedback háptico/acústico intacto.

### [FEAT-084] · [2026-09-19] Formalización de los 20 Arquetipos de Usuario para el Lanzamiento en Argentina
- **Tipo**: `Core / Fundacional` / `Investigación & Psicografía de Producto`
- **Módulo / Eje**: `Arquitectura & Core`, `Perfil & Cuenta`, `Ergonomía Táctil`, `Logística & Encuentros`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Investigación, caracterización y formalización exhaustiva de los 20 arquetipos fundamentales de usuario para el inicio de operaciones de VESSEL en Argentina (CABA, Gran Buenos Aires, Córdoba Capital, Rosario y Mendoza):
  1. **Documento Maestro Dedicado (`docs/contexto/arquetipos.md`)**:
     - 20 perfiles tácticos detallados: Dev Tech Crypto Nomad (Palermo), Pibe Fit de Barrio (Lanús/Lomas), Ejecutivo Corporativo Discreto (Puerto Madero), Raver Queer (Almagro), Universitario del Interior (Nueva Córdoba), Papá Bi Separado (San Isidro), Muscle Bear (Caballito), Médico Residente PrEP (Once), Kinkster BDSM (San Telmo), Creativo Publicitario Burnout (Chacarita), Rugbier Heteroflexible (Rosario), Expat Nomad (Palermo), Bartender Nocturno (Microcentro), Oso Porteño (Boedo), Cruisero Urbano (Belgrano/Costanera), Romántico Serial (Parque Chacabuco), Silver Fox (Recoleta), Pareja Abierta para Tríos (Saavedra), Sommelier Andino (Mendoza), y Gamer Introvertido Geek (Ramos Mejía).
  2. **Dimensiones de Análisis Táctico**:
     - *Hardware & Conectividad real en Argentina:* Dispositivos dominantes (iPhone 11-15 Pro, Androids gama media Samsung Galaxy A, Xiaomi Redmi/Poco, Motorola Edge/G), salud de batería castigada (<80%), planes de datos medidos y redes 4G/5G oscilantes.
     - *Gustos, música y circuitos reales:* Under Club, Crobar, Cocoliche, Plop, ferias, bares de autor, bodegones, gimnasios y cruising urbano.
     - *Dolores dominantes identificados:* Consumo voraz de datos y batería, ghosteo sistemático, hostilidad visual, perfiles falsos/catfishing, miedo a la triangulación o extorsión.
     - *Hooks de VESSEL aplicados:* BatteryStateEngine, Modo Niebla, Google S2 Geohashing, Rendezvous PIN, Pre-Flight Checklist, Host Card, Safety Beacon, Salas de Sesión, Modo Dúo, Botiquín Doxy-PEP y PrEP.
  3. **Integración al Contexto Vivo**:
     - Consagrado como el 8vo documento nuclear de contexto en `GEMINI.md`, `antigravity_global_rules.md`, `docs/contexto/glosario.md` y registrado en `docs/contexto/decisiones.md` (ADR-090).
- **Componentes & Archivos Clave**:
  - `docs/contexto/arquetipos.md`
  - `GEMINI.md`
  - `.agents/rules/antigravity_global_rules.md`
  - `docs/contexto/glosario.md`
  - `docs/contexto/decisiones.md`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Documento maestro `docs/contexto/arquetipos.md` redactado con 20 arquetipos completos, matriz comparativa y directrices de producto.
  - [x] Indexación como 8vo documento en `GEMINI.md` y `.agents/rules/antigravity_global_rules.md`.
  - [x] Registro formal en `decisiones.md` (ADR-090).
  - [x] Verificación de tipos TypeScript (`npm run typecheck` con 0 errores).
| **FEAT-082** | 2026-09-19 | Arquitectura & Core, Estilos & UI | `Infra/Seguridad & Core Migration` | Migración Mayor del Stack y Blindaje de Runtime: Next.js 16 (App Router validado en SPA), Tailwind CSS v4 (`@tailwindcss/postcss` y `@theme` nativo con tokens Dark Luxury y Anti-Grindr Shield), TypeScript 7 (`declare module "*.css"` en `declarations.d.ts`), ESLint Flat Config (`eslint.config.mjs`) y 194 pruebas pasando al 100% (`npm run validate`). | **100%** ✅ |
| **FEAT-081** | 2026-09-11 | Hardware, Pagos, Telemetría, Seguridad | `Enhancement & Core Migration (Desmockeo a Real)` | Reemplazo Integral de Mocks por Implementaciones Reales de Hardware y Producción: (1) Geolocalización GPS real con `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })` y refresco táctico, (2) Liveness biométrico con `getUserMedia` y captura fotográfica por `<canvas>`, (3) Pasarela de Pagos VESSEL UNLIMITED con validación de tarjeta bancaria (Luhn), tokenización TLS 1.3 y recibos criptográficos digitales en modo real, manteniendo bypass sandbox en modo test, (4) Telemetría En-Route activa con distancia Haversine y auto-arribo en tiempo real, (5) Guardián Silencioso SOS real vía Web Share API y SMS intent nativo con GPS y batería, (6) Telemetría de batería con detección de hardware real `navigator.getBattery()`, (7) Saneamiento estricto de Matrix, Testimonios y Hotspots en `appMode === "real"`. | **100%** ✅ |
| **FEAT-080** | 2026-09-08 | Perfil & Cuenta, Matriz & Radar, Filtros | `Nueva Feature (Onboarding Progresivo & Filtrado)` | Sistema de Intereses de Género: Onboarding modal post-registro para selección multi-chip de intereses de encuentro (Gay, Bi/Pan, Trans, Cis, No Binarie/Queer, Todos), filtrado automático en `RadarMatrixContext` con matching inteligente por `genderIdentity`/`orientation`, sección de edición persistente en `BioTab.tsx`, override temporal en `DynamicFilterDrawer.tsx`, traducciones i18n (es/en), y 19 tests unitarios para `checkGenderInterestMatch`. | **100%** ✅ |

### [FEAT-083] · [2026-09-19] Incorporación y Priorización Absoluta de la Skill Impeccable v4.3.1 (UX/UI Authority)
- **Tipo**: `Nueva Feature` / `Core / Fundacional`
- **Módulo / Eje**: `Estilos & UI`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Instalación oficial y consagración de la skill **Impeccable** (`https://impeccable.style/`, v4.3.1 / CLI v4.0.0) como la autoridad de diseño y experiencia de usuario (UX/UI) número 1 en VESSEL:
  1. **Instalación Oficial y Binarios Nativos**:
     - Despliegue de `.agents/skills/impeccable/` con motor binario compilado para darwin-arm64 (`.agents/skills/impeccable/scripts/bin/darwin-arm64/impeccable`) ejecutable sin dependencias externas.
     - 22 comandos de diseño y calidad habilitados (`shape`, `critique`, `polish`, `audit`, `distill`, `harden`, `onboard`, `animate`, `colorize`, `typeset`, `layout`, `delight`, etc.).
  2. **Elevación de Regla Global e Invariante de Proyecto**:
     - Modificación de `.agents/rules/antigravity_global_rules.md` (§2 y §7): Impeccable se convierte en la autoridad obligatoria e ineludible para todo desarrollo de interfaz visual.
     - Separación y asignación de los 4 modos de superficie: Modo `Operate` (App core, Radar, Chats, Modales: ergonomía, Thumb Zone, escaneabilidad visual inmediata y targets >=44px) y Modo `Persuade` / `Experience` (Landing y Showcase: inmersión brutalista Dark Luxury).
  3. **Documentación Contextual & Enlace Maestro**:
     - Actualización de `GEMINI.md` y `docs/contexto/convenciones.md` (Sección 7) con directivas de Craft Floor e invariantes de color.
- **Componentes & Archivos Clave**:
  - `.agents/skills/impeccable/`
  - `.agents/rules/antigravity_global_rules.md`
  - `GEMINI.md`
  - `docs/contexto/convenciones.md`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Skill instalada con binario CLI operativo (`impeccable --version` -> 4.0.0).
  - [x] Reglas globales y contexto vinculados con prioridad absoluta para diseño UX/UI.
  - [x] Suite de validación pasando al 100% (`npm run validate`).

### [FEAT-082] · [2026-09-19] Migración Mayor del Stack: Next.js 16, Tailwind CSS v4, TypeScript 7 y Flat Config ESLint
- **Tipo**: `Infra/Seguridad` / `Core / Fundacional`
- **Módulo / Eje**: `Arquitectura & Core`, `Estilos & UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Actualización exhaustiva de las 4 tecnologías estructurales más complejas del stack sin regresiones de diseño, comportamiento SPA ni fallos de compilación:
  1. **TypeScript 7 (`typescript@^7.0.2`)**:
     - Creación de `src/types/declarations.d.ts` con declaración ambiental para imports de archivos `.css`, mitigando la comprobación estricta TS2882 de TypeScript 7 sin comprometer el tipado del código de dominio.
  2. **Next.js 16 (`next@^16.3.5` & `eslint-config-next@^16.3.5`)**:
     - Modernización del App Router y runtime de Next.js. Vistas cliente (`src/app/page.tsx`, `src/app/admin/page.tsx`) y layout raíz estático verificados.
     - Adaptación de `package.json`: sustitución del comando eliminado `next lint` por el estándar `eslint .`.
  3. **ESLint 9 LTS con Flat Config (`eslint.config.mjs`)**:
     - Eliminación de `.eslintrc.json` legado y creación de `eslint.config.mjs` plano compatible con `@next/eslint-plugin-next`.
     - Corrección de entidades tipográficas JSX no escapadas (`&quot;`, `&apos;`) en `MissedConnectionsModal.tsx`, `TestimonialsSection.tsx`, `EnRouteTrackerModal.tsx` y `CalculatorCoverScreen.tsx`.
     - Integración con `eslint@^9.39.5` (LTS con paridad en plugins comunitarios de React/Next), alcanzando 0 errores en `npm run lint`.
  4. **Tailwind CSS v4 (`tailwindcss@^4.3.3` + `@tailwindcss/postcss@^4.3.3`)**:
     - Actualización de `postcss.config.mjs` al plugin `@tailwindcss/postcss`.
     - Migración de `src/app/globals.css` a `@import "tailwindcss";` y bloque `@theme` nativo, conservando el 100% de los tokens brutalistas (`obsidian`, `primary`, `electricViolet`, `mintNeon`, `bloodNeon`, `champagneGold`, `concrete`), sombras `boxShadow` y animaciones (`radar-sweep`, `spin-slow`), así como el Anti-Grindr Shield (remapeo de la escala `amber-*` al espectro violeta).
  5. **Verificación Integral (DoD)**:
     - `npm run validate` (`tsc --noEmit && vitest run`): 27 suites, 194 pruebas unitarias e integración aprobadas al 100%.
- **Componentes & Archivos Clave**:
  - `package.json`
  - `postcss.config.mjs`
  - `eslint.config.mjs`
  - `src/types/declarations.d.ts`
  - `src/app/globals.css`
  - `docs/contexto/decisiones.md` (ADR-089)
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript 7 estricto validado (`npm run typecheck` con 0 errores).
  - [x] 194/194 pruebas automatizadas pasando al 100% (`npm run test`).
  - [x] Linter estricto pasando con 0 errores (`npm run lint`).
  - [x] Preservación de la regla de oro: servidor dev intacto sin ejecutar `npm run build` en caliente.


### [FEAT-081] · [2026-09-11] Reemplazo de Elementos Mock por Implementaciones Reales de Hardware y Producción
- **Tipo**: `Enhancement & Core Migration (Desmockeo a Real)`
- **Módulo / Eje**: `Hardware & Telemetría`, `Monetización & Pagos`, `Seguridad & SOS`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Migración de los 9 elementos simulados identificados en la auditoría técnica de VESSEL hacia implementaciones de hardware real y servicios productivos en `appMode === "real"`, preservando el entorno sandbox exclusivamente para `appMode === "test"`:
  1. **Geolocalización & GPS**: Conexión directa a la Web Geolocation API con `enableHighAccuracy: true`, actualización manual bajo demanda en `GeoBatteryModal` y persistencia en `vessel_coordinates_v1`.
  2. **Biometría & Liveness Anti-Catfish**: Migración en `LivenessVerificationModal.tsx` e `IdentityVerificationModal.tsx` a streams de cámara nativos (`navigator.mediaDevices.getUserMedia`) con snapshot en `<canvas>` de alta resolución.
  3. **Pasarela de Pagos & Checkout Seguro**: Rediseño completo de `UnlimitedPaywallModal.tsx` con flujo en 4 fases (Selección, Checkout con validación de Luhn y detección de franquicia Visa/MC/Amex/Cabal, Animación de Cifrado TLS 1.3, y Recibo Criptográfico Digital `VesselPaymentReceipt` con ID de transacción, código de autorización y guardado en storage). En modo prueba ofrece bypass directo $0.
  4. **Telemetría En-Route Activa**: Cálculo dinámico de distancia en metros mediante la fórmula esférica de Haversine y contador reactivo de arribo automático al estar a <50 metros.
  5. **Guardián Silencioso SOS**: Despacho de alerta de emergencia real mediante Web Share API (`navigator.share`) y protocolo URI `sms:` con coordenadas exactas en Google Maps, porcentaje de batería y hora.
  6. **Telemetría de Batería**: Detección de hardware real `navigator.getBattery()`, actualización reactiva ante eventos `levelchange`/`chargingchange` y badge distintivo de hardware conectado en `GeoBatteryModal.tsx`.
  7. **Aislamiento Estricto Real vs Test**: Garantía en `DiaryContext`, `RadarMatrixContext` y `hotspotService` de que en modo real no se inyectan ni filtran datos de prueba mock.
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts` — Tipos `VesselPaymentReceipt`, `hasHardwareApi` en `BatteryEngineState`, `destinationCoords` en `EnRouteState`
  - `src/components/subscription/UnlimitedPaywallModal.tsx` — Checkout real con Luhn, recibos digitales y modo sandbox
  - `src/context/domains/LogisticsContext.tsx` — GPS nativo, telemetría Haversine en-route
  - `src/context/domains/SafetyContext.tsx` — Despacho SOS nativo vía Share / SMS
  - `src/lib/geo/BatteryStateEngine.ts` — Detección de API de batería y eventos
  - `src/components/radar/GeoBatteryModal.tsx` — UI de hardware real y botón de refresco GPS
  - `src/components/auth/LivenessVerificationModal.tsx` & `IdentityVerificationModal.tsx` — Cámara nativa y snapshot
  - `src/context/domains/DiaryContext.tsx` & `RadarMatrixContext.tsx` — Saneamiento de inicialización en modo real
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Cero `any`, uniones discriminadas estrictas.
  - [x] Modo prueba preserva bypass y mocks; modo real ejecuta APIs nativas y checkout seguro.
| **FEAT-078** | 2026-09-08 | Matriz, Micro-interacciones & Hardware Visual | `Enhancement (Reloj Fucsia Neón)` | Anillo Dinámico Fucsia Neón con Depleción en Sentido Horario estilo Reloj para el Botón "Listo YA" (`StatusToggle.tsx`): Integración del borde fucsia neón de alta intensidad (`#ff007f`, `#ff2a85`) idéntico a las tarjetas de perfil mediante máscara perimetral GPU (`mask-composite: exclude`). Inicia 100% completo (360°) y se va apagando gradualmente en sentido horario (como las agujas de un reloj de 60 minutos), dejando un track oscuro tenue en el tiempo transcurrido, proyectando un destello blanco/fucsia en la cabeza de la aguja y manteniendo el remanente iluminado en fucsia vibrante con refresco por segundo. | **100%** ✅ |

### [FEAT-080] · [2026-09-08] Sistema de Intereses de Género — Onboarding Progresivo y Filtrado Inteligente
- **Tipo**: `Nueva Feature (Onboarding Progresivo, Matching & Filtrado)`
- **Módulo / Eje**: `Perfil & Cuenta`, `Matriz & Radar`, `Filtros`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Sistema completo de personalización de intereses de género para encuentros, implementado como **Onboarding Progresivo** (modal post-registro, no en el formulario de registro).
  1. **Tipo `GenderInterest`**: Unión discriminada con 6 valores (`gay`, `bi`, `trans`, `cis`, `non_binary`, `all`).
  2. **Catálogo `genderCatalog.ts`**: 6 opciones con emoji, label, sublabel y color. Función `checkGenderInterestMatch()` con matching inteligente que analiza `genderIdentity` y `orientation` del perfil.
  3. **Onboarding Modal (`GenderInterestOnboardingModal.tsx`)**: Modal brutalista con chips multi-selección, toggle "Seleccionar Todos", sonido sub-bass. Se dispara automáticamente tras registro por email o login con Google si no hay preferencias previas.
  4. **Filtrado en `RadarMatrixContext.tsx`**: `filteredProfiles` usa `checkGenderInterestMatch` con prioridad drawer > perfil. Solo muestra perfiles que coincidan con los intereses seleccionados.
  5. **Edición persistente en `BioTab.tsx`**: Sección "Intereses de Encuentro" con chips editables para modificar preferencias en cualquier momento.
  6. **Override temporal en `DynamicFilterDrawer.tsx`**: Sección de filtro de género que permite sobreescribir temporalmente la preferencia de perfil.
  7. **Mock profiles**: Campo `orientation` añadido a los 7 perfiles mock con diversidad realista.
  8. **i18n**: Traducciones completas en español rioplatense e inglés.
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts` — Tipo `GenderInterest`, campos en `VesselProfile` y `FilterState`
  - `src/data/genderCatalog.ts` — Catálogo y función de matching
  - `src/context/domains/AuthContext.tsx` — Estado de onboarding y `genderInterests` en perfil
  - `src/components/auth/GenderInterestOnboardingModal.tsx` — Modal de onboarding
  - `src/app/page.tsx` — Montaje del modal
  - `src/context/domains/RadarMatrixContext.tsx` — Filtrado en `filteredProfiles`
  - `src/components/account/tabs/BioTab.tsx` — Edición de intereses
  - `src/components/filters/DynamicFilterDrawer.tsx` — Filtro temporal
  - `src/data/mockProfiles.ts` — Orientaciones de perfiles mock
  - `src/lib/i18n/translations.ts` — Traducciones es/en
  - `tests/unit/business/genderInterests.test.ts` — 19 tests unitarios
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 194 tests pasando (27 archivos), incluyendo 19 nuevos para `checkGenderInterestMatch`.
  - [x] Modal se dispara tras registro email y login Google.
  - [x] Filtrado funcional en RadarMatrix con prioridad drawer > perfil.
  - [x] Editable desde BioTab (persistente) y DynamicFilterDrawer (temporal).
  - [x] Traducciones i18n en español rioplatense e inglés con paridad de keys.
  - [x] Registrado en decisiones.md (ADR-087) y registro-de-features.md (FEAT-080).
  - [x] Sincronización en memoria Engram.

### [FEAT-079] · [2026-09-08] Rediseño Terminológico de la Consola de Presencia y Desambiguación de Inmediatez
- **Tipo**: `Enhancement (UX, Lenguaje & Coherencia Semántica)`
- **Módulo / Eje**: `Matriz & Radar`, `Consola de Presencia`, `i18n & Terminología`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de la colisión semántica en la consola táctica de disponibilidad (`StatusToggle.tsx`) y erradicación de expresiones coloquiales ambiguas:
  1. **Desambiguación de Presencia (`BodyState`) vs Impulso Temporal (`On-The-Clock`)**:
     - El encabezado de la consola pasa de "MI DISPONIBILIDAD" a **"MI ESTADO"** (`MY STATUS`), eliminando la redundancia de raíz.
     - El primer estado del segmented control pasa de "DISPONIBLE (Pinta algo ya)" a **"ACTIVO (Visible en radar)"** (inglés: *"ACTIVE • Visible on radar"*) e incorpora el ícono táctico `Activity` (pulso vital).
     - El botón lateral derecho retiene con exclusividad el término **"LISTO YA"** (`⚡ LISTO YA`), el ícono de rayo ⚡ y el anillo de reloj fucsia neón de 60 minutos. El usuario comprende al instante que "ACTIVO" indica que está navegando y visible en el radar, mientras que "LISTO YA" es un potenciador de urgencia para encuentros presenciales inmediatos.
  2. **Erradicación de "En una" y Sustitución por "OCUPADO"**:
     - El estado `occupied` pasa a rotularse inequívocamente como **"OCUPADO"** (subtítulo: *"No disponible"* / en inglés *"BUSY • Not available"*), eliminando de raíz la frase "En una", la cual en la jerga urbana/nocturna rioplatense posee una asociación directa e indeseada con el consumo de sustancias psicoactivas o estados alterados.
  3. **Sincronización Transversal del Ecosistema**:
     - `src/components/matrix/StatusToggle.tsx`: Nueva cabecera, segmented control (`ACTIVO`, `OCUPADO`, `INCÓGNITO`) y botón `LISTO YA`.
     - `src/lib/i18n/translations.ts`: Actualización de diccionarios en español e inglés (`bodyState`, `card`, `pulses`).
     - `src/components/matrix/ProfileCard.tsx`: Insignia y descripción de perfiles ocupados (`Ocupado • No disponible ahora`).
     - `src/components/profile/EditMockProfileModal.tsx`, `UserManagementTab.tsx`, `DashboardOverviewTab.tsx`: Textos actualizados sin rastros de "En una".
     - `tests/unit/ui/StatusToggle.test.tsx`, `tests/unit/ui/ProfileCard.test.tsx`, `tests/unit/i18n/translations.test.ts`: Suite de 175 tests unitarios verificada y pasando al 100%.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/StatusToggle.tsx`
  - `src/lib/i18n/translations.ts`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/profile/EditMockProfileModal.tsx`
  - `src/components/admin/tabs/UserManagementTab.tsx`
  - `src/components/admin/tabs/DashboardOverviewTab.tsx`
  - `tests/unit/ui/StatusToggle.test.tsx`
  - `tests/unit/ui/ProfileCard.test.tsx`
  - `tests/unit/i18n/translations.test.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de pruebas ejecutada y superada (`175 passed` en 26 archivos de test).
  - [x] Consistencia semántica total entre español e inglés.
  - [x] Registro en ADR (`ADR-086`) y Feature Ledger (`FEAT-079`).
| **FEAT-077** | 2026-09-08 | Matriz, Radar & Jerarquía de Monetización | `Enhancement (UX & Business Logic)` | Rediseño Terminológico de "Listo YA" y Prioridad Absoluta de Miembros sobre Boost en la Matriz (`ProfileGrid.tsx`, `StatusToggle.tsx`, `ProfileCard.tsx`, `translations.ts`): Sustitución del término anglicista y ambiguo "60M BOOST" por "LISTO YA" (inactivo: `⚡ LISTO YA`, activo: `⚡ LISTO YA · 59m`, filtro: `⚡ Listos YA`, badge: `⚡ LISTO YA`); e implementación de la jerarquía de 4 niveles en el ordenamiento de la matriz donde los usuarios con membresía Unlimited (`isUnlimited` / `userPlan`) se muestran SIEMPRE antes que los usuarios estándar con boost/Listo YA activado. | **100%** ✅ |
| **FEAT-076** | 2026-09-08 | Diario de Citas, Fisonomía & Privacidad Local | `Nueva Feature` | Carga de Foto para Contactos Externos en Diario (`CreateDiaryEntryModal.tsx`): Dropzone táctil con disparo nativo de cámara/galería y soporte drag-and-drop, compresión client-side en Canvas a WebP/JPEG (~30-50KB) previniendo desbordamiento de cuota, visualización de avatar en miniatura con reemplazo y eliminación, 4 presets tácticos opcionales, campo de edad opcional, persistencia en `entry.person.avatarUrl` y renderizado automático en Timeline, Calendario y Expediente de Contacto. | **100%** ✅ |

### [FEAT-078] · [2026-09-08] Anillo Fucsia Neón Dinámico con Depleción estilo Reloj para el Botón "Listo YA"
- **Tipo**: `Enhancement (Micro-interacción & Estética Táctica)`
- **Módulo / Eje**: `Matriz & Radar`, `Hardware Visual & Micro-interacciones`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del borde fucsia neón dinámico con depleción en sentido horario para el botón de inmediatez táctica "Listo YA" en la cabecera de la matriz (`StatusToggle.tsx`):
  1. **Alineación Cromática con Tarjetas de Usuario**:
     - Adopción de la paleta fucsia neón de alto impacto (`#ff007f`, `#ff2a85`) utilizada en el haz giratorio `.border-beam-fuchsia` de las tarjetas de perfil VIP.
     - En estado inactivo, el botón presenta un contorno fucsia sutil (`border-fuchsia-500/30`) con hover glow y el ícono Zap en fucsia neón de 14px.
  2. **Anillo Perimetral GPU con Conic Gradient**:
     - Utiliza la técnica de enmascaramiento perimetral estricta de 2px (`-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude`) sobre un contenedor absoluto con `border-radius: rounded-xl`.
     - Gradiente cónico `conic-gradient(from 0deg at 50% 50%, ...)` centrado con inicio a las 12 en punto (0° arriba).
  3. **Mecánica de Reloj de 60 Minutos (Depleción en Sentido Horario)**:
     - **Inicio Completo (0m transcurridos / 60m restantes)**: El borde se ilumina al 100% en todo su perímetro (360°) en fucsia neón radiante con drop-shadow glow doble.
     - **Avance Horario**: Conforme transcurren los minutos, el sector `[0°, elapsedDegrees]` se apaga (dejando un track oscuro tenue `rgba(255, 0, 127, 0.12)` que mantiene la silueta del botón), mientras la cabeza de la manecilla proyecta un destello blanco/rosa neón (`#ffffff` / `#ff2a85`) y el arco remanente `[elapsedDegrees, 360°]` continúa brillando en fucsia intenso.
     - **Sincronización en Tiempo Real**: Un efecto de intervalo de 1000ms recalcula la posición angular cada segundo para una fluidez visual continua. Muestra minutos (`60m`, `59m`...) y segundos en el último minuto (`45s`).
  4. **Suite de Pruebas**:
     - Creación de `tests/unit/ui/StatusToggle.test.tsx` con 5 tests unitarios verificando reposo, activación, anillo a los 60 min, cálculo angular a 180° a los 30 min y desactivación.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/StatusToggle.tsx`
  - `tests/unit/ui/StatusToggle.test.tsx`


### [FEAT-077] · [2026-09-08] Rediseño Terminológico a "Listo YA" y Jerarquía de Visibilidad (Miembros sobre Boost)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `UX Humana & Arquitectura de Monetización`
- **Módulo / Eje**: `Matriz & Radar`, `Monetización & Membresías`, `Lenguaje de Dominio & UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación de los dos requerimientos de experiencia y jerarquía comercial para el potenciador de inmediatez:
  1. **Alineación Terminológica Intuitiva ("LISTO YA")**:
     - Se reemplazó la etiqueta técnica y confusa `BOOST 60M` (que los usuarios interpretaban como metros o tokens de juego) por el término de dominio real de la comunidad gay/cruising: **`⚡ LISTO YA`**.
     - En estado inactivo: proyecta `⚡ LISTO YA`.
     - En estado activo: proyecta el temporizador con formato táctico legible `⚡ LISTO YA · 59m`.
     - En las tarjetas de la matriz (`ProfileCard.tsx`): la insignia superior izquierda se actualizó de `⚡ BOOST` a `⚡ LISTO YA`.
     - En los filtros rápidos (`ProfileGrid.tsx`): la píldora se renombró de `⚡ En Boost` a `⚡ Listos YA` (`Ready Now`).
     - Diccionario de i18n actualizado en Español e Inglés (`translations.ts`).
  2. **Jerarquía Comercial y Táctica en la Matriz (`ProfileGrid.tsx`)**:
     - Se implementó la función discriminante `getPriorityTier(profile)` que organiza la matriz en 4 niveles de visibilidad estricta antes de aplicar distancia o afinidad:
       - **Tier 4 (Prioridad Absoluta)**: Miembro Unlimited que además activó `Listo YA`.
       - **Tier 3 (Miembros VIP)**: Usuarios con membresía activa (`isUnlimited` / `userPlan === 'unlimited' | 'pro'`). Se ubican **invariablemente ANTES** que los usuarios estándar con boost.
       - **Tier 2 (Boost Inmediato Free)**: Usuarios estándar sin membresía que activaron `Listo YA` para destacarse temporalmente sobre los demás perfiles gratuitos.
       - **Tier 1 (Estándar)**: Usuarios normales ordenados por proximidad o disponibilidad.
     - Este ordenamiento se aplica de manera consistente en los 3 criterios de visualización (`distance`, `recent` y `affinity`).
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/matrix/StatusToggle.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/account/tabs/BioTab.tsx`
  - `src/lib/i18n/translations.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Validación estricta de TypeScript (`npm run typecheck` con 0 errores).
  - [x] Sin ejecución de `npm run build` en caliente (preservando el servidor dev en puerto 3001).
  - [x] Supresión completa de la terminología confusa "60M Boost".
  - [x] Garantía algorítmica de que ningún usuario gratuito con boost supera a un usuario con membresía de pago.
| **FEAT-075** | 2026-09-08 | Nightlife, Hardware & Señal Óptica | `Enhancement (Fucsia Neón & UX Nocturna)` | Rediseño Total de la Baliza Óptica (`OpticalBeaconModal.tsx`) adoptando la identidad cromática del Border Beam fucsia giratorio de las tarjetas de usuario (`#ff007f`, `#ff2a85`): erradicación total de estados negros muertos, marco perimetral con animación rotativa `border-beam-fuchsia`, modo linterna continuo 100% fucsia sin parpadeo, modo strobe rítmico (3.5 Hz) y ráfaga rave turbo (6.5 Hz). | **100%** ✅ |
| **FEAT-074** | 2026-09-08 | Perfil, UX/UI, Accesibilidad & Performance | `Enhancement (Desktop Layout & WCAG AAA)` | Adaptación Desktop Integral de `ProfileDetailModal` (contenedor responsivo hasta 6xl, layout editorial de 2 columnas independientes, tira de thumbnails, chevrons flotantes y dock inferior fijo); Solución estricta de contraste WCAG AAA para Green Flags seleccionadas en `ProfileDossierSection`; Depuración total del botón exportador JSON y código muerto en `DateDiaryView`; Elevación radiante de CTAs nucleares con nueva variante `amber` en `BrutalistButton` para "Activar On-The-Clock" y pase Unlimited con resplandor pulsante. | **100%** ✅ |

### [FEAT-076] · [2026-09-08] Carga y Optimización de Foto para Contactos Externos en el Diario de Encuentros
- **Tipo**: `Nueva Feature` / `Privacidad Local & UX de Encuentros`
- **Módulo / Eje**: `Diario & Salud`, `Logística & Encuentros`, `Fisonomía & Almacenamiento Local`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Incorporación completa de la capacidad de subir fotos o referencias fisionómicas al documentar encuentros con contactos fuera de la red Vessel ("Contacto Externo", Paso 1 del Diario):
  1. **Dropzone Táctil con Cámara y Galería**:
     - Botón / zona de arrastre con ícono de cámara y upload con respuesta háptica y auditiva (`audioEngine.playPulse()`).
     - Disparo directo del explorador de archivos o selector nativo de cámara/galería en smartphones mediante `<input type="file" accept="image/*" />`.
     - Soporte completo de drag-and-drop en desktop con retroalimentación visual reactiva.
  2. **Compresión Segura Client-Side en Canvas (`compressAvatarImage`)**:
     - Reducción inteligente de fotos de alta resolución (4K/12MP de 10-20MB) a avatares optimizados de máximo 640px en formato WebP/JPEG (~30-50KB).
     - Protege el almacenamiento local (`localStorage`) contra errores de desbordamiento de cuota (`QuotaExceededError`) y garantiza rendimiento instantáneo sin lag de red.
  3. **Visualización, Edición y Presets Tácticos**:
     - Previsualización inmediata en tarjeta redondeada con borde `electricViolet` y resplandor sutil.
     - Botones para "Reemplazar imagen" o "Eliminar foto" (`Trash2`).
     - 4 avatares tácticos cyberpunk predeterminados (*Cyber Mask, Shadow Profile, Urban Vibe, Tactical B&W*) para usuarios que prefieran no subir una foto facial real.
  4. **Ampliación de Ficha de Contacto**:
     - Agregado de campo opcional de Edad (`customAge`, 18-99 años) junto al selector de Rol Preferido.
     - Persistencia completa en `DiaryEntry.person.avatarUrl` y recuperación reactiva al editar entradas existentes.
  5. **Propagación Transversal**:
     - La foto se renderiza automáticamente en el Timeline del Diario (`DiaryTimeline.tsx`), en el Calendario Inteligente (`SmartCalendarGrid.tsx`), en la vista general (`DateDiaryView.tsx`) y en el expediente modal de inspección de contactos externos (`inspectExternalContact`).
- **Componentes & Archivos Clave**:
  - `src/components/diary/CreateDiaryEntryModal.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/diary/DiaryTimeline.tsx`
  - `src/components/diary/SmartCalendarGrid.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Validación estricta de TypeScript (`npm run typecheck` con 0 errores).
  - [x] Sin ejecución de `npm run build` en caliente (preservando el servidor dev en puerto 3001).
  - [x] Compresión Canvas en cliente previniendo desbordamiento de almacenamiento.
  - [x] Propagación reactiva a todas las vistas del diario.
  - [x] Garantía de privacidad local (no se transmite a perfiles públicos).
| **FEAT-073** | 2026-09-08 | Chat Darkroom, UI & Micro-Interacciones | `Enhancement (UX/UI & Interacción)` | Overhaul Integral de Chat Darkroom (Header despejado, layout Desktop 5xl adaptativo con Companion táctico), Sistema Unificado de Separadores `SectionHeroHeader` con 6 variantes semánticas, Elevación de CTAs y Suite Completa de Micro-interacciones Cinéticas (`BrutalistButton` con guardado/éxito, despegue de mensajes, ondas de pulso y rotación de candado). | **100%** ✅ |
| **ENH-026** | 2026-09-08 | Design System & Consistencia Visual | `Enhancement (Unificación Estética)` | Estandarización Total Dark Luxury / Berlin Queer y Erradicación Residual de `rawAmber` / `text-black`: Limpieza profunda y exhaustiva en más de 25 componentes y modales (SendMediaModal, Admin Console completa, Nightlife, Safety, Profile, Diary, Badges, Catálogos), garantizando 100% contraste WCAG AAA con `electricViolet` (`#8B5CF6`), `mintNeon` (`#10B981`) y `bloodNeon` (`#E61937`), con 0 errores de TypeScript. | **100%** ✅ |

### [FEAT-075] · [2026-09-08] Rediseño Integral de Baliza Óptica en Fucsia Neón (Border Beam Identity) y Linterna Continua
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Nightlife, UX Nocturna & Hardware Sync`
- **Módulo / Eje**: `Nightlife & Fiestas`, `Baliza Óptica`, `Design System & Hardware`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Transformación radical de `OpticalBeaconModal.tsx` en respuesta directa a la inutilidad de la pantalla que oscilaba a negro apagado en ambientes de club nocturno:
  1. **Identidad Fucsia Neón del Border Beam (`#ff007f` / `#ff2a85`)**:
     - Se sincronizó el color del faro visual con el gradiente icónico del borde giratorio de las tarjetas de perfil (`.border-beam-fuchsia`), logrando una emisión lumínica de alta potencia visible a través de humo, láseres y aglomeraciones.
  2. **Erradicación Absoluta de la Pantalla en Negro Muerto**:
     - En el modo estroboscópico, la pantalla jamás se apaga a negro; oscila entre fucsia neón de máxima saturación (`#ff007f`) y fucsia profundo luminoso (`#500028`), o ráfaga blanca en modo turbo, manteniendo la pantalla como un faro emisor constante.
  3. **Marco Giratorio `border-beam-fuchsia` en Tiempo Real**:
     - Se integró el borde perimetral animado que rota continuamente en los 4 bordes de la pantalla.
  4. **Modo Fucsia Continuo (Linterna 100% Sólida sin Parpadeo)**:
     - Permite mantener el teléfono en alto con pantalla fija fucsia neón continua, sin fatiga estroboscópica y con máximo alcance visual.
  5. **Selector de 4 Modos Tácticos**:
     - `⚡ Fucsia Strobe (3.5 Hz)` (Por defecto).
     - `💡 Fucsia Continuo (Linterna 100%)`.
     - `✨ Rave Turbo (6.5 Hz)` (Alternancia fucsia / blanco).
     - `🟣 Violeta Club (2.5 Hz)` (Berghain pulse).
- **Componentes & Archivos Clave**:
  - `src/components/nightlife/OpticalBeaconModal.tsx`
  - `src/components/nightlife/NightlifeEventsModal.tsx`
  - `src/components/nightlife/ClubFloorRadarModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Cero fases de pantalla negra apagada durante el uso de la baliza.
  - [x] Coherencia con el color del Border Beam de las tarjetas de usuario.

### [FEAT-074] · [2026-09-08] Modo Desktop en ProfileDetailModal, Contraste de Green Flags, Limpieza de JSON y Elevación Radiante de CTAs
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Accesibilidad WCAG, Responsive Desktop & Product Design`
- **Módulo / Eje**: `Perfil & Dossier`, `Diario & Salud`, `Design System & Componentes UI`, `Cuenta & On-The-Clock`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de los 5 requerimientos de experiencia, contraste y consistencia solicitados:
  1. **Auditoría Holística de Vistas y Consistencia de Diseño**: Armonización transversal con el estándar brutalista Dark Luxury / Berlin Queer y jerarquías semánticas mediante `SectionHeroHeader`.
  2. **Contraste WCAG AAA en Green Flags (`ProfileDossierSection.tsx`)**: Corrección de la ilegibilidad de píldoras verdes seleccionadas (donde texto oscuro sobre fondo oscuro impedía la lectura). Ahora utiliza `bg-emerald-500/25 text-emerald-100 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold ring-1 ring-emerald-400/40`, garantizando contraste superior a 10:1 sobre fondos obsidian.
  3. **Modo Desktop para Detalle de Perfil (`ProfileDetailModal.tsx`)**:
     - Expansión responsiva del contenedor de `max-w-lg` a `w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full md:h-[90vh] md:max-h-[920px] md:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)]`.
     - Layout editorial de 2 columnas independientes en desktop (`md:flex-row`):
       - **Columna Izquierda (~42%)**: Carrusel fotográfico hero con chevrons de navegación en hover, tira de miniaturas para cambio rápido, overlay identitario, HUD táctico de 4 pilares, tarjeta sensorial unificada de Audio (Voice Vibe, Audio Note, Clima Sonoro) y medidor de señal carnal directa (`FillMeter`).
       - **Columna Derecha (~58%)**: Banner de distancia / sintonía mutua, Suite Táctica del Encuentro (On-The-Clock, Kink Matrix, HostCard, ExitProtocol, Pre-Flight, En-Route), Dossier privado con notas y flags, estadísticas físicas y de salud, energía deseada, intenciones, límites, biografía, catálogo kink, testimonios y media vault privado.
       - **Dock de Acciones Inferior**: Barra persistente en la base con botones de pulso táctico, envío de ubicación y PIN con etiquetas legibles en desktop, diario de encuentros y apertura de chat / pase Unlimited.
  4. **Eliminación del Botón JSON y Depuración de Código Muerto (`DateDiaryView.tsx`)**:
     - Remoción completa del botón de exportación `JSON`, separador de barra, handler `handleExportJson`, estado reactivo `exportToastVisible`, banner toast y el ícono `Download` no utilizado.
  5. **Elevación Radiante de CTAs Nucleares**:
     - Incorporación de la variante `amber` en `BrutalistButton.tsx` (`bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-obsidian-deep hover:from-amber-400 hover:to-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)]`).
     - Botón "ACTIVAR ON-THE-CLOCK (60 MINUTOS)" en `BioTab.tsx` actualizado a `variant="amber" size="lg"` con resplandor dorado y animación pulsante de rayo.
     - Botón de membresía Unlimited en `UserAlbumManager.tsx` potenciado con gradiente violeta eléctrico, corona dorada pulsante y sombra perimetral de alta atracción visual.
- **Componentes & Archivos Clave**:
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/profile/ProfileDossierSection.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/account/tabs/BioTab.tsx`
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/ui/BrutalistButton.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Validación estricta de TypeScript (`npm run typecheck` con 0 errores).
  - [x] Sin ejecución indebida de `npm run build` en caliente (preservando el servidor dev en puerto 3001).
  - [x] Verificación de contraste accesible WCAG AAA en flags y píldoras interactivas.
  - [x] Soporte responsivo validado en resoluciones móviles y pantallas de escritorio.
  - [x] Registro histórico sincronizado en `registro-de-features.md`, `decisiones.md` y memoria Engram.

### [FEAT-073] · [2026-09-08] Overhaul Integral Darkroom Chat Desktop/Mobile, Separadores Semánticos `SectionHeroHeader` y Micro-Interacciones Cinéticas
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Design System, UX/UI & Micro-Interacciones`
- **Módulo / Eje**: `Chat Darkroom`, `Design System`, `Pulsos`, `Perfil & Protocolo`, `Diario & Salud`, `Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación completa de los 5 requerimientos de modernización UI/UX bajo lineamientos Impeccable UI, Gestalt y Dark Luxury:
  1. **Rediseño del Header de Chat Darkroom**: Eliminación del hacinamiento visual. Ahora se estructura en 2 líneas limpias sin colisiones (Línea 1: Alias principal sin recortar + edad + badge de verificación + karma discreto; Línea 2: Rol • Distancia • Hospedaje + píldora `⚡ YA`). Tapping en el avatar o identidad abre la ficha completa del perfil.
  2. **Experiencia Desktop Responsiva para Darkroom**: Se transformó el modal móvil en un contenedor expandido (`w-full max-w-lg md:max-w-4xl lg:max-w-5xl md:h-[92vh]`) con Desktop Tactical Companion (`hidden lg:flex w-80`) que muestra previsualización fotográfica, barra de Karma, suite de acciones tácticas rápidas (Pre-Flight, ETA, Guardián SOS, Diario, Ficha) y estado de acuerdos mutuos.
  3. **Separadores Semánticos con `SectionHeroHeader`**: Creación del componente estándar `SectionHeroHeader.tsx` con 6 variantes cromáticas (`violet`, `mint`, `blood`, `amber`, `cyan`, `neutral`) desplegado en DateDiaryView, PulsesView, ProtocolView, BioTab, KinksTab, ReputationTab y BoundariesTab.
  4. **Estandarización y Elevación de CTAs Principales**: Refuerzo de jerarquías de botones de acción con resplandores `shadow-violet-soft`, gradientes y tamaños táctiles ergonómicos (>= 44px).
  5. **Suite de Micro-interacciones Cinéticas**:
     - `BrutalistButton` con soporte nativo de estados `isSaving` y `isSuccess`, spinner de carga, morph a checkmark con zoom y feedback auditivo (`audioEngine.playSuccess`).
     - Botón de envío de mensajes en Darkroom con animación de despegue cinético (`animate-plane-launch`).
     - Botón de retención temporal con rotación háptica de candado (`animate-lock-rotate`).
     - Botones de pulsos en `ProfileCard` y `PulsesView` con onda radial expansiva (`animate-pulse-wave`) y rebote de íconos.
- **Componentes & Archivos Clave**:
  - `src/components/ui/SectionHeroHeader.tsx`
  - `src/components/ui/BrutalistButton.tsx`
  - `src/components/ui/index.ts`
  - `src/app/globals.css`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/pulses/PulsesView.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/account/tabs/BioTab.tsx`
  - `src/components/account/tabs/KinksTab.tsx`
  - `src/components/account/tabs/ReputationTab.tsx`
  - `src/components/account/tabs/BoundariesTab.tsx`
  - `src/components/matrix/ProfileCard.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Header de Darkroom legible sin truncamientos forzados.
  - [x] Modal de chat expandible y responsivo en pantallas desktop.
  - [x] Separadores `SectionHeroHeader` integrados con variantes semánticas coherentes.
  - [x] Micro-interacciones verificadas con CSS keyframes y estados reactivos.
| **ENH-025** | 2026-09-08 | Diseño, UI & Arquitectura de Navegación | `Enhancement (Rediseño/Design System)` | Erradicación Total de Estética Grindr, Nueva Paleta Dark Luxury / Berlin Queer (`electricViolet`, `bloodNeon`, `mintNeon`, `champagneGold`), Garantía Arquitectónica Global de Contraste y Rediseño de Flujo e Identidad del Header (Consola de Emisión de Disponibilidad vs Barra de Búsqueda y Filtros Rápidos). | **100%** ✅ |
| **DEL-001** | 2026-09-08 | Navegación & Core | `Enhancement (Poda/Limpieza)` | Erradicación de la Pestaña Radar, Rediseño de Navegación a 5 Columnas y Poda de Código Muerto: Eliminación de la vista Radar por redundancia con la visualización de distancia en tiempo real en la Matriz. Reconfiguración de `BrutalistNav` a `grid-cols-5` (+20% touch target), eliminación física de `RadarSweep.tsx` y `TacticalHotspotsOverlay.tsx` (>52 KB podados), depuración de accesos directos en Matrix, Pulsos y Chat, y limpieza simétrica en `translations.ts` (es/en). | **100%** ✅ |
| **FIX-042** | 2026-09-08 | UX & UI / Dashboard Encuentros | `Bug Fix (Corrección)` | Auditoría Impeccable UI & Corrección de Desborde del Botón `+ DOCUMENTAR ENCUENTRO`: Resolución de colisión de anchos mediante contenedor responsivo `max-w-4xl mx-auto`, creación de cápsula dock táctica para utilidades secundarias (`Doxy-PEP`, `Alerta ITS`, `JSON`), prevención de sangrado con `overflow-hidden`, formateo estricto del KPI de valoración (`★ 5.0 / 5.0`), refinamiento de ribbon de tags comunitarios y botones de visibilidad con iconos reactivos (`Eye`/`EyeOff`). | **100%** ✅ |

### [ENH-026] · [2026-09-08] Estandarización Total Dark Luxury / Berlin Queer & Erradicación Residual de `rawAmber` y `text-black`
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Design System, Accesibilidad WCAG & Consistencia UI`
- **Módulo / Eje**: `Estilos & UI`, `Design System`, `Admin Console`, `Chat Darkroom`, `Nightlife & Radar`, `Seguridad & Salud`, `Perfil & Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Fase final de purga y unificación estética para eliminar el 100% de las apariciones residuales de colores amarillos (`rawAmber`, `amber-500`, `#f8c513`), clases de texto negro ilegible (`text-black`) sobre fondos oscuros o violetas, y selectores no alineados en la totalidad de la base de código de VESSEL:
  1. **Purga Exhaustiva de Componentes (Más de 25 archivos saneados)**:
     - **Chat & Medios**: `SendMediaModal.tsx` (dropzone, transmisiones, pestañas, álbumes, epígrafe), `ChatMediaViewerModal.tsx` (focus rings), `BoundaryManagerModal.tsx` (hover tácticos).
     - **Consola de Administración Ops**: `app/admin/page.tsx` (ping de inicio y selección de texto), `AdminHeader.tsx` (logos, roles, selector de empleados RBAC), `AdminNav.tsx` (pestañas activas en `bg-electricViolet text-white font-bold shadow-violet-soft`), `DashboardOverviewTab.tsx` (KPIs, barras de estado corporal, demografía sexual, botones de navegación), `UserManagementTab.tsx` (búsqueda, filtros, karma, biometría), `MembershipsTab.tsx`, `StaffManagementTab.tsx`, `AuditLogsTab.tsx`, `ModerationTab.tsx`.
     - **Nightlife & Radar**: `NightlifeEventsModal.tsx` (cabeceras, tags BSAS, eventos en tarjeta), `ClubFloorRadarModal.tsx` (radar de pista, micro-zonas, perfiles en boliche), `OpticalBeaconModal.tsx` (migrado modo ámbar a modo violeta estroboscópico `strobeMode: "violet"` con `bg-electricViolet text-white`), `AfterHoursModal.tsx`, `MissedConnectionsModal.tsx`, `EventDetailModal.tsx`.
     - **Salud & Seguridad**: `SafetyBeaconModal.tsx` (PIN, duraciones, inputs de emergencia), `HarmReductionModal.tsx` (registros de dosis), `DuressPinSettingsModal.tsx`, `LivenessVerificationModal.tsx`, `ItsExposureModal.tsx`.
     - **Perfil & Matriz**: `ProfileCard.tsx` (chips de ID, nota de voz, tag de señal remota, custom alias, encuentros verificados), `ProfileDetailModal.tsx` (pilar de protocolo de salida táctico, importación de iconos), `ExitProtocolBadge.tsx` (estandarización a `electricViolet` y `shadow-violet-soft`).
     - **UI Base & Catálogos**: `TacticalBadge.tsx` (variante ámbar migrada a `champagneGold`), `dossierCatalog.ts` (badges de calificaciones a `text-obsidian-deep font-black`), `DynamicFilterDrawer.tsx` (píldoras de rol unificadas a `bg-electricViolet text-white font-bold`).
  2. **Garantía de Contraste y Accesibilidad WCAG**:
     - Cero botones con `text-black` sobre fondos `electricViolet` o púrpuras.
     - Botones y tabs activos: obligatoriamente `text-white font-bold` (o `font-black`) con `shadow-violet-soft`.
     - Insignias y botones de alta luminancia (`mintNeon`, `cyan-500`): texto `text-obsidian-deep font-black`.
     - Puntuación por estrellas: ícono `text-amber-400 fill-amber-400` acompañado de texto `text-white font-bold`.
  3. **Verificación Estricta & Compilación**:
     - `npm run typecheck` (`npx tsc --noEmit`) verificado con 0 errores de TypeScript en todo el proyecto.
- **Componentes & Archivos Clave**:
  - `src/components/chat/SendMediaModal.tsx`
  - `src/components/chat/ChatMediaViewerModal.tsx`
  - `src/components/chat/BoundaryManagerModal.tsx`
  - `src/app/admin/page.tsx`
  - `src/components/admin/AdminHeader.tsx`
  - `src/components/admin/AdminNav.tsx`
  - `src/components/admin/tabs/DashboardOverviewTab.tsx`
  - `src/components/admin/tabs/UserManagementTab.tsx`
  - `src/components/admin/tabs/MembershipsTab.tsx`
  - `src/components/admin/tabs/StaffManagementTab.tsx`
  - `src/components/admin/tabs/AuditLogsTab.tsx`
  - `src/components/admin/tabs/ModerationTab.tsx`
  - `src/components/nightlife/NightlifeEventsModal.tsx`
  - `src/components/nightlife/ClubFloorRadarModal.tsx`
  - `src/components/nightlife/OpticalBeaconModal.tsx`
  - `src/components/nightlife/AfterHoursModal.tsx`
  - `src/components/nightlife/MissedConnectionsModal.tsx`
  - `src/components/nightlife/EventDetailModal.tsx`
  - `src/components/safety/SafetyBeaconModal.tsx`
  - `src/components/safety/HarmReductionModal.tsx`
  - `src/components/safety/DuressPinSettingsModal.tsx`
  - `src/components/diary/ItsExposureModal.tsx`
  - `src/components/diary/DiaryInsights.tsx`
  - `src/components/diary/DiaryTimeline.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/profile/ExitProtocolBadge.tsx`
  - `src/components/radar/GeoBatteryModal.tsx`
  - `src/components/settings/AppSettingsModal.tsx`
  - `src/components/settings/AppModeModal.tsx`
  - `src/components/ui/TacticalBadge.tsx`
  - `src/data/dossierCatalog.ts`
  - `src/components/filters/DynamicFilterDrawer.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Eliminación total y verificada de clases `rawAmber` en componentes.
  - [x] Contraste estricto y legibilidad accesible WCAG AAA en todos los botones y píldoras.
  - [x] Preservación de la regla de oro: servidor dev intacto sin ejecutar `npm run build` en caliente.

### [ENH-025] · [2026-09-08] Erradicación Total de Estética Grindr, Nueva Paleta Dark Luxury / Berlin Queer & Rediseño de Flujo e Identidad del Header
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Design Tokens, UX & Arquitectura de Navegación`
- **Módulo / Eje**: `Estilos & UI`, `Design System`, `Matriz`, `Chat Darkroom`, `Pulsos`, `Navegación & Core`, `Ergonomía Mobile`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución integral del requerimiento de diseño y experiencia de usuario para diferenciar radicalmente a VESSEL de la estética comercial de Grindr (amarillo `#f8c513` con botones negros) y solucionar la confusión operativa en la cabecera entre el estado de disponibilidad del usuario y la búsqueda/filtros de perfiles:
  1. **Paleta Oficial Dark Luxury / Berlin Queer**:
     - *Electric Violet* (`#8B5CF6`, glow `#A78BFA`): Color de acción principal para CTAs primarios, sintonía, selección y botones.
     - *Mint Neon* (`#10B981`, glow `rgba(16,185,129,0.4)`): Verificación 3D liveness, estado activo y sintonía mutua.
     - *Blood Neon* (`#E61937`, glow `rgba(230,25,55,0.4)`): Fetiches extremos, alertas de seguridad (Duress PIN), guardianes y estados ocupados.
     - *Champagne Gold* (`#D4AF37`): Membresías VESSEL UNLIMITED, super-likes y credenciales VIP.
     - *Obsidian Deep* (`#040405` a `#09090B`): Fondos ultra oscuros que eliminan los marrones amarillentos y garantizan contraste OLED.
  2. **Garantía Arquitectónica Global en Design Tokens**:
     - Remapeo completo de la escala `amber` (50 a 950) en `tailwind.config.ts` hacia el espectro de violetas eléctricos y púrpuras nocturnos, de modo que cualquier componente o clase de respaldo compile automáticamente al nuevo tema.
     - Regla de contraste global en `src/app/globals.css` asegurando que ninguna clase con fondo de acento (`bg-rawAmber`, `bg-electricViolet`, `bg-amber-500`, etc.) use texto negro (`text-black`), forzando tipografía blanca pura de alto contraste.
  3. **Migración Exhaustiva de Vistas & Modales**:
     - Actualización integral en `PulsesView.tsx`, `DarkroomListView.tsx`, `DarkroomChatModal.tsx` (burbujas de mensaje enviadas violetas con texto blanco, waypoints en 2 fases, botones tácticos), `PreFlightCard.tsx`, `PreFlightChecklistModal.tsx`, `DynamicFilterDrawer.tsx`, `HostCardModal.tsx`, `SessionRoomModal.tsx`, `ProfileDetailModal.tsx` (botón principal de chat y desbloqueo Unlimited), y `UnlimitedPaywallModal.tsx`.
  4. **Rediseño de Flujo e Identidad del Header (Desacople Cognitivo)**:
     - **Bloque A - Consola de Emisión de Disponibilidad (`StatusToggle.tsx`)**: Reconfigurado como una tarjeta flotante encapsulada con borde violeta táctico (`bg-gradient-to-r from-purple-950/30 via-obsidian-surface/90 to-purple-950/30 border-electricViolet/25`). Incorpora rótulo semántico `📡 MI DISPONIBILIDAD — ¿Qué pinta para vos hoy? (Cómo te ven otros)` con estados claros: `🟢 DISPONIBLE (Pinta algo ya)`, `🔴 EN UNA (Ocupado)` e `👁️ INCÓGNITO (Modo fantasma)`. El usuario comprende al instante que este bloque gobierna su presencia saliente.
     - **Bloque B - Explorador del Radar (`ProfileGrid.tsx`)**: Barra sticky de búsqueda de otros perfiles con botón de filtros claramente rotulado, pista horizontal con micro-etiqueta semántica `⚡ Filtrar:` para las píldoras de 1-toque, y barra de telemetría inferior con conteo de perfiles encontrados y selector de orden (`ORDEN: 📍 Cerca, ⚡ Activos, 🔥 Afinidad`).
- **Componentes & Archivos Clave**:
  - `tailwind.config.ts`
  - `src/app/globals.css`
  - `src/components/matrix/StatusToggle.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/pulses/PulsesView.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/chat/PreFlightCard.tsx`
  - `src/components/chat/PreFlightChecklistModal.tsx`
  - `src/components/filters/DynamicFilterDrawer.tsx`
  - `src/components/logistics/HostCardModal.tsx`
  - `src/components/cruising/SessionRoomModal.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/subscription/UnlimitedPaywallModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Eliminación del 100% de combinaciones amarillo/negro tipo Grindr.
  - [x] Contraste WCAG AAA en textos primarios sobre acentos (`text-white` en fondos violetas).
  - [x] Separación cognitiva y semántica de bloques de cabecera comprobada.
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Poda & Depuración de Arquitectura`
- **Módulo / Eje**: `Navegación & Core`, `Matriz`, `UX & UI Brutalista`, `Ergonomía Mobile`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Tras el requerimiento del usuario y análisis de redundancia funcional, se eliminó por completo la vista "Radar", dado que la distancia relativa calculada y ofuscada por celdas Google S2 (~152m) ya está permanentemente visible en tiempo real en la vista principal Matriz/ProfileGrid:
  1. **Ajuste del Modelo de Navegación**: Se acotó el tipo discriminado `ActiveNavView` en `src/types/vessel.ts` a 5 estados: `"grid" | "pulses" | "chat" | "diary" | "account"`.
  2. **Ergonomía de Bottom Nav en 5 Columnas**: `BrutalistNav.tsx` pasó de `grid-cols-6` a `grid-cols-5`. Cada pestaña ganó un ~20% más de ancho efectivo, elevando significativamente el área táctil y la comodidad en pantallas táctiles de una sola mano. Se suprimieron el ícono `Radio` y el badge de ping radar.
  3. **Poda de Archivos & Código Muerto (>52 KB)**: Se eliminaron del repositorio `src/components/radar/RadarSweep.tsx` (~850 líneas, 46.4 KB) y `src/components/radar/TacticalHotspotsOverlay.tsx` (160 líneas, 6.5 KB), eliminando listeners de animación continua y complejidad innecesaria.
  4. **Saneamiento de Accesos Rápidos**:
     - Eliminado el botón con ícono de radio en la barra de búsqueda de `ProfileGrid.tsx`.
     - Reemplazados los accesos a radar en estados vacíos de `PulsesView.tsx` y `DarkroomListView.tsx` por "Explorar Cerca" y "Explorar Perfiles" apuntando a la matriz.
     - Removido el import dinámico de `RadarSweep` y la condición de render en `src/app/page.tsx`.
  5. **Depuración i18n**: Eliminadas las claves `nav.radar` y los bloques `radar: { ... }` en `translations.ts` preservando estricta paridad bilingüe (es/en).
  6. **Preservación Táctica**: Los módulos de seguridad y ruta activa (`EnRouteBanner.tsx`, `EnRouteTrackerModal.tsx`, `GeoBatteryModal.tsx`, `TravelModeModal.tsx`) en `src/components/radar/` se conservan 100% funcionales.
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts`
  - `src/components/navigation/BrutalistNav.tsx`
  - `src/app/page.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/pulses/PulsesView.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/lib/i18n/translations.ts`
  - `tests/unit/geo/BatteryStateEngine.test.ts`
  - `tests/unit/i18n/translations.test.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 168 tests automatizados ejecutados y aprobados (`npx vitest run`).
  - [x] Saneamiento completo de código muerto y eliminación de archivos sin impacto colateral.
  - [x] Navegación verificada en navegador real con Chrome DevTools.

| **FEAT-084** | 2026-09-08 | Encuentros & Telemetría | `Nueva Feature` | Rediseño Integral de la Sección "Encuentros" (Fin del "Diario" / Calendario): Transformación a Dashboard Táctico de Encuentros con Bento Grid de 4 KPIs, módulo de "Valoraciones Sobre Mí" (Doble Consentimiento y Respect Karma), feed cronológico con rostros de contactos y acceso 1-tap a perfiles, filtrado quirúrgico por fechas (presets 7d/30d/año y selector de rango personalizado), Botiquín Doxy-PEP y exportación cifrada JSON. | **100%** ✅ |
| **ENH-024** | 2026-09-08 | Presentación & Pitch Deck | `Enhancement` | Especialización Dual de la Presentación (Bifurcación Dinámica): (1) Vista de Usuario Hiper-Atractiva: erradicación de ruido financiero/TAM, foco en cero fakes, protocolos de salida sin sorpresas, fotos blindadas anti-capturas, cruces en boliches, tabla comparativa directa y onboarding en 3 pasos; (2) Vista de Inversor Exhaustiva: métricas de grado VC, CAC blend $0.45, LTV $68.50, ratio LTV/CAC 15.2x, 4 pilares de ingresos, simulador ARR interactivo, 4 fosos defensivos y ronda semilla $2.5M USD | **100%** ✅ |

### [FIX-042] · [2026-09-08] Auditoría Impeccable UI & Corrección de Desborde del Botón de Encuentros
- **Tipo**: `Bug Fix (Corrección)` / `UX & UI Brutalista`
- **Módulo / Eje**: `Diario & Salud`, `UX & UI Brutalista`, `Ergonomía Mobile`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Tras una auditoría visual bajo principios Impeccable UI y la captura remitida por el usuario (`media_1788877852238.png`), se identificó y erradicó el desborde horizontal del botón principal `+ DOCUMENTAR ENCUENTRO` en `DateDiaryView.tsx`:
  1. **Causa Raíz Identificada**: El contenedor raíz carecía de la restricción `max-w-4xl mx-auto` utilizada en `BrutalistHeader` y `BrutalistNav`, y la botonera superior forzaba `sm:flex-nowrap`, obligando a 4 botones a convivir en una sola fila horizontal junto al bloque de títulos, superando el ancho útil en ~66px y expulsando el botón fuera del borde derecho.
  2. **Cápsula Dock Táctica de Utilidades**: Las acciones secundarias (`Doxy-PEP`, `Alerta ITS` y `Exportar JSON`) se unificaron en una elegante cápsula táctica con fondo translúcido (`bg-black/60 border border-white/10`), divisores de 1px e iconos vectoriales de precisión (`HeartPulse`, `ShieldAlert`, `Download`).
  3. **Comportamiento Responsivo Infalible**: Reconfiguración a `flex-col xl:flex-row` con `overflow-hidden relative` en la tarjeta y `whitespace-nowrap flex-shrink-0` en el CTA principal, garantizando contención perfecta tanto en ultra-wide como en tablets y móviles estrechos (390px).
  4. **Pulido Impeccable de Telemetría**: El KPI 3 de valoración se formateó estrictamente a un decimal (`★ 5.0 / 5.0` en lugar del discordante `★ 5 / 5.0`).
  5. **Ribbon de Tags & Controles de Visibilidad**: Scroll horizontal sin barras en tags comunitarios otorgados y estilización de grado Dark Luxury para los botones `[Ocultar] / [Hacer Público]` con iconos de estado `Eye` y `EyeOff`.
- **Componentes & Archivos Clave**:
  - `src/components/diary/DateDiaryView.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 168 tests automatizados ejecutados y aprobados (`npm run test`).
  - [x] Inspección visual y capturas multi-resolución (Desktop 1280px y Mobile 390px) con Chrome DevTools.

### [FEAT-084] · [2026-09-08] Rediseño Integral de la Sección "Encuentros" (Dashboard Táctico de Encuentros & Reputación)
- **Tipo**: `Nueva Feature` / `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Diario & Salud`, `Logística & Encuentros`, `UX & UI Brutalista`, `Reputación & Karma`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Transformación profunda de la antigua pestaña "Diario" hacia el nuevo **Dashboard Táctico de Encuentros** ("Encuentros" en Bottom Nav // "Bitácora // Encuentros" en cabecera):
  1. **Eliminación del Calendario y Sub-pestañas Obsoletas**: Se retira la grilla mensual tipo calendario de oficina (`SmartCalendarGrid`) y las sub-pestañas fragmentadas, unificando toda la experiencia en un flujo de dashboard continuo de lectura rápida (<200 ms).
  2. **Bento Grid de Telemetría (4 KPIs Clave)**: Total de encuentros concretados vs agendados, puntaje de Respect Karma (cultura Anti-Ghost), promedio de valoraciones comunitarias sobre mí (estrellas) y tasa de repetición/química.
  3. **Módulo de "Valoraciones de la Comunidad Sobre Mí" (Doble Consentimiento)**: Desglose de testimonios recibidos de otros Vessels validados por proximidad o PIN, con foto del autor y enlace directo a su perfil, estrellas, tags comunitarios otorgados y switch en 1-tap para definir si la reseña es pública en el perfil o privada.
  4. **Feed Cronológico de Encuentros con Rostros**: Cada tarjeta destaca la foto del encuentro (56px) con anillo semáforo de estado corporal (`open`, `occupied`, `dormant`), botón de acceso directo al expediente de perfil en la matriz (`setSelectedProfile`), protocolos de salida acordados (`ExitProtocol`), tags, y notas confidenciales protegidas por AES-256 con toggle de revelado.
  5. **Filtrado Avanzado por Fecha**: Chips de presets táctiles (Todos, Últimos 7 días, Últimos 30 días, Este año), acordeón de rango personalizado (`Desde` / `Hasta` con botón de limpieza), filtros secundarios (Concretados, Agendados, Top 5★) y buscador en tiempo real.
  6. **Herramientas de Salud Preventiva & Backup**: Botiquín táctico Doxy-PEP integrado, botón de alerta clínica anónima de ITS y exportador local-first de la bitácora cifrada a formato JSON.
- **Componentes & Archivos Clave**:
  - `src/components/diary/DateDiaryView.tsx` (Reescritura completa del dashboard).
  - `src/components/navigation/BrutalistNav.tsx` (Actualización de rótulo e icono táctico `UserCheck`).
  - `src/lib/i18n/translations.ts` (Nuevas cadenas bilingües con paridad estricta `es` / `en`).
  - `src/types/vessel.ts` (Extensión de `EncounterTestimonial` con rating y karma).
  - `src/data/mockMyTestimonials.ts` (Datos de muestra de testimonios recibidos).
  - `src/context/domains/DiaryContext.tsx` (Hidratación y sincronización en almacenamiento local).
  - `tests/unit/ui/DateDiaryView.test.tsx` (Suite de 6 tests de integración de interfaz).
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 168 tests automatizados ejecutados y aprobados (`npm run test`).
  - [x] Paridad estricta entre diccionarios de traducción (`translations.test.ts`).
  - [x] Estados interactivos comprobados (Default, Hover, Focus, Active).
| **ENH-023** | 2026-09-08 | Presentación & Pitch Deck | `Enhancement` | Sincronización 100% de Presentación Ejecutiva: Logo Neón Oficial en Hero Brutalista con retroiluminación difusa, Matriz Interactiva de 72 Features (9 dominios), Simulador de 7 Pantallas (Klaus VIP con GPU beam, Radar, Nightlife, Profile, Chat, Portal /admin OPS Command y Bóvedas IndexedDB con revocación 1-tap) y Battlecard enriquecida | **100%** ✅ |

### [ENH-024] · [2026-09-08] Especialización Dual de la Presentación: Vista de Usuario Hiper-Atractiva vs Suite Exhaustiva para Inversores
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Presentación & Pitch Deck`
- **Módulo / Eje**: `Presentación Ejecutiva`, `UX & Copywriting`, `Branding & Visuals`, `Monetización & Métricas`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Transformación de la presentación estática en un sistema dinámico de doble lente adaptado a dos audiencias radicalmente distintas:
  1. **Vista de Usuario (Ultra Atractiva, Sin Fricción Corporativa)**:
     - Erradicación total de métricas financieras que no interesan al usuario final (se ocultan TAM $3.8B, ARR calculator, EBITDA, unit economics y ronda semilla).
     - Hero seductor enfocado en sus deseos y problemas reales: *"Tus encuentros, sin vueltas. Fotos blindadas. Tipos reales. Tu noche garantizada."*
     - 4 Tarjetas de beneficios concretos: (1) Cero Fakes (100% tipos reales verificados en 3D), (2) Protocolo de salida público (sabés qué busca antes de hablar), (3) Fotos blindadas sin capturas (DRM Blackout), (4) Cruces en la pista 48h (reconectar tras boliches).
     - Matriz de 72 Features reescrita con foco en *"Qué ganás vos"* y categorías amigables (Fiestas & Boliches, Citas & Logística, Fotos Blindadas, Cuidados, etc.).
     - Battlecard de usuario directa: contrastando situaciones cotidianas contra Grindr (fakes, capturas de nudes, saber qué busca, saber si tiene lugar, modo camaleón).
     - Sección de cierre orientada a conversión: Onboarding en 3 pasos, accesos directos a la App y PWA, y FAQ de usuario.
  2. **Vista de Inversor (Exhaustiva, Rigor de Venture Capital)**:
     - Tesis estratégica sobre las vulnerabilidades de Grindr (churn 18%, multas GDPR, dependencia de publicidad).
     - Unit Economics detallados: CAC Blend $0.45 USD (orgánico), LTV $68.50 USD, Ratio LTV/CAC 15.2x, Churn &lt; 4.2%, Payback &lt; 1.2 meses.
     - 4 Fuentes de ingresos explicadas (SaaS Unlimited $14.99, Micro-pases nocturnos $1.99/$2.99, B2B venues $250-$1,500/mes, créditos tácticos).
     - Calculadora interactiva de ARR con sliders para MAU, tasa de conversión, micro-pases y locales, con tabla de crecimiento a 3 años ($1.45M -> $6.8M -> $26.5M).
     - Desglose formal de la Ronda Semilla de $2.5M USD (15% equity / SAFE post-money cap $16.6M) con asignación de fondos en 4 partes (45% I+D, 30% GTM, 15% Legal/Compliance, 10% Runway).
  3. **Conmutador Segmentado & Enrutamiento Reactivo**:
     - Botonera segmentada de alta visibilidad en cabecera fija (`[⚡ USUARIOS]` vs `[💼 INVERSORES]`) y banner en Hero.
     - Soporte para parámetros de URL (`?mode=user` / `?mode=investor` y `#user` / `#investor`) con actualización de historial sin recargas.
     - Audio feedback sub-bass analógico (60Hz) en cada transición.
- **Componentes & Archivos Clave**:
  - `presentation/index.html`
  - `public/investors/index.html`
  - `scratch/build_dual_presentation.py`
  - `scratch/features_data.json`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] 162/162 pruebas unitarias pasando al 100% en Vitest.
  - [x] Verificación visual y funcional en Chrome DevTools de ambos modos.
  - [x] Paridad absoluta de bytes entre copias local y servida.
| **FEAT-072** | 2026-09-08 | Administración & Staff | `Nueva Feature` | Portal de Administración & Empleados (VESSEL OPS // COMMAND): Dashboard analítico de telemetría y KPIs en tiempo real (MRR, Usuarios, Duress PIN, Respect Karma), Gestión 360° de usuarios y biometría, Administración de Membresías (VESSEL UNLIMITED) y cuotas globales, Cola de moderación/denuncias, RBAC (Superadmin, Moderator, Support) y registro de auditoría inmutable en ruta /admin. | **100%** ✅ |
| **ENH-022** | 2026-09-08 | Matriz & UI Táctica | `Enhancement` | Optimización de Borde Neón Rotativo GPU & Arquitectura Elástica de la Píldora de Protocolo: (1) Definición explícita de keyframes `border-beam-spin` centrados (translate + rotate a 8s) inmunes a purga de Tailwind, (2) Contención elástica de la píldora de protocolo (`max-w-full`, preservación de ancho <=125px) que previene cortes visuales agrupando extras en chip `+N` cuando coinciden Protocolo y Verificación, y (3) Jerarquía informativa enriquecida en el popover interno destacando expectativas de salida | **100%** ✅ |

### [ENH-023] · [2026-09-08] Sincronización 100% de la Presentación Ejecutiva, Logo Neón en Hero Brutalista & 72 Features Activas
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Presentación & Pitch Deck`
- **Módulo / Eje**: `Presentación Ejecutiva`, `Branding & Visuals`, `Matriz & Grilla`, `Administración & Staff`, `Seguridad & DRM`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Actualización integral de la presentación ejecutiva e interactiva de VESSEL (`presentation/index.html` y `public/investors/index.html`) para reflejar al 100% el estado real de la aplicación, incorporando los últimos avances arquitectónicos y de producto:
  1. **Hero Brutalista con Logo Neón Oficial**:
     - Integración del isotipo y logotipo oficial en neón (`brand/vessel-logo.jpg`) con marco HUD táctico, scanlines sutiles y halo difuso `bloodNeon` (`shadow-[0_0_60px_rgba(255,26,83,0.35)]`).
     - Badges tácticos de cabecera: `72 FEATURES ACTIVE // LOCAL-FIRST ZK`, `ONE FACE = ONE RECEPTACLE`, `VERIFIED RECEPTACLE GRID`.
     - Botonera de acceso rápido: Enlace directo a `/admin` (Portal OPS), Simulador de 7 pantallas, Calculadora ARR y Acceso a la App en puerto 3001.
  2. **Matriz Completa de 72 Features (9 Dominios)**:
     - Expansión de 52 a las 72 features registradas en la Single Source of Truth del sistema (`docs/contexto/registro-de-features.md`).
     - Desglose por dominios: Nightlife & Cruising (7), Seguridad & Emergencias (10), Logística & Encuentros (12), Sustancias & Reducción de Daños (4), Deseos & Kink Blind-Match (5), Salud & Rutinas Preventivas (5), Monetización & Pases (8), Arquitectura & Core (11), y Administración & Operaciones (10).
     - Perspectiva dual (Inversionista vs Usuario) y modal de inspección técnica en profundidad.
  3. **Simulador de Dispositivo Ampliado a 7 Pantallas Tácticas**:
     - *Pantalla 1 (Grilla):* Tarjeta VIP de Klaus con haz giratorio GPU (`border-beam-fuchsia`), gradiente 46% y píldora elástica (`[🛡️ BIO] ⏱️ PUNTUAL +2`) con popover reactivo.
     - *Pantalla 2 (Radar):* Escaneo acústico polar.
     - *Pantalla 3 (Nightlife):* Cruces en la pista 48h y baliza óptica estroboscópica.
     - *Pantalla 4 (Perfil):* Ficha táctica y kink match.
     - *Pantalla 5 (Chat):* Darkroom efímero y waypoints en 2 fases.
     - *Pantalla 6 (Admin):* Mockup interactivo de `/admin` (VESSEL OPS // COMMAND) con MRR en vivo ($14,820 USD), 1,248 usuarios, alertas de coacción y drawer 360°.
     - *Pantalla 7 (Bóvedas):* Bóvedas locales IndexedDB con auditoría de visualizaciones en tiempo real y revocación en 1 tap.
  4. **Paridad Standalone y Web**:
     - Sincronización bit a bit entre `presentation/index.html` (para abrir en local con doble clic) y `public/investors/index.html` (servido vía Next.js en `/investors`).
- **Componentes & Archivos Clave**:
  - `presentation/index.html`
  - `public/investors/index.html`
  - `presentation/brand/*`
  - `public/investors/brand/*`
  - `scratch/generate_presentation.py`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] 162/162 pruebas unitarias pasando al 100% en Vitest.
  - [x] Verificación visual y funcional en Chrome DevTools de todas las pantallas y filtros.
  - [x] Ambas copias (`presentation/` y `public/investors/`) 100% idénticas.

### [FEAT-072] · [2026-09-08] Portal de Administración & Personal Operativo (VESSEL OPS // COMMAND)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Administración & Staff`, `Seguridad & DRM`, `Monetización`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral del portal de administración y gestión para empleados y administradores en la ruta `/admin`:
  1. **Dashboard Operativo & KPIs en Tiempo Real**:
     - Telemetría en vivo: Usuarios totales y online, suscriptores de VESSEL UNLIMITED, MRR estimado en USD, tasa de conversión % Free a Unlimited.
     - Métricas de confianza y salud: Respect Karma promedio de la comunidad, alertas activas de **Duress PIN** (PIN de coacción) y balizas de emergencia, cola de denuncias pendientes y verificaciones biométricas requeridas.
     - Gráficos de distribución de estado corporal en radar (`open`, `occupied`, `dormant`) y composición demográfica por rol sexual.
  2. **Gestión 360° de Usuarios Finales**:
     - Búsqueda en vivo por codename, ID, rol y dinámicas; filtros por estado (Verificados, Sin verificar, Modo Niebla, Unlimited, Sancionados).
     - Drawer de inspección 360°: Estación de verificación biométrica con comparativa (foto de perfil vs selfie 3D liveness), ajuste de Respect Karma (+15, -10, -25 pts), forzado de Modo Niebla por moderación, sanciones disciplinarias (advertencia, suspensión 48h, baneo permanente) y desactivación de alertas de coacción.
  3. **Administración de Membresías & Cuotas Maestras**:
     - Consola de calibración de cuotas globales para el plan Free (máximo de álbumes públicos/privados, radio del radar gratuito de 1000m, caracteres de bio, umbral de boost por karma).
     - Herramienta de otorgamiento manual de membresía `VESSEL UNLIMITED` de cortesía (con justificación de auditoría).
     - Directorio de suscriptores pagos y cálculo de MRR.
  4. **Cola de Moderación & Denuncias Comunitarias**:
     - Triage de reportes con categorización (Catfish, Acoso, Anti-Ghost abuse, Contenido no consentido).
     - Comparativa entre usuario denunciante y denunciado con snippet de chat.
     - Flujo de resolución en 1-tap: Desestimar, Penalizar Karma, Suspender cuenta o Baneo definitivo.
  5. **Control de Acceso Basado en Roles (RBAC)**:
     - 3 Roles jerárquicos: `superadmin` (acceso absoluto y personal), `moderator` (confianza, fotos y reportes) y `support` (atención, perfiles y membresías).
     - *Staff Switcher* reactivo en cabecera para agilizar pruebas operativas.
  6. **Registro de Auditoría Inmutable (Audit Trail)**:
     - Trazabilidad cronológica de todas las acciones operativas con operador, rol, usuario afectado, fecha/hora y justificación.
     - Exportación del log a formato JSON estándar.
  7. **Integración en la App Cliente**:
     - Acceso táctico directo desde `AppSettingsSection` ("ABRIR CONSOLA DE ADMINISTRACIÓN // /admin").
- **Componentes & Archivos Clave**:
  - `src/types/admin.ts` — Tipos y contratos TypeScript para Staff, Reportes, Auditoría, Métricas y Cuotas.
  - `src/lib/admin/adminService.ts` — Capa de servicios y persistencia reactiva local-first.
  - `src/components/admin/AdminHeader.tsx` — Barra superior con Staff Switcher y reloj HUD.
  - `src/components/admin/AdminNav.tsx` — Pestañas con insignias de alerta en tiempo real y filtrado RBAC.
  - `src/components/admin/tabs/DashboardOverviewTab.tsx` — Métricas KPI, alertas críticas y barras de estado corporal.
  - `src/components/admin/tabs/UserManagementTab.tsx` — Grilla de usuarios y drawer de inspección 360°.
  - `src/components/admin/tabs/MembershipsTab.tsx` — Consola de cuotas globales y asignador manual de Unlimited.
  - `src/components/admin/tabs/ModerationTab.tsx` — Cola de reportes y denuncias.
  - `src/components/admin/tabs/StaffManagementTab.tsx` — Directorio de personal (Superadmin).
  - `src/components/admin/tabs/AuditLogsTab.tsx` — Log de auditoría inmutable y exportador JSON.
  - `src/app/admin/page.tsx` — Página principal del portal `/admin`.
  - `src/components/account/AppSettingsSection.tsx` — Botón de enlace táctico.
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] RBAC verificado (filtrado de pestañas y permisos por rol).
  - [x] Persistencia y sincronización con perfiles y cuotas de la app.
  - [x] Responsive layout en escritorio, tablet y móvil.
| **ENH-021** | 2026-09-08 | Matriz, Auth & Identidad | `Enhancement` | Cuádruple Evolución de Identidad & UI: (1) Unicidad estricta y deduplicación de codenames O(1) en registro y edición inline, (2) Borde animado neón fucsia rotativo (Border Beam) para miembros pagos en la Matrix, (3) Gradiente oscuro inferior calibrado al 46% hasta la cápsula para legibilidad total sobre fotos claras, (4) Visualización de método de verificación (Mail, SMS, Bio, ID, Google) directamente en la píldora de protocolo | **100%** ✅ |

### [ENH-022] · [2026-09-08] Animación Rotativa Continua de Borde Neón Fucsia & Arquitectura Elástica Anti-Corte en Píldora de Protocolo
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Matriz & UI Táctica`
- **Módulo / Eje**: `Matriz`, `Estilos & UI`, `Experiencia de Usuario (UX)`, `Accesibilidad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de los dos puntos críticos reportados tras la implementación visual en la Matrix:
  1. **Animación Rotativa Suave y Continua del Borde Neón**:
     - Causa raíz: Tailwind JIT no emitía `@keyframes spin-slow` al no existir clases utility directas en las rutas activas de la home.
     - Solución: Incorporación directa de `@keyframes border-beam-spin` en `globals.css` con transformaciones geométricas de centrado `transform: translate(-50%, -50%) rotate(360deg)` sobre un pseudo-elemento cuadrado (`aspect-ratio: 1/1`) de 250% del ancho. Ciclo suave de 8s lineal continuo, ejecutado 100% en el compositor GPU.
  2. **Arquitectura de Información y Contención Elástica de la Píldora de Protocolo**:
     - Causa raíz: Coexistencia de Protocolo (`⏱️ PUNTUAL`), Verificación (`[🛡️ BIO]`), separadores y hasta 2 iconos tácticos adicionales (`👻`, `🔥 2`) en una tarjeta móvil de ~165px de ancho, provocando desborde y recorte por `overflow-hidden`.
     - Solución: Regla de contención inteligente `hasBothPrimary`. Cuando el perfil tiene Protocolo Y Verificación (los dos anclajes primarios de intención y confianza), los indicadores secundarios se consolidan en un badge numérico elástico `+N`. Se eliminó `flex-shrink-0` y se añadió `max-w-full overflow-hidden`, garantizando que el ancho total nunca supere 125px y jamás se corte.
     - Enriquecimiento del Popover Táctico: Al presionar la píldora, el popover interno muestra en primer lugar la explicación completa y humana de la expectativa del protocolo de encuentro, seguido por el método de verificación y las métricas de confianza (Anti-Ghost karma, fotos en bóveda, deseos comunes).
- **Componentes & Archivos Clave**:
  - `src/app/globals.css` — Reglas `@keyframes border-beam-spin` y `.border-beam-fuchsia`.
  - `src/components/matrix/ProfileCard.tsx` — Contención elástica, badge `+N` y reestructuración del popover.
  - `src/types/vessel.ts` — Inclusión de `"biometric_3d"` en `VerificationMethod`.
  - `tests/unit/ui/ProfileCard.test.tsx` — 12 pruebas unitarias automatizadas en verde.
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 162 pruebas unitarias pasando al 100%.
  - [x] Animación rotativa suave en 60fps sin sobrecarga de CPU.
  - [x] Píldora de protocolo 100% visible sin cortes en cualquier ancho de pantalla.

| **FIX-005** | 2026-09-08 | Autenticación & Persistencia | `Bug Fix (Corrección)` | Coherencia Absoluta de Cierre de Sesión (Logout) & Erradicación de Resurrección Fantasma Post-Recarga: Corrección de inversión lógica `isAnonymous` (que evaluaba a false con `user === null`), introducción de estado derivado unívoco `isAuthenticated`, purga atómica de claves scoped y base en `removeFromStorage`, reseteo limpio de perfil y álbumes en `SettingsContext` y `AuthContext`, e inmunidad total a reloads manteniendo el modo INVITADO | **100%** ✅ |
| **ENH-020** | 2026-09-08 | Autenticación & UX | `Enhancement` | Unificación Táctica de Inicio y Cierre de Sesión & Acceso Directo Inmediato: Incorporación de pestaña y vista dedicada 'Mi Sesión' (`mode: "session"`) en `AuthModal`, botón brutalista prominente de cierre de sesión (`[→ CERRAR SESIÓN]`) en `bloodNeon` de 48px, banner de sesión activa en vistas de login/registro, acceso en 1-tap mediante botón dedicado `LogOut` en la cabecera (`BrutalistHeader`) y vinculación directa del chip de usuario a `openAuthModal("session")` | **100%** ✅ |

### [ENH-021] · [2026-09-08] Unicidad de Alias, Borde Neón Fucsia para Miembros Pagos, Gradiente Calibrado & Verificación en Cápsula
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Matriz, Auth & Identidad`
- **Módulo / Eje**: `Matriz`, `Autenticación`, `Seguridad & Identidad`, `Perfil & Cuenta`, `Estilos & UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de las 4 mejoras solicitadas para elevar la calidad, exclusividad visual y confianza comunitaria en VESSEL:
  1. **Unicidad Obligatoria de Nombres de Usuario / Codenames**:
     - Implementación de `checkCodenameAvailability`, `claimCodename` y `releaseCodename` en `identityDeduplicationService.ts` con normalización canónica a mayúsculas y lookup O(1) determinista en `vessel_unique_identities` y contra perfiles en memoria.
     - Integración obligatoria en `registerWithEmail` (bloqueo con mensaje descriptivo si ya existe) y en `ensureUserDocInFirestore` para Google Auth (generación automática de sufijos no colisionantes).
     - Validación reactiva con debounce en `AuthModal.tsx` con badges visuales `✓ DISPONIBLE` (esmeralda) y `✕ NO DISPONIBLE` (rojo neón).
     - Validación asíncrona en la edición inline de `ProtocolView.tsx` impidiendo apropiación indebida de alias con feedback sonoro sub-bass y mensaje de error contextual.
  2. **Borde Neón Fucsia Giratorio para Miembros Pagos en Matrix (`ProfileCard.tsx`)**:
     - Detección reactiva de membresía (`userPlan === 'unlimited'` / `'pro'` o `isUnlimited`).
     - Creación de keyframes `spin-slow` (rotación 360° en 7s) y clase de utilidad brutalista `.border-beam-fuchsia` en `globals.css` mediante el patrón industrial `mask-composite: exclude` acelerado por GPU, sin alterar el layout ni opacar la fotografía.
     - Resplandor perimetral `border-fuchsia-500/50 shadow-[0_0_25px_rgba(255,0,127,0.3)] ring-1 ring-fuchsia-500/50` para destacar perfiles VIP en la cuadrícula del Radar Matrix.
  3. **Gradiente Oscuro Inferior Calibrado para Fotos Claras**:
     - Calibración matemática de la capa inferior en `ProfileCard.tsx` (`h-[46%] bg-gradient-to-t from-black via-black/92 via-55% to-transparent`).
     - Garantiza contraste WCAG AAA para el nombre, edad, rol y botones sobre fondos blancos o sobreexpuestos, mientras que el 54% superior de la imagen permanece 100% nítido y libre de gradientes.
  4. **Visualización de Método de Verificación en la Píldora de Protocolo**:
     - Extensión de `VerificationMethod` para soportar `"email"` y `"phone_sms"` además de `"biometric_liveness"`, `"oauth_google"` y `"id_document"`.
     - Elevación de la verificación a chip de primera clase en la píldora de protocolo (`✓ MAIL`, `✓ SMS`, `✓ BIO`, `✓ ID`, `✓ GOOGLE`), visible junto al protocolo táctico (`⏱️ PUNTUAL`, `🫂 MIMOS`).
     - Desglose detallado del método y sello de autenticidad en el popover informativo al presionar la cápsula.
  5. **Validación y Suite de Pruebas**:
     - Nuevas pruebas unitarias en `tests/unit/security/identityDeduplication.test.ts` (9 tests pasando).
     - Expansión de pruebas en `tests/unit/ui/ProfileCard.test.tsx` (10 tests pasando).
     - 160 tests globales pasando sin errores.
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts`
  - `src/data/mockProfiles.ts`
  - `src/lib/firebase/identityDeduplicationService.ts`
  - `src/lib/firebase/authService.ts`
  - `src/components/auth/AuthModal.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/auth/VerificationBadge.tsx`
  - `tailwind.config.ts` & `src/app/globals.css`
  - `tests/unit/security/identityDeduplication.test.ts`
  - `tests/unit/ui/ProfileCard.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] 160 pruebas automáticas en Vitest pasando al 100%.
  - [x] Respeto a convenciones de diseño brutalista y rendimiento GPU de animaciones.


### [FIX-005] · [2026-09-08] Coherencia Absoluta de Cierre de Sesión (Logout) & Erradicación de Resurrección Fantasma Post-Recarga
- **Tipo**: `Bug Fix (Corrección)` / `Autenticación & Persistencia`
- **Módulo / Eje**: `Autenticación`, `Persistencia Local`, `Cabecera & Navegación`, `Ajustes & Cuenta`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Corrección crítica de la inconsistencia donde, al cerrar sesión, la aplicación recargaba o tras recargar la página continuaba mostrando al usuario autenticado con cuenta permanente:
  1. **Subsanación de Inversión Lógica en `AuthContext.tsx`**:
     - Al desloguearse (`user === null`), la llamada `setIsAnonymous(!!user?.isAnonymous)` evaluaba a `false` (`!!undefined === false`), haciendo que toda la interfaz interpretara que existía un usuario con cuenta permanente.
     - Se reemplazó el estado local por derivaciones matemáticas unívocas e inmunes a desincronización: `isAuthenticated = useMemo(() => !!authUser && !authUser.isAnonymous, [authUser])` e `isAnonymous = useMemo(() => !authUser || !!authUser.isAnonymous, [authUser])`.
  2. **Purga Atómica y Erradicación de Resurrección Fantasma en `localStorageSync.ts`**:
     - Se actualizó `removeFromStorage` para que, además de eliminar la clave scoped (`test_*` o `real_*`), purgue de inmediato la clave base sin prefijo tanto en `localStorage` como en `IndexedDB`. Esto impide que la retrocompatibilidad de `loadFromStorage` resucite credenciales de sesiones pasadas tras un logout.
     - En `INITIAL_MY_PROFILE`, se corrigió la verificación por defecto a `isVerified: false` (`badgeLabel: "NO VERIFICADO"`), garantizando que sesiones de invitados o recién cerradas no exhiban badges 3D no autenticados.
  3. **Limpieza Coordinada de Dominios (`AuthContext` & `SettingsContext`)**:
     - Se implementó `cleanupUserSessionData()` en `SettingsContext` para restaurar los álbumes por defecto (`INITIAL_MY_ALBUMS` o `[]`) y resetear el plan a `"free"` al desloguearse.
     - En `logout()`, se orquestó la purga en memoria (`authUser = null`, `currentUserUid`, `myProfile`, `myBodyState`) y la eliminación de almacenamiento local para los modos activos.
  4. **Adaptación de Componentes de Interfaz**:
     - `BrutalistHeader`: muestra punto ámbar `"INVITADO"` cuando `!isAuthenticated` y oculta el botón 1-tap `LogOut`.
     - `AppSettingsSection`: conmuta entre `"Cuenta Temporal (Invitado)"` con botón para iniciar sesión y `"Cuenta Permanente"` con botón de cierre de sesión.
     - `AuthModal`: valida `initialMode` para redirigir a `"login"` si no está autenticado, y restringe la pestaña y banner de sesión a `isAuthenticated`.
  5. **Verificación Automatizada**:
     - Nueva suite de pruebas de integración `tests/integration/domains/AuthSessionLogout.test.tsx` cubriendo el ciclo completo de login, logout, purga de storage y persistencia del estado invitado tras reload.
- **Componentes & Archivos Clave**:
  - `src/lib/storage/localStorageSync.ts`
  - `src/context/domains/SettingsContext.tsx`
  - `src/context/domains/AuthContext.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/account/AppSettingsSection.tsx`
  - `src/components/auth/AuthModal.tsx`
  - `tests/integration/domains/AuthSessionLogout.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 146 tests de Vitest aprobados (`npm test -- --run`).
  - [x] Persistencia verificada: al cerrar sesión y recargar la página, la app permanece cerrada en modo Invitado.
| **ENH-019** | 2026-09-08 | Autenticación & Identidad | `Enhancement` | Conexión Integral de Google OAuth 1-Click Real & Erradicación de Proveedores Obsoletos (X/Instagram): Activación de `signInWithPopup` con feedback visual de carga y captura de errores amigables (`auth/operation-not-allowed`) en `IdentityVerificationModal` y `AuthModal`; eliminación completa de botones e interfaces de Twitter/Instagram y saneamiento de tipos en `VerificationMethod` y `MyProfileState` | **100%** ✅ |

### [ENH-020] · [2026-09-08] Unificación Táctica de Inicio y Cierre de Sesión & Acceso Directo Inmediato
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Autenticación & UX`
- **Módulo / Eje**: `Autenticación`, `Cabecera & Navegación`, `Diseño Brutalista & Ergonomía`, `i18n`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de la desvinculación cognitiva entre el *Inicio de Sesión* y el *Cierre de Sesión* (que previamente se hallaba oculto en la sección 5 al final del modal de Configuración de la Aplicación):
  1. **Unificación Conceptual en `AuthModal.tsx`**:
     - Se añadió el modo `"session"` al ciclo de vida de autenticación.
     - Cuando el usuario está autenticado (`!isAnonymous && authUser`), el selector de pestañas muestra 3 estados tácticos: `[ Mi Sesión ]` | `[ Iniciar Sesión ]` | `[ Registrarse ]`.
     - La vista `mode === "session"` presenta la Ficha de Operativo Activo (avatar con halo de pulso esmeralda, codename, email, UID truncado, método de acceso OAuth/Email y credencial de verificación 3D) acompañada de un botón brutalista de alta visibilidad `[→ CERRAR SESIÓN ACTIVA]` en color rojo `bloodNeon` (min 48px, accesible, con feedback háptico y sonoro Sub-Bass `playStateSwitch("dormant")`).
     - Si el usuario navega a las pestañas de login o registro mientras su sesión sigue activa, se despliega un banner táctico superior informativo: *"Sesión iniciada como: [CODENAME] — [Mi Sesión] | [Cerrar]"*.
  2. **Acceso Inmediato en Cabecera (`BrutalistHeader.tsx`)**:
     - El chip de identidad de usuario (`userCodename` con indicador esmeralda) ahora dispara directamente `openAuthModal("session")`, permitiendo inspeccionar la cuenta y salir en un solo tap sin navegar menús secundarios.
     - Se integró un botón táctico directo de 1-tap `LogOut` (`<LogOut className="w-3.5 h-3.5" />`) contiguo al chip para desconexión instantánea con diálogo de confirmación de seguridad.
  3. **Internacionalización y Saneamiento**:
     - Nuevas claves i18n en español (`es`) e inglés (`en`): `tabSession`, `sessionTitle`, `sessionSub`, `logoutAction`, `switchAccount`, `activeSessionNotice`.
     - 100% tipado TypeScript estricto validado (`tsc --noEmit`), 141 tests automatizados aprobados en Vitest y verificación visual interactiva mediante Chrome DevTools.
- **Componentes & Archivos Clave**:
  - `src/components/auth/AuthModal.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/context/domains/AuthContext.tsx`
  - `src/lib/i18n/translations.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 141 tests de Vitest pasando (`npm test -- --run`).
  - [x] Verificación visual en vivo mediante Chrome DevTools (sesión activa, banner contextual y cierre con reversión a modo invitado).
  - [x] Registro en Feature Ledger y sincronización en memoria persistente Engram.
| **ENH-018** | 2026-09-08 | Arquitectura, Auth & Persistencia | `Nueva Feature` | Arquitectura Dual de Entornos: Segregación estricta por namespaces en localStorage (`vessel_test_*` vs `vessel_real_*`), Modo de Prueba con 6 perfiles mock y simulación integral, y Modo Real 100% limpio sin inyección de datos mock en Firestore, registro real de usuarios, selector táctico en cabecera (`BrutalistHeader`), panel en ajustes (`AppSettingsSection`), modal `AppModeModal` y empty state táctico de radar | **100%** ✅ |
| **ENH-017** | 2026-09-07 | Matriz, UI & Telemetría | `Enhancement` | Unificación Táctica de Píldora de Telemetría Superior & Erradicación de Colisión en ProfileCard: Eliminación del badge flotante top-left remoto, unificación de estado corporal, distancia y señal remota en píldora táctica interactiva superior derecha; popover modal explicativo de telemetría (estado corporal, S2 anti-triangulación, alcance local vs remoto, alerta sentinel) con auto-cierre y exclusión mutua | **100%** ✅ |
| **ENH-016** | 2026-09-07 | Matriz, Radar & Monetización | `Nueva Feature` | Alcance Táctico de 1.0 km & Modelo Híbrido en Pestaña Cerca: Visualización nítida y chat gratuito en radio local (<=1.0 km); perfiles lejanos (>1.0 km) con intriga táctica (desenfoque de scanline, bio clasificada), pulsos cinéticos gratuitos y chat efímero desbloqueado mediante Sintonía Mutua (doble pulso recíproco) o acceso inmediato vía membresía VESSEL UNLIMITED | **100%** ✅ |
| **FIX-004** | 2026-09-07 | Álbumes, UI & Firestore | `Bug Fix (Corrección)` | Solución a Superposición Caótica de Elementos en Visor de Álbum Privado & Sincronización Determinista de IDs en Firestore Anti-PermissionError: Desacople del visor activePhoto de AlbumDetailModal a nivel raíz con z-[100] (reemplaza z-60 inerte), manejo de Escape y backdrop; sincronización determinista de IDs de mensaje en sendCloudMessage (setDoc con messageId custom), búsqueda resiliente por albumId en revokeCloudSharedAlbum y actualización de reglas de update en firestore.rules para miembros del chat | **100%** ✅ |
| **ENH-015** | 2026-09-06 | Chat & Álbumes | `Nueva Feature` | Revocación Granular de Álbumes Compartidos en Chat Individual y Global en Pestaña Álbumes: Control de privacidad para revocar el acceso a un álbum en un chat específico (botón 'Dejar de compartir' y 'Volver a compartir' en DarkroomChatModal) o revocarlo masivamente en todas las conversaciones desde UserAlbumManager y AlbumDetailModal, con sincronización en tiempo real vía Firestore y protección en ChatMediaViewerModal | **100%** ✅ |
| **ENH-020** | 2026-09-08 | Design System & Cabecera | `Enhancement` | Des-Grindrización Cromática & Nueva Paleta Dark Luxury Queer (Electric Violet + Mint Neon + Blood Neon), Rediseño de Cabecera en 3 Bloques y Consola de Señal Personal Desacoplada de Filtros | **100%** ✅ |
| **FIX-003** | 2026-09-06 | Álbumes & Firestore | `Bug Fix (Corrección)` | Acceso Permanente de Propietario a Álbumes Propios (Sin Temporizador ni Blur Efímero) & Saneador Universal Firestore Anti-Undefined: Erradicación de "VER (10S)", blur forzado y cuenta regresiva de 10s para el dueño en AlbumDetailModal y PrivateVault; creación de firestoreSanitizer y sanitización en albumService, profileService y matrixService para eliminar FirebaseError setDoc undefined | **100%** ✅ |
| **FIX-002** | 2026-09-06 | Almacenamiento & Álbumes | `Bug Fix (Corrección)` | Solución Definitiva a QuotaExceededError en Álbumes: Compresión en CreateAlbumModal (~10MB -> ~35KB WebP), eliminación de duplicación en blurredUrl, persistencia local-first de alta capacidad con IndexedDB y decoupling de saveToStorage fuera de reducers React 19 | **100%** ✅ |
| **FIX-001** | 2026-09-06 | Galería & Firestore | `Bug Fix (Corrección)` | Solución a Deformación de Fotos en Galería & Sanitización Anti-Undefined en Firestore: Corrección matemática de aspect ratio proporcional en compressImage (elimina el bug de maxHeight = height que comprimía fotos verticales a 1:5), visor con object-contain en AlbumDetailModal, y sanitización recursiva sanitizeForFirestore para erradicar el crash FirebaseError addDoc() por campos undefined | **100%** ✅ |
| **ENH-014** | 2026-09-06 | Matriz & Impeccable UI | `Enhancement` | Rediseño Impeccable de ProfileCard & Localización Táctica: Fila de identidad al 100% de ancho (nombre y codename completo sin elipsis ni truncamiento), recolocación del chip de hospedaje en la fila de identidad, rol táctico con espacio exclusivo, y sustitución integral de términos anglosajones ("cuddle" -> "MIMOS", "sleepover" -> "DORMIR" / "PASAR LA NOCHE") en español | **100%** ✅ |
| **OPT-006** | 2026-09-06 | Rendimiento & Persistencia | `Enhancement` | Bloque 6 Desactivación de Blur Residual, Memoización de Navegación & Persistencia Eficiente: Sustitución de backdrop-blur por fondos sólidos de alto contraste en TacticalBadge, BrutalistHeader, BrutalistNav y barra sticky de ProfileGrid; memoización con useMemo de contadores de badges e iteraciones de mensajes en BrutalistNav; y persistencia en segundo plano (scheduleDeferredSave con requestIdleCallback) | **100%** ✅ |
| **OPT-005** | 2026-09-06 | Rendimiento & Medios | `Enhancement` | Bloque 5 Rendimiento de Medios & LCP Acelerado: Decodificación asíncrona decoding="async" en ProfileCard, DarkroomChatModal, PulsesView, RadarSweep y DarkroomListView, priorización de red fetchPriority="high" y loading="eager" para perfiles above-the-fold en ProfileGrid, y preservación de aspect ratio para CLS = 0 | **100%** ✅ |
| **OPT-004** | 2026-09-06 | Ergonomía Móvil & PWA | `Enhancement` | Bloque 4 Cero Lag Táctil, PWA Standalone y Viewport Elástico: Supresión del delay de 300ms con touch-action: manipulation en globals.css, configuración appleWebApp en layout.tsx para experiencia nativa sin barra Safari en iOS, BrutalistModal adaptado a max-h-[90dvh] con overscroll-contain, y regla global @media (prefers-reduced-motion: reduce) | **100%** ✅ |
| **OPT-003** | 2026-09-06 | Ergonomía Móvil & Sensorial | `Enhancement` | Bloque 3 Ergonomía Móvil & Sensorial: Retroalimentación háptica táctil (navigator.vibrate) en SubBassAudioEngine con modos stealth y sincronización en SettingsContext, control háptico en AppSettingsSection, viewport dinámico h-dvh, anclaje sticky y contención de overscroll en DarkroomChatModal | **100%** ✅ |
| **OPT-002** | 2026-09-06 | Rendimiento & Render | `Enhancement` | Bloque 2 Optimización de Render, Búsqueda y Radar: Memoización con React.memo y desacople a hooks de dominio en ProfileCard, búsqueda no bloqueante con React.startTransition y precomputación O(N) de afinidad en ProfileGrid, light virtualization con content-visibility: auto, closestProfile en O(N) useMemo y activación de GPU @keyframes radar-sweep | **100%** ✅ |
| **OPT-001** | 2026-09-06 | Rendimiento & Multi-Dispositivo | `Enhancement` | Bloque 1 Optimización de Fluidez: Carga condicional de 17 modales dinámicos (evita descarga de 17 chunks JS iniciales), eliminación de 7 capas backdrop-blur en ProfileCard por sólidos de alto contraste (scroll 120Hz), soporte viewportFit: cover para iOS Safe Areas, y optimizePackageImports para lucide-react | **100%** ✅ |
| **ENH-013** | 2026-09-06 | Design System & UI | `Enhancement` | Fase 5: Estandarización de Design System & Modularización UI (P3): Primitivas atómicas tácticas (BrutalistButton, BrutalistModal, TacticalBadge, BrutalistInput), descomposición de ProtocolView (1.761 -> 360 líneas en 5 subtabs) y refactorización de 4 modales secundarios a 44px y voseo rioplatense | **100%** ✅ |
| **ARCH-003** | 2026-09-06 | Testing & Calidad | `Core / Fundacional` | Fase 4: Infraestructura de Calidad y Tests Automatizados (P3): Vitest + happy-dom + Testing Library, 70 tests en <700ms cubriendo Cripto, Geo S2, Batería, Cuotas Free, i18n y 3 Dominios | **100%** ✅ |
| **ARCH-002** | 2026-09-06 | Arquitectura & Backend | `Core / Fundacional` | Transición de Simulaciones a Backend Real (P2): Servicios Firestore para Pulsos Cinéticos, Hotspots Tácticos con Check-in Atómico, Álbumes en Cloud Storage y Testimonios en Tiempo Real | **100%** ✅ |
| **ARCH-001** | 2026-09-06 | Arquitectura & Core | `Core / Fundacional` | Descomposición del God Object (VesselContext): División en 7 Sub-Providers de Dominio Especializado + Fachada Unificada (Composite Facade) de Cero Impacto | **100%** ✅ |
| **SEC-001**  | 2026-09-06 | Infra/Seguridad | `Infra/Seguridad` | Blindaje de Seguridad P0: Cierre de IDOR en Firestore Rules, Anti-Spoofing, Segregación de Bóveda y Hashing Criptográfico SHA-256 de PINs | **100%** ✅ |
| **ENH-012**  | 2026-09-06 | Diario & Salud | `Enhancement` | Rediseño Impeccable de DateDiaryView, DiaryTimeline y SmartCalendarGrid: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones, Clearance en Ficha de Perfil & Botonera Ergonómica de 44px | **100%** ✅ |
| **ENH-011**  | 2026-09-05 | Mensajes & Chat | `Enhancement` | Rediseño Impeccable de DarkroomListView y DarkroomChatModal: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones, Línea 4 en Cabecera & Botonera Ergonómica de 44px | **100%** ✅ |
| **ENH-010**  | 2026-09-05 | Pulsos & Ergonomía | `Enhancement` | Rediseño Impeccable de PulsesView: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones & Botonera Ergonómica de 44px | **100%** ✅ |
| **ENH-009**  | 2026-09-05 | Radar & Ergonomía | `Enhancement` | Rediseño Impeccable de RadarSweep: Quick-HUD Ergonómico en 1-Tap, Píldora de Protocolo Desacoplada & Barra Táctica Consolidada | **100%** ✅ |

### [ENH-020] · [2026-09-08] Des-Grindrización Cromática (Electric Violet + Mint Neon + Blood Neon), Rediseño de Cabecera en 3 Bloques & Consola de Señal Personal
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Design System`, `UI/UX`, `Arquitectura de Cabecera`
- **Módulo / Eje**: `Sistema de Diseño`, `Cabecera del Sistema`, `Consola de Señal`, `Matriz & Filtros`, `Componentes UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Transformación profunda de la identidad cromática y la arquitectura de interacción superior de VESSEL mediante la metodología Impeccable UI (superficie `Operate`), respondiendo al feedback crítico de los usuarios:
  1. **Des-Grindrización Cromática & Nueva Paleta Dark Luxury Queer**:
     - Supresión del predominio de amarillo ámbar (`rawAmber` `#E5A93C`) que asociaba la app visualmente a Grindr.
     - Adopción de **`electricViolet`** (`#8B5CF6`, glow `#A78BFA`, dim `#6D28D9`) como color primario de marca, selecciones activas, navegación y botones principales.
     - Preservación de **`bloodNeon`** (`#E61937`) para el logo oficial de VESSEL, alertas críticas y estados de urgencia/sesión.
     - Adopción de **`mintNeon`** (`#10B981`) para el entorno Modo Real, estados disponibles y verificación 3D.
     - Restricción de dorados a **`champagneGold`** (`#F59E0B`) exclusivamente para coronas e insignias VESSEL UNLIMITED.
  2. **Arquitectura de Cabecera en 3 Bloques Desacoplados**:
     - **Bloque 1 (`BrutalistHeader.tsx`)**: App Shell de sistema con logotipo, badge TEST/REAL, alertas críticas bajo demanda (Rendezvous PIN / Guardián) y cápsula de usuario compacta y limpia (avatar, verificación y accesos a sonido/sigilo). Se eliminó la congestión de hasta 10 iconos amontonados en pantallas móviles.
     - **Bloque 2 (`StatusToggle.tsx`)**: Rediseñado como la **Consola de Transmisión Personal ("Tu Señal")**, con encabezado permanente `TU SEÑAL EN EL RADAR`, micro-led de estado en vivo, Segmented Control físico unificado (`🟢 DISPONIBLE`, `🔴 EN UNA`, `🟣 INCÓGNITO`) y el interruptor `⚡ BOOST 60M` de visibilidad personal. Erradica la confusión donde los usuarios creían que "Pinta algo ya" era un filtro de búsqueda.
     - **Bloque 3 (`ProfileGrid.tsx`)**: Barra de búsqueda y filtros rápidos horizontales con lenguaje y prefijos explícitos de consulta a terceros (`✨ Todos`, `⚡ En Boost`, `🟢 Solo Disponibles`, `🏠 Con Lugar`, `🛡️ Solo Verificados`), impidiendo colisiones cognitivas con el estado propio.
  3. **Actualización de Componentes Core del Ecosistema**:
     - `BrutalistButton.tsx` (variante primary en `electricViolet` con glow violeta).
     - `BrutalistNav.tsx` (pestaña activa con micro-pill violeta neón y glow).
     - `BrutalistInput.tsx` (foco en `electricViolet`).
     - `TacticalBadge.tsx` (nuevas variantes `violet` y `gold`).
     - `ProfileCard.tsx` (hover y bordes activos en `electricViolet`, verificación en `mintNeon`, candados VIP en `champagneGold`).
     - `page.tsx` (resaltado de selección de texto en `electricViolet`).
- **Componentes & Archivos Clave**:
  - `tailwind.config.ts`: Nuevos tokens de color `electricViolet`, `mintNeon`, `champagneGold` y sombras cinéticas.
  - `src/lib/i18n/translations.ts`: Nuevas claves y etiquetas claras para señal y filtros en español e inglés.
  - `src/components/brand/BrutalistHeader.tsx`: Reestructuración limpia de la barra de sistema.
  - `src/components/matrix/StatusToggle.tsx`: Consola de señal con segmented control y boost.
  - `src/components/matrix/ProfileGrid.tsx`: Búsqueda y filtros rápidos de perfiles ajenos con nueva semántica.
  - `src/components/ui/BrutalistButton.tsx`, `BrutalistNav.tsx`, `BrutalistInput.tsx`, `TacticalBadge.tsx`, `ProfileCard.tsx`: Integración completa de la nueva paleta.
  - `docs/contexto/convenciones.md`, `decisiones.md`, `registro-de-features.md`: Actualización de documentación viva.
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Cero ejecuciones de `npm run build` en caliente (cumplimiento estricto de la regla de oro).
  - [x] Des-grindrización cromática completa: el amarillo ya no es el color primario de la app.
  - [x] Desacople funcional total entre la emisión de señal propia y los filtros de la grilla.
  - [x] Sincronización en memoria persistente Engram.

### [ENH-019] · [2026-09-08] Conexión Integral de Google OAuth 1-Click Real & Erradicación de Proveedores Obsoletos (X/Instagram)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Autenticación & Identidad`
- **Módulo / Eje**: `Autenticación`, `Verificación de Identidad`, `Seguridad & Tipos`, `Firestore`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Conexión y finalización del flujo real de autenticación mediante Google 1-Click (`signInWithPopup`), acompañado de la eliminación exhaustiva de código muerto y proveedores no funcionales (𝕏/Twitter e Instagram):
  1. **Google OAuth 1-Click Real en `IdentityVerificationModal.tsx`**:
     - El botón *"Continuar con Google"* ahora ejecuta la autenticación real de Firebase Auth llamando a `loginWithGoogle()` (o `linkAccountWithGoogle()` si el usuario tiene una sesión anónima activa).
     - Incorporación de estado visual de carga reactivo (`isGoogleLoading` con animación giratoria), captura de errores técnicos (`authError`) y feedback acústico Sub-Bass.
     - Al autenticarse exitosamente con Google, extrae automáticamente el avatar (`photoURL`) y codename, asigna la credencial de verificación `oauth_google` (`isVerified: true`) y avanza de forma fluida a la configuración de privacidad facial (avatar estilizado o modo niebla).
  2. **Erradicación Integral de Proveedores Obsoletos (𝕏 / Instagram)**:
     - Eliminación de los botones de interfaz *"Continuar con 𝕏 (Twitter)"* y *"Continuar con Instagram"* en `IdentityVerificationModal.tsx`.
     - Saneamiento tipológico: supresión de `"oauth_x"` y `"oauth_instagram"` en `VerificationMethod` (`src/types/vessel.ts`), `MyProfileState` y firmas de `AuthContext.tsx`.
     - Depuración en `VerificationBadge.tsx`, `IdentityVerificationCard.tsx` y `mockProfiles.ts`.
  3. **Mejora Diagnóstica de Mensajes de Error en `authService.ts`**:
     - Actualización del código de error `auth/operation-not-allowed` con instrucciones explícitas en español e inglés para activar el switch de Google en Firebase Console (`Authentication > Sign-in method`).
  4. **Enlace Rápido a Login por Correo**:
     - Incorporación de acceso directo al pie del modal de verificación para conmutar a `AuthModal` con Email y Contraseña.
- **Componentes & Archivos Clave**:
  - `src/components/auth/IdentityVerificationModal.tsx`: Conexión de `handleGoogleVerification`, spinner, eliminación de X/Instagram y enlace a email.
  - `src/types/vessel.ts`: Limpieza estricta de `VerificationMethod`.
  - `src/context/domains/AuthContext.tsx`: Auto-llenado de perfil y verificación en `loginWithGoogle` y `linkAccountWithGoogle`.
  - `src/lib/firebase/authService.ts`: Mensajes diagnósticos precisos para Google provider.
  - `src/components/auth/VerificationBadge.tsx` & `IdentityVerificationCard.tsx`: Saneamiento de etiquetas.
  - `src/data/mockProfiles.ts`: Actualización de métodos en datos mock.
  - `tests/unit/ui/IdentityVerificationModal.test.tsx`: Suite de pruebas unitarias automatizadas (4 tests).
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 141 tests unitarios y de integración ejecutados con 100% de éxito en Vitest (`npm test`).
  - [x] Ausencia total de referencias obsoletas a `oauth_x` u `oauth_instagram`.
  - [x] Sincronización en memoria persistente Engram.

### [ENH-018] · [2026-09-08] Arquitectura Dual de Entornos: Modo de Prueba (Mock Data) & Modo Real (Producción Local Limpia) con Segregación Cero-Fuga
- **Tipo**: `Nueva Feature` / `Arquitectura & Core` / `Auth & Persistencia`
- **Módulo / Eje**: `Ajustes & Cuenta`, `Autenticación`, `Matriz & Radar`, `Almacenamiento Local`, `Firestore Backend`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral de la arquitectura dual de ejecución para VESSEL, permitiendo a desarrolladores y usuarios operar localmente en dos universos aislados sin interferencias cruzadas:
  1. **Segregación Estricta por Namespaces (`localStorageSync.ts`)**:
     - Definición del tipo `AppMode = "test" | "real"` persistido en cookie/clave independiente y sincronizado bidireccionalmente con el parámetro de URL `?mode=test` o `?mode=real`.
     - Sistema de prefijos `getScopedStorageKey(key)` que particiona automáticamente el almacenamiento en `vessel_test_*` y `vessel_real_*`.
     - Funciones auxiliares `getActiveAppMode()`, `setActiveAppMode()` y `clearModeStorage(mode)` para vaciar el estado local de un modo sin afectar el otro.
  2. **Modo de Prueba (`test`)**:
     - Carga el conjunto completo de 6 perfiles mock de demostración (`vessel-01` a `vessel-06`), álbumes de ejemplo, pulsos simulados y puntos de encuentro.
     - Permite experimentar toda la UI brutalista, los sintetizadores analógicos Web Audio API (45-80Hz) y la navegación táctica sin registrarse ni escribir en la base de datos real.
  3. **Modo Real (`real`) — Arranque 100% Limpio**:
     - La aplicación inicia completamente en blanco: `myProfile` arranca como `CLEAN_UNAUTHENTICATED_PROFILE` (sin fotos Unsplash de stock, sin biometría fingida, sin codename residual) con `currentUserUid = "unauthenticated"`.
     - Supresión estricta de auto-seeding en `matrixService.ts` y `hotspotService.ts`: en Modo Real nunca se inyectan perfiles mock a Firestore ni se muestran perfiles con ID `vessel-*`.
     - Colecciones de radar, diario, logística y álbumes arrancan vacías `[]` hasta que un usuario real se registra o publica datos.
     - El registro (`registerWithEmail`) y el login enlazan directamente a Firebase Auth (`verssel-3438d`), inicializando perfiles reales en Firestore en tiempo real.
  4. **Componentes Tácticos de UI**:
     - **Selector en Cabecera (`BrutalistHeader.tsx`)**: Badge táctico interactivo `[🧪 TEST]` vs `[⚡ REAL]` con estados de iluminación brutalista y acceso 1-tap al modal de control.
     - **Modal de Gestión (`AppModeModal.tsx`)**: Diálogo táctico que explica las diferencias operativas, permite conmutar entre modos con retroalimentación sonora Sub-Bass y ofrece un botón de purga local segura por modo.
     - **Panel en Ajustes (`AppSettingsSection.tsx`)**: Tarjeta dedicada `0. ENTORNO OPERATIVO` con selector de modo, indicador de namespace activo y botón para vaciar la caché del modo actual.
     - **Radar en Espera // Zona Limpia (`ProfileGrid.tsx`)**: Empty state exclusivo para Modo Real con pulso de radar en verde esmeralda, botón para registrar perfil (`REGISTRAR MI PERFIL`) y tip para pruebas multi-usuario en dos ventanas (normal e incógnito).
- **Componentes & Archivos Clave**:
  - `src/lib/storage/localStorageSync.ts`: Motor de partición por namespaces `vessel_test_*` y `vessel_real_*`.
  - `src/context/domains/SettingsContext.tsx`: Exposición de `appMode`, `setAppMode` y `resetModeData`.
  - `src/context/domains/AuthContext.tsx`: `CLEAN_UNAUTHENTICATED_PROFILE` y manejo de estado desconectado.
  - `src/lib/firebase/matrixService.ts` & `hotspotService.ts`: Blindaje anti-seed en Modo Real.
  - `src/context/domains/RadarMatrixContext.tsx`, `DiaryContext.tsx`, `LogisticsContext.tsx`: Inicialización limpia reactiva al modo.
  - `src/components/settings/AppModeModal.tsx`: Diálogo modal de conmutación y purga.
  - `src/components/brand/BrutalistHeader.tsx`: Píldora táctica de entorno.
  - `src/components/account/AppSettingsSection.tsx`: Sección de ajustes de entorno.
  - `src/components/matrix/ProfileGrid.tsx`: Empty state táctico para radar limpio.
  - `tests/unit/storage/localStorageSync.test.ts` & `tests/unit/ui/AppModeModal.test.tsx`: Batería de pruebas unitarias.
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 137 tests unitarios y de integración ejecutados con 100% de éxito en Vitest (`npm test`).
  - [x] Cero contaminación de datos mock en colecciones de producción de Firestore al correr en Modo Real.
  - [x] Sincronización en memoria persistente Engram y documentación de arquitectura.

### [ENH-017] · [2026-09-07] Unificación Táctica de Píldora de Telemetría Superior & Erradicación de Colisiones en ProfileCard
- **Tipo**: `Enhancement (Mejora/Refactor)` / `UX/UI Táctica & Telemetría`
- **Módulo / Eje**: `Matriz (Pestaña Cerca)`, `ProfileCard`, `Telemetría & Radar`, `i18n`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de colisión geométrica en tarjetas de perfil (`ProfileCard`) y humanización táctica de la telemetría del radar:
  1. **Erradicación de Colisión Visual**: En tarjetas móviles estrechas (~140-180px), la presencia simultánea de un badge superior izquierdo (`SEÑAL REMOTA`) y una píldora superior derecha (`• 🛰️ ~1 km`) provocaba superposición y truncamiento de texto. Se eliminó el badge flotante superior izquierdo para perfiles lejanos, reservando `top-left` exclusivamente para insignias atómicas de máxima prioridad (`⭐ VOS` para el usuario propio, `⚡ YA` para perfiles on-the-clock).
  2. **Píldora Táctica Unificada e Interactiva**: Toda la información de señal remota, distancia y estado corporal se consolida en la píldora superior derecha (`button` con `pointer-events-auto`, micro-interacciones hover/active y estado de selección). La píldora sintetiza el dot de color de estado corporal, el satélite `🛰️`, la distancia discretizada S2 (ej. `~1.4km`) y el tag táctico `REMOTO`.
  3. **Sheet/Popover Táctico Interno (`isTelemetryOpen`)**: Al presionar la píldora superior, se despliega un visor contextual interno idéntico al de la píldora inferior (`isCapsuleOpen`), con auto-cierre a los 8 segundos, exclusión mutua (abrir uno cierra el otro) y cierre táctil. El visor desmitifica los íconos crípticos y explica:
     - **Estado Corporal**: Color del dot y significado ("Pinta algo ya • Disponible para encuentro" / "En una • Ocupado o en una cita" / "De incógnito • Modo pasivo").
     - **Distancia**: Cifra estimada y explicación de privacidad Google S2 (~152m) anti-triangulación.
     - **Alcance de Radar**: "Señal Remota (> 1.0 km)" con aclaración de pulsos libres y chat con UNLIMITED o Sintonía Mutua vs "Radio Local Táctico (≤ 1.0 km)" con chat directo 100% libre.
     - **Alerta Sentinel**: Explicación de alerta preventiva si el perfil cuenta con reporte comunitario.
  4. **Paridad Lingüística i18n**: Inclusión de claves completas en español rioplatense e inglés en `src/lib/i18n/translations.ts`.
  5. **Batería de Pruebas Unitarias**: Creación de `tests/unit/ui/ProfileCard.test.tsx` garantizando ausencia de badges colisionantes, unificación de etiquetas y apertura/cierre del popover de telemetría (132 tests pasando).
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`: Desacople de badge izquierdo, botón interactivo derecho y popover `isTelemetryOpen`.
  - `src/lib/i18n/translations.ts`: Claves de telemetría (`telemetryTitle`, `telemetryBodyState`, `telemetryDistance`, `telemetryDistanceDesc`, `telemetryLocalRange`, `telemetryRemoteRange`, etc.).
  - `tests/unit/ui/ProfileCard.test.tsx`: Tests unitarios automatizados de UI y comportamiento táctil.
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 132 tests unitarios pasando en Vitest (`npm test`).
  - [x] Ausencia total de colisión visual y texto cortado en `ProfileCard`.
  - [x] Popover táctil de telemetría con auto-cierre a 8s y exclusión mutua con la cápsula inferior.

### [ENH-016] · [2026-09-07] Alcance Táctico de 1.0 km & Modelo Híbrido en Pestaña Cerca (Grilla y Ficha de Perfil)
- **Tipo**: `Nueva Feature` / `Monetización, Matriz & UX Táctica`
- **Módulo / Eje**: `Matriz (Pestaña Cerca)`, `Radar & Proximidad`, `Modelo de Suscripción (VESSEL UNLIMITED)`, `Pulsos Cinéticos & Sintonía Mutua`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del modelo híbrido de monetización y alcance táctico en la pestaña principal **Cerca** (`ProfileGrid` / `ProfileCard` / `ProfileDetailModal`):
  1. **Radio Local Inmediato (<= 1.0 km / 1000m)**:
     - Los usuarios gratuitos disfrutan de acceso libre, visualización 100% nítida, envío de pulsos y apertura directa de Darkroom Chat sin restricciones.
  2. **Alcance Táctico Remoto (> 1.0 km)**:
     - **Intriga Táctica Visual**: En `ProfileCard` y `ProfileDetailModal`, la imagen de los perfiles distantes se renderiza con un filtro cinematográfico calibrado (`blur-[8px]` + trama de scanlines tácticas), protegiendo la identidad facial y despertando curiosidad erótica.
     - **Insignia Remota**: Badge ámbar con ping en vivo `🛰️ REMOTO` y prefijo satelital en la distancia (`🛰️ 1.8 km`).
     - **Biografía Clasificada**: La declaración de perfil se reemplaza por barras de censura táctica confidencial (`████████`) con invitación al upgrade.
     - **Pulsos Cinéticos Gratuitos**: El botón de pulso (1-tap) permanece 100% funcional y gratuito para enviar atracción a distancia.
     - **Desbloqueo de Chat por Sintonía Mutua**: Si ambos usuarios se enviaron o devolvieron un pulso recíproco (`hasMutualPulse`), el botón de chat se enciende con halo verde esmeralda (`🔥 Sintonía Mutua`) y permite chatear gratis sin pagar membresía.
     - **Acceso Inmediato VESSEL UNLIMITED (Skip the Line)**: Si no hay sintonía mutua, el botón de chat muestra un candado dorado táctico (`🔒`). Al presionarlo, lanza el `UnlimitedPaywallModal` destacando el nuevo beneficio: *"Transmisión Satelital de Largo Alcance (>1 km) // Chateá de inmediato con cualquier Vessel a más de 1 km sin tener que esperar que te devuelvan el pulso"*. Los usuarios con `VESSEL UNLIMITED` acceden a perfiles a cualquier distancia de forma 100% nítida y con chat inmediato.
- **Componentes & Archivos Clave**:
  - `src/lib/business/freeTierLimits.ts`: Definición de `maxFreeRadarDistanceMeters: 1000`.
  - `REGLAS_DE_NEGOCIO.md`: Actualización de la Sección 1 ("Modelo de Cuotas y Membresías") con la regla de 1 km y sintonía mutua.
  - `src/context/domains/SettingsContext.tsx`: Cálculo y exposición global de `isUnlimited: boolean`.
  - `src/context/domains/RadarMatrixContext.tsx`: Implementación del helper `hasMutualPulse(profileId: string): boolean` basado en `transmissions` y `receivedPulses`.
  - `src/context/VesselContext.tsx`: Inclusión de `isUnlimited` combinada con `partyPass` en la fachada `VesselFacadeBridge`.
  - `src/components/matrix/ProfileCard.tsx`: Integración de desenfoque de scanline, badges remotos, candado de chat con apertura a paywall y botón esmeralda de sintonía mutua.
  - `src/components/profile/ProfileDetailModal.tsx`: Banner táctico de señal remota, desenfoque de fotos, censura clasificada de biografía y adaptación de botones de acción.
  - `src/components/subscription/UnlimitedPaywallModal.tsx`: Incorporación del perk de Transmisión Satelital de Largo Alcance.
  - `src/lib/i18n/translations.ts`: Diccionario reactivo i18n en español e inglés para señales remotas y sintonía mutua.
  - `src/data/mockProfiles.ts`: Inclusión de perfiles lejanos de prueba (`vessel-06` a 1.1 km y `vessel-07` a 2.4 km).
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Tipado estricto validado con `npm run typecheck` (0 errores).
  - [x] Reglas de negocio documentadas formalmente en `REGLAS_DE_NEGOCIO.md`.
  - [x] Estados interactivos comprobados: perfil cercano (<1km) libre, perfil lejano sin pulso bloqueado a Unlimited, perfil lejano con sintonía mutua desbloqueado.

### [FIX-004] · [2026-09-07] Solución a Superposición Caótica de Elementos en Visor de Álbum Privado & Sincronización Determinista de IDs en Firestore Anti-PermissionError (P0)
- **Tipo**: `Bug Fix (Corrección)` / `Álbumes, UI & Firestore`
- **Módulo / Eje**: `Bóveda de Álbumes`, `Chat Darkroom`, `Seguridad & Reglas Firestore`, `UX/UI Impeccable`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución integral de dos incidentes de alta prioridad relacionados con la visualización de fotos de álbumes y la revocación de accesos en el chat:
  1. **Superposición de Botones y Tarjetas en Visor de Álbumes (`AlbumDetailModal.tsx`)**:
     - *Causa Raíz*: La clase `z-60` no existe en la especificación estándar de Tailwind CSS (solo hasta `z-50`). Al ignorarse, el modal de pantalla completa `activePhoto` carecía de `z-index` y, al estar anidado dentro de la tarjeta contenedora del álbum, los elementos con posicionamiento absoluto y `z-10`/`z-20` de la grilla inferior (*"Elegir como Portada"*, tachos de basura, títulos y botones *"Ver"*) se filtraban y renderizaban encima de la imagen.
     - *Solución*: Se desacopló el visor `activePhoto` al nivel raíz del componente dentro de un React Fragment `<>`, elevándolo con `fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl`. Se agregó cierre por clic en backdrop (`onClick={() => setActivePhoto(null)}`), detención de propagación en la tarjeta modal y manejo de teclado `Escape` para cerrar secuencialmente primero el visor y luego el modal.
  2. **Error `FirebaseError: Missing or insufficient permissions` al Revocar Álbum en Chat**:
     - *Causa Raíz*: Al enviar un mensaje, el cliente creaba un ID local (`msg-media-...`). Sin embargo, `sendCloudMessage` utilizaba `addDoc(messagesRef, payload)`, generando un ID aleatorio diferente en Firestore (ej. `2hVq...`). Al presionar *"Dejar de compartir"*, `revokeAlbumAccessInChat` enviaba a `revokeCloudSharedAlbum` el ID local que **no existía en Firestore**. Al ejecutar `updateDoc()` sobre un documento inexistente, las reglas de Firestore evaluaban `resource.data` (que es `null`), denegando la operación y reportando `Missing or insufficient permissions`. Además, la regla de `update` en `/messages/{messageId}` no incluía `chatId.matches('.*' + request.auth.uid + '.*')`.
     - *Solución*:
       - `sendCloudMessage` ahora admite `customMessageId` y utiliza `setDoc(doc(messagesRef, customMessageId), payload, { merge: true })`, garantizando que el ID en Firestore sea determinísticamente idéntico al ID local del cliente en todos los tipos de mensaje (`sendChatMessage`, `sendMediaChatMessage`, `sendKindClosureMessage`, `sendRendezvousPinMessage`, `cancelRendezvousPin`).
       - `revokeCloudSharedAlbum` incorpora un fallback resiliente: si el `messageId` no existe en Firestore, busca por `mediaAttachment.sharedAlbumId == albumId` en la conversación y actualiza los mensajes correspondientes. Se mitigan logs ruidosos cambiando `console.error` por `console.warn` defensivo.
       - En `firestore.rules`: Se actualizó la regla de `allow update` y `allow delete` en subcolecciones de mensajes para permitir a los participantes legítimos (`chatId.matches('.*' + request.auth.uid + '.*')`), y se desplegó a producción con 100% de éxito.
- **Componentes & Archivos Clave**:
  - `src/components/account/AlbumDetailModal.tsx`
  - `src/lib/firebase/chatService.ts`
  - `src/context/domains/ChatContext.tsx`
  - `firestore.rules`
  - `firestore.indexes.json`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 124 tests unitarios e integrales en Vitest ejecutados con 100% de éxito (19 suites, 0 regresiones).
  - [x] Despliegue exitoso de `firestore.rules` a Firebase (`verssel-3438d`).
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [ENH-015] · [2026-09-06] Revocación Granular de Álbumes Compartidos en Chat Individual y Global en Pestaña Álbumes (P0)
- **Tipo**: `Nueva Feature` / `Privacidad & Control de Acceso`
- **Módulo / Eje**: `Chat Darkroom`, `Gestor de Álbumes`, `Seguridad & Privacidad`, `Firebase Firestore`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del sistema completo de revocación granular y global de álbumes compartidos:
  1. **Revocación en Chat Individual**:
     - En la cabecera de la tarjeta del álbum en el chat (`DarkroomChatModal.tsx`), el remitente cuenta con el botón `[ ⊘ Dejar de compartir ]`.
     - Al revocar, la tarjeta muta en tiempo real a estado bloqueado `[REVOCADO]` tanto en el cliente local como en Firestore (`isRevoked: true` y `revokedAt`).
     - Para el remitente: Notificación brutalista *"Dejaste de compartir este álbum en este chat"* y botón `[ ↻ Volver a compartir ]` para restaurar el acceso con un solo clic.
     - Para el destinatario: Notificación *"Acceso Revocado por el Remitente"* con fotos ocultas y botón deshabilitado `[ 🔒 Acceso no disponible ]`.
     - En el visor `ChatMediaViewerModal.tsx`: Si `media.isRevoked`, bloquea el acceso con pantalla de bóveda cerrada e impide la visualización.
  2. **Revocación Global en Pestaña "Álbumes"**:
     - En `UserAlbumManager.tsx`: Detección reactiva de chats activos con `getSharedChatIdsForAlbum`, badge `Compartido (X)` y botón directo `[ ⊘ Dejar de compartir con todos ]` con feedback sonoro sub-bass (`audioEngine.playStateSwitch("dormant")`) y toast táctico.
     - En `AlbumDetailModal.tsx`: Nueva sección dedicada *"Control de Accesos Compartidos // Media Vault"* con conteo de usuarios y botón de confirmación táctica para revocar en todas las conversaciones.
  3. **Persistencia & Sincronización en Tiempo Real**:
     - `subscribeToChatMessages` en `chatService.ts` mapea `mediaAttachment`, `isRevoked` y `revokedAt`.
     - Función `revokeCloudSharedAlbum` para mutar el mensaje en Firestore.
     - Coordinación de estados en `ChatContext` y `SettingsContext`.
  4. **Internacionalización y Calidad**:
     - Claves completas en `src/lib/i18n/translations.ts` para español e inglés.
     - Suite unitaria automatizada `tests/unit/chat/albumRevocation.test.ts` con 4 pruebas específicas (100% pasando).
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts`
  - `src/lib/firebase/chatService.ts`
  - `src/context/domains/ChatContext.tsx`
  - `src/context/domains/SettingsContext.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/chat/ChatMediaViewerModal.tsx`
  - `src/components/chat/SendMediaModal.tsx`
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/account/AlbumDetailModal.tsx`
  - `src/lib/i18n/translations.ts`
  - `tests/unit/chat/albumRevocation.test.ts`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 124 tests automatizados en Vitest ejecutados con 100% de éxito (19 suites, 0 regresiones).
  - [x] Estados activos, revocados y re-compartidos verificados visualmente y a nivel de eventos.
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [FIX-003] · [2026-09-06] Acceso Permanente de Propietario a Álbumes (Sin Blur ni Temporizador) & Saneador Universal Firestore Anti-Undefined (P0)
- **Tipo**: `Bug Fix (Corrección)` / `Álbumes, Seguridad & Firestore`
- **Módulo / Eje**: `Bóveda de Álbumes`, `Perfil & Cuenta`, `Firebase Firestore`, `DRM & Seguridad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de dos problemas críticos de experiencia y persistencia reportados en el uso de álbumes privados:
  1. **Visualización Sin Restricciones para el Propietario (Eliminación de "VER 10S" y Blur Efímero)**:
     - *Problema*: Al entrar a `AlbumDetailModal.tsx` o `UserAlbumManager.tsx`, el usuario que creó y administra su propia bóveda privada encontraba todas sus fotos con `blur-md`, `grayscale` y un botón superpuesto de `VER (10S)` que iniciaba una cuenta regresiva de 10 segundos, obligándolo a sostener la pantalla (`requireHoldToReveal`) y cerrando el visor de forma prematura.
     - *Solución*: Se rediseñó la experiencia de visualización para el propietario:
       - Eliminado cualquier blur, escala forzada o escala de grises sobre los medios en la cuadrícula de álbumes propios (`AlbumDetailModal` y `UserAlbumManager`).
       - Eliminado el botón `VER (10S)` y la cuenta regresiva efímera para el dueño del álbum.
       - Implementado overlay táctico directo (`Ver`) que abre la foto o video en visor de pantalla completa con permanencia ilimitada, controles de audio para video, opción de portada y cierre manual.
       - Actualizado el banner de Bóveda Privada para comunicar con claridad: *"Bóveda Cifrada Privada · Acceso ilimitado para ti como propietario. Al compartir acceso en el chat, los destinatarios tendrán visualización efímera protegida"*.
       - Añadido soporte de `isOwner` en `PrivateVault.tsx` y `ProfileDetailModal.tsx` para garantizar que la vista previa de perfil propio tampoco bloquee al usuario.
  2. **Erradicación de `FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined`**:
     - *Problema*: Al guardar un álbum privado (`saveCloudAlbum`) en `vessel_users/{uid}/albums/{albumId}`, propiedades opcionales no inicializadas (como `caption: undefined`, `durationSeconds: undefined`, `thumbnailUrl: undefined`) provocaban que el SDK de Firestore abortara inmediatamente la escritura.
     - *Solución*:
       - Creación del módulo centralizado `src/lib/firebase/firestoreSanitizer.ts` con la función recursiva `sanitizeForFirestore<T>(data: T): T`.
       - La función elimina recursivamente todas las propiedades con valor `undefined`, filtra arrays y preserva de forma segura tipos especiales de Firestore (`FieldValue`, `serverTimestamp()`, `arrayUnion()`, `Timestamp` y `Date`).
       - Integrado en `albumService.ts` (`saveCloudAlbum`, `addMediaToCloudAlbum`, `removeMediaFromCloudAlbum`), `profileService.ts` (`syncMyProfileToCloud`, `syncBodyStateToCloud`) y `matrixService.ts` (`updateMyMatrixPresence`).
       - Limpieza en la construcción de `photosToSave` en `CreateAlbumModal.tsx`.
- **Componentes & Archivos Clave**:
  - `src/lib/firebase/firestoreSanitizer.ts`
  - `src/lib/firebase/albumService.ts`
  - `src/lib/firebase/chatService.ts`
  - `src/lib/firebase/profileService.ts`
  - `src/lib/firebase/matrixService.ts`
  - `src/components/account/AlbumDetailModal.tsx`
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/account/CreateAlbumModal.tsx`
  - `src/components/profile/PrivateVault.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `tests/unit/firebase/firestoreSanitizer.test.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 120 tests automatizados en Vitest ejecutados con 100% de éxito (18 suites, 0 regresiones).
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [FIX-002] · [2026-09-06] Solución Definitiva a QuotaExceededError en Álbumes & Motor IndexedDB de Gran Capacidad (P0)
- **Tipo**: `Bug Fix (Corrección)` / `Almacenamiento & Álbumes`
- **Módulo / Eje**: `Almacenamiento & Memoria`, `Bóveda de Álbumes`, `IndexedDB Core`, `Settings & Perfil`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Erradicación del error `QuotaExceededError: Setting the value of 'vessel_user_albums_v1' exceeded the quota` al crear álbumes privados o públicos con fotografías de cámara:
  1. **Causa Raíz Detallada**:
     - En `CreateAlbumModal.tsx`, al seleccionar fotos desde el carrete o explorador de archivos, se utilizaba directamente `readFileAsDataUrl(file)`, guardando imágenes nativas sin comprimir de 5MB a 15MB en formato Base64.
     - En `handleSubmit`, se duplicaba la cadena Base64 en `url` y `blurredUrl`, elevando el tamaño por foto a ~20MB.
     - Al invocar `createAlbum`, `saveToStorage` intentaba serializar el array completo dentro de `localStorage` (`vessel_user_albums_v1`). Debido a que los navegadores limitan `localStorage` a un máximo estricto de 5MB para todo el dominio, la operación lanzaba de forma inmediata e inevitable `QuotaExceededError`.
     - Además, en `SettingsContext.tsx`, `saveToStorage` se ejecutaba dentro de la función de actualización de estado (`setUserAlbums(prev => ...)`), provocando que React 19 interrumpiera el ciclo de renderizado con una excepción no controlada.
  2. **Solución Técnica Implementada**:
     - *Compresión Asíncrona en Creación de Álbum*: En `CreateAlbumModal.tsx`, se integró `compressImage(file)`, reduciendo automáticamente cualquier fotografía de alta resolución de ~10MB a un WebP optimizado de ~35-50KB con proporciones áureas intactas (reducción del 99.6% de carga).
     - *Eliminación de Duplicación Base64*: Se evitó replicar la cadena `data:` en `blurredUrl`, reduciendo el payload a la mitad.
     - *Motor Local-First de Alta Capacidad con IndexedDB (`indexedDbSync.ts`)*: Se implementó un subsistema asíncrono sobre la API nativa de IndexedDB (con cuotas en Gigabytes y sin bloqueo de hilo UI). Todos los álbumes y multimedia se respaldan de forma transparente e instantánea en IndexedDB.
     - *Blindaje de Fallback en `localStorageSync.ts`*: Si `localStorage` alcanza su cuota, la aplicación poda cachés antiguas de chat, garantiza la persistencia íntegra en IndexedDB y guarda una versión ligera de metadatos en `localStorage`, garantizando cero excepciones y cero interrupciones de usuario.
     - *Desacople en React 19*: Se extrajo `saveToStorage` fuera de los updaters puros de `setUserAlbums` en `createAlbum`, `deleteAlbum` y `updateAlbum`.
- **Componentes & Archivos Clave**:
  - `src/lib/storage/indexedDbSync.ts`
  - `src/lib/storage/localStorageSync.ts`
  - `src/components/account/CreateAlbumModal.tsx`
  - `src/context/domains/SettingsContext.tsx`
  - `tests/unit/storage/indexedDbSync.test.ts`
  - `docs/contexto/registro-de-features.md`
  - `docs/contexto/errores-conocidos.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 115 tests automatizados en Vitest ejecutados con 100% de éxito (17 suites, 0 regresiones).
  - [x] Tests unitarios dedicados para `indexedDbSync` y fallback seguro en entornos sin soporte.
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [FIX-001] · [2026-09-06] Solución a Deformación de Fotos en Galería & Sanitización Anti-Undefined en Firestore (P0)
- **Tipo**: `Bug Fix (Corrección)` / `Galería & Firestore`
- **Módulo / Eje**: `Almacenamiento & Medios`, `Chat & Darkroom`, `Bóveda de Álbumes`, `Firebase Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de dos fallos críticos reportados en la gestión de medios y sincronización en tiempo real con Firestore:
  1. **Causa Raíz y Solución a la Deformación de Fotos en Galería / Subida de Archivos**:
     - *Causa raíz*: En `compressImage` (`storageService.ts`), en imágenes de retrato (altura > ancho, como fotos tomadas verticalmente con smartphones 3:4 o 9:16), la condición `else` calculaba `width = Math.round((width * maxHeight) / height)` pero ejecutaba `maxHeight = height` en vez de `height = maxHeight`. Esto dejaba la altura original intacta (ej. 4032px) y reducía el ancho a ~810px, forzando un canvas distorsionado 1:5 que aplastaba horizontalmente las fotos por 4x.
     - *Solución*: Se sustituyó el bloque condicional por un factor de escala proporcional canónico `const ratio = Math.min(maxWidth / width, maxHeight / height)` aplicando `Math.round(dim * ratio)`. La relación de aspecto ahora se conserva con 100% de precisión matemática en cualquier orientación.
     - *Protección en Visores*: En `AlbumDetailModal.tsx`, se configuró `object-contain` en los visores de pantalla completa (público y privado), evitando recortes arbitrarios o deformaciones de fotos con relaciones de aspecto no estándar.
  2. **Causa Raíz y Solución al Crash de Firestore (`FirebaseError: Unsupported field value: undefined`)**:
     - *Causa raíz*: Al enviar archivos adjuntos de medios (fotos, videos, álbumes) en el chat sin un pie de foto explícito (`caption`), `sendMediaChatMessage` pasaba `text: text || media.caption`, evaluando a `undefined`. Firestore rechaza terminantemente cualquier propiedad con valor `undefined` tanto a nivel raíz como en objetos anidados, lanzando una excepción no controlada en `addDoc()`.
     - *Solución*: 
       - Implementación de la función recursiva `sanitizeForFirestore<T>` en `chatService.ts`, que elimina cualquier propiedad `undefined` en mapas y arrays, preservando valores legítimos (`null`, `""`, `0`, `false`) y tipos internos de Firestore (`serverTimestamp()`, `FieldValue`).
       - En `sendCloudMessage`, se garantiza que `text` por defecto sea una cadena vacía `text: message.text ?? ""` y todo el payload se sanea antes de ejecutar `addDoc()`.
       - En `ChatContext.tsx` y `SendMediaModal.tsx`, se estandarizó el saneamiento de texto y caption antes del despacho.
- **Componentes & Archivos Clave**:
  - `src/lib/firebase/storageService.ts`
  - `src/lib/firebase/chatService.ts`
  - `src/context/domains/ChatContext.tsx`
  - `src/components/chat/SendMediaModal.tsx`
  - `src/components/account/AlbumDetailModal.tsx`
  - `tests/unit/storage/imageCompression.test.ts`
  - `tests/unit/chat/chatSanitizer.test.ts`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 113 tests automatizados en Vitest ejecutados con 100% de éxito (16 suites, 0 regresiones).
  - [x] Tests unitarios dedicados para `sanitizeForFirestore` y cálculo proporcional de relación de aspecto.
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [ENH-014] · [2026-09-06] Rediseño Impeccable de ProfileCard & Localización Táctica Natural (P0)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Matriz & Impeccable UI`
- **Módulo / Eje**: `Matriz de Perfiles`, `Design System & UI`, `Internacionalización (i18n)`, `Chat & Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Refactorización integral de la tarjeta de perfil táctica (`ProfileCard.tsx`) bajo estándares Impeccable UX/UI y purificación de la terminología de dominio en español:
  1. **Visualización Completa del Nombre de Usuario (Cero Truncamiento)**:
     - Desacople de la arquitectura horizontal anterior que apretaba el nombre contra los botones de acción rápida en columnas contiguas.
     - Creación de una fila de identidad dedicada al 100% del ancho de la tarjeta (`Fila 2: Nombre, Edad, Host Chip, Química y Dúo`). Codenames extensos como `RECEPTOR_V` (que antes se truncaba a `RECE...`) ahora se leen íntegramente con nitidez brutalista.
     - Tipografía mejorada con sombra de alto contraste (`drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`) y degradado inferior cinematográfico profundizado al 60% de la tarjeta (`h-3/5 from-black/98 via-black/75`).
  2. **Reubicación Táctica del Chip de Hospedaje Inmediato (`🏠`)**:
     - El indicador de host inmediato se trasladó a la fila de identidad junto al alias y edad, liberando completamente la fila inferior (`Fila 3`).
     - El rol táctico (`Activo`, `Pasivo`, `Dominante`, `Versátil`, etc.) ahora dispone de todo el espacio horizontal a la izquierda de los botones, erradicando truncamientos como `ACT...` o `DOMI...`.
  3. **Localización Táctica Natural en Español (Erradicación de "Cuddles")**:
     - Sustitución de anglicismos forzados en la interfaz en español:
       - `chill_cuddle`: pasó de `CUDDLE` a `MIMOS` en la píldora táctica de `ProfileCard`, `ProfileDetailModal`, `DarkroomChatModal`, `DarkroomListView`, `DiaryTimeline`, `SmartCalendarGrid`, `PulsesView` y `RadarSweep`.
       - Descripciones actualizadas a "Protocolo: Ducha y mimos (20-30 min)".
       - `sleepover`: traducido a `DORMIR` / `PASAR LA NOCHE` en lugar de `SLEEPOVER`.
       - En inglés (`en`), los términos nativos `CUDDLE` y `SLEEPOVER` se conservan con total coherencia.
     - Diccionario de traducciones (`src/lib/i18n/translations.ts`) actualizado con sincronización bidireccional estricta.
  4. **Unificación Táctica de Cápsulas & Erradicación de Redundancia Superior**:
     - Supresión del botón flotante duplicado de protocolo de salida en la esquina superior izquierda de la foto (`top-2 left-2`). La zona superior izquierda queda limpia y reservada exclusivamente para estados críticos del perfil (`⚡ YA` u `⭐ VOS`).
     - Consolidación de toda la telemetría (Protocolo de Salida + Insignias de Confianza y Veredicto) en la **píldora táctica unificada adherida directamente arriba del nombre**:
       - Formato táctico unificado: `[ 🫂 MIMOS │ 🛡️ 👻 +3 ]`.
       - Si no hay protocolo asignado, muestra limpiamente los sellos de confianza: `[ 🛡️ 👻 +2 ]`.
       - Si solo cuenta con protocolo, muestra: `[ 🫂 MIMOS ]`.
       - Al hacer tap, abre el expediente táctico completo sin duplicar información en pantalla ni tapar el rostro en la fotografía.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/lib/i18n/translations.ts`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/profile/ExitProtocolBadge.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/chat/PreFlightCard.tsx`
  - `src/components/diary/DiaryTimeline.tsx`
  - `src/components/diary/SmartCalendarGrid.tsx`
  - `src/components/pulses/PulsesView.tsx`
  - `src/components/radar/RadarSweep.tsx`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 103 tests automatizados en Vitest ejecutados con 100% de éxito (14 suites, 0 regresiones).
  - [x] Verificación visual en caliente mediante Chrome DevTools (`take_screenshot`).
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [OPT-006] · [2026-09-06] Bloque 6 Desactivación de Blur Residual, Memoización de Navegación & Persistencia Eficiente (P0)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Rendimiento & Persistencia`
- **Módulo / Eje**: `Design System & UI`, `Navegación & Header`, `Matriz de Perfiles`, `Almacenamiento & Memoria`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 6 de optimización para eliminar la sobrecarga residual del compositor de GPU provocada por filtros de desenfoque (`backdrop-blur`) en capas permanentes y componentes de alta frecuencia, memoizar cómputos en la navegación principal y habilitar persistencia en segundo plano no bloqueante:
  1. **Sustitución de `backdrop-blur` por Sólidos Tácticos de Alto Contraste**:
     - En `TacticalBadge.tsx`, se retiró `backdrop-blur-md` del estilo base y se redefinieron las variantes con fondos oscuros brutalistas de alto contraste (`bg-amber-950/70`, `bg-red-950/70`, `bg-emerald-950/70`, `bg-purple-950/70`, `bg-obsidian-surface`). Esto elimina decenas de pases de rasterización offscreen cuando se visualizan listados y modales con múltiples insignias.
     - En `BrutalistHeader.tsx`, la cabecera sticky permanente sustituyó `bg-obsidian-deep/95 backdrop-blur-2xl` por `bg-obsidian-deep`, erradicando el cálculo continuo de desenfoque de toda la pantalla superior durante el scroll.
     - En `BrutalistNav.tsx`, la barra inferior fija de 6 pestañas sustituyó `bg-obsidian-deep/95 backdrop-blur-2xl` por `bg-obsidian-deep`, aliviando la carga permanente en la GPU móvil.
     - En `ProfileGrid.tsx`, la barra superior sticky de búsqueda y filtros rápidos sustituyó `bg-obsidian-deep/95 backdrop-blur-xl` por `bg-obsidian-deep`, permitiendo un scroll a 120 FPS sin contención de framebuffers.
  2. **Memoización de Cómputos e Iteraciones en `BrutalistNav.tsx`**:
     - Se envolvieron en `useMemo` el contador de mensajes no leídos `unreadMessagesCount` (que ejecutaba `Object.values(chatMessages).reduce` con filtros sobre todas las conversaciones en cada re-render), el contador de encuentros programados `upcomingDatesCount` y la definición de las 6 pestañas tácticas (`tabs`).
  3. **Persistencia Local Asíncrona en Segundo Plano (`localStorageSync.ts`)**:
     - Incorporación de `scheduleDeferredSave` y `flushDeferredSave` con debounce y ejecución diferida mediante `requestIdleCallback` (con fallback a `setTimeout` y deadline de 1000ms), asegurando que la serialización JSON de colecciones extensas no cause pausas en el hilo de animación (jank).
     - Cobertura de tests unitarios completa (6 nuevos tests automatizados en `tests/unit/storage/localStorageSync.test.ts`).
- **Componentes & Archivos Clave**:
  - `src/components/ui/TacticalBadge.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/navigation/BrutalistNav.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/lib/storage/localStorageSync.ts`
  - `tests/unit/storage/localStorageSync.test.ts`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 103 tests automatizados en Vitest ejecutados con 100% de éxito (14 suites, 0 regresiones).
  - [x] Tests unitarios dedicados para persistencia local y timers diferidos.
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [OPT-005] · [2026-09-06] Bloque 5 Rendimiento de Medios & LCP Acelerado (P0)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Rendimiento & Medios`
- **Módulo / Eje**: `Matriz de Perfiles`, `Chat & Darkroom`, `Pulsos Cinéticos`, `Radar & HUD`, `Medios & LCP`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 5 de rendimiento enfocado en la descompresión asíncrona de recursos gráficos y la optimización radical de Largest Contentful Paint (LCP) y Cumulative Layout Shift (CLS):
  1. **Decodificación Asíncrona (`decoding="async"`) Multi-Módulo**:
     - Implementado en avatares y fotografías de `ProfileCard.tsx`, `DarkroomChatModal.tsx`, `PulsesView.tsx`, `DarkroomListView.tsx` y `RadarSweep.tsx`.
     - Permite que el hilo principal (main thread) del navegador no se congele durante la descompresión de imágenes JPEG/PNG, delegando la rasterización a hilos secundarios y garantizando un desplazamiento táctil suave a 60/120 FPS sin frames caídos (jank).
  2. **Priorización Crítica LCP con `fetchPriority="high"` y `loading="eager"`**:
     - En `ProfileGrid.tsx`, se computa `isPriority={index < 4}` para las 4 primeras tarjetas visibles above-the-fold.
     - En `ProfileCard.tsx`, se reciben estas señales para aplicar `fetchPriority="high"` y `loading="eager"`, instruyendo al motor del navegador a priorizar la descarga y renderizado de los avatares iniciales antes que scripts diferidos o recursos secundarios, reduciendo drásticamente la métrica Largest Contentful Paint de Core Web Vitals.
     - Todas las tarjetas a partir del índice 4 mantienen `loading="lazy"` y `fetchPriority="auto"`.
  3. **Carga Diferida y Rendimiento en Chat y Radar**:
     - En `DarkroomChatModal.tsx`, las previsualizaciones de medios, álbumes y contenido desenfocado utilizan `loading="lazy"` y `decoding="async"`.
     - En `RadarSweep.tsx`, los avatares del radar dinámico y el quick-HUD utilizan `loading="lazy"` y `decoding="async"`.
     - Preservación de proporciones de aspecto fijas (`aspect-square`, `w-full h-full object-cover`) garantizando Cumulative Layout Shift (CLS) = 0.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/pulses/PulsesView.tsx`
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/radar/RadarSweep.tsx`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 97 tests automatizados en Vitest ejecutados con 100% de éxito (0 regresiones).
  - [x] Preservación de atributos de seguridad `referrerPolicy="no-referrer"`.
  - [x] Sincronización en memoria Engram y documentos de contexto.

---

### [OPT-004] · [2026-09-06] Bloque 4 Cero Lag Táctil, PWA Standalone y Viewport Elástico (P0)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Ergonomía Móvil & PWA`
- **Módulo / Eje**: `Layout & Core`, `Design System & UI`, `Accesibilidad & Rendimiento`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 4 para erradicar la latencia táctil de 300ms y dotar a la plataforma de paridad con aplicaciones nativas en iOS y Android:
  1. **Cero Retardo Táctil con `touch-action: manipulation` (`src/app/globals.css`)**:
     - Aplicación de `touch-action: manipulation` sobre `html, body, button, a, input, select, textarea`.
     - Erradica la ventana de espera de hasta 300ms que los navegadores móviles (Safari iOS y Chrome Android) reservan para descartar un posible doble toque de zoom, haciendo que cada pulsación de botón, tab o switch responda instantáneamente a 120Hz.
     - Inclusión de `-webkit-overflow-scrolling: touch` y `text-rendering: optimizeLegibility`.
  2. **Metadatos Nativos PWA Standalone para iOS (`src/app/layout.tsx`)**:
     - Configuración de `appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VESSEL" }`.
     - Permite que al anclar VESSEL a la pantalla de inicio del iPhone, la app se lance sin la barra de direcciones ni controles de Safari, utilizando toda la pantalla física de borde a borde (Safe Area completa).
     - Añadido `formatDetection` estricto (`telephone: false`, `date: false`, etc.) para evitar interpretaciones erróneas de PINs o telemetría como números telefónicos.
  3. **Viewport Dinámico y Contención en `BrutalistModal.tsx`**:
     - Transición de `max-h-[90vh]` a `max-h-[90dvh]` en la tarjeta del modal, previniendo desbordamientos cuando las barras del navegador móvil o teclados virtuales se activan.
     - Adición de `[overscroll-behavior:contain]` en el telón de fondo del modal para impedir el scroll-chaining hacia el fondo de la pantalla.
  4. **Guarda Global de Accesibilidad y Ahorro de Energía (`globals.css`)**:
     - Regla `@media (prefers-reduced-motion: reduce)` que neutraliza animaciones infinitas o transiciones pesadas cuando el usuario tiene configurado movimiento reducido o el sistema operativo activa el ahorro de batería.
- **Componentes & Archivos Clave**:
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/components/ui/BrutalistModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de tests automatizados ejecutada (97/97 tests pasando).
  - [x] Compatibilidad total con PWA y sin regresiones visuales.

---

### [OPT-003] · [2026-09-06] Bloque 3 Ergonomía Móvil, Respuesta Háptica y Adaptación de Viewport (P2)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Audio & Háptica` / `Ergonomía Móvil`
- **Módulo / Eje**: `Audio & Háptica`, `Chat Darkroom`, `Ajustes & Cuenta`, `Calidad & Testing`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 3 para refinar la interacción física y táctil en smartphones y tablets, resolviendo problemas de viewport móvil y elevando la experiencia sensorial táctica:
  1. **Motor Háptico Táctico en `SubBassAudioEngine.ts`**:
     - Integración de `navigator.vibrate` con comprobación de capacidades de hardware y manejo seguro en navegadores que restringen permisos.
     - Patrones táctiles discretos sincronizados con los tonos sub-bass:
       - Micro-vibración rápida (10-12ms) para pings, clics, estados corporales y pulsos.
       - Doble pulso de alerta táctil ([20, 35, 20]ms) para errores o advertencias.
       - Patrón táctil de validación exitosa ([12, 50, 18]ms) para envío de mensajes, PIN de encuentro y apertura de bóveda.
       - Ráfaga táctil SOS de alta prioridad ([80, 40, 80, 40, 120]ms) para emergencias y modo pánico.
     - Funcionamiento en modo *stealth*: la vibración táctil se ejecuta incluso cuando el audio está silenciado (`isMuted: true`), proporcionando confirmación física silenciosa ideal para clubs o entornos oscuros.
  2. **Sincronización Reactiva en `SettingsContext.tsx` y Control UI en `AppSettingsSection.tsx`**:
     - Efecto de sincronización inmediata que vincula `appSettings.soundEnabled` y `appSettings.hapticFeedbackEnabled` con el motor acústico/háptico.
     - Inclusión del interruptor táctico para respuesta háptica en la sección de Experiencia Sensorial de los ajustes de cuenta, con prueba en caliente de sonido sub-bass + vibración física.
  3. **Viewport Dinámico (`h-dvh`), Anclaje y Contención de Overscroll en `DarkroomChatModal.tsx`**:
     - Implementación de `h-[100dvh] max-h-[100dvh]` y contención de rebote elástico (`[overscroll-behavior:contain]` y `overscroll-contain`) en el contenedor del modal y en el feed de mensajes, impidiendo el scroll-chaining en Safari iOS.
     - Anclaje persistente de la barra de entrada (`flex-shrink-0 sticky bottom-0 z-20`) para evitar que el teclado virtual tape el campo de texto o desplace la interfaz fuera de la pantalla.
  4. **Suite de Tests Automatizados (`SubBassAudioEngine.test.ts`)**:
     - 7 tests unitarios nuevos verificando activación/desactivación, micro-vibraciones, ráfaga SOS, modo stealth silenciado y patrones táctiles diferenciados.
     - Cero regresiones: 97/97 tests pasando en Vitest en 1.00s.
- **Componentes & Archivos Clave**:
  - `src/lib/audio/SubBassAudioEngine.ts`
  - `src/context/domains/SettingsContext.tsx`
  - `src/components/account/AppSettingsSection.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `tests/unit/audio/SubBassAudioEngine.test.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de tests automatizados ejecutada (97/97 tests pasando).
  - [x] Retroalimentación táctil probada y aislada contra navegadores sin API de vibración.

---

### [OPT-002] · [2026-09-06] Bloque 2 Optimización de Render, Búsqueda y Radar (Fluidez P1)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Rendimiento & Render`
- **Módulo / Eje**: `Matriz & Grilla`, `Radar`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 2 de optimizaciones críticas de renderizado, cálculo algorítmico y aceleración por GPU para 60/120 FPS sostenidos:
  1. **Aceleración GPU para el Barrido de Radar (`tailwind.config.ts` y `RadarSweep.tsx`)**:
     - Se añadió `@keyframes radar-sweep` y clase `animate-radar-sweep` en Tailwind para delegar la rotación del haz al hilo de composición de la GPU.
     - Se aplicaron `will-change-transform [transform:translateZ(0)] motion-reduce:animate-none` al haz cónico en `RadarSweep.tsx`.
     - Optimización algorítmica de `closestProfile`: Se eliminó el anti-patrón de `useEffect` con sincronización de estado (`useState`) y se reemplazó por un cálculo lineal $O(N)$ directo dentro de `useMemo`, eliminando renders en cascada en cada tick.
  2. **Memoización & Desacople Granular en `ProfileCard.tsx`**:
     - Se desacopló el componente de la fachada monolítica `useVessel()`, sustituyéndolo por hooks granulares específicos de dominio (`useRadarMatrix`, `useChat`, `useDiary`, `useSettings`).
     - Se envolvió el componente en `React.memo` con comparación de props superficial. Cada tarjeta ahora es completamente inmune a re-renders globales generados por cambios en otros sub-contextos (como GPS, pulsos o batería).
  3. **Búsqueda Concurrente no Bloqueante con `React.startTransition` (`ProfileGrid.tsx`)**:
     - Se aisló el estado inmediato de escritura (`searchValue`) para respuesta instantánea a 120Hz en el teclado de dispositivos móviles.
     - El filtro pesado de perfiles y actualización de la grilla se despachó concurrentemente dentro de `React.startTransition`, evitando el bloqueo del hilo principal durante la escritura rápida.
  4. **Precomputación $O(N)$ de Afinidad & Light Virtualization (`ProfileGrid.tsx`)**:
     - Se optimizó el ordenamiento por afinidad precomputando los puntajes en un `Map<string, number>` de pasada única $O(N)$, reduciendo la complejidad del sort de $O(N \log N)$ con recálculo repetitivo a $O(1)$ por comparación.
     - Se implementó contención y renderizado diferido con CSS moderno (`[content-visibility:auto] [contain-intrinsic-size:0_260px]`), reduciendo el costo de layout y paint del DOM para tarjetas fuera del viewport en dispositivos móviles de gama baja.
- **Componentes & Archivos Clave**:
  - `tailwind.config.ts`
  - `src/components/radar/RadarSweep.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suite completa de tests automatizados ejecutada (`npm run test`: 90/90 tests pasando limpiamente en 1.04s).
  - [x] Sin mutaciones destructivas en el comportamiento táctico ni UX de la Matriz o Radar.

---

### [OPT-001] · [2026-09-06] Bloque 1 Optimización de Fluidez & Rendimiento Multi-Dispositivo
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Core / Rendimiento`
- **Módulo / Eje**: `Arquitectura & Core`, `Matriz & Grilla`, `Navegación & Layout`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación del Bloque 1 de Quick Wins de alto impacto para rendimiento y fluidez en dispositivos móviles, tablets y computadoras:
  1. **Renderizado Condicional Real de 18 Modales Dinámicos (`src/app/page.tsx`)**:
     - Erradicación de la carga fantasma de JavaScript donde 17+ componentes dinámicos (`dynamic(..., { ssr: false })`) descargaban sus chunks simultáneamente en el primer arranque del cliente.
     - Condicionamiento estricto en el árbol JSX bajo sus banderas de estado (`isHostCardModalOpen`, `isPreFlightModalOpen`, `isSafetyBeaconModalOpen`, etc.), garantizando que los chunks JS solo se soliciten por red cuando el usuario activa la acción.
     - Dynamic import añadido para `DynamicFilterDrawer` y `StealthLockScreen`.
  2. **Erradicación del "Backdrop-Blur Churn" en `ProfileCard.tsx`**:
     - Eliminación de hasta 7 capas de `backdrop-blur-md` por tarjeta en la grilla (`ProfileCard.tsx`), sustituyéndolas por fondos sólidos brutalistas oscuros de alto contraste (`bg-black/90`, `bg-black/95`, `bg-amber-950/95`, `bg-red-950/95`).
     - Alivia más de 150-200 pases de desenfoque gaussiano concurrentes durante el desplazamiento vertical, permitiendo scroll estable a 120 FPS en iPhones y dispositivos Android de gama media sin sobrecalentamiento.
  3. **Viewport Fit Cover para iOS Safe Areas (`src/app/layout.tsx`)**:
     - Adición de `viewportFit: "cover"` en la configuración de `Viewport`, garantizando la correcta lectura de `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` en Safari móvil y PWA (Dynamic Island, Notch y barra de gestos).
  4. **Optimización de Importación de Iconos (`next.config.ts`)**:
     - Configuración de `optimizePackageImports: ["lucide-react"]` para transformar imports barril en directos, optimizando el tamaño del bundle y la velocidad del compilador.
- **Componentes & Archivos Clave**:
  - `src/app/page.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/app/layout.tsx`
  - `next.config.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Suite de pruebas automatizadas ejecutada (90 tests pasando al 100%).
  - [x] Sin mutaciones visuales indeseadas: preservación 100% de la estética industrial brutalista dark luxury.
  - [x] Documentación actualizada en el feature ledger.

---

### [ENH-013] · [2026-09-06] Fase 5: Estandarización de Design System & Modularización UI (P3)
- **Tipo**: `Enhancement (Mejora/Refactor)` / `Core / UI`
- **Módulo / Eje**: `Perfil & Cuenta`, `Design System`, `Primitivas UI`, `Seguridad & Auxilio`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Elevación integral del ~60% restante de la interfaz de VESSEL de Tier 2 (legado) a Tier 1 Impeccable, erradicando el monolitismo visual y garantizando consistencia absoluta en tokens brutalistas, ergonomía táctil y voseo rioplatense:
  1. **Biblioteca de Primitivas UI Atómicas Reutilizables (`src/components/ui/`)**:
     - `BrutalistButton.tsx`: 5 variantes semánticas (`primary`, `danger`, `secondary`, `ghost`, `outline`), tamaños estandarizados con altura táctil mínima de 44px (`default`, `sm`, `lg`, e `icon` 44x44px estricto), soporte de estados de carga con spinner, integración opcional con `SubBassAudioEngine` (`pulse`, `subbass`, `vault`), y cumplimiento estricto de los 5 estados interactivos (Default, Hover, Active:scale-[0.96], Focus-visible:ring-2, Disabled:opacity-40).
     - `TacticalBadge.tsx`: Badges semánticos con backdrop blur (`amber`, `blood`, `emerald`, `purple`, `neutral`) y punto de pulso reactivo opcional (`animate-ping`).
     - `BrutalistModal.tsx`: Envoltorio modal accesible con bloqueo reactivo de scroll en body, escucha de tecla Escape (`keydown`), backdrop blur `bg-black/85` y botón de cierre táctil accesible de 44x44px.
     - `BrutalistInput.tsx`: Campo de entrada táctil con altura mínima de 44px, estados visuales coherentes, anillo de foco `ring-rawAmber`, soporte de iconos left/right, labels y mensajes de error.
  2. **Modularización del Monolito Visual `ProtocolView.tsx`**:
     - Descomposición de 1.761 líneas de código a ~360 líneas limpias, delegando la presentación a 5 componentes de sub-pestañas autónomos bajo `src/components/account/tabs/`: `BioTab`, `AlbumsTab`, `KinksTab`, `ReputationTab` y `BoundariesTab`.
     - Corrección de espaciado y colisiones en Hero Banner (`pr-12 sm:pr-28` para evitar solapamiento entre botón flotante de Configuración y el selector de edición de Codename).
  3. **Estandarización de Modales Secundarios**:
     - `SafetyBeaconModal.tsx`: Migrado a `BrutalistModal` y `BrutalistButton`, inputs ergonómicos de 44px y voseo rioplatense ("Intentá nuevamente").
     - `DuoLinkModal.tsx`: Migrado a `BrutalistModal` y `BrutalistButton`, reemplazo de tuteo neutro ("TÚ", "Vincula") por voseo rioplatense estricto ("VOS", "Vinculá").
     - `SpikedDrinkAlertModal.tsx`: Botón de cierre ampliado de 32px a 44x44px accesible, botón de emisión de alerta con `BrutalistButton`, listeners de Escape y scroll lock.
     - `UnlimitedPaywallModal.tsx`: Botón de cierre de 44x44px, selectores de pase nocturno y membresías con altura táctil mínima de 44px, botones de acción `BrutalistButton` y voseo rioplatense ("Navegá", "Creá", "Conocé", "Mirá", "Cancelá", "Ya tenés").
  4. **Suites de Tests Automatizados de UI**:
     - 20 nuevos tests unitarios en Vitest para las 4 primitivas de UI (`BrutalistButton.test.tsx`, `BrutalistModal.test.tsx`, `TacticalBadge.test.tsx`, `BrutalistInput.test.tsx`), alcanzando 90/90 tests pasando en toda la app.
- **Componentes & Archivos Clave**:
  - `src/components/ui/BrutalistButton.tsx`
  - `src/components/ui/TacticalBadge.tsx`
  - `src/components/ui/BrutalistModal.tsx`
  - `src/components/ui/BrutalistInput.tsx`
  - `src/components/ui/index.ts`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/account/tabs/BioTab.tsx`
  - `src/components/account/tabs/AlbumsTab.tsx`
  - `src/components/account/tabs/KinksTab.tsx`
  - `src/components/account/tabs/ReputationTab.tsx`
  - `src/components/account/tabs/BoundariesTab.tsx`
  - `src/components/account/tabs/index.ts`
  - `src/components/safety/SafetyBeaconModal.tsx`
  - `src/components/cruising/DuoLinkModal.tsx`
  - `src/components/nightlife/SpikedDrinkAlertModal.tsx`
  - `src/components/subscription/UnlimitedPaywallModal.tsx`
  - `tests/unit/ui/BrutalistButton.test.tsx`
  - `tests/unit/ui/BrutalistModal.test.tsx`
  - `tests/unit/ui/TacticalBadge.test.tsx`
  - `tests/unit/ui/BrutalistInput.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Suites de pruebas completas: 90/90 tests pasando en Vitest en 980ms.
  - [x] Verificación visual en browser con Chrome DevTools en vivo (`http://localhost:3001/`).
  - [x] Invariantes de 44px touch targets y 5 estados cumplidos al 100%.
  - [x] Voseo rioplatense ("VOS") riguroso y sin residuos de tuteo neutro.

---

### [ARCH-003] · [2026-09-06] Fase 4: Infraestructura de Calidad y Tests Automatizados (P3)
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Testing & Calidad`, `Criptografía`, `Geoespacial`, `Lógica de Negocio`, `Internacionalización`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Implementación integral del entorno de testing moderno y automatizado para VESSEL, erradicando la deuda técnica de "cero tests" diagnosticada en la auditoría de Vibe Coding:
  1. **Runner Ultrarrápido & Configuración**:
     - Vitest 4 + `happy-dom` + `@testing-library/react` con ejecución sub-segundo (<700ms para 70 tests).
     - Configuración nativa con soporte para alias `@/`, transformación automática JSX (`oxc`), y mocks globales para Web Audio API (`MockAudioContext`, osciladores, ganancias y filtros biquad) y Firebase.
     - Scripts npm configurados: `test`, `test:watch`, `test:coverage`, `validate`.
  2. **Suites Unitarias de Dominios Puros (51 tests)**:
     - *Seguridad & Criptografía (`cryptoUtils.test.ts`):* 13 tests de hashing NIST SHA-256 con salt, verificación de PINs de 4 dígitos, rechazo de caracteres inválidos, mitigación de timing attacks vía `timingSafeEqual`. *Bug real detectado y corregido*: normalización de casing en hashes almacenados.
     - *Geoespacial (`GeospatialEngine.test.ts`):* 10 tests de codificación/decodificación Geohash (precisión 5, 7, 8), bounds espaciales, Haversine y niveles de discretización anti-triangulación (`<50m`, `~250m`, `strict_stealth`, `geohash_cell_150m`).
     - *Motor de Batería (`BatteryStateEngine.test.ts`):* 8 tests de transiciones entre los 4 modos (`foreground_active`, `eco_saver`, `passive_geofence`, `background_coarse`), frecuencias de muestreo dinámicas (30s vs 300s vs 0s) y suscripciones.
     - *Reglas de Negocio & Cuotas (`freeTierLimits.test.ts`):* 9 tests de `FREE_TIER_LIMITS` (máximo 1 álbum público, 1 privado, 10 fotos en Free, desbloqueo total para Unlimited). Módulo extraído a `src/lib/business/freeTierLimits.ts` con 100% de cobertura.
     - *Internacionalización (`translations.test.ts`):* 11 tests con validación recursiva de paridad exacta 100% entre `TRANSLATIONS.es` y `TRANSLATIONS.en`, ausencia de strings vacíos y formateo métrico/imperial (`formatDistance`).
  3. **Suites de Integración de Contextos Especializados (19 tests)**:
     - *`SafetyContext.test.tsx`:* Armado y desarmado del Guardián Silencioso, verificación criptográfica de PIN, trigger silencioso de coacción (Duress) y conmutación de pantalla de cobertura (camuflaje).
     - *`LogisticsHotspots.test.tsx`:* Check-in optimista incrementando contadores y activando `isCheckedIn`, check-out atómico con cota inferior en 0 e invocación a Firestore.
     - *`DiaryTestimonials.test.tsx`:* Ciclo de vida de testimonios consensuados (`pending` -> `approved` / `hidden` / `rejected`), seguimiento preventivo Doxy-PEP con ventanas automáticas de 24h y 72h, y operaciones CRUD de entradas de diario.
- **Componentes & Archivos Clave**:
  - `vitest.config.mts`
  - `tests/setup.ts`
  - `src/lib/business/freeTierLimits.ts`
  - `src/lib/security/cryptoUtils.ts`
  - `src/lib/geo/GeospatialEngine.ts`
  - `src/lib/geo/BatteryStateEngine.ts`
  - `src/lib/i18n/translations.ts`
  - `tests/unit/security/cryptoUtils.test.ts`
  - `tests/unit/geo/GeospatialEngine.test.ts`
  - `tests/unit/geo/BatteryStateEngine.test.ts`
  - `tests/unit/business/freeTierLimits.test.ts`
  - `tests/unit/i18n/translations.test.ts`
  - `tests/integration/domains/SafetyContext.test.tsx`
  - `tests/integration/domains/LogisticsHotspots.test.tsx`
  - `tests/integration/domains/DiaryTestimonials.test.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] 100% de tests pasando: 70 tests en 8 suites (`npm test` en 694ms).
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Cobertura generada con éxito (`npm run test:coverage`).
  - [x] Documentación y registro de decisiones actualizados.

---

### [ARCH-002] · [2026-09-06] Transición de Simulaciones a Backend Real (P2)
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Arquitectura & Backend`, `Radar`, `Pulsos`, `Logística`, `Perfil & Álbumes`, `Diario & Encuentros`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Transición integral de las características simuladas con `setTimeout` y datos en memoria a servicios reactivos en producción con Cloud Firestore y Firebase Cloud Storage, conservando 100% de resiliencia local-first y degradación transparente (0ms TTFB):
  1. **Pulsos Cinéticos Multiusuario (`pulseService.ts` -> `/vessel_pulses`)**:
     - Conexión reactiva a Firestore en tiempo real (`subscribeToIncomingPulses`).
     - Emisión, respuesta, marcación de lectura y limpieza de pulsos cinéticos persistentes en la nube (sin auto-expiración arbitraria, respetando decisión de usuario).
     - Feedback acústico sub-bass analógico (45-80Hz) y actualización optimista instantánea en interfaz.
  2. **Hotspots Tácticos Urbanos & Cruising (`hotspotService.ts` -> `/vessel_hotspots`)**:
     - Colección compartida con inicialización atómica (seed transparente de puntos de encuentro urbanos).
     - Check-in y check-out atómico concurrente mediante `increment(1)` e `increment(-1)` de Firestore, libre de condiciones de carrera.
     - Preservación del estado local de presencia (`isCheckedIn`) al sincronizar deltas de concurrencia.
  3. **Álbumes Multimedia & Sincronización de Usuario (`albumService.ts` & `userDataService.ts`)**:
     - Gestión en la nube de álbumes y medios (`/vessel_users/{uid}/albums` y Firebase Storage).
     - Subida atómica con `arrayUnion` para fotos y videos sin pisar uploads concurrentes.
     - Reemplazo del mock `setTimeout(resolve, 600)` en `syncCloudNow` por persistencia atómica real en Firestore (`saveFullUserDataToCloud`).
     - Retención física de assets en Cloud Storage para fotos efímeras (Burn-on-View) con marcado lógico `isBurned: true`, agilizando recargas futuras.
  4. **Testimonios de Encuentros Consensuados (`testimonialService.ts` -> `/vessel_testimonials`)**:
     - Publicación en la nube (`submitTestimonialToCloud`) y suscripción en tiempo real a testimonios entrantes (`subscribeToReceivedTestimonials`).
     - Aprobación, visibilidad y rechazo reflejados de forma atómica en Firestore.
  5. **Presencia en Matriz en Tiempo Real (`matrixService.ts` & `AuthContext.tsx`)**:
     - Publicación automática de coordenadas discretizadas, estado corporal y perfil en `/vessel_profiles/{uid}`.
     - Hidratación bidireccional reactiva del perfil y estado corporal desde `subscribeToFullUserData`.
  6. **Reglas de Seguridad Firestore (`firestore.rules`)**:
     - Validación formal con `firebase_validate_security_rules` (0 errores).
     - Reglas blindadas contra IDOR, spoofing de remitente y acceso no autorizado.
- **Componentes & Archivos Clave**:
  - `src/lib/firebase/pulseService.ts`
  - `src/lib/firebase/hotspotService.ts`
  - `src/lib/firebase/albumService.ts`
  - `src/lib/firebase/testimonialService.ts`
  - `src/lib/firebase/userDataService.ts`
  - `src/lib/firebase/matrixService.ts`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/context/domains/LogisticsContext.tsx`
  - `src/context/domains/SettingsContext.tsx`
  - `src/context/domains/DiaryContext.tsx`
  - `src/context/domains/AuthContext.tsx`
  - `firestore.rules`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Local-first incondicional con 0ms TTFB y persistencia en `localStorage`.
  - [x] Verificación visual de vistas activas (Radar, Grilla, Pulsos, Mi Perfil, Álbumes, Diario) en Chrome DevTools.
  - [x] Invariante de Dev Server respetado (nunca ejecutar `next build` en caliente).

### [ARCH-001] · [2026-09-06] Descomposición del God Object (VesselContext) en 7 Dominios + Fachada Unificada (Composite Facade)
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Refactorización arquitectónica mayor (P1) para resolver el principal anti-patrón de Vibe Coding del sistema: la descomposición del archivo monolítico `VesselContext.tsx` (4,785 líneas y 124 propiedades) en 7 sub-proveedores de dominio especializados y una fachada compuesta transparente:
  1. **Sub-proveedores de Dominio Especializado (`src/context/domains/`)**:
     - `SettingsContext.tsx` (~530 líneas): Configuración general, i18n (es/en), unidades, cuotas de álbumes, pase de fin de semana, sincronización y auditoría ilimitada.
     - `AuthContext.tsx` (~515 líneas): Autenticación (Google, Email, Invitado), perfil propio (`myProfile`), `myBodyState`, verificación facial y liveness.
     - `SafetyContext.tsx` (~470 líneas): Guardián silencioso, dead-man switch, temporizadores aislados (alarma 5s, acelerómetro `DeviceOrientationEvent` flip-to-cover, tecla Escape), modo camaleón y reducción de daños.
     - `LogisticsContext.tsx` (~1,000 líneas): Hotspots tácticos urbanos, check-in/out anónimo, telemetría de batería, geolocalización S2/geohash, travel mode, protocolo de salida, ficha de hospedaje, salas de sesión y suite de nightlife.
     - `RadarMatrixContext.tsx` (~730 líneas): Radar de proximidad, perfiles filtrados, transmisiones, pulsos recibidos, kink matrix ciega, clima sonoro ambiental y temporizador aislado On-The-Clock.
     - `ChatContext.tsx` (~875 líneas): Mensajería en tiempo real Firestore, retención efímera/persistente, puntos de encuentro en 2 fases, checklist pre-flight y límites graduales anti-ghost.
     - `DiaryContext.tsx` (~620 líneas): Diario de encuentros cifrado, calendario inteligente, testimonios consensuados, seguimiento Doxy-PEP, alertas de exposición a ITS y auditoría de bóvedas.
  2. **Patrón Fachada Compuesta (`Composite Facade Pattern`)**:
     - `VesselContext.tsx` reducido de 4,785 a 138 líneas de código.
     - `VesselProvider` compone jerárquicamente los 7 dominios en orden acíclico estricto (`Settings -> Auth -> Safety -> Logistics -> Diary -> Chat -> RadarMatrix -> VesselFacadeBridge`).
     - `useVessel()` expone exactamente la misma interfaz unificada `VesselContextType` con paridad del 100% en tipos, firmas y comportamiento.
     - Cero regresiones y cero cambios de importación requeridos en los 76 componentes consumidores existentes.
  3. **Aislamiento de Renderizado y Efectos**:
     - Temporizadores de 5s (`setInterval` para alarmas y On-The-Clock) y listeners móviles (`DeviceOrientationEvent`) ahora viven exclusivamente dentro de sus dominios (`SafetyContext` y `RadarMatrixContext`), eliminando re-renderizados globales espurios en toda la app.
  4. **Validación Exhaustiva**:
     - `npm run typecheck` (`tsc --noEmit`) verificado con 0 errores.
     - Navegación e interactividad validadas dinámicamente en Chrome DevTools (Page 2, `http://localhost:3001/`): renderizado visual responsivo, selector de estados, apertura de chat, modal del Guardián y cambio entre las 6 pestañas principales.
- **Componentes & Archivos Clave**:
  - `src/context/VesselContext.tsx` (Fachada compuesta, 138 líneas)
  - `src/context/domains/SettingsContext.tsx`
  - `src/context/domains/AuthContext.tsx`
  - `src/context/domains/SafetyContext.tsx`
  - `src/context/domains/LogisticsContext.tsx`
  - `src/context/domains/RadarMatrixContext.tsx`
  - `src/context/domains/ChatContext.tsx`
  - `src/context/domains/DiaryContext.tsx`
  - `src/context/domains/index.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript 5.7+ validado estrictamente (`npm run typecheck` 0 errores).
  - [x] 100% compatibilidad hacia atrás con los 76 componentes consumidores de `useVessel()`.
  - [x] Desacoplamiento de timers e intervalos reactivos a nivel de sub-proveedor.
  - [x] Pruebas visuales e interactivas en Chrome DevTools (Cerca, Radar, Pulsos, Mensajes, Diario, Perfil, Guardián).
  - [x] Documentación sincronizada en registro de features y ADRs.

### [SEC-001] · [2026-09-06] Blindaje de Seguridad P0: Cierre de IDOR en Firestore Rules, Anti-Spoofing, Segregación de Bóveda y Hashing Criptográfico SHA-256 de PINs
- **Tipo**: `Infra/Seguridad`
- **Módulo / Eje**: `Seguridad & DRM`, `Arquitectura & Core`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Ejecución completa del blindaje de seguridad P0 tras auditoría profunda de anti-patrones de Vibe Coding:
  1. **Saneamiento de Credenciales y Control de Código**:
     - Creación de `.gitignore` maestro en la raíz excluyendo variables de entorno locales (`.env*.local`), archivos generados por Next.js (`.next/`), paquetes y logs de depuración.
     - Remoción de API keys, App IDs y tokens fallback hardcodeados en `src/lib/firebase/config.ts`, implementando validación en tiempo de ejecución con advertencias informativas en modo desarrollo.
  2. **Cierre de Brechas Críticas en Firestore Rules (`firestore.rules`)**:
     - *Cierre de IDOR Masivo:* Reemplazo de regla permisiva pública `allow read: if true;` en `/vessel_users/{userId}` por `allow read, write: if isOwner(userId);`, blindando dossiers privados, notas de citas, agendas y límites eróticos personales.
     - *Segregación de Colección Pública:* Creación y regla para `/vessel_profiles/{profileId}` (`allow read: if request.auth != null; allow write: if isOwner(profileId);`) para datos públicos del radar.
     - *Anti-Spoofing en Mensajería:* Eliminación de la cláusula de bypass `request.resource.data.senderId == 'system'`. Validación obligatoria de que `senderId == request.auth.uid`.
     - *Validación Formal:* Reglas auditadas y validadas con el motor oficial de Firebase MCP Server (`firebase_validate_security_rules` -> `OK: No errors detected`).
  3. **Segregación Arquitectónica en Servicio de Perfiles (`profileService.ts`)**:
     - Implementación de dual-write y lectura desacoplada: datos privados de usuario a `/vessel_users/{uid}` y perfil de radar público saneado a `/vessel_profiles/{uid}`.
  4. **Criptografía de PINs y Códigos de Coacción (`cryptoUtils.ts`, `VesselContext.tsx`, Modales)**:
     - Implementación de motor criptográfico síncrono SHA-256 con salt de aplicación y comparación segura contra ataques de temporización (`timingSafeEqual`).
     - Eliminación definitiva del backdoor en texto plano `"1234"` y del valor predeterminado `"9999"`.
     - Hashing obligatorio de PIN Seguro y PIN de Coacción antes de persistir en `localStorage` o estado en memoria.
     - Validación en tiempo de ejecución en Chrome DevTools: verificación de hashes hexadecimales de 64 caracteres en `localStorage.getItem('vessel_safety_beacon_v1')`, rechazo de PINs falsos / bypasses antiguos y activación automática del Bloc de Notas señuelo ante el PIN de coacción.
- **Componentes & Archivos Clave**:
  - `.gitignore`
  - `src/lib/firebase/config.ts`
  - `firestore.rules`
  - `src/lib/firebase/profileService.ts`
  - `src/lib/security/cryptoUtils.ts`
  - `src/context/VesselContext.tsx`
  - `src/components/safety/SafetyBeaconModal.tsx`
  - `src/components/safety/DuressPinSettingsModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Validación sintáctica y semántica de `firestore.rules` con Firebase MCP.
  - [x] Hashes de 64 caracteres en `localStorage` comprobados en Chrome DevTools.
  - [x] Rechazo de PIN incorrecto y backdoor antiguo ("1234") comprobado en navegador real.
  - [x] Desactivación exitosa con PIN real ("5678") comprobada en navegador real.
  - [x] Disparo silencioso de pantalla de cobertura (Scratchpad señuelo) con PIN de coacción ("8888") comprobado en navegador real.
  - [x] Cero credenciales ni tokens en código fuente.

### [ENH-012] · [2026-09-06] Rediseño Impeccable de DateDiaryView, DiaryTimeline y SmartCalendarGrid: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones, Clearance en Ficha de Perfil & Botonera Ergonómica de 44px
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Diario & Salud`, `Ergonomía Táctil`, `UX & Navegación`, `Audio & Háptica`, `Ficha de Perfil`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de la bitácora privada del usuario (`DateDiaryView`, `DiaryTimeline`, `SmartCalendarGrid`) y resolución definitiva del problema de solapamiento del dock flotante sobre la píldora de protocolo en `ProfileDetailModal`:
  1. **Resolución de Colisión en `ProfileDetailModal`**:
     - Incremento del padding inferior del contenedor scrolleable a `pb-52 sm:pb-44`, garantizando holgura total sobre el dock flotante fijo (`fixed bottom-0`).
     - Creación de la variante táctica de alto contraste en `ExitProtocolBadge.tsx` (`bg-gradient-to-r from-amber-950/40 via-amber-900/20 border-amber-400/50 text-amber-200`) eliminando cualquier confusión visual en modo noche / baja luminosidad.
  2. **Arquitectura Táctica de 3 Niveles en Tarjetas de Citas (`DiaryTimeline` y `SmartCalendarGrid`)**:
     - *Nivel 1 (Identidad, Estado & Telemetría):* Avatar táctico de 56×56px con halo online ámbar y badge de verificación 'V', codename, edad, rol táctico (`ACTIVO`/`PASIVO`/`VERSÁTIL`), badge de hospedaje (`🏠 LUGAR`), fecha y hora (`📅 2026-08-23 · 🕒 14:15`), ubicación con categoría y badge de estado (`★ Rating` o `Programada`).
     - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — 100% Inmune a Colisiones):* Fila horizontal dedicada a la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`), badge de tipo de encuentro (`INTENSE CARNAL`) y badge pulsante `⚡ YA` si está On-the-Clock. Totalmente aislada de botones de acción, erradicando solapamientos.
     - *Nivel 3 (Botonera Táctica Aislada en Zona del Pulgar):* Fila inferior con separador sutil (`border-t border-white/10 mt-2.5 pt-2.5`) y 3 botones táctiles de 44px de altura mínima:
       - `[Ficha >]`: Abre la ficha táctica completa del contacto con 1 solo tap.
       - `[🍆 Pulso / +N]`: Emisión cinética de pulso con síntesis de audio sub-bass analógica (60Hz) y contador reactivo.
       - `[💬 Abrir Chat]`: Botón primario en Raw Amber para ingresar directo a la conversación en Darkroom.
       - Controles secundarios en fila inferior: `[✏️ Editar]` y `[🗑️ Borrar]`.
  3. **Optimización de Taps (Speed-to-Action)**:
     - **0 Taps:** Conocer el protocolo de salida acordado y el tipo de encuentro directamente en la tarjeta de la cita.
     - **1 Tap:** Abrir Darkroom Chat con el contacto de la cita sin tener que buscarlo en mensajes o radar (reducido de 4 taps a 1 tap).
     - **1 Tap:** Enviar pulso de rol con sonido sub-bass directamente desde la bitácora (reducido de 3 taps a 1 tap).
     - **1 Tap:** Abrir la ficha completa del perfil (reducido de 2-3 taps a 1 tap).
  4. **Preservación Integral de Capacidades (58 Features)**:
     - 100% de características preservadas: notas confidenciales cifradas con toggle de revelado, desglose de satisfacción (Expectativa, Química, Límites, Repetir), etiquetas/tags de fetiches y prácticas, recordatorio de rutina de salud/PrEP con botón de resolución, y filtros por estado y rating.
- **Componentes & Archivos Clave**:
  - `src/components/profile/ExitProtocolBadge.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/diary/DiaryTimeline.tsx`
  - `src/components/diary/SmartCalendarGrid.tsx`
  - `src/components/diary/DateDiaryView.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` / `npx tsc --noEmit` con 0 errores).
  - [x] Estados visuales e interactivos verificados (Default, Hover, Active, Focus, Disabled) cumpliendo Impeccable UI.
  - [x] Inspección visual y funcional en vivo en Chrome DevTools (navegación fluida a chat, ficha y calendario).
  - [x] Sincronización en memoria Engram y documentos de contexto.

### [ENH-011] · [2026-09-05] Rediseño Impeccable de DarkroomListView y DarkroomChatModal: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones, Línea 4 en Cabecera & Botonera Ergonómica de 44px
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Chat Darkroom`, `Ergonomía Táctil`, `UX & Navegación`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de la vista de Mensajes (`DarkroomListView.tsx`) y de la cabecera activa de conversación (`DarkroomChatModal.tsx`) aplicando los estándares Impeccable UI, resolviendo de forma definitiva la colisión visual de botones sobre la píldora de protocolo de salida y optimizando el Speed-to-Action:
  1. **Arquitectura Táctica de 3 Niveles en Tarjetas de Mensajes (`DarkroomListView`)**:
     - *Nivel 1 (Identidad, Telemetría & Último Mensaje):* Avatar táctico de 56×56px con halo reactivo de estado corporal (`open` en ámbar, `occupied` en neón sangre), badge de verificación 3D, codename, edad, rol táctico, distancia discretizada S2, badge de movilidad (`🏠 Tiene sitio` / `🚗 Se desplaza`), vista previa tipada del último mensaje con iconos semánticos (PIN, fuego efímero, multimedia, cierre respetuoso) y badge de Karma Anti-Ghost (`👻 99%`).
     - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — 100% Inmune a Colisiones):* Fila horizontal a ancho completo reservada exclusivamente para la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`) en ámbar de alto contraste (`bg-amber-500/15 border-amber-400/50 text-amber-200`) y badge pulsante `⚡ YA` si está On-the-Clock. Totalmente aislada de la botonera inferior, erradicando solapamientos.
     - *Nivel 3 (Botonera Táctica Aislada en Zona del Pulgar):* Fila inferior con separador sutil (`border-t border-white/10 mt-2.5 pt-2.5`) y 3 botones táctiles de 44px de altura mínima:
       - `[Ficha >]`: Abre el expediente completo del perfil con un solo tap.
       - `[🍆 Pulso / +N]`: Emisión cinética de pulso con síntesis de audio sub-bass (60Hz) y contador reactivo sin entrar al chat.
       - `[💬 Abrir Chat]`: Botón primario en Raw Amber para ingresar al Darkroom efímero o persistente.
  2. **Integración de Acuerdos en Cabecera Activa (`DarkroomChatModal`)**:
     - Incorporación de la **Línea 4** en la cabecera del darkroom con la píldora de protocolo (`⏱️ PUNTUAL`, `🫂 CUDDLE`, `🌙 SLEEPOVER`) y el badge `⚡ YA (45m)`, garantizando que ambos usuarios mantengan mutua claridad sobre los acuerdos del encuentro en todo momento mientras chatean, sin interferir con las herramientas de seguridad o navegación.
  3. **Optimización de Taps (Speed-to-Action)**:
     - **0 Taps:** Conocer el protocolo de salida y disponibilidad YA directamente en la lista.
     - **1 Tap:** Enviar un pulso con audio sub-bass sin abrir la conversación.
     - **1 Tap:** Abrir el chat directo.
     - **1 Tap:** Abrir la ficha del perfil.
  4. **Preservación Integral de Capacidades (57 Features)**:
     - 100% de características preservadas, validado con TypeScript (`tsc --noEmit` 0 errores) y Chrome DevTools en vivo.
- **Componentes & Archivos Clave**:
  - `src/components/chat/DarkroomListView.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/lib/i18n/translations.ts`
  - `docs/contexto/decisiones.md`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Cero colisiones entre la píldora de protocolo y la botonera de acciones.
  - [x] Touch targets mínimos de 44px y 5 estados de componentes Impeccable verificados.
  - [x] Verificación visual y pruebas de interacción en caliente mediante Chrome DevTools.
  - [x] Sincronización en memoria Engram y Feature Ledger actualizada.

### [ENH-010] · [2026-09-05] Rediseño Impeccable de PulsesView: Tarjetas Tácticas de 3 Niveles, Píldora de Protocolo Inmune a Colisiones & Botonera Ergonómica de 44px
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Pulsos`, `Ergonomía Táctil`, `UX & Navegación`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de la vista de Pulsos (`PulsesView.tsx`) aplicando los estándares Impeccable UI, resolviendo de raíz el problema de solapamiento de botones sobre la píldora de protocolo y optimizando el Speed-to-Action:
  1. **Arquitectura Táctica de 3 Niveles en Tarjetas de Pulso**:
     - Sustitución de la fila comprimida por una jerarquía vertical limpia:
       - *Nivel 1 (Identidad & Telemetría):* Avatar táctico de 56×56px con insignia de verificación y modo niebla; Codename en negrita monospace, edad, rol tipado en Raw Amber, distancia discretizada S2, badge de movilidad (`🏠 Tiene sitio` / `🚗 Se desplaza`), tiempo relativo, badge de estado (`✓ DEVUELTO` / `🍆 Pulso entrante`) y badge de Karma Anti-Ghost (`👻 99%`).
       - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — 100% Inmune a Colisiones):* Fila horizontal exclusiva para la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL`, `🫂 CUDDLE`, `🌙 SLEEPOVER`) con borde ámbar luminoso y badge `⚡ YA` si está On-the-Clock. Ningún botón comparte espacio con esta fila.
       - *Nivel 3 (Botonera Táctica Aislada en Zona del Pulgar):* Barra de acciones con divisor físico (`border-t border-white/10 mt-2.5 pt-2.5`) y 3 botones táctiles de 44px de altura mínima:
         - `[Ficha >]`: Abre el expediente completo del perfil.
         - `[Devolver Pulso / ✓ Devuelto]`: Emisión cinética de pulso con síntesis de audio sub-bass (60Hz) y cambio reactivo de estado instantáneo.
         - `[💬 Chat]`: Acceso directo al Darkroom efímero en ámbar táctico.
  2. **Simetría Operativa en Pestaña Enviados**:
     - Misma estructura de 3 niveles aplicada a los pulsos enviados con conteo de señales (`1 pulso enviado`), botón `[+1 Pulso]` con audio sub-bass y botón directo a chat.
  3. **Optimización de Taps (Speed-to-Action)**:
     - Protocolo de salida visible en **0 taps** (directo en la tarjeta sin abrir el modal).
     - Devolución/reenvío de pulso en **1 tap** con feedback auditivo inmediato.
     - Inicio de conversación en **1 tap** sin menús intermedios.
  4. **Preservación Integral de Capacidades (56 Features)**:
     - 100% de características preservadas, validado con TypeScript (`tsc --noEmit` 0 errores) y Chrome DevTools en vivo.
- **Componentes & Archivos Clave**:
  - `src/components/pulses/PulsesView.tsx`
  - `docs/contexto/decisiones.md`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Cero colisiones entre la píldora de protocolo y la botonera de acciones.
  - [x] Touch targets mínimos de 44px y 5 estados de componentes Impeccable verificados.
  - [x] Verificación visual y pruebas de interacción en caliente mediante Chrome DevTools.
  - [x] Sincronización en memoria Engram y Feature Ledger actualizada.
| **ENH-008**  | 2026-09-05 | Perfil & Ergonomía | `Enhancement` | Rediseño Ergonómico de ProfileDetailModal: HUD Táctico 1-Vistazo (0 Scrolls/0 Taps), Despeje de Protocolo y Pulso en Dock Inferior | **100%** ✅ |
| **ENH-007**  | 2026-09-04 | Matriz & Card UX | `Enhancement` | Solución de Colisión en ProfileCard: Elevación Táctica de Protocolo a Top-Left & Micro-HUD Despejado | **100%** ✅ |
| **ENH-006**  | 2026-09-04 | Vista Principal & Ergonomía Cerca | `Enhancement` | Rediseño Ergonómico, Optimización de Taps, Chat Directo 1-Tap & Docking Sticky en Cerca | **100%** ✅ |

### [ENH-009] · [2026-09-05] Rediseño Impeccable de RadarSweep: Quick-HUD Ergonómico en 1-Tap, Píldora de Protocolo Desacoplada & Barra Táctica Consolidada
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Radar`, `Ergonomía Táctil`, `Logística & Encuentros`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de la vista Radar (`RadarSweep.tsx`) aplicando los estándares Impeccable UI/UX, optimizando los caminos de interacción a solo 2 taps (Speed-to-Action) y resolviendo de raíz el desbordamiento y colisión de botones con la píldora de protocolo:
  1. **Solución a la Regresión por Clase Inválida de Tailwind (`w-13 h-13`)**:
     - Se corrigió el contenedor del avatar que utilizaba `w-13 h-13` (inexistente en Tailwind CSS v3), reemplazándolo por `w-14 h-14` (56x56px, `rounded-2xl`, `border-2 border-white/20`). Esto evitó que las fotos se expandieran a tamaño natural e inflaran el dock a 1.330px empujando la cabecera fuera de la pantalla.
  2. **Píldora de Protocolo de Salida Destacada y Desacoplada (0 Colisiones)**:
     - Incorporación de una fila semántica dedicada para el `exitProtocol` (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`) con tipografía mono bold, borde ámbar brillante y fondo `amber-500/15`, 100% visible al tocar cualquier nodo del radar.
  3. **Consolidación Superior en 2 Filas Tácticas**:
     - *Fila 1 (Telemetría & Blindaje):* Compass giratorio + Título Radar + Geohash S2 (`u33dc0`) + Conteo de blancos detectados + Toggle de silencio para el sonar + Chip de Batería y GPS.
     - *Fila 2 (Segmented Zoom & Ribbon Deslizable):* Control segmentado de zoom (`500m`, `1.5km`, `5.0km`) + Ribbon táctico horizontal con scroll fluido para `⚡ Baliza`, `✨ Todos`, `🟡 Disponibles`, `🏠 Con Sitio`, `👻 Anti-Ghost`, `🔥 Intensidad 3-4`, `✈️ Travel`, `🔥 Salas`, `🎉 Fiestas` y `⚙️ Filtros`.
  4. **Botonera Inferior Aislada en la Zona del Pulgar (Thumb Zone)**:
     - Separación física mediante borde divisor (`border-t border-white/10 mt-2.5 pt-2.5`) con 3 acciones directas de mínimo 44px de touch target:
       - `[Ver Ficha >]`: Abre la ficha detallada del perfil.
       - `[🍆 Pulso]`: Emite reacción cinética con síntesis de audio sub-bass (60Hz) y conmuta a `[✓ Enviado]` en tiempo real.
       - `[💬 Chat Directo]`: Acción primaria en Raw Amber de alto impacto para iniciar conversación efímera de inmediato.
  5. **Preservación Integral de Capacidades (55 Features)**:
     - Validación completa con TypeScript 5.7+ (0 errores), audio sub-bass sincronizado y verificación visual en tiempo real en Chrome DevTools.
- **Componentes & Archivos Clave**:
  - `src/components/radar/RadarSweep.tsx`
  - `src/data/mockProfiles.ts`
  - `docs/contexto/decisiones.md`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Verificación visual en mobile viewport (390x844 y 500x704).
  - [x] Cero colisiones: protocolo y botones de acción coexisten en filas separadas con 100% de legibilidad.
  - [x] Botones con touch target >= 44px y los 5 estados obligatorios.
  - [x] Baliza óptica accesible en 1 solo tap desde el ribbon táctico.

### [ENH-008] · [2026-09-05] Rediseño Ergonómico de ProfileDetailModal: HUD Táctico 1-Vistazo (0 Scrolls/0 Taps), Despeje de Protocolo y Pulso en Dock Inferior
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Perfil & Cuenta`, `Logística & Encuentros`, `Ergonomía Táctil`, `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de la ventana de detalle de usuario (`ProfileDetailModal.tsx`) aplicando la disciplina Impeccable UI/UX, optimizando los caminos de interacción (taps mínimos) y eliminando de raíz las colisiones visuales con el protocolo:
  1. **Solución Definitiva a la Colisión del Protocolo y Botones**:
     - Despeje total del pie de la ventana mediante padding inferior de scroll (`pb-36`), impidiendo que el dock flotante tape los elementos del fondo (bóveda privada, biografía, notas o acuerdos).
     - Elevación del **Protocolo de Salida** al nuevo **HUD Táctico de 1-Vistazo** en la parte superior (inmediatamente tras la foto), visible en 0 scrolls con badge táctico de alta legibilidad (`⏱️ PUNTUAL`, `🫂 CUDDLE`, `🌙 SLEEPOVER`).
  2. **HUD Táctico de 4 Pilares Operativos (0 Taps / 0 Scrolls)**:
     - Cuadrícula 2x2 brutalista que expone de forma inmediata las 4 variables críticas de cruising:
       - **Rol / Posición**: Badge con icono cinético (`⚡ Activo`, `🍑 Pasivo`, `🔄 Versátil`).
       - **Protocolo de Salida**: Píldora de acuerdo logístico con tip explicativo.
       - **Alojamiento & Movilidad**: `🏠 Tiene Lugar + Ducha` o `🚗 Se Desplaza` (acceso directo a Ficha de Host).
       - **Sintonía Kink Secreta**: Si hay coincidencias privadas en la Kink Matrix, se destaca con glow en rojo neón (`🔥 X Deseos Mutuos`), o distancia táctica en su defecto.
  3. **Dock de Acciones Inferior Ergonómico de 4 Accesos**:
     - Incorporación del botón de **Pulso Cinético de Rol** (`[ 🍆 / 🍑 / ⚡ ]`) directamente en el dock con síntesis acústica sub-bass (`audioEngine.playPulse()`), animación háptica y contador de señales.
     - Botón de **Enviar Ubicación / Rendezvous** (`[ 📍 ]`) en 1 tap.
     - Botón de **Diario de Encuentros** (`[ 📖 ]`) en 1 tap.
     - Botón dominante de **Abrir Chat Darkroom** (`[ 💬 ABRIR CHAT ]`) en ámbar brutalista.
  4. **Despeje y Respiración de la Foto Hero**:
     - Limpieza de la sobrecarga textual sobre la foto para maximizar la visibilidad del rostro/cuerpo del usuario.
     - Reubicación de redes sociales y verificaciones a una franja despejada bajo el HUD.
  5. **Preservación del 100% de Funcionalidades**:
     - Mantenimiento íntegro de las 54 características del sistema, validación estricta de TypeScript 5.7+ (0 errores) y verificación visual responsiva en Chrome DevTools.
- **Componentes & Archivos Clave**:
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/profile/ExitProtocolBadge.tsx`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Verificación visual en mobile viewport (390x844 y 500x704).
  - [x] 0 colisiones: el protocolo y los botones de acción conviven con espacios libres generosos.
  - [x] Pulso de rol táctico operativo en 1 tap con audio sub-bass.
  - [x] Padding `pb-36` verificado: scroll hasta el fondo sin cortes de contenido.

### [ENH-007] · [2026-09-04] Solución de Colisión en ProfileCard: Elevación Táctica de Protocolo a Top-Left & Micro-HUD Despejado
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Matriz & Card UX`, `Logística & Encuentros`, `Ergonomía Táctil`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución técnica y ergonómica de la colisión entre el cluster de botones de acción (`[ 💬 ]` y `[ 🍆 ]`) y la píldora de protocolo de salida en la tarjeta de usuario (`ProfileCard.tsx`):
  1. **Elevación Táctica del Protocolo a Top-Left (0 Taps de lectura)**:
     - El protocolo de salida (`fast_encounter` = `⏱️ PUNTUAL`, `chill_cuddle` = `🫂 CUDDLE`, `sleepover` = `🌙 SLEEPOVER`) es un factor logístico prioritario en cruising.
     - Se reubica en la esquina superior izquierda, debajo de `⚡ YA`, con chip brutalista frosted (`bg-black/80 border-amber-400/40 text-amber-200 text-[8.5px] font-mono font-bold uppercase`).
     - Al tocarlo, abre el Popover/Sheet táctico con la explicación del protocolo. Visibilidad 100% inmediata sin solapamiento alguno.
  2. **Despeje Integral de la Línea 2 Inferior**:
     - La Línea 2 inferior contiene exclusivamente `roleDisplay` ("Activo") y el chip de alojamiento `[ 🏠🚿 ]` (~55px).
     - Se elimina la cápsula de indicadores de la Línea 2, garantizando más de 65px de espacio libre a la derecha.
     - Los botones de **Chat Rápido `[ 💬 ]`** y **Pulso Cinético de Rol `[ 🍆 / 🍑 / ⚡ ]`** respiran con cero obstrucción visual.
  3. **Franja Flotante de Confianza & Vibe**:
     - Insignias secundarias (`🛡️ Verificado`, `👻 Anti-Ghost`, `🔥 Kinks Mutuos`, `🔒 Bóveda`, `🎙️ Audio`) se renderizan como una mini-cápsula compacta por encima del nombre, independiente de la fila de acciones.
  4. **Preservación Total de Capacidades**:
     - Cero pérdida de las 53 características del sistema. Validación estricta con TypeScript 5.7+ y verificación visual multi-resolución en Chrome DevTools.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `docs/contexto/registro-de-features.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` con 0 errores).
  - [x] Verificación visual en mobile viewport (390x844): protocolo 100% visible a top-left, botones de acción limpios sin pisar indicadores.
  - [x] Tap interactivo probado: apertura de chat en 1 tap, transmisión de pulso cinético con audio sub-bass y apertura del sheet explicativo de protocolo e indicadores.

### [ENH-006] · [2026-09-04] Rediseño Ergonómico, Optimización de Taps, Chat Directo 1-Tap & Docking Sticky en "Cerca"
| **ENH-005**  | 2026-09-04 | Mobile Layout & Chat UX | `Enhancement` | Optimización Responsive de Header y Rediseño Impeccable de Chat (No-Wrapping & Barra Unificada) | **100%** ✅ |
| **ENH-004**  | 2026-09-04 | UX & Navegación Táctica | `Enhancement` | Rediseño Impeccable de Ergonomía & Optimización de Taps (Header, Status, Chat, Radar, Card) | **100%** ✅ |
| **FEAT-084** | 2026-09-03 | Negocio & Inversores | `Nueva Feature` | SPA Ejecutiva para Inversores (Single-File index.html, Simulador, 52 Features, Battlecard & ARR) | **100%** ✅ |
| **FEAT-083** | 2026-09-02 | Nightlife & Encuentros | `Nueva Feature` | Cruces en la Pista // Missed Connections (Coincidencias Presenciales, 48h, Pulso y Nota) | **100%** ✅ |
| **FEAT-082** | 2026-09-02 | Nightlife & Seguridad | `Nueva Feature` | VESSEL Nightlife (Cartelera, Radar de Pista por Zonas, Baliza Óptica, Wingman, Afters, Vaso Seguro) | **100%** ✅ |
| **FEAT-081** | 2026-09-02 | Perfil & Salud | `Nueva Feature` | Matriz Táctica de Atmósfera & Sustancias (Zero-Knowledge, 4 Niveles + Filtros Dinámicos) | **100%** ✅ |
| **FEAT-080** | 2026-09-02 | Matriz & UX | `Enhancement` | Rediseño Impeccable de ProfileCard (Aspect Ratio 2/3 Áureo, Scrim 50%, Micro-HUD 2 Líneas) | **100%** ✅ |
| **ENH-003**  | 2026-09-02 | Seguridad & DRM | `Infra/Seguridad` | Blindaje Anti-Captura Mac/Web & Marca de Agua Esteganográfica Universal | **100%** ✅ |
| **FEAT-038** | 2026-09-02 | Perfil & Kinks | `Nueva Feature` | Kink Matrix Ciega con 35 Fetiches Eróticos de la Comunidad Gay | **100%** ✅ |
| **FEAT-037** | 2026-09-02 | Diario & Salud | `Nueva Feature` | Alerta Médica Anónima Comunitaria de Exposición a ITS (Zero-Knowledge) | **100%** ✅ |
| **FEAT-036** | 2026-09-02 | Salud & Seguridad | `Nueva Feature` | Asistente de Reducción de Daños & Chem-Chill (Harm Reduction) | **100%** ✅ |
| **FEAT-035** | 2026-09-02 | Monetización | `Nueva Feature` | Pase de Fin de Semana 48h ($2.99 USD Micro-Pago sin Suscripción) | **100%** ✅ |
| **FEAT-034** | 2026-09-02 | Audio & Logística | `Nueva Feature` | Clima Sonoro & Soundtrack de Hospedaje Analógico (5 Frecuencias en Vivo) | **100%** ✅ |
| **FEAT-033** | 2026-09-02 | Chat & Logística | `Nueva Feature` | Waypoint Seguro en 2 Fases (Protocolo de Dirección Anti-Emboscada) | **100%** ✅ |
| **FEAT-032** | 2026-09-02 | Matriz & Radar | `Nueva Feature` | Radar "On-The-Clock" (Modo Listo YA con Temporizador de 15 a 120m) | **100%** ✅ |
| **FEAT-031** | 2026-09-02 | Radar & Cruising | `Nueva Feature` | Hotspots Tácticos Urbanos & Check-in Anónimo de Cruising | **100%** ✅ |
| **FEAT-030** | 2026-09-02 | Radar & Viajes | `Nueva Feature` | Travel Mode (Teleportación Virtual de Radar a Ciudades Globales) | **100%** ✅ |
| **FEAT-029** | 2026-09-02 | Perfil & Álbumes | `Nueva Feature` | Auditoría de Bóvedas Privadas en Vivo y Revocación Instantánea de Acceso | **100%** ✅ |
| **FEAT-028** | 2026-09-02 | Monetización | `Nueva Feature` | Membresía Oficial VESSEL UNLIMITED (Paywall de 6 Superpoderes) | **100%** ✅ |
| **FEAT-027** | 2026-09-02 | Encuentros & Chat | `Nueva Feature` | Salas de Sesión Privadas & Modo Dúo de Pareja (`👥 DÚO`) | **100%** ✅ |
| **FEAT-026** | 2026-09-02 | Diario & Salud | `Nueva Feature` | Botiquín Clínico Doxy-PEP (Monitoreo de Ventana Crítica de 72h) | **100%** ✅ |
| **FEAT-025** | 2026-09-02 | Perfil & Logística | `Nueva Feature` | Protocolo de Salida Post-Encuentro (Exit Protocol en 3 Modalidades) | **100%** ✅ |
| **FEAT-024** | 2026-09-02 | Seguridad & Auth | `Nueva Feature` | Verificación Biométrica Liveness 3D Facial Anti-Catfish | **100%** ✅ |
| **FEAT-023** | 2026-09-02 | Seguridad & Discreción | `Nueva Feature` | Bloc de Notas Brutalista Camaleón Señuelo con Flip-to-Cover | **100%** ✅ |
| **FEAT-022** | 2026-09-02 | Seguridad & Discreción | `Nueva Feature` | PIN de Coacción Silencioso y Alerta Antirrobo | **100%** ✅ |
| **FEAT-021** | 2026-09-02 | Seguridad Personal | `Nueva Feature` | Guardián Silencioso & Dead-Man Switch de Encuentros Local-First | **100%** ✅ |
| **FEAT-020** | 2026-09-02 | Radar & Logística | `Nueva Feature` | Modo "Voy en Camino" con ETA Compartido y Alerta Sonora de Puerta | **100%** ✅ |
| **FEAT-019** | 2026-09-02 | Perfil & Audio | `Nueva Feature` | Voice Vibe — Clip de Voz Analógico de 5 Segundos | **100%** ✅ |
| **FEAT-018** | 2026-09-02 | Chat Darkroom | `Nueva Feature` | Pre-Flight Checklist de Compatibilidad Sexual Pre-Encuentro | **100%** ✅ |
| **FEAT-017** | 2026-09-02 | Logística & Hospedaje | `Nueva Feature` | Ficha de Hospedaje Táctica (Host Card con Convivencia e Insumos) | **100%** ✅ |
| **FEAT-016** | 2026-09-02 | Pulsos & Navegación | `Nueva Feature` | Centro de Gestión de Pulsos (`PulsesView`) y Acción Universal de 1-Tap | **100%** ✅ |
| **ENH-002**  | 2026-09-02 | Arquitectura & UI | `Enhancement` | Memoización React, Code-Splitting Dinámico y A11y WCAG AA | **100%** ✅ |
| **FEAT-015** | 2026-09-01 | Perfil & Álbumes | `Nueva Feature` | Gestión y Auto-Asignación de Foto de Portada desde Álbumes | **100%** ✅ |
| **ENH-001**  | 2026-09-01 | Testing & Auth | `Enhancement` | Editor Inline de Perfiles Mock y Presets de Testing en Caliente | **100%** ✅ |
| **FEAT-014** | 2026-09-01 | Perfil & Cuenta | `Nueva Feature` | Edición Directa de Codename con Validación y Feedback Háptico | **100%** ✅ |
| **FEAT-013** | 2026-08-31 | Seguridad & Matriz | `Nueva Feature` | Modo Niebla (Fog Mode // Desenfoque Facial Calibrado 6-7px) | **100%** ✅ |
| **FEAT-012** | 2026-08-30 | Autenticación & DB | `Infra/Seguridad` | Autenticación Real Firebase & Prevención Anti-Sybil (Cuentas Únicas) | **100%** ✅ |
| **FEAT-011** | 2026-08-30 | Chat Darkroom | `Nueva Feature` | Modo de Retención de Chat Configurable (Efímero vs Guardado Local) | **100%** ✅ |
| **FEAT-010** | 2026-08-30 | Chat Darkroom | `Nueva Feature` | Envío Multimedia & Compartición de Álbumes en Darkroom Chat | **100%** ✅ |
| **FEAT-009** | 2026-08-30 | Radar & Geoespacial | `Nueva Feature` | Barrido de Radar Acústico Polar de 360° con Retícula de Proximidad | **100%** ✅ |
| **FEAT-008** | 2026-08-30 | Matriz & Filtros | `Nueva Feature` | Cajón de Filtros Dinámicos de 1-Tap por Rol, Edad y Hospedaje | **100%** ✅ |
| **FEAT-007** | 2026-08-30 | Matriz & Presencia | `Nueva Feature` | Estados Corporales (Body State: Listo, En Sesión, Incógnito, Durmiente) | **100%** ✅ |
| **FEAT-006** | 2026-08-30 | Matriz & Perfil | `Nueva Feature` | Rediseño Minimalista Photo-First de ProfileCard con Medidor de Llenado | **100%** ✅ |
| **FEAT-005** | 2026-08-30 | Perfil & Seguridad | `Nueva Feature` | Dossier de Reputación, Veredictos Comunitarios y Karma de Respeto | **100%** ✅ |
| **FEAT-004** | 2026-08-27 | Perfil & Álbumes | `Infra/Seguridad` | Carga Universal de Fotos/Videos a Cloud Storage con Barra de Progreso | **100%** ✅ |
| **FEAT-003** | 2026-08-23 | Chat & Respeto | `Nueva Feature` | Desconexión Gradual / Soft-Block Architecture (4 Protocolos de Cierre) | **100%** ✅ |
| **FEAT-002** | 2026-08-23 | Chat & Respeto | `Nueva Feature` | Modo Anti-Ghost y Mensajería de Salida Elegante (+5 Karma de Respeto) | **100%** ✅ |
| **FEAT-001** | 2026-08-23 | Diario & Salud | `Nueva Feature` | Diario de Citas (Date Diary) con Calendario Inteligente y Analíticas | **100%** ✅ |
| **BASE-007** | 2026-08-23 | Seguridad & UI | `Seguridad` | Pantalla de Bloqueo Rápido / Stealth Lock Screen con Teclado Numérico | **100%** ✅ |
| **BASE-006** | 2026-08-23 | Perfil & Respeto | `Nueva Feature` | Testimonios con Doble Consentimiento Mutuo (Zero Acoso) | **100%** ✅ |
| **BASE-005** | 2026-08-23 | Seguridad & Auth | `Nueva Feature` | Verificación de Identidad Zero-Knowledge y Avatares con Privacidad Facial | **100%** ✅ |
| **BASE-004** | 2026-08-23 | Perfil & Álbumes | `Nueva Feature` | Gestor de Álbumes Públicos y Bóvedas Privadas con Límite de Acceso | **100%** ✅ |
| **BASE-003** | 2026-08-23 | Geoespacial & Batería| `Core / Fundacional` | Discretización Geográfica Google S2 (~152m) & Motor de Batería de 4 Modos | **100%** ✅ |
| **BASE-002** | 2026-08-23 | Audio & Háptica | `Core / Fundacional` | Motor de Síntesis Sub-Bass Analógico (45-80Hz) Web Audio API | **100%** ✅ |
| **BASE-001** | 2026-08-23 | Arquitectura & Core | `Core / Fundacional` | Núcleo Arquitectónico Brutalista VESSEL, i18n Rioplatense y Contexto Central | **100%** ✅ |

### [ENH-006] · [2026-09-04] Rediseño Ergonómico, Optimización de Taps, Chat Directo 1-Tap & Docking Sticky en "Cerca"
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Vista Principal & Ergonomía Cerca`, `Matriz & Filtros`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño en profundidad de la vista principal "Cerca" (`activeView === "grid"`) orientado a las condiciones reales de uso (cruising nocturno, una sola mano, baja luz, decisión rápida y discreción):
  1. **Acción Directa de Chat en 1 Tap (`ProfileCard.tsx`)**:
     - Cluster táctico en el pie de cada tarjeta combinando botón de **Chat Rápido `[ 💬 ]`** (abre `DarkroomChatModal` directamente) y botón de **Pulso Cinético de Rol `[ ⚡ / 👑 / 🍑 ]`**.
     - Touch targets con hitbox efectiva de 44px (`p-1 -m-1`).
     - Tocar el cuerpo de la tarjeta/foto preserva la apertura de `ProfileDetailModal`. Reducción de taps para iniciar chat de **2 taps a 1 tap**.
  2. **Super-Carrusel de Filtros Rápidos de 1 Tap (`ProfileGrid.tsx`)**:
     - Extracción directa a la pantalla principal de 3 filtros críticos antes atrapados en el drawer:
       - `[ 🛡️ Verificados ]`: Filtro instantáneo de perfiles con verificación facial 3D.
       - `[ 🔥 Deseos Mutuos ]`: Filtro instantáneo de perfiles con coincidencias activas en la Kink Matrix.
       - `[ 🍸 Chill / Sobrio ]`: Filtro de atmósferas libres de sustancias o solo tragos.
     - Reducción de pasos de filtro de **3-4 taps (abrir drawer, scrollear, aplicar) a 1 solo tap**.
  3. **Corrección de Docking Sticky y Viewport Budget (`ProfileGrid.tsx`, `page.tsx`)**:
     - Reemplazo de `sticky top-0 z-20` por `sticky top-[52px] sm:top-[56px] z-20`, eliminando el solapamiento visual donde la barra de filtros se metía debajo de `BrutalistHeader` al hacer scroll.
     - Restricción de `StatusToggle` ("TU SEÑAL") únicamente a las vistas de exploración activa (`grid` y `radar`), recuperando 46px en vistas como Diario, Cuenta y Chats.
  4. **Selector de Ordenamiento Dinámico de 1 Tap (`ProfileGrid.tsx`)**:
     - Micro-segmentador táctico junto al contador de perfiles: `[ 📍 Cerca ]` (distancia S2), `[ ⚡ Activos ]` (Listos YA y disponibles primero) y `[ 🔥 Afinidad ]` (mayor número de deseos mutuos).
  5. **Switch Rápido a Radar Espacial (`ProfileGrid.tsx`)**:
     - Botón de switch directo `[ ⦾ Radar ]` en la barra de búsqueda superior, permitiendo alternar entre grilla y radar polar sin desplazar el pulgar hacia la barra inferior.
- **Componentes & Archivos Clave**:
  - `src/types/vessel.ts`
  - `src/context/VesselContext.tsx`
  - `src/app/page.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/filters/DynamicFilterDrawer.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Chat directo funcional en 1 tap con audio sub-bass y propagación detenida.
  - [x] Carrusel de filtros y ordenamiento reactivo operativo en caliente.
  - [x] Docking sticky sin colisiones con el header principal en scroll.
  - [x] 100% de las 53 características de VESSEL preservadas.

---

### [ENH-005] · [2026-09-04] Optimización Responsive de Header y Rediseño Impeccable de Chat (Cabecera 3 Líneas, Menú Táctico 100% Opaco & Barra Unificada)
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `UX & Navegación Táctica`, `Chat Darkroom`, `Seguridad Personal`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución de colisiones, legibilidad total de datos y opacidad en chat móvil:
  1. **Header Mobile Sin Colisiones (`BrutalistHeader.tsx`)**:
     - Compactación de botones tácticos centrales (`Guardián` y `Fiestas`) a píldoras de solo icono en mobile (`p-1.5 min-w-[32px]`), ocultando las etiquetas de texto en `<sm` (`hidden sm:inline`).
     - Ocultación del texto del nombre de usuario en la cápsula de identidad en mobile (`hidden sm:inline`), manteniendo visible el dot pulsante de estado activo (`bg-emerald-400`), corona de plan y verificación facial.
     - Reducción del ancho total en mobile de ~430px a ~260px, garantizando más de 110px de margen libre en pantallas de 360px a 390px.
  2. **Cabecera de Chat en 3 Líneas Estructuradas (`DarkroomChatModal.tsx`)**:
     - **Línea 1 (Identidad y Edad)**: Renderiza el Alias personalizado en tipografía destacada (`font-black`), el `@codename` y la edad sin truncamiento prematuro.
     - **Línea 2 (Badges y Sellos de Confianza)**: Fila dedicada para el veredicto del Dossier (`[🥂 CHONGAZO]`, `[🔥 BUENA VIBRA]`), el sello de Verificación 3D y el badge de Anti-Ghost (+Karma) en píldoras con contraste nítido.
     - **Línea 3 (Telemetría Táctica)**: Rol sexual, distancia discretizada Google S2 y hospedaje (`🏠 Tengo sitio`) en texto directo de alta legibilidad.
     - Avatar con anillo de estado corporal aumentado a 44px-48px para armonizar visualmente con el bloque de 3 líneas.
  3. **Menú Táctico Desplegable 100% Opaco (`DarkroomChatModal.tsx`)**:
     - Eliminación total de transparencias accidentales: fondo sólido brutalista `#0E0E12` con borde de 2px (`border-2 border-white/20`) y sombra profunda `shadow-[0_20px_60px_rgba(0,0,0,0.98)]`.
     - **Backdrop Scrim Oscuro**: Fondo oscurecedor al 70% (`bg-black/70 backdrop-blur-xs`) que bloquea el ruido visual de los mensajes traseros (`CANAL CIFRADO EFÍMERO`) y permite cerrar el menú con un tap en cualquier parte.
     - **Tarjetas de Acción de Alto Contraste**: Íconos dedicados con fondos semánticos (`bg-bloodNeon/15`, `bg-emerald-500/20`, `bg-purple-500/20`), títulos en blanco brillante y subtítulos descriptivos legibles.
  4. **Barra Táctica Unificada de Chat (Deduplicación 1-Fila)**:
     - Fusión de las 3 barras apiladas previas en una sola barra horizontal de 38px con toggle dinámico entre modo `[ ⚡ RÁPIDAS ]` (cruising) y modo `[ 👻 NO-GHOST (+5) ]` (salidas amables con karma).
- **Componentes & Archivos Clave**:
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/safety/BeaconCountdownWidget.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] 100% de la información visible en 3 líneas jerarquizadas sin solapamientos.
  - [x] Menú táctico 100% opaco con backdrop scrim y cero texto superpuesto.
  - [x] Todas las 53 funcionalidades de VESSEL preservadas.

---

### [ENH-004] · [2026-09-04] Rediseño Impeccable de Ergonomía & Optimización de Taps (Header, StatusToggle, Chat, Radar, Card)
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `UX & Navegación Táctica`, `Seguridad Personal`, `Chat Darkroom`, `Matriz & Radar`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Optimización profunda de rutas de interacción y reducción de taps en las características prioritarias de soberanía física y digital:
  1. **Header Táctico Unificado (`BrutalistHeader.tsx`)**: Acceso directo en 1 tap al Guardián Silencioso (`ShieldCheck` Dead-Man Switch) y acceso rápido a Nightlife (`PartyPopper` Fiestas, Baliza Óptica y Wingman) en la cabecera central sin navegar a submenús.
  2. **Selector de Señal & "Listo YA" en 1 Tap (`StatusToggle.tsx`)**: Chip táctico ámbar integrado `[ ⚡ LISTO YA ]` que activa instantáneamente el modo On-The-Clock de 60 minutos con pulso sonoro a 75 Hz, o muestra el tiempo restante regresivo `[ ⚡ 58m ]` para desactivar en 1 tap.
  3. **Darkroom Chat Táctico (`DarkroomChatModal.tsx`)**: Botón directo de activación del Guardián Silencioso en la cinta superior de acciones del chat para proteger el encuentro físico in situ; y barra horizontal de píldoras de salida elegante Anti-Ghost de 1-tap sobre el formulario de entrada (`🔥 Sos un fuego`, `🚀 Sigo de largo`, `✨ Otra vibra`, `🖤 Cierre con onda`, `⚡ Paso por esta`) sumando +5 puntos de Karma de Respeto sin abrir modales.
  4. **Radar Acústico Polar (`RadarSweep.tsx`)**: Accesos rápidos de 1-tap en la fila 2 de telemetría para activar la Baliza Óptica de pantalla completa (`⚡ Baliza`) y la cartelera nocturna (`🎉 Fiestas`).
  5. **ProfileCard con Glanceability Inmediata (`ProfileCard.tsx`)**: Badge táctico de hospedaje inmediato (`🏠` / `🏠🚿`) renderizado directamente en la Línea 2 del Micro-HUD, informando si el perfil recibe o tiene ducha lista en menos de 100ms sin requerir tap en la cápsula.
- **Componentes & Archivos Clave**:
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/matrix/StatusToggle.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/components/radar/RadarSweep.tsx`
  - `src/components/matrix/ProfileCard.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Touch targets de 44px o equivalentes accesibles preservados.
  - [x] Cero funcionalidades eliminadas; todas las 53 características preservadas.
  - [x] Feedback háptico y acústico sub-bass verificado en cada acción rápida.

---

### [FEAT-084] · [2026-09-03] SPA de Presentación Ejecutiva & Demo Interactivo para Inversores
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Negocio & Inversores`, `Monetización`, `Arquitectura & Core`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Single Page Application (SPA) empaquetada en un único archivo standalone (`index.html`), ultra rápida, responsiva e interactiva, diseñada para presentar y vender la aplicación completa ante equipos de inversión, fondos de capital de riesgo (VCs) y potenciales compradores:
  1. **Perspectiva Dual (Usuario vs Inversor)**: Selector dinámico que conmuta el tono y el análisis entre el valor de producto para el usuario (adición, utilidad real, dolor resuelto) y las métricas financieras para la empresa (unit economics, ARPPU 3.4x vs Grindr, márgenes del 88%, retención y K-factor viral de 0.72).
  2. **Simulador de Smartphone Interactivo**: Bezel táctil de smartphone virtual con 5 pantallas navegables en tiempo real: Matriz 2/3, Radar Polar 360°, Cruces en la Pista (Fiesta Rheo Crobar), Suite Táctica con Kink Matrix y Darkroom Chat con Waypoint en 2 Fases interactivo.
  3. **Catálogo Completo de 52 Features**: Inventario exhaustivo clasificado en 8 categorías tácticas con buscador instantáneo debounced y modal inspector de fichas técnicas para cada característica.
  4. **Battlecard Estratégico vs Grindr/Scruff/Sniffies**: Matriz comparativa de 8 ejes estratégicos demostrando el foso defensivo y el lock-in de la competencia.
  5. **Simulador Financiero & Calculadora de ARR**: Sliders interactivos de MAU (10k a 1M), conversión SaaS, micro-pases nocturnos y venues B2B, con proyección reactiva de MRR, ARR y ARPPU.
  6. **Branding Acústico Sub-Bass en Vivo**: Generador Web Audio API (45-80 Hz) incorporado para feedback auditivo real sin dependencias externas.
  7. **Standalone & Portátil**: 100% autónomo en `presentation/index.html` (abrible por doble clic en cualquier explorador sin servidor) y servible por Next.js en `public/investors/index.html` (`http://localhost:3001/investors/index.html`).
- **Componentes & Archivos Clave**:
  - `presentation/index.html`
  - `public/investors/index.html`
  - `docs/contexto/registro-de-features.md`
  - `docs/contexto/decisiones.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Archivo único auto-contenido con Tailwind CSS v3 via CDN y Web Audio API.
  - [x] Simulador de 5 pantallas probado y verificado visualmente en Chrome DevTools.
  - [x] Calculadora reactiva con 4 sliders dinámicos funcionando con 0 errores.
  - [x] Descarga de Investment Memo JSON operativa desde el Deal Room.

---

### [FEAT-083] · [2026-09-02] Cruces en la Pista // Missed Connections & Registro de Reencuentros
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Nightlife & Encuentros`, `Logística & Encuentros`, `Perfil & Cuenta`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Sistema táctico de preservación de encuentros y contactos presenciales en fiestas, boliches y darkrooms. Resuelve la frustración común de cruzarse con alguien en un local nocturno y no poder ubicarlo posteriormente.
  1. **Registro Presencial de Cruces**: Coincidencia de perfiles que estuvieron en el mismo venue durante la misma ventana horaria (ej: 02:30 - 03:45) o micro-zona (`Pista Central`, `Barra`, `Darkroom`).
  2. **Retención Efímera de 48 Horas**: Ventana de oportunidad de 48h con cuenta regresiva en tiempo real y auto-poda (`expiresAt`) para evitar persistencia innecesaria y proteger la privacidad.
  3. **Pulsos de Reencuentro con Nota Opcional**: Envío de pulso táctico (`👁️ Te vi en la pista`) con posibilidad de adjuntar un breve mensaje contextual (ej: *"Estábamos al lado de la cabina del DJ con campera de cuero"*).
  4. **Apertura Directa de Canal**: Botón directo de apertura de chat y visualización de compatibilidad sin necesidad de salir del modal.
- **Componentes & Archivos Clave**:
  - `src/components/nightlife/MissedConnectionsModal.tsx`
  - `src/context/VesselContext.tsx`
  - `src/types/vessel.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Pruebas visuales con DevTools: renderizado de tarjetas `aspect-[2/3]`, cálculo de tiempo restante y envío interactivo de pulsos con nota.
  - [x] Auto-poda de cruces expirados implementada en ciclo de hidratación.

---

### [FEAT-082] · [2026-09-02] VESSEL Nightlife & Eventos Locales (Cartelera, Baliza Óptica, Modo Wingman & After-Hours)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Nightlife & Seguridad`, `Radar & Geoespacial`, `Monetización`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Suite integral nocturna orientada a eventos, fiestas, boliches y darkrooms de la comunidad gay porteña:
  1. **Cartelera Táctica & RSVP ("Voy esta noche")**: Visualización de eventos (Crobar, Amerika, Under Club, Work, Feliza, Studio Crobar, Km Zero, Black Room), flyers, género sonoro, cover price estimado y lista de confirmados para pre-matching.
  2. **Radar de Pista por Micro-Zonas**: Conmutador de sectores del club (`Pista Central`, `Barra Principal`, `Patio / Fumadero`, `Darkroom / Cruising`, `Zona de Baños`) para identificar quién está en cada área.
  3. **Baliza Óptica de Pantalla Completa**: Estroboscópico de alta visibilidad para ubicarse físicamente en la pista oscura con 3 frecuencias (Ámbar 2.5Hz, Neón 5Hz, Carmesí Darkroom).
  4. **Modo Wingman ("Salgo con Amigo")**: Enlace efímero vía PIN de 4 dígitos entre amigos para coordinar salidas, con sincronización de estados (`partying_together`, `separated_safely`, `on_hookup`, `needs_help`).
  5. **Alerta de Vaso Seguro & Auxilio**: Protocolo silencioso ante sospecha de adulteración de bebida con acceso rápido a SAME (107) y 911.
  6. **Despacho de After-Hours & Pase de Fiesta ($1.99 USD x 12h)**: Micro-monetización nocturna y coordinación de hospedaje o búsqueda de afters.
- **Componentes & Archivos Clave**:
  - `src/components/nightlife/NightlifeEventsModal.tsx`
  - `src/components/nightlife/EventDetailModal.tsx`
  - `src/components/nightlife/ClubFloorRadarModal.tsx`
  - `src/components/nightlife/OpticalBeaconModal.tsx`
  - `src/components/nightlife/WingmanModal.tsx`
  - `src/components/nightlife/SpikedDrinkAlertModal.tsx`
  - `src/components/nightlife/AfterHoursModal.tsx`
  - `src/components/subscription/UnlimitedPaywallModal.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Vinculación interactiva y prueba en vivo del PIN de Wingman y destellos de Baliza Óptica.
  - [x] Activación del Pase de Fiesta en paywall reactivo.

---

### [FEAT-081] · [2026-09-02] Matriz Táctica de Atmósfera & Sustancias (Harm Reduction & Filtros Dinámicos)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Salud`, `Matriz & Filtros`, `Seguridad Personal`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Declaración voluntaria, respetuosa y compatible con App Store del gusto y ambiente respecto a tragos alcohólicos, cannabis y sustancias de sesión:
  1. **Taxonomía Táctica de 4 Niveles**:
     - `sober`: Sobrio // Cero Sustancias (Espacio 100% sobrio).
     - `social_drinks`: Tragos & Previa (Vino, cócteles o cerveza).
     - `green_420`: 420 Friendly (Cannabis medicinal o recreativo).
     - `party_play`: Party & Play // Sesión (Chemsex consciente con reducción de daños).
  2. **Selector Táctico con Feedback Sonoro**: Integrado en `ProtocolView.tsx` con micro-audio analógico y enlace directo al protocolo de reducción de daños.
  3. **Insignia en Perfil Detallado**: `SubstanceAtmosphereBadge` renderizada en `ProfileDetailModal.tsx` con banner visual y descripción contextual.
  4. **Filtro Rápido en DynamicFilterDrawer**: Selector de 1-tap en el cajón de filtros con filtrado reactivo instantáneo en `VesselContext.tsx` (`filteredProfiles`).
- **Componentes & Archivos Clave**:
  - `src/components/profile/SubstanceAtmosphereSelector.tsx`
  - `src/components/profile/SubstanceAtmosphereBadge.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/filters/DynamicFilterDrawer.tsx`
  - `src/context/VesselContext.tsx`
  - `src/types/vessel.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Tipado estricto con unión discriminada `SubstanceAtmosphere`.
  - [x] Verificación visual de filtrado dinámico en Chrome DevTools MCP.
  - [x] Sincronización bidireccional local-first y cloud matrix.

---

### [FEAT-080] · [2026-09-02] Rediseño Impeccable de ProfileCard (Aspect Ratio 2/3 Áureo & Glanceability Táctica)
- **Tipo**: `Enhancement (Mejora/Refactor)`
- **Módulo / Eje**: `Matriz & UX`, `Perfil & Cuenta`, `Estilos & UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Optimización visual y táctica de las tarjetas de perfil en la grilla principal (`ProfileCard.tsx`) aplicando los principios del sistema de diseño Impeccable UI:
  1. **Aspect Ratio 2/3 Áureo**: Proporción fotográfica vertical de máxima inmersión con `object-cover` full bleed.
  2. **Scrim Degradé Retraído (`h-1/2` / 50%)**: Eliminación del oscurecimiento excesivo previo, dejando el 70%+ superior de la foto perfectamente limpio y despejado.
  3. **Micro-HUD de 2 Líneas Flotante**:
     - *Línea 1*: Codename en negrita monospace + edad + insignia de verificación biométrica + cápsula anti-ghost + chip de host inmediato + indicador de bóveda privada.
     - *Línea 2*: Rol sexual con acento semántico + distancia aproximada discretizada (~152m) + estado de batería/disponibilidad.
  4. **Glanceability Táctica**: Lectura en menos de 200ms del tipo de cuerpo, expresión y compatibilidad sin tapar la identidad visual del usuario.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Pruebas visuales en viewport móvil y desktop.
  - [x] 0 errores de TypeScript (`npm run typecheck`).
  - [x] Transiciones hover y focus-visible accesibles (WCAG AA).

---

### [ENH-003] · [2026-09-02] Blindaje Anti-Captura Mac/Web & Marca de Agua Esteganográfica Universal
- **Tipo**: `Infra/Seguridad` & `Enhancement`
- **Módulo / Eje**: `Seguridad & DRM`, `Perfil & Cuenta`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resolución integral de las limitaciones de captura de pantalla en navegadores web y sistemas operativos (específicamente en macOS donde `Cmd+Shift+4/3` es interceptado por WindowServer antes de emitir la tecla `'4'` al navegador):
  1. **Pre-emptive Modifier Key Interception (`DrmBlackoutProtector.tsx`)**: Interceptación en 0ms de teclas modificadoras (`Meta`, `Shift`, `Ctrl`, `Alt`, `PrintScreen`) en fase de captura del DOM. El blackout a negro puro (`bg-black z-50`) ocurre en cuanto los dedos tocan Command/Shift, haciendo que la captura del SO capture únicamente un fotograma negro.
  2. **Modo "Hold to Reveal" (Mantener Presionado para Ver)**: Patrón de alta seguridad militar donde el medio privado solo se desencripta y renderiza mientras se mantiene presionado el puntero/dedo. Cualquier intento de presionar atajos o soltar la pantalla oculta el contenido al instante.
  3. **Privacidad de Miniaturas en Bóveda**: Las fotos desbloqueadas en la grilla retienen desenfoque protector permanente (`blur-[6px]`), exigiendo entrar al visor táctil seguro.
  4. **Marca de Agua Esteganográfica Universal (`SteganographicWatermark.tsx`)**: Cobertura del 100% de la superficie a -25° con 18 líneas densas, contraste claroscuro con sombra proyectada legible sobre cualquier fondo/piel, con ID de observador, propietario y timestamp UTC. Desplegado en `ProfileDetailModal` (todas las fotos de perfil ajeno), `AlbumDetailModal` y `ChatMediaViewerModal`.
- **Componentes & Archivos Clave**:
  - `src/components/security/DrmBlackoutProtector.tsx`
  - `src/components/security/SteganographicWatermark.tsx`
  - `src/components/profile/PrivateVault.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/components/account/AlbumDetailModal.tsx`
  - `src/components/chat/ChatMediaViewerModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] TypeScript estricto validado (`npm run typecheck` 0 errores).
  - [x] Interceptación en macOS `Cmd+Shift` comprobada.
  - [x] Sincronización en memoria Engram (ID 1452) y ADR-056 documentado.

---

### [FEAT-039] · [2026-09-03] Rediseño Impeccable UI/UX: Header Unificado, Vista Cerca & BrutalistNav
- **Tipo**: `Mejora / Rediseño UI/UX`
- **Módulo / Eje**: `Header`, `Matriz Cerca`, `Navegación Footer`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Rediseño integral de ergonomía, orden natural, microinteracciones y accesibilidad táctica en los tres componentes principales de la experiencia de usuario:
  1. `BrutalistHeader`: Agrupación de 6 botones dispersos en 3 zonas claras: Izquierda (Marca + estado LIVE), Centro (Alertas tácticas dinámicas: PIN, Baliza, On-the-clock), Derecha (Cápsula de Identidad Unificada: Plan + Verificación + Estado de Sesión en una sola píldora; y utilidades tácticas compactas de Audio Sub-Bass y Modo Sigilo con hitboxes de 44px).
  2. `StatusToggle`: Reducción de altura vertical a 38px, etiqueta contextual "TU SEÑAL" para no confundir con filtros de búsqueda, y accesibilidad con `role="radiogroup"` y `role="radio"`.
  3. `ProfileGrid`: Reordenamiento de chips de filtro en orden natural de acción (`✨ Todos`, `⚡ Listos YA`, `🟡 Disponibles`, `🏠 Con Sitio`, `🎉 Fiestas & Boliches`, `👻 Anti-Ghost`, `🔥 Intensidad 3-4`, `👑 Activos`, `🔄 Versátiles`, `🍑 Pasivos`). Grilla adaptativa (2 cols <380px, 3 cols en mobile 380px+, 4-5 cols en desktop) con botón de reseteo completo unificado.
  4. `ProfileCard`: Eliminación de solapamientos entre badges y el botón de reacción mediante micro-HUD con límite de 2-3 indicadores prioritarios y badge colapsado `+N` con tap-to-inspect y auto-cierre de 8s; botón de reacción rápida aislado con touch target de 44px (`p-1 -m-1`, `e.stopPropagation()`).
  5. `BrutalistNav`: Micro-píldora resplandeciente en ámbar neón, halo sutil, tipografía JetBrains Mono, posicionamiento exacto de badges de notificación y padding seguro de navegación inferior (`env(safe-area-inset-bottom)`).
- **Componentes & Archivos Clave**:
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/matrix/StatusToggle.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/navigation/BrutalistNav.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cero colisiones de texto o badges en pantallas pequeñas (320px - 390px).
  - [x] Touch targets de 44px en botones táctiles críticos.
  - [x] Accesibilidad WCAG 2.2 con ARIA roles semánticos y foco visible.
  - [x] TypeScript estricto con 0 errores en `npm run typecheck`.
  - [x] Verificación visual en DevTools MCP tanto en mobile (390x844) como en desktop (1280x800).

---

### [FEAT-038] · [2026-09-02] Kink Matrix Ciega con 35 Fetiches Eróticos de la Comunidad Gay
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Kinks`, `Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Expansión integral del catálogo maestro de fetiches en `energyCatalog.ts` de 21 a 35 ítems de alta relevancia erótica y cultural gay: axilas/pits, olores corporales/musk, suspensores/jockstraps, tangas/lencería masculina, ropa sudada/medias de gym, látex/rubber, fisting, waterplay, daddy/boy, bears, body worship, castidad/jaula, verbal humiliation y bull/cuckold. Sistema de coincidencia ciega donde solo se revela la afinidad si ambos coinciden en "Me encanta" o "Curioso".
- **Componentes & Archivos Clave**:
  - `src/data/energyCatalog.ts`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] 35 fetiches con categorías `bodily`, `gear`, `bdsm`, `sensual`, `dynamics`, `roleplay`, `safety`.
  - [x] Insignia `🔥 Sintonía Secreta` en perfiles coincidentes.
  - [x] Persistencia en Engram (ID 1451) y ADR-055.

---

### [FEAT-037] · [2026-09-02] Alerta Médica Anónima Comunitaria de Exposición a ITS
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Diario & Salud`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Modal de notificación clínica preventiva anónima (`ItsExposureModal.tsx`) para reportar diagnósticos de ITS (sífilis, gonorrea, clamidia, MPOX, hepatitis) con ventana configurable de 7, 14 o 30 días. Los contactos recientes en el Date Diary reciben una tarjeta de advertencia médica en el chat sin revelar el nombre, perfil ni fecha exacta del remitente.
- **Componentes & Archivos Clave**:
  - `src/components/diary/ItsExposureModal.tsx`
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Protocolo Zero-Knowledge validado.
  - [x] Tarjeta de alerta preventiva en Darkroom Chat.
  - [x] DoD verificado en `npm run typecheck`.

---

### [FEAT-036] · [2026-09-02] Asistente de Reducción de Daños & Chem-Chill (Harm Reduction)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Salud & Seguridad`, `Header`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Herramienta libre de estigmas para sesiones de fiesta y chem-chill (`HarmReductionModal.tsx`): temporizador reactivo de hidratación cada 45 minutos con alertas sensoriales a 45 Hz, registro confidencial local de sustancias y dosis con marcas temporales para evitar redosificaciones accidentales, y protocolo de emergencia con marcación al 107/911 y guía de Posición Lateral de Seguridad (PLS).
- **Componentes & Archivos Clave**:
  - `src/components/safety/HarmReductionModal.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Almacenamiento local-first estricto (cero telemetría de sustancias a servidores).
  - [x] Alertas acústicas sub-bass integradas.

---

### [FEAT-035] · [2026-09-02] Pase de Fin de Semana 48h ($2.99 USD Micro-Pago)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Monetización`, `Suscripción`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Modalidad de pago único de $2.99 USD para 48 horas de superpoderes completos de VESSEL UNLIMITED (viernes a domingo) sin suscripción recurrente mensual ni necesidad de cancelar tarjeta.
- **Componentes & Archivos Clave**:
  - `src/components/subscription/UnlimitedPaywallModal.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Temporizador regresivo de 48 horas reactivo.
  - [x] Estado `weekend_pass` integrado en `userSubscription`.

---

### [FEAT-034] · [2026-09-02] Clima Sonoro & Soundtrack de Hospedaje Analógico
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Audio & Logística`, `Perfil & Cuenta`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Generadores de ondas acústicas en tiempo real en `SubBassAudioEngine.ts` con 5 frecuencias seleccionables por el anfitrión en su Host Card: Sub-Bass 50Hz, Dark Techno 128 BPM, Berlin Industrial, Sensual Downtempo 85 BPM y Ambient Chill, con preescucha interactiva en vivo.
- **Componentes & Archivos Clave**:
  - `src/lib/audio/SubBassAudioEngine.ts`
  - `src/components/logistics/HostCardModal.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Síntesis Web Audio pura sin consumo de ancho de banda.
  - [x] Conmutación acústica inmediata y silenciador automático al cerrar.

---

### [FEAT-033] · [2026-09-02] Waypoint Seguro en 2 Fases (Protocolo Anti-Emboscada)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat & Logística`, `Seguridad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Protocolo de liberación gradual de ubicación en Darkroom Chat: la Fase 1 revela únicamente la esquina pública de aproximación; la Fase 2 (piso, dpto, timbre y notas privadas de acceso) permanece cifrada hasta que el visitante pulsa *"Ya estoy en la esquina"*.
- **Componentes & Archivos Clave**:
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Transición de estados de Waypoint: `phase_1_shared` ➔ `phase_2_unlocked`.
  - [x] Feedback acústico háptico en cada fase.

---

### [FEAT-032] · [2026-09-02] Radar "On-The-Clock" (Modo Listo YA)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Matriz & Radar`, `Header`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Estado efímero de alta urgencia carnal con temporizador de 15 a 120 minutos. Proyecta un badge pulsante ámbar `⚡ LISTO YA` en la grilla y el radar, contador regresivo en el header y chip de filtro rápido en la matriz.
- **Componentes & Archivos Clave**:
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/ProfileGrid.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Vencimiento automático y limpieza reactiva del estado.
  - [x] Filtro de matriz de 1 toque operativo.

---

### [FEAT-031] · [2026-09-02] Hotspots Tácticos Urbanos & Check-in Cruising
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Radar & Cruising`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Mapeo en tiempo real sobre el radar polar de saunas, darkrooms, clubes y zonas de cruising emblemáticas (Buenos Aires: Niceto Darkroom, Sauna Le Dôme, Bunker San Telmo, Bosques de Palermo, UnderBar Feliza) con conteo de Vessels activos en la zona y check-in anónimo.
- **Componentes & Archivos Clave**:
  - `src/components/radar/TacticalHotspotsOverlay.tsx`
  - `src/data/mockHotspots.ts`
  - `src/components/radar/RadarSweep.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Coordenadas polar-discretizadas sin triangulación.
  - [x] Check-in efímero con temporizador de auto-salida.

---

### [FEAT-030] · [2026-09-02] Travel Mode (Teleportación Virtual de Radar)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Radar & Viajes`, `Monetización`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Permite a los usuarios teleportar su posición de radar a hubs globales estratégicos (Buenos Aires, Berlín, Madrid, São Paulo, Nueva York, Londres) hasta 48 horas antes de viajar para coordinar encuentros con antelación.
- **Componentes & Archivos Clave**:
  - `src/components/radar/TravelModeModal.tsx`
  - `src/context/VesselContext.tsx`
  - `src/components/radar/RadarSweep.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Insignia `✈️ TRAVEL` visible en perfil del viajero.
  - [x] Bloqueado para plan Free, desbloqueado en VESSEL UNLIMITED.

---

### [FEAT-029] · [2026-09-02] Auditoría de Bóvedas Privadas en Vivo y Revocación Instantánea
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Álbumes`, `Seguridad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Registro cronológico en tiempo real de qué usuarios abrieron tus fotos íntimas, a qué hora exacta y cuántos segundos permanecieron en pantalla, junto con un botón táctico para revocar la llave de acceso de inmediato.
- **Componentes & Archivos Clave**:
  - `src/components/profile/VaultAuditModal.tsx`
  - `src/components/account/ProtocolView.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Revocación instantánea de `unlockedVaults` en tiempo de ejecución.
  - [x] Log inalterable de auditoría visual.

---

### [FEAT-028] · [2026-09-02] Membresía Oficial VESSEL UNLIMITED (Paywall de 6 Superpoderes)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Monetización`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Pantalla de suscripción brutalista con propuesta de valor transparente: Travel Mode, Multi-Bóvedas Ilimitadas, Auditoría de Bóvedas, Modo Stealth Pro, Filtros Quirúrgicos de Logística y Boost Dorado en Radar.
- **Componentes & Archivos Clave**:
  - `src/components/subscription/UnlimitedPaywallModal.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cuotas dinámicas ampliadas al activar suscripción.
  - [x] Persistencia de estado `unlimited`.

---

### [FEAT-027] · [2026-09-02] Salas de Sesión Privadas & Modo Dúo de Pareja
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Encuentros & Chat`, `Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Salas de coordinación para tríos y dinámicas grupales con aforo estricto y seguro; y vinculación de perfiles para parejas en Modo Dúo con badge compartido `👥 DÚO` en grilla y radar.
- **Componentes & Archivos Clave**:
  - `src/components/cruising/SessionRoomModal.tsx`
  - `src/components/cruising/DuoLinkModal.tsx`
  - `src/components/matrix/ProfileCard.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Renderizado de badge unificado en tarjetas de matriz.
  - [x] Control de aforo en tiempo real.

---

### [FEAT-026] · [2026-09-02] Botiquín Clínico Doxy-PEP
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Diario & Salud`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Tarjeta de seguimiento clínico post-exposición integrada en el Date Diary para el protocolo profiláctico bacteriano de 72 horas (prevención de sífilis, clamidia y gonorrea), con registro de toma inicial y dosis de refuerzo.
- **Componentes & Archivos Clave**:
  - `src/components/diary/DoxyPepTrackerCard.tsx`
  - `src/components/diary/DateDiaryView.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cálculo de horas transcurridas desde el encuentro.
  - [x] Alerta visual ante proximidad de fin de ventana crítica.

---

### [FEAT-025] · [2026-09-02] Protocolo de Salida Post-Encuentro (Exit Protocol)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Logística`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Elimina momentos incómodos comunicando claramente la expectativa posterior al sexo: *Fast Encounter* ⏱️ (puntual, sin sobremesa), *Chill & Cuddle* 🫂 (ducha y 30m de charla) o *Sleepover* 🌙 (quedarse a dormir si hay onda).
- **Componentes & Archivos Clave**:
  - `src/components/profile/ExitProtocolSelector.tsx`
  - `src/components/profile/ExitProtocolBadge.tsx`
  - `src/components/account/ProtocolView.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Badge visible en perfil y selector en Mi Perfil.

---

### [FEAT-024] · [2026-09-02] Verificación Biométrica Liveness 3D Facial
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad & Auth`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Escaneo tridimensional mediante malla vectorial y detección de gestos en vivo (parpadeo y giro lateral) para certificar que el usuario es humano y dueño de sus fotos, emitiendo un certificado Zero-Knowledge.
- **Componentes & Archivos Clave**:
  - `src/components/auth/LivenessVerificationModal.tsx`
  - `src/components/auth/VerificationBadge.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Insignia `ID VERIFIED // HUMANO REAL 3D` activada.

---

### [FEAT-023] · [2026-09-02] Bloc de Notas Brutalista Camaleón con Flip-to-Cover
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad & Discreción`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Pantalla señuelo monocromática (`SCRATCHPAD.TXT // MONO-KERNEL`) que simula un editor de texto o calculadora funcional con notas reales editables. Se activa instantáneamente al presionar `Escape` o al poner el teléfono boca abajo (Flip-to-Cover vía giroscopio).
- **Componentes & Archivos Clave**:
  - `src/components/safety/CalculatorCoverScreen.tsx`
  - `src/components/safety/AppDisguiseModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Desbloqueo secreto por triple toque o comando `:exit`.

---

### [FEAT-022] · [2026-09-02] PIN de Coacción Silencioso y Alerta Antirrobo
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad & Discreción`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Permite definir un PIN secundario de coacción (ej. `9999`). Si un agresor obliga al usuario a abrir la app, este PIN aparenta apagar el sistema, salta al señuelo y despacha una alerta silenciosa de auxilio sin levantar sospechas.
- **Componentes & Archivos Clave**:
  - `src/components/safety/DuressPinSettingsModal.tsx`
  - `src/components/safety/SafetyBeaconModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Diferenciación estricta entre PIN maestro y PIN bajo amenaza.

---

### [FEAT-021] · [2026-09-02] Guardián Silencioso & Dead-Man Switch Local-First
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad Personal`, `Header`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Temporizador regresivo de seguridad personal para encuentros físicos (45, 90, 120 min) con widget persistente en la cabecera. Si el usuario no ingresa su PIN antes de la expiración, detona una alarma auditiva a 45 Hz y notifica al contacto de auxilio designado. Datos estrictamente almacenados en el dispositivo local.
- **Componentes & Archivos Clave**:
  - `src/components/safety/SafetyBeaconModal.tsx`
  - `src/components/safety/BeaconCountdownWidget.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Arquitectura local-first (cero rastreo en servidores).
  - [x] Alerta titilante en los últimos 10 minutos.

---

### [FEAT-020] · [2026-09-02] Modo "Voy en Camino" con ETA Compartido
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Radar & Logística`, `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Permite compartir una estimación de llegada en tiempo real (5, 10, 15, 30m) en el chat sin dar el número de teléfono ni salir a WhatsApp. Banner persistente HUD y timbre acústico analógico a 90 Hz al estar a menos de 50 metros.
- **Componentes & Archivos Clave**:
  - `src/components/radar/EnRouteTrackerModal.tsx`
  - `src/components/radar/EnRouteBanner.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Conexión reactiva con el chat del anfitrión.

---

### [FEAT-019] · [2026-09-02] Voice Vibe — Clip de Voz Analógico de 5s
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Audio`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Grabador y reproductor de audio analógico de 5 segundos para verificar la voz y presencia real antes del encuentro, previniendo perfiles falsos. Modulación de forma de onda y pulso sub-bass a 65 Hz.
- **Componentes & Archivos Clave**:
  - `src/components/profile/VoiceVibeRecorderModal.tsx`
  - `src/components/profile/VoiceVibePlayer.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Límite estricto de 5 segundos.

---

### [FEAT-018] · [2026-09-02] Pre-Flight Checklist de Compatibilidad Sexual
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat Darkroom`, `Encuentros`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Formulario de acuerdos previos en 4 categorías: Ritmo (Rápido & Carnal, Pausado, Dominación), Prácticas (Oral, Penetración, Masaje, Fetiche), Barreras/Salud (Bareback PrEP, Condón) y Sustancias (Sobrio, Trago, 420). Genera una tarjeta de coincidencia en el chat con sello *"Sintonía Fuego 🔥"*.
- **Componentes & Archivos Clave**:
  - `src/components/chat/PreFlightChecklistModal.tsx`
  - `src/components/chat/PreFlightCard.tsx`
  - `src/components/chat/DarkroomChatModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Acuerdos consensuales explícitos antes de salir de casa.

---

### [FEAT-017] · [2026-09-02] Ficha de Hospedaje Táctica (Host Card)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Logística & Hospedaje`, `Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Resuelve de antemano el "¿quién recibe?": tipo de convivencia (solo, roommates, hotel), comodidades (ducha lista, toallas, aire acondicionado) e insumos (condones, lubricante, poppers). Badge compacto `🏠 RECIBE` en tarjetas y filtro reactivo en matriz.
- **Componentes & Archivos Clave**:
  - `src/components/logistics/HostCardModal.tsx`
  - `src/components/logistics/HostCardBadge.tsx`
  - `src/components/matrix/ProfileCard.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Filtrable en 1 tap en `DynamicFilterDrawer`.

---

### [FEAT-016] · [2026-09-02] Centro de Pulsos y Acción Universal de 1-Tap (`PulsesView`)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Pulsos & Navegación`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Estandarización universal de la interacción rápida bajo el término "Mandar Pulso" con sonido sub-bass a 75 Hz e iconografía por rol. Nueva vista en la barra inferior (`PulsesView.tsx`) con bandejas separadas de "Recibidos" y "Enviados", cálculo de tiempo relativo y botón de devolución en 1 toque.
- **Componentes & Archivos Clave**:
  - `src/components/pulses/PulsesView.tsx`
  - `src/data/roleActionCatalog.ts`
  - `src/components/navigation/BrutalistNav.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Badge numérico de pulsos pendientes en la barra inferior.
  - [x] ADR-052 documentado.

---

### [ENH-002] · [2026-09-02] Memoización React, Code-Splitting Dinámico y A11y WCAG AA
- **Tipo**: `Enhancement`
- **Módulo / Eje**: `Arquitectura & UI`, `Rendimiento`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Memoización integral del objeto `contextValue` en `VesselContext.tsx` con `useMemo`, eliminando re-renderizados innecesarios. Migración de modales y vistas a `next/dynamic` (`ssr: false`), sincronización reactiva de `html lang` y adecuación a WCAG AA (roles semánticos `aria-modal` y zoom táctil habilitado).
- **Componentes & Archivos Clave**:
  - `src/context/VesselContext.tsx`
  - `src/app/page.tsx`
  - `src/app/layout.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cero errores TS tras refactorizar `contextValue`.
  - [x] ADR-053 documentado.

---

### [FEAT-015] · [2026-09-01] Gestión y Auto-Asignación de Foto de Portada desde Álbumes
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Álbumes`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Regla de negocio de auto-asignación: si el usuario tiene exactamente 1 foto en sus álbumes, se convierte automáticamente en portada de perfil. Si cuenta con más, se habilita selector manual en álbumes y un modal rápido de cambio de portada (`CoverPhotoSelectorModal`).
- **Componentes & Archivos Clave**:
  - `src/components/account/CoverPhotoSelectorModal.tsx`
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/account/AlbumDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Auto-asignación probada al subir o borrar imágenes.
  - [x] ADR-051 documentado.

---

### [ENH-001] · [2026-09-01] Editor Inline de Perfiles Mock y Presets de Auth
- **Tipo**: `Enhancement (Testing)`
- **Módulo / Eje**: `Testing & Auth`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Capacidad de editar dinámicamente en caliente los perfiles simulados (Alex, Marcus, Liam) desde la interfaz sin tocar código duro, permitiendo probar estados corporales, roles y fotos de perfil de inmediato.
- **Componentes & Archivos Clave**:
  - `src/components/profile/EditMockProfileModal.tsx`
  - `src/components/auth/AuthModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Persistencia en `localStorage` bajo `CUSTOM_PROFILES`.
  - [x] ADR-050 documentado.

---

### [FEAT-014] · [2026-09-01] Edición Directa de Codename con Validación y Feedback Háptico
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Cuenta`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Actualización reactiva del nombre de usuario táctico (Codename) en tiempo real con validación al vuelo, sanitización de caracteres y pulso sonoro de confirmación.
- **Componentes & Archivos Clave**:
  - `src/components/account/ProtocolView.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-049 documentado.

---

### [FEAT-013] · [2026-08-31] Modo Niebla (Fog Mode // Desenfoque Facial Calibrado 6-7px)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad & Matriz`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Desenfoque facial suave y calibrado (`6-7px` en tarjetas y perfil; `3-4px` en radar y chat) que atenúa los rasgos identificatorios directos resguardando la discreción pero conservando la silueta, contextura, sonrisa y atmósfera corporal.
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/radar/RadarSweep.tsx`
  - `src/components/profile/ProfileDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Insignia `🌫️ Niebla` visible y conmutador reactivo.

---

### [FEAT-012] · [2026-08-30] Autenticación Real Firebase & Prevención Anti-Sybil
- **Tipo**: `Infra/Seguridad`
- **Módulo / Eje**: `Autenticación & DB`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Integración de Firebase Auth con soporte de proveedores (Google OAuth y correo electrónico) y servicio de deduplicación de identidad para prevenir granjas de bots y perfiles duplicados malévolos.
- **Componentes & Archivos Clave**:
  - `src/lib/firebase/authService.ts`
  - `src/lib/firebase/identityDeduplicationService.ts`
  - `src/components/auth/AuthModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Manejo elegante de sesión persistente.
  - [x] ADR-035 documentado.

---

### [FEAT-011] · [2026-08-30] Retención de Chat Configurable (Efímero vs Guardado Local)
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat Darkroom`, `Seguridad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Selector táctico en la barra de chat para alternar entre el modo efímero (autodestrucción completa de los mensajes al cerrar la ventana) y el modo de guardado local cifrado.
- **Componentes & Archivos Clave**:
  - `src/components/chat/DarkroomChatModal.tsx`
  - `src/lib/storage/localStorageSync.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-041 documentado.

---

### [FEAT-010] · [2026-08-30] Envío Multimedia & Compartición de Álbumes en Darkroom Chat
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat Darkroom`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Modal interactivo para enviar fotos y videos individuales, fotos de vista única (autodestrucción en 15s) o compartir llaves temporales de álbumes completos sin salir de la conversación.
- **Componentes & Archivos Clave**:
  - `src/components/chat/SendMediaModal.tsx`
  - `src/components/chat/ChatMediaViewerModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-040 y ADR-042 documentados.

---

### [FEAT-009] · [2026-08-30] Barrido de Radar Acústico Polar de 360°
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Radar & Geoespacial`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Sonar acústico analógico con retícula polar de 360°, anillos de distancia discretizada concéntricos y barrido continuo de pulsos de radiofrecuencia con audio sub-bass sincronizado.
- **Componentes & Archivos Clave**:
  - `src/components/radar/RadarSweep.tsx`
  - `src/lib/geo/GeospatialEngine.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-037 documentado.

---

### [FEAT-008] · [2026-08-30] Cajón de Filtros Dinámicos de 1-Tap
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Matriz & Filtros`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Panel deslizable lateral con filtros de alta densidad para filtrar la grilla instantáneamente por rol erótico, rango etario, hospedaje activo, disponibilidad inmediata y distancia máxima.
- **Componentes & Archivos Clave**:
  - `src/components/filters/DynamicFilterDrawer.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Filtrado reactivo sin recomputaciones pesadas.

---

### [FEAT-007] · [2026-08-30] Estados Corporales / Body State Reactivos
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Matriz & Presencia`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Selector táctico de 4 modos de presencia corporal: *Ready / Listo* (disponible y visible en radar), *In Session / En Sesión* (ocupado), *Incognito / De incógnito* (solo lectura en sigilo) y *Dormant / Durmiente* (desconectado).
- **Componentes & Archivos Clave**:
  - `src/components/matrix/StatusToggle.tsx`
  - `src/context/VesselContext.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-033 documentado.

---

### [FEAT-006] · [2026-08-30] Rediseño Minimalista Photo-First de ProfileCard con FillMeter
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Matriz & Perfil`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Tarjeta de perfil estilizada con tipografía brutalista, supresión de elementos visuales superfluos, badges de estado claros e indicador circular de afinidad química (`FillMeter.tsx`).
- **Componentes & Archivos Clave**:
  - `src/components/matrix/ProfileCard.tsx`
  - `src/components/matrix/FillMeter.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-030 y ADR-031 documentados.

---

### [FEAT-005] · [2026-08-30] Dossier de Reputación, Veredictos Comunitarios y Karma de Respeto
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Seguridad`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Ficha de evaluación ética del perfil basada en puntualidad, cumplimiento de Safe-Words y trato digno. Emite veredictos comunitarios transparentes (*Alta Confiabilidad, Impecable, Precaución*) protegiendo a la comunidad contra agresores.
- **Componentes & Archivos Clave**:
  - `src/components/profile/ProfileDossierSection.tsx`
  - `src/data/dossierCatalog.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-009 y ADR-044 documentados.

---

### [FEAT-004] · [2026-08-27] Carga Universal de Fotos/Videos a Cloud Storage con Barra de Progreso
- **Tipo**: `Infra/Seguridad`
- **Módulo / Eje**: `Perfil & Álbumes`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Subida asíncrona de contenido multimedia a Firebase Cloud Storage con generación de miniaturas difuminadas instantáneas y feedback de progreso de carga porcentual en la UI.
- **Componentes & Archivos Clave**:
  - `src/lib/firebase/storageService.ts`
  - `src/components/account/AlbumDetailModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] ADR-022 y ADR-023 documentados.

---

### [FEAT-003] · [2026-08-23] Desconexión Gradual / Soft-Block Architecture
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat & Respeto`, `Perfil & Cuenta`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Cuatro protocolos de cierre de límites claros sin confrontación hostil: *Pausa Temporal* (enfriamiento silenciado), *Cierre Amable* (salida respetuosa en solo lectura con +5 karma), *Desvanecimiento Silencioso* (buzón silenciado sin acoso) y *Límite Estricto* (bloqueo total).
- **Componentes & Archivos Clave**:
  - `src/components/chat/BoundaryManagerModal.tsx`
  - `src/data/energyCatalog.ts`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Regla de Negocio #4 cumplida.
  - [x] ADR-013 documentado.

---

### [FEAT-002] · [2026-08-23] Modo Anti-Ghost y Mensajería de Salida Elegante
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Chat & Respeto`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Mecanismo para desincentivar el ghosting crónico: biblioteca de respuestas rápidas respetuosas y sexies en 1 tap para cerrar charlas con honestidad, recompensando al emisor con +5 puntos de Karma de Respeto e insignia de honor.
- **Componentes & Archivos Clave**:
  - `src/components/auth/AntiGhostBadge.tsx`
  - `src/data/energyCatalog.ts`
  - `src/components/chat/DarkroomChatModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Regla de Negocio #3 cumplida.
  - [x] ADR-012 documentado.

---

### [FEAT-001] · [2026-08-23] Diario de Citas (Date Diary) con Calendario Inteligente y Analíticas
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Diario & Salud`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Bitácora confidencial y personal de encuentros con vista de calendario mensual táctico (`SmartCalendarGrid`), línea de tiempo de citas (`DiaryTimeline`), formulario de creación (`CreateDiaryEntryModal`) y métricas personales de salud sexual (`DiaryInsights`).
- **Componentes & Archivos Clave**:
  - `src/components/diary/DateDiaryView.tsx`
  - `src/components/diary/SmartCalendarGrid.tsx`
  - `src/components/diary/DiaryTimeline.tsx`
  - `src/components/diary/DiaryInsights.tsx`
  - `src/components/diary/CreateDiaryEntryModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cero exposición de datos a terceros (almacenamiento local privado).
  - [x] ADR-010 y ADR-043 documentados.

---

### [BASE-007] · [2026-08-23] Pantalla de Bloqueo Rápido / Stealth Lock Screen
- **Tipo**: `Seguridad`
- **Módulo / Eje**: `Seguridad & UI`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Cortina de bloqueo instantánea con teclado numérico brutalista y autenticación rápida local para proteger la app ante miradas indiscretas cuando se deja el dispositivo desatendido.
- **Componentes & Archivos Clave**:
  - `src/components/ui/StealthLockScreen.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Bloqueo inmediato al pulsar conmutador de sigilo.

---

### [BASE-006] · [2026-08-23] Testimonios con Doble Consentimiento Mutuo
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Respeto`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Sistema de referencias post-encuentro donde ninguna reseña se publica unilateralmente: ambos usuarios deben redactar y aprobar mutuamente el testimonio para que se vuelva visible en sus perfiles públicos.
- **Componentes & Archivos Clave**:
  - `src/components/profile/TestimonialsSection.tsx`
  - `src/components/account/PendingTestimonialsManager.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Regla de Negocio #2 cumplida.
  - [x] ADR-009 documentado.

---

### [BASE-005] · [2026-08-23] Verificación de Identidad Zero-Knowledge y Avatares con Privacidad Facial
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Seguridad & Auth`, `Perfil`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Mecanismo de verificación mediante credenciales oficiales u OAuth que emite un sello de autenticidad criptográfico permitiendo al usuario optar por avatares estilizados para no exponer su rostro público si requiere discreción laboral.
- **Componentes & Archivos Clave**:
  - `src/components/auth/IdentityVerificationModal.tsx`
  - `src/components/account/IdentityVerificationCard.tsx`
  - `src/components/auth/VerificationBadge.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Certificado Zero-Knowledge emitido.
  - [x] ADR-008 documentado.

---

### [BASE-004] · [2026-08-23] Gestor de Álbumes Públicos y Bóvedas Privadas
- **Tipo**: `Nueva Feature`
- **Módulo / Eje**: `Perfil & Álbumes`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Control estructurado de galerías con cuotas según plan (Free: hasta 3 álbumes y 1 bóveda privada; Unlimited: ilimitado) con temporizadores de apertura efímera y protección contra descargas directas.
- **Componentes & Archivos Clave**:
  - `src/components/account/UserAlbumManager.tsx`
  - `src/components/account/AlbumDetailModal.tsx`
  - `src/components/account/CreateAlbumModal.tsx`
  - `src/components/profile/PrivateVault.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Regla de Negocio #1 cumplida.
  - [x] ADR-007 documentado.

---

### [BASE-003] · [2026-08-23] Discretización Geográfica Google S2 & Motor de Batería de 4 Modos
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Geoespacial & Batería`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Indexación espacial basada en celdas esféricas jerárquicas Google S2 (Geohash 7 // ~152m) que imposibilita la triangulación o el acoso de ubicación exacta, coordinado con un motor reactivo de batería (`BatteryStateEngine.ts`) que ajusta la frecuencia GPS según el nivel del hardware (Normal, Eco, Crítico, Carga).
- **Componentes & Archivos Clave**:
  - `src/lib/geo/GeospatialEngine.ts`
  - `src/lib/geo/BatteryStateEngine.ts`
  - `src/components/radar/GeoBatteryModal.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Cumplimiento estricto de privacidad geoespacial.
  - [x] ADR-011 documentado.

---

### [BASE-002] · [2026-08-23] Motor de Síntesis Sub-Bass Analógico (45-80Hz) Web Audio API
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Audio & Háptica`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Diseño acústico visceral y sensorial único para la interacción carnal: sintetizador nativo Web Audio API (`SubBassAudioEngine.ts`) que genera pulsos senoidales graves analógicos de baja frecuencia (45 a 80 Hz) para cada toque, apertura de modal, envío de pulsos y alertas de seguridad.
- **Componentes & Archivos Clave**:
  - `src/lib/audio/SubBassAudioEngine.ts`
  - `HABILIDADES_Y_TELEMETRIA.md`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Resonancia auditiva comprobada sin archivos de audio pesados.
  - [x] ADR-004 documentado.

---

### [BASE-001] · [2026-08-23] Núcleo Arquitectónico Brutalista VESSEL, i18n Rioplatense y Contexto Central
- **Tipo**: `Core / Fundacional`
- **Módulo / Eje**: `Arquitectura & Core`, `Internacionalización`
- **Estado Actual**: **100% — Completado & Verificado**
- **Descripción**:
  Cimientos maestros del sistema VESSEL: Next.js 15 App Router con React 19, tokens semánticos brutalistas (`obsidian`, `rawAmber`, `bloodNeon`, `concrete`), barra de navegación de 6 columnas (`BrutalistNav`), cabecera HUD con telemetría en vivo (`BrutalistHeader`), sincronización de datos con `localStorage` y Firebase (`VesselContext.tsx`), y diccionario i18n completo para Español Rioplatense Gay e Inglés.
- **Componentes & Archivos Clave**:
  - `src/context/VesselContext.tsx`
  - `src/lib/i18n/translations.ts`
  - `src/components/navigation/BrutalistNav.tsx`
  - `src/components/brand/BrutalistHeader.tsx`
  - `src/components/brand/VesselLogo.tsx`
  - `src/app/page.tsx`
  - `src/app/layout.tsx`
- **Criterios de Aceptación & Verificación (DoD)**:
  - [x] Compilación y tipado estricto al 100% (`npm run typecheck` 0 errores).
  - [x] ADR-001, ADR-016 y ADR-032 documentados.
