quiero que analices en profundidad las herramientas que estamos usando en el proyecto, sdd, engram, ponytail, impeccable, reglas, archivos de contexto, etc. quiero que busques incoherencias, incompatibilidades, mejoras, sugerencias, analiza cual seria el mejor ambiente de herramientas para implementar.

---

analizar como implementar la siguiente caracteristica.
cuando un usuario se registra en la app, lo primero que se le pregunta ademas del nombre de usuario y datos basicos es: como se identifica (gay, lesbiana, hetero, etc) y que busca (gay, lesbiana, hetero, etc). dependiendo de esa configuracion es como será la matrix de personas. 
me gustaria ademas poder configurar la app con algo que la identifique hablando de ux y esquemas de colores o iconos o algo segun si es gay, lesbiana, hetero, etc.

---

Analizar e implementar en la app completa un Sistema unificado de tokens visuales, espaciales, táctiles y cinéticos.

---

quiero que hagas una auditoria y analisis profundo a la vista toques y sus dependencias en la app de los usuarios 
1 - enfocate principalmente en la version mobile
2 - quiero que identifiques dolores tanto de ux como de pasos demasiado largos para completar una tarea.
3 - identifica caracteristicas sin completar y codigo muerto
4 - analiza mejoras y optimizaciones 
5 - asegurate que el contenido de cada componente de cada vista se vea de la mejor manera.
6 - asegurate que los componentes estan hechos con componentes comunes de la biblioteca de compones.
6 - reanaliza cada caracteristica buscando si se necesita rediseñar componentes ux, secciones, etc.
7 - quiero un upgrade del ux pensando en nuestros usuarios.
8 - quiero que toda la app tenga coherencia absoluta y que se simplifiquen los flujos.
9 - asegurate que en español, los términos y palabras usadas en la app sean en español rioplatense y que tengan uso en argentina en 2026 principalmente por usuarios de entre 20 y 35 años de edad.
10 - dame alternativas a lo solicitado para definir que camino tomar

---

todo lo que hagamos de ahora en mas, debe crearse usando los componentes de la bilbioteca de componentes ux. en caso que no exista un componente y se necesite crear, debe pedirse confirmacion.

---

quiero saber si todos los elementos de la vista radar, la ventana flotante de filtrar, la ventana flotante que se abre al presionar la pildora superior del nombre del usuario, las cards de la matrix y la ventana detalle de usuario que se abre al presionar las cards  estan hechos con componentes comunes de la biblioteca de componentes del proyecto.

---

Quiero que marques como importante! Desde ahora en adelante, cada vez que subo la app a git al main, debe forzarse esa version en todos los usuarios cuando entren desde el navegador. tambien debe verse esa nueva version en la app del admin en "version & despliegue"

---

### 1. Desglose de los 8 Componentes

1. [**`ProfileDetailModal.tsx`**](file:///Users/ojitos/Documents/vessel%20app/src/components/profile/ProfileDetailModal.tsx) — **El Dossier Completo del Perfil**:
   Es la ventana modal que se abre cuando tocás una tarjeta en la grilla. Contiene las 3 solapas tácticas (*Perfil*, *Química* y *Confianza*), visor de galería de fotos en alta resolución, telemetría S2, notas de voz, biometría 3D y el dock inferior de acción rápida (*Toque cinético, Coordinar Cita, Chatear o Desbloquear*).

2. [**`ProfileCard.tsx`**](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/ProfileCard.tsx) — **La Tarjeta Táctica de la Matriz**:
   Es la unidad visual que representa a cada usuario dentro de la cuadrícula del Radar. Muestra la foto full-bleed, estado de disponibilidad en tiempo real (*⚡ LISTO YA* con cuenta regresiva), badges de movilidad/hospedaje (*🚗 tiene auto, 🏠 tiene lugar, 🚿 ducha*), morbos mutuos destacados (*✨*), botón de favoritos y el botón primario *[ ⚡ Coordinar ]*.

3. [**`RadarBottomCommandBar.tsx`**](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/RadarBottomCommandBar.tsx) — **La Barra de Comandos y Filtros Flotante (App Shell 2.0)**:
   Es el BottomSheet deslizable ubicado en la parte inferior de la pantalla. En modo reposo expone el buscador rápido y el botón central *[ Filtrar ]*. Al tocarlo, se despliega a pantalla completa (`100dvh`) con los 7 bloques de filtrado táctico (Sintonías, Orden, Logística, Roles, Ritmo, Morbos y Distancia) sin scroll horizontal.

4. [**`ProfileGrid.tsx`**](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/ProfileGrid.tsx) — **La Grilla / Matriz de Personas**:
   Es la vista principal cuando estás buscando personas. Organiza la cuadrícula responsiva (2 a 4 columnas), agrupa por racimos de intención, fija tu tarjeta propia en el puesto #1 (*⭐ VOS*), controla la cuota gratuita de 99 perfiles (insertando la tarjeta promocional de Unlimited) y maneja los estados vacíos.

5. [**`PlacesGrid.tsx`**](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/PlacesGrid.tsx) — **La Grilla de Puntos Tácticos y Cartelera Nocturna (Lugares)**:
   Es la vista que se activa al alternar a "Lugares". Muestra boliches, saunas, darkrooms, bares y zonas de cruising con alertas comunitarias en vivo (redadas o peligro), check-in de presencia (*"Presente ✓"*), cartelera de fiestas nocturnas con RSVP (*"Voy"*) y formularios para proponer o calificar lugares.

6. [**`BrutalistHeader.tsx:L115-L210`**](file:///Users/ojitos/Documents/vessel%20app/src/components/brand/BrutalistHeader.tsx#L115-L210) — **Widget de Disponibilidad Inmediata ("Estoy Listo" / On The Clock)**:
   Es la lógica aislada del botón de presencia inmediata en la cabecera. Muestra el disparador inactivo *[ ⚡ Estoy listo ]* y, al activarse, renderiza el badge `ActiveReadyNowBadge` con un borde animado de degradado cónico en CSS que actúa como reloj visual regresivo segundo a segundo, sin re-renderizar el resto del header.

7. [**`BetaFeedbackFab.tsx:L1-L150`**](file:///Users/ojitos/Documents/vessel%20app/src/components/beta/BetaFeedbackFab.tsx#L1-L150) — **Panel Táctico de Beta Tester Lab**:
   Es la sección de laboratorio para testing integrada en el menú superior derecho. Permite alternar con un toque entre el GPS real del teléfono y la ubicación simulada fija en Saavedra 620 (Río Cuarto), conmutar entre Modo Real (Firestore en la nube) y Modo Mock, y abrir diagnósticos de sensores o reporte de bugs.

8. [**`BrutalistHeader.test.tsx:L1-L100`**](file:///Users/ojitos/Documents/vessel%20app/tests/unit/ui/BrutalistHeader.test.tsx#L1-L100) — **Suite de Pruebas Unitarias de la Cabecera**:
   Configura el entorno de pruebas en Vitest para la cabecera: mockea el motor de audio Sub-Bass, el contexto global (`VesselContext`), y ejecuta los tests que verifican que el logo responda, que los botones cumplan con los 44px táctiles de accesibilidad y que la zona central se mantenga limpia si no hay emergencias.

---

### 🗺️ Vistas y Ventanas Principales de VESSEL (Ordenadas por Flujo de Usuario)

#### 1. Navegación Principal (Los 5 Ejes del App Shell)
1. **Radar / Matriz (`grid`)**: La pantalla de inicio. Alterna entre la cuadrícula de personas ([`ProfileGrid.tsx`](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/ProfileGrid.tsx)) y la de puntos de encuentro ([`PlacesGrid.tsx`](file:///Users/ojitos/Documents/vessel%20app/src/components/matrix/PlacesGrid.tsx)).
2. **Toques / Pulsos (`pulses`)**: Bandeja de entrada sensorial de toques cinéticos recibidos, enviados y coincidencias de *Onda Mutua 🔥*.
3. **Chat Darkroom (`chat`)**: Lista de conversaciones activas y chats efímeros cifrados con autodestrucción, notas de voz y acuerdos pre-flight.
4. **Citas & Vínculos / Agenda (`diary`)**: Diario íntimo con citas programadas, libreta de vínculos de confianza ("chongos"), notas privadas y registro de salud preventiva.
5. **Mi Perfil / Protocolo (`account`)**: Editor integral de tu ficha personal, gestión de álbumes públicos y bóvedas privadas cifradas, y configuración de límites.

#### 2. Ventanas y Modales Tácticos de Interacción
1. **Dossier de Perfil** ([`ProfileDetailModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/profile/ProfileDetailModal.tsx)): Ficha detallada de otro usuario con compatibilidad y acuerdos.
2. **Centro de Filtros Fullscreen** ([`TacticalBottomSheet`](file:///Users/ojitos/Documents/vessel%20app/src/components/ui/design-system/TacticalBottomSheet.tsx)): El panel deslizable inferior para filtrar la matriz.
3. **Chat Darkroom Modal** ([`DarkroomChatModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/chat/DarkroomChatModal.tsx)): La sala de chat activa a pantalla completa con visor de medios efímeros.
4. **Coordinación de Cita / Pre-Flight** ([`RendezvousSheet`](file:///Users/ojitos/Documents/vessel%20app/src/components/chat/RendezvousSheet.tsx)): Hoja para fijar PIN de encuentro, logística y consentimiento mutuo.
5. **Membresía Unlimited** ([`UnlimitedModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/monetization/UnlimitedModal.tsx)): Pantalla de suscripción para levantar el límite de 99 perfiles, activar radar global y chats ilimitados.

#### 3. Suite de Seguridad, Identidad y Noche
1. **Verificación Biométrica 3D** ([`LivenessVerificationModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/auth/LivenessVerificationModal.tsx)): Escaneo facial anti-bots y validación de identidad.
2. **Guardián Silencioso / Safety Beacon** ([`SafetyBeaconModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/safety/SafetyBeaconModal.tsx)): Temporizador de seguridad con PIN de coacción y alerta a contactos de confianza.
3. **Reducción de Daños** ([`HarmReductionModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/safety/HarmReductionModal.tsx)): Monitoreo de sustancias y salud en tiempo real.
4. **Cartelera Nocturna & Clubes** ([`NightlifeEventsModal`](file:///Users/ojitos/Documents/vessel%20app/src/components/nightlife/NightlifeEventsModal.tsx)): Portal de fiestas, baliza óptica en pista y radar after-hours.
5. **Consola de Administración Táctica** ([`/admin`](file:///Users/ojitos/Documents/vessel%20app/src/app/admin/page.tsx)): Panel de control maestro para moderación, gestión de usuarios, versiones PWA y telemetría del sistema.

---

quiero que analices en profundidad las herramientas que estamos usando en el proyecto, sdd, engram, ponytail, impeccable, reglas, archivos de contexto, etc. quiero que busques incoherencias, incompatibilidades, mejoras, sugerencias, analiza cual seria el mejor ambiente de herramientas para implementar.

---

quiero que hagas una auditoria y analisis profundo a la vista mi perfil y sus vistas, ventanas, menues, etc que dependen de ella en la app de los usuarios. 
1 - enfocate principalmente en la version mobile 
2 - quiero que identifiques dolores tanto de ux como de pasos demasiado largos para completar una tarea. 
3 - analiza que cada elemento en cada bloque este ordenado de manera coherente y con un sentido. 
4 - analiza mejoras y optimizaciones 
5 - reanaliza cada caracteristica buscando si se necesita rediseñar componentes ux, secciones, etc. 
6 - quiero un upgrade del ux pensando en nuestros usuarios. 
7 - quiero que toda la app tenga coherencia absoluta. 
8 - asegurate que en español, los términos y palabras usadas en la app sean en español rioplatense y que tengan uso en argentina en 2026 principalmente por usuarios de entre 20 y 35 años de edad. 
9 - dame alternativas con ejemplos de las vistas de lo solicitado para definir que camino tomar

---

1 - quiero que audites la app del usuario completa y me des una lista de que elementos y componentes quedan por fuera de la biblioteca de componentes standard de la app  

2 - quiero que en los elementos principales accionables de cada vista de la app del usuario (botones, iconos, etc) analices que **Microinteracción** (_Micro-interaction_), **Animación de iconos de estado** (_Animated State Icons_ o _Morphing Icons_) podriamos agregar. quiero que la app se vea viva, actual. 
Ejemplo 1: cuando presiono un boton guardar, el color del fondo va cambiando de manera animada
Ejemplo 2: al presionar un boton que tiene un candado abierto, este ce cierra de manera animada cambiando ademas el color.

1 - quiero que analizando en profundidad la app, me des una lista de mejoras y optimizaciones teniendo en cuenta las mejores practicas profesionales en 2026 para el desarrollo profesional de apps web modernas

---

INGENIERIAAAAAAA

Actúa como un Principal Software Architect y Staff Frontend/Fullstack Engineer. 

Realiza una auditoría técnica exhaustiva y multidimensional de este repositorio, evaluando el estado actual del código frente a los estándares de desarrollo web moderno.

### Instrucciones de Análisis:
1. Inspecciona la estructura del proyecto, dependencias clave, configuración del build, arquitectura de componentes, manejo de estado y capas de datos.
2. Identifica cuellos de botella reales, deuda técnica acumulada, antipatrones y oportunidades de optimización medibles.

### Dimensiones a Auditar:
- **Arquitectura y Modularidad:** Separación de responsabilidades, acoplamiento, escalabilidad del directorio, tipado estricto y patrones de diseño.
- **Rendimiento (Core Web Vitals):** Bundle size, code-splitting, estrategias de renderizado, optimización de assets, memoización innecesaria o faltante, y waterfalls en la carga de datos.
- **Seguridad y Resiliencia:** Manejo seguro de variables de entorno, autenticación/autorización, validación de schemas en fronteras (I/O, APIs, formularios), y control centralizado de errores.
- **Mantenibilidad y DX:** Estrategia de testing (unitario/integración/E2E), linters, tipado sin uso de `any`, y reusabilidad de componentes UI.
- **Accesibilidad (a11y) y Semántica Web:** Uso de elementos semánticos, compatibilidad con lectores de pantalla y navegación por teclado.

### Formato de Entrega:
Presenta los hallazgos en un Markdown estructurado con:
1. **Diagnóstico Ejecutivo:** Resumen honesto de 1 párrafo sobre el estado técnico actual de la app.
2. **Matriz de Mejoras Priorizada:** Tabla con:
   - `Área` | `Problema / Oportunidad` | `Impacto (Alto/Medio/Bajo)` | `Esfuerzo (Bajo/Medio/Alto)` | `Prioridad (P0 a P3)`
3. **Top 3 Quick Wins:** Acciones inmediatas de bajo esfuerzo y alto impacto con ejemplos de código comparativo (`Antes` vs `Después`).
4. **Roadmap de Refactorización:** Plan paso a paso recomendado para implementar los cambios sin romper funcionalidades existentes ni introducir regresiones.

*Nota:* No modifiques ningún archivo de código todavía; genera únicamente el reporte técnico y el plan de acción como un artefacto de auditoría para revisión.

---

UXXXXXXXXXXXX

Actúa como un Lead Product Designer y Staff UX/UI Engineer especializado en aplicaciones web modernas y arquitecturas Mobile-First.

Realiza una auditoría exhaustiva y multidimensional de Diseño de Producto (UI/UX) sobre este repositorio, con **prioridad absoluta en la experiencia mobile**, analizando componentes, flujos de usuario, diseño visual, ergonomía táctil y patrones de interacción.

### Instrucciones de Análisis:
1. Inspecciona los componentes visuales, layouts, navegación, microinteracciones, tipografía, paletas de color, espaciados y estados de interfaz en el código.
2. Evalúa la app bajo una mentalidad Mobile-First: usabilidad con una sola mano, gestión de pantallas táctiles y restricciones de navegadores móviles.
3. Identifica fricciones cognitivas, inconsistencias visuales, fallas de accesibilidad y oportunidades de pulido ("craft") que eleven la percepción de calidad del producto.

### Dimensiones a Auditar:

#### 1. Ergonomía Mobile y Patrones Táctiles (Prioridad Alta)
- **Zonas de Alcance con Pulgar (Thumb-Zone):** Disposición de acciones primarias en la parte inferior o zonas de fácil acceso a una sola mano; detección de botones críticos atrapados en esquinas superiores.
- **Hit Targets (Áreas Táctiles):** Cumplimiento del tamaño mínimo de toque (mínimo 44x44px / 48x48px según WCAG) y espaciado suficiente entre elementos interactivos para evitar toques accidentales.
- **Navegación Móvil:** Rendimiento y usabilidad de bottom navigation, side sheets/drawers, swipe gestures y bottom sheets en lugar de modales flotantes centrados.
- **Gestión de Teclado Virtual y Viewports:** Uso de unidades modernas de viewport (`dvh`, `svh`, `lvh` para evitar saltos por la barra del navegador), prevención de zoom indeseado en inputs iOS (font-size >= 16px) y manejo de `safe-area-inset-*` (notch, dynamic island, barra inferior de gestos).
- **Prevención de Bugs Táctiles:** Manejo de delays de click en touch, feedback activo (`:active` / tap highlight) y prevención de problemas con scroll anidado o bloqueo accidental de gestos.

#### 2. Flujos de Usuario y Heurísticas de Usabilidad
- Claridad en la navegación, jerarquía visual, prevención de errores, reducción de carga cognitiva y cumplimiento de las 10 heurísticas de Nielsen en pantallas reducidas.

#### 3. Gestión de Estados de la UI (Edge Cases)
- Tratamiento integral de los 5 estados de interfaz adaptados a conexiones móviles intermitentes: Loading (skeletons optimizados vs spinners invasivos), Empty States (con llamadas a la acción claras), Error States (mensajes procesables y recuperación offline/reconectando), Success/Feedback visual y Disabled.

#### 4. Design System, Tokens y Coherencia Visual
- Consistencia en tokens de diseño (escala tipográfica legible en pantallas chicas, ritmo vertical/espaciados, elevación/sombras suaves, paleta semántica y radio de bordes). Detección de valores arbitrarios o "hardcodeados".

#### 5. Microinteracciones y Sensación de Fluidez (Mobile Craft)
- Transiciones ligeras y naturales a 60/120fps (priorizando transformaciones CSS/GPU sobre layout shifts), soporte nativo de `prefers-reduced-motion` y sensación de respuesta táctil inmediata.

#### 6. Accesibilidad (a11y) Mobile
- Cumplimiento de WCAG 2.2 AA: contraste cromático optimizado para uso en exteriores/luz solar, etiquetas accesibles en botones de solo iconos y navegación accesible por gestos/lectores de pantalla.

### Formato de Entrega:
Presenta los hallazgos en un documento Markdown estructurado con:
1. **Diagnóstico Heurístico Mobile-First:** Resumen ejecutivo de 1 párrafo evaluando el nivel de madurez y fricción de la experiencia en teléfonos.
2. **Matriz de Fricción Mobile & UI/UX:** Tabla comparativa con:
   - `Pantalla / Componente` | `Hallazgo UI/UX o Falla Mobile` | `Severidad (Crítica / Moderada / Menor)` | `Impacto en Conversión/Retención` | `Solución de Diseño Recomendada`
3. **Top 3 "Quick Mobile Wins":** Mejoras inmediatas de alto impacto ergonómico o visual para smartphones con código comparativo (`Antes` vs `Después`).
4. **Roadmap de Adaptación Mobile:** Plan secuencial para pulir la experiencia táctil y de escritorio sin romper la lógica de negocio actual.

*Nota:* No modifiques ningún archivo de código todavía; genera únicamente el reporte de auditoría y las recomendaciones para revisión.

---


1 - quiero que hagas una auditoria  de las caracteristicas y funciones de la app completa del usuario y me des una lista ordenada por importancia para los usuarios de cada una, cuales serian las mas usadas, las que suman valor, las que restan y las que podriamos eliminar porque no son interesantes para hacer la app mas simple.

1 - repensar fuera de como funcionan otras apps, como deberia ser la app

---

### **1. Context Hell y Cascada de Re-renders (`useVessel`)**

- **El problema:** Tenés 7 providers (`ChatContext`, `RadarMatrixContext`, etc.) que suman más de 7.600 líneas de lógica en estado de React. Pero `VesselFacadeBridge` junta todo en un único objeto plano y **77 componentes consumen `useVessel()` directamente**.
- **Por qué está mal:** Los Contexts de React fueron diseñados para inyección de dependencias de baja frecuencia (temas, usuario autenticado), **no como bus de eventos de alta frecuencia**. Cada vez que entra un mensaje de chat o se actualiza un tick del GPS, la referencia del objeto muta y dispara renders en cascada por todo el árbol. Ni siquiera `React.memo` en `ProfileCard` te salva, porque el hook interno invalida el memo.
- **Hacia dónde ir:** Separar el estado de alta volatilidad usando micro-stores atómicas con selectores granulares (`useSyncExternalStore`, Zustand o Signals) o consumir exclusivamente hooks atómicos por dominio y por ID.

### **2. Next.js 16 desaprovechado: SPA artificial vs. Web Platform**

- **El problema:** Toda la navegación entre vistas (`grid`, `pulses`, `chat`, `diary`, `account`) vive atrapada en un `useState(activeView)` dentro de `src/app/page.tsx`.
- **Por qué está mal:** Estamos pagando el costo de Next.js pero operando como una SPA de 2018. Se pierde el deep-linking nativo por URL, el historial del navegador (el botón "Atrás" en mobile se vuelve impredecible) y la integración con las **View Transitions nativas** del navegador.
- **Hacia dónde ir:** Mapear las vistas a rutas reales del App Router (`/radar`, `/pulses`, `/chat`, `/diary`, `/perfil`) con layouts compartidos, aprovechando transiciones fluidas de plataforma en lugar de orquestar el DOM manualmente.

### **3. Competencia en el Hilo Principal (Main Thread) y Assets Crudos**

- **El problema:** Las tarjetas del radar usan `<Image unoptimized>`, cargando fotos remotas sin compresión moderna al vuelo (WebP/AVIF adaptativo). Además, sincronizaciones pesadas operan sobre `localStorage` (síncrono y bloqueante) mientras el motor de audio (`SubBassAudioEngine`) y los cálculos de radar compiten por el mismo event loop.
- **Por qué está mal:** En dispositivos móviles reales (gama media, datos móviles, batería baja), el Main Thread se satura, sube la métrica INP (Interaction to Next Paint) y se degrada la respuesta háptica y acústica.
- **Hacia dónde ir:** Activar optimización real de imágenes con CDN/Next Image, delegar I/O pesada a IndexedDB o Web Workers, y proteger la prioridad de la UI y del audio.
---

Analizar el hero de las membresias en la matrix y donde se necesite

---

UN PARA UNA PANTALLA


Actúa como un Lead Product Designer y Staff UX/UI Engineer especializado en arquitecturas web Mobile-First y diseño de interacción de alta fidelidad.

Realiza una auditoría exhaustiva, profunda y focalizada de UI, UX y ergonomía táctil exclusivamente sobre el siguiente módulo y todo su árbol de ejecución:

> **PANTALLA OBJETIVO:** [Nombre o ruta del archivo/componente principal, ej: `src/views/Checkout.tsx` o `/dashboard/billing`]

### Alcance Estricto del Análisis:
No limites la revisión al componente raíz. Rastrea e inspecciona exhaustivamente todas sus dependencias directas e indirectas:
- **Subvistas y Páginas Hijas:** Subrutas anidadas, tabs y pasos de flujo (wizards/steppers).
- **Capas Superpuestas (Overlays):** Modales, bottom sheets, drawers, side-panels, popovers, tooltips y dialogs de confirmación.
- **Navegación Contextual:** Headers locales, tabs de navegación interna, menús contextuales, selectores desplegables y bottom navigation contextual.
- **Microcomponentes Asociados:** Formularios específicos, cards, botones de acción primaria/flotante (FAB), inputs especializados y badges.

### Dimensiones a Auditar (Mobile-First):

#### 1. Ergonomía Táctil y Patrones Mobile en este Flujo
- **Thumb Zone:** Accesibilidad con una sola mano de las acciones principales de la pantalla y de sus modales/drawers (evitar CTAs críticos en el borde superior).
- **Hit Targets:** Áreas de toque mínimas (44x44px / 48x48px) en íconos, botones de cierre `(X)`, tabs y checkboxes/radios.
- **Bottom Sheets vs Modales Centrados:** Uso de hojas inferiores arrastrables (swipe-to-dismiss) en lugar de modales centrados rígidos que se cortan en pantallas chicas.
- **Teclado Virtual y Viewports:** Comportamiento de formularios al desplegarse el teclado móvil (uso de `dvh`, scroll automático al input activo, inputs >= 16px para evitar auto-zoom en iOS).
- **Safe Areas:** Respeto a `safe-area-inset-*` en elementos fijos (headers pegajosos, footers, barras de acciones flotantes).

#### 2. Continuidad del Flujo y Reducción de Fricción
- Coherencia en la transición entre la pantalla padre, sus hijos y los modales (gestión del botón "Atrás" del navegador/sistema para cerrar overlays sin abandonar la vista).
- Prevención de desorientación contextual (que el usuario no pierda el estado o los datos ingresados al abrir/cerrar un menú o modal).

#### 3. Los 5 Estados de la UI en esta Pantalla
- Tratamiento en cada componente de la pantalla de: **Loading** (skeletons contextuales), **Empty States** (con CTA directo), **Error States** (feedback procesable en el lugar del fallo), **Success** (toasts, microcopia clara) y **Disabled**.

#### 4. Design System y Coherencia Visual Local
- Consistencia con los tokens globales: espaciados, tipografía, paleta de colores semántica y radios de borde en todos los subcomponentes del flujo. Detección de estilos "ad-hoc" o hardcodeados.

#### 5. Accesibilidad (a11y) Mobile
- Trampas de foco (`focus trapping`) correctas al abrir modales/drawers, soporte de teclado, contraste en pantalla bajo luz natural y accesibilidad de botones con solo íconos.

### Formato de Entrega:
Presenta los hallazgos en un documento Markdown estructurado con:
1. **Mapeo del Módulo:** Lista breve del árbol de archivos/componentes detectados y analizados dentro de este flujo.
2. **Diagnóstico Ejecutivo del Flujo:** Párrafo evaluando la fluidez y fricción general de la pantalla en dispositivos móviles.
3. **Matriz Detallada de Fricción y Mejoras:**
   - `Componente / Overlay` | `Problema UI/UX o Falla Mobile` | `Severidad (Crítica / Moderada / Menor)` | `Impacto en la Tarea del Usuario` | `Solución de Diseño Recomendada`
4. **Top 3 "Quick Mobile Wins":** Los 3 cambios más urgentes en esta vista con ejemplos de código comparativo (`Antes` vs `Después`).
5. **Plan de Acción Refactor:** Secuencia ordenada para aplicar las mejoras sin alterar la lógica de negocio ni romper el estado de la vista.

*Nota:* No modifiques ningún archivo de código todavía; genera únicamente el reporte técnico de auditoría para revisión.

---

Actúa como un Lead Product Strategist, Principal UX Architect y Visionary Product Designer especializado en aplicaciones comunitarias de alto engagement, descubrimiento social y dinámicas relacionales contemporáneas.

Quiero repensar este producto completamente desde **primeros principios**, libre de convenciones heredadas, sin prejuicios morales y sin limitarnos a clonar interfaces tradicionales de citas de la última década (como la cuadrícula estática de perfiles, el swipe superficial o el chat plano y transaccional).

Asume que diseñamos la experiencia definitiva para la comunidad gay hoy: una plataforma móvil viva, adictiva por su valor intrínseco, fluida y que comprende a fondo tanto la inmediatez de los encuentros íntimos como la necesidad de validación, pertenencia, descubrimiento cultural, seguridad física/emocional y discreción contextual.

### Directivas de Pensamiento y Filosofía de Producto:
1. **Rompe el paradigma del catálogo de fotos:** El ser humano no es un ítem de e-commerce. Explora cómo representar la vibra, la química, la energía del momento y la disponibilidad real en tiempo y espacio sin caer en el aburrimiento del scroll infinito.
2. **Abraza la realidad de los encuentros íntimos sin tabúes:** Reconoce que la química sexual, los fetiches, la inmediatez ("right now"), el consentimiento explícito, la salud sexual y los códigos culturales propios de la comunidad requieren herramientas nativas sofisticadas, directas, elegantes y libres de fricción o juicio.
3. **Dualidad Efímero vs Permanente:** Resuelve la tensión natural entre la búsqueda de privacidad/anonimato rápido y el deseo de construir identidad, reputación comunitaria, amistad o vínculos a largo plazo.
4. **Diseña para la retención orgánica (High Engagement):** ¿Por qué un usuario abriría la app si no busca sexo o una cita en los próximos 15 minutos? Integra capas de microcontenido, audio, cultura nocturna, mapas vivos, eventos espontáneos o dinámicas en tiempo real que conviertan la app en un punto de encuentro diario.

---

### Módulos de Ideación Creativa a Entregar:

#### 1. Concepto Nuclear & Metáfora de Interfaz
- Define la metáfora central de navegación (ej. un mapa háptico/térmico en tiempo real, un canvas dinámico de estados de ánimo, un feed efímero sensorial, etc.).
- ¿Cómo se reemplaza la típica grilla/swipe por una interacción nativa mobile moderna y fluida?

#### 2. Mecánicas de Encuentro Íntimo e Inmediatez ("The Hookup Layer")
- **Intención Explícita y En Tiempo Real:** Flujos para expresar disponibilidad, deseos específicos, kinks y roles sin rodeos ni ambigüedades.
- **Protocolos de Seguridad y Discreción Contextual:** Modos de privacidad según el entorno del usuario (trabajo, calle, casa), control de visibilidad granular y prevención de capturas o filtraciones con diseño inteligente.
- **Salud y Cuidado Colectivo:** Integración no intrusiva de recordatorios, estatus de salud sexual, testeo y reducción de daños con tono cómplice y empático.

#### 3. El Motor de Engagement Continuo ("The Community & Culture Layer")
- Diseña 3 mecánicas originales para que el usuario quiera entrar a la app recurrentemente aunque no esté buscando un encuentro en ese instante:
  - Micro-interacciones o contenidos efímeros comunitarios.
  - Dinámicas de pulso local (vida nocturna, planes espontáneos, puntos calientes de la ciudad).
  - Micro-juegos sociales o disparadores de conversación que rompan el hielo ("ghosting prevention").

#### 4. Arquitectura de UI, Gestos y Experiencia Sensorial
- Propuestas de microinteracciones hápticas, transiciones a pantalla completa, controles de una mano (thumb-reach) y feedback audiovisual/táctil que hagan que usar la app se sienta magnético, premium y vivo.
- Uso de componentes no convencionales: bottom sheets colapsables, vistas inmersivas de audio/video efímero, widgets de estado rápido.

#### 5. User Journey de Punta a Punta
- Modela el flujo completo de un usuario tipo en un escenario real de viernes a la noche:
  - Desde que abre la app buscando qué pasa en la ciudad hasta el acuerdo seguro y sin fricción de un encuentro, pasando por la salida limpia y segura del flujo.

---

### Formato de Entrega:
Genera un documento estratégico de alto impacto en Markdown estructurado en:
1. **Manifiesto de Producto:** La tesis central que diferencia a esta app de cualquier herramienta existente en 2026.
2. **Top 5 Features Innovadoras:** Nombre creativo, problema cultural/psicológico que resuelve, mecánica de uso y por qué engancha al usuario.
3. **Flujos Clave & Wireframes Conceptuales (en texto/diagramas de flujo):** Detalle de interacción paso a paso para el descubrimiento y el match íntimo.
4. **Métricas de Retención Clave:** Cómo validaremos que los usuarios regresan a la app por disfrute y comunidad, más allá de la necesidad transaccional.

*Nota:* No generes código de implementación aún. Este es un documento fundacional de arquitectura de producto, visión creativa y diseño de interacción para alinear la dirección del proyecto.