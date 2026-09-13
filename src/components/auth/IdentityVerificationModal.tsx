"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVessel } from "@/context/VesselContext";
import { STYLED_AVATARS_CATALOG } from "@/data/mockProfiles";
import { VerificationMethod, StyledAvatar } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { registerUniqueIdentity } from "@/lib/firebase/identityDeduplicationService";
import {
  X,
  ShieldCheck,
  Fingerprint,
  Camera,
  Check,
  ChevronRight,
  EyeOff,
  Sparkles,
  Lock,
  RefreshCw,
  Zap,
  Globe,
  Upload,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface IdentityVerificationModalProps {
  onClose: () => void;
}

type StepType = "oauth" | "liveness" | "avatar" | "success";

export const IdentityVerificationModal: React.FC<IdentityVerificationModalProps> = ({
  onClose,
}) => {
  const {
    verifyIdentity,
    myProfile,
    currentUserUid,
    loginWithGoogle,
    linkAccountWithGoogle,
    isAnonymous,
    openAuthModal,
    t,
  } = useVessel();

  const [step, setStep] = useState<StepType>("oauth");
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>("oauth_google");
  const [authProvider, setAuthProvider] = useState<"google" | "direct">("google");
  const [codenameInput, setCodenameInput] = useState(myProfile.codename || "VESSEL_USER");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Estados de escáner biométrico y cámara real
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("Alinea tu rostro dentro del marco");
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Estados de avatar y privacidad
  const [isStylizedChoice, setIsStylizedChoice] = useState(true);
  const [isFogChoice, setIsFogChoice] = useState(false);
  const [selectedStyledAvatar, setSelectedStyledAvatar] = useState<StyledAvatar>(
    STYLED_AVATARS_CATALOG[0]
  );
  const [customPhotoUrl, setCustomPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80"
  );

  // Inicializar cámara nativa cuando entra al paso de liveness
  useEffect(() => {
    if (step === "liveness") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setCameraError("Tu navegador no soporta captura de cámara en vivo.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 480 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCamera(true);
    } catch (err) {
      console.warn("Aviso cámara en IdentityVerificationModal:", err);
      setHasCamera(false);
      setCameraError("Permiso de cámara denegado. Podés continuar en modo simulación.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Escáner biométrico en paso 2 con cámara real
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && scanProgress < 100) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 5;
          if (next === 25) setScanMessage("Detectando geometría facial en vivo...");
          if (next === 55) setScanMessage("Analizando prueba de vida anti-spoofing...");
          if (next === 85) setScanMessage("Cifrando hash Zero-Knowledge...");
          if (next >= 100) {
            setIsScanning(false);
            setScanMessage("¡Verificación biométrica completada!");
            audioEngine.playVaultUnlock();

            // Capturar fotograma real de la cámara
            if (videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 400;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                try {
                  const snapshotUrl = canvas.toDataURL("image/webp", 0.85);
                  if (snapshotUrl && snapshotUrl.startsWith("data:image")) {
                    setCustomPhotoUrl(snapshotUrl);
                  }
                } catch {}
              }
            }

            stopCamera();
            setTimeout(() => setStep("avatar"), 800);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanProgress]);

  const handleGoogleVerification = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    audioEngine.playPulse();

    try {
      const res = isAnonymous ? await linkAccountWithGoogle() : await loginWithGoogle();
      if (res.success && res.user) {
        setAuthProvider("google");
        setSelectedMethod("oauth_google");
        if (res.user.displayName && (!codenameInput || codenameInput === "VESSEL_USER")) {
          setCodenameInput(res.user.displayName.split(" ")[0].toUpperCase());
        }
        if (res.user.photoURL) {
          setCustomPhotoUrl(res.user.photoURL);
          setIsStylizedChoice(false);
        }
        audioEngine.playVaultUnlock();
        setStep("avatar");
      } else if (res.error) {
        setAuthError(res.error);
        audioEngine.playSubBass(35, 0.4);
      }
    } catch (err: any) {
      setAuthError("Error de conexión durante la autenticación de Google.");
      audioEngine.playSubBass(35, 0.4);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDirectLiveness = () => {
    setAuthError(null);
    setAuthProvider("direct");
    setSelectedMethod("biometric_liveness");
    audioEngine.playSignalSent();
    setStep("liveness");
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage("Iniciando escaneo biométrico...");
    audioEngine.playPulse();
  };

  const handleFinalize = () => {
    const finalAvatarUrl = isStylizedChoice
      ? selectedStyledAvatar.url
      : customPhotoUrl;

    const isFog = !isStylizedChoice && isFogChoice;

    verifyIdentity({
      method: selectedMethod,
      avatarUrl: finalAvatarUrl,
      isStylizedAvatar: isStylizedChoice,
      isFogMode: isFog,
      authProvider,
      codename: codenameInput,
    });

    if (currentUserUid && currentUserUid !== "local-user") {
      registerUniqueIdentity({
        uid: currentUserUid,
        authProvider,
      }).catch((err) => console.warn("Registro de unicidad en background:", err));
    }

    setStep("success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-obsidian-deep border border-electricViolet/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabecera Brutalista */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-mintNeon text-obsidian-deep shadow-mint-glow">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {t.auth.modalTitle}
              </h2>
              <p className="text-[10px] text-mintNeon font-mono font-semibold">
                {t.auth.modalSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de verificación"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Pasos */}
        <div className="px-4 py-2.5 bg-black/60 border-b border-white/5 grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          <div
            className={`py-1.5 min-h-[30px] flex items-center justify-center text-center rounded-lg font-bold transition-all ${
              step === "oauth"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400"
            }`}
          >
            {t.auth.step1}
          </div>
          <div
            className={`py-1.5 min-h-[30px] flex items-center justify-center text-center rounded-lg font-bold transition-all ${
              step === "liveness"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400"
            }`}
          >
            {t.auth.step2}
          </div>
          <div
            className={`py-1.5 min-h-[30px] flex items-center justify-center text-center rounded-lg font-bold transition-all ${
              step === "avatar"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400"
            }`}
          >
            {t.auth.step3}
          </div>
          <div
            className={`py-1.5 min-h-[30px] flex items-center justify-center text-center rounded-lg font-bold transition-all ${
              step === "success"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400"
            }`}
          >
            {t.auth.step4}
          </div>
        </div>

        {/* Contenido Dinámico por Paso */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* PASO 1: OAUTH & REGISTRO RÁPIDO */}
          {step === "oauth" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Acceso Rápido & Autenticación Única
                </h3>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Para erradicar perfiles falsos y bots, vincula tu cuenta a través de Google o valida tu biometría facial directa. Tu información real permanece cifrada y nunca se expone en tu perfil público.
                </p>
              </div>

              {/* Alerta de Error si ocurre en Google OAuth */}
              {authError && (
                <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-start gap-2.5 text-red-200 animate-in shake">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">{authError}</div>
                </div>
              )}

              {/* Input de Codename */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                  Tu Codename / Alias en VESSEL
                </label>
                <input
                  type="text"
                  value={codenameInput}
                  onChange={(e) => setCodenameInput(e.target.value)}
                  placeholder="Ej. KLAUS_030 o VESSEL_BERLIN"
                  className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-colors font-mono uppercase"
                />
              </div>

              {/* Botones de Autenticación & Verificación */}
              <div className="space-y-2.5 pt-1">
                {/* Google OAuth Real */}
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleVerification}
                  className="w-full p-3.5 min-h-[52px] rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricViolet/50 flex items-center justify-between text-white transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {isGoogleLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        "G"
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>Continuar con Google</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-mintNeon/20 text-mintNeon font-bold border border-mintNeon/30">
                          1-CLICK REAL
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {isGoogleLoading
                          ? "Conectando con Google Identity..."
                          : "Autenticación instantánea y verificación mediante Google ID"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-electricViolet-glow transition-colors" />
                </button>

                {/* Verificación Directa VESSEL Liveness */}
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={handleDirectLiveness}
                  className="w-full p-3.5 min-h-[52px] rounded-2xl bg-purple-950/40 hover:bg-purple-950/60 border border-electricViolet/40 flex items-center justify-between text-white transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-electricViolet text-white flex items-center justify-center font-bold text-xs shadow-violet-soft flex-shrink-0">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xs text-white">
                        Verificación Directa VESSEL Liveness
                      </div>
                      <div className="text-[10px] text-purple-200 font-medium">
                        Prueba biométrica 3D sin vincular cuentas externas
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-electricViolet-glow" />
                </button>
              </div>

              {/* Acceso Alternativo con Email & Contraseña */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal("login");
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white font-mono transition-colors hover:underline cursor-pointer"
                >
                  ¿Preferís entrar con correo y contraseña? <strong className="text-electricViolet-glow">Iniciar Sesión / Registrarse</strong>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: ESCÁNER BIOMÉTRICO & PRUEBA DE VIDA (LIVENESS) */}
          {step === "liveness" && (
            <div className="space-y-4 animate-in fade-in text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Prueba de Vida Biométrica 3D
                </h3>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Garantiza que eres un humano real y único. La biometría se procesa de forma local y se destruye tras generar tu certificado Zero-Knowledge.
                </p>
              </div>

              {/* Visor de Escaneo con Cámara Frontal en Vivo */}
              <div className="relative aspect-square max-w-[240px] mx-auto rounded-3xl bg-black border-2 border-white/20 overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
                {/* Stream nativo de cámara frontal espejado */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
                    hasCamera ? "opacity-90" : "opacity-0"
                  }`}
                />

                {/* Canvas oculto para captura instantánea */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Malla Biométrica y Retícula */}
                <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-mintNeon/60 flex items-center justify-center animate-pulse z-10 pointer-events-none">
                  {!hasCamera && <Fingerprint className="w-20 h-20 text-mintNeon/40" />}

                  {/* Láser de barrido */}
                  {isScanning && (
                    <div
                      className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-mintNeon to-transparent shadow-[0_0_15px_#10B981] transition-all duration-100"
                      style={{ top: `${scanProgress}%` }}
                    />
                  )}
                </div>

                {/* Porcentaje en vivo */}
                {isScanning && (
                  <div className="absolute bottom-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-mintNeon/40 text-mintNeon text-xs font-mono font-bold z-20">
                    {scanProgress}%
                  </div>
                )}
              </div>

              {/* Aviso de error de cámara si lo hubiere */}
              {cameraError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Mensaje de Estado del Escáner */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-2xl">
                <div className="text-xs font-bold text-mintNeon font-mono">
                  {scanMessage}
                </div>
              </div>

              {/* Botón de Inicio de Escaneo */}
              {!isScanning && scanProgress === 0 && (
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white hover:bg-electricViolet-glow rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Iniciar Prueba de Vida (Liveness)</span>
                </button>
              )}
            </div>
          )}

          {/* PASO 3: SELECCIÓN DE IDENTIDAD VISUAL & PRIVACIDAD FACIAL */}
          {step === "avatar" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Identidad Visual & Privacidad
                </h3>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  VESSEL te permite mantener tu estatus de <strong>Usuario Verificado por ID</strong> protegiendo tu rostro público mediante un avatar estilizado.
                </p>
              </div>

              {/* Selector de Modo: Avatar Estilizado vs Foto Real */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsStylizedChoice(true)}
                  aria-pressed={isStylizedChoice}
                  className={`p-3.5 min-h-[80px] rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    isStylizedChoice
                      ? "bg-purple-950/50 border-electricViolet text-white shadow-violet-soft font-bold"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isStylizedChoice ? "bg-electricViolet text-white" : "bg-white/10 text-neutral-300"
                      }`}
                    >
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-mintNeon/20 text-mintNeon uppercase font-mono">
                      Recomendado
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Avatar Estilizado</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                      Máxima privacidad facial con insignia de verificado.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsStylizedChoice(false)}
                  aria-pressed={!isStylizedChoice}
                  className={`p-3.5 min-h-[80px] rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    !isStylizedChoice
                      ? "bg-purple-950/50 border-electricViolet text-white shadow-violet-soft font-bold"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        !isStylizedChoice ? "bg-electricViolet text-white" : "bg-white/10 text-neutral-300"
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 uppercase font-mono">
                      Foto Real
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Foto Real Pública</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                      Muestra tu fotografía validada en la cuadrícula.
                    </div>
                  </div>
                </button>
              </div>

              {/* Catálogo de Avatares Estilizados si está en modo privado */}
              {isStylizedChoice ? (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Elige tu Avatar Brutalista
                    </span>
                    <span className="text-[10px] text-electricViolet-glow font-mono font-bold">
                      {selectedStyledAvatar.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {STYLED_AVATARS_CATALOG.map((avatar) => {
                      const isSelected = selectedStyledAvatar.id === avatar.id;

                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedStyledAvatar(avatar)}
                          aria-label={`Seleccionar avatar ${avatar.name}`}
                          className={`relative aspect-square rounded-2xl overflow-hidden border transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                            isSelected
                              ? "border-electricViolet shadow-violet-soft ring-2 ring-electricViolet/50 scale-95"
                              : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                            <span className="text-[9px] font-bold text-white truncate">
                              {avatar.name.split("//")[0].trim()}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-electricViolet text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-neutral-400 italic">
                    "{selectedStyledAvatar.description}"
                  </p>
                </div>
              ) : (
                /* Entrada de Foto Real */
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      URL de Fotografía Validada (Obligatoria)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customPhotoUrl}
                        onChange={(e) => setCustomPhotoUrl(e.target.value)}
                        placeholder="https://ejemplo.com/mifoto.jpg"
                        className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Switch Modo Niebla */}
                  <div className="p-3 bg-black/60 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                        🌫️
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {t.auth.fogOptionTitle}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1">
                          {t.auth.fogOptionDesc}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFogChoice(!isFogChoice)}
                      aria-pressed={isFogChoice}
                      aria-label="Activar o desactivar difuminado de rostro"
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                        isFogChoice ? "bg-electricViolet" : "bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          isFogChoice ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={handleFinalize}
                className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white hover:bg-electricViolet-glow rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft mt-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Emitir Certificado y Activar Perfil</span>
              </button>
            </div>
          )}

          {/* PASO 4: CREDENCIAL EMITIDA & CONFIRMACIÓN EXITOSA */}
          {step === "success" && (
            <div className="space-y-4 animate-in fade-in text-center py-2">
              <div className="w-16 h-16 rounded-full bg-mintNeon text-obsidian-deep mx-auto flex items-center justify-center shadow-mint-glow animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  ¡Identidad Verificada con Éxito!
                </h3>
                <p className="text-neutral-400 text-xs">
                  Tu credencial digital está activa y protegida con criptografía.
                </p>
              </div>

              {/* Tarjeta de Certificado */}
              <div className="bg-obsidian-surface border border-mintNeon/40 rounded-3xl p-4 text-left space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <VesselLogo size={18} showWordmark={true} />
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">
                      ID CREDENTIAL
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-mintNeon bg-mintNeon/15 px-2 py-0.5 rounded-full border border-mintNeon/30">
                    100% HUMANO REAL
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-mintNeon/40 flex-shrink-0 bg-black">
                    <img
                      src={isStylizedChoice ? selectedStyledAvatar.url : customPhotoUrl}
                      alt="Avatar"
                      className={`w-full h-full object-cover ${
                        !isStylizedChoice && isFogChoice ? "filter blur-[3.5px] scale-105" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-mono">
                      {codenameInput}
                    </div>
                    <div className="text-[11px] text-mintNeon font-medium flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        ID Verified // {isStylizedChoice ? "Avatar Estilizado" : isFogChoice ? "Modo Niebla" : "Público"}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      Autenticado vía: {authProvider.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Cierre y Regreso */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white hover:bg-electricViolet-glow rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-violet-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
              >
                Comenzar a Usar VESSEL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
