"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AppSettings,
  SupportedLanguage,
  UnitSystem,
  UserSubscriptionTier,
  UserAlbum,
  AlbumPhoto,
  AlbumPrivacy,
  WeekendPassState,
} from "@/types/vessel";
import { getTranslations, formatDistance, TranslationType } from "@/lib/i18n/translations";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
  AppMode,
  getActiveAppMode,
  setActiveAppMode,
  clearModeStorage,
} from "@/lib/storage/localStorageSync";
import { getFromIdb } from "@/lib/storage/indexedDbSync";
import { onAuthChange } from "@/lib/firebase/authService";
import {
  subscribeToUserAlbums,
  saveCloudAlbum,
  deleteCloudAlbum,
  addMediaToCloudAlbum,
} from "@/lib/firebase/albumService";
import { saveFullUserDataToCloud } from "@/lib/firebase/userDataService";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";
export { FREE_TIER_LIMITS };
export type { AppMode };

const INITIAL_MY_ALBUMS: UserAlbum[] = [
  {
    id: "album-pub-01",
    title: "Galería Pública Principal",
    description: "Fotos visibles para todos en el radar y la matriz.",
    privacy: "public",
    coverUrl: undefined,
    createdAt: "Hoy",
    photos: [],
  },
];

const INITIAL_APP_SETTINGS: AppSettings = {
  language: "es",
  unitSystem: "metric",
  cloudSyncEnabled: true,
  lastCloudSyncAt: "Hoy",
  autoBackupEnabled: true,
  lastBackupAt: "Hoy",
  soundEnabled: true,
  hapticFeedbackEnabled: true,
  highPrecisionGps: true,
  antiTriangulationStrict: false,
};

const INITIAL_WEEKEND_PASS: WeekendPassState = {
  isActive: false,
  expiresAt: null,
};

export interface SettingsContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  resetModeData: () => void;
  cleanupUserSessionData: () => void;
  appSettings: AppSettings;
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (unit: UnitSystem) => void;
  t: TranslationType;
  formatDist: (meters: number) => string;
  isSyncingCloud: boolean;
  syncCloudNow: () => Promise<void>;
  exportBackupData: () => string;
  isAppSettingsModalOpen: boolean;
  setIsAppSettingsModalOpen: (open: boolean) => void;
  openAppSettingsModal: () => void;
  closeAppSettingsModal: () => void;
  userPlan: UserSubscriptionTier;
  setUserPlan: (plan: UserSubscriptionTier) => void;
  userAlbums: UserAlbum[];
  createAlbum: (data: {
    title: string;
    description?: string;
    privacy: AlbumPrivacy;
    coverUrl?: string;
    photos?: AlbumPhoto[];
  }) => { success: boolean; error?: string };
  deleteAlbum: (albumId: string) => void;
  updateAlbum: (albumId: string, updates: Partial<UserAlbum>) => void;
  addPhotoToAlbum: (
    albumId: string,
    photo: {
      id?: string;
      url: string;
      blurredUrl?: string;
      caption?: string;
      mediaType?: "photo" | "video";
      durationSeconds?: number;
      thumbnailUrl?: string;
      isUploading?: boolean;
      uploadProgress?: number;
    }
  ) => void;
  updatePhotoInAlbum: (
    albumId: string,
    photoId: string,
    updates: Partial<AlbumPhoto>
  ) => void;
  removePhotoFromAlbum: (albumId: string, photoId: string) => void;
  setProfileCoverPhoto: (photoUrl: string) => void;
  registerAlbumSharedWith: (albumId: string, profileId: string) => void;
  unregisterAlbumSharedWith: (albumId: string, profileId: string) => void;
  unshareAlbumGlobally: (albumId: string) => void;
  isUnlimitedModalOpen: boolean;
  openUnlimitedModal: () => void;
  closeUnlimitedModal: () => void;
  weekendPass: WeekendPassState;
  activateWeekendPass: () => void;
  isUnlimited: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
  onAvatarUpdated?: (url: string) => void;
  getBackupPayload?: () => Record<string, unknown>;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  onAvatarUpdated,
  getBackupPayload,
}) => {
  const [appMode, setAppModeState] = useState<AppMode>(getActiveAppMode);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [language, setLanguageState] = useState<SupportedLanguage>("es");
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>("metric");
  const [isAppSettingsModalOpen, setIsAppSettingsModalOpen] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const [userPlan, setUserPlanState] = useState<UserSubscriptionTier>("free");
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>(() =>
    getActiveAppMode() === "real" ? [] : INITIAL_MY_ALBUMS
  );
  const [isUnlimitedModalOpen, setIsUnlimitedModalOpen] = useState(false);
  const [weekendPass, setWeekendPass] = useState<WeekendPassState>(INITIAL_WEEKEND_PASS);

  const [currentUserUid, setCurrentUserUid] = useState<string>("local-user");
  const uidRef = useRef<string>("local-user");
  uidRef.current = currentUserUid;

  // Escuchar ciclo de autenticación para sincronización en la nube
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      const uid = user ? user.uid : "local-user";
      setCurrentUserUid(uid);
      uidRef.current = uid;
      if (!user) {
        const defaultAlbums = getActiveAppMode() === "real" ? [] : INITIAL_MY_ALBUMS;
        setUserAlbums(defaultAlbums);
        setUserPlanState("free");
      }
    });
    return () => unsub();
  }, []);

  // Suscripción en tiempo real a álbumes de Firestore
  useEffect(() => {
    if (!currentUserUid || currentUserUid === "local-user") return;

    const unsubscribe = subscribeToUserAlbums(currentUserUid, (cloudAlbums) => {
      if (cloudAlbums && cloudAlbums.length > 0) {
        setUserAlbums(cloudAlbums);
        saveToStorage(STORAGE_KEYS.ALBUMS, cloudAlbums);
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  // Hidratación segura local-first
  useEffect(() => {
    const localSettings = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_APP_SETTINGS);
    if (localSettings) {
      setAppSettings(localSettings);
      if (localSettings.language) setLanguageState(localSettings.language);
      if (localSettings.unitSystem) setUnitSystemState(localSettings.unitSystem);
    }

    const localPlan = loadFromStorage<UserSubscriptionTier>(STORAGE_KEYS.PLAN, "free");
    if (localPlan !== "free") setUserPlanState(localPlan);

    const rawAlbums = loadFromStorage<UserAlbum[]>(STORAGE_KEYS.ALBUMS, INITIAL_MY_ALBUMS);
    const cleanAlbums = (rawAlbums || []).map((a) => ({
      ...a,
      photos: (a.photos || []).map((p) => ({
        ...p,
        isUploading: false,
        uploadProgress: undefined,
      })),
    }));
    if (cleanAlbums && cleanAlbums.length > 0) setUserAlbums(cleanAlbums);

    // Hidratación complementaria desde IndexedDB para medios de alta fidelidad
    getFromIdb<UserAlbum[]>(STORAGE_KEYS.ALBUMS, []).then((idbAlbums) => {
      if (idbAlbums && idbAlbums.length > 0) {
        setUserAlbums((prev) => {
          // Si IndexedDB tiene fotos completas preservadas sin truncar
          if (prev.length <= INITIAL_MY_ALBUMS.length) {
            return idbAlbums;
          }
          return prev;
        });
      }
    });

    const localWeekendPass = loadFromStorage<WeekendPassState>(STORAGE_KEYS.WEEKEND_PASS, INITIAL_WEEKEND_PASS);
    if (localWeekendPass && localWeekendPass.expiresAt && new Date(localWeekendPass.expiresAt).getTime() > Date.now()) {
      setWeekendPass(localWeekendPass);
      setUserPlanState("unlimited");
    }
  }, [appMode]);

  const setAppMode = useCallback((newMode: AppMode) => {
    setActiveAppMode(newMode);
    setAppModeState(newMode);
    audioEngine.playVaultUnlock();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", newMode);
      window.location.href = url.toString();
    }
  }, []);

  const resetModeData = useCallback(() => {
    clearModeStorage(appMode);
    audioEngine.playStateSwitch("dormant");
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [appMode]);

  const cleanupUserSessionData = useCallback(() => {
    const defaultAlbums = appMode === "real" ? [] : INITIAL_MY_ALBUMS;
    setUserAlbums(defaultAlbums);
    setUserPlanState("free");
    removeFromStorage(STORAGE_KEYS.ALBUMS, appMode);
    removeFromStorage(STORAGE_KEYS.ALBUMS);
    removeFromStorage(STORAGE_KEYS.PLAN, appMode);
    removeFromStorage(STORAGE_KEYS.PLAN);
  }, [appMode]);

  // Sincronizar reactivamente el atributo lang del documento con el idioma activo
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Sincronizar reactivamente el motor acústico y háptico con las preferencias del usuario
  useEffect(() => {
    audioEngine.setMuted(!appSettings.soundEnabled);
    audioEngine.setHapticsEnabled(appSettings.hapticFeedbackEnabled ?? true);
  }, [appSettings.soundEnabled, appSettings.hapticFeedbackEnabled]);

  const t = useMemo(() => getTranslations(language), [language]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    setAppSettings((prev) => {
      const next = { ...prev, language: newLang };
      saveToStorage(STORAGE_KEYS.SETTINGS, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const setUnitSystem = useCallback((newUnit: UnitSystem) => {
    setUnitSystemState(newUnit);
    setAppSettings((prev) => {
      const next = { ...prev, unitSystem: newUnit };
      saveToStorage(STORAGE_KEYS.SETTINGS, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const updateAppSettings = useCallback((updates: Partial<AppSettings>) => {
    setAppSettings((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(STORAGE_KEYS.SETTINGS, next);
      return next;
    });
  }, []);

  const formatDist = useCallback(
    (meters: number): string => {
      return formatDistance(meters, unitSystem);
    },
    [unitSystem]
  );

  const openAppSettingsModal = useCallback(() => {
    setIsAppSettingsModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeAppSettingsModal = useCallback(() => {
    setIsAppSettingsModalOpen(false);
  }, []);

  const openUnlimitedModal = useCallback(() => {
    setIsUnlimitedModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeUnlimitedModal = useCallback(() => {
    setIsUnlimitedModalOpen(false);
  }, []);

  const setUserPlan = useCallback((plan: UserSubscriptionTier) => {
    setUserPlanState(plan);
    saveToStorage(STORAGE_KEYS.PLAN, plan);
    audioEngine.playSignalSent();
  }, []);

  const activateWeekendPass = useCallback(() => {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const pass: WeekendPassState = {
      isActive: true,
      expiresAt,
    };
    setWeekendPass(pass);
    saveToStorage(STORAGE_KEYS.WEEKEND_PASS, pass);
    setUserPlanState("unlimited");
    saveToStorage(STORAGE_KEYS.PLAN, "unlimited");
    audioEngine.playSubBass(80);
  }, []);

  const isUnlimited = useMemo(
    () => userPlan === "unlimited" || userPlan === "pro" || weekendPass?.isActive,
    [userPlan, weekendPass]
  );

  const syncCloudNow = useCallback(async () => {
    setIsSyncingCloud(true);
    try {
      if (uidRef.current && uidRef.current !== "local-user") {
        const customPayload = getBackupPayload ? getBackupPayload() : {};
        await saveFullUserDataToCloud(uidRef.current, {
          albums: userAlbums,
          appSettings: appSettings,
          ...customPayload,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const now = `Hoy ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      updateAppSettings({ lastCloudSyncAt: now });
      audioEngine.playSignalSent();
    } catch (err) {
      console.warn("Error en syncCloudNow:", err);
    } finally {
      setIsSyncingCloud(false);
    }
  }, [userAlbums, appSettings, getBackupPayload, updateAppSettings]);

  const exportBackupData = useCallback(() => {
    const customPayload = getBackupPayload ? getBackupPayload() : {};
    const backup = {
      version: "vessel-e2e-v1",
      exportedAt: new Date().toISOString(),
      userAlbums,
      settings: appSettings,
      ...customPayload,
    };
    return JSON.stringify(backup, null, 2);
  }, [userAlbums, appSettings, getBackupPayload]);

  const createAlbum = useCallback(
    (data: {
      title: string;
      description?: string;
      privacy: AlbumPrivacy;
      coverUrl?: string;
      photos?: AlbumPhoto[];
    }): { success: boolean; error?: string } => {
      if (userPlan === "free") {
        const existingCount = userAlbums.filter((a) => a.privacy === data.privacy).length;
        const maxAllowed =
          data.privacy === "public"
            ? FREE_TIER_LIMITS.maxPublicAlbums
            : FREE_TIER_LIMITS.maxPrivateAlbums;

        if (existingCount >= maxAllowed) {
          return {
            success: false,
            error: `Límite de versión gratuita alcanzado: solo puedes tener ${maxAllowed} álbum ${
              data.privacy === "public" ? "público" : "privado (Bóveda)"
            }. Elimina el existente o mejora tu suscripción.`,
          };
        }
      }

      const defaultCover =
        data.coverUrl ||
        (data.photos && data.photos.length > 0 ? data.photos[0].url : undefined) ||
        (data.privacy === "public"
          ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80");

      const newAlbum: UserAlbum = {
        id: `album-${Date.now()}`,
        title: data.title.trim() || (data.privacy === "public" ? "Nuevo Álbum Público" : "Bóveda Privada"),
        description: data.description?.trim() || "",
        privacy: data.privacy,
        coverUrl: defaultCover,
        photos: data.photos || [],
        createdAt: "Hoy",
      };

      const nextAlbums = [newAlbum, ...userAlbums];
      setUserAlbums(nextAlbums);
      saveToStorage(STORAGE_KEYS.ALBUMS, nextAlbums);

      if (uidRef.current && uidRef.current !== "local-user") {
        saveCloudAlbum(uidRef.current, newAlbum).catch((err) =>
          console.warn("Fallo al guardar álbum en Firestore:", err)
        );
      }

      audioEngine.playSignalSent();
      return { success: true };
    },
    [userPlan, userAlbums]
  );

  const deleteAlbum = useCallback((albumId: string) => {
    const nextAlbums = userAlbums.filter((a) => a.id !== albumId);
    setUserAlbums(nextAlbums);
    saveToStorage(STORAGE_KEYS.ALBUMS, nextAlbums);

    if (uidRef.current && uidRef.current !== "local-user") {
      deleteCloudAlbum(uidRef.current, albumId).catch((err) =>
        console.warn("Fallo al eliminar álbum en Firestore:", err)
      );
    }

    audioEngine.playStateSwitch("dormant");
  }, [userAlbums]);

  const updateAlbum = useCallback((albumId: string, updates: Partial<UserAlbum>) => {
    const nextAlbums = userAlbums.map((a) => (a.id === albumId ? { ...a, ...updates } : a));
    setUserAlbums(nextAlbums);
    saveToStorage(STORAGE_KEYS.ALBUMS, nextAlbums);
  }, [userAlbums]);

  const registerAlbumSharedWith = useCallback((albumId: string, profileId: string) => {
    setUserAlbums((prev) => {
      const next = prev.map((a) => {
        if (a.id === albumId) {
          const currentShared = a.sharedWithProfileIds || [];
          if (!currentShared.includes(profileId)) {
            const updated: UserAlbum = { ...a, sharedWithProfileIds: [...currentShared, profileId] };
            if (uidRef.current && uidRef.current !== "local-user") {
              saveCloudAlbum(uidRef.current, updated).catch((err) =>
                console.warn("Fallo al sincronizar sharedWithProfileIds en Firestore:", err)
              );
            }
            return updated;
          }
        }
        return a;
      });
      saveToStorage(STORAGE_KEYS.ALBUMS, next);
      return next;
    });
  }, []);

  const unregisterAlbumSharedWith = useCallback((albumId: string, profileId: string) => {
    setUserAlbums((prev) => {
      const next = prev.map((a) => {
        if (a.id === albumId && a.sharedWithProfileIds?.includes(profileId)) {
          const updated: UserAlbum = {
            ...a,
            sharedWithProfileIds: a.sharedWithProfileIds.filter((p) => p !== profileId),
          };
          if (uidRef.current && uidRef.current !== "local-user") {
            saveCloudAlbum(uidRef.current, updated).catch((err) =>
              console.warn("Fallo al des-sincronizar sharedWithProfileIds en Firestore:", err)
            );
          }
          return updated;
        }
        return a;
      });
      saveToStorage(STORAGE_KEYS.ALBUMS, next);
      return next;
    });
  }, []);

  const unshareAlbumGlobally = useCallback((albumId: string) => {
    setUserAlbums((prev) => {
      const next = prev.map((a) => {
        if (a.id === albumId) {
          const updated: UserAlbum = { ...a, sharedWithProfileIds: [] };
          if (uidRef.current && uidRef.current !== "local-user") {
            saveCloudAlbum(uidRef.current, updated).catch((err) =>
              console.warn("Fallo al revocar sharedWithProfileIds en Firestore:", err)
            );
          }
          return updated;
        }
        return a;
      });
      saveToStorage(STORAGE_KEYS.ALBUMS, next);
      return next;
    });
  }, []);

  const addPhotoToAlbum = useCallback(
    (
      albumId: string,
      photo: {
        id?: string;
        url: string;
        blurredUrl?: string;
        caption?: string;
        mediaType?: "photo" | "video";
        durationSeconds?: number;
        thumbnailUrl?: string;
        isUploading?: boolean;
        uploadProgress?: number;
      }
    ) => {
      const newPhoto: AlbumPhoto = {
        id: photo.id || `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        url: photo.url,
        blurredUrl: photo.blurredUrl || photo.url,
        caption: photo.caption,
        mediaType: photo.mediaType || "photo",
        durationSeconds: photo.durationSeconds,
        thumbnailUrl: photo.thumbnailUrl,
        isUploading: photo.isUploading,
        uploadProgress: photo.uploadProgress,
        createdAt: "Ahora",
      };

      setUserAlbums((prev) => {
        const next = prev.map((a) => {
          if (a.id === albumId) {
            const updatedPhotos = [...a.photos, newPhoto];
            return {
              ...a,
              coverUrl: a.coverUrl || newPhoto.thumbnailUrl || newPhoto.url,
              photos: updatedPhotos,
            };
          }
          return a;
        });

        // Auto-asignación de avatar si es la primera foto pública
        const allPublicPhotos = next
          .filter((a) => a.privacy === "public")
          .flatMap((a) => a.photos)
          .filter((p) => p.mediaType !== "video");

        if (allPublicPhotos.length === 1 && newPhoto.mediaType !== "video" && !newPhoto.isUploading && onAvatarUpdated) {
          onAvatarUpdated(newPhoto.url);
        }

        if (!newPhoto.isUploading) {
          saveToStorage(STORAGE_KEYS.ALBUMS, next);
          if (uidRef.current && uidRef.current !== "local-user") {
            addMediaToCloudAlbum(uidRef.current, albumId, newPhoto).catch((err) =>
              console.warn("Fallo al agregar media a álbum en Firestore:", err)
            );
          }
        }
        return next;
      });
      audioEngine.playPulse();
    },
    [onAvatarUpdated]
  );

  const updatePhotoInAlbum = useCallback(
    (albumId: string, photoId: string, updates: Partial<AlbumPhoto>) => {
      setUserAlbums((prev) => {
        const next = prev.map((a) => {
          if (a.id === albumId) {
            const updatedPhotos = a.photos.map((p) =>
              p.id === photoId ? { ...p, ...updates } : p
            );
            return {
              ...a,
              coverUrl: updatedPhotos.length > 0 ? updatedPhotos[0].url : undefined,
              photos: updatedPhotos,
            };
          }
          return a;
        });
        saveToStorage(STORAGE_KEYS.ALBUMS, next);
        return next;
      });
    },
    []
  );

  const removePhotoFromAlbum = useCallback((albumId: string, photoId: string) => {
    setUserAlbums((prev) => {
      const next = prev.map((a) => {
        if (a.id === albumId) {
          const updatedPhotos = a.photos.filter((p) => p.id !== photoId);
          return {
            ...a,
            coverUrl: updatedPhotos.length > 0 ? updatedPhotos[0].url : undefined,
            photos: updatedPhotos,
          };
        }
        return a;
      });
      saveToStorage(STORAGE_KEYS.ALBUMS, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const setProfileCoverPhoto = useCallback((photoUrl: string) => {
    setUserAlbums((prev) => {
      const publicAlbum = prev.find((a) => a.privacy === "public");
      if (!publicAlbum) return prev;
      const next = prev.map((a) =>
        a.id === publicAlbum.id ? { ...a, coverUrl: photoUrl } : a
      );
      saveToStorage(STORAGE_KEYS.ALBUMS, next);
      return next;
    });
    if (onAvatarUpdated) {
      onAvatarUpdated(photoUrl);
    }
    audioEngine.playSignalSent();
  }, [onAvatarUpdated]);

  const value = useMemo<SettingsContextType>(
    () => ({
      appMode,
      setAppMode,
      resetModeData,
      cleanupUserSessionData,
      appSettings,
      updateAppSettings,
      language,
      setLanguage,
      unitSystem,
      setUnitSystem,
      t,
      formatDist,
      isSyncingCloud,
      syncCloudNow,
      exportBackupData,
      isAppSettingsModalOpen,
      setIsAppSettingsModalOpen,
      openAppSettingsModal,
      closeAppSettingsModal,
      userPlan,
      setUserPlan,
      userAlbums,
      createAlbum,
      deleteAlbum,
      updateAlbum,
      addPhotoToAlbum,
      updatePhotoInAlbum,
      removePhotoFromAlbum,
      setProfileCoverPhoto,
      registerAlbumSharedWith,
      unregisterAlbumSharedWith,
      unshareAlbumGlobally,
      isUnlimitedModalOpen,
      openUnlimitedModal,
      closeUnlimitedModal,
      weekendPass,
      activateWeekendPass,
      isUnlimited,
    }),
    [
      appMode,
      setAppMode,
      resetModeData,
      cleanupUserSessionData,
      appSettings,
      updateAppSettings,
      language,
      setLanguage,
      unitSystem,
      setUnitSystem,
      t,
      formatDist,
      isSyncingCloud,
      syncCloudNow,
      exportBackupData,
      isAppSettingsModalOpen,
      openAppSettingsModal,
      closeAppSettingsModal,
      userPlan,
      setUserPlan,
      userAlbums,
      createAlbum,
      deleteAlbum,
      updateAlbum,
      registerAlbumSharedWith,
      unregisterAlbumSharedWith,
      unshareAlbumGlobally,
      addPhotoToAlbum,
      updatePhotoInAlbum,
      removePhotoFromAlbum,
      setProfileCoverPhoto,
      isUnlimitedModalOpen,
      openUnlimitedModal,
      closeUnlimitedModal,
      weekendPass,
      activateWeekendPass,
      isUnlimited,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
