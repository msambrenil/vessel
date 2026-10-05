import { describe, it, expect } from "vitest";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { ENERGY_VIBE_CATALOG } from "@/data/energyCatalog";
import { INTENSITY_LABELS, KINK_CATALOG } from "@/data/kinkCatalog";

describe("FEAT-145: Hybrid Filter Drawer (Architecture A + C)", () => {
  describe("ENERGY_VIBE_CATALOG — Vocabulario Argentino Queer 2026", () => {
    it("debe contener las 7 ondas con etiquetas y descripciones auténticas argentinas", () => {
      const labels = ENERGY_VIBE_CATALOG.map((v) => v.label);
      expect(labels).toContain("Al hueso");
      expect(labels).toContain("Tranqui");
      expect(labels).toContain("Pegar onda");
      expect(labels).toContain("Morbos / Fetiches");
      expect(labels).toContain("Mirón / Morbo visual");
      expect(labels).toContain("Boliches y Lugares");
      expect(labels).toContain("Juegos & Rol");
    });

    it("cada onda debe tener emoji, color semántico y descripción clara", () => {
      ENERGY_VIBE_CATALOG.forEach((vibe) => {
        expect(vibe.emoji.length).toBeGreaterThan(0);
        expect(vibe.tagColor).toBeDefined();
        expect(vibe.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("INTENSITY_LABELS — Tempos de Encuentro sin Niveles Abstractos", () => {
    it("debe definir los 4 niveles de intensidad con etiquetas argentinas comprensibles", () => {
      expect(INTENSITY_LABELS[1].label).toBe("Tranqui");
      expect(INTENSITY_LABELS[2].label).toBe("Al hueso");
      expect(INTENSITY_LABELS[3].label).toBe("Picante");
      expect(INTENSITY_LABELS[4].label).toBe("Extremo");
    });

    it("debe tener descripciones de contexto sensorial para cada tempo", () => {
      expect(INTENSITY_LABELS[1].desc).toContain("Mimos");
      expect(INTENSITY_LABELS[2].desc).toContain("química");
      expect(INTENSITY_LABELS[3].desc).toContain("acelerado");
      expect(INTENSITY_LABELS[4].desc).toContain("Darkroom");
    });
  });

  describe("KINK_CATALOG — Clasificación en Tribus para Acordeón Plegable", () => {
    it("debe segmentar el catálogo en Gear, Dinámicas de Poder y Morbos/Prácticas", () => {
      const gearKinks = KINK_CATALOG.filter((k) => k.category === "gear");
      const dynamicKinks = KINK_CATALOG.filter(
        (k) => k.category === "dynamic" || k.category === "intensity"
      );
      const practicesKinks = KINK_CATALOG.filter(
        (k) => k.category === "fetish" || k.category === "scene"
      );

      expect(gearKinks.length).toBeGreaterThan(0);
      expect(dynamicKinks.length).toBeGreaterThan(0);
      expect(practicesKinks.length).toBeGreaterThan(0);

      // Todos los ítems del catálogo deben pertenecer a alguna categoría válida
      const totalCategorized = gearKinks.length + dynamicKinks.length + practicesKinks.length;
      expect(totalCategorized).toBe(KINK_CATALOG.length);
    });
  });

  describe("Traducciones de Filtros Dinámicos", () => {
    it("debe tener todas las claves del layout híbrido en español e inglés", () => {
      const es = TRANSLATIONS.es.filters;
      const en = TRANSLATIONS.en.filters;

      expect(es.vibesSection).toBe("¿Qué onda buscás hoy?");
      expect(en.vibesSection).toBe("Desired Vibe Today");

      expect(es.intensitySection).toBe("¿Qué tan picante?");
      expect(en.intensitySection).toBe("How Spicy? (Tempo)");

      expect(es.immediateHostOnly).toBe("Tiene lugar ya");
      expect(en.immediateHostOnly).toBe("Has Place Now");

      expect(es.antiGhostShortTitle).toBe("Cero plantones (90%+)");
      expect(en.antiGhostShortTitle).toBe("Zero Flakes (90%+)");

      expect(es.advancedAccordionTitle).toBe("Afinar fetiches, sustancias y distancia");
      expect(en.advancedAccordionTitle).toBe("Fine-tune Kinks, Substances & Distance");

      expect(es.kinkCategoryGear).toBe("Cuero & Gear");
      expect(en.kinkCategoryGear).toBe("Leather & Gear");

      expect(es.kinkCategoryDynamic).toBe("Dinámicas de Poder");
      expect(en.kinkCategoryDynamic).toBe("Power Dynamics");

      expect(es.kinkCategoryPractices).toBe("Morbos & Prácticas");
      expect(en.kinkCategoryPractices).toBe("Kinks & Practices");
    });
  });
});
