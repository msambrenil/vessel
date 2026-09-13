"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ProfileDossier, ProfileRankingTier } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import {
  PRESET_RED_FLAGS,
  PRESET_GREEN_FLAGS,
  RANKING_TIER_CONFIG,
  DOSSIER_VERDICT_CONFIG,
} from "@/data/dossierCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Lock,
  Star,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

interface ProfileDossierSectionProps {
  profileId: string;
  profileCodename: string;
}

export const ProfileDossierSection: React.FC<ProfileDossierSectionProps> = ({
  profileId,
  profileCodename,
}) => {
  const { getProfileDossier, saveProfileDossier, deleteProfileDossier, t, language } = useVessel();

  const dossier = getProfileDossier(profileId);

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [customAlias, setCustomAlias] = useState<string>(dossier?.customAlias || "");
  const [privateNotes, setPrivateNotes] = useState<string>(dossier?.privateNotes || "");
  const [rating, setRating] = useState<number | undefined>(dossier?.rating);
  const [rankingTier, setRankingTier] = useState<ProfileRankingTier | undefined>(
    dossier?.rankingTier
  );
  const [redFlags, setRedFlags] = useState<string[]>(dossier?.redFlags || []);
  const [greenFlags, setGreenFlags] = useState<string[]>(dossier?.greenFlags || []);

  const [customRedFlagInput, setCustomRedFlagInput] = useState<string>("");
  const [customGreenFlagInput, setCustomGreenFlagInput] = useState<string>("");
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Sincronizar si cambia el profileId
  useEffect(() => {
    const current = getProfileDossier(profileId);
    setCustomAlias(current?.customAlias || "");
    setPrivateNotes(current?.privateNotes || "");
    setRating(current?.rating);
    setRankingTier(current?.rankingTier);
    setRedFlags(current?.redFlags || []);
    setGreenFlags(current?.greenFlags || []);
  }, [profileId, getProfileDossier]);

  // Manejar guardado
  const handleSave = (customUpdates?: Partial<ProfileDossier>) => {
    audioEngine.playSubBass(52, 0.12);
    
    const payload: Partial<ProfileDossier> = {
      customAlias: customUpdates?.customAlias !== undefined ? customUpdates.customAlias : customAlias.trim() || undefined,
      privateNotes: customUpdates?.privateNotes !== undefined ? customUpdates.privateNotes : privateNotes.trim() || undefined,
      rating: customUpdates?.rating !== undefined ? customUpdates.rating : rating,
      rankingTier: customUpdates?.rankingTier !== undefined ? customUpdates.rankingTier : rankingTier,
      redFlags: customUpdates?.redFlags !== undefined ? customUpdates.redFlags : redFlags,
      greenFlags: customUpdates?.greenFlags !== undefined ? customUpdates.greenFlags : greenFlags,
    };

    saveProfileDossier(profileId, payload);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  // Toggle de bandera roja
  const toggleRedFlag = (flagLabel: string) => {
    audioEngine.playSubBass(45, 0.08);
    const updated = redFlags.includes(flagLabel)
      ? redFlags.filter((f) => f !== flagLabel)
      : [...redFlags, flagLabel];
    setRedFlags(updated);
    handleSave({ redFlags: updated });
  };

  // Añadir bandera roja personalizada
  const addCustomRedFlag = () => {
    const trimmed = customRedFlagInput.trim();
    if (!trimmed) return;
    if (!redFlags.includes(trimmed)) {
      audioEngine.playSubBass(48, 0.1);
      const updated = [...redFlags, trimmed];
      setRedFlags(updated);
      handleSave({ redFlags: updated });
    }
    setCustomRedFlagInput("");
  };

  // Toggle de bandera verde
  const toggleGreenFlag = (flagLabel: string) => {
    audioEngine.playSubBass(65, 0.08);
    const updated = greenFlags.includes(flagLabel)
      ? greenFlags.filter((f) => f !== flagLabel)
      : [...greenFlags, flagLabel];
    setGreenFlags(updated);
    handleSave({ greenFlags: updated });
  };

  // Añadir bandera verde personalizada
  const addCustomGreenFlag = () => {
    const trimmed = customGreenFlagInput.trim();
    if (!trimmed) return;
    if (!greenFlags.includes(trimmed)) {
      audioEngine.playSubBass(70, 0.1);
      const updated = [...greenFlags, trimmed];
      setGreenFlags(updated);
      handleSave({ greenFlags: updated });
    }
    setCustomGreenFlagInput("");
  };

  // Seleccionar rating / veredicto
  const handleSelectRating = (stars: number) => {
    audioEngine.playSubBass(55 + stars * 4, 0.1);
    const nextRating = rating === stars ? undefined : stars;
    const tierMap: Record<number, ProfileRankingTier> = { 5: "S", 4: "A", 3: "B", 2: "D", 1: "F" };
    const nextTier = nextRating ? tierMap[nextRating] : undefined;
    setRating(nextRating);
    setRankingTier(nextTier);
    handleSave({ rating: nextRating, rankingTier: nextTier });
  };

  // Borrar dossier completo
  const handleDelete = () => {
    if (window.confirm(t.dossier.deleteConfirm)) {
      audioEngine.playSubBass(40, 0.2);
      deleteProfileDossier(profileId);
      setCustomAlias("");
      setPrivateNotes("");
      setRating(undefined);
      setRankingTier(undefined);
      setRedFlags([]);
      setGreenFlags([]);
      setShowSavedFeedback(false);
    }
  };

  const hasAnyData = !!(
    customAlias ||
    privateNotes ||
    rating ||
    rankingTier ||
    redFlags.length > 0 ||
    greenFlags.length > 0
  );

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <section className="bg-obsidian-surface rounded-2xl border border-white/10 overflow-hidden shadow-card-elevation transition-all">
      {/* CABECERA COLAPSABLE CON BADGE CONFIDENCIAL */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-all select-none border-b border-white/5"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-electricViolet/10 border border-electricViolet/30 text-electricViolet-glow shadow-violet-soft flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {t.dossier.title}
              </h2>
              {hasAnyData && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40">
                  {language === "es" ? "ACTIVO" : "ACTIVE"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {t.dossier.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rating && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black ${DOSSIER_VERDICT_CONFIG[rating].badgeColor}`}
            >
              {DOSSIER_VERDICT_CONFIG[rating].icon} {DOSSIER_VERDICT_CONFIG[rating].shortTag[language]}
            </span>
          )}
          <button
            type="button"
            aria-label={isOpen ? "Colapsar sección" : "Expandir sección"}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CONTENIDO EXPANDIBLE */}
      {isOpen && (
        <div className="p-4 space-y-5">
          
          {/* AVISO DE PRIVACIDAD CRIPTOGRÁFICA */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-neutral-400">
            <Info className="w-4 h-4 text-electricViolet-glow flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.dossier.privacyNotice}
            </p>
          </div>

          {/* 1. APODO / NOMBRE PERSONALIZADO */}
          <div className="space-y-1.5">
            <label
              htmlFor={`alias-${profileId}`}
              className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 font-mono"
            >
              <Tag className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{t.dossier.customAliasLabel}</span>
            </label>
            <div className="relative">
              <input
                id={`alias-${profileId}`}
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                onBlur={() => handleSave()}
                placeholder={t.dossier.customAliasPlaceholder}
                className="w-full bg-black/50 border border-white/10 focus:border-electricViolet rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:ring-1 focus:ring-electricViolet transition-all"
              />
              {customAlias && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomAlias("");
                    handleSave({ customAlias: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {customAlias && (
              <div className="text-[10px] text-electricViolet-glow font-mono flex items-center gap-1 pl-1">
                <span>👁️ {t.dossier.aliasBadgePrefix}</span>
                <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
                  {customAlias}
                </span>
                <span className="text-neutral-500">({profileCodename})</span>
              </div>
            )}
          </div>

          {/* 2. QUÍMICA & CALIFICACIÓN (100% LIMPIO Y UNIFICADO) */}
          <div className="space-y-3 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Flame className="w-3.5 h-3.5 text-bloodNeon fill-bloodNeon" />
                <span>{t.dossier.rankingLabel}</span>
              </span>
              {activeRating && (
                <span className="text-[11px] font-mono font-bold text-white">
                  {activeRating}/5 ★
                </span>
              )}
            </div>

            {/* Selector de 1 a 5 Estrellas Interactivas con Feedback Semántico */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-3 shadow-inner">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
                {[1, 2, 3, 4, 5].map((starNum) => {
                  const isFilled = activeRating !== undefined && activeRating !== null && starNum <= activeRating;
                  return (
                    <button
                      key={starNum}
                      type="button"
                      onClick={() => handleSelectRating(starNum)}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(null)}
                      aria-label={`Calificar con ${starNum} estrellas`}
                      className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer group"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-200 ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                            : "text-neutral-600 group-hover:text-neutral-400 group-hover:scale-105"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Resumen dinámico del veredicto */}
              <div className="text-center min-h-[24px] flex items-center justify-center">
                {activeRating && DOSSIER_VERDICT_CONFIG[activeRating] ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-white/5 border border-white/10 animate-in fade-in">
                    <span>{DOSSIER_VERDICT_CONFIG[activeRating].icon}</span>
                    <span className={DOSSIER_VERDICT_CONFIG[activeRating].textColor}>
                      {DOSSIER_VERDICT_CONFIG[activeRating].title[language]}
                    </span>
                    <span className="text-neutral-400 font-normal text-[11px] hidden sm:inline">
                      — {DOSSIER_VERDICT_CONFIG[activeRating].description[language]}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500 font-mono">
                    {t.dossier.stars.unrated}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. RED FLAGS (ALERTAS PREVENTIVAS) */}
          <div className="space-y-2.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-bloodNeon uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.dossier.redFlagsLabel}</span>
              </span>
              {redFlags.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-bloodNeon bg-bloodNeon/15 border border-bloodNeon/30 px-2 py-0.5 rounded-full">
                  {redFlags.length} {language === "es" ? "alertas" : "warnings"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              {t.dossier.redFlagsSub}
            </p>

            {/* Presets Rápidos de Red Flags */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_RED_FLAGS.map((preset) => {
                const label = preset.label[language];
                const isSelected = redFlags.includes(label);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => toggleRedFlag(label)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-bloodNeon text-white border-bloodNeon shadow-[0_0_10px_rgba(255,0,51,0.5)] font-semibold"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:border-bloodNeon/50 hover:text-white"
                    }`}
                  >
                    <span>{preset.icon || "🚩"}</span>
                    <span>{label}</span>
                    {isSelected && <X className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            {/* Input para agregar Red Flag personalizada */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customRedFlagInput}
                onChange={(e) => setCustomRedFlagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomRedFlag();
                  }
                }}
                placeholder={t.dossier.customFlagPlaceholder}
                className="flex-1 bg-black/50 border border-white/10 focus:border-bloodNeon rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:ring-1 focus:ring-bloodNeon transition-all"
              />
              <button
                type="button"
                onClick={addCustomRedFlag}
                disabled={!customRedFlagInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon/40 text-bloodNeon hover:bg-bloodNeon hover:text-white text-xs font-bold font-mono transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. GREEN FLAGS (PUNTOS A FAVOR) */}
          <div className="space-y-2.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.dossier.greenFlagsLabel}</span>
              </span>
              {greenFlags.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {greenFlags.length} {language === "es" ? "puntos" : "points"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              {t.dossier.greenFlagsSub}
            </p>

            {/* Presets Rápidos de Green Flags */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_GREEN_FLAGS.map((preset) => {
                const label = preset.label[language];
                const isSelected = greenFlags.includes(label);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => toggleGreenFlag(label)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-emerald-500/25 text-emerald-100 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-bold ring-1 ring-emerald-400/40"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:border-emerald-500/50 hover:text-white"
                    }`}
                  >
                    <span>{preset.icon || "🟢"}</span>
                    <span>{label}</span>
                    {isSelected && <X className="w-3 h-3 ml-0.5 stroke-[2.5] text-emerald-300" />}
                  </button>
                );
              })}
            </div>

            {/* Input para agregar Green Flag personalizada */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customGreenFlagInput}
                onChange={(e) => setCustomGreenFlagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomGreenFlag();
                  }
                }}
                placeholder={t.dossier.customFlagPlaceholder}
                className="flex-1 bg-black/50 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={addCustomGreenFlag}
                disabled={!customGreenFlagInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold font-mono transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. NOTAS PRIVADAS & BITÁCORA */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <label
              htmlFor={`notes-${profileId}`}
              className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between font-mono"
            >
              <span>{t.dossier.privateNotesLabel}</span>
              {showSavedFeedback && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.dossier.savedToast}</span>
                </span>
              )}
            </label>
            <textarea
              id={`notes-${profileId}`}
              rows={4}
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              onBlur={() => handleSave()}
              placeholder={t.dossier.privateNotesPlaceholder}
              className="w-full bg-black/50 border border-white/10 focus:border-electricViolet rounded-xl p-3 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:ring-1 focus:ring-electricViolet transition-all resize-y leading-relaxed"
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-between gap-2 pt-2">
            {hasAnyData ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-bloodNeon/50 hover:bg-bloodNeon/10 text-neutral-400 hover:text-bloodNeon text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.dossier.deleteBtn}</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-extrabold font-mono transition-all flex items-center gap-1.5 shadow-violet-soft cursor-pointer active:scale-95 ml-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.dossier.saveBtn}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
