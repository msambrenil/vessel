"use client";

import React from "react";
import { StaffRole } from "@/types/admin";
import {
  LayoutDashboard,
  Users,
  Flame,
  CreditCard,
  ShieldAlert,
  UserCog,
  FileText,
} from "lucide-react";

export type AdminTabId =
  | "dashboard"
  | "users"
  | "kinks"
  | "memberships"
  | "moderation"
  | "staff"
  | "audit";

interface AdminNavProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  staffRole: StaffRole;
  pendingReportsCount: number;
  totalUsersCount: number;
  unlimitedCount: number;
  kinksCount?: number;
}

export const AdminNav: React.FC<AdminNavProps> = ({
  activeTab,
  onSelectTab,
  staffRole,
  pendingReportsCount,
  totalUsersCount,
  unlimitedCount,
  kinksCount,
}) => {
  const tabs = [
    {
      id: "dashboard" as AdminTabId,
      label: "Telemetría & KPIs",
      icon: LayoutDashboard,
      roles: ["superadmin", "moderator", "support"],
    },
    {
      id: "users" as AdminTabId,
      label: "Gestión de Usuarios",
      icon: Users,
      badge: totalUsersCount,
      roles: ["superadmin", "moderator", "support"],
    },
    {
      id: "kinks" as AdminTabId,
      label: "Morbos & Fetiches",
      icon: Flame,
      badge: kinksCount,
      roles: ["superadmin", "moderator", "support"],
    },
    {
      id: "memberships" as AdminTabId,
      label: "Membresías & Cuotas",
      icon: CreditCard,
      badge: unlimitedCount,
      roles: ["superadmin", "support"],
    },
    {
      id: "moderation" as AdminTabId,
      label: "Cola de Moderación",
      icon: ShieldAlert,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
      badgeColor: "bg-bloodNeon text-white animate-pulse",
      roles: ["superadmin", "moderator"],
    },
    {
      id: "staff" as AdminTabId,
      label: "Equipo & Permisos",
      icon: UserCog,
      roles: ["superadmin"],
    },
    {
      id: "audit" as AdminTabId,
      label: "Log de Auditoría",
      icon: FileText,
      roles: ["superadmin", "moderator", "support"],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(staffRole));

  return (
    <nav className="w-full bg-obsidian-surface border-b border-white/10 px-4 sm:px-6 select-none overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-electricViolet text-white font-bold border border-electricViolet/50 shadow-violet-soft"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                    tab.badgeColor || "bg-white/10 text-neutral-300 border border-white/10"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
