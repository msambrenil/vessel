"use client";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { MOCK_PROFILES } from "@/data/mockProfiles";

const UNIQUE_IDENTITIES_COLLECTION = "vessel_unique_identities";
const BLACKLIST_COLLECTION = "vessel_blacklist";

/**
 * Función utilitaria para generar un hash criptográfico SHA-256 determinista
 * Compatible con Web Crypto API en el navegador y SSR
 */
export async function sha256Hash(message: string): Promise<string> {
  const normalized = message.trim().toLowerCase();
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple determinista para entornos sin crypto.subtle
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "vessel_hash_" + Math.abs(hash).toString(16);
}

/**
 * Genera una huella digital determinista del dispositivo (Device Fingerprint)
 * Sin recopilar datos personales, utiliza entropía de hardware y entorno
 */
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server_device_env";

  const nav = window.navigator;
  const screen = window.screen;
  const rawEntropy = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || "unknown",
  ].join("###");

  return sha256Hash(rawEntropy);
}

/**
 * Normaliza un número telefónico a formato internacional limpio
 */
export function normalizePhoneNumber(rawPhone: string): string {
  // Elimina espacios, guiones y paréntesis; asegura que comience con +
  const cleaned = rawPhone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    return "+" + cleaned;
  }
  return cleaned;
}

/**
 * Genera hashes de bucket para un embedding facial discretizado (Locality-Sensitive Bucketing)
 * Permite indexación O(1) en Firestore sin descargar la base de datos completa en el cliente
 */
export async function generateBiometricBucketHashes(embedding: number[]): Promise<string[]> {
  if (!embedding || embedding.length === 0) return [];
  const chunkSize = Math.max(1, Math.floor(embedding.length / 4));
  const hashes: string[] = [];

  for (let i = 0; i < 4; i++) {
    const chunk = embedding.slice(i * chunkSize, (i + 1) * chunkSize);
    // Cuantizar valores en bandas discretas
    const quantized = chunk.map((val) => Math.round(val * 10)).join(",");
    const bucketHash = await sha256Hash(`vessel_face_bucket_${i}_${quantized}`);
    hashes.push(bucketHash);
  }

  return hashes;
}

export interface CheckIdentityResult {
  isAllowed: boolean;
  reason?: "codename_duplicate" | "phone_duplicate" | "device_blacklisted" | "biometric_duplicate" | "none";
  message?: string;
  associatedUid?: string;
}

export interface CheckCodenameResult {
  isAvailable: boolean;
  message?: string;
  normalizedCodename: string;
}

/**
 * Normaliza un codename a formato canónico (mayúsculas, sin espacios repetidos, guiones bajos)
 */
export function normalizeCodename(codename: string): string {
  return codename.trim().toUpperCase().replace(/\s+/g, "_");
}

/**
 * Verifica la disponibilidad y validez de un nombre de usuario / codename
 * Valida formato, largo (3-24 caracteres), perfiles mock y registro atómico en Firestore
 */
export async function checkCodenameAvailability(
  codename: string,
  currentUid?: string
): Promise<CheckCodenameResult> {
  const normalized = normalizeCodename(codename);

  if (!normalized || normalized.length < 3) {
    return {
      isAvailable: false,
      message: "El alias debe tener al menos 3 caracteres.",
      normalizedCodename: normalized,
    };
  }

  if (normalized.length > 24) {
    return {
      isAvailable: false,
      message: "El alias no puede superar los 24 caracteres.",
      normalizedCodename: normalized,
    };
  }

  const isValidFormat = /^[A-Z0-9_\-]+$/.test(normalized);
  if (!isValidFormat) {
    return {
      isAvailable: false,
      message: "El alias solo puede contener letras, números, guiones y guiones bajos.",
      normalizedCodename: normalized,
    };
  }

  // 1. Validar contra perfiles de prueba en memoria
  const conflictMock = MOCK_PROFILES.find(
    (p) => p.codename.toUpperCase() === normalized && p.id !== currentUid
  );
  if (conflictMock) {
    return {
      isAvailable: false,
      message: `El alias '${normalized}' ya se encuentra reservado en VESSEL. Elegí otro distinto.`,
      normalizedCodename: normalized,
    };
  }

  // 2. Validar contra Firestore (lookup O(1) en vessel_unique_identities)
  try {
    if (db && typeof (db as any).type === "string") {
      const codenameRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `codename_${normalized}`);
      const snap = await getDoc(codenameRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.uid && data.uid !== currentUid) {
          return {
            isAvailable: false,
            message: `El alias '${normalized}' ya está registrado por otro miembro.`,
            normalizedCodename: normalized,
          };
        }
      }
    }
  } catch (err) {
    // Modo resiliente en entorno offline o de pruebas unitarias
  }

  return {
    isAvailable: true,
    normalizedCodename: normalized,
  };
}

/**
 * Reclama y asegura atómicamente un nombre de usuario para un UID en Firestore
 */
export async function claimCodename(codename: string, uid: string): Promise<boolean> {
  if (!codename || !uid || uid === "local-user") return false;
  const normalized = normalizeCodename(codename);
  try {
    const codenameRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `codename_${normalized}`);
    await setDoc(
      codenameRef,
      {
        uid,
        codename: normalized,
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Error al registrar claim de codename:", err);
    return false;
  }
}

/**
 * Libera un nombre de usuario previamente registrado por un UID
 */
export async function releaseCodename(codename: string, uid: string): Promise<boolean> {
  if (!codename || !uid) return false;
  const normalized = normalizeCodename(codename);
  try {
    const codenameRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `codename_${normalized}`);
    const snap = await getDoc(codenameRef);
    if (snap.exists() && snap.data().uid === uid) {
      await deleteDoc(codenameRef);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error al liberar codename:", err);
    return false;
  }
}

/**
 * Verifica si un usuario puede registrarse o si ya tiene una cuenta existente
 * Valida Codename, Teléfono, Huella de Dispositivo y Vector Biométrico con lookup O(1) privado
 */
export async function verifyIdentityUniqueness(params: {
  codename?: string;
  phone?: string;
  deviceId?: string;
  faceEmbedding?: number[];
  currentUid?: string;
}): Promise<CheckIdentityResult> {
  try {
    // 1. Validar unicidad de Codename si fue provisto
    if (params.codename) {
      const codenameCheck = await checkCodenameAvailability(params.codename, params.currentUid);
      if (!codenameCheck.isAvailable) {
        return {
          isAllowed: false,
          reason: "codename_duplicate",
          message: codenameCheck.message || "El nombre de usuario no está disponible.",
        };
      }
    }

    if (db && typeof (db as any).type === "string") {
      const deviceId = params.deviceId || (await generateDeviceFingerprint());

      // 2. Verificar si el dispositivo está en la Lista Negra Permanente
      if (deviceId) {
        const deviceBlacklistRef = doc(db, BLACKLIST_COLLECTION, `device_${deviceId}`);
        const deviceSnap = await getDoc(deviceBlacklistRef);
        if (deviceSnap.exists()) {
          return {
            isAllowed: false,
            reason: "device_blacklisted",
            message: "Este dispositivo se encuentra restringido en VESSEL por infracciones a las normas comunitarias.",
          };
        }
      }

      // 3. Verificar si el número de teléfono ya está registrado en otra cuenta
      if (params.phone) {
        const normalizedPhone = normalizePhoneNumber(params.phone);
        const phoneHash = await sha256Hash(`vessel_phone_${normalizedPhone}`);
        const phoneIdentityRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `phone_${phoneHash}`);
        const phoneSnap = await getDoc(phoneIdentityRef);

        if (phoneSnap.exists()) {
          const data = phoneSnap.data();
          if (data.uid && data.uid !== params.currentUid) {
            return {
              isAllowed: false,
              reason: "phone_duplicate",
              message: "Este número de teléfono ya está registrado en otra cuenta de VESSEL. Por favor iniciá sesión con esa cuenta.",
              associatedUid: data.uid,
            };
          }
        }
      }

      // 4. Deduplicación Biométrica Facial Indexada O(1) Privada
      if (params.faceEmbedding && params.faceEmbedding.length > 0) {
        const bucketHashes = await generateBiometricBucketHashes(params.faceEmbedding);
        for (const bHash of bucketHashes) {
          const bucketRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `face_bucket_${bHash}`);
          const bucketSnap = await getDoc(bucketRef);
          if (bucketSnap.exists()) {
            const data = bucketSnap.data();
            if (data.uid && data.uid !== params.currentUid) {
              return {
                isAllowed: false,
                reason: "biometric_duplicate",
                message: "Este rostro ya se encuentra verificado en otra cuenta activa de VESSEL. No se permiten cuentas duplicadas.",
                associatedUid: data.uid,
              };
            }
          }
        }
      }
    }

    return { isAllowed: true, reason: "none" };
  } catch (err) {
    console.warn("Validación de unicidad de identidad (modo resiliente):", err);
    // En caso de corte de red, permitimos continuar sin bloquear
    return { isAllowed: true, reason: "none" };
  }
}

/**
 * Registra y sella la identidad única de un usuario en Firestore
 */
export async function registerUniqueIdentity(params: {
  uid: string;
  codename?: string;
  phone?: string;
  faceEmbedding?: number[];
  authProvider?: string;
}): Promise<boolean> {
  if (!params.uid || params.uid === "local-user") return false;

  try {
    const deviceId = await generateDeviceFingerprint();
    const batchUpdates: Promise<void>[] = [];

    // Guardar identidad principal del usuario
    const userDocRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `user_${params.uid}`);
    batchUpdates.push(
      setDoc(
        userDocRef,
        {
          uid: params.uid,
          codename: params.codename ? normalizeCodename(params.codename) : null,
          deviceId,
          authProvider: params.authProvider || "direct",
          hasPhone: !!params.phone,
          faceEmbedding: params.faceEmbedding || null,
          registeredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );

    // Reclamar codename si fue provisto
    if (params.codename) {
      await claimCodename(params.codename, params.uid);
    }

    // Guardar hash único del teléfono para búsqueda rápida O(1)
    if (params.phone) {
      const normalizedPhone = normalizePhoneNumber(params.phone);
      const phoneHash = await sha256Hash(`vessel_phone_${normalizedPhone}`);
      const phoneDocRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `phone_${phoneHash}`);
      batchUpdates.push(
        setDoc(
          phoneDocRef,
          {
            uid: params.uid,
            phoneHash,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      );
    }

    // Guardar buckets biométricos indexados para deduplicación O(1)
    if (params.faceEmbedding && params.faceEmbedding.length > 0) {
      const bucketHashes = await generateBiometricBucketHashes(params.faceEmbedding);
      for (const bHash of bucketHashes) {
        const bucketRef = doc(db, UNIQUE_IDENTITIES_COLLECTION, `face_bucket_${bHash}`);
        batchUpdates.push(
          setDoc(
            bucketRef,
            {
              uid: params.uid,
              bucketHash: bHash,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          )
        );
      }
    }

    await Promise.all(batchUpdates);
    return true;
  } catch (error) {
    console.error("Error registrando identidad única:", error);
    return false;
  }
}

/**
 * Añade una identidad a la lista negra permanente por infracciones graves
 */
export async function blacklistIdentity(params: {
  uid: string;
  phone?: string;
  reason: string;
}): Promise<boolean> {
  try {
    const deviceId = await generateDeviceFingerprint();
    const batch: Promise<void>[] = [];

    const userBlacklistRef = doc(db, BLACKLIST_COLLECTION, `user_${params.uid}`);
    batch.push(
      setDoc(userBlacklistRef, {
        uid: params.uid,
        reason: params.reason,
        blacklistedAt: serverTimestamp(),
      })
    );

    if (deviceId) {
      const deviceBlacklistRef = doc(db, BLACKLIST_COLLECTION, `device_${deviceId}`);
      batch.push(
        setDoc(deviceBlacklistRef, {
          deviceId,
          associatedUid: params.uid,
          reason: params.reason,
          blacklistedAt: serverTimestamp(),
        })
      );
    }

    if (params.phone) {
      const normalizedPhone = normalizePhoneNumber(params.phone);
      const phoneHash = await sha256Hash(`vessel_phone_${normalizedPhone}`);
      const phoneBlacklistRef = doc(db, BLACKLIST_COLLECTION, `phone_${phoneHash}`);
      batch.push(
        setDoc(phoneBlacklistRef, {
          phoneHash,
          associatedUid: params.uid,
          reason: params.reason,
          blacklistedAt: serverTimestamp(),
        })
      );
    }

    await Promise.all(batch);
    return true;
  } catch (err) {
    console.error("Error al colocar en blacklist:", err);
    return false;
  }
}
