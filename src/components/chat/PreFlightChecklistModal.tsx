"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { PreFlightTempo, PreFlightProtection, PreFlightVibe } from "@/types/vessel";

export const PreFlightChecklistModal: React.FC = () => {
  const {
    isPreFlightModalOpen,
    closePreFlightModal,
    preFlightTargetProfile,
    sendPreFlightChecklist,
    t,
  } = useVessel();

  const [tempo, setTempo] = useState<PreFlightTempo>("fast_carnal");
  const [selectedDynamics, setSelectedDynamics] = useState<string[]>([
    "oral_focus",
    "penetration",
  ]);
  const [protection, setProtection] = useState<PreFlightProtection>("bareback_prep");
  const [vibe, setVibe] = useState<PreFlightVibe>("100_sober");

  if (!isPreFlightModalOpen || !preFlightTargetProfile) return null;

  const toggleDynamic = (id: string) => {
    setSelectedDynamics((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    sendPreFlightChecklist(preFlightTargetProfile.id, {
      tempo,
      dynamics: selectedDynamics,
      protection,
      vibe,
      isMutualMatch: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-electricViolet-glow">
                {t.tacticalSuite.preFlight.title}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Sintonía para encuentro con <strong className="text-neutral-200">{preFlightTargetProfile.codename}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePreFlightModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* 1. Ritmo */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              1. {t.tacticalSuite.preFlight.tempoTitle}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "fast_carnal" as PreFlightTempo, label: t.tacticalSuite.preFlight.fastCarnal, icon: "⚡" },
                { key: "sensual_slow" as PreFlightTempo, label: t.tacticalSuite.preFlight.sensualSlow, icon: "🔥" },
                { key: "rough_dom" as PreFlightTempo, label: t.tacticalSuite.preFlight.roughDom, icon: "⛓️" },
                { key: "chill" as PreFlightTempo, label: t.tacticalSuite.preFlight.chill, icon: "🫂" },
              ].map((item) => {
                const isSelected = tempo === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTempo(item.key)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-electricViolet text-electricViolet-glow font-bold shadow-sm"
                        : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dinámicas Deseadas */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              2. {t.tacticalSuite.preFlight.dynamicsTitle}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "oral_focus", label: "Solo Oral / Garganta", icon: "👅" },
                { id: "penetration", label: "Penetración Activa/Pasiva", icon: "🍆" },
                { id: "massage", label: "Masaje / Cuerpo a cuerpo", icon: "💆" },
                { id: "kink_gear", label: "Fetiche / Arnés / Leather", icon: "⛓️" },
                { id: "sensual_kiss", label: "Besos & Sensualidad", icon: "💋" },
                { id: "voyeur_jerk", label: "Voyeur / Paja mutua", icon: "👁️" },
              ].map((dyn) => {
                const isSelected = selectedDynamics.includes(dyn.id);
                return (
                  <button
                    key={dyn.id}
                    type="button"
                    onClick={() => toggleDynamic(dyn.id)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-neutral-800 border-electricViolet/60 text-neutral-200"
                        : "bg-neutral-900/30 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{dyn.icon}</span>
                      <span className="truncate">{dyn.label}</span>
                    </span>
                    <span className={`font-mono text-[10px] ${isSelected ? "text-electricViolet-glow" : "text-neutral-600"}`}>
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Protección */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              3. {t.tacticalSuite.preFlight.protectionTitle}
            </label>
            <div className="space-y-1.5">
              {[
                { key: "bareback_prep" as PreFlightProtection, label: "Bareback con PrEP (U=U / Profilaxis activa)" },
                { key: "prep_doxypep" as PreFlightProtection, label: "PrEP + Doxy-PEP posterior" },
                { key: "condoms" as PreFlightProtection, label: "Preservativo estricto en penetración" },
                { key: "discuss" as PreFlightProtection, label: "Conversar y consensuar en privado" },
              ].map((item) => {
                const isSelected = protection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setProtection(item.key)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-purple-950/40 border-electricViolet text-purple-200 font-bold"
                        : "bg-neutral-900/30 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className={`w-3 h-3 rounded-full border ${isSelected ? "border-electricViolet bg-electricViolet" : "border-neutral-600"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Vibe / Sustancias */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              4. {t.tacticalSuite.preFlight.vibeTitle}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "100_sober" as PreFlightVibe, label: "100% Sobrio", icon: "💧" },
                { key: "drinks" as PreFlightVibe, label: "Un trago", icon: "🍸" },
                { key: "420_friendly" as PreFlightVibe, label: "420 Friendly", icon: "🌿" },
              ].map((item) => {
                const isSelected = vibe === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setVibe(item.key)}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-electricViolet text-electricViolet-glow font-bold shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                        : "bg-neutral-900/30 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="font-mono text-[10px] truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <span className="font-mono text-[11px] text-electricViolet-glow flex items-center gap-1">
            <span>🔥</span>
            <span>{t.tacticalSuite.preFlight.matchBadge}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closePreFlightModal}
              className="px-3 py-1.5 rounded font-mono text-xs text-neutral-400 hover:text-neutral-200"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-4 py-2 bg-gradient-to-r from-electricViolet to-purple-600 hover:from-electricViolet-glow hover:to-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-purple-950/40 active:scale-95 transition-all"
            >
              {t.tacticalSuite.preFlight.sendBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
