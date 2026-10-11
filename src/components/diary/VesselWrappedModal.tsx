"use client";

import React, { useState, useMemo } from "react";
import { useDiary, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  X,
  Sparkles,
  Flame,
  Award,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { BrutalistButton, BrutalistModal } from "@/components/ui";

export const VesselWrappedModal: React.FC = () => {
  const {
    isWrappedModalOpen,
    closeWrappedModal,
    getVesselWrappedMetrics,
  } = useDiary();
  const { language, t } = useSettings();

  const [period, setPeriod] = useState<"month" | "year">("year");
  const [activeSlide, setActiveSlide] = useState(0);

  const metrics = useMemo(() => {
    return getVesselWrappedMetrics(period);
  }, [getVesselWrappedMetrics, period]);

  if (!isWrappedModalOpen) return null;

  const totalSlides = 4;

  const handleNext = () => {
    audioEngine.playPulse();
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    audioEngine.playPulse();
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <BrutalistModal
      isOpen={isWrappedModalOpen}
      onClose={closeWrappedModal}
      maxWidth="lg"
      ariaLabel={language === "es" ? "Resumen Anual Vessel" : "Vessel Wrapped"}
      hideCloseButton={true}
      customHeader={
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 shadow-blood-glow">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 id="wrapped-title" className="text-xs font-mono font-black text-white uppercase tracking-wider">
                {language === "es"
                  ? `RESUMEN ANUAL VESSEL // ${period === "year" ? "2026" : "MENSUAL"}`
                  : `VESSEL WRAPPED // ${period === "year" ? "2026" : "MONTHLY"}`}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400">
                {language === "es"
                  ? "Telemetría de Placer & Conquistas Urbanas"
                  : "Pleasure Telemetry & Urban Encounters"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch de período */}
            <div className="flex rounded-xl bg-white/5 p-0.5 border border-white/10 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setPeriod("month");
                  audioEngine.playPulse();
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  period === "month" ? "bg-electricViolet text-white font-bold" : "text-neutral-400"
                }`}
              >
                {language === "es" ? "Mes" : "Month"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriod("year");
                  audioEngine.playPulse();
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  period === "year" ? "bg-electricViolet text-white font-bold" : "text-neutral-400"
                }`}
              >
                {language === "es" ? "Año" : "Year"}
              </button>
            </div>

            <BrutalistButton
              variant="ghost"
              size="icon"
              onClick={() => {
                audioEngine.playPulse();
                closeWrappedModal();
              }}
              className="text-neutral-400 hover:text-white"
              aria-label={language === "es" ? "Cerrar resumen anual" : "Close annual summary"}
            >
              <X className="w-4 h-4" />
            </BrutalistButton>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 cursor-pointer"
            disabled={activeSlide === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveSlide(i);
                  audioEngine.playPulse();
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === activeSlide ? "w-6 bg-bloodNeon" : "bg-neutral-600"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 cursor-pointer"
            disabled={activeSlide === totalSlides - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      }
      contentClassName="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-6"
    >
          {/* SLIDE 0: TOTAL ACTIVIDAD & PERCENTIL */}
          {activeSlide === 0 && (
            <div className="space-y-4 animate-fade-in w-full">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-bloodNeon/30 to-electricViolet/30 border border-bloodNeon/50 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-bloodNeon animate-pulse" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  {language === "es" ? "Volumen de Encuentros" : "Encounter Volume"}
                </span>
                <span className="text-6xl font-mono font-black text-white tracking-tighter block py-1">
                  {metrics.totalEncounters}
                </span>
                <p className="text-xs font-mono text-bloodNeon font-bold">
                  {language === "es"
                    ? "Encuentros concretados en tu Agenda Íntima"
                    : "Completed encounters in your Intimate Vault"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
                <p className="text-xs font-mono text-neutral-200">
                  {language === "es" ? (
                    <>
                      ⚡ Tu frecuencia de actividad te sitúa en el{" "}
                      <span className="text-electricViolet-glow font-bold">Top {metrics.topRankPercentile}%</span> de la comunidad.
                    </>
                  ) : (
                    <>
                      ⚡ Your activity frequency places you in the{" "}
                      <span className="text-electricViolet-glow font-bold">Top {metrics.topRankPercentile}%</span> of the community.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 1: COMPAÑERO MÁS FRECUENTE */}
          {activeSlide === 1 && (
            <div className="space-y-4 animate-fade-in w-full">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  {language === "es" ? "Amante Más Frecuente (Favorito)" : "Top Intimate Partner"}
                </span>
                <span className="text-3xl font-mono font-black text-white block py-2">
                  {metrics.mvpPartner ? metrics.mvpPartner.codename : (language === "es" ? "Sin favorito aún" : "No top partner yet")}
                </span>
                {metrics.mvpPartner && (
                  <p className="text-xs font-mono text-amber-400 font-bold">
                    {language === "es"
                      ? `${metrics.mvpPartner.encountersCount} sesiones juntos · Química ★ ${metrics.mvpPartner.chemistry}/5`
                      : `${metrics.mvpPartner.encountersCount} sessions together · Chemistry ★ ${metrics.mvpPartner.chemistry}/5`}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
                <p className="text-xs font-mono text-neutral-200">
                  {language === "es" ? (
                    <>
                      🔁 Tasa de Reincidencia:{" "}
                      <span className="text-emerald-400 font-bold">{metrics.repeatRatePercentage}%</span>. Te gusta volver con quienes hay fuego comprobado.
                    </>
                  ) : (
                    <>
                      🔁 Recurrence Rate:{" "}
                      <span className="text-emerald-400 font-bold">{metrics.repeatRatePercentage}%</span>. You prefer returning where there is proven chemistry.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: NOCHE MÁS SALVAJE */}
          {activeSlide === 2 && (
            <div className="space-y-4 animate-fade-in w-full">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-electricViolet/20 border border-electricViolet/40 flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-electricViolet-glow" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  {language === "es" ? "La Cita Más Intensa" : "Wildest Night"}
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white block py-2">
                  {metrics.wildestNight ? metrics.wildestNight.date : (language === "es" ? "Múltiples sesiones" : "Multiple sessions")}
                </span>
                <p className="text-xs font-mono text-electricViolet-glow font-bold">
                  {metrics.wildestNight?.description || (language === "es" ? "Encuentro de alta intensidad" : "High intensity encounter")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
                <p className="text-xs font-mono text-neutral-200">
                  {language === "es" ? (
                    <>
                      🔥 Química promedio acumulada:{" "}
                      <span className="text-bloodNeon font-bold">{metrics.averageChemistry} / 5.0</span>
                    </>
                  ) : (
                    <>
                      🔥 Average accumulated chemistry:{" "}
                      <span className="text-bloodNeon font-bold">{metrics.averageChemistry} / 5.0</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: MAPA DE CONQUISTAS URBANAS */}
          {activeSlide === 3 && (
            <div className="space-y-4 animate-fade-in w-full">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg">
                <MapPin className="w-8 h-8 text-cyan-400" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                  {language === "es" ? "Zonas y Barrios Frecuentados" : "Top Encounter Neighborhoods"}
                </span>
                <h4 className="text-lg font-mono font-bold text-white pt-1">
                  {language === "es" ? "Tu Mapa de Encuentros" : "Your Encounter Map"}
                </h4>
              </div>

              <div className="space-y-2 max-w-sm mx-auto w-full text-left">
                {metrics.topConquestZones.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-400 text-center">
                    {language === "es" ? "Sin zonas georreferenciadas aún." : "No geo-referenced zones yet."}
                  </p>
                ) : (
                  metrics.topConquestZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-mono text-white truncate">
                          {zone.zoneName}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-300">
                        {zone.encounterCount} {language === "es" ? "citas" : "dates"} ({zone.percentage}%)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
    </BrutalistModal>
  );
};
