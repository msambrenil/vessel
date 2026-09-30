import { describe, it, expect } from "vitest";
import { DiaryEntry, VesselWrappedMetrics, ConquestZone } from "@/types/vessel";

describe("VESSEL Wrapped & Heatmap Urbano de Conquistas", () => {
  const sampleEntries: DiaryEntry[] = [
    {
      id: "e1",
      person: {
        profileId: "lover-1",
        codename: "Mateo_X",
        sharedPhotos: ["https://storage.vessel.app/pic1.jpg"],
        badges: ["🔥 Química Nuclear"],
      },
      date: "2026-09-01",
      time: "22:00",
      location: { name: "Palermo Soho", category: "my_place" },
      encounterType: "intense_carnal",
      privateNotes: "Excelente noche.",
      tags: ["Nuclear", "Cama"],
      satisfaction: { expectationsRating: 5, chemistryLevel: 5, boundariesRespect: 5, overallScore: 5, wouldRepeat: "yes" },
      isUpcoming: false,
      createdAt: "2026-09-01T22:00:00Z",
      updatedAt: "2026-09-01T22:00:00Z",
    },
    {
      id: "e2",
      person: {
        profileId: "lover-1",
        codename: "Mateo_X",
        badges: ["🔥 Química Nuclear"],
      },
      date: "2026-09-10",
      time: "23:30",
      location: { name: "Palermo Soho", category: "my_place" },
      encounterType: "intense_carnal",
      privateNotes: "Segunda vuelta impecable.",
      tags: ["Nuclear"],
      satisfaction: { expectationsRating: 5, chemistryLevel: 5, boundariesRespect: 5, overallScore: 5, wouldRepeat: "yes" },
      isUpcoming: false,
      createdAt: "2026-09-10T23:30:00Z",
      updatedAt: "2026-09-10T23:30:00Z",
    },
    {
      id: "e3",
      person: {
        profileId: "lover-2",
        codename: "Julian_SanTelmo",
      },
      date: "2026-09-10", // Misma noche que e2
      time: "19:00",
      location: { name: "San Telmo", category: "their_place" },
      encounterType: "regular_playmate",
      privateNotes: "Previo antes de salir.",
      tags: ["Tranqui"],
      satisfaction: { expectationsRating: 4, chemistryLevel: 4, boundariesRespect: 5, overallScore: 4, wouldRepeat: "yes" },
      isUpcoming: false,
      createdAt: "2026-09-10T19:00:00Z",
      updatedAt: "2026-09-10T19:00:00Z",
    },
    {
      id: "e4",
      person: {
        profileId: "lover-3",
        codename: "Tomas_Belgrano",
      },
      date: "2026-09-18",
      time: "21:00",
      location: { name: "Belgrano R", category: "bar_lounge" },
      encounterType: "first_date",
      privateNotes: "Primera cita.",
      tags: ["Café"],
      satisfaction: { expectationsRating: 4, chemistryLevel: 3, boundariesRespect: 5, overallScore: 4, wouldRepeat: "maybe" },
      isUpcoming: false,
      createdAt: "2026-09-18T21:00:00Z",
      updatedAt: "2026-09-18T21:00:00Z",
    },
  ];

  it("debe calcular métricas del Wrapped con precisión: total de encuentros, compañeros únicos y tasa de repetición", () => {
    const completed = sampleEntries.filter((e) => !e.isUpcoming);
    const totalEncounters = completed.length;
    const partnerCounts: Record<string, number> = {};

    completed.forEach((e) => {
      const id = e.person.profileId || e.person.codename;
      partnerCounts[id] = (partnerCounts[id] || 0) + 1;
    });

    const uniquePartners = Object.keys(partnerCounts).length;
    const repeatedPartners = Object.values(partnerCounts).filter((c) => c > 1).length;
    const repeatRate = Math.round((repeatedPartners / Math.max(1, uniquePartners)) * 100);

    expect(totalEncounters).toBe(4);
    expect(uniquePartners).toBe(3);
    expect(repeatRate).toBe(33); // 1 de 3 compañeros repetido (33%)
  });

  it("debe identificar correctamente al Compañero MVP (compañero con más sesiones)", () => {
    const completed = sampleEntries.filter((e) => !e.isUpcoming);
    const partnerMap: Record<string, { codename: string; count: number; avatarUrl?: string }> = {};

    completed.forEach((e) => {
      const id = e.person.profileId || e.person.codename;
      if (!partnerMap[id]) {
        partnerMap[id] = { codename: e.person.codename, count: 0, avatarUrl: e.person.avatarUrl };
      }
      partnerMap[id].count += 1;
    });

    const sorted = Object.values(partnerMap).sort((a, b) => b.count - a.count);
    const mvp = sorted[0];

    expect(mvp.codename).toBe("Mateo_X");
    expect(mvp.count).toBe(2);
  });

  it("debe detectar 'La Noche Más Salvaje' (fecha con el mayor número de citas completadas)", () => {
    const dateCounts: Record<string, number> = {};
    sampleEntries.forEach((e) => {
      dateCounts[e.date] = (dateCounts[e.date] || 0) + 1;
    });

    let wildestDate = "";
    let maxEncounters = 0;
    Object.entries(dateCounts).forEach(([date, count]) => {
      if (count > maxEncounters) {
        maxEncounters = count;
        wildestDate = date;
      }
    });

    expect(wildestDate).toBe("2026-09-10");
    expect(maxEncounters).toBe(2);
  });

  it("debe agrupar zonas de conquista urbana ordenadas por frecuencia de encuentros", () => {
    const counts: Record<string, { count: number; lastDate: string }> = {};

    sampleEntries.forEach((e) => {
      const zone = e.location.name || "Exterior";
      if (!counts[zone]) {
        counts[zone] = { count: 0, lastDate: e.date };
      }
      counts[zone].count += 1;
      if (e.date > counts[zone].lastDate) {
        counts[zone].lastDate = e.date;
      }
    });

    const zones: ConquestZone[] = Object.entries(counts)
      .map(([zoneName, data]) => ({
        zoneName,
        encounterCount: data.count,
        percentage: Math.round((data.count / sampleEntries.length) * 100),
        lastDate: data.lastDate,
      }))
      .sort((a, b) => b.encounterCount - a.encounterCount);

    expect(zones[0].zoneName).toBe("Palermo Soho");
    expect(zones[0].encounterCount).toBe(2);
    expect(zones).toHaveLength(3);
  });
});
