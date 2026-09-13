"use client";

import React from "react";
import { VesselProfile } from "@/types/vessel";
import {
  useRadarMatrix,
  useChat,
  useDiary,
  useSettings,
} from "@/context/VesselContext";
import { Lock, Volume2, CheckCircle2, CloudFog, Ghost, ShieldCheck, ShieldAlert, Flame, MessageCircle } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

interface ProfileCardProps {
  profile: VesselProfile;
  onSelect: (profile: VesselProfile) => void;
  onOpenChat: (profileId: string) => void;
  isPriority?: boolean;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  onSelect,
  onOpenChat,
  isPriority = false,
}) => {
  const {
    transmissions,
    transmitSignal,
    getMutualKinkMatches,
    hasMutualPulse,
  } = useRadarMatrix();
  const { getBoundaryForProfile } = useChat();
  const { getProfileDossier } = useDiary();
  const { t, language, isUnlimited, openUnlimitedModal } = useSettings();
  const [isCapsuleOpen, setIsCapsuleOpen] = React.useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = React.useState(false);
  const [isPulsing, setIsPulsing] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const autoCloseRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoCloseTelemetryRef = React.useRef<NodeJS.Timeout | null>(null);

  const isPaidMember =
    profile.userPlan === "unlimited" ||
    profile.userPlan === "pro" ||
    Boolean(profile.isUnlimited) ||
    Boolean(profile.isCurrentUser && isUnlimited);

  const isDistant = !profile.isCurrentUser && profile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const isMutualPulseActive = !profile.isCurrentUser && hasMutualPulse(profile.id);
  const canChatDirectly = !isLockedByDistance || isMutualPulseActive;

  const mutualKinks = !profile.isCurrentUser ? getMutualKinkMatches(profile.kinkMatrix) : [];

  const signalCount = transmissions[profile.id] || 0;
  const boundary = getBoundaryForProfile(profile.id);
  const dossier = getProfileDossier(profile.id);
  const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
  const roleDisplay = getRoleDisplayLabel(profile.role, language);

  const verdictMeta = dossier?.rating ? DOSSIER_VERDICT_CONFIG[dossier.rating] : null;

  const isImmediateHost =
    profile.mobility === "Tengo depto / lugar" ||
    profile.mobility === "Tengo sitio" ||
    profile.mobility === "Tengo lugar y me muevo" ||
    profile.mobility === "Tengo sitio/me desplazo";
  const isAttenuated = boundary?.radarVisibility === "attenuated";

  // Protocolo de Salida táctico elevado a la zona superior izquierda
  const getProtocolMeta = (protocol?: string | null) => {
    if (!protocol) return null;
    switch (protocol) {
      case "fast_encounter":
        return {
          icon: "⏱️",
          label: language === "es" ? "PUNTUAL" : "FAST",
          desc: language === "es" ? "Protocolo: Encuentro puntual (sin sobremesa)" : "Protocol: Fast encounter (no lingering)",
        };
      case "chill_cuddle":
        return {
          icon: "🫂",
          label: language === "es" ? "MIMOS" : "CUDDLE",
          desc: language === "es" ? "Protocolo: Ducha y mimos (20-30 min)" : "Protocol: Shower and cuddle (20-30 min)",
        };
      case "sleepover":
        return {
          icon: "🌙",
          label: language === "es" ? "DORMIR" : "SLEEPOVER",
          desc: language === "es" ? "Protocolo: Quedarse a dormir si hay química" : "Protocol: Sleepover if mutual vibe",
        };
      default:
        return {
          icon: "⏱️",
          label: protocol.toUpperCase(),
          desc: `Protocolo: ${protocol}`,
        };
    }
  };

  const protocolMeta = getProtocolMeta(profile.exitProtocol);

  // Metadatos tácticos de Verificación para la píldora de protocolo
  const getVerificationMeta = (verification?: VesselProfile["verification"]) => {
    if (!verification || !verification.isVerified) return null;
    switch (verification.method) {
      case "email":
        return {
          label: "MAIL",
          fullLabel: language === "es" ? "Verificado por Email" : "Email Verified",
          icon: <CheckCircle2 className="w-2.5 h-2.5 text-sky-400 stroke-[2.5]" />,
          colorClass: "text-sky-300 bg-sky-950/80 border-sky-500/40",
        };
      case "phone_sms":
        return {
          label: "SMS",
          fullLabel: language === "es" ? "Verificado por SMS" : "SMS Verified",
          icon: <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 stroke-[2.5]" />,
          colorClass: "text-emerald-300 bg-emerald-950/80 border-emerald-500/40",
        };
      case "biometric_liveness":
      case "biometric_3d":
        return {
          label: "BIO",
          fullLabel: language === "es" ? "Biometría Facial 3D" : "3D Face Biometrics",
          icon: <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 stroke-[2.5]" />,
          colorClass: "text-emerald-300 bg-emerald-950/80 border-emerald-500/40",
        };
      case "oauth_google":
        return {
          label: "GOOGLE",
          fullLabel: language === "es" ? "Google OAuth Seguro" : "Secure Google OAuth",
          icon: <ShieldCheck className="w-2.5 h-2.5 text-sky-400 stroke-[2.5]" />,
          colorClass: "text-sky-300 bg-sky-950/80 border-sky-500/40",
        };
      case "id_document":
        return {
          label: "ID",
          fullLabel: language === "es" ? "Documento de Identidad" : "Government ID",
          icon: <ShieldCheck className="w-2.5 h-2.5 text-electricViolet-glow stroke-[2.5]" />,
          colorClass: "text-electricViolet-glow bg-electricViolet/20 border-electricViolet/40",
        };
      default:
        return {
          label: language === "es" ? "VERIF" : "VERIFIED",
          fullLabel: language === "es" ? "Perfil Verificado" : "Verified Profile",
          icon: <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 stroke-[2.5]" />,
          colorClass: "text-emerald-300 bg-emerald-950/80 border-emerald-500/40",
        };
    }
  };

  const verificationMeta = getVerificationMeta(profile.verification);

  // Lista priorizada de indicadores tácticos para el micro-HUD
  const activeIndicators: { id: string; icon: React.ReactNode; tooltip: string }[] = [];
  
  if (dossier?.redFlags && dossier.redFlags.length > 0) {
    activeIndicators.push({
      id: "redFlags",
      icon: (
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-bloodNeon">
          <ShieldAlert className="w-2.5 h-2.5 text-bloodNeon" />
          <span>{dossier.redFlags.length}</span>
        </span>
      ),
      tooltip: `${dossier.redFlags.length} Red Flags`,
    });
  }
  if (profile.isAntiGhost) {
    activeIndicators.push({
      id: "antiGhost",
      icon: <Ghost className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />,
      tooltip: `Anti-Ghost: ${profile.respectScore}% Respect`,
    });
  }
  if (mutualKinks.length > 0) {
    activeIndicators.push({
      id: "kinks",
      icon: (
        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 font-mono">
          <Flame className="w-2.5 h-2.5 text-amber-400 fill-current" />
          <span>{mutualKinks.length}</span>
        </span>
      ),
      tooltip: `${mutualKinks.length} Deseos coincidentes`,
    });
  }
  if (profile.privateVault && profile.privateVault.length > 0) {
    activeIndicators.push({
      id: "vault",
      icon: <Lock className="w-2.5 h-2.5 text-bloodNeon flex-shrink-0" />,
      tooltip: `${profile.privateVault.length} fotos en Bóveda`,
    });
  }
  if (profile.audioNote || profile.voiceVibe) {
    activeIndicators.push({
      id: "audio",
      icon: <Volume2 className="w-2.5 h-2.5 text-electricViolet-glow flex-shrink-0" />,
      tooltip: profile.voiceVibe ? "Voice Vibe de 5s activo" : (t.card?.voiceNoteTooltip || "Audio"),
    });
  }
  if (profile.isFogMode) {
    activeIndicators.push({
      id: "fog",
      icon: <CloudFog className="w-2.5 h-2.5 text-neutral-300 flex-shrink-0" />,
      tooltip: t.card?.fogModeTooltip || "Modo Niebla",
    });
  }

  const hasCapsuleIndicators = activeIndicators.length > 0;
  const hasBothPrimary = Boolean(protocolMeta && verificationMeta);
  // Si ya tenemos Protocolo Y Verificación, no saturamos el ancho con iconos inline; mostramos directamente el contador "+N"
  // Si solo hay uno de los dos, permitimos 1 icono inline. Si no hay ninguno, hasta 2.
  const maxInlineIndicators = hasBothPrimary ? 0 : (protocolMeta || verificationMeta ? 1 : 2);
  const visibleIndicators = activeIndicators.slice(0, maxInlineIndicators);
  const remainingIndicatorsCount = activeIndicators.length - maxInlineIndicators;

  const handleCapsuleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    if (autoCloseTelemetryRef.current) clearTimeout(autoCloseTelemetryRef.current);
    setIsTelemetryOpen(false);

    setIsCapsuleOpen((prev) => {
      const next = !prev;
      if (next) {
        autoCloseRef.current = setTimeout(() => {
          setIsCapsuleOpen(false);
        }, 8000);
      }
      return next;
    });
  };

  const handleTelemetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (autoCloseTelemetryRef.current) clearTimeout(autoCloseTelemetryRef.current);
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setIsCapsuleOpen(false);

    setIsTelemetryOpen((prev) => {
      const next = !prev;
      if (next) {
        autoCloseTelemetryRef.current = setTimeout(() => {
          setIsTelemetryOpen(false);
        }, 8000);
      }
      return next;
    });
  };

  React.useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      if (autoCloseTelemetryRef.current) clearTimeout(autoCloseTelemetryRef.current);
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(profile)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(profile);
        }
      }}
      aria-label={`${profile.codename}, ${roleDisplay}${profile.showAge ? `, ${profile.age} años` : ""}`}
      className={`group relative aspect-[2/3] bg-obsidian-surface rounded-2xl overflow-hidden cursor-pointer select-none border transition-all duration-300 transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black shadow-lg ${
        isPaidMember
          ? "border-fuchsia-500/50 shadow-[0_0_25px_rgba(255,0,127,0.3)] ring-1 ring-fuchsia-500/50"
          : profile.isCurrentUser
          ? "border-electricViolet shadow-violet-glow ring-1 ring-electricViolet/60"
          : isAttenuated
          ? "border-purple-500/30 opacity-80 hover:opacity-100"
          : "border-white/10 hover:border-electricViolet/70 hover:shadow-violet-soft"
      }`}
    >
      {/* Borde Animado Neón Fucsia Giratorio para Miembros Pagos (Border Beam) */}
      {isPaidMember && (
        <div
          data-testid="neon-fuchsia-border-beam"
          className="border-beam-fuchsia"
          aria-hidden="true"
        />
      )}

      {/* Foto de Perfil Full Bleed con Fallback Seguro */}
      {!imgError ? (
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={profile.avatarUrl}
            alt={profile.codename}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              profile.isFogMode
                ? "filter blur-[6px] scale-105"
                : isLockedByDistance
                ? "filter blur-[8px] contrast-90 brightness-90 scale-105"
                : "group-hover:scale-105"
            } ${isAttenuated ? "grayscale-[25%]" : ""}`}
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={isPriority ? "high" : "auto"}
          />
          {/* Trama de scanlines tácticas para perfiles con señal remota fuera de rango */}
          {isLockedByDistance && (
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-60 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-obsidian-card flex flex-col items-center justify-center text-neutral-600 font-mono text-xs">
          <span className="text-2xl mb-1 text-electricViolet-glow">⚡</span>
          <span>{profile.codename.slice(0, 2).toUpperCase()}</span>
        </div>
      )}

      {/* Degradado Táctico de Legibilidad: 100% contraste desde la base hasta la cápsula, nítido y sin gradiente hacia arriba */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black via-black/92 via-55% to-transparent pointer-events-none" />

      {/* Badge Superior Izquierdo: Solo para el Usuario Actual o Listo YA */}
      {profile.isCurrentUser ? (
        <div className="absolute top-2 left-2 pointer-events-none z-10">
          <div className="flex items-center gap-1 bg-electricViolet text-white px-2 py-0.5 rounded-full shadow-violet-soft font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
            <span className="text-[9px] font-black font-mono uppercase tracking-wider">
              {t.card?.youBadge || (language === "es" ? "⭐ VOS" : "⭐ YOU")}
            </span>
          </div>
        </div>
      ) : (
        /* Badge Superior Izquierdo: Listo YA (On-The-Clock) */
        profile.onTheClock?.isActive && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1 bg-purple-950/95 border border-electricViolet text-electricViolet-glow px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black shadow-violet-glow uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
              <span>⚡ LISTO YA</span>
            </div>
          </div>
        )
      )}

      {/* Píldora Superior Derecha: Telemetría Unificada Táctil (Estado Corporal + Distancia + Señal Remota) */}
      {!profile.isCurrentUser && (
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={handleTelemetryClick}
            title={
              isLockedByDistance
                ? `${t.card.remoteSignal || "Señal Remota"} • ${t.card.telemetryTitle || "Ver Telemetría"}`
                : (t.card.telemetryTitle || "Ver Telemetría")
            }
            aria-label={t.card.telemetryTitle || "Ver Telemetría"}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-mono text-[9px] font-bold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet ${
              isTelemetryOpen
                ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow scale-105"
                : isLockedByDistance
                ? "bg-black/90 hover:bg-black border-purple-500/50 hover:border-electricViolet text-purple-300 active:scale-95"
                : "bg-black/90 hover:bg-black border-white/15 hover:border-electricViolet/50 text-white active:scale-95"
            }`}
          >
            {/* Dot indicador de Estado Corporal */}
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                profile.bodyState === "open"
                  ? "bg-mintNeon shadow-mint-glow animate-pulse"
                  : profile.bodyState === "occupied"
                  ? "bg-bloodNeon shadow-blood-glow"
                  : "bg-purple-400"
              }`}
            />
            {/* Ícono de Satélite Táctico para perfiles fuera de radio libre (>1km) */}
            {isLockedByDistance && <span className="leading-none text-[10px]">🛰️</span>}
            {/* Distancia discretizada S2 */}
            <span>
              {profile.discretizedDistance?.displayLabel ||
                (profile.distanceMeters < 1000
                  ? `${profile.distanceMeters}m`
                  : `${(profile.distanceMeters / 1000).toFixed(1)}km`)}
            </span>
            {/* Mini tag de Señal Remota unificado en la píldora */}
            {isLockedByDistance && (
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-electricViolet-glow ml-0.5">
                REMOTO
              </span>
            )}
          </button>

          {/* Alerta Sentinel Preventiva Comunitaria */}
          {profile.hasSafetyAlert && (
            <div className="flex items-center gap-1 bg-red-950/95 border border-red-500 text-red-300 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider shadow-sm pointer-events-none">
              <span>⚠️</span>
            </div>
          )}
        </div>
      )}

      {/* Pie de Foto Impeccable: Jerarquía Táctica Desacoplada (Nombre 100% visible sin colisión) */}
      <div className="absolute bottom-2 inset-x-2 z-10 flex flex-col gap-1 pointer-events-none">
        {/* Fila 1: Píldora Táctica Unificada (Protocolo + Verificación con Método + Micro-HUD) */}
        {(protocolMeta || verificationMeta || hasCapsuleIndicators) && (
          <div className="flex items-center max-w-full overflow-hidden pointer-events-auto">
            <button
              type="button"
              onClick={handleCapsuleClick}
              title={
                protocolMeta
                  ? `${protocolMeta.desc}${verificationMeta ? ` • ${verificationMeta.fullLabel}` : ""}`
                  : (verificationMeta?.fullLabel || t.card?.capsuleTitle || "Indicadores")
              }
              aria-label={
                protocolMeta
                  ? `${protocolMeta.desc}${verificationMeta ? ` • ${verificationMeta.fullLabel}` : ""}`
                  : (verificationMeta?.fullLabel || t.card?.capsuleTitle || "Indicadores")
              }
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all shadow-sm max-w-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet ${
                isCapsuleOpen
                  ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow scale-105"
                  : "bg-black/90 hover:bg-black border-white/15 hover:border-electricViolet/50 active:scale-95 text-neutral-300"
              }`}
            >
              {/* Protocolo Táctico Unificado (Ej: 🫂 MIMOS, ⏱️ PUNTUAL, 🌙 DORMIR) */}
              {protocolMeta && (
                <span className="flex items-center gap-1 text-[8.5px] font-mono font-bold text-electricViolet-glow uppercase tracking-wider whitespace-nowrap">
                  <span className="text-[10px] leading-none">{protocolMeta.icon}</span>
                  <span>{protocolMeta.label}</span>
                </span>
              )}

              {/* Separador si hay protocolo y verificación */}
              {protocolMeta && verificationMeta && (
                <span className="w-px h-2.5 bg-white/20 flex-shrink-0" />
              )}

              {/* Chip de Verificación con Método Visible (Ej: ✓ MAIL, ✓ SMS, ✓ BIO, ✓ ID) */}
              {verificationMeta && (
                <span
                  data-testid={`capsule-verification-${verificationMeta.label.toLowerCase()}`}
                  className={`flex items-center gap-0.5 text-[8px] font-mono font-black tracking-wider uppercase px-1.5 py-0.2 rounded-full border whitespace-nowrap ${verificationMeta.colorClass}`}
                >
                  {verificationMeta.icon}
                  <span>{verificationMeta.label}</span>
                </span>
              )}

              {/* Indicadores Tácticos Restantes o Contador Compacto */}
              {visibleIndicators.length > 0 ? (
                <>
                  <span className="w-px h-2.5 bg-white/20 flex-shrink-0" />
                  <span className="flex items-center gap-1">
                    {visibleIndicators.map((ind) => (
                      <span key={ind.id} title={ind.tooltip} className="flex items-center">
                        {ind.icon}
                      </span>
                    ))}
                    {remainingIndicatorsCount > 0 && (
                      <span className="text-[8px] font-mono font-bold text-neutral-400">
                        +{remainingIndicatorsCount}
                      </span>
                    )}
                  </span>
                </>
              ) : remainingIndicatorsCount > 0 ? (
                <>
                  <span className="w-px h-2.5 bg-white/20 flex-shrink-0" />
                  <span
                    title={`${remainingIndicatorsCount} indicadores tácticos adicionales`}
                    className="text-[8px] font-mono font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded-full"
                  >
                    +{remainingIndicatorsCount}
                  </span>
                </>
              ) : null}
            </button>
          </div>
        )}

        {/* Fila 2: Nombre, Edad, Host Chip, Química & Dúo — 100% DEL ANCHO DE LA TARJETA */}
        <div className="flex items-center gap-1.5 w-full min-w-0 pointer-events-auto">
          <span
            title={dossier?.customAlias || profile.codename}
            className={`text-xs sm:text-sm font-extrabold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate ${
              dossier?.customAlias ? "text-electricViolet-glow font-black" : "text-white"
            }`}
          >
            {dossier?.customAlias || profile.codename}
          </span>
          {profile.showAge && (
            <span className="text-[11px] sm:text-xs text-neutral-300 font-bold flex-shrink-0 drop-shadow-sm font-mono">
              {profile.age}
            </span>
          )}
          {/* Chip de Hospedaje Inmediato en Fila de Identidad */}
          {isImmediateHost && (
            <span
              title={profile.hostCard?.amenities?.showerReady ? (language === "es" ? "Tiene lugar propio + Ducha lista" : "Has place + Shower ready") : (t.card?.immediateHost || "Tiene Lugar")}
              className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/25 border border-amber-400/40 text-[9px] font-bold text-amber-300 flex-shrink-0 shadow-xs"
            >
              <span>🏠</span>
              {profile.hostCard?.amenities?.showerReady && <span className="text-[8px]">🚿</span>}
            </span>
          )}
          {/* Ícono de Química / Veredicto Dossier */}
          {verdictMeta && (
            <span
              title={`${verdictMeta.icon} ${verdictMeta.title[language]}`}
              className="text-xs flex-shrink-0 leading-none select-none"
            >
              {verdictMeta.icon}
            </span>
          )}
          {/* Badge Dúo de Pareja */}
          {profile.isDuo && (
            <span
              title={language === "es" ? "Modo Dúo de Pareja" : "Duo Partner Mode"}
              className="text-[10px] flex-shrink-0 leading-none select-none"
            >
              👥
            </span>
          )}
        </div>

        {/* Fila 3: Rol Táctico a la Izquierda + Botones de Acción 1-Tap a la Derecha */}
        <div className="flex items-center justify-between gap-1 w-full pt-0.5">
          {/* Rol en Violeta Eléctrico (100% Despejado, Espacio Dedicado) */}
          <div className="flex items-center min-w-0 flex-1 pr-1 pointer-events-auto">
            <span className="text-[10.5px] sm:text-xs text-electricViolet-glow font-black tracking-tight drop-shadow-sm truncate">
              {roleDisplay}
            </span>
          </div>

          {/* Cluster de Acciones Tácticas Directas (Chat Directo 1-Tap + Pulso de Rol 1-Tap) */}
          {!profile.isCurrentUser && (
            <div className="flex-shrink-0 flex items-center gap-1 pointer-events-auto">
              {/* Botón 1: Chat Rápido Directo o Candado de VESSEL UNLIMITED */}
              {canChatDirectly ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.playPulse();
                    onOpenChat(profile.id);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 cursor-pointer ${
                    isMutualPulseActive
                      ? "border-emerald-400/80 bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900 shadow-[0_0_10px_rgba(52,211,153,0.5)] focus-visible:ring-emerald-400"
                      : "border-white/20 bg-black/90 text-white hover:border-electricViolet hover:text-electricViolet-glow hover:bg-black focus-visible:ring-electricViolet"
                  }`}
                  title={
                    isMutualPulseActive
                      ? (t.card.mutualPulseChat || "Chat Sintonía Mutua")
                      : (language === "es" ? "Abrir chat directo" : "Open direct chat")
                  }
                  aria-label={
                    isMutualPulseActive
                      ? (t.card.mutualPulseChat || "Chat Sintonía Mutua")
                      : (language === "es" ? `Abrir chat directo con ${profile.codename}` : `Open direct chat with ${profile.codename}`)
                  }
                >
                  <MessageCircle className={`w-3.5 h-3.5 stroke-[2.2] ${isMutualPulseActive ? "text-emerald-400" : ""}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.playPulse();
                    openUnlimitedModal();
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-champagneGold/50 bg-black/90 text-champagneGold hover:border-champagneGold hover:bg-amber-950/60 hover:text-white flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagneGold cursor-pointer"
                  title={t.card.distantChatLocked || "Chatear requiere VESSEL UNLIMITED o Pulso Mutuo"}
                  aria-label={t.card.distantChatLocked || "Chatear requiere VESSEL UNLIMITED o Pulso Mutuo"}
                >
                  <Lock className="w-3.5 h-3.5 text-champagneGold stroke-[2.4]" />
                </button>
              )}

              {/* Botón 2: Pulso Cinético de Rol (1-Tap Kinetic Reaction con Micro-Interacción) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPulsing(true);
                  transmitSignal(profile.id);
                  setTimeout(() => setIsPulsing(false), 650);
                }}
                className={`relative overflow-hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet cursor-pointer ${
                  signalCount > 0
                    ? `bg-electricViolet text-white border-electricViolet ${roleAction.glowClass} scale-105`
                    : "bg-black/90 text-white border-white/20 hover:border-electricViolet hover:scale-105 hover:bg-black"
                }`}
                title={signalCount > 0 ? roleAction.sentLabel : roleAction.tooltipTemplate}
                aria-label={roleAction.tooltipTemplate}
              >
                {isPulsing && (
                  <span className="absolute inset-0 rounded-full bg-electricViolet-glow/70 animate-pulse-wave pointer-events-none" />
                )}
                <span
                  className={`leading-none select-none text-[12px] sm:text-[13px] transition-transform duration-200 ${
                    isPulsing ? "scale-125" : ""
                  }`}
                >
                  {roleAction.icon}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Popover / Sheet Interno informativo al hacer tap en la cápsula (100% libre de cortes) */}
      {isCapsuleOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsCapsuleOpen(false);
          }}
          className="absolute inset-x-2 bottom-2 z-30 max-h-[85%] bg-black/95 border border-electricViolet/60 rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-electricViolet-glow font-mono">
                {t.card.capsuleTitle || "INDICADORES"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCapsuleOpen(false);
              }}
              className="text-[8px] font-mono text-neutral-400 hover:text-white flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              ✕ {t.card.capsuleCloseTip || "Cerrar"}
            </button>
          </div>

          <div className="flex flex-col gap-1.5 text-[10.5px] text-neutral-200 overflow-y-auto pr-0.5">
            {/* 1. Protocolo Táctico de Encuentro */}
            {profile.exitProtocol && (
              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <span className="text-base leading-none flex-shrink-0 mt-0.5">
                  {profile.exitProtocol === "fast_encounter" ? "⏱️" : profile.exitProtocol === "chill_cuddle" ? "🫂" : "🌙"}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-amber-300 uppercase tracking-wide text-[10px] font-mono">
                    {profile.exitProtocol === "fast_encounter"
                      ? (language === "es" ? "Protocolo: Encuentro Puntual" : "Protocol: Fast Encounter")
                      : profile.exitProtocol === "chill_cuddle"
                      ? (language === "es" ? "Protocolo: Ducha y Mimos (30m)" : "Protocol: Shower & Cuddle (30m)")
                      : (language === "es" ? "Protocolo: Quedarse a Dormir" : "Protocol: Sleepover")}
                  </span>
                  <span className="text-[9px] text-neutral-300 leading-tight">
                    {profile.exitProtocol === "fast_encounter"
                      ? (language === "es" ? "Cita directa y eficiente sin sobremesa prolongada" : "Direct & efficient encounter without long stay")
                      : profile.exitProtocol === "chill_cuddle"
                      ? (language === "es" ? "Prioriza relajarse, ducha y afecto post-encuentro" : "Prefers relaxing, shower and post-encounter cuddles")
                      : (language === "es" ? "Abierto a pasar la noche juntos" : "Open to spending the night together")}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Sello de Verificación y Confianza */}
            {profile.verification?.isVerified && (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 font-medium leading-tight">
                {verificationMeta?.icon ? (
                  <span className="flex-shrink-0 scale-125">{verificationMeta.icon}</span>
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[10px]">
                    {verificationMeta?.fullLabel || (t.card.verifiedBadgeText || "Perfil Verificado")}
                  </span>
                  <span className="text-[9px] text-emerald-400/90 font-mono">
                    {profile.verification.badgeLabel || (language === "es" ? "100% Humano Real" : "100% Real Human")}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Membresía VIP */}
            {isPaidMember && (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/30 font-medium leading-tight text-fuchsia-300">
                <span className="text-xs">⚡</span>
                <span className="font-mono text-[9.5px] uppercase font-bold tracking-wider">
                  VESSEL UNLIMITED // MIEMBRO VIP
                </span>
              </div>
            )}

            {/* 4. Indicadores de Convivencia y Seguridad */}
            {profile.isAntiGhost && (
              <div className="flex items-center gap-2 font-medium leading-tight">
                <Ghost className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Anti-Ghost ({profile.respectScore}% Karma)</span>
              </div>
            )}
            {profile.totalEncountersVerified > 0 && (
              <div className="flex items-center gap-2 font-medium leading-tight">
                <CheckCircle2 className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                <span>
                  {profile.totalEncountersVerified}{" "}
                  {profile.totalEncountersVerified === 1
                    ? (t.card.encounterSingle || "Encuentro Verificado")
                    : (t.card.encountersBadge || "Encuentros Verificados")}
                </span>
              </div>
            )}
            {isImmediateHost && (
              <div className="flex items-center gap-2 font-medium leading-tight">
                <span className="text-xs leading-none flex-shrink-0">🏠</span>
                <span>{t.card.immediateHostBadge || "Tiene lugar propio"}</span>
              </div>
            )}
            {profile.privateVault && profile.privateVault.length > 0 && (
              <div className="flex items-center gap-2 font-medium leading-tight">
                <Lock className="w-3.5 h-3.5 text-bloodNeon flex-shrink-0" />
                <span>
                  {profile.privateVault.length}{" "}
                  {profile.privateVault.length === 1
                    ? (t.card.photoInVaultSingle || "foto en Bóveda Privada")
                    : (t.card.photosInVault || "fotos en Bóveda Privada")}
                </span>
              </div>
            )}
            {mutualKinks.length > 0 && (
              <div className="flex items-center gap-2 font-medium leading-tight text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-current flex-shrink-0" />
                <span>{mutualKinks.length} Deseos coincidentes (Kink Matrix)</span>
              </div>
            )}
            {profile.isDuo && (
              <div className="flex items-center gap-2 font-medium leading-tight text-amber-300">
                <span className="text-xs leading-none flex-shrink-0">👥</span>
                <span>Perfil en Modo Dúo de Pareja</span>
              </div>
            )}
            {(profile.audioNote || profile.voiceVibe) && (
              <div className="flex items-center gap-2 font-medium leading-tight text-electricViolet-glow">
                <Volume2 className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                <span>{profile.voiceVibe ? "Voice Vibe de 5 segundos grabado" : (t.card.voiceNoteBadge || "Nota de voz")}</span>
              </div>
            )}
            {profile.isFogMode && (
              <div className="flex items-center gap-2 font-medium leading-tight">
                <CloudFog className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                <span>{t.card.fogBadge || "Modo Niebla"}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popover / Sheet Interno de Telemetría al hacer tap en la píldora superior */}
      {isTelemetryOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsTelemetryOpen(false);
          }}
          className="absolute inset-x-2 top-2 z-30 max-h-[85%] bg-black/95 border border-electricViolet/60 rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto"
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-electricViolet-glow font-mono">
                {t.card.telemetryTitle || "TELEMETRÍA & RADAR"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTelemetryOpen(false);
              }}
              className="text-[8px] font-mono text-neutral-400 hover:text-white flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕ {t.card.capsuleCloseTip || "Cerrar"}
            </button>
          </div>

          {/* Lista de Detalles de Telemetría */}
          <div className="flex flex-col gap-2 text-[10px] text-neutral-200 overflow-y-auto pr-0.5">
            {/* 1. Estado Corporal */}
            <div className="flex items-start gap-2 leading-tight">
              <span
                className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${
                  profile.bodyState === "open"
                    ? "bg-mintNeon shadow-mint-glow animate-pulse"
                    : profile.bodyState === "occupied"
                    ? "bg-bloodNeon shadow-blood-glow"
                    : "bg-electricViolet shadow-violet-soft"
                }`}
              />
              <div className="flex flex-col">
                <span className="font-bold text-white font-mono text-[10px]">
                  {profile.bodyState === "open"
                    ? (t.card.openBadge || "Activo")
                    : profile.bodyState === "occupied"
                    ? (t.card.occupiedBadge || "Ocupado")
                    : (t.card.stealthBadge || "De incógnito")}
                </span>
                <span className="text-[9px] text-neutral-400">
                  {profile.bodyState === "open"
                    ? (t.card.bodyStateOpenDesc || "Activo • Visible en el radar")
                    : profile.bodyState === "occupied"
                    ? (t.card.bodyStateOccupiedDesc || "Ocupado • No disponible ahora")
                    : (t.card.bodyStateDormantDesc || "Modo pasivo / de incógnito")}
                </span>
              </div>
            </div>

            {/* 2. Distancia & Anti-Triangulación S2 */}
            <div className="flex items-start gap-2 leading-tight">
              <span className="text-xs leading-none mt-0.5 flex-shrink-0">📍</span>
              <div className="flex flex-col">
                <span className="font-bold text-white font-mono text-[10px]">
                  {profile.discretizedDistance?.displayLabel ||
                    (profile.distanceMeters < 1000
                      ? `${profile.distanceMeters}m`
                      : `${(profile.distanceMeters / 1000).toFixed(1)}km`)}
                  {" "}• {t.card.telemetryDistance || "Distancia Aproximada"}
                </span>
                <span className="text-[9px] text-neutral-400">
                  {t.card.telemetryDistanceDesc || "Discretización Google S2 (~152m) para proteger tu privacidad y evitar triangulación."}
                </span>
              </div>
            </div>

            {/* 3. Alcance de Señal (Local vs Remoto) */}
            <div className="flex items-start gap-2 leading-tight">
              <span className="text-xs leading-none mt-0.5 flex-shrink-0">
                {isLockedByDistance ? "🛰️" : "📡"}
              </span>
              <div className="flex flex-col">
                <span className={`font-bold font-mono text-[10px] ${isLockedByDistance ? "text-amber-300" : "text-emerald-400"}`}>
                  {isLockedByDistance
                    ? (t.card.telemetryRemoteRange || "Señal Remota (> 1.0 km)")
                    : (t.card.telemetryLocalRange || "Radio Local Táctico (≤ 1.0 km)")}
                </span>
                <span className="text-[9px] text-neutral-400">
                  {isLockedByDistance
                    ? isMutualPulseActive
                      ? (t.card.telemetryMutualVibeActive || "¡Sintonía Mutua activa! Chat directo habilitado.")
                      : (t.card.telemetryRemoteRangeDesc || "Fuera de radio local. Podés enviar pulsos libres o acceder a chat directo con VESSEL UNLIMITED.")
                    : (t.card.telemetryLocalRangeDesc || "Dentro del radio táctico libre. Chat y pulsos 100% habilitados.")}
                </span>
              </div>
            </div>

            {/* 4. Alerta Sentinel (si existe) */}
            {profile.hasSafetyAlert && (
              <div className="flex items-start gap-2 leading-tight text-red-300">
                <span className="text-xs leading-none mt-0.5 flex-shrink-0">⚠️</span>
                <div className="flex flex-col">
                  <span className="font-bold font-mono text-[10px] text-bloodNeon">
                    {t.card.telemetrySafetyAlert || "Alerta Sentinel Preventiva"}
                  </span>
                  <span className="text-[9px] text-neutral-400">
                    {t.card.telemetrySafetyAlertDesc || "Reporte preventivo emitido por la red comunitaria VESSEL."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ProfileCard = React.memo(ProfileCardComponent);
