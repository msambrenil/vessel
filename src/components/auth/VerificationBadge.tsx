"use client";

import React, { useState } from "react";
import { IdentityVerification } from "@/types/vessel";
import {
  ShieldCheck,
  Fingerprint,
  EyeOff,
  CheckCircle2,
  Sparkles,
  X,
  Lock,
} from "lucide-react";

interface VerificationBadgeProps {
  verification?: IdentityVerification;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  interactive?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  size = "sm",
  showLabel = false,
  interactive = true,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!verification || !verification.isVerified) {
    return null;
  }

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const getMethodLabel = () => {
    switch (verification.method) {
      case "biometric_liveness":
        return "Biometría Facial // Liveness 3D";
      case "oauth_google":
        return "Google OAuth Seguro";
      case "id_document":
        return "Documento de Identidad";
      case "email":
        return "Correo Electrónico Verificado";
      case "phone_sms":
        return "SMS / Teléfono Verificado";
      default:
        return "Identidad Digital Criptográfica";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      e.stopPropagation();
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`inline-flex items-center gap-1 bg-mintNeon/15 border border-mintNeon/40 text-mintNeon rounded-full px-2 py-0.5 font-bold shadow-mint-glow transition-all select-none ${
          interactive ? "cursor-pointer hover:bg-mintNeon/25 hover:border-mintNeon" : ""
        } ${className}`}
        title="Usuario Verificado por ID // 100% Humano Real"
      >
        <ShieldCheck className={`${iconSizes[size]} flex-shrink-0 text-mintNeon stroke-[2.5]`} />

        {verification.hasFacialPrivacy && (
          <span title="Privacidad Facial Activa (Avatar Estilizado Verificado)">
            <EyeOff className="w-3 h-3 text-neutral-300 flex-shrink-0" />
          </span>
        )}

        {showLabel && (
          <span className="text-[10px] uppercase font-mono tracking-tight font-extrabold text-white">
            {verification.hasFacialPrivacy ? "ID Verificado • Stealth" : "ID Verificado"}
          </span>
        )}
      </div>

      {/* Modal Informativo del Certificado de Verificación */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in select-none text-left"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-obsidian-deep border border-mintNeon/40 rounded-3xl p-5 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-mintNeon text-obsidian-deep shadow-mint-glow">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Identidad Verificada // ID
                  </h3>
                  <p className="text-[10px] text-mintNeon-glow font-mono">
                    Protocolo Anti-Bot & Zero-Fake
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Estado y Puntuación de Confianza */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Nivel de Confianza:
                </span>
                <span className="text-xs font-extrabold text-mintNeon font-mono bg-mintNeon/15 px-2.5 py-0.5 rounded-full border border-mintNeon/30">
                  {verification.trustScore}% AUTÉNTICO
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Método Validado:
                </span>
                <span className="text-xs font-bold text-white">
                  {getMethodLabel()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Fecha de Validación:
                </span>
                <span className="text-xs font-mono text-neutral-300">
                  {verification.verifiedAt || "AGO 2026"}
                </span>
              </div>
            </div>

            {/* Explicación de Privacidad Facial */}
            {verification.hasFacialPrivacy ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <EyeOff className="w-4 h-4 text-mintNeon flex-shrink-0" />
                  <span>Protección de Identidad Visual Activa</span>
                </div>
                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                  Este usuario verificó su identidad humana y unicidad digital, pero optó por un <strong>avatar estilizado</strong> para proteger su rostro de miradas públicas en la cuadrícula general.
                </p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-mintNeon flex-shrink-0" />
                  <span>Rostro Verificado en Vivo</span>
                </div>
                <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                  La fotografía coincide con la prueba biométrica de liveness 3D realizada durante el registro.
                </p>
              </div>
            )}

            {/* Hash Criptográfico Zero-Knowledge */}
            {verification.certificateHash && (
              <div className="pt-1 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
                <span>Certificado ZK:</span>
                <span className="text-neutral-400">{verification.certificateHash}</span>
              </div>
            )}

            {/* Botón de Cierre */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
