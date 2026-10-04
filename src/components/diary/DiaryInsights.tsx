"use client";

import React, { useState, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Star,
  Flame,
  RotateCcw,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { EncounterTestimonial, VesselProfile } from "@/types/vessel";
import Image from "next/image";

export const DiaryInsights: React.FC = () => {
  const {
    diaryEntries,
    diaryStats,
    myReceivedTestimonials = [],
    toggleTestimonialVisibility,
    openWrappedModal,
    profiles,
    setSelectedProfile,
    language,
    t,
  } = useVessel();

  const [isReviewsExpanded, setIsReviewsExpanded] = useState(true);

  const completedEntries = diaryEntries.filter((e) => !e.isUpcoming);

  // Conteo de ratings de satisfacción
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  completedEntries.forEach((e) => {
    if (e.satisfaction?.expectationsRating) {
      ratingCounts[e.satisfaction.expectationsRating] =
        (ratingCounts[e.satisfaction.expectationsRating] || 0) + 1;
    }
  });

  // Conteo de ubicaciones con iconos temáticos
  const locationMeta: Record<string, { label: string; icon: string }> = {
    my_place: { label: language === "es" ? "Mi Casa" : "My Place", icon: "🏠" },
    their_place: { label: language === "es" ? "Su Casa" : "Their Place", icon: "🔑" },
    club_darkroom: {
      label: t.diary.clubDarkroom || (language === "es" ? "Boliche / Sala Oscura" : "Club / Darkroom"),
      icon: "⚡",
    },
    bar_lounge: { label: language === "es" ? "Bar o Café" : "Bar or Drinks", icon: "🍸" },
    hotel: { label: language === "es" ? "Hotel o Alojamiento" : "Hotel", icon: "🏨" },
    outdoor_cruising: { label: language === "es" ? "Espacio al Aire Libre" : "Outdoor Space", icon: "🌲" },
    other: { label: language === "es" ? "Otro Espacio" : "Other Venue", icon: "📍" },
  };

  const locationCounts: Record<string, number> = {};
  diaryEntries.forEach((e) => {
    const cat = e.location.category;
    locationCounts[cat] = (locationCounts[cat] || 0) + 1;
  });

  // Top tags recibidos de testimonios
  const topReceivedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    myReceivedTestimonials.forEach((rev) => {
      (rev.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [myReceivedTestimonials]);

  const getAuthorProfile = (testimonial: EncounterTestimonial): VesselProfile | undefined => {
    if (testimonial.authorId) {
      const found = profiles.find((p) => p.id === testimonial.authorId);
      if (found) return found;
    }
    return profiles.find(
      (p) => p.codename.toLowerCase() === testimonial.authorCodename.toLowerCase()
    );
  };

  return (
    <div className="space-y-4 pb-12 select-none animate-fade-in">
      {/* 1. TARJETA VIP: RETROSPECTIVA DE PLACER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-obsidian-surface to-obsidian-deep border border-electricViolet/40 shadow-card-elevation flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-electricViolet/20 border border-electricViolet/50 flex items-center justify-center text-2xl shadow-violet-soft flex-shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-mono font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                {t.diary.vesselWrappedTitle || (language === "es" ? "Retrospectiva de Placer" : "Pleasure Retrospective")}
              </h4>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-champagneGold border border-amber-500/40 font-bold">
                {language === "es" ? "RESUMEN ANUAL" : "ANNUAL SUMMARY"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              {t.diary.vesselWrappedSub ||
                (language === "es"
                  ? "Volumen de encuentros, percentil en tu ciudad, MVP y mapa térmico urbano."
                  : "Encounter volume, city percentile, MVP and urban thermal map.")}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="open-vessel-wrapped-btn"
          onClick={() => {
            openWrappedModal();
            audioEngine.playSubBass(65);
          }}
          className="px-4 py-2.5 min-h-[44px] bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-black text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-violet-soft cursor-pointer flex-shrink-0 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-champagneGold" />
          <span>{t.diary.vesselWrappedBtn || (language === "es" ? "Ver Retrospectiva" : "Open Retrospective")}</span>
        </button>
      </div>

      {/* 2. BENTO GRID DE 4 KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Encuentros */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiTotal}
            </span>
            <div className="p-1.5 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-black text-white">
              {completedEntries.length}
            </span>
            {diaryStats.upcomingDatesCount > 0 && (
              <span className="text-xs text-electricViolet-glow font-mono font-bold">
                (+{diaryStats.upcomingDatesCount})
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t.diary.kpiTotalSub}
          </p>
        </div>

        {/* KPI 2: Satisfacción Media */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {language === "es" ? "Satisfacción Media" : "Avg Satisfaction"}
            </span>
            <div className="p-1.5 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold text-white">
              {diaryStats.averageSatisfaction}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 5.0</span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {language === "es"
              ? `Basado en ${completedEntries.length} citas`
              : `Based on ${completedEntries.length} dates`}
          </p>
        </div>

        {/* KPI 3: Química Corporal */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {language === "es" ? "Química Corporal" : "Body Chemistry"}
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold text-amber-400">
              {diaryStats.averageChemistry}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 5.0</span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {language === "es" ? "Intensidad física promedio" : "Average physical intensity"}
          </p>
        </div>

        {/* KPI 4: Tasa de Repetición */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiRepeat}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {diaryStats.repeatPercentage}%
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t.diary.kpiRepeatSub}
          </p>
        </div>
      </div>

      {/* 3. DISTRIBUCIÓN DE SATISFACCIÓN */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electricViolet-glow" />
            <span>{language === "es" ? "Distribución de Satisfacción" : "Satisfaction Breakdown"}</span>
          </h4>
          <span className="text-[9px] text-electricViolet-glow font-mono font-bold px-2 py-0.5 rounded-full bg-electricViolet/10 border border-electricViolet/20">
            {language === "es" ? "100% PRIVADO" : "100% PRIVATE"}
          </span>
        </div>

        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating] || 0;
            const pct = completedEntries.length > 0 ? (count / completedEntries.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 w-12 text-neutral-200 font-mono">
                  <span className="font-bold">{rating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-electricViolet rounded-full transition-all duration-500 shadow-violet-soft"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-bold text-neutral-300">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LUGARES MÁS FRECUENTES */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-electricViolet-glow" />
            <span>{t.diary.conquestZonesTitle || (language === "es" ? "Lugares Más Frecuentes" : "Top Venues & Spots")}</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(locationCounts).map(([cat, count]) => {
            const meta = locationMeta[cat] || { label: cat, icon: "📍" };
            return (
              <div
                key={cat}
                className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{meta.icon}</span>
                  <span className="text-neutral-200 truncate">{meta.label}</span>
                </div>
                <span className="font-bold text-electricViolet-glow ml-2 px-2 py-0.5 rounded-lg bg-electricViolet/10 border border-electricViolet/20">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. VALORACIONES RECIBIDAS DE LA COMUNIDAD (DOBLE CONSENTIMIENTO) */}
      <div className="bg-obsidian-surface/90 rounded-3xl border border-white/10 p-4 sm:p-5 space-y-4 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/40 text-electricViolet-glow border border-purple-500/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.diary.reviewsSectionTitle}
                </h3>
                <span className="text-[9px] font-mono font-bold text-mintNeon uppercase bg-mintNeon/15 border border-mintNeon/40 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {language === "es" ? "Doble Consentimiento" : "Double Consent"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {t.diary.reviewsSectionSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsReviewsExpanded(!isReviewsExpanded);
              audioEngine.playPulse();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={isReviewsExpanded ? "Plegar valoraciones" : "Desplegar valoraciones"}
          >
            {isReviewsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Tags de Reseñas */}
        {topReceivedTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase mr-1 flex-shrink-0">
              {language === "es" ? "Tags otorgados:" : "Awarded tags:"}
            </span>
            {topReceivedTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-electricViolet/15 border border-electricViolet/35 text-electricViolet-glow flex-shrink-0 flex items-center gap-1"
              >
                <span>✓</span>
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Listado de Testimonios */}
        {isReviewsExpanded && (
          <div className="space-y-3 pt-2">
            {myReceivedTestimonials.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
                <p className="text-xs font-mono font-bold text-neutral-300">
                  {t.diary.noReviewsTitle}
                </p>
                <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                  {t.diary.noReviewsSub}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myReceivedTestimonials.map((testimonial) => {
                  const authorProfile = getAuthorProfile(testimonial);
                  const isPublic = testimonial.status === "approved";

                  return (
                    <div
                      key={testimonial.id}
                      className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-3 shadow-card-elevation backdrop-blur-md hover:border-white/20 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`flex items-center gap-2.5 ${
                              authorProfile ? "cursor-pointer group" : ""
                            }`}
                            onClick={() => {
                              if (authorProfile) {
                                setSelectedProfile(authorProfile);
                                audioEngine.playPulse();
                              }
                            }}
                          >
                            <Image
                              src={
                                testimonial.authorAvatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={testimonial.authorCodename}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-xl object-cover border border-white/10 group-hover:border-electricViolet transition-colors"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-white group-hover:text-electricViolet-glow transition-colors">
                                  {testimonial.authorCodename}
                                </span>
                                {authorProfile && (
                                  <span className="text-[9px] font-mono text-electricViolet-glow">➔</span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {testimonial.createdAt}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-lg text-white font-mono text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{testimonial.rating || 5}.0</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-200 font-sans italic leading-relaxed pl-2.5 border-l-2 border-electricViolet/50">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>

                        {testimonial.tags && testimonial.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {testimonial.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-neutral-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                            isPublic
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublic ? "bg-emerald-400" : "bg-neutral-500"}`} />
                          <span>{isPublic ? t.diary.reviewsPublicBadge : t.diary.reviewsPrivateBadge}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            toggleTestimonialVisibility("me", testimonial.id);
                          }}
                          className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1.5 active:scale-95"
                        >
                          {isPublic ? (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-400" />
                              <span>{t.diary.reviewsMakePrivate}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-neutral-400" />
                              <span>{t.diary.reviewsMakePublic}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
