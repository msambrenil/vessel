"use client";

import React, { useState } from "react";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { BoundariesTab } from "../tabs/BoundariesTab";
import { ReputationTab } from "../tabs/ReputationTab";
import { ShieldCheck } from "lucide-react";
import { SegmentedTabGroup, SegmentedTabItem } from "@/components/ui";

export interface SafetySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type SafetySubTab = "karma_reputation" | "boundaries_privacy";

export const SafetySheet: React.FC<SafetySheetProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SafetySubTab>("karma_reputation");

  if (!isOpen) return null;

  const tabs: SegmentedTabItem<SafetySubTab>[] = [
    {
      id: "karma_reputation",
      label: "🛡️ Karma & Verificación",
    },
    {
      id: "boundaries_privacy",
      label: "🔒 Límites & Ubicación",
    },
  ];

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title="Blindaje & Buen Karma"
      subtitle="Verificación facial, límites claros, karma anti-plantones y auxilio SOS"
      icon={<ShieldCheck className="w-5 h-5 text-mintNeon" />}
      maxWidth="3xl"
      className="p-1 sm:p-2"
    >
      <div className="overflow-y-auto max-h-[75vh] sm:max-h-[80vh] p-2 sm:p-4 space-y-3.5">
        <SegmentedTabGroup
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          variant="violet"
        />

        <div
          data-testid="reputation-tab"
          className={activeTab === "karma_reputation" ? "space-y-4 animate-fade-in" : "hidden"}
        >
          <ReputationTab />
        </div>

        <div
          data-testid="boundaries-tab"
          className={activeTab === "boundaries_privacy" ? "space-y-4 animate-fade-in" : "hidden"}
        >
          <BoundariesTab />
        </div>
      </div>
    </BrutalistModal>
  );
};
