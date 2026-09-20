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

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<AdminTabId>("dashboard");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [users, setUsers] = useState<ManagedUserProfile[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [quotaSettings, setQuotaSettings] = useState<GlobalQuotaSettings | null>(null);
  const [selectedUser, setSelectedUser] = useState<ManagedUserProfile | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  // Carga inicial y reactiva de datos en cliente
  const refreshData = useCallback(() => {
    const loadedStaff = getStaffMembers();
    const activeStaff = getActiveStaffSession();
    const loadedUsers = getManagedProfiles();
    const loadedReports = getModerationReports();
    const loadedLogs = getAdminAuditLogs();
    const loadedQuotas = getGlobalQuotaSettings();

    setStaffList(loadedStaff);
    setCurrentStaff(activeStaff);
    setUsers(loadedUsers);
    setReports(loadedReports);
    setAuditLogs(loadedLogs);
    setQuotaSettings(loadedQuotas);
  }, []);

  useEffect(() => {
    refreshData();
    setIsClientReady(true);
  }, [refreshData]);

  // Manejo de cambio de operador activo (RBAC)
  const handleSwitchStaff = (staffId: string) => {
    const switched = setActiveStaffSession(staffId);
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
    saveStaffMembers(list);
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
  );
}
