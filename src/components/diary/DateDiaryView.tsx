"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  useDiary,
  useChat,
  useRadarMatrix,
  useAuth,
  useSettings,
} from "@/context/VesselContext";
import { DiaryEntry, VesselProfile } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  SectionHeroHeader,
  SegmentedTabGroup,
  FilterPill,
  BrutalistButton,
} from "@/components/ui";
import { DiaryEntryCard } from "./DiaryEntryCard";
import { DiaryScheduleSection } from "./DiaryScheduleSection";
import type { LoverVaultItem } from "./DiaryLoversVaultSection";
import { DiaryHealthSection } from "./DiaryHealthSection";
import { DiaryInsights } from "./DiaryInsights";
import { DiaryBackupModal } from "./DiaryBackupModal";
import { VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
import { getLocalTodayIso, formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import {
  Calendar,
  Clock,
  HeartPulse,
  BarChart3,
  UserCheck,
  Plus,
  X,
  Flame,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Lock,
  Zap,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  Star,
  RotateCcw,
} from "lucide-react";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";

export const DateDiaryView: React.FC = () => {
  const {
    openCreateDiaryModal,
    openItsExposureModal,
    openLoverDossierModal,
    openWrappedModal,
    diaryStats,
    profileDossiers,
    diaryEntries,
    doxyPepTrackers,
    addDoxyPepTracker,
    deleteDiaryEntry,
    updateDiaryEntry,
    toggleHealthReminderResolved,
    restoreDiaryBackup,
    myReceivedTestimonials,
  } = useDiary();
  const { sendChatMessage, setActiveChatProfileId } = useChat();
  const {
    profiles,
    getProfileById,
    setSelectedProfile,
    favoriteProfileIds: favIdsProp,
    isFavoriteProfile: isFavProp,
  } = useRadarMatrix();
  const { myProfile, currentUserUid } = useAuth();
  const { language, t } = useSettings();

  const favoriteProfileIds = favIdsProp || [];
  const isFavoriteProfile = isFavProp || (() => false);

  // Navegación Superior por Pestañas: Próximas, Mi Agenda, Salud & Cuidados, Fuego 🔥
  const [mainTab, setMainTab] = useState<"my_day" | "my_agenda" | "health" | "insights">("my_day");

  // Feedback táctico de pulsos de revancha enviados en los chongos
  const [revanchaSentIds, setRevanchaSentIds] = useState<Record<string, boolean>>({});

  // Estado del modal de respaldo global
  const [isGlobalBackupOpen, setIsGlobalBackupOpen] = useState(false);

  // Inspector de contacto externo
  const [inspectExternalContact, setInspectExternalContact] = useState<DiaryEntry["person"] | null>(null);
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!inspectExternalContact) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectExternalContact(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectExternalContact]);

  const toggleNoteReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    audioEngine.playPulse();
  };

  // Conteo de citas
  const upcomingEntries = useMemo(
    () =>
      diaryEntries
        .filter((e) => e.isUpcoming)
        .sort((a, b) => `${a.date}T${a.time || "00:00"}`.localeCompare(`${b.date}T${b.time || "00:00"}`)),
    [diaryEntries]
  );
  const upcomingCount = upcomingEntries.length;
  const completedCount = useMemo(
    () => diaryEntries.filter((e) => !e.isUpcoming).length,
    [diaryEntries]
  );

  // Alerta reactiva Doxy-PEP activa en las últimas 72 horas
  const hasActiveDoxyPep = useMemo(() => {
    if (!doxyPepTrackers || doxyPepTrackers.length === 0) return false;
    return doxyPepTrackers.some((tracker) => {
      if (tracker.taken72h || tracker.isDismissed) return false;
      return true;
    });
  }, [doxyPepTrackers]);

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

  // Listado unificado de amantes para la Libreta Íntima ("Mis Chongos")
  const loversList: LoverVaultItem[] = useMemo(() => {
    const map: Record<string, LoverVaultItem> = {};

    diaryEntries.forEach((entry) => {
      const pid = entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;
      const dossier = profileDossiers?.[pid];
      const hasCompleted = diaryEntries.some(
        (e) =>
          !e.isUpcoming &&
          (e.person.profileId === pid ||
            e.person.codename.toLowerCase() === entry.person.codename.toLowerCase())
      );
      if (!hasCompleted && !dossier) return;
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
  }, [diaryEntries, profileDossiers, profiles, getProfileById]);

  // Manejo de Revancha
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

  const getLinkedProfile = (entry: DiaryEntry): VesselProfile | undefined => {
    if (entry.person.profileId) {
      const found = profiles.find((p) => p.id === entry.person.profileId);
      if (found) return found;
    }
    return profiles.find(
      (p) => p.codename.toLowerCase() === entry.person.codename.toLowerCase()
    );
  };

  // Citas completadas (Historial cronológico)
  const completedEntries = useMemo(
    () =>
      diaryEntries
        .filter((e) => !e.isUpcoming)
        .sort((a, b) => `${b.date}T${b.time || "00:00"}`.localeCompare(`${a.date}T${a.time || "00:00"}`)),
    [diaryEntries]
  );

  // Reprogramación rápida del Hero (+30m)
  const handleHeroReschedule = (entry: DiaryEntry, deltaMinutes = 30) => {
    audioEngine.playPulse();
    const [hh, mm] = (entry.time || "22:00").split(":").map((n) => parseInt(n, 10) || 0);
    const totalMinutes = hh * 60 + mm + deltaMinutes;
    const wrappedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const newH = String(Math.floor(wrappedMinutes / 60)).padStart(2, "0");
    const newM = String(wrappedMinutes % 60).padStart(2, "0");
    const nextTime = `${newH}:${newM}`;

    updateDiaryEntry(entry.id, {
      ...entry,
      time: nextTime,
    });

    const linked = getLinkedProfile(entry);
    if (linked) {
      const msg =
        language === "es"
          ? `⏳ Reprogramé nuestro encuentro para hoy a las ${nextTime} hs.`
          : `⏳ Rescheduled our encounter for today at ${nextTime}.`;
      sendChatMessage(linked.id, msg);
    }
  };

  // Cancelación amable del Hero ("Me bajo con onda")
  const handleHeroPoliteCancel = (entry: DiaryEntry) => {
    audioEngine.playSubBass(50, 0.3);
    const linked = getLinkedProfile(entry);
    if (linked) {
      const msg =
        language === "es"
          ? `🤝 Hola @${linked.codename}, te aviso con tiempo que hoy no voy a poder llegar a nuestro encuentro. ¡Gracias por la buena onda y reprogramamos pronto!`
          : `🤝 Hey @${linked.codename}, heads up that I won't be able to make our encounter today. Thanks for understanding!`;
      sendChatMessage(linked.id, msg);
    }
    deleteDiaryEntry(entry.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28 space-y-4 select-none bg-obsidian-deep min-h-[100dvh] animate-fade-in">
      {/* 1. HERO CABECERA: DASHBOARD DE ENCUENTROS */}
      <SectionHeroHeader
        variant="violet"
        icon={<UserCheck className="w-5 h-5 stroke-[2.5]" />}
        title={t.diary.title}
        tag={language === "es" ? "BÓVEDA CIFRADA AES-256" : "AES-256 ENCRYPTED"}
        subtitle={t.diary.subtitle}
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <BrutalistButton
              data-testid="diary-tab-insights"
              variant={mainTab === "insights" ? "primary" : "ghost"}
              size="default"
              onClick={() => {
                setMainTab(mainTab === "insights" ? "my_agenda" : "insights");
                audioEngine.playPulse();
              }}
              title={language === "es" ? "Métricas íntimas y valoraciones" : "Intimate metrics & ratings"}
              className="flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-bloodNeon" />
              <span className="font-mono uppercase tracking-wider text-xs font-bold whitespace-nowrap">
                {language === "es" ? "Métricas" : "Insights"}
              </span>
            </BrutalistButton>

            <BrutalistButton
              variant="ghost"
              size="default"
              onClick={() => {
                setIsGlobalBackupOpen(true);
                audioEngine.playPulse();
              }}
              title={language === "es" ? "Copia de seguridad local cifrada" : "Local Encrypted Backup"}
              className="flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-mintNeon" />
              <span className="font-mono uppercase tracking-wider text-xs font-bold whitespace-nowrap">
                {language === "es" ? "Copia" : "Backup"}
              </span>
            </BrutalistButton>

            <BrutalistButton
              data-testid="diary-schedule-btn"
              variant="primary"
              size="default"
              onClick={() => {
                openCreateDiaryModal();
                audioEngine.playPulse();
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="font-mono uppercase tracking-wider whitespace-nowrap">
                {t.diary.scheduleBtn}
              </span>
            </BrutalistButton>
          </div>
        }
      />

      {/* 2. SELECTOR SUPERIOR DE PESTAÑAS: EXACTAMENTE 3 PESTAÑAS CRONOLÓGICAS (PRÓXIMAS, HISTORIAL, SALUD & DOXY) */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        <SegmentedTabGroup
          testId="diary-top-navigation-tabs"
          activeTab={mainTab === "insights" ? "my_agenda" : mainTab}
          onChange={(tabId) => setMainTab(tabId as "my_day" | "my_agenda" | "health")}
          tabs={[
            {
              id: "my_day",
              label: t.diary?.tabMyDay || (language === "es" ? "Próximas" : "Upcoming"),
              icon: <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-electricViolet-glow shrink-0" />,
              testId: "diary-tab-schedule",
              badge: (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/15 text-white font-bold ml-0.5">
                  {upcomingCount}
                </span>
              ),
            },
            {
              id: "my_agenda",
              label: t.diary?.tabMyAgenda || (language === "es" ? "Historial" : "History"),
              icon: <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />,
              testId: "diary-tab-my-agenda",
              badge: (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 text-neutral-300 font-bold ml-0.5">
                  {completedCount}
                </span>
              ),
            },
            {
              id: "health",
              label: t.diary?.tabHealth || (language === "es" ? "Salud & Doxy" : "Health & Care"),
              icon: <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />,
              testId: "diary-tab-health",
              badge: hasActiveDoxyPep ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5 shrink-0" />
              ) : undefined,
            },
          ]}
        />
      </div>

      {/* 3. CONTENIDO: TAB 1 (STREAMLINED FEED: PRÓXIMA INMINENTE + VÍNCULOS FRECUENTES + HISTORIAL) */}
      {mainTab === "my_day" && (
        <div className="space-y-6 animate-fade-in">
          {/* Píldora reactiva de Alerta Doxy-PEP si hay ventana de 72h activa */}
          {hasActiveDoxyPep && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setMainTab("health");
                audioEngine.playPulse();
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 cursor-pointer hover:bg-amber-500/25 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-xs font-bold">
                  {language === "es"
                    ? "⚠️ Ventana Doxy-PEP Activa (72h) — Tocá para registrar toma"
                    : "⚠️ Active Doxy-PEP Window (72h) — Tap to log dose"}
                </span>
              </div>
              <span className="font-mono text-[11px] font-black text-amber-400 uppercase">
                {language === "es" ? "Ver Salud ➔" : "View Health ➔"}
              </span>
            </div>
          )}

          {/* SECCIÓN A: PRÓXIMO ENCUENTRO INMINENTE (HERO CARD) */}
          {upcomingEntries.length === 0 ? (
            <div className="bg-obsidian-surface/80 p-6 sm:p-8 rounded-3xl border border-white/10 text-center space-y-3 shadow-card-elevation backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-electricViolet-glow mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  {language === "es"
                    ? "Nada en agenda por hoy"
                    : "No upcoming dates scheduled"}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans leading-relaxed">
                  {language === "es"
                    ? "Agenda despejada y cero presiones. Si pinta conectar con alguien, agendá una salida o activá el radar."
                    : "Your schedule is clear. Ready to connect? Schedule a date or check the radar."}
                </p>
              </div>
              <BrutalistButton
                variant="primary"
                size="default"
                onClick={() => {
                  openCreateDiaryModal();
                  audioEngine.playPulse();
                }}
                className="mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ {t.diary.scheduleBtn}</span>
              </BrutalistButton>
            </div>
          ) : (
            <div className="space-y-3">
              {/* HERO CARD DE LA CITA MÁS PRÓXIMA */}
              {(() => {
                const heroEntry = upcomingEntries[0];
                const linkedProfile = getLinkedProfile(heroEntry);
                const pid = heroEntry.person.profileId || `ext-${heroEntry.person.codename.toLowerCase()}`;
                const dossier = profileDossiers?.[pid];
                const heroPhotoUrl =
                  dossier?.sharedPhotos?.[0] ||
                  heroEntry.person.avatarUrl ||
                  linkedProfile?.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";

                return (
                  <div className="bg-gradient-to-b from-purple-950/40 via-obsidian-surface to-obsidian-deep rounded-3xl border-2 border-electricViolet/50 p-4 sm:p-5 shadow-[0_0_30px_rgba(139,92,246,0.25)] space-y-4 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-electricViolet/15 rounded-full blur-3xl pointer-events-none" />

                    {/* Cabecera del Hero */}
                    <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electricViolet opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electricViolet-glow" />
                        </span>
                        <span className="font-mono text-xs font-black text-electricViolet-glow uppercase tracking-wider">
                          {language === "es" ? "⚡ Próximo Encuentro" : "⚡ Next Encounter"}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-electricViolet/20 border border-electricViolet/40 text-[11px] font-mono font-bold text-white shadow-sm">
                        {formatDiaryDateDisplay(heroEntry.date, language)} • {heroEntry.time} hs
                      </span>
                    </div>

                    {/* Identidad & Ubicación */}
                    <div className="flex items-start gap-3.5 relative z-10">
                      <div
                        className="relative shrink-0 cursor-pointer"
                        onClick={() => {
                          openLoverDossierModal(pid);
                          audioEngine.playSubBass(60);
                        }}
                      >
                        <VaultEncryptedImage
                          src={heroPhotoUrl}
                          alt={heroEntry.person.codename}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-electricViolet/60 shadow-lg hover:scale-105 transition-all"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-black/90 border border-electricViolet/60 text-[9px] font-mono text-electricViolet-glow font-black">
                          {getRoleDisplayLabel(heroEntry.person.role || linkedProfile?.role || "Versatile", language)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => {
                              if (linkedProfile) setSelectedProfile(linkedProfile);
                              else setInspectExternalContact(heroEntry.person);
                              audioEngine.playPulse();
                            }}
                            className="font-mono font-black text-base sm:text-lg text-white hover:text-electricViolet-glow cursor-pointer truncate"
                          >
                            {heroEntry.person.codename}
                          </h3>
                          {heroEntry.person.age && (
                            <span className="text-xs font-mono text-neutral-400 font-bold">
                              {heroEntry.person.age} {language === "es" ? "años" : "yo"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
                          <MapPin className="w-3.5 h-3.5 text-electricViolet-glow shrink-0" />
                          <span className="truncate font-bold">
                            {heroEntry.location?.name || (language === "es" ? "Ubicación acordada" : "Agreed location")}
                          </span>
                        </div>

                        {heroEntry.privateNotes && (
                          <p className="text-[11px] font-mono text-neutral-400 line-clamp-1 italic">
                            "{heroEntry.privateNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botonera Táctica Ergonómica (Thumb Zone) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10 relative z-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (linkedProfile) setSelectedProfile(linkedProfile);
                          else setInspectExternalContact(heroEntry.person);
                          audioEngine.playPulse();
                        }}
                        className="py-2.5 px-3 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === "es" ? "Ver Punto" : "View Spot"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeroReschedule(heroEntry, 30)}
                        className="py-2.5 px-3 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
                        <span>+30m</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeroPoliteCancel(heroEntry)}
                        className="py-2.5 px-3 min-h-[44px] rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title={language === "es" ? "Cancela amablemente y avisa por chat sin perder Karma" : "Cancel politely without losing Karma"}
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                        <span>{language === "es" ? "Me bajo" : "Cancel"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (linkedProfile) {
                            setActiveChatProfileId(linkedProfile.id);
                            audioEngine.playPulse();
                          }
                        }}
                        disabled={!linkedProfile}
                        className="py-2.5 px-3 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-violet-soft"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{language === "es" ? "Chat" : "Chat"}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* OTRAS CITAS FUTURAS SI HAY MÁS DE 1 */}
              {upcomingEntries.length > 1 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
                      {language === "es" ? "Otras Salidas Agendadas" : "Other Scheduled Dates"} ({upcomingEntries.length - 1})
                    </span>
                  </div>
                  {upcomingEntries.slice(1).map((entry) => {
                    const linkedProfile = getLinkedProfile(entry);
                    const isRevealed = !!revealedNotes[entry.id];
                    const pid = entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;
                    const dossier = profileDossiers?.[pid];
                    const photosCount =
                      dossier?.sharedPhotos?.length ||
                      entry.person.sharedPhotos?.length ||
                      entry.attachedPhotos?.length ||
                      0;
                    const primaryPhotoUrl =
                      dossier?.sharedPhotos?.[0] ||
                      entry.person.avatarUrl ||
                      linkedProfile?.avatarUrl;
                    const intimateBadges: string[] = dossier?.badges || [];

                    return (
                      <DiaryEntryCard
                        key={entry.id}
                        entry={entry}
                        linkedProfile={linkedProfile}
                        isRevealed={isRevealed}
                        onToggleReveal={toggleNoteReveal}
                        onInspectExternal={(p) => setInspectExternalContact(p)}
                        onOpenDossier={(targetPid) => openLoverDossierModal(targetPid)}
                        onSelectProfile={(p) => setSelectedProfile(p)}
                        onOpenChat={(chatPid) => setActiveChatProfileId(chatPid)}
                        onEdit={(e) => openCreateDiaryModal(e.person.profileId, e.id)}
                        onDelete={(id) => deleteDiaryEntry(id)}
                        onCompleteDate={(e) => openCreateDiaryModal(e.person.profileId, e.id)}
                        onQuickReview={(e, satisfaction) =>
                          updateDiaryEntry(e.id, { isUpcoming: false, satisfaction })
                        }
                        onStartDoxyPep={(e) => {
                          addDoxyPepTracker({
                            partnerCodename: e.person.codename,
                            encounterDate: e.date,
                            encounterTime: e.time,
                          });
                          setMainTab("health");
                        }}
                        onSendRevancha={handleSendRevancha}
                        language={language}
                        t={t}
                        photosCount={photosCount}
                        intimateBadges={intimateBadges}
                        primaryPhotoUrl={primaryPhotoUrl}
                      />
                    );
                  })}
                </div>
              )}

              {/* Botón de agendar cita adicional */}
              <div className="pt-2 flex justify-center">
                <BrutalistButton
                  variant="outline"
                  size="default"
                  onClick={() => {
                    openCreateDiaryModal();
                    audioEngine.playPulse();
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ {language === "es" ? "Agendar otra salida" : "Schedule another date"}</span>
                </BrutalistButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CONTENIDO: TAB 2 (HISTORIAL: BENTO DE MÉTRICAS + MIS VÍNCULOS + FEED CRONOLÓGICO) */}
      {mainTab === "my_agenda" && (
        <div className="space-y-6 animate-fade-in">
          {/* SECCIÓN 0: BENTO CARD DE MÉTRICAS & RESUMEN DE QUÍMICA */}
          <div className="bg-gradient-to-br from-obsidian-surface via-obsidian-deep to-purple-950/20 p-4 sm:p-5 rounded-3xl border border-white/10 shadow-card-elevation space-y-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                    {language === "es" ? "Tu Química & Métricas" : "Your Chemistry & Metrics"}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {language === "es"
                      ? "Resumen íntimo de satisfacción, química y repetición"
                      : "Intimate summary of satisfaction, chemistry & rematch rate"}
                  </p>
                </div>
              </div>

              {/* Botón de Balance / Wrapped */}
              <button
                type="button"
                onClick={() => {
                  openWrappedModal();
                  audioEngine.playPulse();
                }}
                className="px-3 py-1.5 min-h-[36px] bg-gradient-to-r from-electricViolet/20 to-bloodNeon/20 hover:from-electricViolet/30 hover:to-bloodNeon/30 border border-electricViolet/40 text-white rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-champagneGold" />
                <span>{language === "es" ? "Ver Wrapped ✨" : "View Wrapped ✨"}</span>
              </button>
            </div>

            {/* Grid de 4 KPIs Tácticos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1. Satisfacción */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                  {t.diary?.satisfaction || "Satisfacción"}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base sm:text-lg font-mono font-black text-white">
                    {averageReceivedRating > 0 ? averageReceivedRating.toFixed(1) : (diaryStats?.averageSatisfaction || 5.0).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">/ 5.0</span>
                </div>
              </div>

              {/* 2. Química */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-bloodNeon fill-bloodNeon/30" />
                  {t.diary?.bodyChemistry || "Química"}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                    {(diaryStats?.averageChemistry || 4.8).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">/ 5.0</span>
                </div>
              </div>

              {/* 3. Total Concretados */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-electricViolet-glow" />
                  {t.diary?.kpiTotal || "Encuentros"}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base sm:text-lg font-mono font-black text-electricViolet-glow">
                    {completedCount}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {language === "es" ? "citas" : "dates"}
                  </span>
                </div>
              </div>

              {/* 4. Repetición */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-emerald-400" />
                  {t.diary?.kpiRepeat || "Repetición"}
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
                    {diaryStats?.repeatPercentage ?? 100}%
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">química</span>
                </div>
              </div>
            </div>

            {/* Pie del Bento: Botón para ver desglose completo de opiniones y lugares */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setMainTab("insights");
                  audioEngine.playPulse();
                }}
                className="text-[11px] font-mono font-bold text-electricViolet-glow hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{language === "es" ? "Ver opiniones y lugares frecuentes ➔" : "View reviews & venues ➔"}</span>
              </button>
            </div>
          </div>
          {/* SECCIÓN 1: MIS CITAS (RAIL / CARRUSEL TÁCTICO) */}
          <section className="space-y-3" aria-labelledby="lovers-rail-title">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 id="lovers-rail-title" className="font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center gap-2">
                    <span>{t.diary?.tabLoversVault || (language === "es" ? "Mis Citas" : "My Dates")}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      {loversList.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {language === "es"
                      ? "Amantes con química registrada, fichas íntimas y revancha rápida"
                      : "Partners with logged chemistry, intimate files & quick rematch"}
                  </p>
                </div>
              </div>

              {/* Botón de Respaldo Cifrado de la Agenda */}
              <BrutalistButton
                variant="ghost"
                size="compact"
                onClick={() => {
                  setIsGlobalBackupOpen(true);
                  audioEngine.playPulse();
                }}
                className="shrink-0"
                title={language === "es" ? "Respaldo Cifrado AES-256" : "AES-256 Encrypted Backup"}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-mintNeon" />
                <span className="hidden xs:inline">{language === "es" ? "Respaldo Cifrado" : "Encrypted Backup"}</span>
                <span className="xs:hidden">{language === "es" ? "Respaldo" : "Backup"}</span>
              </BrutalistButton>
            </div>

            {/* Carrusel / Rail Horizontal Táctico de Chongos */}
            {loversList.length === 0 ? (
              <div className="bg-obsidian-surface/60 p-5 rounded-2xl border border-white/5 text-center space-y-1.5">
                <p className="text-xs font-mono text-neutral-300">
                  {language === "es"
                    ? "Todavía no tenés citas registradas con encuentros concretados."
                    : "No dates logged yet with completed encounters."}
                </p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {language === "es"
                    ? "Al concretar citas o guardar fotos en el chat, aparecerán acá sus fichas y química."
                    : "When you complete dates or save chat photos, their files and chemistry will appear here."}
                </p>
              </div>
            ) : (
              <div
                className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-1 px-1 scroll-smooth"
                data-testid="lovers-horizontal-rail"
              >
                {loversList.map((lover, idx) => {
                  const isRevanchaSent = !!revanchaSentIds[lover.profileId];

                  return (
                    <div
                      key={lover.profileId}
                      className="min-w-[240px] max-w-[260px] sm:min-w-[260px] bg-obsidian-surface/90 border border-white/10 hover:border-amber-400/50 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 shadow-card-elevation transition-all flex-shrink-0 group"
                    >
                      {/* Top: Avatar + info */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className="relative flex-shrink-0 cursor-pointer"
                          onClick={() => {
                            openLoverDossierModal(lover.profileId);
                            audioEngine.playPulse();
                          }}
                        >
                          <VaultEncryptedImage
                            src={lover.avatarUrl}
                            alt={lover.codename}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400/40 group-hover:border-electricViolet transition-all"
                          />
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black border border-amber-400/60 text-champagneGold font-mono text-[9px] font-black flex items-center justify-center shadow-md">
                            #{idx + 1}
                          </span>
                          {lover.photosCount > 0 && (
                            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-md bg-obsidian border border-electricViolet/60 text-[8px] font-mono font-bold text-electricViolet-glow">
                              📸{lover.photosCount}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => {
                              openLoverDossierModal(lover.profileId);
                              audioEngine.playPulse();
                            }}
                            className="font-mono font-black text-xs text-white group-hover:text-electricViolet-glow truncate cursor-pointer"
                          >
                            {lover.codename}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-1.5 py-0.2 rounded-full uppercase truncate">
                              {getRoleDisplayLabel(lover.role, language)}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                              {lover.encounterCount} {language === "es" ? "citas" : "dates"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-amber-300 font-bold">
                            <Flame className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                            <span>{lover.chemistryLevel}/5 química</span>
                          </div>
                        </div>
                      </div>

                      {/* Botonera Táctica Compacta */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            openLoverDossierModal(lover.profileId);
                            audioEngine.playPulse();
                          }}
                          className="flex-1 py-1.5 px-2 min-h-[38px] bg-white/5 hover:bg-electricViolet/20 text-neutral-300 hover:text-electricViolet-glow border border-white/10 hover:border-electricViolet/40 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                          title={language === "es" ? "Ver Ficha Íntima" : "View Lover File"}
                        >
                          <Lock className="w-3 h-3" />
                          <span>{language === "es" ? "Ficha" : "File"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playSubBass(55);
                            setRevanchaSentIds((prev) => ({ ...prev, [lover.profileId]: true }));
                            handleSendRevancha({ profileId: lover.profileId, codename: lover.codename });
                          }}
                          className={`flex-1 py-1.5 px-2 min-h-[38px] rounded-xl font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                            isRevanchaSent
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                              : "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>
                            {isRevanchaSent
                              ? (language === "es" ? "Enviado" : "Sent")
                              : (language === "es" ? "Revancha" : "Rematch")}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECCIÓN 2: FEED CRONOLÓGICO DE ENCUENTROS */}
          <section className="space-y-3" aria-labelledby="timeline-feed-title">
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
                setMainTab("health");
              }}
              onSendRevancha={handleSendRevancha}
              onRestoreBackup={restoreDiaryBackup}
              onScheduleNew={() => openCreateDiaryModal()}
              onNavigateToInsights={() => setMainTab("insights")}
              averageRating={averageReceivedRating}
              respectScore={myProfile.respectScore || 100}
              language={language}
              t={t}
              defaultStatusFilter="completed"
            />
          </section>
        </div>
      )}

      {/* 5. CONTENIDO: TAB 3 (SALUD & CUIDADOS - PESTAÑA INDEPENDIENTE) */}
      {mainTab === "health" && (
        <div className="space-y-4 animate-fade-in">
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
        </div>
      )}

      {/* 6. CONTENIDO: TAB 4 (MÉTRICAS & VALORACIONES - VISTA COMPLETA) */}
      {mainTab === "insights" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-obsidian-surface border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMainTab("my_agenda");
                audioEngine.playPulse();
              }}
              className="flex items-center gap-2 text-xs font-mono font-bold text-electricViolet-glow hover:text-white cursor-pointer py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === "es" ? "← Volver al Historial" : "← Back to History"}</span>
            </button>
            <span className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
              {language === "es" ? "Métricas & Valoraciones" : "Metrics & Reviews"}
            </span>
          </div>
          <DiaryInsights />
        </div>
      )}

      {/* MODAL GLOBAL DE RESPALDO CIFRADO */}
      <DiaryBackupModal
        isOpen={isGlobalBackupOpen}
        onClose={() => setIsGlobalBackupOpen(false)}
        exportPayload={{
          entries: diaryEntries,
          dossiers: profileDossiers || {},
          lovers: loversList,
        }}
        onRestoreBackup={restoreDiaryBackup}
        language={language}
        t={t}
      />

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
