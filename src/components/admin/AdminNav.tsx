"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StaffMember, StaffRole } from "@/types/admin";
import { VesselLogo } from "@/components/brand/VesselLogo";
import {
  LayoutDashboard,
  Users,
  Flame,
  CreditCard,
  ShieldAlert,
  UserCog,
  FileText,
  Compass,
  Wrench,
  ExternalLink,
  Search,
  X,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export type AdminTabId =
  | "dashboard"
  | "users"
  | "kinks"
  | "hotspots"
  | "memberships"
  | "moderation"
  | "beta"
  | "staff"
  | "audit";

export interface AdminNavProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  staffRole: StaffRole;
  pendingReportsCount: number;
  totalUsersCount: number;
  unlimitedCount: number;
  kinksCount?: number;
  hotspotsCount?: number;
  estimatedMrrUsd?: number;
  activeUsersNow?: number;
  activeDuressCount?: number;
  currentStaff?: StaffMember;
  staffList?: StaffMember[];
  onSwitchStaff?: (staffId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: AdminTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  roles: StaffRole[];
}

interface NavModuleGroup {
  id: string;
  name: string;
  tabs: NavItemConfig[];
}

export const AdminNav: React.FC<AdminNavProps> = ({
  activeTab,
  onSelectTab,
  staffRole,
  pendingReportsCount,
  totalUsersCount,
  unlimitedCount,
  kinksCount,
  hotspotsCount,
  estimatedMrrUsd,
  activeUsersNow = 0,
  activeDuressCount = 0,
  currentStaff,
  staffList = [],
  onSwitchStaff,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [tabFilterQuery, setTabFilterQuery] = useState("");

  const modules: NavModuleGroup[] = [
    {
      id: "business",
      name: "NEGOCIO",
      tabs: [
        {
          id: "dashboard",
          label: "Telemetría & KPIs",
          icon: LayoutDashboard,
          roles: ["superadmin", "moderator", "support"],
        },
      ],
    },
    {
      id: "community",
      name: "COMUNIDAD",
      tabs: [
        {
          id: "users",
          label: "Usuarios",
          icon: Users,
          badge: totalUsersCount,
          roles: ["superadmin", "moderator", "support"],
        },
        {
          id: "moderation",
          label: "Cola de Denuncias",
          icon: ShieldAlert,
          badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
          badgeColor: "bg-bloodNeon text-white animate-pulse",
          roles: ["superadmin", "moderator"],
        },
      ],
    },
    {
      id: "catalog",
      name: "CATÁLOGO",
      tabs: [
        {
          id: "hotspots",
          label: "Puntos de Encuentro",
          icon: Compass,
          badge: hotspotsCount,
          roles: ["superadmin", "moderator", "support"],
        },
        {
          id: "kinks",
          label: "Morbos & Fetiches",
          icon: Flame,
          badge: kinksCount,
          roles: ["superadmin", "moderator", "support"],
        },
      ],
    },
    {
      id: "governance",
      name: "GOBERNANZA",
      tabs: [
        {
          id: "memberships",
          label: "Límites Plan Free",
          icon: CreditCard,
          badge: unlimitedCount,
          roles: ["superadmin", "support"],
        },
        {
          id: "staff",
          label: "Equipo & Roles",
          icon: UserCog,
          roles: ["superadmin"],
        },
        {
          id: "audit",
          label: "Auditoría",
          icon: FileText,
          roles: ["superadmin", "moderator", "support"],
        },
        {
          id: "beta",
          label: "Beta Testers",
          icon: Wrench,
          roles: ["superadmin", "moderator", "support"],
        },
      ],
    },
  ];

  // Filtrar módulos y pestañas según el rol RBAC y filtro de texto opcional
  const visibleModules = modules
    .map((mod) => ({
      ...mod,
      tabs: mod.tabs.filter((t) => {
        const hasRole = t.roles.includes(staffRole);
        if (!hasRole) return false;
        if (!tabFilterQuery.trim()) return true;
        return t.label.toLowerCase().includes(tabFilterQuery.toLowerCase());
      }),
    }))
    .filter((mod) => mod.tabs.length > 0);

  const displayMrr = estimatedMrrUsd ?? unlimitedCount * 14.99;

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between p-4 space-y-4">
      {/* SECCIÓN SUPERIOR: MARCA, ACCESO APP RADAR & PULSO EN VIVO */}
      <div className="space-y-4">
        {/* Cabecera de Marca VESSEL OPS */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            title="Ir al Radar de la App"
          >
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-electricViolet/50 transition-colors">
              <VesselLogo size={22} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  VESSEL<span className="text-electricViolet-glow font-normal"> // OPS</span>
                </span>
                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-white/5 text-neutral-400 border border-white/10 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono tracking-wider">
                CENTRO DE COMANDO
              </p>
            </div>
          </Link>

          {/* Botón de cierre en vista móvil */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Acceso Rápido a la App Radar */}
        <Link
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-electricViolet/25 to-electricViolet/10 hover:from-electricViolet/35 hover:to-electricViolet/20 border border-electricViolet/40 text-white font-mono text-xs font-bold transition-all shadow-violet-soft cursor-pointer group"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-electricViolet-glow animate-pulse" />
            <span>ABRIR APP RADAR</span>
          </span>
          <ExternalLink className="w-4 h-4 text-electricViolet-glow group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* TARJETA DE PULSO EJECUTIVO (MINI-KPIS EN VIVO PARA EL DUEÑO) */}
        <div className="p-3.5 rounded-xl bg-obsidian-surface border border-white/10 space-y-2.5 shadow-card-elevation">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              PULSO EJECUTIVO
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {activeUsersNow} online
            </span>
          </div>

          <div className="flex items-baseline justify-between border-t border-white/5 pt-2">
            <span className="text-[11px] font-mono text-neutral-400">MRR Unlimited:</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              ${displayMrr.toFixed(2)}{" "}
              <span className="text-[9px] text-neutral-500 font-normal">USD</span>
            </span>
          </div>

          {/* Alerta Duress si está activa */}
          {activeDuressCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onSelectTab("dashboard");
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full mt-1 p-2 rounded-lg bg-bloodNeon/25 border border-bloodNeon text-bloodNeon text-[10px] font-mono font-bold animate-pulse flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeDuressCount} DURESS ACTIVO</span>
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Buscador Rápido de Pestañas para Desktop */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={tabFilterQuery}
            onChange={(e) => setTabFilterQuery(e.target.value)}
            placeholder="Filtrar módulos..."
            className="w-full bg-obsidian-surface border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-electricViolet"
          />
        </div>
      </div>

      {/* SECCIÓN MEDIA: LISTADO DE MÓDULOS ESTRATÉGICOS CON NAVEGACIÓN VERTICAL */}
      <nav aria-label="Navegación del Sistema" className="flex-1 space-y-4 overflow-y-auto scrollbar-none pr-1">
        {visibleModules.map((mod) => (
          <div key={mod.id} className="space-y-1">
            {/* Header del Módulo */}
            <div className="px-3 pt-1 pb-1 text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center justify-between">
              <span>{mod.name}</span>
            </div>

            {/* Lista vertical de pestañas del módulo con targets de 44px */}
            <div className="space-y-1">
              {mod.tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      isActive
                        ? "bg-electricViolet text-white border border-electricViolet/60 shadow-violet-soft font-bold"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-neutral-400"
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>

                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono tracking-tight ml-2 flex-shrink-0 ${
                          tab.badgeColor ||
                          (isActive
                            ? "bg-black/30 text-white border border-white/20"
                            : "bg-white/10 text-neutral-300 border border-white/10")
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* SECCIÓN INFERIOR: OPERADOR CONECTADO & RBAC */}
      {currentStaff && (
        <div className="pt-3 border-t border-white/10">
          <div className="p-3 rounded-xl bg-obsidian-surface border border-white/10 flex items-center gap-3 shadow-card-elevation">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
              {currentStaff.avatarUrl ? (
                <img
                  src={currentStaff.avatarUrl}
                  alt={currentStaff.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-electricViolet-glow font-mono">
                  {currentStaff.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider leading-none truncate">
                Operador conectado
              </div>
              <div className="text-xs font-bold text-white font-mono mt-1 truncate">
                {currentStaff.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. BARRA LATERAL FIJA EN ESCRITORIO (Desktop Executive Sidebar) */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 bg-obsidian-deep/95 backdrop-blur-xl border-r border-white/10 z-30 select-none overflow-y-auto scrollbar-none shadow-2xl">
        {renderNavContent()}
      </aside>

      {/* 2. DRAWER DESPLEGABLE EN PANTALLAS MÓVILES / TABLETS */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú de Navegación"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 lg:hidden flex animate-in fade-in"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-obsidian-deep border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
