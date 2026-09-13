import { describe, it, expect } from "vitest";
import { sanitizeForFirestore } from "@/lib/firebase/chatService";

describe("sanitizeForFirestore", () => {
  it("elimina propiedades undefined en el nivel raíz", () => {
    const input = {
      text: "Mensaje válido",
      mediaUrl: undefined,
      isBurnOnView: false,
      extra: undefined,
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized).toEqual({
      text: "Mensaje válido",
      isBurnOnView: false,
    });
    expect("mediaUrl" in sanitized).toBe(false);
    expect("extra" in sanitized).toBe(false);
  });

  it("elimina propiedades undefined en objetos anidados", () => {
    const input = {
      senderId: "user-123",
      mediaAttachment: {
        url: "https://example.com/photo.jpg",
        caption: undefined,
        expiresInMinutes: undefined,
        mode: "permanent",
      },
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized).toEqual({
      senderId: "user-123",
      mediaAttachment: {
        url: "https://example.com/photo.jpg",
        mode: "permanent",
      },
    });
    expect("caption" in (sanitized.mediaAttachment as object)).toBe(false);
  });

  it("filtra elementos undefined dentro de arrays", () => {
    const input = {
      tags: ["tag1", undefined, "tag2"],
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized).toEqual({
      tags: ["tag1", "tag2"],
    });
  });

  it("preserva valores válidos como null, cadenas vacías, números y booleanos", () => {
    const input = {
      text: "",
      mediaUrl: null,
      counter: 0,
      isActive: false,
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized).toEqual({
      text: "",
      mediaUrl: null,
      counter: 0,
      isActive: false,
    });
  });

  it("preserva objetos especiales de Firestore (FieldValue / serverTimestamp)", () => {
    const mockTimestamp = { _methodName: "serverTimestamp" };
    const input = {
      text: "Test",
      timestampRaw: mockTimestamp,
    };

    const sanitized = sanitizeForFirestore(input);

    expect(sanitized).toEqual({
      text: "Test",
      timestampRaw: mockTimestamp,
    });
  });
});
