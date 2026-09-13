"use client";

import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { MyProfileState } from "@/context/VesselContext";
import { BodyState, UserSubscriptionTier, ExitProtocol, OnTheClockState } from "@/types/vessel";

const USERS_COLLECTION = "vessel_users";
const PROFILES_COLLECTION = "vessel_profiles";

/**
 * Escucha en tiempo real los cambios en el perfil del usuario autenticado
 */
export const subscribeToMyProfile = (
  uid: string,
  onUpdate: (profile: Partial<MyProfileState>, bodyState?: BodyState, plan?: UserSubscriptionTier) => void
): Unsubscribe => {
  const userRef = doc(db, USERS_COLLECTION, uid);

  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onUpdate(data.profile || {}, data.bodyState, data.userPlan);
      }
    },
    (error) => {
      console.warn("Error en suscripción de perfil de Firestore:", error);
    }
  );
};

/**
 * Guarda o actualiza el perfil del usuario en Firestore:
 * 1. Expediente privado completo en vessel_users/{uid} (Privacidad P0)
 * 2. Perfil público sanitizado para la matriz en vessel_profiles/{uid}
 */
export const syncMyProfileToCloud = async (
  uid: string,
  profile: MyProfileState,
  bodyState: BodyState,
  userPlan: UserSubscriptionTier,
  options?: {
    exitProtocol?: ExitProtocol;
    onTheClock?: OnTheClockState;
  }
): Promise<boolean> => {
  try {
    // 1. Sincronizar expediente privado en vessel_users (Restringido al propietario)
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(
      userRef,
      sanitizeForFirestore({
        profile,
        bodyState,
        userPlan,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    );

    // 2. Sincronizar perfil público en vessel_profiles (Lectura autorizada para matriz/radar)
    const publicProfileRef = doc(db, PROFILES_COLLECTION, uid);
    await setDoc(
      publicProfileRef,
      sanitizeForFirestore({
        id: uid,
        codename: profile.codename,
        age: profile.age,
        showAge: profile.showAge ?? true,
        twitterHandle: profile.twitterHandle || "",
        yoSoy: profile.yoSoy,
        mobility: profile.mobility,
        hivStatus: profile.hivStatus,
        genderIdentity: profile.genderIdentity,
        pronouns: profile.pronouns,
        desires: profile.desires || [],
        intentions: profile.intentions || [],
        boundaries: profile.boundaries || [],
        energyVibes: profile.energyVibes || [],
        respectScore: profile.respectScore ?? 100,
        isAntiGhost: profile.isAntiGhost ?? true,
        distanceMeters: 50,
        bodyState,
        role: profile.role,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        avatarUrl: profile.avatarUrl,
        isStylizedAvatar: profile.isStylizedAvatar ?? false,
        isFogMode: profile.isFogMode ?? false,
        verification: profile.verification,
        totalEncountersVerified: profile.totalEncountersVerified ?? 0,
        exitProtocol: options?.exitProtocol,
        onTheClock: options?.onTheClock,
        hosting: profile.mobility === "Tengo depto / lugar" ? "Tengo depto" : undefined,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error sincronizando perfil en Firestore:", error);
    return false;
  }
};

/**
 * Actualiza el Estado Corporal (open, occupied, dormant) en Firestore (privado y público)
 */
export const syncBodyStateToCloud = async (
  uid: string,
  bodyState: BodyState
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const publicRef = doc(db, PROFILES_COLLECTION, uid);

    await Promise.all([
      updateDoc(
        userRef,
        sanitizeForFirestore({
          bodyState,
          updatedAt: serverTimestamp(),
        })
      ),
      setDoc(
        publicRef,
        sanitizeForFirestore({
          bodyState,
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      ),
    ]);

    return true;
  } catch (error) {
    console.error("Error actualizando BodyState en Firestore:", error);
    return false;
  }
};

/**
 * Actualiza el Plan de Suscripción (free, unlimited) en Firestore
 */
export const syncUserPlanToCloud = async (
  uid: string,
  userPlan: UserSubscriptionTier
): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      userPlan,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error actualizando UserPlan en Firestore:", error);
    return false;
  }
};
