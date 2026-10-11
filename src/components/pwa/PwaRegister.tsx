"use client";

import { useEffect, useRef } from "react";
import {
  CURRENT_SYSTEM_VERSION,
  SYSTEM_BUILD_TIMESTAMP,
  SYSTEM_BUILD_FORMATTED,
} from "@/lib/version/systemVersion";
import {
  subscribeToSystemControl,
  DEFAULT_SYSTEM_CONTROL_STATE,
  SystemControlState,
} from "@/lib/version/systemControlService";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from "@/lib/storage/localStorageSync";

// Marca de tiempo de arranque de la instancia actual en el cliente
const APP_BOOT_TIMESTAMP = Date.now();

// Clave y tiempos para el disyuntor (Circuit Breaker) en sessionStorage
const RELOAD_GUARD_KEY = "vessel_pwa_reload_guard";
const RELOAD_COOLDOWN_MS = 15000; // Mínimo 15s entre recargas automáticas
const MAX_RELOADS_PER_MINUTE = 3;

interface ReloadGuardRecord {
  timestamp: number;
  reason: string;
  count: number;
}

/**
 * Determina si el entorno actual es de desarrollo local.
 * En desarrollo, el Service Worker y el auto-reload deben estar desactivados
 * para no romper Fast Refresh ni generar bucles de recarga.
 */
export const isDevEnvironment = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    process.env.NODE_ENV === "development" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local")
  );
};

/**
 * Disyuntor (Circuit Breaker) contra bucles infinitos de recarga.
 * Impide que un cliente recargue más de una vez en un intervalo corto
 * o más de 3 veces por minuto.
 */
export const canTriggerReload = (reason: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(RELOAD_GUARD_KEY);
    const now = Date.now();

    if (raw) {
      const record: ReloadGuardRecord = JSON.parse(raw);

      // Si intentó recargar hace menos de 15 segundos: BLOQUEAR
      if (now - record.timestamp < RELOAD_COOLDOWN_MS) {
        console.warn(
          `[VESSEL PWA] Disyuntor activado: recarga cancelada para prevenir bucle. (Última recarga hace ${Math.round(
            (now - record.timestamp) / 1000
          )}s por "${record.reason}").`
        );
        return false;
      }

      // Si hubo demasiadas recargas recientes: BLOQUEAR
      if (record.count >= MAX_RELOADS_PER_MINUTE && now - record.timestamp < 60000) {
        console.error(
          `[VESSEL PWA] Disyuntor de emergencia activado: >${MAX_RELOADS_PER_MINUTE} recargas en menos de un minuto. Cancelando recargas automáticas.`
        );
        return false;
      }

      const updatedRecord: ReloadGuardRecord = {
        timestamp: now,
        reason,
        count: record.count + 1,
      };
      sessionStorage.setItem(RELOAD_GUARD_KEY, JSON.stringify(updatedRecord));
    } else {
      const newRecord: ReloadGuardRecord = {
        timestamp: now,
        reason,
        count: 1,
      };
      sessionStorage.setItem(RELOAD_GUARD_KEY, JSON.stringify(newRecord));
    }
    return true;
  } catch {
    return true;
  }
};

export const PwaRegister: React.FC = () => {
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Si estamos en entorno de desarrollo local, limpiar service workers huérfanos y abortar
    if (isDevEnvironment()) {
      console.info(
        `[VESSEL PWA] Entorno local detectado (${window.location.hostname}). Service Worker y recarga automática desactivados para no interferir con Fast Refresh.`
      );
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister().catch(() => {});
          }
        });
      }
      return;
    }

    const purgeCachesAndReload = async (reason: string) => {
      if (isRefreshingRef.current) return;
      if (!canTriggerReload(reason)) return;

      isRefreshingRef.current = true;
      console.info(`[VESSEL PWA] Forzando recarga de última versión (${reason}). Purgando cachés...`);

      // Sincronizar localStorage con la versión actual para no re-disparar lecturas locales desactualizadas
      try {
        const currentControl = loadFromStorage<SystemControlState>(
          STORAGE_KEYS.SYSTEM_CONTROL,
          DEFAULT_SYSTEM_CONTROL_STATE
        );
        saveToStorage(STORAGE_KEYS.SYSTEM_CONTROL, {
          ...currentControl,
          currentVersion: CURRENT_SYSTEM_VERSION,
          buildReleaseDate: SYSTEM_BUILD_TIMESTAMP,
          formattedDate: SYSTEM_BUILD_FORMATTED,
        });
      } catch (err) {
        console.warn("[VESSEL PWA] Error sincronizando localStorage antes de recarga:", err);
      }

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      } catch (err) {
        console.warn("[VESSEL PWA] Error purgando CacheStorage:", err);
      }

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        try {
          navigator.serviceWorker.controller.postMessage({
            type: "VESSEL_CLEAR_CACHE_AND_RELOAD",
          });
        } catch {}
      }

      // Hard reload para garantizar la obtención del HTML más reciente del servidor
      setTimeout(() => {
        window.location.reload();
      }, 100);
    };

    // Consulta activa de versión mediante el endpoint /api/system/version
    const checkVersionViaApi = async () => {
      if (isRefreshingRef.current) return;
      try {
        const res = await fetch(`/api/system/version?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          // 1. Si la versión del servidor es diferente a la compilada en el cliente
          if (data.version && data.version !== CURRENT_SYSTEM_VERSION) {
            console.log(`[VESSEL PWA] Nueva versión detectada en servidor: ${data.version} (local: ${CURRENT_SYSTEM_VERSION})`);
            await purgeCachesAndReload(`Versión ${data.version} disponible en servidor`);
            return;
          }
          // 2. Si la marca de compilación del servidor es más reciente
          if (data.buildTimestamp && data.buildTimestamp !== SYSTEM_BUILD_TIMESTAMP) {
            console.log(`[VESSEL PWA] Nueva compilación detectada en servidor: ${data.buildTimestamp} (local: ${SYSTEM_BUILD_TIMESTAMP})`);
            await purgeCachesAndReload(`Nueva build ${data.buildTimestamp} disponible`);
            return;
          }
          // 3. Si el administrador disparó un forzado de recarga después de que este cliente abrió la app
          if (
            data.forceReloadTimestamp &&
            data.forceReloadTimestamp > APP_BOOT_TIMESTAMP
          ) {
            console.log(`[VESSEL PWA] Señal remota de recarga forzada detectada (TS: ${data.forceReloadTimestamp})`);
            await purgeCachesAndReload("Comando remoto de Admin");
            return;
          }
        }
      } catch {
        // En offline o errores transitorios no interrumpir
      }
    };

    // 1. Suscripción en tiempo real a señales de administración maestra (Firestore / eventos)
    const unsubControl = subscribeToSystemControl((state) => {
      if (
        state.forceReloadTimestamp &&
        state.forceReloadTimestamp > APP_BOOT_TIMESTAMP
      ) {
        purgeCachesAndReload("Control Maestro: Forzar Recarga");
      }
    });

    // 2. Verificación de versión inmediata al montar
    checkVersionViaApi();

    // 3. Manejo de Safari en iOS: Restauración desde Back-Forward Cache (bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log("[VESSEL PWA] Página restaurada desde bfcache en iOS Safari. Verificando última versión...");
        checkVersionViaApi();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // 4. Manejo de reanudación móvil: cuando el usuario desbloquea o vuelve al navegador
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersionViaApi();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Manejo de foco en ventana
    const handleFocus = () => {
      checkVersionViaApi();
    };
    window.addEventListener("focus", handleFocus);

    // 6. Registro y ciclo de vida de Service Worker (Sólo en Producción)
    let cleanupSW = () => {};

    if ("serviceWorker" in navigator) {
      const handleControllerChange = () => {
        if (!isRefreshingRef.current && canTriggerReload("Service Worker controller change")) {
          isRefreshingRef.current = true;
          window.location.reload();
        }
      };

      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (
          event.data &&
          (event.data.type === "VESSEL_CHUNK_RELOAD_REQUIRED" ||
            event.data.type === "VESSEL_FORCE_RELOAD_EXECUTED")
        ) {
          purgeCachesAndReload("Mensaje de Service Worker");
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          registration.update().catch(() => {});

          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });

          // Chequeo periódico del Service Worker cada 5 minutos
          const swInterval = setInterval(() => {
            registration.update().catch(() => {});
          }, 5 * 60 * 1000);

          return () => {
            clearInterval(swInterval);
          };
        } catch (error) {
          console.warn("[VESSEL PWA] Error registrando Service Worker:", error);
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }

      cleanupSW = () => {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      };
    }

    return () => {
      unsubControl();
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      cleanupSW();
    };
  }, []);

  return null;
};
