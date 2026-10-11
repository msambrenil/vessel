// VESSEL // Core Service Worker - Offline Shell, Guaranteed Latest Version & Tactical Caching
const VESSEL_VERSION = "v2.7.0-20261010-0102";
const CACHE_NAME = `vessel-shell-${VESSEL_VERSION}`;
const PRECACHE_ASSETS = [
  "/manifest.json",
  "/icon.svg",
  "/favicon.ico"
];

// Instalación: precarga del shell táctico y omisión inmediata de espera
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: limpieza exhaustiva de TODAS las cachés antiguas para garantizar última versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[VESSEL SW] Purgando caché obsoleta:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de solicitudes: Red primero OBLIGATORIO para navegación, Respaldo de contingencia offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar llamadas de Firebase / Google APIs o extensiones de navegador
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("firebasestorage.googleapis.com") ||
    url.pathname.startsWith("/api/system/version") ||
    url.protocol.startsWith("chrome-extension")
  ) {
    return;
  }

  // Navegación HTML (Páginas): Network-First con bypass de caché para que NUNCA sirva HTML viejo
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, {
        cache: "no-cache",
      })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/", responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Contingencia: Solo si no hay conexión de red, devolver la copia en caché de respaldo
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match("/");
          return cached || Response.error();
        })
    );
    return;
  }

  // Activos estáticos de Next.js (_next/static, imágenes, SVG): Stale-While-Revalidate con auto-reparación
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".png")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 404) {
            // Chunks 404 tras un nuevo despliegue: forzar recarga en los clientes
            self.clients.matchAll({ type: "window" }).then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ type: "VESSEL_CHUNK_RELOAD_REQUIRED" });
              });
            });
            return networkResponse;
          }
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return networkResponse;
        });
      })
    );
  }
});

// Escucha de mensajes desde la app (activación inmediata de nueva versión y descarte de espera)
self.addEventListener("message", (event) => {
  if (event.data) {
    if (event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
    if (
      event.data.type === "VESSEL_CLEAR_CACHE_AND_RELOAD" ||
      event.data.type === "VESSEL_FORCE_RELOAD"
    ) {
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }).then(() => {
        self.skipWaiting();
        self.clients.matchAll({ type: "window" }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "VESSEL_FORCE_RELOAD_EXECUTED" });
          });
        });
      });
    }
  }
});

// Sincronización Periódica en Segundo Plano (Periodic Background Sync API)
// Modulada por el BatteryStateEngine de VESSEL
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "vessel-geo-battery-sync") {
    event.waitUntil(
      (async () => {
        try {
          const allClients = await self.clients.matchAll({
            includeUncontrolled: true,
            type: "window",
          });
          for (const client of allClients) {
            client.postMessage({
              type: "VESSEL_PERIODIC_SYNC_TRIGGER",
              tag: event.tag,
              timestamp: Date.now(),
            });
          }
        } catch {
          // Fallback silencioso si no hay clientes o se cancela el ciclo
        }
      })()
    );
  }
});

// Sincronización en Segundo Plano de Disparo Único (One-Off Background Sync API)
self.addEventListener("sync", (event) => {
  if (event.tag === "vessel-sync-ping") {
    event.waitUntil(
      (async () => {
        try {
          const allClients = await self.clients.matchAll({
            includeUncontrolled: true,
            type: "window",
          });
          for (const client of allClients) {
            client.postMessage({
              type: "VESSEL_SYNC_PING",
              tag: event.tag,
              timestamp: Date.now(),
            });
          }
        } catch {
          // Fallback silencioso
        }
      })()
    );
  }
});
