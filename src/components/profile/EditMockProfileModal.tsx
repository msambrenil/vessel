"use client";

import React, { useState } from "react";
import { VesselProfile, RoleType, BodyState, MobilityType } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { MOBILITY_OPTIONS } from "@/data/mockProfiles";
import {
  X,
  User,
  ShieldCheck,
  Check,
  Sliders,
  Camera,
  ChevronDown,
  Sparkles,
  CloudFog,
  Radio,
  Home,
} from "lucide-react";

interface EditMockProfileModalProps {
  profile: VesselProfile;
  onClose: () => void;
  onSaved?: (updatedProfile: VesselProfile) => void;
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

const BODY_STATE_OPTIONS: { id: BodyState; label: string; sub: string }[] = [
  { id: "open", label: "Activo (Open)", sub: "Visible en radar / abierto a conectar" },
  { id: "occupied", label: "Ocupado (Busy)", sub: "No disponible ahora" },
  { id: "dormant", label: "De incógnito (Dormant)", sub: "Oculto en el radar" },
];

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
];

export const EditMockProfileModal: React.FC<EditMockProfileModalProps> = ({
  profile,
  onClose,
  onSaved,
}) => {
  const { updateProfile, t, language } = useVessel();

  const [codename, setCodename] = useState(profile.codename || "");
  const [role, setRole] = useState<RoleType>(profile.role || "Versatile");
  const [age, setAge] = useState<string>(profile.age ? profile.age.toString() : "26");
  const [showAge, setShowAge] = useState<boolean>(profile.showAge !== false);
  const [mobility, setMobility] = useState<MobilityType>(profile.mobility || "Tengo depto / lugar");
  const [bodyState, setBodyState] = useState<BodyState>(profile.bodyState || "open");
  const [isFogMode, setIsFogMode] = useState<boolean>(profile.isFogMode || false);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl || PRESET_AVATARS[0]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename.trim()) return;

    setIsSaving(true);
    audioEngine.playPulse();

    const cleanCodename = codename.trim().toUpperCase();
    const cleanAge = parseInt(age) || 26;

    const updates: Partial<VesselProfile> = {
      codename: cleanCodename,
      role,
      age: cleanAge,
      showAge,
      mobility,
      bodyState,
      isFogMode,
      avatarUrl,
    };

    updateProfile(profile.id, updates);

    const updatedFull: VesselProfile = {
      ...profile,
      ...updates,
    };

    if (onSaved) {
      onSaved(updatedFull);
    }

    setSavedSuccess(true);
    audioEngine.playVaultUnlock();

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-obsidian-deep border border-electricViolet/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 flex items-center justify-center shadow-violet-soft">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                  Editar Perfil de Prueba
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow font-bold border border-electricViolet/40">
                  DEV // MOCK
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Modificá el nombre y datos de este usuario en las tarjetas y radar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar edición de perfil"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>¡Perfil de prueba actualizado con éxito!</span>
            </div>
          )}

          {/* 1. Nombre de Usuario / Codename */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
                Nombre de Usuario (Codename en Tarjeta) <span className="text-electricViolet-glow">*</span>
              </label>
              <span className="text-[9px] font-mono text-neutral-400">Visible en la matriz</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-electricViolet-glow">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Ej: ALEX_01, MARCUS_VIP, etc."
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet transition-colors font-mono font-bold uppercase tracking-wide"
              />
            </div>
          </div>

          {/* 2. Rol Corporal */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
              Rol / Dinámica en la Cama
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 appearance-none focus:outline-none focus:border-electricViolet transition-colors font-mono cursor-pointer"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-neutral-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Edad y Visibilidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
                Edad
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="26"
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 focus:outline-none focus:border-electricViolet transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
                Mostrar Edad
              </label>
              <button
                type="button"
                onClick={() => setShowAge(!showAge)}
                className={`w-full min-h-[44px] rounded-xl border flex items-center justify-center gap-2 font-mono font-bold text-xs transition-all cursor-pointer ${
                  showAge
                    ? "bg-electricViolet/15 border-electricViolet/40 text-electricViolet-glow"
                    : "bg-white/5 border-white/10 text-neutral-500"
                }`}
              >
                <span>{showAge ? "Pública (Visible)" : "Oculta"}</span>
              </button>
            </div>
          </div>

          {/* 4. Lugar / Movilidad */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
              Lugar / Movilidad
            </label>
            <div className="relative">
              <select
                value={mobility}
                onChange={(e) => setMobility(e.target.value as MobilityType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 appearance-none focus:outline-none focus:border-electricViolet transition-colors font-mono cursor-pointer"
              >
                {MOBILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-neutral-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. Estado Corporal */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
              Estado Corporal Inmediato
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {BODY_STATE_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setBodyState(st.id)}
                  className={`p-2 min-h-[44px] rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    bodyState === st.id
                      ? "bg-electricViolet text-white border-electricViolet font-bold shadow-violet-soft"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold leading-tight block">
                    {st.id.toUpperCase()}
                  </span>
                  <span className="text-[8px] opacity-80 leading-tight block truncate w-full">
                    {st.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Modo Niebla (Privacidad Facial) */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudFog className="w-4 h-4 text-electricViolet-glow" />
              <div>
                <span className="text-xs font-bold text-white font-mono block">Modo Niebla</span>
                <span className="text-[9px] text-neutral-400">Difuminar rostro en tarjeta</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFogMode(!isFogMode)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                isFogMode ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  isFogMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 7. Selector de Fotografía de Perfil */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white uppercase font-mono tracking-wider block">
              Fotografía de Perfil
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-14 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer relative ${
                    avatarUrl === url
                      ? "border-electricViolet scale-105 shadow-violet-soft ring-1 ring-electricViolet"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar preset ${idx}`}
                    className={`w-full h-full object-cover ${isFogMode ? "filter blur-[3px]" : ""}`}
                  />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-electricViolet/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-electricViolet-glow stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 font-mono"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Cambios del Perfil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
