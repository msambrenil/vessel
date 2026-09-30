"use client";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";

const INVITES_COLLECTION = "vessel_invites";
const USERS_COLLECTION = "vessel_users";

export const VIP_VERIFIED_STORAGE_KEY = "vessel_vip_verified_v1";
export const VIP_PENDING_CODE_STORAGE_KEY = "vessel_pending_vip_code";

/**
 * Códigos VIP maestros pre-autorizados para acceso inmediato del fundador y tanda inicial de Beta Testers
 */
export const MASTER_VIP_CODES = new Set<string>([
  "VESSEL-VIP",
  "VESSEL-FOUNDER",
  "VESSEL-BETA",
  "VESSEL-2026",
  "VESSEL-BA",
]);

export interface VipInviteRecord {
  code: string;
  maxUses: number;
  usesCount: number;
  isActive: boolean;
  note?: string;
  createdBy?: string;
  createdAt?: string;
  redeemedByUids?: string[];
}

export interface VipValidationResult {
  isValid: boolean;
  code: string;
  error?: string;
  isMasterCode?: boolean;
}

/**
 * Normaliza el código VIP (mayúsculas, sin espacios laterales)
 */
export function normalizeVipCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "-");
}

/**
 * Verifica si el código cumple con el patrón de serie numerada oficial (ej: VESSEL-VIP-01 a VESSEL-VIP-99)
 */
function isOfficialNumberedVipCode(code: string): boolean {
  return /^VESSEL-(VIP|BETA)-\d{1,3}$/.test(code);
}

/**
 * Comprueba si el dispositivo/usuario actual ya cuenta con un Pase VIP validado
 */
export function getLocalVipVerification(uid?: string): { verified: boolean; code: string | null } {
  if (typeof window === "undefined") return { verified: false, code: null };
  try {
    const raw = window.localStorage.getItem(VIP_VERIFIED_STORAGE_KEY);
    if (!raw) return { verified: false, code: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.verified && parsed.code) {
      if (!uid || !parsed.uid || parsed.uid === uid || parsed.uid === "pending_auth") {
        return { verified: true, code: parsed.code };
      }
    }
  } catch {}
  return { verified: false, code: null };
}

/**
 * Persiste localmente el estado de verificación VIP
 */
export function saveLocalVipVerification(code: string, uid: string = "pending_auth"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      VIP_VERIFIED_STORAGE_KEY,
      JSON.stringify({
        verified: true,
        code: normalizeVipCode(code),
        uid,
        verifiedAt: new Date().toISOString(),
      })
    );
    window.localStorage.removeItem(VIP_PENDING_CODE_STORAGE_KEY);
  } catch {}
}

/**
 * Obtiene cualquier código VIP recibido por parámetro URL (?vip=CODIGO) pendiente de canje
 */
export function getPendingUrlVipCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlVip = params.get("vip") || params.get("invite");
    if (urlVip) {
      const clean = normalizeVipCode(urlVip);
      window.localStorage.setItem(VIP_PENDING_CODE_STORAGE_KEY, clean);
      return clean;
    }
    return window.localStorage.getItem(VIP_PENDING_CODE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Valida y canjea un código VIP contra códigos maestros y la colección vessel_invites en Firestore
 */
export async function validateAndRedeemVipCode(
  rawCode: string,
  uid?: string
): Promise<VipValidationResult> {
  const code = normalizeVipCode(rawCode);

  if (!code || code.length < 4) {
    return {
      isValid: false,
      code,
      error: "Ingresá un código VIP válido (ej. VESSEL-VIP).",
    };
  }

  const isPreAuthorized = MASTER_VIP_CODES.has(code) || isOfficialNumberedVipCode(code);

  try {
    const inviteRef = doc(db, INVITES_COLLECTION, code);
    const snap = await getDoc(inviteRef);

    if (snap.exists()) {
      const data = snap.data() as VipInviteRecord;
      if (data.isActive === false) {
        return {
          isValid: false,
          code,
          error: "Este código VIP fue revocado o desactivado.",
        };
      }

      const alreadyRedeemedByMe = uid && Array.isArray(data.redeemedByUids) && data.redeemedByUids.includes(uid);
      if (!alreadyRedeemedByMe && data.maxUses > 0 && data.usesCount >= data.maxUses) {
        return {
          isValid: false,
          code,
          error: "Este código VIP ya alcanzó su límite máximo de invitaciones.",
        };
      }

      // Registrar redención si tenemos UID autenticado
      if (uid && uid !== "local-user" && uid !== "unauthenticated" && !alreadyRedeemedByMe) {
        await setDoc(
          inviteRef,
          sanitizeForFirestore({
            usesCount: increment(1),
            redeemedByUids: arrayUnion(uid),
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        );
      }

      if (uid && uid !== "local-user" && uid !== "unauthenticated") {
        await setDoc(
          doc(db, USERS_COLLECTION, uid),
          sanitizeForFirestore({
            vipVerified: true,
            vipCode: code,
            vipVerifiedAt: serverTimestamp(),
          }),
          { merge: true }
        );
      }

      saveLocalVipVerification(code, uid);
      return { isValid: true, code };
    }

    // Si no existe documento previo en Firestore pero es un código maestro o serie oficial VESSEL-VIP-XX
    if (isPreAuthorized) {
      if (uid && uid !== "local-user" && uid !== "unauthenticated") {
        await setDoc(
          inviteRef,
          sanitizeForFirestore({
            code,
            maxUses: 50,
            usesCount: 1,
            isActive: true,
            note: "Auto-seeded Official VIP Code",
            createdAt: new Date().toISOString(),
            redeemedByUids: [uid],
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        ).catch(() => {});

        await setDoc(
          doc(db, USERS_COLLECTION, uid),
          sanitizeForFirestore({
            vipVerified: true,
            vipCode: code,
            vipVerifiedAt: serverTimestamp(),
          }),
          { merge: true }
        ).catch(() => {});
      }

      saveLocalVipVerification(code, uid);
      return { isValid: true, code, isMasterCode: true };
    }

    return {
      isValid: false,
      code,
      error: "Código VIP inválido o no asignado. Solicitá tu pase al fundador.",
    };
  } catch (err) {
    // Modo resiliente ante restricciones de red si es un código oficial pre-autorizado
    if (isPreAuthorized) {
      saveLocalVipVerification(code, uid);
      return { isValid: true, code, isMasterCode: true };
    }
    return {
      isValid: false,
      code,
      error: "No se pudo verificar el código VIP. Comprobá tu conexión o usá tu código asignado.",
    };
  }
}

/**
 * Crea un nuevo código VIP personalizado en Firestore para asignar a beta testers
 */
export async function createVipInviteCode(params: {
  code: string;
  maxUses?: number;
  note?: string;
  createdByUid?: string;
}): Promise<{ success: boolean; code: string; shareUrl: string; error?: string }> {
  const code = normalizeVipCode(params.code);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://vessel.app";
  const shareUrl = `${origin}/?vip=${encodeURIComponent(code)}`;

  try {
    const inviteRef = doc(db, INVITES_COLLECTION, code);
    await setDoc(
      inviteRef,
      sanitizeForFirestore({
        code,
        maxUses: params.maxUses ?? 10,
        usesCount: 0,
        isActive: true,
        note: params.note || "Beta Tester VIP",
        createdBy: params.createdByUid || "founder",
        createdAt: new Date().toISOString(),
        redeemedByUids: [],
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    );
    return { success: true, code, shareUrl };
  } catch (err: any) {
    return {
      success: false,
      code,
      shareUrl,
      error: err?.message || "No se pudo guardar en Firestore, pero podés usar VESSEL-VIP-01..99.",
    };
  }
}

/**
 * Lista los códigos VIP creados en Firestore
 */
export async function listVipInviteCodes(): Promise<VipInviteRecord[]> {
  try {
    const q = query(collection(db, INVITES_COLLECTION), orderBy("createdAt", "desc"), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VipInviteRecord);
  } catch {
    return [];
  }
}
