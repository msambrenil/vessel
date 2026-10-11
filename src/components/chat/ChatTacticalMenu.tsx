"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  HeartHandshake,
  ShieldAlert,
  Save,
  Lock,
  CheckCircle2,
  MessageSquareHeart,
  Trash2,
} from "lucide-react";
import { VesselProfile, UserBoundarySetting } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BrutalistButton, TacticalMenuItem } from "@/components/ui";

interface ChatTacticalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VesselProfile;
  dossierAlias?: string;
  language: string;
  onOpenKindClosure: () => void;
  onOpenBoundaryModal: () => void;
  activeBoundary?: UserBoundarySetting | null;
  currentRetention: "persistent" | "ephemeral";
  onToggleRetention: () => void;
  onOpenDossier: () => void;
  onOpenFullProfile: () => void;
  onOpenCreateDiary: () => void;
  isEncounterValidated?: boolean;
  onOpenTestimonial: () => void;
  onValidateEncounter: () => void;
  hasMessages: boolean;
  onClearMessages: () => void;
}

export const ChatTacticalMenu: React.FC<ChatTacticalMenuProps> = ({
  isOpen,
  onClose,
  profile,
  dossierAlias,
  language,
  onOpenKindClosure,
  onOpenBoundaryModal,
  activeBoundary,
  currentRetention,
  onToggleRetention,
  onOpenDossier,
  onOpenFullProfile,
  onOpenCreateDiary,
  isEncounterValidated,
  onOpenTestimonial,
  onValidateEncounter,
  hasMessages,
  onClearMessages,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={
        language === "es"
          ? `Opciones del chat con ${profile.codename}`
          : `Chat options with ${profile.codename}`
      }
    >
      <div
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col border border-white/20 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.98)] overflow-hidden select-none text-left animate-in zoom-in-95 duration-150 bg-obsidian-deep"
        role="menu"
        aria-orientation="vertical"
      >
        {/* Encabezado con Botón de Cierre 44x44px */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#13131A] flex-shrink-0">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-tight truncate font-mono">
                {language === "es"
                  ? `Opciones con ${dossierAlias || profile.codename}`
                  : `Options with ${dossierAlias || profile.codename}`}
              </span>
              <span className="text-[9px] font-mono font-bold text-electricViolet-glow px-1.5 py-0.5 rounded bg-electricViolet/15 border border-electricViolet/30 flex-shrink-0">
                VESSEL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
              {language === "es"
                ? "Coordiná para verse, cuidá tu seguridad o manejá este chat"
                : "Plan a meetup, stay safe, or manage this conversation"}
            </p>
          </div>
          <BrutalistButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={language === "es" ? "Cerrar menú de opciones" : "Close options menu"}
            className="!min-w-[44px] !min-h-[44px] -mr-1 !rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </BrutalistButton>
        </div>

        {/* Contenido con scroll táctico */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1">
          {/* GRUPO 1: CUIDADO Y SEGURIDAD */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider block px-1">
              🛡️ {language === "es" ? "Tu Cuidado y Tus Tiempos" : "Your Safety & Boundaries"}
            </span>

            {/* Salida Amable Anti-Ghost */}
            <TacticalMenuItem
              icon={<HeartHandshake className="w-4 h-4" />}
              iconBgClass="bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              title={language === "es" ? "Despedirse con Buena Onda" : "Say Goodbye Politely"}
              subtitle={
                language === "es"
                  ? "Elegí un mensaje amable para decir que hoy no pinta, sin clavar visto."
                  : "Pick a ready-made kind message to pass politely without ghosting."
              }
              badge="+5 Respeto"
              badgeVariant="emerald"
              badgeClassName="!bg-emerald-500/25 !border-emerald-500/40 !text-emerald-300"
              soundEffect="none"
              onClick={() => {
                audioEngine.playPulse();
                onClose();
                onOpenKindClosure();
              }}
              className="p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/30 hover:border-emerald-500/50 [&_.text-neutral-200]:text-emerald-300"
            />

            {/* Silenciar, Pausar o Bloquear */}
            <TacticalMenuItem
              icon={<ShieldAlert className="w-4 h-4" />}
              iconBgClass="bg-purple-500/20 border-purple-500/30 text-purple-300"
              title={language === "es" ? "Silenciar, Pausar o Bloquear" : "Mute, Pause or Block"}
              subtitle={
                language === "es"
                  ? "Poné la charla en pausa, ocultate de su radar o cortá el contacto."
                  : "Mute notifications, pause this chat, or hide from their radar."
              }
              badge={activeBoundary?.chatStatus}
              badgeVariant="purple"
              badgeClassName="!bg-purple-500/25 !border-purple-500/40 !text-purple-300"
              soundEffect="none"
              onClick={() => {
                audioEngine.playPulse();
                onClose();
                onOpenBoundaryModal();
              }}
              className="p-2.5 rounded-2xl bg-purple-950/20 hover:bg-purple-900/30 border-purple-500/25 hover:border-purple-500/45 [&_.text-neutral-200]:text-purple-200"
            />

            {/* Modo Efímero vs Guardado */}
            <TacticalMenuItem
              icon={currentRetention === "persistent" ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              iconBgClass="bg-electricViolet/20 border-electricViolet/30 text-electricViolet-glow"
              title={
                currentRetention === "persistent"
                  ? (language === "es" ? "Historial Guardado en este Teléfono" : "Chat Saved on Device")
                  : (language === "es" ? "Chat Efímero (Auto-Borrado)" : "Ephemeral Chat (Auto-Burn)")
              }
              subtitle={
                currentRetention === "persistent"
                  ? (language === "es" ? "Tocá para cambiar a efímero y que no guarde historial." : "Tap to switch to auto-burn ephemeral mode.")
                  : (language === "es" ? "Tocá para guardar mensajes en almacenamiento local seguro." : "Tap to save chat history locally.")
              }
              badge={currentRetention === "persistent" ? (language === "es" ? "GUARDADO" : "SAVED") : (language === "es" ? "EFÍMERO" : "BURN")}
              badgeVariant={currentRetention === "persistent" ? "emerald" : "violet"}
              soundEffect="pulse"
              onClick={onToggleRetention}
              className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-electricViolet/40"
            />
          </div>

          {/* GRUPO 2: PERFIL, NOTAS & HISTORIAL */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider block px-1">
              👤 {language === "es" ? `Sobre ${dossierAlias || profile.codename}` : `About ${dossierAlias || profile.codename}`}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Ficha Táctica */}
              <TacticalMenuItem
                icon="📋"
                iconBgClass="bg-electricViolet/15 border-electricViolet/30 text-electricViolet-glow"
                title={language === "es" ? "Ficha Táctica" : "Tactical Bio"}
                subtitle={language === "es" ? "Alias y notas" : "Notes & alias"}
                soundEffect="none"
                onClick={() => {
                  audioEngine.playPulse();
                  onClose();
                  onOpenDossier();
                }}
                className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-white/25"
              />

              {/* Ver Fotos y Perfil */}
              <TacticalMenuItem
                icon="👤"
                iconBgClass="bg-white/10 border-white/15 text-white"
                title={language === "es" ? "Ver Perfil" : "View Profile"}
                subtitle={language === "es" ? "Bio y fotos" : "Photos & bio"}
                soundEffect="none"
                onClick={() => {
                  audioEngine.playPulse();
                  onClose();
                  onOpenFullProfile();
                }}
                className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-white/25"
              />

              {/* Guardar Nota Privada */}
              <TacticalMenuItem
                icon="📓"
                iconBgClass="bg-neutral-800 border-white/15 text-neutral-200"
                title={language === "es" ? "Nota Privada" : "Private Note"}
                subtitle={language === "es" ? "Solo vos" : "Only you"}
                soundEffect="none"
                onClick={() => {
                  audioEngine.playPulse();
                  onClose();
                  onOpenCreateDiary();
                }}
                className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-white/25"
              />

              {/* Confirmar que nos vimos / Dejar Reseña */}
              {isEncounterValidated ? (
                <TacticalMenuItem
                  icon={<MessageSquareHeart className="w-4 h-4" />}
                  iconBgClass="bg-electricViolet/20 border-electricViolet/40 text-electricViolet-glow"
                  title={language === "es" ? "Dejar Reseña" : "Leave Review"}
                  subtitle={language === "es" ? "Contar qué tal" : "Share review"}
                  soundEffect="none"
                  onClick={() => {
                    audioEngine.playPulse();
                    onClose();
                    onOpenTestimonial();
                  }}
                  className="p-2.5 rounded-2xl bg-electricViolet/15 hover:bg-electricViolet/25 border-electricViolet/30 [&_.text-neutral-200]:text-electricViolet-glow"
                />
              ) : (
                <TacticalMenuItem
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  iconBgClass="bg-mintNeon/20 border-mintNeon/40 text-mintNeon"
                  title={language === "es" ? "Nos Vimos" : "We Met"}
                  subtitle={language === "es" ? "Confirmar cita" : "Confirm date"}
                  soundEffect="none"
                  onClick={() => {
                    audioEngine.playSuccess();
                    onClose();
                    onValidateEncounter();
                  }}
                  className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-mintNeon/40"
                />
              )}

              {/* Borrar Mensajes */}
              {hasMessages && (
                <TacticalMenuItem
                  icon={<Trash2 className="w-4 h-4" />}
                  iconBgClass="bg-bloodNeon/20 border-bloodNeon/40 text-bloodNeon"
                  title={language === "es" ? "Borrar Mensajes" : "Clear Messages"}
                  subtitle={language === "es" ? "Vaciar historial de esta charla" : "Empty this chat history"}
                  soundEffect="none"
                  onClick={() => {
                    onClose();
                    onClearMessages();
                  }}
                  className="col-span-2 p-2.5 rounded-2xl bg-bloodNeon/10 hover:bg-bloodNeon/20 border-bloodNeon/25 [&_.text-neutral-200]:text-bloodNeon [&_.text-neutral-400]:text-bloodNeon/80"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
