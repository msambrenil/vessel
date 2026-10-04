# Exploration: Rediseño de Flujos Centrado en el Usuario (De-Grindrización de VESSEL)

## 1. Intent & Planteo del Problema

VESSEL cuenta con un stack de excelencia tecnológica: arquitectura SPA en Next.js 16 / React 19, audio analógico sub-bass (45-80Hz), discretización geoespacial Google S2 / Geohash 7, y seguridad Local-First con cifrado en cliente.

Sin embargo, el **modelo mental y los flujos de interacción actuales siguen atrapados en el paradigma de Grindr (2009)**:
1. **La tiranía de la grilla de proximidad euclidiana**: La vista principal (`ProfileGrid`) es una pared de fotos de torsos/rostros ordenados por distancia geométrica ("a 150m", "a 800m"). Esto induce a un comportamiento de cosificación, dopamine-scrolling infinito y baja tasa de conversión real.
2. **Las joyas de valor están sepultadas en modales**: Lo que hace a VESSEL superior —el acuerdo en 3 taps (`PreFlightChecklist`), la Ficha de Hospedaje (`HostCard`), el Guardián Silencioso (`SafetyBeacon`), el Botiquín profiláctico (`DoxyPepTrackerCard`), el Diario Íntimo (`DateDiaryView`) y los estados corporales (`StatusToggle`)— vive oculto detrás de menús secundarios o modales emergentes.
3. **Falta de adecuación al contexto de nuestros 20 arquetipos de usuario**:
   - **Facundo (Pibe Fit de Lanús)**: No puede recibir en casa familiar; necesita saber de inmediato quién pone el lugar y si es cómodo antes de tomarse el tren Roca a Capital.
   - **Ignacio (Corporativo / Discreción Extrema)**: No puede tener su foto flotando en una grilla pública; necesita entrar en modo señuelo (`CalculatorCoverScreen`), acordar dinámicas a ciegas con Pre-Flight y que no quede historial.
   - **Nicolás (Médico / Salud Preventiva)**: Valora el cuidado sexual explícito; la app debe naturalizar la profilaxis (PrEP / Doxy-PEP) sin estigmas en la superficie de conexión.
   - **Santi (Raver Queer) y Maxi (Bartender)**: Buscan sintonía nocturna, after-hours y eventos (`NightlifeEventsModal`, `Hotspots`), no una grilla estática de gente durmiendo a 200m.

---

## 2. Auditoría Heurística & Detección de Anti-Patrones (Skills: `ux-audit` + `anti-ui-slop`)

| Anti-Patrón Detectado en VESSEL | Impacto Psicológico / Fricción | Principio Violado | Solución en el Nuevo Flujo |
| :--- | :--- | :--- | :--- |
| **Góndola de Cuerpos (Meat Market Grid)** | El usuario scrollea fotos como un catálogo deshumanizado, generando fatiga de decisión y ansiedad. | Ley de Hick & Miller (Sobrecarga de opciones homogéneas). | Reemplazar la grilla estática por **Hub de Sintonías e Intenciones** (Agrupamiento por objetivo: *Encuentro Ya con Host*, *Plan Nocturno*, *Kink & Química*, *Sigilo*). |
| **Chat en Blanco ("Hola qué hacés")** | Los chats inician sin contexto ni propósito; 85% mueren en la línea 2 o terminan en ghosteo pasivo. | Reducción de Fricción Cognitiva (Impeccable Operate). | **Conexión Action-First**: El chat se desbloquea únicamente al enviar o responder un **Pulso de Sintonía con Pre-Flight Check** adjunto (Doble Consentimiento). |
| **Logística tardía ("¿Tenés lugar?")** | Tras 20 minutos de charla trivial, se descubre que ninguno de los dos puede recibir o hay incompatibilidad insalvable. | Ley de Fitts & Progressive Disclosure. | **Ficha de Hospedaje (Host Card) en primer plano**: Saber quién recibe, zona aproximada, comodidades y barreras antes de cruzar la primera palabra. |
| **Salud y Seguridad como reflexiones posteriores** | El Guardián Silencioso y el botiquín Doxy-PEP están en pestañas secundarias que el usuario olvida activar. | Prevención de Errores & Arquitectura del Cuidado. | **Flujo del Encuentro de Punta a Punta**: Al acordar cita, la app activa automáticamente el Modo En Camino, el Guardián Silencioso con timer regresivo y programa el recordatorio de Doxy-PEP a las 24hs. |

---

## 3. Opciones de Arquitectura de Flujo Evaluadas

### Opción A: "Parche Cosmético" (Agregar Badges y Filtros a la Grilla Actual)
- **Enfoque**: Mantener `ProfileGrid` idéntica y solo añadir más etiquetas visuales sobre las fotos existentes.
- **Pros**: Mínimo esfuerzo de código.
- **Contras**: **No resuelve la causa raíz**. Sigue siendo un clon de Grindr con más ruido visual encima de las fotos (Anti-UI Slop). No cambia el modelo mental ni educa al usuario en la Cultura del Respeto.
- **Veredicto**: DESCARTADA.

### Opción B: "Hub de Sintonías & Suite de Encuentro Intencional" (RECOMENDADA)
- **Enfoque**:
  1. **Rediseño de la Pantalla Principal (El Radar de Sintonías)**:
     - Header con selector de sintonía activa:
       - ⚡ **"Encuentro Ahora"**: Personas activas con lugar o listas para recibir/ir en los próximos 60-90 min, con ficha de hospedaje y roles claros.
       - 🍸 **"Radar Nocturno / Afters / Hotspots"**: Integración directa con los eventos, saunas, fiestas y lugares tácticos de la noche.
       - ⛓️ **"Sintonía Kink & Química"**: Coincidencias de fetiches, intensidad y dinámicas específicas.
       - 🛡️ **"Modo Sigilo / Cero Rastro"**: Intercambio de llaves privadas y privacidad facial forzada para perfiles reservados.
  2. **Tarjeta de Sintonía (La Tríada de Compatibilidad)**:
     En vez de una foto recortada con metros, la tarjeta expone:
     - Disponibilidad espacial (*Tiene lugar / Puede viajar / En tránsito*).
     - Compatibilidad sexual/dinámica (*Rol + Kinks coincidentes + Pre-Flight Check*).
     - Nivel de Karma y Respeto (*Anti-Ghost Score verificado*).
  3. **Flujo de Conexión "Action-First"**:
     El botón principal de contacto es *"Enviar Pulso de Sintonía"*. Al tocarlo, se propone el Pre-Flight en 3 taps. Cuando el otro acepta, se abre el Darkroom Chat con la cita pre-coordinada.
  4. **Ciclo de Cuidado Completo (En-Route ➔ Guardian ➔ Diary/Doxy)**:
     El encuentro es un proceso guiado, garantizando seguridad física y salud preventiva.
- **Pros**: Diferenciación radical frente a Grindr; resuelve los dolores de los 20 arquetipos; maximiza la retención y la suscripción `VESSEL UNLIMITED`.
- **Contras**: Requiere un refactor estructurado de la vista central y componentes satélite, coordinado mediante SDD.
- **Veredicto**: ADOPTADA.

---

## 4. Componentes y Módulos Afectados

1. `src/components/matrix/ProfileGrid.tsx` & `ProfileCard.tsx` ➔ Evolución a `IntentHubView.tsx` y `IntentCard.tsx`.
2. `src/components/matrix/StatusToggle.tsx` ➔ Reemplazo por selector de Intención Operativa (Encuentro Ya, Noche/Fiesta, Kink, Sigilo).
3. `src/components/chat/DarkroomChatModal.tsx` & `DarkroomListView.tsx` ➔ Integración nativa de propuesta de Pre-Flight como condición de inicio.
4. `src/components/modals/PreFlightChecklistModal.tsx` & `HostCardModal.tsx` ➔ Promoción de componentes de modal secundario a bloques de interacción primaria.
5. `src/components/navigation/BrutalistNav.tsx` ➔ Jerarquía limpia de 4 accesos: **Radar (Sintonías), Pulsos (Acuerdos), Mensajes (Darkroom), Mi Diario & Salud (Safety & Care)**.
6. `src/types/vessel.ts` ➔ Extensión estricta del modelo de intenciones y estados sin regresiones de tipos.

---

## 5. Riesgos y Mitigaciones Técnicas

- **Riesgo 1: Sobrecarga en móviles de gama media (arquetipos como Facundo con Android 4G)**.
  - *Mitigación*: Mantener renderizado virtualizado, code-splitting con `next/dynamic` y cero librerías pesadas externas (criterio Ponytail).
- **Riesgo 2: Fricción excesiva si el usuario solo quiere mirar fotos**.
  - *Mitigación*: Permitir un modo de "Exploración Rápida" dentro del Hub, pero con la Ficha de Hospedaje y Pre-Flight siempre accesibles a 1 tap.
- **Riesgo 3: Romper los 194 tests unitarios existentes**.
  - *Mitigación*: Cada fase del plan SDD ejecutará `npm run test` y `npm run typecheck` antes de considerarse completa.
