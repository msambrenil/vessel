"use client";

import React from "react";
import { ChevronLeft, MoreVertical, Save, Lock, CheckCircle2, Ghost } from "lucide-react";
import { VesselProfile } from "@/types/vessel";
import { TacticalAvatar } from "@/components/ui/TacticalAvatar";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface ChatHeaderProps {
  profile: VesselProfile;
  dossierAlias?: string;
  language: string;
  currentRetention: "persistent" | "ephemeral";
  isTogglingRetention: boolean;
  onToggleRetention: () => void;
  onClose: () => void;
  onOpenDossier: () => void;
  onOpenRendezvous: () => void;
  onToggleTacticalMenu: () => void;
  isTacticalMenuOpen: boolean;
  hasActiveRendezvous?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  profile,
  dossierAlias,
  language,
  currentRetention,
  isTogglingRetention,
  onToggleRetention,
  onClose,
  onOpenDossier,
  onOpenRendezvous,
  onToggleTacticalMenu,
  isTacticalMenuOpen,
  hasActiveRendezvous,
}) => {
  const formatDist = (meters?: number) => {
    if (meters === undefined || meters === null) return "Cerca";
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getRoleDisplayLabel = (role?: string) => {
    if (!role) return "Versátil";
    switch (role) {
      case "active":
        return language === "es" ? "Activo" : "Top";
      case "passive":
        return language === "es" ? "Pasivo" : "Bottom";
      case "versatile":
        return language === "es" ? "Versátil" : "Vers";
      case "side":
        return "Side";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center justify-between p-2.5 sm:p-3 pt-[max(env(safe-area-inset-top,0px),0.625rem)] sm:pt-3 border-b border-white/10 bg-obsidian-surface/95 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        {/* BOTÓN VOLVER (44x44px ERGONÓMICO) */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onClose();
          }}
          aria-label={language === "es" ? "Volver a mensajes" : "Back to chats"}
          className="p-2 min-w-[44px] min-h-[44px] -ml-1 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* AVATAR TÁCTICO INTEGRADO */}
        <div className="relative flex-shrink-0">
          <TacticalAvatar
            src={profile.avatarUrl}
            alt={profile.codename}
            codename={profile.codename}
            size="sm"
            borderVariant={
              profile.bodyState === "open"
                ? "emerald"
                : profile.bodyState === "occupied"
                ? "blood"
                : "violet"
            }
            isFogMode={profile.isFogMode}
            onClick={onOpenDossier}
            soundEffect="pulse"
            ariaLabel={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
          />
        </div>

        {/* INFORMACIÓN JERÁRQUICA: 2 LÍNEAS LIMPIAS */}
        <div
          onClick={() => {
            audioEngine.playPulse();
            onOpenDossier();
          }}
          className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer group"
          title={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
        >
          {/* LÍNEA 1: Identidad, Edad y Verificación */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-black text-white tracking-tight leading-tight truncate group-hover:text-electricViolet-glow transition-colors font-mono">
              {dossierAlias || profile.codename}
            </span>
            {profile.showAge && (
              <span className="text-xs text-neutral-400 font-mono font-medium leading-tight flex-shrink-0">
                · {profile.age}
              </span>
            )}
            {profile.verification?.isVerified && (
              <span
                title="Perfil Verificado 3D Anti-Bot"
                className="inline-flex items-center flex-shrink-0 text-mintNeon"
              >
                <CheckCircle2 className="w-3.5 h-3.5 fill-mintNeon/20" />
              </span>
            )}
            {profile.isAntiGhost && (
              <span
                title={language === "es" ? `Protocolo Cero Ghosteo • ${profile.respectScore || 98}% Respeto` : `Anti-Ghost Protocol • ${profile.respectScore || 98}% Respect`}
                className="inline-flex items-center flex-shrink-0 text-emerald-400"
              >
                <Ghost className="w-3 h-3 stroke-[2.4]" />
              </span>
            )}
          </div>

          {/* LÍNEA 2: Rol • Distancia • Hospedaje */}
          <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 min-w-0 truncate leading-tight pt-0.5">
            <span className="text-neutral-200 font-bold truncate">
              {getRoleDisplayLabel(profile.role)}
            </span>
            <span className="text-white/20 flex-shrink-0">•</span>
            <span className="font-mono text-neutral-300 flex-shrink-0">
              {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
            </span>
            {profile.hosting && (
              <>
                <span className="text-white/20 flex-shrink-0">•</span>
                <span className="text-neutral-300 truncate">
                  {profile.hosting}
                </span>
              </>
            )}
            {profile.onTheClock?.isActive && (
              <>
                <span className="text-white/20 flex-shrink-0">•</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow font-mono text-[9px] font-bold flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                  ⚡ YA
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CINTA DE ACCIONES RÁPIDAS */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Retención / Modo Efímero (Desktop) */}
        <button
          type="button"
          onClick={onToggleRetention}
          className={`hidden md:inline-flex px-2 py-1 min-h-[34px] rounded-xl text-[10px] font-mono font-bold uppercase transition-all items-center gap-1 cursor-pointer border active:scale-95 ${
            currentRetention === "persistent"
              ? "bg-mintNeon/10 border-mintNeon/40 text-mintNeon hover:bg-mintNeon/20"
              : "bg-electricViolet/10 border-electricViolet/40 text-electricViolet-glow hover:bg-electricViolet/20"
          }`}
          title={currentRetention === "persistent" ? (language === "es" ? "Historial guardado en el celu" : "History saved") : (language === "es" ? "Chat efímero (se borra al salir)" : "Ephemeral mode")}
        >
          {currentRetention === "persistent" ? (
            <Save className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-spin" : ""}`} />
          ) : (
            <Lock className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-spin" : ""}`} />
          )}
          <span className="hidden lg:inline">{currentRetention === "persistent" ? (language === "es" ? "Guardado" : "Saved") : (language === "es" ? "Efímero" : "Burn")}</span>
        </button>

        {/* Ficha Táctica (Desktop) */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onOpenDossier();
          }}
          aria-label={language === "es" ? "Ver ficha y datos" : "View bio"}
          className="hidden md:inline-flex px-2 sm:px-2.5 py-1 min-h-[34px] rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white font-mono text-[11px] font-bold items-center gap-1 cursor-pointer transition-all active:scale-95"
          title={language === "es" ? "Ficha del perfil (datos, notas y respeto)" : "Profile dossier"}
        >
          <span>👤</span>
          <span className="hidden lg:inline">{language === "es" ? "Ficha" : "Bio"}</span>
        </button>

        {/* Pactar Encuentro (1 Toque) */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onOpenRendezvous();
          }}
          aria-label="Coordinar cita segura"
          className={`px-2.5 sm:px-3 py-1 min-h-[34px] flex items-center gap-1 sm:gap-1.5 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm font-mono text-[11px] sm:text-xs font-bold ${
            hasActiveRendezvous
              ? "bg-bloodNeon/20 border border-bloodNeon/60 text-bloodNeon shadow-[0_0_12px_rgba(230,25,55,0.35)] animate-pulse"
              : "bg-electricViolet text-white hover:bg-electricViolet/90 shadow-violet-soft"
          }`}
          title="Pactar Encuentro (Sintonía + Lugar + Guardián SOS)"
        >
          <span className="text-xs leading-none">⚡</span>
          <span className="truncate">{hasActiveRendezvous ? (language === "es" ? "PIN Activo" : "Active PIN") : (language === "es" ? "Pactar" : "Meetup")}</span>
        </button>

        {/* Botón Menú Táctico Más Acciones [ ⋯ ] */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onToggleTacticalMenu();
          }}
          aria-label="Más herramientas tácticas"
          aria-expanded={isTacticalMenuOpen}
          className={`p-2 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 relative ${
            isTacticalMenuOpen
              ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
              : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
          }`}
          title={language === "es" ? "Más opciones" : "More options"}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
