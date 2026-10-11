"use client";

import React from "react";
import { useLogistics, useAuth, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BrutalistModal } from "@/components/ui/BrutalistModal";
import { Home, Clock, Sparkles } from "lucide-react";
import {
  SectionHeroHeader,
  BrutalistSwitch,
  BrutalistInput,
} from "@/components/ui";
import { HostLivingArrangement } from "@/types/vessel";
import { hasHostingCapability } from "@/lib/geo/mobility";
import { ExitProtocolSelector } from "@/components/profile/ExitProtocolSelector";
import { SubstanceAtmosphereSelector } from "@/components/profile/SubstanceAtmosphereSelector";

export interface LogisticsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogisticsSheet: React.FC<LogisticsSheetProps> = ({ isOpen, onClose }) => {
  const {
    myHostCard,
    updateMyHostCard,
  } = useLogistics();
  const {
    myProfile,
    updateMyProfile,
  } = useAuth();
  const { language } = useSettings();

  if (!isOpen) return null;

  const handleTogglePlace = (hasPlace: boolean) => {
    updateMyHostCard({ hasPlace });
    if (updateMyProfile) {
      if (hasPlace && !hasHostingCapability(myProfile?.mobility)) {
        updateMyProfile({ mobility: "Pongo casa 🏠" });
      } else if (!hasPlace && hasHostingCapability(myProfile?.mobility)) {
        updateMyProfile({ mobility: "Voy a la tuya / Viajo 🚗" });
      }
    }
  };

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tu Casa & Logística"
      subtitle="Convivencia, comodidades del depto e insumos listos sin vueltas"
      icon={<Home className="w-5 h-5 text-amber-400" />}
      maxWidth="3xl"
      className="p-1 sm:p-2"
    >
      <div data-testid="logistics-tab" className="overflow-y-auto max-h-[75vh] sm:max-h-[80vh] p-2 sm:p-4 space-y-4">
        <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-amber-500/30 space-y-4 shadow-card-elevation backdrop-blur-md">
          <SectionHeroHeader
            title={language === "es" ? "¿CÓMO ES TU CASA?" : "HOW IS YOUR PLACE?"}
            tag={
              myHostCard?.hasPlace
                ? (language === "es" ? "PONGO CASA" : "CAN HOST")
                : (language === "es" ? "VOY YO" : "MOBILE")
            }
            subtitle={
              language === "es"
                ? "Convivencia, comodidades y cosas listas para el encuentro sin vueltas"
                : "Living setup, amenities, and supplies for smooth encounters"
            }
            variant="amber"
            icon={<Home className="w-4 h-4 text-amber-400" />}
          />

          {/* Disponibilidad de Lugar (Switch Táctico 1-Tap) */}
          <div className="p-3.5 bg-black/60 rounded-2xl border border-white/10">
            <BrutalistSwitch
              checked={Boolean(myHostCard.hasPlace)}
              onChange={handleTogglePlace}
              variant="emerald"
              label={language === "es" ? "Tengo lugar / Pongo casa" : "I have a place / Can host"}
              description={
                myHostCard.hasPlace
                  ? (language === "es"
                      ? "Puedo recibir en mi casa o departamento"
                      : "Can host at my place")
                  : (language === "es"
                      ? "No tengo lugar para recibir, voy yo o coordinamos"
                      : "Cannot host, I travel or meet outside")
              }
            />
          </div>

          {/* Convivencia y Privacidad */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>👤</span>
              <span>{language === "es" ? "¿Con quién vivís?" : "Living arrangement"}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  key: "solo" as HostLivingArrangement,
                  label: language === "es" ? "Vivo solo" : "Live alone",
                  icon: "👤",
                },
                {
                  key: "roommates" as HostLivingArrangement,
                  label: language === "es" ? "Con amigos" : "Roommates",
                  icon: "👥",
                },
                {
                  key: "partner_aware" as HostLivingArrangement,
                  label: language === "es" ? "En pareja" : "Partner aware",
                  icon: "🤝",
                },
                {
                  key: "hotel" as HostLivingArrangement,
                  label: language === "es" ? "Hotel / Alojamiento" : "Hotel / Airbnb",
                  icon: "🏨",
                },
              ].map((item) => {
                const isSelected = myHostCard.livingArrangement === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      updateMyHostCard({ livingArrangement: item.key });
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer font-mono text-xs select-none active:scale-95 ${
                      isSelected
                        ? "bg-amber-950/40 border-amber-400 text-amber-300 font-bold shadow-sm"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comodidades Clave (Amenities) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>🚿</span>
              <span>{language === "es" ? "Comodidades del lugar" : "Space amenities"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  key: "showerReady" as const,
                  label: language === "es" ? "Ducha lista" : "Shower ready",
                  icon: "🚿",
                },
                {
                  key: "cleanTowels" as const,
                  label: language === "es" ? "Toallas limpias" : "Clean towels",
                  icon: "🧼",
                },
                {
                  key: "acOrHeating" as const,
                  label: language === "es" ? "Aire / Calefa" : "AC / Heating",
                  icon: "❄️",
                },
                {
                  key: "elevator" as const,
                  label: language === "es" ? "Ascensor" : "Elevator",
                  icon: "🛗",
                },
                {
                  key: "easyParking" as const,
                  label: language === "es" ? "Estacionamiento" : "Parking",
                  icon: "🅿️",
                },
              ].map((amenity) => {
                const isActive = Boolean(myHostCard.amenities?.[amenity.key]);
                return (
                  <button
                    key={amenity.key}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      updateMyHostCard({
                        amenities: {
                          ...myHostCard.amenities,
                          [amenity.key]: !isActive,
                        },
                      });
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer font-mono text-xs select-none active:scale-95 ${
                      isActive
                        ? "bg-amber-950/40 border-amber-400/80 text-amber-300 font-bold"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{amenity.icon}</span>
                      <span className="truncate">{amenity.label}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isActive ? "text-amber-400" : "text-neutral-600"
                      }`}
                    >
                      {isActive ? (language === "es" ? "SÍ" : "YES") : "NO"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insumos Listos para el Encuentro (Supplies) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>🛡️</span>
              <span>{language === "es" ? "Cosas a mano en casa" : "Supplies ready"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  key: "condoms" as const,
                  label: language === "es" ? "Preservativos" : "Condoms",
                  icon: "🛡️",
                },
                {
                  key: "lube" as const,
                  label: language === "es" ? "Geles / Lube" : "Lube",
                  icon: "💧",
                },
                {
                  key: "poppers" as const,
                  label: language === "es" ? "Poppers" : "Poppers",
                  icon: "⚡",
                },
                {
                  key: "wipes" as const,
                  label: language === "es" ? "Toallitas" : "Wipes",
                  icon: "🧻",
                },
              ].map((supply) => {
                const isActive = Boolean(myHostCard.supplies?.[supply.key]);
                return (
                  <button
                    key={supply.key}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      updateMyHostCard({
                        supplies: {
                          ...myHostCard.supplies,
                          [supply.key]: !isActive,
                        },
                      });
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border flex items-center justify-between sm:flex-col sm:justify-center gap-1.5 text-center transition-all cursor-pointer font-mono text-xs select-none active:scale-95 ${
                      isActive
                        ? "bg-purple-950/40 border-electricViolet text-electricViolet-glow font-bold shadow-sm"
                        : "bg-black/40 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{supply.icon}</span>
                    <span className="truncate">{supply.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instrucciones / Notas de Llegada */}
          <div className="space-y-1.5">
            <BrutalistInput
              label={
                language === "es"
                  ? "Para entrar / Notas del lugar (Opcional)"
                  : "Arrival notes (Optional)"
              }
              placeholder={
                language === "es"
                  ? "Ej: Timbre 4B, ascensor al fondo, depto silencioso..."
                  : "E.g., Buzzer 4B, elevator in the back, quiet apartment..."
              }
              value={myHostCard.notes || ""}
              onChange={(e) => updateMyHostCard({ notes: e.target.value })}
            />
          </div>
        </div>

        {/* 2. PROTOCOLO DE SALIDA ACORDADO */}
        <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
          <SectionHeroHeader
            title={language === "es" ? "PROTOCOLO DE SALIDA // TIEMPOS CLAROS" : "EXIT PROTOCOL // CLEAR TIME"}
            tag={language === "es" ? "ACUERDO PREVIO" : "PRE-AGREEMENT"}
            subtitle={
              language === "es"
                ? "Evitá momentos incómodos acordando cómo termina el encuentro antes de arrancar"
                : "Avoid awkward moments by agreeing on how the encounter concludes"
            }
            variant="violet"
            icon={<Clock className="w-4 h-4 text-electricViolet-glow" />}
          />
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
            <ExitProtocolSelector />
          </div>
        </div>

        {/* 3. ATMÓSFERA Y CONSUMO ZERO-KNOWLEDGE */}
        <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
          <SectionHeroHeader
            title={language === "es" ? "ATMÓSFERA Y CONSUMO // ZERO-KNOWLEDGE" : "SUBSTANCE ATMOSPHERE // ZERO-KNOWLEDGE"}
            tag={language === "es" ? "DISCRECIÓN TOTAL" : "ZERO-KNOWLEDGE"}
            subtitle={
              language === "es"
                ? "Sintonía de contexto (alcohol, humo 420, chill o sobriedad) sin exponer nada en tu perfil público"
                : "Context alignment without exposing anything publicly"
            }
            variant="mint"
            icon={<Sparkles className="w-4 h-4 text-mintNeon" />}
          />
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
            <SubstanceAtmosphereSelector />
          </div>
        </div>
      </div>
    </BrutalistModal>
  );
};
