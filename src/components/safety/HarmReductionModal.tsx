"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  HeartPulse,
  Droplets,
  Clock,
  Plus,
  AlertOctagon,
  PhoneCall,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const HarmReductionModal: React.FC = () => {
  const {
    isHarmReductionModalOpen,
    closeHarmReductionModal,
    harmReductionSession,
    startHarmReductionSession,
    endHarmReductionSession,
    logHarmReductionDose,
    drinkWaterAck,
    t,
  } = useVessel();

  const [activeTab, setActiveTab] = useState<"session" | "log" | "emergency">("session");
  const [selectedSubstance, setSelectedSubstance] = useState<string>("G");
  const [doseAmount, setDoseAmount] = useState<string>("");
  const [doseNotes, setDoseNotes] = useState<string>("");

  if (!isHarmReductionModalOpen) return null;

  const isSessionActive = harmReductionSession?.isActive;

  const handleStart = () => {
    audioEngine.playPulse();
    startHarmReductionSession();
  };

  const handleEnd = () => {
    if (window.confirm("¿Deseas finalizar la sesión de reducción de daños?")) {
      audioEngine.playPulse();
      endHarmReductionSession();
    }
  };

  const handleDrinkWater = () => {
    audioEngine.playStateSwitch("open");
    drinkWaterAck();
  };

  const handleLogDose = (substance?: string, amount?: string) => {
    const sub = substance || selectedSubstance;
    const amt = amount || doseAmount || "1 dosis";
    const note = doseNotes.trim() ? `${amt} • ${doseNotes.trim()}` : amt;
    audioEngine.playPulse();
    logHarmReductionDose(sub, note);
    setDoseAmount("");
    setDoseNotes("");
  };

  // Minutos desde el último vaso de agua
  const minutesSinceWater = harmReductionSession?.lastWaterPromptAt
    ? Math.floor((Date.now() - new Date(harmReductionSession.lastWaterPromptAt).getTime()) / 60000)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-lg bg-[#0c0c0c] border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Táctico */}
        <div className="p-4 border-b border-emerald-500/30 bg-emerald-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-white flex items-center gap-2">
                <span>Asistente de Sesión</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REDUCCIÓN DE DAÑOS
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                Cuidado mutuo, hidratación y registro temporal sin juicio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeHarmReductionModal}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="grid grid-cols-3 border-b border-white/10 bg-black/40 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("session")}
            className={`py-2.5 text-center font-bold transition-all border-b-2 ${
              activeTab === "session"
                ? "border-emerald-500 text-emerald-300 bg-emerald-950/20"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            💧 Hidratación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("log")}
            className={`py-2.5 text-center font-bold transition-all border-b-2 ${
              activeTab === "log"
                ? "border-emerald-500 text-emerald-300 bg-emerald-950/20"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            📋 Dosis ({harmReductionSession?.doses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("emergency")}
            className={`py-2.5 text-center font-bold transition-all border-b-2 ${
              activeTab === "emergency"
                ? "border-red-500 text-red-300 bg-red-950/20"
                : "border-transparent text-neutral-400 hover:text-red-400"
            }`}
          >
            🚨 Primeros Auxilios
          </button>
        </div>

        {/* Contenido Modular */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === "session" && (
            <div className="space-y-4">
              {isSessionActive ? (
                <>
                  {/* Tarjeta de Hidratación en Vivo */}
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-cyan-400 animate-bounce" />
                        <span className="font-mono font-bold text-white text-xs uppercase">
                          Alerta de Agua cada 45 min
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                        ACTIVO
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed font-mono">
                      Tu cuerpo necesita hidratación constante en ambientes de alta intensidad o fiesta. Te alertaremos con un pulso sub-bass cada 45 minutos.
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/40 p-2.5 rounded-xl border border-white/10">
                      <span>Último vaso registrado:</span>
                      <span className="text-white font-bold">Hace {minutesSinceWater} min</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDrinkWater}
                      className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-obsidian-deep font-mono font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Droplets className="w-4 h-4 fill-current" />
                      <span>TOMÉ AGUA // REINICIAR ALERTA 💧</span>
                    </button>
                  </div>

                  {/* Registro Rápido de Dosis */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-electricViolet-glow text-xs uppercase">
                        Registro Rápido de Dosis (Local & Secreto)
                      </span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        Solo en tu dispositivo
                      </span>
                    </div>

                    {/* Botones de 1-Tap */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "G", defaultAmt: "0.8 ml" },
                        { name: "T", defaultAmt: "1 toque" },
                        { name: "K", defaultAmt: "1 punta" },
                        { name: "Poppers", defaultAmt: "Inhalación" },
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleLogDose(item.name, item.defaultAmt)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-electricViolet/20 border border-white/10 hover:border-electricViolet/40 text-center font-mono transition-all active:scale-95 cursor-pointer"
                        >
                          <div className="font-bold text-white text-xs">{item.name}</div>
                          <div className="text-[9px] text-neutral-400">{item.defaultAmt}</div>
                        </button>
                      ))}
                    </div>

                    {/* Input manual */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={selectedSubstance}
                        onChange={(e) => setSelectedSubstance(e.target.value)}
                        placeholder="Sustancia"
                        className="w-1/3 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        value={doseAmount}
                        onChange={(e) => setDoseAmount(e.target.value)}
                        placeholder="Cantidad (ej: 0.5ml)"
                        className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleLogDose()}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer"
                        title="Registrar dosis"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnd}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-red-500/30 text-red-400 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Finalizar Sesión de Cuidado
                  </button>
                </>
              ) : (
                /* Estado Inactivo */
                <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                    <HeartPulse className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-mono font-bold text-white text-sm uppercase">
                      Inicia tu Sesión de Cuidado
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-mono max-w-sm mx-auto">
                      VESSEL te acompaña en tus noches de fiesta o encuentros prolongados. Registra tiempos exactos entre dosis para evitar accidentes y mantente hidratado.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
                  >
                    INICIAR ASISTENTE DE SESIÓN 🔥
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "log" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 border-b border-white/10 pb-2">
                <span>HISTORIAL DE DOSIFICACIÓN</span>
                <span>{harmReductionSession?.doses?.length || 0} Registros</span>
              </div>

              {harmReductionSession?.doses && harmReductionSession.doses.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {[...harmReductionSession.doses].reverse().map((dose) => {
                    const elapsedMin = Math.floor(
                      (Date.now() - new Date(dose.timestamp).getTime()) / 60000
                    );

                    return (
                      <div
                        key={dose.id}
                        className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-electricViolet animate-pulse" />
                          <div>
                            <span className="font-bold text-white uppercase">{dose.substanceLabel}</span>
                            {dose.notes && (
                              <span className="text-neutral-400 ml-2 text-[11px]">
                                ({dose.notes})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-electricViolet-glow font-bold text-[11px] block">
                            Hace {elapsedMin} min
                          </span>
                          <span className="text-[9px] text-neutral-500">
                            {new Date(dose.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-neutral-500 font-mono text-xs">
                  Aún no hay dosis registradas en esta sesión.
                </div>
              )}
            </div>
          )}

          {activeTab === "emergency" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Protocolo de Emergencia Médica</span>
                </div>
                <p className="text-[11px] text-neutral-300 font-mono leading-relaxed">
                  Si alguien pierde la consciencia, tiene labios azulados, respiración lenta (&lt;10 por minuto) o no responde:
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs text-neutral-300">
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="font-bold text-white block">1. Posición Lateral de Seguridad (PLS)</span>
                  <p className="text-[11px] text-neutral-400">
                    Coloca a la persona de costado con la cabeza inclinada hacia atrás para que la vía aérea permanezca abierta y no se asfixie ante eventual vómito.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="font-bold text-white block">2. NUNCA lo dejes solo ni le des café/ducha fría</span>
                  <p className="text-[11px] text-neutral-400">
                    No induzcas el vómito. Quédate a su lado y comprueba su respiración cada 2 minutos.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="font-bold text-white block">3. Amparo Legal Médico</span>
                  <p className="text-[11px] text-neutral-400">
                    El personal de ambulancias y emergencias tiene secreto profesional. Priorizan salvar la vida, no llamar a la policía.
                  </p>
                </div>
              </div>

              <a
                href="tel:107"
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>LLAMAR A EMERGENCIAS (107 / 911)</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-neutral-950 flex items-center justify-between text-[11px] font-mono text-neutral-400">
          <span>VESSEL HARM REDUCTION PROTOCOL</span>
          <button
            type="button"
            onClick={closeHarmReductionModal}
            className="text-neutral-300 hover:text-white font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
