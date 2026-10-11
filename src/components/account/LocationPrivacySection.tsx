"use client";

import React from "react";
import { useLogistics } from "@/context/VesselContext";
import { GeoPrivacyLevel } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  ShieldCheck,
  Battery,
  BatteryCharging,
  Zap,
  MapPin,
  Lock,
  Layers,
  CheckCircle2,
  Sparkles,
  Compass,
  Plane,
  Radio,
} from "lucide-react";
import { BrutalistSwitch, BrutalistButton } from "@/components/ui";

export const LocationPrivacySection: React.FC = () => {
  const {
    geoPrivacyLevel,
    setGeoPrivacyLevel,
    batteryEngineState,
    manualEcoSaver,
    toggleEcoSaverMode,
    myGeohashCell,
    openTravelModal,
    openGeoBatteryModal,
    travelMode,
  } = useLogistics();

  const privacyOptions: {
    id: GeoPrivacyLevel;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: "exact_discretized",
      title: "Distancia Aproximada por Rangos (Recomendado)",
      description:
        "Tus coordenadas exactas nunca se comparten. Tu distancia se redondea en rangos seguros (<50m, ~150m, ~300m, ~1km) para que nadie pueda triangular tu dirección exacta o edificio.",
      badge: "Recomendado",
    },
    {
      id: "geohash_cell_150m",
      title: "Por Zona o Manzana Inmediata (~150 m)",
      description:
        "Oculta los metros específicos y solo muestra si estás en la misma zona o manzana de 150 metros.",
      badge: "Alta Privacidad",
    },
    {
      id: "strict_stealth",
      title: "Modo Sigilo Total de Distancia",
      description:
        "Oculta por completo la distancia métrica. Apareces en la lista de perfiles pero nadie puede ver qué tan cerca estás.",
      badge: "Máxima Discreción",
    },
  ];

  const getBatteryModeHumanLabel = (mode: string) => {
    switch (mode) {
      case "foreground_active":
        return {
          title: "Uso Activo en Primer Plano",
          frequency: "Actualiza cada 30 segundos",
          accuracy: "Alta Precisión GPS",
          tagColor: "text-electricViolet-glow bg-electricViolet/15 border-electricViolet/30",
        };
      case "background_coarse":
        return {
          title: "Segundo Plano / App Minimizada",
          frequency: "Actualiza cada 15 minutos",
          accuracy: "Ahorro de Red",
          tagColor: "text-neutral-300 bg-white/10 border-white/20",
        };
      case "passive_geofence":
        return {
          title: "Reposo / Sin Movimiento",
          frequency: "Solo al cambiar de zona",
          accuracy: "Modo Pasivo",
          tagColor: "text-neutral-400 bg-neutral-800 border-neutral-700",
        };
      case "eco_saver":
        return {
          title: "Modo Ahorro de Energía Activo",
          frequency: "Actualiza cada 5 minutos",
          accuracy: "Bajo Consumo",
          tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        };
      default:
        return {
          title: mode,
          frequency: "Automático",
          accuracy: "Estándar",
          tagColor: "text-white bg-white/10",
        };
    }
  };

  const currentModeInfo = getBatteryModeHumanLabel(batteryEngineState.mode);

  return (
    <div className="space-y-4">
      {/* 1. TARJETA: ESCUDO DE PRIVACIDAD DE UBICACIÓN & ANTI-TRIANGULACIÓN */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-electricViolet/30 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-electricViolet/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Privacidad de Ubicación & Anti-Rastreo
                </h3>
                <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 px-1.5 py-0.5 rounded-full border border-electricViolet/30">
                  PROTEGIDO
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Tu dirección real nunca se comparte ni se revela
              </p>
            </div>
          </div>
        </div>

        {/* Explicación Pedagógica */}
        <p className="text-[11px] font-mono text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5">
          🛡️ <strong>¿Cómo te protege VESSEL?</strong> Para garantizar tu seguridad física, la app nunca comparte tus coordenadas exactas. Podés elegir el nivel de detalle con el que otros usuarios ven tu distancia en el radar:
        </p>

        {/* Opciones de Privacidad */}
        <div className="space-y-2.5">
          {privacyOptions.map((opt) => {
            const isSelected = geoPrivacyLevel === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setGeoPrivacyLevel(opt.id);
                  audioEngine.playPulse();
                }}
                aria-pressed={isSelected}
                className={`w-full text-left p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet select-none active:scale-[0.99] ${
                  isSelected
                    ? "bg-electricViolet/15 border-electricViolet text-white shadow-violet-soft font-bold"
                    : "bg-black/50 border-white/10 text-neutral-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className={`w-3.5 h-3.5 ${isSelected ? "text-electricViolet-glow" : "text-neutral-400"}`} />
                    <span className="text-xs font-mono font-bold text-white">{opt.title}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${
                        isSelected
                          ? "bg-electricViolet text-white font-extrabold border-electricViolet shadow-violet-soft"
                          : "bg-white/5 text-neutral-400 border-white/10"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-electricViolet-glow flex-shrink-0 stroke-[2.5]" />
                  )}
                </div>
                <p className="text-[11px] font-mono text-neutral-400 leading-relaxed pl-5 font-normal">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TARJETA: GESTIÓN DE GPS & CONSUMO DE BATERÍA */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-emerald-500/30 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              {batteryEngineState.isCharging ? (
                <BatteryCharging className="w-5 h-5 animate-pulse" />
              ) : (
                <Battery className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  GPS & Ahorro Inteligente de Batería
                </h3>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono" suppressHydrationWarning>
                Batería del dispositivo: {batteryEngineState.level}% {batteryEngineState.isCharging && "• Conectado a la corriente ⚡"}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${currentModeInfo.tagColor}`}>
            {currentModeInfo.title}
          </span>
        </div>

        {/* Datos en vivo de frecuencia y consumo */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-black/60 p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[9px] text-neutral-400 block uppercase font-bold">
              Frecuencia de Actualización
            </span>
            <span className="text-xs font-bold text-white">
              {currentModeInfo.frequency}
            </span>
          </div>

          <div className="bg-black/60 p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[9px] text-neutral-400 block uppercase font-bold">
              Precisión del Sensor
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {currentModeInfo.accuracy}
            </span>
          </div>
        </div>

        {/* Switch Manual de Modo Eco-Saver con BrutalistSwitch */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5">
          <BrutalistSwitch
            checked={manualEcoSaver}
            onChange={() => toggleEcoSaverMode()}
            variant="emerald"
            label="Forzar Modo Ahorro de Energía"
            description="Reduce las consultas de GPS a 5 minutos y optimiza el consumo cuando tenés poca batería"
            aria-label="Conmutar Modo Ahorro Eco-Saver"
          />
        </div>

        {/* 3. ZONA DE CONEXIÓN LOCAL */}
        <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>Zona de Conexión Cifrada</span>
            </span>
            <span className="text-xs font-mono font-bold text-electricViolet-glow">
              {myGeohashCell.hash}
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400 leading-normal">
            Este código de zona permite encontrar otros perfiles a tu alrededor al instante sin necesidad de guardar tus coordenadas exactas en internet.
          </p>
        </div>

        {/* 4. HERRAMIENTAS TÁCTICAS DE UBICACIÓN & RADAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <BrutalistButton
            variant="tactical"
            size="default"
            onClick={() => openTravelModal()}
            className="w-full min-h-[56px] justify-between text-left p-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow flex-shrink-0">
                <Plane className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-white block truncate">
                  Modo Viajero (Teletransporte)
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block truncate">
                  {travelMode.isActive
                    ? `Activo: ${travelMode.cityName}`
                    : "Simular presencia en otra ciudad"}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-electricViolet-glow ml-2">
              →
            </span>
          </BrutalistButton>

          <BrutalistButton
            variant="tactical"
            size="default"
            onClick={() => openGeoBatteryModal()}
            className="w-full min-h-[56px] justify-between text-left p-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-mintNeon/15 text-mintNeon flex-shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-white block truncate">
                  Calibrar GPS & Telemetría
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block truncate">
                  Forzar refresco de satélite y batería
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-mintNeon ml-2">
              →
            </span>
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};
