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

## 4. Router SPA y Arquitectura de Vistas

VESSEL funciona como una **Single Page Application (SPA)** responsiva fluida dentro de `src/app/page.tsx`, envuelta en un contenedor centralizado `max-w-4xl mx-auto`:

```
┌────────────────────────────────────────────────────────────────────────┐
│  BrutalistHeader (Logo -> Settings, ID, Batería, Filtros, Sigilo)      │
├────────────────────────────────────────────────────────────────────────┤
│  StatusToggle (Open Now | In Session | Stealth)                        │
├────────────────────────────────────────────────────────────────────────┤
│  VISTA PRINCIPAL ACTIVA:                                               │
│  • grid    -> Cerca (Cuadrícula con Card #1 '⭐ TÚ' adaptativa 3 a 5 col)│
│  • pulses  -> Pulsos (Bandeja de pulsos recibidos, devueltos y enviados)│
│  • chat    -> Mensajes (Darkroom efímero & salidas amables Anti-Ghost) │
│  • diary   -> Diario (Calendario de citas, botiquín Doxy-PEP y PrEP)   │
│  • account -> Perfil (Ficha, Modo Niebla, gestión de álbumes y límites)│
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
