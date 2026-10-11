"use client";

import React from "react";
import { useLogistics, useSettings } from "@/context/VesselContext";
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
import { BrutalistButton, BrutalistModal } from "@/components/ui";

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
  } = useLogistics();
  const { t } = useSettings();

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
        return { label: "Primer Plano - Actualiza cada 30s", color: "text-electricViolet-glow bg-electricViolet/15 border-electricViolet/30 shadow-violet-soft" };
      case "background_coarse":
        return { label: "Segundo Plano - Actualiza cada 15 min", color: "text-neutral-300 bg-white/10 border-white/20" };
      case "passive_geofence":
        return { label: "Reposo - Solo al cambiar de zona", color: "text-neutral-400 bg-neutral-800 border-neutral-700" };
      case "eco_saver":
        return { label: "Modo Ahorro de Batería - Cada 5 min", color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" };
      default:
        return { label: mode, color: "text-white bg-white/10" };
    }
  };

  const modeInfo = getModeLabel(batteryEngineState.mode);

  return (
    <BrutalistModal
      isOpen={true}
      onClose={onClose}
      icon={<Compass className="w-4 h-4 text-electricViolet-glow" />}
      title="Privacidad de Ubicación & Batería"
      subtitle="Protección contra rastreo exacto y optimización de energía"
      maxWidth="lg"
      ariaLabel="Privacidad de Ubicación & Batería"
      contentClassName="space-y-4"
      footer={
        <div className="flex justify-end">
          <BrutalistButton
            variant="primary"
            onClick={onClose}
            className="px-6 py-2.5 min-h-[44px] text-xs font-mono font-bold"
          >
            Aceptar & Cerrar
          </BrutalistButton>
        </div>
      }
    >
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
                        {t.system?.deviceReal || "SENSOR FÍSICO CONECTADO"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 border border-white/5 px-1.5 py-0.5 rounded-full">
                        MODO INTELIGENTE
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${modeInfo.color}`}
              >
                {modeInfo.label}
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
                  {batteryEngineState.highAccuracyGps ? (t.system?.gpsHigh || "Alta Precisión") : (t.system?.gpsImprecise || "Imprecisa")}
                </span>
              </div>
            </div>

            {/* Toggle Manual de Modo Ahorro */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Modo Ahorro de Energía (Eco)</div>
                <div className="text-[10px] text-neutral-400">
                  Reduce el uso de GPS a 5 min y cuida la batería de tu dispositivo
                </div>
              </div>
              <BrutalistButton
                variant={manualEcoSaver ? "primary" : "ghost"}
                size="compact"
                onClick={toggleEcoSaverMode}
                aria-pressed={manualEcoSaver}
                className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold border transition-all ${
                  manualEcoSaver
                    ? "!bg-mintNeon !text-obsidian-deep !border-mintNeon shadow-mint-glow font-extrabold"
                    : "!bg-white/5 !border-white/10 text-neutral-400 hover:text-white"
                }`}
              >
                {manualEcoSaver ? "ACTIVO" : "INACTIVO"}
              </BrutalistButton>
            </div>
          </div>

          {/* SECCIÓN 2: ZONA DE PROTECCIÓN GEOESPACIAL (ANTI-TRIANGULACIÓN) */}
          <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-3 shadow-card-elevation">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Zona de Protección Anti-Triangulación
              </h3>
            </div>

            <div className="bg-obsidian p-3.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Área Protegida (~152m × 152m)
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  PRIVACIDAD ACTIVA
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                Tu posición se proyecta en una celda general de manzana. Nadie en el radar puede deducir la dirección exacta de tu departamento, casa o lugar de trabajo.
              </p>
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
              <BrutalistButton
                variant="primary"
                size="compact"
                disabled={isLocating}
                onClick={() => refreshRealGeolocation()}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-white font-mono text-xs font-bold shadow-violet-soft flex items-center justify-center gap-1.5"
              >
                <Radio className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : "animate-pulse text-mintNeon"}`} />
                <span>{isLocating ? "Consultando GPS..." : "📍 Actualizar GPS en Vivo"}</span>
              </BrutalistButton>
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
    </BrutalistModal>
  );
};
