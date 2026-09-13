# Reglas de Negocio y Producto — Sistema VESSEL

Este documento establece las reglas de negocio, políticas de producto y restricciones funcionales inmutables de **VESSEL**. Cualquier modificación requiere análisis de impacto y confirmación previa.

---

## 1. Modelo de Cuotas y Membresías (Plan Gratuito vs VESSEL UNLIMITED)

* **Plan Gratuito (`free`)**:
  * Máximo **1 Álbum Público** en el perfil (fotos y clips de muestra).
  * Máximo **1 Bóveda Privada** con acceso bajo autorización y temporizador de 10s.
  * Carga directa de fotos y videos desde celular o notebook.
  * Acceso completo a la Matriz, Radar de proximidad y Darkroom Chat en radio local de **hasta 1.0 km (1000m)**.
  * **Alcance Táctico a Distancia (> 1.0 km)**:
    * Los perfiles lejanos se visualizan con **Intriga Táctica** (desenfoque de silueta `blur-[8px]` y biografía clasificada).
    * El envío de **Pulsos Rápidos (1-Tap)** se mantiene gratuito e ilimitado para expresar atracción.
    * El **Darkroom Chat** con perfiles a más de 1.0 km es **gratuito si existe Sintonía Mutua** (ambos perfiles se enviaron o devolvieron un pulso recíproco).
    * Sin sintonía mutua, el chat directo inmediato a más de 1.0 km requiere `VESSEL UNLIMITED`.
* **Membresía Oficial: `VESSEL UNLIMITED` (`unlimited`)**:
  * **Lema Oficial**: *"Álbumes, bóvedas y señales ilimitadas."*
  * **Transmisión Satelital de Largo Alcance (>1.0 km)**: Visualización 100% nítida de fotos, biografías completas y apertura de Darkroom Chat inmediato con perfiles a cualquier distancia sin esperar respuesta al pulso (*Skip the line*).
  * **Álbumes Públicos & Bóvedas Privadas Ilimitadas**: Creación de multi-bóvedas temáticas (*Sensual, Kink, Gym, Cruising*).
  * **Clips de Video en Alta Definición**: Carga y reproducción de video-loops HD en galerías y bóvedas.
  * **Llaves de Acceso Granulares**: Autorización individual de álbumes específicos para cada match o contacto.
  * **Temporizador Efímero Configurable**: Ajuste de duración (10s, 30s, 60s o ilimitado).
  * **Radar Táctico & Boost de Presencia**: Mayor visibilidad en la matriz sin comprometer la privacidad geoespacial.

---

## 2. Protocolo de Doble Consentimiento en Testimonios

* **Condición de Emisión**: Un usuario **A** solo puede dejar un testimonio sobre el usuario **B** si existe un encuentro físico validado mediante:
  1. Coincidencia de proximidad física (*Geofencing <50m*).
  2. Intercambio y validación exitosa de un *Rendezvous PIN*.
  3. Acuerdo mutuo explícito en el canal de chat.
* **Control de Visibilidad**: El usuario receptor (**B**) tiene control absoluto y unilateral sobre la publicación: puede marcar el testimonio como *Público* en su perfil o mantenerlo *Oculto*, previniendo difamación o toxicidad.

---

## 3. Cultura del Respeto & Protocolo Anti-Ghosteo

* **Modo No Ghost por Defecto**:
  * Activado para todos los perfiles de manera predeterminada.
  * Proporciona sugerencias de salida rápida, elegante y sexy en 1 tap (*"Sos fuego, pero hoy no tengo chispa"*, *"Sigo de viaje. Gracias por la conexión"*).
* **Respect Karma Score (0-100%)**:
  * Se incrementa (+5 pts) al cerrar amablemente una conversación sin dejarla en visto prolongado.
  * Se mantiene alto al responder con celeridad a las transmisiones y mensajes.
* **Beneficios de Alto Respeto**:
  * **+35% Boost de Visibilidad** en el radar y grilla para usuarios con score >85%.
  * **Insignia Anti-Fantasma (`AntiGhostBadge`)** visible en el avatar y tarjeta de perfil.

---

## 4. Desconexión Gradual y Límites (Soft-Block Architecture)

* **Prohibición de Bloqueo Destructivo**: La plataforma evita la desaparición abrupta que genera incertidumbre o fricción social.
* **Protocolos de Cierre Configurables**:
  1. *Pausa Temporal (Cooldown)*: Silencia el chat y notificaciones temporalmente.
  2. *Cierre Amable & Archivo*: Deja el chat en modo Solo Lectura, premia con +5 puntos de respeto y preserva el historial.
  3. *Desvanecimiento Silencioso (Shadow Stealth)*: Atenúa la presencia sin emitir notificaciones hostiles.
  4. *Límite Estricto (Cortafuegos)*: Desconexión total de chat y ocultamiento en radar.
* **Matriz de Permisos a Medida**: El usuario puede controlar individualmente el estado del chat, visibilidad de fotos públicas, revocación de bóveda privada y presencia en radar.

---

## 5. Privacidad Facial, Foto Obligatoria y Modo Niebla

* **Zero-Fake / Anti-Bot**: Verificación obligatoria mediante OAuth y prueba biométrica 3D de vida (*Liveness Detection*).
* **Foto de Perfil Obligatoria**: Todo usuario activo en VESSEL debe subir obligatoriamente una fotografía a su perfil; no se admiten perfiles sin imagen asignada.
* **Visualización Normal por Defecto**: Las fotos se renderizan de forma nítida y transparente a menos que el usuario elija explícitamente el Modo Niebla.
* **Modo Niebla (Fog Mode // Desenfoque Calibrado)**:
  * Si el usuario desea resguardar sus facciones faciales o mantener alta discreción, puede activar el *Modo Niebla*.
  * El nivel de desenfoque suave y calibrado (`blur: 6px-7px` en tarjetas y modal; `blur: 3px-4px` en radar y chat) atenúa los rasgos faciales directos sin ser excesivamente opaco ni perder la nitidez de la silueta, sonrisa, contextura muscular, tono, vestimenta y atmósfera luminosa.
  * Los perfiles en Modo Niebla conservan su verificación de identidad y se distinguen con la insignia `🌫️ Niebla`.
* **Avatares Estilizados**: Como alternativa conceptual adicional, los usuarios verificados pueden optar por un avatar brutalista de catálogo.

---

## 6. Escudo Anti-Triangulación y Arquitectura Geoespacial

* **Prohibición de Coordenadas Crudas**: Las coordenadas de latitud/longitud exactas nunca se envían al cliente de otros usuarios.
* **Discretización Google S2**: Todas las posiciones se indexan en celdas espaciales de Nivel 14 (~152m).
* **Unidades de Distancia**: Formateo dinámico reactivo según la preferencia del usuario (*Métrico: metros/km* vs *Imperial: pies/millas*).

---

## 7. Prevención y Salud Sexual (Smart Health Routine)

* **Privacidad Absoluta del Diario**: Las entradas del *Date Diary* se almacenan localmente y nunca se transmiten a terceros.
* **Calendario PrEP a 90 Días**: Tras registrar encuentros de alta intensidad, el sistema programa automáticamente un recordatorio discreto para el próximo control de salud sexual preventivo.

---

## 8. Sistema de Pulsos (Interacción Rápida & Telemetría Estandarizada)

* **Denominación Estandarizada Universal**:
  * La interacción rápida de 1-tap (equivalente a los *Taps* de Grindr o *Flash* de The Blowers) se denomina oficialmente **"Pulso"** (en plural **"Pulsos"** / en inglés **"Pulse"** / **"Pulses"**).
  * La acción se unifica bajo el término **"Mandar Pulso"** (*"Send Pulse"*), con estado **"Pulso enviado"** (*"Pulse sent"*), independientemente del rol del usuario (activo, pasivo, versátil, etc.).
  * Los botones conservan su iconografía táctica o de rol (ej. 🍑, 🍆, ⚡), pero con semántica y feedback unificado.
* **Bandeja de Pulsos Recibidos en Navegación Inferior**:
  * La barra de navegación cuenta con la pestaña dedicada **"Pulsos"** (6ta pestaña).
  * Informa en tiempo real con un badge dinámico en color ámbar/neón los pulsos entrantes sin abrir.
  * Permite consultar la lista de perfiles que te enviaron un pulso (con distancia aproximada y tiempo transcurrido), devolver el pulso con 1-tap y abrir el chat efímero inmediatamente.
  * Incluye la sub-pestaña **"Enviados"** para auditar a qué perfiles se emitieron pulsos desde la grilla o el radar.

---

## 9. Logística de Encuentro & Doble Consentimiento Sexual (Pre-Flight)

* **Ficha de Hospedaje Táctica**:
  * Transparencia logística estricta: especifica si se tiene lugar para recibir (`hasPlace`), tipo de vivienda (`solo`, `roommates`, `partner_aware`, `hotel`), comodidades inmediatas (*ducha lista, toallas limpias, ascensor, AC/calefacción*) e insumos (*condones, lubricante, poppers, toallitas*).
  * Los perfiles con `hasPlace: true` pueden ser filtrados de inmediato en la matriz bajo la condición *"Tiene lugar YA"*.
* **Pre-Flight Checklist Sexual**:
  * Acuerdos explícitos de compatibilidad erótica previos al encuentro para eliminar malentendidos o presiones en persona.
  * Comprende 4 dimensiones consensuadas: Ritmo (*Fast, Sensual, Rough, Chill*), Prácticas en sintonía (*Oral, Penetración, Masaje, Fetiches, Besos*), Salud/Barreras (*Bareback+PrEP, Doxy-PEP, Preservativo, Conversar*) y Sustancias (*Sobrio, Tragos, 420*).
  * El acuerdo se plasma en el chat con la etiqueta criptográfica *"Sintonía Fuego 🔥"*.
* **Voice Vibe**:
  * Clips de audio limitados estrictamente a **5 segundos** como prueba de presencia, autenticidad y tono de voz, sin saturar el almacenamiento ni permitir notas extensas en el perfil público.

---

## 10. Seguridad Física, Guardián Silencioso & Coacción (Local-First Guard)

* **Guardián Silencioso (Dead-Man Switch)**:
  * El usuario fija un temporizador de encuentro (45, 90, 120 min).
  * Un widget persistente en la cabecera muestra la cuenta regresiva en vivo y entra en estado de alerta parpadeante en los últimos 10 minutos.
  * Si el temporizador expira sin desactivarse por PIN, el sistema emite una alarma de resonancia grave a 45 Hz y activa el protocolo de emergencia local.
* **Política Estricta Local-First para Emergencias**:
  * **Cero Servidores Centrales**: Los datos del contacto de confianza (nombre, teléfono) y la dirección del encuentro se almacenan **exclusivamente en el dispositivo del usuario** (localStorage cliente).
  * En caso de activación o pánico, se generan enlaces de auxilio directos del dispositivo (SMS/Llamada/Telegram) sin almacenar datos en la nube para proteger la privacidad absoluta del usuario ante cualquier brecha.
* **PIN de Coacción & Pantalla Señuelo (Flip-to-Cover)**:
  * Si el usuario es coaccionado físicamente para desbloquear la app, ingresar el PIN de coacción (ej. `9999`) aparenta desactivar el sistema, salta de inmediato a la pantalla señuelo (**Bloc de Notas Brutalista**) y alerta silenciosamente al contacto local.
  * El camuflaje cuenta con **Flip-to-Cover**: colocar el teléfono boca abajo sobre la superficie activa automáticamente el Bloc de Notas.

---

## 11. Dinámicas Post-Encuentro & Salud Preventiva (Doxy-PEP & Exit Protocol)

* **Protocolo de Salida (Exit Protocol)**:
  * Establece la expectativa post-coital para evitar incomodidades sociales: *Fast Encounter* ⏱️ (despedida inmediata), *Chill & Cuddle* 🫂 (ducha y 20-30 min de charla/relax), o *Sleepover* 🌙 (abierto a pasar la noche).
* **Botiquín Clínico Doxy-PEP (Ventana 72 Horas)**:
  * Integrado en el *Date Diary* para el seguimiento clínico de profilaxis bacteriana post-exposición (sífilis, clamidia, gonorrea).
  * Cuenta regresiva en vivo de la ventana crítica de 72 horas con seguimiento de toma de dosis (Dosis 1 a 24h y Dosis 2 de refuerzo a 72h) de manera 100% confidencial y local.

---

## 12. Encuentros Grupales & Modo Dúo (Cruising Privado)

* **Salas de Sesión (Session Rooms)**:
  * Espacios de convocatoria para tríos, sesiones grupales o laboratorios fetiche con límite de aforo estricto (ej. 3/3 personas).
  * El anfitrión aprueba o deniega solicitudes de acceso con control de privacidad de la ubicación exacta.
* **Modo Dúo (Parejas)**:
  * Dos cuentas verificadas pueden vincularse para buscar juntas un tercero, compartiendo presencia unificada en la matriz con la insignia `👥 DÚO` y coordinando el chat efímero en conjunto.

---

## 13. Cruising Urbano Táctico & Hotspots Comunitarios

* **Mapeo de Hotspots Urbanos**:
  * Visualización en el Radar de recintos y puntos de encuentro de la comunidad (darkrooms, saunas, clubes y espacios al aire libre) con geohash aproximado.
* **Check-In Anónimo**:
  * Los usuarios pueden declarar su presencia en un recinto con 1 toque (*"Entrar"* / *"Salir"*).
  * La plataforma solo exhibe el conteo agregado de Vessels activos en el lugar (ej. *"🔥 18 Vessels en el lugar"*), preservando el anonimato individual y el escudo anti-triangulación.

