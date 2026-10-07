"use client";

import { useEffect, useRef } from "react";
import { CURRENT_SYSTEM_VERSION } from "@/lib/version/systemVersion";
import { subscribeToSystemControl } from "@/lib/version/systemControlService";

// Marca de tiempo de arranque de la instancia actual en el cliente
const APP_BOOT_TIMESTAMP = Date.now();

export const PwaRegister: React.FC = () => {
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const purgeCachesAndReload = async (reason: string) => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      console.info(`[VESSEL PWA] Forzando recarga de última versión (${reason}). Purgando cachés...`);

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
            await purgeCachesAndReload(`Versión ${data.version} disponible`);
            return;
          }
          // 2. Si el administrador disparó un forzado de recarga después de que este cliente abrió la app
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

    // 1. Suscripción en tiempo real a señales del sistema (Firestore / eventos locales)
    const unsubControl = subscribeToSystemControl((state) => {
      if (
        state.forceReloadTimestamp &&
        state.forceReloadTimestamp > APP_BOOT_TIMESTAMP
      ) {
        purgeCachesAndReload("Control Maestro: Forzar Recarga");
      } else if (state.currentVersion && state.currentVersion !== CURRENT_SYSTEM_VERSION) {
        purgeCachesAndReload(`Versión del sistema actualizada a ${state.currentVersion}`);
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

    // 6. Registro y ciclo de vida de Service Worker
    let cleanupSW = () => {};

    if ("serviceWorker" in navigator) {
      const handleControllerChange = () => {
        if (!isRefreshingRef.current) {
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
