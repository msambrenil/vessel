"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { STYLED_AVATARS_CATALOG } from "@/data/mockProfiles";
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

export const IdentityVerificationCard: React.FC = () => {
  const {
    myProfile,
    openAuthModal,
    openLivenessModal,
    updateUserAvatar,
    t,
  } = useVessel();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const verification = myProfile.verification;
  const isVerified = verification?.isVerified;

  const handleSelectAvatar = (url: string) => {
    updateUserAvatar(url, true);
    setShowAvatarPicker(false);
  };

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
                ) : myProfile.isStylizedAvatar ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-electricViolet-glow" />
                    <span>Avatar Estilizado Activo</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Foto Real Visible</span>
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

          {/* Botones de Gestión (44px Touch Targets, sin duplicar Modo Niebla) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAvatarPicker(!showAvatarPicker);
                audioEngine.playPulse();
              }}
              className="min-h-[44px] py-2.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{showAvatarPicker ? "Cerrar" : "Avatar"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openLivenessModal();
                audioEngine.playPulse();
              }}
              className="min-h-[44px] py-2.5 px-2 bg-purple-950/40 hover:bg-purple-900/60 border border-electricViolet/30 text-electricViolet-glow rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer font-mono shadow-violet-soft"
              title="Prueba de vida biométrica 3D"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.account.livenessMethod || "Biometría Facial 3D"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openAuthModal("verify");
                audioEngine.playPulse();
              }}
              className="min-h-[44px] py-2.5 px-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-verificar</span>
            </button>
          </div>

          {/* Catálogo Rápido de Avatares Estilizados */}
          {showAvatarPicker && (
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 space-y-2.5 animate-in fade-in">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                Selecciona un Avatar Estilizado para tu Perfil:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {STYLED_AVATARS_CATALOG.map((item) => {
                  const isCurrent = myProfile.avatarUrl === item.url;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectAvatar(item.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        isCurrent
                          ? "border-electricViolet shadow-violet-soft ring-2 ring-electricViolet/40"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[8px] font-bold text-white truncate">
                          {(item.name.split(" - ")[0] || item.name).trim()}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-electricViolet text-white flex items-center justify-center shadow-violet-soft">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            <button
              type="button"
              onClick={() => openAuthModal("verify")}
              className="w-full py-3 bg-mintNeon text-obsidian-deep hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-mint-glow cursor-pointer font-mono"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Verificar con DNI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openLivenessModal();
                audioEngine.playPulse();
              }}
              className="w-full py-3 bg-electricViolet text-white hover:bg-electricViolet-glow rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer font-mono"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Prueba Facial 3D</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
