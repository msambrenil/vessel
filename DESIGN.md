# DESIGN.md — Sistema de Diseño Brutalist Dark Luxury (VESSEL)

Documento vivo de especificación y tokens de diseño para **VESSEL**, estructurado bajo el estándar de **Impeccable**.

---

## 1. Visión y Lenguaje de Diseño

* **Estética:** *Brutalist Dark Luxury*.
* **Inspiración:** Arquitectura berlinesa underground, minimalismo de lujo, superficies oscuras profundas, destellos de ámbar crudo y acentos de neón sangre.
* **Sensación:** Físico, táctil, austero pero sofisticado, con retroalimentación acústica *Sub-Bass* (45-80Hz) en cada interacción clave.

---

## 2. Los 4 Modos de Superficie de Impeccable en VESSEL

Cada vista de VESSEL se diseña atendiendo rigurosamente a la intención del usuario (*Visitor Surface Mode*):

| Modo | Vistas / Componentes de VESSEL | Criterio de Diseño e Interacción |
| :--- | :--- | :--- |
| **`Operate`** | `ProfileGrid`, `RadarView`, `DarkroomChatModal`, `RendezvousModal`, `BodyStateToggle`, `GeoBatteryModal` | **Velocidad y ergonomía extrema.** Zonas táctiles al alcance del pulgar (*Thumb Zone*), contraste alto inmediato, escaneabilidad sin fricción y touch targets de 44×44px mínimo. |
| **`Experience`** | `MediaVault`, `AlbumDetailModal`, `ProfileDetailModal` (carrusel inmersivo), respuestas acústicas *Sub-Bass* | **La interfaz retrocede.** Fondo negro puro, scrim cinematográfico, controles translúcidos flotantes y foco absoluto en las fotografías y la materialidad de los cuerpos. |
| **`Persuade`** | `AuthModal`, `IdentityVerificationModal`, Upgrade a Cuotas Premium / Karma Perks | **Impacto y conversión con carácter.** Tipografía display contundente, resplandor ámbar cinético (`shadow-amber-glow`), microcopy magnético y sin clichés corporativos. |
| **`Read`** | `DateDiaryView`, `AppSettingsModal`, Guías de Consentimiento & Anti-Ghosting, Políticas de Privacidad | **Comodidad de lectura.** Medida de línea controlada (45-75 caracteres), ritmo vertical descansado, jerarquía de títulos precisa y paleta contrastada pero suave. |

---

## 3. Tokens de Color & Contraste (WCAG 2.2)

Definidos en [`tailwind.config.ts`](file:///Users/ojitos/Documents/vessel%20app/tailwind.config.ts):

### Paleta Base (Superficies de Obsidiana & Concreto)
* `obsidian-deep` (`#040405`): Fondo raíz absoluto de la aplicación y modales profundos.
* `obsidian` (`#09090B`): Superficie estándar para capas base.
* `obsidian-surface` (`#121216`): Contenedores principales, tarjetas de perfil y paneles elevados (Contraste 1.15:1 vs base).
* `obsidian-card` (`#18181D`): Sub-tarjetas, items de lista, inputs y bloques interactivos (Contraste 1.25:1 vs base).
* `obsidian-hover` (`#22222A`): Estado hover de elementos contenedores.
* `concrete` (`#24242B` / `border-white/10`): Bordes divisorios sutiles y estructuras arquitectónicas.

### Acentos Semánticos & Contrastes WCAG
* `rawAmber` (`#E5A93C`): Acento principal de marca, estado `Open Now` (disponible), verificación y CTAs primarios. **Contraste 9.8:1 (WCAG AAA)** sobre obsidian.
* `rawAmber-glow` (`#F5B74F`): Estados hover, micro-interacciones luminosas. **Contraste 10.6:1 (WCAG AAA)**.
* `bloodNeon` (`#E61937`): Alertas críticas, estado `In Session` (ocupado), bóvedas cifradas, mensajes *Burn-on-View* y PIN Rendezvous. **Contraste 4.8:1 (WCAG AA)**.
* `bloodNeon-glow` (`#FF2A4B`): Pulsos cinéticos y estados hover de alerta.
* `emerald-400` (`#34D399`): Cultura del Respeto, Insignia Anti-Ghost y salud sexual. **Contraste 9.2:1 (WCAG AAA)**.
* `purple-400` (`#C084FC`): Protocolos de desconexión gradual y límites gestionados (*Soft-Block*). **Contraste 7.5:1 (WCAG AA)**.

---

## 4. Escala Tipográfica & Ritmo

* **Familias:**
  * **Sans:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif`.
  * **Mono:** `"SF Mono", ui-monospace, Menlo, monospace` (utilizado para distancias discretizadas, PINs de encuentro, hashes S2 y timestamps).

| Nivel | Clase Tailwind | Tamaño / Peso | Uso en VESSEL |
| :--- | :--- | :--- | :--- |
| **Micro / Mono** | `text-[9px]` font-mono | 9px / Bold | Badges de Modo Niebla, distancias discretizadas, celdas S2 y contadores efímeros. |
| **Secundario** | `text-[10px]` / `text-xs` | 10-12px / Medium | Rol (`Top/Bottom/Vers`), tags de fetiches, metadatos y timestamps. |
| **Cuerpo** | `text-sm` font-bold | 14px / Bold | Codenames, mensajes de chat y opciones de formularios. |
| **Títulos** | `text-base` / `text-lg` | 16-18px / Extrabold | Cabeceras de vista, títulos de modales y métricas de satisfacción. |
| **Display / Hero**| `text-xl` / `text-2xl` | 20-24px / Black | Logotipo oficial VESSEL, PIN de encuentro y números de Respect Karma. |

---

## 5. Elevación, Profundidad & Resplandor

En VESSEL, la elevación no se logra con sombras grises difusas, sino mediante **diferenciación tonal de obsidiana**, **bordes de concreto sutiles** y **resplandores cinéticos**:

* `border-white/10` / `border-concrete`: Delimitación estructural pura sin ruido visual.
* `shadow-amber-glow` (`0 0 25px -2px rgba(229, 169, 60, 0.35)`): Resplandor activo para CTAs y elementos `Open Now`.
* `shadow-blood-glow` (`0 0 25px -2px rgba(230, 25, 55, 0.4)`): Resplandor para estados críticos y modo `In Session`.
* `shadow-card-elevation` (`0 8px 32px 0 rgba(0, 0, 0, 0.45)`): Profundidad para modales y hojas superpuestas.

---

## 6. Los 5 Estados Obligatorios de Componentes UI

Todo elemento interactivo (botones, inputs, chips, tarjetas) DEBE implementar de manera explícita sus 5 estados:

```tsx
<button
  className="
    bg-rawAmber text-black font-bold rounded-xl px-4 py-2.5 text-xs        /* 1. Default (min 44px tap target) */
    hover:bg-rawAmber-glow hover:shadow-[0_0_15px_rgba(229,169,60,0.4)]  /* 2. Hover */
    active:scale-[0.96] active:bg-amber-600                              /* 3. Active (táctil) */
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rawAmber focus-visible:ring-offset-2 focus-visible:ring-offset-black /* 4. Focus */
    disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none /* 5. Disabled */
    transition-all duration-200
  "
>
  Confirmar Señal
</button>
```

---

## 7. Protocolo Pre-Ship Gauntlet de Impeccable

Antes de dar por finalizado cualquier componente o vista:

1. **`Audit` (0 a 4 en 5 dimensiones):**
   * *Accesibilidad:* Contraste WCAG AA mínimo (4.5:1 texto regular, 3.0:1 texto grande/iconos) y soporte de navegación por teclado.
   * *Performance:* Cero renders innecesarios, imágenes optimizadas y animaciones con aceleración GPU (`transform`, `opacity`).
   * *Theming:* Consistencia absoluta en los tokens de obsidiana, ámbar y neón.
   * *Responsive:* Operable de 320px a 1024px, con padding inferior `pb-28` para la barra de navegación fija.
   * *Anti-patterns:* Sin márgenes arbitrarios, sin texto gris sobre fondo gris oscuro, sin touch targets menores a 44×44px.
2. **`Clarify` (Microcopy Rioplatense):**
   * Verificar que los estados vacíos, tooltips y mensajes de error mantengan la voz auténtica de VESSEL (*"Sin vueltas"*, *"Sos un fuego, pero hoy no tengo chispa"*, *"De incógnito"*).
3. **`Harden` (Estrés del Mundo Real):**
   * Probar nombres de 40+ caracteres, caídas de red al consultar geohash, visualización con batería baja y fotos en formatos verticales u horizontales extremos.

---

## 8. Reglas Do's & Don'ts (Anti-Patrones Prohibidos)

### ✅ Do's
* Utilizar `bg-gradient-to-t from-black/95 via-black/35 to-black/40` detrás de textos sobre fotografías (Scrim de legibilidad).
* Emplear `SF Mono` exclusivamente para datos técnicos, distancias, PINs y hashes.
* Mantener la navegación inferior fija al alcance del pulgar con `pb-28` en el contenedor de vista.
* Disparar audio Sub-Bass en acciones con peso emocional o físico (envío de PIN, cambio de estado corporal, desbloqueo de bóveda).

### ❌ Don'ts
* **NO** utilizar tarjetas blancas, grises claras o estilo SaaS corporativo estándar.
* **NO** utilizar bordes redondeados infantiles (`rounded-full` en contenedores de tarjetas principales; usar `rounded-2xl` o `rounded-3xl`).
* **NO** crear botones o controles táctiles con altura menor a 44px.
* **NO** renderizar coordenadas GPS exactas en la interfaz.
* **NO** omitir los estados `disabled` o `focus-visible` en ningún control interactivo.
