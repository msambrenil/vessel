# Flujo de Trabajo y Ciclo de Desarrollo en VESSEL

Guía operativa para la integración del Diseño Centrado en el Usuario (DCU), Spec-Driven Development (SDD) adaptativo y Definition of Done (DoD).

---

## 1. Comandos Esenciales del Proyecto

```bash
# Servidor de desarrollo local (puerto 3001 obligatorio)
npm run dev

# Verificación de tipos en caliente (Seguro con dev server activo, no toca .next)
npm run typecheck

# Análisis estático de código (Linter)
npm run lint

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
  5. **Verify**: Validación técnica (0 errores TS vía `npx tsc --noEmit`) y sensorial (audio sub-bass + WCAG AA).
  6. **Archive**: Registro en Engram (`mem_save`) y actualización de `docs/contexto/decisiones.md`.

---

## 3. Checklist de Listo (Definition of Done - DoD)

Antes de dar por concluida cualquier entrega:

1. [ ] **Justificación de Producto**: Explicar el **POR QUÉ (Why)** antes del **CÓMO (How)**.
2. [ ] **Fidelidad UX/UI**: Correspondencia exacta con los principios de diseño y componentes de Figma.
3. [ ] **Integridad de Código**: Verificación estricta de tipos (`npm run typecheck`) y linting (`npm run lint`). **Prohibido correr `next build` en caliente con `next dev` activo**.
4. [ ] **Prueba de Responsive**: Comportamiento verificado en viewport móvil (320px-430px) y desktop sin desborde horizontal (`overflow-x` limpio).
5. [ ] **Accesibilidad & 5 Estados UI**: Contraste WCAG AA (4.5:1 / 3:1), áreas táctiles mínimas de 44×44px y estados *Default, Hover, Active, Focus, Disabled*.
6. [ ] **Persistencia y Memoria**: Registro proactivo en Engram (`mem_save`) y actualización en `docs/contexto/decisiones.md` (ADR-XXX) y `docs/contexto/errores-conocidos.md`.

---

## 4. Guía de Despliegue en Producción (Vercel + Firebase)

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


