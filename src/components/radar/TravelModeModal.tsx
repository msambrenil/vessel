"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";

export const TravelModeModal: React.FC = () => {
  const {
    isTravelModalOpen,
    closeTravelModal,
    travelMode,
    setTravelModeCity,
    resetTravelMode,
    t,
  } = useVessel();

  if (!isTravelModalOpen) return null;

  const cities = [
    { name: "Buenos Aires", country: "Argentina", coords: { lat: -34.5885, lng: -58.4376 }, flag: "🇦🇷" },
    { name: "Berlín", country: "Alemania", coords: { lat: 52.52, lng: 13.405 }, flag: "🇩🇪" },
    { name: "Madrid", country: "España", coords: { lat: 40.4168, lng: -3.7038 }, flag: "🇪🇸" },
    { name: "São Paulo", country: "Brasil", coords: { lat: -23.5505, lng: -46.6333 }, flag: "🇧🇷" },
    { name: "Nueva York", country: "Estados Unidos", coords: { lat: 40.7128, lng: -74.006 }, flag: "🇺🇸" },
    { name: "Londres", country: "Reino Unido", coords: { lat: 51.5074, lng: -0.1278 }, flag: "🇬🇧" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✈️</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.unlimited.travelMode}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Teleporta tu presencia a otra ciudad antes de aterrizar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeTravelModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 text-xs">
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
              <button
                type="button"
                onClick={resetTravelMode}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-[10px] uppercase rounded transition-all"
              >
                Restablecer GPS Real
              </button>
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
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setTravelModeCity(city.name, city.country, city.coords)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isCurrent
                        ? "bg-amber-950/40 border-amber-500 text-amber-300 font-bold shadow-sm"
                        : "bg-neutral-900/40 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <span className="text-xl">{city.flag}</span>
                    <div className="truncate">
                      <div className="font-mono font-bold text-xs truncate">{city.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{city.country}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-neutral-500">
            Al activar Travel Mode, el radar de proximidad y la grilla cargan los perfiles locales de la ciudad seleccionada.
          </p>
        </div>
      </div>
    </div>
  );
};
