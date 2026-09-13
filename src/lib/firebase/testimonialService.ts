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
import { EncounterTestimonial, TestimonialStatus } from "@/types/vessel";

const TESTIMONIALS_COLLECTION = "vessel_testimonials";

/**
 * Publica un testimonio consensuado en Firestore
 */
export const submitTestimonialToCloud = async (
  targetProfileId: string,
  testimonial: Omit<EncounterTestimonial, "id">,
  authorUid: string
): Promise<string | null> => {
  if (!authorUid || authorUid === "local-user" || !targetProfileId) return null;

  try {
    const colRef = collection(db, TESTIMONIALS_COLLECTION);
    const docRef = await addDoc(
      colRef,
      sanitizeForFirestore({
        ...testimonial,
        authorUid,
        targetUid: targetProfileId,
        status: "pending",
        createdAtRaw: serverTimestamp(),
      })
    );
    return docRef.id;
  } catch (error) {
    console.warn("Error enviando testimonio a Firestore (modo local):", error);
    return null;
  }
};

/**
 * Escucha en tiempo real los testimonios recibidos por el usuario actual
 */
export const subscribeToReceivedTestimonials = (
  myUid: string,
  onUpdate: (testimonials: EncounterTestimonial[]) => void
): Unsubscribe => {
  if (!myUid || myUid === "local-user") {
    return () => {};
  }

  const colRef = collection(db, TESTIMONIALS_COLLECTION);
  const q = query(
    colRef,
    where("targetUid", "==", myUid),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const testimonials: EncounterTestimonial[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorId: data.authorUid || data.authorId || "anon",
          authorCodename: data.authorCodename || "Vessel",
          authorAvatar: data.authorAvatar || "",
          content: data.content || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || "Hoy",
          validationMethod: data.validationMethod || "rendezvous_pin",
          status: (data.status as TestimonialStatus) || "pending",
          encounterVerified: !!data.encounterVerified,
        };
      });
      onUpdate(testimonials);
    },
    (error) => {
      console.warn("Error escuchando testimonios en Firestore:", error);
    }
  );
};

/**
 * Actualiza el estado de un testimonio (aprobado, oculto, rechazado)
 */
export const updateTestimonialStatusCloud = async (
  testimonialId: string,
  status: TestimonialStatus
): Promise<boolean> => {
  if (!testimonialId || testimonialId.startsWith("test-")) return false;

  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonialId);
    await updateDoc(docRef, {
      status,
      updatedAtRaw: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn("Error actualizando estado de testimonio en Firestore:", error);
    return false;
  }
};
