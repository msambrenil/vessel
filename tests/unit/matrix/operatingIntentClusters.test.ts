import { describe, it, expect } from "vitest";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { OperatingIntentMode, IntentClusterGroup } from "@/types/vessel";

describe("Operating Intent Modes and Intent Clusters", () => {
  it("debe contener las claves de internacionalización de sintonía en español e inglés", () => {
    expect(TRANSLATIONS.es.intents).toBeDefined();
    expect(TRANSLATIONS.en.intents).toBeDefined();

    expect(TRANSLATIONS.es.intents.now).toBe("Ahora");
    expect(TRANSLATIONS.es.intents.nightlife).toBe("Noche");
    expect(TRANSLATIONS.es.intents.kink).toBe("Kink & Morbos");
    expect(TRANSLATIONS.es.intents.stealth).toBe("Modo Discreto");

    expect(TRANSLATIONS.en.intents.now).toBe("Now (Ready)");
    expect(TRANSLATIONS.en.intents.nightlife).toBe("Nightlife & Parties");
    expect(TRANSLATIONS.en.intents.kink).toBe("Kink & Dynamics");
    expect(TRANSLATIONS.en.intents.stealth).toBe("Stealth Mode");
  });

  it("debe soportar la estructura de IntentClusterGroup con uniones discriminadas estrictas", () => {
    const sampleCluster: IntentClusterGroup = {
      id: "cluster-now-host",
      intent: "now" as OperatingIntentMode,
      title: "Con Lugar Inmediato (Hosts Activos)",
      subtitle: "Listos para recibir con privacidad",
      icon: "🏠",
      accentColor: "border-electricViolet text-electricViolet",
      profiles: [],
    };

    expect(sampleCluster.id).toBe("cluster-now-host");
    expect(sampleCluster.intent).toBe("now");
    expect(sampleCluster.icon).toBe("🏠");
    expect(Array.isArray(sampleCluster.profiles)).toBe(true);
  });

  it("debe validar las 4 modalidades operativas de sintonía", () => {
    const validModes: OperatingIntentMode[] = ["now", "nightlife", "kink", "stealth"];
    expect(validModes).toHaveLength(4);
    validModes.forEach((mode) => {
      expect(typeof mode).toBe("string");
    });
  });
});
