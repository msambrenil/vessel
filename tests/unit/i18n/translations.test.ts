import { describe, it, expect } from "vitest";
import {
  TRANSLATIONS,
  getTranslations,
  formatDistance,
} from "@/lib/i18n/translations";
import { SupportedLanguage } from "@/types/vessel";

describe("i18n — Internacionalización, Paridad de Diccionarios y Formato", () => {
  describe("Paridad de Claves entre Diccionarios (es vs en)", () => {
    /**
     * Función auxiliar para extraer todas las rutas de claves recursivamente
     * ej: ["nav.grid", "nav.radar", "bodyState.open"]
     */
    function getObjectKeysDeep(obj: Record<string, any>, prefix = ""): string[] {
      let keys: string[] = [];
      for (const key of Object.keys(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const val = obj[key];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          keys = keys.concat(getObjectKeysDeep(val, path));
        } else {
          keys.push(path);
        }
      }
      return keys;
    }

    const esKeys = getObjectKeysDeep(TRANSLATIONS.es);
    const enKeys = getObjectKeysDeep(TRANSLATIONS.en);

    it("el diccionario en inglés debe contener todas las claves del diccionario en español", () => {
      const missingInEn = esKeys.filter((key) => !enKeys.includes(key));
      expect(
        missingInEn,
        `Claves faltantes en TRANSLATIONS.en: ${missingInEn.join(", ")}`
      ).toEqual([]);
    });

    it("el diccionario en español debe contener todas las claves del diccionario en inglés", () => {
      const missingInEs = enKeys.filter((key) => !esKeys.includes(key));
      expect(
        missingInEs,
        `Claves faltantes en TRANSLATIONS.es: ${missingInEs.join(", ")}`
      ).toEqual([]);
    });

    it("ninguna clave de traducción debe tener un string vacío", () => {
      function checkNonEmptyStrings(obj: Record<string, any>, path = "") {
        for (const [key, val] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof val === "string") {
            expect(
              val.trim().length,
              `La clave ${currentPath} tiene un valor de texto vacío`
            ).toBeGreaterThan(0);
          } else if (val && typeof val === "object") {
            checkNonEmptyStrings(val, currentPath);
          }
        }
      }

      checkNonEmptyStrings(TRANSLATIONS.es, "es");
      checkNonEmptyStrings(TRANSLATIONS.en, "en");
    });
  });

  describe("getTranslations — Selección de Idioma Reactiva", () => {
    it("debe retornar el diccionario en español cuando lang es 'es'", () => {
      const t = getTranslations("es");
      expect(t.nav.grid).toBe("Cerca");
      expect(t.bodyState.open).toBe("Visible en radar");
    });

    it("debe retornar el diccionario en inglés cuando lang es 'en'", () => {
      const t = getTranslations("en");
      expect(t.nav.grid).toBe("Nearby");
      expect(t.bodyState.open).toBe("Visible on radar");
    });

    it("debe hacer fallback al español si se pasa un idioma desconocido", () => {
      const t = getTranslations("fr" as unknown as SupportedLanguage);
      expect(t.bodyState.open).toBe("Visible en radar");
    });
  });

  describe("formatDistance — Formateo Métrico e Imperial", () => {
    describe("Sistema Métrico (metric)", () => {
      it("debe formatear en metros cuando la distancia es menor a 1000m", () => {
        expect(formatDistance(0, "metric")).toBe("0 m");
        expect(formatDistance(45, "metric")).toBe("45 m");
        expect(formatDistance(999, "metric")).toBe("999 m");
      });

      it("debe formatear en kilómetros con 1 decimal cuando la distancia es >= 1000m", () => {
        expect(formatDistance(1000, "metric")).toBe("1.0 km");
        expect(formatDistance(2450, "metric")).toBe("2.5 km");
        expect(formatDistance(10200, "metric")).toBe("10.2 km");
      });

      it("debe usar sistema métrico como valor por defecto si no se especifica", () => {
        expect(formatDistance(500)).toBe("500 m");
        expect(formatDistance(1500)).toBe("1.5 km");
      });
    });

    describe("Sistema Imperial (imperial)", () => {
      it("debe formatear en pies (ft) cuando los pies son menores a 1000 ft", () => {
        // 50m * 3.28084 = 164.042 -> 164 ft
        expect(formatDistance(50, "imperial")).toBe("164 ft");
        // 200m * 3.28084 = 656.168 -> 656 ft
        expect(formatDistance(200, "imperial")).toBe("656 ft");
      });

      it("debe formatear en millas (mi) con 1 decimal cuando los pies son >= 1000 ft", () => {
        // 1609.34m = 1.0 mi
        expect(formatDistance(1609.34, "imperial")).toBe("1.0 mi");
        // 5000m * 0.000621371 = 3.106 -> 3.1 mi
        expect(formatDistance(5000, "imperial")).toBe("3.1 mi");
      });
    });
  });
});
