# Glosario de Dominio, Arquetipos y Rotulado en VESSEL

Definición de términos del dominio, arquetipos de usuario, datos de muestra y correspondencia estricta de lenguaje natural orientado al usuario.

---

## 1. Arquetipos de Usuario ("Personas")

> 💡 **Nota de Cobertura Completa**: Para el análisis exhaustivo de los **20 Arquetipos Tácticos de Usuario** para el lanzamiento en Argentina (hardware, hábitos, conectividad, dolores y oportunidades de mejora), consultar el documento dedicado: [@docs/contexto/arquetipos.md](./arquetipos.md).

A continuación se resumen los 3 arquetipos de muestra representativos de partida:

1. **Alex (Pasivo enfocado en rol definido, 28 años)**:
   - *Contexto*: Profesional, navega en entornos con poca luz (en la cama o en transporte público con datos móviles).
   - *Necesidad*: Operación con una sola mano, sin distracciones ni anuncios, información clara sobre roles (`Bottom`, `Versatile`), intenciones inmediatas y hosting.
2. **Marcus (Activo viajero en entorno de baja iluminación, 35 años)**:
   - *Contexto*: Viajero frecuente por negocios o turismo nocturno; usa la app en aeropuertos, hoteles y clubes.
   - *Necesidad*: Alto contraste visual, botones de gran tamaño (mínimo 44px), geolocalización precisa en tiempo real y perfiles activos reales.
3. **Liam (Usuario kink enfocado en privacidad radical, 23 años)**:
   - *Contexto*: Comparte vivienda o navega en espacios compartidos; busca entrar, validar dinámicas y salir sin dejar rastros.
   - *Necesidad*: Iconografía discreta, bloqueo rápido (**Modo Sigilo**), fotos con **Modo Niebla**, bóvedas privadas con llaves temporales y disponibilidad corporal explícita.

---

## 2. Términos del Dominio y Conceptos Clave

- **VESSEL (Recipiente)**: Metáfora central donde el cuerpo humano es una pieza arquitectónica diseñada para ser habitada, llenada y conectada.
- **Body State (Estado Corporal)**:
  - `open` (*Pinta algo ya* / *Open Now* / Ámbar pulsante): Disponible para encuentro inmediato.
  - `occupied` (*En una* / *In Session* / Blanco atenuado): En encuentro o interacción activa.
  - `dormant` (*De incógnito* / *Stealth* / Gris neutro): Modo reposo, invisible en el radar.
- **Modo Niebla (Fog Mode)**: Difuminado visual voluntario (`blur: 6-7px` en tarjetas/perfil y `3-4px` en radar/chat) para proteger el rostro manteniendo la silueta y contextura del cuerpo.
- **Pulso (Pulse / Quick Interaction)**: Interacción rápida de 1-tap en la esquina inferior derecha de las tarjetas y en el radar para marcar atracción o interés inmediato (equivalente a los *Taps* de Grindr o el *Flash* de The Blowers) con confirmación háptica y acústica sub-bass a 75 Hz.
- **Bandeja de Pulsos (`PulsesView`)**: Sección de la barra de navegación para consultar quiénes te enviaron un pulso, retribuirlo en 1-tap y auditar pulsos enviados.
- **Rendezvous PIN**: Ubicación temporal cifrada con autodestrucción en 15 minutos para encuentros relámpago.
- **Ver una sola vez (Burn-on-View)**: Fotos y mensajes de chat autodestructibles tras su primera visualización.
- **Bóveda Cifrada**: Galería multimedia privada que requiere autorización o entrega de llave explícita.
- **Doble Consentimiento**: Testimonios y reseñas solo habilitados tras validar bilateralmente un encuentro físico presencial (vía Geofencing <50m o PIN).
- **Modo No Ghost & Puntaje de Respeto**: Sugerencias de salida amable prediseñadas en 1 tap para cerrar conversaciones cordialmente, premiado con hasta 100% de *Respect Karma* y +35% de visibilidad en el radar.
- **Protocolo de Límites (Soft-Block)**: Alternativa ética al bloqueo destructivo: *Pausa / Cooldown*, *Cierre Amable*, *Shadow Stealth* y *Cortafuegos*.
- **Google S2 / Geohash 7**: Discretización espacial en celdas de ~152m que impide la triangulación física exacta.
- **Bitácora de Encuentros (Encounters Dashboard)**: Dashboard táctico de telemetría de encuentros, valoraciones sobre mí basadas en Doble Consentimiento, feed cronológico con acceso a perfiles y recordatorios preventivos de salud sexual (Doxy-PEP y PrEP).
- **Ficha de Hospedaje (Host Card)**: Perfil logístico estandarizado que resuelve de raíz quién recibe o viaja, tipo de vivienda (`solo`, `roommates`, `hotel`), comodidades inmediatas (*ducha lista, toallas, ascensor, AC/calefacción*) e insumos disponibles (*condones, lubricante, poppers, toallitas*).
- **Pre-Flight Checklist**: Acuerdos explícitos de compatibilidad sexual en 3 taps antes del encuentro (*Ritmo, Prácticas deseadas, Salud/Barreras y Sustancias*), renderizados como tarjeta táctica cifrada con distintivo *"Sintonía Fuego 🔥"*.
- **Voice Vibe**: Clip de audio auténtico de 5 segundos para transmitir tono, confianza y presencia real con reproductor analógico de onda sonora.
- **Modo En Camino (En-Route)**: Telemetría de viaje anónima con cuenta regresiva en vivo (ETA) y alerta acústica de puerta al llegar a menos de 50 metros del destino.
- **Guardián Silencioso (Safety Beacon / Dead-Man Switch)**: Temporizador regresivo de sesión física con alarma acústica a 45 Hz y despacho de auxilio al contacto de confianza local si no se desactiva con PIN.
- **PIN de Coacción (Duress PIN)**: Clave alternativa de desbloqueo bajo amenaza (ej. `9999`) que finge desactivar la app pero activa la cobertura señuelo y alerta en silencio.
- **Icono Camaleón & Pantalla Señuelo (Bloc de Notas Brutalista)**: Camuflaje instantáneo que transforma la app en un editor minimalista funcional (`SCRATCHPAD.TXT`) mediante **Flip-to-Cover** (giroscopio boca abajo) o tecla `Escape`.
- **Liveness 3D Anti-Catfish**: Validación biométrica facial en vivo con solicitud aleatoria de gestos y prueba criptográfica ZK con insignia dorada.
- **Protocolo de Salida (Exit Protocol)**: Explicitación sin tabúes de la expectativa post-coital (*Fast Encounter ⏱️, Chill & Cuddle 🫂, Sleepover 🌙*).
- **Botiquín Doxy-PEP**: Seguimiento clínico post-exposición bacteriana (sífilis, clamidia, gonorrea) dentro de la ventana de 72 horas en el Date Diary.
- **Salas de Sesión (Session Rooms)**: Espacios con aforo privado limitado (ej. 3/3) para coordinación de tríos, encuentros grupales o fetiche.
- **Modo Dúo (Duo Mode)**: Vinculación simbiótica de dos cuentas de pareja para figurar unificadas con insignia `👥 DÚO` en grilla y chat conjunto.
- **Hotspots Tácticos Urbanos**: Mapeo en el Radar de recintos gay/queer (saunas, darkrooms, clubes, zonas de cruising) con contador de Vessels activos en vivo y check-in anónimo.
- **VESSEL UNLIMITED**: Membresía oficial premium (*"Álbumes, bóvedas y señales ilimitadas"*) que desbloquea Travel Mode, multi-bóvedas, auditoría de aperturas y filtros quirúrgicos.
- **Auditoría de Bóvedas (Vault Audit)**: Registro confidencial en tiempo real de quién abrió tus fotos íntimas y cuántos segundos las miró con opción de revocar la llave.
- **Travel Mode (Teleportación Táctica)**: Reubicación virtual del radar a otras metrópolis globales (*Berlín, Madrid, NY, etc.*) antes de viajar.

---

## 3. Datos de Muestra Representativos (MOCK_PROFILES)

| Codename | Rol | Contextura (Yo Soy) | Edad | Distancia | Estado Corporal | Características Clave |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VESSEL_01 (Alex)** | `Versatile` | Musculado / Gym | 28 | 0 m (*TÚ*) | `open` | ID Verificado, Insignia Anti-Ghost (98%), Tengo Sitio, Fogoso. |
| **KLAUS_030** | `Top` | Leather / Arnés | 29 | 85 m | `open` | Verificado Biométrico, Bóveda Privada (2), Tengo Sitio, Kinky (14 validados). |
| **RECEPTOR_V** | `Bottom` | Receptivo / Sub | 26 | 210 m | `open` | Nota de voz, Verificación OAuth 𝕏, Suave (8 validados). |
| **VOID_MONOLITH (Liam)**| `Dominant` | Oso / Bear | 41 | 460 m | `occupied` | **Modo Niebla ON**, Fetiches Leather/BDSM, Bóveda Cifrada (1), 19 validados. |
| **AMBER_PULSE** | `Versatile` | Nutria / Otter | 27 | 620 m | `open` | Insignia Anti-Ghost (96%), Google OAuth, Emocional/Juguetón. |
| **STEALTH_HEX** | `Side` | Discreto / Casual | 31 | 890 m | `dormant` | **Modo Niebla ON**, Presencia en Sigilo, Sensualidad/Voyeur. |
| **DARK_RITUAL** | `Oral Focus` | Darkroom / Carnal | 30 | 1.1 km | `open` | Instagram OAuth, En club/darkroom, Fogoso/Intenso (11 validados). |

---

## 4. Tabla de Rotulado (Lenguaje Natural vs Jerga Técnica)

| Jerga Técnica / Base de Datos | Rótulo de Interfaz (Español) | Rótulo de Interfaz (English) |
| :--- | :--- | :--- |
| `ProfileGrid / MatrixProfiles` | **Cerca** | **Nearby** |
| `RadarSweep / S2Scanner` | **Radar** | **Radar** |
| `PulsesView / TransmitSignal` | **Pulsos (Mandar Pulso)** | **Pulses (Send Pulse)** |
| `DarkroomChat / EphemeralMessaging` | **Mensajes** | **Messages** |
| `DateDiary / EncountersDashboard` | **Encuentros** | **Encounters** |
| `ProtocolView / UserSettings` | **Perfil** | **Profile** |
| `Fog Mode / AvatarBlur` | **Modo Niebla** | **Fog Mode** |
| `Burn-on-View / SelfDestruct` | **Ver una sola vez** | **View Once** |
| `RendezvousPin / TempCoord` | **Pin de Encuentro** | **Rendezvous PIN** |
| `Soft-Block / BoundarySetting` | **Protocolo de Límites** | **Boundary Protocol** |
| `Respect Karma Score / Rating` | **Puntaje de Respeto** | **Respect Score** |
| `AppSettingsModal` | **Configuración (Tocar Logo)** | **Settings (Tap Logo)** |
| `PrivateVault / SecretPhotos` | **Bóveda Cifrada** | **Encrypted Vault** |
| `HostCardModal / HostCardBadge` | **Ficha de Hospedaje** | **Host Card** |
| `PreFlightChecklistModal / PreFlightCard` | **Sintonía Pre-Flight** | **Pre-Flight Checklist** |
| `VoiceVibePlayer / VoiceVibeRecorderModal` | **Voice Vibe (Audio 5s)** | **Voice Vibe (5s Audio)** |
| `EnRouteTrackerModal / EnRouteBanner` | **Voy en Camino** | **On My Way** |
| `SafetyBeaconModal / BeaconCountdownWidget` | **Guardián Silencioso** | **Safety Beacon** |
| `DuressPinSettingsModal` | **PIN de Coacción** | **Duress PIN** |
| `CalculatorCoverScreen / AppDisguiseModal` | **Bloc de Notas Señuelo (Flip-to-Cover)** | **Disguise Notepad (Flip-to-Cover)** |
| `LivenessVerificationModal` | **Liveness 3D Facial** | **3D Facial Liveness** |
| `ExitProtocolSelector / ExitProtocolBadge` | **Protocolo de Salida** | **Exit Protocol** |
| `DoxyPepTrackerCard` | **Botiquín Doxy-PEP** | **Doxy-PEP Tracker** |
| `SessionRoomModal` | **Salas de Sesión** | **Session Rooms** |
| `DuoLinkModal` | **Modo Dúo (Pareja)** | **Duo Mode (Couple)** |
| `TacticalHotspotsOverlay / mockHotspots` | **Hotspots & Cruising** | **Hotspots & Cruising** |
| `UnlimitedPaywallModal` | **VESSEL UNLIMITED** | **VESSEL UNLIMITED** |
| `VaultAuditModal` | **Auditoría de Bóvedas** | **Vault Audit** |
| `TravelModeModal` | **Travel Mode (Teleportación)** | **Travel Mode** |
