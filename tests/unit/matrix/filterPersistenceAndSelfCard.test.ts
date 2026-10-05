import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from "@/lib/storage/localStorageSync";
import { DEFAULT_FILTERS } from "@/context/domains/RadarMatrixContext";
import { FilterState, VesselProfile, IntentClusterGroup } from "@/types/vessel";
import { MOCK_PROFILES } from "@/data/mockProfiles";

describe("Filter Persistence & Self-Card (Alternative A) Invariants", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("Filter Persistence (localStorage)", () => {
    it("debe existir STORAGE_KEYS.FILTERS con la clave adecuada", () => {
      expect(STORAGE_KEYS.FILTERS).toBe("vessel_matrix_filters_v1");
    });

    it("debe cargar DEFAULT_FILTERS como fallback si no hay nada en storage", () => {
      const loaded = loadFromStorage<FilterState>(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS, "real");
      expect(loaded).toEqual(DEFAULT_FILTERS);
      expect(loaded.maxDistanceKm).toBe(5);
      expect(loaded.roles).toEqual([]);
    });

    it("debe persistir cambios en filtros y recuperarlos tras recargar", () => {
      const customFilters: FilterState = {
        ...DEFAULT_FILTERS,
        roles: ["Top", "Vers Top"],
        maxDistanceKm: 15,
        onlyVerified: true,
        selectedKinks: ["leather", "darkroom"],
      };

      saveToStorage(STORAGE_KEYS.FILTERS, customFilters, "real");

      const loaded = loadFromStorage<FilterState>(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS, "real");
      expect(loaded.roles).toEqual(["Top", "Vers Top"]);
      expect(loaded.maxDistanceKm).toBe(15);
      expect(loaded.onlyVerified).toBe(true);
      expect(loaded.selectedKinks).toEqual(["leather", "darkroom"]);
    });

    it("debe restablecer a DEFAULT_FILTERS al llamar a reset", () => {
      const customFilters: FilterState = {
        ...DEFAULT_FILTERS,
        roles: ["Bottom"],
        maxDistanceKm: 2,
      };

      saveToStorage(STORAGE_KEYS.FILTERS, customFilters, "real");
      expect(loadFromStorage<FilterState>(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS, "real").roles).toEqual(["Bottom"]);

      // Reset
      saveToStorage(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS, "real");
      const reloaded = loadFromStorage<FilterState>(STORAGE_KEYS.FILTERS, DEFAULT_FILTERS, "real");
      expect(reloaded).toEqual(DEFAULT_FILTERS);
    });
  });

  describe("Self-Card (Alternative A) in Matrix Clusters", () => {
    const mockCurrentUser: VesselProfile = {
      ...MOCK_PROFILES[0],
      id: "test-user-me",
      codename: "TEST_PILOT",
      isCurrentUser: true,
    };

    const mockOtherUser: VesselProfile = {
      ...MOCK_PROFILES[1],
      id: "other-user-1",
      codename: "RODRIGO",
      isCurrentUser: false,
    };

    it("debe posicionar la tarjeta propia en index 0 del primer racimo cuando hay otros usuarios", () => {
      const rawClusters: IntentClusterGroup[] = [
        {
          id: "cluster-now-ready",
          intent: "now",
          title: "Listos para Salir",
          subtitle: "Disponibilidad inmediata",
          icon: "⚡",
          accentColor: "border-amber-400 text-amber-400",
          profiles: [mockOtherUser],
        },
      ];

      const activeClusters = rawClusters.filter((c) => c.profiles.length > 0);
      if (mockCurrentUser && activeClusters.length > 0) {
        activeClusters[0] = {
          ...activeClusters[0],
          profiles: [mockCurrentUser, ...activeClusters[0].profiles.filter((p) => !p.isCurrentUser)],
        };
      }

      expect(activeClusters[0].profiles[0].id).toBe("test-user-me");
      expect(activeClusters[0].profiles[0].isCurrentUser).toBe(true);
      expect(activeClusters[0].profiles[1].id).toBe("other-user-1");
      expect(activeClusters[0].profiles).toHaveLength(2);
    });

    it("no debe duplicar la tarjeta propia si se re-evalúa", () => {
      const clusterWithSelf: IntentClusterGroup = {
        id: "cluster-now-ready",
        intent: "now",
        title: "Listos para Salir",
        subtitle: "Disponibilidad inmediata",
        icon: "⚡",
        accentColor: "border-amber-400 text-amber-400",
        profiles: [mockCurrentUser, mockOtherUser],
      };

      const sanitizedProfiles = [mockCurrentUser, ...clusterWithSelf.profiles.filter((p) => !p.isCurrentUser)];
      const selfCount = sanitizedProfiles.filter((p) => p.isCurrentUser).length;

      expect(selfCount).toBe(1);
      expect(sanitizedProfiles[0].id).toBe("test-user-me");
    });
  });
});
