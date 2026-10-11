"use client";

import React from "react";
import { Ghost, Zap } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface ChatQuickActionBarProps {
  quickBarMode: "quick" | "antiGhost";
  onChangeQuickBarMode: (mode: "quick" | "antiGhost") => void;
  quickReplies: string[];
  kindClosureMessages: Array<{ id: string; emoji: string; title: string; text: string }>;
  isInputFocused: boolean;
  language: string;
  onQuickReply: (text: string) => void;
  onSendKindClosure: (text: string) => void;
  onOpenKindClosureInfo: () => void;
}

export const ChatQuickActionBar: React.FC<ChatQuickActionBarProps> = ({
  quickBarMode,
  onChangeQuickBarMode,
  quickReplies,
  kindClosureMessages,
  isInputFocused,
  language,
  onQuickReply,
  onSendKindClosure,
  onOpenKindClosureInfo,
}) => {
  return (
    <div
      className={`px-2.5 py-1.5 bg-obsidian-surface/90 border-t border-white/10 ${
        isInputFocused ? "hidden sm:flex" : "flex"
      } items-center gap-1.5 overflow-x-auto no-scrollbar select-none`}
    >
      {quickBarMode === "quick" ? (
        <>
          {/* Switcher a modo Anti-Ghost (+5 Karma) */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onChangeQuickBarMode("antiGhost");
            }}
            className="px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 shadow-sm"
            title={language === "es" ? "Cambiar a Salidas Respetuosas Cero Ghosting (+5 Karma)" : "Switch to Anti-Ghost Exits (+5 Karma)"}
          >
            <Ghost className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span>{language === "es" ? "SALIDA CON ONDA (+5)" : "NO-GHOST (+5)"}</span>
          </button>

          <span className="w-[1px] h-3.5 bg-white/15 flex-shrink-0" />

          {/* Chips de Respuesta Relámpago */}
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickReply(chip)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-electricViolet/15 border border-white/10 hover:border-electricViolet/50 text-[10px] font-mono text-neutral-300 hover:text-electricViolet-glow whitespace-nowrap transition-all active:scale-95 cursor-pointer flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </>
      ) : (
        <>
          {/* Switcher para volver a Respuestas Rápidas */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onChangeQuickBarMode("quick");
            }}
            className="px-2.5 py-1 rounded-full bg-electricViolet/20 hover:bg-electricViolet/30 border border-electricViolet/40 hover:border-electricViolet text-electricViolet-glow text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 shadow-sm"
            title="Volver a Respuestas Rápidas Relámpago"
          >
            <Zap className="w-3 h-3 text-electricViolet-glow fill-current flex-shrink-0" />
            <span>RÁPIDAS</span>
          </button>

          <span className="w-[1px] h-3.5 bg-white/15 flex-shrink-0" />

          {/* Chips de Salida Elegante Anti-Ghost (+5 Respect Karma) */}
          {kindClosureMessages.map((km) => (
            <button
              key={km.id}
              type="button"
              onClick={() => onSendKindClosure(km.text)}
              className="px-2.5 py-1 rounded-full bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-500/60 text-[10px] text-neutral-200 hover:text-emerald-300 font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
              title={`Enviar: "${km.text}" (+5 Respect Karma)`}
            >
              <span className="text-xs">{km.emoji}</span>
              <span>{km.title}</span>
            </button>
          ))}

          {/* Botón para abrir el panel explicativo completo */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenKindClosureInfo();
            }}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-neutral-400 hover:text-white whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
            title="Ver detalles y guía de salida respetuosa"
          >
            + Info
          </button>
        </>
      )}
    </div>
  );
};
