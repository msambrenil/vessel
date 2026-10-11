"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  HarmReductionSession,
  HarmReductionDose,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage/localStorageSync";

const INITIAL_HARM_REDUCTION: HarmReductionSession = {
  isActive: false,
  startedAt: null,
  waterIntervalMinutes: 45,
  lastWaterPromptAt: null,
  totalWaterCups: 0,
  doses: [],
};

export interface SafetyContextType {
  // Modo Sigilo Inmediato & Sonido
  stealthMode: boolean;
  toggleStealthMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Asistente de Reducción de Daños
  harmReductionSession: HarmReductionSession;
  isHarmReductionModalOpen: boolean;
  openHarmReductionModal: () => void;
  closeHarmReductionModal: () => void;
  startHarmReductionSession: () => void;
  endHarmReductionSession: () => void;
  logHarmReductionDose: (substance: string, note?: string) => void;
  drinkWaterAck: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stealthMode, setStealthMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [harmReductionSession, setHarmReductionSession] = useState<HarmReductionSession>(INITIAL_HARM_REDUCTION);
  const [isHarmReductionModalOpen, setIsHarmReductionModalOpen] = useState(false);

  // Hidratación segura local-first
  useEffect(() => {
    const localHarmReduction = loadFromStorage<HarmReductionSession>(STORAGE_KEYS.HARM_REDUCTION, INITIAL_HARM_REDUCTION);
    if (localHarmReduction) setHarmReductionSession(localHarmReduction);
  }, []);

  const toggleStealthMode = useCallback(() => {
    const next = !stealthMode;
    setStealthMode(next);
    if (next) {
      audioEngine.playStateSwitch("dormant");
    } else {
      audioEngine.playSignalSent();
    }
  }, [stealthMode]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.setMuted(!next);
  }, [soundEnabled]);

  const openHarmReductionModal = useCallback(() => {
    setIsHarmReductionModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeHarmReductionModal = useCallback(() => {
    setIsHarmReductionModalOpen(false);
  }, []);

  const startHarmReductionSession = useCallback(() => {
    const newSession: HarmReductionSession = {
      isActive: true,
      startedAt: new Date().toISOString(),
      waterIntervalMinutes: 45,
      lastWaterPromptAt: new Date().toISOString(),
      totalWaterCups: 1,
      doses: [],
    };
    setHarmReductionSession(newSession);
    saveToStorage(STORAGE_KEYS.HARM_REDUCTION, newSession);
    audioEngine.playSubBass(60);
  }, []);

  const endHarmReductionSession = useCallback(() => {
    const endedSession: HarmReductionSession = {
      isActive: false,
      startedAt: null,
      waterIntervalMinutes: 45,
      lastWaterPromptAt: null,
      totalWaterCups: 0,
      doses: [],
    };
    setHarmReductionSession(endedSession);
    saveToStorage(STORAGE_KEYS.HARM_REDUCTION, endedSession);
    audioEngine.playPulse();
  }, []);

  const logHarmReductionDose = useCallback((substance: string, note?: string) => {
    setHarmReductionSession((prev) => {
      const newDose: HarmReductionDose = {
        id: `dose-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        substanceLabel: substance,
        notes: note,
      };
      const next = { ...prev, doses: [newDose, ...prev.doses] };
      saveToStorage(STORAGE_KEYS.HARM_REDUCTION, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const drinkWaterAck = useCallback(() => {
    setHarmReductionSession((prev) => {
      const next = {
        ...prev,
        totalWaterCups: prev.totalWaterCups + 1,
        lastWaterPromptAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.HARM_REDUCTION, next);
      return next;
    });
    audioEngine.playSuccess();
  }, []);

  const value = useMemo<SafetyContextType>(
    () => ({
      stealthMode,
      toggleStealthMode,
      soundEnabled,
      toggleSound,
      harmReductionSession,
      isHarmReductionModalOpen,
      openHarmReductionModal,
      closeHarmReductionModal,
      startHarmReductionSession,
      endHarmReductionSession,
      logHarmReductionDose,
      drinkWaterAck,
    }),
    [
      stealthMode,
      toggleStealthMode,
      soundEnabled,
      toggleSound,
      harmReductionSession,
      isHarmReductionModalOpen,
      openHarmReductionModal,
      closeHarmReductionModal,
      startHarmReductionSession,
      endHarmReductionSession,
      logHarmReductionDose,
      drinkWaterAck,
    ]
  );

  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>;
};

export const useSafety = (): SafetyContextType => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error("useSafety must be used within a SafetyProvider");
  }
  return context;
};
