"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { SectionHeroHeader } from "@/components/ui";
import { DiaryScheduleSection } from "./DiaryScheduleSection";
import { DiaryHealthSection } from "./DiaryHealthSection";
import { DiaryInsights } from "./DiaryInsights";
import { VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
import {
  Calendar,
  HeartPulse,
  BarChart3,
  UserCheck,
  Plus,
  X,
} from "lucide-react";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";

export const DateDiaryView: React.FC = () => {
  const {
    openCreateDiaryModal,
    openItsExposureModal,
    openLoverDossierModal,
    profileDossiers,
    sendChatMessage,
    diaryEntries,
    doxyPepTrackers,
    addDoxyPepTracker,
    deleteDiaryEntry,
    updateDiaryEntry,
    toggleHealthReminderResolved,
    restoreDiaryBackup,
    myReceivedTestimonials,
    profiles,
    setSelectedProfile,
    setActiveChatProfileId,
    myProfile,
    currentUserUid,
    language,
    t,
    favoriteProfileIds: favIdsProp,
    isFavoriteProfile: isFavProp,
  } = useVessel();

  const favoriteProfileIds = favIdsProp || [];
  const isFavoriteProfile = isFavProp || (() => false);

  // Solapa activa: Agenda & Citas (diary), Salud & Cuidados (health), Métricas (insights)
  const [activeTab, setActiveTab] = useState<"diary" | "health" | "insights">("diary");
  const [inspectExternalContact, setInspectExternalContact] = useState<DiaryEntry["person"] | null>(null);

  useEffect(() => {
    if (!inspectExternalContact) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectExternalContact(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectExternalContact]);

  // Conteo de citas
  const upcomingCount = diaryEntries.filter((e) => e.isUpcoming).length;
  const completedCount = diaryEntries.filter((e) => !e.isUpcoming).length;

  // Promedio de valoración recibida
  const averageReceivedRating = useMemo(() => {
    if (!myReceivedTestimonials || myReceivedTestimonials.length === 0) return 5.0;
    const ratings = myReceivedTestimonials
      .map((rev) => rev.rating || 5)
      .filter((r) => r > 0);
    if (ratings.length === 0) return 5.0;
    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / ratings.length).toFixed(1));
  }, [myReceivedTestimonials]);

  // Manejo de Quiero la Revancha (Chat directo para perfiles Matrix o Agendar para Contactos Externos)
  const handleSendRevancha = (lover: { profileId: string; codename: string }) => {
    if (!lover.profileId.startsWith("ext-")) {
      sendChatMessage(
        lover.profileId,
        language === "es"
          ? `⚡ Quiero la Revancha: ¿Repetimos la sesión? Dejaste la vara altísima.`
          : `⚡ Rematch Pulse: Ready for round two? You set the bar high.`
      );
      setActiveChatProfileId(lover.profileId);
    } else {
      openCreateDiaryModal();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 p-3 sm:p-4 pb-48 sm:pb-56 space-y-4 select-none bg-obsidian-deep min-h-screen animate-fade-in">
      {/* 1. HERO CABECERA: DASHBOARD DE ENCUENTROS */}
      <SectionHeroHeader
        variant="violet"
        icon={<UserCheck className="w-5 h-5 stroke-[2.5]" />}
        title={t.diary.title}
        tag={language === "es" ? "BÓVEDA CIFRADA AES-256" : "AES-256 ENCRYPTED"}
        subtitle={t.diary.subtitle}
        actions={
          <button
            type="button"
            onClick={() => {
              openCreateDiaryModal();
              audioEngine.playPulse();
            }}
            className="px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-electricViolet to-purple-600 hover:from-electricViolet-glow hover:to-purple-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet hover:scale-[1.02] active:scale-[0.96] flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-mono uppercase tracking-wider whitespace-nowrap">
              {t.diary.scheduleBtn}
            </span>
          </button>
        }
      />

      {/* 2. SELECTOR SEGMENTADO SUPERIOR (3 SOLAPAS UNIFICADAS) */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        <div
          role="tablist"
          aria-label={language === "es" ? "Secciones de la Agenda de Encuentros" : "Date Diary Sections"}
          className="grid grid-cols-3 gap-1.5"
        >
          {/* Solapa 1: Agenda & Citas (Unificada) */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "diary"}
            data-testid="diary-tab-schedule"
            onClick={() => {
              setActiveTab("diary");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "diary"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {language === "es" ? "Agenda & Citas" : "Dates & Lovers"}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "diary"
                  ? "bg-white/20 text-white font-extrabold"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {completedCount + upcomingCount}
            </span>
          </button>

          {/* Solapa 2: Salud & Cuidados */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "health"}
            data-testid="diary-tab-health"
            onClick={() => {
              setActiveTab("health");
              audioEngine.playPulse();
            }}
            aria-label={t.diary.tabHealth || (language === "es" ? "Salud & Cuidados" : "Health & Care")}
            className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
              activeTab === "health"
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HeartPulse className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{t.diary.tabHealth || (language === "es" ? "Salud & Cuidados" : "Health & Care")}</span>
            {doxyPepTrackers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Solapa 3: Métricas */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "insights"}
            data-testid="diary-tab-insights"
            onClick={() => {
              setActiveTab("insights");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "insights"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{t.diary.tabInsights || (language === "es" ? "Métricas" : "Insights")}</span>
          </button>
        </div>
      </div>

      {/* 3. RENDERIZADO DE LA SOLAPA ACTIVA */}
      {activeTab === "diary" ? (
        <DiaryScheduleSection
          diaryEntries={diaryEntries}
          profiles={profiles}
          profileDossiers={profileDossiers}
          favoriteProfileIds={favoriteProfileIds}
          isFavoriteProfile={isFavoriteProfile}
          onSelectProfile={(p) => setSelectedProfile(p)}
          onOpenChat={(pid) => setActiveChatProfileId(pid)}
          onOpenDossier={(pid) => openLoverDossierModal(pid)}
          onInspectExternal={(p) => setInspectExternalContact(p)}
          onEditEntry={(entry) => openCreateDiaryModal(entry.person.profileId, entry.id)}
          onDeleteEntry={(id) => deleteDiaryEntry(id)}
          onCompleteEntry={(entry) => openCreateDiaryModal(entry.person.profileId, entry.id)}
          onQuickReview={(entry, satisfaction) =>
            updateDiaryEntry(entry.id, { isUpcoming: false, satisfaction })
          }
          onStartDoxyPep={(entry) => {
            addDoxyPepTracker({
              partnerCodename: entry.person.codename,
              encounterDate: entry.date,
              encounterTime: entry.time,
            });
            setActiveTab("health");
          }}
          onSendRevancha={handleSendRevancha}
          onRestoreBackup={restoreDiaryBackup}
          onScheduleNew={() => openCreateDiaryModal()}
          onNavigateToInsights={() => setActiveTab("insights")}
          averageRating={averageReceivedRating}
          respectScore={myProfile.respectScore || 100}
          language={language}
          t={t}
        />
      ) : activeTab === "health" ? (
        <DiaryHealthSection
          diaryEntries={diaryEntries}
          doxyPepTrackers={doxyPepTrackers}
          addDoxyPepTracker={addDoxyPepTracker}
          toggleHealthReminderResolved={toggleHealthReminderResolved}
          openItsExposureModal={openItsExposureModal}
          myProfile={myProfile}
          language={language}
          t={t}
        />
      ) : (
        <DiaryInsights />
      )}

      {/* MODAL DE FICHA PARA CONTACTO EXTERNO (SI NO ESTÁ EN MATRIZ) */}
      {inspectExternalContact && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-obsidian-surface border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  {language === "es" ? "Ficha de Contacto" : "Contact File"} // {inspectExternalContact.codename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectExternalContact(null)}
                aria-label={language === "es" ? "Cerrar expediente" : "Close file"}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <VaultEncryptedImage
                src={inspectExternalContact.avatarUrl}
                uid={currentUserUid}
                alt={inspectExternalContact.codename}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-electricViolet/60 shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-mono font-black text-white text-base">
                  {inspectExternalContact.codename}
                </h4>
                {inspectExternalContact.age && (
                  <p className="text-xs font-mono text-neutral-400">
                    {inspectExternalContact.age} {language === "es" ? "años" : "yo"}
                  </p>
                )}
                {inspectExternalContact.role && (
                  <span className="inline-block text-[10px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                    {getRoleDisplayLabel(inspectExternalContact.role, language)}
                  </span>
                )}
              </div>
            </div>

            {inspectExternalContact.privateNotes && (
              <div className="bg-black/60 rounded-2xl p-3 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                  {language === "es" ? "Notas Privadas:" : "Private Notes:"}
                </span>
                <p className="text-xs font-mono text-neutral-200">
                  {inspectExternalContact.privateNotes}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInspectExternalContact(null)}
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-electricViolet text-white font-mono font-bold text-xs uppercase cursor-pointer hover:bg-electricViolet-glow shadow-violet-soft active:scale-95"
            >
              {language === "es" ? "Cerrar Expediente" : "Close File"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
