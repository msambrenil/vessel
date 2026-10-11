# Arquitectura del Sistema VESSEL

**VESSEL** es una aplicación web y Progressive Web App (PWA) de encuentros carnales y conexiones queer de alta gama. Combina una estética berlinesa brutalista de lujo (*Dark Luxury*), síntesis analógica sub-bass y privacidad de grado criptográfico. Su metáfora central concibe al cuerpo como una pieza arquitectónica: el contenedor o receptáculo diseñado para ser llenado, conectado y habitado.

---

## 1. Identidad del Producto y Propuesta de Valor

- **Nombre**: VESSEL.
- **Propósito**: Facilitar encuentros gay y queer directos, sensoriales y sin rodeos, eliminando la pérdida de tiempo en charlas triviales, el acoso y los perfiles fantasma mediante el protocolo de **Cultura del Respeto (Anti-Ghost)**, doble consentimiento, verificación de identidad y estados de disponibilidad corporal inmediata (*Body States*).
- **Enfoque de Experiencia**: *Depth over distance*. Elegante, estético y profundamente físico.

---

## 2. Arquetipos de Usuario ("Personas") y Requisitos Técnicos

| Persona | Perfil & Entorno de Uso | Limitaciones & Necesidades UX | Decisiones Técnicas Asociadas |
| :--- | :--- | :--- | :--- |
| **Alex (28 años)**<br>*(Pasivo, rol definido)* | Usa la app de noche con brillo bajo en la cama o en transporte público con conexión de datos móviles variable. | Navegación con una sola mano, sin distracciones ni anuncios, claridad inmediata en intenciones y roles de otros usuarios. | • Barra de navegación táctil fija al alcance del pulgar (`BrutalistNav`).<br>• Filtros específicos por rol (`Top`, `Bottom`, `Versatile`) y fetiches.<br>• Modo oscuro estricto (`obsidian-deep`). |
| **Marcus (35 años)**<br>*(Activo viajero)* | Viajero frecuente por trabajo o turismo nocturno; usa la app en aeropuertos, hoteles y clubes con iluminación tenue. | Alto contraste visual, botones de acción rápida de gran tamaño (CTAs) para toques precisos, geolocalización de alta precisión. | • Contraste WCAG AA (texto blanco y acento `electricViolet` sobre fondo negro profundo = 9.8:1).<br>• Touch targets mínimos de 44×44px.<br>• Discretización Google S2 en tiempo real. |
| **Liam (23 años)**<br>*(Kink & Privacidad)* | Comparte departamento o interactúa en espacios públicos; necesita entrar, verificar dinámicas y salir sin dejar rastros. | Iconografía discreta, bloqueo rápido de emergencia, etiquetas directas de kinks y disponibilidad corporal. | • **Modo Sigilo (`StealthLockScreen`)** con activación en 1 toque.<br>• **Modo Niebla (`Fog Mode`)** para privacidad facial suave.<br>• Bóvedas privadas con llaves de acceso revocables.<br>• Mensajes efímeros *Burn-on-View*. |

---

## 3. Stack Tecnológico

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Frontend / Runtime** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) | Renderizado SSR híbrido con hidratación segura en cliente y soporte PWA. |
| **Lenguaje** | [TypeScript 7.0+](https://www.typescriptlang.org/) | Tipado estricto sin `any`, discriminated unions e interfaces de dominio. |
| **Estilos & UI** | [Tailwind CSS v4.3](https://tailwindcss.com/), PostCSS (`@tailwindcss/postcss`) | Sistema de diseño brutalista con tokens semánticos (`obsidian`, `electricViolet`, `bloodNeon`). |
| **Navegación / Iconos** | [Lucide React](https://lucide.dev/), [Framer Motion 13](https://www.framer.com/motion/) | Iconografía minimalista y micro-interacciones cinéticas de alto rendimiento. |
| **Audio Sub-Bass** | Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) | Síntesis acústica sub-grave (45 Hz a 80 Hz) para retroalimentación física y háptica. |
| **Geoespacial & Batería** | Google S2 (Nivel 16) / Geohash 7 (~152m) + `BatteryStateEngine` | Discretización geoespacial, escudo anti-triangulación y ahorro energético inteligente. |
| **Persistencia & Cloud** | [Firebase SDK v12](https://firebase.google.com/) (Firestore + Storage + Auth) | Sincronización en tiempo real (`onSnapshot`), persistencia offline multi-pestaña en IndexedDB y álbumes multimedia. |
| **Persistencia Local-First** | LocalStorage + Cifrado en Cliente | Almacenamiento 100% privado y confidencial para el `Date Diary` y registros de salud. |
| **Internacionalización** | Diccionario reactivo tipado (`translations.ts`) | Soporte nativo para Español Rioplatense (`es`) con voseo e Inglés (`en`). |

---

## 4. Arquitectura de Rutas Next.js 16 App Router, AppShell y Hooks Atómicos

VESSEL opera sobre el **App Router de Next.js 16** con rutas dedicadas que comparten el layout y shell unificado `AppShell.tsx` (`src/components/shell/AppShell.tsx`), integrado con la API de `View Transitions` del navegador y los hooks nativos `useRouter()` y `usePathname()`:

```
┌────────────────────────────────────────────────────────────────────────┐
│  BrutalistHeader (Logo, Batería, Audio Sub-bass, Pase QR, Menú Usuario) │
├────────────────────────────────────────────────────────────────────────┤
│  RUTAS DEDICADAS DEL APP ROUTER:                                       │
│  • /radar   (o /) -> Matriz Radar (ProfileGrid)                        │
│  • /pulses        -> Toques (Toques recibidos, onda mutua 🔥 y enviados)│
│  • /chat          -> Darkroom ListView & Chats efímeros Anti-Ghost     │
│  • /diary         -> Citas (Agenda íntima & botiquín de salud sexual)  │
│  • /account       -> ProtocolView / Perfil, Niebla y Álbumes           │
├────────────────────────────────────────────────────────────────────────┤
│  TacticalBottomSheet / RadarBottomCommandBar (Sintonías & Filtros)     │
│  • Peeking: Barra compacta flotante al alcance del pulgar (Thumb-Zone) │
│  • Expanded: IntentHubSelector, Búsqueda Neón, Modo Viajero, Filtros   │
├────────────────────────────────────────────────────────────────────────┤
│  BrutalistNav (Barra fija inferior de 5 accesos al alcance del pulgar) │
└────────────────────────────────────────────────────────────────────────┘
```

### Modales Superpuestos & Componentes Tácticos
- **`AuthModal`**: Autenticación multimodal real (Google OAuth 1-Click, Email/Contraseña, Modo Invitado y Vinculación de Cuentas) con blindaje Anti-Sybil.
- **`ProfileDetailModal`**: Inspección profunda del perfil con carrusel fotográfico, medidor de intensidad de fetiches, notas de audio, ficha de hospedaje táctica, Voice Vibe y suite de encuentro.
- **`DarkroomChatModal`**: Chat efímero con fotos *Burn-on-View*, envío de Pin de Encuentro, tarjeta Pre-Flight Checklist y telemetría de salida.
- **`AppSettingsModal`**: Panel de configuración integral y cierre de sesión (activado pulsando el isotipo oficial de Vessel en la cabecera).
- **`GeoBatteryModal`**: Control de discretización Google S2 y modo de ahorro de batería.
- **`IdentityVerificationModal`**: Protocolo anti-bot y validación biométrica Liveness 3D / OAuth con deduplicación de identidad física.
- **`CreateDiaryEntryModal`**: Registro confidencial de citas íntimas y rutinas de salud.
- **`BoundaryManagerModal`**: Aplicación de protocolos de desconexión gradual (*Soft-Block*).
- **`CreateAlbumModal` & `AlbumDetailModal`**: Creación y visualización segura de galerías públicas y multi-bóvedas privadas con llaves de acceso revocables y temporizadores efímeros.
- **`HostCardModal`**: Configuración e inspección de la Ficha de Hospedaje (espacio propio, convivencia, comodidades e insumos).
- **`PreFlightChecklistModal`**: Selector en 3 taps de compatibilidad y sintonía sexual previa al encuentro (ritmo, dinámicas, barreras y sustancias).
- **`VoiceVibeRecorderModal`**: Grabador táctico analógico de clips de voz de 5 segundos con cuenta regresiva e indicador dinámico de niveles.
- **`EnRouteTrackerModal` & `EnRouteBanner`**: Telemetría de viaje en camino con ETA en vivo y alerta de llegada a puerta a <50 metros.
- **`SafetyBeaconModal` & `BeaconCountdownWidget`**: Guardián Silencioso con temporizador regresivo, widget de cabecera y alarma acústica a 45 Hz.
- **`DuressPinSettingsModal`**: Configuración de PIN de coacción alternativo para pánico silencioso bajo amenaza.
- **`CalculatorCoverScreen` (`AppDisguiseModal`)**: Bloc de Notas brutalista señuelo con activación por giro (Flip-to-Cover) y escape secreto `:exit`.
- **`LivenessVerificationModal`**: Escaneo biométrico facial tridimensional con solicitud dinámica de gestos en vivo.
- **`SessionRoomModal`**: Administración y exploración de salas de sesión y coordinación de tríos con aforo privado.
- **`DuoLinkModal`**: Vinculación de cuentas de pareja para navegación y mensajería conjunta en Modo Dúo.
- **`UnlimitedPaywallModal`**: Conversión y suscripción a la membresía oficial VESSEL UNLIMITED.
- **`VaultAuditModal`**: Auditoría cronológica en tiempo real de accesos a bóvedas íntimas y revocación de llaves.
- **`TravelModeModal`**: Teleportación virtual de presencia a ciudades estratégicas globales.

---

## 5. Qué NO Existe en la Arquitectura (Límites Estrictos)

1. **No hay librerías de componentes genéricas**: Cero uso de Bootstrap, Material UI, Chakra UI o TailwindUI; todos los componentes son brutalistas nativos a medida.
2. **No hay exposición de datos íntimos del diario en servidores externos**: El `Date Diary` y el Botiquín Doxy-PEP se mantienen bajo el modelo Local-First (Regla de Negocio #7).
3. **No hay almacenamiento de contactos de auxilio en la nube**: Los datos del contacto de emergencia del Guardián Silencioso residen estrictamente en Local-First en el dispositivo cliente, garantizando privacidad absoluta ante filtraciones.
4. **No hay telemetría ni tracking de terceros**: Cero trackers invasivos (Google Analytics, Facebook Pixel, etc.).
5. **No hay coordenadas GPS brutas en cliente**: Las coordenadas exactas nunca se transmiten ni renderizan; se utiliza discretización espacial en celdas Geohash 7 / Google S2.
6. **No se permiten perfiles sin fotografía**: La imagen de perfil es obligatoria; quienes requieran privacidad visual utilizan el **Modo Niebla** o **Avatares Estilizados**.
7. **No hay contextos monolíticos (`useVessel` prohibido)**: El estado global se organiza exclusivamente en hooks atómicos por dominio (`useAuth`, `useRadarMatrix`, etc.) o micro-stores granulares.

---

## 6. Tríada de Rendimiento & Arquitectura Moderna 2026 (Invariantes Obligatorias)

Todo cambio arquitectónico o feature funcional en VESSEL debe honrar los siguientes tres pilares:

1. **Hooks Atómicos & Cascada Cero de Re-renders**:
   - `useVessel()` está formalmente prohibido.
   - Las vistas consumen exclusivamente el hook del dominio correspondiente (`useRadarMatrix`, `useChat`, etc.).
   - Tarjetas de alta densidad (`ProfileCard`) desacopladas de eventos parásitos de alta frecuencia mediante componentes puros (`PureProfileCard`) con props memorizadas.

2. **Next.js 16 App Router Real & View Transitions**:
   - Cada sección principal corresponde a una ruta real (`/radar`, `/pulses`, `/chat`, `/diary`, `/account`) bajo `AppShell.tsx`.
   - Navegación cliente a través de `useRouter().push(targetPath)` y `usePathname()` con soporte nativo de `document.startViewTransition`.
   - Soporte pleno de deep-linking, marcadores e historial del navegador (Back/Forward).

3. **Protección del Main Thread, Assets & I/O Asíncrona**:
   - Fotos remotas optimizadas con Next Image (WebP/AVIF, `w=400`) y fallback seguro (`unoptimized={true}`) en desarrollo local.
   - Cálculos intensivos de geometría y proximidad delegados a Web Workers (`proximityWorkerClient.ts`).
   - I/O pesada y mutaciones offline migradas de `localStorage` a IndexedDB (`offlineMutationQueue.ts`), protegiendo la métrica INP y el audio de `SubBassAudioEngine`.

