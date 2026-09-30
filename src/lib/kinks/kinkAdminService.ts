"use client";

import { KINK_ITEMS_CATALOG, KinkItemDefinition } from "@/data/energyCatalog";

const STORAGE_KEY = "vessel_kinks_catalog_v1";
export const KINKS_UPDATED_EVENT = "vessel_kinks_updated";

/**
 * Obtiene el listado completo de morbos y fetiches (activos e inactivos).
 */
export function getAllKinks(): KinkItemDefinition[] {
  if (typeof window === "undefined") {
    return KINK_ITEMS_CATALOG.map((k) => ({ ...k, isActive: k.isActive !== false }));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = KINK_ITEMS_CATALOG.map((k) => ({
        ...k,
        isActive: k.isActive !== false,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: KinkItemDefinition[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Error reading kinks from storage", err);
    return KINK_ITEMS_CATALOG.map((k) => ({ ...k, isActive: k.isActive !== false }));
  }
}

/**
 * Obtiene únicamente los morbos que se encuentran activos para los usuarios.
 */
export function getActiveKinks(): KinkItemDefinition[] {
  return getAllKinks().filter((k) => k.isActive !== false);
}

/**
 * Guarda el catálogo completo de morbos en localStorage y dispara el evento reactivo.
 */
export function saveKinksCatalog(kinks: KinkItemDefinition[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kinks));
    window.dispatchEvent(new CustomEvent(KINKS_UPDATED_EVENT, { detail: kinks }));
  } catch (err) {
    console.error("Error saving kinks to storage", err);
  }
}

/**
 * Agrega un nuevo morbo/fetiche personalizado al catálogo.
 */
export function addCustomKink(
  newKink: Omit<KinkItemDefinition, "id" | "isCustom"> & { id?: string }
): KinkItemDefinition {
  const current = getAllKinks();
  const id =
    newKink.id?.trim() ||
    `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const created: KinkItemDefinition = {
    ...newKink,
    id,
    isActive: newKink.isActive !== false,
    isCustom: true,
  };

  const updated = [created, ...current];
  saveKinksCatalog(updated);
  return created;
}

/**
 * Conmuta el estado activo/inactivo de un morbo.
 */
export function toggleKinkActiveStatus(id: string): boolean {
  const current = getAllKinks();
  let nextState = false;

  const updated = current.map((k) => {
    if (k.id === id) {
      nextState = !(k.isActive !== false);
      return { ...k, isActive: nextState };
    }
    return k;
  });

  saveKinksCatalog(updated);
  return nextState;
}

/**
 * Actualiza los datos de un morbo existente.
 */
export function updateKink(
  id: string,
  data: Partial<Omit<KinkItemDefinition, "id">>
): KinkItemDefinition | null {
  const current = getAllKinks();
  let updatedItem: KinkItemDefinition | null = null;

  const updated = current.map((k) => {
    if (k.id === id) {
      updatedItem = { ...k, ...data };
      return updatedItem;
    }
    return k;
  });

  if (updatedItem) {
    saveKinksCatalog(updated);
  }
  return updatedItem;
}

/**
 * Elimina un morbo personalizado.
 */
export function deleteKink(id: string): boolean {
  const current = getAllKinks();
  const updated = current.filter((k) => k.id !== id);
  if (updated.length !== current.length) {
    saveKinksCatalog(updated);
    return true;
  }
  return false;
}

/**
 * Restablece el catálogo a los 35 predeterminados originales de VESSEL.
 */
export function resetKinksToDefault(): KinkItemDefinition[] {
  const initial = KINK_ITEMS_CATALOG.map((k) => ({
    ...k,
    isActive: true,
    isCustom: false,
  }));
  saveKinksCatalog(initial);
  return initial;
}

/**
 * Mapa de IDs canónicos a keys del namespace `t.kinks`.
 */
const KINK_KEY_MAP: Record<string, string> = {
  "raw-carnal": "rawCarnal",
  "dominant": "dominant",
  "submissive": "submissive",
  "switch": "switch",
  "physical-wrestling": "physicalWrestling",
  "leather": "leather",
  "rubber-latex": "rubberLatex",
  "sport-gear": "sportGear",
  "harness": "harness",
  "leather-harness": "leather",
  "boots": "boots",
  "darkroom": "darkroom",
  "techno-afters": "technoAfters",
  "immediate-host": "immediateHost",
  "car-outdoor": "carOutdoor",
  "stealth-discrete": "stealthDiscrete",
  "sensory-deprivation": "sensoryDeprivation",
  "bondage-rope": "bondageRope",
  "bondage": "bondage",
  "sweat-scent": "sweatScent",
  "oral-worship": "oralWorship",
  "endurance": "endurance",
  "breathplay": "breathplay",
  "armpits": "armpits",
  "musk": "musk",
  "jockstrap": "jockstrap",
  "thongs": "thongs",
  "sweaty_gear": "sweatyGear",
  "feet": "feet",
  "body_worship": "bodyWorship",
  "bears": "bears",
  "rubber": "rubber",
  "uniforms": "uniforms",
  "bdsm": "bdsm",
  "spanking": "spanking",
  "choking": "choking",
  "chastity": "chastity",
  "fisting": "fisting",
  "waterplay": "waterplay",
  "verbal": "verbal",
  "cruising": "cruising",
  "gloryhole": "gloryhole",
  "group": "group",
  "cuckold": "cuckold",
  "voyeurism": "voyeurism",
  "exhibitionism": "exhibitionism",
  "roleplay": "roleplay",
  "daddy_boy": "daddyBoy",
  "pup_play": "pupPlay",
  "edging": "edging",
  "toys": "toys",
  "sensual_slow": "sensualSlow",
  "rough": "rough",
  "bareback": "bareback",
  "condom_only": "condomOnly",
  "domination": "dominant",
};

/**
 * Mapa de arquetipos "Yo Soy" a keys del namespace `t.yoSoy`.
 */
const YO_SOY_KEY_MAP: Record<string, string> = {
  "musculoso / gym": "musculosoGym",
  "musculado / gym": "musculosoGym",
  "leather / arnés": "leatherArnes",
  "nutria / peludo": "nutriaPeludo",
  "nutria / otter": "nutriaPeludo",
  "oso / bear": "osoBear",
  "atlético / deportista": "atleticoDeportista",
  "atlético / jock": "atleticoDeportista",
  "twink / joven": "twinkJoven",
  "joven / twink": "twinkJoven",
  "maduro / daddy": "maduroDaddy",
  "dominante / amo": "dominanteAmo",
  "dominante / master": "dominanteAmo",
  "sumiso / entregado": "sumisoEntregado",
  "receptivo / sub": "sumisoEntregado",
  "pup / fetish": "pupFetish",
  "discreto / perfil bajo": "discretoPerfilBajo",
  "discreto / casual": "discretoPerfilBajo",
  "morbo / carnal": "morboCarnal",
  "darkroom / carnal": "darkroomCarnal",
};

/**
 * Devuelve la etiqueta traducida y profesional de un morbo o fetiche
 * utilizando el diccionario tipado de i18n (`t.kinks`).
 */
export function getKinkLocalizedLabel(
  kinkId: string,
  t?: { kinks?: Record<string, string> },
  fallbackName?: string
): string {
  const normalized = kinkId.trim().toLowerCase();
  const key = KINK_KEY_MAP[normalized];
  if (key && t?.kinks && t.kinks[key]) {
    return t.kinks[key];
  }

  // Buscar en catálogo de morbos si hay un custom o fallback
  if (fallbackName) return fallbackName;
  const def = getAllKinks().find((k) => k.id === kinkId || k.id === normalized);
  if (def?.name) return def.name;

  return kinkId.replace(/-/g, " ");
}

/**
 * Devuelve la etiqueta traducida y profesional del arquetipo "Yo Soy"
 * utilizando el diccionario tipado de i18n (`t.yoSoy`).
 */
export function getYoSoyLocalizedLabel(
  yoSoy: string | undefined,
  t?: { yoSoy?: Record<string, string> }
): string {
  if (!yoSoy) return "";
  const normalized = yoSoy.trim().toLowerCase();
  const key = YO_SOY_KEY_MAP[normalized];
  if (key && t?.yoSoy && t.yoSoy[key]) {
    return t.yoSoy[key];
  }
  return yoSoy;
}



