"use client";

import React from "react";
import { VesselProfile, ProfileDossier } from "@/types/vessel";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ProfileGlanceHeroProps {
  profile: VesselProfile;
  photos: string[];
  selectedPhotoIdx: number;
  setSelectedPhotoIdx: (idx: number) => void;
  prevPhoto: () => void;
  nextPhoto: () => void;
  dossier?: ProfileDossier | null;
  language: "es" | "en";
  t: any;
}

/**
 * ProfileGlanceHero — Cabecera de Escaneo Rápido (<3s)
 * Componente modular desacoplado para evaluación visual inmediata según Impeccable UI.
 */
export const ProfileGlanceHero: React.FC<ProfileGlanceHeroProps> = ({
  profile,
  photos,
  selectedPhotoIdx,
  setSelectedPhotoIdx,
  prevPhoto,
  nextPhoto,
  dossier,
  language,
  t,
}) => {
  return (
    <div className="w-full md:w-[46%] lg:w-[42%] md:h-full md:overflow-y-auto p-0 md:p-5 md:border-r md:border-white/10 space-y-4 no-scrollbar">
      {/* Contenedor Principal de Fotografía */}
      <div className="relative aspect-[4/5] sm:aspect-[4/4.5] md:aspect-[4/5] bg-black overflow-hidden group md:rounded-2xl md:border md:border-white/10 shadow-lg">
        <Image
          src={photos[selectedPhotoIdx]}
          alt={profile.codename}
          fill
          sizes="(max-width: 768px) 100vw, 42vw"
          unoptimized
          priority
          className={`w-full h-full object-cover select-none transition-all duration-300 ${
            profile.isFogMode ? "blur-[8px] scale-105" : ""
          }`}
        />

        {/* Gradiente de fondo para contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

        {/* Puntos / Barra de Navegación de Fotos */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-4 right-4 flex gap-1.5 z-20">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhotoIdx(idx)}
                aria-label={`Ver foto ${idx + 1}`}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  selectedPhotoIdx === idx
                    ? "bg-electricViolet shadow-violet-soft"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Zonas de Toque Izquierda/Derecha */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Foto anterior"
              className="absolute top-0 bottom-0 left-0 w-1/3 z-10 focus:outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Siguiente foto"
              className="absolute top-0 bottom-0 right-0 w-1/3 z-10 focus:outline-none cursor-pointer"
            />

            {/* Flechas de Navegación Desktop */}
            <button
              type="button"
              onClick={prevPhoto}
              aria-label="Foto anterior"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              aria-label="Siguiente foto"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Información Superpuesta en la Base de la Foto */}
        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                profile.bodyState === "open"
                  ? "bg-mintNeon shadow-mint-glow animate-pulse"
                  : profile.bodyState === "occupied"
                  ? "bg-bloodNeon shadow-blood-glow"
                  : "bg-electricViolet shadow-violet-soft"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">
              {profile.bodyState === "open" && `${t.bodyState.open} • ${t.bodyState.openSub}`}
              {profile.bodyState === "occupied" && `${t.bodyState.occupied} • ${t.bodyState.occupiedSub}`}
              {profile.bodyState === "dormant" && `${t.bodyState.dormant} • ${t.bodyState.dormantSub}`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-2 flex-wrap">
                {dossier?.customAlias ? (
                  <>
                    <span>{dossier.customAlias}</span>
                    <span className="text-sm sm:text-base text-neutral-400 font-mono font-normal">
                      ({profile.codename})
                    </span>
                  </>
                ) : (
                  profile.codename
                )}
              </h1>
              {profile.showAge && (
                <span className="text-xl text-neutral-300 font-medium">{profile.age}</span>
              )}
            </div>

            {dossier?.rating && DOSSIER_VERDICT_CONFIG[dossier.rating] && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-black border uppercase shadow-sm flex items-center gap-1.5 ${DOSSIER_VERDICT_CONFIG[dossier.rating].badgeColor} ${DOSSIER_VERDICT_CONFIG[dossier.rating].borderColor}`}
                title={DOSSIER_VERDICT_CONFIG[dossier.rating].title[language]}
              >
                <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].icon}</span>
                <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].title[language]}</span>
              </span>
            )}

            {profile.verification?.isVerified && (
              <VerificationBadge verification={profile.verification} size="sm" showLabel />
            )}

            {profile.isAntiGhost && (
              <AntiGhostBadge
                respectScore={profile.respectScore}
                responseRateMinutes={profile.responseRateMinutes}
                size="sm"
                showLabel
              />
            )}
          </div>

          {/* Modo Niebla, Género y Pronombres */}
          <div className="flex items-center gap-2 flex-wrap">
            {profile.isFogMode && (
              <div
                className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs text-neutral-200 font-mono font-bold shadow-sm"
                title="Modo Niebla: Rostro protegido por difuminado facial"
              >
                <span>{t.card.fogDetailBadge}</span>
              </div>
            )}

            {(profile.genderIdentity || profile.pronouns) && (
              <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-xs text-neutral-200 font-medium">
                {profile.genderIdentity && <span>{profile.genderIdentity}</span>}
                {profile.genderIdentity && profile.pronouns && <span>•</span>}
                {profile.pronouns && (
                  <span className="text-electricViolet-glow font-semibold">{profile.pronouns}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Miniaturas en Desktop */}
      {photos.length > 1 && (
        <div className="hidden md:flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {photos.map((photoUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedPhotoIdx(idx)}
              aria-label={`Ver foto ${idx + 1}`}
              className={`relative w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                selectedPhotoIdx === idx
                  ? "border-electricViolet ring-2 ring-electricViolet/50 scale-105"
                  : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <Image
                src={photoUrl}
                alt=""
                fill
                sizes="48px"
                unoptimized
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Encuentros Verificados Rápidos */}
      <div className="px-4 md:px-0 flex items-center gap-2 flex-wrap text-xs font-mono">
        {profile.totalEncountersVerified > 0 && (
          <div
            className="inline-flex items-center gap-1.5 bg-mintNeon/10 border border-mintNeon/30 px-2.5 py-1 rounded-full text-xs text-mintNeon font-bold shadow-mint-glow"
            title={`${profile.totalEncountersVerified} Encuentros físicos reales validados por Doble Consentimiento`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {profile.totalEncountersVerified}{" "}
              {language === "es" ? "Encuentros Validados" : "Verified"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
