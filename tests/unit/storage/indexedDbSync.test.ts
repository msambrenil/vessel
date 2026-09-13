import { describe, it, expect } from "vitest";
import { setInIdb, getFromIdb, removeFromIdb } from "@/lib/storage/indexedDbSync";

describe("indexedDbSync — Almacenamiento Local-First de Gran Capacidad", () => {
  it("maneja entornos sin IndexedDB retornando el fallback de forma segura", async () => {
    const result = await getFromIdb("test_key", { test: "fallback" });
    expect(result).toEqual({ test: "fallback" });
  });

  it("setInIdb y removeFromIdb no arrojan errores en entornos sin soporte", async () => {
    await expect(setInIdb("test_key", { data: "sample" })).resolves.toBeUndefined();
    await expect(removeFromIdb("test_key")).resolves.toBeUndefined();
  });
});
