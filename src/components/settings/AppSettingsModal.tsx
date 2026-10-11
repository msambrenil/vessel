"use client";

import React from "react";
import { useSettings } from "@/context/VesselContext";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { AppSettingsSection } from "@/components/account/AppSettingsSection";
import { BrutalistModal } from "@/components/ui";

export const AppSettingsModal: React.FC = () => {
  const { isAppSettingsModalOpen, closeAppSettingsModal, t } = useSettings();

  return (
    <BrutalistModal
      isOpen={isAppSettingsModalOpen}
      onClose={closeAppSettingsModal}
      maxWidth="lg"
      icon={<VesselLogo size={22} showWordmark={false} />}
      title={
        <div className="flex items-center gap-2">
          <span>{t.settings.title}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/15 text-electricViolet-glow font-bold border border-electricViolet/30">
            SYSTEM
          </span>
        </div>
      }
      subtitle={t.settings.subtitle}
      ariaLabel={t.settings.title}
      contentClassName="p-4 space-y-4"
    >
      <AppSettingsSection />
    </BrutalistModal>
  );
};
