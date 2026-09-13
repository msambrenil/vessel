import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Mock para Web Audio API en entorno DOM sintético
if (typeof window !== "undefined") {
  class MockAudioContext {
    state = "running";
    currentTime = 0;
    destination = {};
    createOscillator() {
      return {
        type: "sine",
        frequency: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          value: 440,
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          value: 1,
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    createBiquadFilter() {
      return {
        type: "lowpass",
        frequency: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          value: 350,
        },
        Q: { setValueAtTime: vi.fn(), value: 1 },
        gain: { setValueAtTime: vi.fn(), value: 0 },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
  }

  window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
  (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext = MockAudioContext as unknown as typeof AudioContext;

  // Mock para matchMedia
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    };
}

// Mock global de Firebase para pruebas de integración de contextos
vi.mock("@/lib/firebase/config", () => ({
  app: {},
  auth: {
    currentUser: { uid: "test-user-123" },
    onAuthStateChanged: vi.fn((auth, cb) => {
      cb({ uid: "test-user-123" });
      return () => {};
    }),
  },
  db: {},
  storage: {},
  ensureAnonymousSession: vi.fn().mockResolvedValue({ uid: "test-user-123" }),
}));

beforeEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
  vi.clearAllMocks();
});
