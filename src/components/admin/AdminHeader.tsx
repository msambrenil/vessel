"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StaffMember } from "@/types/admin";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { useVessel } from "@/context/VesselContext";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  Clock,
  Sparkles,
  Shield,
  FlaskConical,
  Check,
  Menu,
} from "lucide-react";
import { AdminTabId } from "@/components/admin/AdminNav";

interface AdminHeaderProps {
  currentStaff: StaffMember;
  staffList: StaffMember[];
  onSwitchStaff: (staffId: string) => void;
  activeDuressCount: number;
  pendingReportsCount: number;
  activeTab?: AdminTabId;
  onOpenMobileNav?: () => void;
}

const TAB_TITLES: Record<AdminTabId, { module: string; title: string }> = {
  dashboard: { module: "NEGOCIO", title: "Telemetría & KPIs en Vivo" },
  users: { module: "COMUNIDAD", title: "Gestión de Usuarios & Dossier 360°" },
  moderation: { module: "COMUNIDAD", title: "Cola de Denuncias & Seguridad" },
  hotspots: { module: "CATÁLOGO", title: "Puntos de Encuentro Tácticos" },
  kinks: { module: "CATÁLOGO", title: "Morbos & Fetiches de la Matriz" },
  memberships: { module: "GOBERNANZA", title: "Límites de Uso Plan Free & MRR" },
  staff: { module: "GOBERNANZA", title: "Equipo Operativo & Roles RBAC" },
  audit: { module: "GOBERNANZA", title: "Registro de Auditoría Inmutable" },
  beta: { module: "GOBERNANZA", title: "Llaves VIP & Beta Testers" },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentStaff,
  staffList,
  onSwitchStaff,
  activeDuressCount,
  pendingReportsCount,
  activeTab = "dashboard",
  onOpenMobileNav,
}) => {
  const { appMode, setAppMode } = useVessel();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTabInfo = TAB_TITLES[activeTab] || { module: "VESSEL OPS", title: "Centro de Comando" };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setTimeStr(`${hours}:${minutes}:${seconds}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "superadmin":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow font-bold border border-electricViolet/40 tracking-wider">
            ROOT // SUPERADMIN
          </span>
        );
      case "moderator":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40 tracking-wider">
            MODERACIÓN & SEGURIDAD
          </span>
        );
      case "support":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 tracking-wider">
            SOPORTE & CARE
          </span>
        );
    }
  };

  return (
    <header className="w-full bg-obsidian-deep/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 select-none shadow-card-elevation">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Lado Izquierdo: Breadcrumb contextual en Desktop / Botón Hamburger y Brand en Móvil */}
        <div className="flex items-center gap-3">
          {/* Móvil: Botón de abrir menú lateral + logo */}
          <div className="lg:hidden flex items-center gap-2">
            {onOpenMobileNav && (
              <button
                type="button"
                onClick={onOpenMobileNav}
                className="p-2 min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none focus:ring-1 focus:ring-electricViolet"
                title="Abrir menú de navegación"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5 text-electricViolet-glow" />
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer focus:outline-none min-h-[44px]"
              title="Volver al Radar de la App"
            >
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                <VesselLogo size={18} showWordmark={false} />
              </div>
              <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
                VESSEL<span className="text-electricViolet-glow font-normal"> // OPS</span>
              </span>
            </Link>
          </div>

          {/* Desktop: Breadcrumb táctico de la sección activa */}
          <div className="hidden lg:flex items-center gap-2.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 font-bold border border-white/10 uppercase tracking-widest">
              {activeTabInfo.module}
            </span>
            <span className="text-neutral-600 font-mono text-xs">/</span>
            <h1 className="text-sm font-bold text-white font-mono tracking-tight">
              {activeTabInfo.title}
            </h1>
          </div>

          {/* Reloj HUD & Badge de Estado de Matriz */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{timeStr || "00:00:00"} LOC</span>
            </div>

            {/* Badge nítido de Entorno Activo */}
            {isLocalEnvironment() ? (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  appMode === "real"
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
                    : "bg-amber-500/15 text-amber-300 border-amber-400/40"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    appMode === "real" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
                  }`}
                />
                <span>{appMode === "real" ? "MODO REAL ACTIVO" : "MODO PRUEBA ACTIVO"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PROD REAL-TIME</span>
              </div>
            )}
          </div>
        </div>

        {/* Alertas Críticas & Selector de Operador */}
        <div className="flex items-center gap-3">
          {/* Indicador de Coacción / Duress Activo */}
          {activeDuressCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{activeDuressCount} DURESS ACTIVO</span>
            </div>
          )}

          {/* Selector de Personal (Staff Switcher) con min 44px touch target */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                {currentStaff.avatarUrl ? (
                  <img
                    src={currentStaff.avatarUrl}
                    alt={currentStaff.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-electricViolet-glow font-mono">
                    {currentStaff.name[0]}
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider leading-none">
                  Operador conectado
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 leading-none">
                  {currentStaff.name}
                </div>
              </div>
              <div className="hidden lg:block ml-1">
                {getRoleBadge(currentStaff.role)}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </button>

            {/* Dropdown de cambio rápido de operador */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-obsidian-surface border border-white/15 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                    Cambiar de operador
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    Control de accesos y permisos por rol (RBAC)
                  </div>
                </div>
                <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                  {staffList.map((member) => {
                    const isSelected = currentStaff.id === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          onSwitchStaff(member.id);
                          setIsDropdownOpen(false);
                          audioEngine.playPulse();
                        }}
                        className={`w-full min-h-[44px] flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-electricViolet/15 border border-electricViolet/50"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-electricViolet-glow font-mono">
                              {member.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white font-mono truncate">
                            {member.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getRoleBadge(member.role)}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Enlace directo a la app cliente con min 44px touch target */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-electricViolet text-white text-xs font-bold font-mono tracking-wider hover:bg-electricViolet-glow transition-all shadow-violet-soft cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            title="Ir al Radar de la aplicación"
          >
            <span>APP RADAR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

