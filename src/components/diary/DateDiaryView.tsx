"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { SectionHeroHeader } from "@/components/ui";
import { DiaryScheduleSection } from "./DiaryScheduleSection";
import { DiaryLoversVaultSection, LoverVaultItem } from "./DiaryLoversVaultSection";
import { DiaryHealthSection } from "./DiaryHealthSection";
import { DiaryInsights } from "./DiaryInsights";
import { VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";
import {
  Calendar,
  HeartPulse,
  BarChart3,
  UserCheck,
  Plus,
  X,
  Flame,
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
    getProfileById,
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

  // Solapas por Intención (Alternativa 1): Próximas (diary), Mis Chongos (lovers), Salud (health), Métricas (insights)
  const [activeTab, setActiveTab] = useState<"diary" | "lovers" | "health" | "insights">("diary");
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

  // Listado unificado de amantes para la Libreta Íntima (Alternativa 1)
  const loversList: LoverVaultItem[] = useMemo(() => {
    const map: Record<string, LoverVaultItem> = {};

    diaryEntries.forEach((entry) => {
      const pid = entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;
      const dossier = profileDossiers?.[pid];
      const existing = map[pid];
      const count = (existing?.encounterCount || 0) + (!entry.isUpcoming ? 1 : 0);
      const photos =
        dossier?.sharedPhotos?.length ||
        entry.person.sharedPhotos?.length ||
        entry.attachedPhotos?.length ||
        0;
      const badges = Array.from(
        new Set([...(existing?.badges || []), ...(dossier?.badges || []), ...(entry.person.badges || [])])
      );
      const chem = entry.satisfaction?.chemistryLevel || existing?.chemistryLevel || 5;
      const repeat = entry.satisfaction?.wouldRepeat === "yes" || existing?.wouldRepeat || false;

      map[pid] = {
        profileId: pid,
        codename: entry.person.codename,
        avatarUrl:
          dossier?.sharedPhotos?.[0] ||
          entry.person.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        role: entry.person.role || existing?.role || "Versatile",
        encounterCount: count,
        lastDate: !existing || entry.date > existing.lastDate ? entry.date : existing.lastDate,
        chemistryLevel: chem,
        wouldRepeat: repeat,
        photosCount: photos,
        badges,
      };
    });

    if (profileDossiers) {
      Object.entries(profileDossiers).forEach(([pid, dossier]) => {
        if (!map[pid]) {
          const matchedProfile = getProfileById(pid) || profiles.find((p) => p.id === pid);
          map[pid] = {
            profileId: pid,
            codename: matchedProfile?.codename || pid,
            avatarUrl:
              dossier.sharedPhotos?.[0] ||
              matchedProfile?.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
            role: matchedProfile?.role || "Versatile",
            encounterCount: 1,
            lastDate: getLocalTodayIso(),
            chemistryLevel: 5,
            wouldRepeat: true,
            photosCount: dossier.sharedPhotos?.length || 0,
            badges: dossier.badges || [],
          };
        }
      });
    }

    return Object.values(map).sort((a, b) => {
      if (b.chemistryLevel !== a.chemistryLevel) return b.chemistryLevel - a.chemistryLevel;
      return b.lastDate.localeCompare(a.lastDate);
    });
  }, [diaryEntries, profileDossiers, profiles]);

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
            data-testid="diary-schedule-btn"
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

      {/* 2. SELECTOR SEGMENTADO SUPERIOR (4 SOLAPAS POR INTENCIÓN - ALTERNATIVA 1) */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        <div
          role="tablist"
          aria-label={language === "es" ? "Secciones de la Agenda de Encuentros" : "Date Diary Sections"}
          className="grid grid-cols-4 gap-1 sm:gap-1.5"
        >
          {/* Solapa 1: Próximas & Citas */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "diary"}
            data-testid="diary-tab-schedule"
            onClick={() => {
              setActiveTab("diary");
              audioEngine.playPulse();
            }}
            className={`py-2 px-1.5 min-h-[44px] rounded-xl text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "diary"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {language === "es" ? "Citas" : "Dates"}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "diary"
                  ? "bg-white/20 text-white font-extrabold"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {completedCount + upcomingCount}
            </span>
          </button>

          {/* Solapa 2: Mis Chongos (Libreta Íntima) */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "lovers"}
            data-testid="diary-tab-lovers"
            onClick={() => {
              setActiveTab("lovers");
              audioEngine.playPulse();
            }}
            className={`py-2 px-1.5 min-h-[44px] rounded-xl text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
              activeTab === "lovers"
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${activeTab === "lovers" ? "text-black fill-black" : "text-amber-400"}`} />
            <span className="truncate">
              {language === "es" ? "Chongos" : "Lovers"}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "lovers"
                  ? "bg-black/20 text-black font-extrabold"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {loversList.length}
            </span>
          </button>

          {/* Solapa 3: Salud & Cuidados */}
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
            className={`py-2 px-1.5 min-h-[44px] rounded-xl text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
              activeTab === "health"
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-emerald-400" />
            <span className="truncate">{language === "es" ? "Salud" : "Health"}</span>
            {doxyPepTrackers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Solapa 4: Métricas */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "insights"}
            data-testid="diary-tab-insights"
            onClick={() => {
              setActiveTab("insights");
              audioEngine.playPulse();
            }}
            className={`py-2 px-1.5 min-h-[44px] rounded-xl text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "insights"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{language === "es" ? "Métricas" : "Insights"}</span>
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
      ) : activeTab === "lovers" ? (
        <DiaryLoversVaultSection
          lovers={loversList}
          diaryEntries={diaryEntries}
          profileDossiers={profileDossiers}
          onRestoreBackup={restoreDiaryBackup}
          onOpenDossier={(pid) => openLoverDossierModal(pid)}
          onSendRevancha={handleSendRevancha}
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
