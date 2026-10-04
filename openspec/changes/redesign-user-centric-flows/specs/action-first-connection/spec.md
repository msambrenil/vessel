# Delta Spec: Conexión Action-First & Doble Consentimiento (action-first-connection)

## Added Capabilities

### Capability: Pulso de Sintonía con Pre-Flight Adjunto
El sistema SHALL reemplazar el botón de apertura directa de chat en blanco por una acción de primer orden: **"Enviar Pulso de Sintonía"** con una propuesta inicial de Pre-Flight (Rol + Prácticas + Cuidado).

#### Scenario: Envío de propuesta de sintonía en 3 taps
Given que el usuario A decide conectar con el usuario B
When toca el botón "Sintonizar" en la tarjeta o en el detalle
Then el sistema SHALL abrir una hoja compacta de Pre-Flight con las preferencias predeterminadas del usuario A
And al confirmar, SHALL enviar un Pulso de Sintonía enriquecido al usuario B.

### Capability: Doble Consentimiento Obligatorio previo al Darkroom Chat
El sistema SHALL impedir la apertura de conversaciones de texto vacías hasta que el receptor revise y acepte el Pulso de Sintonía con el Pre-Flight propuesto.

#### Scenario: Aceptación de sintonía mutua desbloquea el Darkroom Chat
Given que el usuario B recibe un Pulso de Sintonía del usuario A
When el usuario B revisa el Pre-Flight propuesto y toca "Aceptar Sintonía"
Then el sistema SHALL crear el canal de Darkroom Chat
And el primer mensaje del chat SHALL ser la tarjeta de acuerdo mutuo fijada en la cabecera del chat
And el sistema SHALL emitir una pulsación háptica y feedback sonoro sub-bass de confirmación (60 Hz).

#### Scenario: Salida amable y rechazo sin ghosteo
Given que el usuario B recibe un Pulso pero no hay compatibilidad
When el usuario B toca "Declinar con Respeto"
Then el sistema SHALL enviar una notificación estándar neutra ("No hay coincidencia en este momento, buenas rutas")
And el Karma de Respeto (Anti-Ghost) del usuario B SHALL ser bonificado por respuesta oportuna.
