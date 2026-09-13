"use client";

/**
 * Motor de almacenamiento local-first en IndexedDB para VESSEL
 * Proporciona persistencia de alta capacidad (Gigabytes) para albumes, fotos y multimedia,
 * evitando las restricciones y cuotas estrictas de 5MB de localStorage (QuotaExceededError).
 */

const DB_NAME = "vessel_offline_db";
const STORE_NAME = "vessel_keyval";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const isIdbAvailable = (): boolean => {
  return typeof window !== "undefined" && "indexedDB" in window && !!window.indexedDB;
};

const getDB = (): Promise<IDBDatabase> => {
  if (!isIdbAvailable()) {
    return Promise.reject(new Error("IndexedDB no disponible"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn("[VESSEL IndexedDB] Error al inicializar base de datos:", request.error);
          reject(request.error);
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  return dbPromise;
};

/**
 * Guarda un valor en IndexedDB de forma asincrona
 */
export const setInIdb = async <T>(key: string, value: T): Promise<void> => {
  if (!isIdbAvailable()) return;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[VESSEL IndexedDB] Fallo al persistir clave "${key}":`, err);
  }
};

/**
 * Lee un valor de IndexedDB con fallback
 */
export const getFromIdb = async <T>(key: string, fallback: T): Promise<T> => {
  if (!isIdbAvailable()) return fallback;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result !== undefined ? (req.result as T) : fallback);
      };
      req.onerror = () => {
        console.warn(`[VESSEL IndexedDB] Fallo al leer clave "${key}":`, req.error);
        resolve(fallback);
      };
    });
  } catch {
    return fallback;
  }
};

/**
 * Elimina una clave de IndexedDB
 */
export const removeFromIdb = async (key: string): Promise<void> => {
  if (!isIdbAvailable()) return;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[VESSEL IndexedDB] Fallo al eliminar clave "${key}":`, err);
  }
};
