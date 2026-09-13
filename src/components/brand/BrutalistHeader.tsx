"use client";

import React, { useState } from "react";
import { VesselLogo } from "./VesselLogo";
import { useVessel } from "@/context/VesselContext";
import {
  Volume2,
  VolumeX,
  EyeOff,
  Shield,
  ShieldCheck,
  Navigation,
  Zap,
  HeartPulse,
  PartyPopper,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BeaconCountdownWidget } from "@/components/safety/BeaconCountdownWidget";
import { AppModeModal } from "@/components/settings/AppModeModal";

export const BrutalistHeader: React.FC = () => {
  const [isAppModeModalOpen, setIsAppModeModalOpen] = useState(false);
  const {
    appMode,
    soundEnabled,
    toggleSound,
    stealthMode,
    toggleStealthMode,
    activeRendezvous,
    setActiveChatProfileId,
    myProfile,
    openAuthModal,
    openAppSettingsModal,
    authUser,
    isAuthenticated,
    userPlan,
    openUnlimitedModal,
    safetyBeacon,
    openSafetyBeaconModal,
    openNightlifeModal,
    harmReductionSession,
    openHarmReductionModal,
    logout,
    t,
  } = useVessel();

  const isVerified = isAuthenticated && Boolean(myProfile.verification?.isVerified);
  const isUnlimited = userPlan === "unlimited";
  const userCodename = authUser?.email
    ? authUser.email.split("@")[0].toUpperCase()
    : myProfile.codename || "VESSEL";

  const hasCriticalActiveWidgets = Boolean(
    activeRendezvous || safetyBeacon?.isActive || harmReductionSession?.isActive
  );

  return (
    <header className="sticky top-0 z-30 bg-obsidian-deep/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-2 select-none shadow-sm">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* =========================================================
            ZONA IZQUIERDA: Marca & Identidad del Sistema
            ========================================================= */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={openAppSettingsModal}
            className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all p-1 -ml-1 rounded-xl hover:bg-white/5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet/60"
            title={`${t.settings?.title || "Configuración"} · VESSEL`}
            aria-label="Menú y Configuración de VESSEL"
          >
            <VesselLogo size={24} showWordmark={true} />
            <span className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-electricViolet/10 border border-electricViolet/30 text-electricViolet-glow text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
              LIVE
            </span>
          </button>

          {/* Badge de Entorno Operativo (Test vs Real) */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setIsAppModeModalOpen(true);
            }}
            aria-label={
              appMode === "real"
                ? "Modo Real Activo. Tocar para gestionar entorno"
                : "Modo de Prueba Activo. Tocar para gestionar entorno"
            }
            title={
              appMode === "real"
                ? "Entorno: MODO REAL (Datos Limpios). Tocar para cambiar"
                : "Entorno: MODO DE PRUEBA (Mock Data). Tocar para cambiar"
            }
            className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 ${
              appMode === "real"
                ? "bg-mintNeon/15 border-mintNeon/40 text-mintNeon hover:bg-mintNeon/25 shadow-[0_0_10px_rgba(16,185,129,0.25)] focus-visible:ring-mintNeon"
                : "bg-electricViolet/15 border-electricViolet/40 text-electricViolet-glow hover:bg-electricViolet/25 shadow-[0_0_10px_rgba(139,92,246,0.25)] focus-visible:ring-electricViolet"
            }`}
          >
            {appMode === "real" ? (
              <>
                <Zap className="w-3 h-3 stroke-[2.5]" />
                <span>REAL</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-3 h-3 stroke-[2]" />
                <span>TEST</span>
              </>
            )}
          </button>
        </div>

        {/* =========================================================
            ZONA CENTRAL: Widgets Críticos Vivos (Bajo Demanda) & Accesos
            ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center min-w-0 overflow-x-auto no-scrollbar py-0.5">
          {/* Rendezvous PIN Activo */}
          {activeRendezvous && (
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                if (activeRendezvous.profileId) {
                  setActiveChatProfileId(activeRendezvous.profileId);
                }
              }}
              aria-label={`Punto de Encuentro Activo con ${activeRendezvous.profileCodename || "usuario"}. Tocar para abrir chat`}
              className="flex items-center gap-1.5 bg-bloodNeon/20 border border-bloodNeon/60 hover:bg-bloodNeon/30 hover:border-bloodNeon text-bloodNeon px-2.5 py-1 rounded-full transition-all shadow-[0_0_15px_rgba(230,25,55,0.35)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 group flex-shrink-0"
              title={`Punto de Encuentro Activo con ${activeRendezvous.profileCodename || "usuario"} - Tocar para abrir chat`}
            >
              <span className="w-2 h-2 rounded-full bg-bloodNeon animate-ping flex-shrink-0" />
              <span className="text-[10px] text-bloodNeon font-black font-mono tracking-wider uppercase group-hover:text-white transition-colors truncate max-w-[90px] sm:max-w-none">
                {t.header?.pinActive || "PIN ACTIVO"}
              </span>
              <Navigation className="w-3 h-3 text-bloodNeon group-hover:text-white transition-colors ml-0.5 flex-shrink-0" />
            </button>
          )}

          {/* Guardián Silencioso: Widget activo o Botón de activación */}
          {safetyBeacon?.isActive ? (
            <BeaconCountdownWidget />
          ) : (
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openSafetyBeaconModal();
              }}
              aria-label="Activar Guardián Silencioso // Dead-Man Switch"
              title="Guardián Silencioso // Dead-Man Switch (Proteger cita física)"
              className={`items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-bloodNeon/10 border border-bloodNeon/30 hover:border-bloodNeon/70 hover:bg-bloodNeon/20 text-bloodNeon transition-all font-mono text-[10px] font-bold cursor-pointer active:scale-95 flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bloodNeon shadow-sm ${
                hasCriticalActiveWidgets ? "hidden md:flex" : "hidden sm:flex"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-bloodNeon flex-shrink-0" />
              <span className="uppercase tracking-wider">GUARDIÁN</span>
            </button>
          )}

          {/* Acceso Rápido Nightlife // Fiestas en 1-tap */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playSubBass(60);
              openNightlifeModal();
            }}
            aria-label="VESSEL Nightlife // Fiestas y Baliza Óptica"
            title="Nightlife // Fiestas, Baliza Óptica & Wingman"
            className={`items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-all font-mono text-[10px] font-bold cursor-pointer active:scale-95 flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 shadow-sm ${
              hasCriticalActiveWidgets ? "hidden lg:flex" : "hidden sm:flex"
            }`}
          >
            <PartyPopper className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="uppercase tracking-wider">FIESTAS</span>
          </button>

          {/* Reducción de Daños Activa */}
          {harmReductionSession?.isActive && (
            <button
              type="button"
              onClick={openHarmReductionModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mintNeon/20 border border-mintNeon text-mintNeon shadow-mint-glow font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer animate-pulse active:scale-95 flex-shrink-0"
              title="Asistente de Reducción de Daños Activo"
            >
              <HeartPulse className="w-3 h-3 text-mintNeon" />
              <span className="hidden sm:inline">SESIÓN ACTIVA</span>
            </button>
          )}
        </div>

        {/* =========================================================
            ZONA DERECHA: Cápsula de Identidad + Utilidades del Sistema
            ========================================================= */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* CÁPSULA DE IDENTIDAD UNIFICADA (Plan + Verificación + Sesión) */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 hover:border-white/20 transition-all shadow-sm">
            {/* Chip de Plan Unlimited (Dorado exclusivo) */}
            <button
              type="button"
              onClick={openUnlimitedModal}
              aria-label={isUnlimited ? "Plan VESSEL UNLIMITED Activo" : "Obtener VESSEL UNLIMITED"}
              title={isUnlimited ? "VESSEL UNLIMITED // Bóvedas y Poderes Infinitos" : "Mejorar a VESSEL UNLIMITED"}
              className={`p-1 sm:p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-champagneGold ${
                isUnlimited
                  ? "bg-champagneGold/20 text-champagneGold shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  : "text-neutral-400 hover:text-champagneGold hover:bg-white/5"
              }`}
            >
              <span className="text-xs leading-none">👑</span>
            </button>

            {/* Separador micro */}
            <span className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

            {/* Estado de Verificación Facial 3D (Mint Neon) */}
            <button
              type="button"
              onClick={() => openAuthModal("verify")}
              aria-label={isVerified ? "Perfil Verificado" : "Verificar Identidad"}
              title={isVerified ? "Identidad Verificada 3D" : "Verificar Identidad Digital (Protocolo Anti-Bot)"}
              className={`p-1 sm:p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mintNeon ${
                isVerified
                  ? "text-mintNeon bg-mintNeon/15 shadow-mint-glow"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            </button>

            {/* Separador micro */}
            <span className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

            {/* Chip de Usuario / Sesión Activa */}
            <button
              type="button"
              onClick={() => openAuthModal(isAuthenticated ? "session" : "login")}
              aria-label={
                isAuthenticated
                  ? `Sesión de ${userCodename}. Tocar para gestionar o cerrar sesión`
                  : "Modo Invitado. Tocar para ingresar"
              }
              title={
                isAuthenticated
                  ? `Conectado como ${userCodename} — Tocar para gestionar o cerrar sesión`
                  : "Modo Invitado — Tocar para Ingresar"
              }
              className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet ${
                isAuthenticated
                  ? "text-mintNeon hover:bg-mintNeon/10"
                  : "text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isAuthenticated ? "bg-mintNeon animate-pulse" : "bg-neutral-500"
                }`}
              />
              <span className="hidden sm:inline max-w-[70px] sm:max-w-[100px] truncate font-semibold">
                {isAuthenticated ? userCodename : (t.header?.guestSession || "INVITADO")}
              </span>
            </button>

            {/* Botón Directo 1-Tap: Cerrar Sesión Inmediata si está autenticado */}
            {isAuthenticated && authUser && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Confirmas cerrar tu sesión activa en VESSEL?")) {
                    logout();
                    audioEngine.playStateSwitch("dormant");
                  }
                }}
                aria-label="Cerrar Sesión Inmediata"
                title="Cerrar Sesión Directa"
                className="p-1 sm:p-1.5 flex items-center justify-center rounded-full text-neutral-400 hover:text-bloodNeon hover:bg-bloodNeon/15 border border-transparent hover:border-bloodNeon/30 transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bloodNeon"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* CONTROLES TÁCTICOS DEL SISTEMA (Sonido + Sigilo) */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-1 sm:pl-1.5">
            {/* Toggle de Audio Sub-Bass */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundEnabled ? (t.header?.soundActive || "Audio Activado") : (t.header?.soundMuted || "Audio Silenciado")}
              aria-pressed={soundEnabled}
              className={`p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-90 ${
                soundEnabled
                  ? "border-electricViolet/40 bg-electricViolet/10 text-electricViolet-glow shadow-violet-soft hover:bg-electricViolet/20"
                  : "border-white/10 bg-white/5 text-neutral-400 hover:text-neutral-200 hover:bg-white/10"
              }`}
              title={soundEnabled ? (t.header?.soundActive || "Audio Sub-Bass Activado") : (t.header?.soundMuted || "Audio Silenciado")}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-electricViolet-glow" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Toggle de Modo Sigilo Inmediato */}
            <button
              type="button"
              onClick={toggleStealthMode}
              aria-label={t.header?.stealthActive || "Modo Sigilo"}
              aria-pressed={stealthMode}
              className={`p-1.5 sm:p-2 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-90 ${
                stealthMode
                  ? "border-bloodNeon bg-bloodNeon/25 text-bloodNeon shadow-blood-glow"
                  : "border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title={t.header?.stealthActive || "Modo Sigilo Inmediato"}
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Selector de Entorno Operativo */}
      <AppModeModal
        isOpen={isAppModeModalOpen}
        onClose={() => setIsAppModeModalOpen(false)}
      />
    </header>
  );
};
