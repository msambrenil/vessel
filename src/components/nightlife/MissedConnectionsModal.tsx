"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { MissedConnection } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Eye, Clock, Send, Check, MessageSquare, X, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export const MissedConnectionsModal: React.FC = () => {
  const {
    isMissedConnectionsModalOpen,
    closeMissedConnectionsModal,
    missedConnections,
    sendMissedConnectionPulse,
    setSelectedProfile,
    profiles,
    setActiveChatProfileId,
    setActiveView,
    language,
  } = useVessel();

  const [activeNoteInputId, setActiveNoteInputId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");

  if (!isMissedConnectionsModalOpen) return null;

  const handleSendPulse = (connId: string) => {
    sendMissedConnectionPulse(connId, noteText.trim() || undefined);
    setActiveNoteInputId(null);
    setNoteText("");
  };

  const handleOpenChat = (peerProfileId: string) => {
    closeMissedConnectionsModal();
    setActiveChatProfileId(peerProfileId);
    setActiveView("chat");
  };

  const handleSelectProfile = (peerProfileId: string) => {
    const prof = profiles.find((p) => p.id === peerProfileId);
    if (prof) {
      setSelectedProfile(prof);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-obsidian border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Cabecera Brutalista */}
        <div className="p-4 border-b border-white/10 bg-obsidian-surface flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-electricViolet-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Cruces en la Pista
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30 font-mono text-[10px] font-bold">
                  {missedConnections.length} detectados
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Gente con la que coincidiste en la fiesta (retención 48h // Zero-Doxing)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMissedConnectionsModal}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Cruces */}
        <div className="p-4 overflow-y-auto space-y-3.5">
          {missedConnections.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <Eye className="w-10 h-10 mx-auto mb-2 opacity-30 text-electricViolet" />
              <p className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wide">
                Sin cruces recientes
              </p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-1">
                Hacé check-in cuando estés en un boliche o evento para que el radar registre los cruces presenciales.
              </p>
            </div>
          ) : (
            missedConnections.map((conn) => (
              <div
                key={conn.id}
                className="p-3.5 bg-neutral-900/80 hover:bg-neutral-900 border border-white/10 hover:border-electricViolet/40 rounded-xl transition-all flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  {/* Foto de perfil en aspect-[2/3] Impeccable */}
                  <div
                    onClick={() => handleSelectProfile(conn.peerProfileId)}
                    className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border border-white/15 cursor-pointer flex-shrink-0 group shadow-md"
                  >
                    <img
                      src={conn.peerAvatarUrl}
                      alt={conn.peerCodename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-1 left-1 right-1 text-center font-mono text-[9px] font-bold text-electricViolet-glow truncate">
                      {conn.peerRole}
                    </span>
                  </div>

                  {/* Metadatos del Encuentro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        onClick={() => handleSelectProfile(conn.peerProfileId)}
                        className="font-mono text-sm font-bold text-white hover:text-electricViolet-glow cursor-pointer truncate"
                      >
                        {conn.peerCodename}, {conn.peerAge}
                      </span>
                      <span className="text-[9.5px] font-mono text-neutral-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        <Clock className="w-3 h-3 text-electricViolet-glow" />
                        <span>48h</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                      <span className="font-semibold truncate">{conn.venueName}</span>
                    </div>

                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      ⏱️ {conn.approximateTimeWindow}
                    </p>

                    {/* Mensaje recibido si ya nos mandaron pulso */}
                    {conn.pulseReceived && conn.pulseNote && (
                      <div className="mt-2 p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-start gap-1.5">
                        <span className="text-purple-400 text-xs">💬</span>
                        <span className="italic">"{conn.pulseNote}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Contacto */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  {conn.pulseReceived ? (
                    <button
                      type="button"
                      onClick={() => handleOpenChat(conn.peerProfileId)}
                      className="w-full py-2 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-violet-soft active:scale-95 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Abrir Chat Directo // Coincidencia Confirmada</span>
                    </button>
                  ) : conn.pulseSent ? (
                    <div className="w-full py-2 bg-white/5 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pulso de Reencuentro Enviado ✓</span>
                    </div>
                  ) : activeNoteInputId === conn.id ? (
                    <div className="w-full flex items-center gap-1.5">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Nota opcional (ej: Estaba al lado del DJ)"
                        className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSendPulse(conn.id)}
                        className="px-3 py-1.5 bg-electricViolet text-white font-mono text-xs font-bold rounded-lg hover:bg-electricViolet-glow transition-all flex items-center gap-1 shadow-violet-soft"
                      >
                        <Send className="w-3 h-3" />
                        <span>Enviar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveNoteInputId(null)}
                        className="px-2 py-1.5 bg-white/10 text-neutral-400 hover:text-white rounded-lg text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveNoteInputId(conn.id)}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-750 border border-white/15 hover:border-electricViolet/60 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-electricViolet-glow" />
                      <span>Mandar Pulso de Reencuentro ("Te vi en la pista")</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
