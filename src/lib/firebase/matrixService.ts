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
/**
 * Detecta si un ID corresponde a un perfil de prueba, bot, o sesión local
 */
export const isGhostOrMockProfileId = (id?: string | null): boolean => {
  if (!id) return false;
  const trimmed = id.trim();
  return (
    trimmed.startsWith("vessel-") ||
    trimmed.startsWith("mock_") ||
    trimmed.startsWith("mock-") ||
    trimmed.startsWith("test-") ||
    trimmed.startsWith("usr-mock-") ||
    trimmed.startsWith("usr-") ||
    trimmed === "local-user" ||
    trimmed === "unauthenticated" ||
    trimmed === "me" ||
    MOCK_PROFILES.some((m) => m.id === trimmed)
  );
};

export const isGhostOrMockProfile = (p: Partial<VesselProfile> | undefined | null): boolean => {
  if (!p || !p.id || !p.codename) return true;
  const id = p.id.trim();
  const code = p.codename.trim().toUpperCase();

  if (isGhostOrMockProfileId(id)) {
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
 * Normaliza y complementa defensivamente un documento de perfil público de Firestore,
 * garantizando que colecciones como galleryUrls, testimonials, privateVault, kinks,
 * healthStatus y verification cumplan la firma estricta de VesselProfile y nunca causen TypeError.
 */
export const normalizeMatrixProfile = (
  p: Partial<VesselProfile> | undefined | null
): VesselProfile => {
  if (!p) {
    return {
      id: "unknown",
      codename: "OPERATIVO",
      age: 28,
      showAge: true,
      twitterHandle: "",
      yoSoy: "Musculoso / Gym",
      mobility: "Me muevo / voy",
      hivStatus: "Lo charlamos por privado",
      genderIdentity: "",
      pronouns: "",
      desires: [],
      intentions: [],
      boundaries: [],
      energyVibes: [],
      respectScore: 100,
      isAntiGhost: true,
      responseRateMinutes: 3,
      distanceMeters: 50,
      bodyState: "open",
      role: "Versátil",
      heightCm: 175,
      weightKg: 75,
      bodyArchetype: "Atlético",
      intensity: 3,
      hosting: "Me muevo / voy",
      tagline: "VESSEL OPERATIVE",
      statement: "Operativo en la Matrix",
      avatarUrl: "",
      isStylizedAvatar: false,
      isFogMode: false,
      isCurrentUser: false,
      verification: {
        isVerified: false,
        hasFacialPrivacy: true,
        badgeLabel: "NO VERIFICADO",
        trustScore: 80,
      },
      totalEncountersVerified: 0,
      galleryUrls: [],
      privateVault: [],
      testimonials: [],
      kinks: [],
      healthStatus: {
        prep: false,
        testedDate: "AL DÍA",
        details: "Lo charlamos por privado",
      },
      coordinates: { lat: -34.588, lng: -58.43 },
    } as unknown as VesselProfile;
  }

  const avatarUrl = typeof p.avatarUrl === "string" ? p.avatarUrl : "";
  const rawGallery = Array.isArray(p.galleryUrls) ? p.galleryUrls.filter(Boolean) : [];
  const galleryUrls = rawGallery.length > 0 ? rawGallery : (avatarUrl ? [avatarUrl] : []);

  return {
    ...p,
    id: p.id || "unknown",
    codename: p.codename || "OPERATIVO",
    age: typeof p.age === "number" ? p.age : 28,
    showAge: p.showAge ?? true,
    twitterHandle: p.twitterHandle || "",
    yoSoy: (p.yoSoy as any) || "Musculoso / Gym",
    mobility: (p.mobility as any) || "Me muevo / voy",
    hivStatus: (p.hivStatus as any) || "Lo charlamos por privado",
    genderIdentity: p.genderIdentity || "",
    pronouns: p.pronouns || "",
    desires: Array.isArray(p.desires) ? p.desires : [],
    intentions: Array.isArray(p.intentions) ? p.intentions : [],
    boundaries: Array.isArray(p.boundaries) ? p.boundaries : [],
    energyVibes: Array.isArray(p.energyVibes) ? p.energyVibes : [],
    respectScore: typeof p.respectScore === "number" ? p.respectScore : 100,
    isAntiGhost: p.isAntiGhost ?? true,
    responseRateMinutes: typeof p.responseRateMinutes === "number" ? p.responseRateMinutes : 3,
    distanceMeters: typeof p.distanceMeters === "number" ? p.distanceMeters : 50,
    bodyState: p.bodyState || "open",
    role: p.role || "Versátil",
    heightCm: typeof p.heightCm === "number" ? p.heightCm : 175,
    weightKg: typeof p.weightKg === "number" ? p.weightKg : 75,
    bodyArchetype: p.bodyArchetype || p.yoSoy || "Atlético",
    intensity: p.intensity ?? 3,
    hosting: p.hosting || p.mobility || "Me muevo / voy",
    tagline: p.tagline || (p.genderIdentity ? `${p.genderIdentity} • ${p.pronouns}` : "VESSEL OPERATIVE"),
    statement: p.statement || (Array.isArray(p.intentions) && p.intentions.length > 0 ? p.intentions.join(" · ") : "Operativo en la Matrix"),
    avatarUrl,
    isStylizedAvatar: !!p.isStylizedAvatar,
    isFogMode: !!p.isFogMode,
    isCurrentUser: !!p.isCurrentUser,
    verification: p.verification || {
      isVerified: false,
      hasFacialPrivacy: true,
      badgeLabel: "NO VERIFICADO",
      trustScore: 80,
    },
    totalEncountersVerified: typeof p.totalEncountersVerified === "number" ? p.totalEncountersVerified : 0,
    galleryUrls,
    privateVault: Array.isArray(p.privateVault) ? p.privateVault : [],
    testimonials: Array.isArray(p.testimonials) ? p.testimonials : [],
    kinks: Array.isArray(p.kinks) ? p.kinks : [],
    healthStatus: p.healthStatus || {
      prep: /prep/i.test(p.hivStatus || ""),
      testedDate: "AL DÍA",
      details: p.hivStatus || "No especificado",
    },
    coordinates: p.coordinates || { lat: -34.588, lng: -58.43 },
  } as VesselProfile;
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
            .map((item) => normalizeMatrixProfile(item.data))
            .filter((p) => !isGhostOrMockProfile(p));
          onUpdate(realProfiles);
        } else {
          const validProfiles = allDocs
            .map((item) => normalizeMatrixProfile(item.data))
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

