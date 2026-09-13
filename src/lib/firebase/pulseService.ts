"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { ReceivedPulse } from "@/types/vessel";

const PULSES_COLLECTION = "vessel_pulses";

export interface CloudPulsePayload {
  toUid: string;
  fromUid: string;
  fromProfileId: string;
  isRead: boolean;
  returned: boolean;
  timestamp: string;
  createdAtRaw?: unknown;
}

/**
 * Envía un pulso en tiempo real a otro usuario a través de Firestore
 */
export const sendPulseToCloud = async (
  fromUid: string,
  fromProfileId: string,
  toProfileId: string
): Promise<string | null> => {
  if (!fromUid || fromUid === "local-user" || !toProfileId) return null;

  try {
    const pulsesRef = collection(db, PULSES_COLLECTION);
    const docRef = await addDoc(
      pulsesRef,
      sanitizeForFirestore({
        toUid: toProfileId,
        fromUid,
        fromProfileId,
        isRead: false,
        returned: false,
        timestamp: new Date().toISOString(),
        createdAtRaw: serverTimestamp(),
      })
    );
    return docRef.id;
  } catch (error) {
    console.warn("Error enviando pulso a Firestore (modo offline/fallback):", error);
    return null;
  }
};

/**
 * Escucha en tiempo real todos los pulsos entrantes dirigidos al usuario actual
 * Persistentes en la nube hasta que el usuario decida limpiarlos.
 */
export const subscribeToIncomingPulses = (
  myUid: string,
  onUpdate: (pulses: ReceivedPulse[]) => void
): Unsubscribe => {
  if (!myUid || myUid === "local-user") {
    return () => {};
  }

  const pulsesRef = collection(db, PULSES_COLLECTION);
  const q = query(
    pulsesRef,
    where("toUid", "==", myUid),
    orderBy("createdAtRaw", "desc"),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const pulses: ReceivedPulse[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          fromProfileId: data.fromProfileId || data.fromUid || "anon",
          timestamp: data.timestamp || new Date().toISOString(),
          isRead: !!data.isRead,
          returned: !!data.returned,
        };
      });
      onUpdate(pulses);
    },
    (error) => {
      console.warn("Error en suscripción de pulsos entrantes Firestore:", error);
    }
  );
};

/**
 * Marca un pulso como leído en Firestore
 */
export const markPulseReadInCloud = async (pulseId: string): Promise<boolean> => {
  if (!pulseId || pulseId.startsWith("pulse_") || pulseId.startsWith("mock_")) return false;

  try {
    const pulseRef = doc(db, PULSES_COLLECTION, pulseId);
    await updateDoc(pulseRef, {
      isRead: true,
      updatedAtRaw: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn("Error marcando pulso como leído en Firestore:", error);
    return false;
  }
};

/**
 * Marca un pulso como devuelto en Firestore
 */
export const returnPulseInCloud = async (pulseId: string): Promise<boolean> => {
  if (!pulseId || pulseId.startsWith("pulse_") || pulseId.startsWith("mock_")) return false;

  try {
    const pulseRef = doc(db, PULSES_COLLECTION, pulseId);
    await updateDoc(pulseRef, {
      returned: true,
      isRead: true,
      updatedAtRaw: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn("Error marcando pulso como devuelto en Firestore:", error);
    return false;
  }
};

/**
 * Elimina un pulso de la nube cuando el usuario lo descarta
 */
export const clearPulseInCloud = async (pulseId: string): Promise<boolean> => {
  if (!pulseId || pulseId.startsWith("pulse_") || pulseId.startsWith("mock_")) return false;

  try {
    const pulseRef = doc(db, PULSES_COLLECTION, pulseId);
    await deleteDoc(pulseRef);
    return true;
  } catch (error) {
    console.warn("Error eliminando pulso en Firestore:", error);
    return false;
  }
};
