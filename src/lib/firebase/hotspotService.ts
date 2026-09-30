"use client";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  query,
  limit,
  getDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import {
  TacticalHotspot,
  HotspotStatus,
  HotspotReport,
  HotspotRating,
} from "@/types/vessel";
import { MOCK_HOTSPOTS } from "@/data/mockHotspots";

const HOTSPOTS_COLLECTION = "vessel_hotspots";

/**
 * Escucha en tiempo real la afluencia de todos los hotspots urbanos
 * En modo real: Solo retorna datos reales y no siembra lugares mock.
 * En modo prueba: Si está vacía o hay error, usa MOCK_HOTSPOTS.
 */
export const subscribeToHotspots = (
  onUpdate: (hotspots: TacticalHotspot[]) => void,
  mode: "test" | "real" = "test"
): Unsubscribe => {
  const hotspotsRef = collection(db, HOTSPOTS_COLLECTION);
  const q = query(hotspotsRef, limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const mockIds = new Set(MOCK_HOTSPOTS.map((m) => m.id));
        const loaded: TacticalHotspot[] = snapshot.docs
          .filter((docSnap) => (mode === "real" ? !mockIds.has(docSnap.id) : true))
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || "Hotspot Táctico",
              category: data.category || "cruising_area",
              address: data.address || "",
              activeVesselsCount: Math.max(0, Number(data.activeVesselsCount) || 0),
              coordinates: data.coordinates || { lat: -34.5885, lng: -58.4376 },
              geohash: data.geohash || "69y7pu2",
              description: data.description || "",
              isCheckedIn: false,
              status: (data.status as HotspotStatus) || "active",
              confirmationsCount: Number(data.confirmationsCount) || 0,
              confirmedByUserIds: Array.isArray(data.confirmedByUserIds) ? data.confirmedByUserIds : [],
              rating: Number(data.rating) || 0,
              ratingsCount: Number(data.ratingsCount) || 0,
              ratings: Array.isArray(data.ratings) ? data.ratings : [],
              reportsCount: Number(data.reportsCount) || 0,
              reports: Array.isArray(data.reports) ? data.reports : [],
              creatorUserId: data.creatorUserId || undefined,
              creatorAlias: data.creatorAlias || undefined,
              discretionLevel: data.discretionLevel || "high",
              bestHours: data.bestHours || undefined,
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });
        onUpdate(loaded);
      } else {
        if (mode === "real") {
          onUpdate([]);
        } else {
          // Sembrar datos iniciales solo en modo de prueba
          seedInitialHotspots();
          onUpdate(MOCK_HOTSPOTS);
        }
      }
    },
    (error) => {
      console.warn("Error escuchando hotspots en Firestore:", error);
      if (mode === "real") {
        onUpdate([]);
      } else {
        onUpdate(MOCK_HOTSPOTS);
      }
    }
  );
};

/**
 * Siembra los hotspots iniciales en Firestore
 */
export const seedInitialHotspots = async (): Promise<void> => {
  try {
    for (const spot of MOCK_HOTSPOTS) {
      const spotRef = doc(db, HOTSPOTS_COLLECTION, spot.id);
      await setDoc(
        spotRef,
        sanitizeForFirestore({
          ...spot,
          isCheckedIn: false,
        }),
        { merge: true }
      );
    }
  } catch (error) {
    console.warn("No se pudo sembrar hotspots iniciales en Firestore:", error);
  }
};

/**
 * Check-in anónimo atómico en un hotspot (Incrementa activeVesselsCount en la nube)
 */
export const checkInHotspotCloud = async (hotspotId: string): Promise<boolean> => {
  if (!hotspotId) return false;

  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    await updateDoc(spotRef, {
      activeVesselsCount: increment(1),
    });
    return true;
  } catch (error) {
    console.warn("Error en check-in en Firestore (modo offline/fallback):", error);
    return false;
  }
};

/**
 * Check-out anónimo atómico en un hotspot (Decrementa activeVesselsCount en la nube)
 */
export const checkOutHotspotCloud = async (hotspotId: string): Promise<boolean> => {
  if (!hotspotId) return false;

  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    await updateDoc(spotRef, {
      activeVesselsCount: increment(-1),
    });
    return true;
  } catch (error) {
    console.warn("Error en check-out en Firestore (modo offline/fallback):", error);
    return false;
  }
};

/**
 * Propone un nuevo punto táctico / cruising (inicia en estado 'proposed')
 */
export const proposeHotspotCloud = async (
  hotspot: TacticalHotspot
): Promise<boolean> => {
  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspot.id);
    await setDoc(
      spotRef,
      sanitizeForFirestore({
        ...hotspot,
        isCheckedIn: false,
      }),
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Error al proponer hotspot en Firestore (fallback local):", error);
    return false;
  }
};

/**
 * Confirma un lugar propuesto. Si alcanza 3 confirmaciones, pasa automáticamente a 'active'.
 */
export const confirmHotspotCloud = async (
  hotspotId: string,
  userId: string
): Promise<boolean> => {
  if (!hotspotId || !userId) return false;

  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    const snap = await getDoc(spotRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const confirmedByUserIds: string[] = Array.isArray(data.confirmedByUserIds)
      ? data.confirmedByUserIds
      : [];

    if (confirmedByUserIds.includes(userId)) {
      return false; // Ya confirmó previamente
    }

    const nextConfirmed = [...confirmedByUserIds, userId];
    const nextCount = nextConfirmed.length;
    const shouldActivate = data.status === "proposed" && nextCount >= 3;

    await updateDoc(spotRef, {
      confirmedByUserIds: nextConfirmed,
      confirmationsCount: nextCount,
      ...(shouldActivate ? { status: "active" } : {}),
    });

    return true;
  } catch (error) {
    console.warn("Error confirmando hotspot en Firestore (fallback local):", error);
    return false;
  }
};

/**
 * Califica un lugar con 1 a 5 estrellas y tags tácticos opcionales
 */
export const rateHotspotCloud = async (
  hotspotId: string,
  rating: HotspotRating
): Promise<boolean> => {
  if (!hotspotId || !rating.userId || rating.score < 1 || rating.score > 5) return false;

  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    const snap = await getDoc(spotRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const currentRatings: HotspotRating[] = Array.isArray(data.ratings) ? data.ratings : [];
    
    // Si el usuario ya calificó, actualizamos su voto
    const existingIdx = currentRatings.findIndex((r) => r.userId === rating.userId);
    let nextRatings: HotspotRating[];
    if (existingIdx >= 0) {
      nextRatings = [...currentRatings];
      nextRatings[existingIdx] = rating;
    } else {
      nextRatings = [...currentRatings, rating];
    }

    const totalSum = nextRatings.reduce((acc, r) => acc + r.score, 0);
    const nextAverage = Number((totalSum / nextRatings.length).toFixed(1));

    await updateDoc(spotRef, {
      ratings: nextRatings,
      ratingsCount: nextRatings.length,
      rating: nextAverage,
    });

    return true;
  } catch (error) {
    console.warn("Error calificando hotspot en Firestore (fallback local):", error);
    return false;
  }
};

/**
 * Registra una denuncia con justificación obligatoria. Si acumula 2+ pasa a 'flagged', si acumula 4+ pasa a 'suspended'.
 */
export const reportHotspotCloud = async (
  hotspotId: string,
  report: HotspotReport
): Promise<boolean> => {
  if (!hotspotId || !report.comment || report.comment.trim().length < 10) return false;

  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    const snap = await getDoc(spotRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const currentReports: HotspotReport[] = Array.isArray(data.reports) ? data.reports : [];
    const nextReports = [...currentReports, report];
    const nextCount = nextReports.length;

    let nextStatus: HotspotStatus = data.status || "active";
    if (nextCount >= 4) {
      nextStatus = "suspended";
    } else if (nextCount >= 2) {
      nextStatus = "flagged";
    }

    await updateDoc(spotRef, {
      reports: nextReports,
      reportsCount: nextCount,
      status: nextStatus,
    });

    return true;
  } catch (error) {
    console.warn("Error reportando hotspot en Firestore (fallback local):", error);
    return false;
  }
};

/**
 * Operación Admin: Cambiar directamente el estado de un hotspot
 */
export const adminUpdateHotspotStatusCloud = async (
  hotspotId: string,
  status: HotspotStatus
): Promise<boolean> => {
  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    await updateDoc(spotRef, { status });
    return true;
  } catch (error) {
    console.warn("Error actualizando estado admin de hotspot:", error);
    return false;
  }
};

/**
 * Operación Admin: Desestimar denuncias y restablecer estado a 'active'
 */
export const adminDismissReportsCloud = async (
  hotspotId: string
): Promise<boolean> => {
  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    await updateDoc(spotRef, {
      reports: [],
      reportsCount: 0,
      status: "active",
    });
    return true;
  } catch (error) {
    console.warn("Error desestimando denuncias de hotspot:", error);
    return false;
  }
};

/**
 * Operación Admin: Eliminar definitivamente un hotspot
 */
export const adminDeleteHotspotCloud = async (
  hotspotId: string
): Promise<boolean> => {
  try {
    const spotRef = doc(db, HOTSPOTS_COLLECTION, hotspotId);
    await deleteDoc(spotRef);
    return true;
  } catch (error) {
    console.warn("Error eliminando hotspot en Firestore:", error);
    return false;
  }
};
