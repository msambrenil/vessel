"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { HostCardInfo, HostLivingArrangement, HostSpaceType, HostPets, AmbientSoundVibeType } from "@/types/vessel";
import { Play, Pause, Music } from "lucide-react";

export const HostCardModal: React.FC = () => {
  const {
    isHostCardModalOpen,
    closeHostCardModal,
    selectedHostCardProfile,
    myHostCard,
    updateMyHostCard,
    playAmbientTonePreview,
    stopAmbientTonePreview,
    isPlayingAmbientTone,
    t,
  } = useVessel();

  const isEditingSelf = !selectedHostCardProfile;
  const currentCard = isEditingSelf ? myHostCard : selectedHostCardProfile.hostCard || myHostCard;

  const [formData, setFormData] = useState<HostCardInfo>(currentCard);

  useEffect(() => {
    if (isEditingSelf) {
      setFormData(myHostCard);
    } else if (selectedHostCardProfile?.hostCard) {
      setFormData(selectedHostCardProfile.hostCard);
    }
  }, [isEditingSelf, myHostCard, selectedHostCardProfile]);

  if (!isHostCardModalOpen) return null;

  const handleSave = () => {
    if (isEditingSelf) {
      updateMyHostCard(formData);
    }
    closeHostCardModal();
  };

  const toggleAmenity = (key: keyof typeof formData.amenities) => {
    if (!isEditingSelf) return;
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  const toggleSupply = (key: keyof typeof formData.supplies) => {
    if (!isEditingSelf) return;
    setFormData((prev) => ({
      ...prev,
      supplies: {
        ...prev.supplies,
        [key]: !prev.supplies[key],
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Táctico */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏠</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.hostCard.title}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {isEditingSelf
                  ? "Configuración logística de tu espacio"
                  : `Espacio de ${selectedHostCardProfile.codename}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeHostCardModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Disponibilidad de Lugar */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/60 flex items-center justify-between">
            <div>
              <span className="font-mono text-neutral-300 font-bold block">
                {formData.hasPlace
                  ? t.tacticalSuite.hostCard.hasPlace
                  : t.tacticalSuite.hostCard.noPlace}
              </span>
              <span className="text-[11px] text-neutral-500">
                {formData.hasPlace
                  ? "Puedo recibir en mi ubicación actual"
                  : "No tengo lugar disponible para encuentros"}
              </span>
            </div>
            {isEditingSelf && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, hasPlace: !prev.hasPlace }))}
                className={`px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all ${
                  formData.hasPlace
                    ? "bg-electricViolet text-white shadow-violet-soft"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {formData.hasPlace ? "HOST ON" : "HOST OFF"}
              </button>
            )}
          </div>

          {/* Convivencia y Privacidad */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              {t.tacticalSuite.hostCard.livingArrangementTitle}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "solo" as HostLivingArrangement, label: t.tacticalSuite.hostCard.solo, icon: "👤" },
                { key: "roommates" as HostLivingArrangement, label: t.tacticalSuite.hostCard.roommates, icon: "👥" },
                { key: "partner_aware" as HostLivingArrangement, label: t.tacticalSuite.hostCard.partnerAware, icon: "🤝" },
                { key: "hotel" as HostLivingArrangement, label: t.tacticalSuite.hostCard.hotel, icon: "🏨" },
              ].map((item) => {
                const isSelected = formData.livingArrangement === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={!isEditingSelf}
                    onClick={() => setFormData((prev) => ({ ...prev, livingArrangement: item.key }))}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-electricViolet text-electricViolet-glow font-bold shadow-sm"
                        : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comodidades Clave (Amenities) */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              {t.tacticalSuite.hostCard.amenitiesTitle}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "showerReady" as const, label: t.tacticalSuite.hostCard.showerReady, icon: "🚿" },
                { key: "cleanTowels" as const, label: t.tacticalSuite.hostCard.cleanTowels, icon: "🧼" },
                { key: "elevator" as const, label: t.tacticalSuite.hostCard.elevator, icon: "🛗" },
                { key: "acOrHeating" as const, label: t.tacticalSuite.hostCard.acOrHeating, icon: "❄️" },
                { key: "easyParking" as const, label: t.tacticalSuite.hostCard.easyParking, icon: "🅿️" },
              ].map((amenity) => {
                const isActive = formData.amenities[amenity.key];
                return (
                  <button
                    key={amenity.key}
                    type="button"
                    disabled={!isEditingSelf}
                    onClick={() => toggleAmenity(amenity.key)}
                    className={`p-2 rounded-lg border flex items-center justify-between text-left transition-all ${
                      isActive
                        ? "bg-purple-950/30 border-electricViolet/60 text-neutral-200"
                        : "bg-neutral-900/30 border-neutral-800/60 text-neutral-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{amenity.icon}</span>
                      <span className="truncate">{amenity.label}</span>
                    </span>
                    <span className={`font-mono text-[10px] ${isActive ? "text-electricViolet-glow font-bold" : "text-neutral-600"}`}>
                      {isActive ? "SÍ" : "NO"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insumos Listos (Supplies) */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
              {t.tacticalSuite.hostCard.suppliesTitle}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "condoms" as const, label: t.tacticalSuite.hostCard.condoms, icon: "🛡️" },
                { key: "lube" as const, label: t.tacticalSuite.hostCard.lube, icon: "💧" },
                { key: "poppers" as const, label: t.tacticalSuite.hostCard.poppers, icon: "⚡" },
                { key: "wipes" as const, label: t.tacticalSuite.hostCard.wipes, icon: "🧻" },
              ].map((supply) => {
                const isActive = formData.supplies[supply.key];
                return (
                  <button
                    key={supply.key}
                    type="button"
                    disabled={!isEditingSelf}
                    onClick={() => toggleSupply(supply.key)}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                      isActive
                        ? "bg-purple-950/40 border-electricViolet/50 text-electricViolet-glow font-bold"
                        : "bg-neutral-900/30 border-neutral-800 text-neutral-500"
                    }`}
                  >
                    <span className="text-base">{supply.icon}</span>
                    <span className="font-mono text-[10px] font-bold uppercase truncate">{supply.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soundtrack de Hospedaje & Clima Sonoro Analógico */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-electricViolet" />
                <span className="font-mono text-neutral-300 font-bold uppercase text-[11px]">
                  Soundtrack & Clima Sonoro
                </span>
              </div>
              <span className="text-[9px] font-mono text-electricViolet-glow bg-purple-950/40 px-2 py-0.5 rounded-full border border-electricViolet/30 font-bold">
                SÍNTESIS ANALÓGICA
              </span>
            </div>

            <p className="text-[10px] text-neutral-400">
              Define la atmósfera acústica que sonará en el espacio durante el encuentro.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: "subbass_50hz" as AmbientSoundVibeType, name: "Sub-Bass 50Hz", sub: "Resonancia analógica profunda" },
                { id: "dark_techno" as AmbientSoundVibeType, name: "Dark Techno", sub: "128 BPM beat Berghain" },
                { id: "berlin_industrial" as AmbientSoundVibeType, name: "Berlin Industrial", sub: "Hangar táctico crudo" },
                { id: "sensual_downtempo" as AmbientSoundVibeType, name: "Sensual Downtempo", sub: "85 BPM pulsión íntima" },
                { id: "ambient_chill" as AmbientSoundVibeType, name: "Ambient Chill", sub: "Texturas envolventes calmas" },
              ].map((vibe) => {
                const isSelected = formData.ambientVibe === vibe.id;

                return (
                  <div
                    key={vibe.id}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-electricViolet/60 text-electricViolet-glow font-bold shadow-sm"
                        : "bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!isEditingSelf}
                      onClick={() => {
                        if (!isEditingSelf) return;
                        setFormData((prev) => ({
                          ...prev,
                          ambientVibe: vibe.id,
                        }));
                      }}
                      className="flex-1 text-left cursor-pointer min-w-0"
                    >
                      <div className="font-mono text-xs font-bold text-white truncate">
                        {vibe.name}
                      </div>
                      <div className="text-[9px] text-neutral-400 truncate">
                        {vibe.sub}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAmbientTone) {
                          stopAmbientTonePreview();
                        } else {
                          playAmbientTonePreview(vibe.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg border transition-all flex-shrink-0 cursor-pointer ${
                        isPlayingAmbientTone
                          ? "bg-bloodNeon text-white border-bloodNeon"
                          : "bg-white/10 hover:bg-white/20 text-neutral-200 border-white/15"
                      }`}
                      title={isPlayingAmbientTone ? "Detener" : "Probar sonido"}
                    >
                      {isPlayingAmbientTone ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notas Tácticas de Hospedaje */}
          <div>
            <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
              Instrucciones & Notas del Lugar
            </label>
            {isEditingSelf ? (
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder={t.tacticalSuite.hostCard.notesPlaceholder}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-electricViolet transition-colors"
              />
            ) : (
              <p className="p-2.5 bg-neutral-900/50 border border-neutral-800/80 rounded-lg text-neutral-300 text-xs italic">
                {formData.notes || "Sin instrucciones especiales registradas."}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeHostCardModal}
            className="px-4 py-2 rounded-lg font-mono text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {isEditingSelf ? t.common.cancel : t.common.close}
          </button>
          {isEditingSelf && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-violet-soft transition-all active:scale-95"
            >
              {t.common.save}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
