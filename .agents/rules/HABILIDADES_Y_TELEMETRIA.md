# Habilidades, Telemetría y Experiencia Sensorial — Sistema VESSEL

Este documento detalla el catálogo de eventos, telemetría interna, disparadores acústicos de sub-graves y habilidades del sistema.

---

## 1. Mapeo de Frecuencias y Disparadores Acústicos (Web Audio API)

VESSEL utiliza un motor de síntesis de audio analógico (`SubBassAudioEngine`) con osciladores de onda senoidal profunda y envolventes de ganancia exponenciales:

| Evento / Interacción | Frecuencia Base | Duración | Comportamiento Acústico |
| :--- | :--- | :--- | :--- |
| **Cambio a Open (`open`)** | 80 Hz | 0.25s | Pulso cálido ascendente con brillo armónico. |
| **Cambio a Occupied (`occupied`)** | 50 Hz | 0.40s | Pulso denso y profundo con resonancia sostenida. |
| **Cambio a Dormant (`dormant`)** | 40 Hz | 0.20s | Caída de tono apagada en desvanecimiento. |
| **Transmisión de Señal (Hold)** | 60 Hz | Sostenido | Vibración continua que culmina en disparo al 100%. |
| **Señal Enviada (`playSignalSent`)** | 75 Hz | 0.30s | Doble pulso afirmativo de confirmación. |
| **Desbloqueo de Bóveda (`playVaultUnlock`)** | 55 Hz → 90 Hz | 0.45s | Barrido frecuencial ascendente (*Frequency Ramp*). |
| **Micro-Interacción / Tap (`playPulse`)** | 65 Hz | 0.10s | Pulso táctil ultracorto para feedback físico. |
| **Prueba de Tono Carnal (`playSubBass`)** | 45 Hz | 0.40s | Resonancia sub-grave analógica pura a 45 Hz. |

---

## 2. Eventos de Telemetría y Señales de Ciclo de Vida

Los siguientes eventos son despachados a través del despachador unificado de `VesselContext`:

1. `SIGNAL_TRANSMITTED`:
   - Payload: `{ targetProfileId, intensity, timestamp }`.
   - Efecto: Registra la intensidad y activa pulso háptico/sonoro.
2. `BODY_STATE_MUTATED`:
   - Payload: `{ previousState, nextState, timestamp }`.
   - Efecto: Actualiza presencia en radar y conmuta el modo del sintetizador.
3. `RENDEZVOUS_PIN_EMITTED`:
   - Payload: `{ pinCode, expiresAt, geohashCell }`.
   - Efecto: Genera cuenta regresiva de 15 minutos para encuentro efímero.
4. `NO_GHOST_DISCONNECTION_APPLIED`:
   - Payload: `{ targetProfileId, protocol, karmaPointsAwarded }`.
   - Efecto: Otorga puntos de respeto (+5) y actualiza el estado de la conexión en `boundaries`.
5. `ENCRYPTED_VAULT_REVEALED`:
   - Payload: `{ albumId, targetProfileId, durationSeconds }`.
   - Efecto: Desbloquea la bóveda temporalmente con temporizador de caducidad.
6. `APP_SETTINGS_SYNCED`:
   - Payload: `{ language, unitSystem, cloudSyncEnabled, lastBackupAt }`.
   - Efecto: Persiste preferencias globales en almacenamiento local cifrado.

---

## 3. Modos de Ahorro y Sensores de Hardware

- **Battery State Monitoring (`BatteryStateEngine`)**:
  - `FOREGROUND_ACTIVE`: Muestreo de radar cada 30s.
  - `BACKGROUND_THROTTLED`: Muestreo espaciado cada 15m.
  - `GEOFENCE_PASSIVE`: Activación por eventos de cambio de celda S2.
  - `ECO_SAVER`: Desactiva animaciones continuas y baja el muestreo si la batería es <20%.
