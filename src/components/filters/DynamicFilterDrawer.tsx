"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { ROLE_OPTIONS, KINK_CATALOG, INTENSITY_LABELS } from "@/data/kinkCatalog";
import { ENERGY_VIBE_CATALOG } from "@/data/energyCatalog";
import { GENDER_INTEREST_OPTIONS } from "@/data/genderCatalog";
import { RoleType, BodyState, EnergyVibe, SubstanceAtmosphere, GenderInterest } from "@/types/vessel";
import { SUBSTANCE_ATMOSPHERE_CATALOG } from "@/data/substanceCatalog";
import { X, Check, RotateCcw, SlidersHorizontal, Ghost, Flame, Sparkles, ShieldCheck } from "lucide-react";
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
    formatDist,
    language,
    openGeoBatteryModal,
  } = useVessel();

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

  const toggleBodyState = (st: BodyState) => {
    setFilters((prev) => {
      const exists = prev.bodyStates.includes(st);
      return {
        ...prev,
        bodyStates: exists
          ? prev.bodyStates.filter((s) => s !== st)
          : [...prev.bodyStates, st],
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
              className="p-1.5 text-neutral-400 hover:text-white flex items-center gap-1 text-xs font-medium"
              title={t.filters.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.filters.reset}</span>
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido de Filtros */}
        <div className="p-4 pb-16 space-y-6 flex-1">
          {/* 1. SECCIÓN DE ENERGÍA DESEADA (VIBES) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-electricViolet" />
                <span>{t.card?.energyLabel || (language === "es" ? "Energía Deseada y Clima" : "Desired Energy and Vibe")}</span>
              </label>
              {filters.energyVibes.length > 0 && (
                <span className="text-[10px] font-mono text-electricViolet-glow font-bold">
                  {filters.energyVibes.length} {t.filters?.selectedCount || (language === "es" ? "seleccionada(s)" : "selected")}
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
                    className={`p-2.5 min-h-[44px] rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? `${vibe.tagColor} border-current font-bold shadow-sm ring-1 ring-white/20`
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{vibe.emoji}</span>
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

          {/* 2. CULTURA DEL RESPETO & ANTI-GHOST SWITCH */}
          <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Ghost className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{t.filters?.antiGhostShortTitle || (language === "es" ? "Solo Perfiles Anti-Plantón" : "Anti-Ghost Profiles Only")}</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {language === "es" ? `Usuarios con 90%+ ${t.card?.respectScore || "Puntaje de Respeto"} y salidas amables` : "Users with 90%+ Respect Score and kind departures"}
                </div>
              </div>
            </div>
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                filters.onlyAntiGhost ? "bg-emerald-500" : "bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                  filters.onlyAntiGhost ? "translate-x-6 bg-black" : "translate-x-0 bg-neutral-300"
                }`}
              />
            </button>
          </div>

          {/* 2.1. FILTRO DE IDENTIDAD VERIFICADA 3D */}
          <div className="bg-purple-950/20 rounded-2xl p-4 border border-electricViolet/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-900/30 text-electricViolet border border-electricViolet/30">
                <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{t.filters?.verified3dTitle || (language === "es" ? "Solo Perfiles Verificados 3D" : "3D Verified Profiles Only")}</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {t.filters?.verified3dDesc || (language === "es" ? "Identidad biometrizada contra estafas y bots" : "Biometrically verified identity")}
                </div>
              </div>
            </div>
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                filters.onlyVerified ? "bg-electricViolet" : "bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                  filters.onlyVerified ? "translate-x-6 bg-black" : "translate-x-0 bg-neutral-300"
                }`}
              />
            </button>
          </div>

          {/* 2.2. FILTRO DE DESEOS MUTUOS (KINK MATRIX) */}
          <div className="bg-purple-950/20 rounded-2xl p-4 border border-electricViolet/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-900/30 text-electricViolet-glow border border-electricViolet/30">
                <Flame className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{t.filters?.mutualDesiresTitle || (language === "es" ? "Solo con Deseos Mutuos" : "Mutual Desires Only")}</span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  {language === "es"
                    ? "Perfiles con al menos 1 coincidencia en morbos y preferencias mutuas"
                    : "Profiles with at least 1 match in preferences"}
                </div>
              </div>
            </div>
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                filters.onlyMutualKinks ? "bg-electricViolet" : "bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                  filters.onlyMutualKinks ? "translate-x-6 bg-black" : "translate-x-0 bg-neutral-300"
                }`}
              />
            </button>
          </div>

          {/* 3. Estados de Disponibilidad */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {t.filters?.availabilityLabel || (language === "es" ? "Disponibilidad" : "Availability")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "open", label: t.bodyState.open },
                  { id: "occupied", label: t.bodyState.occupied },
                  { id: "dormant", label: t.bodyState.dormant },
                ] as { id: BodyState; label: string }[]
              ).map((st) => {
                const isSelected = filters.bodyStates.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleBodyState(st.id)}
                    className={`py-2 px-2 min-h-[44px] rounded-xl border text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Hosting Inmediato Switch */}
          <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                {t.card?.hostImmediate || (language === "es" ? "Anfitrión Inmediato" : "Immediate Host")}
              </div>
              <div className="text-[11px] text-neutral-400">
                {t.filters?.immediateHostDesc || (language === "es" ? "Mostrar solo con lugar disponible ahora" : "Show only profiles with a place right now")}
              </div>
            </div>
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
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                filters.immediateHostOnly ? "bg-electricViolet" : "bg-white/15"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${
                  filters.immediateHostOnly ? "translate-x-6 bg-black" : "translate-x-0 bg-neutral-300"
                }`}
              />
            </button>
          </div>

          {/* 5. Nivel de Intensidad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {t.filters?.minIntensityLabel || (language === "es" ? "Intensidad Mínima" : "Minimum Intensity")}
              </label>
              <span className="text-xs font-bold text-electricViolet-glow">
                {INTENSITY_LABELS[filters.minIntensity].label}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={filters.minIntensity === lvl}
                  onClick={() => setFilters((prev) => ({ ...prev, minIntensity: lvl }))}
                  className={`py-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                    filters.minIntensity === lvl
                      ? lvl === 4
                        ? "bg-bloodNeon border-bloodNeon text-white shadow-blood-glow"
                        : "bg-electricViolet border-electricViolet text-white shadow-violet-soft font-bold"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.filters?.levelPrefix || (language === "es" ? "Nivel" : "Level")} {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 5.5. Intereses de Encuentro */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {t.filters?.genderInterestLabel || (language === "es" ? "Intereses de Encuentro" : "Encounter Interests")}
            </label>
            <div className="flex flex-wrap gap-2">
              {GENDER_INTEREST_OPTIONS.map((interest) => {
                const isSelected = (filters.genderInterests || []).includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleGenderInterest(interest.id)}
                    className={`px-3 py-2 min-h-[40px] rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
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

          {/* 6. Roles / Posición */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {t.filters?.rolePositionLabel || (language === "es" ? "Rol / Posición" : "Role / Position")}
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => {
                const isSelected = filters.roles.includes(role as RoleType);
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleRole(role as RoleType)}
                    className={`px-3 py-2 min-h-[40px] rounded-full border text-xs font-medium transition-all ${
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

          {/* 7. Catálogo Kink & Tribus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {t.filters.kinksSection || "Fetiches & Tribus"}
            </label>
            <div className="flex flex-wrap gap-2">
              {KINK_CATALOG.map((kink) => {
                const isSelected = filters.selectedKinks.includes(kink.id);
                return (
                  <button
                    key={kink.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleKink(kink.id)}
                    className={`px-3 py-1.5 min-h-[38px] rounded-full border text-xs font-medium transition-all ${
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

          {/* 7.1. Atmósfera de Sustancias */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {t.filters?.substanceSectionTitle || (language === "es" ? "🍸 Atmósfera de Consumo y Sustancias" : "🍸 Substance & Consumption Vibe")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SUBSTANCE_ATMOSPHERE_CATALOG) as SubstanceAtmosphere[]).map((key) => {
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
                    <span className="text-sm">{item.icon}</span>
                    <span className="truncate">{item.title[langKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Rango de Distancia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {t.filters?.maxDistanceLabel || (language === "es" ? "Distancia Máxima" : "Maximum Distance")}
              </label>
              <span className="text-xs font-bold text-white">
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
          </div>

          {/* Calibración de Sensor GPS & Batería */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                openGeoBatteryModal();
              }}
              className="w-full p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-between transition-all cursor-pointer group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🛰️</span>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono block text-white">
                    {language === "es" ? "Calibrar Sensor GPS & Batería" : "Calibrate GPS & Battery Sensor"}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    {language === "es" ? "Satélite, telemetría y precisión de distancia" : "Satellite, telemetry & distance precision"}
                  </span>
                </div>
              </div>
              <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">⚙️</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 bg-obsidian/95 backdrop-blur-xl sticky bottom-0">
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-full py-3.5 bg-electricViolet text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-electricViolet-glow transition-all shadow-violet-soft"
          >
            {t.filters.apply} ({filteredProfiles.length})
          </button>
        </div>
      </div>
    </div>
  );
};

