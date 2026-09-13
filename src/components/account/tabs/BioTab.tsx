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
import {
  GENDER_IDENTITY_OPTIONS,
  PRONOUN_OPTIONS,
  DESIRE_OPTIONS,
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
  Check,
  BadgeCheck,
  Clock,
  Sliders,
  Mic,
  Trash2,
} from "lucide-react";
import { BrutalistButton, TacticalBadge, SectionHeroHeader } from "@/components/ui";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";

export const BioTab: React.FC = () => {
  const {
    myProfile,
    updateMyProfile,
    myOnTheClock,
    startOnTheClock,
    stopOnTheClock,
    myVoiceVibe,
    openVoiceRecorder,
    deleteMyVoiceVibe,
    language,
    t,
  } = useVessel();

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [onTheClockNote, setOnTheClockNote] = useState<string>("");

  // Estados locales del formulario
  const [codenameInput, setCodenameInput] = useState<string>(
    myProfile.codename || "VESSEL_USER"
  );
  const [ageInput, setAgeInput] = useState<string>(myProfile.age.toString());
  const [showAge, setShowAge] = useState<boolean>(myProfile.showAge);
  const [twitterHandle, setTwitterHandle] = useState<string>(
    myProfile.twitterHandle || ""
  );
  const [yoSoy, setYoSoy] = useState<YoSoyType>(myProfile.yoSoy);
  const [mobility, setMobility] = useState<MobilityType>(myProfile.mobility);
  const [hivStatus, setHivStatus] = useState<HivStatusType>(myProfile.hivStatus);
  const [myRole, setMyRole] = useState<RoleType>(myProfile.role);
  const [myHeight, setMyHeight] = useState(myProfile.heightCm);
  const [myWeight, setMyWeight] = useState(myProfile.weightKg);

  useEffect(() => {
    if (myProfile.codename) {
      setCodenameInput(myProfile.codename);
    }
  }, [myProfile.codename]);

  // Identidad y acuerdos
  const [genderIdentity, setGenderIdentity] = useState<string>(
    myProfile.genderIdentity || "Hombre Cis"
  );
  const [pronouns, setPronouns] = useState<string>(
    myProfile.pronouns || "Él / He / Him"
  );
  const [genderInterests, setGenderInterests] = useState<GenderInterest[]>(
    myProfile.genderInterests || ["all"]
  );

  const toggleGenderInterest = (interest: GenderInterest) => {
    setGenderInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };
  const [desires, setDesires] = useState<string[]>(
    myProfile.desires || ["Conexión carnal intensa", "Sensualidad pausada"]
  );
  const [intentions, setIntentions] = useState<string[]>(
    myProfile.intentions || [
      "Ahora mismo (Inmediato)",
      "Follamigos / Contacto regular",
    ]
  );
  const [myBoundaries, setMyBoundaries] = useState<string[]>(
    myProfile.boundaries || [
      "Solo sexo seguro con protección",
      "Respeto estricto a Safe-Words",
    ]
  );
  const [energyVibes, setEnergyVibes] = useState<EnergyVibe[]>(
    myProfile.energyVibes || ["fogoso", "kinky"]
  );

  const [customDesire, setCustomDesire] = useState("");
  const [customIntention, setCustomIntention] = useState("");
  const [customBoundary, setCustomBoundary] = useState("");

  const toggleDesire = (item: string) => {
    setDesires((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const addCustomDesire = () => {
    if (customDesire.trim() && !desires.includes(customDesire.trim())) {
      setDesires((prev) => [...prev, customDesire.trim()]);
      setCustomDesire("");
    }
  };

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

  const handleSave = () => {
    setIsSaving(true);
    audioEngine.playPulse();

    setTimeout(() => {
      const cleanCodename =
        codenameInput.trim().toUpperCase() || myProfile.codename || "VESSEL_USER";
      updateMyProfile({
        codename: cleanCodename,
        age: parseInt(ageInput) || 41,
        showAge,
        twitterHandle: twitterHandle.trim().replace(/^@/, ""),
        yoSoy,
        mobility,
        hivStatus,
        role: myRole,
        heightCm: myHeight,
        weightKg: myWeight,
        genderIdentity,
        pronouns,
        genderInterests,
        desires,
        intentions,
        boundaries: myBoundaries,
        energyVibes,
      });
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2200);
    }, 450);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Panel Radar On-The-Clock (Listo YA - 60 min) */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-amber-500/40 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <SectionHeroHeader
          title="RADAR ON-THE-CLOCK // DISPONIBILIDAD"
          tag={
            myOnTheClock.isActive
              ? `${Math.max(
                  0,
                  Math.ceil(
                    ((myOnTheClock.expiresAt
                      ? new Date(myOnTheClock.expiresAt).getTime()
                      : 0) -
                      Date.now()) /
                      60000
                  )
                )}M RESTANTES`
              : "⚡ LISTO YA"
          }
          subtitle="Prioridad visual en la matriz por 60 min con auto-apagado táctico"
          variant="amber"
          icon={<Zap className="w-4 h-4 text-amber-400" />}
        />

        {myOnTheClock.isActive ? (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs font-mono text-amber-200 flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">●</span>
              <div>
                <span className="font-bold">
                  Tu perfil está brillando como "Listo YA".
                </span>
                {myOnTheClock.statusNote && (
                  <p className="text-[11px] text-neutral-300 mt-1">
                    Nota: "{myOnTheClock.statusNote}"
                  </p>
                )}
              </div>
            </div>
            <BrutalistButton
              variant="secondary"
              size="default"
              onClick={stopOnTheClock}
              className="w-full"
            >
              Desactivar On-The-Clock
            </BrutalistButton>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-300 leading-relaxed">
              ¿Tenés ganas de encontrarte ya mismo? Activá el radar para que los
              usuarios cercanos vean tu borde pulsante y sepan que tenés
              disponibilidad inmediata.
            </p>
            <input
              type="text"
              value={onTheClockNote}
              onChange={(e) => setOnTheClockNote(e.target.value)}
              placeholder="Nota rápida opcional (Ej: 'Tomando algo en Palermo', 'Libre en mi depto')..."
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
            <BrutalistButton
              variant="amber"
              size="lg"
              onClick={() => {
                startOnTheClock(60, onTheClockNote.trim() || undefined);
                setOnTheClockNote("");
              }}
              className="w-full font-black tracking-wider text-xs sm:text-sm py-3.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-amber-300"
            >
              <Zap className="w-4 h-4 fill-current animate-pulse" />
              <span>ACTIVAR LISTO YA // 60 MINUTOS</span>
            </BrutalistButton>
          </div>
        )}
      </div>

      {/* NOTA DE VOZ // VOICE VIBE (AUDIO 5s) */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title="VOICE VIBE // NOTA DE VOZ"
          tag={myVoiceVibe ? "ACTIVA // 5S" : "SIN AUDIO"}
          subtitle="Audio de 5 segundos con tu tono y presencia para generar confianza"
          variant="violet"
          icon={<Mic className="w-4 h-4 text-electricViolet-glow" />}
        />

        {myVoiceVibe ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-electricViolet/30">
              <VoiceVibePlayer voice={myVoiceVibe} />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  openVoiceRecorder();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold shadow-violet-soft transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Regrabar Audio (5s)" : "Re-record Audio (5s)"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playError();
                  deleteMyVoiceVibe();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-mono text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Eliminar" : "Delete"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-300 leading-relaxed">
              {language === "es"
                ? "Los perfiles con nota de voz verificada reciben hasta 3 veces más interacción y respuestas. Grabá un audio corto de 5 segundos diciendo qué pinta para hoy."
                : "Profiles with verified voice notes get up to 3x more interaction. Record a short 5-second audio saying what you're up to."}
            </p>
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openVoiceRecorder();
              }}
              className="w-full py-3 px-4 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black uppercase tracking-wider shadow-violet-glow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{language === "es" ? "🎙️ GRABAR NOTA DE VOZ (5s)" : "🎙️ RECORD VOICE NOTE (5s)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Información Corporal & Ficha */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-5 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title="DATOS VITALES // FICHA TÁCTICA"
          tag="// PERFIL"
          subtitle="Parámetros físicos y atributos visibles en la matriz y el radar"
          variant="violet"
          icon={<Sliders className="w-4 h-4 text-electricViolet-glow" />}
        />

        {/* 1. NOMBRE DE USUARIO / ALIAS (CODENAME) EN VESSEL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-white block uppercase tracking-wider">
              {t.account.codenameLabel || "Nombre de Usuario / Codename"}{" "}
              <span className="text-electricViolet-glow">*</span>
            </label>
            <span className="text-[10px] font-mono text-neutral-400">
              {t.account.codenameSub || "Visible en tarjetas públicas & radar"}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-electricViolet-glow">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={codenameInput}
              onChange={(e) => setCodenameInput(e.target.value)}
              placeholder={
                t.account.codenamePlaceholder || "Ej: ALEX_01, MARCUS, KLAUS..."
              }
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono pl-10 pr-9 py-2.5 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet transition-colors uppercase tracking-wide font-bold"
            />
            {codenameInput && (
              <button
                type="button"
                onClick={() => setCodenameInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                title="Borrar texto"
                aria-label="Borrar texto del nombre"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. EDAD CON CONTROL DE MOSTRAR / OCULTAR */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-white block">
            Edad
          </label>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-[140px]">
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder="Edad"
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
                Mostrar edad
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-neutral-400">
                  {showAge ? "SÍ" : "NO"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAge(!showAge);
                    audioEngine.playPulse();
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    showAge ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
                  }`}
                  aria-label="Conmutar visibilidad de la edad"
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
              Identidad de Género
            </label>
            <div className="relative">
              <select
                value={genderIdentity}
                onChange={(e) => setGenderIdentity(e.target.value)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
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
              Pronombres
            </label>
            <div className="relative">
              <select
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
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
              Yo Soy
            </label>
            <div className="relative">
              <select
                value={yoSoy}
                onChange={(e) => setYoSoy(e.target.value as YoSoyType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
                {YO_SOY_OPTIONS.map((opt) => (
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
              Movilidad
            </label>
            <div className="relative">
              <select
                value={mobility}
                onChange={(e) => setMobility(e.target.value as MobilityType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
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
              Estado VIH
            </label>
            <div className="relative">
              <select
                value={hivStatus}
                onChange={(e) => setHivStatus(e.target.value as HivStatusType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-3 appearance-none focus:outline-none focus:border-electricViolet transition-colors cursor-pointer"
              >
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
              Rol
            </label>
            <div className="relative">
              <select
                value={myRole}
                onChange={(e) => setMyRole(e.target.value as RoleType)}
                className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 appearance-none focus:border-electricViolet focus:outline-none cursor-pointer"
              >
                <option value="Top">Top</option>
                <option value="Bottom">Bottom</option>
                <option value="Versatile">Versatile</option>
                <option value="Vers Top">Vers Top</option>
                <option value="Vers Bottom">Vers Bottom</option>
                <option value="Side">Side</option>
                <option value="Dominant">Dominant</option>
                <option value="Submissive">Submissive</option>
                <option value="Oral Focus">Oral Focus</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              value={myHeight}
              onChange={(e) => setMyHeight(parseInt(e.target.value) || 180)}
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 focus:border-electricViolet focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              value={myWeight}
              onChange={(e) => setMyWeight(parseInt(e.target.value) || 75)}
              className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono p-2.5 focus:border-electricViolet focus:outline-none"
            />
          </div>
        </div>

        {/* 6. NICKNAME DE X (OPCIONAL) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-white block">
            Cuenta de 𝕏 (Opcional)
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
            <span>Intereses de Encuentro</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {genderInterests.length} seleccionados
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
            <span>Energía Deseada // Vibes Actuales</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {energyVibes.length} seleccionadas
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

      {/* DESEOS & BÚSQUEDA */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-electricViolet-glow" />
            <span>Deseos & Búsqueda</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {desires.length} seleccionados
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DESIRE_OPTIONS.map((item) => {
            const isSelected = desires.includes(item);
            return (
              <button
                type="button"
                key={item}
                onClick={() => {
                  toggleDesire(item);
                  audioEngine.playPulse();
                }}
                className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isSelected
                    ? "bg-electricViolet text-white border-electricViolet font-bold shadow-violet-soft"
                    : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
          {desires
            .filter((d) => !(DESIRE_OPTIONS as readonly string[]).includes(d))
            .map((custom) => (
              <button
                type="button"
                key={custom}
                onClick={() => {
                  toggleDesire(custom);
                  audioEngine.playPulse();
                }}
                className="px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono font-bold bg-electricViolet text-white border border-electricViolet flex items-center gap-1.5 cursor-pointer shadow-violet-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <span>{custom}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customDesire}
            onChange={(e) => setCustomDesire(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomDesire();
              }
            }}
            placeholder="Añadir otro deseo..."
            className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet"
          />
          <BrutalistButton
            variant="secondary"
            size="default"
            onClick={addCustomDesire}
          >
            + Añadir
          </BrutalistButton>
        </div>
      </div>

      {/* INTENCIONES CLARAS */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-bloodNeon" />
            <span>Intenciones Claras</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {intentions.length} seleccionadas
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
                className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
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
                className="px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono font-bold bg-bloodNeon text-white border border-bloodNeon flex items-center gap-1.5 cursor-pointer shadow-blood-glow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon"
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
            placeholder="Añadir otra intención..."
            className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-bloodNeon"
          />
          <BrutalistButton
            variant="secondary"
            size="default"
            onClick={addCustomIntention}
          >
            + Añadir
          </BrutalistButton>
        </div>
      </div>

      {/* LÍMITES PERSONALES & CONSENTIMIENTO */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Límites Personales & Consentimiento</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">
            {myBoundaries.length} definidos
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
                className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
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
                className="px-3 py-2 min-h-[38px] rounded-xl text-xs font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-500 flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
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
            placeholder="Añadir otro límite claro..."
            className="flex-1 min-h-[44px] bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
          />
          <BrutalistButton
            variant="secondary"
            size="default"
            onClick={addCustomBoundary}
          >
            + Añadir
          </BrutalistButton>
        </div>
      </div>

      {/* BOTÓN PRIMARIO DE GUARDAR CAMBIOS */}
      <div className="pt-4 pb-2">
        <BrutalistButton
          variant="primary"
          size="lg"
          onClick={handleSave}
          isSaving={isSaving}
          isSuccess={savedSuccess}
          savingText="GUARDANDO PERFIL..."
          successText={t.account.savedSuccess || "¡PERFIL GUARDADO!"}
          className="w-full shadow-violet-soft font-bold tracking-wider"
        >
          <BadgeCheck className="w-4 h-4" />
          <span>{t.account.saveBtn}</span>
        </BrutalistButton>
      </div>
      <div className="h-8" />
    </div>
  );
};
