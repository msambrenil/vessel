"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { RoleType } from "@/types/vessel";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage/localStorageSync";
import { checkCodenameAvailability } from "@/lib/firebase/identityDeduplicationService";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Zap,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  Edit3,
  Check,
  RotateCcw,
  Sliders,
  LogOut,
  UserCheck,
} from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  initialMode?: "login" | "register" | "forgot_password" | "link" | "session";
}

const ROLE_OPTIONS: { id: RoleType; label: string }[] = [
  { id: "Top", label: "Top (Activo)" },
  { id: "Bottom", label: "Bottom (Pasivo)" },
  { id: "Versatile", label: "Versatile (Versátil)" },
  { id: "Vers Top", label: "Vers Top" },
  { id: "Vers Bottom", label: "Vers Bottom" },
  { id: "Side", label: "Side (Sin penetración)" },
  { id: "Dominant", label: "Dominante / Master" },
  { id: "Submissive", label: "Sumiso / Receptivo" },
  { id: "Oral Focus", label: "Oral Focus" },
];

export interface TestPersona {
  name: string;
  role: RoleType;
  roleLabel: string;
  email: string;
  password: string;
  codename: string;
  emoji: string;
}

export const TEST_PERSONAS: TestPersona[] = [
  {
    name: "Alex",
    role: "Top",
    roleLabel: "Top (Activo)",
    email: "alex.top@vessel.test",
    password: "vessel_test_pass_123",
    codename: "ALEX_TOP_01",
    emoji: "🍆",
  },
  {
    name: "Marcus",
    role: "Versatile",
    roleLabel: "Versatile (Versátil)",
    email: "marcus.vers@vessel.test",
    password: "vessel_test_pass_123",
    codename: "MARCUS_VERS_02",
    emoji: "⚡",
  },
  {
    name: "Liam",
    role: "Bottom",
    roleLabel: "Bottom (Pasivo)",
    email: "liam.bottom@vessel.test",
    password: "vessel_test_pass_123",
    codename: "LIAM_BOTTOM_03",
    emoji: "🍑",
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialMode = "login",
}) => {
  const {
    t,
    language,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    linkAccountWithGoogle,
    linkAccountWithEmail,
    loginAsGuest,
    isAuthenticated,
    isAnonymous,
    authUser,
    logout,
    myProfile,
    currentUserUid,
    openAuthModal,
  } = useVessel();

  const [mode, setMode] = useState<"login" | "register" | "forgot_password" | "link" | "session">(
    initialMode === "session" && isAuthenticated
      ? "session"
      : isAnonymous && initialMode === "link"
      ? "link"
      : initialMode === "session"
      ? "login"
      : initialMode
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codename, setCodename] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("Versatile");
  const [codenameStatus, setCodenameStatus] = useState<{
    isChecking: boolean;
    isAvailable?: boolean;
    message?: string;
  }>({ isChecking: false });

  // Validación reactiva de disponibilidad de codename
  useEffect(() => {
    if (mode !== "register" || !codename.trim() || codename.trim().length < 3) {
      setCodenameStatus({ isChecking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setCodenameStatus({ isChecking: true });
      const res = await checkCodenameAvailability(codename);
      setCodenameStatus({
        isChecking: false,
        isAvailable: res.isAvailable,
        message: res.message,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [codename, mode]);

  const [personas, setPersonas] = useState<TestPersona[]>(() => {
    return loadFromStorage<TestPersona[]>(STORAGE_KEYS.TEST_PERSONAS, TEST_PERSONAS);
  });
  const [editingPersonaIdx, setEditingPersonaIdx] = useState<number | null>(null);
  const [editPersonaName, setEditPersonaName] = useState("");
  const [editPersonaCodename, setEditPersonaCodename] = useState("");
  const [editPersonaRole, setEditPersonaRole] = useState<RoleType>("Top");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startEditPersona = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const p = personas[idx];
    setEditingPersonaIdx(idx);
    setEditPersonaName(p.name);
    setEditPersonaCodename(p.codename);
    setEditPersonaRole(p.role);
    audioEngine.playPulse();
  };

  const handleSaveEditedPersona = (autoLogin: boolean = false) => {
    if (editingPersonaIdx === null) return;
    const current = personas[editingPersonaIdx];
    const roleOpt = ROLE_OPTIONS.find((r) => r.id === editPersonaRole);
    const updated: TestPersona = {
      ...current,
      name: editPersonaName.trim() || current.name,
      codename: editPersonaCodename.trim().toUpperCase() || current.codename,
      role: editPersonaRole,
      roleLabel: roleOpt ? roleOpt.label : current.roleLabel,
    };

    const next = [...personas];
    next[editingPersonaIdx] = updated;
    setPersonas(next);
    saveToStorage(STORAGE_KEYS.TEST_PERSONAS, next);
    setEditingPersonaIdx(null);
    audioEngine.playVaultUnlock();

    if (autoLogin) {
      handleQuickPersonaLogin(updated);
    }
  };

  const handleResetPersonas = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPersonas(TEST_PERSONAS);
    saveToStorage(STORAGE_KEYS.TEST_PERSONAS, TEST_PERSONAS);
    setEditingPersonaIdx(null);
    audioEngine.playSignalSent();
  };

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleAuth = async () => {
    clearMessages();
    setIsLoading(true);
    audioEngine.playPulse();

    try {
      const result =
        mode === "link"
          ? await linkAccountWithGoogle()
          : await loginWithGoogle();

      if (result.success) {
        audioEngine.playVaultUnlock();
        setSuccessMessage(mode === "link" ? t.auth.linkSuccess : "¡Sesión iniciada con éxito!");
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (result.error) {
        setErrorMessage(result.error);
        audioEngine.playSubBass(35, 0.4);
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión durante el login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersonaLogin = async (persona: TestPersona) => {
    clearMessages();
    setIsLoading(true);
    audioEngine.playPulse();
    setEmail(persona.email);
    setPassword(persona.password);
    setCodename(persona.codename);
    setSelectedRole(persona.role);

    try {
      // 1. Intentar iniciar sesión con email y clave de prueba
      let result = await loginWithEmail(persona.email, persona.password);

      // 2. Si la cuenta aún no existe en Firebase Auth, la registramos automáticamente
      if (!result.success) {
        result = await registerWithEmail(
          persona.email,
          persona.password,
          persona.codename,
          persona.role
        );
      }

      if (result.success) {
        audioEngine.playVaultUnlock();
        setSuccessMessage(`¡Ingresaste como ${persona.name} (${persona.roleLabel})!`);
        setTimeout(() => {
          onClose();
        }, 600);
      } else if (result.error) {
        setErrorMessage(result.error);
        audioEngine.playSubBass(35, 0.4);
      }
    } catch (err: any) {
      setErrorMessage("Error al conectar cuenta de prueba.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email || (!password && mode !== "forgot_password")) {
      setErrorMessage("Por favor completá los campos obligatorios.");
      return;
    }

    setIsLoading(true);
    audioEngine.playPulse();

    try {
      if (mode === "login") {
        const result = await loginWithEmail(email, password);
        if (result.success) {
          audioEngine.playVaultUnlock();
          setSuccessMessage("¡Bienvenido a VESSEL!");
          setTimeout(() => onClose(), 600);
        } else if (result.error) {
          setErrorMessage(result.error);
          audioEngine.playSubBass(35, 0.4);
        }
      } else if (mode === "register") {
        if (!codename.trim()) {
          setErrorMessage("Por favor ingresá tu alias o codename.");
          setIsLoading(false);
          return;
        }

        const availability = await checkCodenameAvailability(codename);
        if (!availability.isAvailable) {
          setErrorMessage(availability.message || "El nombre de usuario ya está registrado en VESSEL.");
          audioEngine.playSubBass(35, 0.4);
          setIsLoading(false);
          return;
        }

        const result = await registerWithEmail(
          email,
          password,
          codename,
          selectedRole,
          phone.trim() || undefined
        );

        if (result.success) {
          audioEngine.playVaultUnlock();
          setSuccessMessage("¡Cuenta creada y asegurada con éxito!");
          setTimeout(() => onClose(), 600);
        } else if (result.error) {
          setErrorMessage(result.error);
          audioEngine.playSubBass(35, 0.4);
        }
      } else if (mode === "forgot_password") {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccessMessage(t.auth.resetSentMsg);
          audioEngine.playSignalSent();
        } else if (result.error) {
          setErrorMessage(result.error);
        }
      } else if (mode === "link") {
        const result = await linkAccountWithEmail(email, password);
        if (result.success) {
          audioEngine.playVaultUnlock();
          setSuccessMessage(t.auth.linkSuccess);
          setTimeout(() => onClose(), 600);
        } else if (result.error) {
          setErrorMessage(result.error);
          audioEngine.playSubBass(35, 0.4);
        }
      }
    } catch (err: any) {
      setErrorMessage("Error de conexión. Reintentá.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    clearMessages();
    setIsLoading(true);
    audioEngine.playPulse();
    try {
      await loginAsGuest();
      audioEngine.playSignalSent();
      onClose();
    } catch (e) {
      setErrorMessage("No se pudo iniciar modo invitado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    clearMessages();
    setIsLoading(true);
    audioEngine.playPulse();
    try {
      await logout();
      audioEngine.playStateSwitch("dormant");
      setMode("login");
      setSuccessMessage(
        language === "es"
          ? "Sesión cerrada correctamente."
          : "Signed out successfully."
      );
    } catch (err: any) {
      setErrorMessage(
        language === "es"
          ? "Error al cerrar sesión. Reintentá."
          : "Error signing out. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === "link"
          ? t.auth.linkAccountTitle
          : mode === "session"
          ? t.auth.sessionTitle || "Mi Sesión // VESSEL"
          : t.auth.loginTitle
      }
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-md bg-obsidian-deep border border-electricViolet/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Cabecera Brutalista */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <VesselLogo size={20} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  {mode === "link"
                    ? t.auth.linkAccountTitle
                    : mode === "session"
                    ? t.auth.sessionTitle || "Mi Sesión // VESSEL"
                    : t.auth.loginTitle}
                </h2>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                    mode === "session"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-electricViolet/15 text-electricViolet-glow border-electricViolet/30"
                  }`}
                >
                  {mode === "session" ? "ACTIVE OPERATIVE" : "AUTH CORE"}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                {mode === "session"
                  ? t.auth.sessionSub || "Estado de cuenta y desconexión segura"
                  : t.auth.loginSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de autenticación"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas (Sesión / Ingresar / Crear Cuenta) */}
        {mode !== "forgot_password" && (
          <div
            className={`p-1.5 bg-black/60 border-b border-white/5 grid ${
              isAuthenticated ? "grid-cols-3" : "grid-cols-2"
            } gap-1.5 text-xs font-bold`}
          >
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMode("session");
                  clearMessages();
                  audioEngine.playPulse();
                }}
                aria-selected={mode === "session"}
                className={`py-2.5 min-h-[44px] text-center rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 flex items-center justify-center gap-1.5 ${
                  mode === "session"
                    ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                    : "bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="truncate">{t.auth.tabSession || "Mi Sesión"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMode("login");
                clearMessages();
                audioEngine.playPulse();
              }}
              aria-selected={mode === "login"}
              className={`py-2.5 min-h-[44px] text-center rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                mode === "login"
                  ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              {t.auth.tabLogin}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(isAnonymous ? "link" : "register");
                clearMessages();
                audioEngine.playPulse();
              }}
              aria-selected={mode === "register" || mode === "link"}
              className={`py-2.5 min-h-[44px] text-center rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                mode === "register" || mode === "link"
                  ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              {isAnonymous ? t.auth.tabLink : t.auth.tabRegister}
            </button>
          </div>
        )}

        {/* Cuerpo del Formulario */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Alertas de Error / Éxito */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-start gap-2.5 text-red-200 animate-in shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-start gap-2.5 text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed font-bold">{successMessage}</div>
            </div>
          )}

          {mode === "session" ? (
            /* ================================================================
               VISTA DEDICADA: GESTIÓN DE SESIÓN ACTIVA & CIERRE DIRECTO
               ================================================================ */
            <div className="space-y-4 animate-in fade-in">
              {/* Tarjeta de Identidad & Estado de Cuenta */}
              <div className="p-4 rounded-2xl bg-black/60 border border-electricViolet/30 space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-shrink-0">
                    {myProfile?.avatarUrl ? (
                      <img
                        src={myProfile.avatarUrl}
                        alt={myProfile.codename}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-electricViolet/50 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-electricViolet/15 border-2 border-electricViolet/50 flex items-center justify-center text-electricViolet-glow text-xl font-bold font-mono">
                        {myProfile?.codename?.[0] || authUser?.email?.[0]?.toUpperCase() || "V"}
                      </div>
                    )}
                    <span
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse"
                      title="Sesión activa"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white font-mono uppercase truncate">
                        {myProfile?.codename || authUser?.displayName || "VESSEL_OPERATIVE"}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[9px] font-bold">
                        {myProfile?.role || "Versatile"}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                      {authUser?.email || (isAnonymous ? "Sesión Temporal / Invitado" : "Sin correo asociado")}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-neutral-500">
                      <span>UID: {currentUserUid ? `${currentUserUid.slice(0, 10)}...` : "LOCAL"}</span>
                      <span>•</span>
                      <span className={authUser?.emailVerified ? "text-emerald-400" : "text-amber-400"}>
                        {authUser?.emailVerified ? "Email Verificado" : "Email No Verificado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Métricas y Estado Técnico */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center font-mono text-[10px]">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                    <span className="text-neutral-500 block text-[9px]">MÉTODO DE ACCESO</span>
                    <span className="text-white font-bold block truncate">
                      {authUser?.providerData?.[0]?.providerId === "google.com"
                        ? "Google OAuth"
                        : isAnonymous
                        ? "Invitado Local"
                        : "Email & Contraseña"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                    <span className="text-neutral-500 block text-[9px]">ESTADO DE VERIFICACIÓN</span>
                    <span className={`font-bold block truncate ${myProfile?.verification?.isVerified ? "text-mintNeon" : "text-neutral-400"}`}>
                      {myProfile?.verification?.isVerified ? "3D Verificado" : "Sin Validar 3D"}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTÓN PRINCIPAL: CERRAR SESIÓN */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleLogout}
                className="w-full py-3.5 min-h-[48px] bg-bloodNeon/15 hover:bg-bloodNeon text-bloodNeon hover:text-white border border-bloodNeon/50 hover:border-bloodNeon font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_0_15px_rgba(255,0,51,0.2)] cursor-pointer disabled:opacity-50 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.auth.logoutAction || "Cerrar Sesión Activa"}</span>
                  </>
                )}
              </button>

              {/* Acciones Secundarias: Cambiar de Cuenta */}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    clearMessages();
                    audioEngine.playPulse();
                  }}
                  className="w-full py-2.5 min-h-[40px] text-[11px] text-neutral-400 hover:text-white font-mono hover:underline cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{t.auth.switchAccount || "Cambiar de Cuenta"}</span>
                  <span className="text-electricViolet font-bold">→</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Banner de Sesión Activa mientras se visualiza login/registro */}
              {isAuthenticated && (
                <div className="p-3 bg-purple-950/40 border border-electricViolet/30 rounded-2xl flex items-center justify-between gap-2 text-[11px] animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                    <div className="truncate">
                      <span className="text-neutral-400">{t.auth.activeSessionNotice || "Sesión iniciada como"}: </span>
                      <strong className="text-white font-mono">{myProfile?.codename || authUser?.email}</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("session");
                        clearMessages();
                        audioEngine.playPulse();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {t.auth.tabSession || "Mi Sesión"}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleLogout}
                      className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-bloodNeon text-bloodNeon hover:text-white border border-bloodNeon/40 font-mono text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* Aviso Anti-Sybil / Prevención de Multi-Cuentas */}
              <div className="p-3 bg-black/50 border border-mintNeon/20 rounded-2xl flex items-center gap-2.5 text-[10px] text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-mintNeon flex-shrink-0 stroke-[2.5]" />
                <span>{t.auth.antiSybilNotice}</span>
              </div>

          {/* Sección de Cuentas de Prueba Rápida (Local Dev / Demo) */}
          {mode !== "forgot_password" && (
            <div className="p-3 bg-white/5 border border-electricViolet/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-electricViolet-glow uppercase font-mono tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.auth.quickTestTitle}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetPersonas}
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Restaurar presets por defecto"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 font-bold">
                    DEV PRESETS
                  </span>
                </div>
              </div>
              <p className="text-[9.5px] text-neutral-400 leading-snug">
                Tocá para ingresar en 1-tap o el ícono ✏️ para editar el nombre y rol del preset:
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {personas.map((p, idx) => (
                  <div
                    key={p.email}
                    onClick={() => handleQuickPersonaLogin(p)}
                    className="p-2 min-h-[50px] bg-black/60 hover:bg-electricViolet/15 border border-white/10 hover:border-electricViolet/50 rounded-xl flex flex-col items-center justify-center gap-0.5 text-center transition-all cursor-pointer group relative active:scale-95"
                    title={`Acceder rápidamente como ${p.name} (${p.roleLabel})`}
                  >
                    <button
                      type="button"
                      onClick={(e) => startEditPersona(idx, e)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-white/5 hover:bg-electricViolet/20 text-neutral-400 hover:text-electricViolet-glow transition-colors border border-transparent hover:border-electricViolet/30"
                      title="Editar este preset de prueba"
                      aria-label="Editar este preset de prueba"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-sm leading-none group-hover:scale-110 transition-transform">
                      {p.emoji}
                    </span>
                    <span className="text-[10px] font-bold text-white group-hover:text-electricViolet-glow transition-colors block truncate w-full">
                      {p.name}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-400 group-hover:text-neutral-300 block truncate w-full">
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Editor Inline de Preset de Prueba */}
              {editingPersonaIdx !== null && (
                <div className="p-3 bg-black/80 border border-electricViolet/50 rounded-xl space-y-2 mt-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-electricViolet-glow uppercase flex items-center gap-1">
                      <Sliders className="w-3 h-3" />
                      <span>Editar Preset: {personas[editingPersonaIdx].emoji} {personas[editingPersonaIdx].name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPersonaIdx(null)}
                      className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-neutral-300">Nombre Visible</label>
                      <input
                        type="text"
                        value={editPersonaName}
                        onChange={(e) => setEditPersonaName(e.target.value)}
                        placeholder="Ej: Alex"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-electricViolet"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-neutral-300">Codename (Tarjeta)</label>
                      <input
                        type="text"
                        value={editPersonaCodename}
                        onChange={(e) => setEditPersonaCodename(e.target.value)}
                        placeholder="Ej: ALEX_01"
                        className="w-full bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono font-bold uppercase focus:outline-none focus:border-electricViolet"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-neutral-300">Rol Corporal</label>
                    <select
                      value={editPersonaRole}
                      onChange={(e) => setEditPersonaRole(e.target.value as RoleType)}
                      className="w-full bg-neutral-900 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-electricViolet cursor-pointer"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEditedPersona(true)}
                      className="flex-1 py-1.5 bg-electricViolet text-white hover:bg-electricViolet-glow font-bold text-[10px] uppercase font-mono rounded-lg transition-all flex items-center justify-center gap-1 shadow-violet-soft cursor-pointer"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Guardar y Entrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEditedPersona(false)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] font-mono rounded-lg transition-all cursor-pointer"
                    >
                      <span>Guardar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón Google 1-Click */}
          {mode !== "forgot_password" && (
            <div className="space-y-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 min-h-[48px] rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricViolet/50 flex items-center justify-between text-white transition-all group cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-extrabold text-sm shadow-sm">
                    G
                  </div>
                  <div className="text-left font-bold text-xs">
                    {mode === "link" ? "Vincular con Google" : t.auth.googleBtn}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-electricViolet-glow transition-colors" />
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono font-semibold">
                  O CON CORREO
                </span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
              </div>
            </div>
          )}

          {/* Formulario Principal */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Campo Codename (Solo en Registro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                    {t.auth.codenameLabel} <span className="text-electricViolet-glow">*</span>
                  </label>
                  {codename.trim().length >= 3 && (
                    <span className="text-[9px] font-mono font-bold flex items-center gap-1">
                      {codenameStatus.isChecking ? (
                        <span className="text-neutral-400 animate-pulse">Comprobando...</span>
                      ) : codenameStatus.isAvailable ? (
                        <span className="text-emerald-400">✓ DISPONIBLE</span>
                      ) : codenameStatus.isAvailable === false ? (
                        <span className="text-bloodNeon">✕ NO DISPONIBLE</span>
                      ) : null}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={codename}
                    onChange={(e) => setCodename(e.target.value)}
                    placeholder={t.auth.codenamePlaceholder}
                    className={`w-full min-h-[44px] bg-black/60 border rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus-visible:ring-2 transition-colors font-mono uppercase ${
                      codenameStatus.isAvailable === false
                        ? "border-bloodNeon focus:border-bloodNeon focus-visible:ring-bloodNeon/50"
                        : codenameStatus.isAvailable === true
                        ? "border-emerald-500/60 focus:border-emerald-400 focus-visible:ring-emerald-400/40"
                        : "border-white/15 focus:border-electricViolet focus-visible:ring-electricViolet/50"
                    }`}
                  />
                </div>
                {codenameStatus.isAvailable === false && codenameStatus.message && (
                  <p className="text-[9.5px] text-bloodNeon font-mono font-medium">
                    {codenameStatus.message}
                  </p>
                )}
              </div>
            )}

            {/* Selector de Rol Corporal (Solo en Registro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                  {t.auth.roleLabel}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                  className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-colors font-sans cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-neutral-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campo Teléfono de Validación Única Anti-Sybil (Opcional en Registro) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Teléfono Celular (Anti-Cuentas Falsas)
                  </label>
                  <span className="text-[9px] text-mintNeon font-mono font-bold">1 Persona = 1 Cuenta</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 ..."
                    className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                {t.auth.emailLabel} <span className="text-electricViolet-glow">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Campo Contraseña (Oculto en Recuperar) */}
            {mode !== "forgot_password" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                    {t.auth.passwordLabel} <span className="text-electricViolet-glow">*</span>
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot_password");
                        clearMessages();
                      }}
                      className="text-[10px] text-electricViolet-glow hover:underline cursor-pointer p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                    >
                      {t.auth.forgotBtn}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs pl-9 pr-12 py-2.5 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="absolute inset-y-0 right-0 pr-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Botón de Acción Principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white hover:bg-electricViolet-glow font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer disabled:opacity-50 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === "login" ? (
                <span>{t.auth.loginBtn}</span>
              ) : mode === "register" ? (
                <span>{t.auth.registerBtn}</span>
              ) : mode === "link" ? (
                <span>Vincular con Correo</span>
              ) : (
                <span>{t.auth.sendResetBtn}</span>
              )}
            </button>
          </form>

          {/* Volver al Login si está en Forgot Password */}
          {mode === "forgot_password" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                clearMessages();
              }}
              className="w-full py-2.5 min-h-[40px] text-center text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 pt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          )}

          {/* Acceso como Invitado */}
          {mode !== "link" && (
            <div className="pt-2 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-2 min-h-[40px] flex items-center justify-center text-[11px] text-neutral-400 hover:text-electricViolet-glow transition-colors font-mono underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-lg"
              >
                {t.auth.guestBtn}
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
