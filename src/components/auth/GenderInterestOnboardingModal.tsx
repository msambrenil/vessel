"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { GENDER_INTEREST_OPTIONS } from "@/data/genderCatalog";
import { GenderInterest } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Users, Check, Sparkles, ShieldCheck } from "lucide-react";

export const GenderInterestOnboardingModal: React.FC = () => {
  const {
    isGenderOnboardingOpen,
    closeGenderOnboarding,
    myProfile,
    updateMyProfile,
    language,
  } = useVessel();

  const [selectedInterests, setSelectedInterests] = useState<GenderInterest[]>(() => {
    return myProfile.genderInterests && myProfile.genderInterests.length > 0
      ? myProfile.genderInterests
      : ["all"];
  });

  useEffect(() => {
    if (isGenderOnboardingOpen) {
      setSelectedInterests(
        myProfile.genderInterests && myProfile.genderInterests.length > 0
          ? myProfile.genderInterests
          : ["all"]
      );
    }
  }, [isGenderOnboardingOpen, myProfile.genderInterests]);

  if (!isGenderOnboardingOpen) return null;

  const handleToggle = (id: GenderInterest) => {
    audioEngine.playPulse();
    setSelectedInterests((prev) => {
      if (id === "all") {
        return ["all"];
      }

      // Si estaba "all" y seleccionamos uno específico, quitamos "all"
      const withoutAll = prev.filter((item) => item !== "all");
      const exists = withoutAll.includes(id);

      let next: GenderInterest[];
      if (exists) {
        next = withoutAll.filter((item) => item !== id);
      } else {
        next = [...withoutAll, id];
      }

      // Si desmarcó todo, vuelve a "all" por defecto
      if (next.length === 0) {
        return ["all"];
      }

      return next;
    });
  };

  const handleSelectAll = () => {
    audioEngine.playPulse();
    setSelectedInterests(["all"]);
  };

  const handleSave = () => {
    audioEngine.playVaultUnlock();
    updateMyProfile({ genderInterests: selectedInterests });
    closeGenderOnboarding();
  };

  const isAllSelected = selectedInterests.includes("all");

  return (
    <BrutalistModal
      isOpen={isGenderOnboardingOpen}
      onClose={closeGenderOnboarding}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-electricViolet" />
          <span className="font-mono font-black uppercase tracking-wider text-sm sm:text-base text-white">
            {language === "es"
              ? "¿A quiénes te interesa conocer?"
              : "Who do you want to meet?"}
          </span>
        </div>
      }
      subtitle={
        language === "es"
          ? "Personalizá tu radar táctico. Solo verás en la matriz a los perfiles que coincidan con tus intereses."
          : "Customize your tactical radar. You will only see profiles matching your desires on the matrix."
      }
    >
      <div className="space-y-4 pt-1">
        {/* Banner Táctico Informativo */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-electricViolet/10 border border-electricViolet/30 text-xs font-mono text-purple-200">
          <Sparkles className="w-4 h-4 text-electricViolet-glow flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === "es"
              ? "Seleccioná una o varias opciones. Podrás modificar o abrir tus preferencias cuando quieras desde tu Perfil o Filtros."
              : "Select one or more options. You can change or expand your preferences anytime from your Profile or Filters."}
          </p>
        </div>

        {/* Grilla de Chips de Interés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {GENDER_INTEREST_OPTIONS.map((opt) => {
            const isSelected =
              opt.id === "all"
                ? isAllSelected
                : !isAllSelected && selectedInterests.includes(opt.id);

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleToggle(opt.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isSelected
                    ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft"
                    : "bg-black/40 border-white/10 text-neutral-300 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg leading-none">{opt.emoji}</span>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-xs tracking-wide uppercase font-mono text-white">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {opt.sublabel}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors flex-shrink-0 ${
                    isSelected
                      ? "bg-electricViolet border-electricViolet text-white"
                      : "border-white/20 bg-black/40 text-transparent"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Botonera de Acción */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            {language === "es" ? "Seleccionar Todos (Ver todo)" : "Select All (View all)"}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BrutalistButton
              variant="primary"
              size="default"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold shadow-violet-glow"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 inline" />
              {language === "es" ? "Guardar y Entrar" : "Save & Enter"}
            </BrutalistButton>
          </div>
        </div>
      </div>
    </BrutalistModal>
  );
};
