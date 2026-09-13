"use client";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  limit,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { TacticalHotspot } from "@/types/vessel";
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
  const q = query(hotspotsRef, limit(30));

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const loaded: TacticalHotspot[] = snapshot.docs.map((docSnap) => {
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
            isCheckedIn: false, // El estado local del usuario se fusiona en el contexto
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
