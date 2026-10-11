"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ShieldCheck, Flame, ImageIcon, Send, Mic, Plus } from "lucide-react";
import { UserBoundarySetting, SupportedLanguage } from "@/types/vessel";
import { TranslationType } from "@/lib/i18n/translations";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ChatVoiceRecorderInline } from "./ChatVoiceRecorderInline";


interface ChatInputBarProps {
  activeBoundary?: UserBoundarySetting | null;
  isVoiceRecording: boolean;
  setIsVoiceRecording: (recording: boolean) => void;
  isBurnMode: boolean;
  setIsBurnMode: (burn: boolean) => void;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  isSendingMessage: boolean;
  language: SupportedLanguage;
  t: TranslationType;
  onSend: (e: React.FormEvent) => void;
  onSendVoiceMessage: (audioDataUri: string, durationSeconds: number, waveform: number[]) => void;
  onOpenSendMedia: () => void;
  onOpenBoundaryModal: () => void;
  onOpenActionHub?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  activeBoundary,
  isVoiceRecording,
  setIsVoiceRecording,
  isBurnMode,
  setIsBurnMode,
  inputMessage,
  setInputMessage,
  setIsInputFocused,
  isSendingMessage,
  language,
  t,
  onSend,
  onSendVoiceMessage,
  onOpenSendMedia,
  onOpenBoundaryModal,
  onOpenActionHub,
}) => {
  {/* ESTADO SOLO LECTURA POR LÍMITES */}
  if (activeBoundary?.chatStatus === "readonly") {
    return (
      <div className="flex-shrink-0 sticky bottom-0 z-20 p-3.5 border-t border-purple-500/30 bg-purple-950/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{t.chat.readonlyTitle}</span>
          </div>
          <button
            type="button"
            onClick={onOpenBoundaryModal}
            className="text-[10px] text-electricViolet-glow hover:underline font-bold"
          >
            {t.chat.manageLimits}
          </button>
        </div>
        <p className="text-[11px] text-neutral-300 leading-tight">
          {t.chat.readonlyDesc}
        </p>
      </div>
    );
  }

  {/* ESTADO DESCONECTADO POR LÍMITES */}
  if (activeBoundary?.chatStatus === "disconnected") {
    return (
      <div className="flex-shrink-0 sticky bottom-0 z-20 p-3.5 border-t border-bloodNeon/30 bg-bloodNeon/10 space-y-1.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-bloodNeon">
          <ShieldCheck className="w-4 h-4" />
          <span>{t.chat.disconnectedTitle}</span>
        </div>
        <p className="text-[10px] text-neutral-400">
          {t.chat.disconnectedDesc}
        </p>
        <button
          type="button"
          onClick={onOpenBoundaryModal}
          className="text-[10px] text-neutral-300 hover:text-white underline font-semibold mt-1"
        >
          {t.chat.restoreConnection}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 sticky bottom-0 z-20 flex flex-col border-t border-white/10 bg-obsidian-surface">
      {isVoiceRecording ? (
        <div className="pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] w-full">
          <ChatVoiceRecorderInline
            onSend={onSendVoiceMessage}
            onCancel={() => setIsVoiceRecording(false)}
            isBurnMode={isBurnMode}
          />
        </div>
      ) : (
        <div className="flex flex-col">
          <form
            onSubmit={onSend}
            className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
          >
            {/* BOTÓN ACTION HUB TÁCTICO DEL PULGAR [+] */}
            {onOpenActionHub && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(60);
                  onOpenActionHub();
                }}
                aria-label={language === "es" ? "Herramientas de encuentro y seguridad" : "Tactical actions"}
                className="group p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border border-electricViolet/40 bg-electricViolet/15 text-electricViolet-glow hover:bg-electricViolet hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0 shadow-violet-soft"
                title={language === "es" ? "Acciones de Encuentro y Seguridad (+)" : "Action Hub (+)"}
              >
                <Plus className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-45 group-active:scale-90" />
              </button>
            )}

            {/* BOTÓN MODO EFÍMERO (44x44px ERGONÓMICO) */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playStateSwitch("occupied");
                setIsBurnMode(!isBurnMode);
              }}
              aria-label={
                isBurnMode
                  ? (language === "es" ? "Desactivar modo efímero" : "Disable burn mode")
                  : (language === "es" ? "Activar modo efímero de 1 vista" : "Enable burn mode")
              }
              aria-pressed={isBurnMode}
              className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 flex-shrink-0 ${
                isBurnMode
                  ? "bg-bloodNeon/25 border-bloodNeon text-bloodNeon shadow-blood-glow"
                  : "border-white/10 bg-white/5 text-neutral-400 hover:text-bloodNeon hover:border-bloodNeon/50"
              }`}
              title={isBurnMode ? (language === "es" ? "Modo Efímero Activo (1 sola lectura)" : "Burn Mode ON") : (language === "es" ? "Activar Modo Efímero (🔥)" : "Toggle Burn Mode (🔥)")}
            >
              <Flame
                className={`w-4 h-4 transition-transform duration-200 ${
                  isBurnMode
                    ? "animate-pulse fill-bloodNeon scale-110 drop-shadow-[0_0_8px_rgba(255,30,56,0.8)]"
                    : "hover:scale-110"
                }`}
              />
            </button>

            {/* BOTÓN ADJUNTAR MULTIMEDIA (44x44px) */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                onOpenSendMedia();
              }}
              aria-label={t.chat.attachMediaTooltip}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-electricViolet-glow hover:border-electricViolet/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0"
              title={t.chat.attachMediaTooltip}
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* INPUT DE TEXTO */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                aria-label={language === "es" ? "Escribir mensaje" : "Write a message"}
                placeholder={
                  activeBoundary?.chatStatus === "muted"
                    ? t.chat.mutedPlaceholder
                    : isBurnMode
                    ? t.chat.burnModeActive
                    : t.chat.normalPlaceholder || (language === "es" ? "Escribí un mensaje..." : "Write a message...")
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className={`w-full min-h-[44px] bg-black/50 border rounded-2xl text-white text-base sm:text-xs px-3.5 py-2 sm:py-2.5 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 transition-all ${
                  isBurnMode
                    ? "border-bloodNeon/60 focus:border-bloodNeon focus-visible:ring-bloodNeon/60 pr-8"
                    : "border-white/10 focus:border-electricViolet focus-visible:ring-electricViolet/60"
                }`}
              />
              {isBurnMode && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none" title="Modo efímero activo">
                  🔥
                </span>
              )}
            </div>

            {/* BOTÓN REACTIVO CON MORPHING ANIMADO: TEXTO -> ENVIAR / VACÍO -> MICRÓFONO */}
            <AnimatePresence mode="wait" initial={false}>
              {inputMessage.trim() ? (
                <motion.button
                  key="chat-send-btn"
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.9 }}
                  type="submit"
                  disabled={isSendingMessage}
                  aria-label={language === "es" ? "Enviar mensaje" : "Send message"}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-90 bg-electricViolet hover:bg-electricViolet-glow text-white shadow-[0_0_18px_rgba(139,92,246,0.6)] flex-shrink-0"
                >
                  <Send
                    className={`w-4 h-4 fill-current transition-transform ${
                      isSendingMessage ? "animate-plane-launch" : ""
                    }`}
                  />
                </motion.button>
              ) : (
                <motion.button
                  key="chat-mic-btn"
                  initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  transition={{ type: "spring", stiffness: 160, damping: 16, mass: 0.9 }}
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsVoiceRecording(true);
                  }}
                  aria-label={t.chat.voiceTapToRecord}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-mintNeon hover:border-mintNeon/50 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95 flex-shrink-0"
                  title={t.chat.voiceTapToRecord}
                >
                  <Mic className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

          </form>
        </div>
      )}
    </div>
  );
};
