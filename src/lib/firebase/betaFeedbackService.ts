"use client";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { BetaFeedbackReport, BetaReportStatus } from "@/types/vessel";
import { getActiveAppMode } from "@/lib/storage/localStorageSync";

const BETA_REPORTS_COLLECTION = "vessel_beta_reports";
const USERS_COLLECTION = "vessel_users";
const LOCAL_STORAGE_BETA_REPORTS_KEY = "vessel_local_beta_reports";

/**
 * Helper para persistencia local de reportes cuando Firestore está offline o en modo test
 */
const getLocalReports = (): BetaFeedbackReport[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_BETA_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalReports = (reports: BetaFeedbackReport[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_BETA_REPORTS_KEY, JSON.stringify(reports.slice(0, 100)));
  } catch {}
};

/**
 * Envía un nuevo reporte de feedback o bug de tester a Firestore
 */
export async function submitBetaFeedbackReport(
  params: Omit<BetaFeedbackReport, "id" | "createdAt" | "status">
): Promise<string> {
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const newReport: BetaFeedbackReport = {
    ...params,
    id: reportId,
    status: "new",
    createdAt: now,
  };

  // Guardar siempre copia local de resguardo
  const localList = getLocalReports();
  saveLocalReports([newReport, ...localList]);

  try {
    const docRef = doc(db, BETA_REPORTS_COLLECTION, reportId);
    await setDoc(
      docRef,
      sanitizeForFirestore({
        ...newReport,
        createdAtServer: serverTimestamp(),
      })
    );
    return reportId;
  } catch (err) {
    console.warn("[BetaFeedbackService] Error al persistir reporte en Firestore, resguardado localmente:", err);
    return reportId;
  }
}

/**
 * Escucha reactiva en tiempo real de todos los reportes de testers para la consola /admin
 */
export function subscribeToBetaReports(
  callback: (reports: BetaFeedbackReport[]) => void
): () => void {
  const mode = getActiveAppMode();

  if (mode !== "real") {
    callback(getLocalReports());
    return () => {};
  }

  try {
    const q = query(
      collection(db, BETA_REPORTS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports: BetaFeedbackReport[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          reports.push({
            id: docSnap.id,
            userId: data.userId || "anon",
            userCodename: data.userCodename || "Beta Tester",
            userAvatar: data.userAvatar || "",
            type: data.type || "bug",
            title: data.title || "Reporte sin título",
            description: data.description || "",
            currentPath: data.currentPath || "/",
            deviceInfo: data.deviceInfo || {
              userAgent: "Unknown",
              screenResolution: "Unknown",
            },
            recentLogs: data.recentLogs || [],
            status: data.status || "new",
            createdAt: data.createdAt || Date.now(),
            adminNotes: data.adminNotes || "",
          });
        });

        // Combinar con reportes locales no duplicados
        const local = getLocalReports();
        const combined = [...reports];
        for (const loc of local) {
          if (!combined.some((r) => r.id === loc.id)) {
            combined.push(loc);
          }
        }
        combined.sort((a, b) => b.createdAt - a.createdAt);
        callback(combined);
      },
      (err) => {
        console.warn("[BetaFeedbackService] Fallback a reportes locales por error de snapshot:", err);
        callback(getLocalReports());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("[BetaFeedbackService] No se pudo inicializar listener de reportes:", err);
    callback(getLocalReports());
    return () => {};
  }
}

/**
 * Actualiza el estado de un reporte de beta tester
 */
export async function updateBetaReportStatus(
  reportId: string,
  status: BetaReportStatus,
  adminNotes?: string
): Promise<void> {
  // Actualizar copia local
  const localList = getLocalReports().map((r) =>
    r.id === reportId ? { ...r, status, ...(adminNotes ? { adminNotes } : {}) } : r
  );
  saveLocalReports(localList);

  try {
    const docRef = doc(db, BETA_REPORTS_COLLECTION, reportId);
    await updateDoc(
      docRef,
      sanitizeForFirestore({
        status,
        ...(adminNotes ? { adminNotes } : {}),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (err) {
    console.warn("[BetaFeedbackService] Error al actualizar estado del reporte en Firestore:", err);
  }
}

/**
 * Asigna o revoca el rol de Beta Tester a un usuario
 */
export async function toggleUserBetaTesterStatus(
  userId: string,
  isBeta: boolean
): Promise<void> {
  if (!userId || userId === "unauthenticated" || userId === "local-user") return;

  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(
      userRef,
      sanitizeForFirestore({
        isBetaTester: isBeta,
        betaTesterRoleUpdatedAt: serverTimestamp(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn("[BetaFeedbackService] Error al actualizar rol de Beta Tester:", err);
  }
}

/**
 * Obtiene la lista de usuarios marcados como Beta Testers
 */
export async function fetchBetaTesters(): Promise<
  { uid: string; codename: string; avatarUrl?: string; lastActiveAt?: number; isVerified?: boolean }[]
> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where("isBetaTester", "==", true),
      limit(100)
    );
    const snap = await getDocs(q);
    const testers: { uid: string; codename: string; avatarUrl?: string; lastActiveAt?: number; isVerified?: boolean }[] = [];
    snap.forEach((d) => {
      const data = d.data();
      testers.push({
        uid: d.id,
        codename: data.codename || data.username || "Beta Tester",
        avatarUrl: data.avatarUrl || "",
        lastActiveAt: data.lastActiveAt || undefined,
        isVerified: data.verification?.isVerified || false,
      });
    });
    return testers;
  } catch (err) {
    console.warn("[BetaFeedbackService] Error al consultar beta testers:", err);
    return [];
  }
}
