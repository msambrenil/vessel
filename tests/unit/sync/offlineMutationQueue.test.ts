import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  enqueueOfflineMutation,
  getOfflineQueue,
  flushOfflineMutations,
  clearOfflineQueue,
  subscribeOfflineQueue,
  initOfflineQueueListeners,
} from "@/lib/sync/offlineMutationQueue";

// Mock de servicios de Firebase
vi.mock("@/lib/firebase/pulseService", () => ({
  sendPulseToCloud: vi.fn().mockResolvedValue("pulse-cloud-id-123"),
}));

vi.mock("@/lib/firebase/chatService", () => ({
  sendCloudMessage: vi.fn().mockResolvedValue("chat-msg-id-456"),
}));

vi.mock("@/lib/firebase/matrixService", () => ({
  updateMyMatrixPresence: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/firebase/betaFeedbackService", () => ({
  submitBetaFeedbackReport: vi.fn().mockResolvedValue("report-id-789"),
}));

describe("offlineMutationQueue — Cola Resiliente de Mutaciones Offline", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    clearOfflineQueue();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe encolar mutaciones correctamente y persistirlas en localStorage", () => {
    const item = enqueueOfflineMutation("SEND_PULSE", {
      currentUserUid: "user-alpha",
      fromUid: "user-alpha",
      toUid: "user-beta",
      fromCodename: "ALPHA // TOP",
    });

    expect(item.id).toBeDefined();
    expect(item.type).toBe("SEND_PULSE");
    expect(item.retryCount).toBe(0);

    const queue = getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(item.id);
  });

  it("debe permitir suscribirse reactivamente a los cambios de la cola", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeOfflineQueue(listener);

    expect(listener).toHaveBeenCalledWith([]);

    enqueueOfflineMutation("SEND_CHAT_MESSAGE", {
      chatId: "chat_001",
      message: { senderId: "usr-1", text: "En camino", timestamp: "Ahora" },
    });

    expect(listener).toHaveBeenCalled();
    const lastCall = listener.mock.calls[listener.mock.calls.length - 1][0];
    expect(lastCall.length).toBe(1);

    unsubscribe();
  });

  it("debe limpiar la cola con clearOfflineQueue", () => {
    enqueueOfflineMutation("SEND_PULSE", {
      currentUserUid: "usr-1",
      fromUid: "usr-1",
      toUid: "usr-2",
      fromCodename: "VESSEL",
    });
    expect(getOfflineQueue().length).toBe(1);

    clearOfflineQueue();
    expect(getOfflineQueue().length).toBe(0);
  });

  it("debe procesar y vaciar la cola en ráfaga (flushOfflineMutations) cuando hay red", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
      writable: true,
    });

    enqueueOfflineMutation("SEND_PULSE", {
      currentUserUid: "usr-1",
      fromUid: "usr-1",
      toUid: "usr-2",
      fromCodename: "VESSEL_PULSE",
    });

    enqueueOfflineMutation("SEND_CHAT_MESSAGE", {
      chatId: "chat_abc",
      message: { senderId: "usr-1", text: "Llegué a la fiesta", timestamp: "Ahora" },
    });

    const result = await flushOfflineMutations();
    expect(result.processed).toBe(2);
    expect(result.remaining).toBe(0);
    expect(getOfflineQueue().length).toBe(0);
  });

  it("no debe procesar la cola si el navegador está offline (navigator.onLine = false)", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
      writable: true,
    });

    enqueueOfflineMutation("UPDATE_MY_PRESENCE", {
      uid: "usr-1",
      profile: { bodyState: "occupied" },
    });

    const result = await flushOfflineMutations();
    expect(result.processed).toBe(0);
    expect(result.remaining).toBe(1);
    expect(getOfflineQueue().length).toBe(1);
  });

  it("debe inicializar y limpiar los event listeners con initOfflineQueueListeners", () => {
    const cleanup = initOfflineQueueListeners();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });

  it("debe permitir hidratar la cola de mutaciones de forma asíncrona (hydrateQueueFromIdb)", async () => {
    const queue = await import("@/lib/sync/offlineMutationQueue").then((m) => m.hydrateQueueFromIdb());
    expect(Array.isArray(queue)).toBe(true);
  });
});

