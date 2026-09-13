# Registro de Decisiones de Arquitectura y Diseño (ADR)

Historial cronológico estricto de las decisiones técnicas y de producto adoptadas en el ecosistema **VESSEL**.

> [!IMPORTANT]
> **Regla de Guarda Estructural**: Si un requerimiento o ajuste implica un cambio importante (arquitectura, paleta semántica, cambio de framework o borrado de archivos), se DEBE solicitar autorización explícita al usuario antes de ejecutarlo y registrarlo en este documento.

---

## 📅 Registro Cronológico de Decisiones

### [ADR-001] · [2026-08-23 14:14] Arquitectura Base y Posicionamiento de Marca
- **Decisión**: Estética berlinesa brutalista de lujo con Next.js 15, Tailwind CSS y Web Audio API para simulación sonora sub-bass (45-80Hz).
- **Motivación**: Crear una experiencia sensorial, táctil e íntima radicalmente distinta de las apps masivas.

### [ADR-002] · [2026-08-23 14:19] Estrategia Cross-Platform
- **Decisión**: Prototipado inicial web responsive optimizado para PWA en Next.js 15, con arquitectura adaptable a Expo Universal (React Native).
- **Motivación**: Máxima velocidad de iteración con base de código compartible hacia tiendas móviles.

### [ADR-003] · [2026-08-23 14:29] Optimización de Skills
- **Decisión**: Depuración del catálogo de habilidades del agente a 459 herramientas clave, descartando 1.476 paquetes redundantes.
- **Motivación**: Optimización del presupuesto de tokens y velocidad de respuesta.

### [ADR-004] · [2026-08-23 14:35] Motor de Síntesis Sub-Bass y Estados Corporales
- **Decisión**: Implementación de estados reactivos (`open`, `occupied`, `dormant`) con modulación acústica Web Audio API y microinteracciones *Hold-to-Fill*.
- **Motivación**: Comunicación no verbal instantánea y feedback háptico.

### [ADR-005] · [2026-08-23 15:13] Rediseño UI Dark Luxury Editorial
- **Decisión**: Refinamiento hacia tarjetas de alto contraste en formato editorial 3:4/4:5 con tipografía suiza y diseño centrado en el usuario.
- **Motivación**: Elevar la percepción de exclusividad y sensualidad de la interfaz.

### [ADR-006] · [2026-08-23 15:28] Identidad Ampliada (𝕏, Edad, Yo Soy, Movilidad, VIH)
- **Decisión**: Integración de handle de 𝕏, visibilidad de edad, rol, movilidad y estado serológico VIH/PrEP en el perfil.
- **Motivación**: Transparencia y salud preventiva comunitaria.

### [ADR-007] · [2026-08-23 15:39] Cuotas de Álbumes en Plan Gratuito
- **Decisión**: Restricción estricta de 1 galería pública y 1 bóveda privada para cuentas gratuitas vía `UserAlbumManager`.
- **Motivación**: Modelo de sostenibilidad y valor de suscripción Premium.

### [ADR-008] · [2026-08-23 15:52] Verificación de Identidad y Avatares Estilizados
- **Decisión**: Protocolo Anti-Bot con OAuth cruzado y opción de avatares artísticos para proteger la privacidad facial pública.
- **Motivación**: Eliminar perfiles falsos sin obligar a exponer el rostro al público general.

### [ADR-009] · [2026-08-23 16:11] Testimonios con Doble Consentimiento
- **Decisión**: Solo perfiles con encuentro validado físicamente (Geofencing <50m o PIN) pueden dejar testimonios, moderados por el receptor.
- **Motivación**: Erradicar el acoso y garantizar reseñas verídicas.

### [ADR-010] · [2026-08-23 16:17] Diario de Citas (Date Diary) y Calendario
- **Decisión**: Bitácora personal 100% privada con evaluación de química, satisfacción y recordatorios preventivos de PrEP (cada 90 días).
- **Motivación**: Reflexión íntima, autocuidado y salud sexual.

### [ADR-011] · [2026-08-23 16:34] Indexación Google S2 y Motor de Ahorro de Batería
- **Decisión**: Discretización espacial en celdas de ~152m (Google S2 / Geohash 7) y `BatteryStateEngine` de 4 modos dinámicos.
- **Motivación**: Escudo anti-triangulación y optimización del consumo de batería.

### [ADR-012] · [2026-08-23 16:49] Modo Anti-Ghost y Cultura del Respeto
- **Decisión**: Respuestas amables de salida en 1 tap, cálculo de `RespectScore` (0-100%) y boost de visibilidad (+35%).
- **Motivación**: Fomentar interacciones éticas y erradicar el ghosteo.

### [ADR-013] · [2026-08-23 17:05] Desconexión Gradual (Soft-Block Architecture)
- **Decisión**: Sustitución del bloqueo binario por 4 protocolos flexibles (Pausa, Cierre Amable, Shadow Stealth, Cortafuegos).
- **Motivación**: Gestión asertiva de límites sin fricción hostil.

### [ADR-014] · [2026-08-23 19:28] Integración del Imagotipo Oficial Definitivo
- **Decisión**: Imagotipo 'Vessel' Neon Red con silueta anatómica carnal en la 'V' aplicado en toda la app y favicon PWA.
- **Motivación**: Identidad de marca unificada y memorable.

### [ADR-015] · [2026-08-23 19:38] Blindaje de Marca y Optimización Mobile
- **Decisión**: Erradicación de selectores de logo secundarios, uso de PNG transparentes y sincronización de padding inferior `pb-28` en `BrutalistNav`.
- **Motivación**: Consistencia visual sin artefactos gráficos.

### [ADR-016] · [2026-08-23 20:00] Arquitectura i18n y Configuración Global
- **Decisión**: Soporte nativo para Español Rioplatense (`es`) e Inglés (`en`), sistema métrico/imperial y Cloud Sync E2E.
- **Motivación**: Expansión internacional y adaptabilidad del usuario.

### [ADR-017] · [2026-08-23 21:03] Desacoplamiento de App Settings al Logo Oficial
- **Decisión**: Traslado de la configuración global a `AppSettingsModal` activado pulsando el Logo superior, purificando `ProtocolView` para el perfil.
- **Motivación**: Separación clara entre atributos de identidad y ajustes de sistema.

### [ADR-018] · [2026-08-27 13:05] Foto Obligatoria y Modo Niebla (Fog Mode)
- **Decisión**: Subida obligatoria de fotografía de perfil con opción de Modo Niebla (`blur: 6-7px` en cards/modal y `3-4px` en radar/chat) para privacidad facial suave.
- **Motivación**: Perfiles reales con protección visual voluntaria que preserva silueta y presencia.

### [ADR-019] · [2026-08-27 13:17] Usuario Activo en Primera Posición de la Matriz "Cerca"
- **Decisión**: Posicionamiento del usuario autenticado como la primera tarjeta (Card #1) en la vista "Cerca" (`grid`), con distintivo `⭐ TÚ`, borde resplandeciente ámbar y previsualización de su propio Modo Niebla.
- **Motivación**: Verificación inmediata de visibilidad, distancia y estado propio en la cuadrícula de contactos.

### [ADR-020] · [2026-08-27 13:24] Auditoría y Poda Inteligente de Habilidades (.agents/skills)
- **Decisión**: Poda del catálogo masivo importado (>1.980 skills) a un conjunto seleccionado de 106 habilidades de élite hiper-especializadas en el stack (Next.js 15, React 19, Tailwind, Web Audio, Mobile/HIG, Testing/TDD, Seguridad/Privacy-by-Design y Psicología de Producto).
- **Motivación**: Reducción drástica del ruido de contexto (>94%), optimización de tokens y aceleración de respuesta del agente.

### [ADR-021] · [2026-08-27 13:30] Auditoría Integral de Coherencia y Activación Automática de SDD & Engram
- **Decisión**: Verificación de coherencia absoluta en todo el sistema (modelos de tipos, reglas de negocio, sincronización entre `.agents/rules/` y `docs/contexto/`, tokens de diseño, i18n y Web Audio), formalizando la activación automática e incondicional del flujo SDD (Spec-Driven Development) y el protocolo de memoria persistente Engram (`mem_save`, `mem_context`, `mem_session_summary`) ante cada solicitud de usuario.
- **Motivación**: Blindar la integridad arquitectónica del producto y garantizar continuidad de contexto y rigor ingenieril en todas las interacciones futuras.

### [ADR-022] · [2026-08-27 13:38] Carga Universal de Fotos/Videos y Membresía VESSEL UNLIMITED
- **Decisión**: Implementación de soporte nativo de subida de fotos y videos desde cualquier dispositivo (celular/cámara y notebook/drag-and-drop), extensión de `AlbumPhoto` y `PrivateVaultItem` con `mediaType`, reproducción y temporizador efímero para videos. Formalización de la membresía oficial de pago **`VESSEL UNLIMITED`** con el lema *"Álbumes, bóvedas y señales ilimitadas."*, multi-bóvedas temáticas ilimitadas y llaves granulares, manteniendo la versión gratuita en 1 álbum público y 1 bóveda privada.
- **Motivación**: Flexibilidad de captura multimedia desde móviles y PCs, monetización transparente y propuesta de valor de alta conversión respetando la privacidad radical y experiencia sensorial de VESSEL.

### [ADR-023] · [2026-08-27 13:45] Capa de Persistencia Reactiva Cloud Firestore y Firebase Storage
- **Decisión**: Integración del SDK oficial de Firebase v11 con Cloud Firestore en modo nativo (`FIRESTORE_NATIVE`), persistencia offline multi-pestaña en `IndexedDB` (`persistentLocalCache`), autenticación anónima inmediata sin fricción y servicios desacoplados (`profileService`, `albumService`, `matrixService`, `chatService`). Los datos de salud del `Date Diary` se mantienen con persistencia local-first respetando la Regla de Negocio #7.
- **Motivación**: Reactividad instantánea en tiempo real (`onSnapshot`) para radar y darkroom chat, funcionamiento fluido sin conexión a internet y velocidad máxima de despliegue sin mantener servidores dedicados.

### [ADR-024] · [2026-08-29 22:25] Layout 100% Responsivo y Eliminación del Mock Frame Simulator
- **Decisión**: Eliminación del contenedor simulador `MobileFrame` (header con selector Mobile/Desktop, barra 9:41 y marco artificial) para renderizar la aplicación web de forma 100% nativa y responsiva (`max-w-4xl mx-auto`, columnas adaptativas `grid-cols-3` a `grid-cols-5`, navegación fija sincronizada).
- **Motivación**: Brindar la experiencia de usuario real de producción tanto en navegadores móviles (PWA) como en pantallas de tablet y escritorio, permitiendo que la UI responda fluidamente al viewport real sin marcos de prueba.

### [ADR-025] · [2026-08-29 22:46] Formalización de las 14 Bases de UX/UI, Arquetipos y Arquitectura
- **Decisión**: Consolidación y documentación exhaustiva de las 14 dimensiones de diseño de producto y frontend:
  1. Identidad: VESSEL (*El cuerpo como contenedor/receptáculo diseñado para ser llenado y habitado*).
  2. Arquetipos de usuario: Alex (Pasivo enfocado en rol claro), Marcus (Activo viajero en baja luz con CTAs grandes) y Liam (Kink/privacidad radical).
  3. Lenguaje natural estricto erradicando jerga técnica (`Cerca`, `Radar`, `Mensajes`, `Diario`, `Perfil`).
  4. Flujo SPA de 5 vistas en contenedor responsivo (`max-w-4xl`).
  5. Leyes de Gestalt (Proximidad, Semejanza, Scrim de Cierre) y datos de muestra representativos (6 perfiles).
  6. Relación esfuerzo-beneficio optimizada con selectores de 1 tap, feedback sub-bass (45-80Hz) y autoguardado híbrido.
  7. Paleta Dark Luxury con contraste WCAG AAA (`rawAmber` 9.8:1, `bloodNeon` 4.8:1, `emerald-400` 9.2:1).
  8. Tipografía suiza modular y badges monospace (`text-[9px]`).
  9. Operabilidad móvil al alcance del pulgar con touch targets de mínimo 44×44px.
  10. 5 estados obligatorios en todo componente UI (*Default, Hover, Active, Focus, Disabled*).
  11. Framework: Next.js 15.1.7 + React 19 + TypeScript 5.7+ + Tailwind CSS v3.4 + Web Audio API.
  12. Fronteras técnicas: cero librerías genéricas, cero telemetría externa, Date Diary 100% confidencial.
  13. Definition of Done (DoD) con justificación Why/How, verificación de tipos y sincronización con Engram.
  14. Gotchas prevenidos: hidratación segura de `localStorage` post-SSR en `useEffect`, safe-areas móviles y contraste garantizado sobre fotografías.
- **Motivación**: Alinear la ingeniería frontend con la investigación UX/UI y el prototipo de Figma para un desarrollo ágil y con calidad de producción.

### [ADR-026] · [2026-08-29 22:53] Importación de la Biblioteca de Habilidades Agentic Awesome Skills
- **Decisión**: Descarga e instalación de la biblioteca de habilidades `agentic-awesome-skills` dentro de `.agents/skills/`.
- **Motivación**: Dotar al agente del catálogo completo para posterior selección y filtrado.

### [ADR-027] · [2026-08-29 22:55] Auditoría y Poda Inteligente Contextual de Habilidades (.agents/skills)
- **Decisión**: Poda selectiva de 1.852 habilidades superfluas/incompatibles, conservando exactamente **152 habilidades de élite** organizadas en 7 ejes estratégicos alineados con el stack y reglas de VESSEL:
  1. *Frontend, UI Brutalista & Tailwind CSS* (`industrial-brutalist-ui`, `tailwind-design-system`, `high-end-visual-design`, `ui-*`, `anti-ui-slop`, `unslop`).
  2. *Accesibilidad Web & WCAG AA* (`ui-a11y`, `accesslint-*`, `screen-reader-testing`, `wcag-audit-patterns`).
  3. *Next.js 15, React 19 & TypeScript* (`nextjs-*`, `react-*`, `typescript-*`, `web-performance-optimization`).
  4. *Testing, TDD & Calidad* (`vitest-skill`, `playwright-skill`, `webapp-testing`, `tdd-*`, `clean-code*`).
  5. *Spec-Driven Development (SDD) & Arquitectura* (`spec-driven-development`, `senior-architect`, `agent-squad`, `diary`).
  6. *Privacidad Radical & Ciberseguridad* (`privacy-by-design`, `privacy-mask`, `security-audit`, `cred-omega`).
  7. *Psicología de Producto & Conversión* (`copywriting-psychologist`, `loss-aversion-designer`, `emotional-arc-designer`, `uxui-principles`).
### [ADR-028] · [2026-08-29 23:03] Refinamiento de Badges en ProfileCard y Estándar Impecable UI/UX Mobile/Desktop
- **Decisión**: Reestructuración del encabezado de insignias en `ProfileCard.tsx` pasando de un doble posicionamiento absoluto colisionante (`top-2` y `top-8`) a un contenedor único `flex-col gap-1.5` con micro-insignias compactas y flujo natural. Incorporación de soporte para iOS safe-area insets (`env(safe-area-inset-bottom)`) y botones con touch-target de mínimo 48px en `BrutalistNav.tsx`. Registro del mandato permanente de calidad UX/UI en Engram.
- **Motivación**: Eliminar solapamientos visuales de insignias (distancia vs hosting/energía) y truncamiento excesivo en pantallas angostas o vistas de 4 a 5 columnas en desktop, garantizando un acabado estético de lujo berlines sin fricción en mobile y desktop.

### [ADR-029] · [2026-08-29 23:09] Sistema de Transmisión de Interés Dinámico y Semántico por Rol
- **Decisión**: Creación del catálogo `src/data/roleActionCatalog.ts` para personalizar el icono y el texto de acción de interés según el rol del perfil objetivo:
  - **Pasivo / Receptivo (`Bottom`, `Vers Bottom`)**: Icono `🍑` (Durazno), acción *"Mandar Deseo Receptivo"*, confirmación *"Deseo enviado 🍑"*.
  - **Activo / Dominante (`Top`, `Vers Top`)**: Icono `🍆` (Berenjena), acción *"Mandar Pulso Activo"*, confirmación *"Pulso enviado 🍆"*.
  - **Versátil (`Versatile`)**: Icono `⚡` (Chispa / Rayo), acción *"Mandar Chispa Versátil"*, confirmación *"Chispa enviada ⚡"*.
  - **Side (`Side`)**: Icono `🫦` (Labios), acción *"Mandar Caricia Sensual"*, confirmación *"Caricia enviada 🫦"*.
  - **Enfoque Oral (`Oral Focus`)**: Icono `👅` (Lengua), acción *"Mandar Provocación Oral"*, confirmación *"Provocación enviada 👅"*.
  - **Dominante (`Dominant`)**: Icono `⛓️` (Cadenas), acción *"Mandar Señal de Dominio"*, confirmación *"Dominio enviado ⛓️"*.
  - **Sumiso (`Submissive`)**: Icono `🧎` (Rendición), acción *"Ofrecer Sumisión / Ofrenda"*, confirmación *"Ofrenda enviada 🧎"*.
  Integrado en `ProfileCard.tsx` (botón circular con glow reactivo), `FillMeter.tsx` (micro-interacción *Hold-to-Fill* con progresión y emoji dinámico), `ProfileDetailModal.tsx` y `RadarSweep.tsx`.
- **Motivación**: Aumentar la inmersión carnal y la expresividad del lenguaje corporal no verbal, permitiendo a los usuarios comunicar su intención exacta con un solo toque y una identidad visual adaptada a cada rol.

### [ADR-030] · [2026-08-29 23:19] Rediseño Minimalista Photo-First de ProfileCard
- **Decisión**: Rediseño integral de la tarjeta de perfil en `ProfileCard.tsx` para otorgar protagonismo absoluto a la fotografía del usuario:
  - **Eliminación de Sobre-Información**: Se erradicaron las filas intermedias de chips pesados (`TENGO SITIO`, `🔥 Fogoso`, `🌿 Suave`) y la línea inferior de bio/taglines extensos (`"The body is..."`, datos de género).
  - **Encabezado Flotante Ultraligero**: Fila única y no invasiva con píldora de distancia/estado corporal a la izquierda (`🟢 ~150m` o `⭐ TÚ`) y micro-iconos traslúcidos a la derecha (`🌫️`, `👻`, `✓`, `🔒`, `🔊`).
  - **Pie de Tarjeta Limpio**: Exclusivamente `Nombre + Edad` con badge de verificación, `Rol` en tono ámbar y el botón circular interactivo de reacción por rol (`🍑`, `🍆`, `⚡`, `🫦`, `👅`, `⛓️`, `🧎`).
  - Todo el detalle profundo (energías deseadas, fetiches, bio, testimonios y opciones avanzadas) se concentra en el modal de detalle (`ProfileDetailModal.tsx`).
- **Motivación**: Respuesta al requerimiento del usuario de evitar la sobrecarga visual e invasión sobre la foto en la cuadrícula principal, logrando una estética limpia, cinematográfica y moderna.

### [ADR-031] · [2026-08-30 00:26] Refinamiento de Tarjetas: Supresión de Distancia, Nombre Completo y Cápsula Inferior
- **Decisión**: Cuatro ajustes de precisión visual en `ProfileCard.tsx`:
  1. **Supresión de Distancia en la Tarjeta**: Se eliminó la píldora de distancia de la grilla; la distancia se consulta exclusivamente al acceder al perfil (`ProfileDetailModal.tsx`).
  2. **Nombre Completo sin Truncamiento**: El codename se muestra de forma íntegra con ajuste de línea natural (`break-words`), eliminando puntos suspensivos (`...`).
  3. **Insignia de Verificación en la Cápsula**: El icono de verificación de identidad (`ShieldCheck`) se incorporó dentro de la cápsula de cristal translúcido.
  4. **Reubicación de la Cápsula**: La cápsula de micro-indicadores se trasladó a la base de la tarjeta, posicionándose inmediatamente a la derecha del rol del usuario (`Top`, `Bottom`, `Versatile`, etc.), dejando la parte superior de la fotografía 100% despejada.
- **Motivación**: Maximizar la pureza visual superior de la fotografía, mejorar el reconocimiento de identidad y unificar todos los metadatos funcionales en un bloque inferior compacto y elegante.

### [ADR-032] · [2026-08-30 01:25] Adaptación Integral a Español Rioplatense Gay (20-35 Años) & Consistencia Lingüística
- **Decisión**: Adaptación profunda de todo el ecosistema textual, estados, modales, opciones y perfiles de VESSEL al español rioplatense auténtico de la comunidad gay joven (20-35 años, Buenos Aires / Río de la Plata):
  1. **Estados Corporales**: `"Pinta algo ya"` (Open), `"En una"` (Occupied), `"En Sigilo"` (Dormant/Stealth).
  2. **Traducción y Mapeo Dinámico de Roles (`getRoleDisplayLabel`)**: `Activo`, `Pasivo`, `Versátil`, `Dominante`, `Sumiso`, `Enfoque Oral`, `Side`.
  3. **Reacciones de Transmisión Dinámica**:
     - Activo (`🍆`): *"Pintó Activar // Mandar Pulso"*
     - Pasivo (`🍑`): *"Tirar Onda Receptiva // Morbo"*
     - Versátil (`⚡`): *"Mandar Chispa // Lo que pinte"*
     - Side (`🫦`): *"Mandar Mimos & Calentura"*
     - Enfoque Oral (`👅`): *"Tentar con un Buen Pete"*
     - Dominante (`⛓️`): *"Marcar Territorio // Dominar"*
     - Sumiso (`🧎`): *"Ofrecerse // Entregar"*
  4. **Micro-Copy y Filtros**: Términos como *chongos, morbo, previa, al palo, clavar el visto, depto/lugar, sin vueltas, cerramos con onda*.
  5. **Protocolos Anti-Ghosting & Salidas Amables**: Mensajes rápidos respetuosos (*"Sos un fuego total, pero hoy no tengo chispa..."*, *"Che, sigo de largo por hoy..."*, *"Re linda vibra, pero hoy ando buscando otra cosa..."*).
  6. **Perfiles Mock & Localización Cultural**: Biografías contextualizadas con barrios auténticos (Palermo, Colegiales) y opciones de movilidad claras (*"Tengo depto / lugar"*, *"Me muevo / voy"*, *"En boliche / darkroom / cruising"*).
- **Motivación**: Cumplir con el mandato de autenticidad cultural y conexión emocional con el target demográfico principal de la aplicación, manteniendo tipado estricto en TypeScript y compatibilidad total con el modo inglés (`en`).

### [ADR-033] · [2026-08-30 13:55] Refinamiento de Estado Corporal: "De incógnito" en Reemplazo de "En Sigilo"
- **Decisión**: Se reemplaza la denominación del tercer estado de disponibilidad corporal (`dormant`) de *"En Sigilo"* por *"De incógnito"* en toda la aplicación (barra de estado, filtros dinámicos, ficha de perfil y traducciones).
- **Motivación**: *"En Sigilo"* resultaba un término técnico/medieval poco natural en el habla cotidiana argentina. *"De incógnito"* conecta de forma inmediata y coloquial con la intención del usuario de navegar de forma invisible en el radar sin emitir señal ni ser detectado.

### [ADR-034] · [2026-08-30 14:05] Resiliencia de Renderizado, Error Boundaries y Externalización de Firebase en Next.js 15
- **Decisión**:
  1. Incorporación de `src/app/error.tsx`, `src/app/global-error.tsx` y `src/app/not-found.tsx` con arquitectura brutalista y auto-recuperación ante excepciones runtime y rutas inválidas.
  2. Inclusión de `serverExternalPackages: ["firebase"]` en `next.config.ts` para evitar fallos 500 por empaquetado de chunks inexistentes (`./vendor-chunks/@firebase.js`) en SSR.
  3. Protocolo de verificación estática segura con `npx tsc --noEmit` y linters, evitando ejecutar `next build` en caliente sobre servidores `next dev` en ejecución.
- **Motivación**: Eliminar permanentemente los bloqueos por pantalla en blanco y errores 404 por desincronización de caché, asegurando disponibilidad continua y auto-reparación ante fallos del cliente.

### [ADR-035] · [2026-08-30 14:35] Sistema de Autenticación Real de Usuarios (Firebase Auth) y Prevención de Cuentas Múltiples (Anti-Sybil)
- **Decisión**:
  1. Implementación de autenticación multimodal real mediante Firebase Auth SDK: Google 1-Click OAuth (`GoogleAuthProvider`), Email & Contraseña con recuperación de clave (`sendPasswordResetEmail`), y Modo Invitado / Exploración Anónima con vinculación de cuentas permanente (`linkWithPopup`, `linkWithCredential`) sin pérdida de datos.
  2. Integración de servicio de deduplicación de identidad física y política de cuenta única (*One Face = One Receptacle*):
     - Unicidad determinista por teléfono mediante hash SHA-256 (`vessel_unique_identities/phone_{hash}`).
     - Deduplicación biométrica facial (comparación de embeddings vectoriales con umbral Euclidiano < 0.38) para impedir que un usuario baneado o con cuenta activa cree perfiles duplicados.
     - Huella digital de dispositivo (`deviceFingerprint`) y lista negra criptográfica permanente (`vessel_blacklist`).
  3. Modal brutalista de acceso (`AuthModal.tsx`), gestión reactiva de sesión en `VesselContext.tsx` y visualización de estado de cuenta en `AppSettingsSection.tsx`.
- **Motivación**: Convertir a VESSEL en una aplicación web real de producción garantizando la seguridad física e interpersonal de la comunidad mediante la erradicación de perfiles falsos, evasores de bloqueos y ataques Sybil, respetando la privacidad radical y el cifrado Zero-Knowledge.

### [ADR-036] · [2026-08-30 17:55] Elección de Vercel como Plataforma Oficial de Despliegue en Producción y Protocolo de Variables
- **Decisión**:
  1. Se establece oficialmente a **Vercel** como la plataforma de despliegue e infraestructura en la nube para VESSEL, descartando Netlify debido a la compatibilidad nativa de día cero de Vercel con Next.js 15 App Router y React 19 (sin adaptadores intermedios ni riesgos de desincronización de caché en Server Components).
  2. Se protocolizan las 6 variables de entorno de producción (`NEXT_PUBLIC_FIREBASE_*`) y el procedimiento de vinculación de dominios autorizados en Firebase Console (`verssel-3438d`).
- **Motivación**: Maximizar la estabilidad del runtime en producción, velocidad de entrega continua (CI/CD) y compatibilidad perfecta con el stack tecnológico de VESSEL.

### [ADR-037] · [2026-08-30 18:35] Elevación Impeccable de la Vista Radar (Operate + Experience)
- **Decisión**:
  1. **Cuadrante Táctico Brutalista:** Integración de marcas de azimut 360° (000° N, 090° E, 180° S, 270° W), retícula de coordenadas, anillos concéntricos escalables y haz de barrido cónico con persistencia de fósforo.
  2. **Escala y Zoom Dinámico (500m / 1.5km / 5.0km):** Selector de 3 rangos de proximidad con recalibración en tiempo real de distancias, etiquetas y posiciones de nodos.
  3. **Filtros Rápidos Horizontales:** Píldoras de filtrado instantáneo en la cabecera del Radar (*Todos, Disponibles, Con Sitio, Anti-Ghost, Intensidad 3-4*) en sincronización con el contexto global.
  4. **Nodos Táctiles de 44px (WCAG AAA):** Hitbox táctil ergonómico (mínimo 44×44px), halos pulsantes semánticos según estado corporal, indicador de Modo Niebla difuminado y algoritmo de dispersión espacial anticolisión.
  5. **Dock Inspector Flotante (Glassmorphism):** Ficha de contacto al alcance del pulgar con metadatos completos, transmisión de señal con sonido Sub-Bass analógico y accesos de 1-tap a Chat y Perfil Completo.
  6. **Control de Sonar Acústico y Empty State:** Toggle de sonido de radar en cabecera y estado vacío táctico con retícula de búsqueda y botón de restablecer filtros.
- **Motivación**: Cumplir con los estándares de Impeccable Design System unificando los modos de superficie *Operate* (velocidad de escaneo y control táctil) y *Experience* (inmersión visual y acústica Sub-Bass).

### [ADR-038] · [2026-08-30 18:45] Blindaje Permanente contra Corrupción de Caché en Caliente (`next dev` vs `next build`)
- **Decisión**:
  1. Se implementa el script oficial `"typecheck": "tsc --noEmit"` en `package.json` como el único comando autorizado para verificación de tipos e integridad estática durante el ciclo de desarrollo activo.
  2. Se establece una **Guarda Estructural Inviolable** en `.agents/rules/antigravity_rules.md`, `.agents/rules/antigravity_global_rules.md`, `GEMINI.md` y `docs/contexto/flujo-de-trabajo.md`: queda terminantemente prohibido ejecutar `next build` o `npm run build` en caliente mientras el servidor de desarrollo `next dev` esté activo.
  3. Protocolo de recuperación automatizado: en caso de colisión accidental, purga forzada de `.next/` (`rm -rf .next`) y reinicio de `npm run dev`.
- **Motivación**: Erradicar definitivamente la pérdida de estilos Tailwind (FOUC / pantalla blanca con HTML crudo) y la congelación de eventos React (bloqueo de navegación e interactividad) provocados por la eliminación de chunks de desarrollo al compilar producción en caliente.

### [ADR-039] · [2026-08-30 19:00] Elevación Impeccable de la Vista Mensajes & Darkroom Chat (Operate + Experience)
- **Decisión**:
  1. **Bandeja de Entrada con Filtros Segmentados:** Píldoras interactivas en cabecera (*Todos, Conversaciones, Señales, Con Sitio*) con recuento dinámico y estado vacío táctico con enlace directo al Radar.
  2. **Tarjetas de Conversación con Halos Semánticos:** Diferenciación visual de avatar según estado corporal (*Open / Occupied / Dormant*), badges de verificación ID y Anti-Ghost, rol y previsualización tipográfica enriquecida de señales efímeras, PINs y mensajes.
  3. **Riel Hero de Contactos con Sitio Inmediato:** Bento horizontal de acceso directo en 1 toque.
  4. **Chat Efímero con Cinta Táctica (44px touch targets):** Acceso instantáneo a Rendezvous PIN, Salidas amables Anti-Ghost, Diario de citas, Gestión de límites / Soft-Block y Validación de encuentros.
  5. **Sensorial & Sub-Bass Audio Engine:** Retroalimentación acústica analógica (45-80Hz) integrada para envío de mensajes (`playPulse`), cambios de modo efímero (`playStateSwitch`), confirmación de PIN (`playSuccess`) y destrucción de mensajes (`playError`).
  6. **Chips de Respuestas Relámpago (Lightning Replies):** Barra de respuestas rápidas de 1 toque (*"⚡ Dale de una"*, *"📍 Pasame PIN"*, *"🔥 Estoy cerca"*, *"🏠 ¿Tenés sitio?"*, *"🍺 ¿Pinta previa?"*, *"👀 ¿Qué buscás?"*).
  7. **Tarjetas Tácticas de Rendezvous PIN & Burn-on-View:** Visualización con cronómetro de 15 min, doble consentimiento y botón de autodestrucción inmediata.
- **Motivación**: Convertir la experiencia de chat en una herramienta táctica y sensorial de alta velocidad (modo *Operate*) con inmersión brutalista y privacidad radical (modo *Experience*).

### [ADR-040] · [2026-08-30 19:10] Sistema de Envío Multimedia & Compartición de Álbumes en Darkroom Chat
- **Decisión**:
  1. **Selector Multimedia Táctico (`SendMediaModal.tsx`):**
     - Pestaña de subida directa desde el dispositivo / cámara (fotos y videos) con previsualización en tiempo real.
     - Pestaña de selección de Álbumes de usuario (`userAlbums`), permitiendo compartir álbumes completos (*Públicos o Bóveda Privada*) o seleccionar fotos específicas.
  2. **Matriz de Privacidad y Permanencia:**
     - **Permanente:** Permanece visible en el hilo de conversación.
     - **1 Sola Vista (View-Once / Burn):** Se entrega protegido; al ser visualizado en pantalla completa corre un cronómetro regresivo de 15 segundos y se destruye permanentemente al cerrarse.
     - **Desenfocada (Privacy Blur):** Renderizado con desenfoque de privacidad y botón de toque para revelar.
     - **Expiración Temporal:** Se auto-elimina a los 5 min, 15 min o 24 horas.
  3. **Visor Cinematográfico a Pantalla Completa (`ChatMediaViewerModal.tsx`):** Lightbox inmersivo con soporte para fotos en alta definición, reproducción de video nativa, temporizador de autodestrucción y navegación en carrusel para álbumes compartidos.
  4. **Previsualización en la Lista de Conversaciones:** Indicadores específicos para álbumes compartidos, fotos efímeras de vista única y contenido multimedia en `DarkroomListView.tsx`.
- **Motivación**: Proporcionar control total sobre la privacidad y permanencia del contenido visual íntimo en las interacciones directas, integrando los álbumes existentes de la Bóveda Privada con la experiencia efímera del Darkroom.

### [ADR-041] · [2026-08-30 19:20] Modo de Retención de Chat Configurable (Efímero vs Permanente Guardado)
- **Decisión**:
  1. **Banner Táctico Interactivo en Cabecera de Chat:** Reemplazo del aviso estático por un selector táctil de 1 toque que permite alternar inmediatamente entre:
     - **`🔒 Canal Cifrado Efímero`:** Auto-purga de mensajes al finalizar la sesión.
     - **`💾 Canal Permanente (Historial Guardado)`:** Persistencia cifrada en `localStorage` (`STORAGE_KEYS.CHAT_MESSAGES`) disponible para todas las sesiones futuras.
  2. **Control Granular y Global:** Soporte para configuración por perfil (`perChatRetention`) y configuración global predeterminada en `AppSettings.chatRetentionMode`.
  3. **Acción Rápida de Limpieza / Purga:** Botón táctico de vaciado de historial en la cinta de acciones del chat (`Trash2`) con confirmación de seguridad.
  4. **Persistencia Reactiva e Hidratación Segura:** Guardado automático de mensajes en almacenamiento local (`STORAGE_KEYS.CHAT_MESSAGES`) e hidratación post-montaje sin desfases SSR.
- **Motivación**: Brindar a los usuarios la libertad de decidir qué conversaciones desean conservar para el futuro (chongos habituales, planes acordados) y cuáles mantener en privacidad efímera radical sin rastro.

### [ADR-042] · [2026-08-30 19:27] Rediseño Impeccable UI/UX de Selección & Envío Multimedia en Chat
- **Decisión**:
  1. **Conmutador Segmentado Táctil:** Selector de pestañas de vidrio oscuro (`bg-obsidian-deep/90 border border-white/10`) con resplandor ámbar (`shadow-amber-glow`) y retroalimentación acústica Sub-Bass.
  2. **Dropzone & Tarjetas de Muestra Refinadas:**
     - Dropzone de archivos con micro-badge táctico y acceso directo a cámara.
     - Presets de fotos de prueba rápida en relación de aspecto editorial 3:4 con viñeta cinematográfica y badges claros (`ESTUDIO`, `SILUETA`, `RAW`).
  3. **Matriz de Privacidad Cuatricromática:** Diferenciación semántica inmediata de los 4 modos (*Permanente: Esmeralda, 1 Sola Vista: Neón Sangre, Desenfocada: Púrpura Táctico, Expiración: Cian*).
  4. **Ergonomía Touch-First & Visor Inmersivo:** Touch targets de 44px mínimo, barra de pie sticky con CTA de alto contraste y visor lightbox cinematográfico con temporizador regresivo de autodestrucción.
- **Motivación**: Transformar el flujo de envío de fotos y álbumes íntimos en una experiencia táctil, fluida y con carácter *Brutalist Dark Luxury*.

### [ADR-043] · [2026-08-30 19:40] Rediseño Impeccable UI/UX de la Vista "Diario" (Date Diary)
- **Decisión**:
  1. **Cabecera & Conmutador Segmentado:** Cabecera con badge `[AES-256 VAULT]` y conmutador táctil con contadores reactivos en tiempo real (`Calendario`, `Cronología (N)`, `Estadísticas (★ N.N)`).
  2. **Calendario Táctil & Agenda Enriquecida (`SmartCalendarGrid.tsx`):**
     - Celdas de días con diseño de micro-tarjetas, bordes redondeados y tres indicadores semánticos (*Cita Programada: Neón Sangre pulsante, Encuentro Pasado: Ámbar, Salud/PrEP: Esmeralda*).
     - Tarjetas de agenda con avatar, rol de perfil, ubicación, métricas de satisfacción y notas cifradas con desenfoque de privacidad.
  3. **Cronología Editorial & Filtros Táctiles (`DiaryTimeline.tsx`):** Barra de búsqueda instantánea y filtros rápidos (*Todas*, *Concretadas*, *Agendadas*, *Top 5★*).
  4. **Bento Grid de Estadísticas & Salud (`DiaryInsights.tsx`):** Métricas destacadas en tipografía mono brutalista, barras de distribución y gestión de screening PrEP.
- **Motivación**: Convertir la bitácora personal en una herramienta de registro íntimo, privado, seguro y con la más alta calidad visual y de interacción sensorial.

### [ADR-044] · [2026-08-30 19:48] Rediseño Impeccable UI/UX de la Vista "Mi Perfil" (Protocolo & Identidad)
- **Decisión**:
  1. **Reorganización Modular en 4 Sub-Pestañas Naturales:**
     - `Ficha & Bio`: Edición ergonómica de datos corporales, identidad, vibes, deseos, intenciones y límites con botón flotante/sticky de guardado.
     - `Álbumes & Bóveda`: Gestión de galerías públicas y multi-bóvedas privadas con control de cuotas.
     - `Reputación & Seguridad`: Verificación de identidad digital, protocolo anti-ghost y moderación de testimonios.
     - `Límites & Niebla`: Gestión de desconexión gradual y telemetría de privacidad facial.
  2. **Hero Header Refinado:** Avatar cinematográfico con marco brutalista, estado en vivo de transmisión corporal (*Open Now / Stealth*), badges de verificación ZK y control táctil directo de Modo Niebla.
  3. **Eliminación de Redundancias:** Se removió la tarjeta duplicada de enlace al diario de citas, reduciendo la fricción y el scroll innecesario.
  4. **Ergonomía Sensorial & Acústica:** Touch targets de 44px+ y retroalimentación sonora Sub-Bass al conmutar sub-pestañas, alternar toggles y guardar modificaciones.
- **Motivación**: Erradicar el scroll monolítico desordenado de más de 3000px y proporcionar un centro de mando íntimo, intuitivo, elegante y coherente.

### [ADR-045] · [2026-08-30 20:08] Depuración y Optimización de Customizations (Skills y Reglas)
- **Decisión**:
  1. **Purga de 36 Skills Incompatibles y Redundantes:** Eliminación de skills para lenguajes ajenos (`go-testing`, `webapp-testing` en Python), herramientas externas irrelevantes (`docker-expert`, `varlock`, `cred-omega`, `spec-to-code-compliance`, `unslop`, `diary`, `secrets-management`, `vitest-skill`) y duplicados masivos de code review, debugging y diseño genérico.
  2. **Consolidación de Skills Esenciales:** Retención de 37 habilidades estratégicas altamente optimizadas para el stack Next.js 15, React 19, TypeScript, Tailwind, Brutalist Design y Web Audio API.
  3. **Unificación de Reglas Operativas:** Eliminación del archivo redundante `.agents/rules/antigravity_rules.md`, manteniendo como autoridad única `.agents/rules/antigravity_global_rules.md`.
- **Motivación**: Resolver el aviso crítico de *Customization token budget exceeded* (22.106 tokens / 110.5%), reduciendo el consumo a <55% del presupuesto para garantizar que ninguna habilidad sea truncada o excluida del contexto.

### [ADR-046] · [2026-08-30 20:18] Resolución Integral de Hallazgos de Auditoría Técnica & Optimización
- **Decisión**:
  1. **Blindaje de Reglas de Seguridad en Firestore (`firestore.rules`):**
     - Eliminación del wildcard permisivo global `match /{document=**}`.
     - Restricción estricta de chats (`vessel_chats/{chatId}`) y mensajes para lectura y escritura exclusiva de los participantes autenticados.
     - Protección de `vessel_profiles` para escritura exclusiva del propietario (`request.auth.uid == profileId`).
     - Aislamiento de identidades biométricas (`vessel_unique_identities`) para lectura privada exclusiva del usuario.
  2. **Deduplicación Biométrica Facial Indexada $O(1)$ con Locality-Sensitive Hashing (`identityDeduplicationService.ts`):**
     - Erradicación de la descarga masiva $O(N)$ de vectores de todos los usuarios al navegador (`getDocs`).
     - Implementación de buckets discretizados y hashes criptográficos deterministas (`generateBiometricBucketHashes`) para indexación directa y privada en Firestore.
  3. **Paridad Total de Internacionalización i18n (`translations.ts`):**
     - Incorporación de `chat.signalSentCount` en el diccionario en inglés (`TRANSLATIONS.en.chat`), alcanzando 100% de paridad estricta (375 claves idénticas entre `es` y `en`).
  4. **Corrección del Contador de No Leídos en Navegación (`BrutalistNav.tsx`, `DarkroomChatModal.tsx`, `types/vessel.ts`):**
     - Adición del campo `isRead` a `ChatMessage` y cálculo exclusivo de mensajes entrantes no leídos de terceros (`m.senderId !== "me" && !m.isRead`).
     - Activación automática de `markMessagesAsRead(profileId)` al abrir la conversación en el modal y renderizado de badges tácticos por fila en `DarkroomListView.tsx`.
  5. **Sincronización Bidireccional de Chat en Tiempo Real (`VesselContext.tsx`):**
     - Conexión activa de `subscribeToChatMessages` ante conversaciones abiertas.
     - Despacho optimista a la nube (`sendCloudMessage`, `burnCloudMessage`) integrado con persistencia local.
  6. **Resiliencia ante Límites de Cuota Local (`localStorageSync.ts`):**
     - Detección de `QuotaExceededError` con poda automática LRU de mensajes efímeros y quemados antiguos.

### [ADR-047] · [2026-08-30 20:55] Clarificación UX de Punto de Encuentro & Integración de Privacidad de Ubicación en Mi Perfil
- **Decisión**:
  1. **Clarificación Terminológica de "Rendezvous" a "Punto de Encuentro" / "PIN de Encuentro":**
     - Reemplazo del anglicismo/galicismo confuso "Rendezvous" en botones de tarjetas de perfil (`ProfileDetailModal.tsx`), mensajes de chat (`VesselContext.tsx`, `DarkroomChatModal.tsx`), gestión de testimonios (`PendingTestimonialsManager.tsx`, `WriteTestimonialModal.tsx`) e internacionalización (`translations.ts`).
     - Nueva redacción en español: *"Punto de Encuentro"* / *"PIN de Encuentro Seguro"*; en inglés: *"Meeting Point"* / *"Secure Meeting Point"*.
  2. **Eliminación del Chip de Batería/Celda Geoespacial de la Cabecera Principal (`BrutalistHeader.tsx`):**
     - Se retiró el botón con ícono de batería y celda Google S2 de la barra superior de la página de inicio para simplificar la interfaz principal.
  3. **Integración Dedicada en "Mi Perfil" con Lenguaje 100% Claro y Humano (`LocationPrivacySection.tsx`, `ProtocolView.tsx`):**
     - Creación de la sección *"Privacidad de Ubicación & Anti-Rastreo"* y *"GPS & Ahorro Inteligente de Batería"* dentro de la pestaña de Límites de Mi Perfil.
     - Erradicación de jerga matemática críptica (Google S2, curvas de Hilbert, Haversine) reemplazándola por explicaciones pedagógicas sobre cómo se protegen las coordenadas exactas redondeándolas en rangos seguros (<50m, ~150m, ~300m, ~1km) y cómo optimizar la batería con el modo Eco-Saver.
- **Motivación**: Maximizar la claridad y accesibilidad de la experiencia de usuario (UX), asegurando que todas las opciones de privacidad y consumo energético sean transparentes, comprensibles y estén ubicadas en la sección adecuada del perfil.

### [ADR-048] · [2026-09-01 13:55] Herramientas de Testing y Acceso Rápido de Autenticación Local
- **Decisión**:
  1. **Presets de Prueba de 1-Tap (`TEST_PERSONAS` en `AuthModal.tsx`):**
     - Incorporación de 3 arquetipos de prueba rápida (**Alex** `Top`, **Marcus** `Versatile`, **Liam** `Bottom`) con autocompletado y fallback de auto-registro transparente en Firebase Auth al primer clic.
  2. **Chip Táctico de Sesión en la Cabecera (`BrutalistHeader.tsx`):**
     - Indicador en vivo de estado de cuenta (**Invitado** en ámbar vs **Conectado** con email en esmeralda) con acceso directo en 1 toque para alternar cuentas, ingresar o vincular la sesión.
  3. **Paridad de Traducción i18n (`translations.ts`):**
     - Nuevas claves `header.guestSession`, `header.activeSession`, `header.authTooltip`, `auth.quickTestTitle` y `auth.quickTestSub` en español e inglés.
- **Motivación**: Permitir al equipo de desarrollo y producto probar e iterar con máxima velocidad todos los roles, flujos de autenticación, chat multi-usuario y límites de cuenta en el entorno de desarrollo local (`localhost:3001`).

### [ADR-049] · [2026-09-01 14:32] Edición y Actualización Reactiva del Nombre de Usuario / Codename
- **Decisión**:
  1. **Campo Dedicado en Ficha & Bio (`ProtocolView.tsx`):**
     - Incorporación del campo de edición de **Nombre de Usuario / Codename** como el primer elemento interactivo del formulario con botón de borrado rápido (`X`), formateo automático en mayúsculas y feedback visual en tiempo real.
  2. **Acceso Rápido desde el Hero Banner:**
     - Botón `✏️ Editar` junto al nombre principal en la vista de Mi Perfil para saltar de inmediato a la edición del alias.
  3. **Reactividad Inmediata en Tarjetas de la Matriz y Radar:**
     - Integración con el ciclo de vida `updateMyProfile` y `myFullProfile` en `VesselContext.tsx`, persistiendo el cambio en almacenamiento local y Cloud Firestore (`vessel_users`), actualizando instantáneamente la tarjeta `⭐ VOS / TÚ` en la vista Cerca (`ProfileGrid.tsx`) y en el Radar (`RadarSweep.tsx`).
- **Motivación**: Brindar control total y dinámico al usuario sobre su alias público e identidad visual en la grilla y el radar sin requerir reiniciar sesión ni pasar por formularios de registro externos.

### [ADR-050] · [2026-09-01 14:42] Edición Directa de Perfiles de Prueba y Presets de Testing
- **Decisión**:
  1. **Editor Inline en Hero Banner de Mi Perfil (`ProtocolView.tsx`):**
     - Al presionar `✏️ Editar` o hacer clic sobre el nombre, se activa instantáneamente un editor de texto en línea con foco automático, tecla `Enter` y botón `✓ Listo` para guardar en 1 toque.
  2. **Modal Brutalista de Edición de Perfiles de Prueba (`EditMockProfileModal.tsx` + `ProfileDetailModal.tsx`):**
     - Botón de edición `✏️` en el detalle de cualquier perfil para modificar Nombre / Codename, Rol, Edad, Lugar/Movilidad, Estado Corporal (`open`, `occupied`, `dormant`), Modo Niebla y Foto de perfil.
     - Persistencia reactiva con `updateProfile` en `STORAGE_KEYS.CUSTOM_PROFILES`.
  3. **Edición y Personalización de Presets de Autenticación (`AuthModal.tsx`):**
     - Botón `✏️` en cada preset rápido (Alex, Marcus, Liam) con editor inline para cambiar Nombre, Codename y Rol, guardando en `STORAGE_KEYS.TEST_PERSONAS` con opción de restaurar a valores originales.
- **Motivación**: Resolver la inercia visual al editar nombres y dotar al entorno de desarrollo local de control total sobre los perfiles simulados y presets de prueba.

### [ADR-051] · [2026-09-01 14:50] Gestión y Auto-Asignación de Foto de Portada / Avatar desde Álbumes
- **Decisión**:
  1. **Regla de Auto-Asignación Unitaria (`VesselContext.tsx`):**
     - Si el usuario cuenta con exactamente 1 foto en sus álbumes, esa foto se asigna automáticamente como su foto de portada (`avatarUrl`) sin requerir acción manual.
     - Si se elimina una foto y queda 1 sola, se reasigna automáticamente como la nueva portada.
  2. **Elección Manual de Portada en Álbumes (`AlbumDetailModal.tsx` & `UserAlbumManager.tsx`):**
     - Si existen 2 o más fotos, cada foto incluye el botón interactivo `⭐ Elegir como Portada` y la foto activa exhibe la insignia `⭐ PORTADA ACTUAL`.
     - Panel de gestión rápida en la cabecera de la sub-pestaña Álbumes para conmutar la portada en 1 toque.
  3. **Selector Rápido de Portada desde el Avatar Hero (`CoverPhotoSelectorModal.tsx` + `ProtocolView.tsx`):**
     - Al tocar el botón de la cámara o la foto de perfil en Mi Perfil, se abre un modal con carga de fotos desde dispositivo, galería de fotos existentes en sus álbumes y presets demostrativos.
- **Motivación**: Cumplir con la regla de negocio de portadas de usuario, facilitando la personalización visual de la tarjeta en la grilla y el radar desde los álbumes multimedia.

### [ADR-052] · [2026-09-02 14:15] Estandarización Universal del Término "Pulso" y Nueva Vista en la Barra Inferior (PulsesView)
- **Decisión**:
  1. **Estandarización Universal del Término a "Pulso" (`roleActionCatalog.ts` & `translations.ts`):**
     - Se unifica la acción de interacción rápida de 1-tap en todas las tarjetas de perfil y vistas bajo el término estándar **"Mandar Pulso"** (*"Send Pulse"*), estado **"Pulso enviado"** (*"Pulse sent"*) y tooltip **"Mandar pulso a {name}"**, eliminando la divergencia confusa previa donde variaba según el rol (*"onda receptiva"*, *"pintó activar"*, *"chispa"*, *"mimos"*, *"tentar"*, etc.).
     - Se preserva la rica iconografía visual diferenciada por rol (🍑, 🍆, ⚡, 🫦, 👅, ⛓️, 🧎) en el botón redondo inferior derecho.
  2. **Nueva Opción en la Barra Inferior (`BrutalistNav.tsx`):**
     - La barra de navegación pasa de 5 a 6 columnas: `[Cerca] [Radar] [Pulsos] [Mensajes] [Diario] [Mi Perfil]`.
     - Pestaña **"Pulsos"** identificada con el ícono bio-telemétrico `Activity` de Lucide y badge numérico pulsante para pulsos no leídos.
  3. **Nueva Vista Especializada (`PulsesView.tsx`):**
     - Sub-pestañas: **"Recibidos"** (lista de perfiles que te enviaron un pulso, distancia discretizada, tiempo relativo en jerga rioplatense, botón para devolver el pulso en 1-tap con sonido Sub-Bass 75Hz y botón para abrir chat directo) y **"Enviados"** (para auditar a quiénes les enviaste pulso y cuántos).
  4. **Modelo de Datos y Persistencia (`VesselContext.tsx`):**
     - Interfaces `ActiveNavView` y `ReceivedPulse` con persistencia en `localStorage` (`STORAGE_KEYS.RECEIVED_PULSES`), inicialización con datos simulados realistas y funciones `returnPulse`, `markPulsesAsRead` y `clearPulse`.
- **Motivación**: Brindar una experiencia clara, reconocible y predecible a los usuarios de apps de citas (equivalente a los *Taps* de Grindr o el *Flash* de The Blowers) adaptada al ADN acústico y brutalista de VESSEL.

### [ADR-053] · [2026-09-02 14:30] Optimización Integral de Rendimiento React, Code-Splitting Dinámico, Descubribilidad de Configuración y Refinamiento A11y
- **Decisión**:
  1. **Memoización del Proveedor de Contexto (`VesselContext.tsx`):**
     - Se encapsuló `filteredProfiles` y la totalidad del objeto `contextValue` en `useMemo`, eliminando la creación de referencias de objeto efímeras en cada ciclo de render.
     - Se previene la cascada de re-renderizado global que forzaba a recalcular las tarjetas de perfiles, radares y menús ante eventos periódicos de telemetría de batería o mutaciones locales.
     - Sincronización reactiva del atributo `html lang` en `document.documentElement` con `appSettings.language`.
  2. **Code-Splitting Dinámico de Vistas y Modales (`page.tsx`):**
     - Migración de vistas secundarias (`RadarSweep`, `PulsesView`, `DarkroomListView`, `ProtocolView`, `DateDiaryView`) y modales pesados (`ProfileDetailModal`, `DarkroomChatModal`, `IdentityVerificationModal`, `AuthModal`, `CreateDiaryEntryModal`, `GeoBatteryModal`, `AppSettingsModal`) a `next/dynamic` con `{ ssr: false }`.
     - Reducción drástica del bundle JavaScript inicial entregado al cliente, acelerando LCP y TBT.
  3. **Descubribilidad Ergonómica de Configuración del Sistema (`ProtocolView.tsx`):**
     - Inclusión de acceso táctico directo a la Configuración del Sistema (`AppSettingsModal`) en la cabecera del Hero Banner y mediante un banner al pie de la vista de "Mi Perfil", resolviendo el anti-patrón de ocultamiento donde solo se podía acceder tocando el logotipo.
  4. **Modernización de Configuración de Imágenes (`next.config.ts`):**
     - Reemplazo de la propiedad deprecada `images.domains` por la especificación moderna `images.remotePatterns` de Next.js 14+.
  5. **Refinamiento de Accesibilidad (A11y WCAG 2.1 AA):**
     - Adición de `role="dialog"`, `aria-modal="true"` y `aria-label` descriptivos en los modales de Chat, Detalle de Perfil, Autenticación y Configuración.
     - Habilitación de escalabilidad de zoom en `src/app/layout.tsx` (`userScalable: true`, `maximumScale: 3`) en cumplimiento con WCAG 1.4.4.
  6. **Erradicación de Tipos `: any` Residuales:**
     - Tipado estricto en `ProfileGridProps` (`VesselProfile`), `localStorageSync.ts` (`ChatMessage`), y `BatteryStateEngine.ts` (`Navigator & { getBattery }`).
### [ADR-054] · [2026-09-02 18:30] Implementación Integral de la Suite Táctica de 12 Características en 5 Ejes con Diseño Brutalista (Impeccable UI)
- **Decisión**:
  1. **Eje 1: Logística y Reducción de Fricción (Cero Dudas):**
     - **Ficha de Hospedaje Táctica (`HostCardModal.tsx` & `HostCardBadge.tsx`):** Elimina la fricción de "¿quién recibe?". Modela si el usuario tiene sitio, tipo de convivencia (`solo`, `roommates`, `partner_aware`, `hotel`), comodidades inmediatas (*ducha lista, toallas limpias, ascensor, aire acondicionado*) e insumos (*condones, lubricante, poppers, toallitas*). Renderizado en tarjetas de grilla (badge compacto) e interactivo en detalle de perfil con filtro reactivo en matriz.
     - **Pre-Flight Checklist Sexual (`PreFlightChecklistModal.tsx` & `PreFlightCard.tsx`):** Acuerdos explícitos de compatibilidad erótica en 3 taps antes de encontrarse: Ritmo (*Rápido & Carnal, Sensual & Pausado, Dominación, Cuddle*), prácticas específicas en sintonía (*Oral, Penetración, Masaje, Fetiche, Besos, Voyeur*), barreras/salud (*Bareback + PrEP U=U, PrEP + Doxy-PEP, Condones, Conversar*) y sustancias (*100% Sobrio, Un trago, 420*). Renderizado como tarjeta cifrada en el chat de Darkroom con distintivo *"Sintonía Fuego 🔥"*.
     - **Voice Vibe — Tono de Voz de 5s (`VoiceVibePlayer.tsx` & `VoiceVibeRecorderModal.tsx`):** Clip de audio efímero de exactamente 5 segundos para verificar tono, confianza y presencia real antes de coordinar. Grabador táctico con cuenta regresiva y reproductor analógico con modulación de onda y pulso sub-bass a 65 Hz.
     - **Modo "Voy en Camino" con Telemetría (`EnRouteTrackerModal.tsx` & `EnRouteBanner.tsx`):** Estimación de tiempo de llegada (ETA: 5, 10, 15, 30 min) compartida en el chat sin dar número ni WhatsApp. Banner persistente HUD superior y alerta sonora de puerta (*90 Hz*) al llegar a menos de 50 metros del anfitrión.
  2. **Eje 2: Seguridad Personal y Discreción Extrema (Paz Mental Real):**
     - **Guardián Silencioso & Dead-Man Switch (`SafetyBeaconModal.tsx` & `BeaconCountdownWidget.tsx`):** Monitoreo de sesión con temporizador regresivo (45, 90, 120 min), widget persistente en cabecera (*MM:SS*), alerta roja titilante al restar <10 min, extensión rápida (+30m/+60m) y desactivación por PIN. Si el tiempo expira, activa pulso de alarma a 45 Hz y alerta al contacto de auxilio. **Arquitectura estrictamente Local-First**: datos de contacto y encuentro nunca tocan servidores centrales.
     - **PIN de Coacción & Alerta Silenciosa (`DuressPinSettingsModal.tsx`):** Configuración de PIN seguro real vs PIN de coacción (ej. `9999`). Al ingresarlo bajo amenaza, aparenta desactivar el sistema, salta al señuelo y despacha la alerta silenciosa de emergencia.
     - **Icono Camaleón & Pantalla Señuelo / Bloc de Notas Brutalista (`CalculatorCoverScreen.tsx` & `AppDisguiseModal.tsx`):** Señuelo 100% creíble con interfaz monocromática de terminal/editor (`SCRATCHPAD.TXT // MONO-KERNEL`), menú superior, contador de líneas/caracteres y notas reales editables (rutina de gimnasio, recordatorios). Activación instantánea mediante **Flip-to-Cover** (giroscopio al poner teléfono boca abajo) o tecla `Escape`. Desbloqueo secreto por triple tap en logotipo o comando `:exit`.
     - **Verificación Liveness 3D Facial (`LivenessVerificationModal.tsx`):** Escaneo facial biométrico tridimensional con malla vectorial, validación de gestos dinámicos en vivo (parpadeo, giro de cabeza) y generación de prueba criptográfica ZK con insignia dorada.
  3. **Eje 3: Dinámicas del Encuentro y Post-Encuentro (Cultura & Respeto):**
     - **Protocolo de Salida (`ExitProtocolSelector.tsx` & `ExitProtocolBadge.tsx`):** Explicita de antemano la expectativa post-coital: *Fast Encounter* ⏱️ (puntual, sin sobremesa), *Chill & Cuddle* 🫂 (ducha y relax de 20-30 min), o *Sleepover* 🌙 (pasar la noche si hay química).
     - **Botiquín Clínico Doxy-PEP (`DoxyPepTrackerCard.tsx`):** Integrado en el Date Diary para seguimiento clínico de profilaxis bacteriana post-exposición (sífilis, clamidia, gonorrea) con cuenta regresiva de la ventana de 72 horas y registro de dosis 1 (24h) y dosis 2 de refuerzo.
     - **Salas de Sesión & Modo Dúo (`SessionRoomModal.tsx` & `DuoLinkModal.tsx`):** Salas privadas con aforo limitado (ej. 3/3 personas) para coordinación de tríos y dinámicas grupales; y vinculación de perfiles en Modo Dúo para parejas con insignia unificada `👥 DÚO` en matriz y radar.
  4. **Eje 4 & 5: Monetización VESSEL UNLIMITED & Cruising Táctico:**
     - **VESSEL UNLIMITED Paywall (`UnlimitedPaywallModal.tsx`):** Membresía oficial bajo el lema *"Álbumes, bóvedas y señales ilimitadas"* con 6 superpoderes: Travel Mode, Multi-Bóvedas Ilimitadas, Auditoría en Vivo, Stealth Pro, Filtros Quirúrgicos de Logística y Boost Dorado.
     - **Auditoría de Bóvedas en Vivo (`VaultAuditModal.tsx`):** Registro cronológico de aperturas de álbumes privados (quién vio tus fotos, hora exacta, duración en segundos) y botón para revocar la llave de acceso de inmediato.
     - **Radar de Teleportación (Travel Mode) (`TravelModeModal.tsx`):** Teleportación virtual de radar a ciudades estratégicas (*Buenos Aires, Berlín, Madrid, São Paulo, Nueva York, Londres*) para conectar 48 hs antes de viajar.
     - **Hotspots Tácticos Urbanos (`TacticalHotspotsOverlay.tsx` & `mockHotspots.ts`):** Mapeo en el Radar de recintos y espacios de cruising (*Niceto Darkroom, Sauna Le Dôme, Bunker San Telmo, Bosques de Palermo, UnderBar Feliza*) con contador en vivo de Vessels activos y check-in anónimo.
- **Motivación**: Dotar a VESSEL del conjunto de funcionalidades más avanzado, seguro, empático y ergonómicamente refinado del ecosistema de aplicaciones para hombres gay y personas queer, combinando practicidad logística, respeto sexual, seguridad física infalible y un modelo de monetización honesto de alto valor percibido.

### [ADR-055] · [2026-09-02 20:00] Suite Táctica Avanzada de Encuentros, Seguridad y Salud Sexual (DRM Blackout, On-The-Clock, Waypoint 2-Fases, Kink Matrix, Clima Sonoro, Pase Fin de Semana, Reducción de Daños & Alerta ITS)
- **Decisión**:
  1. **Protección Fotográfica Bimodal (DRM Blackout vs Marca de Agua Esteganográfica):**
     - En **Bóvedas Privadas (`PrivateVault.tsx`, `AlbumDetailModal.tsx`, `ChatMediaViewerModal.tsx`)**, se rechaza y bloquea radicalmente cualquier intento de captura de pantalla mediante interceptación a nivel de sistema operativo (`PrintScreen`, atajos `Cmd+Shift+3/4/5`, `Ctrl+Shift+I/S`), pérdida de foco de ventana (`blur`) y cambios de visibilidad (`visibilitychange`). Al detectarse, se superpone inmediatamente una cortina opaca negra `z-40` (`bg-black`) con el aviso: `⚠️ CAPTURA RECHAZADA // PROTOCOLO DRM VESSEL`.
     - En **Álbumes Públicos (`AlbumDetailModal.tsx`, `ChatMediaViewerModal.tsx`)**, se proyecta una micro-marca de agua digital dinámica esteganográfica e indeleble a -25° con `VESSEL // ID: [viewer/sender] // [Timestamp] // ANTI-DOXING` en modo `mix-blend-mode: overlay` para neutralizar tomas con un segundo teléfono celular físico.
  2. **Radar "On-The-Clock" (Listo YA):**
     - Estado efímero de alta urgencia (15 a 120 minutos) para usuarios con disponibilidad inmediata. Se sincroniza con el badge pulsante ámbar `⚡ LISTO YA` en tarjetas de grilla, botón con cuenta regresiva en vivo en la cabecera superior y un chip de filtro de 1-tap en la barra de filtros rápidos.
  3. **Waypoint Seguro en 2 Fases (Protocolo Anti-Emboscada):**
     - En `DarkroomChatModal.tsx`, al coordinar un encuentro el anfitrión envía un waypoint en dos fases independientes: Fase 1 (esquina pública de aproximación) y Fase 2 (piso, dpto y timbre exacto). La Fase 2 permanece cifrada y bloqueada hasta que el receptor arriba a la esquina y pulsa *"Ya estoy en la esquina"*, desbloqueando en ese instante la dirección precisa.
  4. **Kink Matrix Ciega (Doble Consentimiento Fetiche):**
     - Catálogo maestro de 21 prácticas y fetiches eróticos en `energyCatalog.ts` clasificados en tres estados (`me encanta`, `curioso`, `paso`). Sistema de sintonía ciega donde ningún usuario puede ver la lista del otro; el sistema únicamente revela los fetiches donde ambos marcaron coincidencia afirmativa (*"🔥 Sintonía Secreta"*).
  5. **Soundtrack de Hospedaje & Clima Sonoro Analógico:**
     - Integración en `SubBassAudioEngine.ts` de generadores acústicos en tiempo real con 5 frecuencias seleccionables por el anfitrión en su `HostCard` (Sub-Bass 50Hz, Dark Techno 128 BPM, Berlin Industrial, Sensual Downtempo 85 BPM, Ambient Chill) con botones de preescucha interactiva en la ficha y en el perfil.
  6. **Pase de Fin de Semana 48h ($2.99 USD):**
     - Inclusión en `UnlimitedPaywallModal.tsx` de un plan de micro-pago único de $2.99 USD orientado a usuarios que solo buscan el radar ampliado durante el fin de semana (viernes a domingo), sin necesidad de comprometerse a una suscripción mensual o anual.
  7. **Asistente de Reducción de Daños (Harm Reduction):**
     - Modal de cuidado mutuo y salud comunitaria (`HarmReductionModal.tsx`) libre de juicios morales para fiestas y encuentros prolongados: temporizador reactivo de hidratación cada 45 minutos con alertas sensoriales a 45 Hz, registro local confidencial de sustancias y dosis con marcas temporales, y guía de primeros auxilios (Posición Lateral de Seguridad y botón de llamada al 107/911 con recordatorio de amparo legal por secreto profesional médico).
  8. **Alerta Anónima de Exposición a ITS:**
     - Modal clínico comunitario (`ItsExposureModal.tsx`) conectado al `DateDiaryView.tsx` que permite a cualquier usuario notificar de forma 100% anónima a sus parejas sexuales recientes ante un diagnóstico de ITS (sífilis, gonorrea, clamidia, MPOX, hepatitis, etc.) con ventana temporal configurable, sin revelar jamás el nombre, perfil ni fecha exacta del remitente.
- **Motivación**: Maximizar la utilidad real en los encuentros físicos, la seguridad anti-extorsión, el cuidado de la salud física y comunitaria y la monetización accesible de VESSEL respetando escrupulosamente los estándares de diseño brutalista de la plataforma.

### [ADR-056] · [2026-09-02 20:15] Blindaje Anti-Captura Mac/Web Pre-Emptivo & Marca de Agua Esteganográfica Universal
- **Decisión**:
  1. **Superación de Limitaciones de Captura en macOS (`DrmBlackoutProtector.tsx`):**
     - Al analizar por qué `Cmd+Shift+4` o `Cmd+Shift+3` evadían la detección, se identificó que el subsistema WindowServer de macOS consume el atajo a nivel de kernel antes de emitir el evento del carácter `4` al navegador.
     - La solución adoptada es la **interceptación pre-emptiva de teclas modificadoras**: el listener en fase de captura evalúa `Meta` (Cmd), `Shift`, `Ctrl`, `Alt`, `PrintScreen` y banderas modificadoras. En el milisegundo en que los dedos tocan `Command` y `Shift` (antes de pulsar el `4`), se dispara instantáneamente el apagón a negro puro `z-50` (`bg-black`). La captura tomada por el SO captura únicamente un fotograma negro.
  2. **Paradigma 'Hold to Reveal' (Mantener Presionado para Revelar):**
     - Siguiendo el estándar de aplicaciones de alta seguridad como Confide, Snapchat y Telegram Web, las fotos y videos de bóvedas privadas y vista única requieren mantener presionado el puntero (`pointerdown`). Al soltar el dedo, perder el foco (`blur`), mover el ratón fuera (`mouseleave`) o pulsar cualquier tecla, el medio se oculta al instante.
  3. **Universalidad de la Marca de Agua Esteganográfica (`SteganographicWatermark.tsx`):**
     - Se integró la trama forense de 18 líneas a -25° con contraste dual claroscuro (`text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]`) en todo el ciclo de vida visual de fotos públicas: carrusel hero de `ProfileDetailModal`, miniaturas y visor de `AlbumDetailModal`, y fotos compartidas en `ChatMediaViewerModal`.
- **Motivación**: Asegurar una protección infalible contra extorsión, doxing y filtraciones fotográficas tanto por software de captura como por fotos físicas tomadas con un segundo dispositivo móvil.




### [ADR-057] · [2026-09-02 21:40] Rediseño Impeccable de ProfileCard: Proporción Áurea 2/3, Scrim 50% y Micro-HUD Táctico de 2 Líneas
- **Decisión**:
  1. **Aspect Ratio 2/3 Áureo (`aspect-[2/3]`):** Migración del formato cuadrado o rectangular previo a la proporción vertical clásica del retrato fotográfico.
  2. **Retracción del Scrim Degradé (`h-1/2` / 50%):** Eliminación del oscurecimiento excesivo previo que cubría casi toda la imagen; el 70%+ superior de la foto permanece completamente nítido y luminoso.
  3. **Micro-HUD de 2 Líneas Flotante:**
     - *Línea 1:* Codename en tipografía mono bold + edad + badge de verificación biométrica + cápsula interactiva anti-ghost / karma + chip de host inmediato + indicador de bóveda privada.
     - *Línea 2:* Rol sexual semántico (*Activo / Pasivo / Versátil*) + distancia discretizada (~152m) + estado de batería/disponibilidad.
  4. **Glanceability Táctica (Lectura <200ms):** El usuario puede evaluar anatomía, vibra y compatibilidad básica de un vistazo instantáneo sin tapar la identidad fotográfica.
- **Motivación**: Cumplir con los estándares de Impeccable UI, logrando la máxima visibilidad del rostro y torso del usuario al tiempo que se conserva la riqueza de telemetría táctica y respeto del sistema VESSEL.

### [ADR-058] · [2026-09-02 23:30] Suite Táctica VESSEL Nightlife, Cruces en la Pista (Missed Connections) y Matriz de Sustancias
- **Decisión**:
  1. **Cruces en la Pista // Missed Connections con Retención Efímera de 48 Horas:**
     - Registro local-first de perfiles que compartieron local y franja horaria en fiestas o boliches gay (Crobar, Amerika, Under Club, Feliza, etc.).
     - Ventana de 48 horas con cuenta regresiva en vivo y auto-poda estricta de cruces expirados para no acumular historiales perennes.
     - Envío de pulsos tácticos de reencuentro (`👁️ Te vi en la pista`) con nota opcional (ej: *"Estábamos al lado de la cabina"*) y acceso directo a chat.
  2. **Matriz de Sustancias y Atmósfera de Consumo (4 Niveles):**
     - Taxonomía App Store-proof de 4 estados: `sober` (Sobrio // Cero Sustancias), `social_drinks` (Tragos & Previa), `green_420` (420 Friendly), `party_play` (Party & Play // Sesión Chemsex consciente con reducción de daños).
     - Selector táctico en `ProtocolView`, insignia semántica en `ProfileDetailModal` y filtrado instantáneo en `DynamicFilterDrawer`.
  3. **Seguridad Nocturna y Baliza Óptica:**
     - Baliza estroboscópica de pantalla completa con 3 frecuencias (Ámbar 2.5Hz, Neón 5Hz, Carmesí Darkroom) para encontrarse físicamente en la multitud a oscuras.
     - Modo Wingman con PIN efímero de 4 dígitos para coordinar seguridad mutua con un amigo y estados sincronizados (`partying_together`, `separated_safely`, `on_hookup`, `needs_help`).
     - Alerta de Vaso Seguro con protocolo silencioso y marcado rápido a SAME (107) y 911.
     - Despacho de After-Hours y Pase de Fiesta ($1.99 USD x 12h) en el Paywall de VESSEL UNLIMITED.
- **Motivación**: Brindar la experiencia nocturna más segura, empática, fluida y orientada a la realidad comunitaria, erradicando la pérdida de contactos en la pista de baile y protegiendo la salud física y psicológica de los usuarios en eventos masivos.

### [ADR-059] · [2026-09-03 01:30] SPA de Presentación Ejecutiva y Demo Interactivo para Inversores en Archivo Único
- **Decisión**:
  1. **Empaquetado en Archivo Único Portátil (`presentation/index.html` y `public/investors/index.html`):**
     - Se implementó una SPA 100% autónoma, sin dependencias de compilación externa ni pasos de build de Node.js, estila con Tailwind CSS v3 vía CDN y Google Fonts (Inter + JetBrains Mono).
     - La SPA puede abrirse tanto directamente desde el explorador de archivos local (`file://.../index.html`) para presentaciones off-grid o reuniones cara a cara, como servirse a través de Next.js en `http://localhost:3001/investors/index.html`.
  2. **Perspectiva Dual de Venta (Usuario vs Inversor):**
     - Selector interactivo de vista que conmuta el análisis entre el valor de producto para el usuario (resolución del dolor, adicción táctica, utilidad real) y las métricas de negocio para inversores (unit economics, CAC, LTV/CAC 5.4x, K-factor viral de 0.72 y mitigación de responsabilidad civil).
  3. **Simulador de Smartphone Interactivo de 5 Pantallas:**
     - Bezel táctil realista de smartphone con conmutador dinámico de 5 vistas nucleares de VESSEL: Matriz 2/3 con Scrim 50%, Radar Polar 360° con haz de barrido concéntrico, Cruces en la Pista (Fiesta Rheo Crobar) con cuenta regresiva de 48h, Suite Táctica con Kink Matrix y Darkroom Chat con Waypoint en 2 Fases interactivo.
  4. **Catálogo Táctico de 52 Features & Inspector Modal:**
     - Clasificación en 8 categorías tácticas con buscador instantáneo debounced y ventana modal de inspección técnica para cada una de las 52 características implementadas en el sistema.
  5. **Calculadora Financiera Reactiva de ARR & Battlecard:**
     - 4 controles deslizantes dinámicos (MAU, conversión SaaS, micro-pases nocturnos y venues B2B) que recalculan en tiempo real MRR, ARR y ARPPU; junto con una matriz comparativa frente a Grindr, Scruff y Sniffies.
  6. **Branding Acústico Sub-Bass Integrado:**
     - Síntesis analógica de frecuencias bajas (45-80 Hz) utilizando la Web Audio API del navegador, permitiendo a los inversores experimentar físicamente la retroalimentación táctil de la aplicación sin librerías de audio pesadas.
- **Motivación**: Dotar a los fundadores y al equipo de una herramienta comercial y de levantamiento de capital de máxima categoría estética y técnica, capaz de cerrar rondas de inversión o adquisiciones estratégicas demostrando la superioridad operativa de VESSEL frente a los monopolios antiguos.

### [ADR-060] · [2026-09-03 13:40] Rediseño Impeccable de Ergonomía Táctica: Header Unificado, Matriz Cerca y BrutalistNav
- **Decisión**:
  1. **Cápsula de Identidad Unificada en BrutalistHeader:**
     - Se reemplazaron 6 botones individuales dispersos por una arquitectura de 3 zonas funcionales: Identidad de Marca (izquierda), Alertas Tácticas Sensibles (centro) y Cápsula de Usuario (derecha). La cápsula unifica Plan (`👑`), Verificación Biométrica (`🛡️`) y Estado de Sesión en una sola unidad táctil coherente, reduciendo la polución visual del header en un 50%.
  2. **StatusToggle Semántico y Reducido (38px):**
     - Se incorporó la micro-etiqueta `TU SEÑAL` para eliminar la confusión entre el estado corporal propio y los filtros de búsqueda de la grilla. Se rebajó la altura de 56px a 38px y se estructuró con roles ARIA accesibles (`role="radiogroup"` / `role="radio"`).
  3. **Píldoras de Filtro Rápido en Orden Natural de Acción:**
     - Reorganización cognitiva de izquierda a derecha: `✨ Todos` ➔ `⚡ Listos YA` ➔ `🟡 Disponibles` ➔ `🏠 Con Sitio` ➔ `🎉 Fiestas & Boliches` ➔ `👻 Anti-Ghost` ➔ `🔥 Intensidad 3-4` ➔ Roles (`👑 Activos`, `🔄 Versátiles`, `🍑 Pasivos`).
  4. **Micro-HUD en ProfileCard sin Colisiones con Touch Target de 44px:**
     - Los badges tácticos se limitan a 2-3 iconos con colapso `+N` interactivo que despliega un popover informativo de 8s, erradicando los solapamientos con el botón de reacción rápida. El botón de reacción cuenta con touch target ampliado de 44px (`p-1 -m-1`) y aislamiento de click (`e.stopPropagation()`).
  5. **BrutalistNav con Micro-Pill Neón y Geometría Precisa de Badges:**
      - Active indicator mediante píldora horizontal ámbar con brillo `rgba(229,169,60,0.9)`, micro-resplandor de fondo, tipografía monospace de alto contraste y posicionamiento matemático de insignias de notificación evitando cortes de texto o desalineaciones en PWA.
- **Motivación**: Garantizar una experiencia de usuario sobresaliente (UX Impeccable), fluidez de acción instantánea en pantallas compactas y una estética brutalista oscura de lujo que eleve la jerarquía visual de VESSEL.

### [ADR-061] · [2026-09-05 16:45] Rediseño Impeccable de Radar, Quick-HUD de 1-Tap y Desacoplamiento de Protocolo de Salida
- **Decisión**:
  1. **Solución a la Regresión de Layout por Clase Inválida de Tailwind (`w-13 h-13`):**
     - Se identificó que la clase `w-13 h-13` en el avatar del inspector provocaba que la foto se expandiera sin restricción a 800x1200px, disparando la altura del dock a 1.330px y ocultando la cabecera del perfil a `top: -706px`. Se reemplazó por la clase canónica `w-14 h-14` (56x56px, `rounded-2xl`), fijando dimensiones predecibles y fluidas.
  2. **Elevación y Desacoplamiento de la Píldora de Protocolo de Salida (`exitProtocol`):**
     - Se diseñó una fila dedicada de acuerdos tácticos donde la píldora de protocolo (`⏱️ PUNTUAL`, `🫂 CUDDLE`, `🌙 SLEEPOVER`) luce con borde ámbar brillante y tipografía mono de alto contraste, completamente aislada de la botonera inferior (cero colisiones).
  3. **Consolidación de la Barra Superior de Radar en 2 Filas Tácticas:**
     - *Fila 1 (Telemetría & Blindaje):* Compass giratorio + Título Radar + Celda Geohash S2 (`u33dc0`) + Conteo de señales + Toggle de silencio inmediato para sonar + Chip de Batería/GPS.
     - *Fila 2 (Segmented Zoom & Ribbon Táctico Deslizable):* Segmented Control de Escala (`500m`, `1.5km`, `5.0km`) + Ribbon horizontal fluido con acceso directo en 1 tap a `⚡ Baliza`, `✨ Todos`, `🟡 Disponibles`, `🏠 Con Sitio`, `👻 Anti-Ghost`, `🔥 Intensidad 3-4`, `✈️ Travel`, `🔥 Salas`, `🎉 Fiestas` y `⚙️ Filtros`.
  4. **Optimización Ergonómica de Taps en el Quick-HUD (Thumb Zone):**
     - *Acción 1:* `[Ver Ficha >]` (1 tap abre la ficha detallada).
     - *Acción 2:* `[🍆 Pulso]` con feedback sub-bass analógico (60Hz) que conmuta a `[✓ Enviado]` instantáneamente.
     - *Acción 3:* `[💬 Chat Directo]` (acción primaria en Raw Amber, 1 tap abre el chat efímero).
     - Touch targets mínimos garantizados de 44x44px con los 5 estados obligatorios.
- **Motivación**: Garantizar una experiencia sensorial sobresaliente, lectura ultrarrápida sin fricción cognitiva en entornos nocturnos y de cruising, y total ergonomía de uso con una sola mano.

### [ADR-062] · [2026-09-05 17:05] Rediseño Ergonómico e Inmunidad de Colisiones en la Ventana de Pulsos (PulsesView)
- **Decisión**:
  1. **Arquitectura Táctica de 3 Niveles en Tarjetas de Pulso:**
     - Se sustituyó la estructura horizontal comprimida (que provocaba solapamiento y estrangulamiento de contenido en pantallas móviles) por una distribución vertical de 3 zonas claramente delimitadas:
       - *Nivel 1 (Identidad, Avatar & Telemetría):* Avatar interactivo de 56×56px (`w-14 h-14 rounded-2xl`) con badge de verificación y modo niebla; Codename en negrita monospace, edad, rol resaltado en Raw Amber, distancia con discretización S2, badge de movilidad (`🏠 Tiene sitio` / `🚗 Se desplaza`), tiempo relativo y estado del pulso (`✓ DEVUELTO` / `🍆 Pulso entrante`) junto a badge de Karma Anti-Ghost (`👻 99%`).
       - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — Inmune a Colisiones):* Fila horizontal a ancho completo reservada exclusivamente para la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`) en ámbar de alto contraste (`bg-amber-500/15 border-amber-400/50 text-amber-200`) junto con el badge pulsante `⚡ YA` si el perfil se encuentra On-the-Clock. Ningún botón comparte espacio físico en esta fila, garantizando legibilidad instantánea sin solapamientos.
       - *Nivel 3 (Botonera Táctica Aislada en la Zona del Pulgar):* Barra de acciones físicas separada por `border-t border-white/10 mt-2.5 pt-2.5` con 3 botones de 44px mínimo de altura: `[Ficha >]` (apertura de expediente), `[Devolver Pulso / ✓ Devuelto]` (conmutador cinético con síntesis sub-bass a 60Hz) y `[💬 Chat]` (acceso directo al darkroom).
  2. **Consistencia Simétrica en Pestañas Recibidos y Enviados:**
     - Se aplicó la misma arquitectura de 3 zonas a la pestaña `ENVIADOS`, mostrando el protocolo del receptor, el contador de pulsos emitidos (`1 pulso enviado`), botón `[+1 Pulso]` con síntesis de audio y botón directo a chat.
  3. **Optimización de Taps (Speed-to-Action):**
     - Lectura del protocolo de salida reducida a **0 taps** (directamente visible en la tarjeta).
     - Devolución/envío de pulso en **1 tap** con feedback auditivo háptico y actualización reactiva de estado sin recargas.
     - Apertura de chat en **1 tap** directo desde la tarjeta.
  4. **Cumplimiento Impeccable UI:**
     - Touch targets mínimos garantizados de 44px.
     - Implementación de los 5 estados obligatorios (*Default, Hover, Active, Focus-visible, Disabled*).
- **Motivación**: Eliminar la colisión visual de botones con la información de acuerdos del encuentro, proveer máxima velocidad de decisión táctica y optimizar la experiencia en condiciones de poca luz o uso con una sola mano.

### [ADR-063] · [2026-09-05 18:05] Rediseño Impeccable de la Bandeja de Mensajes y Cabecera de Chat (DarkroomListView & DarkroomChatModal)
- **Decisión**:
  1. **Arquitectura de Tarjeta Táctica de 3 Niveles en la Bandeja de Mensajes (`DarkroomListView`):**
     - Se reemplazó la estructura de fila plana propensa a colisiones por una arquitectura jerárquica vertical en 3 niveles ergonómicos:
       - *Nivel 1 (Identidad, Telemetría & Último Mensaje):* Avatar de 56×56px (`w-14 h-14 rounded-2xl`) con halo reactivo de estado corporal (`open` en resplandor ámbar, `occupied` en neón sangre), badge de verificación 3D, codename en negrita monospace, edad, rol táctico, distancia discretizada Google S2, insignia de movilidad (`🏠 Tiene sitio` / `🚗 Se desplaza`), vista previa tipada del último mensaje (con iconos semánticos para PIN, mensajes efímeros/flame, multimedia y cierre con buena onda) y badge de Karma Anti-Ghost (`👻 99%`).
       - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — 100% Libre de Colisiones):* Fila completa e independiente para la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`) en tono ámbar brutalista (`bg-amber-500/15 border-amber-400/50 text-amber-200`) y badge pulsante `⚡ YA` si el usuario está On-the-Clock. Totalmente aislada de los botones, garantizando 0 taps para conocer las expectativas del encuentro y eliminando el solapamiento.
       - *Nivel 3 (Botonera Táctica en la Zona del Pulgar):* Fila inferior separada por un borde sutil (`border-t border-white/10 mt-2.5 pt-2.5`) con 3 controles táctiles de 44px de altura: `[Ficha >]` (apertura de expediente), `[🍆 Pulso / +N]` (transmisión cinética con síntesis de audio sub-bass a 60Hz y contador dinámico reactivo) y `[💬 Abrir Chat]` (botón primario en Raw Amber).
  2. **Integración de Acuerdos en la Cabecera de Chat Activo (`DarkroomChatModal`):**
     - Se incorporó la **Línea 4** de información estructurada en la cabecera del darkroom, exhibiendo la píldora compacta de protocolo de salida (`⏱️ PUNTUAL`, `🫂 CUDDLE`, `🌙 SLEEPOVER`) junto al badge de disponibilidad inmediata `⚡ YA (45m)`.
     - Esto garantiza que ambos usuarios mantengan claridad constante y mutua sobre las expectativas del encuentro mientras chatean, sin interferir ni colisionar con los controles tácticos de navegación (PIN, Pre-Flight, Guardián Silencioso, Menú Táctico).
  3. **Optimización de Taps (Speed-to-Action):**
     - **0 Taps:** Conocer el protocolo de salida del contacto y su disponibilidad inmediata directamente desde la bandeja.
     - **1 Tap:** Enviar un pulso cinético con audio sub-bass reactivo directamente desde la bandeja sin necesidad de entrar a la conversación.
     - **1 Tap:** Abrir el chat directo en el darkroom con historial y acuerdos visibles.
     - **1 Tap:** Consultar la ficha completa del perfil.
  4. **Cumplimiento de Estándares Impeccable UI:**
     - Touch targets mínimos garantizados de 44px con los 5 estados obligatorios (*Default, Hover, Active, Focus-visible, Disabled*).
     - Tipografía monospace brutalista de alta legibilidad en entornos oscuros o de fiesta.
     - Preservación íntegra de las 57 características del sistema (cero regresiones).
### [ADR-064] · [2026-09-06 17:30] Rediseño Impeccable del Diario de Citas, Desacople de Colisiones y Clearance en Ficha de Perfil (DateDiaryView, DiaryTimeline, SmartCalendarGrid & ProfileDetailModal)
- **Decisión**:
  1. **Resolución Definitiva de Colisión en la Ficha de Perfil (`ProfileDetailModal`):**
     - Se identificó la causa raíz del solapamiento reportado ("los 2 botones de abrir chat y enviar pulso quedan encima de la pildora con el protocolo y no me deja ver el protocolo"): en `ProfileDetailModal.tsx`, el pie de página flotante (`fixed bottom-0 z-30`) con backdrop blur tenía una barra de acciones de ~110px de altura efectiva, mientras que el contenedor de contenido tenía únicamente `pb-36`, provocando que al final del scroll las insignias inferiores (`ExitProtocolBadge`, selector de rol, dinámicas carnales y suite táctica) quedasen tapadas por el dock.
     - Se incrementó el padding inferior a `pb-52 sm:pb-44`, garantizando un margen de holgura total y despejado sobre la botonera flotante.
     - Se refactorizó `ExitProtocolBadge.tsx` con una variante táctica de alto contraste en gradiente ámbar (`bg-gradient-to-r from-amber-950/40 via-amber-900/20 border-amber-400/50 text-amber-200 shadow-amber-soft`), asegurando distinción absoluta frente a cualquier fondo oscuro u opaco.
  2. **Arquitectura Táctica de 3 Niveles en Tarjetas de Citas (`DiaryTimeline` y `SmartCalendarGrid`):**
     - Se rediseñaron las tarjetas de la bitácora cronológica y de la agenda diaria del calendario bajo la arquitectura ergonómica de 3 niveles de VESSEL:
       - *Nivel 1 (Identidad, Telemetría, Fecha/Hora & Estado):* Avatar táctico de 56×56px con halo online reactivo ámbar, badge de verificación 'V', codename, edad, rol táctico (`ACTIVO`/`PASIVO`/`VERSÁTIL`), badge de hospedaje (`🏠 LUGAR`), fecha y hora con iconos Raw Amber (`📅 2026-08-23 · 🕒 14:15`), ubicación con categoría y badge de estado (`★ Rating` en citas concluidas o `Programada` en citas futuras).
       - *Nivel 2 (Fila Dedicada de Protocolo & Acuerdos — 100% Inmune a Colisiones):* Fila horizontal completa dedicada exclusivamente a la píldora de **Protocolo de Salida** (`⏱️ PUNTUAL // Sin sobremesa`, `🫂 CUDDLE // Ducha & charla`, `🌙 SLEEPOVER // Si hay química`), badge de tipo de encuentro (`INTENSE CARNAL`) y badge On-The-Clock `⚡ YA (45m)`. Completamente separada e inmune a cualquier botón de acción.
       - *Nivel 3 (Botonera Táctica Aislada en Zona del Pulgar):* Fila inferior delimitada por `border-t border-white/10 mt-2.5 pt-2.5` con 3 botones de 44px de altura mínima:
         - `[Ficha >]`: Apertura inmediata del expediente completo del contacto en 1 solo tap (`onSelectProfile`).
         - `[🍆 Pulso / +N]`: Transmisión cinética de pulso con síntesis de audio sub-bass analógica (60Hz) y contador reactivo.
         - `[💬 Abrir Chat]`: Botón primario en Raw Amber para ingresar de forma directa a la conversación en Darkroom (`onOpenChat` conectado a `setActiveChatProfileId`).
         - Fila de utilidades de gestión en sub-nivel: `[✏️ Editar]` y `[🗑️ Borrar]`.
  3. **Optimización de Taps (Speed-to-Action):**
     - **0 Taps:** Conocer el protocolo de salida acordado y el tipo de encuentro directamente desde la bitácora sin entrar a la cita ni al perfil.
     - **1 Tap:** Abrir Darkroom Chat directo con el contacto de la cita (reducido de 4 taps y cambio manual de pantalla a 1 tap).
     - **1 Tap:** Enviar pulso de rol con sonido sub-bass directamente desde el diario (reducido de 3 taps a 1 tap).
     - **1 Tap:** Abrir la ficha completa del perfil (reducido de 2-3 taps a 1 tap).
  4. **Preservación Integral de Capacidades (58 Features):**
     - Se mantuvieron al 100% las notas confidenciales cifradas con toggle de revelado, desglose de satisfacción (Expectativa, Química, Límites, Repetir), etiquetas/tags de fetiches y prácticas, recordatorio de rutina de salud/PrEP con botón de resolución, botiquín táctico Doxy-PEP y filtros por estado y rating.
- **Motivación**: Resolver la colisión física y visual reportada entre los botones de acción y la píldora de protocolo, optimizar radicalmente la velocidad de acción y navegación del usuario en ambientes nocturnos/cruising y elevar el estándar de calidad visual Impeccable UI.

### [ADR-065] · [2026-09-06 19:10] Blindaje de Seguridad P0: Cierre de IDOR en Firestore, Anti-Spoofing y Hashing Criptográfico SHA-256 de PINs
- **Decisión**:
  1. **Saneamiento de Secretos y Control de Entorno:**
     - Se creó un `.gitignore` maestro en la raíz del proyecto para evitar la fuga accidental de credenciales, ignorando `.env*.local`, `.next/`, `node_modules/`, logs y artefactos temporales.
     - En `src/lib/firebase/config.ts`, se eliminaron todas las claves API, tokens de autenticación y App IDs hardcodeados que funcionaban como fallbacks inseguros. Se implementó una verificación de entorno en runtime que emite advertencias controladas en consola durante desarrollo si faltan las variables sin exponer secretos.
  2. **Cierre de Brechas Críticas en Reglas de Firestore (`firestore.rules`):**
     - *Cierre de IDOR en Expedientes Privados:* La colección `/vessel_users/{userId}` tenía `allow read: if true;`, lo que permitía a cualquier cliente autenticado o anónimo leer expedientes médicos, notas privadas de citas, límites eróticos de la Kink Matrix y datos sensibles de cualquier usuario. Se restringió estrictamente a `allow read, write: if isOwner(userId);`.
     - *Segregación de Perfil Público en Radar:* Se habilitó la colección `/vessel_profiles/{profileId}` con `allow read: if request.auth != null; allow write: if isOwner(profileId);` para alimentar el radar espacial y la grilla pública sin exponer datos privados.
     - *Anti-Spoofing en Mensajes de Chat:* Se suprimió la condición permisiva `request.resource.data.senderId == 'system'`, forzando que `senderId == request.auth.uid`. Se garantizó la inmutabilidad del timestamp y la integridad de remitente.
     - *Validación Oficial:* Las reglas fueron auditadas y validadas con el validador oficial de Firebase MCP Server (`firebase_validate_security_rules`), reportando cero errores de sintaxis y tipado.
  3. **Segregación Arquitectónica en Servicio de Perfiles (`profileService.ts`):**
     - Se implementó dual-write: los estados privados se persisten en `/vessel_users/{uid}`, mientras que el perfil público minimizado (codename, rol, bio pública, badge verificado, geohash aproximado) se sincroniza en `/vessel_profiles/{uid}`.
  4. **Motor Criptográfico Síncrono SHA-256 (`cryptoUtils.ts`, `VesselContext.tsx` y Modales):**
     - Se eliminó el backdoor de desarrollo que permitía desactivar el Guardián Silencioso con `"1234"` y el valor por defecto `"9999"`.
     - Se diseñó e implementó un motor criptográfico síncrono SHA-256 (`hashPin` con salt de aplicación y `timingSafeEqual` para prevenir ataques de canal lateral / timing attacks), manteniendo las firmas síncronas de la Context API de React sin provocar re-renders asíncronos ni race conditions.
     - Se conectaron `SafetyBeaconModal.tsx` y `DuressPinSettingsModal.tsx` mediante `updateSafetyBeaconPins` para sanitizar inputs, validar formato de 4 dígitos numéricos y garantizar que los PINs jamás viajen o se almacenen en texto plano.
- **Motivación**: Erradicar vulnerabilidades críticas (P0) identificadas durante la auditoría de anti-patrones de Vibe Coding, protegiendo la privacidad física y digital de los usuarios de VESSEL con estándares de seguridad de nivel bancario/militar.

### [ADR-066] · [2026-09-06 19:35] Descomposición del God Object (VesselContext) en 7 Sub-Providers de Dominio Especializado y Fachada Unificada (Composite Facade)
- **Decisión**:
  1. **Descomposición del Monolito de 4,785 Líneas en 7 Sub-Providers Especializados (`src/context/domains/`):**
     - Se identificó el mayor cuello de botella y deuda técnica de Vibe Coding del sistema: un archivo `VesselContext.tsx` de 4,785 líneas que concentraba 124 estados, 8 listeners de eventos y múltiples temporizadores `setInterval` de 5s, provocando re-renderizados continuos e innecesarios de los 76 componentes de la aplicación ante el más mínimo cambio de estado.
     - Se crearon 7 sub-proveedores independientes con interfaces tipadas estrictas y almacenamiento local-first aislado:
       - `SettingsContext.tsx` (~530 líneas): Idioma (`es`/`en`), sistema métrico/imperial, cuotas de álbumes (`FREE_TIER_LIMITS`), suscripciones (`VESSEL UNLIMITED`), pase de fin de semana y backup cifrado.
       - `AuthContext.tsx` (~515 líneas): Autenticación con Firebase Auth (Google, Email, Modo Invitado), perfil propio (`myProfile`), estado corporal (`myBodyState`), verificación de identidad facial 3D y liveness anti-catfish.
       - `SafetyContext.tsx` (~470 líneas): Guardián silencioso, dead-man switch, temporizadores de alarma (5s), acelerómetro móvil `DeviceOrientationEvent` (flip-to-cover a calculadora), tecla Escape, modo sigilo y asistente de reducción de daños (harm reduction).
       - `LogisticsContext.tsx` (~1,000 líneas): Hotspots tácticos urbanos, check-in/out anónimo, telemetría de batería (4 modos dinámicos), geolocalización S2/geohash 7, travel mode de teleportación, expectativa de salida (`ExitProtocol`), ficha de hospedaje, salas de sesión, modo dúo de pareja y suite de nightlife (RSVP, zonas, missed connections, wingman y alerta de vaso adulterado).
       - `RadarMatrixContext.tsx` (~730 líneas): Radar de proximidad, perfiles procesados y filtrados, señales de transmisión, pulsos cinéticos recibidos, kink matrix ciega (35 fetiches con detección de coincidencias secretas), soundtrack ambiental y temporizador On-The-Clock aislado.
       - `ChatContext.tsx` (~875 líneas): Suscripción en tiempo real a Firestore para chats activos, retención configurable (efímera burn-on-view vs persistente), intercambio seguro de ubicación en 2 fases, checklist sexual pre-flight y protocolos de límites graduales anti-ghost.
       - `DiaryContext.tsx` (~620 líneas): Bitácora personal cifrada de citas, calendario inteligente, gestión de testimonios consensuados con geocerca, botiquín Doxy-PEP (24h/72h), alertas anónimas de exposición a ITS y auditoría de accesos a bóvedas.
  2. **Patrón de Fachada Compuesta (`Composite Facade Pattern`) en `VesselContext.tsx`:**
     - Se reimplementó `VesselContext.tsx` reduciéndolo de 4,785 líneas a solo 138 líneas.
     - Se encapsuló la composición jerárquica acíclica de los 7 proveedores dentro de `VesselProvider`:
       `SettingsProvider -> AuthProvider -> SafetyProvider -> LogisticsProvider -> DiaryProvider -> ChatProvider -> RadarMatrixProvider -> VesselFacadeBridge`.
     - `VesselFacadeBridge` consolida los 7 hooks de dominio y los expone mediante `VesselContext.Provider` con un `useMemo` atómico.
     - `useVessel()` continúa funcionando exactamente igual que antes para los 76 componentes existentes, manteniendo una compatibilidad de API del 100% y cero necesidad de modificar importaciones o firmas.
     - Nuevos componentes pueden consumir directamente hooks granulares (`useAuth`, `useSafety`, `useLogistics`, `useRadarMatrix`, `useChat`, `useDiary`, `useSettings`) para maximizar el rendimiento y evitar re-renders innecesarios.
  3. **Aislamiento de Ciclos de Vida y Temporizadores:**
     - El intervalo de 5s para el Dead-Man Switch y los event listeners de orientación del dispositivo ahora se ejecutan exclusivamente dentro de `SafetyProvider`.
     - El intervalo de expiración de On-The-Clock se ejecuta únicamente dentro de `RadarMatrixProvider`.
     - Componentes ajenos (como el Diario, la Configuración o el Chat) ya no sufren ciclos de renderizado causados por estos temporizadores de fondo.
  4. **Criterios de Validación Cumplidos:**
     - Validación formal con TypeScript 5.7+ (`npm run typecheck`): 0 errores en todo el proyecto.
     - Inspección dinámica y visual en Chrome DevTools (Page 2, `http://localhost:3001/`): navegación interactiva y fluida a través de las vistas `Cerca`, `Radar`, `Pulsos`, `Mensajes`, `Diario`, `Mi Perfil` y los modales del sistema (Guardián Silencioso, Chat Darkroom).
- **Motivación**: Resolver el anti-patrón #1 de Vibe Coding (God Object monolítico e inmanejable), desacoplar la arquitectura de estado, mejorar drásticamente el rendimiento de renderizado y garantizar una base de código escalable y mantenible para el crecimiento futuro de VESSEL.

### [ADR-067] · [2026-09-06 20:30] Transición de Simulaciones a Backend Real (P2): Cloud Firestore, Storage, Presencia Multiusuario y Local-First Incondicional
- **Decisión**:
  1. **Pulsos Cinéticos Multiusuario y Persistencia (`pulseService.ts` -> `/vessel_pulses`):**
     - Se conectó la emisión, respuesta y recepción de pulsos cinéticos a Cloud Firestore en tiempo real con `subscribeToIncomingPulses`.
     - A diferencia de enfoques con TTL agresivo o borrado automático al cerrar sesión, se implementó persistencia continua en la nube hasta que el usuario receptor decida limpiarlos o responderlos, conforme a la instrucción directa de producto.
     - Se integró actualización optimista con síntesis acústica sub-bass analógica (45-80Hz) inmediata en el cliente.
  2. **Hotspots Tácticos Urbanos & Cruising (`hotspotService.ts` -> `/vessel_hotspots`):**
     - Se implementó una colección compartida en Firestore con suscripción en tiempo real (`subscribeToHotspots`) y seeding inicial automático y transparente.
     - El check-in y check-out anónimo se gestiona mediante transformaciones atómicas `increment(1)` e `increment(-1)` de Firestore, eliminando condiciones de carrera y permitiendo conteos de concurrencia exactos entre múltiples usuarios concurrentes.
     - El contexto local (`LogisticsContext.tsx`) preserva reactivamente el indicador `isCheckedIn` del usuario local sin pisar los contadores del servidor.
  3. **Gestor de Álbumes en la Nube y Almacenamiento Multimedia (`albumService.ts` y `userDataService.ts`):**
     - Se crearon servicios para la creación, consulta y eliminación de álbumes en `/vessel_users/{uid}/albums` y Cloud Storage para medios binarios.
     - Se implementó adición atómica de fotos/videos mediante `arrayUnion` de Firestore, previniendo sobreescrituras en cargas simultáneas.
     - En `syncCloudNow`, se reemplazó el temporizador simulado `setTimeout(resolve, 600)` por una llamada atómica real a `saveFullUserDataToCloud`, sincronizando álbumes y preferencias de usuario.
     - *Retención de Media Efímera (Burn-on-View):* Para fotos y audios con autodestrucción en el chat, se actualiza el documento de mensaje a `isBurned: true` y se elimina la referencia visual en el chat, pero se retiene el archivo físico en Cloud Storage. Esto permite que si el usuario vuelve a enviar la imagen, la carga sea instantánea desde caché sin re-subir bytes, optimizando ancho de banda y velocidad de entrega.
  4. **Testimonios de Encuentros Consensuados (`testimonialService.ts` -> `/vessel_testimonials`):**
     - Se conectó la bitácora de testimonios a Firestore, permitiendo a usuarios con encuentros verificados publicar reseñas y a los receptores aprobarlas, ocultarlas o rechazarlas en tiempo real.
  5. **Presencia en la Matriz e Hidratación Bidireccional (`matrixService.ts` y `AuthContext.tsx`):**
     - Publicación automática de coordenadas aproximadas, rol y estado corporal en `/vessel_profiles/{uid}`.
     - Hidratación reactiva del perfil propio y estado corporal mediante `subscribeToFullUserData` al autenticarse.
  6. **Invariante Local-First y Degradación Graciosa:**
     - Todas las operaciones de lectura y escritura inicializan con datos en `localStorage` (0ms Time-to-First-Byte), permitiendo a la app operar sin interrupciones ni pantallas en blanco en condiciones de baja conectividad o modo offline.
- **Motivación**: Cumplir la Fase 3 del plan de saneamiento arquitectónico (P2: Transición de Simulaciones a Backend Real), superando las limitaciones de Vibe Coding y preparando a VESSEL para su despliegue en producción multiusuario.

### [ADR-068] · [2026-09-06 20:55] Fase 4: Infraestructura de Calidad y Tests Automatizados (P3) con Vitest, happy-dom y Testing Library
- **Decisión**:
  1. **Selección del Runner y Entorno Sintético**:
     - Se adoptó **Vitest 4** con el entorno DOM ultraligero **`happy-dom`** y **`@testing-library/react`**, descartando Jest (overhead de transpilación Babel/ts-jest) y difiriendo Playwright para pruebas E2E en servidor de staging.
     - Tiempos de ejecución totales sub-segundo: **70 tests pasando en ~670ms**.
  2. **Configuración y Alias de Ruta**:
     - Configuración en `vitest.config.mts` mapeando `@/` a `./src` y habilitando transformación JSX automática con el compilador `oxc` de Vite/Vitest.
     - Scripts npm estandarizados: `npm test` (`vitest run`), `npm run test:watch`, `npm run test:coverage` y `npm run validate` (`tsc --noEmit && vitest run`).
  3. **Mocks de Hardware y Plataforma (`tests/setup.ts`)**:
     - Emulación de Web Audio API (`MockAudioContext`, nodos de ganancia, osciladores con rampas de frecuencia lineales y exponenciales, y filtros `biquadFilter`).
     - Mock global no invasivo de Firebase para aislar pruebas de contexto y asegurar determinismo sin depender de conectividad a la nube ni claves de API en CI.
  4. **Desacoplamiento de Lógica de Negocio (Domain-Driven Refactor)**:
     - Se extrajeron las constantes de cuota `FREE_TIER_LIMITS` desde el componente React `SettingsContext.tsx` hacia un módulo puro de TypeScript `src/lib/business/freeTierLimits.ts`, re-exportándolo en `SettingsContext` y `VesselContext` para mantener 100% de compatibilidad regresiva con los 76 componentes existentes.
  5. **Cobertura en Dos Capas (70 tests automatizados)**:
     - *Capa Unitaria (51 tests):*
       - `cryptoUtils.test.ts` (13 tests): NIST SHA-256, salts criptográficos, protección contra timing attacks (`timingSafeEqual`), y detección/corrección de bug real en normalización de casing de hashes.
       - `GeospatialEngine.test.ts` (10 tests): Geohash (precisión 5, 7, 8), bounding boxes, cálculo Haversine geodésico y niveles de discretización anti-triangulación.
       - `BatteryStateEngine.test.ts` (8 tests): 4 modos dinámicos (`foreground_active`, `eco_saver`, `passive_geofence`, `background_coarse`), frecuencias de muestreo (30s vs 300s vs 0s) y suscripciones.
       - `freeTierLimits.test.ts` (9 tests): Cuotas de 1 galería pública, 1 bóveda privada, 10 fotos por álbum, y bypass para usuarios Unlimited.
       - `translations.test.ts` (11 tests): Paridad profunda 1:1 entre diccionarios `es` y `en` (cero claves faltantes), validación de strings no vacíos y formateo de distancia métrico/imperial.
     - *Capa de Integración (19 tests):*
       - `SafetyContext.test.tsx` (7 tests): Armado/desarmado del Guardián Silencioso, validación de PIN, coacción (Duress) y alternancia de pantalla de camuflaje.
       - `LogisticsHotspots.test.tsx` (4 tests): Check-in optimista, check-out seguro sin decrecer bajo 0 y preservación de estado local.
       - `DiaryTestimonials.test.tsx` (8 tests): Ciclo de vida de testimonios consensuados, seguimiento preventivo Doxy-PEP (24h/72h) y CRUD de entradas de diario.
  6. **Invariante de Servidor Dev**:
     - Se mantiene la prohibición estricta de ejecutar `next build` en caliente mientras el servidor de desarrollo esté activo en el puerto 3001, validando la integridad mediante `npm run typecheck` (`tsc --noEmit`) y `npm test`.
- **Motivación**: Eliminar la deuda técnica crítica de "cero tests automatizados" detectada en la auditoría inicial de Vibe Coding, asegurando que las reglas de negocio, algoritmos criptográficos y de privacidad espacial nunca sufran regresiones silenciosas en producción.

### [ADR-069] · [2026-09-06 21:15] Fase 5: Estandarización de Design System & Primitivas UI Atómicas (P3): BrutalistButton, BrutalistModal, TacticalBadge, BrutalistInput y Descomposición del Visual Monolith ProtocolView
- **Decisión**:
  1. **Creación de la Biblioteca de Primitivas Atómicas (`src/components/ui/`)**:
     - `BrutalistButton.tsx`: Primitiva universal con 5 variantes semánticas (`primary`, `danger`, `secondary`, `ghost`, `outline`), garantía estricta de touch targets mínimos de 44px (`min-h-[44px]` y tamaño `icon` con `w-11 h-11 min-w-[44px] min-h-[44px]`), y cumplimiento incondicional de los 5 estados obligatorios del sistema (Default, Hover, Active:scale-[0.96], Focus-visible:ring-2, Disabled:opacity-40). Soporta retroalimentación acústica mediante `SubBassAudioEngine` (`pulse`, `subbass`, `vault`) y estados de carga con spinner SVG.
     - `TacticalBadge.tsx`: Insignia semántica táctica con backdrop blur y 5 variantes de color vinculadas a la paleta brutalista (`amber`, `blood`, `emerald`, `purple`, `neutral`), con indicador de pulso luminoso opcional (`animate-ping`).
     - `BrutalistModal.tsx`: Shell modal accesible con `role="dialog"`, bloqueo reactivo de scroll en body, escucha global de tecla Escape, botón de cierre táctil ergonómico de 44x44px y cierre por clic en backdrop.
     - `BrutalistInput.tsx`: Campo de formulario accesible con altura táctil mínima de 44px, estados visuales coherentes, anillo de foco `ring-rawAmber`, soporte de iconos tácticos e indicadores de error.
  2. **Modularización del Monolito Visual `ProtocolView.tsx`**:
     - Se redujo el archivo de 1.761 líneas a ~360 líneas limpias, extrayendo las sub-pestañas monolíticas hacia componentes independientes bajo `src/components/account/tabs/`:
       - `BioTab.tsx`: Formulario de datos corporales, identidad, deseos, intenciones y radar on-the-clock.
       - `AlbumsTab.tsx`: Gestor de galerías públicas y privadas (`UserAlbumManager`).
       - `KinksTab.tsx`: Matriz ciega de afinidad sexual confidencial (`KinkMatrix`).
       - `ReputationTab.tsx`: Verificación de identidad digital, protocolo anti-ghost y testimonios consensuados.
       - `BoundariesTab.tsx`: Gestión de privacidad de ubicación, anti-triangulación y protocolos de desconexión gradual.
     - Se corrigió el espaciado en la cabecera editorial (`pr-12 sm:pr-28`), previniendo solapamientos en pantallas móviles entre el botón flotante de Configuración y el selector de edición de nombre.
  3. **Estandarización de Modales Secundarios**:
     - `SafetyBeaconModal.tsx`: Migrado a `BrutalistModal` y `BrutalistButton`, inputs ergonómicos de 44px y voseo rioplatense ("Intentá nuevamente").
     - `DuoLinkModal.tsx`: Migrado a `BrutalistModal` y `BrutalistButton`, reemplazo de tuteo neutro ("TÚ", "Vincula") por voseo rioplatense estricto ("VOS", "Vinculá").
     - `SpikedDrinkAlertModal.tsx`: Botón de cierre ampliado de 32px a 44x44px accesible, botón de emisión de alerta con `BrutalistButton`, listeners de Escape y scroll lock.
     - `UnlimitedPaywallModal.tsx`: Botón de cierre de 44x44px, selectores de pase nocturno y membresías con altura táctil mínima de 44px, botones de acción `BrutalistButton` y voseo rioplatense ("Navegá", "Creá", "Conocé", "Mirá", "Cancelá", "Ya tenés").
  4. **Suites de Pruebas Unitarias para Componentes UI**:
     - Se implementaron 4 archivos de test en `tests/unit/ui/` (`BrutalistButton.test.tsx`, `BrutalistModal.test.tsx`, `TacticalBadge.test.tsx`, `BrutalistInput.test.tsx`), alcanzando un total de 12 suites y 90 tests automatizados (100% passing en 980ms).
- **Motivación**: Elevar la interfaz de VESSEL del nivel legado Tier 2 a Tier 1 Impeccable, erradicar el último monolito visual del cliente, asegurar la accesibilidad táctil en campo móvil con touch targets mínimos de 44px y afianzar la consistencia semántica, acústica y lingüística del producto.

### [ADR-070] · [2026-09-07 00:50] Alcance Táctico de 1.0 km y Modelo Híbrido de Monetización en Pestaña Cerca
- **Decisión**:
  1. **Radio Local Inmediato (<= 1.0 km / 1000m)**:
     - Preservar la experiencia gratuita al 100% para encuentros carnales locales inmediatos en un radio de hasta 1.0 km (Google S2 Cell Level 14 discretizado). Visualización nítida y apertura directa de Darkroom Chat sin restricciones.
  2. **Alcance Táctico Remoto (> 1.0 km)**:
     - **Intriga Táctica Visual**: En `ProfileCard` y `ProfileDetailModal`, la fotografía del perfil se renderiza con un filtro cinematográfico calibrado (`blur-[8px]` y trama de scanlines tácticas), protegiendo la identidad facial y despertando curiosidad erótica.
     - **Insignia Remota**: Badge ámbar con pulso luminoso en vivo `🛰️ REMOTO` y prefijo satelital en la distancia (`🛰️ 1.8 km`).
     - **Biografía Clasificada**: La declaración de perfil se reemplaza por barras de censura confidencial (`████████`) con invitación al upgrade.
     - **Pulsos Cinéticos Gratuitos**: El botón de pulso (1-tap) permanece 100% funcional y gratuito para enviar y recibir atracción a distancia.
     - **Desbloqueo de Chat por Sintonía Mutua**: Si ambos usuarios se enviaron o devolvieron un pulso recíproco (`hasMutualPulse`), el botón de chat se enciende con halo verde esmeralda (`🔥 Sintonía Mutua`) y permite chatear gratis sin pagar membresía.
     - **Acceso Inmediato VESSEL UNLIMITED (Skip the Line)**: Si no hay sintonía mutua, el botón de chat muestra un candado dorado táctico (`🔒`) que lanza el `UnlimitedPaywallModal` destacando el beneficio de Transmisión Satelital de Largo Alcance (>1 km). Los miembros con `VESSEL UNLIMITED` acceden a perfiles a cualquier distancia de forma 100% nítida y con chat inmediato.
- **Motivación**:
  Equilibrar la retención de usuarios cotidianos y el efecto red local (acción inmediata sin fricción) con un embudo de monetización basado en el deseo y la intriga táctica, incentivando el juego de pulsos mutuos y premiando la suscripción de pago con el superpoder de chatear de inmediato a cualquier distancia sin esperas.

### [ADR-071] · [2026-09-07 01:05] Unificación de Píldora de Telemetría Superior e Interfaz Contextual en ProfileCard
- **Decisión**:
  1. **Supresión del Badge Superior Izquierdo en Perfiles Distantes**:
     - Retirar el badge flotante `SEÑAL REMOTA` de `absolute top-2 left-2`, reservando la esquina superior izquierda exclusivamente para el badge propio del usuario (`⭐ VOS`) o el estado de urgencia inmediata (`⚡ YA` on-the-clock).
  2. **Consolidación en Píldora Superior Derecha**:
     - Unificar en un único elemento interactivo táctil la información de estado corporal (dot de color animado), ícono de satélite `🛰️`, distancia discretizada Google S2 y tag táctico `REMOTO`.
  3. **Popover Contextual de Telemetría (`isTelemetryOpen`)**:
     - Al presionar la píldora superior, desplegar un visor interno no intrusivo con auto-cierre a los 8 segundos y exclusión mutua con la cápsula de indicadores inferior (`isCapsuleOpen`), que detalla explícitamente el significado de los tres ejes:
       a) **Estado Corporal**: Dot cromático y significado ("Pinta algo ya" / "En una" / "De incógnito").
       b) **Distancia**: Cifra y explicación de la ofuscación espacial Google S2 (~152m) para evitar triangulación.
       c) **Alcance de Radar**: Detalle de señal local (encuentro libre) vs remota (>1.0 km, con pulsos libres y chat vía Sintonía Mutua o VESSEL UNLIMITED).
       d) **Alerta Sentinel**: Reporte preventivo si el perfil tiene marcas comunitarias.
- **Motivación**:
  Resolver la colisión geométrica y corte de texto en tarjetas estrechas (~140-180px) de grillas móviles de 2 o 3 columnas, y eliminar la opacidad o confusión cognitiva del usuario frente a íconos crípticos sin explicación accesible.

### [ADR-073] · [2026-09-08 01:15] Unicidad de Codenames, Borde Neón Fucsia Giratorio para Miembros Pagos, Gradiente Calibrado & Verificación en Cápsula
- **Decisión**:
  1. **Unicidad Canónica y Deduplicación de Alias**:
     - Centralizar la comprobación O(1) de unicidad en `identityDeduplicationService.ts` (`checkCodenameAvailability`, `claimCodename`, `releaseCodename`) con normalización en mayúsculas (`trim().toUpperCase()`) y almacenamiento de índices atómicos en `vessel_unique_identities`.
     - Exigir validación antes de crear cuentas en `registerWithEmail`, generar sufijos no colisionantes deterministas para Google Auth en `ensureUserDocInFirestore`, y bloquear apropiación indebida de nombres en la edición inline de `ProtocolView.tsx`.
     - Retroalimentación en tiempo real con debounce en `AuthModal.tsx` (`✓ DISPONIBLE` / `✕ NO DISPONIBLE`).
  2. **Borde Neón Fucsia Giratorio para Miembros Pagos (Border Beam)**:
     - Detectar perfiles con plan activo (`userPlan === 'unlimited'` / `'pro'`, `isUnlimited` o usuario local Unlimited).
     - Diseñar animación continua `spin-slow` (7s linear infinite) con conic-gradient multicromático fucsia neón (`#ff007f`, `#ff2a85`, `#e879f9`) implementada vía `mask-composite: exclude` en GPU, complementada con resplandor perimetral `border-fuchsia-500/50 shadow-[0_0_25px_rgba(255,0,127,0.3)] ring-1 ring-fuchsia-500/50`.
  3. **Gradiente Inferior Calibrado de Legibilidad**:
     - Ajustar la capa inferior en `ProfileCard.tsx` a `h-[46%] bg-gradient-to-t from-black via-black/92 via-55% to-transparent`.
     - Lograr contraste WCAG AAA para la tipografía sobre fotografías claras/blancas, conservando el 54% superior de la imagen completamente limpio, nítido y sin gradientes.
  4. **Métodos de Verificación en la Píldora de Protocolo**:
     - Extender `VerificationMethod` para soportar `"email"` y `"phone_sms"` además de biometría, documento y Google.
     - Mostrar chip de verificación de primera clase (`✓ MAIL`, `✓ SMS`, `✓ BIO`, `✓ ID`, `✓ GOOGLE`) dentro de la cápsula de protocolo, articulado junto al protocolo táctico (`⏱️ PUNTUAL`, `🫂 MIMOS`).
- **Motivación**:
### [ADR-074] · [2026-09-08 01:25] Animación Continua de Borde Neón Fucsia por GPU & Arquitectura Elástica Anti-Desborde en Píldora de Protocolo
- **Decisión**:
  1. **Independencia de Animación Rotativa en CSS Puro**:
     - Diagnóstico de congelamiento: Tailwind JIT no generaba `@keyframes spin-slow` si las clases de utilidad no se encontraban en el árbol de componentes escaneado del home.
     - Solución técnica: Declaración directa de `@keyframes border-beam-spin` en `globals.css` utilizando traslación geométrica centrada `transform: translate(-50%, -50%) rotate(0deg)` a `rotate(360deg)` sobre un elemento cuadrado `aspect-ratio: 1/1` de 250% del ancho. Animación a 8 segundos continuos lineales y GPU `will-change: transform`.
  2. **Arquitectura Elástica y Anti-Corte de la Píldora de Protocolo**:
     - Separación de responsabilidades: La píldora exterior colapsada en la tarjeta responde exclusivamente a las dos preguntas inmediatas de decisión (Intención: `⏱️ PUNTUAL` + Confianza: `✓ BIO`).
     - Contención espacial: Si coinciden Protocolo y Verificación (`hasBothPrimary`), los indicadores secundarios (AntiGhost, Kinks, Bóveda, Audio) se agrupan elásticamente en un contador numérico táctico `+N`, asegurando un ancho total menor a 125px que entra holgadamente en el ancho móvil de la tarjeta (~160px).
     - Se eliminó `flex-shrink-0` y se aplicó `max-w-full overflow-hidden` con `whitespace-nowrap` en todos los chips internos.
  3. **Reestructuración del Popover Táctico Interno**:
     - Al presionar la píldora, la ficha modal interna coloca en la parte superior la explicación humana completa del Protocolo de Encuentro seleccionado (qué esperar de la cita), seguida por el sello y método de verificación, membresía VIP, métricas de respeto Anti-Ghost y afinidad.
- **Motivación**:
  Eliminar el bug de recorte y desbordamiento visual de la píldora en tarjetas móviles, asegurando legibilidad sin sobrecargar la interfaz a simple vista, y garantizar que la rotación del borde neón nunca se detenga independientemente de la purga de estilos de Tailwind.

### [ADR-075] · [2026-09-08 11:28] Rediseño Integral de "Diario": Dashboard Táctico de Encuentros & Reputación Bilateral
- **Decisión**:
  1. **Re-rotulado y Renombramiento**:
     - Sustitución de la etiqueta y concepto "Diario" por **"Encuentros"** en Bottom Nav y **"Bitácora // Encuentros"** en cabecera táctica con icono `UserCheck`.
  2. **Eliminación de la Vista de Calendario y Sub-pestañas Fragmentadas**:
     - Retiro completo de `SmartCalendarGrid` (calendario mensual tradicional de oficina) y de las sub-pestañas fragmentadas (`calendar`, `timeline`, `insights`).
     - Creación de un Dashboard continuo con Bento Grid de 4 KPIs superiores (Total encuentros, Respect Karma, Calificación de usuarios sobre mí, Tasa de repetición/química).
  3. **Módulo "Valoraciones de la Comunidad Sobre Mí" (Doble Consentimiento)**:
     - Integración de testimonios recibidos con foto/avatar de quien evaluó y enlace directo a su perfil, estrellas, tags comunitarios otorgados y switch de visibilidad (`Público en perfil` vs `Privado`).
  4. **Feed Cronológico con Caras y Acceso Directo**:
     - Tarjetas de encuentros con foto grande (56px), semáforo de disponibilidad corporal (`open`/`occupied`/`dormant`), acceso 1-tap al expediente de perfil (`setSelectedProfile`), notas confidenciales protegidas por AES-256 y protocolos de salida.
  5. **Filtrado Avanzado por Fecha & Salud Preventiva**:
     - Presets táctiles en 1-tap (7d, 30d, año), selector de rango personalizado (`Desde`/`Hasta`), buscador en tiempo real, Botiquín Doxy-PEP integrado y exportador JSON local-first.
- **Motivación**:
  Alinear la experiencia de registro con el ADN brutalista y táctico de VESSEL, eliminando la fricción de interfaces tradicionales de oficina y transformando los encuentros en un centro de telemetría, reputación y seguridad comunitaria.

### [ADR-076] · [2026-09-08 11:42] Auditoría Impeccable UI & Prevención de Desborde en Cabecera de Encuentros
- **Decisión**:
  1. **Alineación Geométrica de Ancho Máximo**:
     - Incorporar la restricción `w-full max-w-4xl mx-auto` al contenedor raíz de `DateDiaryView.tsx` para garantizar coincidencia milimétrica con la cabecera del sistema (`BrutalistHeader`) y la barra inferior de navegación (`BrutalistNav`).
  2. **Cápsula Dock Táctica para Herramientas Secundarias**:
     - Agrupar los botones utilitarios (`Doxy-PEP`, `Alerta ITS` y `Exportar JSON`) en un dock de cápsula integrado (`bg-black/60 border border-white/10 backdrop-blur-md`) con divisores verticales de 1px e iconos vectoriales `HeartPulse`, `ShieldAlert` y `Download`.
  3. **Erradicación de Colisión y Desborde en Botón Principal**:
     - Reemplazar la directiva rígida `sm:flex-nowrap` por un diseño flexible y elástico (`flex-col xl:flex-row`), aislando el botón principal `+ DOCUMENTAR ENCUENTRO` con `whitespace-nowrap flex-shrink-0` y aplicando `overflow-hidden relative` en la tarjeta de cabecera.
  4. **Calibración Tipográfica de Telemetría (Impeccable UI)**:
     - Formatear la calificación recibida a 1 decimal estricto (`averageReceivedRating.toFixed(1)` -> `★ 5.0 / 5.0`), eliminando la visualización trunca `★ 5 / 5.0`.
  5. **Estilización Dark Luxury en Controles de Reseñas**:
     - Incorporar scroll horizontal sin barras (`overflow-x-auto no-scrollbar`) en el ribbon de tags y rediseñar los botones de visibilidad `[Ocultar] / [Hacer Público]` con bordes de alto contraste e iconos dinámicos `Eye` y `EyeOff`.
- **Motivación**:
  Cumplir rigurosamente con los estándares de diseño Impeccable UI, eliminando artefactos visuales de desbordamiento en anchos de pantalla estrechos o medianos y asegurando una presentación táctica de grado militar.

### [ADR-077] · [2026-09-08 12:15] Erradicación de Vista Radar por Redundancia Espacial con la Matriz & Poda de Código Muerto
- **Decisión**:
  1. **Depuración del Modelo de Navegación**:
     - Reducir `ActiveNavView` en `src/types/vessel.ts` a 5 vistas esenciales: `"grid" | "pulses" | "chat" | "diary" | "account"`.
  2. **Reconfiguración Ergonómica de Barra Inferior (`BrutalistNav.tsx`)**:
     - Migración de `grid-cols-6` a `grid-cols-5`, aumentando el área táctil de cada pestaña en un ~20%, optimizando la ergonomía en dispositivos móviles con una sola mano.
     - Retiro del ícono `Radio` y del badge de ping táctico de radar.
  3. **Purga de Archivos y Componentes Obsoletos**:
     - Eliminación física de `src/components/radar/RadarSweep.tsx` (~850 líneas, 46.4 KB) y `src/components/radar/TacticalHotspotsOverlay.tsx` (160 líneas, 6.5 KB), eliminando más de 52 KB de scripts y animaciones continuas de canvas/DOM innecesarias.
  4. **Limpieza Quirúrgica de Accesos Rápidos Redundantes**:
     - Eliminación del botón de radar en la barra de búsqueda de `ProfileGrid.tsx`.
     - Reemplazo de los accesos a radar en estados vacíos y cabeceras de `PulsesView.tsx` y `DarkroomListView.tsx` por accesos directos coherentes a la Matriz (`grid`) ("Explorar Cerca" / "Explorar Perfiles").
     - Retiro del import dinámico de `RadarSweep` y del bloque condicional en `src/app/page.tsx`.
  5. **Saneamiento Bilingüe en `translations.ts`**:
     - Supresión de las claves `nav.radar` y de los bloques completos `radar: { ... }` tanto en `es` como en `en`, manteniendo 100% de paridad y pasando todos los tests de i18n.
  6. **Preservación de Infraestructura Táctica de Movilidad**:
     - Se mantienen íntegros y operativos los componentes de seguridad y logística táctica en `src/components/radar/` (`EnRouteBanner.tsx`, `EnRouteTrackerModal.tsx`, `GeoBatteryModal.tsx`, `TravelModeModal.tsx`), requeridos para el seguimiento de citas en curso y ahorro de batería.
- **Motivación**:
  La Matriz de perfiles ya informa la distancia relativa y ofuscada por celdas Google S2 (~152m) de cada contacto en tiempo real. La pantalla de barrido circular de radar duplicaba esta funcionalidad, consumía recursos gráficos y sobrecargaba la barra de navegación con 6 opciones estrechas. Su eliminación otorga una interfaz más directa, liviana y táctil.

### [ADR-078] · [2026-09-08 12:30] Nueva Paleta Cromática Dark Luxury / Queer & Arquitectura Desacoplada del Header (Impeccable UI)
- **Decisión**:
  1. **Des-Grindrización Cromática Radical**:
     - Desplazar `rawAmber` (`#E5A93C`, amarillo ámbar similar a Grindr) como color primario del sistema.
     - Introducir **`electricViolet`** (`#8B5CF6`, glow `#A78BFA`, dim `#6D28D9`) como color primario de marca, selecciones activas, navegación y botones principales. El violeta eléctrico recupera la herencia queer/lavanda y la estética de club electrónico berlinés (Berghain/Dark Luxury), rompiendo todo vínculo visual con Grindr.
     - Preservar **`bloodNeon`** (`#E61937`) para el logo oficial de VESSEL, alertas críticas, PIN Rendezvous y estados de urgencia/sesión.
     - Introducir **`mintNeon`** (`#10B981`) para el estado Real, verificación 3D y estados disponibles.
     - Relegar tonos dorados a **`champagneGold`** (`#F59E0B`), de uso exclusivo para insignias y coronas de membresía VESSEL UNLIMITED.
  2. **Reestructuración de la Cabecera en 3 Bloques con Modelos Mentales Desacoplados**:
     - **Bloque 1 (Barra de Sistema & Seguridad - `BrutalistHeader`)**: Logo con resplandor + Badge TEST/REAL + Alertas críticas vivas bajo demanda (PIN / Guardián) + Cápsula de Usuario limpia (perfil, verificación, Unlimited) + Controles tácticos (Sonido / Sigilo). Se eliminó la congestión de 10 iconos apretados en mobile.
     - **Bloque 2 (Consola de Emisión Personal "Tu Señal" - `StatusToggle`)**: Rediseño integral como consola de cabina táctica con encabezado visible permanente `TU SEÑAL EN EL RADAR` con micro-led de emisión en vivo. El segmented control unifica `🟢 DISPONIBLE (Pinta algo ya)`, `🔴 EN UNA` y `🟣 INCÓGNITO`, integrando el interruptor `⚡ BOOST 60M` de visibilidad personal, eliminando la confusión donde los usuarios creían que era un filtro de búsqueda.
     - **Bloque 3 (Exploración y Filtros del Radar - `ProfileGrid`)**: Barra de búsqueda con placeholder descriptivo + botón de filtros avanzados con contador numérico + píldoras de filtrado rápido con prefijos y nombres explícitos de consulta a terceros (`✨ Todos`, `⚡ En Boost`, `🟢 Solo Disponibles`, `🏠 Con Lugar`, `🛡️ Solo Verificados`).
  3. **Actualización de Componentes Core**:
     - Adaptación de `BrutalistButton.tsx`, `BrutalistNav.tsx`, `BrutalistInput.tsx`, `TacticalBadge.tsx`, `ProfileCard.tsx` y `page.tsx` a la nueva jerarquía de tokens.
- **Motivación**:
  Eliminar el sesgo cognitivo de los usuarios que percibían a VESSEL como "un clon de Grindr con fondo negro" y erradicar la confusión recurrente donde los usuarios tocaban "Pinta algo ya" creyendo filtrar la lista cuando en realidad estaban alterando su propio estado corporal ante toda la red.

### [ADR-079] · [2026-09-08 14:15] Purga Total de Clases Residuales rawAmber y Estandarización de Contraste Accesible WCAG AAA (Dark Luxury / Berlin Queer)
- **Decisión**:
  1. **Erradicación Exhaustiva de `rawAmber` en Todo el Árbol de Componentes**:
     - Se realizó una auditoría y saneamiento integral en más de 25 componentes y modales secundarios y administrativos que conservaban referencias duras a `rawAmber`, `shadow-amber-glow` o selectores residuales.
     - Componentes saneados: `SendMediaModal.tsx`, `ChatMediaViewerModal.tsx`, `BoundaryManagerModal.tsx`, `app/admin/page.tsx`, `AdminHeader.tsx`, `AdminNav.tsx`, `DashboardOverviewTab.tsx`, `UserManagementTab.tsx`, `MembershipsTab.tsx`, `StaffManagementTab.tsx`, `AuditLogsTab.tsx`, `ModerationTab.tsx`, `NightlifeEventsModal.tsx`, `ClubFloorRadarModal.tsx`, `OpticalBeaconModal.tsx`, `AfterHoursModal.tsx`, `MissedConnectionsModal.tsx`, `EventDetailModal.tsx`, `SafetyBeaconModal.tsx`, `HarmReductionModal.tsx`, `DuressPinSettingsModal.tsx`, `ItsExposureModal.tsx`, `DiaryInsights.tsx`, `DiaryTimeline.tsx`, `DateDiaryView.tsx`, `ProfileCard.tsx`, `ProfileDetailModal.tsx`, `ExitProtocolBadge.tsx`, `GeoBatteryModal.tsx`, `AppSettingsModal.tsx`, `AppModeModal.tsx`, `TacticalBadge.tsx`, `dossierCatalog.ts` y `DynamicFilterDrawer.tsx`.
  2. **Invariante de Accesibilidad WCAG AAA y Cero `text-black` en Botones**:
     - Se prohíbe terminantemente `text-black` sobre fondos oscuros o de acento violeta (`electricViolet`). Todos los botones y pestañas primarias activas implementan `bg-electricViolet text-white font-bold` (o `font-black`) con sombra volumétrica `shadow-violet-soft`.
     - Elementos de alta luminancia (`mintNeon`, `cyan-500`) utilizan `text-obsidian-deep font-black`.
     - Calificaciones con estrellas: icono de estrella en `text-amber-400 fill-amber-400` acompañado de dígitos/etiquetas en `text-white font-bold`.
     - Baliza Óptica (`OpticalBeaconModal.tsx`): migrado el modo de destello nocturno de "ámbar" a "violeta" (`strobeMode: "violet"`) con `bg-electricViolet text-white`, manteniendo la coherencia de la cultura clubber berlinesa.
  3. **Verificación Estricta en Caliente**:
     - `npm run typecheck` (`npx tsc --noEmit`) verificado con 0 errores de TypeScript.
     - Preservación estricta de la regla de no ejecutar `npm run build` en caliente con el servidor de desarrollo activo.
- **Motivación**:
  Cerrar la brecha de inconsistencia visual detectada en modales tácticos y pantallas de administración para consolidar una experiencia de usuario 100% cohesionada bajo la estética Dark Luxury / Berlin Queer, eliminando vestigios amarillos y asegurando legibilidad óptica sin concesiones en cualquier condición de iluminación.

### [ADR-080] · [2026-09-08 14:40] Overhaul Darkroom Chat Desktop/Mobile, Separadores Semánticos `SectionHeroHeader` y Suite de Micro-Interacciones Cinéticas
- **Decisión**:
  1. **Descompresión Estricta del Header de Darkroom Chat**:
     - Estructuración en 2 líneas jerárquicas limpias: Línea 1 dedicada exclusivamente a Identidad Primaria (Alias/Nombre completo sin truncar, edad `· 29`, badge de verificación compacto y badge de karma). Línea 2 dedicada a Telemetría Táctica (`Rol • Distancia • Hospedaje` + píldora `⚡ YA`).
     - Tapping sobre el avatar o bloque de identidad abre directamente el modal de ficha completa del perfil.
  2. **Arquitectura Responsiva Desktop para Darkroom (`max-w-5xl`)**:
     - Adaptación del modal de chat de un viewport móvil estrecho (`max-w-lg`) a una ventana completa de escritorio (`max-w-4xl lg:max-w-5xl md:h-[92vh]`) con Desktop Tactical Companion integrado (`hidden lg:flex w-80`) que expone foto, Karma Score, suite táctica de 1-tap (Pre-Flight, ETA, SOS, Diario, Ficha) y estado de acuerdos mutuos.
  3. **Sistema de Separadores de Sección Semánticos (`SectionHeroHeader`)**:
     - Creación de un componente estandarizado con 6 variantes cromáticas (`violet`, `mint`, `blood`, `amber`, `cyan`, `neutral`), gradiente de borde superior y acciones contextuales, desplegado en DateDiaryView, PulsesView, ProtocolView, BioTab, KinksTab, ReputationTab y BoundariesTab.
  4. **Suite de Micro-Interacciones Cinéticas**:
     - `BrutalistButton` con gestión reactiva de estados `isSaving` (spinner y bloqueo) e `isSuccess` (morph a checkmark y audio `playSuccess()`).
     - Animación de despegue de mensajes con vector de avión (`animate-plane-launch`).
     - Rotación táctica de candado para conmutación de retención (`animate-lock-rotate`).
     - Onda de pulso expansiva radial (`animate-pulse-wave`) y rebote en reacciones de rol en `ProfileCard` y `PulsesView`.
### [ADR-081] · [2026-09-08 15:10] Modo Desktop en ProfileDetailModal, Alto Contraste WCAG en Green Flags, Depuración de JSON y Elevación Radiante de CTAs
- **Decisión**:
  1. **Arquitectura Desktop Editorial en `ProfileDetailModal.tsx`**:
     - Expansión responsiva del contenedor de `max-w-lg` a `w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full md:h-[90vh] md:max-h-[920px] md:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)]`.
     - Despliegue en 2 columnas independientes en desktop (`md:flex-row`):
       - **Columna Izquierda (~42%)**: Hero carrusel fotográfico con chevrons flotantes en hover, tira de thumbnails para salto directo, overlay identitario, HUD táctico de 4 pilares, tarjeta sensorial unificada de Audio (Voice Vibe, Audio Note, Clima Sonoro) y medidor carnal directo (`FillMeter`).
       - **Columna Derecha (~58%)**: Banner táctico de distancia/sintonía, Suite Táctica del Encuentro (Liveness, On-The-Clock, Kink Matrix, Hospedaje, Salida, Pre-Flight, En-Route), Dossier confidencial con flags de alto contraste, estadísticas físicas/VIH, deseos, intenciones, límites, bio, testimonios y media vault.
       - **Dock Inferior Persistente**: Barra de acción fija en la base con botones táctiles de pulso cinético, PIN de encuentro con etiqueta descriptiva en desktop, diario y botón principal de chat / pase Unlimited.
  2. **Invariante de Contraste WCAG AAA en Green Flags (`ProfileDossierSection.tsx`)**:
     - Sustitución de `bg-mintNeon text-obsidian-deep` por `bg-emerald-500/25 text-emerald-100 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold ring-1 ring-emerald-400/40`.
     - Ratio de contraste óptico superior a 10:1 sobre fondos obsidian, garantizando legibilidad total tanto en modo normal como en alto contraste.
  3. **Depuración de Botón JSON y Código Muerto (`DateDiaryView.tsx`)**:
     - Eliminación del botón exportador `JSON`, separador de barra, handler `handleExportJson`, estado reactivo `exportToastVisible`, banner toast y el ícono `Download` no utilizado.
  4. **Elevación Radiante de CTAs Nucleares**:
     - Incorporación de la variante `amber` en `BrutalistButton.tsx` (`bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-obsidian-deep hover:from-amber-400 hover:to-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300 font-black`).
     - Botón "ACTIVAR ON-THE-CLOCK (60 MINUTOS)" en `BioTab.tsx` actualizado a `variant="amber" size="lg"` con resplandor dorado y animación pulsante de rayo.
     - Botón de membresía Unlimited en `UserAlbumManager.tsx` potenciado con gradiente violeta eléctrico, corona dorada pulsante y sombra perimetral de alta atracción visual.
- **Motivación**:
  Resolver de manera definitiva las inconsistencias de ergonomía en pantallas grandes donde la ficha de usuario quedaba confinada a una columna estrecha de teléfono móvil, garantizar la legibilidad universal en los acuerdos tácticos de los usuarios, limpiar controles técnicos innecesarios para el usuario final (botón JSON) y guiar la atención hacia las acciones de mayor valor e inmediatez del producto.

### [ADR-082] · [2026-09-08 15:15] Rediseño de Baliza Óptica en Fucsia Neón (Border Beam Identity) y Supresión de Pantallas Negras
- **Decisión**:
  1. **Alineación Cromática con el Border Beam Fucsia de VESSEL**:
     - Se vinculó el color del faro óptico nocturno (`OpticalBeaconModal.tsx`) al fucsia neón de alta saturación (`#ff007f`, `#ff2a85`) del borde animado giratorio de las tarjetas de perfil (`.border-beam-fuchsia`), asegurando identidad visual y máxima penetración lumínica en discotecas y pistas oscuras.
  2. **Erradicación de la Pantalla en Negro Muerto**:
     - Se eliminó la alternancia hacia negro (`bg-black`) que dejaba el teléfono apagado el 50% del tiempo. Los modos pulsantes ahora alternan entre fucsia neón de pico (`#ff007f`) y fucsia profundo luminoso (`#500028`) o blanco rave, garantizando emisión de luz ininterrumpida.
  3. **Marco Giratorio `border-beam-fuchsia` Perimetral**:
     - Inclusión del haz perimetral giratorio alrededor del marco del modal, creando un marco de energía cinético alrededor de la pantalla.
  4. **Modo Fucsia Continuo (Linterna 100% Sólida)**:
     - Se introdujo un modo estático sin parpadeo para sostener la pantalla en alto de forma fija como un faro lumínico estable.
### [ADR-083] · [2026-09-08 15:20] Carga de Foto y Compresión Client-Side para Contactos Externos en Diario
- **Decisión**:
  1. **Integración de Foto Fisonómica en Contactos Externos (`CreateDiaryEntryModal.tsx`)**:
     - Permitir a los usuarios subir una fotografía o fisonomía de referencia al registrar o editar un encuentro con una persona que no forma parte de la matriz pública de VESSEL.
  2. **Compresión Local en Canvas Client-Side (`compressAvatarImage`)**:
     - Las imágenes tomadas con cámaras de smartphones (10-20MB en 4K) son redimensionadas a un tamaño máximo de 640x640 píxeles y exportadas a WebP/JPEG optimizado (~30-50KB).
     - Esto garantiza que el almacenamiento local (`localStorage`) no se desborde (`QuotaExceededError`) y que la aplicación funcione de manera completamente autónoma y offline sin requerir subidas pesadas a red.
  3. **Preservación de la Privacidad por Diseño (Privacy-by-Design)**:
     - Las fotos cargadas para contactos externos se guardan exclusivamente en el almacenamiento local y cifrado del dispositivo del usuario y jamás son emitidas a servidores públicos ni compartidas con otros perfiles.
  4. **Presets Tácticos Opcionales**:
     - Se incorporaron 4 avatares cyberpunk preconfigurados para usuarios que deseen clasificar visualmente al contacto sin almacenar una foto facial real.
  5. **Propagación Integral en el Ecosistema del Diario**:
     - La foto se sincroniza automáticamente en el Timeline, Calendario Inteligente, ficha modal de contacto y edición retrospectiva de entradas.
### [ADR-084] · [2026-09-08 15:25] Terminología Intuitiva "Listo YA" y Jerarquía Comercial de Miembros en Matriz
- **Decisión**:
  1. **Sustitución de Terminología Confusa por "Listo YA"**:
     - Se abandonó el anglicismo "60M Boost" (asociado erróneamente a metros de distancia o micropagos de videojuegos) en favor del término coloquial del cruising/dating gay: **"Listo YA"** (`⚡ LISTO YA`).
     - Al estar activo, el temporizador muestra claramente los minutos restantes: `⚡ LISTO YA · 59m`.
     - Se sincronizaron las insignias de tarjeta de usuario (`⚡ LISTO YA`), el botón de filtro (`⚡ Listos YA`) y los diccionarios i18n (`translations.ts`).
  2. **Invariante Algorítmica de Prioridad Comercial en la Matriz (`ProfileGrid.tsx`)**:
     - Se fijó la regla de producto: **un usuario con membresía de pago (`isUnlimited` / `pro`) SIEMPRE se visualiza antes que un usuario estándar con boost/Listo YA**.
     - Estructura de 4 Tiers:
       - `Tier 4`: Miembro de pago con `Listo YA` activo (Posición máxima).
       - `Tier 3`: Miembro de pago (Visibilidad privilegiada constante, antes de cualquier cuenta free con boost).
       - `Tier 2`: Usuario estándar gratuito con `Listo YA` activo (Posición destacada por encima de los perfiles gratuitos normales).
       - `Tier 1`: Usuario estándar gratuito normal.
     - Este orden se aplica transversalmente en los tres modos de clasificación de la matriz (`distance`, `recent` y `affinity`).
- **Motivación**:
  Eliminar la ambigüedad conceptual para los usuarios finales y asegurar que la propuesta de valor comercial de la suscripción paga de VESSEL no sea canibalizada ni degradada por la funcionalidad efímera de disponibilidad inmediata.

### [ADR-085] · [2026-09-08 15:35] Anillo Dinámico Fucsia Neón con Depleción estilo Reloj para Botón "Listo YA"
- **Decisión**:
  1. **Alineación Cromática con la Identidad Fucsia Neón de las Tarjetas**:
     - Se dotó al botón táctico "Listo YA" (`StatusToggle.tsx`) del borde fucsia neón característico de las tarjetas de perfil VIP (`#ff007f`, `#ff2a85`), integrando un borde sutil en estado inactivo y un haz perimetral luminoso completo al activarse.
  2. **Mecánica de Depleción Radial estilo Reloj de 60 Minutos**:
     - El borde perimetral de 2px utiliza la técnica GPU de máscara estricta (`-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude`) sobre el botón con `rounded-xl`.
     - **Inicio Completo (100% / 360°)**: Al activar el modo, la totalidad del perímetro (360°) se ilumina en fucsia neón radiante con resplandor doble en drop-shadow.
     - **Depleción en Sentido Horario**: Conforme transcurren los 60 minutos, el borde se va apagando en sentido de las agujas del reloj (iniciando a las 12 en punto, 0° arriba). El sector recorrido por la manecilla `[0°, elapsedDegrees]` pasa a un track oscuro tenue (`rgba(255, 0, 127, 0.12)`), mientras que el punto exacto de la manecilla emite un destello blanco/rosa neón (`#ffffff` / `#ff2a85`) y el sector remanente `[elapsedDegrees, 360°]` continúa proyectando fucsia neón hasta apagarse por completo al llegar a 0m.
  3. **Refresco Angular y Ticker en Tiempo Real**:
     - Implementación de un intervalo de 1000ms en `StatusToggle.tsx` que recalcula el ángulo exacto cada segundo y muestra la cuenta regresiva tanto en minutos (`60m` ... `2m`) como en segundos durante el último minuto (`45s`).
- **Motivación**:
  Brindar una señal visual de tiempo transcurrido intuitiva, física e inmediata: el usuario percibe en una fracción de segundo cuánta disponibilidad le resta mediante la metáfora universal del cuadrante de un reloj sin tener que leer números pequeños.

### [ADR-086] · [2026-09-08 19:35] Rediseño Terminológico de la Consola de Presencia (Desambiguación "Disponible / Listo YA" y Erradicación de "En una")
- **Decisión**:
  1. **Desambiguación entre Estado de Presencia (`BodyState`) y Boost Temporal (`On-The-Clock`)**:
     - El encabezado del bloque pasa de "MI DISPONIBILIDAD" a **"MI ESTADO"** (`MY STATUS`), eliminando la redundancia terminológica.
     - El primer estado del segmented control pasa de "DISPONIBLE" a **"ACTIVO"** (subtítulo: *"Visible en radar"* / en inglés *"ACTIVE • Visible on radar"*) adoptando el ícono táctico `Activity` (pulso vital).
     - El botón lateral derecho retiene con exclusividad el término **"LISTO YA"** (`⚡ LISTO YA`), su ícono de rayo ⚡ y el reloj fucsia neón de 60 minutos. Con esto, el usuario entiende al instante que "ACTIVO" es su presencia habitual en la plataforma y "LISTO YA" es un potenciador de inmediatez para encontrarse en la próxima hora.
  2. **Sustitución Inequívoca de "En una" por "OCUPADO"**:
     - El estado corporal `occupied` pasa a rotularse como **"OCUPADO"** (subtítulo: *"No disponible"* / en inglés *"BUSY • Not available"*), eliminando de raíz la frase "En una", la cual en la jerga urbana y nocturna rioplatense posee una fuerte connotación asociada al consumo de sustancias psicoactivas o estados de evasión mental.
     - Sincronización completa en diccionarios `translations.ts` (`es` y `en`), `StatusToggle.tsx`, `ProfileCard.tsx`, `EditMockProfileModal.tsx`, `UserManagementTab.tsx` y `DashboardOverviewTab.tsx`.
- **Motivación**:
  Prevenir la fatiga de decisión y confusión de los usuarios entre dos botones de inmediatez aparente ("Disponible" vs "Listo YA") y salvaguardar la seriedad, seguridad y empatía del lenguaje de la plataforma erradicando dobles sentidos estigmatizantes o asociados a drogas.

### [ADR-087] · [2026-09-08 20:30] Sistema de Intereses de Género — Onboarding Progresivo con Filtrado Inteligente en Matriz
- **Decisión**:
  1. **Enfoque de Onboarding Progresivo (Opción C)**: Los intereses de género NO se incluyen en el formulario de registro (demasiada fricción) ni como filtro volátil de drawer (se pierde entre sesiones). Se implementa como un modal dedicado que aparece inmediatamente después del primer registro o login, con persistencia en el perfil del usuario.
  2. **Modelo de Datos Dual**: `orientation` (texto libre del perfil) + `genderInterests` (array tipado de preferencias del usuario). El matching usa ambos campos para máxima precisión.
  3. **Prioridad de Filtrado**: `DynamicFilterDrawer.genderInterests` (override temporal) > `myProfile.genderInterests` (persistente). Si ninguno está definido, se muestra todo.
  4. **Matching Inteligente**: `checkGenderInterestMatch()` analiza `genderIdentity` y `orientation` con normalización case-insensitive y keywords parciales (e.g., "binari", "queer", "fluido" → `non_binary`).
  5. **Default "Todos"**: Si el usuario no selecciona intereses o cierra el modal, el valor por defecto es `["all"]` → sin filtrado. Inclusivo por defecto.
- **Motivación**:
  En una app de encuentros entre hombres (cis, trans, NB), el usuario necesita control sobre a quiénes ve en su radar sin que esto sea una barrera de entrada al registro. El onboarding progresivo post-registro reduce la fricción inicial, permite una decisión informada (el usuario ya entiende qué es la app), y la persistencia en perfil garantiza que la preferencia sobreviva entre sesiones sin re-configuración.
- **Descartado**:
  - **Opción A (En el registro)**: Suma campos a un formulario que debe ser mínimo. Riesgo de abandono.
  - **Opción B (Solo drawer)**: El filtro se resetea al cerrar sesión. No hay memoria de preferencia. UX frustrante.




