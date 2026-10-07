"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StaffMember } from "@/types/admin";
import {
  CURRENT_SYSTEM_VERSION,
  SYSTEM_BUILD_TIMESTAMP,
  SYSTEM_BUILD_FORMATTED,
  SYSTEM_CHANGELOG,
  SystemVersionEntry,
} from "@/lib/version/systemVersion";
import {
  getSystemControlState,
  triggerForceReload,
  triggerForceLogout,
  SystemControlState,
  subscribeToSystemControl,
} from "@/lib/version/systemControlService";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getActiveAppMode } from "@/lib/storage/localStorageSync";
import {
  Rocket,
  RefreshCw,
  LogOut,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Check,
  Zap,
  Info,
  Server,
  Terminal,
} from "lucide-react";

interface SystemVersionTabProps {
  currentStaff: StaffMember;
}

export const SystemVersionTab: React.FC<SystemVersionTabProps> = ({ currentStaff }) => {
  const appMode = getActiveAppMode();
  const [controlState, setControlState] = useState<SystemControlState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Estados de modales de confirmación
  const [isConfirmReloadOpen, setIsConfirmReloadOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // Cargar estado inicial y suscribirse en tiempo real
  useEffect(() => {
    let isMounted = true;
    getSystemControlState(appMode).then((state) => {
      if (isMounted) setControlState(state);
    });

    const unsub = subscribeToSystemControl((state) => {
      if (isMounted) setControlState(state);
    }, appMode);

    return () => {
      isMounted = false;
      unsub();
    };
  }, [appMode]);

  // Manejo de comando: Forzar recarga de versión
  const handleExecuteForceReload = async () => {
    setIsLoading(true);
    try {
      audioEngine.playSubBass(60);
      const updated = await triggerForceReload(currentStaff, appMode);
      setControlState(updated);
      setIsConfirmReloadOpen(false);
      setActionSuccessMsg(
        `¡Señal de recarga enviada con éxito! Todos los navegadores clientes actualizarán a ${CURRENT_SYSTEM_VERSION}.`
      );
      setTimeout(() => setActionSuccessMsg(null), 6000);
    } catch (err) {
      console.error("Error forzando recarga:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de comando: Forzar cierre de sesiones
  const handleExecuteForceLogout = async () => {
    setIsLoading(true);
    try {
      audioEngine.playSubBass(45);
      const updated = await triggerForceLogout(currentStaff, appMode);
      setControlState(updated);
      setIsConfirmLogoutOpen(false);
      setActionSuccessMsg(
        "¡Cierre forzado de sesiones ejecutado! Los usuarios deberán re-autenticarse."
      );
      setTimeout(() => setActionSuccessMsg(null), 6000);
    } catch (err) {
      console.error("Error forzando cierre de sesión:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado reactivo de versiones y changelog
  const filteredChangelog = useMemo(() => {
    return SYSTEM_CHANGELOG.filter((entry) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "features" && entry.type === "feature") ||
        (activeFilter === "bugfix" && entry.type === "bugfix") ||
        (activeFilter === "core" && entry.type === "core") ||
        (activeFilter === "performance" && entry.type === "performance");

      const matchesSearch =
        searchQuery.trim() === "" ||
        entry.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.modules.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const canExecuteCommands = currentStaff.role === "superadmin";

  return (
    <div className="space-y-6">
      {/* 1. CABECERA MAESTRA: VERSIÓN ACTUAL, FECHA/HORA & ESTADO */}
      <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-5 sm:p-6 shadow-card-elevation space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-electricViolet font-bold">
                TELEMETRÍA DE DESPLIEGUE // VERSIÓN EN VIVO
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                <span className="w-2 h-2 rounded-full bg-electricViolet-glow animate-ping" />
                <span>BUILD ACTIVA: {CURRENT_SYSTEM_VERSION}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight mt-1">
              Estado de Versión & Control Remoto
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              Monitoreo del release en producción y herramientas de sincronización forzada para erradicar el estancamiento de caché en navegadores móviles (iOS / Android).
            </p>
          </div>

          {/* Tarjeta de Resumen con Fecha y Hora */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-3 sm:p-3.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>Fecha de Despliegue:</span>
              </div>
              <div className="text-sm font-bold font-mono text-white">
                {SYSTEM_BUILD_FORMATTED}
              </div>
              <div className="text-[10px] font-mono text-neutral-500">
                ISO: {SYSTEM_BUILD_TIMESTAMP}
              </div>
            </div>
          </div>
        </div>

        {/* Notificación de Éxito al Ejecutar Comando */}
        {actionSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 2. ZONA DE COMANDOS TÁCTICOS: FORZAR RECARGA & FORZAR LOGOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Comando 1: Forzar Carga de Última Versión */}
        <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-5 space-y-4 shadow-card-elevation flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-electricViolet-glow font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                SINCRONIZACIÓN DE CLIENTES
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                CACHE-PURGE + RELOAD
              </span>
            </div>
            <h3 className="text-base font-bold font-mono text-white">
              Forzar Carga de Última Versión
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Emite una señal en tiempo real a todos los móviles y navegadores web activos para que purguen de inmediato sus cachés locales (Service Worker, CacheStorage, HTTP disk cache) y recarguen automáticamente el código más reciente.
            </p>

            {controlState?.forceReloadTimestamp ? (
              <div className="text-[10px] font-mono text-neutral-500 bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <div>Último forzado: {new Date(controlState.forceReloadTimestamp).toLocaleString("es-AR")} ART</div>
                {controlState.lastActionBy && <div>Por: {controlState.lastActionBy}</div>}
              </div>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={!canExecuteCommands || isLoading}
              onClick={() => {
                audioEngine.playPulse();
                setIsConfirmReloadOpen(true);
              }}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation ${
                canExecuteCommands
                  ? "bg-electricViolet hover:bg-electricViolet-glow text-white shadow-violet-soft"
                  : "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Forzar Recarga en Todos los Clientes</span>
            </button>
            {!canExecuteCommands && (
              <p className="text-[10px] font-mono text-neutral-500 text-center mt-1.5">
                * Requiere rol Superadmin para emitir señales maestras
              </p>
            )}
          </div>
        </div>

        {/* Comando 2: Forzar Cierre de Sesión Global */}
        <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-5 space-y-4 shadow-card-elevation flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-bloodNeon font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                SEGURIDAD & SESIONES
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30">
                AUTH INVALIDATION
              </span>
            </div>
            <h3 className="text-base font-bold font-mono text-white">
              Forzar Cierre de Sesiones de Usuarios
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Invalida las credenciales de sesión en toda la app móvil. Cualquier usuario conectado será desconectado limpiamente de inmediato y deberá volver a identificarse (ideal ante rotaciones de claves o parches críticos).
            </p>

            {controlState?.forceLogoutTimestamp ? (
              <div className="text-[10px] font-mono text-neutral-500 bg-black/30 p-2 rounded-lg border border-white/5 space-y-0.5">
                <div>Último forzado: {new Date(controlState.forceLogoutTimestamp).toLocaleString("es-AR")} ART</div>
                {controlState.lastActionBy && <div>Por: {controlState.lastActionBy}</div>}
              </div>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={!canExecuteCommands || isLoading}
              onClick={() => {
                audioEngine.playSubBass(50);
                setIsConfirmLogoutOpen(true);
              }}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation ${
                canExecuteCommands
                  ? "bg-bloodNeon/20 hover:bg-bloodNeon/30 border border-bloodNeon/50 text-bloodNeon shadow-[0_0_15px_rgba(255,0,85,0.2)]"
                  : "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Forzar Cierre de Sesiones Activas</span>
            </button>
            {!canExecuteCommands && (
              <p className="text-[10px] font-mono text-neutral-500 text-center mt-1.5">
                * Requiere rol Superadmin para invalidar sesiones globales
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. HISTORIAL COMPLETO DE CAMBIOS (CHANGELOG & RELEASE LOG) */}
      <div className="rounded-2xl border border-white/10 bg-obsidian-surface p-5 sm:p-6 space-y-5 shadow-card-elevation">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-electricViolet-glow" />
              <span>Historial de Versiones & Changelog Oficial</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Registro inmutable de versiones desplegadas, parches, refactors y mejoras arquitectónicas.
            </p>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex items-center gap-1.5 flex-wrap bg-black/40 p-1 rounded-xl border border-white/10">
            {[
              { id: "all", label: "Todos" },
              { id: "core", label: "Core" },
              { id: "features", label: "Features" },
              { id: "performance", label: "Rendimiento" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setActiveFilter(f.id);
                  audioEngine.playPulse();
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? "bg-electricViolet text-white shadow-violet-soft"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buscador de Versiones */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por versión (v2.x), palabra clave, módulo o cambio..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-electricViolet"
          />
        </div>

        {/* Lista de Entradas de Versión */}
        <div className="space-y-4 pt-2">
          {filteredChangelog.map((entry) => (
            <div
              key={entry.version}
              className={`rounded-xl border p-4 sm:p-5 transition-all ${
                entry.isCurrent
                  ? "bg-electricViolet/10 border-electricViolet/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : "bg-black/40 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-black font-mono text-white">
                    {entry.version}
                  </span>
                  {entry.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-electricViolet text-white shadow-violet-soft">
                      ACTIVA EN VIVO
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      entry.type === "core"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : entry.type === "feature"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    }`}
                  >
                    {entry.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
                  <span>{entry.formattedDate}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white font-mono mt-2">
                {entry.title}
              </h4>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {entry.description}
              </p>

              {/* Módulos Afectados */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                {entry.modules.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400"
                  >
                    #{m}
                  </span>
                ))}
              </div>

              {/* Lista Detallada de Cambios */}
              {entry.changes && entry.changes.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                    Modificaciones implementadas:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-300 font-mono">
                    {entry.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-electricViolet-glow font-bold">•</span>
                        <span className="leading-relaxed">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {filteredChangelog.length === 0 && (
            <div className="text-center py-8 text-neutral-500 font-mono text-xs">
              No se encontraron versiones que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CONFIRMACIÓN DE FORZAR RECARGA */}
      {isConfirmReloadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsConfirmReloadOpen(false)}
        >
          <div
            className="w-full max-w-md bg-obsidian-surface border border-electricViolet/50 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">
                  ¿Forzar Recarga en Todos los Clientes?
                </h3>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Acción de Difusión Global
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              Esta acción emitirá una señal que instruirá a todos los teléfonos y navegadores conectados a:
            </p>
            <ul className="text-xs text-neutral-400 font-mono space-y-1 pl-2">
              <li>1. Vaciar CacheStorage y Service Worker caches.</li>
              <li>2. Reclamar el nuevo Service Worker activo.</li>
              <li>3. Recargar inmediatamente a la versión {CURRENT_SYSTEM_VERSION}.</li>
            </ul>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsConfirmReloadOpen(false)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleExecuteForceReload}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-mono font-bold uppercase tracking-wider shadow-violet-soft cursor-pointer flex items-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Confirmar & Forzar Recarga</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMACIÓN DE FORZAR CIERRE DE SESIÓN */}
      {isConfirmLogoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsConfirmLogoutOpen(false)}
        >
          <div
            className="w-full max-w-md bg-obsidian-surface border border-bloodNeon/50 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon text-bloodNeon">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white">
                  ¿Forzar Cierre de Sesiones de Usuarios?
                </h3>
                <span className="text-[10px] font-mono text-bloodNeon uppercase tracking-wider font-bold">
                  Acción Destructiva de Seguridad
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              Esta acción invalidará las sesiones de TODOS los usuarios activos de la aplicación.
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              Los usuarios serán desconectados inmediatamente y se les pedirá volver a iniciar sesión con sus credenciales habituales.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsConfirmLogoutOpen(false)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleExecuteForceLogout}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-bloodNeon hover:bg-bloodNeon/80 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,0,85,0.4)] cursor-pointer flex items-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>Confirmar & Cerrar Sesiones</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
