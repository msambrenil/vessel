"use client";

import React from "react";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { BioTab } from "../tabs/BioTab";
import { Zap } from "lucide-react";

export interface VibePhysicalSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VibePhysicalSheet: React.FC<VibePhysicalSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title="La Onda, Rol & Físico"
      subtitle="Tu rol, qué pinta hoy, contextura física y redes sin vueltas"
      icon={<Zap className="w-5 h-5 text-electricViolet-glow" />}
      maxWidth="3xl"
      className="p-1 sm:p-2"
    >
      <div data-testid="bio-tab" className="overflow-y-auto max-h-[75vh] sm:max-h-[80vh] p-2 sm:p-4 space-y-4">
        <BioTab />
      </div>
    </BrutalistModal>
  );
};
