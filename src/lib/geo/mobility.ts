/**
 * mobility.ts - Módulo Canónico de Movilidad, Hospedaje y Presencia Táctica de VESSEL.
 *
 * Desacopla las cadenas de interfaz de usuario (con emojis o dialectos rioplatenses)
 * de las claves canónicas del dominio. Provee funciones utilitarias puras y
 * ultra-rápidas para evaluar la disponibilidad de lugar o transporte.
 */

export type CanonicalMobilityKey =
  | "host_only"
  | "travel_only"
  | "host_and_travel"
  | "club_cruising"
  | "unspecified";

/**
 * Normaliza cualquier variante de movilidad (cadena con emojis, texto libre o clave histórica)
 * a su clave canónica de dominio.
 */
export function normalizeMobilityKey(mobility?: string | null): CanonicalMobilityKey {
  if (!mobility) return "unspecified";

  const raw = mobility.toLowerCase().trim();

  // Exclusión explícita de lugar ("sin lugar", "sin casa", "no place", etc.)
  const hasExplicitNoPlace =
    raw.includes("sin lugar") ||
    raw.includes("sin casa") ||
    raw.includes("sin depto") ||
    raw.includes("sin sitio") ||
    raw.includes("no place") ||
    raw.includes("no tengo lugar") ||
    raw.includes("no_place");

  // 1. Ambas capacidades (Pone lugar y viaja)
  if (
    !hasExplicitNoPlace &&
    (raw.includes("pongo casa o viajo") ||
      raw.includes("tengo lugar y me muevo") ||
      raw.includes("tengo sitio/me desplazo") ||
      raw.includes("host_and_travel") ||
      ((raw.includes("casa") || raw.includes("lugar") || raw.includes("depto") || raw.includes("sitio")) &&
        (raw.includes("viajo") || raw.includes("muevo") || raw.includes("desplazo"))))
  ) {
    return "host_and_travel";
  }

  // 2. Solo hospedaje propio / Pone lugar
  if (
    !hasExplicitNoPlace &&
    (raw.includes("pongo casa") ||
      raw.includes("tengo depto") ||
      raw.includes("tengo sitio") ||
      raw.includes("tengo lugar") ||
      raw.includes("host"))
  ) {
    return "host_only";
  }

  // 3. Solo viaja / Se desplaza (o sin lugar explícito con movilidad)
  if (
    raw.includes("voy a la tuya") ||
    raw.includes("viajo") ||
    raw.includes("me muevo") ||
    raw.includes("can_travel") ||
    raw.includes("travel_only") ||
    raw.includes("se_desplaza") ||
    hasExplicitNoPlace
  ) {
    return "travel_only";
  }

  // 4. En boliche / Cruising / Darkroom / Salida
  if (
    raw.includes("boliche") ||
    raw.includes("cruising") ||
    raw.includes("darkroom") ||
    raw.includes("telo") ||
    raw.includes("club") ||
    raw.includes("sala oscura") ||
    raw.includes("aire libre") ||
    raw.includes("club_cruising")
  ) {
    return "club_cruising";
  }

  return "unspecified";
}

/**
 * Evalúa de forma resiliente si el perfil cuenta con lugar u hospedaje propio.
 */
export function hasHostingCapability(mobility?: string | null): boolean {
  const key = normalizeMobilityKey(mobility);
  return key === "host_only" || key === "host_and_travel";
}

/**
 * Evalúa si el perfil cuenta con movilidad para desplazarse al encuentro.
 */
export function canTravel(mobility?: string | null): boolean {
  const key = normalizeMobilityKey(mobility);
  return key === "travel_only" || key === "host_and_travel";
}

/**
 * Evalúa si el perfil se encuentra en un boliche, club o punto de encuentro nocturno.
 */
export function isInClubOrCruising(mobility?: string | null): boolean {
  return normalizeMobilityKey(mobility) === "club_cruising";
}
