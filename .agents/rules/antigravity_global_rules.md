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
* **Pragmatismo:** Claridad > Complejidad innecesaria. No sobre-diseñar.

---

## 2. Tech Stack & Invariantes de VESSEL

* **Frontend & Framework:** Next.js 15.1.7 (App Router, SPA híbrida) + React 19 + HTML5 semántico (Servidor Dev obligatorio en puerto `3001`).
* **Lenguaje:** TypeScript 5.7+ con tipado estricto, uniones discriminadas y cero `any`.
* **Estado Global:** Context API centralizada (`src/context/VesselContext.tsx`) con persistencia local y sincronización reactiva.
* **Estilos & UI:** Tailwind CSS v3.4 con tokens semánticos brutalistas (`obsidian`, `rawAmber`, `bloodNeon`, `concrete`) y los 5 estados obligatorios de componentes (*Default, Hover, Active, Focus, Disabled*).
* **Audio & Háptica:** Web Audio API (`SubBassAudioEngine`) con síntesis analógica sub-bass (45-80Hz).
* **Geoespacial & Hardware:** Discretización Google S2 / Geohash 7 (~152m) y `BatteryStateEngine` de 4 modos reactivos.
* **Internacionalización:** Diccionario tipado reactivo (`src/lib/i18n/translations.ts`) para Español Rioplatense (`es`) e Inglés (`en`).

---

## 3. Definition of Done (DoD) & Validación

Antes de dar por concluida cualquier tarea:

1. **Explicación:** Justificar la solución técnica adoptada (Why) y el cambio realizado (How).
2. **Integridad de Código:** Validación estricta de tipos (`npm run typecheck` o `npx tsc --noEmit`) y ejecución de pruebas.
   - ⛔ **PROHIBICIÓN ESTRICTA:** **NUNCA ejecutar `npm run build` (`next build`) en caliente mientras el servidor de desarrollo (`npm run dev`) esté corriendo**. Esto sobreescribe `.next/` con manifiestos de producción, rompiendo la entrega de CSS y JS dev en el servidor local y dejando la app en pantalla blanca sin estilos (Gotcha #8 / #12). Para validación de tipos y compilación en caliente, usar exclusivamente `npm run typecheck`.
3. **Verificación Visual (Solo cambios de UI):** Si el cambio afecta la interfaz de usuario, verificar el renderizado visual y estados del sistema (Loading, Empty, Error, Success).
4. **Higiene de Código:** No dejar archivos basura, logs temporales ni código comentado sin justificación.

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

*Actualizar el documento correspondiente de forma proactiva cada vez que un cambio impacte su área.*

---

## 6. Flujo de Trabajo Automático: SDD & Memoria Engram

* **Metodología SDD por Defecto (Spec-Driven Development):**
  * Ante cualquier solicitud del usuario que implique cambios de comportamiento, features o refactors (>2 archivos), activar automáticamente el flujo SDD (*Explore ➔ Spec/Design ➔ Tasks ➔ Apply ➔ Verify ➔ Archive*).
  * Para fixes atómicos, preguntas o ajustes de 1 solo archivo, aplicar vía rápida (*Fast-Path*) validando con `npm run build` antes de entregar.
* **Protocolo de Memoria Persistente (Engram):**
  * **Proactivo e Ineludible:** Invocar `mem_save` inmediatamente ante decisiones de arquitectura, creación de features, fixes con causa raíz o descubrimientos no obvios.
  * **Búsqueda Previa:** Consultar memoria previa con `mem_context` / `mem_search` al iniciar tareas o investigar antecedentes.
  * **Cierre de Sesión:** Concluir sesiones significativas con `mem_session_summary`.
  * **Garantía de Respuesta:** Guardar en memoria nunca reemplaza responder al usuario; la respuesta final debe ser completa y estructurada.

---

## 7. Integraciones Opcionales del Ecosistema

1. **Graphify (si existe `graphify-out/`):**
   * Consultar la topología del grafo (`graphify path`, `graphify query`) antes de refactors profundos.
   * Tras modificar código estructural, ejecutar `graphify extract . --code-only` o `graphify update .`.
2. **Impeccable UI (si la skill está disponible y el usuario invoca "impeccable"):**
   * Cargar el contexto del componente, identificar el modo de superficie (`Operate`, `Persuade`, `Read`, `Experience`) y auditar anti-patrones de diseño.
