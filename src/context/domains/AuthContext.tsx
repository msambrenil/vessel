"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { User } from "firebase/auth";
import {
  BodyState,
  YoSoyType,
  MobilityType,
  HivStatusType,
  RoleType,
  EnergyVibe,
  IdentityVerification,
  VerificationMethod,
  GenderInterest,
  UserSubscriptionTier,
  SubstanceAtmosphere,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  loginWithGoogle as authLoginWithGoogle,
  loginWithEmail as authLoginWithEmail,
  registerWithEmail as authRegisterWithEmail,
  resetPassword as authResetPassword,
  signInAsGuest as authSignInAsGuest,
  linkGuestWithGoogle as authLinkGuestWithGoogle,
  linkGuestWithEmail as authLinkGuestWithEmail,
  logoutUser as authLogoutUser,
  onAuthChange,
  AuthActionResult,
} from "@/lib/firebase/authService";
import { saveFullUserDataToCloud, subscribeToFullUserData } from "@/lib/firebase/userDataService";
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from "@/lib/storage/localStorageSync";
import { useSettings } from "./SettingsContext";
import { subscribeToSystemControl } from "@/lib/version/systemControlService";

export interface MyProfileState {
  codename: string;
  age: number;
  showAge: boolean;
  twitterHandle: string;
  instagramHandle?: string;
  telegramHandle?: string;
  yoSoy: YoSoyType;
  mobility: MobilityType;
  hivStatus: HivStatusType;
  genderIdentity: string;
  genderInterests?: GenderInterest[];
  pronouns: string;
  desires: string[];
  intentions: string[];
  boundaries: string[];
  energyVibes: EnergyVibe[];
  noGhostMode: boolean;
  respectScore: number;
  isAntiGhost: boolean;
  role: RoleType;
  heightCm: number;
  weightKg: number;
  avatarUrl: string;
  isStylizedAvatar: boolean;
  isFogMode: boolean;
  verification: IdentityVerification;
  totalEncountersVerified: number;
  authProvider?: "google" | "direct" | "email";
  phone?: string;
  email?: string;
  seekingRoles?: RoleType[];
  isProfileSetupComplete?: boolean;
  isProfileCustomized?: boolean;
  isBetaTester?: boolean;
  substanceAtmosphere?: SubstanceAtmosphere;
}

export const INITIAL_MY_PROFILE: MyProfileState = {
  codename: "VESSEL_USER",
  age: 28,
  showAge: true,
  twitterHandle: "",
  instagramHandle: "",
  telegramHandle: "",
  yoSoy: "Musculoso / Gym",
  mobility: "Tengo depto / lugar",
  hivStatus: "Negativo en PrEP",
  genderIdentity: "Hombre Cis",
  genderInterests: ["all"],
  pronouns: "Él",
  desires: [
    "Conexión carnal al palo",
    "Exploración fetiche & morbo",
    "Mimos, besos y calentura lenta",
  ],
  intentions: [
    "Pinta algo ya (Inmediato)",
    "Chongo fijo / Vernos seguido",
  ],
  boundaries: [
    "Siempre con forro / Cuidado mutuo",
    "Respeto total a la palabra de seguridad",
  ],
  energyVibes: ["fogoso", "kinky"],
  noGhostMode: true,
  respectScore: 100,
  isAntiGhost: true,
  role: "Versatile",
  heightCm: 180,
  weightKg: 78,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  isStylizedAvatar: true,
  isFogMode: false,
  verification: {
    isVerified: false,
    method: undefined,
    verifiedAt: "",
    hasFacialPrivacy: false,
    badgeLabel: "NO VERIFICADO",
    trustScore: 0,
  },
  totalEncountersVerified: 0,
  authProvider: "direct",
};

export const CLEAN_UNAUTHENTICATED_PROFILE: MyProfileState = {
  codename: "",
  age: 0,
  showAge: true,
  twitterHandle: "",
  instagramHandle: "",
  telegramHandle: "",
  yoSoy: "" as YoSoyType,
  mobility: "" as MobilityType,
  hivStatus: "" as HivStatusType,
  genderIdentity: "",
  genderInterests: [],
  pronouns: "",
  desires: [],
  intentions: [],
  boundaries: [],
  energyVibes: [],
  noGhostMode: true,
  respectScore: 100,
  isAntiGhost: true,
  role: "" as RoleType,
  heightCm: 0,
  weightKg: 0,
  avatarUrl: "",
  isStylizedAvatar: false,
  isFogMode: false,
  isProfileCustomized: false,
  verification: {
    isVerified: false,
    method: undefined,
    verifiedAt: "",
    hasFacialPrivacy: false,
    badgeLabel: "NO VERIFICADO",
    trustScore: 0,
  },
  totalEncountersVerified: 0,
  authProvider: "direct",
};

export interface AuthContextType {
  authUser: User | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isCloudConnected: boolean;
  currentUserUid: string;
  myProfile: MyProfileState;
  updateMyProfile: (updates: Partial<MyProfileState>) => void;
  toggleNoGhostMode: () => void;
  toggleFogMode: () => void;
  myBodyState: BodyState;
  setMyBodyState: (state: BodyState) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register" | "forgot_password" | "link" | "verify" | "session";
  openAuthModal: (mode?: "login" | "register" | "forgot_password" | "link" | "verify" | "session") => void;
  closeAuthModal: () => void;
  isGenderOnboardingOpen: boolean;
  setIsGenderOnboardingOpen: (open: boolean) => void;
  openGenderOnboarding: () => void;
  closeGenderOnboarding: () => void;
  loginWithGoogle: () => Promise<AuthActionResult>;
  loginWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  registerWithEmail: (
    email: string,
    password: string,
    codename: string,
    role?: string,
    phone?: string
  ) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  linkAccountWithGoogle: () => Promise<AuthActionResult>;
  linkAccountWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  loginAsGuest: () => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  verifyIdentity: (data: {
    method: VerificationMethod;
    avatarUrl: string;
    isStylizedAvatar: boolean;
    isFogMode?: boolean;
    authProvider?: "google" | "direct" | "email";
    codename?: string;
  }) => void;
  removeVerification: () => void;
  updateUserAvatar: (url: string, isStylized: boolean, isFogMode?: boolean) => void;
  isLivenessModalOpen: boolean;
  openLivenessModal: () => void;
  closeLivenessModal: () => void;
  completeLivenessVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  onLogoutCleanup?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onLogoutCleanup }) => {
  const { language, appMode, cleanupUserSessionData } = useSettings();

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  const isAuthenticated = useMemo(() => {
    return !!authUser && !authUser.isAnonymous;
  }, [authUser]);

  const isAnonymous = useMemo(() => {
    return !authUser || !!authUser.isAnonymous;
  }, [authUser]);

  const [currentUserUid, setCurrentUserUid] = useState<string>(() =>
    appMode === "real" ? "unauthenticated" : "local-user"
  );
  const uidRef = useRef<string>(appMode === "real" ? "unauthenticated" : "local-user");
  uidRef.current = currentUserUid;

  const [myProfile, setMyProfile] = useState<MyProfileState>(() =>
    appMode === "real" ? CLEAN_UNAUTHENTICATED_PROFILE : INITIAL_MY_PROFILE
  );
  const [myBodyState, setMyBodyStateInternal] = useState<BodyState>("open");

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<
    "login" | "register" | "forgot_password" | "link" | "verify" | "session"
  >("login");
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);
  const [isGenderOnboardingOpen, setIsGenderOnboardingOpen] = useState(false);

  const openGenderOnboarding = useCallback(() => setIsGenderOnboardingOpen(true), []);
  const closeGenderOnboarding = useCallback(() => setIsGenderOnboardingOpen(false), []);

  const lastAuthUidRef = useRef<string>("");

  // Helper para detectar si un perfil tenía cargada una plantilla de muestra vieja sin personalizar
  const sanitizeLegacyTemplateProfile = useCallback(
    (prof: Partial<MyProfileState>, fallbackPhotoUrl?: string): MyProfileState => {
      const isLegacyTemplate =
        !prof.isProfileCustomized &&
        ((prof.age === 26 && prof.heightCm === 178 && prof.weightKg === 75) ||
          (prof.age === 28 && prof.heightCm === 180 && prof.weightKg === 78) ||
          (prof.age === 25 && prof.heightCm === 175 && prof.weightKg === 70));

      if (isLegacyTemplate) {
        return {
          ...CLEAN_UNAUTHENTICATED_PROFILE,
          ...prof,
          age: 0,
          yoSoy: "" as YoSoyType,
          mobility: "" as MobilityType,
          hivStatus: "" as HivStatusType,
          genderIdentity: "",
          genderInterests: [],
          pronouns: "",
          desires: [],
          intentions: [],
          boundaries: [],
          energyVibes: [],
          heightCm: 0,
          weightKg: 0,
          codename: prof.codename === "VESSEL_USER" ? "" : (prof.codename || ""),
          avatarUrl: prof.avatarUrl?.includes("images.unsplash.com")
            ? (fallbackPhotoUrl || "")
            : (prof.avatarUrl || fallbackPhotoUrl || ""),
        };
      }

      return {
        ...CLEAN_UNAUTHENTICATED_PROFILE,
        ...prof,
        codename: prof.codename === "VESSEL_USER" ? "" : (prof.codename || ""),
        avatarUrl: prof.avatarUrl?.includes("images.unsplash.com")
          ? (fallbackPhotoUrl || "")
          : (prof.avatarUrl || fallbackPhotoUrl || ""),
      };
    },
    []
  );

  // Sincronización reactiva cuando cambia el appMode
  useEffect(() => {
    if (appMode === "real") {
      if (!authUser || authUser.email?.endsWith("@vessel.dev") || authUser.isAnonymous) {
        if (authUser?.email?.endsWith("@vessel.dev") || authUser?.isAnonymous) {
          authLogoutUser().catch(() => {});
        }
        setMyProfile(CLEAN_UNAUTHENTICATED_PROFILE);
      } else {
        const localProfile = loadFromStorage<MyProfileState>(
          STORAGE_KEYS.PROFILE,
          CLEAN_UNAUTHENTICATED_PROFILE,
          "real"
        );
        if (localProfile) {
          const cleaned = sanitizeLegacyTemplateProfile(localProfile, authUser.photoURL || "");
          setMyProfile(cleaned);
          saveToStorage(STORAGE_KEYS.PROFILE, cleaned, "real");
        }
      }
    } else {
      const localProfile = loadFromStorage<MyProfileState>(
        STORAGE_KEYS.PROFILE,
        INITIAL_MY_PROFILE,
        "test"
      );
      if (localProfile) {
        setMyProfile(localProfile);
      }
    }

    const localBodyState = loadFromStorage<BodyState>(STORAGE_KEYS.BODY_STATE, "open", appMode);
    setMyBodyStateInternal(localBodyState || "open");
  }, [appMode, authUser, sanitizeLegacyTemplateProfile]);

  // Suscripción al ciclo de vida de Firebase Auth y sincronización en tiempo real
  useEffect(() => {
    let isMounted = true;
    let unsubFullData: (() => void) | null = null;

    const unsubAuth = onAuthChange((user) => {
      if (!isMounted) return;
      // En Modo Real no se admiten cuentas de prueba de desarrollo (@vessel.dev)
      if (appMode === "real" && user && (user.email?.endsWith("@vessel.dev") || user.isAnonymous)) {
        authLogoutUser().catch(() => {});
        setAuthUser(null);
        setIsAuthLoading(false);
        setIsCloudConnected(false);
        setCurrentUserUid("unauthenticated");
        uidRef.current = "unauthenticated";
        setMyProfile(CLEAN_UNAUTHENTICATED_PROFILE);
        return;
      }

      const defaultNonAuthUid = appMode === "real" ? "unauthenticated" : "local-user";
      const uid = user ? user.uid : defaultNonAuthUid;

      // Si cambió de una cuenta de usuario real autenticada a OTRA cuenta de usuario distinta,
      // purgar caché local para evitar contaminación entre cuentas.
      const isSwitchBetweenDifferentUsers =
        lastAuthUidRef.current &&
        lastAuthUidRef.current !== defaultNonAuthUid &&
        lastAuthUidRef.current !== uid;

      if (isSwitchBetweenDifferentUsers) {
        removeFromStorage(STORAGE_KEYS.PROFILE, appMode);
        removeFromStorage(STORAGE_KEYS.PROFILE);
        removeFromStorage(STORAGE_KEYS.KINK_MATRIX, appMode);
        removeFromStorage(STORAGE_KEYS.KINK_MATRIX);
        removeFromStorage(STORAGE_KEYS.ALBUMS, appMode);
        removeFromStorage(STORAGE_KEYS.ALBUMS);
        removeFromStorage(STORAGE_KEYS.HOST_CARD, appMode);
        removeFromStorage(STORAGE_KEYS.HOST_CARD);
        removeFromStorage(STORAGE_KEYS.EXIT_PROTOCOL, appMode);
        removeFromStorage(STORAGE_KEYS.EXIT_PROTOCOL);
        removeFromStorage(STORAGE_KEYS.AMBIENT_VIBE, appMode);
        removeFromStorage(STORAGE_KEYS.AMBIENT_VIBE);
        removeFromStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE, appMode);
        removeFromStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE);
        removeFromStorage(STORAGE_KEYS.FAVORITES, appMode);
        removeFromStorage(STORAGE_KEYS.FAVORITES);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("vessel:user-switched", { detail: { uid: user ? uid : null } }));
        }
      }
      lastAuthUidRef.current = uid;

      setAuthUser(user);
      setIsAuthLoading(false);
      setIsCloudConnected(!!user);
      setCurrentUserUid(uid);
      uidRef.current = uid;

      if (user && typeof window !== "undefined") {
        const storedStart = window.localStorage.getItem("vessel_session_start_timestamp");
        if (!storedStart) {
          window.localStorage.setItem("vessel_session_start_timestamp", Date.now().toString());
        }
      }

      if (!user) {
        const fallbackProfile = appMode === "real" ? CLEAN_UNAUTHENTICATED_PROFILE : INITIAL_MY_PROFILE;
        setMyProfile(fallbackProfile);
        setMyBodyStateInternal("open");
      } else if (appMode === "real") {
        // Iniciar con perfil limpio mientras hidrata el documento exclusivo de este UID desde Firestore
        const cleanInitialForUser: MyProfileState = {
          ...CLEAN_UNAUTHENTICATED_PROFILE,
          codename: user.displayName?.split(" ")[0]?.toUpperCase() || "",
          email: user.email || "",
          avatarUrl: user.photoURL || "",
        };
        setMyProfile(cleanInitialForUser);
      }

      if (unsubFullData) {
        unsubFullData();
        unsubFullData = null;
      }

      if (user && uid !== "local-user" && uid !== "unauthenticated") {
        const freshInitialProfile: MyProfileState = {
          ...CLEAN_UNAUTHENTICATED_PROFILE,
          codename: user.displayName?.split(" ")[0]?.toUpperCase() || "",
          email: user.email || "",
          avatarUrl: user.photoURL || "",
          authProvider: user.providerData?.some((p) => p.providerId === "google.com") ? "google" : "direct",
        };

        unsubFullData = subscribeToFullUserData(
          uid,
          { profile: freshInitialProfile, bodyState: "open", kinkMatrix: {} },
          (cloudData) => {
            if (!isMounted) return;
            if (cloudData.profile) {
              const sanitized = sanitizeLegacyTemplateProfile(cloudData.profile, user.photoURL || "");
              const wasLegacyTemplate =
                !cloudData.profile.isProfileCustomized &&
                ((cloudData.profile.age === 26 && cloudData.profile.heightCm === 178) ||
                  (cloudData.profile.age === 28 && cloudData.profile.heightCm === 180) ||
                  (cloudData.profile.age === 25 && cloudData.profile.heightCm === 175));

              setMyProfile(sanitized);
              saveToStorage(STORAGE_KEYS.PROFILE, sanitized, appMode);

              if (wasLegacyTemplate) {
                saveFullUserDataToCloud(uid, { profile: sanitized, kinkMatrix: {} });
              }
            }
            if (cloudData.userPlan) {
              const isUnl = cloudData.userPlan === "unlimited" || cloudData.userPlan === "pro";
              setMyProfile((prev) => ({
                ...prev,
                userPlan: cloudData.userPlan,
                isUnlimited: isUnl,
              }));
            }
            if (cloudData.bodyState) {
              setMyBodyStateInternal(cloudData.bodyState);
              saveToStorage(STORAGE_KEYS.BODY_STATE, cloudData.bodyState, appMode);
            }
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("vessel:cloud-user-hydrated", {
                  detail: { uid, cloudData },
                })
              );
            }
          }
        );
      }
    });

    const handlePlanUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ userId: string; tier: UserSubscriptionTier; isUnlimited: boolean }>).detail;
      if (!detail) return;
      if (!uidRef.current || uidRef.current === detail.userId) {
        setMyProfile((prev) => ({
          ...prev,
          userPlan: detail.tier,
          isUnlimited: detail.isUnlimited,
        }));
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("vessel:user-plan-updated", handlePlanUpdated);
    }

    return () => {
      isMounted = false;
      unsubAuth();
      if (unsubFullData) {
        unsubFullData();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("vessel:user-plan-updated", handlePlanUpdated);
      }
    };
  }, [appMode, sanitizeLegacyTemplateProfile]);

  const syncProfileToCloudAndStorage = useCallback(
    (updated: MyProfileState) => {
      saveToStorage(STORAGE_KEYS.PROFILE, updated, appMode);
      if (uidRef.current && uidRef.current !== "local-user" && uidRef.current !== "unauthenticated") {
        saveFullUserDataToCloud(uidRef.current, { profile: updated });
      }
    },
    [appMode]
  );

  const setMyBodyState = useCallback(
    (state: BodyState) => {
      setMyBodyStateInternal(state);
      saveToStorage(STORAGE_KEYS.BODY_STATE, state, appMode);
      if (uidRef.current && uidRef.current !== "local-user" && uidRef.current !== "unauthenticated") {
        saveFullUserDataToCloud(uidRef.current, { bodyState: state });
      }
      audioEngine.playStateSwitch(state);
    },
    [appMode]
  );

  const updateMyProfile = useCallback(
    (updates: Partial<MyProfileState>) => {
      setMyProfile((prev) => {
        const updated: MyProfileState = {
          ...prev,
          ...updates,
          isProfileCustomized: true,
        };
        syncProfileToCloudAndStorage(updated);
        return updated;
      });
    },
    [syncProfileToCloudAndStorage]
  );

  const toggleNoGhostMode = useCallback(() => {
    setMyProfile((prev) => {
      const updated = { ...prev, noGhostMode: !prev.noGhostMode, isAntiGhost: !prev.noGhostMode };
      syncProfileToCloudAndStorage(updated);
      return updated;
    });
    audioEngine.playPulse();
  }, [syncProfileToCloudAndStorage]);

  const toggleFogMode = useCallback(() => {
    setMyProfile((prev) => {
      const updated = { ...prev, isFogMode: !prev.isFogMode };
      syncProfileToCloudAndStorage(updated);
      return updated;
    });
    audioEngine.playPulse();
  }, [syncProfileToCloudAndStorage]);

  const openAuthModal = useCallback(
    (mode: "login" | "register" | "forgot_password" | "link" | "verify" | "session" = "login") => {
      setAuthModalMode(mode);
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    const res = await authLoginWithGoogle(language);
    if (res.success && res.user) {
      const user = res.user;
      const cleanCodename =
        user.displayName?.split(" ")[0]?.toUpperCase() || `VESSEL_${user.uid.slice(0, 5).toUpperCase()}`;
      setMyProfile((prev) => {
        const updated: MyProfileState = {
          ...prev,
          codename:
            prev.codename && prev.codename !== "VESSEL" && prev.codename !== "VESSEL_USER"
              ? prev.codename
              : cleanCodename,
          email: user.email || prev.email || "",
          avatarUrl: user.photoURL || prev.avatarUrl,
          authProvider: "google",
          verification: {
            isVerified: true,
            method: "oauth_google",
            verifiedAt: new Date().toISOString(),
            hasFacialPrivacy: false,
            badgeLabel: "ID VERIFIED // GOOGLE",
            trustScore: 100,
            certificateHash: `ZK_${user.uid.slice(0, 8)}`,
          },
        };
        syncProfileToCloudAndStorage(updated);
        return updated;
      });
      // Mantener el modal abierto en modo configuración de perfil / sesión para que el usuario confirme su alias, rol, teléfono y qué busca
      setAuthModalMode("session");
      setIsAuthModalOpen(true);
      audioEngine.playVaultUnlock();
    }
    return res;
  }, [language, syncProfileToCloudAndStorage]);

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      return await authLoginWithEmail(email, password, language);
    },
    [language]
  );

  const registerWithEmail = useCallback(
    async (
      email: string,
      password: string,
      codename: string,
      role?: string,
      phone?: string
    ): Promise<AuthActionResult> => {
      const res = await authRegisterWithEmail(email, password, codename, role, phone, language);
      if (res.success && res.user) {
        const cleanCodename = codename.trim().toUpperCase() || "VESSEL_MEMBER";
        const cleanRole = (role as RoleType) || "Versatile";
        const updated: MyProfileState = {
          ...CLEAN_UNAUTHENTICATED_PROFILE,
          codename: cleanCodename,
          role: cleanRole,
          authProvider: "direct",
        };
        setMyProfile(updated);
        syncProfileToCloudAndStorage(updated);
        setIsAuthModalOpen(false);
        setIsGenderOnboardingOpen(true);
        audioEngine.playVaultUnlock();
      }
      return res;
    },
    [language, syncProfileToCloudAndStorage]
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      return await authResetPassword(email, language);
    },
    [language]
  );

  const linkAccountWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    const res = await authLinkGuestWithGoogle(language);
    if (res.success && res.user) {
      const user = res.user;
      const cleanCodename =
        user.displayName?.split(" ")[0]?.toUpperCase() || `VESSEL_${user.uid.slice(0, 5).toUpperCase()}`;
      setMyProfile((prev) => {
        const updated: MyProfileState = {
          ...prev,
          codename: prev.codename && prev.codename !== "VESSEL" ? prev.codename : cleanCodename,
          avatarUrl: user.photoURL || prev.avatarUrl,
          authProvider: "google",
          verification: {
            isVerified: true,
            method: "oauth_google",
            verifiedAt: new Date().toISOString(),
            hasFacialPrivacy: false,
            badgeLabel: "ID VERIFIED // GOOGLE",
            trustScore: 100,
            certificateHash: `ZK_${user.uid.slice(0, 8)}`,
          },
        };
        syncProfileToCloudAndStorage(updated);
        return updated;
      });
      setIsAuthModalOpen(false);
      audioEngine.playVaultUnlock();
    }
    return res;
  }, [language, syncProfileToCloudAndStorage]);

  const linkAccountWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      return await authLinkGuestWithEmail(email, password, language);
    },
    [language]
  );

  const loginAsGuest = useCallback(async (): Promise<AuthActionResult> => {
    return await authSignInAsGuest();
  }, []);

  const logout = useCallback(async () => {
    try {
      if (onLogoutCleanup) {
        onLogoutCleanup();
      }
      await authLogoutUser();
    } catch (err) {
      console.error("Error al cerrar sesión en Firebase:", err);
    }

    audioEngine.playStateSwitch("dormant");

    // Limpiar estado reactivo de usuario en memoria
    setAuthUser(null);
    setIsCloudConnected(false);
    const nonAuthUid = appMode === "real" ? "unauthenticated" : "local-user";
    setCurrentUserUid(nonAuthUid);
    uidRef.current = nonAuthUid;

    const resetProfile = appMode === "real" ? CLEAN_UNAUTHENTICATED_PROFILE : INITIAL_MY_PROFILE;
    setMyProfile(resetProfile);
    setMyBodyStateInternal("open");

    // Limpiar álbumes y estado de sesión en SettingsContext
    cleanupUserSessionData();

    // Purgar almacenamiento persistente local (scoped y un-scoped)
    removeFromStorage(STORAGE_KEYS.PROFILE, appMode);
    removeFromStorage(STORAGE_KEYS.PROFILE);
    removeFromStorage(STORAGE_KEYS.BODY_STATE, appMode);
    removeFromStorage(STORAGE_KEYS.BODY_STATE);
    removeFromStorage(STORAGE_KEYS.KINK_MATRIX, appMode);
    removeFromStorage(STORAGE_KEYS.KINK_MATRIX);
    removeFromStorage(STORAGE_KEYS.HOST_CARD, appMode);
    removeFromStorage(STORAGE_KEYS.HOST_CARD);
    removeFromStorage(STORAGE_KEYS.EXIT_PROTOCOL, appMode);
    removeFromStorage(STORAGE_KEYS.EXIT_PROTOCOL);
    removeFromStorage(STORAGE_KEYS.AMBIENT_VIBE, appMode);
    removeFromStorage(STORAGE_KEYS.AMBIENT_VIBE);
    removeFromStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE, appMode);
    removeFromStorage(STORAGE_KEYS.SUBSTANCE_ATMOSPHERE);
    removeFromStorage(STORAGE_KEYS.FAVORITES, appMode);
    removeFromStorage(STORAGE_KEYS.FAVORITES);
    removeFromStorage(STORAGE_KEYS.RECEIVED_PULSES, appMode);
    removeFromStorage(STORAGE_KEYS.RECEIVED_PULSES);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("vessel_session_start_timestamp");
      window.dispatchEvent(new CustomEvent("vessel:user-switched", { detail: { uid: null } }));
    }

    setAuthModalMode("login");
  }, [onLogoutCleanup, appMode, cleanupUserSessionData]);

  // Escucha activa del Control Maestro para forzado de cierre de sesión
  useEffect(() => {
    const unsub = subscribeToSystemControl((state) => {
      if (state.forceLogoutTimestamp && state.forceLogoutTimestamp > 0) {
        if (typeof window !== "undefined") {
          const sessionStartStr = window.localStorage.getItem("vessel_session_start_timestamp");
          const sessionStart = sessionStartStr ? parseInt(sessionStartStr, 10) : 0;
          if (authUser && sessionStart < state.forceLogoutTimestamp) {
            console.warn(
              "[VESSEL Auth] Sesión cerrada remotamente por comando de seguridad del Administrador"
            );
            logout();
            window.sessionStorage.setItem("vessel_session_force_closed", "true");
          }
        }
      }
    }, appMode);

    return () => unsub();
  }, [authUser, logout, appMode]);

  const verifyIdentity = useCallback(
    (data: {
      method: VerificationMethod;
      avatarUrl: string;
      isStylizedAvatar: boolean;
      isFogMode?: boolean;
      authProvider?: "google" | "direct" | "email";
      codename?: string;
    }) => {
      const hash = `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
      const badgeLabel =
        data.method === "biometric_liveness"
          ? "ID VERIFIED // BIOMÉTRICO"
          : data.method === "oauth_google"
          ? "ID VERIFIED // GOOGLE"
          : "ID VERIFIED // DOCUMENTO";

      const isFog = data.isFogMode ?? false;

      setMyProfile((prev) => {
        const updated: MyProfileState = {
          ...prev,
          codename: data.codename || prev.codename,
          avatarUrl: data.avatarUrl,
          isStylizedAvatar: data.isStylizedAvatar,
          isFogMode: isFog,
          authProvider: data.authProvider || prev.authProvider,
          verification: {
            isVerified: true,
            method: data.method,
            verifiedAt: "HOY",
            hasFacialPrivacy: data.isStylizedAvatar || isFog,
            badgeLabel,
            trustScore: 100,
            certificateHash: hash,
          },
        };
        syncProfileToCloudAndStorage(updated);
        return updated;
      });

      audioEngine.playVaultUnlock();
    },
    [syncProfileToCloudAndStorage]
  );

  const removeVerification = useCallback(() => {
    setMyProfile((prev) => {
      const updated: MyProfileState = {
        ...prev,
        verification: {
          isVerified: false,
          hasFacialPrivacy: false,
          badgeLabel: "NO VERIFICADO",
          trustScore: 0,
        },
      };
      syncProfileToCloudAndStorage(updated);
      return updated;
    });
    audioEngine.playStateSwitch("dormant");
  }, [syncProfileToCloudAndStorage]);

  const updateUserAvatar = useCallback(
    (url: string, isStylized: boolean, isFogMode?: boolean) => {
      setMyProfile((prev) => {
        const fog = isFogMode !== undefined ? isFogMode : prev.isFogMode;
        const updated: MyProfileState = {
          ...prev,
          avatarUrl: url,
          isStylizedAvatar: isStylized,
          isFogMode: fog,
          verification: {
            ...prev.verification,
            hasFacialPrivacy: isStylized || fog,
          },
        };
        syncProfileToCloudAndStorage(updated);
        return updated;
      });
      audioEngine.playPulse();
    },
    [syncProfileToCloudAndStorage]
  );

  // Sincronizar reactivamente el avatar ante eventos de actualización de foto de portada
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleAvatarUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ url: string; isStylized?: boolean; isFogMode?: boolean }>).detail;
      if (detail && detail.url) {
        updateUserAvatar(detail.url, detail.isStylized ?? false, detail.isFogMode);
      }
    };
    window.addEventListener("vessel:avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("vessel:avatar-updated", handleAvatarUpdated);
  }, [updateUserAvatar]);

  const openLivenessModal = useCallback(() => {
    setIsLivenessModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeLivenessModal = useCallback(() => {
    setIsLivenessModalOpen(false);
  }, []);

  const completeLivenessVerification = useCallback(() => {
    const currentScore = myProfile.respectScore || 70;
    const boostedScore = Math.min(100, currentScore + 20);

    updateMyProfile({
      respectScore: boostedScore,
      verification: {
        isVerified: true,
        method: "biometric_liveness",
        verifiedAt: "HOY // VERIFICADO",
        hasFacialPrivacy: Boolean(myProfile.verification?.hasFacialPrivacy),
        badgeLabel: "ID VERIFIED // LIVENESS 3D",
        trustScore: 100,
        certificateHash: "0xZK" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });
    setIsLivenessModalOpen(false);
    audioEngine.playSubBass(85);
  }, [myProfile.verification?.hasFacialPrivacy, myProfile.respectScore, updateMyProfile]);

  const value = useMemo<AuthContextType>(
    () => ({
      authUser,
      isAuthLoading,
      isAuthenticated,
      isAnonymous,
      isCloudConnected,
      currentUserUid,
      myProfile,
      updateMyProfile,
      toggleNoGhostMode,
      toggleFogMode,
      myBodyState,
      setMyBodyState,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isGenderOnboardingOpen,
      setIsGenderOnboardingOpen,
      openGenderOnboarding,
      closeGenderOnboarding,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      linkAccountWithGoogle,
      linkAccountWithEmail,
      loginAsGuest,
      logout,
      verifyIdentity,
      removeVerification,
      updateUserAvatar,
      isLivenessModalOpen,
      openLivenessModal,
      closeLivenessModal,
      completeLivenessVerification,
    }),
    [
      authUser,
      isAuthLoading,
      isAuthenticated,
      isAnonymous,
      isCloudConnected,
      currentUserUid,
      myProfile,
      updateMyProfile,
      toggleNoGhostMode,
      toggleFogMode,
      myBodyState,
      setMyBodyState,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      isGenderOnboardingOpen,
      openGenderOnboarding,
      closeGenderOnboarding,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      linkAccountWithGoogle,
      linkAccountWithEmail,
      loginAsGuest,
      logout,
      verifyIdentity,
      removeVerification,
      updateUserAvatar,
      isLivenessModalOpen,
      openLivenessModal,
      closeLivenessModal,
      completeLivenessVerification,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
