"use client";

import React from "react";
import { useSettings } from "@/context/VesselContext";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { KinksTab } from "../tabs/KinksTab";
import { Flame } from "lucide-react";

export interface KinksSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KinksSheet: React.FC<KinksSheetProps> = ({ isOpen, onClose }) => {
  const { language } = useSettings();

  if (!isOpen) return null;

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title={language === "es" ? "Tus Morbos y Fetiches" : "Your Kinks & Desires"}
      subtitle="Coincidencia ciega mutua: solo se revela ante coincidencia mutua"
      icon={<Flame className="w-5 h-5 text-bloodNeon" />}
      maxWidth="3xl"
      className="p-1 sm:p-2"
    >
      <div data-testid="kinks-tab" className="overflow-y-auto max-h-[75vh] sm:max-h-[80vh] p-2 sm:p-4 space-y-4">
        {/* MATRIZ DE MORBOS & FETICHES */}
        <KinksTab />
      </div>
    </BrutalistModal>
  );
};
