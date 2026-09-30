"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  StaffMember,
  ManagedUserProfile,
  ModerationReport,
  AdminAuditLogEntry,
  GlobalQuotaSettings,
  UserModerationStatus,
} from "@/types/admin";
import {
  getStaffMembers,
  saveStaffMembers,
  getActiveStaffSession,
  setActiveStaffSession,
  fetchRealStaffFromCloud,
  getAdminAuditLogs,
  logAdminAction,
  getModerationReports,
  updateReportStatus,
  getGlobalQuotaSettings,
  saveGlobalQuotaSettings,
  getManagedProfiles,
  applyUserModeration,
  adjustUserKarma,
  verifyUserProfile,
  toggleUserForcedFogMode,
  changeUserPlan,
  clearUserDuressAlert,
  calculateDashboardMetrics,
} from "@/lib/admin/adminService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNav, AdminTabId } from "@/components/admin/AdminNav";
import { DashboardOverviewTab } from "@/components/admin/tabs/DashboardOverviewTab";
import { UserManagementTab } from "@/components/admin/tabs/UserManagementTab";
import { MembershipsTab } from "@/components/admin/tabs/MembershipsTab";
import { ModerationTab } from "@/components/admin/tabs/ModerationTab";
import { StaffManagementTab } from "@/components/admin/tabs/StaffManagementTab";
import { AuditLogsTab } from "@/components/admin/tabs/AuditLogsTab";
import { KinksManagementTab } from "@/components/admin/tabs/KinksManagementTab";
import { HotspotsManagementTab } from "@/components/admin/tabs/HotspotsManagementTab";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { useVessel } from "@/context/VesselContext";
import { createVipInviteCode } from "@/lib/firebase/inviteService";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export default function AdminConsolePage() {
  const {
    appMode,
    setAppMode,
    profiles,
    filteredProfiles,
    isGpsHibernating,
    confirmPartyArrivalLock,
    checkOutOfEvent,
    authUser,
  } = useVessel();
  const [vipCopiedMsg, setVipCopiedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabId>("dashboard");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [users, setUsers] = useState<ManagedUserProfile[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [quotaSettings, setQuotaSettings] = useState<GlobalQuotaSettings | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagedUserProfile | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  // Perfiles reales activos (incluyendo al usuario propio real si inició sesión real)
  const liveRealProfiles = useMemo(() => {
    if (appMode !== "real") return [];
    const map = new Map<string, (typeof profiles)[number]>();
    for (const p of filteredProfiles) {
      if (p && p.id && p.codename && p.codename !== "VESSEL_USER") {
        map.set(p.id, p);
      }
    }
    for (const p of profiles) {
      if (p && p.id && p.codename && p.codename !== "VESSEL_USER") {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [appMode, profiles, filteredProfiles]);

  // Carga inicial y reactiva de datos en cliente según appMode ("real" vs "test")
  const refreshData = useCallback(() => {
    const loadedStaff = getStaffMembers(appMode, authUser);
    const activeStaff = getActiveStaffSession(appMode, authUser);
    const loadedUsers = getManagedProfiles(appMode, liveRealProfiles);
    const loadedReports = getModerationReports(appMode);
    const loadedLogs = getAdminAuditLogs(appMode);
    const loadedQuotas = getGlobalQuotaSettings();

    setStaffList(loadedStaff);
    setCurrentStaff(activeStaff);
    setUsers(loadedUsers);
    setReports(loadedReports);
    setAuditLogs(loadedLogs);
    setQuotaSettings(loadedQuotas);
  }, [appMode, liveRealProfiles, authUser]);

  useEffect(() => {
    refreshData();
    setIsClientReady(true);
  }, [refreshData]);

  // Sincronización en la nube para personal real en Firestore
  useEffect(() => {
    if (appMode === "real") {
      fetchRealStaffFromCloud().then((cloudStaff) => {
        if (cloudStaff && cloudStaff.length > 0) {
          setStaffList(cloudStaff);
          const active = getActiveStaffSession(appMode, authUser);
          setCurrentStaff(active);
        }
      });
    }
  }, [appMode, authUser]);

  // Manejo de cambio de operador activo (RBAC)
  const handleSwitchStaff = (staffId: string) => {
    const switched = setActiveStaffSession(staffId, appMode);
    setCurrentStaff(switched);
    // Si el nuevo rol no tiene acceso a la pestaña actual, volver al dashboard
    if (switched.role !== "superadmin" && activeTab === "staff") {
      setActiveTab("dashboard");
    }
    if (switched.role === "moderator" && activeTab === "memberships") {
      setActiveTab("dashboard");
    }
  };

  // Acciones sobre usuarios
  const handleApplyModeration = (
    userId: string,
    status: UserModerationStatus,
    reason: string,
    hours?: number
  ) => {
    if (!currentStaff) return;
    applyUserModeration(userId, status, reason, currentStaff, hours);
    refreshData();
    // Actualizar usuario seleccionado si está abierto
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, moderationStatus: status } : null));
    }
  };

  const handleAdjustKarma = (userId: string, delta: number, reason: string) => {
    if (!currentStaff) return;
    adjustUserKarma(userId, delta, reason, currentStaff);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, respectScore: Math.min(100, Math.max(0, (prev.respectScore || 85) + delta)) } : null
      );
    }
  };

  const handleVerifyUser = (userId: string, approved: boolean, notes: string) => {
    if (!currentStaff) return;
    verifyUserProfile(userId, approved, notes, currentStaff);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              verification: {
                ...prev.verification,
                isVerified: approved,
              },
            }
          : null
      );
    }
  };

  const handleToggleFogMode = (userId: string, forceFog: boolean) => {
    if (!currentStaff) return;
    toggleUserForcedFogMode(userId, forceFog, currentStaff);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, isFogMode: forceFog, forcedFogMode: forceFog } : null));
    }
  };

  const handleChangePlan = (userId: string, tier: "free" | "unlimited", reason: string) => {
    if (!currentStaff) return;
    changeUserPlan(userId, tier, reason, currentStaff);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, userPlan: tier, isUnlimited: tier === "unlimited" } : null
      );
    }
  };

  const handleClearDuress = (userId: string) => {
    if (!currentStaff) return;
    clearUserDuressAlert(userId, currentStaff);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, hasSafetyAlert: false } : null));
    }
  };

  // Resolución de reportes
  const handleResolveReport = (
    reportId: string,
    newStatus: ModerationReport["status"],
    actionTaken: string,
    notes: string
  ) => {
    if (!currentStaff) return;
    updateReportStatus(reportId, newStatus, actionTaken, notes, currentStaff);
    refreshData();
  };

  // Guardado de cuotas maestras
  const handleSaveQuotaSettings = (newSettings: GlobalQuotaSettings) => {
    if (!currentStaff) return;
    saveGlobalQuotaSettings(newSettings, currentStaff);
    refreshData();
  };

  // Guardado de lista de personal
  const handleSaveStaffList = (list: StaffMember[]) => {
    saveStaffMembers(list, appMode);
    refreshData();
  };

  // Registro de auditoría manual
  const handleLogManualAction = (action: string, details: string) => {
    if (!currentStaff) return;
    logAdminAction({
      operatorId: currentStaff.id,
      operatorName: currentStaff.name,
      operatorRole: currentStaff.role,
      action: action as any,
      details,
    });
    refreshData();
  };

  // Métricas calculadas
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(users, reports);
  }, [users, reports]);

  const usersWithDuress = useMemo(() => {
    return users.filter((u) => u.hasSafetyAlert);
  }, [users]);

  const pendingReportsCount = useMemo(() => {
    return reports.filter((r) => r.status === "pending" || r.status === "investigating").length;
  }, [reports]);

  const unlimitedCount = useMemo(() => {
    return users.filter((u) => u.isUnlimited || u.userPlan === "unlimited").length;
  }, [users]);

  if (!isClientReady || !currentStaff || !quotaSettings) {
    return (
      <div className="min-h-screen bg-obsidian text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-electricViolet animate-ping" />
          <span className="tracking-widest uppercase text-neutral-400">
            INICIALIZANDO VESSEL OPS // COMMAND...
          </span>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-obsidian text-white flex flex-col selection:bg-electricViolet selection:text-white">
      {/* Cabecera Brutalista Táctica con Staff Switcher */}
      <AdminHeader
        currentStaff={currentStaff}
        staffList={staffList}
        onSwitchStaff={handleSwitchStaff}
        activeDuressCount={usersWithDuress.length}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Navegación por Pestañas con Control de Roles */}
      <AdminNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        staffRole={currentStaff.role}
        pendingReportsCount={pendingReportsCount}
        totalUsersCount={users.length}
        unlimitedCount={unlimitedCount}
      />

      {/* Contenedor Principal de la Consola */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {/* BARRA MAESTRA DE ENTORNO: MODO REAL VS MODO PRUEBA + VIP BETA + GPS 30M */}
        <div className="mb-6 rounded-xl border-2 border-electricViolet/40 bg-gradient-to-r from-[#12091d] via-[#0c0c0e] to-[#091512] p-4 shadow-[0_0_30px_rgba(124,58,237,0.18)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Selector Dual 1-Tap: MODO REAL vs MODO PRUEBA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-electricViolet font-bold">
                    CONTROL MAESTRO DE MATRIZ // ENTORNO ACTIVO
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border ${
                      appMode === "real"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {appMode === "real"
                      ? `EN VIVO (${profiles.length} REALES EN MATRIX)`
                      : `SANDBOX (${profiles.length} BOTS DEMO)`}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Alterná en 1 clic entre usuarios reales sincronizados en Firestore (TTL 30m) o perfiles simulados de prueba.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 min-w-[290px] bg-black/60 p-1.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setAppMode("real");
                    audioEngine.playVesselCrescendoAlert();
                  }}
                  className={`px-3 py-2.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appMode === "real"
                      ? "bg-emerald-500/25 border-2 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                      : "bg-white/[0.02] border border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${appMode === "real" ? "bg-emerald-400 animate-ping" : "bg-neutral-600"}`} />
                  🟢 MODO REAL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppMode("test");
                    audioEngine.playStateSwitch("dormant");
                  }}
                  className={`px-3 py-2.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appMode === "test"
                      ? "bg-amber-500/25 border-2 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                      : "bg-white/[0.02] border border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${appMode === "test" ? "bg-amber-400 animate-pulse" : "bg-neutral-600"}`} />
                  🧪 MODO PRUEBA
                </button>
              </div>
            </div>

            {/* Acciones Rápidas: Links VIP Beta + Modo Fiesta (Llegué) + Vibración Crescendo */}
            <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
              <button
                type="button"
                onClick={async () => {
                  const randomSuffix = Math.floor(10 + Math.random() * 89);
                  const res = await createVipInviteCode({
                    code: `VESSEL-VIP-${randomSuffix}`,
                    maxUses: 25,
                    note: "Beta Tester Asignado desde Ops Command",
                  });
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    await navigator.clipboard.writeText(res.shareUrl);
                  }
                  setVipCopiedMsg(`Copiado: ?vip=${res.code}`);
                  setTimeout(() => setVipCopiedMsg(null), 4000);
                }}
                className="px-3 py-2 rounded-lg bg-electricViolet/20 hover:bg-electricViolet/30 border border-electricViolet/50 text-electricViolet font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                🎟️ {vipCopiedMsg || "Generar & Copiar Link VIP Beta"}
              </button>

              {!isGpsHibernating ? (
                <button
                  type="button"
                  onClick={() => confirmPartyArrivalLock("techno_bunker")}
                  className="px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  title="Fija ubicación en la fiesta por 4h, apaga el GPS continuo para ahorrar batería y dispara la vibración in-crescendo VESSEL"
                >
                  🎉 Llegué a la Fiesta (Anclar 4h + Hibernar GPS)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => checkOutOfEvent()}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  🔋 GPS Hibernando (Anclado 4h) · Salir de Fiesta
                </button>
              )}

              <button
                type="button"
                onClick={() => audioEngine.playVesselCrescendoAlert()}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                title="Patrón Háptico [15,90,25,75,40,60,65,45,100,30,180] + Sub-Bass Sweep 45Hz ➔ 88Hz"
              >
                📳 Probar Vibración Crescendo (45Hz➔88Hz)
              </button>
            </div>
          </div>
        </div>
        {activeTab === "dashboard" && (
          <DashboardOverviewTab
            metrics={metrics}
            usersWithDuress={usersWithDuress}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectUserForInspection={(u) => {
              setSelectedUser(u);
              setActiveTab("users");
            }}
          />
        )}

        {activeTab === "users" && (
          <UserManagementTab
            users={users}
            currentStaff={currentStaff}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onApplyModeration={handleApplyModeration}
            onAdjustKarma={handleAdjustKarma}
            onVerifyUser={handleVerifyUser}
            onToggleFogMode={handleToggleFogMode}
            onChangePlan={handleChangePlan}
            onClearDuress={handleClearDuress}
          />
        )}

        {activeTab === "kinks" && (
          <KinksManagementTab currentStaff={currentStaff} />
        )}

        {activeTab === "hotspots" && (
          <HotspotsManagementTab currentStaff={currentStaff} />
        )}

        {activeTab === "memberships" && (
          <MembershipsTab
            users={users}
            currentStaff={currentStaff}
            quotaSettings={quotaSettings}
            onSaveQuotaSettings={handleSaveQuotaSettings}
            onChangePlan={handleChangePlan}
          />
        )}

        {activeTab === "moderation" && (
          <ModerationTab
            reports={reports}
            currentStaff={currentStaff}
            users={users}
            onResolveReport={handleResolveReport}
            onSelectUserForInspection={(u) => {
              setSelectedUser(u);
              setActiveTab("users");
            }}
          />
        )}

        {activeTab === "staff" && currentStaff.role === "superadmin" && (
          <StaffManagementTab
            staffList={staffList}
            currentStaff={currentStaff}
            onSaveStaffList={handleSaveStaffList}
            onLogAction={handleLogManualAction}
          />
        )}

        {activeTab === "audit" && <AuditLogsTab logs={auditLogs} />}
      </main>
    </div>
    </AdminAuthGuard>
  );
}
