"use client";

import React from "react";
import { VesselLogo } from "./VesselLogo";
import {
  useSettings,
  useAuth,
  useSafety,
  useRadarMatrix,
  useChat,
  useLogistics,
} from "@/context/VesselContext";
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
  Sliders,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { OnTheClockState } from "@/types/vessel";
import { BetaFeedbackMenuSection } from "@/components/beta/BetaFeedbackFab";
import { TestEnvironmentMenuSection } from "@/components/beta/TestEnvironmentMenuSection";
import { BrutalistButton, TacticalMenuItem } from "@/components/ui";

interface ActiveReadyNowBadgeProps {
  myOnTheClock: OnTheClockState;
  stopOnTheClock: () => void;
  language: string;
}

const ActiveReadyNowBadge: React.FC<ActiveReadyNowBadgeProps> = React.memo(({
  myOnTheClock,
  stopOnTheClock,
  language,
}) => {
  const [now, setNow] = React.useState<number>(() => Date.now());
  const [isHovered, setIsHovered] = React.useState<boolean>(false);


  React.useEffect(() => {
    if (!myOnTheClock?.isActive || !myOnTheClock?.expiresAt) return;

    const updateTick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      setNow(Date.now());
    };

    const interval = setInterval(updateTick, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [myOnTheClock?.isActive, myOnTheClock?.expiresAt]);

  const { elapsedDegrees, countdownLabel } = React.useMemo(() => {
    if (!myOnTheClock?.expiresAt) {
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
    myOnTheClock?.expiresAt,
    myOnTheClock?.durationMinutes,
    myOnTheClock?.startedAt,
    now,
  ]);

  const clockGradient = React.useMemo(() => {
    const deg = Math.round(elapsedDegrees * 10) / 10;

    if (deg <= 0.5) {
      return `conic-gradient(from 0deg at 50% 50%, #8b5cf6 0deg, #a855f7 180deg, #8b5cf6 360deg)`;
    }

    if (deg >= 359.5) {
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
  }, [elapsedDegrees]);

  return (
    <button
      type="button"
      onClick={() => {
        audioEngine.playSubBass(60, 0.15);
        stopOnTheClock();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative inline-flex items-center gap-2 px-3 py-1.5 h-[36px] sm:h-[38px] rounded-full bg-obsidian-surface border border-electricViolet/50 shadow-[0_0_16px_rgba(139,92,246,0.35)] hover:border-bloodNeon hover:shadow-[0_0_20px_rgba(230,25,55,0.4)] active:scale-95 transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet overflow-hidden flex-shrink-0"
      title={
        language === "es"
          ? `Listo ahora activo • Restan ${countdownLabel} • Tocá para pausar`
          : `Ready now active • ${countdownLabel} left • Tap to pause`
      }
      aria-label={
        language === "es"
          ? `Listo ahora activo. Restan ${countdownLabel}. Tocá para desactivar.`
          : `Ready now active. ${countdownLabel} left. Tap to deactivate.`
      }
    >
      {/* Borde dinámico con progreso cónico sin superposición de contenedores */}
      <div
        data-testid="header-on-the-clock-border"
        className="absolute inset-0 rounded-full pointer-events-none p-[1.5px] z-10 transition-opacity duration-300"
        style={{
          background: clockGradient,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Halo de pulso ambiental */}
      <span className="absolute inset-0 bg-electricViolet/10 group-hover:bg-bloodNeon/10 transition-colors duration-200 pointer-events-none" />

      {/* Indicador de estado y Morphing Icon */}
      <div className="relative z-20 flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${
              isHovered ? "bg-bloodNeon" : "bg-electricViolet"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              isHovered ? "bg-bloodNeon" : "bg-electricViolet"
            }`}
          />
        </span>

        {/* Morphing Icon: Rayo (Activo) <-> X (Desactivar al hacer hover) */}
        <AnimatePresence mode="wait" initial={false}>
          {isHovered ? (
            <motion.span
              key="stop-icon"
              initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: 90, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 15, mass: 0.9 }}
              className="text-bloodNeon flex items-center justify-center drop-shadow-[0_0_8px_rgba(230,25,55,0.85)]"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </motion.span>
          ) : (
            <motion.span
              key="zap-icon"
              initial={{ scale: 0.4, rotate: 90, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: -90, opacity: 0 }}
              transition={{
                rotate: { duration: 0.45, ease: "easeOut" },
                scale: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                opacity: { duration: 0.35 },
              }}
              className="text-electricViolet-glow flex items-center justify-center drop-shadow-[0_0_8px_rgba(167,139,250,0.85)]"
            >
              <Zap className="w-3.5 h-3.5 fill-electricViolet stroke-[2]" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Contenido tipográfico y micro-pill con cuenta regresiva */}
      <div className="relative z-20 flex items-center gap-1.5">
        <span
          className={`font-mono text-[11px] font-black tracking-wider uppercase transition-colors duration-500 ${
            isHovered ? "text-bloodNeon" : "text-white"
          }`}
        >
          {isHovered
            ? language === "es"
              ? "PAUSAR"
              : "STOP"
            : language === "es"
            ? "LISTO"
            : "READY"}
        </span>

        {countdownLabel && (
          <span
            className={`font-mono font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border transition-all duration-500 ${
              isHovered
                ? "bg-bloodNeon/20 text-bloodNeon border-bloodNeon/40"
                : "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/30 shadow-violet-soft"
            }`}
          >
            {countdownLabel}
          </span>
        )}
      </div>
    </button>
  );
});
ActiveReadyNowBadge.displayName = "ActiveReadyNowBadge";


interface HeaderReadyNowButtonProps {
  myOnTheClock?: OnTheClockState;
  startOnTheClock: (durationMinutes: number, note?: string) => void;
  stopOnTheClock: () => void;
  language: string;
}

const HeaderReadyNowButton: React.FC<HeaderReadyNowButtonProps> = React.memo(({
  myOnTheClock,
  startOnTheClock,
  stopOnTheClock,
  language,
}) => {
  if (myOnTheClock?.isActive) {
    return (
      <ActiveReadyNowBadge
        myOnTheClock={myOnTheClock}
        stopOnTheClock={stopOnTheClock}
        language={language}
      />
    );
  }

  return (
    <BrutalistButton
      type="button"
      variant="ghost"
      size="compact"
      soundEffect="none"
      onClick={() => {
        audioEngine.playSubBass(70, 0.15);
        startOnTheClock(60, language === "es" ? "Disponible ahora" : "Available now");
      }}
      className="group flex items-center gap-1.5 !px-2.5 sm:!px-3 !py-1 min-h-[36px] sm:min-h-[38px] !rounded-full !bg-white/5 !border-white/10 hover:!border-electricViolet/60 hover:!bg-electricViolet/15 text-neutral-300 hover:text-white font-mono text-[10px] sm:text-[11px] font-semibold transition-all duration-500 hover:shadow-[0_0_16px_rgba(139,92,246,0.35)] cursor-pointer active:scale-95"
      title={language === "es" ? "Activar disponibilidad inmediata (1 hora)" : "Activate immediate availability (1 hour)"}
      aria-label={language === "es" ? "Activarme disponible" : "Activate availability"}
    >
      <Zap className="w-3.5 h-3.5 text-electricViolet animate-morph-breathe drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
      <span className="font-mono font-black tracking-wider uppercase text-[10px] sm:text-[11px]">
        {language === "es" ? "Listo Ya" : "Ready Now"}
      </span>
    </BrutalistButton>
  );
});
HeaderReadyNowButton.displayName = "HeaderReadyNowButton";

export interface BrutalistHeaderProps {
  isCompact?: boolean;
}

export const BrutalistHeader: React.FC<BrutalistHeaderProps> = ({ isCompact = false }) => {
  const {
    openUnlimitedModal,
    appSettings,
    updateAppSettings,
    openAppSettingsModal,
    t,
    language,
    userPlan,
  } = useSettings();

  const {
    myProfile,
    openAuthModal,
    authUser,
    isAuthenticated,
  } = useAuth();

  const {
    harmReductionSession,
    openHarmReductionModal,
  } = useSafety();

  const {
    setActiveView,
    myOnTheClock,
    startOnTheClock,
    stopOnTheClock,
    setIsFilterDrawerOpen,
    filters,
  } = useRadarMatrix();

  const {
    activeRendezvous,
    setActiveChatProfileId,
  } = useChat();

  const { travelMode, openTravelModal } = useLogistics();

  const [isAudioUnlocked, setIsAudioUnlocked] = React.useState<boolean>(() =>
    audioEngine.getIsAudioUnlocked()
  );

  React.useEffect(() => {
    const unsubscribe = audioEngine.subscribeAudioUnlocked((unlocked) => {
      setIsAudioUnlocked(unlocked);
    });
    return () => unsubscribe();
  }, []);



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

  const activeFiltersCount = React.useMemo(() => {
    if (!filters) return 0;
    return (
      (filters.bodyStates?.length < 3 ? 1 : 0) +
      (filters.roles?.length || 0) +
      (filters.minIntensity > 1 ? 1 : 0) +
      (filters.energyVibes?.length || 0) +
      (filters.selectedKinks?.length || 0) +
      (filters.substanceAtmospheres?.length || 0) +
      (filters.immediateHostOnly ? 1 : 0) +
      (filters.onlyVerified ? 1 : 0) +
      (filters.onlyAntiGhost ? 1 : 0) +
      (filters.onlyMutualKinks ? 1 : 0)
    );
  }, [filters]);

  const renderTacticalMenu = () => {
    if (!isMenuOpen) return null;
    return (
      <>
        {/* Backdrop oscuro en mobile cuando el menú táctico está abierto */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        <div
          role="menu"
          aria-orientation="vertical"
          data-testid="header-tactical-menu"
          className="fixed inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t border-white/20 bg-obsidian-surface/98 backdrop-blur-2xl shadow-[0_-16px_50px_rgba(0,0,0,0.98)] p-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] z-50 animate-in slide-in-from-bottom duration-200 overflow-y-auto sm:static sm:inset-auto sm:max-h-none sm:rounded-2xl sm:border sm:border-white/15 sm:bg-obsidian-surface sm:backdrop-blur-xl sm:p-2 sm:pb-2 sm:absolute sm:top-full sm:right-0 sm:mt-2 sm:w-80 sm:shadow-[0_16px_40px_rgba(0,0,0,0.95)] sm:animate-in sm:zoom-in-95 sm:slide-in-from-top-0 flex flex-col gap-1 select-none"
        >
          {/* Mobile Tactical Drag Handle */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="w-12 h-1.5 bg-neutral-600 hover:bg-neutral-500 rounded-full mx-auto mb-2.5 sm:hidden flex-shrink-0 cursor-pointer"
          />

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

          {/* Sección Táctica Beta Tester Lab Integrada */}
          <BetaFeedbackMenuSection onCloseMenu={() => setIsMenuOpen(false)} />

          {/* Sección Táctica Versión de Prueba & Entorno */}
          <TestEnvironmentMenuSection onCloseMenu={() => setIsMenuOpen(false)} />

          <div className="border-t border-white/10 my-0.5" />

          {/* Opción 1: Audio Sub-Bass (45-80Hz) */}
          <TacticalMenuItem
            icon={!appSettings.soundEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            iconBgClass={
              !appSettings.soundEnabled
                ? "bg-white/5 border-white/10 text-neutral-400"
                : "bg-electricViolet/20 border-electricViolet/40 text-electricViolet-glow shadow-[0_0_8px_rgba(139,92,246,0.3)]"
            }
            title="Audio Sub-Bass (45-80Hz)"
            subtitle={
              !appSettings.soundEnabled
                ? "Silenciado • Tocá para activar"
                : !isAudioUnlocked
                ? "Requiere toque para calibrar"
                : "Resonancia analógica activa"
            }
            badge={appSettings.soundEnabled ? "ON" : "OFF"}
            badgeClassName={
              appSettings.soundEnabled
                ? "bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30"
                : "bg-white/5 text-neutral-500"
            }
            soundEffect="none"
            onClick={handleToggleAudio}
          />

          {/* Opción 2: Mi Pase QR de Fiesta */}
          <TacticalMenuItem
            icon={<QrCode className="w-4 h-4" />}
            iconBgClass="bg-cyan-950/40 border-cyan-500/30 text-cyan-400"
            title="Mi Pase QR de Fiesta"
            subtitle="Compartir perfil en 1 segundo"
            badge="⚡ ABRIR"
            badgeClassName="text-cyan-400 font-mono"
            soundEffect="none"
            onClick={() => {
              setIsMenuOpen(false);
              audioEngine.playSubBass(65);
              window.dispatchEvent(new CustomEvent("vessel:open-qr-share"));
            }}
          />

          {/* Opción 3: Verificación 3D */}
          <TacticalMenuItem
            icon={<ShieldCheck className="w-4 h-4" />}
            iconBgClass={
              isVerified
                ? "bg-mintNeon/20 border-mintNeon/40 text-mintNeon shadow-mint-glow"
                : "bg-white/5 border-white/10 text-neutral-400"
            }
            title={isVerified ? "Identidad Verificada 3D" : "Verificar Identidad 3D"}
            subtitle={isVerified ? "Biometría auténtica activa" : "Protocolo anti-bots y estafas"}
            badge={isVerified ? "✓ OK" : "VERIFICAR"}
            badgeVariant={isVerified ? "emerald" : "neutral"}
            badgeClassName={
              isVerified
                ? "bg-mintNeon/20 text-mintNeon border border-mintNeon/30"
                : "bg-white/5 text-neutral-400"
            }
            soundEffect="pulse"
            onClick={() => {
              setIsMenuOpen(false);
              openAuthModal("verify");
            }}
          />

          {/* Opción 4: VESSEL UNLIMITED */}
          <TacticalMenuItem
            icon={<Crown className="w-4 h-4" />}
            iconBgClass="bg-champagneGold/20 border-champagneGold/40 text-champagneGold shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            title={isUnlimited ? "Membresía Unlimited" : "Mejorar a Unlimited"}
            subtitle={isUnlimited ? "Álbumes con llave y radar global" : "Álbumes con llave y chat sin límite"}
            badge={isUnlimited ? "ACTIVO" : "UPGRADE"}
            badgeClassName="text-champagneGold bg-champagneGold/10 border border-champagneGold/30"
            soundEffect="pulse"
            onClick={() => {
              setIsMenuOpen(false);
              openUnlimitedModal();
            }}
          />

          {/* Opción 5: Configuración de la Aplicación */}
          <TacticalMenuItem
            icon={<Sliders className="w-4 h-4" />}
            iconBgClass="bg-white/5 border-white/10 text-neutral-300"
            title={language === "es" ? "Configuración de la App" : "App Settings"}
            subtitle={
              language === "es"
                ? "Audio, backups, nube, idioma y cuenta"
                : "Audio, backups, cloud, language & account"
            }
            badge="SISTEMA"
            badgeClassName="text-neutral-400 font-mono"
            soundEffect="pulse"
            onClick={() => {
              setIsMenuOpen(false);
              openAppSettingsModal();
            }}
          />

          {/* Acceso para Invitados / Sin Sesión */}
          {!isAuthenticated && (
            <>
              <div className="border-t border-white/10 my-0.5" />
              <TacticalMenuItem
                icon={<User className="w-4 h-4" />}
                iconBgClass="bg-white/5 border-white/10 text-neutral-300"
                title={language === "es" ? "Ingresar con mi Cuenta" : "Sign In"}
                subtitle={language === "es" ? "Acceder a tu perfil guardado" : "Access your saved profile"}
                badge="LOGIN"
                badgeClassName="text-neutral-400 font-mono"
                soundEffect="pulse"
                onClick={() => {
                  setIsMenuOpen(false);
                  openAuthModal("login");
                }}
              />
            </>
          )}
        </div>
      </>
    );
  };

  if (isCompact) {
    return (
      <div className="w-full px-2.5 sm:px-4 h-9 sm:h-10 flex items-center justify-between gap-2 max-w-4xl mx-auto select-none animate-in fade-in duration-200">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <BrutalistButton
            type="button"
            variant="ghost"
            size="compact"
            soundEffect="none"
            onClick={() => {
              audioEngine.playPulse();
              setActiveView("grid");
            }}
            className="flex items-center gap-1.5 !p-0.5 min-h-[30px] !rounded-lg hover:!bg-white/5 !border-transparent"
            title="VESSEL RADAR"
            aria-label="Ir al inicio"
          >
            <VesselLogo size={18} showWordmark={false} />
            <span className="font-mono text-[11px] font-black text-white tracking-wider uppercase">
              RADAR
            </span>
            <span className="text-neutral-500 font-mono text-[10px] hidden min-[360px]:inline">
              // {travelMode?.cityName ? travelMode.cityName.toUpperCase() : "PALERMO SOHO"}
            </span>
          </BrutalistButton>
        </div>

        {myOnTheClock?.isActive && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-electricViolet/15 border border-electricViolet/30 text-white font-mono text-[9px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
            <span>LISTO</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <BrutalistButton
            type="button"
            variant="tactical"
            size="compact"
            soundEffect="pulse"
            onClick={() => setIsFilterDrawerOpen(true)}
            data-testid="compact-header-filter-btn"
            className="!px-2.5 !py-0.5 min-h-[30px] !rounded-full !bg-white/10 !border-white/20 text-[10px] font-mono font-bold flex items-center gap-1 text-white hover:!border-electricViolet"
            aria-label="Abrir filtros"
          >
            <Sliders className="w-3 h-3 text-electricViolet" />
            <span>{language === "es" ? "Filtros" : "Filters"}</span>
            {activeFiltersCount > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-bloodNeon text-white text-[8px] font-mono font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </BrutalistButton>

          <div className="relative flex items-center flex-shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(60, 0.1);
                setIsMenuOpen((prev) => !prev);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-black uppercase bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40"
              aria-label="Menú de usuario"
            >
              {isUnlimited ? "👑" : userCodename.slice(0, 2)}
            </button>
            {renderTacticalMenu()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2.5 sm:px-4 py-1.5 pt-[max(env(safe-area-inset-top,0px),0.375rem)] select-none">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* =========================================================
            ZONA IZQUIERDA: Marca & Identidad del Sistema
            ========================================================= */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <BrutalistButton
            type="button"
            variant="ghost"
            size="compact"
            soundEffect="none"
            onClick={() => {
              audioEngine.playPulse();
              setActiveView("grid");
            }}
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-90 !p-1 -ml-1 min-h-[40px] !rounded-xl hover:!bg-white/5 group !border-transparent"
            title="VESSEL · Matriz & Radar"
            aria-label="Ir al inicio de VESSEL"
          >
            <VesselLogo size={24} showWordmark={true} className="inline-flex" />
            <span className="text-white/30 text-xs font-mono font-light select-none">⚡</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                openTravelModal();
              }}
              className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={language === "es" ? "Cambiar ubicación o ciudad" : "Change location or city"}
            >
              {travelMode?.cityName ? travelMode.cityName.toUpperCase() : "PALERMO SOHO"}
            </span>
          </BrutalistButton>
        </div>

        {/* =========================================================
            ZONA CENTRAL: Widgets Críticos Vivos (Exclusivo en curso)
            ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center min-w-0 overflow-x-auto no-scrollbar py-0.5">
          {/* Rendezvous PIN Activo */}
          {activeRendezvous && (
            <BrutalistButton
              type="button"
              variant="ghost"
              size="compact"
              soundEffect="none"
              onClick={() => {
                audioEngine.playPulse();
                if (activeRendezvous.profileId) {
                  setActiveChatProfileId(activeRendezvous.profileId);
                }
              }}
              aria-label={`Punto de Encuentro Activo con ${activeRendezvous.profileCodename || "usuario"}. Tocá para abrir chat`}
              className="flex items-center gap-1.5 !bg-bloodNeon/20 !border-bloodNeon/60 hover:!bg-bloodNeon/30 hover:!border-bloodNeon text-bloodNeon !px-2.5 !py-1.5 min-h-[36px] !rounded-full shadow-[0_0_15px_rgba(230,25,55,0.35)] group flex-shrink-0"
              title={`Punto de Encuentro Activo con ${activeRendezvous.profileCodename || "usuario"} - Tocá para abrir chat`}
            >
              <span className="w-2 h-2 rounded-full bg-bloodNeon animate-ping flex-shrink-0" />
              <span className="text-[10px] text-bloodNeon font-black font-mono tracking-wider uppercase group-hover:text-white transition-colors truncate max-w-[90px] sm:max-w-none">
                {t.header?.pinActive || "UBICACIÓN ACTIVA"}
              </span>
              <Navigation className="w-3 h-3 text-bloodNeon group-hover:text-white transition-colors ml-0.5 flex-shrink-0" />
            </BrutalistButton>
          )}

          {/* Reducción de Daños Activa */}
          {harmReductionSession?.isActive && (
            <BrutalistButton
              type="button"
              variant="mint"
              size="compact"
              soundEffect="none"
              onClick={openHarmReductionModal}
              className="flex items-center gap-1.5 !px-2.5 !py-1.5 min-h-[36px] !rounded-full shadow-mint-glow font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse flex-shrink-0"
              title="Asistente de Reducción de Daños Activo"
            >
              <HeartPulse className="w-3 h-3 text-mintNeon" />
              <span className="hidden sm:inline">{t.header?.harmReductionActive || "SESIÓN ACTIVA"}</span>
            </BrutalistButton>
          )}
        </div>

        {/* =========================================================
            ZONA DERECHA: Botón de Estado Rápido + Menú de Usuario
            ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Quick Toggle On-The-Clock / Estoy Listo con Barra de Progreso Aislada */}
          <HeaderReadyNowButton
            myOnTheClock={myOnTheClock}
            startOnTheClock={startOnTheClock}
            stopOnTheClock={stopOnTheClock}
            language={language}
          />

          <div className="relative flex items-center flex-shrink-0" ref={menuRef}>
          <BrutalistButton
            type="button"
            variant="ghost"
            size="compact"
            soundEffect="none"
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
            className={`min-h-[42px] sm:min-h-[44px] flex items-center gap-1.5 sm:gap-2 !px-2.5 sm:!px-3 !rounded-full border transition-all ${
              isMenuOpen
                ? "!bg-white/15 !border-electricViolet shadow-violet-soft text-white"
                : isUnlimited
                ? "!bg-amber-950/20 !border-champagneGold/40 text-amber-200 hover:!border-champagneGold hover:!bg-amber-950/30"
                : "!bg-white/5 !border-white/10 text-neutral-200 hover:text-white hover:!border-white/20 hover:!bg-white/10"
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
            <span className="text-[11px] font-mono font-bold tracking-tight uppercase truncate max-w-[65px] min-[380px]:max-w-[85px] sm:max-w-[110px]">
              {isAuthenticated ? userCodename : (t.header?.guestSession || "INVITADO")}
            </span>

            {/* Chevron Indicador */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                isMenuOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </BrutalistButton>

          {/* Menú Desplegable Táctico Zen (Bottom Sheet en mobile / Popover en desktop) */}
          {renderTacticalMenu()}
        </div>
      </div>
    </div>
    </div>
  );
};
