"use client";

import React, { useEffect } from "react";
import { VesselProfile } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  BookOpen,
  Calendar,
  ExternalLink,
  Zap,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface ChatProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VesselProfile;
  onOpenRendezvousSheet: () => void;
}

export const ChatProfileDrawer: React.FC<ChatProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenRendezvousSheet,
}) => {
  const {
    language,
    formatDist,
    setSelectedProfile,
    getProfileDossier,
    openEnRouteModal,
    openSafetyBeaconModal,
    openCreateDiaryModal,
    t,
  } = useVessel();

  const dossier = getProfileDossier ? getProfileDossier(profile.id) : null;

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === "es" ? `Ficha de ${profile.codename}` : `Bio of ${profile.codename}`}
      className="fixed inset-0 z-[80] flex justify-end select-none animate-in fade-in duration-200"
    >
      {/* Backdrop suave */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer transition-opacity"
      />

      {/* Panel Drawer Lateral (Slide in from right) */}
      <div className="relative w-full max-w-sm bg-obsidian-surface border-l border-white/10 h-full overflow-y-auto p-4 space-y-4 shadow-2xl z-10 animate-in slide-in-from-right duration-250">
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-electricViolet animate-pulse shadow-violet-soft" />
            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
              {t.chat.tacticalDossierTitle || (language === "es" ? "Ficha del chongo" : "Dossier & Bio")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onClose();
            }}
            aria-label={language === "es" ? "Cerrar ficha" : "Close"}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Foto Principal */}
        <div
          onClick={() => {
            audioEngine.playPulse();
            setSelectedProfile(profile);
          }}
          className="relative rounded-2xl overflow-hidden aspect-[4/5] border-2 border-white/10 hover:border-electricViolet transition-all cursor-pointer group shadow-card-elevation"
          title={language === "es" ? "Tocá para ver perfil y fotos completas" : "Tap to view full profile"}
        >
          <img
            src={profile.avatarUrl}
            alt={profile.codename}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              profile.isFogMode ? "filter blur-[4px] scale-105" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-3 inset-x-3 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base font-black text-white leading-tight">
                {dossier?.customAlias || profile.codename}
              </span>
              {profile.showAge && (
                <span className="text-xs font-mono text-neutral-300">
                  · {profile.age}
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-electricViolet-glow font-bold pt-0.5">
              {getRoleDisplayLabel(profile.role, language)} · {formatDist(profile.distanceMeters)}
            </div>
            {profile.hosting && (
              <div className="text-[10px] text-neutral-300 font-mono pt-0.5">
                🏠 {profile.hosting}
              </div>
            )}
          </div>
        </div>

        {/* Badges de Confianza y Respeto */}
        <div className="bg-black/40 rounded-2xl p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xs font-bold text-white block">
              {language === "es" ? "Puntaje de Respeto" : "Respect Score"}
            </span>
            <span className="font-mono font-bold text-mintNeon">
              {profile.respectScore || 98}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-mintNeon h-full rounded-full transition-all"
              style={{ width: `${profile.respectScore || 98}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {profile.verification?.isVerified && (
              <VerificationBadge verification={profile.verification} size="xs" showLabel />
            )}
            {profile.isAntiGhost && (
              <AntiGhostBadge
                respectScore={profile.respectScore}
                responseRateMinutes={profile.responseRateMinutes}
                size="xs"
                showLabel
              />
            )}
            {dossier?.rating && DOSSIER_VERDICT_CONFIG[dossier.rating] && (
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border shadow-xs ${DOSSIER_VERDICT_CONFIG[dossier.rating].badgeColor}`}>
                <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].icon}</span>
                <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].shortTag[language]}</span>
              </span>
            )}
          </div>
        </div>

        {/* Suite de Acciones Rápidas */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block px-1">
            {t.chat.meetupSafetyTitle || (language === "es" ? "Encuentro y Cuidado" : "Meetup & Safety")}
          </span>

          {/* Coordinar Encuentro */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenRendezvousSheet();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-electricViolet/15 hover:bg-electricViolet/25 border border-electricViolet/40 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electricViolet-glow" />
              <span className="text-[11px]">{t.chat.planMeetupBtn || (language === "es" ? "Coordinar Encuentro" : "Plan Meetup")}</span>
            </div>
            <span className="text-[9px] text-electricViolet-glow">{t.chat.planMeetupSub || (language === "es" ? "Todo en 1" : "All-in-1")}</span>
          </button>

          {/* Estoy yendo */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openEnRouteModal(profile);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px]">{t.chat.imOnMyWayBtn || (language === "es" ? "Estoy yendo" : "I'm on my way")}</span>
            </div>
            <span className="text-[9px] text-neutral-400">{t.chat.imOnMyWaySub || (language === "es" ? "En viaje" : "En route")}</span>
          </button>

          {/* Guardián SOS */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openSafetyBeaconModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-bloodNeon" />
              <span className="text-[11px]">{t.chat.sosTimerBtn || (language === "es" ? "Guardián SOS" : "Safety SOS")}</span>
            </div>
            <span className="text-[9px] text-bloodNeon">{t.chat.sosTimerSub || (language === "es" ? "Check-in" : "Check-in")}</span>
          </button>

          {/* Guardar Nota Privada */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openCreateDiaryModal(profile.id);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-[11px]">{t.chat.privateNoteBtn || (language === "es" ? "Guardar Nota Privada" : "Save Private Note")}</span>
            </div>
            <span className="text-[9px] text-neutral-400">{t.chat.privateNoteSub || (language === "es" ? "Solo vos" : "Private")}</span>
          </button>

          {/* Botón Ver Perfil Completo */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setSelectedProfile(profile);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-2"
          >
            <span>{t.chat.viewFullProfileCta || (language === "es" ? "Ver perfil y fotos" : "View full profile")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
