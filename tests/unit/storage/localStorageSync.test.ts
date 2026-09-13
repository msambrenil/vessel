import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  scheduleDeferredSave,
  flushDeferredSave,
  STORAGE_KEYS,
} from "@/lib/storage/localStorageSync";

describe("localStorageSync — Persistencia Local y Tareas Diferidas", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllTimers();
  });

  it("debe retornar fallback si la clave no existe en localStorage", () => {
    const data = loadFromStorage("test_inexistent_key", { count: 0 });
    expect(data).toEqual({ count: 0 });
  });

  it("debe guardar y recuperar datos correctamente de forma síncrona", () => {
    const payload = { id: "p1", name: "OBSIDIAN" };
    saveToStorage("test_profile_key", payload);

    const retrieved = loadFromStorage("test_profile_key", null);
    expect(retrieved).toEqual(payload);
  });

  it("debe eliminar una clave correctamente", () => {
    saveToStorage("test_temp_key", { active: true });
    expect(loadFromStorage("test_temp_key", null)).toEqual({ active: true });

    removeFromStorage("test_temp_key");
    expect(loadFromStorage("test_temp_key", null)).toBeNull();
  });

  it("debe ejecutar guardado diferido con scheduleDeferredSave tras el retardo especificado", async () => {
    vi.useFakeTimers();

    scheduleDeferredSave("test_deferred_key", { deferred: true }, 100);

    // Antes de que pase el tiempo no debe estar aún en localStorage
    expect(loadFromStorage("test_deferred_key", null)).toBeNull();

    // Avanzamos el tiempo
    vi.advanceTimersByTime(150);

    expect(loadFromStorage("test_deferred_key", null)).toEqual({ deferred: true });

    vi.useRealTimers();
  });

  it("debe permitir cancelar un guardado diferido con flushDeferredSave", () => {
    vi.useFakeTimers();

    scheduleDeferredSave("test_cancelled_key", { cancelled: false }, 100);
    flushDeferredSave("test_cancelled_key");

    vi.advanceTimersByTime(150);

    expect(loadFromStorage("test_cancelled_key", null)).toBeNull();

    vi.useRealTimers();
  });

  it("debe contener las claves estándar del sistema en STORAGE_KEYS", () => {
    expect(STORAGE_KEYS.PROFILE).toBe("vessel_user_profile_v1");
    expect(STORAGE_KEYS.CHAT_MESSAGES).toBe("vessel_chat_messages_v1");
    expect(STORAGE_KEYS.SETTINGS).toBe("vessel_app_settings_v1");
  });

  it("debe aislar datos entre Modo de Prueba y Modo Real (namespacing)", () => {
    const testProfile = { codename: "TEST_USER" };
    const realProfile = { codename: "REAL_USER" };

    saveToStorage(STORAGE_KEYS.PROFILE, testProfile, "test");
    saveToStorage(STORAGE_KEYS.PROFILE, realProfile, "real");

    expect(loadFromStorage(STORAGE_KEYS.PROFILE, null, "test")).toEqual(testProfile);
    expect(loadFromStorage(STORAGE_KEYS.PROFILE, null, "real")).toEqual(realProfile);
  });
});
