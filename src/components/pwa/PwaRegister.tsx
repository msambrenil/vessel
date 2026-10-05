"use client";

import { useEffect } from "react";

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let refreshing = false;

    // Cuando el nuevo Service Worker toma el control, recargar suavemente para cargar la última versión
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    // Escuchar mensajes del Service Worker (por ejemplo si un chunk 404 solicita recarga de versión)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "VESSEL_CHUNK_RELOAD_REQUIRED") {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[VESSEL PWA] Service Worker registrado:", registration.scope);

        // Comprobación inmediata de actualización al montar
        registration.update().catch(() => {});

        // Detectar si ya hay un worker esperando
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Monitorear cuando se descarga una nueva versión
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Notificar al nuevo worker que tome el control inmediatamente
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });

        // Comprobación periódica cada 10 minutos
        const checkInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 10 * 60 * 1000);

        // Comprobación inmediata cuando el usuario móvil vuelve a la app (cambio de visibilidad)
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
          clearInterval(checkInterval);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch (error) {
        console.warn("[VESSEL PWA] Error al registrar Service Worker:", error);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  return null;
};
