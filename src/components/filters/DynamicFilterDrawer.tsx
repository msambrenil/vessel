"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { ROLE_OPTIONS, KINK_CATALOG, INTENSITY_LABELS } from "@/data/kinkCatalog";
import { ENERGY_VIBE_CATALOG } from "@/data/energyCatalog";
import { GENDER_INTEREST_OPTIONS } from "@/data/genderCatalog";
import { RoleType, EnergyVibe, SubstanceAtmosphere, GenderInterest } from "@/types/vessel";
import { SUBSTANCE_ATMOSPHERE_CATALOG } from "@/data/substanceCatalog";
import {
  X,
  RotateCcw,
  SlidersHorizontal,
  Ghost,
  Flame,
  ShieldCheck,
  Home,
  ChevronDown,
} from "lucide-react";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { getKinkLocalizedLabel } from "@/lib/kinks/kinkAdminService";

export const DynamicFilterDrawer: React.FC = () => {
  const {
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    filters,
    setFilters,
    resetFilters,
    filteredProfiles,
    t,
    language,
  } = useVessel();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!isFilterDrawerOpen) return null;

  const toggleRole = (role: RoleType) => {
    setFilters((prev) => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  const toggleKink = (kinkId: string) => {
    setFilters((prev) => {
      const exists = prev.selectedKinks.includes(kinkId);
      return {
        ...prev,
        selectedKinks: exists
          ? prev.selectedKinks.filter((k) => k !== kinkId)
          : [...prev.selectedKinks, kinkId],
      };
    });
  };

  const toggleEnergyVibe = (vibeId: EnergyVibe) => {
    setFilters((prev) => {
      const exists = prev.energyVibes.includes(vibeId);
      return {
        ...prev,
        energyVibes: exists
          ? prev.energyVibes.filter((v) => v !== vibeId)
          : [...prev.energyVibes, vibeId],
      };
    });
  };

  const toggleSubstanceAtmosphere = (vibe: SubstanceAtmosphere) => {
    setFilters((prev) => {
      const current = prev.substanceAtmospheres || [];
      const exists = current.includes(vibe);
      return {
        ...prev,
        substanceAtmospheres: exists
          ? current.filter((v) => v !== vibe)
          : [...current, vibe],
      };
    });
  };

  const toggleGenderInterest = (interestId: GenderInterest) => {
    setFilters((prev) => {
      const current = prev.genderInterests || [];
      const exists = current.includes(interestId);
      return {
        ...prev,
        genderInterests: exists
          ? current.filter((id) => id !== interestId)
          : [...current, interestId],
      };
    });
  };

  // Group kinks into 3 tribes / categories
  const gearKinks = KINK_CATALOG.filter((k) => k.category === "gear");
  const dynamicKinks = KINK_CATALOG.filter(
    (k) => k.category === "dynamic" || k.category === "intensity"
  );
  const practicesKinks = KINK_CATALOG.filter(
    (k) => k.category === "fetish" || k.category === "scene"
  );

  const advancedCount =
    filters.selectedKinks.length +
    (filters.substanceAtmospheres?.length || 0) +
    (filters.maxDistanceKm < 20 ? 1 : 0) +
    (filters.minIntensity > 1 ? 1 : 0);

  const tempoList = [
    { lvl: 1, emoji: "☕", label: INTENSITY_LABELS[1]?.label || "Tranqui" },
    { lvl: 2, emoji: "⚡", label: INTENSITY_LABELS[2]?.label || "Al hueso" },
    { lvl: 3, emoji: "🔥", label: INTENSITY_LABELS[3]?.label || "Picante" },
    { lvl: 4, emoji: "⛓️", label: INTENSITY_LABELS[4]?.label || "Extremo" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md select-none animate-in fade-in">
      <div className="w-full max-w-md bg-obsidian-deep border-l border-white/10 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Cabecera del Drawer */}
        <div className="p-4 border-b border-white/10 bg-obsidian/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-electricViolet" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              {t.filters.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="p-1.5 text-neutral-400 hover:text-white flex items-center gap-1 text-xs font-medium transition-colors"
              title={t.filters.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.filters.reset}</span>
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido de Filtros - Arquitectura Híbrida A+C */}
        <div className="p-4 pb-16 space-y-6 flex-1">
          {/* ======================================================== */}
          {/* BLOQUE 1: ONDA & RITMO (Action-First, siempre visible)     */}
          {/* ======================================================== */}

          {/* 1.1 ¿Qué onda buscás hoy? */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-electricViolet" />
                <span>{t.filters.vibesSection}</span>
              </label>
              {filters.energyVibes.length > 0 && (
                <span className="text-[10px] font-mono text-electricViolet-glow font-bold">
                  {filters.energyVibes.length} {t.filters.selectedCount}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ENERGY_VIBE_CATALOG.map((vibe) => {
                const isSelected = filters.energyVibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleEnergyVibe(vibe.id)}
                    className={`p-2.5 min-h-[48px] rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? `${vibe.tagColor} border-current font-bold shadow-sm ring-1 ring-white/20`
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-base shrink-0">{vibe.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{vibe.label}</span>
                      <span className="text-[9px] text-neutral-400 block truncate leading-tight opacity-80">
                        {vibe.description.split(",")[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BLOQUE 2: QUIÉN & DÓNDE (Siempre visible, optimizado)     */}
          {/* ======================================================== */}

          {/* 2.1 Rol / Posición */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              🛡️ {t.filters.rolePositionLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = filters.roles.includes(role as RoleType);
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleRole(role as RoleType)}
                    className={`px-3 py-1.5 min-h-[38px] rounded-full border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {getRoleDisplayLabel(role as RoleType, language)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2.2 Cápsula de Confianza & Logística (Grid 2x2 ergonómico) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              ⚡ {language === "es" ? "Confianza & Logística" : "Trust & Logistics"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Tiene lugar ya */}
              <button
                type="button"
                role="switch"
                aria-checked={filters.immediateHostOnly}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    immediateHostOnly: !prev.immediateHostOnly,
                  }))
                }
                className={`p-3 min-h-[58px] rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  filters.immediateHostOnly
                    ? "bg-electricViolet/20 border-electricViolet/60 text-white shadow-sm ring-1 ring-electricViolet/30"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Home
                    className={`w-4 h-4 ${
                      filters.immediateHostOnly ? "text-electricViolet-glow" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      filters.immediateHostOnly ? "bg-electricViolet shadow-sm shadow-electricViolet" : "bg-neutral-600"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {t.filters.immediateHostOnly}
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {language === "es" ? "Lugar propio ya" : "Hosting ready now"}
                  </span>
                </div>
              </button>

              {/* Cero plantones (Anti-ghost) */}
              <button
                type="button"
                role="switch"
                aria-checked={filters.onlyAntiGhost}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    onlyAntiGhost: !prev.onlyAntiGhost,
                  }))
                }
                className={`p-3 min-h-[58px] rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  filters.onlyAntiGhost
                    ? "bg-emerald-500/20 border-emerald-500/60 text-white shadow-sm ring-1 ring-emerald-500/30"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Ghost
                    className={`w-4 h-4 ${
                      filters.onlyAntiGhost ? "text-emerald-400" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      filters.onlyAntiGhost ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-neutral-600"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {t.filters.antiGhostShortTitle}
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {language === "es" ? "90%+ de respeto" : "90%+ respect karma"}
                  </span>
                </div>
              </button>

              {/* Verificados 3D */}
              <button
                type="button"
                role="switch"
                aria-checked={!!filters.onlyVerified}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    onlyVerified: !prev.onlyVerified,
                  }))
                }
                className={`p-3 min-h-[58px] rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  filters.onlyVerified
                    ? "bg-electricViolet/20 border-electricViolet/60 text-white shadow-sm ring-1 ring-electricViolet/30"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <ShieldCheck
                    className={`w-4 h-4 ${
                      filters.onlyVerified ? "text-electricViolet-glow" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      filters.onlyVerified ? "bg-electricViolet shadow-sm shadow-electricViolet" : "bg-neutral-600"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {t.filters.verified3dTitle}
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {language === "es" ? "Identidad 3D real" : "Biometrically verified"}
                  </span>
                </div>
              </button>

              {/* Deseos mutuos */}
              <button
                type="button"
                role="switch"
                aria-checked={!!filters.onlyMutualKinks}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    onlyMutualKinks: !prev.onlyMutualKinks,
                  }))
                }
                className={`p-3 min-h-[58px] rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  filters.onlyMutualKinks
                    ? "bg-bloodNeon/20 border-bloodNeon/60 text-white shadow-sm ring-1 ring-bloodNeon/30"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Flame
                    className={`w-4 h-4 ${
                      filters.onlyMutualKinks ? "text-bloodNeon" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      filters.onlyMutualKinks ? "bg-bloodNeon shadow-sm shadow-bloodNeon" : "bg-neutral-600"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {t.filters.mutualDesiresTitle}
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {language === "es" ? "Mismos gustos" : "Shared preferences"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2.3 A quién querés ver (Gender Interests) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              👥 {t.filters.genderInterestLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_INTEREST_OPTIONS.map((interest) => {
                const isSelected = (filters.genderInterests || []).includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleGenderInterest(interest.id)}
                    className={`px-3 py-1.5 min-h-[38px] rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{interest.emoji}</span>
                    <span>{interest.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BLOQUE 3: ACORDEÓN PLEGABLE INTELIGENTE                  */}
          {/* (Fetiches agrupados, Sustancias y Distancia)             */}
          {/* ======================================================== */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full p-3.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white flex items-center justify-between transition-all cursor-pointer group active:scale-[0.99]"
              aria-expanded={isAdvancedOpen}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 group-hover:text-white transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white block">
                      {t.filters.advancedAccordionTitle}
                    </span>
                    {advancedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-electricViolet text-white">
                        {advancedCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 block">
                    {t.filters.advancedAccordionSub}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                  isAdvancedOpen ? "rotate-180 text-electricViolet" : ""
                }`}
              />
            </button>

            {/* Contenido Desplegable */}
            {isAdvancedOpen && (
              <div className="mt-4 space-y-5 pl-1 pr-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* 3.1 Morbos del Catálogo agrupados por tribu/categoría */}
                <div className="space-y-3 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                    {t.filters.kinksSection}
                  </label>

                  {/* Grupo 1: Cuero & Gear */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                      <span>⛓️</span>
                      <span>{t.filters.kinkCategoryGear}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {gearKinks.map((kink) => {
                        const isSelected = filters.selectedKinks.includes(kink.id);
                        return (
                          <button
                            key={kink.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleKink(kink.id)}
                            className={`px-2.5 py-1 min-h-[34px] rounded-full border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-bloodNeon text-white border-bloodNeon font-semibold shadow-blood-glow"
                                : "bg-white/5 border-white/10 text-neutral-400 hover:border-bloodNeon/50 hover:text-white"
                            }`}
                          >
                            {getKinkLocalizedLabel(kink.id, t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grupo 2: Dinámicas de Poder */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                      <span>⚡</span>
                      <span>{t.filters.kinkCategoryDynamic}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dynamicKinks.map((kink) => {
                        const isSelected = filters.selectedKinks.includes(kink.id);
                        return (
                          <button
                            key={kink.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleKink(kink.id)}
                            className={`px-2.5 py-1 min-h-[34px] rounded-full border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-bloodNeon text-white border-bloodNeon font-semibold shadow-blood-glow"
                                : "bg-white/5 border-white/10 text-neutral-400 hover:border-bloodNeon/50 hover:text-white"
                            }`}
                          >
                            {getKinkLocalizedLabel(kink.id, t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grupo 3: Morbos & Prácticas */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                      <span>🔥</span>
                      <span>{t.filters.kinkCategoryPractices}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {practicesKinks.map((kink) => {
                        const isSelected = filters.selectedKinks.includes(kink.id);
                        return (
                          <button
                            key={kink.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleKink(kink.id)}
                            className={`px-2.5 py-1 min-h-[34px] rounded-full border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-bloodNeon text-white border-bloodNeon font-semibold shadow-blood-glow"
                                : "bg-white/5 border-white/10 text-neutral-400 hover:border-bloodNeon/50 hover:text-white"
                            }`}
                          >
                            {getKinkLocalizedLabel(kink.id, t)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3.2 Atmósfera de Sustancias */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    {t.filters.substanceSectionTitle}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      Object.keys(SUBSTANCE_ATMOSPHERE_CATALOG) as SubstanceAtmosphere[]
                    ).map((key) => {
                      const item = SUBSTANCE_ATMOSPHERE_CATALOG[key];
                      const isSelected = filters.substanceAtmospheres?.includes(key);
                      const langKey = language === "en" ? "en" : "es";

                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={!!isSelected}
                          onClick={() => toggleSubstanceAtmosphere(key)}
                          className={`p-2 min-h-[44px] rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                            isSelected
                              ? `${item.badgeClass} ring-1 ring-white/30 font-bold shadow-md`
                              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className="truncate">{item.title[langKey]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.3 Intensidad Corporal Mínima */}
                <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🌶️</span>
                      <span>{t.filters.intensitySection}</span>
                    </label>
                    <span className="text-xs font-bold text-electricViolet-glow font-mono">
                      {INTENSITY_LABELS[filters.minIntensity]?.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {tempoList.map((tempo) => {
                      const isSelected = filters.minIntensity === tempo.lvl;
                      return (
                        <button
                          key={tempo.lvl}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, minIntensity: tempo.lvl }))
                          }
                          className={`py-2 px-1 min-h-[42px] rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            isSelected
                              ? tempo.lvl === 4
                                ? "bg-bloodNeon border-bloodNeon text-white shadow-blood-glow"
                                : "bg-electricViolet border-electricViolet text-white shadow-violet-soft font-bold"
                              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="text-sm leading-none">{tempo.emoji}</span>
                          <span className="text-[10px] font-bold tracking-tight block truncate w-full">
                            {tempo.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[10px] text-neutral-400 block pt-0.5 leading-tight">
                    {INTENSITY_LABELS[filters.minIntensity]?.desc}
                  </span>
                </div>

                {/* 3.4 Rango de Distancia */}
                <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      📍 {t.filters.maxDistanceLabel}
                    </label>
                    <span className="text-xs font-bold text-white font-mono">
                      {filters.maxDistanceKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={filters.maxDistanceKm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxDistanceKm: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-electricViolet bg-neutral-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>0.5 km</span>
                    <span>10 km</span>
                    <span>20 km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con Safe-Area */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 bg-obsidian/95 backdrop-blur-xl sticky bottom-0">
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-full py-3.5 bg-electricViolet text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-electricViolet-glow transition-all shadow-violet-soft active:scale-[0.99] cursor-pointer"
          >
            {t.filters.apply} ({filteredProfiles.length})
          </button>
        </div>
      </div>
    </div>
  );
};
