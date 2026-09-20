"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { AppDisguiseMode } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const AppDisguiseModal: React.FC = () => {
  const {
    appDisguise,
    setAppDisguiseMode,
    setCoverScreenActive,
    t,
  } = useVessel();

  const [isOpen, setIsOpen] = React.useState(false);

  // Selector global o accesible desde settings
  return null; // Exportamos AppDisguiseModalConfigurable si se necesita
};

export const AppDisguiseSection: React.FC = () => {
  const {
    appDisguise,
    setAppDisguiseMode,
    setCoverScreenActive,
    openDuressPinSettings,
    language,
    t,
  } = useVessel();

  return (
    <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-mono font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <span>🛡️</span>
            <span>{language === "es" ? "Escudo de Camuflaje // Discreción" : "Camouflage Shield // Stealth"}</span>
          </h3>
          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
            {language === "es"
              ? "Camuflá la app en tu pantalla de inicio y activá pantallas señuelo"
              : "Disguise the app on your home screen and activate decoy screens"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            setCoverScreenActive(true);
          }}
          className="px-3 py-1.5 min-h-[38px] bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <span>🛡️</span>
          <span>{language === "es" ? "Probar Cobertura" : "Test Decoy"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {[
          { mode: "calculator" as AppDisguiseMode, label: language === "es" ? "Calculadora" : "Calculator", icon: "🔢", desc: "Calculadora funcional activa" },
          { mode: "notes" as AppDisguiseMode, label: language === "es" ? "Bloc de Notas" : "Notepad", icon: "📝", desc: "Notas rápidas de texto" },
          { mode: "weather" as AppDisguiseMode, label: language === "es" ? "Reporte Clima" : "Weather", icon: "⛅", desc: "Pronóstico meteorológico" },
          { mode: "normal" as AppDisguiseMode, label: language === "es" ? "VESSEL Nativo" : "Native VESSEL", icon: "⚑", desc: "Brutalista táctico" },
        ].map((item) => {
          const isSelected = appDisguise.mode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setAppDisguiseMode(item.mode);
              }}
              className={`p-3 min-h-[50px] rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                isSelected
                  ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft font-bold"
                  : "bg-black/50 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-mono font-bold truncate">{item.label}</span>
              </div>
              <span className="text-[9px] font-mono text-neutral-400 truncate mt-1">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-black/60 rounded-2xl border border-white/10 text-[11px] text-neutral-300 font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold flex items-center gap-1.5">
            <span>⚡</span>
            <span>Flip-to-Cover (Sensor de Giro):</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            ACTIVO
          </span>
        </div>
        <p className="text-neutral-400 text-[10px] leading-relaxed">
          {language === "es"
            ? "Si das vuelta el teléfono boca abajo sobre una mesa o superficie, la app salta de inmediato a la pantalla de cobertura señuelo."
            : "If you place your phone face down on a table or surface, the app immediately locks to the decoy cover screen."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <div className="text-[10px] font-mono text-neutral-400">
          <span>{language === "es" ? "PIN de Coacción bajo amenaza:" : "Duress PIN under threat:"}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            openDuressPinSettings();
          }}
          className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/30 text-[10px] font-mono font-bold transition-all cursor-pointer"
        >
          {language === "es" ? "Configurar PIN Duress" : "Configure Duress PIN"}
        </button>
      </div>
    </div>
  );
};
