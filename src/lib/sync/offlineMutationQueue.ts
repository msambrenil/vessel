"use client";

import { sendPulseToCloud } from "@/lib/firebase/pulseService";
import { sendCloudMessage } from "@/lib/firebase/chatService";
import { updateMyMatrixPresence } from "@/lib/firebase/matrixService";
import { submitBetaFeedbackReport } from "@/lib/firebase/betaFeedbackService";
import { ChatMessage, VesselProfile, BetaFeedbackReport } from "@/types/vessel";

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

/**
 * Carga la cola de mutaciones offline desde localStorage
 */
export function getOfflineQueue(): OfflineMutationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persiste la cola y notifica a los suscriptores reactivos
 */
function persistQueue(items: OfflineMutationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_QUEUE_ITEMS)));
    notifyQueueChange(items);
  } catch (err) {
    console.warn("[VESSEL OfflineQueue] Error persistiendo cola en almacenamiento:", err);
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
  persistQueue([]);
}

/**
 * Conecta los listeners del navegador y del Service Worker para vaciado automático
 */
export function initOfflineQueueListeners(): () => void {
  if (typeof window === "undefined" || hasAttachedListeners) return () => {};
  hasAttachedListeners = true;

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
