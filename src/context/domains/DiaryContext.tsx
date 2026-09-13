"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  DiaryEntry,
  DiaryStats,
  EncounterRecord,
  EncounterTestimonial,
  EncounterValidationMethod,
  TestimonialStatus,
  DoxyPepTracker,
  ItsExposureAlert,
  ItsExposureType,
  ProfileDossier,
  VaultAuditLog,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, getActiveAppMode } from "@/lib/storage/localStorageSync";
import { MOCK_DIARY_ENTRIES } from "@/data/mockDiaryEntries";
import { MOCK_MY_RECEIVED_TESTIMONIALS } from "@/data/mockMyTestimonials";
import {
  submitTestimonialToCloud,
  subscribeToReceivedTestimonials,
  updateTestimonialStatusCloud,
} from "@/lib/firebase/testimonialService";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";

const INITIAL_VALIDATED_ENCOUNTERS: Record<string, EncounterRecord> = {};
const INITIAL_MY_TESTIMONIALS: EncounterTestimonial[] = MOCK_MY_RECEIVED_TESTIMONIALS;
const INITIAL_DOSSIERS: Record<string, ProfileDossier> = {};
const INITIAL_DOXYPEP_TRACKERS: DoxyPepTracker[] = [];
const INITIAL_VAULT_AUDIT_LOGS: VaultAuditLog[] = [];

export interface DiaryContextType {
  // Diario de Citas & Calendario Inteligente
  diaryEntries: DiaryEntry[];
  diaryStats: DiaryStats;
  isDiaryModalOpen: boolean;
  setIsDiaryModalOpen: (open: boolean) => void;
  diaryModalPreselectedProfileId: string | null;
  editingDiaryEntry: DiaryEntry | null;
  openCreateDiaryModal: (profileId?: string, editingEntryId?: string) => void;
  closeCreateDiaryModal: () => void;
  addDiaryEntry: (
    entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">
  ) => DiaryEntry;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;
  toggleHealthReminderResolved: (diaryId: string) => void;

  // Testimonios Consensuados & Geofencing
  validatedEncounters: Record<string, EncounterRecord>;
  validateEncounter: (profileId: string, method?: EncounterValidationMethod) => void;
  addTestimonial: (
    profileId: string,
    content: string,
    tags: string[],
    validationMethod?: EncounterValidationMethod
  ) => void;
  approveTestimonial: (profileId: string, testimonialId: string, makePublic?: boolean) => void;
  hideTestimonial: (profileId: string, testimonialId: string) => void;
  toggleTestimonialVisibility: (profileId: string, testimonialId: string) => void;
  rejectTestimonial: (profileId: string, testimonialId: string) => void;
  myReceivedTestimonials: EncounterTestimonial[];

  // Salud Sexual & Botiquín Doxy-PEP
  doxyPepTrackers: DoxyPepTracker[];
  addDoxyPepTracker: (encounter: { partnerCodename: string; encounterDate: string; encounterTime: string }) => void;
  toggleDoxyPepDose: (trackerId: string, dose: "24h" | "72h") => void;
  dismissDoxyPepTracker: (trackerId: string) => void;

  // Alerta Anónima de Exposición a ITS
  isItsExposureModalOpen: boolean;
  openItsExposureModal: () => void;
  closeItsExposureModal: () => void;
  sendAnonymousItsAlert: (
    condition: ItsExposureType,
    conditionLabel: string,
    daysWindow: number
  ) => void;

  // Dossier Privado, Ranking & Red Flags
  profileDossiers: Record<string, ProfileDossier>;
  getProfileDossier: (profileId: string) => ProfileDossier | undefined;
  saveProfileDossier: (profileId: string, data: Partial<ProfileDossier>) => void;
  deleteProfileDossier: (profileId: string) => void;

  // Bóvedas Desbloqueadas & Auditoría
  unlockedVaults: Record<string, boolean>;
  unlockVault: (vaultId: string) => void;
  revokeVaultAccess: (vaultId: string) => void;
  vaultAuditLogs: VaultAuditLog[];
  isVaultAuditModalOpen: boolean;
  openVaultAuditModal: () => void;
  closeVaultAuditModal: () => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

interface DiaryProviderProps {
  children: React.ReactNode;
  onProfileEncounterVerified?: (profileId: string, testimonial: EncounterTestimonial) => void;
  onSendItsAlertMessages?: (alertData: ItsExposureAlert, label: string) => void;
}

export const DiaryProvider: React.FC<DiaryProviderProps> = ({
  children,
  onProfileEncounterVerified,
  onSendItsAlertMessages,
}) => {
  const { myProfile, currentUserUid, authUser } = useAuth();
  const { language, appMode } = useSettings();

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() =>
    getActiveAppMode() === "real" ? [] : MOCK_DIARY_ENTRIES
  );
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [diaryModalPreselectedProfileId, setDiaryModalPreselectedProfileId] = useState<string | null>(null);
  const [editingDiaryEntryId, setEditingDiaryEntryId] = useState<string | null>(null);

  const [validatedEncounters, setValidatedEncounters] = useState<Record<string, EncounterRecord>>(INITIAL_VALIDATED_ENCOUNTERS);
  const [myReceivedTestimonials, setMyReceivedTestimonials] = useState<EncounterTestimonial[]>(() =>
    getActiveAppMode() === "real" ? [] : INITIAL_MY_TESTIMONIALS
  );

  const [doxyPepTrackers, setDoxyPepTrackers] = useState<DoxyPepTracker[]>(INITIAL_DOXYPEP_TRACKERS);
  const [isItsExposureModalOpen, setIsItsExposureModalOpen] = useState(false);

  const [profileDossiers, setProfileDossiers] = useState<Record<string, ProfileDossier>>(INITIAL_DOSSIERS);
  const [unlockedVaults, setUnlockedVaults] = useState<Record<string, boolean>>({});
  const [vaultAuditLogs, setVaultAuditLogs] = useState<VaultAuditLog[]>(INITIAL_VAULT_AUDIT_LOGS);
  const [isVaultAuditModalOpen, setIsVaultAuditModalOpen] = useState<boolean>(false);

  const openVaultAuditModal = useCallback(() => {
    setIsVaultAuditModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeVaultAuditModal = useCallback(() => {
    setIsVaultAuditModalOpen(false);
  }, []);

  // Hidratación local-first
  useEffect(() => {
    const fallbackDiary = appMode === "real" ? [] : MOCK_DIARY_ENTRIES;
    const localDiary = loadFromStorage<DiaryEntry[]>(STORAGE_KEYS.DIARY, fallbackDiary, appMode);
    if (localDiary) setDiaryEntries(localDiary);

    const localEncounters = loadFromStorage<Record<string, EncounterRecord>>(STORAGE_KEYS.VALIDATED_ENCOUNTERS, INITIAL_VALIDATED_ENCOUNTERS, appMode);
    if (localEncounters && Object.keys(localEncounters).length > 0) setValidatedEncounters(localEncounters);

    const localDossiers = loadFromStorage<Record<string, ProfileDossier>>(STORAGE_KEYS.DOSSIERS, INITIAL_DOSSIERS, appMode);
    if (localDossiers && Object.keys(localDossiers).length > 0) setProfileDossiers(localDossiers);

    const localDoxyPep = loadFromStorage<DoxyPepTracker[]>(STORAGE_KEYS.DOXYPEP_TRACKERS, INITIAL_DOXYPEP_TRACKERS, appMode);
    if (localDoxyPep) setDoxyPepTrackers(localDoxyPep);

    const localVaultAudit = loadFromStorage<VaultAuditLog[]>(STORAGE_KEYS.VAULT_AUDIT_LOGS, INITIAL_VAULT_AUDIT_LOGS, appMode);
    if (localVaultAudit) setVaultAuditLogs(localVaultAudit);

    const fallbackTestimonials = appMode === "real" ? [] : MOCK_MY_RECEIVED_TESTIMONIALS;
    const localTestimonials = loadFromStorage<EncounterTestimonial[]>(STORAGE_KEYS.MY_TESTIMONIALS, fallbackTestimonials, appMode);
    if (localTestimonials) setMyReceivedTestimonials(localTestimonials);
  }, [appMode]);

  // Suscripción en tiempo real a testimonios recibidos desde Firestore
  useEffect(() => {
    if (!currentUserUid || currentUserUid === "local-user" || !authUser) return;

    const unsubscribe = subscribeToReceivedTestimonials(currentUserUid, (cloudTestimonials) => {
      if (!cloudTestimonials || cloudTestimonials.length === 0) return;
      setMyReceivedTestimonials((prevLocal) => {
        const merged = new Map<string, EncounterTestimonial>();
        prevLocal.forEach((t) => merged.set(t.id, t));
        cloudTestimonials.forEach((t) => merged.set(t.id, t));
        return Array.from(merged.values());
      });
    });

    return () => unsubscribe();
  }, [currentUserUid, authUser]);

  const openCreateDiaryModal = useCallback((profileId?: string, editingEntryId?: string) => {
    setDiaryModalPreselectedProfileId(profileId || null);
    setEditingDiaryEntryId(editingEntryId || null);
    setIsDiaryModalOpen(true);
  }, []);

  const closeCreateDiaryModal = useCallback(() => {
    setIsDiaryModalOpen(false);
    setDiaryModalPreselectedProfileId(null);
    setEditingDiaryEntryId(null);
  }, []);

  const addDiaryEntry = useCallback(
    (entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">): DiaryEntry => {
      const newEntry: DiaryEntry = {
        ...entry,
        id: `diary-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDiaryEntries((prev) => {
        const next = [newEntry, ...prev];
        saveToStorage(STORAGE_KEYS.DIARY, next);
        return next;
      });
      audioEngine.playVaultUnlock();
      return newEntry;
    },
    []
  );

  const updateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    setDiaryEntries((prev) => {
      const next = prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : entry
      );
      saveToStorage(STORAGE_KEYS.DIARY, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const deleteDiaryEntry = useCallback((id: string) => {
    setDiaryEntries((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      saveToStorage(STORAGE_KEYS.DIARY, next);
      return next;
    });
    audioEngine.playStateSwitch("dormant");
  }, []);

  const toggleHealthReminderResolved = useCallback((diaryId: string) => {
    setDiaryEntries((prev) => {
      const next = prev.map((entry) => {
        if (entry.id === diaryId && entry.healthRoutineReminder) {
          return {
            ...entry,
            healthRoutineReminder: {
              ...entry.healthRoutineReminder,
              isResolved: !entry.healthRoutineReminder.isResolved,
            },
          };
        }
        return entry;
      });
      saveToStorage(STORAGE_KEYS.DIARY, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const editingDiaryEntry = useMemo(
    () => diaryEntries.find((d) => d.id === editingDiaryEntryId) || null,
    [diaryEntries, editingDiaryEntryId]
  );

  // Estadísticas calculadas del diario
  const diaryStats = useMemo<DiaryStats>(() => {
    const evaluatedEntries = diaryEntries.filter(
      (e) => !e.isUpcoming && e.satisfaction
    );
    const totalWithScore = evaluatedEntries.length;

    const avgSatisfaction =
      totalWithScore > 0
        ? evaluatedEntries.reduce(
            (acc, e) => acc + (e.satisfaction?.overallScore || 0),
            0
          ) / totalWithScore
        : 0;

    const avgChemistry =
      totalWithScore > 0
        ? evaluatedEntries.reduce(
            (acc, e) => acc + (e.satisfaction?.chemistryLevel || 0),
            0
          ) / totalWithScore
        : 0;

    const repeatCount = evaluatedEntries.filter(
      (e) => e.satisfaction?.wouldRepeat === "yes"
    ).length;
    const repeatPercentage =
      totalWithScore > 0 ? Math.round((repeatCount / totalWithScore) * 100) : 0;

    const locationCounts: Record<string, number> = {};
    diaryEntries.forEach((e) => {
      locationCounts[e.location.category] =
        (locationCounts[e.location.category] || 0) + 1;
    });
    let topLocationCategory = "Sin datos";
    let maxCount = 0;
    Object.entries(locationCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topLocationCategory = cat;
      }
    });

    const upcomingDatesCount = diaryEntries.filter((e) => e.isUpcoming).length;
    const pendingHealthChecksCount = diaryEntries.filter(
      (e) => e.healthRoutineReminder?.enabled && !e.healthRoutineReminder?.isResolved
    ).length;

    return {
      totalEncounters: diaryEntries.filter((e) => !e.isUpcoming).length,
      averageSatisfaction: Number(avgSatisfaction.toFixed(1)),
      averageChemistry: Number(avgChemistry.toFixed(1)),
      repeatPercentage,
      topLocationCategory,
      upcomingDatesCount,
      pendingHealthChecksCount,
    };
  }, [diaryEntries]);

  const validateEncounter = useCallback(
    (profileId: string, method: EncounterValidationMethod = "rendezvous_pin") => {
      const record: EncounterRecord = {
        profileId,
        validatedAt: new Date().toISOString(),
        method,
        isCompleted: true,
      };

      setValidatedEncounters((prev) => {
        const next = { ...prev, [profileId]: record };
        saveToStorage(STORAGE_KEYS.VALIDATED_ENCOUNTERS, next);
        return next;
      });

      audioEngine.playVaultUnlock();
    },
    []
  );

  const addTestimonial = useCallback(
    (
      profileId: string,
      content: string,
      tags: string[],
      validationMethod: EncounterValidationMethod = "rendezvous_pin"
    ) => {
      const newTestimonial: EncounterTestimonial = {
        id: `test-${Date.now()}`,
        authorId: currentUserUid || "me",
        authorCodename: myProfile.codename || "TÚ (Vessel)",
        authorAvatar: myProfile.avatarUrl,
        content,
        tags,
        createdAt: "Recién enviado",
        validationMethod,
        encounterVerified: true,
        status: "pending",
      };

      if (onProfileEncounterVerified) {
        onProfileEncounterVerified(profileId, newTestimonial);
      }

      // Persistencia en Firestore
      if (currentUserUid && currentUserUid !== "local-user") {
        submitTestimonialToCloud(profileId, newTestimonial, currentUserUid).catch((err) =>
          console.warn("Fallo al guardar testimonio en Firestore:", err)
        );
      }

      audioEngine.playSignalSent();
    },
    [currentUserUid, myProfile.codename, myProfile.avatarUrl, onProfileEncounterVerified]
  );

  const approveTestimonial = useCallback(
    (profileId: string, testimonialId: string, makePublic: boolean = true) => {
      const targetStatus: TestimonialStatus = makePublic ? "approved" : "hidden";

      if (profileId === "me" || profileId === "my-profile") {
        setMyReceivedTestimonials((prev) => {
          const next = prev.map((t) => (t.id === testimonialId ? { ...t, status: targetStatus } : t));
          saveToStorage(STORAGE_KEYS.MY_TESTIMONIALS, next, appMode);
          return next;
        });
      }
      updateTestimonialStatusCloud(testimonialId, targetStatus).catch((err) =>
        console.warn("Fallo al actualizar testimonio en Firestore:", err)
      );
      audioEngine.playPulse();
    },
    [appMode]
  );

  const hideTestimonial = useCallback((profileId: string, testimonialId: string) => {
    approveTestimonial(profileId, testimonialId, false);
  }, [approveTestimonial]);

  const toggleTestimonialVisibility = useCallback((profileId: string, testimonialId: string) => {
    let nextStatus: TestimonialStatus = "approved";
    if (profileId === "me" || profileId === "my-profile") {
      setMyReceivedTestimonials((prev) => {
        const next = prev.map((t) => {
          if (t.id === testimonialId) {
            nextStatus = t.status === "approved" ? "hidden" : "approved";
            return { ...t, status: nextStatus };
          }
          return t;
        });
        saveToStorage(STORAGE_KEYS.MY_TESTIMONIALS, next, appMode);
        return next;
      });
    }
    updateTestimonialStatusCloud(testimonialId, nextStatus).catch((err) =>
      console.warn("Fallo al actualizar visibilidad de testimonio en Firestore:", err)
    );
    audioEngine.playPulse();
  }, [appMode]);

  const rejectTestimonial = useCallback((profileId: string, testimonialId: string) => {
    if (profileId === "me" || profileId === "my-profile") {
      setMyReceivedTestimonials((prev) => {
        const next: EncounterTestimonial[] = prev.map((t) =>
          t.id === testimonialId ? { ...t, status: "rejected" as TestimonialStatus } : t
        );
        saveToStorage(STORAGE_KEYS.MY_TESTIMONIALS, next, appMode);
        return next;
      });
    }
    updateTestimonialStatusCloud(testimonialId, "rejected").catch((err) =>
      console.warn("Fallo al rechazar testimonio en Firestore:", err)
    );
    audioEngine.playStateSwitch("dormant");
  }, [appMode]);

  const addDoxyPepTracker = useCallback(
    (encounter: { partnerCodename: string; encounterDate: string; encounterTime: string }) => {
      const now = Date.now();
      const newTracker: DoxyPepTracker = {
        id: `doxy-${now}`,
        partnerCodename: encounter.partnerCodename,
        encounterDate: encounter.encounterDate,
        encounterTime: encounter.encounterTime,
        due24h: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        due72h: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
        taken24h: false,
        taken72h: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
      };
      setDoxyPepTrackers((prev) => {
        const next = [newTracker, ...prev];
        saveToStorage(STORAGE_KEYS.DOXYPEP_TRACKERS, next);
        return next;
      });
      audioEngine.playSubBass(70);
    },
    []
  );

  const toggleDoxyPepDose = useCallback((trackerId: string, dose: "24h" | "72h") => {
    setDoxyPepTrackers((prev) => {
      const next = prev.map((t) => {
        if (t.id === trackerId) {
          return dose === "24h" ? { ...t, taken24h: !t.taken24h } : { ...t, taken72h: !t.taken72h };
        }
        return t;
      });
      saveToStorage(STORAGE_KEYS.DOXYPEP_TRACKERS, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const dismissDoxyPepTracker = useCallback((trackerId: string) => {
    setDoxyPepTrackers((prev) => {
      const next = prev.filter((t) => t.id !== trackerId);
      saveToStorage(STORAGE_KEYS.DOXYPEP_TRACKERS, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const openItsExposureModal = useCallback(() => {
    setIsItsExposureModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeItsExposureModal = useCallback(() => {
    setIsItsExposureModalOpen(false);
  }, []);

  const sendAnonymousItsAlert = useCallback(
    (condition: ItsExposureType, conditionLabel: string, daysWindow: number) => {
      const token = `token-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const alertData: ItsExposureAlert = {
        id: `its-${Date.now()}`,
        conditionType: condition,
        conditionLabel,
        diagnosedDate: new Date().toISOString().split("T")[0],
        anonymousToken: token,
        sentAt: new Date().toISOString(),
        adviceText:
          language === "es"
            ? "Te recomendamos realizarte un chequeo médico de rutina preventivo."
            : "We recommend taking a routine medical screening.",
      };

      if (onSendItsAlertMessages) {
        onSendItsAlertMessages(alertData, conditionLabel);
      }

      audioEngine.playSubBass(50);
      setIsItsExposureModalOpen(false);
    },
    [language, onSendItsAlertMessages]
  );

  const getProfileDossier = useCallback(
    (profileId: string): ProfileDossier | undefined => {
      return profileDossiers[profileId];
    },
    [profileDossiers]
  );

  const saveProfileDossier = useCallback(
    (profileId: string, data: Partial<ProfileDossier>) => {
      setProfileDossiers((prev) => {
        const existing = prev[profileId] || {
          profileId,
          redFlags: [],
          greenFlags: [],
          updatedAt: new Date().toISOString(),
        };
        const updated: ProfileDossier = {
          ...existing,
          ...data,
          profileId,
          redFlags: data.redFlags ?? existing.redFlags ?? [],
          greenFlags: data.greenFlags ?? existing.greenFlags ?? [],
          updatedAt: new Date().toISOString(),
        };
        const next = { ...prev, [profileId]: updated };
        saveToStorage(STORAGE_KEYS.DOSSIERS, next);
        return next;
      });
    },
    []
  );

  const deleteProfileDossier = useCallback((profileId: string) => {
    setProfileDossiers((prev) => {
      if (!prev[profileId]) return prev;
      const next = { ...prev };
      delete next[profileId];
      saveToStorage(STORAGE_KEYS.DOSSIERS, next);
      return next;
    });
  }, []);

  const unlockVault = useCallback((vaultId: string) => {
    setUnlockedVaults((prev) => ({
      ...prev,
      [vaultId]: true,
    }));
    audioEngine.playVaultUnlock();
  }, []);

  const revokeVaultAccess = useCallback((vaultId: string) => {
    setUnlockedVaults((prev) => {
      const next = { ...prev };
      delete next[vaultId];
      return next;
    });
  }, []);

  const value = useMemo<DiaryContextType>(
    () => ({
      diaryEntries,
      diaryStats,
      isDiaryModalOpen,
      setIsDiaryModalOpen,
      diaryModalPreselectedProfileId,
      editingDiaryEntry,
      openCreateDiaryModal,
      closeCreateDiaryModal,
      addDiaryEntry,
      updateDiaryEntry,
      deleteDiaryEntry,
      toggleHealthReminderResolved,
      validatedEncounters,
      validateEncounter,
      addTestimonial,
      approveTestimonial,
      hideTestimonial,
      toggleTestimonialVisibility,
      rejectTestimonial,
      myReceivedTestimonials,
      doxyPepTrackers,
      addDoxyPepTracker,
      toggleDoxyPepDose,
      dismissDoxyPepTracker,
      isItsExposureModalOpen,
      openItsExposureModal,
      closeItsExposureModal,
      sendAnonymousItsAlert,
      profileDossiers,
      getProfileDossier,
      saveProfileDossier,
      deleteProfileDossier,
      unlockedVaults,
      unlockVault,
      revokeVaultAccess,
      vaultAuditLogs,
      isVaultAuditModalOpen,
      openVaultAuditModal,
      closeVaultAuditModal,
    }),
    [
      diaryEntries,
      diaryStats,
      isDiaryModalOpen,
      diaryModalPreselectedProfileId,
      editingDiaryEntry,
      openCreateDiaryModal,
      closeCreateDiaryModal,
      addDiaryEntry,
      updateDiaryEntry,
      deleteDiaryEntry,
      toggleHealthReminderResolved,
      validatedEncounters,
      validateEncounter,
      addTestimonial,
      approveTestimonial,
      hideTestimonial,
      toggleTestimonialVisibility,
      rejectTestimonial,
      myReceivedTestimonials,
      doxyPepTrackers,
      addDoxyPepTracker,
      toggleDoxyPepDose,
      dismissDoxyPepTracker,
      isItsExposureModalOpen,
      openItsExposureModal,
      closeItsExposureModal,
      sendAnonymousItsAlert,
      profileDossiers,
      getProfileDossier,
      saveProfileDossier,
      deleteProfileDossier,
      unlockedVaults,
      unlockVault,
      revokeVaultAccess,
      vaultAuditLogs,
      isVaultAuditModalOpen,
      openVaultAuditModal,
      closeVaultAuditModal,
    ]
  );

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
};

export const useDiary = (): DiaryContextType => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error("useDiary must be used within a DiaryProvider");
  }
  return context;
};
