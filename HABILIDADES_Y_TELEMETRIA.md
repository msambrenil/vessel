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
| **Transmisión de Pulso (Hold)** | 60 Hz | Sostenido | Vibración continua que culmina en disparo al 100%. |
| **Pulso Enviado (`playSignalSent`)** | 75 Hz | 0.30s | Doble pulso afirmativo de confirmación sub-bass. |
| **Desbloqueo de Bóveda (`playVaultUnlock`)** | 55 Hz → 90 Hz | 0.45s | Barrido frecuencial ascendente (*Frequency Ramp*). |
| **Micro-Interacción / Tap (`playPulse`)** | 65 Hz | 0.10s | Pulso táctil ultracorto para feedback físico. |
| **Prueba de Tono Carnal (`playSubBass`)** | 45 Hz | 0.40s | Resonancia sub-grave analógica pura a 45 Hz. |
| **Alerta Guardián / Alarma (`playSubBass(45)`)** | 45 Hz | 0.60s | Pulso grave persistente de alerta física en Dead-Man switch. |
| **Voice Vibe Preview (`playSubBass(65)`)** | 65 Hz | 0.20s | Onda analógica que acompaña la reproducción de voz de 5s. |
| **Sintonía Pre-Flight (`playSubBass(80)`)** | 80 Hz | 0.35s | Doble tono armónico al confirmar acuerdo erótico previo. |
| **Llegada en Puerta En Camino (`playSubBass(90)`)** | 90 Hz | 0.25s | Golpe acústico de timbre al arribar a <50m del anfitrión. |

---

## 2. Eventos de Telemetría y Señales de Ciclo de Vida

Los siguientes eventos son despachados a través del despachador unificado de `VesselContext`:

1. `PULSE_TRANSMITTED` / `SIGNAL_TRANSMITTED`:
   - Payload: `{ targetProfileId, intensity, timestamp }`.
   - Efecto: Registra el pulso enviado y activa feedback háptico/acústico (75 Hz).
2. `PULSE_RETURNED`:
   - Payload: `{ fromProfileId, timestamp }`.
   - Efecto: Retribuye el pulso al remitente, actualiza `returned: true` e incrementa transmisiones.
3. `BODY_STATE_MUTATED`:
   - Payload: `{ previousState, nextState, timestamp }`.
   - Efecto: Actualiza presencia en radar y conmuta el modo del sintetizador.
4. `RENDEZVOUS_PIN_EMITTED`:
   - Payload: `{ pinCode, expiresAt, geohashCell }`.
   - Efecto: Genera cuenta regresiva de 15 minutos para encuentro efímero.
5. `NO_GHOST_DISCONNECTION_APPLIED`:
   - Payload: `{ targetProfileId, protocol, karmaPointsAwarded }`.
   - Efecto: Otorga puntos de respeto (+5) y actualiza el estado de la conexión en `boundaries`.
6. `ENCRYPTED_VAULT_REVEALED`:
   - Payload: `{ albumId, targetProfileId, durationSeconds }`.
   - Efecto: Desbloquea la bóveda temporalmente con temporizador de caducidad.
7. `APP_SETTINGS_SYNCED`:
   - Payload: `{ language, unitSystem, cloudSyncEnabled, lastBackupAt }`.
   - Efecto: Persiste preferencias globales en almacenamiento local cifrado.
8. `EN_ROUTE_TRACKER_DISPATCHED`:
   - Payload: `{ targetProfileId, etaMinutes, isArrived, timestamp }`.
   - Efecto: Activa el banner HUD superior y notifica llegada a puerta (<50m).
9. `SAFETY_BEACON_DISPATCHED`:
   - Payload: `{ durationMinutes, emergencyContactLocal, triggerAlarms, isDuress }`.
   - Efecto: Inicia Dead-Man switch con cuenta regresiva en cabecera y alarma a 45 Hz.
10. `DURESS_PIN_ENGAGED`:
    - Payload: `{ pinEntered, timestamp, silentPanicFired }`.
    - Efecto: Salta de inmediato a la pantalla señuelo y dispara auxilio silencioso local.
11. `PRE_FLIGHT_CHECKLIST_COMMITTED`:
    - Payload: `{ rhythm, practices, barrier, vibe, partnerId }`.
    - Efecto: Inserta tarjeta cifrada de acuerdos en el feed del chat efímero.
12. `APP_COVER_ENGAGED`:
    - Payload: `{ trigger: "gyroscope_flip" | "escape_key" | "tap_shortcut", screen: "notepad" }`.
    - Efecto: Cubre la aplicación con el Bloc de Notas brutalista funcional.
13. `DOXYPEP_DOSE_REGISTERED`:
    - Payload: `{ trackerId, partnerCodename, doseType: "24h" | "72h", timestamp }`.
    - Efecto: Registra cumplimiento de profilaxis post-exposición en el Date Diary.
14. `HOTSPOT_CHECKIN_MUTATED`:
    - Payload: `{ hotspotId, action: "check_in" | "check_out", anonymousCount }`.
    - Efecto: Actualiza el conteo de Vessels presentes en saunas/darkrooms en tiempo real.

---

## 3. Modos de Ahorro y Sensores de Hardware

- **Battery State Monitoring (`BatteryStateEngine`)**:
  - `FOREGROUND_ACTIVE`: Muestreo de radar cada 30s.
  - `BACKGROUND_THROTTLED`: Muestreo espaciado cada 15m.
  - `GEOFENCE_PASSIVE`: Activación por eventos de cambio de celda S2.
  - `ECO_SAVER`: Desactiva animaciones continuas y baja el muestreo si la batería es <20%.
