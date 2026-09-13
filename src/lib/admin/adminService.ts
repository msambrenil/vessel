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
} from "@/lib/storage/localStorageSync";

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
 * GESTIÓN DE PERSONAL & SESIÓN (RBAC)
 * ------------------------------------------------------------- */

export const getStaffMembers = (): StaffMember[] => {
  return loadFromStorage<StaffMember[]>(STORAGE_KEYS.STAFF_MEMBERS, DEFAULT_STAFF_MEMBERS);
};

export const saveStaffMembers = (staff: StaffMember[]): void => {
  saveToStorage(STORAGE_KEYS.STAFF_MEMBERS, staff);
};

export const getActiveStaffSession = (): StaffMember => {
  const staffList = getStaffMembers();
  const savedStaffId = loadFromStorage<string | null>(STORAGE_KEYS.STAFF_SESSION, null);
  if (savedStaffId) {
    const found = staffList.find((s) => s.id === savedStaffId);
    if (found) return found;
  }
  return staffList[0] || DEFAULT_STAFF_MEMBERS[0];
};

export const setActiveStaffSession = (staffId: string): StaffMember => {
  const staffList = getStaffMembers();
  const target = staffList.find((s) => s.id === staffId) || staffList[0];
  saveToStorage(STORAGE_KEYS.STAFF_SESSION, target.id);
  return target;
};

/* -------------------------------------------------------------
 * REGISTRO DE AUDITORÍA (AUDIT TRAIL)
 * ------------------------------------------------------------- */

export const getAdminAuditLogs = (): AdminAuditLogEntry[] => {
  return loadFromStorage<AdminAuditLogEntry[]>(STORAGE_KEYS.ADMIN_AUDIT, INITIAL_AUDIT_LOGS);
};

export const logAdminAction = (
  entry: Omit<AdminAuditLogEntry, "id" | "timestamp">
): AdminAuditLogEntry => {
  const currentLogs = getAdminAuditLogs();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const newEntry: AdminAuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: `Hoy, ${timeStr}`,
  };

  const updated = [newEntry, ...currentLogs.slice(0, 199)];
  saveToStorage(STORAGE_KEYS.ADMIN_AUDIT, updated);
  return newEntry;
};

/* -------------------------------------------------------------
 * REPORTES DE MODERACIÓN
 * ------------------------------------------------------------- */

export const getModerationReports = (): ModerationReport[] => {
  return loadFromStorage<ModerationReport[]>(STORAGE_KEYS.ADMIN_REPORTS, INITIAL_MOCK_REPORTS);
};

export const saveModerationReports = (reports: ModerationReport[]): void => {
  saveToStorage(STORAGE_KEYS.ADMIN_REPORTS, reports);
};

export const updateReportStatus = (
  reportId: string,
  newStatus: ModerationReport["status"],
  actionTaken: string,
  notes: string,
  operator: StaffMember
): ModerationReport | null => {
  const reports = getModerationReports();
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

export const getManagedProfiles = (): ManagedUserProfile[] => {
  const custom = loadFromStorage<ManagedUserProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, []);
  if (!custom || custom.length === 0) {
    return MOCK_PROFILES.map((p) => ({
      ...p,
      moderationStatus: "active",
      moderationNotes: [],
      forcedFogMode: p.isFogMode || false,
    }));
  }

  const merged: ManagedUserProfile[] = [...custom];

  for (const m of MOCK_PROFILES) {
    if (!merged.some((p) => p.id === m.id)) {
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

export const saveManagedProfiles = (profiles: ManagedUserProfile[]): void => {
  saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, profiles);
};

export const applyUserModeration = (
  userId: string,
  newStatus: UserModerationStatus,
  reason: string,
  operator: StaffMember,
  hours?: number
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
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
  saveManagedProfiles(profiles);

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
  operator: StaffMember
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
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
  saveManagedProfiles(profiles);

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
  operator: StaffMember
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
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
  saveManagedProfiles(profiles);

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
  operator: StaffMember
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    isFogMode: forceFog,
    forcedFogMode: forceFog,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles);

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
  operator: StaffMember
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    userPlan: tier,
    isUnlimited: tier === "unlimited" || tier === "pro",
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles);

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
  operator: StaffMember
): ManagedUserProfile | null => {
  const profiles = getManagedProfiles();
  const index = profiles.findIndex((p) => p.id === userId);
  if (index === -1) return null;

  const target = profiles[index];
  const updated: ManagedUserProfile = {
    ...target,
    hasSafetyAlert: false,
  };

  profiles[index] = updated;
  saveManagedProfiles(profiles);

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
  const avgKarma = total > 0 ? Math.round(totalKarma / total) : 85;
  const conversionRate = total > 0 ? Math.round((unlimitedCount / total) * 100) : 0;
  const estimatedMrr = unlimitedCount * 14.99;

  return {
    totalUsers: total,
    activeUsersNow: activeNow,
    unlimitedUsers: unlimitedCount,
    freeUsers: freeCount,
    weekendPassUsers: 3,
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
