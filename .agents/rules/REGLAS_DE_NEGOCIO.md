# Reglas de Negocio y Producto — Sistema VESSEL

Este documento establece las reglas de negocio, políticas de producto y restricciones funcionales inmutables de **VESSEL**. Cualquier modificación requiere análisis de impacto y confirmación previa.

---

## 1. Modelo de Cuotas y Membresías (Free vs Premium)

* **Plan Gratuito (`free`)**:
  * Máximo **1 Álbum Público** en el perfil.
  * Máximo **1 Bóveda Privada** con acceso bajo autorización.
  * Acceso completo a la Matriz, Radar de proximidad y Darkroom Chat.
* **Planes de Expansión (`premium` / `unlimited`)**:
  * Álbumes públicos y privados ilimitados.
  * Bóvedas temporizadas con auto-bloqueo configurable.

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
