"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { GeoPrivacyLevel } from "@/types/vessel";
import {
  X,
  Shield,
  ShieldCheck,
  Battery,
  BatteryCharging,
  Zap,
  Radio,
  MapPin,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Compass,
  Sparkles,
} from "lucide-react";

interface GeoBatteryModalProps {
  onClose: () => void;
}

export const GeoBatteryModal: React.FC<GeoBatteryModalProps> = ({ onClose }) => {
  const {
    geoPrivacyLevel,
    setGeoPrivacyLevel,
    batteryEngineState,
    manualEcoSaver,
    toggleEcoSaverMode,
    myGeohashCell,
    myCoordinates,
    isLocating,
    geoError,
    refreshRealGeolocation,
  } = useVessel();

  const privacyOptions: {
    id: GeoPrivacyLevel;
    title: string;
    description: string;
    shieldLabel: string;
  }[] = [
    {
      id: "exact_discretized",
      title: "Distancia Aproximada por Rangos (Recomendado)",
      description:
        "Tus coordenadas exactas nunca se comparten. Tu distancia se redondea en rangos seguros (<50m, ~150m, ~300m, ~1km) para que nadie pueda calcular la dirección exacta de tu casa o edificio.",
      shieldLabel: "Protección Anti-Rastreo Activa",
    },
    {
      id: "geohash_cell_150m",
      title: "Por Zona o Manzana Inmediata (~150 m)",
      description:
        "Oculta los metros específicos y solo muestra si estás en la misma zona o manzana de 150 metros.",
      shieldLabel: "Alta Privacidad",
    },
    {
      id: "strict_stealth",
      title: "Modo Sigilo Total de Distancia",
      description:
        "Oculta por completo la distancia en metros. Apareces en la lista de perfiles pero nadie puede ver qué tan cerca estás.",
      shieldLabel: "Máxima Discreción",
    },
  ];

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "foreground_active":
        return { label: "Primer Plano // Actualiza cada 30s", color: "text-electricViolet-glow bg-electricViolet/15 border-electricViolet/30 shadow-violet-soft" };
      case "background_coarse":
        return { label: "Segundo Plano // Actualiza cada 15 min", color: "text-neutral-300 bg-white/10 border-white/20" };
      case "passive_geofence":
        return { label: "Reposo // Solo al cambiar de zona", color: "text-neutral-400 bg-neutral-800 border-neutral-700" };
      case "eco_saver":
        return { label: "Modo Ahorro Eco-Saver // Cada 5 min", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" };
      default:
        return { label: mode, color: "text-white bg-white/10" };
    }
  };

  const modeInfo = getModeLabel(batteryEngineState.mode);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex justify-center items-center p-3 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-obsidian-surface border border-white/10 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-card-elevation relative">
        {/* Cabecera del Modal */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow shadow-violet-soft">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Privacidad de Ubicación & Batería
              </h2>
              <p className="text-[11px] text-neutral-400">
                Protección contra rastreo exacto y optimización de energía
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de privacidad de ubicación y batería"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Modular con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SECCIÓN 1: MOTOR DE AHORRO DE BATERÍA (BATTERY-SAVING STATE ENGINE) */}
          <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-3 shadow-card-elevation">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {batteryEngineState.isCharging ? (
                  <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : (
                  <Battery className="w-5 h-5 text-electricViolet-glow" />
                )}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Ahorro Inteligente de Batería
                  </h3>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5" suppressHydrationWarning>
                    <span>Nivel: {batteryEngineState.level}% {batteryEngineState.isCharging && "• Cargando ⚡"}</span>
                    {batteryEngineState.hasHardwareApi ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        HARDWARE REAL
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 border border-white/5 px-1.5 py-0.5 rounded-full">
                        MODO ADAPTATIVO
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${modeInfo.color}`}
              >
                {batteryEngineState.mode.toUpperCase()}
              </div>
            </div>

            {/* Ciclo de vida y frecuencia */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5 font-mono">
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Frecuencia GPS</span>
                <span className="text-white font-bold">
                  {batteryEngineState.updateIntervalSeconds > 0
                    ? `Cada ${batteryEngineState.updateIntervalSeconds}s`
                    : "Solo por cruce de celda"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Precisión GPS</span>
                <span className={batteryEngineState.highAccuracyGps ? "text-electricViolet-glow font-bold" : "text-neutral-300"}>
                  {batteryEngineState.highAccuracyGps ? "Alta Precisión" : "Coarse / Red"}
                </span>
              </div>
            </div>

            {/* Toggle Manual de Modo Ahorro */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Forzar Modo Eco-Saver</div>
                <div className="text-[10px] text-neutral-400">
                  Reduce el muestreo a 5 min y desactiva animaciones GPU
                </div>
              </div>
              <button
                type="button"
                onClick={toggleEcoSaverMode}
                aria-pressed={manualEcoSaver}
                className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95 ${
                  manualEcoSaver
                    ? "bg-mintNeon text-obsidian-deep border-mintNeon shadow-mint-glow font-extrabold"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                {manualEcoSaver ? "ACTIVO" : "INACTIVO"}
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: ZONA DE CONEXIÓN LOCAL */}
          <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-3 shadow-card-elevation">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Zona de Conexión Cifrada
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-obsidian p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block uppercase font-mono">Tu Zona Actual</span>
                <span className="text-electricViolet-glow font-mono font-bold text-sm block mt-0.5">
                  {myGeohashCell.hash}
                </span>
                <span className="text-[9px] text-neutral-500">Área segura (~152m x 152m)</span>
              </div>

              <div className="bg-obsidian p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-neutral-400 block uppercase font-mono">Código de Seguridad</span>
                <span className="text-white font-mono font-bold text-sm block mt-0.5">
                  {myGeohashCell.s2Token}
                </span>
                <span className="text-[9px] text-neutral-500">Identificador local</span>
              </div>
            </div>

            {/* Celdas Vecinas (Neighbors) */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-400 font-semibold block uppercase font-mono">
                8 Zonas Vecinas Escaneadas
              </span>
              <div className="flex flex-wrap gap-1">
                {myGeohashCell.neighbors.map((neighbor: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-neutral-300"
                  >
                    {neighbor}
                  </span>
                ))}
              </div>
            </div>

            {/* GPS REAL: Botón de sincronización con hardware */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Ubicación: {myCoordinates.lat.toFixed(4)}, {myCoordinates.lng.toFixed(4)}
                </span>
                {geoError && (
                  <span className="text-[10px] text-red-400 font-mono block">
                    ⚠️ {geoError}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={isLocating}
                onClick={() => refreshRealGeolocation()}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold shadow-violet-soft transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Radio className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : "animate-pulse text-mintNeon"}`} />
                <span>{isLocating ? "Consultando GPS..." : "📍 Actualizar GPS en Vivo"}</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: ESCUDO ANTI-RASTREO (NIVEL DE PRIVACIDAD) */}
          <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-3 shadow-card-elevation">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-mintNeon stroke-[2.5]" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Privacidad de Ubicación & Anti-Rastreo
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Protección para que nadie pueda calcular tu dirección o edificio exacto
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {privacyOptions.map((opt) => {
                const isSelected = geoPrivacyLevel === opt.id;

                return (
                  <div
                    key={opt.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setGeoPrivacyLevel(opt.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setGeoPrivacyLevel(opt.id);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      isSelected
                        ? "bg-electricViolet/15 border-electricViolet text-white shadow-violet-soft font-bold"
                        : "bg-obsidian border-white/5 text-neutral-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-electricViolet-glow" />
                        <span>{opt.title}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-mintNeon flex-shrink-0 stroke-[2.5]" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed pl-5 font-normal">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-white/10 bg-obsidian-deep/90 backdrop-blur-md flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 min-h-[44px] rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-bold shadow-violet-soft transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98 font-mono"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
