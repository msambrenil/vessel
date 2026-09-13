"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { BrutalistModal, BrutalistButton } from "@/components/ui";

export const DuoLinkModal: React.FC = () => {
  const {
    isDuoModalOpen,
    closeDuoModal,
    myDuoLink,
    linkDuoPartner,
    unlinkDuoPartner,
    profiles,
    t,
  } = useVessel();

  const [jointTitle, setJointTitle] = useState("Pareja Versátil en Palermo");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || "");

  const handleLink = () => {
    const partner = profiles.find((p) => p.id === selectedProfileId);
    if (partner) {
      linkDuoPartner(partner, jointTitle);
    }
  };

  return (
    <BrutalistModal
      isOpen={isDuoModalOpen}
      onClose={closeDuoModal}
      title={t.tacticalSuite.cruising.duoMode}
      subtitle="Vinculá dos perfiles para buscar juntos un tercero"
      icon="👥"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono">
        {myDuoLink.isLinked ? (
          /* Ya vinculado */
          <div className="space-y-4 text-center">
            <div className="p-4 bg-purple-950/30 border border-electricViolet/40 rounded-2xl space-y-2 shadow-violet-soft">
              <span className="font-mono text-xs font-bold text-electricViolet-glow uppercase tracking-wider block">
                VINCULADO EN MODO DÚO
              </span>
              <p className="text-sm font-mono font-bold text-neutral-200">
                {myDuoLink.jointTitle}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-electricViolet/60 flex items-center justify-center font-mono font-bold text-purple-200">
                  VOS
                </div>
                <span className="text-neutral-500 font-mono text-base">+</span>
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-electricViolet/60 flex items-center justify-center font-mono font-bold text-purple-200">
                  {myDuoLink.partnerCodename?.slice(0, 2) || "P"}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                Ambos perfiles se muestran juntos en la matriz y comparten el mismo hilo de chat al recibir mensajes.
              </p>
            </div>

            <BrutalistButton
              variant="danger"
              size="lg"
              onClick={unlinkDuoPartner}
              className="w-full min-h-[44px]"
            >
              Desvincular Modo Dúo
            </BrutalistButton>
          </div>
        ) : (
          /* Formulario de vinculación */
          <div className="space-y-3.5">
            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                Título de la Pareja / Dúo:
              </label>
              <input
                type="text"
                value={jointTitle}
                onChange={(e) => setJointTitle(e.target.value)}
                placeholder="Ej: Pareja Versátil en Palermo"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet font-mono"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                Seleccionar Compañero / Pareja:
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet font-mono"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codename} ({p.role} • {p.yoSoy})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-neutral-500">
              Al vincularte, tu ficha en la matriz incluirá la insignia de Dúo y ambos responderán de manera coordinada.
            </p>

            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={handleLink}
              className="w-full min-h-[44px] uppercase tracking-wider font-bold mt-1"
            >
              Activar Modo Dúo 👥
            </BrutalistButton>
          </div>
        )}
      </div>
    </BrutalistModal>
  );
};
