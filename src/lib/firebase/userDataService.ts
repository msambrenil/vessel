"use client";

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { MyProfileState } from "@/context/VesselContext";
import {
  UserAlbum,
  BodyState,
  UserSubscriptionTier,
  AppSettings,
  UserBoundarySetting,
  ProfileDossier,
} from "@/types/vessel";

const USERS_COLLECTION = "vessel_users";

export interface FullUserDataPayload {
  profile?: Partial<MyProfileState>;
  albums?: UserAlbum[];
  bodyState?: BodyState;
  userPlan?: UserSubscriptionTier;
  appSettings?: Partial<AppSettings>;
  boundaries?: Record<string, UserBoundarySetting>;
  dossiers?: Record<string, ProfileDossier>;
}

/**
 * Escucha en tiempo real todos los datos del usuario en un solo documento atómico
 */
export const subscribeToFullUserData = (
  uid: string,
  initialFallback: FullUserDataPayload,
  onUpdate: (data: FullUserDataPayload) => void
): Unsubscribe => {
  const userRef = doc(db, USERS_COLLECTION, uid);

  return onSnapshot(
    userRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        onUpdate({
          profile: cloudData.profile,
          albums: cloudData.albums,
          bodyState: cloudData.bodyState,
          userPlan: cloudData.userPlan,
          appSettings: cloudData.appSettings,
          boundaries: cloudData.boundaries,
          dossiers: cloudData.dossiers,
        });
      } else {
        // Primera vez que se conecta este UID: sembramos sus datos en Firestore
        try {
          const sanitizedPayload = sanitizeForFirestore(initialFallback);
          await setDoc(
            userRef,
            {
              ...sanitizedPayload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("No se pudo sembrar documento inicial de usuario en Firestore:", err);
        }
      }
    },
    (error) => {
      console.warn("Error en suscripción de datos de usuario en Firestore:", error);
    }
  );
};

/**
 * Guarda o actualiza los datos del usuario de forma atómica en Firestore
 */
export const saveFullUserDataToCloud = async (
  uid: string,
  payload: FullUserDataPayload
): Promise<boolean> => {
  if (!uid || uid === "local-user") return false;

  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const sanitizedPayload = sanitizeForFirestore(payload);
    await setDoc(
      userRef,
      {
        ...sanitizedPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error guardando datos de usuario en Firestore:", error);
    return false;
  }
};
