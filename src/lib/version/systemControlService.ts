import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import {
  CURRENT_SYSTEM_VERSION,
  SYSTEM_BUILD_TIMESTAMP,
  SYSTEM_BUILD_FORMATTED,
} from "./systemVersion";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  AppMode,
  getActiveAppMode,
} from "@/lib/storage/localStorageSync";
import { StaffMember } from "@/types/admin";
import { logAdminAction } from "@/lib/admin/adminService";

export interface SystemControlState {
  currentVersion: string;
  buildReleaseDate: string;
  formattedDate: string;
  forceReloadTimestamp: number;
  forceLogoutTimestamp: number;
  lastAction?: "RELOAD_TRIGGERED" | "LOGOUT_TRIGGERED" | "INITIALIZED";
  lastActionBy?: string;
  lastActionAt?: string;
  updatedAt: string;
}

export const DEFAULT_SYSTEM_CONTROL_STATE: SystemControlState = {
  currentVersion: CURRENT_SYSTEM_VERSION,
  buildReleaseDate: SYSTEM_BUILD_TIMESTAMP,
  formattedDate: SYSTEM_BUILD_FORMATTED,
  forceReloadTimestamp: 0,
  forceLogoutTimestamp: 0,
  lastAction: "INITIALIZED",
  updatedAt: new Date().toISOString(),
};

const SYSTEM_CONTROL_COLLECTION = "vessel_system_control";
const SYSTEM_CONTROL_DOC = "global_status";

/**
 * Obtiene el estado actual del control maestro del sistema.
 * En modo real consulta Firestore con fallback a almacenamiento local.
 */
export async function getSystemControlState(
  mode?: AppMode
): Promise<SystemControlState> {
  const currentMode = mode || getActiveAppMode();

  if (currentMode === "real" && db) {
    try {
      const docRef = doc(db, SYSTEM_CONTROL_COLLECTION, SYSTEM_CONTROL_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<SystemControlState>;
        const merged: SystemControlState = {
          ...DEFAULT_SYSTEM_CONTROL_STATE,
          ...data,
          currentVersion: CURRENT_SYSTEM_VERSION, // Garantizar que la versión del código manda
          buildReleaseDate: SYSTEM_BUILD_TIMESTAMP,
          formattedDate: SYSTEM_BUILD_FORMATTED,
        };
        saveToStorage(STORAGE_KEYS.SYSTEM_CONTROL, merged);
        return merged;
      }
    } catch (err) {
      console.warn("[VESSEL Control] Fallo leyendo Firestore, usando caché local:", err);
    }
  }

  return loadFromStorage<SystemControlState>(
    STORAGE_KEYS.SYSTEM_CONTROL,
    DEFAULT_SYSTEM_CONTROL_STATE
  );
}

/**
 * Suscripción reactiva en tiempo real al control maestro.
 * Escucha cambios en Firestore (o eventos locales en modo test/offline).
 */
export function subscribeToSystemControl(
  callback: (state: SystemControlState) => void,
  mode?: AppMode
): () => void {
  const currentMode = mode || getActiveAppMode();

  if (currentMode === "real" && db) {
    try {
      const docRef = doc(db, SYSTEM_CONTROL_COLLECTION, SYSTEM_CONTROL_DOC);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<SystemControlState>;
            const merged: SystemControlState = {
              ...DEFAULT_SYSTEM_CONTROL_STATE,
              ...data,
              currentVersion: CURRENT_SYSTEM_VERSION,
              buildReleaseDate: SYSTEM_BUILD_TIMESTAMP,
              formattedDate: SYSTEM_BUILD_FORMATTED,
            };
            saveToStorage(STORAGE_KEYS.SYSTEM_CONTROL, merged);
            callback(merged);
          } else {
            callback(DEFAULT_SYSTEM_CONTROL_STATE);
          }
        },
        (error) => {
          console.warn("[VESSEL Control] Error en snapshot listener:", error);
          const cached = loadFromStorage<SystemControlState>(
            STORAGE_KEYS.SYSTEM_CONTROL,
            DEFAULT_SYSTEM_CONTROL_STATE
          );
          callback(cached);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("[VESSEL Control] Error inicializando listener:", err);
    }
  }

  // Fallback para modo local/test o entornos sin conexión
  const handleLocalUpdate = () => {
    const cached = loadFromStorage<SystemControlState>(
      STORAGE_KEYS.SYSTEM_CONTROL,
      DEFAULT_SYSTEM_CONTROL_STATE
    );
    callback(cached);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("vessel:system-control-updated", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);
  }

  handleLocalUpdate();

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("vessel:system-control-updated", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
    }
  };
}

/**
 * Disparador de comando: Forzar que se cargue la última versión en todos los clientes.
 * Actualiza forceReloadTimestamp y sincroniza en Firestore y localmente.
 */
export async function triggerForceReload(
  operator: StaffMember,
  mode?: AppMode
): Promise<SystemControlState> {
  const currentMode = mode || getActiveAppMode();
  const nowMs = Date.now();
  const dateStr = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const previous = await getSystemControlState(currentMode);
  const updatedState: SystemControlState = {
    ...previous,
    currentVersion: CURRENT_SYSTEM_VERSION,
    buildReleaseDate: SYSTEM_BUILD_TIMESTAMP,
    formattedDate: SYSTEM_BUILD_FORMATTED,
    forceReloadTimestamp: nowMs,
    lastAction: "RELOAD_TRIGGERED",
    lastActionBy: `${operator.name} (${operator.role})`,
    lastActionAt: `${dateStr} ART`,
    updatedAt: new Date().toISOString(),
  };

  // Persistir localmente y despachar evento para clientes abiertos
  saveToStorage(STORAGE_KEYS.SYSTEM_CONTROL, updatedState);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vessel:system-control-updated", { detail: updatedState })
    );
  }

  // Persistir en Firestore si estamos en modo real
  if (currentMode === "real" && db) {
    try {
      const docRef = doc(db, SYSTEM_CONTROL_COLLECTION, SYSTEM_CONTROL_DOC);
      await setDoc(docRef, updatedState, { merge: true });
    } catch (err) {
      console.error("[VESSEL Control] Error guardando forceReload en Firestore:", err);
    }
  }

  // Registrar en el log de auditoría administrativa inmutable
  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "SYSTEM_FORCE_RELOAD",
    details: `Forzado de recarga global disparado. Timestamp: ${nowMs} (${dateStr} ART). Versión requerida: ${CURRENT_SYSTEM_VERSION}`,
  });

  return updatedState;
}

/**
 * Disparador de comando: Forzar que se cierre la sesión de todos los usuarios de la app.
 * Invalida sesiones previas forzando re-autenticación.
 */
export async function triggerForceLogout(
  operator: StaffMember,
  mode?: AppMode
): Promise<SystemControlState> {
  const currentMode = mode || getActiveAppMode();
  const nowMs = Date.now();
  const dateStr = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
  });

  const previous = await getSystemControlState(currentMode);
  const updatedState: SystemControlState = {
    ...previous,
    forceLogoutTimestamp: nowMs,
    lastAction: "LOGOUT_TRIGGERED",
    lastActionBy: `${operator.name} (${operator.role})`,
    lastActionAt: `${dateStr} ART`,
    updatedAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEYS.SYSTEM_CONTROL, updatedState);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vessel:system-control-updated", { detail: updatedState })
    );
  }

  if (currentMode === "real" && db) {
    try {
      const docRef = doc(db, SYSTEM_CONTROL_COLLECTION, SYSTEM_CONTROL_DOC);
      await setDoc(docRef, updatedState, { merge: true });
    } catch (err) {
      console.error("[VESSEL Control] Error guardando forceLogout en Firestore:", err);
    }
  }

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "SYSTEM_FORCE_LOGOUT",
    details: `Cierre forzado de sesiones globales disparado. Timestamp: ${nowMs} (${dateStr} ART)`,
  });

  return updatedState;
}
