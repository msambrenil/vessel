# Delta Spec: Tarjeta de Sintonía Táctica (tactical-card)

## Added Capabilities

### Capability: Tríada de Compatibilidad en la Tarjeta de Perfil
La tarjeta de perfil en el radar SHALL presentar tres dimensiones de compatibilidad inmediata sin requerir abrir el detalle del perfil:
1. **Espacio / Hospedaje**: Micro-insignia táctica indicando si el usuario recibe ("Host Solo", "Host Compartido"), puede desplazarse ("Móvil"), o busca lugar.
2. **Dinámica / Pre-Flight**: Rol sexual visible + coincidencias de prácticas mutuas + estado de cuidado preventivo (PrEP / Doxy-PEP) en micro-chips brutalistas.
3. **Disponibilidad Temporal**: Indicador regresivo ("Disponible próximos 45m" o "Buscando plan hoy").

#### Scenario: Visualización de tarjeta táctica sin cosificación pasiva
Given que un usuario explora perfiles en el radar
When se renderiza la tarjeta de un perfil
Then la tarjeta SHALL mostrar en el pie la Ficha de Hospedaje y el badge de compatibilidad de Pre-Flight
And la distancia en metros SHALL ser secundaria frente a la sintonía física real.

#### Scenario: Protección de privacidad en perfiles en Modo Niebla / Sigilo
Given que un perfil tiene activado el Modo Niebla o el Modo Sigilo
When su tarjeta es renderizada
Then la imagen facial SHALL permanecer desenfocada con filtro CSS de privacidad
And la micro-ficha de compatibilidad de roles y barreras SHALL mantenerse visible para permitir el match intencional sin comprometer la identidad pública.
