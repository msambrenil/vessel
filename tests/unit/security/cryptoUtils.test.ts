import { describe, it, expect } from "vitest";
import { sha256Sync, hashPin, verifyPin } from "@/lib/security/cryptoUtils";

describe("cryptoUtils — Suite de Criptografía y Seguridad (P0)", () => {
  describe("sha256Sync — Vectores de Prueba Estándar NIST", () => {
    it("debe computar el hash SHA-256 canónico para una cadena vacía", () => {
      const hash = sha256Sync("");
      expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    });

    it("debe computar el hash canónico para 'abc'", () => {
      const hash = sha256Sync("abc");
      expect(hash).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    });

    it("debe computar el hash canónico para la frase clásica 'The quick brown fox jumps over the lazy dog'", () => {
      const hash = sha256Sync("The quick brown fox jumps over the lazy dog");
      expect(hash).toBe("d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
    });

    it("debe producir hashes de exactamente 64 caracteres hexadecimales", () => {
      const hash = sha256Sync("vessel_test_1234");
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });
  });

  describe("hashPin — Hashing con Salt Anti-Tampering", () => {
    it("debe generar el mismo hash de forma determinista para el mismo PIN y salt", () => {
      const hash1 = hashPin("1234");
      const hash2 = hashPin("1234");
      expect(hash1).toBe(hash2);
    });

    it("debe producir hashes radicalmente diferentes con salts distintos (efecto avalancha)", () => {
      const hash1 = hashPin("1234", "salt_alpha");
      const hash2 = hashPin("1234", "salt_beta");
      expect(hash1).not.toBe(hash2);
    });

    it("debe retornar string vacío si se pasa un PIN vacío", () => {
      expect(hashPin("")).toBe("");
    });

    it("debe recortar espacios en blanco antes de hashear", () => {
      const hashNormal = hashPin("4321");
      const hashPadded = hashPin("  4321  ");
      expect(hashPadded).toBe(hashNormal);
    });
  });

  describe("verifyPin — Comparación Segura y Mitigación de Timing Attacks", () => {
    it("debe verificar exitosamente un PIN correcto contra su hash SHA-256 almacenado", () => {
      const pin = "7890";
      const storedHash = hashPin(pin);
      expect(verifyPin(pin, storedHash)).toBe(true);
    });

    it("debe rechazar un PIN incorrecto con solo 1 dígito de diferencia", () => {
      const correctPin = "7890";
      const storedHash = hashPin(correctPin);
      expect(verifyPin("7891", storedHash)).toBe(false);
      expect(verifyPin("0000", storedHash)).toBe(false);
    });

    it("debe rechazar comparaciones cuando el PIN o el valor almacenado están vacíos", () => {
      const storedHash = hashPin("1234");
      expect(verifyPin("", storedHash)).toBe(false);
      expect(verifyPin("1234", "")).toBe(false);
    });

    it("debe ser insensible a mayúsculas/minúsculas en el hash hexadecimal almacenado", () => {
      const pin = "5555";
      const lowerHash = hashPin(pin);
      const upperHash = lowerHash.toUpperCase();
      expect(verifyPin(pin, upperHash)).toBe(true);
    });

    it("debe admitir compatibilidad con PINs legados en texto plano durante fases de migración", () => {
      // Valor no migrado previo a SHA-256 (longitud 4)
      expect(verifyPin("9999", "9999")).toBe(true);
      expect(verifyPin("1234", "9999")).toBe(false);
    });
  });
});
