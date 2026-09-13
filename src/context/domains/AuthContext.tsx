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

export interface MyProfileState {
  codename: string;
  age: number;
  showAge: boolean;
  twitterHandle: string;
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
}

export const INITIAL_MY_PROFILE: MyProfileState = {
  codename: "VESSEL_USER",
  age: 28,
  showAge: true,
  twitterHandle: "",
  yoSoy: "Musculoso / Gym",
  mobility: "Tengo depto / lugar",
  hivStatus: "Negativo en PrEP",
  genderIdentity: "Hombre Cis",
  genderInterests: ["all"],
  pronouns: "Él / He / Him",
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
  age: 25,
  showAge: true,
  twitterHandle: "",
  yoSoy: "Atlético / Deportista",
  mobility: "Tengo depto / lugar",
  hivStatus: "Negativo en PrEP",
  genderIdentity: "Hombre Cis",
  genderInterests: ["all"],
  pronouns: "Él / He / Him",
  desires: [],
  intentions: [],
  boundaries: ["Consentimiento explícito"],
  energyVibes: [],
  noGhostMode: true,
  respectScore: 100,
  isAntiGhost: true,
  role: "Versatile",
  heightCm: 175,
  weightKg: 70,
  avatarUrl: "",
  isStylizedAvatar: false,
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

  // Sincronización reactiva cuando cambia el appMode
  useEffect(() => {
    const fallbackProfile = appMode === "real" ? CLEAN_UNAUTHENTICATED_PROFILE : INITIAL_MY_PROFILE;
    const localProfile = loadFromStorage<MyProfileState>(STORAGE_KEYS.PROFILE, fallbackProfile, appMode);
    if (localProfile) setMyProfile(localProfile);

    const localBodyState = loadFromStorage<BodyState>(STORAGE_KEYS.BODY_STATE, "open", appMode);
    setMyBodyStateInternal(localBodyState || "open");
  }, [appMode]);

  // Suscripción al ciclo de vida de Firebase Auth y sincronización en tiempo real
  useEffect(() => {
    let isMounted = true;
    let unsubFullData: (() => void) | null = null;

    const unsubAuth = onAuthChange((user) => {
      if (!isMounted) return;
      setAuthUser(user);
      setIsAuthLoading(false);
      setIsCloudConnected(!!user);

      const defaultNonAuthUid = appMode === "real" ? "unauthenticated" : "local-user";
      const uid = user ? user.uid : defaultNonAuthUid;
      setCurrentUserUid(uid);
      uidRef.current = uid;

      if (!user) {
        const fallbackProfile = appMode === "real" ? CLEAN_UNAUTHENTICATED_PROFILE : INITIAL_MY_PROFILE;
        setMyProfile(fallbackProfile);
        setMyBodyStateInternal("open");
      }

      if (unsubFullData) {
        unsubFullData();
        unsubFullData = null;
      }

      if (user && uid !== "local-user" && uid !== "unauthenticated") {
        unsubFullData = subscribeToFullUserData(
          uid,
          { profile: myProfile, bodyState: myBodyState },
          (cloudData) => {
            if (!isMounted) return;
            if (cloudData.profile) {
              setMyProfile((prev) => {
                const merged = { ...prev, ...cloudData.profile };
                saveToStorage(STORAGE_KEYS.PROFILE, merged, appMode);
                return merged;
              });
            }
            if (cloudData.bodyState) {
              setMyBodyStateInternal(cloudData.bodyState);
              saveToStorage(STORAGE_KEYS.BODY_STATE, cloudData.bodyState, appMode);
            }
          }
        );
      }
    });

    return () => {
      isMounted = false;
      unsubAuth();
      if (unsubFullData) {
        unsubFullData();
      }
    };
  }, []);

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
        const updated = { ...prev, ...updates };
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
      
      if (!myProfile.genderInterests || myProfile.genderInterests.length === 0) {
        setIsGenderOnboardingOpen(true);
      }
      
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

    setAuthModalMode("login");
  }, [onLogoutCleanup, appMode, cleanupUserSessionData]);

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

  const openLivenessModal = useCallback(() => {
    setIsLivenessModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeLivenessModal = useCallback(() => {
    setIsLivenessModalOpen(false);
  }, []);

  const completeLivenessVerification = useCallback(() => {
    updateMyProfile({
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
  }, [myProfile.verification?.hasFacialPrivacy, updateMyProfile]);

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
