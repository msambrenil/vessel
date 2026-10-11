"use client";

import {
  StaffMember,
  StaffRole,
  ModerationReport,
  AdminAuditLogEntry,
  AdminDashboardMetrics,
  GlobalQuotaSettings,
  ManagedUserProfile,
  UserModerationStatus,
} from "@/types/admin";
import { RoleType, UserSubscriptionTier } from "@/types/vessel";
import { MOCK_PROFILES } from "@/data/mockProfiles";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  getActiveAppMode,
  AppMode,
} from "@/lib/storage/localStorageSync";
import { VesselProfile } from "@/types/vessel";
import { isGhostOrMockProfile } from "@/lib/firebase/matrixService";
import { DEFAULT_FALLBACK_COORDINATES } from "@/lib/geo/GeospatialEngine";
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/firestoreSanitizer";

export const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  {
    id: "staff-01",
    name: "ALEX // COMMAND_ROOT",
    email: "admin@vessel.network",
    role: "superadmin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    lastLoginAt: "En línea",
    notes: "Superadministrador General con acceso sin restricciones a métricas, personal y cuotas.",
  },
  {
    id: "staff-02",
    name: "VAL // TRUST_LEAD",
    email: "moderation@vessel.network",
    role: "moderator",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    isActive: true,
    createdAt: "2026-02-01T14:30:00Z",
    lastLoginAt: "Hace 5m",
    notes: "Oficial de Confianza, Biometría y Verificación de Identidad Facial.",
  },
  {
    id: "staff-03",
    name: "LEO // CARE_SPECIALIST",
    email: "support@vessel.network",
    role: "support",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    isActive: true,
    createdAt: "2026-03-15T09:15:00Z",
    lastLoginAt: "Hace 12m",
    notes: "Especialista en Soporte al Usuario, Membresías y Asistencia de Encuentros.",
  },
];

export const DEFAULT_QUOTA_SETTINGS: GlobalQuotaSettings = {
  maxPublicAlbumsFree: 1,
  maxPrivateAlbumsFree: 1,
  maxPhotosPerAlbumFree: 10,
  maxFreeRadarDistanceMeters: 1000,
  maxBioLengthFree: 280,
  canUseVideoFree: false,
  respectKarmaBoostThreshold: 85,
};

export const INITIAL_MOCK_REPORTS: ModerationReport[] = [
  {
    id: "rep-001",
    reporterId: "usr-002",
    reporterCodename: "BRUNO // VERS",
    reporterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    reportedUserId: "usr-005",
    reportedUserCodename: "DAMIÁN // SUB",
    reportedUserAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    reason: "ghosting_abuse",
    details: "Acordamos un encuentro en Palermo, validamos Rendezvous PIN y luego me bloqueó de improviso sin usar el protocolo No-Ghost.",
    status: "pending",
    createdAt: "Hoy, 00:45",
    chatSnippet: '"Ya estoy en la esquina del bar con el saco negro..." (Sin respuesta posterior)',
  },
  {
    id: "rep-002",
    reporterId: "usr-001",
    reporterCodename: "MATÍAS // TOP",
    reporterAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    reportedUserId: "usr-004",
    reportedUserCodename: "SANTIAGO // LEATHER",
    reportedUserAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80",
    reason: "catfish_fake_photos",
    details: "Las fotos de la bóveda parecen ser de otra persona pública en redes. Solicito verificación biométrica 3D obligatoria.",
    status: "investigating",
    createdAt: "Ayer, 22:10",
  },
];

export const INITIAL_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "Hoy, 01:15",
    operatorId: "staff-01",
    operatorName: "ALEX // COMMAND_ROOT",
    operatorRole: "superadmin",
    action: "STAFF_CREATED",
    details: "Inicialización del sistema de consola táctica VESSEL OPS.",
  },
  {
    id: "aud-002",
    timestamp: "Hoy, 00:30",
    operatorId: "staff-02",
    operatorName: "VAL // TRUST_LEAD",
    operatorRole: "moderator",
    action: "USER_VERIFIED",
    targetUserId: "usr-001",
    targetUserCodename: "MATÍAS // TOP",
    details: "Aprobación de verificación biométrica 3D con 99.8% de confianza facial.",
  },
];

/* -------------------------------------------------------------
 * GESTIÓN DE PERSONAL & SESIÓN (RBAC) & AUTORIZACIÓN
 * ------------------------------------------------------------- */

/**
 * Valida si un email o passcode cuenta con autorización para acceder a la consola administrativa.
 * En producción/modo real, un passcode maestro válido (NEXT_PUBLIC_ADMIN_PASSCODE)
 * o un email verificado en la lista blanca de administradores otorgan acceso.
 */
export const checkIsAdminAuthorized = (
  userEmail?: string | null,
  passcode?: string | null
): boolean => {
  const configuredPasscode = (process.env.ADMIN_MASTER_PASSCODE)?.trim();

  // Si se provee passcode y coincide con la clave maestra configurada (entornos de servidor o tests), autorizar
  if (passcode && configuredPasscode && passcode.trim() === configuredPasscode) {
    return true;
  }

  const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  const allowedEmails = envEmails
    ? envEmails.split(",").map((e) => e.trim().toLowerCase())
    : ["admin@vessel.network", "ojitos@vessel.app", "msambrenil@gmail.com"];

  return Boolean(
    userEmail && allowedEmails.includes(userEmail.trim().toLowerCase())
  );
};

/**
 * Verificación asíncrona segura de clave maestra delegada al Route Handler del servidor (P0).
 * Previene la fuga de credenciales en el bundle JavaScript del navegador cliente.
 */
export const verifyAdminPasscodeSecurely = async (passcode: string): Promise<boolean> => {
  if (!passcode || !passcode.trim()) return false;

  // En entornos de testing/SSR sin endpoint activo o en Node:
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return checkIsAdminAuthorized(null, passcode);
  }

  try {
    const res = await fetch("/api/admin/verify-passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: passcode.trim() }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      return Boolean(data?.authorized);
    }
    return false;
  } catch (err) {
    console.warn("[adminService] Fallback de verificación segura:", err);
    return checkIsAdminAuthorized(null, passcode);
  }
};

export const STAFF_COLLECTION = "vessel_staff";

export const getStaffMembers = (
  mode: AppMode = getActiveAppMode(),
  authUser?: { uid?: string; email?: string | null; displayName?: string | null } | null
): StaffMember[] => {
  if (mode === "real") {
    const realStaff = loadFromStorage<StaffMember[]>(STORAGE_KEYS.STAFF_MEMBERS, [], "real");
    const filteredReal = (realStaff || []).filter(
      (s) => s.id !== "staff-01" && s.id !== "staff-02" && s.id !== "staff-03"
    );

    if (filteredReal.length > 0) {
      return filteredReal;
    }

    // Inicialización del Fundador como Superadmin principal en Modo Real
    const founderEmail = authUser?.email || "msambrenil@gmail.com";
    const founderName =
      authUser?.displayName?.toUpperCase() ||
      `${founderEmail.split("@")[0].toUpperCase()} // COMMAND_ROOT`;
    const founderId = authUser?.uid || "staff-founder-01";

    const initialFounderStaff: StaffMember[] = [
      {
        id: founderId,
        name: founderName,
        email: founderEmail.toLowerCase(),
        role: "superadmin",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: "En línea",
        notes: "Superadministrador Principal y Fundador del Sistema VESSEL.",
      },
    ];

    saveToStorage(STORAGE_KEYS.STAFF_MEMBERS, initialFounderStaff, "real");
    if (typeof window !== "undefined") {
      setDoc(
        doc(db, STAFF_COLLECTION, founderId),
        sanitizeForFirestore(initialFounderStaff[0]),
        { merge: true }
      ).catch(() => {});
    }

    return initialFounderStaff;
  }

  // Modo Prueba: Personal de demostración
  return loadFromStorage<StaffMember[]>(
    STORAGE_KEYS.STAFF_MEMBERS,
    DEFAULT_STAFF_MEMBERS,
    "test"
  );
};

export const saveStaffMembers = (
  staff: StaffMember[],
  mode: AppMode = getActiveAppMode()
): void => {
  saveToStorage(STORAGE_KEYS.STAFF_MEMBERS, staff, mode);

  if (mode === "real" && typeof window !== "undefined") {
    for (const member of staff) {
      const staffRef = doc(db, STAFF_COLLECTION, member.id);
      setDoc(staffRef, sanitizeForFirestore(member), { merge: true }).catch((err) =>
        console.warn("[VESSEL Admin] Error sincronizando miembro de staff en Firestore:", err)
      );
    }
  }
};

/**
 * Carga los miembros reales del equipo desde Firestore en segundo plano
 */
export const fetchRealStaffFromCloud = async (): Promise<StaffMember[]> => {
  if (typeof window === "undefined") return [];
  try {
    const q = collection(db, STAFF_COLLECTION);
    const snap = await getDocs(q);
    if (!snap.empty) {
      const cloudStaff = snap.docs.map((d) => d.data() as StaffMember);
      saveToStorage(STORAGE_KEYS.STAFF_MEMBERS, cloudStaff, "real");
      return cloudStaff;
    }
  } catch (err) {
    console.warn("[VESSEL Admin] Lectura de personal desde Firestore:", err);
  }
  return [];
};

export const getActiveStaffSession = (
  mode: AppMode = getActiveAppMode(),
  authUser?: { uid?: string; email?: string | null } | null
): StaffMember => {
  const staffList = getStaffMembers(mode, authUser);

  if (mode === "real" && authUser) {
    // Si el usuario autenticado coincide con un miembro del staff, asignarlo de forma prioritaria
    const me = staffList.find(
      (s) =>
        (authUser.email && s.email.toLowerCase() === authUser.email.toLowerCase()) ||
        (authUser.uid && s.id === authUser.uid)
    );
    if (me) return me;
  }

  const savedStaffId = loadFromStorage<string | null>(STORAGE_KEYS.STAFF_SESSION, null, mode);
  if (savedStaffId) {
    const found = staffList.find((s) => s.id === savedStaffId);
    if (found) return found;
  }

  return staffList[0] || DEFAULT_STAFF_MEMBERS[0];
};

export const setActiveStaffSession = (
  staffId: string,
  mode: AppMode = getActiveAppMode()
): StaffMember => {
  const staffList = getStaffMembers(mode);
  const target = staffList.find((s) => s.id === staffId) || staffList[0];
  saveToStorage(STORAGE_KEYS.STAFF_SESSION, target.id, mode);
  return target;
};

/* -------------------------------------------------------------
 * REGISTRO DE AUDITORÍA (AUDIT TRAIL)
 * ------------------------------------------------------------- */

export const getAdminAuditLogs = (mode: "test" | "real" = getActiveAppMode()): AdminAuditLogEntry[] => {
  if (mode === "real") {
    const realLogs = loadFromStorage<AdminAuditLogEntry[]>(STORAGE_KEYS.ADMIN_AUDIT, [], "real");
    return (realLogs || []).filter((l) => l.id !== "aud-001" && l.id !== "aud-002");
  }
  return loadFromStorage<AdminAuditLogEntry[]>(STORAGE_KEYS.ADMIN_AUDIT, INITIAL_AUDIT_LOGS, "test");
};

export const logAdminAction = (
  entry: Omit<AdminAuditLogEntry, "id" | "timestamp">
): AdminAuditLogEntry => {
  const mode = getActiveAppMode();
  const currentLogs = getAdminAuditLogs(mode);
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const newEntry: AdminAuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: `Hoy, ${timeStr}`,
  };

  const updated = [newEntry, ...currentLogs.slice(0, 199)];
  saveToStorage(STORAGE_KEYS.ADMIN_AUDIT, updated, mode);
  return newEntry;
};

/* -------------------------------------------------------------
 * REPORTES DE MODERACIÓN
 * ------------------------------------------------------------- */

export const getModerationReports = (mode: "test" | "real" = getActiveAppMode()): ModerationReport[] => {
  if (mode === "real") {
    const realReports = loadFromStorage<ModerationReport[]>(STORAGE_KEYS.ADMIN_REPORTS, [], "real");
    return (realReports || []).filter((r) => r.id !== "rep-001" && r.id !== "rep-002");
  }
  return loadFromStorage<ModerationReport[]>(STORAGE_KEYS.ADMIN_REPORTS, INITIAL_MOCK_REPORTS, "test");
};

export const saveModerationReports = (reports: ModerationReport[]): void => {
  saveToStorage(STORAGE_KEYS.ADMIN_REPORTS, reports, getActiveAppMode());
};

export const updateReportStatus = (
  reportId: string,
  newStatus: ModerationReport["status"],
  actionTaken: string,
  notes: string,
  operator: StaffMember
): ModerationReport | null => {
  const mode = getActiveAppMode();
  const reports = getModerationReports(mode);
  const index = reports.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const target = reports[index];
  const updatedReport: ModerationReport = {
    ...target,
    status: newStatus,
    actionTaken,
    resolutionNotes: notes,
    resolvedAt: "Hoy, ahora",
    resolvedByStaffId: operator.id,
    resolvedByStaffName: operator.name,
  };

  reports[index] = updatedReport;
  saveModerationReports(reports);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: newStatus === "dismissed" ? "REPORT_DISMISSED" : "REPORT_RESOLVED",
    targetUserId: target.reportedUserId,
    targetUserCodename: target.reportedUserCodename,
    details: `Reporte ${reportId} marcado como '${newStatus}'. Acción: ${actionTaken}. Notas: ${notes}`,
  });

  return updatedReport;
};

/* -------------------------------------------------------------
 * CONFIGURACIÓN DE CUOTAS GLOBALES
 * ------------------------------------------------------------- */

export const getGlobalQuotaSettings = (): GlobalQuotaSettings => {
  return loadFromStorage<GlobalQuotaSettings>(STORAGE_KEYS.QUOTA_SETTINGS, DEFAULT_QUOTA_SETTINGS);
};

export const saveGlobalQuotaSettings = (
  settings: GlobalQuotaSettings,
  operator: StaffMember
): void => {
  saveToStorage(STORAGE_KEYS.QUOTA_SETTINGS, settings);
  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "QUOTA_SETTINGS_UPDATED",
    details: `Cuotas actualizadas: Radar Free=${settings.maxFreeRadarDistanceMeters}m, Álbumes Free=${settings.maxPublicAlbumsFree}/${settings.maxPrivateAlbumsFree}`,
  });
};

/* -------------------------------------------------------------
 * GESTIÓN DE USUARIOS (MANAGED PROFILES)
 * ------------------------------------------------------------- */

/**
 * Determina si un ID de perfil pertenece a un usuario ficticio, mock o de prueba.
 * En Modo Real, NINGUNO de estos perfiles debe aparecer en la consola del administrador.
 */
export const isTestOrMockProfileId = (id?: string | null): boolean => {
  if (!id) return true;
  const cleanId = id.trim();
  if (
    cleanId === "local-user" ||
    cleanId === "unauthenticated" ||
    cleanId === "me" ||
    cleanId.startsWith("mock_") ||
    cleanId.startsWith("mock-") ||
    cleanId.startsWith("test-") ||
    cleanId.startsWith("usr-mock-") ||
    cleanId.startsWith("usr-") ||
    cleanId.startsWith("vessel-")
  ) {
    return true;
  }
  return MOCK_PROFILES.some((m) => m.id === cleanId);
};

/**
 * Determina si un perfil pertenece a un usuario ficticio, mock o de prueba,
 * evaluando rigurosamente su ID, codename, fotos de stock y coordenadas geográficas.
 * En Modo Real, NINGUNO de estos perfiles debe aparecer en la consola del administrador.
 */
export const isTestOrMockProfile = (
  p?: Partial<VesselProfile | ManagedUserProfile> | null
): boolean => {
  if (!p) return true;
  if (isTestOrMockProfileId(p.id)) return true;
  const code = (p.codename || "").trim().toUpperCase();
  if (
    code === "VESSEL_USER" ||
    code === "VESSEL_TOP" ||
    code === "VESSEL_VERS" ||
    code === "VESSEL_BOT" ||
    code === "VESSEL" ||
    code.startsWith("MOCK") ||
    code.startsWith("TEST_")
  ) {
    return true;
  }
  return isGhostOrMockProfile(p);
};

/**
 * Registro de IDs de usuarios eliminados definitivamente por administradores (Tombstones).
 * Previene que perfiles cacheados en localStorage o en memoria revivan usuarios eliminados.
 */
export const getDeletedUserIds = (mode: AppMode = getActiveAppMode()): string[] => {
  return loadFromStorage<string[]>(STORAGE_KEYS.DELETED_USER_IDS, [], mode) || [];
};

export const recordDeletedUserId = (userId: string, mode: AppMode = getActiveAppMode()): void => {
  if (!userId) return;
  const current = getDeletedUserIds(mode);
  if (!current.includes(userId)) {
    const updated = [...current, userId];
    saveToStorage(STORAGE_KEYS.DELETED_USER_IDS, updated, mode);
  }
};

export const isDeletedUserId = (userId?: string | null, mode: AppMode = getActiveAppMode()): boolean => {
  if (!userId) return false;
  const list = getDeletedUserIds(mode);
  return list.includes(userId);
};

export const getManagedProfiles = (
  mode: "test" | "real" = getActiveAppMode(),
  liveRealProfiles: VesselProfile[] = []
): ManagedUserProfile[] => {
  const deletedIds = new Set(getDeletedUserIds(mode));

  if (mode === "real") {
    const savedRealOverrides = loadFromStorage<ManagedUserProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "real");
    const userMap = new Map<string, ManagedUserProfile>();

    // 1. Cargar todos los usuarios reales persistidos en almacenamiento local (filtrando mocks residuales y eliminados)
    for (const item of savedRealOverrides || []) {
      if (item && item.id && !isTestOrMockProfile(item) && !deletedIds.has(item.id)) {
        userMap.set(item.id, item);
      }
    }

    // 2. Fusionar con perfiles reales en vivo sin descartar a los desconectados (filtrando eliminados)
    for (const p of liveRealProfiles) {
      if (!p || !p.id || isTestOrMockProfile(p) || deletedIds.has(p.id)) {
        continue;
      }
      const existing = userMap.get(p.id);
      userMap.set(p.id, {
        ...existing,
        ...p,
        avatarUrl: p.avatarUrl || existing?.avatarUrl || "",
        moderationStatus: existing?.moderationStatus || "active",
        moderationNotes: existing?.moderationNotes || [],
        forcedFogMode: existing?.forcedFogMode ?? p.isFogMode ?? false,
      });
    }

    const cleanReal = Array.from(userMap.values()).filter((u) => !isTestOrMockProfile(u) && !deletedIds.has(u.id));
    // Auto-sanitizar el storage local en caso de que hayan quedado mocks cacheados o usuarios eliminados
    saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, cleanReal, "real");
    return cleanReal;
  }

  const custom = loadFromStorage<ManagedUserProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "test");
  if (!custom || custom.length === 0) {
    return MOCK_PROFILES.filter((p) => !deletedIds.has(p.id)).map((p) => ({
      ...p,
      moderationStatus: "active",
      moderationNotes: [],
      forcedFogMode: p.isFogMode || false,
    }));
  }

  const merged: ManagedUserProfile[] = custom.filter((p) => !deletedIds.has(p.id));

  for (const m of MOCK_PROFILES) {
    if (!deletedIds.has(m.id) && !merged.some((p) => p.id === m.id)) {
      merged.push({
        ...m,
        moderationStatus: "active",
        moderationNotes: [],
        forcedFogMode: m.isFogMode || false,
      });
    }
  }

  return merged;
};

/**
 * Carga todos los usuarios reales persistentes registrados en Firestore (sin expiración por TTL)
 */
export const fetchRealUsersFromCloud = async (): Promise<ManagedUserProfile[]> => {
  if (typeof window === "undefined" || !db) return [];
  try {
    const deletedIds = new Set(getDeletedUserIds("real"));
    const profilesCol = collection(db, "vessel_profiles");
    const snap = await getDocs(profilesCol);
    if (!snap.empty) {
      const savedRealOverrides = loadFromStorage<ManagedUserProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "real");
      const overrideMap = new Map<string, ManagedUserProfile>();
      for (const item of savedRealOverrides || []) {
        if (item && item.id && !isTestOrMockProfile(item) && !deletedIds.has(item.id)) overrideMap.set(item.id, item);
      }

      const users: ManagedUserProfile[] = [];
      snap.docs.forEach((docSnap) => {
        const data = docSnap.data() as VesselProfile;
        const id = data.id || docSnap.id;
        // Ignorar estrictamente perfiles mock/dev de pruebas locales y usuarios eliminados
        if (isTestOrMockProfile(data) || isTestOrMockProfileId(id) || deletedIds.has(id)) {
          return;
        }
        const override = overrideMap.get(id);
        users.push({
          ...override,
          ...data,
          id,
          codename: data.codename || override?.codename || "USUARIO",
          role: data.role || override?.role || "Versátil",
          bodyState: data.bodyState || override?.bodyState || "open",
          distanceMeters: data.distanceMeters ?? override?.distanceMeters ?? 0,
          intensity: data.intensity ?? override?.intensity ?? 2,
          kinks: data.kinks || override?.kinks || [],
          coordinates: data.coordinates || override?.coordinates || DEFAULT_FALLBACK_COORDINATES,
          avatarUrl: data.avatarUrl || override?.avatarUrl || "",
          moderationStatus: override?.moderationStatus || "active",
          moderationNotes: override?.moderationNotes || [],
          forcedFogMode: override?.forcedFogMode ?? data.isFogMode ?? false,
        });
      });

      for (const [id, override] of overrideMap.entries()) {
        if (!isTestOrMockProfile(override) && !deletedIds.has(id) && !users.some((u) => u.id === id)) {
          users.push(override);
        }
      }

      const cleanUsers = users.filter((u) => !isTestOrMockProfile(u) && !deletedIds.has(u.id));
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, cleanUsers, "real");
      return cleanUsers;
    }
  } catch (err) {
    console.warn("[VESSEL Admin] Error al obtener usuarios reales desde Firestore:", err);
  }
  return [];
};

/**
 * Escucha en tiempo real todos los usuarios registrados en Firestore para el panel de administración
 */
export const subscribeToRealUsersForAdmin = (
  onUpdate: (users: ManagedUserProfile[]) => void
): Unsubscribe => {
  if (typeof window === "undefined" || !db) return () => {};
  const profilesCol = collection(db, "vessel_profiles");
  return onSnapshot(
    profilesCol,
    (snapshot) => {
      const deletedIds = new Set(getDeletedUserIds("real"));
      const savedRealOverrides = loadFromStorage<ManagedUserProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "real");
      const overrideMap = new Map<string, ManagedUserProfile>();
      for (const item of savedRealOverrides || []) {
        if (item && item.id && !isTestOrMockProfile(item) && !deletedIds.has(item.id)) overrideMap.set(item.id, item);
      }

      const users: ManagedUserProfile[] = [];
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as VesselProfile;
        const id = data.id || docSnap.id;
        if (isTestOrMockProfile(data) || isTestOrMockProfileId(id) || deletedIds.has(id)) {
          return;
        }
        const override = overrideMap.get(id);
        users.push({
          ...override,
          ...data,
          id,
          codename: data.codename || override?.codename || "USUARIO",
          role: data.role || override?.role || "Versátil",
          bodyState: data.bodyState || override?.bodyState || "open",
          distanceMeters: data.distanceMeters ?? override?.distanceMeters ?? 0,
          intensity: data.intensity ?? override?.intensity ?? 2,
          kinks: data.kinks || override?.kinks || [],
          coordinates: data.coordinates || override?.coordinates || DEFAULT_FALLBACK_COORDINATES,
          avatarUrl: data.avatarUrl || override?.avatarUrl || "",
          moderationStatus: override?.moderationStatus || "active",
          moderationNotes: override?.moderationNotes || [],
          forcedFogMode: override?.forcedFogMode ?? data.isFogMode ?? false,
        });
      });

      for (const [id, override] of overrideMap.entries()) {
        if (!isTestOrMockProfile(override) && !deletedIds.has(id) && !users.some((u) => u.id === id)) {
          users.push(override);
        }
      }

      const cleanUsers = users.filter((u) => !isTestOrMockProfile(u) && !deletedIds.has(u.id));
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, cleanUsers, "real");
      onUpdate(cleanUsers);
    },
    (err) => {
      console.warn("[VESSEL Admin] Error en suscripción a usuarios reales de Firestore:", err);
    }
  );
};

export const saveManagedProfiles = (
  profiles: ManagedUserProfile[],
  mode: AppMode = getActiveAppMode()
): void => {
  const cleanProfiles = mode === "real" ? profiles.filter((p) => !isTestOrMockProfile(p)) : profiles;
  saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, cleanProfiles, mode);

  if (mode === "real" && typeof window !== "undefined") {
    for (const profile of cleanProfiles) {
      if (isTestOrMockProfile(profile)) continue;
      try {
        const profileRef = doc(db, "vessel_profiles", profile.id);
        const userRef = doc(db, "vessel_users", profile.id);
        setDoc(
          profileRef,
          sanitizeForFirestore({
            moderationStatus: profile.moderationStatus,
            respectScore: profile.respectScore,
            isAntiGhost: profile.isAntiGhost,
            isFogMode: profile.isFogMode,
            verification: profile.verification,
            userPlan: profile.userPlan,
            isUnlimited: profile.isUnlimited,
          }),
          { merge: true }
        ).catch((err) =>
          console.warn("[VESSEL Admin] Error sincronizando perfil en Firestore:", err)
        );

        setDoc(
          userRef,
          sanitizeForFirestore({
            userPlan: profile.userPlan,
            isUnlimited: profile.isUnlimited,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) =>
          console.warn("[VESSEL Admin] Error sincronizando userPlan en vessel_users:", err)
        );

        if (profile.moderationStatus === "banned") {
          const blacklistRef = doc(db, "vessel_blacklist", profile.id);
          setDoc(
            blacklistRef,
            {
              bannedAt: new Date().toISOString(),
              reason: profile.moderationNotes?.slice(-1)[0] || "Banned by admin",
            },
            { merge: true }
          ).catch((err) =>
            console.warn("[VESSEL Admin] Error registrando en blacklist:", err)
          );
        }
      } catch (err) {
        console.warn("[VESSEL Admin] Excepción sincronizando perfil en Firestore:", err);
      }
    }
  }
};

export const applyUserModeration = (
  userId: string,
  newStatus: UserModerationStatus,
  reason: string,
  operator: StaffMember,
  hours?: number,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updatedNotes = [...(target.moderationNotes || []), `[${operator.name}] ${newStatus.toUpperCase()}: ${reason}`];

  const updated: ManagedUserProfile = {
    ...target,
    moderationStatus: newStatus,
    moderationNotes: updatedNotes,
    suspendedUntil: newStatus === "suspended" ? `Suspendido por ${hours || 24} horas` : null,
    bannedAt: newStatus === "banned" ? "Hoy" : null,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action:
      newStatus === "banned"
        ? "USER_BANNED"
        : newStatus === "suspended"
        ? "USER_SUSPENDED"
        : newStatus === "warned"
        ? "USER_WARNED"
        : "USER_UNBANNED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: `Estado cambiado a '${newStatus}'. Razón: ${reason}`,
  });

  return updated;
};

export const adjustUserKarma = (
  userId: string,
  delta: number,
  reason: string,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const oldKarma = target.respectScore || 85;
  const newKarma = Math.min(100, Math.max(0, oldKarma + delta));

  const updated: ManagedUserProfile = {
    ...target,
    respectScore: newKarma,
    isAntiGhost: newKarma >= 85,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "USER_KARMA_ADJUSTED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: `Respect Karma ajustado de ${oldKarma} a ${newKarma} (${delta > 0 ? "+" : ""}${delta}). Motivo: ${reason}`,
  });

  return updated;
};

export const verifyUserProfile = (
  userId: string,
  approved: boolean,
  notes: string,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    verification: {
      isVerified: approved,
      method: approved ? "biometric_liveness" : undefined,
      verifiedAt: approved ? "Hoy" : "",
      hasFacialPrivacy: target.verification?.hasFacialPrivacy || false,
      badgeLabel: approved ? "ID VERIFIED // HUMANO REAL" : "NO VERIFICADO",
      trustScore: approved ? 99 : 0,
    },
    isLivenessVerified: approved,
    livenessVerifiedDate: approved ? "Hoy" : undefined,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: approved ? "USER_VERIFIED" : "USER_VERIFICATION_REJECTED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: approved
      ? `Identidad biométrica aprobada. Notas: ${notes}`
      : `Verificación biométrica rechazada. Motivo: ${notes}`,
  });

  return updated;
};

export const toggleUserForcedFogMode = (
  userId: string,
  forceFog: boolean,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    isFogMode: forceFog,
    forcedFogMode: forceFog,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: forceFog ? "USER_FOG_MODE_FORCED" : "USER_FOG_MODE_LIFTED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: forceFog
      ? "Modo Niebla impuesto por moderación para preservar discreción pública."
      : "Modo Niebla obligatorio levantado.",
  });

  return updated;
};

export const changeUserPlan = (
  userId: string,
  tier: UserSubscriptionTier,
  reason: string,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const isUnlimited = tier === "unlimited" || tier === "pro";
  const updated: ManagedUserProfile = {
    ...target,
    userPlan: tier,
    isUnlimited,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  // Inmediata sincronización atómica con Firestore para ambos documentos (vessel_profiles y vessel_users)
  if (mode === "real" && typeof window !== "undefined" && db && ("app" in db || "type" in db)) {
    try {
      const publicRef = doc(db, "vessel_profiles", userId);
      const userRef = doc(db, "vessel_users", userId);
      const payload = sanitizeForFirestore({
        userPlan: tier,
        isUnlimited,
        updatedAt: new Date().toISOString(),
      });
      setDoc(publicRef, payload, { merge: true }).catch((err) =>
        console.warn("[VESSEL Admin] Error actualizando plan en vessel_profiles:", err)
      );
      setDoc(userRef, payload, { merge: true }).catch((err) =>
        console.warn("[VESSEL Admin] Error actualizando plan en vessel_users:", err)
      );
    } catch (err) {
      console.warn("[VESSEL Admin] Error sincronizando membresía en Firestore:", err);
    }
  }

  // Notificar al entorno cliente local en tiempo real si coincide con la misma sesión
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vessel:user-plan-updated", {
        detail: { userId, tier, isUnlimited },
      })
    );
  }

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: tier === "unlimited" || tier === "pro" ? "MEMBERSHIP_GRANTED" : "MEMBERSHIP_REVOKED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: `Membresía cambiada a '${tier.toUpperCase()}'. Motivo: ${reason}`,
  });

  return updated;
};

export const clearUserDuressAlert = (
  userId: string,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): ManagedUserProfile | null => {
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    hasSafetyAlert: false,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles, mode);

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "DURESS_ALERT_CLEARED",
    targetUserId: target.id,
    targetUserCodename: target.codename,
    details: "Alerta de Coacción / Duress PIN resuelta y desactivada tras confirmación de seguridad.",
  });

  return updated;
};

/**
 * Elimina definitivamente a un usuario de la plataforma:
 * - Lo remueve de la memoria local persistente
 * - En modo real, elimina sus documentos en Firestore (vessel_profiles, vessel_users, vessel_blacklist)
 * - Registra la acción en la pista de auditoría administrativa
 */
export const deleteUserByAdmin = async (
  userId: string,
  operator: StaffMember,
  mode: AppMode = getActiveAppMode(),
  currentProfiles?: ManagedUserProfile[]
): Promise<boolean> => {
  if (!userId) return false;

  // 1. Registrar inmediatamente el UID en el registro persistente de eliminados (tombstone)
  recordDeletedUserId(userId, mode);
  // Por precaución, registrar también en el modo hermano para evitar cruce de caché
  recordDeletedUserId(userId, mode === "real" ? "test" : "real");

  // 2. Limpiar de perfiles locales en almacenamiento persistente
  const profiles = currentProfiles ? [...currentProfiles] : getManagedProfiles(mode);
  const target = profiles.find((p) => p.id === userId);
  const filtered = profiles.filter((p) => p.id !== userId);
  saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, filtered, mode);

  // 3. En modo real, eliminar en cascada todos sus documentos en Firestore
  if (mode === "real" && typeof window !== "undefined" && db && ("app" in db || "type" in db)) {
    try {
      const profileRef = doc(db, "vessel_profiles", userId);
      await deleteDoc(profileRef);
    } catch (err) {
      console.warn("[VESSEL Admin] Error al eliminar documento vessel_profiles:", err);
    }

    try {
      const userRef = doc(db, "vessel_users", userId);
      await deleteDoc(userRef);
    } catch (err) {
      console.warn("[VESSEL Admin] Error al eliminar documento vessel_users:", err);
    }

    try {
      const uniqueIdentityRef = doc(db, "vessel_unique_identities", `user_${userId}`);
      await deleteDoc(uniqueIdentityRef);
    } catch (err) {
      console.warn("[VESSEL Admin] Error al eliminar vessel_unique_identities:", err);
    }

    if (target?.codename) {
      try {
        const normalized = target.codename.trim().toLowerCase();
        const codenameRef = doc(db, "vessel_unique_identities", `codename_${normalized}`);
        await deleteDoc(codenameRef);
      } catch (err) {
        console.warn("[VESSEL Admin] Error al liberar codename en identidades únicas:", err);
      }
    }

    try {
      const blacklistRef = doc(db, "vessel_blacklist", userId);
      await deleteDoc(blacklistRef);
    } catch {
      // Ignorar si no existía en blacklist
    }
  }

  logAdminAction({
    operatorId: operator.id,
    operatorName: operator.name,
    operatorRole: operator.role,
    action: "USER_DELETED",
    targetUserId: userId,
    targetUserCodename: target?.codename || "DESCONOCIDO",
    details: `Usuario ${userId} (${target?.codename || "Sin alias"}) eliminado permanentemente de la plataforma por ${operator.name}`,
  });

  return true;
};

/* -------------------------------------------------------------
 * CÁLCULO DE TELEMETRÍA Y KPIS DE DASHBOARD
 * ------------------------------------------------------------- */

export const calculateDashboardMetrics = (
  profiles: ManagedUserProfile[],
  reports: ModerationReport[]
): AdminDashboardMetrics => {
  const total = profiles.length;
  let activeNow = 0;
  let unlimitedCount = 0;
  let freeCount = 0;
  let duressAlerts = 0;
  let beacons = 0;
  let pendingVerifs = 0;
  let totalKarma = 0;
  let encounters24h = 0;

  const bodyDist = { open: 0, occupied: 0, dormant: 0 };
  const roleDist: Record<RoleType, number> = {
    Top: 0,
    Bottom: 0,
    Versatile: 0,
    "Vers Top": 0,
    "Vers Bottom": 0,
    Side: 0,
    Dominant: 0,
    Submissive: 0,
    "Oral Focus": 0,
  };

  for (const p of profiles) {
    if (p.bodyState === "open" || p.bodyState === "occupied") {
      activeNow++;
    }

    if (p.bodyState in bodyDist) {
      bodyDist[p.bodyState as keyof typeof bodyDist]++;
    }

    if (p.role in roleDist) {
      roleDist[p.role]++;
    }

    if (p.isUnlimited || p.userPlan === "unlimited" || p.userPlan === "pro") {
      unlimitedCount++;
    } else {
      freeCount++;
    }

    if (p.hasSafetyAlert) {
      duressAlerts++;
    }

    if (!p.verification?.isVerified) {
      pendingVerifs++;
    }

    totalKarma += p.respectScore || 80;
    encounters24h += p.totalEncountersVerified || 0;
  }

  const pendingReps = reports.filter((r) => r.status === "pending" || r.status === "investigating").length;
  const avgKarma = total > 0 ? Math.round(totalKarma / total) : 100;
  const conversionRate = total > 0 ? Math.round((unlimitedCount / total) * 100) : 0;
  const estimatedMrr = unlimitedCount * 14.99;
  const isRealMode = getActiveAppMode() === "real";

  return {
    totalUsers: total,
    activeUsersNow: activeNow,
    unlimitedUsers: unlimitedCount,
    freeUsers: freeCount,
    weekendPassUsers: isRealMode ? 0 : 3,
    estimatedMrrUsd: estimatedMrr,
    conversionRatePercent: conversionRate,
    avgRespectKarma: avgKarma,
    activeDuressAlerts: duressAlerts,
    activeSafetyBeacons: beacons,
    pendingReportsCount: pendingReps,
    pendingVerificationsCount: pendingVerifs,
    encountersValidated24h: encounters24h,
    bodyStateDistribution: bodyDist,
    roleDistribution: roleDist,
  };
};
