"use client";

import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import { normalizeMatrixProfile } from "./matrixService";
import { VesselProfile } from "@/types/vessel";

const PROFILES_COLLECTION = "vessel_profiles";

/**
 * Obtiene el perfil público de cualquier usuario por UID desde Firestore
 * Garantiza que usuarios que ya no estén activos en el radar puedan visualizarse
 * en chats, agenda, pulsos y dossiers sin perder su información.
 */
export const fetchPublicProfileById = async (uid: string): Promise<VesselProfile | null> => {
  if (!uid || uid === "local-user" || uid === "me" || uid === "system") return null;
  try {
    const publicRef = doc(db, PROFILES_COLLECTION, uid);
    const snap = await getDoc(publicRef);
    if (snap.exists()) {
      return normalizeMatrixProfile(snap.data() as Partial<VesselProfile>);
    }
  } catch (error) {
    console.warn(`[ProfileService] Error al obtener perfil público ${uid}:`, error);
  }
  return null;
};
