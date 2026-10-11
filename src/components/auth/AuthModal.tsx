"use client";

import React, { useState, useEffect } from "react";
import { useAuth, useSettings, useRadarMatrix } from "@/context/VesselContext";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { RoleType } from "@/types/vessel";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage/localStorageSync";
import {
  checkCodenameAvailability,
  claimCodename,
} from "@/lib/firebase/identityDeduplicationService";
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
import { BrutalistButton, BrutalistSelect, BrutalistInput, BrutalistModal } from "@/components/ui";

interface AuthModalProps {
  onClose: () => void;
  initialMode?: "login" | "register" | "forgot_password" | "link" | "session";
}

const ROLE_OPTIONS: { id: RoleType; label: string }[] = [
  { id: "Top", label: "Activo" },
  { id: "Bottom", label: "Pasivo" },
  { id: "Versatile", label: "Versátil" },
  { id: "Vers Top", label: "Versátil Activo" },
  { id: "Vers Bottom", label: "Versátil Pasivo" },
  { id: "Side", label: "Side (Sin penetración)" },
  { id: "Dominant", label: "Dominante" },
  { id: "Submissive", label: "Sumiso" },
  { id: "Oral Focus", label: "Enfoque Oral / Morbo Oral" },
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
    roleLabel: "Activo",
    email: "alex.top@vessel.test",
    password: "vessel_test_pass_123",
    codename: "ALEX_TOP_01",
    emoji: "🍆",
  },
  {
    name: "Marcus",
    role: "Versatile",
    roleLabel: "Versátil",
    email: "marcus.vers@vessel.test",
    password: "vessel_test_pass_123",
    codename: "MARCUS_VERS_02",
    emoji: "⚡",
  },
  {
    name: "Liam",
    role: "Bottom",
    roleLabel: "Pasivo",
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
    updateMyProfile,
    currentUserUid,
    openAuthModal,
  } = useAuth();
  const { t, language, appMode } = useSettings();
  const { filters, setFilters } = useRadarMatrix();

  const [mode, setMode] = useState<"login" | "register" | "forgot_password" | "link" | "session">(
    isAuthenticated
      ? "session"
      : isAnonymous && initialMode === "link"
      ? "link"
      : initialMode === "session"
      ? "login"
      : initialMode
  );

  const [email, setEmail] = useState(authUser?.email || myProfile?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codename, setCodename] = useState(() => {
    const initialCode = myProfile?.codename || "";
    return initialCode === "VESSEL_USER" ? "" : initialCode;
  });
  const [phone, setPhone] = useState(myProfile?.phone || "");
  const [selectedRole, setSelectedRole] = useState<RoleType>(myProfile?.role || "Versatile");
  const [seekingRoles, setSeekingRoles] = useState<RoleType[]>(
    () => myProfile?.seekingRoles || filters?.roles || []
  );
  const [codenameStatus, setCodenameStatus] = useState<{
    isChecking: boolean;
    isAvailable?: boolean;
    message?: string;
  }>({ isChecking: false });

  // Si el usuario ya está autenticado (ej. tras login con Google OAuth), pasar automáticamente a la vista de Configurar Mi Perfil / Mi Sesión y pre-cargar sus datos
  useEffect(() => {
    if (isAuthenticated) {
      setMode("session");
      if (authUser?.email && !email) {
        setEmail(authUser.email);
      }
      if (myProfile?.codename && myProfile.codename !== "VESSEL_USER" && !codename) {
        setCodename(myProfile.codename);
      } else if (!codename && authUser?.displayName) {
        setCodename(authUser.displayName.split(" ")[0].toUpperCase());
      }
      if (myProfile?.role) {
        setSelectedRole(myProfile.role);
      }
      if (myProfile?.phone && !phone) {
        setPhone(myProfile.phone);
      }
      if (myProfile?.seekingRoles && myProfile.seekingRoles.length > 0 && seekingRoles.length === 0) {
        setSeekingRoles(myProfile.seekingRoles);
      }
    }
  }, [isAuthenticated, authUser, myProfile]);

  const toggleSeekingRole = (roleId: RoleType) => {
    audioEngine.playPulse();
    setSeekingRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  // Validación reactiva de disponibilidad de codename (tanto en Registro como en Configurar Mi Perfil)
  useEffect(() => {
    if ((mode !== "register" && mode !== "session") || !codename.trim() || codename.trim().length < 3) {
      setCodenameStatus({ isChecking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setCodenameStatus({ isChecking: true });
      const res = await checkCodenameAvailability(
        codename,
        currentUserUid && currentUserUid !== "unauthenticated" && currentUserUid !== "local-user"
          ? currentUserUid
          : undefined
      );
      setCodenameStatus({
        isChecking: false,
        isAvailable: res.isAvailable,
        message: res.message,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [codename, mode, currentUserUid]);

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

  const handleSaveAuthenticatedProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearMessages();

    const cleanCode = codename.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setErrorMessage("Por favor ingresá un nombre de usuario (alias) de al menos 3 caracteres.");
      audioEngine.playSubBass(35, 0.4);
      return;
    }

    setIsLoading(true);
    audioEngine.playPulse();

    try {
      const uidForCheck =
        currentUserUid && currentUserUid !== "unauthenticated" && currentUserUid !== "local-user"
          ? currentUserUid
          : authUser?.uid;

      const availability = await checkCodenameAvailability(cleanCode, uidForCheck);
      if (!availability.isAvailable) {
        setErrorMessage(availability.message || "Ese nombre de usuario ya está en uso por otra persona.");
        audioEngine.playSubBass(35, 0.4);
        setIsLoading(false);
        return;
      }

      if (uidForCheck) {
        await claimCodename(cleanCode, uidForCheck);
      }

      updateMyProfile({
        codename: cleanCode,
        role: selectedRole,
        phone: phone.trim(),
        email: (email || authUser?.email || "").trim(),
        avatarUrl: authUser?.photoURL || myProfile.avatarUrl || "",
        seekingRoles,
        isProfileSetupComplete: true,
      });

      setFilters((prev) => ({
        ...prev,
        roles: seekingRoles,
      }));

      audioEngine.playVaultUnlock();
      setSuccessMessage("¡Perfil configurado! Ya estás visible en la Matrix.");
      setTimeout(() => {
        onClose();
      }, 450);
    } catch {
      setErrorMessage("Error al guardar tu perfil. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
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
        if (result.user?.email) {
          setEmail(result.user.email);
        }
        if (!codename && result.user?.displayName) {
          setCodename(result.user.displayName.split(" ")[0].toUpperCase());
        }
        setMode("session");
        setSuccessMessage(
          "¡Conectado con Google! Confirmá tu alias, tu posición corporal y qué buscás para entrar a la Matrix."
        );
      } else if (result.error) {
        setErrorMessage(result.error);
        audioEngine.playSubBass(35, 0.4);
      }
    } catch {
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
    } catch {
      setErrorMessage("Error al conectar cuenta de prueba.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Si el usuario ya está autenticado (ej. Google OAuth), guardar directamente sus datos de perfil sin intentar crear otra cuenta de Auth
    if (isAuthenticated) {
      await handleSaveAuthenticatedProfile();
      return;
    }

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
          updateMyProfile({
            codename: codename.trim().toUpperCase(),
            role: selectedRole,
            phone: phone.trim(),
            email: email.trim(),
            avatarUrl: myProfile.avatarUrl || "",
            seekingRoles,
            isProfileSetupComplete: true,
          });
          setFilters((prev) => ({
            ...prev,
            roles: seekingRoles,
          }));
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
    } catch {
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
    } catch {
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
    <BrutalistModal
      isOpen={true}
      onClose={onClose}
      maxWidth="md"
      className="bg-obsidian-deep border-electricViolet/30"
      contentClassName="p-0 flex flex-col"
      closeButtonAriaLabel="Cerrar ventana de autenticación"
      icon={<VesselLogo size={20} showWordmark={false} />}
      title={
        <div className="flex items-center gap-2">
          <span>
            {isAuthenticated || mode === "session"
              ? "MI PERFIL OPERATIVO"
              : mode === "link"
              ? t.auth.linkAccountTitle
              : t.auth.loginTitle}
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
              isAuthenticated || mode === "session"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-electricViolet/15 text-electricViolet-glow border-electricViolet/30"
            }`}
          >
            {isAuthenticated || mode === "session"
              ? (language === "es" ? "GOOGLE OAUTH ACTIVO" : "ACTIVE SESSION")
              : (language === "es" ? "ACCESO VESSEL" : "AUTH CORE")}
          </span>
        </div>
      }
      subtitle={
        isAuthenticated || mode === "session"
          ? "Datos principales de tu cuenta y qué buscás en la Matrix"
          : t.auth.loginSub
      }
    >

        {/* Selector de Pestañas: SOLO visible cuando el usuario NO está autenticado (evita confusión de "Crear Cuenta" ya logueado) */}
        {!isAuthenticated && mode !== "forgot_password" && (
          <div className="p-1.5 bg-black/60 border-b border-white/5 grid grid-cols-2 gap-1.5 text-xs font-bold">
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

          {isAuthenticated || mode === "session" ? (
            /* ================================================================
               VISTA UNIFICADA CUANDO YA INICIASTE CON GOOGLE OAUTH / SESIÓN:
               DATOS PRINCIPALES + QUÉ POSICIÓN CORPORAL BUSCO PARA ENCUENTROS
               ================================================================ */
            <form onSubmit={handleSaveAuthenticatedProfile} className="space-y-4 animate-in fade-in">
              {/* Banner de Cuenta Google Conectada */}
              <div className="p-3 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {authUser?.photoURL || myProfile?.avatarUrl ? (
                    <img
                      src={authUser?.photoURL || myProfile.avatarUrl}
                      alt={codename || "Avatar"}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-400/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-mono font-black text-sm flex-shrink-0">
                      {(codename?.[0] || email?.[0] || "V").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-300">
                        Cuenta Verificada con Google
                      </span>
                    </div>
                    <p className="text-[11px] text-white font-mono truncate">
                      {authUser?.email || email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-bloodNeon text-bloodNeon hover:text-white border border-bloodNeon/40 font-mono text-[10px] font-bold cursor-pointer transition-colors flex-shrink-0"
                >
                  Salir
                </button>
              </div>

              {/* 1. NOMBRE DE USUARIO / ALIAS EN VESSEL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-codename-input" className="text-[10px] font-bold text-neutral-200 uppercase tracking-wider block">
                    1. Nombre de Usuario / Alias en VESSEL <span className="text-electricViolet-glow">*</span>
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
                    id="auth-codename-input"
                    type="text"
                    required
                    aria-invalid={codenameStatus.isAvailable === false}
                    value={codename}
                    onChange={(e) => setCodename(e.target.value)}
                    placeholder="Ej: OJITOS"
                    className={`w-full min-h-[44px] bg-black/60 border rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus-visible:ring-2 transition-colors font-mono font-bold uppercase ${
                      codenameStatus.isAvailable === false
                        ? "border-bloodNeon focus:border-bloodNeon"
                        : "border-emerald-500/50 focus:border-electricViolet"
                    }`}
                  />
                </div>
              </div>

              {/* 2. MI POSICIÓN CORPORAL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-200 uppercase tracking-wider block">
                  2. Mi Posición Corporal <span className="text-electricViolet-glow">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ROLE_OPTIONS.map((opt) => {
                    const active = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setSelectedRole(opt.id);
                        }}
                        className={`py-2.5 px-2 min-h-[42px] rounded-xl font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          active
                            ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft"
                            : "bg-black/60 text-neutral-300 border-white/10 hover:border-electricViolet/40"
                        }`}
                      >
                        {opt.label.split(" (")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. ¿QUÉ POSICIÓN CORPORAL BUSCO PARA ENCUENTROS? */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-electricViolet/10 border border-electricViolet/30">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold text-electricViolet-glow uppercase tracking-wider block">
                    3. ¿Qué Posición Corporal buscás para encuentros?
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setSeekingRoles([]);
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border cursor-pointer transition-all ${
                      seekingRoles.length === 0
                        ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/50 font-bold"
                        : "bg-black/50 text-neutral-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {seekingRoles.length === 0 ? "✓ Abierto a Todos" : "Ver Todos"}
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Podés elegir una o varias posiciones para filtrar tu Matrix automáticamente:
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = seekingRoles.includes(opt.id);
                    return (
                      <button
                        key={`seek-${opt.id}`}
                        type="button"
                        onClick={() => toggleSeekingRole(opt.id)}
                        className={`py-2 px-2 min-h-[40px] rounded-xl font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                            : "bg-black/60 text-neutral-400 border-white/10 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {isSelected && <span>✓</span>}
                        <span>{opt.label.split(" (")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. TELÉFONO CELULAR & 5. CORREO ELECTRÓNICO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                      4. Teléfono Celular
                    </label>
                    <span className="text-[8px] text-mintNeon font-mono font-bold">1 Persona = 1 Cuenta</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5493584851171"
                      className="w-full min-h-[42px] bg-black/60 border border-white/15 rounded-xl text-white text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-electricViolet font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                    5. Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email || authUser?.email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={Boolean(authUser?.email)}
                      className="w-full min-h-[42px] bg-black/40 border border-white/10 rounded-xl text-neutral-300 text-xs pl-8 pr-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BOTÓN PRINCIPAL: GUARDAR DATOS Y ENTRAR A LA MATRIX */}
              <BrutalistButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>GUARDAR MI PERFIL Y ENTRAR A LA MATRIX</span>
              </BrutalistButton>
            </form>
          ) : (
            <>
              {/* Banner de Sesión Activa mientras se visualiza login/registro */}
              {isAuthenticated &&
                (appMode === "test" ||
                  (!authUser?.email?.endsWith("@vessel.dev") &&
                    myProfile?.codename &&
                    myProfile.codename.toUpperCase() !== "VESSEL_USER")) && (
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

          {/* Sección de Cuentas de Prueba Rápida (Estrictamente oculta en Modo Real) */}
          {appMode === "test" && process.env.NODE_ENV === "development" && mode !== "forgot_password" && (
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
                    <span>{language === "es" ? "Reiniciar" : "Reset"}</span>
                  </button>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 font-bold">
                    {language === "es" ? "PERFILES DEV" : "DEV PRESETS"}
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
                      {getRoleDisplayLabel(p.role, language)}
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

                  <BrutalistSelect
                    label="Rol Corporal"
                    value={editPersonaRole}
                    onChange={(val) => setEditPersonaRole(val as RoleType)}
                    options={ROLE_OPTIONS.map((opt) => ({
                      value: opt.id,
                      label: opt.label,
                    }))}
                  />

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

            {/* Selector de Rol Corporal y Qué Posición Busco (Solo en Registro) */}
            {mode === "register" && (
              <>
                <BrutalistSelect
                  label={t.auth.roleLabel}
                  value={selectedRole}
                  onChange={(val) => setSelectedRole(val as RoleType)}
                  options={ROLE_OPTIONS.map((opt) => ({
                    value: opt.id,
                    label: opt.label,
                  }))}
                />

                <div className="space-y-1.5 p-3 rounded-2xl bg-electricViolet/10 border border-electricViolet/30">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-electricViolet-glow uppercase tracking-wider block">
                      ¿Qué Posición Corporal buscás para encuentros?
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playPulse();
                        setSeekingRoles([]);
                      }}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border cursor-pointer transition-all ${
                        seekingRoles.length === 0
                          ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/50 font-bold"
                          : "bg-black/50 text-neutral-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {seekingRoles.length === 0 ? "✓ Abierto a Todos" : "Ver Todos"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {ROLE_OPTIONS.map((opt) => {
                      const isSelected = seekingRoles.includes(opt.id);
                      return (
                        <button
                          key={`reg-seek-${opt.id}`}
                          type="button"
                          onClick={() => toggleSeekingRole(opt.id)}
                          className={`py-2 px-2 min-h-[38px] rounded-xl font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border flex items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-emerald-500/25 text-emerald-200 border-emerald-400"
                              : "bg-black/60 text-neutral-400 border-white/10 hover:text-white"
                          }`}
                        >
                          {isSelected && <span>✓</span>}
                          <span>{opt.label.split(" (")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
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
            <BrutalistButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full mt-2"
            >
              {mode === "login" ? (
                <span>{t.auth.loginBtn}</span>
              ) : mode === "register" ? (
                <span>{t.auth.registerBtn}</span>
              ) : mode === "link" ? (
                <span>Vincular con Correo</span>
              ) : (
                <span>{t.auth.sendResetBtn}</span>
              )}
            </BrutalistButton>
          </form>

          {/* Volver al Login si está en Forgot Password */}
          {mode === "forgot_password" && (
            <BrutalistButton
              variant="ghost"
              onClick={() => {
                setMode("login");
                clearMessages();
              }}
              className="w-full mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </BrutalistButton>
          )}

          {/* Acceso como Invitado (Solo en Modo Prueba) */}
          {appMode === "test" && mode !== "link" && (
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
    </BrutalistModal>
  );
};
