# Delta Spec: Radar de Sintonías e Intenciones Inmediatas (radar-intent-hub)

## Added Capabilities

### Capability: Selector de Modo de Sintonía Operativa (Intent Selector)
El sistema SHALL proveer en la cabecera del radar un selector de sintonía inmediata con 4 modos excluyentes de interacción para evitar la grilla euclidiana homogénea:
1. `now` (Encuentro Ya con Host): Perfiles con lugar activo o listos para salir en <90 minutos.
2. `nightlife` (Plan Nocturno & Hotspots): Eventos, boliches (Crobar, Under Club), saunas y fiestas con mapa táctico integrado.
3. `kink` (Sintonía Kink & Dinámicas): Coincidencia de roles y fetiches con medidores de intensidad.
4. `stealth` (Modo Sigilo / Zero-Trace): Perfiles discretos con Modo Niebla forzado e intercambio ciego de llaves.

#### Scenario: Filtrado inmediato por modo Encuentro Ya
Given que el usuario selecciona el modo "Encuentro Ya" en el selector de sintonías
When la vista del radar se actualiza
Then el sistema SHALL mostrar prioritariamente perfiles que tengan Ficha de Hospedaje verificada ("Recibe" o "Puede viajar") y disponibilidad inmediata activa (`isOnTheClock`)
And SHALL omitir perfiles inactivos o sin sintonía horaria inmediata declarada.

#### Scenario: Conmutación a Modo Nocturno y Hotspots
Given que es de noche y el usuario selecciona el modo "Plan Nocturno & Hotspots"
When el usuario interactúa con la vista
Then el sistema SHALL integrar los eventos y clubes tácticos de la noche junto con los usuarios que marcaron presencia o asistencia a dichos eventos
And SHALL priorizar la sintonía espacial de fiesta por sobre la distancia geométrica al domicilio.

### Capability: Presentación en Racimos de Sintonía (Clustered Intent Sections)
En lugar de una cuadrícula uniforme infinita, el radar SHALL organizar los resultados en secciones temáticas contextualizadas según el modo activo:
- "Con Lugar Propio Disponible Ahora"
- "Listos para Desplazarse"
- "Compatibilidad de Kinks 100%"
- "En el mismo Hotspot / Evento"

#### Scenario: Visualización clara de logística de espacio para usuarios en tránsito
Given que el usuario Facundo (Pibe de Lanús en viaje en el Tren Roca) accede al radar
When visualiza el racimo "Con Lugar Propio Disponible Ahora"
Then cada tarjeta expone explícitamente si el anfitrión recibe solo, comodidades del espacio y zona aproximada con geohash S2 (~152m)
And el usuario puede evaluar la viabilidad del encuentro sin iniciar una conversación en blanco.
