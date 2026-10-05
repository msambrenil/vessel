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
  fetchRealUsersFromCloud,
  subscribeToRealUsersForAdmin,
  applyUserModeration,
  adjustUserKarma,
  verifyUserProfile,
  toggleUserForcedFogMode,
  changeUserPlan,
  clearUserDuressAlert,
  calculateDashboardMetrics,
  isTestOrMockProfileId,
  isTestOrMockProfile,
  deleteUserByAdmin,
  recordDeletedUserId,
  isDeletedUserId,
} from "@/lib/admin/adminService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNav, AdminTabId } from "@/components/admin/AdminNav";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { DashboardOverviewTab } from "@/components/admin/tabs/DashboardOverviewTab";
import { UserManagementTab } from "@/components/admin/tabs/UserManagementTab";
import { MembershipsTab } from "@/components/admin/tabs/MembershipsTab";
import { ModerationTab } from "@/components/admin/tabs/ModerationTab";
import { StaffManagementTab } from "@/components/admin/tabs/StaffManagementTab";
import { AuditLogsTab } from "@/components/admin/tabs/AuditLogsTab";
import { BetaManagementTab } from "@/components/admin/tabs/BetaManagementTab";
import { KinksManagementTab } from "@/components/admin/tabs/KinksManagementTab";
import { HotspotsManagementTab } from "@/components/admin/tabs/HotspotsManagementTab";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { useVessel } from "@/context/VesselContext";
import { createVipInviteCode } from "@/lib/firebase/inviteService";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getAllKinks } from "@/lib/kinks/kinkAdminService";
import { ChevronDown, ChevronUp, Wrench, Sparkles } from "lucide-react";

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
    tacticalHotspots,
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
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Perfiles reales activos (incluyendo al usuario propio real si inició sesión real)
  const liveRealProfiles = useMemo(() => {
    if (appMode !== "real") return [];
    const map = new Map<string, (typeof profiles)[number]>();
    for (const p of filteredProfiles) {
      if (p && p.id && !isTestOrMockProfile(p) && !isDeletedUserId(p.id, appMode)) {
        map.set(p.id, p);
      }
    }
    for (const p of profiles) {
      if (p && p.id && !isTestOrMockProfile(p) && !isDeletedUserId(p.id, appMode)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [appMode, profiles, filteredProfiles]);

  // Carga inicial y reactiva de datos en cliente según appMode ("real" vs "test")
  const refreshData = useCallback(() => {
    const loadedStaff = getStaffMembers(appMode, authUser);
    const activeStaff = getActiveStaffSession(appMode, authUser);
    const rawUsers = getManagedProfiles(appMode, liveRealProfiles);
    const loadedUsers =
      appMode === "real"
        ? rawUsers.filter((u) => !isTestOrMockProfile(u))
        : rawUsers;
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

  // Sincronización en tiempo real de todos los usuarios registrados en Firestore (nunca desaparecen)
  useEffect(() => {
    if (appMode === "real") {
      fetchRealUsersFromCloud().then((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers.filter((u) => !isTestOrMockProfileId(u.id)));
        }
      });
      const unsubUsers = subscribeToRealUsersForAdmin((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers.filter((u) => !isTestOrMockProfileId(u.id)));
        }
      });
      return () => {
        unsubUsers();
      };
    }
  }, [appMode]);

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
    applyUserModeration(userId, status, reason, currentStaff, hours, appMode, users);
    refreshData();
    // Actualizar usuario seleccionado si está abierto
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, moderationStatus: status } : null));
    }
  };

  const handleAdjustKarma = (userId: string, delta: number, reason: string) => {
    if (!currentStaff) return;
    adjustUserKarma(userId, delta, reason, currentStaff, appMode, users);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, respectScore: Math.min(100, Math.max(0, (prev.respectScore || 85) + delta)) } : null
      );
    }
  };

  const handleVerifyUser = (userId: string, approved: boolean, notes: string) => {
    if (!currentStaff) return;
    verifyUserProfile(userId, approved, notes, currentStaff, appMode, users);
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
    toggleUserForcedFogMode(userId, forceFog, currentStaff, appMode, users);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, isFogMode: forceFog, forcedFogMode: forceFog } : null));
    }
  };

  const handleChangePlan = (userId: string, tier: "free" | "unlimited", reason: string) => {
    if (!currentStaff) return;
    changeUserPlan(userId, tier, reason, currentStaff, appMode, users);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, userPlan: tier, isUnlimited: tier === "unlimited" } : null
      );
    }
  };

  const handleClearDuress = (userId: string) => {
    if (!currentStaff) return;
    clearUserDuressAlert(userId, currentStaff, appMode, users);
    refreshData();
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, hasSafetyAlert: false } : null));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentStaff) return;
    recordDeletedUserId(userId, appMode);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
    audioEngine.playSubBass(45);
    await deleteUserByAdmin(userId, currentStaff, appMode, users);
    refreshData();
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
      <div className="min-h-screen bg-obsidian text-white flex flex-col lg:flex-row selection:bg-electricViolet selection:text-white">
        {/* Barra Lateral Ejecutiva Fija (Desktop) & Drawer Desplegable (Móvil) */}
        <AdminNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          staffRole={currentStaff.role}
          pendingReportsCount={pendingReportsCount}
          totalUsersCount={users.length}
          unlimitedCount={unlimitedCount}
          kinksCount={getAllKinks().length}
          hotspotsCount={tacticalHotspots.length}
          estimatedMrrUsd={metrics.estimatedMrrUsd}
          activeUsersNow={metrics.activeUsersNow}
          activeDuressCount={usersWithDuress.length}
          currentStaff={currentStaff}
          staffList={staffList}
          onSwitchStaff={handleSwitchStaff}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Área de Trabajo y Contenido Principal (Derecha en Escritorio) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Cabecera Táctica con Breadcrumbs, Staff Switcher y HUD */}
          <AdminHeader
            currentStaff={currentStaff}
            staffList={staffList}
            onSwitchStaff={handleSwitchStaff}
            activeDuressCount={usersWithDuress.length}
            pendingReportsCount={pendingReportsCount}
            activeTab={activeTab}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />

          {/* Contenedor Principal de la Consola */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {/* BARRA MAESTRA DE ENTORNO: CONTROLES DE NEGOCIO + HERRAMIENTAS DE TESTEO COLAPSABLES */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-obsidian-surface p-4 sm:p-5 shadow-card-elevation space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Controles de Negocio: Modo Real vs Modo Prueba */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-electricViolet font-bold">
                  CONTROL MAESTRO // ENTORNO DE OPERACIÓN
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border ${
                    appMode === "real"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {appMode === "real"
                    ? `🟢 EN VIVO (${profiles.length} REALES EN MATRIX)`
                    : `🧪 SANDBOX (${profiles.length} PERFILES DEMO)`}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Elegí si operás sobre usuarios reales sincronizados en Firestore (TTL 30m) o con la simulación de pruebas.
              </p>
            </div>

            {/* Selector de Modo (Real vs Test) */}
            <div className="flex items-center gap-3">
              {isLocalEnvironment() ? (
                <div className="grid grid-cols-2 gap-2 min-w-[280px] bg-black/60 p-1.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setAppMode("real");
                      audioEngine.playVesselCrescendoAlert();
                    }}
                    className={`px-3 py-2.5 min-h-[44px] rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation ${
                      appMode === "real"
                        ? "bg-emerald-500/25 border border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "bg-white/[0.02] border border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${appMode === "real" ? "bg-emerald-400 animate-ping" : "bg-neutral-600"}`} />
                    <span>🟢 MODO REAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppMode("test");
                      audioEngine.playStateSwitch("dormant");
                    }}
                    className={`px-3 py-2.5 min-h-[44px] rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation ${
                      appMode === "test"
                        ? "bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                        : "bg-white/[0.02] border border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${appMode === "test" ? "bg-amber-400 animate-pulse" : "bg-neutral-600"}`} />
                    <span>🧪 MODO PRUEBA</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE REAL // FIRESTORE SYNC</span>
                </div>
              )}

              {/* Botón de despliegue para Dev Tools (solo en local) */}
              {isLocalEnvironment() && (
                <button
                  type="button"
                  onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
                  className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer touch-manipulation ${
                    isDevToolsOpen
                      ? "bg-electricViolet/20 text-electricViolet border-electricViolet/50"
                      : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/10"
                  }`}
                  title="Herramientas de simulación para desarrollo local"
                >
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">🛠️ Simulación & Dev Tools</span>
                  {isDevToolsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bandeja de Herramientas de Testeo (Colapsable, disponible sólo en localhost) */}
          {isLocalEnvironment() && isDevToolsOpen && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5 animate-in fade-in">
              <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider mr-1">
                Herramientas de Simulación:
              </span>

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
                className="px-3.5 py-2 min-h-[40px] rounded-xl bg-electricViolet/20 hover:bg-electricViolet/30 border border-electricViolet/50 text-electricViolet font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                🎟️ {vipCopiedMsg || "Generar & Copiar Link VIP Beta"}
              </button>

              {!isGpsHibernating ? (
                <button
                  type="button"
                  onClick={() => confirmPartyArrivalLock("techno_bunker")}
                  className="px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  title="Fija ubicación en la fiesta por 4h, apaga el GPS continuo para ahorrar batería y dispara la vibración in-crescendo VESSEL"
                >
                  🎉 Llegué a la Fiesta (Anclar 4h + Hibernar GPS)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => checkOutOfEvent()}
                  className="px-3.5 py-2 min-h-[40px] rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  🔋 GPS Hibernando (Anclado 4h) · Salir de Fiesta
                </button>
              )}

              <button
                type="button"
                onClick={() => audioEngine.playVesselCrescendoAlert()}
                className="px-3.5 py-2 min-h-[40px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                title="Patrón Háptico [15,90,25,75,40,60,65,45,100,30,180] + Sub-Bass Sweep 45Hz ➔ 88Hz"
              >
                📳 Probar Vibración Crescendo (45Hz➔88Hz)
              </button>
            </div>
          )}
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
            onDeleteUser={handleDeleteUser}
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

        {activeTab === "beta" && <BetaManagementTab />}

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
      </div>
    </AdminAuthGuard>
  );
}
