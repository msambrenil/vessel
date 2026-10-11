# Flujo de Trabajo y Ciclo de Desarrollo en VESSEL

Guía operativa para la integración del Diseño Centrado en el Usuario (DCU), Spec-Driven Development (SDD) adaptativo y Definition of Done (DoD).

---

## 1. Comandos Esenciales del Proyecto

```bash
# Servidor de desarrollo local (puerto 3001 obligatorio)
npm run dev

# Verificación de tipos en caliente (Seguro con dev server activo, no toca .next)
npm run typecheck

# Suite de pruebas unitarias y de integración (Vitest, 194 tests)
npm run test

# Análisis estático de código (Linter)
npm run lint

# Validación completa previa a push (Tipos + Tests)
npm run validate

# Compilación y empaquetado de producción (Solo con servidor dev detenido)
npm run build
```

---

## 2. Integración DCU + SDD Adaptativo

Combinamos las 5 etapas del **Diseño Centrado en el Usuario (DCU)** con dos vías de ejecución técnica según la complejidad:

```mermaid
flowchart LR
    A[1. Empatizar / Explorar] --> B[2. Definir / Diseñar]
    B --> C[3. Idear / Planificar]
    C --> D[4. Prototipar / Aplicar]
    D --> E[5. Evaluar / Verificar]
```

### A. Vía Rápida (Fast-Path) — Tareas Atómicas (1 archivo / ajustes cosméticos)
- **Alcance**: Fixes de sintaxis, ajustes de padding/margen, textos de traducciones o consultas.
- **Flujo**: Modificación directa, validación de tipos con `npx tsc --noEmit` y entrega inmediata.

### B. Ciclo SDD Completo — Tareas Complejas (>2 archivos / nuevas features)
- **Alcance**: Nuevos flujos, refactors de estado global (`VesselContext`), cambios de modelo o integraciones multimedia.
- **Flujo Estructurado**:
  1. **Explore**: Análisis de impacto en `types/vessel.ts`, `VesselContext.tsx` y vistas activas.
  2. **Propose / Spec**: Especificación de requisitos y confirmación de reglas de negocio.
  3. **Tasks**: Desglose secuencial de tareas.
  4. **Apply**: Implementación modular respetando los 5 estados de componentes y tokens de diseño.
  5. **Verify**: Validación técnica (0 errores TS vía `npm run typecheck` y suite de tests verde vía `npm run test`) y sensorial (audio sub-bass + WCAG AA).
  6. **Archive**: Registro en Engram (`mem_save`) y actualización de `docs/contexto/decisiones.md`.

---

## 3. Cadencia de Mantenimiento Periódico & Tareas por Fases

Para garantizar la robustez del sistema, evitar degradación silenciosa y proteger la experiencia móvil, se establece una cadencia de ejecución periódica estructurada en 5 fases obligatorias:

* **Fase 1: Higiene & Salud del Código**
  - Barrido de código muerto, componentes no utilizados e importaciones huérfanas (criterio Ponytail).
  - Eliminación de timers parásitos (`setInterval`/`setTimeout` ociosos) para preservar CPU y batería.
  - Validación de tipos en caliente (`npm run typecheck`) con 0 errores de TypeScript.
  - Análisis estático (`npm run lint`).

* **Fase 2: Auditoría UX/UI, Ergonomía Mobile & Accesibilidad**
  - Auditoría de viewport en móviles compactos (320px–400px), safe areas (notches/Dynamic Island) y desasfixia vertical.
  - Verificación de áreas táctiles mínimas (44×44px) y los 5 estados interactivos obligatorios.
  - Cumplimiento de la regla de Cero Elementos Ad-Hoc: uso estricto de componentes de la biblioteca común (`@/components/ui/`).
  - Contraste WCAG AA y revisión de consistencia del vernáculo rioplatense (cero spanglish).

* **Fase 3: Suite de Pruebas, Rendimiento & Batería**
  - Ejecución de la suite completa de pruebas (`npm run test` en Vitest, manteniendo 100% de tests en verde).
  - Suspensión inteligente en segundo plano (`visibilitychange` / `document.hidden`) en temporizadores y contextos.
  - Verificación de `BatteryStateEngine` (desactivación de sync periódica con batería ≤15% o modo dormant).
  - Telemetría acústica y liberación de `AudioContext` en `SubBassAudioEngine`.

* **Fase 4: Sincronización de Contexto Vivo & Memoria Persistente**
  - Mantenimiento proactivo de documentación viva en `docs/contexto/` (`registro-de-features.md`, `decisiones.md`, `errores-conocidos.md`).
  - Persistencia en memoria persistente Engram (`mem_save`, `mem_session_summary`) bajo el namespace `"vessel"`.

* **Fase 5: Versionado, Despliegue & Purga Forzada de Caché**
  - Incremento de versión en `src/lib/version/systemVersion.ts`.
  - Sincronización de Service Worker y package.json (`npm run version:sync`).
  - Validación pre-push (`npm run validate`).
  - Comprobación de reflejo en consola de administración (`/admin` ➔ "Versión & Despliegues").

---

## 4. Checklist de Listo (Definition of Done - DoD)

Antes de dar por concluida cualquier entrega:

1. [ ] **Justificación de Producto y Arquetipos**: Explicar el **POR QUÉ (Why)** antes del **CÓMO (How)** y validar explícitamente a qué arquetipos de usuario (`docs/contexto/arquetipos.md`) beneficia o impacta el cambio.
2. [ ] **Fidelidad UX/UI y Evidencia Visual (Antes y Después)**: Correspondencia con Impeccable UI. En cambios de interfaz o flujos visuales, captura obligatoria de pantalla previa (**ANTES**) y posterior (**DESPUÉS**) documentada en el walkthrough y registro de entrega.
3. [ ] **Integridad de Código**: Verificación estricta de tipos (`npm run typecheck`), ejecución de suite de pruebas (`npm run test`) y linting (`npm run lint`). **Prohibido correr `next build` en caliente con `next dev` activo**.
4. [ ] **Prueba de Responsive**: Comportamiento verificado en viewport móvil (320px-430px) y desktop sin desborde horizontal (`overflow-x` limpio).
5. [ ] **Accesibilidad & 5 Estados UI**: Contraste WCAG AA (4.5:1 / 3:1), áreas táctiles mínimas de 44×44px y estados *Default, Hover, Active, Focus, Disabled*.
6. [ ] **No Regresión en Perfiles Sensibles**: Verificar que la solución no penalice terminales con batería crítica (`BatteryStateEngine`), planes de datos medidos ni comprometa la discreción de perfiles reservados.
7. [ ] **Persistencia y Memoria**: Registro proactivo en Engram (`mem_save`), actualización en `docs/contexto/decisiones.md` (ADR-XXX), `docs/contexto/registro-de-features.md` y `docs/contexto/errores-conocidos.md`.
8. [ ] **Invariante de Versión en Push a `main` (IMPORTANTE)**: Antes de subir cambios a `main`, actualizar la versión en `src/lib/version/systemVersion.ts`, correr `npm run version:sync`, verificar que `public/sw.js` quede actualizado para provocar la purga de Service Worker en clientes y confirmar que la nueva versión sea visible en el panel Admin ("Versión & Despliegues").

---

## 5. Guía de Despliegue en Producción (Vercel + Firebase)

> [!IMPORTANT]
> **Checklist Crítico para Lanzamiento en Producción**:
> VESSEL se desplegará oficialmente en **Vercel** debido a su compatibilidad nativa de día cero con Next.js 15 App Router y React 19.

### A. Variables de Entorno de Producción
En el panel de **Vercel** (`Project Settings > Environment Variables`), cargar las siguientes 6 variables vinculadas al proyecto `verssel-3438d`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbdw6uuW8qaevHirc0Rx_td8vVRRHQqjU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=verssel-3438d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=verssel-3438d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=verssel-3438d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=722400953164
NEXT_PUBLIC_FIREBASE_APP_ID=1:722400953164:web:d3f6914b5df2684e8f85e9
```

### B. Procedimiento Paso a Paso en Vercel
1. Conectar el repositorio de GitHub en [Vercel](https://vercel.com/) vía **"Add New Project"**.
2. Pegar el bloque de variables de entorno arriba descripto en la sección **Environment Variables**.
3. Ejecutar el **Deploy** para generar la URL pública (ejemplo: `https://vessel-app.vercel.app`).

### C. Autorización del Dominio en Firebase Console (Indispensable para Login con Google)
1. Ingresar a [Firebase Console](https://console.firebase.google.com/) > Proyecto **`verssel-3438d`**.
2. Dirigirse a **Authentication** > pestaña **Settings** > **Authorized domains**.
3. Agregar el dominio asignado por Vercel (ejemplo: `vessel-app.vercel.app` o el dominio personalizado `vessel.app`) sin `https://`.
4. Guardar. Con esto el login con Google OAuth y Email funcionará en vivo sin restricciones de seguridad.

### D. Invariante de Versionado y Purga Forzada al Subir a `main` (IMPORTANTE)
1. Antes de hacer `git push origin main`:
   - Incrementar versión con `npm run version:bump` o actualizar manualmente `CURRENT_SYSTEM_VERSION` y `SYSTEM_CHANGELOG` en `src/lib/version/systemVersion.ts`.
   - Ejecutar `npm run version:sync` para sincronizar `public/sw.js` y `package.json`.
   - Ejecutar `npm run validate` (`version:sync` + `typecheck` + `test`).
2. Al impactar en `main`, todos los navegadores que entren a la app detectarán la nueva versión a través de `/api/system/version` y `PwaRegister.tsx`, purgando cachés locales de forma automática y cargando el código nuevo.
3. La consola de administración (`/admin` ➔ 'Versión & Despliegues') mostrará la build activa y el registro histórico oficial actualizado.


