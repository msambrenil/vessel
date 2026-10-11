"use client";

import { sendPulseToCloud } from "@/lib/firebase/pulseService";
import { sendCloudMessage } from "@/lib/firebase/chatService";
import { updateMyMatrixPresence } from "@/lib/firebase/matrixService";
import { submitBetaFeedbackReport } from "@/lib/firebase/betaFeedbackService";
import { ChatMessage, VesselProfile, BetaFeedbackReport } from "@/types/vessel";
import { setInIdb, getFromIdb, removeFromIdb } from "@/lib/storage/indexedDbSync";

export type OfflineMutationType =
  | "SEND_PULSE"
  | "SEND_CHAT_MESSAGE"
  | "UPDATE_MY_PRESENCE"
  | "SUBMIT_BETA_FEEDBACK";

export interface SendPulsePayload {
  currentUserUid: string;
  fromUid: string;
  toUid: string;
  fromCodename: string;
}

export interface SendChatMessagePayload {
  chatId: string;
  message: Omit<ChatMessage, "id">;
  customMessageId?: string;
}

export interface UpdatePresencePayload {
  uid: string;
  profile: Partial<VesselProfile>;
}

export type BetaFeedbackPayload = Omit<BetaFeedbackReport, "id" | "createdAt" | "status">;

export type OfflineMutationPayload =
  | SendPulsePayload
  | SendChatMessagePayload
  | UpdatePresencePayload
  | BetaFeedbackPayload;

export interface OfflineMutationItem {
  id: string;
  type: OfflineMutationType;
  createdAt: number;
  retryCount: number;
  payload: OfflineMutationPayload;
}

const STORAGE_KEY = "vessel_offline_mutations_v1";
const MAX_QUEUE_ITEMS = 100;
const MAX_RETRIES = 5;

let isFlushing = false;
let hasAttachedListeners = false;
const queueListeners: ((items: OfflineMutationItem[]) => void)[] = [];
let inMemoryQueue: OfflineMutationItem[] | null = null;

/**
 * Carga la cola de mutaciones offline desde memoria (o fallback de inicialización)
 */
export function getOfflineQueue(): OfflineMutationItem[] {
  if (inMemoryQueue !== null) {
    return inMemoryQueue;
  }
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    inMemoryQueue = raw ? JSON.parse(raw) : [];
    return inMemoryQueue || [];
  } catch {
    return [];
  }
}

/**
 * Hidrata de forma asíncrona la cola desde IndexedDB en el arranque
 */
export async function hydrateQueueFromIdb(): Promise<OfflineMutationItem[]> {
  if (typeof window === "undefined") return [];
  try {
    const idbData = await getFromIdb<OfflineMutationItem[] | null>(STORAGE_KEY, null);
    if (idbData && Array.isArray(idbData)) {
      inMemoryQueue = idbData;
      notifyQueueChange(inMemoryQueue);
      return inMemoryQueue;
    }
  } catch (err) {
    console.warn("[VESSEL OfflineQueue] Error hidratando cola desde IndexedDB:", err);
  }
  return getOfflineQueue();
}

/**
 * Persiste la cola en IndexedDB (primario no bloqueante) y notifica a los suscriptores reactivos
 */
function persistQueue(items: OfflineMutationItem[]): void {
  const sliced = items.slice(0, MAX_QUEUE_ITEMS);
  inMemoryQueue = sliced;
  notifyQueueChange(sliced);

  if (typeof window === "undefined") return;

  // 1. Guardar en IndexedDB de forma asíncrona fuera del hilo principal
  if (sliced.length === 0) {
    removeFromIdb(STORAGE_KEY).catch(() => {});
  } else {
    setInIdb(STORAGE_KEY, sliced).catch(() => {});
  }

  // 2. Espejo en localStorage como fallback seguro de compatibilidad
  try {
    if (sliced.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sliced));
    }
  } catch (err) {
    console.warn("[VESSEL OfflineQueue] Fallback localStorage omitido (asegurado en IndexedDB):", err);
  }
}

function notifyQueueChange(items: OfflineMutationItem[]): void {
  queueListeners.forEach((listener) => {
    try {
      listener(items);
    } catch {}
  });
}

/**
 * Suscripción reactiva para componentes que muestren indicadores de sincronización pendiente
 */
export function subscribeOfflineQueue(
  callback: (items: OfflineMutationItem[]) => void
): () => void {
  queueListeners.push(callback);
  callback(getOfflineQueue());
  return () => {
    const index = queueListeners.indexOf(callback);
    if (index !== -1) {
      queueListeners.splice(index, 1);
    }
  };
}

/**
 * Encola una mutación que falló por falta de red o desconexión
 */
export function enqueueOfflineMutation(
  type: OfflineMutationType,
  payload: OfflineMutationPayload
): OfflineMutationItem {
  const item: OfflineMutationItem = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    createdAt: Date.now(),
    retryCount: 0,
    payload,
  };

  const queue = getOfflineQueue();
  const nextQueue = [...queue, item];
  persistQueue(nextQueue);

  // Intentar vaciar inmediatamente si hay red disponible
  if (typeof navigator !== "undefined" && navigator.onLine) {
    setTimeout(() => {
      flushOfflineMutations().catch(() => {});
    }, 200);
  }

  return item;
}

/**
 * Vierte y despacha en ráfaga todas las mutaciones pendientes hacia Firestore
 */
export async function flushOfflineMutations(): Promise<{ processed: number; remaining: number }> {
  if (isFlushing) {
    return { processed: 0, remaining: getOfflineQueue().length };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { processed: 0, remaining: getOfflineQueue().length };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0 };
  }

  isFlushing = true;
  let processedCount = 0;
  const remainingQueue: OfflineMutationItem[] = [];

  try {
    for (const item of queue) {
      let isSuccess = false;

      try {
        switch (item.type) {
          case "SEND_PULSE": {
            const p = item.payload as SendPulsePayload;
            const res = await sendPulseToCloud(p.currentUserUid, p.fromUid, p.toUid, p.fromCodename);
            isSuccess = Boolean(res);
            break;
          }
          case "SEND_CHAT_MESSAGE": {
            const p = item.payload as SendChatMessagePayload;
            const res = await sendCloudMessage(p.chatId, p.message, p.customMessageId);
            isSuccess = Boolean(res);
            break;
          }
          case "UPDATE_MY_PRESENCE": {
            const p = item.payload as UpdatePresencePayload;
            isSuccess = await updateMyMatrixPresence(p.uid, p.profile);
            break;
          }
          case "SUBMIT_BETA_FEEDBACK": {
            const p = item.payload as BetaFeedbackPayload;
            const res = await submitBetaFeedbackReport(p);
            isSuccess = Boolean(res);
            break;
          }
        }
      } catch (err) {
        console.warn(`[VESSEL OfflineQueue] Reintento fallido para mutación ${item.id}:`, err);
        isSuccess = false;
      }

      if (isSuccess) {
        processedCount++;
      } else {
        const nextRetry = item.retryCount + 1;
        if (nextRetry < MAX_RETRIES) {
          remainingQueue.push({ ...item, retryCount: nextRetry });
        } else {
          console.warn(`[VESSEL OfflineQueue] Descartando mutación ${item.id} tras alcanzar el límite de reintentos.`);
        }
      }
    }

    persistQueue(remainingQueue);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vessel:offline-queue-flushed", {
          detail: { processed: processedCount, remaining: remainingQueue.length },
        })
      );
    }

    return { processed: processedCount, remaining: remainingQueue.length };
  } finally {
    isFlushing = false;
  }
}

/**
 * Limpia la cola offline manualmente (por ejemplo, al cerrar sesión)
 */
export function clearOfflineQueue(): void {
  inMemoryQueue = [];
  persistQueue([]);
}

/**
 * Conecta los listeners del navegador y del Service Worker para vaciado automático
 */
export function initOfflineQueueListeners(): () => void {
  if (typeof window === "undefined" || hasAttachedListeners) return () => {};
  hasAttachedListeners = true;

  // Hidratar asíncronamente desde IndexedDB en segundo plano sin bloquear el hilo principal
  hydrateQueueFromIdb().catch(() => {});

  const handleOnline = () => {
    flushOfflineMutations().catch(() => {});
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const data = event.data;
    if (
      data &&
      (data.type === "VESSEL_PERIODIC_SYNC_TRIGGER" || data.type === "VESSEL_SYNC_PING")
    ) {
      flushOfflineMutations().catch(() => {});
    }
  };

  window.addEventListener("online", handleOnline);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
  }

  // Comprobar al iniciar si hay mutaciones pendientes de una sesión previa
  if (navigator.onLine && getOfflineQueue().length > 0) {
    setTimeout(handleOnline, 1000);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    }
    hasAttachedListeners = false;
  };
}
