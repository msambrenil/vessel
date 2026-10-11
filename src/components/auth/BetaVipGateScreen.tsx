"use client";

import React, { useState, useEffect } from "react";
import { useSettings, useAuth } from "@/context/VesselContext";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  validateAndRedeemVipCode,
  getLocalVipVerification,
  getPendingUrlVipCode,
} from "@/lib/firebase/inviteService";
import { RoleType } from "@/types/vessel";
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
} from "lucide-react";

interface BetaVipGateScreenProps {
  onVipUnlocked: () => void;
}

const QUICK_ROLES: { id: RoleType; labelEs: string; labelEn: string }[] = [
  { id: "Top", labelEs: "Activo", labelEn: "Top" },
  { id: "Versatile", labelEs: "Versátil", labelEn: "Versatile" },
  { id: "Bottom", labelEs: "Pasivo", labelEn: "Bottom" },
  { id: "Side", labelEs: "Side", labelEn: "Side" },
];

export const BetaVipGateScreen: React.FC<BetaVipGateScreenProps> = ({ onVipUnlocked }) => {
  const { language, setAppMode } = useSettings();
  const {
    isAuthenticated,
    authUser,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
  } = useAuth();

  const isEs = language === "es";

  const [vipCodeInput, setVipCodeInput] = useState<string>("");
  const [isVipValid, setIsVipValid] = useState<boolean>(false);
  const [validatedCode, setValidatedCode] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado de autenticación (Paso 2)
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [codename, setCodename] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("Versatile");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Detectar código VIP en URL (?vip=CODIGO) o verificación previa en localStorage
  useEffect(() => {
    const localCheck = getLocalVipVerification(authUser?.uid);
    if (localCheck.verified && localCheck.code) {
      setIsVipValid(true);
      setValidatedCode(localCheck.code);
      setVipCodeInput(localCheck.code);
      if (isAuthenticated) {
        onVipUnlocked();
      }
      return;
    }

    const pendingCode = getPendingUrlVipCode();
    if (pendingCode) {
      setVipCodeInput(pendingCode);
      handleValidateCode(pendingCode);
    }
  }, [authUser, isAuthenticated]);

  const handleValidateCode = async (overrideCode?: string) => {
    const targetCode = (overrideCode ?? vipCodeInput).trim().toUpperCase();
    setErrorMsg(null);
    setIsValidating(true);
    audioEngine.playPulse();

    const res = await validateAndRedeemVipCode(targetCode, authUser?.uid);
    setIsValidating(false);

    if (!res.isValid) {
      setErrorMsg(res.error || (isEs ? "Código VIP inválido." : "Invalid VIP Code."));
      return;
    }

    setIsVipValid(true);
    setValidatedCode(res.code);
    audioEngine.playNudgeReceived();

    if (isAuthenticated && authUser) {
      onVipUnlocked();
    }
  };

  const handleGoogleAccess = async () => {
    setErrorMsg(null);
    setIsSubmittingAuth(true);
    audioEngine.playPulse();

    const res = await loginWithGoogle();
    if (res.success && res.user) {
      await validateAndRedeemVipCode(validatedCode || vipCodeInput, res.user.uid);
      setIsSubmittingAuth(false);
      onVipUnlocked();
    } else {
      setIsSubmittingAuth(false);
      setErrorMsg(res.error || (isEs ? "No se pudo iniciar con Google." : "Google sign-in failed."));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(isEs ? "Completá tu email y contraseña." : "Please enter your email and password.");
      return;
    }

    setIsSubmittingAuth(true);
    audioEngine.playPulse();

    if (authTab === "register") {
      const alias = codename.trim().toUpperCase() || email.split("@")[0].toUpperCase();
      const res = await registerWithEmail(email, password, alias, selectedRole);
      if (res.success && res.user) {
        await validateAndRedeemVipCode(validatedCode || vipCodeInput, res.user.uid);
        setIsSubmittingAuth(false);
        onVipUnlocked();
      } else {
        setIsSubmittingAuth(false);
        setErrorMsg(res.error || (isEs ? "No se pudo crear la cuenta." : "Registration failed."));
      }
    } else {
      const res = await loginWithEmail(email, password);
      if (res.success && res.user) {
        await validateAndRedeemVipCode(validatedCode || vipCodeInput, res.user.uid);
        setIsSubmittingAuth(false);
        onVipUnlocked();
      } else {
        setIsSubmittingAuth(false);
        setErrorMsg(res.error || (isEs ? "Credenciales incorrectas." : "Invalid credentials."));
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-obsidian text-white flex flex-col justify-between px-5 py-8 relative overflow-hidden">
      {/* Resplandor Ambiental Subterráneo */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,43,226,0.16),transparent_65%)]" />

      {/* Cabecera de Marca */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <VesselLogo className="w-8 h-8 text-electricViolet" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-[0.25em] text-white">VESSEL</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-electricViolet/20 text-electricViolet border border-electricViolet/40">
                CLOSED BETA
              </span>
            </div>
            <p className="text-[10px] font-mono text-white/45 uppercase tracking-wider">
              {isEs ? "Red Privada · Solo Invitados VIP" : "Private Network · VIP Invite Only"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            setAppMode("test");
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/50 hover:text-white border border-white/15 hover:border-white/35 transition-colors"
          title={isEs ? "Probar entorno de demostración local" : "Switch to local sandbox demo"}
        >
          <FlaskConical className="w-3.5 h-3.5 text-electricViolet" />
          <span>Sandbox</span>
        </button>
      </header>

      {/* Contenedor Central */}
      <main className="w-full max-w-md mx-auto my-auto py-6 relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-electricViolet">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isEs ? "Protocolo de Admisión Asignada" : "Assigned Admission Protocol"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none">
            {!isVipValid
              ? isEs
                ? "Ingresá tu Pase VIP"
                : "Enter Your VIP Pass"
              : isEs
              ? "Pase VIP Confirmado"
              : "VIP Pass Confirmed"}
          </h1>
          <p className="text-xs text-white/60 leading-relaxed">
            {!isVipValid
              ? isEs
                ? "El radar real de VESSEL está restringido a miembros asignados. Ingresá el código VIP que recibiste para desbloquear tu nodo."
                : "VESSEL real radar is restricted to assigned members. Enter your assigned VIP code to unlock access."
              : isEs
              ? `Código ${validatedCode} verificado. Creá tu alias corporal o iniciá sesión para aparecer en el radar en vivo.`
              : `Code ${validatedCode} verified. Create your codename or sign in to enter the live radar.`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-bloodNeon/10 border border-bloodNeon/40 flex items-start gap-2.5 text-xs text-bloodNeon">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PASO 1: VALIDACIÓN DE CÓDIGO VIP */}
        {!isVipValid ? (
          <div className="p-5 bg-white/[0.02] border border-white/15 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/60">
                {isEs ? "Código de Invitación VIP" : "VIP Invitation Code"}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-electricViolet absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vipCodeInput}
                  onChange={(e) => setVipCodeInput(e.target.value.toUpperCase())}
                  placeholder="VESSEL-VIP"
                  className="w-full h-12 pl-10 pr-4 bg-black/70 border border-white/20 focus:border-electricViolet text-sm font-mono uppercase tracking-widest text-white placeholder:text-white/25 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleValidateCode();
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isValidating || !vipCodeInput.trim()}
              onClick={() => handleValidateCode()}
              className="w-full h-12 bg-electricViolet hover:bg-electricViolet/90 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isValidating ? (isEs ? "Verificando..." : "Verifying...") : isEs ? "Desbloquear Acceso VIP" : "Unlock VIP Access"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* PASO 2: AUTENTICACIÓN DEL TESTER EN MODO REAL */
          <div className="p-5 bg-white/[0.02] border border-electricViolet/40 space-y-4">
            <div className="flex items-center justify-between px-3 py-2 bg-electricViolet/10 border border-electricViolet/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold tracking-wider text-white">
                  VIP: {validatedCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVipValid(false);
                  setErrorMsg(null);
                }}
                className="text-[10px] font-mono uppercase tracking-wider text-white/50 hover:text-white underline"
              >
                {isEs ? "Cambiar" : "Change"}
              </button>
            </div>

            {/* Acceso 1-Click con Google */}
            <button
              type="button"
              disabled={isSubmittingAuth}
              onClick={handleGoogleAccess}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-electricViolet" />
              <span>{isEs ? "Entrar en 1 Toque con Google" : "1-Tap Sign In with Google"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/35">
                {isEs ? "o con correo y alias" : "or with email & codename"}
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Selector Registro / Login */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`py-2 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  authTab === "register"
                    ? "bg-electricViolet text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {isEs ? "Crear Perfil Beta" : "Create Beta Profile"}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`py-2 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  authTab === "login"
                    ? "bg-electricViolet text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {isEs ? "Ya tengo cuenta" : "Sign In"}
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {authTab === "register" && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1">
                      {isEs ? "Alias en el Radar (Codename)" : "Radar Codename"}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={codename}
                        onChange={(e) => setCodename(e.target.value.toUpperCase())}
                        placeholder="EJ: KRAKEN_BA"
                        className="w-full h-11 pl-9 pr-3 bg-black/70 border border-white/15 focus:border-electricViolet text-xs font-mono uppercase tracking-wider text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1">
                      {isEs ? "Rol Principal" : "Primary Role"}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {QUICK_ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRole(r.id)}
                          className={`py-2 text-[10px] font-mono uppercase border transition-colors ${
                            selectedRole === r.id
                              ? "bg-electricViolet/25 border-electricViolet text-white font-bold"
                              : "bg-black/40 border-white/10 text-white/55 hover:text-white"
                          }`}
                        >
                          {isEs ? r.labelEs : r.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tester@vessel.app"
                    className="w-full h-11 pl-9 pr-3 bg-black/70 border border-white/15 focus:border-electricViolet text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  {isEs ? "Contraseña (mín. 6 caracteres)" : "Password (min. 6 chars)"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-9 pr-3 bg-black/70 border border-white/15 focus:border-electricViolet text-xs font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full h-12 bg-electricViolet hover:bg-electricViolet/90 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>
                  {isSubmittingAuth
                    ? isEs
                      ? "Conectando al Radar..."
                      : "Connecting..."
                    : authTab === "register"
                    ? isEs
                      ? "Activar Nodo y Entrar al Radar"
                      : "Activate Node & Enter Radar"
                    : isEs
                    ? "Iniciar Sesión en Radar Real"
                    : "Sign In to Live Radar"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Pie de Seguridad Criptográfica */}
      <footer className="w-full max-w-md mx-auto pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-wider relative z-10">
        <span>S2 GEOSHASH PRIVACY</span>
        <span>ANTI-GHOST PROTOCOL v1.0</span>
      </footer>
    </div>
  );
};
