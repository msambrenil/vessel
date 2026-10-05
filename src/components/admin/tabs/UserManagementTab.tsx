"use client";

import React, { useState, useMemo } from "react";
import { ManagedUserProfile, StaffMember, UserModerationStatus } from "@/types/admin";
import {
  Search,
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
  X,
  Sparkles,
  RefreshCw,
  Trash2,
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
  onDeleteUser?: (userId: string) => Promise<void> | void;
}

type FilterOption = "all" | "verified" | "unverified" | "fog" | "unlimited" | "sanctioned";
type DrawerSubTab = "identity" | "behavior" | "security";

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
  onDeleteUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [drawerTab, setDrawerTab] = useState<DrawerSubTab>("identity");
  const [actionReason, setActionReason] = useState("");
  const [sanctionFeedback, setSanctionFeedback] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUserProfile | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Motivos preconfigurados rioplatenses para agilizar la moderación
  const reasonPresets = [
    "Perfil trucho / Catfish",
    "Desubicado / Acoso en el chat",
    "Ghosteo reiterado / Dejó plantado",
    "Fotos íntimas sin consentimiento",
    "Sospecha de menor de edad",
    "Spam comercial o cobro de servicios",
    "Riesgo de seguridad personal",
  ];

  // Filtrado reactivo en tiempo real
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        u.codename.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.yoSoy && u.yoSoy.toLowerCase().includes(q));

      if (!matchesQuery) return false;

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
            APERCIBIDO
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

  const handleApplySanctionWithValidation = (
    status: UserModerationStatus,
    hours?: number
  ) => {
    if (!selectedUser) return;
    const finalReason = actionReason.trim();
    if (!finalReason) {
      setSanctionFeedback("Escribí o elegí un motivo obligatorio antes de aplicar la sanción.");
      return;
    }
    onApplyModeration(selectedUser.id, status, finalReason, hours);
    setSanctionFeedback(`Sanción aplicada: ${status.toUpperCase()}`);
    setActionReason("");
    setTimeout(() => setSanctionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTROS DE BÚSQUEDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscá por codename, ID, rol, orientación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-surface border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
          />
        </div>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
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
              className={`px-3 py-2 min-h-[40px] rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                activeFilter === filter.id
                  ? "bg-electricViolet text-white shadow-violet-soft border border-electricViolet/50"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE USUARIOS DE ALTA DENSIDAD Y ESCANEABILIDAD */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-deep/90 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Usuario / Codename</th>
                <th className="py-3.5 px-4">Rol & Estado</th>
                <th className="py-3.5 px-4">Biometría</th>
                <th className="py-3.5 px-4">Respect Karma</th>
                <th className="py-3.5 px-4">Membresía</th>
                <th className="py-3.5 px-4">Estado Cuenta</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
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
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => onSelectUser(user)}
                    >
                      {/* Avatar & Codename */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.codename}
                                className={`w-full h-full object-cover ${isFog ? "blur-[2.5px]" : ""}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-electricViolet/20 text-electricViolet-glow font-bold text-xs font-mono">
                                {(user.codename || "U").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {isFog && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <CloudFog className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                              <span>{user.codename}</span>
                              {user.hasSafetyAlert && (
                                <span className="p-0.5 rounded bg-bloodNeon text-white animate-pulse" title="¡Duress PIN / Alerta activa!">
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              ID: {user.id} · {user.age} años
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol & Estado Corporal en Rioplatense */}
                      <td className="py-3 px-4">
                        <div className="text-white font-bold">{user.role}</div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {user.bodyState === "open"
                            ? "🟢 Activo"
                            : user.bodyState === "occupied"
                            ? "🟡 Ocupado"
                            : "⚪ En pausa"}
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
                          <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-neutral-500" />
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
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {user.totalEncountersVerified || 0} confirmados
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectUser(user);
                            }}
                            className="px-3 py-2 min-h-[44px] rounded-xl bg-white/5 hover:bg-electricViolet/20 text-electricViolet-glow hover:text-white border border-electricViolet/30 font-bold text-xs transition-colors cursor-pointer touch-manipulation"
                          >
                            Inspeccionar
                          </button>
                          {onDeleteUser && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(user);
                              }}
                              className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-bloodNeon/10 hover:bg-bloodNeon/25 text-neutral-400 hover:text-bloodNeon border border-white/5 hover:border-bloodNeon/40 transition-colors cursor-pointer touch-manipulation flex items-center justify-center"
                              title={`Eliminar a @${user.codename}`}
                              aria-label={`Eliminar a ${user.codename}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN PERMANENTE */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-obsidian-surface border border-bloodNeon/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[0_0_30px_rgba(255,0,55,0.25)]">
            <div className="flex items-center gap-2.5 text-bloodNeon font-mono font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>ELIMINACIÓN PERMANENTE DE USUARIO</span>
            </div>
            <p className="text-xs text-neutral-200 font-mono leading-relaxed">
              ¿Estás seguro de que querés eliminar definitivamente la cuenta de <strong className="text-white">@{userToDelete.codename}</strong>?
            </p>
            <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[11px] space-y-1 text-neutral-400">
              <div><strong className="text-neutral-300">ID:</strong> {userToDelete.id}</div>
              <div><strong className="text-neutral-300">Rol:</strong> {userToDelete.role} · {userToDelete.age} años</div>
              <div><strong className="text-neutral-300">Karma:</strong> {userToDelete.respectScore || 85}%</div>
            </div>
            <p className="text-[11px] text-bloodNeon font-mono">
              ⚠️ Esta acción eliminará el perfil de Firestore y de la memoria del sistema de forma irrevocable.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteUser) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteUser(userToDelete.id);
                    setUserToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="py-2.5 min-h-[44px] rounded-xl bg-bloodNeon hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? "Eliminando..." : "Sí, Eliminar"}</span>
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="py-2.5 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer touch-manipulation"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER LATERAL DE INSPECCIÓN 360° REDISEÑADO EN 3 SOLAPAS */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha 360° de ${selectedUser.codename}`}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in select-none"
        >
          <div className="w-full max-w-xl bg-obsidian-surface border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Cabecera del Drawer */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.codename}
                      className={`w-full h-full object-cover ${
                        selectedUser.isFogMode || selectedUser.forcedFogMode ? "blur-[3px]" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-electricViolet/20 text-electricViolet-glow font-bold text-sm font-mono">
                      {(selectedUser.codename || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}
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
                className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer touch-manipulation flex items-center justify-center"
                title="Cerrar ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BARRA DE SOLAPAS (3 TABS CLARAS) */}
            <div className="grid grid-cols-3 border-b border-white/10 bg-obsidian-deep/80 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setDrawerTab("identity")}
                className={`py-3 px-2 min-h-[44px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  drawerTab === "identity"
                    ? "border-electricViolet text-white bg-white/5"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4 text-electricViolet-glow" />
                <span className="truncate">1. Identidad</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerTab("behavior")}
                className={`py-3 px-2 min-h-[44px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  drawerTab === "behavior"
                    ? "border-bloodNeon text-white bg-white/5"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4 text-bloodNeon" />
                <span className="truncate">2. Conducta</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerTab("security")}
                className={`py-3 px-2 min-h-[44px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  drawerTab === "security"
                    ? "border-emerald-400 text-white bg-white/5"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="truncate">3. Plan & Seguridad</span>
              </button>
            </div>

            {/* CONTENIDO DE CADA SOLAPA */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-xs pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
              {/* Feedback Toast dentro del Drawer */}
              {sanctionFeedback && (
                <div className="p-3 rounded-xl bg-electricViolet/20 border border-electricViolet text-white font-bold animate-in fade-in">
                  {sanctionFeedback}
                </div>
              )}

              {/* =========================================================
                  SOLAPA 1: IDENTIDAD & BIOMETRÍA
                  ========================================================= */}
              {drawerTab === "identity" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Validación Biométrica Facial 3D
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        Confianza: {selectedUser.verification?.trustScore || 88}%
                      </span>
                    </div>

                    {/* Comparación Avatar vs Selfie 3D */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider">
                          Foto de Perfil Pública
                        </div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                          <img
                            src={selectedUser.avatarUrl}
                            alt="Foto pública"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider">
                          Selfie 3D de Validación
                        </div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-black border border-white/10 relative">
                          <img
                            src={selectedUser.avatarUrl}
                            alt="Selfie 3D"
                            className="w-full h-full object-cover filter contrast-125"
                          />
                          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-black/70 text-[9px] text-emerald-400 font-bold border border-emerald-500/40">
                            SCAN 3D OK
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400 space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div>Estado actual: <strong className="text-white">{selectedUser.verification?.isVerified ? "Verificado Oficial" : "Pendiente de verificación"}</strong></div>
                      <div>Orientación / Yo Soy: <strong className="text-white">{selectedUser.yoSoy || "Sin especificar"}</strong></div>
                    </div>

                    {/* Botones de Validación de Identidad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() =>
                          onVerifyUser(
                            selectedUser.id,
                            true,
                            actionReason || "Identidad biométrica aprobada en consola"
                          )
                        }
                        className="px-3.5 py-3 min-h-[44px] rounded-xl bg-mintNeon hover:bg-emerald-400 text-obsidian-deep font-black shadow-mint-glow text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
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
                            actionReason || "Requiere nueva selfie por falta de nitidez o sospecha de bot"
                          )
                        }
                        className="px-3.5 py-3 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Pedir nueva selfie
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SOLAPA 2: COMPORTAMIENTO & SANCIONES
                  ========================================================= */}
              {drawerTab === "behavior" && (
                <div className="space-y-4">
                  {/* Respect Karma */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        Puntuación de Respect Karma
                      </span>
                      <span className={`text-base font-black ${getKarmaColor(selectedUser.respectScore)}`}>
                        {selectedUser.respectScore || 85}%
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400">
                      Ajustá el puntaje de respeto según la conducta en chats y citas confirmadas:
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustKarma(selectedUser.id, 15, actionReason || "Premio por buena conducta")
                        }
                        className="py-2.5 min-h-[44px] rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors font-bold cursor-pointer touch-manipulation"
                      >
                        +15 Karma
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustKarma(selectedUser.id, -10, actionReason || "Llamado de atención leve")
                        }
                        className="py-2.5 min-h-[44px] rounded-xl bg-purple-950/40 text-purple-300 border border-purple-500/40 hover:bg-purple-900/40 transition-colors font-bold cursor-pointer touch-manipulation"
                      >
                        -10 Karma
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAdjustKarma(selectedUser.id, -25, actionReason || "Penalización por ghosteo grave")
                        }
                        className="py-2.5 min-h-[44px] rounded-xl bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 hover:bg-bloodNeon/30 transition-colors font-bold cursor-pointer touch-manipulation"
                      >
                        -25 Karma
                      </button>
                    </div>
                  </div>

                  {/* Centro de Sanciones Disciplinarias */}
                  <div className="p-4 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 space-y-3">
                    <span className="text-xs font-bold text-bloodNeon uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      Régimen Sancionatorio
                    </span>

                    {/* Presets de Motivo de Sanción */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        Elegí un motivo o escribilo abajo:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {reasonPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setActionReason(preset)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                              actionReason === preset
                                ? "bg-bloodNeon text-white border-bloodNeon"
                                : "bg-black/40 text-neutral-300 border-white/10 hover:border-white/20"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input de motivo obligatorio */}
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Motivo de la sanción (obligatorio)..."
                      className="w-full bg-obsidian-surface border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:ring-1 focus:ring-bloodNeon"
                    />

                    {/* Botones de acción disciplinaria */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplySanctionWithValidation("warned")}
                        className="p-2.5 min-h-[44px] rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Apercibir
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplySanctionWithValidation("suspended", 24)}
                        className="p-2.5 min-h-[44px] rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Suspender 24h
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplySanctionWithValidation("suspended", 168)}
                        className="p-2.5 min-h-[44px] rounded-xl bg-purple-700/30 text-purple-200 border border-purple-600/50 hover:bg-purple-700/40 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Suspender 7d
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplySanctionWithValidation("banned")}
                        className="p-2.5 min-h-[44px] rounded-xl bg-bloodNeon/25 text-bloodNeon border border-bloodNeon/50 hover:bg-bloodNeon/35 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Baneo definitivo
                      </button>
                    </div>

                    {/* Opción de levantar sanción si el usuario está penalizado */}
                    {selectedUser.moderationStatus && selectedUser.moderationStatus !== "active" && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyModeration(
                            selectedUser.id,
                            "active",
                            actionReason || "Sanción levantada tras revisión de soporte"
                          );
                          setSanctionFeedback("Cuenta reactivada exitosamente.");
                          setActionReason("");
                          setTimeout(() => setSanctionFeedback(null), 3500);
                        }}
                        className="w-full mt-2 py-2.5 min-h-[44px] rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Levantar sanción / Reactivar cuenta
                      </button>
                    )}

                    {/* ZONA DE PELIGRO // ELIMINACIÓN PERMANENTE */}
                    {onDeleteUser && (
                      <div className="pt-4 mt-6 border-t border-bloodNeon/30 space-y-3">
                        <div className="flex items-center gap-2 text-bloodNeon text-xs font-bold font-mono">
                          <Trash2 className="w-4 h-4" />
                          <span>ZONA DE PELIGRO // ELIMINAR CUENTA</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          Elimina al usuario permanentemente de la base de datos de producción y del sistema. Esta acción no se puede deshacer.
                        </p>

                        {isConfirmingDelete ? (
                          <div className="p-3.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon space-y-3 animate-in fade-in">
                            <div className="text-xs font-bold text-white font-mono">
                              ¿Confirmás eliminar definitivamente a <span className="text-bloodNeon">@{selectedUser.codename}</span>?
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={async () => {
                                  setIsDeleting(true);
                                  try {
                                    await onDeleteUser(selectedUser.id);
                                    setIsConfirmingDelete(false);
                                    onSelectUser(null);
                                  } finally {
                                    setIsDeleting(false);
                                  }
                                }}
                                className="py-2.5 min-h-[44px] rounded-xl bg-bloodNeon hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
                              >
                                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                <span>{isDeleting ? "Eliminando..." : "Sí, Eliminar"}</span>
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setIsConfirmingDelete(false)}
                                className="py-2.5 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer touch-manipulation"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="w-full py-2.5 min-h-[44px] rounded-xl bg-bloodNeon/15 hover:bg-bloodNeon/25 text-bloodNeon border border-bloodNeon/40 hover:border-bloodNeon/60 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar Usuario Definitivamente</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  SOLAPA 3: MEMBRESÍA & SEGURIDAD
                  ========================================================= */}
              {drawerTab === "security" && (
                <div className="space-y-4">
                  {/* ALERTA CRÍTICA DE COACCIÓN / DURESS PIN */}
                  {selectedUser.hasSafetyAlert ? (
                    <div className="p-4 rounded-xl bg-bloodNeon/20 border-2 border-bloodNeon space-y-3 animate-pulse">
                      <div className="flex items-center gap-2 text-bloodNeon font-black text-xs uppercase">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>¡ALERTA DE DURESS PIN DISPARADA!</span>
                      </div>
                      <p className="text-[11px] text-neutral-200">
                        El usuario introdujo su clave de coacción táctica o emitió una baliza silenciosa.
                      </p>
                      <button
                        type="button"
                        onClick={() => onClearDuress(selectedUser.id)}
                        className="w-full py-2.5 min-h-[44px] rounded-xl bg-bloodNeon text-white font-bold hover:bg-red-700 transition-colors cursor-pointer touch-manipulation"
                      >
                        Blanquear Duress PIN / Desactivar Alerta
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-neutral-400 text-xs">Estado de Seguridad:</span>
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Sin alertas de coacción
                      </span>
                    </div>
                  )}

                  {/* GESTIÓN DE PLAN / MEMBRESÍA */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        Plan de Membresía
                      </span>
                      <span className="text-white font-bold text-xs">
                        {selectedUser.isUnlimited || selectedUser.userPlan === "unlimited"
                          ? "VESSEL UNLIMITED"
                          : "PLAN FREE"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onChangePlan(
                            selectedUser.id,
                            "unlimited",
                            actionReason || "Asignación Unlimited de cortesía VIP"
                          )
                        }
                        className="py-2.5 min-h-[44px] rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Asignar Unlimited
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangePlan(
                            selectedUser.id,
                            "free",
                            actionReason || "Revocación a plan gratuito"
                          )
                        }
                        className="py-2.5 min-h-[44px] rounded-xl bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 font-bold transition-colors cursor-pointer touch-manipulation text-center"
                      >
                        Pasar a Free
                      </button>
                    </div>
                  </div>

                  {/* CONTROL DE PRIVACIDAD / MODO NIEBLA */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CloudFog className="w-4 h-4 text-electricViolet-glow" />
                        Control de Modo Niebla
                      </span>
                      <span className="text-xs text-neutral-400">
                        {selectedUser.isFogMode || selectedUser.forcedFogMode
                          ? "Activo"
                          : "Desactivado"}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400">
                      Forzar Modo Niebla desenfoca la foto pública del usuario y oculta la distancia métrica precisa en el radar.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleFogMode(
                          selectedUser.id,
                          !selectedUser.isFogMode && !selectedUser.forcedFogMode
                        )
                      }
                      className={`w-full py-2.5 min-h-[44px] rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation ${
                        selectedUser.isFogMode || selectedUser.forcedFogMode
                          ? "bg-neutral-800 text-white border-white/20"
                          : "bg-white/5 hover:bg-white/10 text-neutral-200 border-white/10"
                      }`}
                    >
                      <CloudFog className="w-4 h-4" />
                      {selectedUser.isFogMode || selectedUser.forcedFogMode
                        ? "Quitar Modo Niebla"
                        : "Forzar Modo Niebla"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
