"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  YO_SOY_OPTIONS,
  MOBILITY_OPTIONS,
  HIV_STATUS_OPTIONS,
} from "@/data/mockProfiles";
import { GENDER_INTEREST_OPTIONS } from "@/data/genderCatalog";
import { getYoSoyLocalizedLabel } from "@/lib/kinks/kinkAdminService";
import { ALL_ROLE_TYPES, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import {
  GENDER_IDENTITY_OPTIONS,
  PRONOUN_OPTIONS,
  INTENTION_OPTIONS,
  BOUNDARY_OPTIONS,
  ENERGY_VIBE_CATALOG,
} from "@/data/energyCatalog";
import {
  YoSoyType,
  MobilityType,
  HivStatusType,
  EnergyVibe,
  RoleType,
  GenderInterest,
} from "@/types/vessel";
import {
  User,
  X,
  ChevronDown,
  Flame,
  Sparkles,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Sliders,
  Users,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { BrutalistButton, SectionHeroHeader } from "@/components/ui";

export interface BioTabProps {
  children?: React.ReactNode;
}

export const BioTab: React.FC<BioTabProps> = ({ children }) => {
  const {
    myProfile,
    updateMyProfile,
    language,
    t,
    openDuoModal,
    myDuoLink,
  } = useVessel();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados locales del formulario (el codename vive en una única fuente de verdad en el Hero)
  const [ageInput, setAgeInput] = useState<string>(
    myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : ""
  );
  const [showAge, setShowAge] = useState<boolean>(myProfile.showAge);
  const [twitterHandle, setTwitterHandle] = useState<string>(
    myProfile.twitterHandle || ""
  );
  const [yoSoy, setYoSoy] = useState<YoSoyType>(myProfile.yoSoy || ("" as YoSoyType));
  const [mobility, setMobility] = useState<MobilityType>(myProfile.mobility || ("" as MobilityType));
  const [hivStatus, setHivStatus] = useState<HivStatusType>(myProfile.hivStatus || ("" as HivStatusType));
  const [myRole, setMyRole] = useState<RoleType>(myProfile.role || ("" as RoleType));
  const [myHeight, setMyHeight] = useState<number>(myProfile.heightCm || 0);
  const [myWeight, setMyWeight] = useState<number>(myProfile.weightKg || 0);

  // Identidad y acuerdos (Sin valores de prueba pre-cargados)
  const [genderIdentity, setGenderIdentity] = useState<string>(
    myProfile.genderIdentity || ""
  );
  const [pronouns, setPronouns] = useState<string>(
    myProfile.pronouns || ""
  );
  const [genderInterests, setGenderInterests] = useState<GenderInterest[]>(
    myProfile.genderInterests || []
  );

  const toggleGenderInterest = (interest: GenderInterest) => {
    setGenderInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };
  const [intentions, setIntentions] = useState<string[]>(
    myProfile.intentions || []
  );
  const [myBoundaries, setMyBoundaries] = useState<string[]>(
    myProfile.boundaries || []
  );
  const [energyVibes, setEnergyVibes] = useState<EnergyVibe[]>(
    myProfile.energyVibes || []
  );

  // Sincronizar los estados del formulario cuando cambia el usuario logueado o hidrata desde Firestore
  useEffect(() => {
    setAgeInput(myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "");
    setShowAge(myProfile.showAge);
    setTwitterHandle(myProfile.twitterHandle || "");
    setYoSoy(myProfile.yoSoy || ("" as YoSoyType));
    setMobility(myProfile.mobility || ("" as MobilityType));
    setHivStatus(myProfile.hivStatus || ("" as HivStatusType));
    setMyRole(myProfile.role || ("" as RoleType));
    setMyHeight(myProfile.heightCm || 0);
    setMyWeight(myProfile.weightKg || 0);
    setGenderIdentity(myProfile.genderIdentity || "");
    setPronouns(myProfile.pronouns || "");
    setGenderInterests(myProfile.genderInterests || []);
    setIntentions(myProfile.intentions || []);
    setMyBoundaries(myProfile.boundaries || []);
    setEnergyVibes(myProfile.energyVibes || []);
  }, [myProfile]);

  const [customIntention, setCustomIntention] = useState("");
  const [customBoundary, setCustomBoundary] = useState("");

  const toggleIntention = (item: string) => {
    setIntentions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomIntention = () => {
    if (customIntention.trim() && !intentions.includes(customIntention.trim())) {
      setIntentions((prev) => [...prev, customIntention.trim()]);
      setCustomIntention("");
    }
  };

  const toggleBoundary = (item: string) => {
    setMyBoundaries((prev) =>
      prev.includes(item) ? prev.filter((b) => b !== item) : [...prev, item]
    );
  };

  const addCustomBoundary = () => {
    if (customBoundary.trim() && !myBoundaries.includes(customBoundary.trim())) {
      setMyBoundaries((prev) => [...prev, customBoundary.trim()]);
      setCustomBoundary("");
    }
  };

  const toggleEnergyVibe = (vibe: EnergyVibe) => {
    setEnergyVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const isDirty = React.useMemo(() => {
    const origAgeStr = myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "";
    if (ageInput !== origAgeStr) return true;
    if (showAge !== myProfile.showAge) return true;
    if (twitterHandle.trim().replace(/^@/, "") !== (myProfile.twitterHandle || "").replace(/^@/, "")) return true;
    if ((yoSoy || "") !== (myProfile.yoSoy || "")) return true;
    if ((mobility || "") !== (myProfile.mobility || "")) return true;
    if ((hivStatus || "") !== (myProfile.hivStatus || "")) return true;
    if ((myRole || "") !== (myProfile.role || "")) return true;
    if ((myHeight || 0) !== (myProfile.heightCm || 0)) return true;
    if ((myWeight || 0) !== (myProfile.weightKg || 0)) return true;
    if (genderIdentity !== (myProfile.genderIdentity || "")) return true;
    if (pronouns !== (myProfile.pronouns || "")) return true;

    const currentGenderInterests = [...genderInterests].sort().join(",");
    const origGenderInterests = [...(myProfile.genderInterests || [])].sort().join(",");
    if (currentGenderInterests !== origGenderInterests) return true;

    const currentIntentions = [...intentions].sort().join(",");
    const origIntentions = [...(myProfile.intentions || [])].sort().join(",");
    if (currentIntentions !== origIntentions) return true;

    const currentBoundaries = [...myBoundaries].sort().join(",");
    const origBoundaries = [...(myProfile.boundaries || [])].sort().join(",");
    if (currentBoundaries !== origBoundaries) return true;

    const currentVibes = [...energyVibes].sort().join(",");
    const origVibes = [...(myProfile.energyVibes || [])].sort().join(",");
    if (currentVibes !== origVibes) return true;

    return false;
  }, [
    ageInput,
    showAge,
    twitterHandle,
    yoSoy,
    mobility,
    hivStatus,
    myRole,
    myHeight,
    myWeight,
    genderIdentity,
    pronouns,
    genderInterests,
    intentions,
    myBoundaries,
    energyVibes,
    myProfile,
  ]);

  const buildProfilePayload = React.useCallback(() => {
    return {
      age: parseInt(ageInput) || 0,
      showAge,
      twitterHandle: twitterHandle.trim().replace(/^@/, ""),
      yoSoy,
      mobility,
      hivStatus,
      role: myRole,
      heightCm: myHeight || 0,
      weightKg: myWeight || 0,
      genderIdentity,
      pronouns,
      genderInterests,
      desires: myProfile.desires || [],
      intentions,
      boundaries: myBoundaries,
      energyVibes,
      isProfileCustomized: true,
    };
  }, [
    ageInput,
    showAge,
    twitterHandle,
    yoSoy,
    mobility,
    hivStatus,
    myRole,
    myHeight,
    myWeight,
    genderIdentity,
    pronouns,
    genderInterests,
    myProfile.desires,
    intentions,
    myBoundaries,
    energyVibes,
  ]);

  // Auto-save al desmontar (cambio de pestaña) si quedaron cambios sin guardar
  const autoSaveRef = React.useRef({ isDirty: false, save: () => {} });
  useEffect(() => {
    autoSaveRef.current = {
      isDirty,
      save: () => updateMyProfile(buildProfilePayload()),
    };
  }, [isDirty, updateMyProfile, buildProfilePayload]);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current.isDirty) {
        autoSaveRef.current.save();
      }
    };
  }, []);

  const handleSave = () => {
    audioEngine.playPulse();
    updateMyProfile(buildProfilePayload());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleDiscard = () => {
    audioEngine.playPulse();
    setAgeInput(myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "");
    setShowAge(myProfile.showAge);
    setTwitterHandle(myProfile.twitterHandle || "");
    setYoSoy(myProfile.yoSoy || ("" as YoSoyType));
    setMobility(myProfile.mobility || ("" as MobilityType));
    setHivStatus(myProfile.hivStatus || ("" as HivStatusType));
    setMyRole(myProfile.role || ("" as RoleType));
    setMyHeight(myProfile.heightCm || 0);
    setMyWeight(myProfile.weightKg || 0);
    setGenderIdentity(myProfile.genderIdentity || "");
    setPronouns(myProfile.pronouns || "");
    setGenderInterests(myProfile.genderInterests || []);
    setIntentions(myProfile.intentions || []);
    setMyBoundaries(myProfile.boundaries || []);
    setEnergyVibes(myProfile.energyVibes || []);
    autoSaveRef.current.isDirty = false;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Información Corporal & Ficha */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-5 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "DATOS VITALES DEL PERFIL" : "PROFILE VITAL STATS"}
          tag={language === "es" ? "PERFIL" : "PROFILE"}
          subtitle={language === "es" ? "Parámetros físicos y atributos visibles en la matriz y el radar" : "Physical parameters and attributes"}
          variant="violet"
          icon={<Sliders className="w-4 h-4 text-electricViolet-glow" />}
        />

        {/* 1. NOMBRE DE USUARIO / ALIAS EN VESSEL (Single Source of Truth en el Hero) */}
        <div className="flex items-center justify-between gap-3 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-electricViolet-glow flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                {t.account.codenameLabel || "Nombre de Usuario"}
              </span>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wide truncate block">
                @{myProfile.codename || "VESSEL_USER"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              window.dispatchEvent(new CustomEvent("vessel:edit-codename"));
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-electricViolet-glow" />
            <span>{language === "es" ? "Cambiar Alias" : "Edit Alias"}</span>
          </button>
        </div>

        {/* 2. EDAD CON CONTROL DE MOSTRAR / OCULTAR */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-white block">
            {t.account.ageLabel || "Edad"}
          </label>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-[140px]">
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder={t.account.ageLabel || "Edad"}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-4 py-2.5 focus:outline-none focus:border-electricViolet transition-colors"
              />
              {ageInput && (
                <button
                  type="button"
                  onClick={() => setAgeInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-3 py-2 rounded-xl min-h-[44px]">
              <span className="text-xs text-neutral-300 font-mono">
                {t.account.showAgeLabel}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-neutral-400">
                  {showAge
                    ? (language === "es" ? "SÍ" : "YES")
                    : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showAge}
                  onClick={() => {
                    setShowAge(!showAge);
                    audioEngine.playPulse();
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    showAge ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
                  }`}
                  aria-label={t.account.showAgeLabel}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      showAge ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. IDENTIDAD DE GÉNERO & PRONOMBRES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              {t.account.genderLabel}
            </label>
            <div className="relative">
              <select
                value={genderIdentity || ""}
                onChange={(e) => setGenderIdentity(e.target.value)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {GENDER_IDENTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-obsidian text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              {t.account.pronounsLabel}
            </label>
            <div className="relative">
              <select
                value={pronouns || ""}
                onChange={(e) => setPronouns(e.target.value)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {PRONOUN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-obsidian text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4. ARQUETIPOS VESSEL: YO SOY, MOVILIDAD Y ESTADO VIH */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              {language === "es" ? "Yo Soy" : "I Am"}
            </label>
            <div className="relative">
              <select
                value={yoSoy || ""}
                onChange={(e) => setYoSoy(e.target.value as YoSoyType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {YO_SOY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-obsidian text-white">
                    {getYoSoyLocalizedLabel(opt, t)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              {t.account.mobilityLabel}
            </label>
            <div className="relative">
              <select
                value={mobility || ""}
                onChange={(e) => setMobility(e.target.value as MobilityType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {MOBILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-obsidian text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-white block">
              {t.account.hivLabel}
            </label>
            <div className="relative">
              <select
                value={hivStatus || ""}
                onChange={(e) => setHivStatus(e.target.value as HivStatusType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {HIV_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-obsidian text-white">
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 5. ROL, ESTATURA Y PESO */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              {t.account.roleLabel}
            </label>
            <div className="relative">
              <select
                value={myRole || ""}
                onChange={(e) => setMyRole(e.target.value as RoleType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 appearance-none focus:border-electricViolet focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-obsidian text-neutral-500">
                  {language === "es" ? "Seleccionar..." : "Select..."}
                </option>
                {ALL_ROLE_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {getRoleDisplayLabel(r, language, t)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              {language === "es" ? "Altura (cm)" : "Height (cm)"}
            </label>
            <input
              type="number"
              value={myHeight && myHeight > 0 ? myHeight : ""}
              onChange={(e) => setMyHeight(parseInt(e.target.value) || 0)}
              placeholder="Ej. 178"
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 placeholder:text-neutral-500 focus:border-electricViolet focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              {language === "es" ? "Peso (kg)" : "Weight (kg)"}
            </label>
            <input
              type="number"
              value={myWeight && myWeight > 0 ? myWeight : ""}
              onChange={(e) => setMyWeight(parseInt(e.target.value) || 0)}
              placeholder="Ej. 75"
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 placeholder:text-neutral-500 focus:border-electricViolet focus:outline-none"
            />
          </div>
        </div>

        {/* 6. NICKNAME DE X (OPCIONAL) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-white block">
            {t.account.twitterLabel}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold font-mono">
              @
            </span>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="tu_usuario_de_x"
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono pl-8 pr-4 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet transition-colors"
            />
          </div>
        </div>
      </div>

      {/* INTERESES DE ENCUENTRO */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-electricViolet-glow" />
            <span>{language === "es" ? "Intereses de Encuentro" : "Encounter Interests"}</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {genderInterests.length} {language === "es" ? "seleccionados" : "selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GENDER_INTEREST_OPTIONS.map((interest) => {
            const isSelected = genderInterests.includes(interest.id);
            return (
              <button
                type="button"
                key={interest.id}
                onClick={() => {
                  toggleGenderInterest(interest.id);
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer min-h-[44px] active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isSelected
                    ? "bg-electricViolet/20 border-electricViolet font-bold shadow-violet-soft text-white ring-1 ring-electricViolet/50"
                    : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{interest.emoji}</span>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold block truncate">
                    {interest.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ENERGÍA DESEADA & VIBES ACTUALES */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-electricViolet-glow" />
            <span>{t.account.energyVibesSection}</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {energyVibes.length} {language === "es" ? "seleccionadas" : "selected"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ENERGY_VIBE_CATALOG.map((vibe) => {
            const isSelected = energyVibes.includes(vibe.id);
            return (
              <button
                type="button"
                key={vibe.id}
                onClick={() => {
                  toggleEnergyVibe(vibe.id);
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer min-h-[44px] active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isSelected
                    ? `${vibe.tagColor} border-current font-bold ring-2 ring-electricViolet/30 shadow-violet-soft`
                    : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{vibe.emoji}</span>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold block truncate">
                    {vibe.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 block truncate leading-tight opacity-80">
                    {vibe.description.split(",")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTENCIONES CLARAS */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-bloodNeon" />
            <span>{t.account.intentionsLabel}</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {intentions.length} {language === "es" ? "seleccionadas" : "selected"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {INTENTION_OPTIONS.map((item) => {
            const isSelected = intentions.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => {
                  toggleIntention(item);
                  audioEngine.playPulse();
                }}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
                  isSelected
                    ? "bg-bloodNeon text-white border-bloodNeon font-bold shadow-blood-glow"
                    : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
          {intentions
            .filter((i) => !(INTENTION_OPTIONS as readonly string[]).includes(i))
            .map((custom) => (
              <button
                type="button"
                key={custom}
                onClick={() => {
                  toggleIntention(custom);
                  audioEngine.playPulse();
                }}
                className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold bg-bloodNeon text-white border border-bloodNeon flex items-center gap-1.5 cursor-pointer shadow-blood-glow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon"
              >
                <span>{custom}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customIntention}
            onChange={(e) => setCustomIntention(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomIntention();
              }
            }}
            placeholder={language === "es" ? "Sumar otra intención..." : "Add custom intention..."}
            className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-bloodNeon"
          />
          <BrutalistButton
            variant="secondary"
            size="default"
            onClick={addCustomIntention}
          >
            {language === "es" ? "+ Sumar" : "+ Add"}
          </BrutalistButton>
        </div>
      </div>

      {/* LÍMITES PERSONALES & CONSENTIMIENTO */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{t.account.boundariesLabel}</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {myBoundaries.length} {language === "es" ? "definidos" : "defined"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {BOUNDARY_OPTIONS.map((item) => {
            const isSelected = myBoundaries.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => {
                  toggleBoundary(item);
                  audioEngine.playPulse();
                }}
                className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                  isSelected
                    ? "bg-purple-950/40 border-purple-500 text-purple-300 font-bold shadow-sm"
                    : "bg-black/50 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{item}</span>
              </button>
            );
          })}
          {myBoundaries
            .filter((b) => !(BOUNDARY_OPTIONS as readonly string[]).includes(b))
            .map((custom) => (
              <button
                type="button"
                key={custom}
                onClick={() => {
                  toggleBoundary(custom);
                  audioEngine.playPulse();
                }}
                className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-500 flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{custom}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customBoundary}
            onChange={(e) => setCustomBoundary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomBoundary();
              }
            }}
            placeholder={language === "es" ? "Sumar otro límite claro..." : "Add custom boundary..."}
            className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
          />
          <BrutalistButton
            variant="secondary"
            size="default"
            onClick={addCustomBoundary}
          >
            {language === "es" ? "+ Sumar" : "+ Add"}
          </BrutalistButton>
        </div>
      </div>

      {/* MODO DÚO // PERFIL DE PAREJA */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-electricViolet-glow flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider truncate">
                {language === "es" ? "Modo Dúo // Perfil de Pareja" : "Duo Mode // Couple Profile"}
              </h4>
              <p className="text-[10px] text-neutral-400 font-sans truncate">
                {myDuoLink?.isLinked
                  ? `Vinculado actualmente con @${myDuoLink.partnerCodename}`
                  : (language === "es" ? "Vinculá tu perfil con tu pareja para citas compartidas" : "Link your profile with your partner")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openDuoModal}
            className={`px-3 py-1.5 min-h-[44px] rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
              myDuoLink?.isLinked
                ? "bg-electricViolet/20 border border-electricViolet text-electricViolet-glow hover:bg-electricViolet/30"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
            }`}
          >
            {myDuoLink?.isLinked
              ? (language === "es" ? "Gestionar Dúo" : "Manage Duo")
              : (language === "es" ? "+ Activar Dúo" : "+ Activate Duo")}
          </button>
        </div>
      </div>

      {children}

      {/* FLOATING SAVE BAR (Thumb Zone sticky bottom-20 z-40) */}
      {(isDirty || savedSuccess) && (
        <div className="sticky bottom-20 z-40 pt-2 animate-fade-in">
          <div className="bg-obsidian-surface/95 backdrop-blur-xl border border-electricViolet/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-electricViolet/30">
            <div className="flex items-center gap-2 min-w-0 pl-1">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  savedSuccess ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-xs font-mono font-bold text-white truncate">
                {savedSuccess
                  ? (t.account.savedSuccess || "¡PERFIL GUARDADO!")
                  : (t.account.unsavedChangesLabel || "Cambios sin guardar")}
              </span>
            </div>
            {isDirty && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.account.discardBtn || "Descartar"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-violet-soft transition-all cursor-pointer active:scale-95"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>{t.account.saveNowBtn || "Guardar Ahora"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
