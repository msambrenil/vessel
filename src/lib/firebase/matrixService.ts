"use client";

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  limit,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { VesselProfile } from "@/types/vessel";
import { MOCK_PROFILES } from "@/data/mockProfiles";

const PROFILES_COLLECTION = "vessel_profiles";

/**
 * Detecta si un documento de perfil corresponde a un bot de prueba, cuenta dev (@vessel.dev),
 * sesión sin configurar (VESSEL_USER), foto de stock de Unsplash o coordenada fantasma (Berlín 52.52 / Null Island).
 */
export const isGhostOrMockProfile = (p: Partial<VesselProfile> | undefined | null): boolean => {
  if (!p || !p.id || !p.codename) return true;
  const id = p.id.trim();
  const code = p.codename.trim().toUpperCase();

  if (
    id.startsWith("vessel-") ||
    id.startsWith("mock_") ||
    id.startsWith("mock-") ||
    id.startsWith("test-") ||
    id.startsWith("usr-mock-") ||
    id.startsWith("usr-") ||
    id === "local-user" ||
    id === "unauthenticated" ||
    id === "me" ||
    MOCK_PROFILES.some((m) => m.id === id)
  ) {
    return true;
  }

  // Presets de prueba rápida o placeholders genéricos sin configurar
  if (
    code === "VESSEL_TOP" ||
    code === "VESSEL_VERS" ||
    code === "VESSEL_BOT" ||
    code === "VESSEL_USER" ||
    code === "VESSEL" ||
    code.startsWith("MOCK") ||
    code.startsWith("TEST_")
  ) {
    return true;
  }

  // Cualquier perfil con foto de stock de Unsplash perteneciente al catálogo de mocks
  if (
    typeof p.avatarUrl === "string" &&
    p.avatarUrl.includes("images.unsplash.com") &&
    MOCK_PROFILES.some((m) => m.id === id || m.avatarUrl === p.avatarUrl)
  ) {
    return true;
  }

  // Coordenadas fantasma de test (Berlín 52.52 / 13.405 o Null Island 0, 0)
  if (
    p.coordinates &&
    ((Math.abs(p.coordinates.lat - 52.52) < 0.05 && Math.abs(p.coordinates.lng - 13.405) < 0.05) ||
      (p.coordinates.lat === 0 && p.coordinates.lng === 0))
  ) {
    return true;
  }

  return false;
};

/**
 * Escucha en tiempo real todos los perfiles de la matriz
 * En modo real: Solo retorna perfiles reales de usuarios, filtra y purga cualquier documento fantasma/mock.
 * En modo prueba: Retorna perfiles de prueba como fallback.
 */
export const subscribeToMatrixProfiles = (
  onUpdate: (profiles: VesselProfile[]) => void,
  mode: "test" | "real" = "test"
): Unsubscribe => {
  const profilesRef = collection(db, PROFILES_COLLECTION);
  const q = query(profilesRef, limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const allDocs = snapshot.docs.map((d) => ({
          docId: d.id,
          data: d.data() as VesselProfile,
        }));

        if (mode === "real") {
          const realProfiles = allDocs
            .map((item) => item.data)
            .filter((p) => !isGhostOrMockProfile(p));
          onUpdate(realProfiles);
        } else {
          const validProfiles = allDocs
            .map((item) => item.data)
            .filter((p) => p && p.id && p.codename && p.coordinates && typeof p.coordinates.lat === "number");
          onUpdate(validProfiles.length > 0 ? validProfiles : MOCK_PROFILES);
        }
      } else {
        if (mode === "real") {
          onUpdate([]);
        } else {
          onUpdate(MOCK_PROFILES);
        }
      }
    },
    (error) => {
      console.warn("Firestore matrix subscription fallback:", error);
      if (mode === "real") {
        onUpdate([]);
      } else {
        onUpdate(MOCK_PROFILES);
      }
    }
  );
};

/**
 * Siembra los perfiles iniciales en Firestore si se invoca explícitamente para tests
 */
export const seedInitialProfiles = async (): Promise<void> => {
  try {
    for (const profile of MOCK_PROFILES) {
      const profileRef = doc(db, PROFILES_COLLECTION, profile.id);
      await setDoc(profileRef, profile, { merge: true });
    }
  } catch (err) {
    console.warn("No se pudo sembrar perfiles en Firestore (modo offline):", err);
  }
};

/**
 * Publica o actualiza la presencia del usuario en la colección pública de perfiles de la matriz
 */
export const updateMyMatrixPresence = async (
  uid: string,
  profile: Partial<VesselProfile>
): Promise<boolean> => {
  if (!uid || uid === "local-user") return false;

  try {
    const profileRef = doc(db, PROFILES_COLLECTION, uid);
    await setDoc(
      profileRef,
      sanitizeForFirestore({
        ...profile,
        id: uid,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Error actualizando presencia en matriz de Firestore:", error);
    return false;
  }
};

