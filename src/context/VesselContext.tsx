"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
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
  createFallbackProfile,
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
export { FREE_TIER_LIMITS, CLEAN_UNAUTHENTICATED_PROFILE, INITIAL_MY_PROFILE, createFallbackProfile };

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
 * VesselProvider
 * Hierarchical composition of all 7 specialized domain providers in dependency order:
 * SettingsProvider -> AuthProvider -> SafetyProvider -> LogisticsProvider -> DiaryProvider -> ChatProvider -> RadarMatrixProvider
 *
 * 2026 Architecture: VesselFacadeBridge eliminated to prevent monolithic re-render cascades.
 */
export const VesselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SafetyProvider>
          <LogisticsProvider>
            <DiaryProvider>
              <ChatProvider>
                <RadarMatrixProvider>{children}</RadarMatrixProvider>
              </ChatProvider>
            </DiaryProvider>
          </LogisticsProvider>
        </SafetyProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

/**
 * @deprecated PROHIBIDO en arquitectura 2026 (Rule 11).
 * Consumir exclusivamente hooks atómicos por dominio:
 * useAuth, useSettings, useRadarMatrix, useChat, useLogistics, useDiary, useSafety.
 */
export const useVessel = (): VesselContextType => {
  const context = useContext(VesselContext);
  if (!context) {
    throw new Error(
      "[VESSEL 2026] useVessel() está deprecado y prohibido para evitar Context Hell y cascadas de re-renders. Usá hooks atómicos (useAuth, useRadarMatrix, useChat, etc.)."
    );
  }
  return context;
};
