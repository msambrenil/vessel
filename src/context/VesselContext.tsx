"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  SettingsProvider,
  useSettings,
  SettingsContextType,
  FREE_TIER_LIMITS,
  AppMode,
} from "./domains/SettingsContext";
import {
  AuthProvider,
  useAuth,
  AuthContextType,
  MyProfileState,
  CLEAN_UNAUTHENTICATED_PROFILE,
  INITIAL_MY_PROFILE,
} from "./domains/AuthContext";
import {
  SafetyProvider,
  useSafety,
  SafetyContextType,
} from "./domains/SafetyContext";
import {
  LogisticsProvider,
  useLogistics,
  LogisticsContextType,
} from "./domains/LogisticsContext";
import {
  RadarMatrixProvider,
  useRadarMatrix,
  RadarMatrixContextType,
} from "./domains/RadarMatrixContext";
import {
  ChatProvider,
  useChat,
  ChatContextType,
} from "./domains/ChatContext";
import {
  DiaryProvider,
  useDiary,
  DiaryContextType,
} from "./domains/DiaryContext";

// Re-export types and domain utilities
export type { MyProfileState, AppMode };
export { FREE_TIER_LIMITS, CLEAN_UNAUTHENTICATED_PROFILE, INITIAL_MY_PROFILE };

// Re-export domain hooks for granular consumption in new/refactored components
export {
  useSettings,
  useAuth,
  useSafety,
  useLogistics,
  useRadarMatrix,
  useChat,
  useDiary,
};

// Composite Facade Type that unites all 7 specialized domains
export type VesselContextType = SettingsContextType &
  AuthContextType &
  SafetyContextType &
  LogisticsContextType &
  RadarMatrixContextType &
  ChatContextType &
  DiaryContextType;

const VesselContext = createContext<VesselContextType | undefined>(undefined);

/**
 * VesselFacadeBridge
 * Bridges all 7 domain hooks into a single unified context value.
 * This ensures 100% backward compatibility for all 76 existing consumer components
 * using `useVessel()`, while isolating domain-specific renders and background intervals.
 */
const VesselFacadeBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = useSettings();
  const auth = useAuth();
  const safety = useSafety();
  const logistics = useLogistics();
  const diary = useDiary();
  const chat = useChat();
  const radarMatrix = useRadarMatrix();

  const isUnlimited = settings.isUnlimited || Boolean(logistics.partyPass?.isActive);

  const facadeValue = useMemo<VesselContextType>(
    () => ({
      ...settings,
      ...auth,
      ...safety,
      ...logistics,
      ...diary,
      ...chat,
      ...radarMatrix,
      isUnlimited,
    }),
    [settings, auth, safety, logistics, diary, chat, radarMatrix, isUnlimited]
  );

  return (
    <VesselContext.Provider value={facadeValue}>
      {children}
    </VesselContext.Provider>
  );
};

/**
 * VesselProvider
 * Hierarchical composition of all 7 specialized domain providers in dependency order:
 * SettingsProvider -> AuthProvider -> SafetyProvider -> LogisticsProvider -> DiaryProvider -> ChatProvider -> RadarMatrixProvider -> VesselFacadeBridge
 */
export const VesselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SafetyProvider>
          <LogisticsProvider>
            <DiaryProvider>
              <ChatProvider>
                <RadarMatrixProvider>
                  <VesselFacadeBridge>{children}</VesselFacadeBridge>
                </RadarMatrixProvider>
              </ChatProvider>
            </DiaryProvider>
          </LogisticsProvider>
        </SafetyProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

/**
 * useVessel
 * Universal facade hook returning the unified Vessel context.
 */
export const useVessel = (): VesselContextType => {
  const context = useContext(VesselContext);
  if (!context) {
    throw new Error("useVessel must be used within a VesselProvider");
  }
  return context;
};
