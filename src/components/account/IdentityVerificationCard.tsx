"use client";

import React from "react";
import { useAuth, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  EyeOff,
  Camera,
  Check,
  RefreshCw,
  Sparkles,
  ChevronRight,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { BrutalistButton } from "@/components/ui";

export const IdentityVerificationCard: React.FC = () => {
  const {
    myProfile,
    openAuthModal,
    openLivenessModal,
    updateUserAvatar,
  } = useAuth();
  const { t } = useSettings();

  const verification = myProfile.verification;
  const isVerified = verification?.isVerified;

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/5 space-y-3.5 select-none">
      {/* Cabecera de la Sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl ${
              isVerified
                ? "bg-mintNeon/15 text-mintNeon"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Identidad Digital & Verificación ID
            </h3>
            <p className="text-[10px] text-neutral-400">
              Protocolo Anti-Bot // Protección de Privacidad Facial
            </p>
          </div>
        </div>

        <span
          className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isVerified
              ? "bg-mintNeon text-obsidian-deep border-mintNeon font-mono font-black shadow-mint-glow"
              : "bg-red-900/40 text-red-300 border-red-500/30 font-mono"
          }`}
        >
          {isVerified ? "100% Verificado" : "No Verificado"}
        </span>
      </div>

      {/* Estado del Usuario */}
      {isVerified ? (
        <div className="space-y-3">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Estado de Autenticidad:</span>
              <span className="text-xs font-bold text-mintNeon flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Humano Real Verificado</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Método de Validación:</span>
              <span className="text-xs font-medium text-white">
                {verification.method === "biometric_liveness"
                  ? (t.account.livenessMethod || "Biometría Facial 3D")
                  : verification.method === "oauth_google"
                  ? "Google OAuth"
                  : "Documento ID Criptográfico"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Privacidad Facial Pública:</span>
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1">
                {myProfile.isFogMode ? (
                  <>
                    <span className="text-sm">🌫️</span>
                    <span className="text-electricViolet-glow">Modo Niebla (Foto Difuminada)</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Foto Real Nítida</span>
                  </>
                )}
              </span>
            </div>

            {verification.certificateHash && (
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                <span className="text-neutral-500">
                  {t.account.zkCertLabel || "Certificado Criptográfico:"}
                </span>
                <span className="text-neutral-400">{verification.certificateHash}</span>
              </div>
            )}
          </div>

          {/* Botones de Gestión (44px Touch Targets) */}
          <div className="grid grid-cols-2 gap-2">
            <BrutalistButton
              variant="primary"
              size="compact"
              onClick={() => {
                openLivenessModal();
              }}
              className="text-[11px] font-mono shadow-violet-soft"
              title="Prueba de vida biométrica 3D"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.account.livenessMethod || "Biometría Facial 3D"}</span>
            </BrutalistButton>

            <BrutalistButton
              variant="secondary"
              size="compact"
              onClick={() => {
                openAuthModal("verify");
              }}
              className="text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-verificar</span>
            </BrutalistButton>
          </div>
        </div>
      ) : (
        /* Estado No Verificado */
        <div className="space-y-3">
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-red-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Verificación de Identidad Requerida</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              Para erradicar perfiles falsos y bots, VESSEL exige validación digital de persona real. Puedes mantener tu rostro público difuminado o usar un avatar estilizado mientras conservas tu estatus de Verificado.
            </p>

            {/* Incentivos Exclusivos */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 font-mono text-[10px]">
              <span className="text-white font-bold uppercase tracking-wider block">
                Beneficios Inmediatos al Verificar:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-neutral-300">
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-mintNeon font-bold">👑 Radar VIP:</span>
                  <span>Prioridad en grilla</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-electricViolet-glow font-bold">⚡ +20 Karma:</span>
                  <span>Respect Score boost</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-emerald-400 font-bold">🛡️ Escudo:</span>
                  <span>Filtrá cuentas no verificadas</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-amber-400 font-bold">🔒 Privacidad:</span>
                  <span>Zero-Knowledge local</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <BrutalistButton
              variant="mint"
              size="default"
              onClick={() => openAuthModal("verify")}
              className="w-full font-mono text-xs font-black uppercase tracking-wider shadow-mint-glow"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Verificar con DNI</span>
            </BrutalistButton>

            <BrutalistButton
              variant="primary"
              size="default"
              onClick={() => openLivenessModal()}
              className="w-full font-mono text-xs font-black uppercase tracking-wider shadow-violet-soft"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Prueba Facial 3D</span>
            </BrutalistButton>
          </div>
        </div>
      )}
    </div>
  );
};
