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
