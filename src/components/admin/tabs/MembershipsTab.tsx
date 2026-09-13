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
  Clock,
  Layers,
  ShieldCheck,
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
    setFeedbackMsg("Cuotas maestras del sistema actualizadas exitosamente.");
    setTimeout(() => setFeedbackMsg(null), 3000);
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
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-electricViolet text-white font-bold font-mono text-xs px-4 py-2 rounded-full shadow-violet-soft animate-in fade-in zoom-in-95">
          {feedbackMsg}
        </div>
      )}

      {/* METRICAS DE MONETIZACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-2 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-emerald-400" />
            Suscriptores VESSEL UNLIMITED
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {unlimitedUsers.length}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            {Math.round((unlimitedUsers.length / (users.length || 1)) * 100)}% de la base total activa
          </p>
        </div>

        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-2 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-electricViolet-glow" />
            MRR Estimado (Recurrente Mensual)
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ${(unlimitedUsers.length * 14.99).toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            Tarifa oficial: $14.99 USD / mes
          </p>
        </div>

        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-2 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Usuarios en Plan Free
          </div>
          <div className="text-3xl font-black text-neutral-300 font-mono">
            {freeUsers.length}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            Sujetos a cuotas tácticas gratuitas
          </p>
        </div>
      </div>

      {/* ASIGNADOR MANUAL DE MEMBRESÍA & BENEFICIOS */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-electricViolet-glow" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Otorgar o Revocar Membresía a Usuario
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">OPERACIÓN INMEDIATA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Selector de Usuario */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-neutral-400 text-[10px] uppercase">Seleccionar Usuario</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <option value="">-- Selecciona un perfil --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.codename} (ID: {u.id} · Plan actual: {u.isUnlimited ? "UNLIMITED" : "FREE"})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Nivel */}
          <div className="space-y-1">
            <label className="text-neutral-400 text-[10px] uppercase">Plan a Asignar</label>
            <select
              value={grantTier}
              onChange={(e) => setGrantTier(e.target.value as "unlimited" | "free")}
              className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-electricViolet"
            >
              <option value="unlimited">VESSEL UNLIMITED</option>
              <option value="free">PLAN GRATUITO</option>
            </select>
          </div>

          {/* Botón de Aplicación */}
          <div className="space-y-1 flex flex-col justify-end">
            <button
              type="button"
              disabled={!selectedUserId}
              onClick={handleGrantPlan}
              className="w-full py-2 px-3 rounded-xl bg-electricViolet disabled:opacity-40 text-white font-bold text-xs hover:bg-electricViolet-glow transition-colors font-mono cursor-pointer shadow-violet-soft"
            >
              APLICAR CAMBIO
            </button>
          </div>
        </div>

        <div className="font-mono text-xs">
          <input
            type="text"
            value={grantReason}
            onChange={(e) => setGrantReason(e.target.value)}
            placeholder="Motivo / Justificación del cambio (Ej: Embajador VIP, Compensación de soporte, etc.)..."
            className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
          />
        </div>
      </div>

      {/* CALIBRADOR DE CUOTAS GLOBALES (REGLAS DE NEGOCIO) */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-electricViolet-glow" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Calibración de Cuotas Maestras (Plan Free vs Unlimited)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSaveQuotas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mintNeon hover:bg-emerald-400 text-obsidian-deep font-black shadow-mint-glow text-xs font-mono transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar Cuotas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {/* Cuota 1: Radio de Radar Free */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
              Radio Radar Free (Metros)
            </div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-electricViolet-glow" />
              <input
                type="number"
                value={quotas.maxFreeRadarDistanceMeters}
                onChange={(e) =>
                  setQuotas({
                    ...quotas,
                    maxFreeRadarDistanceMeters: Number(e.target.value),
                  })
                }
                className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
              />
            </div>
            <p className="text-[10px] text-neutral-500">
              Por encima de esta distancia, los perfiles Free se muestran con Intriga Táctica (blur).
            </p>
          </div>

          {/* Cuota 2: Álbumes Públicos Free */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
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
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-500">
              Límite estricto de galerías abiertas para usuarios no suscriptores.
            </p>
          </div>

          {/* Cuota 3: Bóvedas Privadas Free */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
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
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-500">
              Unlimited permite multi-bóvedas temáticas ilimitadas.
            </p>
          </div>

          {/* Cuota 4: Fotos por Álbum Free */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
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
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-500">
              Cantidad máxima de fotos cargadas en cada álbum gratuito.
            </p>
          </div>

          {/* Cuota 5: Longitud de Bio Free */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
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
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-500">
              Caracteres permitidos en biografía / declaración de perfil.
            </p>
          </div>

          {/* Cuota 6: Umbral de Respect Karma para Boost */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-neutral-400 text-[10px] uppercase">
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
              className="w-full bg-obsidian-deep border border-white/10 rounded-lg px-2.5 py-1 text-white font-bold"
            />
            <p className="text-[10px] text-neutral-500">
              Score mínimo para recibir la insignia Anti-Ghost y mayor visibilidad en radar.
            </p>
          </div>
        </div>
      </div>

      {/* LISTADO DE USUARIOS CON VESSEL UNLIMITED */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
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
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
                          <img
                            src={user.avatarUrl}
                            alt={user.codename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.codename}</div>
                          <div className="text-[10px] text-neutral-500">ID: {user.id}</div>
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
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-bloodNeon border border-bloodNeon/30 font-bold text-[10px] transition-colors cursor-pointer"
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
