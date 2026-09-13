"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StaffMember } from "@/types/admin";
import { VesselLogo } from "@/components/brand/VesselLogo";
import {
  ShieldAlert,
  Radio,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Clock,
  Sparkles,
  Shield,
  Headphones,
} from "lucide-react";

interface AdminHeaderProps {
  currentStaff: StaffMember;
  staffList: StaffMember[];
  onSwitchStaff: (staffId: string) => void;
  activeDuressCount: number;
  pendingReportsCount: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentStaff,
  staffList,
  onSwitchStaff,
  activeDuressCount,
  pendingReportsCount,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>("");

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
            TRUST & SAFETY
          </span>
        );
      case "support":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 tracking-wider">
            CARE // SUPPORT
          </span>
        );
    }
  };

  return (
    <header className="w-full bg-obsidian-deep/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Marca & Telemetría del Sistema */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            title="Volver al Radar de la App"
          >
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-electricViolet/50 transition-colors">
              <VesselLogo size={20} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  VESSEL<span className="text-electricViolet-glow font-normal"> // OPS</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                  COMMAND
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono tracking-wider">
                CENTRO DE CONTROL & SEGURIDAD
              </p>
            </div>
          </Link>

          {/* Reloj HUD & Estado del Servidor */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{timeStr || "00:00:00"} LOC</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SISTEMA EN VIVO
            </div>
          </div>
        </div>

        {/* Alertas Críticas & Selector de Operador */}
        <div className="flex items-center gap-3">
          {/* Indicador de Coacción / Duress Activo */}
          {activeDuressCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              <span>{activeDuressCount} DURESS ACTIVO</span>
            </div>
          )}

          {/* Selector de Personal (Staff Switcher) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
                {currentStaff.avatarUrl ? (
                  <img
                    src={currentStaff.avatarUrl}
                    alt={currentStaff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-electricViolet-glow">
                    {currentStaff.name[0]}
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white font-mono leading-none">
                  {currentStaff.name}
                </div>
                <div className="mt-0.5">{getRoleBadge(currentStaff.role)}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* Dropdown de cambio rápido de empleado */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-obsidian-surface border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-white/10 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Cambiar Operador Activo (RBAC)
                </div>
                <div className="space-y-1 mt-1">
                  {staffList.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        onSwitchStaff(member.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                        currentStaff.id === member.id
                          ? "bg-white/10 border border-electricViolet/40"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-electricViolet-glow">
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enlace directo a la app cliente */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-electricViolet text-white text-xs font-bold font-mono tracking-wider hover:bg-electricViolet-glow transition-colors shadow-violet-soft"
          >
            <span>APP RADAR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
