import { describe, it, expect } from "vitest";
import { sanitizeForFirestore } from "@/lib/firebase/firestoreSanitizer";

describe("firestoreSanitizer", () => {
  it("elimina propiedades undefined en álbumes de usuario con fotos anidadas", () => {
    const rawAlbum = {
      id: "album-1788747430504",
      title: "VIP Bóveda Privada",
      description: undefined,
      privacy: "private",
      coverUrl: "https://example.com/cover.webp",
      photos: [
        {
          id: "media-1",
          url: "https://example.com/photo1.webp",
          blurredUrl: "",
          caption: undefined,
          durationSeconds: undefined,
          thumbnailUrl: undefined,
          createdAt: "Ahora",
        },
        {
          id: "media-2",
          url: "https://example.com/video1.mp4",
          caption: "Clip 01",
          mediaType: "video",
          durationSeconds: 15,
          createdAt: "Ahora",
        },
      ],
      createdAt: "Hoy",
    };

    const sanitized = sanitizeForFirestore(rawAlbum);

    expect(sanitized.id).toBe("album-1788747430504");
    expect("description" in sanitized).toBe(false);
    expect(sanitized.photos).toHaveLength(2);
    expect("caption" in (sanitized.photos[0] as object)).toBe(false);
    expect("durationSeconds" in (sanitized.photos[0] as object)).toBe(false);
    expect("thumbnailUrl" in (sanitized.photos[0] as object)).toBe(false);
    expect(sanitized.photos[1].caption).toBe("Clip 01");
    expect(sanitized.photos[1].durationSeconds).toBe(15);
  });

  it("elimina campos opcionales undefined en perfiles de usuario", () => {
    const rawProfile = {
      id: "user-abc",
      codename: "ALPHA",
      hosting: undefined,
      exitProtocol: undefined,
      onTheClock: undefined,
      avatarUrl: undefined,
      respectScore: 100,
    };

    const sanitized = sanitizeForFirestore(rawProfile);

    expect(sanitized.codename).toBe("ALPHA");
    expect(sanitized.respectScore).toBe(100);
    expect("hosting" in sanitized).toBe(false);
    expect("exitProtocol" in sanitized).toBe(false);
    expect("onTheClock" in sanitized).toBe(false);
    expect("avatarUrl" in sanitized).toBe(false);
  });

  it("preserva valores especiales de Firestore FieldValue (serverTimestamp, arrayUnion)", () => {
    const mockTimestamp = { _methodName: "serverTimestamp" };
    const mockArrayUnion = { _methodName: "arrayUnion", _elements: ["item1"] };

    const payload = {
      id: "doc-1",
      createdAtRaw: mockTimestamp,
      photos: mockArrayUnion,
      undefinedField: undefined,
    };

    const sanitized = sanitizeForFirestore(payload);

    expect(sanitized.createdAtRaw).toBe(mockTimestamp);
    expect(sanitized.photos).toBe(mockArrayUnion);
    expect("undefinedField" in sanitized).toBe(false);
  });

  it("preserva instancias nativas de Date y Timestamp", () => {
    const now = new Date();
    const mockTimestamp = { seconds: 1788747430, nanoseconds: 500000 };

    const payload = {
      date: now,
      ts: mockTimestamp,
      empty: undefined,
    };

    const sanitized = sanitizeForFirestore(payload);

    expect(sanitized.date).toBe(now);
    expect(sanitized.ts).toBe(mockTimestamp);
    expect("empty" in sanitized).toBe(false);
  });

  it("preserva valores legítimos como false, 0, cadenas vacías y null", () => {
    const payload = {
      isBurnOnView: false,
      count: 0,
      emptyText: "",
      nullableVal: null,
      badVal: undefined,
    };

    const sanitized = sanitizeForFirestore(payload);

    expect(sanitized).toEqual({
      isBurnOnView: false,
      count: 0,
      emptyText: "",
      nullableVal: null,
    });
    expect("badVal" in sanitized).toBe(false);
  });
});
