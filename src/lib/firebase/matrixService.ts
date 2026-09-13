"use client";

import {
  collection,
  doc,
  setDoc,
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
 * Escucha en tiempo real todos los perfiles de la matriz
 * En modo real: Solo retorna perfiles reales de usuarios y no siembra datos mock.
 * En modo prueba: Retorna perfiles de prueba como fallback.
 */
export const subscribeToMatrixProfiles = (
  onUpdate: (profiles: VesselProfile[]) => void,
  mode: "test" | "real" = "test"
): Unsubscribe => {
  const profilesRef = collection(db, PROFILES_COLLECTION);
  const q = query(profilesRef, limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        let validProfiles: VesselProfile[] = snapshot.docs
          .map((d) => d.data() as VesselProfile)
          .filter((p) => p && p.id && p.codename && p.coordinates && typeof p.coordinates.lat === "number");

        if (mode === "real") {
          // Filtrar perfiles simulados (ej: vessel-01..08 o mock_) para garantizar entorno 100% limpio
          validProfiles = validProfiles.filter(
            (p) => !p.id.startsWith("vessel-") && !p.id.startsWith("mock_")
          );
          onUpdate(validProfiles);
        } else {
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

