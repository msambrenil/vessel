"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Moon, Home, Search, Users, X, Music, Check, Sparkles } from "lucide-react";

export const AfterHoursModal: React.FC = () => {
  const { isAfterHoursModalOpen, closeAfterHoursModal, profiles, setSelectedProfile } = useVessel();
  const [activeTab, setActiveTab] = useState<"host" | "seek">("seek");
  const [capacity, setCapacity] = useState<number>(3);
  const [hasMusic, setHasMusic] = useState<boolean>(true);
  const [isHostingActive, setIsHostingActive] = useState<boolean>(false);

  if (!isAfterHoursModalOpen) return null;

  const afterProfiles = profiles.slice(0, 4);

  const handleToggleHosting = () => {
    setIsHostingActive((prev) => !prev);
    audioEngine.playSubBass(60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-obsidian border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-obsidian-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Radar After-Hours // Despacho 04:30 - 10:00
              </h2>
              <p className="text-[11px] text-neutral-400">
                Coordinación táctica para continuar la noche
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAfterHoursModal}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Modo: Hospedo vs Busco */}
        <div className="p-3 border-b border-white/10 bg-neutral-950 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("seek");
              audioEngine.playSubBass(50);
            }}
            className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "seek"
                ? "bg-indigo-900/60 border border-indigo-500/50 text-indigo-200 shadow-md"
                : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Busco After</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("host");
              audioEngine.playSubBass(50);
            }}
            className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "host"
                ? "bg-electricViolet/20 border border-electricViolet text-electricViolet-glow shadow-md"
                : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Hospedo After</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-4 overflow-y-auto space-y-4">
          {activeTab === "host" ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-900 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">
                    Capacidad Máxima de Invitados
                  </span>
                  <span className="font-mono text-sm font-bold text-electricViolet-glow">
                    {capacity} personas
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full accent-electricViolet"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-900 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-xs text-neutral-200">Música & Sonido Listo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasMusic((prev) => !prev)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    hasMusic ? "bg-purple-600" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      hasMusic ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleHosting}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isHostingActive
                    ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300"
                    : "bg-electricViolet text-white font-bold hover:bg-electricViolet-glow shadow-violet-soft"
                }`}
              >
                {isHostingActive ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>After Activo // Visible para cercanos ✓</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Publicar After en Radar (Waypoint Seguro en 2 fases)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Afters Abiertos Cerca
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {afterProfiles.length} lugares activos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {afterProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProfile(p);
                    }}
                    className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-white/10 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={p.avatarUrl}
                        alt={p.codename}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs font-bold text-white block truncate">
                          {p.codename}
                        </span>
                        <span className="text-[9.5px] font-mono text-indigo-300 block">
                          🏠 Palermo • &lt; 300m
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 line-clamp-2">
                      "After chill con techno suave y bebidas frías. Hasta 4 personas."
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
