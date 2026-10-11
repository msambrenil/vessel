import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeStartViewTransition } from "@/lib/ui/viewTransitions";

describe("safeStartViewTransition", () => {
  const originalStartViewTransition = (document as any).startViewTransition;
  const originalVisibilityState = document.visibilityState;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalStartViewTransition) {
      (document as any).startViewTransition = originalStartViewTransition;
    } else {
      delete (document as any).startViewTransition;
    }
    Object.defineProperty(document, "visibilityState", {
      value: originalVisibilityState,
      configurable: true,
    });
  });

  it("ejecuta el callback directamente si startViewTransition no está soportado", () => {
    delete (document as any).startViewTransition;
    const cb = vi.fn();

    safeStartViewTransition(cb);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("ejecuta el callback directamente si el documento no está visible", () => {
    (document as any).startViewTransition = vi.fn();
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    const cb = vi.fn();

    safeStartViewTransition(cb);

    expect(cb).toHaveBeenCalledTimes(1);
    expect((document as any).startViewTransition).not.toHaveBeenCalled();
  });

  it("invoca startViewTransition y ejecuta el callback cuando está visible y soportado", () => {
    const mockReady = Promise.resolve();
    const mockFinished = Promise.resolve();
    (document as any).startViewTransition = vi.fn((updateCb: () => void) => {
      updateCb();
      return { ready: mockReady, finished: mockFinished };
    });
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    const cb = vi.fn();

    safeStartViewTransition(cb);

    expect(cb).toHaveBeenCalledTimes(1);
    expect((document as any).startViewTransition).toHaveBeenCalledTimes(1);
  });

  it("captura y neutraliza el rechazo de la promesa ready (InvalidStateError)", async () => {
    const rejectedReady = Promise.reject(new Error("Transition was aborted because of invalid state. Animation start failed"));
    const mockFinished = Promise.resolve();
    (document as any).startViewTransition = vi.fn((updateCb: () => void) => {
      updateCb();
      return { ready: rejectedReady, finished: mockFinished };
    });
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    const cb = vi.fn();

    expect(() => safeStartViewTransition(cb)).not.toThrow();
    expect(cb).toHaveBeenCalledTimes(1);

    // Esperar a que la microtarea procese el rechazo
    await expect(rejectedReady).rejects.toThrow();
  });

  it("ejecuta el callback síncronamente como fallback si startViewTransition lanza excepción directa", () => {
    (document as any).startViewTransition = vi.fn(() => {
      throw new Error("InvalidStateError");
    });
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    const cb = vi.fn();

    expect(() => safeStartViewTransition(cb)).not.toThrow();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
