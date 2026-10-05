"use client";

import React from "react";
import { VesselLogo } from "./VesselLogo";
import { useVessel } from "@/context/VesselContext";
import {
  ShieldCheck,
  Navigation,
  HeartPulse,
  QrCode,
  Volume2,
  VolumeX,
  ChevronDown,
  User,
  Crown,
  Zap,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BeaconCountdownWidget } from "@/components/safety/BeaconCountdownWidget";

export const BrutalistHeader: React.FC = () => {
  const {
    activeRendezvous,
    setActiveChatProfileId,
    myProfile,
    openAuthModal,
    setActiveView,
    authUser,
    isAuthenticated,
    userPlan,
    openUnlimitedModal,
    safetyBeacon,
    harmReductionSession,
    openHarmReductionModal,
    appSettings,
    updateAppSettings,
    t,
    language,
    myOnTheClock,
    startOnTheClock,
    stopOnTheClock,
  } = useVessel();

  const [isAudioUnlocked, setIsAudioUnlocked] = React.useState<boolean>(() =>
    audioEngine.getIsAudioUnlocked()
  );

  React.useEffect(() => {
    const unsubscribe = audioEngine.subscribeAudioUnlocked((unlocked) => {
      setIsAudioUnlocked(unlocked);
    });
    return () => unsubscribe();
  }, []);

  // Temporizador en tiempo real y degradado cónico de barra de progreso para Listo YA
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    if (!myOnTheClock?.isActive) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [myOnTheClock?.isActive]);

  const { elapsedDegrees, countdownLabel } = React.useMemo(() => {
    if (!myOnTheClock?.isActive || !myOnTheClock?.expiresAt) {
      return { elapsedDegrees: 0, countdownLabel: "" };
    }

    const expiresAtMs = new Date(myOnTheClock.expiresAt).getTime();
    const durationMinutes = myOnTheClock.durationMinutes || 60;
    const totalDurationMs = durationMinutes * 60 * 1000;
    const startedAtMs = myOnTheClock.startedAt
      ? new Date(myOnTheClock.startedAt).getTime()
      : expiresAtMs - totalDurationMs;

    const effectiveTotalMs =
      expiresAtMs > startedAtMs ? expiresAtMs - startedAtMs : totalDurationMs;
    const remainingMs = Math.max(0, expiresAtMs - now);

    const remainingFraction =
      effectiveTotalMs > 0 ? remainingMs / effectiveTotalMs : 0;
    const elapsedFraction = 1 - remainingFraction;

    // 0deg = 12 en punto. El borde se apaga en sentido horario
    const deg = Math.min(360, Math.max(0, elapsedFraction * 360));

    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    const label =
      remainingMinutes > 1
        ? `${remainingMinutes}m`
        : remainingSeconds > 0
        ? `${remainingSeconds}s`
        : "0m";

    return { elapsedDegrees: deg, countdownLabel: label };
  }, [
    myOnTheClock?.isActive,
    myOnTheClock?.expiresAt,
    myOnTheClock?.durationMinutes,
    myOnTheClock?.startedAt,
    now,
  ]);

  const clockGradient = React.useMemo(() => {
    if (!myOnTheClock?.isActive) return "";

    const deg = Math.round(elapsedDegrees * 10) / 10;

    if (deg <= 0.5) {
      // 100% completo e iluminado en violeta neón
      return `conic-gradient(from 0deg at 50% 50%, #8b5cf6 0deg, #a855f7 180deg, #8b5cf6 360deg)`;
    }

    if (deg >= 359.5) {
      // Completamente consumido
      return `rgba(139, 92, 246, 0.15)`;
    }

    const sparkEnd = Math.min(360, deg + 4);

    return `conic-gradient(
      from 0deg at 50% 50%,
      rgba(255, 255, 255, 0.12) 0deg,
      rgba(255, 255, 255, 0.12) ${deg}deg,
      #ffffff ${deg}deg,
      #c084fc ${sparkEnd}deg,
      #8b5cf6 ${sparkEnd}deg,
      #8b5cf6 360deg
    )`;
  }, [myOnTheClock?.isActive, elapsedDegrees]);

  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleToggleAudio = React.useCallback(async () => {
    if (!isAudioUnlocked) {
      await audioEngine.unlockAudioOnUserGesture();
    }
    const nextSound = !appSettings.soundEnabled;
    updateAppSettings({ soundEnabled: nextSound });
    if (nextSound) {
      audioEngine.triggerTacticalPulse();
      audioEngine.playSubBass(65, 0.15);
    } else {
      audioEngine.triggerTacticalPulse();
    }
  }, [isAudioUnlocked, appSettings.soundEnabled, updateAppSettings]);

  const isVerified = isAuthenticated && Boolean(myProfile.verification?.isVerified);
  const isUnlimited = userPlan === "unlimited";
  const rawCodename = authUser?.email
    ? authUser.email.split("@")[0].toUpperCase()
    : myProfile.codename || "VESSEL";
  const userCodename =
    (t.nav?.grid === "Radar" || t.nav?.grid === "Cerca") && rawCodename.endsWith(".TOP")
      ? rawCodename.replace(/\.TOP$/, ".ACT")
      : rawCodename;

  return (
    <header className="sticky top-0 z-30 bg-obsidian-deep/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-1.5 select-none shadow-sm">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* =========================================================
            ZONA IZQUIERDA: Marca & Identidad del Sistema
            ========================================================= */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setActiveView("grid");
            }}
            className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all p-1 -ml-1 min-h-[40px] rounded-xl hover:bg-white/5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet/60"
            title="VESSEL · Matriz & Radar"
            aria-label="Ir al inicio de VESSEL"
          >
            <VesselLogo size={24} showWordmark={true} />
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-electricViolet/10 border border-electricViolet/30 text-electricViolet-glow text-[9px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
              {t.system?.live || "EN VIVO"}
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
              className="flex items-center gap-1.5 bg-bloodNeon/20 border border-bloodNeon/60 hover:bg-bloodNeon/30 hover:border-bloodNeon text-bloodNeon px-2.5 py-1.5 min-h-[36px] rounded-full transition-all shadow-[0_0_15px_rgba(230,25,55,0.35)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 group flex-shrink-0"
              title={`Punto de Encuentro Activo con ${activeRendezvous.profileCodename || "usuario"} - Tocar para abrir chat`}
            >
              <span className="w-2 h-2 rounded-full bg-bloodNeon animate-ping flex-shrink-0" />
              <span className="text-[10px] text-bloodNeon font-black font-mono tracking-wider uppercase group-hover:text-white transition-colors truncate max-w-[90px] sm:max-w-none">
                {t.header?.pinActive || "UBICACIÓN ACTIVA"}
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-full bg-mintNeon/20 border border-mintNeon text-mintNeon shadow-mint-glow font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer animate-pulse active:scale-95 flex-shrink-0"
              title="Asistente de Reducción de Daños Activo"
            >
              <HeartPulse className="w-3 h-3 text-mintNeon" />
              <span className="hidden sm:inline">{t.header?.harmReductionActive || "SESIÓN ACTIVA"}</span>
            </button>
          )}
        </div>

        {/* =========================================================
            ZONA DERECHA: Botón de Estado Rápido + Menú de Usuario
            ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Quick Toggle On-The-Clock / Estoy Listo con Barra de Progreso de Borde */}
          {myOnTheClock?.isActive ? (
            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(60, 0.15);
                stopOnTheClock();
              }}
              className="group relative overflow-hidden flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1 min-h-[36px] sm:min-h-[38px] rounded-full bg-obsidian-deep/95 text-white font-mono text-[10px] sm:text-[10.5px] font-black shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer hover:brightness-110 active:scale-95 transition-all select-none"
              title={
                language === "es"
                  ? `Listo ahora activo • Restan ${countdownLabel} • Tocar para pausar`
                  : `Ready now active • ${countdownLabel} left • Tap to pause`
              }
              aria-label={
                language === "es"
                  ? `Listo ahora activo. Restan ${countdownLabel}. Tocar para desactivar.`
                  : `Ready now active. ${countdownLabel} left. Tap to deactivate.`
              }
            >
              {/* Borde Estilo Reloj de Conteo Regresivo Dinámico (Degradado Cónico) */}
              <div
                data-testid="header-on-the-clock-border"
                className="absolute inset-0 rounded-full pointer-events-none p-[2px] z-10 overflow-hidden"
                style={{
                  background: clockGradient,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  filter:
                    "drop-shadow(0 0 5px rgba(168, 85, 247, 0.85)) drop-shadow(0 0 10px rgba(139, 92, 246, 0.45))",
                }}
              />

              {/* Punto indicador + Rayo + Texto con tiempo */}
              <span className="relative z-20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                <Zap className="w-3 h-3 text-electricViolet fill-electricViolet" />
                <span className="font-mono font-black tracking-wider whitespace-nowrap">
                  {language === "es" ? "LISTO" : "READY"}
                  {countdownLabel && (
                    <span className="ml-1 text-electricViolet-glow font-bold text-[9px] sm:text-[9.5px]">
                      · {countdownLabel}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(70, 0.15);
                startOnTheClock(60, language === "es" ? "Disponible ahora" : "Available now");
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 min-h-[36px] sm:min-h-[38px] rounded-full bg-white/5 border border-white/10 hover:border-electricViolet/50 hover:bg-electricViolet/10 text-neutral-300 hover:text-white font-mono text-[10px] sm:text-[10.5px] font-semibold transition-all cursor-pointer active:scale-95"
              title={language === "es" ? "Activar disponibilidad inmediata (1 hora)" : "Activate immediate availability (1 hour)"}
              aria-label={language === "es" ? "Activarme disponible" : "Activate availability"}
            >
              <Zap className="w-3 h-3 text-electricViolet" />
              <span>{language === "es" ? "Estoy listo" : "Ready now"}</span>
            </button>
          )}

          <div className="relative flex items-center flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            data-testid="header-user-menu-btn"
            onClick={() => {
              audioEngine.playSubBass(60, 0.1);
              setIsMenuOpen((prev) => !prev);
            }}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-label={
              isAuthenticated
                ? `Menú de opciones de ${userCodename}`
                : "Menú de opciones de usuario invitado"
            }
            title={`Opciones: Audio, QR, Verificación y Cuenta (${userCodename})`}
            className={`min-h-[42px] sm:min-h-[44px] flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-full border transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet select-none ${
              isMenuOpen
                ? "bg-white/15 border-electricViolet shadow-violet-soft text-white"
                : isUnlimited
                ? "bg-amber-950/20 border-champagneGold/40 text-amber-200 hover:border-champagneGold hover:bg-amber-950/30"
                : "bg-white/5 border-white/10 text-neutral-200 hover:text-white hover:border-white/20 hover:bg-white/10"
            }`}
          >
            {/* Avatar / Status Dot */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-black uppercase ${
                  isUnlimited
                    ? "bg-champagneGold/20 text-champagneGold border border-champagneGold/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : "bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30"
                }`}
              >
                {isUnlimited ? "👑" : userCodename.slice(0, 2)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                  isAuthenticated ? "bg-mintNeon animate-pulse" : "bg-neutral-500"
                }`}
              />
            </div>

            {/* Nombre de Usuario / Invitado */}
            <span className="text-[11px] font-mono font-bold tracking-tight uppercase truncate max-w-[80px] sm:max-w-[110px]">
              {isAuthenticated ? userCodename : (t.header?.guestSession || "INVITADO")}
            </span>

            {/* Chevron Indicador */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                isMenuOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable Táctico Zen (Touch targets 44px+) */}
          {isMenuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              data-testid="header-tactical-menu"
              className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-obsidian-surface border border-white/15 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.95)] backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 select-none"
            >
              {/* Header del Perfil en el Menú */}
              <div className="px-3 py-2 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between mb-1">
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-mono text-xs font-black text-white uppercase truncate">
                    {userCodename}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {isAuthenticated ? (authUser?.email || "Sesión Activa") : "Sesión de Invitado"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isUnlimited ? (
                    <span className="px-2 py-0.5 rounded-full bg-champagneGold/20 border border-champagneGold/40 text-champagneGold font-mono text-[9px] font-black uppercase">
                      👑 UNLIMITED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 font-mono text-[9px] font-bold uppercase">
                      FREE
                    </span>
                  )}
                </div>
              </div>

              {/* Opción 1: Audio Sub-Bass (45-80Hz) */}
              <button
                type="button"
                role="menuitem"
                onClick={handleToggleAudio}
                className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      !appSettings.soundEnabled
                        ? "bg-white/5 border-white/10 text-neutral-400"
                        : "bg-electricViolet/20 border-electricViolet/40 text-electricViolet-glow shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                    }`}
                  >
                    {!appSettings.soundEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                      Audio Sub-Bass (45-80Hz)
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {!appSettings.soundEnabled
                        ? "Silenciado • Tocar para activar"
                        : !isAudioUnlocked
                        ? "Requiere toque para calibrar"
                        : "Resonancia analógica activa"}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    appSettings.soundEnabled
                      ? "bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30"
                      : "bg-white/5 text-neutral-500"
                  }`}
                >
                  {appSettings.soundEnabled ? "ON" : "OFF"}
                </span>
              </button>

              {/* Opción 2: Mi Pase QR de Fiesta */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  audioEngine.playSubBass(65);
                  window.dispatchEvent(new CustomEvent("vessel:open-qr-share"));
                }}
                className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                      Mi Pase QR de Fiesta
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      Compartir perfil en 1 segundo
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">⚡ ABRIR</span>
              </button>

              {/* Opción 3: Verificación 3D */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  audioEngine.playPulse();
                  openAuthModal("verify");
                }}
                className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      isVerified
                        ? "bg-mintNeon/20 border-mintNeon/40 text-mintNeon shadow-mint-glow"
                        : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                      {isVerified ? "Identidad Verificada 3D" : "Verificar Identidad 3D"}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {isVerified ? "Biometría auténtica activa" : "Protocolo anti-bots y estafas"}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    isVerified
                      ? "bg-mintNeon/20 text-mintNeon border border-mintNeon/30"
                      : "bg-white/5 text-neutral-400"
                  }`}
                >
                  {isVerified ? "✓ OK" : "VERIFICAR"}
                </span>
              </button>

              {/* Opción 4: VESSEL UNLIMITED */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  audioEngine.playPulse();
                  openUnlimitedModal();
                }}
                className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-champagneGold/20 border border-champagneGold/40 text-champagneGold shadow-[0_0_8px_rgba(245,158,11,0.3)] flex-shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-champagneGold group-hover:brightness-110 truncate">
                      {isUnlimited ? "Membresía Unlimited" : "Mejorar a Unlimited"}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {isUnlimited ? "Bóvedas ilimitadas y radar global" : "Bóvedas privadas y chat sin límite"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-champagneGold bg-champagneGold/10 px-2 py-0.5 rounded border border-champagneGold/30">
                  {isUnlimited ? "ACTIVO" : "UPGRADE"}
                </span>
              </button>

              <div className="border-t border-white/10 my-0.5" />

              {/* Opción 5: Gestión de Cuenta y Sesión */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  audioEngine.playPulse();
                  openAuthModal(isAuthenticated ? "session" : "login");
                }}
                className="min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-neutral-300 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
                      {isAuthenticated ? "Gestionar Sesión" : "Ingresar con mi Cuenta"}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {isAuthenticated ? "Configuración y cierre de sesión" : "Acceder a tu perfil guardado"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  {isAuthenticated ? "PERFIL" : "LOGIN"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);
};
