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
    updateUserAvatar,
    removeVerification,
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
                  ? "Biometría Liveness 3D"
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
                <span className="text-neutral-500">Hash ZK Cert:</span>
                <span className="text-neutral-400">{verification.certificateHash}</span>
              </div>
            )}
          </div>

          {/* Botones de Gestión */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAvatarPicker(!showAvatarPicker);
                audioEngine.playPulse();
              }}
              className="py-2.5 px-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            >
              <EyeOff className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{showAvatarPicker ? "Cerrar" : "Avatar"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                updateUserAvatar(myProfile.avatarUrl, myProfile.isStylizedAvatar, !myProfile.isFogMode);
                audioEngine.playPulse();
              }}
              className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all border cursor-pointer ${
                myProfile.isFogMode
                  ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10"
              }`}
              title="Conmutar difuminado de privacidad"
            >
              <span>🌫️</span>
              <span>{myProfile.isFogMode ? "Niebla ON" : "Niebla OFF"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openAuthModal("verify");
                audioEngine.playPulse();
              }}
              className="py-2.5 px-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-verificar</span>
            </button>
          </div>

          {/* AVISO DE IMPACTO DE VISIBILIDAD DE MODO NIEBLA */}
          {myProfile.isFogMode && (
            <div className="bg-purple-950/20 border border-electricViolet/30 rounded-xl p-2.5 flex items-start gap-2 text-xs font-mono text-neutral-300 animate-fade-in">
              <div className="p-1 rounded-lg bg-electricViolet/20 text-electricViolet-glow mt-0.5 flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 leading-tight">
                <span className="text-electricViolet-glow font-bold uppercase text-[10px] block">
                  Impacto de Modo Niebla:
                </span>
                <p className="text-[11px] text-neutral-300">
                  • Menor visibilidad en el ranking de <strong>Cerca</strong>.
                  <br />
                  • <strong>No visible</strong> en la vista <strong>Radar</strong>.
                </p>
              </div>
            </div>
          )}

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
                          {item.name.split("//")[0].trim()}
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
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-2xl text-xs space-y-1.5">
            <div className="font-bold text-red-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Verificación de Identidad Requerida</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              Para erradicar perfiles falsos y bots, VESSEL exige validación digital. Puedes mantener tu rostro oculto con un avatar estilizado mientras conservas tu estatus de Verificado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal("verify")}
            className="w-full py-3 bg-mintNeon text-obsidian-deep hover:bg-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-mint-glow cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Verificar Mi Identidad Ahora</span>
          </button>
        </div>
      )}
    </div>
  );
};
