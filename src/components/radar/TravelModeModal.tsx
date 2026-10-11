"use client";

import React from "react";
import { useLogistics, useSettings } from "@/context/VesselContext";
import { BrutalistButton, BrutalistModal } from "@/components/ui";

export const TravelModeModal: React.FC = () => {
  const {
    isTravelModalOpen,
    closeTravelModal,
    travelMode,
    setTravelModeCity,
    resetTravelMode,
  } = useLogistics();
  const { t } = useSettings();

  const cities = [
    { name: "Río Cuarto", country: "Argentina", coords: { lat: -33.1325, lng: -64.3470 }, flag: "🇦🇷" },
    { name: "Buenos Aires", country: "Argentina", coords: { lat: -34.5885, lng: -58.4376 }, flag: "🇦🇷" },
    { name: "Córdoba", country: "Argentina", coords: { lat: -31.4201, lng: -64.1888 }, flag: "🇦🇷" },
    { name: "Rosario", country: "Argentina", coords: { lat: -32.9468, lng: -60.6393 }, flag: "🇦🇷" },
    { name: "Mendoza", country: "Argentina", coords: { lat: -32.8895, lng: -68.8458 }, flag: "🇦🇷" },
    { name: "Mar del Plata", country: "Argentina", coords: { lat: -38.0055, lng: -57.5562 }, flag: "🇦🇷" },
    { name: "São Paulo", country: "Brasil", coords: { lat: -23.5505, lng: -46.6333 }, flag: "🇧🇷" },
    { name: "Madrid", country: "España", coords: { lat: 40.4168, lng: -3.7038 }, flag: "🇪🇸" },
    { name: "Berlín", country: "Alemania", coords: { lat: 52.52, lng: 13.405 }, flag: "🇩🇪" },
  ];

  return (
    <BrutalistModal
      isOpen={isTravelModalOpen}
      onClose={closeTravelModal}
      icon="✈️"
      title={t.tacticalSuite.unlimited.travelMode}
      subtitle="Teleporta tu presencia a otra ciudad antes de aterrizar"
      maxWidth="md"
      ariaLabel={t.tacticalSuite.unlimited.travelMode}
      contentClassName="p-5 space-y-4 text-xs"
    >
      {travelMode.isActive && (
        <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-xl flex items-center justify-between">
          <div>
            <span className="font-mono text-amber-400 font-bold uppercase block text-xs">
              TELEPORTACIÓN ACTIVA
            </span>
            <span className="text-[11px] text-neutral-300 font-mono">
              {travelMode.cityName}, {travelMode.country}
            </span>
          </div>
          <BrutalistButton
            type="button"
            variant="ghost"
            size="compact"
            soundEffect="none"
            onClick={resetTravelMode}
            className="!px-2.5 !py-1.5 !bg-neutral-800 hover:!bg-neutral-700 text-neutral-200 font-mono text-[10px] uppercase !rounded-lg"
          >
            Restablecer GPS Real
          </BrutalistButton>
        </div>
      )}

      <div className="space-y-1.5">
        <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
          Ciudades Tácticas Disponibles:
        </span>
        <div className="grid grid-cols-2 gap-2">
          {cities.map((city) => {
            const isCurrent = travelMode.isActive && travelMode.cityName === city.name;
            return (
              <BrutalistButton
                key={city.name}
                type="button"
                variant="ghost"
                soundEffect="pulse"
                onClick={() => setTravelModeCity(city.name, city.country, city.coords)}
                className={`!p-3 min-h-[48px] !rounded-xl border !justify-start !text-left flex items-center gap-2.5 transition-all ${
                  isCurrent
                    ? "!bg-amber-950/40 !border-amber-500 text-amber-300 font-bold shadow-sm"
                    : "!bg-neutral-900/40 !border-neutral-800 text-neutral-300 hover:!border-neutral-700"
                }`}
              >
                <span className="text-xl shrink-0">{city.flag}</span>
                <div className="truncate min-w-0">
                  <div className="font-mono font-bold text-xs truncate">{city.name}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{city.country}</div>
                </div>
              </BrutalistButton>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-neutral-500">
        Al activar el Modo Viajero, el radar de proximidad y la grilla cargan los perfiles locales de la ciudad seleccionada.
      </p>
    </BrutalistModal>
  );
};
