import { BatteryMode, BodyState } from "@/types/vessel";

export const VESSEL_PERIODIC_SYNC_TAG = "vessel-geo-battery-sync";
export const VESSEL_ONE_OFF_SYNC_TAG = "vessel-sync-ping";

interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval?: number }): Promise<void>;
  unregister(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface SyncRegistrationWithPeriodic {
  periodicSync?: PeriodicSyncManager;
  sync?: {
    register(tag: string): Promise<void>;
  };
}

/**
 * Registra o modula la sincronización periódica en segundo plano
 * adaptada al nivel de batería y al estado corporal del usuario.
 */
export async function registerPeriodicGeoSync(
  mode: BatteryMode,
  batteryLevel: number,
  bodyState: BodyState
): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = (await navigator.serviceWorker.ready) as unknown as SyncRegistrationWithPeriodic;

    // Si el navegador no soporta Periodic Background Sync API, intentar fallback a Sync de 1 disparo
    if (!registration || !registration.periodicSync) {
      return triggerOneOffSyncFallback();
    }

    // Regla de Protección Energética: Batería crítica (<=15%) o Modo Inactivo (dormant)
    // Cancela la sincronización en segundo plano para preservar el dispositivo
    if (batteryLevel <= 15 || bodyState === "dormant") {
      await unregisterPeriodicGeoSync();
      return true;
    }

    // Comprobar estado de permisos en navegadores Chromium/PWA
    if ("permissions" in navigator) {
      try {
        const status = await navigator.permissions.query({
          name: "periodic-background-sync" as PermissionName,
        });
        if (status.state !== "granted") {
          return false;
        }
      } catch {
        // Algunos navegadores no implementan el token de permiso específico
      }
    }

    // Calcular intervalo mínimo según el modo del motor de batería
    // Eco-Saver: 60 minutos | Activo: 15 minutos
    const minInterval = mode === "eco_saver" ? 60 * 60 * 1000 : 15 * 60 * 1000;

    await registration.periodicSync.register(VESSEL_PERIODIC_SYNC_TAG, {
      minInterval,
    });

    return true;
  } catch {
    // Falla controlada silenciosa (ej: PWA no instalada o navegador en modo incógnito)
    return false;
  }
}

/**
 * Desregistra la sincronización periódica para pausar el consumo en segundo plano
 */
export async function unregisterPeriodicGeoSync(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = (await navigator.serviceWorker.ready) as unknown as SyncRegistrationWithPeriodic;
    if (registration && registration.periodicSync) {
      await registration.periodicSync.unregister(VESSEL_PERIODIC_SYNC_TAG);
      return true;
    }
  } catch {
    // Ignorar si no estaba registrado
  }
  return false;
}

/**
 * Fallback a One-Off Sync para registrar un evento único de sincronización
 */
export async function triggerOneOffSyncFallback(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = (await navigator.serviceWorker.ready) as unknown as SyncRegistrationWithPeriodic;
    if (registration && registration.sync) {
      await registration.sync.register(VESSEL_ONE_OFF_SYNC_TAG);
      return true;
    }
  } catch {
    // Ignorar si no está soportado
  }
  return false;
}
