# Convenciones de Código y Diseño en VESSEL

Estándares visuales, tokens semánticos, anatomía de componentes, leyes de Gestalt y reglas de accesibilidad WCAG AA para la interfaz brutalista de **VESSEL**.

---

## 1. Sistema de Tokens de Color Semánticos (Dark Luxury & Queer Vanguard)

Definidos en [`tailwind.config.ts`](file:///Users/ojitos/Documents/vessel%20app/tailwind.config.ts):

| Token | Hex | Contraste vs Obsidian | Uso Semántico y Emocional |
| :--- | :--- | :--- | :--- |
| `obsidian-deep` | `#040405` | *Base* | Fondo raíz inmersivo de la aplicación, pantalla completa y modales profundos. |
| `obsidian-surface` | `#121216` | 1.15:1 | Contenedores principales, consolas de estado, tarjetas de perfil y paneles elevados. |
| `obsidian-card` | `#18181D` | 1.25:1 | Sub-tarjetas, items de lista, inputs y bloques interactivos. |
| `electricViolet` | `#8B5CF6` | **6.5:1 (AA)** | Acento principal de marca y selección activa, estados de navegación, foco de inputs y CTAs primarios. |
| `electricViolet-glow` | `#A78BFA` | **9.8:1 (AAA)** | Resplandor ultravioleta cinético, micro-interacciones activas y estados hover. |
| `bloodNeon` | `#E61937` | **4.8:1 (AA)** | Logotipo oficial de marca, alertas críticas, estado `occupied` (en una), bóvedas cifradas y Rendezvous. |
| `mintNeon` | `#10B981` | **9.2:1 (AAA)** | Verificación 3D Anti-Bot, Modo Real activo, Cultura del Respeto y estado `open` (disponible). |
| `champagneGold` | `#F59E0B` | **8.5:1 (AAA)** | Exclusivo para membresías y coronas VESSEL UNLIMITED (restringido para no saturar). |
| `purple-400` | `#C084FC` | **7.5:1 (AA)** | Estado `dormant` (incógnito) y protocolos de desconexión gradual (*Soft-Block*). |
| `concrete` | `#24242B` | 1.4:1 | Bordes divisorios sutiles (`border-white/10` o `border-concrete`). |

---

## 2. Escala Tipográfica Modular y Jerarquía

| Nivel | Clase Tailwind | Tamaño / Peso | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Micro / Monospace** | `text-[9px]` font-mono | 9px / Bold | Badges de Modo Niebla, distancias discretizadas, hashes y contadores. |
| **Secundario / Metadatos** | `text-[10px]` / `text-xs` | 10-12px / Medium | Rol (`Top/Bottom/Vers`), contextura, tags de fetiches y timestamps. |
| **Cuerpo / Nombres** | `text-sm` font-bold | 14px / Bold | Codenames de usuarios, mensajes de chat y opciones de formularios. |
| **Títulos de Sección** | `text-base` / `text-lg` | 16-18px / Extrabold | Cabeceras de vista, títulos de modal y métricas de satisfacción. |
| **Display / Hero** | `text-xl` / `text-2xl` | 20-24px / Black | Logotipo VESSEL oficial, números de Respect Karma y PIN de encuentro. |

---

## 3. Anatomía de Tarjetas, Badges y Leyes de Gestalt

La cuadrícula de perfiles (`ProfileCard`) y los módulos de lista aplican rigurosamente los principios de la psicología de la forma y la ergonomía visual:

1. **Ley de Proximidad y Flujo Anticolisión**:
   - Elementos con relación directa (ej. punto de estado + distancia, o codename + edad + badge) se agrupan con separación mínima (`gap-1` o `gap-1.5`).
   - Los badges superiores se unifican en un único contenedor estructural `flex-col gap-1.5 z-10` con sub-filas fluidas (`flex-wrap`), impidiendo solapamientos en viewports reducidos o densidades de 4 a 5 columnas.
   - El bloque de metadatos inferior se separa claramente de los badges superiores mediante el espacio visual de la fotografía.
2. **Ley de Semejanza**:
   - Todos los badges de estado funcional comparten la misma estructura geométrica (*pill* redondeada, fondo `bg-black/75 backdrop-blur-md` y borde `border-white/15`).
3. **Ley de Cierre y Contraste (Scrim)**:
   - Toda tarjeta fotográfica implementa una capa de degradado cinematográfico negro inferior (`bg-gradient-to-t from-black/95 via-black/35 to-black/40 pointer-events-none`) que asegura legibilidad absoluta del texto blanco sobre cualquier imagen clara o saturada.
4. **Botón de Reacción Semántica por Rol**:
   - El control de acción rápida inferior adapta su icono y tooltip contextualmente al rol del usuario objetivo (`🍑` para pasivos, `🍆` para activos, `⚡` para versátiles, `🫦` para sides, `👅` para oral focus, `⛓️` para dominantes y `🧎` para sumisos), con micro-animación `scale-110` en hover y respuesta sonora Sub-Bass.

---

## 4. Los 5 Estados Obligatorios de Componentes UI

Todo botón, chip o elemento interactivo implementa explícitamente sus 5 estados:

```tsx
// Ejemplo canónico de botón de acción VESSEL
<button
  className="
    bg-electricViolet text-white font-bold rounded-xl px-4 py-2 text-xs        /* 1. Default */
    hover:bg-electricViolet-glow hover:shadow-[0_0_18px_rgba(139,92,246,0.45)]  /* 2. Hover */
    active:scale-[0.96] active:bg-purple-700                                   /* 3. Active */
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black /* 4. Focus */
    disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none /* 5. Disabled */
    transition-all duration-200
  "
>
  Confirmar Acción
</button>
```

---

## 5. Accesibilidad Móvil y Operabilidad con el Pulgar

1. **Áreas Táctiles Mínimas**:
   - Todo botón o control táctil tiene una dimensión mínima de **44×44px** (o padding expandido `p-2.5` / `p-3`).
2. **Zona del Pulgar (Thumb Zone)**:
   - La barra de navegación principal (`BrutalistNav`) y los botones de acción inmediata (señales, cambio de estado corporal) se ubican en la zona inferior de la pantalla para operarse cómodamente con una sola mano.
3. **Prevención de Desbordamiento**:
   - Toda vista incluye `pb-28` en su contenedor raíz para evitar que el contenido inferior sea tapado por la navegación fija.
   - El contenedor raíz previene scroll horizontal accidental con `w-full max-w-4xl mx-auto overflow-x-hidden`.

---

## 6. Convenciones Lingüísticas y Registro de Voz (Español Rioplatense Gay 20-35)

1. **Voseo y Matiz Rioplatense**:
   - Se utiliza el voseo argentino estándar en segunda persona (*vos tenés, elegí, mandá, fijate, caele*) en lugar del tuteo neutro (*tú tienes, elige*).
2. **Jerga Auténtica de la Comunidad Gay Joven (20-35 años)**:
   - Términos canónicos: *chongo, morbo, previa, al palo, depto/lugar, clavar el visto, cero careteada, sin vueltas, pintar algo ya, en una, de incógnito*.
3. **Mapeo Dinámico de Roles en UI**:
   - El modelo interno de datos conserva el tipo en inglés (`RoleType = "Top" | "Bottom" | ...`).
   - La visualización en la UI se realiza SIEMPRE mediante el helper `getRoleDisplayLabel(role, language)` de `src/data/roleActionCatalog.ts` para renderizar `Activo`, `Pasivo`, `Versátil`, `Dominante`, `Sumiso`, `Enfoque Oral` o `Side` de forma reactiva según el idioma activo.
4. **Respuestas Anti-Ghosting con Onda**:
   - Salidas amables y transparentes en 1 toque (*"Sos un fuego total, pero hoy no tengo chispa..."*, *"Che, sigo de largo por hoy..."*, *"Re linda vibra, pero hoy ando buscando otra cosa..."*).

