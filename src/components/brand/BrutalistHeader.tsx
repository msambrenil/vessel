"use client";

import React from "react";
import { VesselLogo } from "./VesselLogo";
import { useVessel } from "@/context/VesselContext";
import {
  ShieldCheck,
  Navigation,
  HeartPulse,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BeaconCountdownWidget } from "@/components/safety/BeaconCountdownWidget";

export const BrutalistHeader: React.FC = () => {
  const {
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
    harmReductionSession,
    openHarmReductionModal,
    t,
  } = useVessel();

  const isVerified = isAuthenticated && Boolean(myProfile.verification?.isVerified);
  const isUnlimited = userPlan === "unlimited";
  const userCodename = authUser?.email
    ? authUser.email.split("@")[0].toUpperCase()
    : myProfile.codename || "VESSEL";

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
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-electricViolet/10 border border-electricViolet/30 text-electricViolet-glow text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
              LIVE
            </span>
          </button>
        </div>

        {/* =========================================================
            ZONA CENTRAL: Widgets Críticos Vivos (Exclusivo en curso)
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

          {/* Guardián Silencioso: Widget activo cuando la cuenta regresiva está corriendo */}
          {safetyBeacon?.isActive && (
            <BeaconCountdownWidget />
          )}

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
            ZONA DERECHA: Cápsula de Identidad Táctica Unificada
            ========================================================= */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
                  ? `Sesión de ${userCodename}. Tocar para gestionar sesión`
                  : "Modo Invitado. Tocar para ingresar"
              }
              title={
                isAuthenticated
                  ? `Conectado como ${userCodename} — Tocar para gestionar sesión`
                  : "Modo Invitado — Tocar para Ingresar"
              }
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet ${
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
              <span className="inline max-w-[80px] sm:max-w-[110px] truncate font-semibold">
                {isAuthenticated ? userCodename : (t.header?.guestSession || "INVITADO")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
