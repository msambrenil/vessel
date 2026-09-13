"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { BodyState } from "@/types/vessel";
import { Radio, Zap, Moon, EyeOff, Activity } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const StatusToggle: React.FC = () => {
  const {
    myBodyState,
    setMyBodyState,
    myOnTheClock,
    startOnTheClock,
    stopOnTheClock,
    t,
    language,
  } = useVessel();

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!myOnTheClock.isActive) return;

    // Actualizar cada segundo para que el dial del reloj y el contador fluyan con suavidad táctica
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [myOnTheClock.isActive]);

  const { elapsedDegrees, countdownLabel } = useMemo(() => {
    if (!myOnTheClock.isActive || !myOnTheClock.expiresAt) {
      return { elapsedDegrees: 0, countdownLabel: "" };
    }

    const expiresAtMs = new Date(myOnTheClock.expiresAt).getTime();
    const durationMinutes = myOnTheClock.durationMinutes || 60;
    const totalDurationMs = durationMinutes * 60 * 1000;
    const startedAtMs = myOnTheClock.startedAt
      ? new Date(myOnTheClock.startedAt).getTime()
      : expiresAtMs - totalDurationMs;

    const effectiveTotalMs =
      expiresAtMs > startedAtMs ? expiresAtMs - startedAtMs : totalDurationMs;
    const remainingMs = Math.max(0, expiresAtMs - now);
    const elapsedMs = Math.min(
      effectiveTotalMs,
      Math.max(0, effectiveTotalMs - remainingMs)
    );

    const remainingFraction =
      effectiveTotalMs > 0 ? remainingMs / effectiveTotalMs : 0;
    const elapsedFraction = 1 - remainingFraction;

    // 0deg = 12 en punto (arriba). El borde fucsia se va apagando en sentido horario como en las manecillas de un reloj
    const deg = Math.min(360, Math.max(0, elapsedFraction * 360));

    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    const label =
      remainingMinutes > 1
        ? `${remainingMinutes}m`
        : remainingSeconds > 0
        ? `${remainingSeconds}s`
        : "0m";

    return { elapsedDegrees: deg, countdownLabel: label };
  }, [
    myOnTheClock.isActive,
    myOnTheClock.expiresAt,
    myOnTheClock.durationMinutes,
    myOnTheClock.startedAt,
    now,
  ]);

  const clockGradient = useMemo(() => {
    if (!myOnTheClock.isActive) return "";

    const deg = Math.round(elapsedDegrees * 10) / 10;

    if (deg <= 0.5) {
      // 100% completo e iluminado en fucsia neón
      return `conic-gradient(from 0deg at 50% 50%, #ff007f 0deg, #ff2a85 180deg, #ff007f 360deg)`;
    }

    if (deg >= 359.5) {
      // Completamente apagado
      return `rgba(255, 0, 127, 0.1)`;
    }

    const sparkEnd = Math.min(360, deg + 3);

    return `conic-gradient(
      from 0deg at 50% 50%,
      rgba(255, 0, 127, 0.12) 0deg,
      rgba(255, 0, 127, 0.12) ${deg}deg,
      #ffffff ${deg}deg,
      #ff2a85 ${sparkEnd}deg,
      #ff007f ${sparkEnd}deg,
      #ff2a85 360deg
    )`;
  }, [myOnTheClock.isActive, elapsedDegrees]);

  const states: {
    id: BodyState;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    dotColor: string;
    activeBg: string;
    focusColor: string;
  }[] = [
    {
      id: "open",
      label: language === "es" ? "ACTIVO" : "ACTIVE",
      sublabel: t.bodyState?.open || (language === "es" ? "Visible en radar" : "Visible on radar"),
      icon: Activity,
      dotColor: "bg-electricViolet shadow-violet-glow animate-pulse",
      activeBg: "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft font-black",
      focusColor: "focus-visible:ring-electricViolet",
    },
    {
      id: "occupied",
      label: language === "es" ? "OCUPADO" : "BUSY",
      sublabel: t.bodyState?.occupied || (language === "es" ? "No disponible" : "Not available"),
      icon: Moon,
      dotColor: "bg-bloodNeon shadow-blood-glow",
      activeBg: "bg-bloodNeon/20 border-bloodNeon text-white shadow-blood-glow font-black",
      focusColor: "focus-visible:ring-bloodNeon",
    },
    {
      id: "dormant",
      label: language === "es" ? "INCÓGNITO" : "STEALTH",
      sublabel: t.bodyState?.dormant || (language === "es" ? "De incógnito" : "Hidden"),
      icon: EyeOff,
      dotColor: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]",
      activeBg: "bg-purple-500/20 border-purple-400 text-purple-200 font-black",
      focusColor: "focus-visible:ring-purple-400",
    },
  ];

  const activeStateInfo = states.find((s) => s.id === myBodyState) || states[0];

  return (
    <section
      role="region"
      aria-label="Consola de Transmisión de Señal Propia en el Radar"
      className="w-full px-2.5 sm:px-4 pt-2 pb-1 bg-obsidian-deep select-none"
    >
      <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-purple-950/30 via-obsidian-surface/90 to-purple-950/30 border border-electricViolet/25 p-2.5 shadow-sm space-y-2">
        {/* Cabecera Táctica de la Consola: Identidad Clara de Emisión Personal */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-wider">
          <div className="flex items-center gap-1.5 font-bold uppercase text-neutral-200">
            <Radio className="w-3.5 h-3.5 text-electricViolet animate-pulse flex-shrink-0" />
            <span className="text-white font-black tracking-wide">
              {language === "es" ? "MI ESTADO" : "MY STATUS"}
            </span>
            <span className="hidden sm:inline text-neutral-400 font-normal text-[9.5px]">
              — {language === "es" ? "¿Qué pinta para vos hoy? (Cómo te ven otros)" : "How you appear to nearby vessels"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase bg-black/40 border border-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${activeStateInfo.dotColor}`} />
            <span className="text-neutral-400 font-medium hidden xs:inline">
              {language === "es" ? "EMITIENDO:" : "BROADCAST:"}
            </span>
            <span className="text-electricViolet-glow font-black truncate max-w-[100px] sm:max-w-none">
              {activeStateInfo.label}
            </span>
          </div>
        </div>

        {/* Bloque Físico de Controles: Segmented Control + Botón BOOST 60M */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Segmented Control Unificado con Ranura Táctica */}
          <div
            role="radiogroup"
            aria-label="Estado de disponibilidad de mi perfil"
            className="flex-1 bg-obsidian-deep/90 p-1 rounded-xl border border-white/10 flex items-center gap-1 shadow-inner min-w-0"
          >
            {states.map((st) => {
              const isActive = myBodyState === st.id;
              const Icon = st.icon;
              return (
                <button
                  key={st.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    audioEngine.playStateSwitch(st.id);
                    setMyBodyState(st.id);
                  }}
                  title={`${st.label} (${st.sublabel}) — Tocar para cambiar cómo te ven los demás`}
                  className={`flex-1 min-h-[36px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${st.focusColor} active:scale-95 ${
                    isActive
                      ? `${st.activeBg} border`
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent font-medium"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-current" : "text-neutral-400"}`} />
                  <div className="flex flex-col items-start leading-tight truncate">
                    <span className="truncate tracking-wider uppercase font-black text-[10.5px]">
                      {st.label}
                    </span>
                    <span className="text-[8.5px] sm:text-[9px] opacity-80 truncate font-sans normal-case">
                      {st.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Botón de Disponibilidad Inmediata: LISTO YA (On-The-Clock 60m con reloj fucsia) */}
          <button
            type="button"
            data-testid="status-toggle-ready-now-button"
            onClick={() => {
              audioEngine.playSubBass(75);
              if (myOnTheClock.isActive) {
                stopOnTheClock();
              } else {
                startOnTheClock(60);
              }
            }}
            aria-pressed={myOnTheClock.isActive}
            aria-label={
              myOnTheClock.isActive
                ? `Modo Listo YA activo. Restan ${countdownLabel}. Tocar para desactivar.`
                : "Activar modo Listo YA (prioridad en la matriz durante 60 minutos)"
            }
            title={
              myOnTheClock.isActive
                ? `LISTO YA ACTIVO · ${countdownLabel} restantes // Tocar para apagar`
                : "Activar Listo YA // Destaca tu perfil en la matriz durante 1 hora"
            }
            className={`group relative overflow-hidden min-h-[38px] px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 font-mono text-[10.5px] font-black tracking-wider uppercase transition-all cursor-pointer active:scale-95 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff007f] ${
              myOnTheClock.isActive
                ? "bg-gradient-to-r from-obsidian-deep via-[#1a0011] to-obsidian-deep text-white shadow-[0_0_20px_rgba(255,0,127,0.35)]"
                : "bg-white/5 border border-fuchsia-500/30 text-neutral-200 hover:text-white hover:bg-fuchsia-950/20 hover:border-[#ff007f] hover:shadow-[0_0_15px_rgba(255,0,127,0.25)]"
            }`}
          >
            {/* Anillo de Borde Fucsia Neón Estilo Reloj (Conteo Regresivo Dinámico) */}
            {myOnTheClock.isActive && (
              <div
                data-testid="on-the-clock-fuchsia-clock-border"
                className="absolute inset-0 rounded-xl pointer-events-none p-[2px] z-10 overflow-hidden"
                style={{
                  background: clockGradient,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  filter:
                    "drop-shadow(0 0 5px rgba(255, 0, 127, 0.85)) drop-shadow(0 0 10px rgba(255, 42, 133, 0.45))",
                }}
              />
            )}

            <Zap
              className={`w-3.5 h-3.5 flex-shrink-0 relative z-20 ${
                myOnTheClock.isActive
                  ? "fill-[#ff007f] text-[#ff2a85] animate-pulse drop-shadow-[0_0_6px_rgba(255,0,127,0.9)]"
                  : "text-[#ff007f] group-hover:scale-110 transition-transform"
              }`}
            />
            <span className="relative z-20 font-black tracking-wider">
              {myOnTheClock.isActive
                ? `LISTO YA · ${countdownLabel}`
                : t.bodyState?.boostBtn || "LISTO YA"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
