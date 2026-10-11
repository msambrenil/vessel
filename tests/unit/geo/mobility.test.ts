import { describe, it, expect } from "vitest";
import {
  normalizeMobilityKey,
  hasHostingCapability,
  canTravel,
  isInClubOrCruising,
} from "@/lib/geo/mobility";

describe("Mobility Canonical Module (vessel v2.7.0)", () => {
  it("normaliza variantes de 'solo hospedaje' a host_only", () => {
    expect(normalizeMobilityKey("Pongo casa 🏠")).toBe("host_only");
    expect(normalizeMobilityKey("Tengo depto / lugar")).toBe("host_only");
    expect(normalizeMobilityKey("Tengo sitio")).toBe("host_only");
    expect(normalizeMobilityKey("host_solo")).toBe("host_only");
    expect(normalizeMobilityKey("host_only")).toBe("host_only");
  });

  it("normaliza variantes de 'solo viaja' a travel_only", () => {
    expect(normalizeMobilityKey("Voy a la tuya / Viajo 🚗")).toBe("travel_only");
    expect(normalizeMobilityKey("Me muevo / voy")).toBe("travel_only");
    expect(normalizeMobilityKey("Me muevo")).toBe("travel_only");
    expect(normalizeMobilityKey("se_desplaza")).toBe("travel_only");
    expect(normalizeMobilityKey("can_travel")).toBe("travel_only");
  });

  it("normaliza variantes híbridas a host_and_travel", () => {
    expect(normalizeMobilityKey("Pongo casa o viajo 🏠/🚗")).toBe("host_and_travel");
    expect(normalizeMobilityKey("Tengo lugar y me muevo")).toBe("host_and_travel");
    expect(normalizeMobilityKey("Tengo sitio/me desplazo")).toBe("host_and_travel");
    expect(normalizeMobilityKey("host_and_travel")).toBe("host_and_travel");
  });

  it("normaliza salidas nocturnas a club_cruising", () => {
    expect(normalizeMobilityKey("En boliche / cruising / telo")).toBe("club_cruising");
    expect(normalizeMobilityKey("En boliche / darkroom / cruising")).toBe("club_cruising");
    expect(normalizeMobilityKey("En club / darkroom")).toBe("club_cruising");
  });

  it("retorna 'unspecified' para entradas nulas o vacías", () => {
    expect(normalizeMobilityKey(null)).toBe("unspecified");
    expect(normalizeMobilityKey(undefined)).toBe("unspecified");
    expect(normalizeMobilityKey("")).toBe("unspecified");
  });

  it("evalúa hasHostingCapability correctamente", () => {
    expect(hasHostingCapability("Tengo depto / lugar")).toBe(true);
    expect(hasHostingCapability("Pongo casa o viajo 🏠/🚗")).toBe(true);
    expect(hasHostingCapability("Me muevo / voy")).toBe(false);
    expect(hasHostingCapability("En club / darkroom")).toBe(false);
  });

  it("evalúa canTravel correctamente", () => {
    expect(canTravel("Me muevo / voy")).toBe(true);
    expect(canTravel("Tengo lugar y me muevo")).toBe(true);
    expect(canTravel("Pongo casa 🏠")).toBe(false);
  });

  it("evalúa isInClubOrCruising correctamente", () => {
    expect(isInClubOrCruising("En boliche / cruising / telo")).toBe(true);
    expect(isInClubOrCruising("Pongo casa 🏠")).toBe(false);
  });
});
