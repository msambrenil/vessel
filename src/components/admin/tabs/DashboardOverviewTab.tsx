"use client";

import React from "react";
import { AdminDashboardMetrics, ManagedUserProfile } from "@/types/admin";
import {
  Users,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface DashboardOverviewTabProps {
  metrics: AdminDashboardMetrics;
  usersWithDuress: ManagedUserProfile[];
  onNavigateTab: (tabId: "users" | "memberships" | "moderation") => void;
  onSelectUserForInspection: (user: ManagedUserProfile) => void;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  metrics,
  usersWithDuress,
  onNavigateTab,
  onSelectUserForInspection,
}) => {
  const totalBodyStates =
    metrics.bodyStateDistribution.open +
    metrics.bodyStateDistribution.occupied +
    metrics.bodyStateDistribution.dormant || 1;

  const pctOpen = Math.round((metrics.bodyStateDistribution.open / totalBodyStates) * 100);
  const pctOccupied = Math.round((metrics.bodyStateDistribution.occupied / totalBodyStates) * 100);
  const pctDormant = Math.round((metrics.bodyStateDistribution.dormant / totalBodyStates) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* BANNER DE ALERTA CRÍTICA: DURESS PIN / COACCIÓN ACTIVA */}
      {usersWithDuress.length > 0 && (
        <div className="bg-bloodNeon/15 border-2 border-bloodNeon rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-bloodNeon/10 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-bloodNeon/30 text-bloodNeon">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-bloodNeon uppercase font-mono tracking-wider">
                  ALERTA DE SEGURIDAD MÁXIMA: DURESS PIN DISPARADO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bloodNeon text-white font-bold">
                  {usersWithDuress.length} CASO(S)
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Un usuario ingresó su PIN de coacción o activó la baliza de auxilio táctico.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {usersWithDuress.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelectUserForInspection(u)}
                className="px-3 py-1.5 rounded-xl bg-bloodNeon text-white text-xs font-mono font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                INSPECCIONAR {u.codename}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TARJETAS KPI DE ALTA DENSIDAD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ecosistema de Usuarios */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-card-elevation">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Usuarios Registrados
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-electricViolet-glow">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {metrics.totalUsers}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {metrics.activeUsersNow} online
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between border-t border-white/5 pt-2">
            <span>Verificados Biométricos</span>
            <span className="text-white font-bold">
              {metrics.totalUsers - metrics.pendingVerificationsCount} / {metrics.totalUsers}
            </span>
          </div>
        </div>

        {/* KPI 2: Membresías & Ingresos (MRR) */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-card-elevation">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              VESSEL UNLIMITED
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              ${metrics.estimatedMrrUsd.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400 font-mono">USD / mes</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between border-t border-white/5 pt-2">
            <span>Conversión a Pago</span>
            <span className="text-emerald-400 font-bold">
              {metrics.conversionRatePercent}% ({metrics.unlimitedUsers} suscriptores)
            </span>
          </div>
        </div>

        {/* KPI 3: Cultura del Respeto & Anti-Ghost */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-card-elevation">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Respect Karma Score
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-electricViolet-glow">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-electricViolet-glow font-mono tracking-tight">
              {metrics.avgRespectKarma}%
            </span>
            <span className="text-xs text-neutral-400 font-mono">Promedio global</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between border-t border-white/5 pt-2">
            <span>Protocolo No-Ghost</span>
            <span className="text-white font-bold">Activo por defecto</span>
          </div>
        </div>

        {/* KPI 4: Encuentros & Logística PIN */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-card-elevation">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Encuentros Validados
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {metrics.encountersValidated24h}
            </span>
            <span className="text-xs text-blue-400 font-mono font-bold">Rendezvous PIN</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono flex items-center justify-between border-t border-white/5 pt-2">
            <span>Reportes pendientes</span>
            <span
              className={`font-bold ${
                metrics.pendingReportsCount > 0 ? "text-bloodNeon" : "text-emerald-400"
              }`}
            >
              {metrics.pendingReportsCount} casos
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN TELEMÉTRICA INTERACTIVA: ESTADO CORPORAL & ROLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Estados Corporales */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Distribución de Estado Corporal en Radar
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">TIEMPO REAL</span>
          </div>

          {/* Barra de Proporción Brutalista */}
          <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden flex border border-white/10">
            <div
              style={{ width: `${pctOpen}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all relative group"
              title={`Activo (Open): ${metrics.bodyStateDistribution.open} (${pctOpen}%)`}
            />
            <div
              style={{ width: `${pctOccupied}%` }}
              className="bg-electricViolet hover:opacity-90 transition-all relative group"
              title={`Ocupado (Occupied): ${metrics.bodyStateDistribution.occupied} (${pctOccupied}%)`}
            />
            <div
              style={{ width: `${pctDormant}%` }}
              className="bg-zinc-600 hover:opacity-90 transition-all relative group"
              title={`De incógnito (Dormant): ${metrics.bodyStateDistribution.dormant} (${pctDormant}%)`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-2.5 rounded-xl bg-white/5 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Activo</span>
              </div>
              <div className="text-lg font-mono font-black text-white mt-1">
                {metrics.bodyStateDistribution.open}{" "}
                <span className="text-xs text-neutral-400 font-normal">({pctOpen}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-electricViolet/20">
              <div className="flex items-center gap-1.5 text-xs text-electricViolet-glow font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-electricViolet" />
                <span>Ocupado</span>
              </div>
              <div className="text-lg font-mono font-black text-white mt-1">
                {metrics.bodyStateDistribution.occupied}{" "}
                <span className="text-xs text-neutral-400 font-normal">({pctOccupied}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-zinc-500/20">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>De incógnito</span>
              </div>
              <div className="text-lg font-mono font-black text-white mt-1">
                {metrics.bodyStateDistribution.dormant}{" "}
                <span className="text-xs text-neutral-400 font-normal">({pctDormant}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Rol Sexual / Posición */}
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Composición Sexual de la Comunidad
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">DEMOGRAFÍA</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(metrics.roleDistribution).map(([role, count]) => {
              const pct = metrics.totalUsers > 0 ? Math.round((count / metrics.totalUsers) * 100) : 0;
              return (
                <div key={role} className="flex items-center justify-between gap-3">
                  <span className="text-neutral-300 w-28 truncate">{role}</span>
                  <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-electricViolet/70 rounded-full"
                    />
                  </div>
                  <span className="text-white font-bold w-12 text-right">
                    {count} <span className="text-neutral-500 font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACCIONES OPERATIVAS RÁPIDAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab("users")}
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-electricViolet-glow mb-2">
            <Users className="w-5 h-5" />
            <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="text-sm font-bold text-white font-mono">Revisar Usuarios & IDs</div>
          <p className="text-xs text-neutral-400 mt-1">
            {metrics.pendingVerificationsCount} perfiles pendientes de verificación biométrica.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("moderation")}
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-bloodNeon mb-2">
            <ShieldAlert className="w-5 h-5" />
            <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="text-sm font-bold text-white font-mono">Cola de Denuncias</div>
          <p className="text-xs text-neutral-400 mt-1">
            {metrics.pendingReportsCount} reportes de la comunidad sin resolver.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("memberships")}
          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CreditCard className="w-5 h-5" />
            <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
          <div className="text-sm font-bold text-white font-mono">Membresías & Cuotas</div>
          <p className="text-xs text-neutral-400 mt-1">
            Gestionar cuotas de Free y otorgar planes Unlimited de cortesía.
          </p>
        </button>
      </div>
    </div>
  );
};
