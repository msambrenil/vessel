"use client";

import React, { useState, useMemo } from "react";
import { ManagedUserProfile, StaffMember, UserModerationStatus } from "@/types/admin";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ShieldAlert,
  Flame,
  CreditCard,
  CloudFog,
  Lock,
  UserX,
  UserCheck,
  Eye,
  Sliders,
  X,
  Sparkles,
} from "lucide-react";

interface UserManagementTabProps {
  users: ManagedUserProfile[];
  currentStaff: StaffMember;
  selectedUser: ManagedUserProfile | null;
  onSelectUser: (user: ManagedUserProfile | null) => void;
  onApplyModeration: (
    userId: string,
    status: UserModerationStatus,
    reason: string,
    hours?: number
  ) => void;
  onAdjustKarma: (userId: string, delta: number, reason: string) => void;
  onVerifyUser: (userId: string, approved: boolean, notes: string) => void;
  onToggleFogMode: (userId: string, forceFog: boolean) => void;
  onChangePlan: (userId: string, tier: "free" | "unlimited", reason: string) => void;
  onClearDuress: (userId: string) => void;
}

type FilterOption = "all" | "verified" | "unverified" | "fog" | "unlimited" | "sanctioned";

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  currentStaff,
  selectedUser,
  onSelectUser,
  onApplyModeration,
  onAdjustKarma,
  onVerifyUser,
  onToggleFogMode,
  onChangePlan,
  onClearDuress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [actionReason, setActionReason] = useState("");

  // Filtrado reactivo en tiempo real
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Búsqueda por texto
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.codename.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.yoSoy && u.yoSoy.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      // Filtro por categoría
      switch (activeFilter) {
        case "verified":
          return Boolean(u.verification?.isVerified);
        case "unverified":
          return !u.verification?.isVerified;
        case "fog":
          return Boolean(u.isFogMode || u.forcedFogMode);
        case "unlimited":
          return Boolean(u.isUnlimited || u.userPlan === "unlimited");
        case "sanctioned":
          return u.moderationStatus && u.moderationStatus !== "active";
        default:
          return true;
      }
    });
  }, [users, searchQuery, activeFilter]);

  const getKarmaColor = (score: number = 85) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 60) return "text-electricViolet-glow";
    return "text-bloodNeon";
  };

  const getStatusBadge = (status?: UserModerationStatus) => {
    switch (status) {
      case "banned":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 font-bold">
            BANEADO
          </span>
        );
      case "warned":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            ADVERTIDO
          </span>
        );
      case "suspended":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
            SUSPENDIDO
          </span>
        );
      case "active":
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
            ACTIVO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTROS DE BÚSQUEDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por codename, ID, rol, orientación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-surface border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
          />
        </div>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs font-mono">
          {(
            [
              { id: "all", label: "Todos" },
              { id: "verified", label: "Verificados" },
              { id: "unverified", label: "Sin Verificar" },
              { id: "fog", label: "Modo Niebla" },
              { id: "unlimited", label: "Unlimited" },
              { id: "sanctioned", label: "Sancionados" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter.id
                  ? "bg-electricViolet text-white font-bold shadow-violet-soft"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE USUARIOS DE ALTA DENSIDAD */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-deep/90 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Usuario / Codename</th>
                <th className="py-3 px-4">Rol & Estado</th>
                <th className="py-3 px-4">Biometría</th>
                <th className="py-3 px-4">Respect Karma</th>
                <th className="py-3 px-4">Membresía</th>
                <th className="py-3 px-4">Estado Cuenta</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500">
                    No se encontraron usuarios con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isVerified = user.verification?.isVerified;
                  const isFog = user.isFogMode || user.forcedFogMode;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => onSelectUser(user)}
                    >
                      {/* Avatar & Codename */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                            <img
                              src={user.avatarUrl}
                              alt={user.codename}
                              className={`w-full h-full object-cover ${isFog ? "blur-[2.5px]" : ""}`}
                            />
                            {isFog && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <CloudFog className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                              <span>{user.codename}</span>
                              {user.hasSafetyAlert && (
                                <span className="p-0.5 rounded bg-bloodNeon text-white animate-pulse" title="¡Duress PIN / Alerta activa!">
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              ID: {user.id} · {user.age} años
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol & Estado Corporal */}
                      <td className="py-3 px-4">
                        <div className="text-white font-bold">{user.role}</div>
                        <div className="text-[10px] text-neutral-400 capitalize">
                          {user.bodyState === "open"
                            ? "🟢 Activo"
                            : user.bodyState === "occupied"
                            ? "🟡 Ocupado"
                            : "⚪ De incógnito"}
                        </div>
                      </td>

                      {/* Verificación */}
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ID OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            Pendiente
                          </span>
                        )}
                        {isFog && (
                          <div className="text-[9px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <CloudFog className="w-3 h-3" />
                            Modo Niebla
                          </div>
                        )}
                      </td>

                      {/* Respect Karma */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Flame className={`w-3.5 h-3.5 ${getKarmaColor(user.respectScore)}`} />
                          <span className={`font-bold ${getKarmaColor(user.respectScore)}`}>
                            {user.respectScore || 85}%
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {user.totalEncountersVerified || 0} encuentros
                        </div>
                      </td>

                      {/* Membresía */}
                      <td className="py-3 px-4">
                        {user.isUnlimited || user.userPlan === "unlimited" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            UNLIMITED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                            FREE
                          </span>
                        )}
                      </td>

                      {/* Estado Cuenta */}
                      <td className="py-3 px-4">{getStatusBadge(user.moderationStatus)}</td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUser(user);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-electricViolet/20 text-electricViolet-glow hover:text-white border border-electricViolet/30 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Inspeccionar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER LATERAL DE INSPECCIÓN 360° */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-obsidian-surface border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Cabecera del Drawer */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.codename}
                    className={`w-full h-full object-cover ${
                      selectedUser.isFogMode || selectedUser.forcedFogMode ? "blur-[3px]" : ""
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white font-mono">
                      {selectedUser.codename}
                    </h3>
                    {getStatusBadge(selectedUser.moderationStatus)}
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    ID: {selectedUser.id} · {selectedUser.age} años · {selectedUser.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectUser(null)}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modular con Scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-xs">
              {/* ALERTA DE COACCIÓN ACTIVA */}
              {selectedUser.hasSafetyAlert && (
                <div className="p-3.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-bloodNeon font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>ALERTA DE DURESS PIN ACTIVA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onClearDuress(selectedUser.id)}
                    className="px-2.5 py-1 rounded bg-bloodNeon text-white text-[11px] font-bold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Desactivar Alerta
                  </button>
                </div>
              )}

              {/* SECCIÓN 1: BIOMETRÍA & VERIFICACIÓN FACIAL */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Estación de Verificación Biométrica 3D
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Confianza: {selectedUser.verification?.trustScore || 0}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-neutral-400 mb-1">Foto de Perfil Actual</div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                      <img
                        src={selectedUser.avatarUrl}
                        alt="Foto pública"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 mb-1">Prueba de Vida (Liveness 3D)</div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                      <img
                        src={selectedUser.avatarUrl}
                        alt="Selfie 3D"
                        className="w-full h-full object-cover filter contrast-125"
                      />
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-emerald-400 font-bold border border-emerald-500/30">
                        SCAN OK
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() =>
                      onVerifyUser(
                        selectedUser.id,
                        true,
                        actionReason || "Verificado por consola"
                      )
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-mintNeon hover:bg-emerald-400 text-obsidian-deep font-black shadow-mint-glow text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar ID OK
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onVerifyUser(
                        selectedUser.id,
                        false,
                        "Requiere reverificación por sospecha de bot"
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Pedir Re-scan
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleFogMode(
                        selectedUser.id,
                        !selectedUser.isFogMode && !selectedUser.forcedFogMode
                      )
                    }
                    className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedUser.isFogMode || selectedUser.forcedFogMode
                        ? "bg-neutral-700 text-white border-white/20"
                        : "bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10"
                    }`}
                  >
                    <CloudFog className="w-4 h-4" />
                    {selectedUser.isFogMode || selectedUser.forcedFogMode
                      ? "Quitar Modo Niebla"
                      : "Forzar Modo Niebla"}
                  </button>
                </div>
              </div>

              {/* SECCIÓN 2: CONDUCTA, KARMA & TESTIMONIOS */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    Respect Karma & Conducta
                  </span>
                  <span className="text-white font-bold text-sm">
                    {selectedUser.respectScore || 85}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAdjustKarma(selectedUser.id, 15, actionReason || "Premio por buena conducta")
                    }
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors font-bold cursor-pointer"
                  >
                    +15 Karma
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAdjustKarma(selectedUser.id, -10, actionReason || "Penalización leve")
                    }
                    className="flex-1 py-1.5 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:bg-purple-900/40 transition-colors font-bold cursor-pointer"
                  >
                    -10 Karma
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAdjustKarma(
                        selectedUser.id,
                        -25,
                        actionReason || "Penalización por ghosteo grave"
                      )
                    }
                    className="flex-1 py-1.5 rounded-lg bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 hover:bg-bloodNeon/30 transition-colors font-bold cursor-pointer"
                  >
                    -25 Karma
                  </button>
                </div>
              </div>

              {/* SECCIÓN 3: GESTIÓN DE MEMBRESÍA */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Nivel de Membresía
                  </span>
                  <span className="text-white font-bold">
                    {selectedUser.isUnlimited || selectedUser.userPlan === "unlimited"
                      ? "VESSEL UNLIMITED"
                      : "PLAN GRATUITO"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangePlan(
                        selectedUser.id,
                        "unlimited",
                        actionReason || "Concesión de membresía por soporte / VIP"
                      )
                    }
                    className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-colors cursor-pointer"
                  >
                    Otorgar UNLIMITED (Cortesía)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangePlan(
                        selectedUser.id,
                        "free",
                        actionReason || "Revocación o expiración de membresía"
                      )
                    }
                    className="flex-1 py-2 rounded-xl bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 font-bold transition-colors cursor-pointer"
                  >
                    Pasar a Free
                  </button>
                </div>
              </div>

              {/* SECCIÓN 4: CENTRO DE SANCIONES & MODERACIÓN */}
              <div className="p-4 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 space-y-3">
                <span className="text-xs font-bold text-bloodNeon uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Centro de Sanciones Disciplinarias
                </span>

                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Escribir motivo o justificación de la acción..."
                  className="w-full bg-obsidian-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-bloodNeon"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onApplyModeration(
                        selectedUser.id,
                        "warned",
                        actionReason || "Advertencia por conducta inapropiada"
                      )
                    }
                    className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30 font-bold transition-colors cursor-pointer"
                  >
                    Emitir Advertencia
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onApplyModeration(
                        selectedUser.id,
                        "suspended",
                        actionReason || "Suspensión preventiva",
                        48
                      )
                    }
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 font-bold transition-colors cursor-pointer"
                  >
                    Suspender 48 Horas
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onApplyModeration(
                        selectedUser.id,
                        "banned",
                        actionReason || "Baneo permanente por infracción grave"
                      )
                    }
                    className="p-2 rounded-xl bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 hover:bg-bloodNeon/30 font-bold transition-colors cursor-pointer"
                  >
                    Baneo Definitivo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onApplyModeration(
                        selectedUser.id,
                        "active",
                        actionReason || "Reactivación de cuenta tras revisión"
                      )
                    }
                    className="p-2 rounded-xl bg-white/5 text-emerald-400 border border-emerald-500/30 hover:bg-white/10 font-bold transition-colors cursor-pointer"
                  >
                    Reactivar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
