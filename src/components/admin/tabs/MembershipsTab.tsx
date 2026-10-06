"use client";

import React, { useState } from "react";
import { GlobalQuotaSettings, ManagedUserProfile, StaffMember } from "@/types/admin";
import {
  CreditCard,
  Sliders,
  CheckCircle2,
  Crown,
  Sparkles,
  Save,
  Radio,
  Layers,
  UserPlus,
} from "lucide-react";

interface MembershipsTabProps {
  users: ManagedUserProfile[];
  currentStaff: StaffMember;
  quotaSettings: GlobalQuotaSettings;
  onSaveQuotaSettings: (settings: GlobalQuotaSettings) => void;
  onChangePlan: (userId: string, tier: "free" | "unlimited", reason: string) => void;
}

export const MembershipsTab: React.FC<MembershipsTabProps> = ({
  users,
  currentStaff,
  quotaSettings,
  onSaveQuotaSettings,
  onChangePlan,
}) => {
  const [quotas, setQuotas] = useState<GlobalQuotaSettings>(quotaSettings);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [grantTier, setGrantTier] = useState<"unlimited" | "free">("unlimited");
  const [grantReason, setGrantReason] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const unlimitedUsers = users.filter((u) => u.isUnlimited || u.userPlan === "unlimited");
  const freeUsers = users.filter((u) => !u.isUnlimited && u.userPlan !== "unlimited");

  const handleSaveQuotas = () => {
    onSaveQuotaSettings(quotas);
    setFeedbackMsg("Límites del Plan Free guardados con éxito.");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleGrantPlan = () => {
    if (!selectedUserId) return;
    onChangePlan(
      selectedUserId,
      grantTier,
      grantReason || "Asignación directa desde panel de membresías"
    );
    setFeedbackMsg(`Plan '${grantTier.toUpperCase()}' asignado al usuario con éxito.`);
    setSelectedUserId("");
    setGrantReason("");
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono select-none">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-electricViolet text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-violet-soft border border-white/20 animate-in fade-in zoom-in-95">
          {feedbackMsg}
        </div>
      )}

      {/* METRICAS DE MONETIZACIÓN & ECONOMÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI: Unlimited */}
        <div className="bg-obsidian-surface border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-2 shadow-card-elevation">
          <div className="text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-emerald-400" />
            Suscriptores VESSEL UNLIMITED
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {unlimitedUsers.length}
          </div>
          <p className="text-[11px] text-emerald-400 font-bold">
            {Math.round((unlimitedUsers.length / (users.length || 1)) * 100)}% de conversión de la base total
          </p>
        </div>

        {/* KPI: MRR USD */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 shadow-card-elevation">
          <div className="text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-electricViolet-glow" />
            MRR Estimado (Recurrente Mensual)
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">
            ${(unlimitedUsers.length * 14.99).toFixed(2)}
            <span className="text-xs text-neutral-400 ml-1.5 font-normal">USD / mes</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tarifa oficial: $14.99 USD / mes por suscriptor
          </p>
        </div>

        {/* KPI: Plan Free */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 shadow-card-elevation">
          <div className="text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Usuarios en Plan Free
          </div>
          <div className="text-3xl sm:text-4xl font-black text-neutral-200">
            {freeUsers.length}
          </div>
          <p className="text-[11px] text-neutral-400">
            Sujetos a cuotas del Plan Free
          </p>
        </div>
      </div>

      {/* ASIGNADOR MANUAL DE MEMBRESÍA & BENEFICIOS */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-electricViolet-glow" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Otorgar o Revocar Membresía a Usuario
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase">OPERACIÓN INMEDIATA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Selector de Usuario */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-neutral-400 text-[10px] uppercase tracking-wider">Elegí un perfil</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full min-h-[44px] bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <option value="">-- Seleccioná un usuario --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.codename} (ID: {u.id} · Plan actual: {u.isUnlimited ? "UNLIMITED" : "FREE"})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Nivel */}
          <div className="space-y-1.5">
            <label className="text-neutral-400 text-[10px] uppercase tracking-wider">Plan a asignar</label>
            <select
              value={grantTier}
              onChange={(e) => setGrantTier(e.target.value as "unlimited" | "free")}
              className="w-full min-h-[44px] bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <option value="unlimited">VESSEL UNLIMITED</option>
              <option value="free">PLAN FREE</option>
            </select>
          </div>

          {/* Botón de Aplicación */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="button"
              disabled={!selectedUserId}
              onClick={handleGrantPlan}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-electricViolet disabled:opacity-40 text-white font-bold text-xs hover:bg-electricViolet-glow transition-colors cursor-pointer shadow-violet-soft touch-manipulation"
            >
              APLICAR CAMBIO
            </button>
          </div>
        </div>

        <div>
          <input
            type="text"
            value={grantReason}
            onChange={(e) => setGrantReason(e.target.value)}
            placeholder="Motivo / Justificación del cambio (ej: Embajador VIP, Compensación de soporte, etc.)..."
            className="w-full min-h-[44px] bg-obsidian-deep border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
          />
        </div>
      </div>

      {/* LÍMITES DE USO DEL PLAN FREE (REGLAS DE NEGOCIO & CUOTAS) */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-electricViolet-glow" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Límites de Uso del Plan Free
              </h3>
              <p className="text-[11px] text-neutral-400">
                Reglas maestras de cuotas tácticas para usuarios no suscriptores.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveQuotas}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-mintNeon hover:bg-emerald-400 text-obsidian-deep font-black shadow-mint-glow text-xs transition-colors cursor-pointer touch-manipulation flex-shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Límites</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Cuota 1: Radio de Radar Free */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Radio Radar Free (Metros)
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
              <input
                type="number"
                value={quotas.maxFreeRadarDistanceMeters}
                onChange={(e) =>
                  setQuotas({
                    ...quotas,
                    maxFreeRadarDistanceMeters: Number(e.target.value),
                  })
                }
                className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
              />
            </div>
            <p className="text-[10px] text-neutral-400">
              Más allá de esta distancia, los perfiles se ven borrosos con intriga táctica.
            </p>
          </div>

          {/* Cuota 2: Álbumes Públicos Free */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Máximo Álbumes Públicos (Free)
            </div>
            <input
              type="number"
              value={quotas.maxPublicAlbumsFree}
              onChange={(e) =>
                setQuotas({
                  ...quotas,
                  maxPublicAlbumsFree: Number(e.target.value),
                })
              }
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-400">
              Tope estricto de galerías abiertas para usuarios del Plan Free.
            </p>
          </div>

          {/* Cuota 3: Bóvedas Privadas Free */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Máximo Bóvedas Privadas (Free)
            </div>
            <input
              type="number"
              value={quotas.maxPrivateAlbumsFree}
              onChange={(e) =>
                setQuotas({
                  ...quotas,
                  maxPrivateAlbumsFree: Number(e.target.value),
                })
              }
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-400">
              Los usuarios Unlimited disfrutan de multi-bóvedas temáticas ilimitadas.
            </p>
          </div>

          {/* Cuota 4: Fotos por Álbum Free */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Límite de Fotos por Álbum (Free)
            </div>
            <input
              type="number"
              value={quotas.maxPhotosPerAlbumFree}
              onChange={(e) =>
                setQuotas({
                  ...quotas,
                  maxPhotosPerAlbumFree: Number(e.target.value),
                })
              }
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-400">
              Cantidad máxima de fotos cargadas en cada álbum gratuito.
            </p>
          </div>

          {/* Cuota 5: Longitud de Bio Free */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Caracteres Máximos de Biografía
            </div>
            <input
              type="number"
              value={quotas.maxBioLengthFree}
              onChange={(e) =>
                setQuotas({
                  ...quotas,
                  maxBioLengthFree: Number(e.target.value),
                })
              }
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-400">
              Caracteres permitidos en biografía / declaración de perfil.
            </p>
          </div>

          {/* Cuota 6: Umbral de Respect Karma para Boost */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">
              Umbral Karma para Boost (+35%)
            </div>
            <input
              type="number"
              value={quotas.respectKarmaBoostThreshold}
              onChange={(e) =>
                setQuotas({
                  ...quotas,
                  respectKarmaBoostThreshold: Number(e.target.value),
                })
              }
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-400">
              Puntaje mínimo para recibir la insignia Anti-Ghost y mayor visibilidad en radar.
            </p>
          </div>
        </div>
      </div>

      {/* LISTADO DE USUARIOS CON VESSEL UNLIMITED */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Directorio de Suscriptores VESSEL UNLIMITED ({unlimitedUsers.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-deep/90 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Plan Activo</th>
                <th className="py-3 px-4">Beneficios Habilitados</th>
                <th className="py-3 px-4 text-right">Revocar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unlimitedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-neutral-500">
                    No hay usuarios con membresía VESSEL UNLIMITED en este momento.
                  </td>
                </tr>
              ) : (
                unlimitedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/20 flex-shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.codename}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                const fallback = parent?.querySelector(".membership-avatar-fallback");
                                if (fallback) (fallback as HTMLElement).style.display = "flex";
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div
                            className={`membership-avatar-fallback w-full h-full flex items-center justify-center font-bold text-xs text-electricViolet-glow font-mono ${
                              user.avatarUrl ? "hidden" : "flex"
                            }`}
                          >
                            {(user.codename || "U").slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.codename}</div>
                          <div className="text-[10px] text-neutral-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        VESSEL UNLIMITED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-neutral-300">
                      Bóvedas ilimitadas · Radar global &gt;1.0km · Loops HD
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onChangePlan(
                            user.id,
                            "free",
                            "Revocado desde panel de membresías por operador"
                          )
                        }
                        className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 text-bloodNeon border border-bloodNeon/30 font-bold text-xs transition-colors cursor-pointer touch-manipulation"
                      >
                        Pasar a Free
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
