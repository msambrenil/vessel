import { ChatMessage, UserAlbum } from "@/types/vessel";
import { setInIdb, removeFromIdb } from "./indexedDbSync";

export type AppMode = "test" | "real";

export const APP_MODE_STORAGE_KEY = "vessel_app_mode";

let currentActiveAppMode: AppMode = "test";

/**
 * Obtiene el modo de la aplicación activo (test vs real)
 * Prioridad: URL param (?mode=test|real) > localStorage > fallback default ('test')
 */
export const getActiveAppMode = (): AppMode => {
  if (typeof window === "undefined") return currentActiveAppMode;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get("mode");
    if (modeParam === "real" || modeParam === "test") {
      window.localStorage.setItem(APP_MODE_STORAGE_KEY, modeParam);
      currentActiveAppMode = modeParam;
      return modeParam;
    }
    const saved = window.localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (saved === "real" || saved === "test") {
      currentActiveAppMode = saved;
      return saved;
    }
  } catch {}
  return currentActiveAppMode;
};

/**
 * Establece y persiste el modo activo
 */
export const setActiveAppMode = (mode: AppMode): void => {
  currentActiveAppMode = mode;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
    } catch {}
  }
};

/**
 * Resuelve la clave de almacenamiento con el prefijo del modo correspondiente
 * Permite que los datos de prueba y los datos reales no colisionen en el navegador.
 */
export const getScopedStorageKey = (key: string, mode?: AppMode): string => {
  const m = mode || getActiveAppMode();
  // Claves globales compartidas entre modos
  if (
    key === "vessel_app_settings_v1" ||
    key === APP_MODE_STORAGE_KEY ||
    key === "test_inexistent_key" ||
    key === "test_profile_key" ||
    key === "test_temp_key" ||
    key === "test_deferred_key" ||
    key === "test_cancelled_key"
  ) {
    return key;
  }
  return `${m}_${key}`;
};

/**
 * Helper utilitario para persistencia local-first inmediata en el navegador con soporte de modo
 */
export const loadFromStorage = <T>(key: string, fallback: T, mode?: AppMode): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const scopedKey = getScopedStorageKey(key, mode);
    let item = window.localStorage.getItem(scopedKey);

    // Compatibilidad retroactiva: Si no existe la clave prefijada, probar con la clave directa
    if (!item && scopedKey !== key) {
      item = window.localStorage.getItem(key);
    }

    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error leyendo clave '${key}' de localStorage:`, error);
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T, mode?: AppMode): void => {
  if (typeof window === "undefined") return;

  const scopedKey = getScopedStorageKey(key, mode);

  // Respaldo asíncrono permanente en IndexedDB (alta capacidad en GBs, sin límite de 5MB)
  if (key === STORAGE_KEYS.ALBUMS || key === STORAGE_KEYS.CHAT_MESSAGES || key === STORAGE_KEYS.DIARY) {
    setInIdb(scopedKey, value).catch((err) =>
      console.warn(`[VESSEL Storage] Error al respaldar en IndexedDB '${scopedKey}':`, err)
    );
  }

  try {
    window.localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch (error: unknown) {
    const isQuotaError =
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    if (isQuotaError) {
      console.warn(`[VESSEL Storage] Quota de localStorage alcanzada al guardar '${scopedKey}'. Gestionando fallback con IndexedDB...`);
      // Asegurar que el dato completo esté persistido en IndexedDB
      setInIdb(scopedKey, value).catch(() => {});

      try {
        // Poda 1: Intentar podar mensajes efímeros y quemados antiguos
        const rawChats = window.localStorage.getItem(getScopedStorageKey(STORAGE_KEYS.CHAT_MESSAGES, mode));
        if (rawChats) {
          const parsedChats = JSON.parse(rawChats) as Record<string, ChatMessage[]>;
          const prunedChats: Record<string, ChatMessage[]> = {};
          for (const [pId, msgs] of Object.entries(parsedChats)) {
            if (Array.isArray(msgs)) {
              // Conservar solo los últimos 10 mensajes y descartar medios destruidos
              prunedChats[pId] = msgs
                .filter((m: ChatMessage) => !m.isBurned)
                .slice(-10);
            }
          }
          window.localStorage.setItem(getScopedStorageKey(STORAGE_KEYS.CHAT_MESSAGES, mode), JSON.stringify(prunedChats));
        }

        // Reintentar guardar el valor solicitado
        window.localStorage.setItem(scopedKey, JSON.stringify(value));
        console.info(`[VESSEL Storage] Guardado exitoso tras poda de caché para '${scopedKey}'.`);
      } catch {
        // Poda 2: Si aún falla (ej. álbumes con fotos data:), aligerar la copia en localStorage
        // guardando solo metadata, ya que IndexedDB conserva el 100% íntegro.
        if (key === STORAGE_KEYS.ALBUMS && Array.isArray(value)) {
          try {
            const lightAlbums = (value as unknown as UserAlbum[]).map((album) => ({
              ...album,
              photos: (album.photos || []).map((photo) => ({
                ...photo,
                url: photo.url.startsWith("data:") ? "" : photo.url,
                blurredUrl: photo.blurredUrl?.startsWith("data:") ? "" : photo.blurredUrl,
              })),
            }));
            window.localStorage.setItem(scopedKey, JSON.stringify(lightAlbums));
            console.info(`[VESSEL Storage] Guardado ligero de álbumes en localStorage completado (Full en IndexedDB).`);
          } catch {
            console.warn(`[VESSEL Storage] Cuota saturada. Datos asegurados en IndexedDB de forma íntegra para '${scopedKey}'.`);
          }
        }
      }
    } else {
      console.warn(`Error guardando clave '${scopedKey}' en localStorage:`, error);
    }
  }
};

export const removeFromStorage = (key: string, mode?: AppMode): void => {
  if (typeof window === "undefined") return;
  const scopedKey = getScopedStorageKey(key, mode);
  removeFromIdb(scopedKey).catch(() => {});
  try {
    window.localStorage.removeItem(scopedKey);
    // Eliminar también la clave base no prefijada para prevenir resurrección de datos legados
    if (scopedKey !== key) {
      window.localStorage.removeItem(key);
      removeFromIdb(key).catch(() => {});
    }
  } catch (error) {
    console.warn(`Error eliminando clave '${scopedKey}' de localStorage:`, error);
  }
};

/**
 * Limpia selectivamente el almacenamiento local de un modo específico
 */
export const clearModeStorage = (mode: AppMode): void => {
  if (typeof window === "undefined") return;
  try {
    const prefix = `${mode}_vessel_`;
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith(prefix) || k.startsWith(`${mode}_`))) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => {
      window.localStorage.removeItem(k);
      removeFromIdb(k).catch(() => {});
    });
  } catch (err) {
    console.warn("Error limpiando almacenamiento de modo:", err);
  }
};

/**
 * Cola de tareas diferidas para serialización y persistencia en segundo plano
 * evitando que JSON.stringify de grandes objetos bloquee el hilo de renderizado (60/120fps).
 */
const deferredTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

export const scheduleDeferredSave = <T>(key: string, value: T, delayMs: number = 250, mode?: AppMode): void => {
  if (typeof window === "undefined") return;

  const timerKey = getScopedStorageKey(key, mode);

  // Cancelar temporizador previo para esta clave si existe (debounce)
  if (deferredTimers.has(timerKey)) {
    clearTimeout(deferredTimers.get(timerKey));
    deferredTimers.delete(timerKey);
  }

  const timer = setTimeout(() => {
    deferredTimers.delete(timerKey);
    // Ejecutar en momentos de inactividad del navegador si está soportado
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => void }).requestIdleCallback(
        () => {
          saveToStorage(key, value, mode);
        },
        { timeout: 1000 }
      );
    } else {
      saveToStorage(key, value, mode);
    }
  }, delayMs);

  deferredTimers.set(timerKey, timer);
};

export const flushDeferredSave = (key: string): void => {
  if (deferredTimers.has(key)) {
    clearTimeout(deferredTimers.get(key));
    deferredTimers.delete(key);
  }
};

export const STORAGE_KEYS = {
  PROFILE: "vessel_user_profile_v1",
  ALBUMS: "vessel_user_albums_v1",
  BODY_STATE: "vessel_user_bodystate_v1",
  PLAN: "vessel_user_plan_v1",
  SETTINGS: "vessel_app_settings_v1",
  BOUNDARIES: "vessel_user_boundaries_v1",
  DIARY: "vessel_user_diary_v1",
  VALIDATED_ENCOUNTERS: "vessel_user_encounters_v1",
  MY_TESTIMONIALS: "vessel_user_my_testimonials_v1",
  CHAT_MESSAGES: "vessel_chat_messages_v1",
  CHAT_RETENTION: "vessel_chat_retention_v1",
  DOSSIERS: "vessel_user_dossiers_v1",
  CUSTOM_PROFILES: "vessel_custom_profiles_v1",
  TEST_PERSONAS: "vessel_test_personas_v1",
  RECEIVED_PULSES: "vessel_received_pulses_v1",
  HOST_CARD: "vessel_host_card_v1",
  VOICE_VIBE: "vessel_voice_vibe_v1",
  SAFETY_BEACON: "vessel_safety_beacon_v1",
  APP_DISGUISE: "vessel_app_disguise_v1",
  EXIT_PROTOCOL: "vessel_exit_protocol_v1",
  DOXYPEP_TRACKERS: "vessel_doxypep_trackers_v1",
  DUO_LINK: "vessel_duo_link_v1",
  TRAVEL_MODE: "vessel_travel_mode_v1",
  VAULT_AUDIT_LOGS: "vessel_vault_audit_logs_v1",
  ON_THE_CLOCK: "vessel_on_the_clock_v1",
  KINK_MATRIX: "vessel_kink_matrix_v1",
  WEEKEND_PASS: "vessel_weekend_pass_v1",
  HARM_REDUCTION: "vessel_harm_reduction_v1",
  SECURE_WAYPOINTS: "vessel_secure_waypoints_v1",
  AMBIENT_VIBE: "vessel_ambient_vibe_v1",
  SUBSTANCE_ATMOSPHERE: "vessel_substance_atmosphere_v1",
  NIGHTLIFE_EVENTS: "vessel_nightlife_events_v1",
  NIGHTLIFE_CHECKIN: "vessel_nightlife_checkin_v1",
  MISSED_CONNECTIONS: "vessel_missed_connections_v1",
  WINGMAN_PAIR: "vessel_wingman_pair_v1",
  PARTY_PASS: "vessel_party_pass_v1",
  ADMIN_AUDIT: "vessel_admin_audit_v1",
  ADMIN_REPORTS: "vessel_admin_reports_v1",
  COORDINATES: "vessel_coordinates_v1",
  STAFF_MEMBERS: "vessel_staff_members_v1",
  QUOTA_SETTINGS: "vessel_quota_settings_v1",
  STAFF_SESSION: "vessel_staff_session_v1",
  SUBSCRIPTION_RECEIPTS: "vessel_subscription_receipts_v1",
};
