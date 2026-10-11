"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  useAuth,
  useSettings,
  useRadarMatrix,
  useLogistics,
} from "@/context/VesselContext";
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
  DESIRE_OPTIONS,
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
  Flame,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Users,
  Heart,
  RotateCcw,
  AtSign,
  Edit3,
  Smartphone,
} from "lucide-react";
import {
  BrutalistButton,
  BrutalistInput,
  BrutalistSelect,
  BrutalistSwitch,
  SectionHeroHeader,
  TacticalBadge,
} from "@/components/ui";

export interface BioTabProps {
  children?: React.ReactNode;
}

export const BioTab: React.FC<BioTabProps> = ({ children }) => {
  const { myProfile, updateMyProfile } = useAuth();
  const { language, t } = useSettings();
  const { filters, setFilters } = useRadarMatrix();
  const { openDuoModal, myDuoLink, updateMyHostCard } = useLogistics();

  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [isManualSuccess, setIsManualSuccess] = useState(false);

  // Form states
  const [ageInput, setAgeInput] = useState<string>(
    myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : ""
  );
  const [showAge, setShowAge] = useState<boolean>(myProfile.showAge ?? true);
  const [instagramHandle, setInstagramHandle] = useState<string>(
    myProfile.instagramHandle || ""
  );
  const [telegramHandle, setTelegramHandle] = useState<string>(
    myProfile.telegramHandle || ""
  );
  const [twitterHandle, setTwitterHandle] = useState<string>(
    myProfile.twitterHandle || ""
  );
  const [phone, setPhone] = useState<string>(myProfile.phone || "");
  const [yoSoy, setYoSoy] = useState<YoSoyType>(myProfile.yoSoy || ("" as YoSoyType));
  const [mobility, setMobility] = useState<MobilityType>(myProfile.mobility || ("" as MobilityType));
  const [hivStatus, setHivStatus] = useState<HivStatusType>(myProfile.hivStatus || ("" as HivStatusType));
  const [myRole, setMyRole] = useState<RoleType>(myProfile.role || ("" as RoleType));
  const [seekingRoles, setSeekingRoles] = useState<RoleType[]>(
    () => myProfile.seekingRoles || filters?.roles || []
  );
  const [myHeight, setMyHeight] = useState<number>(myProfile.heightCm || 0);
  const [myWeight, setMyWeight] = useState<number>(myProfile.weightKg || 0);

  const [genderIdentity, setGenderIdentity] = useState<string>(
    myProfile.genderIdentity || ""
  );
  const [pronouns, setPronouns] = useState<string>(
    myProfile.pronouns || ""
  );
  const [genderInterests, setGenderInterests] = useState<GenderInterest[]>(
    myProfile.genderInterests || []
  );
  const [desires, setDesires] = useState<string[]>(
    myProfile.desires || []
  );
  const [intentions, setIntentions] = useState<string[]>(
    myProfile.intentions || []
  );
  const [myBoundaries, setMyBoundaries] = useState<string[]>(
    myProfile.boundaries || []
  );
  const [energyVibes, setEnergyVibes] = useState<EnergyVibe[]>(
    myProfile.energyVibes || []
  );

  const [customIntention, setCustomIntention] = useState("");
  const [customBoundary, setCustomBoundary] = useState("");
  const [customDesire, setCustomDesire] = useState("");

  // Sync when profile hydrates or updates externally
  useEffect(() => {
    setAgeInput(myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "");
    setShowAge(myProfile.showAge ?? true);
    setInstagramHandle(myProfile.instagramHandle || "");
    setTelegramHandle(myProfile.telegramHandle || "");
    setTwitterHandle(myProfile.twitterHandle || "");
    setPhone(myProfile.phone || "");
    setYoSoy(myProfile.yoSoy || ("" as YoSoyType));
    setMobility(myProfile.mobility || ("" as MobilityType));
    setHivStatus(myProfile.hivStatus || ("" as HivStatusType));
    setMyRole(myProfile.role || ("" as RoleType));
    setSeekingRoles(myProfile.seekingRoles || filters?.roles || []);
    setMyHeight(myProfile.heightCm || 0);
    setMyWeight(myProfile.weightKg || 0);
    setGenderIdentity(myProfile.genderIdentity || "");
    setPronouns(myProfile.pronouns || "");
    setGenderInterests(myProfile.genderInterests || []);
    setDesires(myProfile.desires || []);
    setIntentions(myProfile.intentions || []);
    setMyBoundaries(myProfile.boundaries || []);
    setEnergyVibes(myProfile.energyVibes || []);
  }, [myProfile, filters]);

  const toggleGenderInterest = (interest: GenderInterest) => {
    audioEngine.playPulse();
    setGenderInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleDesire = (item: string) => {
    audioEngine.playPulse();
    setDesires((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const addCustomDesire = () => {
    if (customDesire.trim() && !desires.includes(customDesire.trim())) {
      setDesires((prev) => [...prev, customDesire.trim()]);
      setCustomDesire("");
      audioEngine.playPulse();
    }
  };

  const toggleIntention = (item: string) => {
    audioEngine.playPulse();
    setIntentions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomIntention = () => {
    if (customIntention.trim() && !intentions.includes(customIntention.trim())) {
      setIntentions((prev) => [...prev, customIntention.trim()]);
      setCustomIntention("");
      audioEngine.playPulse();
    }
  };

  const toggleBoundary = (item: string) => {
    audioEngine.playPulse();
    setMyBoundaries((prev) =>
      prev.includes(item) ? prev.filter((b) => b !== item) : [...prev, item]
    );
  };

  const addCustomBoundary = () => {
    if (customBoundary.trim() && !myBoundaries.includes(customBoundary.trim())) {
      setMyBoundaries((prev) => [...prev, customBoundary.trim()]);
      setCustomBoundary("");
      audioEngine.playPulse();
    }
  };

  const toggleEnergyVibe = (vibe: EnergyVibe) => {
    audioEngine.playPulse();
    setEnergyVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const buildProfilePayload = useCallback(() => {
    return {
      age: parseInt(ageInput) || 0,
      showAge,
      instagramHandle: instagramHandle.trim().replace(/^@/, ""),
      telegramHandle: telegramHandle.trim().replace(/^@/, ""),
      twitterHandle: twitterHandle.trim().replace(/^@/, ""),
      phone: phone.trim(),
      yoSoy,
      mobility,
      hivStatus,
      role: myRole,
      seekingRoles,
      heightCm: myHeight || 0,
      weightKg: myWeight || 0,
      genderIdentity,
      pronouns,
      genderInterests,
      desires,
      intentions,
      boundaries: myBoundaries,
      energyVibes,
      isProfileCustomized: true,
    };
  }, [
    ageInput,
    showAge,
    instagramHandle,
    telegramHandle,
    twitterHandle,
    phone,
    yoSoy,
    mobility,
    hivStatus,
    myRole,
    seekingRoles,
    myHeight,
    myWeight,
    genderIdentity,
    pronouns,
    genderInterests,
    desires,
    intentions,
    myBoundaries,
    energyVibes,
  ]);

  const isDirty = useMemo(() => {
    const origAgeStr = myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "";
    if (ageInput !== origAgeStr) return true;
    if (showAge !== (myProfile.showAge ?? true)) return true;
    if (twitterHandle.trim().replace(/^@/, "") !== (myProfile.twitterHandle || "").replace(/^@/, "")) return true;
    if (instagramHandle.trim().replace(/^@/, "") !== (myProfile.instagramHandle || "").replace(/^@/, "")) return true;
    if (telegramHandle.trim().replace(/^@/, "") !== (myProfile.telegramHandle || "").replace(/^@/, "")) return true;
    if (phone.trim() !== (myProfile.phone || "").trim()) return true;
    if ((yoSoy || "") !== (myProfile.yoSoy || "")) return true;
    if ((mobility || "") !== (myProfile.mobility || "")) return true;
    if ((hivStatus || "") !== (myProfile.hivStatus || "")) return true;
    if ((myRole || "") !== (myProfile.role || "")) return true;

    const currentSeeking = [...seekingRoles].sort().join(",");
    const origSeeking = [...(myProfile.seekingRoles || [])].sort().join(",");
    if (currentSeeking !== origSeeking) return true;

    if ((myHeight || 0) !== (myProfile.heightCm || 0)) return true;
    if ((myWeight || 0) !== (myProfile.weightKg || 0)) return true;
    if (genderIdentity !== (myProfile.genderIdentity || "")) return true;
    if (pronouns !== (myProfile.pronouns || "")) return true;

    const currentGenderInterests = [...genderInterests].sort().join(",");
    const origGenderInterests = [...(myProfile.genderInterests || [])].sort().join(",");
    if (currentGenderInterests !== origGenderInterests) return true;

    const currentDesires = [...desires].sort().join(",");
    const origDesires = [...(myProfile.desires || [])].sort().join(",");
    if (currentDesires !== origDesires) return true;

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
    instagramHandle,
    telegramHandle,
    phone,
    yoSoy,
    mobility,
    hivStatus,
    myRole,
    seekingRoles,
    myHeight,
    myWeight,
    genderIdentity,
    pronouns,
    genderInterests,
    desires,
    intentions,
    myBoundaries,
    energyVibes,
    myProfile,
  ]);

  // Debounced auto-save
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!isDirty) return;

    setSavedStatus("saving");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const payload = buildProfilePayload();
      updateMyProfile(payload);
      if (setFilters) {
        setFilters((prev) => ({ ...prev, roles: seekingRoles }));
      }
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 2000);
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isDirty, buildProfilePayload, updateMyProfile, seekingRoles, setFilters]);

  const handleManualSave = () => {
    audioEngine.playSignalSent();
    setIsManualSaving(true);
    setSavedStatus("saving");
    setTimeout(() => {
      const payload = buildProfilePayload();
      updateMyProfile(payload);
      if (setFilters) {
        setFilters((prev) => ({ ...prev, roles: seekingRoles }));
      }
      setIsManualSaving(false);
      setIsManualSuccess(true);
      setSavedStatus("saved");
      setTimeout(() => {
        setIsManualSuccess(false);
        setSavedStatus("idle");
      }, 2400);
    }, 850);
  };


  const handleResetForm = () => {
    audioEngine.playPulse();
    setAgeInput(myProfile.age && myProfile.age > 0 ? myProfile.age.toString() : "");
    setShowAge(myProfile.showAge ?? true);
    setInstagramHandle(myProfile.instagramHandle || "");
    setTelegramHandle(myProfile.telegramHandle || "");
    setTwitterHandle(myProfile.twitterHandle || "");
    setPhone(myProfile.phone || "");
    setYoSoy(myProfile.yoSoy || ("" as YoSoyType));
    setMobility(myProfile.mobility || ("" as MobilityType));
    setHivStatus(myProfile.hivStatus || ("" as HivStatusType));
    setMyRole(myProfile.role || ("" as RoleType));
    setSeekingRoles(myProfile.seekingRoles || filters?.roles || []);
    setMyHeight(myProfile.heightCm || 0);
    setMyWeight(myProfile.weightKg || 0);
    setGenderIdentity(myProfile.genderIdentity || "");
    setPronouns(myProfile.pronouns || "");
    setGenderInterests(myProfile.genderInterests || []);
    setDesires(myProfile.desires || []);
    setIntentions(myProfile.intentions || []);
    setMyBoundaries(myProfile.boundaries || []);
    setEnergyVibes(myProfile.energyVibes || []);
  };

  const handleMobilityChange = (val: MobilityType) => {
    setMobility(val);
    if (updateMyHostCard) {
      const isHosting =
        val.toLowerCase().includes("casa") ||
        val.toLowerCase().includes("lugar") ||
        val.toLowerCase().includes("depto") ||
        val.toLowerCase().includes("sitio");
      updateMyHostCard({ hasPlace: isHosting });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* 1. NOMBRE DE USUARIO / ALIAS EN VESSEL (Single Source of Truth) */}
      <div className="flex items-center justify-between gap-3 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-electricViolet-glow flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
              {t.account?.codenameLabel || "Nombre de Usuario"}
            </span>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wide truncate block">
              @{myProfile.codename || "VESSEL_USER"}
            </span>
          </div>
        </div>
        <BrutalistButton
          variant="ghost"
          size="compact"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("vessel:edit-codename"));
          }}
          className="border border-white/15 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-electricViolet-glow" />
          <span>{language === "es" ? "Cambiar Alias" : "Edit Alias"}</span>
        </BrutalistButton>
      </div>

      {/* Mini-Barra Superior de Sincronización y Acciones Rápidas */}
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              savedStatus === "saving"
                ? "bg-amber-400 animate-pulse"
                : savedStatus === "saved"
                ? "bg-emerald-400"
                : "bg-electricViolet/50"
            }`}
          />
          <span className="text-[11px] font-mono text-neutral-300">
            {savedStatus === "saving"
              ? language === "es"
                ? "Sincronizando cambios..."
                : "Saving changes..."
              : savedStatus === "saved"
              ? language === "es"
                ? "✓ Ficha sincronizada"
                : "✓ Profile synced"
              : language === "es"
              ? "Autoguardado activo"
              : "Auto-save active"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BrutalistButton
            variant="ghost"
            size="sm"
            onClick={handleResetForm}
            className="text-[10px] h-8 px-2.5 text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>{language === "es" ? "Restablecer" : "Reset"}</span>
          </BrutalistButton>

          <BrutalistButton
            variant="primary"
            size="sm"
            onClick={handleManualSave}
            isSaving={isManualSaving}
            isSuccess={isManualSuccess}
            savingText={language === "es" ? "Guardando..." : "Saving..."}
            successText={language === "es" ? "¡Guardado!" : "Saved!"}
            className="text-[10px] h-8 px-3 shadow-violet-soft font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>{language === "es" ? "Guardar" : "Save"}</span>
          </BrutalistButton>

        </div>
      </div>

      {/* Mini-Barra de Navegación Rápida para el Pulgar */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-1.5 bg-obsidian-deep/95 backdrop-blur-md border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
        <button
          type="button"
          onClick={() => {
            document.getElementById("bio-sec-fisico")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-2.5 py-1 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-neutral-300 font-bold whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>📏</span>
          <span>Físico</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("bio-sec-rol")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-2.5 py-1 min-h-[36px] rounded-xl bg-bloodNeon/15 hover:bg-bloodNeon/25 border border-bloodNeon/30 text-[10px] font-mono text-bloodNeon font-bold whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>🔥</span>
          <span>Rol & Onda</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("bio-sec-identidad")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-2.5 py-1 min-h-[36px] rounded-xl bg-electricViolet/15 hover:bg-electricViolet/25 border border-electricViolet/30 text-[10px] font-mono text-electricViolet-glow font-bold whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>👥</span>
          <span>Identidad</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById("bio-sec-redes")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-2.5 py-1 min-h-[36px] rounded-xl bg-mintNeon/15 hover:bg-mintNeon/25 border border-mintNeon/30 text-[10px] font-mono text-mintNeon font-bold whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1"
        >
          <span>🔒</span>
          <span>Redes</span>
        </button>
      </div>

      {/* =========================================================================
          1. DATOS VITALES & MEDIDAS
          ========================================================================= */}
      <div id="bio-sec-fisico" className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "FÍSICO & CONTEXTURA" : "BODY & VITALS"}
          tag={language === "es" ? "FÍSICO" : "PHYSICAL"}
          subtitle={language === "es" ? "Tu cuerpo, medidas y visibilidad de tu edad en el radar" : "Body parameters and age visibility"}
          variant="violet"
          icon={<Sliders className="w-4 h-4 text-electricViolet-glow" />}
        />

        {/* Edad + Switch Mostrar Edad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <BrutalistInput
            label={t.account?.ageLabel || "Edad"}
            type="number"
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            placeholder="Ej: 28"
            min={18}
            max={99}
          />

          <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between min-h-[44px]">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-mono font-bold text-white block truncate">
                {t.account?.showAgeLabel || "Mostrar edad públicamente"}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block truncate">
                {showAge
                  ? language === "es"
                    ? "Visible en radar y tarjetas"
                    : "Visible on radar and cards"
                  : language === "es"
                    ? "Oculta a otros usuarios"
                    : "Hidden from other users"}
              </span>
            </div>
            <BrutalistSwitch
              checked={showAge}
              onChange={(checked) => {
                setShowAge(checked);
                audioEngine.playPulse();
              }}
              variant="violet"
              icon="eye"
              size="sm"
              aria-label={t.account?.showAgeLabel || "Mostrar edad públicamente"}
            />

          </div>
        </div>

        {/* Estatura y Contextura General (1-Tap Puro, Sin Dropdown Duplicado) */}
        <div className="space-y-3">
          <div className="max-w-xs">
            <BrutalistInput
              label={language === "es" ? "Altura (cm)" : "Height (cm)"}
              type="number"
              value={myHeight > 0 ? myHeight.toString() : ""}
              onChange={(e) => setMyHeight(parseInt(e.target.value) || 0)}
              placeholder="Ej: 178"
              min={120}
              max={230}
            />
          </div>

          {/* Opciones Rápidas de Contextura (1-Tap) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                {language === "es" ? "Contextura física (1-tap):" : "Body build (1-tap):"}
              </label>
              {yoSoy && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setYoSoy("" as YoSoyType);
                  }}
                  className="text-[10px] font-mono text-electricViolet-glow hover:underline cursor-pointer"
                >
                  {language === "es" ? "Limpiar selección" : "Clear selection"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "🏃 Atlético", val: "Atlético / Deportista" },
                { label: "💪 Grandote", val: "Musculoso / Gym" },
                { label: "⚡ Flaco", val: "Twink / Joven" },
                { label: "🐻 Oso", val: "Oso / Bear" },
                { label: "🐺 Peludo", val: "Nutria / Peludo" },
                { label: "🧔 Maduro", val: "Maduro / Daddy" },
                { label: "⛓️ Leather", val: "Leather / Arnés" },
                { label: "🐶 Pup", val: "Pup / Fetish" },
                { label: "👤 Discreto", val: "Discreto / Perfil bajo" },
                { label: "👑 Dominante", val: "Dominante / Amo" },
                { label: "🧎 Sumiso", val: "Sumiso / Entregado" },
                { label: "🔥 Morbo", val: "Morbo / Carnal" },
              ].map((build) => {
                const isSelected =
                  yoSoy === build.val ||
                  (yoSoy && yoSoy.toLowerCase().includes(build.label.slice(2).trim().toLowerCase()));
                return (
                  <button
                    key={build.val}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setYoSoy(isSelected ? ("" as YoSoyType) : (build.val as YoSoyType));
                    }}
                    className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                      isSelected
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft"
                        : "bg-black/50 text-neutral-400 border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {build.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. ROL, LUGAR & ¿QUÉ PINTA HOY?
          ========================================================================= */}
      <div id="bio-sec-rol" className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "ROL, ¿QUÉ PINTA HOY? & MORBOS Y FETICHES" : "ROLE & LOGISTICS"}
          tag={language === "es" ? "ENCUENTRO" : "MEETING"}
          subtitle={language === "es" ? "Tu dinámica sexual, qué te calienta y tus intenciones de hoy" : "Sexual dynamics, hosting, and health"}
          variant="blood"
          icon={<Flame className="w-4 h-4 text-bloodNeon" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BrutalistSelect
            label={t.account?.roleLabel || "Tu Rol"}
            value={myRole}
            onChange={(val) => setMyRole(val as RoleType)}
            placeholder={language === "es" ? "Definí tu rol..." : "Set your role..."}
            options={ALL_ROLE_TYPES.map((r) => ({
              value: r,
              label: getRoleDisplayLabel(r, language, t),
            }))}
          />

          <BrutalistSelect
            label={t.account?.mobilityLabel || "Lugar / Movilidad"}
            value={mobility}
            onChange={(val) => handleMobilityChange(val as MobilityType)}
            placeholder={language === "es" ? "Tengo depto / voy yo..." : "Hosting / mobile..."}
            options={MOBILITY_OPTIONS.map((m) => ({
              value: m,
              label: m,
            }))}
          />

          <BrutalistSelect
            label={t.account?.hivLabel || "Salud Sexual & PrEP"}
            value={hivStatus}
            onChange={(val) => setHivStatus(val as HivStatusType)}
            placeholder={language === "es" ? "Seleccionar..." : "Select..."}
            options={HIV_STATUS_OPTIONS.map((h) => ({
              value: h,
              label: h,
            }))}
          />
        </div>

        {/* Qué Roles Buscás para Encuentros (Micro-pills tácticas) */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-bloodNeon" />
              <span>{language === "es" ? "Roles que buscás para encuentros" : "Seeking roles"}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setSeekingRoles([]);
              }}
              className="text-[10px] font-mono text-bloodNeon hover:underline cursor-pointer min-h-[32px] px-1 flex items-center"
            >
              {seekingRoles.length === 0
                ? (language === "es" ? "✓ Abierto a todos" : "✓ Open to all")
                : (language === "es" ? "Limpiar filtro" : "Clear filter")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_ROLE_TYPES.map((role) => {
              const isSelected = seekingRoles.includes(role);
              const metaMap: Record<string, { icon: string; short: string }> = {
                Top: { icon: "⚡", short: "Activo" },
                "Vers Top": { icon: "🔼", short: "Versa Activo" },
                Versatile: { icon: "🔄", short: "Versa" },
                "Vers Bottom": { icon: "🔽", short: "Versa Pasivo" },
                Bottom: { icon: "🧎", short: "Pasivo" },
                Side: { icon: "🚫", short: "Side" },
                "Oral Focus": { icon: "👅", short: "Oral" },
                Dominant: { icon: "👑", short: "Dominante" },
                Submissive: { icon: "⛓️", short: "Sumiso" },
              };
              const meta = metaMap[role] || { icon: "⚡", short: role };
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    audioEngine.playPulse();
                    setSeekingRoles((prev) =>
                      prev.includes(role)
                        ? prev.filter((r) => r !== role)
                        : [...prev, role]
                    );
                  }}
                  className={`px-3 py-2 rounded-xl border transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 text-xs font-mono active:scale-95 ${
                    isSelected
                      ? "bg-bloodNeon/25 border-bloodNeon text-white font-bold shadow-blood-glow"
                      : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{language === "es" ? meta.short : getRoleDisplayLabel(role, language, t)}</span>
                  {isSelected && <span className="text-[10px] ml-0.5 text-bloodNeon font-black">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ¿Qué Pinta Hoy? (Micro-Pills 1-Tap) */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-bloodNeon" />
              <span>{t.account?.intentionsLabel || "¿Qué pinta hoy?"}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {intentions.length} {language === "es" ? "activas" : "active"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "🔥 Coger ya", matchKeys: ["coger ya", "pinta algo ya", "inmediato", "ahora mismo"] },
              { label: "🌙 Esta noche", matchKeys: ["esta noche", "solo por esta noche"] },
              { label: "🔄 Vínculo fijo", matchKeys: ["vínculo frecuente", "vinculo frecuente", "frecuente"] },
              { label: "🍻 Birra / Chill", matchKeys: ["charlar", "birra", "chill", "ver qué onda"] },
              { label: "🕶️ Morbosear", matchKeys: ["morbosear", "exploración libre", "exploracion libre"] },
              { label: "⚡ Sin vueltas", matchKeys: ["sin vueltas", "lo que pinte"] },
              { label: "🫂 Amistad / Onda", matchKeys: ["amistad", "comunidad"] },
            ].map((item) => {
              const isSelected = intentions.some(
                (i) => i === item.label || item.matchKeys.some((k) => i.toLowerCase().includes(k))
              );
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    audioEngine.playPulse();
                    if (isSelected) {
                      setIntentions((prev) =>
                        prev.filter(
                          (i) =>
                            i !== item.label &&
                            !item.matchKeys.some((k) => i.toLowerCase().includes(k))
                        )
                      );
                    } else {
                      setIntentions((prev) => [...prev, item.label]);
                    }
                  }}
                  className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-bloodNeon text-white border-bloodNeon font-bold shadow-blood-glow"
                      : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
                </button>
              );
            })}
            {intentions
              .filter(
                (i) =>
                  ![
                    "🔥 Coger ya",
                    "🌙 Esta noche",
                    "🔄 Vínculo fijo",
                    "🍻 Birra / Chill",
                    "🕶️ Morbosear",
                    "⚡ Sin vueltas",
                    "🫂 Amistad / Onda",
                  ].includes(i) &&
                  !["coger ya", "pinta algo ya", "inmediato", "ahora mismo", "esta noche", "solo por esta noche", "vínculo frecuente", "vinculo frecuente", "charlar", "birra", "morbosear", "exploración libre", "sin vueltas", "amistad"].some((k) => i.toLowerCase().includes(k))
              )
              .map((custom) => (
                <button
                  type="button"
                  key={custom}
                  onClick={() => toggleIntention(custom)}
                  className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold bg-bloodNeon text-white border border-bloodNeon flex items-center gap-1.5 cursor-pointer shadow-blood-glow active:scale-95"
                >
                  <span>{custom}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <BrutalistInput
              type="text"
              value={customIntention}
              onChange={(e) => setCustomIntention(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomIntention();
                }
              }}
              placeholder={language === "es" ? "Sumar otra intención..." : "Add custom..."}
              className="flex-1"
            />
            <BrutalistButton
              variant="secondary"
              size="default"
              onClick={addCustomIntention}
              className="min-h-[44px]"
            >
              {language === "es" ? "+ Sumar" : "+ Add"}
            </BrutalistButton>
          </div>
        </div>

        {/* Deseos & Fantasías (Micro-Pills 1-Tap) */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.account?.desiresLabel || "Qué te calienta y fantasías"}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {desires.length} {language === "es" ? "elegidas" : "selected"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "🔥 Al palo", matchKeys: ["al palo", "conexión carnal", "conexion carnal"] },
              { label: "💋 Mimos & Besos", matchKeys: ["mimos", "besos", "calentura lenta"] },
              { label: "⛓️ Morbos y Fetiches", matchKeys: ["fetiches", "morbo", "morbos"] },
              { label: "👑 Dominación", matchKeys: ["dominación", "dominacion", "marcar la cancha"] },
              { label: "🧎 Sumisión", matchKeys: ["sumisión", "sumision", "entrega"] },
              { label: "🍻 Previa & Birra", matchKeys: ["previa", "cerveza", "música", "musica"] },
              { label: "👀 Mirar / Exhibir", matchKeys: ["morbo visual", "contemplación", "contemplacion", "mirar"] },
              { label: "👅 Devoción oral", matchKeys: ["oral", "devoción oral", "devocion oral"] },
              { label: "🎭 Juegos de rol", matchKeys: ["juegos de rol", "fantasías", "fantasias"] },
              { label: "🫂 Sin etiquetas", matchKeys: ["sin etiquetas", "contacto físico", "contacto fisico"] },
              { label: "🥊 Sudor & Gym", matchKeys: ["sudor", "entrenamiento", "piel"] },
              { label: "🌑 Sala oscura", matchKeys: ["sala oscura", "sin caretas"] },
            ].map((item) => {
              const isSelected = desires.some(
                (d) => d === item.label || item.matchKeys.some((k) => d.toLowerCase().includes(k))
              );
              return (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => {
                    audioEngine.playPulse();
                    if (isSelected) {
                      setDesires((prev) =>
                        prev.filter(
                          (d) =>
                            d !== item.label &&
                            !item.matchKeys.some((k) => d.toLowerCase().includes(k))
                        )
                      );
                    } else {
                      setDesires((prev) => [...prev, item.label]);
                    }
                  }}
                  className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-pink-600/30 text-pink-200 border-pink-500 font-bold shadow-sm ring-1 ring-pink-500/50"
                      : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <span className="text-[10px] ml-0.5 text-pink-300 font-bold">✓</span>}
                </button>
              );
            })}
            {desires
              .filter(
                (d) =>
                  ![
                    "🔥 Al palo",
                    "💋 Mimos & Besos",
                    "⛓️ Morbos y Fetiches",
                    "👑 Dominación",
                    "🧎 Sumisión",
                    "🍻 Previa & Birra",
                    "👀 Mirar / Exhibir",
                    "👅 Devoción oral",
                    "🎭 Juegos de rol",
                    "🫂 Sin etiquetas",
                    "🥊 Sudor & Gym",
                    "🌑 Sala oscura",
                  ].includes(d) &&
                  !["al palo", "conexión carnal", "mimos", "besos", "fetiches", "morbo", "dominación", "sumisión", "previa", "cerveza", "morbo visual", "oral", "juegos de rol", "sin etiquetas", "sudor", "sala oscura"].some((k) => d.toLowerCase().includes(k))
              )
              .map((custom) => (
                <button
                  type="button"
                  key={custom}
                  onClick={() => toggleDesire(custom)}
                  className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold bg-pink-600/30 text-pink-200 border border-pink-500 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>{custom}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <BrutalistInput
              type="text"
              value={customDesire}
              onChange={(e) => setCustomDesire(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomDesire();
                }
              }}
              placeholder={language === "es" ? "Sumar otra fantasía o morbo..." : "Add custom..."}
              className="flex-1"
            />
            <BrutalistButton
              variant="secondary"
              size="default"
              onClick={addCustomDesire}
              className="min-h-[44px]"
            >
              {language === "es" ? "+ Sumar" : "+ Add"}
            </BrutalistButton>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. IDENTIDAD, GÉNERO & MODO DÚO
          ========================================================================= */}
      <div id="bio-sec-identidad" className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "IDENTIDAD & VÍNCULOS" : "IDENTITY & CONNECTIONS"}
          tag={language === "es" ? "GÉNERO" : "GENDER"}
          subtitle={language === "es" ? "Cómo te autopercibís, a quiénes buscás y perfiles compartidos" : "Self-identification, attraction, and shared profiles"}
          variant="violet"
          icon={<Users className="w-4 h-4 text-electricViolet-glow" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BrutalistSelect
            label={t.account?.genderLabel || "Identidad de Género"}
            value={genderIdentity}
            onChange={(val) => setGenderIdentity(val)}
            placeholder={language === "es" ? "Seleccionar..." : "Select..."}
            options={GENDER_IDENTITY_OPTIONS.map((g) => ({ value: g, label: g }))}
          />

          <BrutalistSelect
            label={t.account?.pronounsLabel || "Pronombres"}
            value={pronouns}
            onChange={(val) => setPronouns(val)}
            placeholder={language === "es" ? "Seleccionar..." : "Select..."}
            options={PRONOUN_OPTIONS.map((p) => ({ value: p, label: p }))}
          />
        </div>

        {/* Intereses de Encuentro (Chips visuales) */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{language === "es" ? "Intereses de Encuentro" : "Attracted To"}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {genderInterests.length} {language === "es" ? "marcados" : "selected"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GENDER_INTEREST_OPTIONS.map((interest) => {
              const isSelected = genderInterests.includes(interest.id);
              return (
                <button
                  type="button"
                  key={interest.id}
                  onClick={() => toggleGenderInterest(interest.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer min-h-[46px] active:scale-95 ${
                    isSelected
                      ? "bg-electricViolet/20 border-electricViolet font-bold shadow-violet-soft text-white ring-1 ring-electricViolet/50"
                      : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{interest.emoji}</span>
                  <span className="text-xs font-mono font-bold truncate">{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Perfil de Pareja // Modo Dúo */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {language === "es" ? "Modo Dúo // Pareja" : "Duo Mode"}
              </span>
              <TacticalBadge variant={myDuoLink?.isLinked ? "violet" : "neutral"} size="sm">
                {myDuoLink?.isLinked ? (language === "es" ? "Vinculado" : "Linked") : (language === "es" ? "Individual" : "Solo")}
              </TacticalBadge>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono truncate">
              {myDuoLink?.isLinked
                ? `@${myDuoLink.partnerCodename}`
                : language === "es"
                ? "Mostrate en pareja en el radar y reciban juntos"
                : "Link partner profile"}
            </p>
          </div>

          <BrutalistButton
            variant={myDuoLink?.isLinked ? "secondary" : "ghost"}
            size="sm"
            onClick={openDuoModal}
            className="flex-shrink-0 min-h-[44px]"
          >
            {myDuoLink?.isLinked
              ? language === "es"
                ? "Gestionar"
                : "Manage"
              : language === "es"
              ? "+ Vincular"
              : "+ Link"}
          </BrutalistButton>
        </div>
      </div>

      {/* =========================================================================
          4. LÍMITES, ENERGÍA & CONTACTO
          ========================================================================= */}
      <div id="bio-sec-redes" className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "LÍMITES CLAROS & REDES DE CONTACTO" : "BOUNDARIES & CONTACT"}
          tag={language === "es" ? "CUIDADO" : "SAFETY"}
          subtitle={language === "es" ? "Límites sin caretear antes del encuentro y tus redes" : "Clear boundaries and social handles"}
          variant="mint"
          icon={<ShieldCheck className="w-4 h-4 text-mintNeon" />}
        />

        {/* Límites y Acuerdos Claros */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.account?.boundariesLabel || "Límites y Acuerdos Claros"}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
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
                  onClick={() => toggleBoundary(item)}
                  className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-purple-950/40 border-purple-500 text-purple-300 font-bold shadow-sm ring-1 ring-purple-500/50"
                      : "bg-black/50 border-white/10 text-neutral-400 hover:bg-white/10"
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
                  onClick={() => toggleBoundary(custom)}
                  className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-500 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{custom}</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <BrutalistInput
              type="text"
              value={customBoundary}
              onChange={(e) => setCustomBoundary(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomBoundary();
                }
              }}
              placeholder={language === "es" ? "Sumar otro límite claro..." : "Add boundary..."}
              className="flex-1"
            />
            <BrutalistButton
              variant="secondary"
              size="default"
              onClick={addCustomBoundary}
              className="min-h-[44px]"
            >
              {language === "es" ? "+ Sumar" : "+ Add"}
            </BrutalistButton>
          </div>
        </div>

        {/* Canales de Contacto: Celular, Instagram, Telegram y X */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white block">
              {language === "es" ? "REDES DE CONTACTO & CELULAR (OPCIONALES)" : "CONTACT HANDLES & PHONE (OPTIONAL)"}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {language === "es" ? "Discreción absoluta" : "Full discretion"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BrutalistInput
              label={language === "es" ? "Teléfono Celular" : "Phone Number"}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 11 1234-5678"
              leftIcon={<Smartphone className="w-4 h-4 text-emerald-400" />}
              hint={language === "es" ? "1 Persona = 1 Cuenta" : "1 Person = 1 Account"}
            />

            <BrutalistInput
              label={language === "es" ? "Instagram (@usuario)" : "Instagram"}
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="tu_usuario"
              leftIcon={<AtSign className="w-4 h-4 text-pink-400" />}
            />

            <BrutalistInput
              label={language === "es" ? "Telegram (@usuario)" : "Telegram"}
              type="text"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              placeholder="tu_usuario"
              leftIcon={<AtSign className="w-4 h-4 text-cyan-400" />}
            />

            <BrutalistInput
              label={language === "es" ? "𝕏 / Twitter (@usuario)" : "𝕏 / Twitter"}
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="tu_usuario"
              leftIcon={<AtSign className="w-4 h-4 text-neutral-400" />}
            />
          </div>
        </div>
      </div>

      {children}

      {/* Barra flotante si hay cambios sin guardar */}
      {(isDirty || savedStatus === "saved") && (
        <div className="sticky bottom-20 z-40 pt-2 animate-fade-in">
          <div className="bg-obsidian-surface/95 backdrop-blur-xl border border-electricViolet/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-electricViolet/30">
            <div className="flex items-center gap-2 min-w-0 pl-1">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  savedStatus === "saved" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-xs font-mono font-bold text-white truncate">
                {savedStatus === "saved"
                  ? (t.account?.savedSuccess || "¡PERFIL GUARDADO!")
                  : (t.account?.unsavedChangesLabel || "Cambios sin guardar")}
              </span>
            </div>
            {isDirty && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <BrutalistButton
                  variant="secondary"
                  size="sm"
                  onClick={handleResetForm}
                  className="min-h-[44px] text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>{t.account?.discardBtn || "Descartar"}</span>
                </BrutalistButton>
                <BrutalistButton
                  variant="primary"
                  size="sm"
                  onClick={handleManualSave}
                  isSaving={isManualSaving}
                  isSuccess={isManualSuccess}
                  savingText={language === "es" ? "Guardando..." : "Saving..."}
                  successText={language === "es" ? "¡Guardado!" : "Saved!"}
                  className="min-h-[44px] text-xs shadow-violet-soft"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  <span>{t.account?.saveNowBtn || (language === "es" ? "Guardar cambios" : "Save Changes")}</span>
                </BrutalistButton>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
