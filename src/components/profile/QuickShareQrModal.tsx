"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  QrCode,
  X,
  Sun,
  EyeOff,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Clock,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  User,
  Zap,
} from "lucide-react";
import {
  QrExpiryPreset,
  QuickShareQrPayload,
  generateShortPartyCode,
  getExpiryDurationMs,
  buildQuickShareUrl,
  decodeQuickSharePayload,
  generateQrMatrix,
} from "@/lib/qr/tacticalQrEngine";
import { VesselProfile } from "@/types/vessel";
import { TRANSLATIONS } from "@/lib/i18n/translations";

interface QuickShareQrModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * QuickShareQrModal: Pase QR de Contacto Rápido a pantalla completa para fiestas, bares o baños.
 * Diseñado bajo Impeccable UI (Modo Operate) y Ponytail (Cero dependencias externas).
 */
export const QuickShareQrModal: React.FC<QuickShareQrModalProps> = ({
  isOpen: controlledOpen,
  onClose: controlledClose,
}) => {
  const {
    myProfile,
    myFullProfile,
    currentUserUid,
    profiles = [],
    favoriteProfileIds = [],
    toggleFavoriteProfile,
    transmitSignal,
    setSelectedProfile,
    setActiveChatProfileId,
    setActiveView,
    language = "es",
    t,
  } = useVessel();

  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"show" | "receive">("show");
  const [expiryPreset, setExpiryPreset] = useState<QrExpiryPreset>("2h");
  const [isHighBrightness, setIsHighBrightness] = useState(false);
  const [isStealthScreen, setIsStealthScreen] = useState(false);
  const [includeAutoPulse] = useState(true);
  const [nonce, setNonce] = useState<number>(() => Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estado de la pestaña "Recibir / Código" y Deep-Link (?v_qr=...)
  const [inputCodeOrLink, setInputCodeOrLink] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [decodeError, setDecodeError] = useState<
    "empty_input" | "expired_token" | "invalid_token" | null
  >(null);
  const [connectedPayload, setConnectedPayload] = useState<QuickShareQrPayload | null>(null);

  const isModalOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleClose = useCallback(() => {
    setIsHighBrightness(false);
    setDecodeError(null);
    if (controlledClose) {
      controlledClose();
    } else {
      setInternalOpen(false);
    }
  }, [controlledClose]);

  const qrStrings = t?.qrShare || TRANSLATIONS.es.qrShare;

  // Escuchar evento global `vessel:open-qr-share` y parámetro URL `?v_qr=...`
  useEffect(() => {
    const handleOpenEvent = (ev: Event) => {
      const customEv = ev as CustomEvent<{ tab?: "show" | "receive" }>;
      if (customEv.detail?.tab) {
        setActiveTab(customEv.detail.tab);
      } else {
        setActiveTab("show");
      }
      setConnectedPayload(null);
      setDecodeError(null);
      setInternalOpen(true);
      audioEngine.playSubBass(65);
    };

    window.addEventListener("vessel:open-qr-share", handleOpenEvent);

    // Detectar si el usuario abrió la app escaneando un QR (`?v_qr=...`)
    if (typeof window !== "undefined" && window.location.search.includes("v_qr=")) {
      const params = new URLSearchParams(window.location.search);
      const qrToken = params.get("v_qr");
      if (qrToken) {
        const res = decodeQuickSharePayload(qrToken);
        setInternalOpen(true);
        setActiveTab("receive");
        if (res.ok) {
          setConnectedPayload(res.payload);
          if (toggleFavoriteProfile && !favoriteProfileIds.includes(res.payload.uid)) {
            toggleFavoriteProfile(res.payload.uid);
          }
          if (transmitSignal && res.payload.autoPulse) {
            transmitSignal(res.payload.uid);
          }
        } else {
          setDecodeError(res.error);
        }
        // Limpiar query param sin recargar
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }

    return () => {
      window.removeEventListener("vessel:open-qr-share", handleOpenEvent);
    };
  }, [favoriteProfileIds, transmitSignal, toggleFavoriteProfile]);

  // Soporte de tecla Escape (WCAG 2.1 AA)
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, handleClose]);

  const isProfileIncomplete =
    !myProfile?.codename ||
    myProfile.codename.trim().length < 2 ||
    myProfile.codename.trim().toUpperCase() === "ANON";

  // Construcción determinista del payload QR
  const myQrPayload: QuickShareQrPayload = useMemo(() => {
    const iat = nonce;
    const exp = iat + getExpiryDurationMs(expiryPreset);
    const uid = currentUserUid || "local-vessel-user";
    const codename = myProfile?.codename || "VESSEL";
    return {
      v: 1,
      uid,
      codename,
      role: myProfile?.role || undefined,
      age: myProfile?.showAge ? myProfile?.age : undefined,
      verified: Boolean(myProfile?.verification?.isVerified),
      autoPulse: includeAutoPulse,
      partyCode: generateShortPartyCode(`${uid}:${codename}`, nonce),
      iat,
      exp,
    };
  }, [
    nonce,
    expiryPreset,
    currentUserUid,
    myProfile?.codename,
    myProfile?.role,
    myProfile?.showAge,
    myProfile?.age,
    myProfile?.verification?.isVerified,
    includeAutoPulse,
  ]);

  const shareUrl = useMemo(() => buildQuickShareUrl(myQrPayload), [myQrPayload]);
  const qrMatrix = useMemo(() => generateQrMatrix(shareUrl), [shareUrl]);

  const formattedExpiryTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language === "es" ? "es-AR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(myQrPayload.exp));
    } catch {
      return "--:--";
    }
  }, [myQrPayload.exp, language]);

  const showTemporaryToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyLink = async () => {
    audioEngine.playPulse();
    const textToCopy = `${shareUrl} (${myQrPayload.partyCode})`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      showTemporaryToast(qrStrings.linkCopiedToast);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      showTemporaryToast(qrStrings.linkCopiedToast);
    }
  };

  const handleNativeShare = async () => {
    audioEngine.playSubBass(65);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `VESSEL · @${myQrPayload.codename}`,
          text: `${qrStrings.shortCodeLabel}: ${myQrPayload.partyCode}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Si el usuario cancela el sheet nativo, copiamos al portapapeles como fallback
      }
    }
    await handleCopyLink();
  };

  const handleRegenerateQr = () => {
    audioEngine.playSubBass(75);
    setNonce(Date.now());
    showTemporaryToast(qrStrings.regeneratedToast);
  };

  const handleSimulateScan = () => {
    audioEngine.playSignalSent();
    setActiveTab("receive");
    setInputCodeOrLink(myQrPayload.partyCode);
    setConnectedPayload(myQrPayload);
    setDecodeError(null);
  };

  const handleConnectInput = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playPulse();
    setDecodeError(null);
    setConnectedPayload(null);

    if (!inputCodeOrLink.trim()) {
      setDecodeError("empty_input");
      audioEngine.playError();
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      const res = decodeQuickSharePayload(inputCodeOrLink);
      setIsConnecting(false);
      if (!res.ok) {
        setDecodeError(res.error);
        audioEngine.playError();
        return;
      }

      audioEngine.playSignalSent();
      setConnectedPayload(res.payload);
      if (!favoriteProfileIds.includes(res.payload.uid)) {
        toggleFavoriteProfile(res.payload.uid);
      }
      if (res.payload.autoPulse) {
        transmitSignal(res.payload.uid);
      }
    }, 220);
  };

  const resolveProfileFromPayload = (payload: QuickShareQrPayload): VesselProfile => {
    const existing = profiles.find((p) => p.id === payload.uid);
    if (existing) return existing;
    return {
      ...myFullProfile,
      id: payload.uid,
      codename: payload.codename,
      age: payload.age || 28,
      showAge: Boolean(payload.age),
      role: (payload.role as VesselProfile["role"]) || "Versátil",
      distanceMeters: 5,
      bodyState: "open",
      verification: {
        ...myFullProfile.verification,
        isVerified: Boolean(payload.verified),
        verifiedAt: "2026-01-01",
      },
      avatarUrl:
        payload.avatarUrl ||
        myProfile.avatarUrl ||
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%2318181b'/></svg>",
      respectScore: 98,
    };
  };

  if (!isModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-share-qr-title"
      className={`fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 transition-colors duration-200 select-none overflow-y-auto ${
        isHighBrightness
          ? "bg-white text-black"
          : "bg-black/90 backdrop-blur-xl text-white"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border p-4 sm:p-6 space-y-4 transition-all shadow-2xl relative my-auto ${
          isHighBrightness
            ? "bg-white border-neutral-300 text-neutral-900 shadow-[0_0_80px_rgba(255,255,255,1)]"
            : "bg-obsidian-surface/95 border-electricViolet/40 text-white shadow-[0_12px_50px_rgba(139,92,246,0.25)]"
        }`}
      >
        {/* Cabecera del Modal */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2.5 rounded-2xl border flex-shrink-0 ${
                isHighBrightness
                  ? "bg-electricViolet text-white border-electricViolet"
                  : "bg-electricViolet/15 border-electricViolet/40 text-electricViolet-glow"
              }`}
            >
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="quick-share-qr-title"
                className="text-sm sm:text-base font-mono font-black uppercase tracking-wider truncate"
              >
                {qrStrings.modalTitle}
              </h2>
              <p
                className={`text-[11px] leading-snug line-clamp-2 ${
                  isHighBrightness ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                {qrStrings.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={t.common.close}
            className={`min-w-[44px] min-h-[44px] rounded-2xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              isHighBrightness
                ? "bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200"
                : "bg-white/10 border-white/15 text-neutral-300 hover:text-white hover:bg-white/20"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Selector de Pestañas (Mostrar Mi QR vs Recibir / Código) */}
        <div
          role="tablist"
          aria-label={qrStrings.modalTitle}
          className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border ${
            isHighBrightness
              ? "bg-neutral-100 border-neutral-300"
              : "bg-black/60 border-white/10"
          }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "show"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("show");
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "show"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : isHighBrightness
                ? "text-neutral-600 hover:text-black"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{qrStrings.tabShowQr}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "receive"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("receive");
            }}
            className={`min-h-[44px] px-3 py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "receive"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : isHighBrightness
                ? "text-neutral-600 hover:text-black"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{qrStrings.tabScanOrCode}</span>
          </button>
        </div>

        {/* Notificación Optimista (Toast) */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-fade-in"
          >
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 1: MOSTRAR MI QR GIGANTE DE FIESTA
            ========================================================= */}
        {activeTab === "show" && (
          <>
            {isProfileIncomplete ? (
              /* EMPTY STATE: Alias no configurado */
              <div className="p-6 rounded-3xl bg-black/50 border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-electricViolet/20 border border-electricViolet/40 flex items-center justify-center mx-auto text-electricViolet-glow">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-mono font-black uppercase text-white">
                  {qrStrings.emptyProfileTitle}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {qrStrings.emptyProfileDesc}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setActiveView("account");
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("vessel:edit-codename"));
                    }, 120);
                  }}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  {qrStrings.emptyProfileCta}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Tarjeta Óptica Central del Gran QR */}
                <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white text-neutral-950 border-4 border-electricViolet shadow-[0_0_45px_rgba(139,92,246,0.35)] relative">
                  {/* Cabecera de Identidad sobre el QR */}
                  <div className="w-full flex items-center justify-between gap-2 pb-3 mb-2 border-b border-neutral-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-base sm:text-lg font-black tracking-tight text-neutral-950 truncate">
                        @{myQrPayload.codename}
                      </span>
                      {myQrPayload.verified && (
                        <ShieldCheck
                          className="w-4 h-4 text-electricViolet flex-shrink-0"
                          aria-label="Verificado"
                        />
                      )}
                    </div>

                    {!isStealthScreen && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {myQrPayload.age && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold">
                            {myQrPayload.age}
                          </span>
                        )}
                        {myQrPayload.role && (
                          <span className="px-2 py-0.5 rounded-full bg-electricViolet/15 text-electricViolet font-mono text-[10px] font-black uppercase border border-electricViolet/30">
                            {myQrPayload.role}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SVG QR GIGANTE (Alto contraste #09090B sobre #FFFFFF con Quiet Zone de 4 módulos) */}
                  <div className="w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center bg-white p-1">
                    <svg
                      viewBox="-2 -2 33 33"
                      className="w-full h-full"
                      role="img"
                      aria-label={`Código QR de contacto rápido para @${myQrPayload.codename}`}
                    >
                      <rect x="-2" y="-2" width="33" height="33" fill="#FFFFFF" />
                      {qrMatrix.map((row, rIdx) =>
                        row.map((cell, cIdx) => {
                          if (!cell) return null;
                          const isFinderCorner =
                            (rIdx < 7 && cIdx < 7) ||
                            (rIdx < 7 && cIdx >= 22) ||
                            (rIdx >= 22 && cIdx < 7);
                          return (
                            <rect
                              key={`${rIdx}-${cIdx}`}
                              x={cIdx}
                              y={rIdx}
                              width={0.94}
                              height={0.94}
                              rx={isFinderCorner ? 0.22 : 0.18}
                              fill={isFinderCorner ? "#6D28D9" : "#09090B"}
                            />
                          );
                        })
                      )}
                      {/* Emblema Central VESSEL (Zona 5x5 reservada) */}
                      <rect
                        x="12.1"
                        y="12.1"
                        width="4.8"
                        height="4.8"
                        rx="1"
                        fill="#6D28D9"
                      />
                      <text
                        x="14.5"
                        y="15.4"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="2.8"
                        fontWeight="900"
                        fontFamily="monospace"
                      >
                        V
                      </text>
                    </svg>
                  </div>

                  {/* Código Corto de Fiesta (Fallback de 6 caracteres + Expiración) */}
                  <div className="w-full pt-3 mt-2 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                        {qrStrings.shortCodeLabel}
                      </span>
                      <span
                        data-testid="qr-party-code"
                        className="font-mono text-base sm:text-lg font-black tracking-widest text-electricViolet"
                      >
                        {myQrPayload.partyCode}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-electricViolet" />
                        <span>{qrStrings.expiresInPrefix}</span>
                      </span>
                      <span className="font-mono text-xs font-black text-neutral-900">
                        {formattedExpiryTime} hs
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-[11px] text-center font-mono ${
                    isHighBrightness ? "text-neutral-700" : "text-neutral-400"
                  }`}
                >
                  {qrStrings.scanInstruction}
                </p>

                {/* Selector de Validez Temporal (15m / 2h / 24h) */}
                <div className="space-y-1.5">
                  <label
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                      isHighBrightness ? "text-neutral-700" : "text-neutral-400"
                    }`}
                  >
                    {qrStrings.expiryLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "15m", label: qrStrings.expiry15m },
                        { id: "2h", label: qrStrings.expiry2h },
                        { id: "24h", label: qrStrings.expiry24h },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setExpiryPreset(opt.id);
                          setNonce(Date.now());
                        }}
                        className={`min-h-[44px] px-2 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                          expiryPreset === opt.id
                            ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow font-black"
                            : isHighBrightness
                            ? "bg-neutral-100 border-neutral-300 text-neutral-700"
                            : "bg-black/50 border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switches Rápidos Táctiles (Brillo Óptico 100% + Ocultar Datos en Pantalla) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isHighBrightness}
                    aria-label={qrStrings.highBrightnessLabel}
                    onClick={() => {
                      audioEngine.playSubBass(80);
                      setIsHighBrightness((prev) => !prev);
                    }}
                    className={`min-h-[44px] p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      isHighBrightness
                        ? "bg-amber-400/20 border-amber-500 text-neutral-900 font-bold"
                        : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Sun
                        className={`w-4 h-4 flex-shrink-0 ${
                          isHighBrightness ? "text-amber-600" : "text-amber-400"
                        }`}
                      />
                      <span className="text-[11px] font-mono font-bold truncate">
                        {qrStrings.highBrightnessLabel}
                      </span>
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isHighBrightness ? "bg-amber-600" : "bg-neutral-600"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isStealthScreen}
                    aria-label={qrStrings.stealthScreenLabel}
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsStealthScreen((prev) => !prev);
                    }}
                    className={`min-h-[44px] p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      isStealthScreen
                        ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow font-bold"
                        : isHighBrightness
                        ? "bg-neutral-100 border-neutral-300 text-neutral-800"
                        : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <EyeOff className="w-4 h-4 flex-shrink-0 text-electricViolet-glow" />
                      <span className="text-[11px] font-mono font-bold truncate">
                        {qrStrings.stealthScreenLabel}
                      </span>
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isStealthScreen ? "bg-electricViolet" : "bg-neutral-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Botonera Principal de Acciones (44px Touch Targets) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`min-h-[44px] px-3 py-2 rounded-2xl border font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isHighBrightness
                        ? "bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200"
                        : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                    }`}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="truncate">{qrStrings.copyLinkBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateQr}
                    className={`min-h-[44px] px-3 py-2 rounded-2xl border font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isHighBrightness
                        ? "bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200"
                        : "bg-white/10 border-white/15 text-white hover:bg-white/15"
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="truncate">{qrStrings.regenerateBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="min-h-[44px] px-3 py-2 rounded-2xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black flex items-center justify-center gap-1.5 shadow-violet-soft transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="truncate">{qrStrings.nativeShareBtn}</span>
                  </button>
                </div>

                {/* Botón de Previsualización de Escaneo */}
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl border font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isHighBrightness
                      ? "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                      : "border-electricViolet/30 text-electricViolet-glow hover:bg-electricViolet/10"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{qrStrings.simulateScanBtn}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* =========================================================
            PESTAÑA 2: RECIBIR / INGRESAR CÓDIGO DE FIESTA O ENLACE QR
            ========================================================= */}
        {activeTab === "receive" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-mono font-black uppercase">
                {qrStrings.receiveTitle}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isHighBrightness ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                {qrStrings.receiveSubtitle}
              </p>
            </div>

            <form onSubmit={handleConnectInput} className="space-y-3">
              <div>
                <label
                  htmlFor="qr-party-code-input"
                  className="text-[11px] font-mono font-bold uppercase tracking-wider block mb-1.5"
                >
                  {qrStrings.codeInputLabel}
                </label>
                <input
                  id="qr-party-code-input"
                  type="text"
                  value={inputCodeOrLink}
                  onChange={(e) => {
                    setInputCodeOrLink(e.target.value);
                    if (decodeError) setDecodeError(null);
                  }}
                  placeholder={qrStrings.codeInputPlaceholder}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl border font-mono text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-electricViolet ${
                    isHighBrightness
                      ? "bg-neutral-100 border-neutral-300 text-black placeholder:text-neutral-400"
                      : "bg-black/60 border-white/15 text-white placeholder:text-neutral-500"
                  }`}
                />
              </div>

              {/* Error State Humanizado */}
              {decodeError && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-bloodNeon/15 border border-bloodNeon/40 text-bloodNeon text-xs font-mono flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {decodeError === "empty_input"
                      ? qrStrings.errorEmptyInput
                      : decodeError === "expired_token"
                      ? qrStrings.errorExpiredToken
                      : qrStrings.errorInvalidToken}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-electricViolet hover:bg-electricViolet-glow disabled:opacity-50 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-violet-soft transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isConnecting ? qrStrings.connectingState : qrStrings.connectNowBtn}
                </span>
              </button>
            </form>

            {/* Tarjeta de Éxito al Capturar Contacto por QR */}
            {connectedPayload && (
              <div
                data-testid="qr-connected-card"
                className="p-4 rounded-3xl bg-electricViolet/15 border-2 border-electricViolet space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-xs font-black uppercase text-emerald-300">
                      {qrStrings.connectionSuccessTitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/50 border border-white/10 font-mono text-[10px] font-bold text-electricViolet-glow">
                    {connectedPayload.partyCode}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-black/40 p-3 rounded-2xl border border-white/10">
                  <div>
                    <div className="font-mono text-base font-black text-white flex items-center gap-1.5">
                      <span>@{connectedPayload.codename}</span>
                      {connectedPayload.verified && (
                        <ShieldCheck className="w-4 h-4 text-electricViolet-glow" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      {qrStrings.connectionSuccessDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetProfile = resolveProfileFromPayload(connectedPayload);
                      handleClose();
                      setSelectedProfile(targetProfile);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>{qrStrings.viewConnectedProfileCta}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setActiveChatProfileId(connectedPayload.uid);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black flex items-center justify-center gap-1.5 shadow-violet-soft cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{qrStrings.openConnectedChatCta}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
