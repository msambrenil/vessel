import { describe, it, expect } from "vitest";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

describe("Reglas de Negocio — FREE_TIER_LIMITS & Cuotas de Usuario", () => {
  describe("Constantes de Límites del Plan Free", () => {
    it("debe imponer cuotas estrictas de producto para cuentas gratuitas", () => {
      expect(FREE_TIER_LIMITS.maxPublicAlbums).toBe(1);
      expect(FREE_TIER_LIMITS.maxPrivateAlbums).toBe(1);
      expect(FREE_TIER_LIMITS.maxPhotosPerAlbum).toBe(10);
      expect(FREE_TIER_LIMITS.maxBioLength).toBe(280);
      expect(FREE_TIER_LIMITS.canUseVideo).toBe(false);
      expect(FREE_TIER_LIMITS.maxFreeRadarDistanceMeters).toBe(1000);
    });
  });

  describe("Validación de Alcance Táctico en Radar / Pestaña Cerca", () => {
    const isProfileDistant = (distanceMeters: number, isUnlimited: boolean): boolean => {
      if (isUnlimited) return false;
      return distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
    };

    it("un perfil a 85m, 460m o exactamente 1000m está en radio libre", () => {
      expect(isProfileDistant(85, false)).toBe(false);
      expect(isProfileDistant(460, false)).toBe(false);
      expect(isProfileDistant(1000, false)).toBe(false);
    });

    it("un perfil a más de 1000m (ej. 1001m, 1100m, 2400m) requiere sintonía o Unlimited en Free", () => {
      expect(isProfileDistant(1001, false)).toBe(true);
      expect(isProfileDistant(1100, false)).toBe(true);
      expect(isProfileDistant(2400, false)).toBe(true);
    });

    it("un usuario Unlimited accede sin restricción a perfiles a cualquier distancia", () => {
      expect(isProfileDistant(1500, true)).toBe(false);
      expect(isProfileDistant(5000, true)).toBe(false);
    });
  });

  describe("Validación de Creación de Álbumes Públicos y Privados", () => {
    const isQuotaExceeded = (
      privacy: "public" | "private",
      currentCount: number,
      isUnlimited: boolean
    ): boolean => {
      if (isUnlimited) return false;
      const limit =
        privacy === "public"
          ? FREE_TIER_LIMITS.maxPublicAlbums
          : FREE_TIER_LIMITS.maxPrivateAlbums;
      return currentCount >= limit;
    };

    it("un usuario Free con 0 álbumes públicos debe poder crear 1 álbum público", () => {
      expect(isQuotaExceeded("public", 0, false)).toBe(false);
    });

    it("un usuario Free con 1 álbum público NO debe poder crear otro", () => {
      expect(isQuotaExceeded("public", 1, false)).toBe(true);
    });

    it("un usuario Free con 0 álbumes privados debe poder crear 1 bóveda privada", () => {
      expect(isQuotaExceeded("private", 0, false)).toBe(false);
    });

    it("un usuario Free con 1 álbum privado NO debe poder crear otra bóveda", () => {
      expect(isQuotaExceeded("private", 1, false)).toBe(true);
    });

    it("un usuario Unlimited o con Pase de Fin de Semana debe ignorar todos los límites de álbumes", () => {
      expect(isQuotaExceeded("public", 5, true)).toBe(false);
      expect(isQuotaExceeded("private", 12, true)).toBe(false);
    });
  });

  describe("Validación de Capacidad de Fotos por Álbum", () => {
    const canAddPhoto = (
      currentPhotosCount: number,
      isUnlimited: boolean
    ): boolean => {
      if (isUnlimited) return true;
      return currentPhotosCount < FREE_TIER_LIMITS.maxPhotosPerAlbum;
    };

    it("debe permitir agregar fotos si el conteo actual es menor a 10 en Free", () => {
      expect(canAddPhoto(0, false)).toBe(true);
      expect(canAddPhoto(9, false)).toBe(true);
    });

    it("debe bloquear la carga al alcanzar exactamente 10 fotos en Free", () => {
      expect(canAddPhoto(10, false)).toBe(false);
      expect(canAddPhoto(15, false)).toBe(false);
    });

    it("un usuario Unlimited puede subir más de 10 fotos sin bloqueo", () => {
      expect(canAddPhoto(10, true)).toBe(true);
      expect(canAddPhoto(50, true)).toBe(true);
    });
  });
});
