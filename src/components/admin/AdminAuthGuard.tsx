"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSettings, useAuth } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ShieldAlert, Lock, KeyRound, ArrowRight, ArrowLeft, Terminal, ShieldCheck } from "lucide-react";
import { checkIsAdminAuthorized, verifyAdminPasscodeSecurely } from "@/lib/admin/adminService";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const ADMIN_SESSION_STORAGE_KEY = "vessel_admin_authorized_session_v2";
const ADMIN_SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 horas de validez máxima

interface AdminSessionPayload {
  authorized: boolean;
  timestamp: number;
  expiresAt: number;
}

function isValidStoredSession(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as AdminSessionPayload;
    if (!data.authorized || typeof data.timestamp !== "number" || typeof data.expiresAt !== "number") {
      return false;
    }
    const now = Date.now();
    return now < data.expiresAt && data.timestamp <= now;
  } catch {
    return false;
  }
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { appMode, language } = useSettings();
  const { authUser, isAuthenticated, openAuthModal } = useAuth();
  const isEs = language === "es";

  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSessionAuthorized, setIsSessionAuthorized] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedAuth = window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (isValidStoredSession(savedAuth)) {
        setIsSessionAuthorized(true);
      } else if (savedAuth) {
        window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    }
  }, []);

  // En Modo Test: Acceso libre con banner de aviso sandbox
  if (appMode === "test") {
    return <>{children}</>;
  }

  // Prevenir discrepancia de hidratación SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-obsidian text-white flex items-center justify-center p-6">
        <div className="w-12 h-12 border-2 border-electricViolet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Verificar si el usuario autenticado tiene un email de administrador oficial
  const isEmailAuthorized = Boolean(authUser?.email && checkIsAdminAuthorized(authUser.email));

  if (isEmailAuthorized || isSessionAuthorized) {
    return <>{children}</>;
  }

  const handleValidatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setPasscodeError(null);
    setIsVerifying(true);
    audioEngine.triggerTacticalPulse();

    try {
      const isMatch = await verifyAdminPasscodeSecurely(passcodeInput);
      if (isMatch) {
        audioEngine.playVaultUnlock();
        setIsSessionAuthorized(true);
        if (typeof window !== "undefined") {
          const now = Date.now();
          const sessionPayload: AdminSessionPayload = {
            authorized: true,
            timestamp: now,
            expiresAt: now + ADMIN_SESSION_MAX_AGE_MS,
          };
          window.sessionStorage.setItem(
            ADMIN_SESSION_STORAGE_KEY,
            JSON.stringify(sessionPayload)
          );
        }
      } else {
        audioEngine.playError();
        setPasscodeError(
          isEs
            ? "Código de comando maestro inválido. Intento registrado en auditoría."
            : "Invalid master command code. Attempt logged to audit."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-obsidian text-white flex flex-col justify-between p-4 sm:p-8 relative selection:bg-electricViolet selection:text-white">
      {/* Fondo brutalista con retícula táctica */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bloodNeon/10 via-obsidian-deep to-obsidian pointer-events-none" />

      {/* Cabecera de advertencia */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-bloodNeon animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-bold">
            VESSEL // RESTRICTED ACCESS CONSOLE
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEs ? "Volver al Radar" : "Back to Radar"}</span>
        </Link>
      </header>

      {/* Panel central de bloqueo */}
      <main className="relative z-10 max-w-lg w-full mx-auto my-auto py-12">
        <div className="bg-obsidian-surface border border-bloodNeon/40 p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(255,59,48,0.15)] backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="p-3 bg-bloodNeon/20 border border-bloodNeon/50 rounded-xl">
              <Lock className="w-6 h-6 text-bloodNeon" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
                {isEs ? "Acceso Restringido (403)" : "Restricted Access (403)"}
              </h1>
              <p className="text-[11px] font-mono text-white/50">
                TERMINAL DE COMANDO & AUDITORÍA EN MODO REAL
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {isEs
                  ? "Esta sección gestiona telemetría en vivo, moderación de perfiles y seguridad de la plataforma. Para continuar, debés identificarte con una cuenta autorizada."
                  : "This section manages live telemetry, user moderation, and platform security. Please authenticate with an authorized administrator account."}
              </p>

              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="w-full h-12 bg-electricViolet hover:bg-electricViolet/90 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                <Terminal className="w-4 h-4" />
                <span>{isEs ? "Iniciar Sesión de Operador" : "Sign In as Operator"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono space-y-1">
                <div className="text-white/40 uppercase text-[10px]">Cuenta Identificada:</div>
                <div className="text-white font-bold truncate">{authUser?.email || authUser?.uid}</div>
                <div className="text-bloodNeon text-[10px] uppercase font-bold flex items-center gap-1 pt-1">
                  <ShieldAlert className="w-3.5 h-3.5 inline" />
                  <span>Sin privilegios de Staff en lista blanca</span>
                </div>
              </div>

              <p className="text-xs text-neutral-400 font-sans">
                {isEs
                  ? "Si contás con autorización de comando o sos el desarrollador principal, ingresá la Clave Maestra de Operador:"
                  : "If you have master command authorization, enter the Master Operator Passcode below:"}
              </p>

              <form onSubmit={handleValidatePasscode} className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-9 pr-3 bg-black/80 border border-white/20 focus:border-electricViolet rounded-xl text-xs font-mono text-white tracking-widest"
                  />
                </div>

                {passcodeError && (
                  <div className="text-[11px] font-mono text-bloodNeon flex items-center gap-1.5 animate-shake">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{passcodeError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!passcodeInput.trim()}
                  className="w-full h-11 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isEs ? "Desbloquear Consola de Comando" : "Unlock Command Console"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Pie de página táctico */}
      <footer className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white/30 border-t border-white/10 pt-4">
        <span>SECURITY SUBSYSTEM // ENCRYPTED</span>
        <span>AUDIT_LOG_ACTIVE: TRUE</span>
      </footer>
    </div>
  );
};
