"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { WingmanPair } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Users, Shield, ShieldCheck, HeartHandshake, X, Check, AlertCircle } from "lucide-react";

export const WingmanModal: React.FC = () => {
  const {
    isWingmanModalOpen,
    closeWingmanModal,
    wingmanPair,
    pairWingman,
    unpairWingman,
    updateWingmanStatus,
    profiles,
  } = useVessel();

  const [enteredPin, setEnteredPin] = useState("");
  const myPairingPin = "7492"; // PIN dinámico del usuario

  if (!isWingmanModalOpen) return null;

  const handlePairFriend = () => {
    if (enteredPin.length === 4) {
      // Tomamos el primer perfil de mock como amigo vinculado
      const friendMock = profiles[1] || profiles[0];
      pairWingman(
        friendMock.id,
        friendMock.codename,
        friendMock.avatarUrl,
        enteredPin
      );
      setEnteredPin("");
    }
  };

  const handleStatusUpdate = (status: WingmanPair["status"]) => {
    updateWingmanStatus(status);
    audioEngine.playSubBass(60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-md bg-obsidian border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-obsidian-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Modo Wingman // Salgo con Amigo
              </h2>
              <p className="text-[11px] text-neutral-400">
                Cuidado mutuo y alertas de seguridad en la noche
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeWingmanModal}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4">
          {wingmanPair ? (
            /* Wingman Activo */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-3">
                <img
                  src={wingmanPair.partnerAvatarUrl}
                  alt={wingmanPair.partnerCodename}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-white truncate">
                      {wingmanPair.partnerCodename}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                      ACTIVO
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Vinculado con PIN • Cuidado cruzado activo
                  </span>
                </div>
              </div>

              {/* Selector de Estado en la Noche */}
              <div>
                <span className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                  Estado Actual de Ambos
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("partying_together")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      wingmanPair.status === "partying_together"
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                        : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🎉 De joda juntos
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("separated_safely")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      wingmanPair.status === "separated_safely"
                        ? "bg-purple-950/80 border-electricViolet text-purple-200 ring-1 ring-electricViolet shadow-violet-soft"
                        : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🚶 Separados con aviso
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("on_hookup")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      wingmanPair.status === "on_hookup"
                        ? "bg-purple-950/80 border-purple-500 text-purple-300 ring-1 ring-purple-500"
                        : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🔥 En cita / encuentro
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("needs_help")}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                      wingmanPair.status === "needs_help"
                        ? "bg-red-950 border-red-500 text-red-300 ring-1 ring-red-500 animate-pulse"
                        : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🚨 Necesito auxilio
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={unpairWingman}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Desvincular Wingman al terminar la noche
              </button>
            </div>
          ) : (
            /* Formulario de Vinculación */
            <div className="space-y-4">
              <div className="p-3 bg-neutral-900 border border-white/10 rounded-xl text-center">
                <span className="text-[11px] text-neutral-400 block font-mono">
                  TU PIN DE VINCULACIÓN PARA ESTA NOCHE:
                </span>
                <span className="text-2xl font-black font-mono text-electricViolet-glow tracking-widest block my-1">
                  {myPairingPin}
                </span>
                <span className="text-[10px] text-neutral-500">
                  Dáselo a tu amigo para que lo ingrese en su app
                </span>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  O ingresá el PIN de 4 dígitos de tu amigo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="flex-1 bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold text-white tracking-widest focus:outline-none focus:border-electricViolet"
                  />
                  <button
                    type="button"
                    onClick={handlePairFriend}
                    disabled={enteredPin.length !== 4}
                    className="px-5 bg-electricViolet hover:bg-electricViolet-glow disabled:opacity-40 text-white font-mono text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-violet-soft"
                  >
                    Vincular
                  </button>
                </div>
              </div>

              <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl text-[11px] text-neutral-400 space-y-1">
                <p className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ¿Cómo los protege el Modo Wingman?
                </p>
                <p>• Si te separás o te vas a un encuentro, tu amigo sabe que estás bien sin invadir tu privacidad.</p>
                <p>• Botón de asistencia de 1 tap si te sentís mal o te echan algo en el trago.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
