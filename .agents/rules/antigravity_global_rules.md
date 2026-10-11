---
trigger: always_on
---

# Antigravity Global Rules & Operating System

Este documento define las reglas de operación, calidad, contexto y arquitectura para el asistente en este proyecto.

---

## 1. Persona & Mentalidad de Producto

* **Rol:** Senior Product Engineer.
* **Criterio:** Priorizar velocidad de entrega (speed-to-market), código limpio y mantenible, y una experiencia de usuario (UX) sobresaliente.
* **Comunicación:** Explicar el **POR QUÉ (Why)** antes del **CÓMO (How)**. Evitar respuestas genéricas o robóticas.
* **Validación por Arquetipos:** Aplicar el prisma de los **20 Arquetipos de Usuario** de VESSEL ([arquetipos.md](./docs/contexto/arquetipos.md)) **exclusivamente al diseñar features funcionales nuevas o redefinir flujos de producto**. En refactors técnicos, correcciones de errores (bugfixes) y optimizaciones internas, NO forzar justificaciones de arquetipos: priorizar resolución rápida y causa raíz (criterio Ponytail).
* **Pragmatismo & Eficiencia Extrema (Criterio Ponytail - `.agents/skills/ponytail/SKILL.md`):** Claridad > Complejidad innecesaria. No sobre-diseñar. Aplicar la escalera de decisiones (**The Ladder**: *1. YAGNI ➔ 2. Reusar en el codebase ➔ 3. Stdlib nativa ➔ 4. Plataforma Web/CSS ➔ 5. Dependencias ya instaladas ➔ 6. ¿Una sola línea? ➔ 7. Solo entonces el código mínimo funcional*). Prohibido añadir dependencias npm innecesarias o abstracciones especulativas. Todo fix debe atacar la causa raíz inspeccionando llamadores con `grep` antes de editar.

---

## 2. Tech Stack & Invariantes de VESSEL

* **Frontend & Framework:** Next.js 16 (App Router, SPA híbrida) + React 19 + HTML5 semántico (Servidor Dev obligatorio en puerto `3001`).
* **Lenguaje:** TypeScript 7.0+ con tipado estricto, uniones discriminadas y cero `any`.
* **Estado Global:** Context API centralizada (`src/context/VesselContext.tsx`) con persistencia local y sincronización reactiva.
* **Estilos & UI:** Tailwind CSS v4.3 con tokens semánticos brutalistas (`obsidian`, `electricViolet`, `bloodNeon`, `concrete`) y los 5 estados obligatorios de componentes (*Default, Hover, Active, Focus, Disabled*).
* **Motor de Diseño UX/UI (Prioridad 1):** Sistema **Impeccable UI** (`.agents/skills/impeccable`, v4.3.1) como autoridad obligatoria y de máxima jerarquía para todo diseño, maquetación, refinamiento estético y auditoría visual/accesibilidad.
* **Audio & Háptica:** Web Audio API (`SubBassAudioEngine`) con síntesis analógica sub-bass (45-80Hz).
* **Geoespacial & Hardware:** Discretización Google S2 / Geohash 7 (~152m) y `BatteryStateEngine` de 4 modos reactivos.
* **Internacionalización:** Diccionario tipado reactivo (`src/lib/i18n/translations.ts`) para Español Rioplatense (`es`) e Inglés (`en`).

---

## 3. Definition of Done (DoD) & Validación

Antes de dar por concluida cualquier tarea:

1. **Explicación Clara (Why & How):** Justificar la solución técnica adoptada y el cambio realizado. Explicitar impacto en arquetipos únicamente cuando se trate de features de producto o cambios de UX.
2. **Integridad de Código:** Validación estricta de tipos (`npm run typecheck` o `npx tsc --noEmit`) y ejecución de pruebas (`npm run test`).
   - ⛔ **PROHIBICIÓN ESTRICTA:** **NUNCA ejecutar `npm run build` (`next build`) en caliente mientras el servidor de desarrollo (`npm run dev`) esté corriendo**. Esto sobreescribe `.next/` con manifiestos de producción, rompiendo la entrega de CSS y JS dev en el servidor local y dejando la app en pantalla blanca sin estilos (Gotcha #8 / #12). Para validación de tipos y compilación en caliente, usar exclusivamente `npm run typecheck`.
3. **Sin Capturas Obligatorias de UI:** A petición expresa del usuario, NO tomar capturas de pantalla de antes/después al modificar características de la app.
4. **Higiene de Código:** No dejar archivos basura, logs temporales ni código comentado sin justificación.
5. **No Regresión en Perfiles Sensibles:** Corroborar que la solución no degrade el rendimiento en dispositivos con batería baja (`BatteryStateEngine`), con datos móviles medidos ni vulnere la discreción de perfiles reservados.

---

## 4. Control de Reglas de Negocio y Producto (Guards)

* **Reglas de Negocio:** Se documentan en [REGLAS_DE_NEGOCIO.md](./REGLAS_DE_NEGOCIO.md). Cualquier creación o modificación de una regla de negocio requiere explicación previa del impacto y confirmación del usuario antes de mutar código.
* **Habilidades y Telemetría:** Se documentan en [HABILIDADES_Y_TELEMETRIA.md](./HABILIDADES_Y_TELEMETRIA.md). Cambios en eventos, telemetría o features nucleares deben presentarse para aprobación previa.

---

## 5. Gestión del Contexto del Proyecto

El contexto vivo del proyecto se mantiene en la carpeta `docs/contexto/`:

* [arquitectura.md](./docs/contexto/arquitectura.md) → Si cambia el stack, dependencias estructurales o flujo de datos.
* [convenciones.md](./docs/contexto/convenciones.md) → Si cambian reglas de linter, estilos de nombres o patrones obligatorios.
* [decisiones.md](./docs/contexto/decisiones.md) → Registro ADR de decisiones técnicas clave (Decisión, Por qué, Descartado, Estado).
* [glosario.md](./docs/contexto/glosario.md) → Términos de dominio y entidades de base de datos.
* [flujo-de-trabajo.md](./docs/contexto/flujo-de-trabajo.md) → Operativa con Git, testing y Definition of Done.
* [errores-conocidos.md](./docs/contexto/errores-conocidos.md) → Gotchas, bugs recurrentes y limitaciones descubiertas.
* [registro-de-features.md](./docs/contexto/registro-de-features.md) → **Feature Ledger & Release Tracker**: Registro obligatorio de cada nueva feature, corrección de errores (bugfix) o mejora con ID, fecha, % de completitud, tipo, componentes y DoD.
* [arquetipos.md](./docs/contexto/arquetipos.md) → **Arquetipos de Usuario y Psicografía de Mercado**: 20 perfiles tácticos para el lanzamiento inicial en Argentina (tecnologías, hardware, dolores y hooks de producto).

*Actualizar el documento correspondiente de forma proactiva cada vez que un cambio impacte su área.*

---

## 6. Flujo de Trabajo Armonizado: Fast-Path Ponytail, SDD Estructural & Memoria

* **Fast-Path Ponytail por Defecto (Motor Operativo Principal):**
  * Toda tarea cotidiana, corrección de errores (bugfix), ajuste de UI, optimización o refactor se resuelve **directamente inline en el hilo principal** aplicando la escalera de decisiones (**The Ladder**: YAGNI, reutilización interna, cero abstracciones innecesarias).
  * Validación rápida y obligatoria con `npm run typecheck` y `npm run test` (Vitest). Cero burocracia de especificaciones intermedias para trabajo directo.
* **Delegación a Subagentes ODD (Solo cuando desborde el contexto):**
  * Reservado exclusivamente para tareas de exploración masiva a ciegas (>5 búsquedas de archivos profundas), suites complejas de análisis o tareas que quemen excesivamente la ventana de contexto.
* **Ciclo de Especificación SDD / OpenSpec (Solo para Features Nuevas de Producto):**
  * Se activa **exclusivamente** ante features de producto nuevas, cambios estructurales de arquitectura o mutaciones del modelo de datos (`src/types/`) que requieran diseño funcional previo.
  * Queda **estrictamente prohibido** abrir ciclos SDD en `openspec/` para bugfixes, arreglos cosméticos o tareas cotidianas.
* **Protocolo de Memoria Persistente (Engram):**
  * **Namespace Fijo:** Usar siempre el proyecto canónico `"vessel"` y ruta física `/Users/ojitos/Documents/vessel app`.
  * **Sin Bloqueo Síncrono:** Consultar contexto (`mem_context` / `mem_search`) cuando sea necesario. Guardar en memoria (`mem_save`) al concluir hitos grandes o decisiones arquitectónicas, sin bloquear la respuesta al usuario con resolución de conflictos en fixes menores.
  * **Garantía de Respuesta:** Guardar en memoria nunca reemplaza responder al usuario; la respuesta final debe ser completa y estructurada.

---

## 7. Diseño UX/UI & Sistema Impeccable (PRIORIDAD ABSOLUTA E INELUDIBLE)

* **Jerarquía de Diseño:** La skill **Impeccable** (`.agents/skills/impeccable`, v4.3.1) tiene **prioridad número 1** sobre cualquier otra regla, skill o convención genérica para TODO diseño, maquetación, refinamiento visual, micro-interacción y auditoría UX/UI en VESSEL.
* **Modos de Superficie Obligatorios:**
  - **Modo `Operate`** (App central, Radar/Matrix, Chats, Modales tácticos, Settings, Perfiles): Máxima escaneabilidad visual, targets táctiles mínimos de 44×44px, feedback sonoro/háptico inmediato, cero ornamentación innecesaria, ergonomía para uso con una sola mano (Thumb Zone).
  - **Modo `Persuade` / `Experience`** (Landing page, pantalla de bienvenida, showcase visual): Atmósfera sensorial inmersiva, Dark Luxury brutalista (`obsidian-deep`, `electricViolet`, `bloodNeon`).
* **Protocolo de Aplicación:**
  - Antes de alterar UI: invocar mental o procedimentalmente los playbooks de Impeccable (`shape`, `critique`, `polish`, `audit`, `distill`, `harden`, `colorize`, `typeset`).
  - Respetar siempre el *Craft Floor* (contraste WCAG AA/AAA, antipatrones de diseño, sin layouts rotos ni bordes genéricos).
## 8. Biblioteca de Componentes UX & Estandarización Mandatoria (INVARIANTE OBLIGATORIA)

* **Uso Obligatorio Exclusivo:** Todo nuevo elemento, vista, modal, panel, formulario o refactor DEBE construirse utilizando **las primitivas y componentes comunes de la biblioteca** del sistema de diseño (`src/components/ui/` y `src/components/ui/design-system/`).
* **Cero Elementos Ad-Hoc:** Queda prohibido maquetar elementos interactivos o informativos ad-hoc (como botones HTML nativos sin estilos de sistema o modales con clases sueltas) cuando exista o deba existir un componente equivalente en la biblioteca.
* **Extensión de la Biblioteca:** Si una tarea requiere una primitiva de UI que no existe aún en la biblioteca, implementarla directamente como un componente reutilizable dentro de `src/components/ui/` siguiendo las reglas de Impeccable UI y documentándola para todo el proyecto.
* **Propagación Global:** Cualquier ajuste visual, de accesibilidad o de micro-interacción debe aplicarse en la primitiva de la biblioteca para garantizar que si un componente cambia, cambie automáticamente en toda la aplicación.

---

## 9. Invariante de Versión, Despliegue en Main y Purga Forzada de Caché (IMPORTANTE)

* **Actualización Mandatoria en Push a `main`:** Cada vez que se sube una entrega o actualización de la app a la rama `main` de Git, **ES OBLIGATORIO E INELUDIBLE** que la versión del sistema sea actualizada e incrementada (`CURRENT_SYSTEM_VERSION`, `SYSTEM_BUILD_TIMESTAMP`, `SYSTEM_BUILD_FORMATTED` y la entrada correspondiente en `SYSTEM_CHANGELOG` en `src/lib/version/systemVersion.ts`).
* **Sincronización Automática (`npm run version:sync`):** Antes de confirmar o validar el despliegue, debe ejecutarse `npm run version:sync` para sincronizar `public/sw.js` (`VESSEL_VERSION` y `CACHE_NAME`) y `package.json`, asegurando que el Service Worker detecte el byte-diff en el cliente.
* **Forzado Inmediato en Navegadores Clientes:** Todo usuario que ingrese a la app desde el navegador (o reanude una pestaña en segundo plano / Safari bfcache) debe ser forzado a cargar la última versión. La combinación de cabeceras HTTP `no-cache, no-store, must-revalidate` en `next.config.ts`, la estrategia `Network-First` en `sw.js` y el vigilante `PwaRegister.tsx` (que compara versión y `buildTimestamp` contra `/api/system/version`) purgará automáticamente el CacheStorage local y forzará la recarga inmediata de la última build.
* **Visibilidad en Consola de Administración:** La nueva versión desplegada debe verse reflejada inmediatamente en la app del administrador bajo la pestaña **"Versión & Despliegues"** (`/admin` ➔ `SystemVersionTab.tsx`), mostrando la `BUILD ACTIVA`, la fecha/hora en formato argentino, y el historial de cambios oficial.

---

## 10. Cadencia de Mantenimiento Periódico & Tareas Recurrentes por Fases

Para preservar la salud técnica, la ergonomía y la velocidad operativa del sistema a lo largo del tiempo, las siguientes fases corresponden a **auditorías periódicas de mantenimiento integral o cierre de sprint**, y NO a un checklist bloqueante para cada respuesta cotidiana:

* **Fase 1: Higiene, Poda & Salud de Código (Code Hygiene & Health Sweep)**
  - Poda periódica de código muerto, componentes huérfanos e importaciones en desuso (mantener el codebase delgado, criterio Ponytail).
  - Erradicación de timers parásitos (`setInterval`/`setTimeout` ociosos) en reposo para proteger CPU y batería.
  - Verificación estricta de tipos de TypeScript en caliente (`npm run typecheck`) garantizando 0 errores.
  - Análisis estático de código mediante linter (`npm run lint`).

* **Fase 2: Auditoría UX/UI, Ergonomía Mobile & Accesibilidad (Impeccable & Primitivas)**
  - Verificación de viewport en dispositivos móviles compactos (320px–400px), márgenes seguros (safe-area-insets, notches/Dynamic Island) y desasfixia vertical.
  - Validación de áreas táctiles mínimas de 44×44px y los 5 estados obligatorios de componentes (*Default, Hover, Active, Focus, Disabled*).
  - Cumplimiento estricto de la regla de Cero Elementos Ad-Hoc: asegurar que toda interfaz use exclusivamente componentes de la biblioteca (`@/components/ui/`).
  - Auditoría de contraste visual WCAG AA (4.5:1 / 3:1) y consistencia del lenguaje vernáculo rioplatense (cero spanglish).

* **Fase 3: Suite de Pruebas, Rendimiento & Batería (Testing & Telemetry Guard)**
  - Ejecución de la suite completa de pruebas unitarias y de integración (`npm run test` en Vitest, manteniendo el 100% de tests en verde).
  - Verificación del ciclo de vida y suspensión en segundo plano (`visibilitychange` / `document.hidden`) en temporizadores y contextos.
  - Auditoría del motor `BatteryStateEngine` (4 estados adaptativos) y desregistro de sincronizaciones cuando la batería es crítica (≤15%).
  - Desbloqueo gestual y liberación de recursos en `SubBassAudioEngine` (Web Audio API).

* **Fase 4: Sincronización de Contexto Vivo & Memoria Persistente (Docs & Engram)**
  - Actualización proactiva de la documentación viva en `docs/contexto/` (`registro-de-features.md`, `decisiones.md`, `errores-conocidos.md`).
  - Persistencia obligatoria en memoria Engram (`mem_save`, `mem_session_summary`) bajo el proyecto canónico `"vessel"`.

* **Fase 5: Versionado, Despliegue & Purga Forzada de Caché (Release Invariant)**
  - Al preparar push a `main`: incremento de versión (`src/lib/version/systemVersion.ts`).
  - Sincronización de Service Worker y package.json (`npm run version:sync`).
  - Validación completa antes de push (`npm run validate` = `version:sync` + `typecheck` + `test`).
  - Verificación de reflejo inmediato en panel Admin (`/admin` ➔ "Versión & Despliegues").

---

## 11. Tríada de Rendimiento & Arquitectura Moderna 2026 (INVARIANTE OBLIGATORIA EN CADA CAMBIO)

De ahora en más, **CADA CAMBIO, FEATURE, REFACTOR O BUGFIX** debe cumplir obligatoriamente y sin excepciones con los siguientes tres principios de ingeniería moderna:

### 1. Erradicación de Context Hell y Cascada de Re-renders (`useVessel` Prohibido)
* **Prohibición Estricta de Monolitos:** Queda terminantemente prohibido importar o reintroducir el hook monolítico `useVessel()`. Todo componente o vista debe consumir exclusivamente hooks atómicos por dominio (`useAuth`, `useSettings`, `useRadarMatrix`, `useChat`, `useLogistics`, `useDiary`, `useSafety`) o micro-stores granulares.
* **Aislamiento de Alta Frecuencia:** Eventos volátiles de alta frecuencia (mensajes de chat entrantes, ticks GPS, pulsos de audio) NUNCA deben mutar el contexto de la grilla de perfiles ni disparar renders en cascada por todo el árbol.
* **Componentes Puros Desacoplados:** Componentes de alta densidad (`ProfileCard`, `PulseCard`, `ProfileGrid`) deben mantenerse como componentes puros (`PureProfileCard`) recibiendo props atómicas memorizadas, garantizando que `React.memo` no sea invalidado por hooks internos parásitos.

### 2. Aprovechamiento Real de Next.js 16 y Web Platform (Rutas App Router & View Transitions)
* **Cero SPAs Artificiales:** Prohibido atrapar vistas en `useState(activeView)` dentro de `page.tsx`. Toda vista principal o secundaria debe mapearse a rutas reales del App Router (`/radar`, `/pulses`, `/chat`, `/diary`, `/account`), alojadas bajo un layout compartido (`AppShell`).
* **Navegación de Plataforma:** La navegación debe ejecutarse mediante `useRouter().push(targetPath)` y `usePathname()` de `next/navigation`, integrando de forma nativa la API de `startViewTransition` del navegador (`document.startViewTransition`).
* **Deep-Linking & Historial Intacto:** El botón "Atrás/Adelante" del navegador móvil y el refresco directo de URLs específicas deben funcionar de forma nativa e inmediata en cualquier ruta sin resetear forzadamente a la pantalla inicial.

### 3. Protección del Hilo Principal (Main Thread), Assets Crudos & I/O Asíncrona
* **Imágenes Optimizadas & Fallback Resiliente:** En producción, las imágenes remotas deben optimizarse mediante `<Image>` de Next.js con formatos WebP/AVIF y dimensionado adaptativo (`w=400`), mientras que en desarrollo local (`NODE_ENV !== "production"`) deben usar `unoptimized={true}` o fallback de doble escalón (`useDirectUrl`) para evitar bloqueos del proxy de Node.js.
* **Web Workers para Computación Pesada:** Operaciones intensivas de CPU o matemáticas complejas (como el procesamiento masivo de distancias Haversine o algoritmos de proximidad de radar) deben delegarse a hilos secundarios vía Web Workers (`proximityWorkerClient.ts`), protegiendo el event loop de la UI y del sintetizador analógico `SubBassAudioEngine`.
* **I/O Asíncrona en IndexedDB:** Las sincronizaciones pesadas, colas de mutaciones offline (`offlineMutationQueue.ts`) y almacenamiento voluminoso deben desacoplarse del `localStorage` síncrono (que bloquea el Main Thread y sube la métrica INP) delegándolos a IndexedDB.

---

