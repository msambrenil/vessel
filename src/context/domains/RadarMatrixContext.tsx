"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  VesselProfile,
  FilterState,
  ActiveNavView,
  ReceivedPulse,
  OnTheClockState,
  KinkMatrixMap,
  KinkPreferenceLevel,
  KinkMutualMatch,
  AmbientSoundVibeType,
  SubstanceAtmosphere,
  UserBoundarySetting,
  ProfileDossier,
  EncounterTestimonial,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  encodeGeohash,
  discretizeDistance,
  calculateHaversineDistance,
  computePresenceExpiry,
  isProfileActiveInMatrix,
  sortAndEnrichProfilesByProximity,
} from "@/lib/geo/GeospatialEngine";
import {
  subscribeToMatrixProfiles,
  updateMyMatrixPresence,
} from "@/lib/firebase/matrixService";
import {
  sendPulseToCloud,
  subscribeToIncomingPulses,
  markPulseReadInCloud,
  returnPulseInCloud,
  clearPulseInCloud,
} from "@/lib/firebase/pulseService";
import { saveFullUserDataToCloud, FullUserDataPayload } from "@/lib/firebase/userDataService";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, getActiveAppMode } from "@/lib/storage/localStorageSync";
import { checkGenderInterestMatch } from "@/data/genderCatalog";
import { MOCK_PROFILES } from "@/data/mockProfiles";
import { useAuth } from "./AuthContext";
import { useLogistics } from "./LogisticsContext";
import { useSettings } from "./SettingsContext";
import { useSafety } from "./SafetyContext";
import { useChat } from "./ChatContext";
import { useDiary } from "./DiaryContext";

export const DEFAULT_FILTERS: FilterState = {
  bodyStates: ["open", "occupied", "dormant"],
  roles: [],
  minIntensity: 1,
  maxDistanceKm: 5,
  immediateHostOnly: false,
  selectedKinks: [],
  energyVibes: [],
  onlyAntiGhost: false,
  searchQuery: "",
  onlyVerified: false,
  onlyMutualKinks: false,
  genderInterests: undefined,
};

const INITIAL_RECEIVED_PULSES: ReceivedPulse[] = [
  {
    id: "pulse-rec-01",
    fromProfileId: "vessel-01",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isRead: false,
    returned: false,
  },
  {
    id: "pulse-rec-02",
    fromProfileId: "vessel-02",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    returned: false,
  },
  {
    id: "pulse-rec-03",
    fromProfileId: "vessel-03",
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    isRead: true,
    returned: true,
  },
  {
    id: "pulse-rec-04",
    fromProfileId: "vessel-05",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isRead: true,
    returned: false,
  },
  {
    id: "pulse-rec-05",
    fromProfileId: "vessel-07",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: true,
    returned: true,
  },
];

const INITIAL_ON_THE_CLOCK: OnTheClockState = {
  isActive: false,
  expiresAt: null,
  durationMinutes: 30,
};

const INITIAL_MY_KINK_MATRIX: KinkMatrixMap = {
  leather: "love",
  darkroom: "love",
  "raw-carnal": "curious",
};

export interface RadarMatrixContextType {
  profiles: VesselProfile[];
  updateProfile: (profileId: string, updates: Partial<VesselProfile>) => void;
  resetProfilesToDefault: () => void;
  filteredProfiles: VesselProfile[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  selectedProfile: VesselProfile | null;
  setSelectedProfile: (profile: VesselProfile | null) => void;
  transmissions: Record<string, number>;
  sentPulsesMeta: Record<string, { lastSentAt: string; syncStatus?: "synced" | "queued_offline" }>;
  transmitSignal: (profileId: string) => void;
  receivedPulses: ReceivedPulse[];
  returnPulse: (profileId: string) => void;
  markPulsesAsRead: () => void;
  clearPulse: (pulseId: string) => void;
  clearAllReadPulses: () => void;
  unreadPulsesCount: number;
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
  myOnTheClock: OnTheClockState;
  startOnTheClock: (durationMinutes: number, note?: string) => void;
  stopOnTheClock: () => void;
  isOnTheClockFilterActive: boolean;
  setIsOnTheClockFilterActive: (active: boolean) => void;
  myKinkMatrix: KinkMatrixMap;
  setKinkPreference: (kinkId: string, level: KinkPreferenceLevel) => void;
  getMutualKinkMatches: (theirKinkMatrix?: KinkMatrixMap) => KinkMutualMatch[];
  myAmbientVibe: AmbientSoundVibeType;
  setMyAmbientVibe: (vibe: AmbientSoundVibeType) => void;
  isPlayingAmbientTone: boolean;
  playAmbientTonePreview: (vibe: AmbientSoundVibeType) => void;
  stopAmbientTonePreview: () => void;
  mySubstanceAtmosphere: SubstanceAtmosphere;
  setMySubstanceAtmosphere: (atmosphere: SubstanceAtmosphere) => void;
  myFullProfile: VesselProfile;
  hasMutualPulse: (profileId: string) => boolean;
  matrixTab: "people" | "places";
  setMatrixTab: (tab: "people" | "places") => void;
  favoriteProfileIds: string[];
  toggleFavoriteProfile: (profileId: string) => void;
  isFavoriteProfile: (profileId: string) => boolean;
}

const RadarMatrixContext = createContext<RadarMatrixContextType | undefined>(undefined);

interface RadarMatrixProviderProps {
  children: React.ReactNode;
  boundaries?: Record<string, UserBoundarySetting>;
  profileDossiers?: Record<string, ProfileDossier>;
  myReceivedTestimonials?: EncounterTestimonial[];
}

export const RadarMatrixProvider: React.FC<RadarMatrixProviderProps> = ({
  children,
  boundaries: propBoundaries,
  profileDossiers: propProfileDossiers,
  myReceivedTestimonials: propTestimonials,
}) => {
  let chatBoundaries: Record<string, UserBoundarySetting> | undefined;
  try {
    const chat = useChat();
    chatBoundaries = chat.boundaries;
  } catch {
    // standalone fallback
  }

  let diaryDossiers: Record<string, ProfileDossier> | undefined;
  let diaryTestimonials: EncounterTestimonial[] | undefined;
  try {
    const diary = useDiary();
    diaryDossiers = diary.profileDossiers;
    diaryTestimonials = diary.myReceivedTestimonials;
  } catch {
    // standalone fallback
  }

  const boundaries = propBoundaries ?? chatBoundaries ?? {};
  const profileDossiers = propProfileDossiers ?? diaryDossiers ?? {};
  const myReceivedTestimonials = propTestimonials ?? diaryTestimonials ?? [];

  const { myProfile, myBodyState, updateMyProfile, currentUserUid, authUser } = useAuth();
  const {
    myCoordinates,
    geoPrivacyLevel,
    myHostCard,
    updateMyHostCard,
    myVoiceVibe,
    myExitProtocol,
    myDuoLink,
    nightlifeEvents,
    activeCheckin,
    isGpsHibernating,
    lastGpsPingAt,
  } = useLogistics();
  const { language, userAlbums, appMode } = useSettings();
  const { stealthMode } = useSafety();

  // Helper para cargar y sanitizar perfiles mock de prueba descartando cualquier fantasma
  const getSanitizedMockProfiles = useCallback((): VesselProfile[] => {
    const localCustom = loadFromStorage<VesselProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "test");
    if (!localCustom || localCustom.length === 0) return MOCK_PROFILES;

    // Mapear exclusivamente sobre MOCK_PROFILES para garantizar que NINGÚN usuario residual se cuele
    const validProfiles = MOCK_PROFILES.map((mock) => {
      const custom = localCustom.find((c) => c.id === mock.id);
      if (!custom) return mock;
      return {
        ...mock,
        ...custom,
        substanceAtmosphere: custom.substanceAtmosphere || mock.substanceAtmosphere,
        exitProtocol: custom.exitProtocol || mock.exitProtocol,
        ambientVibe: custom.ambientVibe || mock.ambientVibe,
        kinkMatrix: custom.kinkMatrix || mock.kinkMatrix,
        onTheClock: custom.onTheClock || mock.onTheClock,
      };
    });

    // Sanitizar localStorage automáticamente si contenía perfiles huérfanos o si se agregaron nuevos perfiles
    const hasGhostProfiles = localCustom.some((c) => !MOCK_PROFILES.some((m) => m.id === c.id));
    if (hasGhostProfiles || localCustom.length < MOCK_PROFILES.length) {
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, validProfiles, "test");
    }

    return validProfiles;
  }, []);

  const [profiles, setProfiles] = useState<VesselProfile[]>(() => {
    if (getActiveAppMode() === "real") return [];
    const localCustom = loadFromStorage<VesselProfile[]>(STORAGE_KEYS.CUSTOM_PROFILES, [], "test");
    if (!localCustom || localCustom.length === 0) return MOCK_PROFILES;
    return MOCK_PROFILES.map((mock) => {
      const custom = localCustom.find((c) => c.id === mock.id);
      if (!custom) return mock;
      return {
        ...mock,
        ...custom,
        substanceAtmosphere: custom.substanceAtmosphere || mock.substanceAtmosphere,
        exitProtocol: custom.exitProtocol || mock.exitProtocol,
        ambientVibe: custom.ambientVibe || mock.ambientVibe,
        kinkMatrix: custom.kinkMatrix || mock.kinkMatrix,
        onTheClock: custom.onTheClock || mock.onTheClock,
      };
    });
  });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveNavView>("grid");
  const [selectedProfile, setSelectedProfile] = useState<VesselProfile | null>(null);
  const [matrixTab, setMatrixTabState] = useState<"people" | "places">("people");

  const [favoriteProfileIds, setFavoriteProfileIds] = useState<string[]>(() => {
    return loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, [], getActiveAppMode());
  });

  const toggleFavoriteProfile = useCallback(
    (profileId: string) => {
      if (!profileId || profileId === "me") return;
      setFavoriteProfileIds((prev) => {
        const exists = prev.includes(profileId);
        const next = exists ? prev.filter((id) => id !== profileId) : [...prev, profileId];
        saveToStorage(STORAGE_KEYS.FAVORITES, next, getActiveAppMode());
        if (currentUserUid && currentUserUid !== "local-user" && currentUserUid !== "unauthenticated") {
          saveFullUserDataToCloud(currentUserUid, { favoriteProfileIds: next });
        }
        return next;
      });
      audioEngine.playPulse();
    },
    [currentUserUid]
  );

  const isFavoriteProfile = useCallback(
    (profileId: string): boolean => {
      return favoriteProfileIds.includes(profileId);
    },
    [favoriteProfileIds]
  );

  const setMatrixTab = useCallback((tab: "people" | "places") => {
    setMatrixTabState(tab);
    audioEngine.playPulse();
  }, []);

  const [transmissions, setTransmissions] = useState<Record<string, number>>({});
  const [sentPulsesMeta, setSentPulsesMeta] = useState<
    Record<string, { lastSentAt: string; syncStatus?: "synced" | "queued_offline" }>
  >({});
  const [receivedPulses, setReceivedPulses] = useState<ReceivedPulse[]>(() =>
    getActiveAppMode() === "real" ? [] : INITIAL_RECEIVED_PULSES
  );

  const [myOnTheClock, setMyOnTheClock] = useState<OnTheClockState>(INITIAL_ON_THE_CLOCK);
  const [isOnTheClockFilterActive, setIsOnTheClockFilterActive] = useState<boolean>(false);
  const [myKinkMatrix, setMyKinkMatrix] = useState<KinkMatrixMap>(() =>
    getActiveAppMode() === "real" ? {} : INITIAL_MY_KINK_MATRIX
  );
  const [myAmbientVibe, setMyAmbientVibeState] = useState<AmbientSoundVibeType>("subbass_50hz");
  const [isPlayingAmbientTone, setIsPlayingAmbientTone] = useState(false);
  const [mySubstanceAtmosphere, setMySubstanceAtmosphereState] = useState<SubstanceAtmosphere>("sober");

  // Hidratación local-first según el modo
  useEffect(() => {
    if (appMode === "real") {
      const localReceivedPulses = loadFromStorage<ReceivedPulse[]>(STORAGE_KEYS.RECEIVED_PULSES, [], "real");
      if (localReceivedPulses) setReceivedPulses(localReceivedPulses);
    } else {
      setProfiles(getSanitizedMockProfiles());

      const localReceivedPulses = loadFromStorage<ReceivedPulse[]>(STORAGE_KEYS.RECEIVED_PULSES, INITIAL_RECEIVED_PULSES, "test");
      if (localReceivedPulses && localReceivedPulses.length > 0) setReceivedPulses(localReceivedPulses);
    }

    const localOnTheClock = loadFromStorage<OnTheClockState>(STORAGE_KEYS.ON_THE_CLOCK, INITIAL_ON_THE_CLOCK, appMode);
    if (localOnTheClock && localOnTheClock.expiresAt && new Date(localOnTheClock.expiresAt).getTime() > Date.now()) {
      setMyOnTheClock(localOnTheClock);
    }

    const fallbackKinks = appMode === "real" ? {} : INITIAL_MY_KINK_MATRIX;
    const localKinkMatrix = loadFromStorage<KinkMatrixMap>(STORAGE_KEYS.KINK_MATRIX, fallbackKinks, appMode);
    if (localKinkMatrix) {
      // Si en Modo Real quedaron guardados en localStorage los 3 morbos de muestra por defecto, limpiarlos a {}
      const keys = Object.keys(localKinkMatrix);
      const isLegacyMockKinks =
        appMode === "real" &&
        keys.length === 3 &&
        localKinkMatrix.leather === "love" &&
        localKinkMatrix.darkroom === "love" &&
        localKinkMatrix["raw-carnal"] === "curious";
      if (isLegacyMockKinks) {
        setMyKinkMatrix({});
        saveToStorage(STORAGE_KEYS.KINK_MATRIX, {}, "real");
      } else {
        setMyKinkMatrix(localKinkMatrix);
      }
    } else {
      setMyKinkMatrix(fallbackKinks);
    }

    const localAmbientVibe = loadFromStorage<AmbientSoundVibeType>(STORAGE_KEYS.AMBIENT_VIBE, "subbass_50hz", appMode);
    if (localAmbientVibe) setMyAmbientVibeState(localAmbientVibe);

    const localAtmosphere = loadFromStorage<SubstanceAtmosphere>(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE, "sober", appMode);
    setMySubstanceAtmosphereState(localAtmosphere);

    const localFavorites = loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, [], appMode);
    setFavoriteProfileIds(localFavorites || []);
  }, [appMode, getSanitizedMockProfiles]);

  // Sincronización reactiva desde Firestore cuando el usuario inicia sesión o cambia de cuenta
  useEffect(() => {
    const handleCloudHydrated = (e: Event) => {
      const detail = (e as CustomEvent<{ uid: string; cloudData: FullUserDataPayload }>).detail;
      if (!detail || !detail.cloudData) return;
      const { cloudData } = detail;

      const userKinks = cloudData.kinkMatrix || {};
      setMyKinkMatrix(userKinks);
      saveToStorage(STORAGE_KEYS.KINK_MATRIX, userKinks, appMode);

      if (cloudData.ambientVibe) {
        setMyAmbientVibeState(cloudData.ambientVibe);
        saveToStorage(STORAGE_KEYS.AMBIENT_VIBE, cloudData.ambientVibe, appMode);
      }

      if (cloudData.substanceAtmosphere) {
        setMySubstanceAtmosphereState(cloudData.substanceAtmosphere);
        saveToStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE, cloudData.substanceAtmosphere, appMode);
      }

      if (cloudData.favoriteProfileIds) {
        setFavoriteProfileIds(cloudData.favoriteProfileIds);
        saveToStorage(STORAGE_KEYS.FAVORITES, cloudData.favoriteProfileIds, appMode);
      } else if (appMode === "real") {
        setFavoriteProfileIds([]);
      }

      if (cloudData.profile?.seekingRoles && Array.isArray(cloudData.profile.seekingRoles)) {
        setFilters((prev) => ({
          ...prev,
          roles: cloudData.profile!.seekingRoles!,
        }));
      }
    };

    const handleUserSwitched = () => {
      const defaultKinks = appMode === "real" ? {} : INITIAL_MY_KINK_MATRIX;
      setMyKinkMatrix(defaultKinks);
      setFavoriteProfileIds([]);
      setFilters(DEFAULT_FILTERS);
    };

    window.addEventListener("vessel:cloud-user-hydrated", handleCloudHydrated);
    window.addEventListener("vessel:user-switched", handleUserSwitched);
    return () => {
      window.removeEventListener("vessel:cloud-user-hydrated", handleCloudHydrated);
      window.removeEventListener("vessel:user-switched", handleUserSwitched);
    };
  }, [appMode]);

  // Suscripción a perfiles públicos de la matriz en Firestore (Estrictamente aislada a Modo Real)
  useEffect(() => {
    if (appMode !== "real") {
      // En Modo Prueba: Entorno sandbox 100% aislado en memoria/storage local, sin contaminación de Firestore
      setProfiles(sortAndEnrichProfilesByProximity(getSanitizedMockProfiles(), myCoordinates));
      return;
    }

    // En Modo Real: Suscripción en tiempo real a perfiles de usuarios reales en Firestore con TTL de 30m y orden por cercanía
    const unsubMatrix = subscribeToMatrixProfiles((cloudProfiles) => {
      const now = Date.now();
      const activeOthers = cloudProfiles.filter(
        (cp) =>
          cp.id !== currentUserUid &&
          cp.id !== "me" &&
          cp.id !== "unauthenticated" &&
          isProfileActiveInMatrix(cp, now)
      );
      setProfiles(sortAndEnrichProfilesByProximity(activeOthers, myCoordinates));
    }, "real");

    // Barrido periódico cada 30s para expulsar de la Matrix perfiles cuyo TTL de 30 minutos haya expirado
    const ttlSweepInterval = setInterval(() => {
      const now = Date.now();
      setProfiles((prev) =>
        sortAndEnrichProfilesByProximity(
          prev.filter((cp) => isProfileActiveInMatrix(cp, now)),
          myCoordinates
        )
      );
    }, 30000);

    return () => {
      unsubMatrix();
      clearInterval(ttlSweepInterval);
    };
  }, [currentUserUid, appMode, getSanitizedMockProfiles, myCoordinates]);

  // Suscripción en tiempo real a pulsos entrantes en Firestore
  useEffect(() => {
    if (!currentUserUid || currentUserUid === "local-user" || !authUser) return;

    const unsubPulses = subscribeToIncomingPulses(currentUserUid, (cloudPulses) => {
      if (!cloudPulses || cloudPulses.length === 0) return;
      setReceivedPulses((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const hasNewIncoming = cloudPulses.some((p) => !existingIds.has(p.id) && !p.isRead);

        if (hasNewIncoming) {
          audioEngine.playNudgeReceived();
        }

        const map = new Map<string, ReceivedPulse>();
        prev.forEach((p) => map.set(p.id, p));
        cloudPulses.forEach((p) => map.set(p.id, p));
        const merged = Array.from(map.values());
        saveToStorage(STORAGE_KEYS.RECEIVED_PULSES, merged);
        return merged;
      });
    });

    return () => {
      unsubPulses();
    };
  }, [currentUserUid, authUser]);

  // Publicar presencia en la nube cuando el usuario abre la app o confirma Modo Fiesta (TTL 30m o 4h en Fiesta)
  useEffect(() => {
    if (appMode !== "real") return;
    if (!currentUserUid || currentUserUid === "local-user" || currentUserUid === "unauthenticated" || !authUser) return;
    if (authUser.isAnonymous || authUser.email?.endsWith("@vessel.dev")) return;
    const cleanCodename = (myProfile.codename || "").trim().toUpperCase();
    if (!cleanCodename || cleanCodename === "VESSEL_USER") return;
    if (myProfile.avatarUrl?.includes("images.unsplash.com")) return;

    const isPartyAnchored = Boolean(activeCheckin) || isGpsHibernating;
    const nowMs = lastGpsPingAt || Date.now();

    updateMyMatrixPresence(currentUserUid, {
      id: currentUserUid,
      codename: myProfile.codename,
      age: myProfile.age || 28,
      role: myProfile.role || "Versátil",
      yoSoy: myProfile.yoSoy || "tranqui",
      mobility: myProfile.mobility || "se_desplaza",
      avatarUrl: myProfile.avatarUrl || "",
      isStylizedAvatar: !!myProfile.isStylizedAvatar,
      isFogMode: !!myProfile.isFogMode,
      bodyState: myBodyState,
      coordinates: myCoordinates,
      intensity: 3,
      statement: myProfile.intentions?.join(" · ") || "Disponible",
      verification: myProfile.verification,
      isAntiGhost: !!myProfile.isAntiGhost,
      hostCard: myHostCard,
      energyVibes: myProfile.energyVibes || [],
      desires: myProfile.desires || [],
      intentions: myProfile.intentions || [],
      boundaries: myProfile.boundaries || [],
      lastActiveAt: nowMs,
      presenceExpiresAt: computePresenceExpiry(isPartyAnchored, nowMs),
      isPartyAnchored,
      partyVenueName: activeCheckin?.venueName,
    });
  }, [
    appMode,
    currentUserUid,
    authUser,
    myProfile,
    myBodyState,
    myCoordinates,
    myHostCard.hasPlace,
    activeCheckin,
    isGpsHibernating,
    lastGpsPingAt,
  ]);

  // Timer aislado de expiración de On-The-Clock (cada 5s)
  useEffect(() => {
    if (!myOnTheClock.isActive || !myOnTheClock.expiresAt) return;
    const interval = setInterval(() => {
      const expiry = new Date(myOnTheClock.expiresAt!).getTime();
      if (Date.now() >= expiry) {
        stopOnTheClock();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [myOnTheClock.isActive, myOnTheClock.expiresAt]);

  const updateProfile = useCallback((profileId: string, updates: Partial<VesselProfile>) => {
    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p));
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const resetProfilesToDefault = useCallback(() => {
    if (appMode === "real") {
      setProfiles([]);
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, [], "real");
    } else {
      setProfiles(MOCK_PROFILES);
      saveToStorage(STORAGE_KEYS.CUSTOM_PROFILES, MOCK_PROFILES, "test");
    }
    audioEngine.playSignalSent();
  }, [appMode]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const transmitSignal = useCallback(
    (profileId: string) => {
      const nowIso = new Date().toISOString();
      setTransmissions((prev) => ({
        ...prev,
        [profileId]: (prev[profileId] || 0) + 1,
      }));
      setSentPulsesMeta((prev) => ({
        ...prev,
        [profileId]: { lastSentAt: nowIso, syncStatus: "synced" },
      }));
      audioEngine.playSignalSent();

      if (currentUserUid && currentUserUid !== "local-user") {
        const senderId = currentUserUid || "me";
        sendPulseToCloud(
          currentUserUid,
          senderId,
          profileId,
          myProfile.codename || "VESSEL_USER"
        ).catch((err) => {
          console.warn("Error enviando pulso a la nube:", err);
          setSentPulsesMeta((prev) => ({
            ...prev,
            [profileId]: { lastSentAt: nowIso, syncStatus: "queued_offline" },
          }));
        });
      }
    },
    [currentUserUid, myProfile.codename]
  );

  const returnPulse = useCallback(
    (profileId: string) => {
      const nowIso = new Date().toISOString();
      setTransmissions((prev) => ({
        ...prev,
        [profileId]: (prev[profileId] || 0) + 1,
      }));
      setSentPulsesMeta((prev) => ({
        ...prev,
        [profileId]: { lastSentAt: nowIso, syncStatus: "synced" },
      }));
      audioEngine.playSignalSent();

      let matchedPulseId: string | null = null;
      setReceivedPulses((prev) => {
        const next = prev.map((p) => {
          if (p.fromProfileId === profileId || p.fromCodename === profileId) {
            matchedPulseId = p.id;
            return { ...p, returned: true, isRead: true };
          }
          return p;
        });
        saveToStorage(STORAGE_KEYS.RECEIVED_PULSES, next);
        return next;
      });

      if (currentUserUid && currentUserUid !== "local-user") {
        const senderId = currentUserUid || "me";
        sendPulseToCloud(
          currentUserUid,
          senderId,
          profileId,
          myProfile.codename || "VESSEL_USER"
        ).catch((err) =>
          console.warn("Error devolviendo pulso a la nube:", err)
        );
        if (matchedPulseId) {
          returnPulseInCloud(matchedPulseId).catch((err) =>
            console.warn("Error marcando pulso devuelto en Firestore:", err)
          );
        }
      }
    },
    [currentUserUid, myProfile.codename]
  );

  const markPulsesAsRead = useCallback(() => {
    setReceivedPulses((prev) => {
      const hasUnread = prev.some((p) => !p.isRead);
      if (!hasUnread) return prev;
      const next = prev.map((p) => {
        if (!p.isRead && currentUserUid && currentUserUid !== "local-user") {
          markPulseReadInCloud(p.id).catch((err) =>
            console.warn("Error marcando leído en nube:", err)
          );
        }
        return { ...p, isRead: true };
      });
      saveToStorage(STORAGE_KEYS.RECEIVED_PULSES, next);
      return next;
    });
  }, [currentUserUid]);

  const clearPulse = useCallback(
    (pulseId: string) => {
      setReceivedPulses((prev) => {
        const next = prev.filter((p) => p.id !== pulseId);
        saveToStorage(STORAGE_KEYS.RECEIVED_PULSES, next);
        return next;
      });

      if (currentUserUid && currentUserUid !== "local-user") {
        clearPulseInCloud(pulseId).catch((err) =>
          console.warn("Error eliminando pulso en Firestore:", err)
        );
      }
    },
    [currentUserUid]
  );

  const hasMutualPulse = useCallback(
    (profileId: string): boolean => {
      const hasSent = (transmissions[profileId] || 0) > 0;
      const received = receivedPulses.find(
        (p) => p.fromProfileId === profileId || p.fromCodename === profileId
      );
      if (!received) return false;
      return hasSent || Boolean(received.returned);
    },
    [transmissions, receivedPulses]
  );

  const clearAllReadPulses = useCallback(() => {
    setReceivedPulses((prev) => {
      const toRemove = prev.filter(
        (p) => p.isRead && !p.returned && (transmissions[p.fromProfileId] || 0) === 0
      );
      if (toRemove.length === 0) return prev;

      if (currentUserUid && currentUserUid !== "local-user") {
        toRemove.forEach((p) => {
          clearPulseInCloud(p.id).catch((err) =>
            console.warn("Error limpiando pulso visto en nube:", err)
          );
        });
      }

      const next = prev.filter(
        (p) => !p.isRead || Boolean(p.returned) || (transmissions[p.fromProfileId] || 0) > 0
      );
      saveToStorage(STORAGE_KEYS.RECEIVED_PULSES, next);
      return next;
    });
    audioEngine.playPulse();
  }, [currentUserUid, transmissions]);

  const unreadPulsesCount = useMemo(() => {
    return receivedPulses.filter((p) => !p.isRead).length;
  }, [receivedPulses]);

  const startOnTheClock = useCallback(
    (durationMinutes: number, note?: string) => {
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      const newState: OnTheClockState = {
        isActive: true,
        expiresAt,
        durationMinutes,
        statusNote: note || (language === "es" ? "Listo ahora // Tengo lugar" : "Ready now // Hosting"),
        startedAt: new Date().toISOString(),
      };
      setMyOnTheClock(newState);
      saveToStorage(STORAGE_KEYS.ON_THE_CLOCK, newState);
      audioEngine.playSubBass(75);
    },
    [language]
  );

  const stopOnTheClock = useCallback(() => {
    const newState: OnTheClockState = {
      isActive: false,
      expiresAt: null,
      durationMinutes: 30,
    };
    setMyOnTheClock(newState);
    saveToStorage(STORAGE_KEYS.ON_THE_CLOCK, newState);
    audioEngine.playPulse();
  }, []);

  const setKinkPreference = useCallback(
    (kinkId: string, level: KinkPreferenceLevel) => {
      setMyKinkMatrix((prev) => {
        const next = { ...prev };
        if (!level || prev[kinkId] === level) {
          delete next[kinkId];
        } else {
          next[kinkId] = level;
        }
        saveToStorage(STORAGE_KEYS.KINK_MATRIX, next, appMode);
        if (currentUserUid && currentUserUid !== "local-user" && currentUserUid !== "unauthenticated") {
          saveFullUserDataToCloud(currentUserUid, { kinkMatrix: next });
        }
        return next;
      });
      audioEngine.playPulse();
    },
    [currentUserUid, appMode]
  );

  const getMutualKinkMatches = useCallback(
    (theirKinkMatrix?: KinkMatrixMap): KinkMutualMatch[] => {
      if (!theirKinkMatrix) return [];
      const matches: KinkMutualMatch[] = [];
      for (const [kinkId, myLevel] of Object.entries(myKinkMatrix)) {
        const theirLevel = theirKinkMatrix[kinkId];
        if (!theirLevel) continue;
        if ((myLevel === "love" || myLevel === "curious") && (theirLevel === "love" || theirLevel === "curious")) {
          matches.push({
            kinkId,
            myPreference: myLevel,
            theirPreference: theirLevel,
          });
        }
      }
      return matches;
    },
    [myKinkMatrix]
  );

  const setMyAmbientVibe = useCallback(
    (vibe: AmbientSoundVibeType) => {
      setMyAmbientVibeState(vibe);
      saveToStorage(STORAGE_KEYS.AMBIENT_VIBE, vibe, appMode);
      updateMyHostCard({ ambientVibe: vibe });
      if (currentUserUid && currentUserUid !== "local-user" && currentUserUid !== "unauthenticated") {
        saveFullUserDataToCloud(currentUserUid, { ambientVibe: vibe });
      }
      audioEngine.playPulse();
    },
    [updateMyHostCard, currentUserUid, appMode]
  );

  const playAmbientTonePreview = useCallback((vibe: AmbientSoundVibeType) => {
    setIsPlayingAmbientTone(true);
    audioEngine.playAmbientPreview(vibe);
  }, []);

  const stopAmbientTonePreview = useCallback(() => {
    setIsPlayingAmbientTone(false);
    audioEngine.stopAmbientPreview();
  }, []);

  const setMySubstanceAtmosphere = useCallback(
    (vibe: SubstanceAtmosphere) => {
      setMySubstanceAtmosphereState(vibe);
      saveToStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE, vibe, appMode);
      updateMyProfile({ substanceAtmosphere: vibe } as any);
      if (currentUserUid && currentUserUid !== "local-user" && currentUserUid !== "unauthenticated") {
        saveFullUserDataToCloud(currentUserUid, { substanceAtmosphere: vibe });
      }
    },
    [updateMyProfile, currentUserUid, appMode]
  );

  const processedProfiles = useMemo(() => {
    return profiles.map((p) => {
      const lat = p.coordinates?.lat ?? myCoordinates.lat;
      const lng = p.coordinates?.lng ?? myCoordinates.lng;
      const geohash = p.geohash || encodeGeohash(lat, lng, 7);
      const s2CellId = p.s2CellId || `s2-${geohash.substring(0, 4)}-${geohash.substring(4)}`;
      const rawDist = p.distanceMeters ?? (
        p.coordinates
          ? calculateHaversineDistance(myCoordinates.lat, myCoordinates.lng, lat, lng)
          : 300
      );

      const discretized = discretizeDistance(rawDist, geoPrivacyLevel);

      return {
        ...p,
        geohash,
        s2CellId,
        distanceMeters: rawDist,
        discretizedDistance: discretized,
      };
    });
  }, [profiles, myCoordinates, geoPrivacyLevel]);

  const myFullProfile: VesselProfile = useMemo(() => {
    const rawPhotos = userAlbums[0]?.photos?.map((p) => p.url) || [];
    const allPhotos = rawPhotos.length > 0 ? rawPhotos : [myProfile.avatarUrl];

    return {
      id: "me",
      codename: myProfile.codename || "VESSEL_USER",
      age: myProfile.age,
      showAge: myProfile.showAge,
      twitterHandle: myProfile.twitterHandle,
      yoSoy: myProfile.yoSoy,
      mobility: myProfile.mobility,
      hivStatus: myProfile.hivStatus,
      genderIdentity: myProfile.genderIdentity,
      pronouns: myProfile.pronouns,
      desires: myProfile.desires,
      intentions: myProfile.intentions,
      boundaries: myProfile.boundaries,
      energyVibes: myProfile.energyVibes,
      respectScore: myProfile.respectScore,
      isAntiGhost: myProfile.isAntiGhost,
      responseRateMinutes: 3,
      distanceMeters: 0,
      discretizedDistance: {
        rawMeters: 0,
        displayLabel: language === "es" ? "VOS" : "YOU",
        rangeCategory: "<50m",
        isObfuscated: false,
      },
      bodyState: myBodyState,
      role: myProfile.role,
      heightCm: myProfile.heightCm,
      weightKg: myProfile.weightKg,
      bodyArchetype: myProfile.yoSoy,
      intensity: 3,
      hosting: myProfile.mobility,
      tagline: myProfile.genderIdentity ? `${myProfile.genderIdentity} • ${myProfile.pronouns}` : "Mi Perfil en VESSEL",
      statement: "Mi ficha oficial activa en la red VESSEL.",
      avatarUrl: myProfile.avatarUrl,
      isStylizedAvatar: myProfile.isStylizedAvatar,
      isFogMode: myProfile.isFogMode,
      isCurrentUser: true,
      verification: myProfile.verification,
      totalEncountersVerified: myProfile.totalEncountersVerified || 0,
      galleryUrls: allPhotos,
      privateVault: userAlbums[1]?.photos?.map((p, idx) => ({
        id: p.id,
        url: p.url,
        blurredUrl: p.blurredUrl || p.url,
        caption: p.caption || `Bóveda privada #${idx + 1}`,
        isUnlocked: true,
      })) || [],
      testimonials: myReceivedTestimonials.filter((t) => t.status === "approved"),
      kinks: ["Leather", "Darkroom", "Sensualidad", "Raw"],
      healthStatus: {
        prep: myProfile.hivStatus.includes("PrEP"),
        testedDate: "AGO 2026",
        details: myProfile.hivStatus,
      },
      coordinates: myCoordinates,
      geohash: encodeGeohash(myCoordinates.lat, myCoordinates.lng, 7),
      s2CellId: "s2-current-user",
      hostCard: myHostCard,
      voiceVibe: myVoiceVibe || undefined,
      exitProtocol: myExitProtocol,
      isDuo: myDuoLink.isLinked,
      duoInfo: myDuoLink,
      onTheClock: myOnTheClock,
      kinkMatrix: myKinkMatrix,
      ambientVibe: myAmbientVibe,
      substanceAtmosphere: mySubstanceAtmosphere,
      isStealth: stealthMode,
    };
  }, [
    myProfile,
    myBodyState,
    userAlbums,
    mySubstanceAtmosphere,
    myReceivedTestimonials,
    myCoordinates,
    language,
    myHostCard,
    myVoiceVibe,
    myExitProtocol,
    myDuoLink,
    myOnTheClock,
    myKinkMatrix,
    myAmbientVibe,
    stealthMode,
  ]);

  const filteredProfiles = useMemo(() => {
    const otherFilteredProfiles = processedProfiles.filter((p) => {
      if (filters.bodyStates.length > 0 && !filters.bodyStates.includes(p.bodyState)) {
        return false;
      }
      if (filters.roles.length > 0 && !filters.roles.includes(p.role)) {
        return false;
      }
      if (p.intensity < filters.minIntensity) {
        return false;
      }
      if (p.distanceMeters / 1000 > filters.maxDistanceKm) {
        return false;
      }
      if (filters.immediateHostOnly && p.hosting !== "Tengo sitio") {
        return false;
      }
      if (filters.selectedKinks.length > 0) {
        const hasAnyKink = filters.selectedKinks.some((k) => p.kinks.includes(k));
        if (!hasAnyKink) return false;
      }
      if (filters.energyVibes.length > 0) {
        const hasAnyEnergy = filters.energyVibes.some((v) => p.energyVibes?.includes(v));
        if (!hasAnyEnergy) return false;
      }
      if (filters.onlyAntiGhost && !p.isAntiGhost) {
        return false;
      }
      if (filters.onlyVerified && !p.verification?.isVerified) {
        return false;
      }
      if (filters.onlyMutualKinks) {
        if (!p.kinkMatrix) return false;
        let hasMutual = false;
        for (const [kinkId, myLevel] of Object.entries(myKinkMatrix)) {
          const theirLevel = p.kinkMatrix[kinkId];
          if (theirLevel && (myLevel === "love" || myLevel === "curious") && (theirLevel === "love" || theirLevel === "curious")) {
            hasMutual = true;
            break;
          }
        }
        if (!hasMutual) return false;
      }
      if (filters.substanceAtmospheres && filters.substanceAtmospheres.length > 0) {
        if (!p.substanceAtmosphere || !filters.substanceAtmospheres.includes(p.substanceAtmosphere)) {
          return false;
        }
      }
      
      // Gender interest filtering
      const activeGenderInterests = filters.genderInterests ?? myProfile.genderInterests;
      if (!checkGenderInterestMatch(p, activeGenderInterests)) return false;

      if (filters.nightlifeEventId) {
        const ev = nightlifeEvents.find((e) => e.id === filters.nightlifeEventId);
        if (!ev || !ev.confirmedAttendees.includes(p.id)) {
          return false;
        }
      }
      if (filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const matchCodename = p.codename.toLowerCase().includes(q);
        const matchStatement = p.statement.toLowerCase().includes(q);
        const matchRole = p.role.toLowerCase().includes(q);
        const matchYoSoy = p.yoSoy.toLowerCase().includes(q);
        const matchGender = p.genderIdentity?.toLowerCase().includes(q) || false;
        const matchPronouns = p.pronouns?.toLowerCase().includes(q) || false;
        const matchDesire = p.desires?.some((d) => d.toLowerCase().includes(q)) || false;
        const matchIntention = p.intentions?.some((i) => i.toLowerCase().includes(q)) || false;
        const customAlias = profileDossiers[p.id]?.customAlias?.toLowerCase() || "";
        const matchAlias = customAlias.includes(q);
        const matchNotes = profileDossiers[p.id]?.privateNotes?.toLowerCase()?.includes(q) || false;
        if (
          !matchCodename &&
          !matchStatement &&
          !matchRole &&
          !matchYoSoy &&
          !matchGender &&
          !matchPronouns &&
          !matchDesire &&
          !matchIntention &&
          !matchAlias &&
          !matchNotes
        ) {
          return false;
        }
      }

      if (filters.onlyFavorites && !favoriteProfileIds.includes(p.id) && !p.isCurrentUser) {
        return false;
      }

      if (isOnTheClockFilterActive && !p.onTheClock?.isActive && !p.isCurrentUser) {
        return false;
      }

      if (boundaries[p.id]?.radarVisibility === "hidden") {
        return false;
      }

      if (p.isStealth && !p.isCurrentUser) {
        return false;
      }

      return true;
    });

    const hasValidRealSelfCard =
      appMode === "test" ||
      Boolean(
        authUser &&
          !authUser.isAnonymous &&
          !authUser.email?.endsWith("@vessel.dev") &&
          myProfile.codename &&
          myProfile.codename.trim().toUpperCase() !== "VESSEL_USER" &&
          !myProfile.avatarUrl?.includes("images.unsplash.com")
      );

    return hasValidRealSelfCard ? [myFullProfile, ...otherFilteredProfiles] : otherFilteredProfiles;
  }, [processedProfiles, filters, profileDossiers, boundaries, myFullProfile, myKinkMatrix, nightlifeEvents, isOnTheClockFilterActive, myProfile, favoriteProfileIds, appMode, authUser]);

  const value = useMemo<RadarMatrixContextType>(
    () => ({
      profiles: processedProfiles,
      updateProfile,
      resetProfilesToDefault,
      filteredProfiles,
      filters,
      setFilters,
      resetFilters,
      activeView,
      setActiveView,
      selectedProfile,
      setSelectedProfile,
      transmissions,
      sentPulsesMeta,
      transmitSignal,
      receivedPulses,
      returnPulse,
      markPulsesAsRead,
      clearPulse,
      clearAllReadPulses,
      unreadPulsesCount,
      isFilterDrawerOpen,
      setIsFilterDrawerOpen,
      myOnTheClock,
      startOnTheClock,
      stopOnTheClock,
      isOnTheClockFilterActive,
      setIsOnTheClockFilterActive,
      myKinkMatrix,
      setKinkPreference,
      getMutualKinkMatches,
      myAmbientVibe,
      setMyAmbientVibe,
      isPlayingAmbientTone,
      playAmbientTonePreview,
      stopAmbientTonePreview,
      mySubstanceAtmosphere,
      setMySubstanceAtmosphere,
      myFullProfile,
      hasMutualPulse,
      matrixTab,
      setMatrixTab,
      favoriteProfileIds,
      toggleFavoriteProfile,
      isFavoriteProfile,
    }),
    [
      processedProfiles,
      updateProfile,
      resetProfilesToDefault,
      filteredProfiles,
      filters,
      resetFilters,
      activeView,
      selectedProfile,
      transmissions,
      sentPulsesMeta,
      transmitSignal,
      receivedPulses,
      returnPulse,
      markPulsesAsRead,
      clearPulse,
      clearAllReadPulses,
      unreadPulsesCount,
      isFilterDrawerOpen,
      myOnTheClock,
      startOnTheClock,
      stopOnTheClock,
      isOnTheClockFilterActive,
      myKinkMatrix,
      setKinkPreference,
      getMutualKinkMatches,
      myAmbientVibe,
      setMyAmbientVibe,
      isPlayingAmbientTone,
      playAmbientTonePreview,
      stopAmbientTonePreview,
      mySubstanceAtmosphere,
      setMySubstanceAtmosphere,
      myFullProfile,
      hasMutualPulse,
      matrixTab,
      setMatrixTab,
      favoriteProfileIds,
      toggleFavoriteProfile,
      isFavoriteProfile,
    ]
  );

  return <RadarMatrixContext.Provider value={value}>{children}</RadarMatrixContext.Provider>;
};

export const useRadarMatrix = (): RadarMatrixContextType => {
  const context = useContext(RadarMatrixContext);
  if (!context) {
    throw new Error("useRadarMatrix must be used within a RadarMatrixProvider");
  }
  return context;
};
