"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  SafetyBeaconState,
  AppDisguiseConfig,
  AppDisguiseMode,
  HarmReductionSession,
  HarmReductionDose,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage/localStorageSync";
import { hashPin, verifyPin } from "@/lib/security/cryptoUtils";

const INITIAL_SAFETY_BEACON: SafetyBeaconState = {
  isActive: false,
  durationMinutes: 45,
  startedAt: null,
  expiresAt: null,
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyTelegramUser: "",
  lastLocationText: "",
  targetProfileCodename: "",
  pinCode: "",
  duressCode: "",
  isAlarmTriggered: false,
};

const INITIAL_APP_DISGUISE: AppDisguiseConfig = {
  mode: "notes",
  flipToCoverEnabled: true,
  tripleTapHeaderEnabled: true,
};

const INITIAL_HARM_REDUCTION: HarmReductionSession = {
  isActive: false,
  startedAt: null,
  waterIntervalMinutes: 45,
  lastWaterPromptAt: null,
  totalWaterCups: 0,
  doses: [],
};

export interface SafetyContextType {
  // Guardián Silencioso & Dead-Man Switch
  safetyBeacon: SafetyBeaconState;
  isSafetyBeaconModalOpen: boolean;
  openSafetyBeaconModal: () => void;
  closeSafetyBeaconModal: () => void;
  startSafetyBeacon: (config: {
    durationMinutes: number;
    emergencyPhone: string;
    emergencyName: string;
    locationText: string;
    targetCodename: string;
    pinCode: string;
    duressCode?: string;
  }) => void;
  extendSafetyBeacon: (additionalMinutes: number) => void;
  deactivateSafetyBeacon: (enteredPin: string) => boolean;
  triggerSafetyDuress: () => void;
  dispatchSosAlert: () => Promise<boolean>;
  updateSafetyBeaconPins: (pinCode: string, duressCode: string) => void;

  // Icono Camaleón & Pantalla de Cobertura
  appDisguise: AppDisguiseConfig;
  isCoverScreenActive: boolean;
  setCoverScreenActive: (active: boolean) => void;
  toggleCoverScreen: () => void;
  isDuressPinSettingsOpen: boolean;
  openDuressPinSettings: () => void;
  closeDuressPinSettings: () => void;
  setAppDisguiseMode: (mode: AppDisguiseMode) => void;

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
  const [safetyBeacon, setSafetyBeacon] = useState<SafetyBeaconState>(INITIAL_SAFETY_BEACON);
  const [isSafetyBeaconModalOpen, setIsSafetyBeaconModalOpen] = useState(false);

  const [appDisguise, setAppDisguise] = useState<AppDisguiseConfig>(INITIAL_APP_DISGUISE);
  const [isCoverScreenActive, setIsCoverScreenActive] = useState(false);
  const [isDuressPinSettingsOpen, setIsDuressPinSettingsOpen] = useState(false);

  const [stealthMode, setStealthMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [harmReductionSession, setHarmReductionSession] = useState<HarmReductionSession>(INITIAL_HARM_REDUCTION);
  const [isHarmReductionModalOpen, setIsHarmReductionModalOpen] = useState(false);

  // Hidratación segura local-first
  useEffect(() => {
    const localSafetyBeacon = loadFromStorage<SafetyBeaconState>(STORAGE_KEYS.SAFETY_BEACON, INITIAL_SAFETY_BEACON);
    if (localSafetyBeacon) setSafetyBeacon(localSafetyBeacon);

    const localDisguise = loadFromStorage<AppDisguiseConfig>(STORAGE_KEYS.APP_DISGUISE, INITIAL_APP_DISGUISE);
    if (localDisguise) setAppDisguise(localDisguise);

    const localHarmReduction = loadFromStorage<HarmReductionSession>(STORAGE_KEYS.HARM_REDUCTION, INITIAL_HARM_REDUCTION);
    if (localHarmReduction) setHarmReductionSession(localHarmReduction);
  }, []);

  // Timer aislado de comprobación de alarma del Guardián (cada 5s)
  useEffect(() => {
    if (!safetyBeacon.isActive || !safetyBeacon.expiresAt || safetyBeacon.isAlarmTriggered) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const expiry = new Date(safetyBeacon.expiresAt!).getTime();
      if (now >= expiry) {
        setSafetyBeacon((prev) => ({ ...prev, isAlarmTriggered: true }));
        audioEngine.playSubBass(45);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [safetyBeacon.isActive, safetyBeacon.expiresAt, safetyBeacon.isAlarmTriggered]);

  // Listener aislado de giro (Flip-to-Cover) y tecla de pánico (Escape)
  useEffect(() => {
    if (!appDisguise.flipToCoverEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && (Math.abs(e.beta) > 160 || (e.gamma !== null && Math.abs(e.gamma) > 80))) {
        setIsCoverScreenActive(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCoverScreenActive((prev) => !prev);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("deviceorientation", handleOrientation);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [appDisguise.flipToCoverEnabled]);

  const openSafetyBeaconModal = useCallback(() => {
    setIsSafetyBeaconModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeSafetyBeaconModal = useCallback(() => {
    setIsSafetyBeaconModalOpen(false);
  }, []);

  const startSafetyBeacon = useCallback(
    (config: {
      durationMinutes: number;
      emergencyPhone: string;
      emergencyName: string;
      locationText: string;
      targetCodename: string;
      pinCode: string;
      duressCode?: string;
    }) => {
      const now = Date.now();
      const expires = new Date(now + config.durationMinutes * 60 * 1000).toISOString();
      const hashedPin = config.pinCode ? hashPin(config.pinCode) : "";
      const hashedDuress = config.duressCode ? hashPin(config.duressCode) : "";

      const nextState: SafetyBeaconState = {
        isActive: true,
        durationMinutes: config.durationMinutes,
        startedAt: new Date(now).toISOString(),
        expiresAt: expires,
        emergencyContactName: config.emergencyName,
        emergencyContactPhone: config.emergencyPhone,
        emergencyTelegramUser: "@vessel_guard",
        lastLocationText: config.locationText,
        targetProfileCodename: config.targetCodename,
        pinCode: hashedPin,
        duressCode: hashedDuress,
        isAlarmTriggered: false,
      };

      setSafetyBeacon(nextState);
      saveToStorage(STORAGE_KEYS.SAFETY_BEACON, nextState);
      audioEngine.playSubBass(85);
      setIsSafetyBeaconModalOpen(false);
    },
    []
  );

  const extendSafetyBeacon = useCallback((additionalMinutes: number) => {
    setSafetyBeacon((prev) => {
      if (!prev.expiresAt) return prev;
      const newExpiry = new Date(
        new Date(prev.expiresAt).getTime() + additionalMinutes * 60 * 1000
      ).toISOString();
      const updated = {
        ...prev,
        expiresAt: newExpiry,
        durationMinutes: prev.durationMinutes + additionalMinutes,
        isAlarmTriggered: false,
      };
      saveToStorage(STORAGE_KEYS.SAFETY_BEACON, updated);
      return updated;
    });
    audioEngine.playSubBass(70);
  }, []);

  const dispatchSosAlert = useCallback(async (): Promise<boolean> => {
    const coords = loadFromStorage<{ lat: number; lng: number } | null>(STORAGE_KEYS.COORDINATES, null);
    const locationStr = coords
      ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
      : safetyBeacon.lastLocationText || "Ubicación del encuentro";

    const sosMsg = `🚨 ALERTA SOS VESSEL: Necesito asistencia o que te contactes conmigo de inmediato. Mi ubicación: ${locationStr}. Dirección: ${safetyBeacon.lastLocationText || "No indicada"}. Encuentro con: ${safetyBeacon.targetProfileCodename || "Contacto VESSEL"}.`;

    audioEngine.playSubBass(35);

    // 1. Web Share API nativa (WhatsApp, Telegram, Mensajes, Contactos)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "🚨 ALERTA SOS VESSEL",
          text: sosMsg,
        });
        return true;
      } catch {
        // Fallback a enlace SMS
      }
    }

    // 2. Enlace SMS celular directo
    if (safetyBeacon.emergencyContactPhone && typeof window !== "undefined") {
      const cleanPhone = safetyBeacon.emergencyContactPhone.replace(/[^\d+]/g, "");
      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(sosMsg)}`;
      return true;
    }

    return false;
  }, [safetyBeacon]);

  const triggerSafetyDuress = useCallback(() => {
    setSafetyBeacon((prev) => {
      const disarmed = { ...prev, isActive: false, isAlarmTriggered: false };
      saveToStorage(STORAGE_KEYS.SAFETY_BEACON, disarmed);
      return disarmed;
    });
    setIsCoverScreenActive(true);
    audioEngine.playSubBass(45);
    // Disparo silencioso de socorro al contacto de auxilio
    dispatchSosAlert();
  }, [dispatchSosAlert]);

  const deactivateSafetyBeacon = useCallback(
    (enteredPin: string): boolean => {
      if (!enteredPin) {
        audioEngine.playSubBass(45);
        return false;
      }

      // 1. Verificación segura contra PIN de coacción
      if (safetyBeacon.duressCode && verifyPin(enteredPin, safetyBeacon.duressCode)) {
        triggerSafetyDuress();
        return true;
      }

      // 2. Verificación segura contra PIN legítimo de desactivación
      if (safetyBeacon.pinCode && verifyPin(enteredPin, safetyBeacon.pinCode)) {
        setSafetyBeacon((prev) => {
          const disarmed = { ...prev, isActive: false, isAlarmTriggered: false };
          saveToStorage(STORAGE_KEYS.SAFETY_BEACON, disarmed);
          return disarmed;
        });
        audioEngine.playSubBass(75);
        return true;
      }

      audioEngine.playSubBass(45);
      return false;
    },
    [safetyBeacon.pinCode, safetyBeacon.duressCode, triggerSafetyDuress]
  );

  const updateSafetyBeaconPins = useCallback((pinCode: string, duressCode: string) => {
    const hashedPin = pinCode ? hashPin(pinCode) : "";
    const hashedDuress = duressCode ? hashPin(duressCode) : "";
    setSafetyBeacon((prev) => {
      const updated = {
        ...prev,
        pinCode: hashedPin || prev.pinCode,
        duressCode: hashedDuress || prev.duressCode,
      };
      saveToStorage(STORAGE_KEYS.SAFETY_BEACON, updated);
      return updated;
    });
    audioEngine.playSubBass(75);
  }, []);

  const toggleCoverScreen = useCallback(() => {
    setIsCoverScreenActive((prev) => !prev);
    audioEngine.playPulse();
  }, []);

  const setCoverScreenActive = useCallback((active: boolean) => {
    setIsCoverScreenActive(active);
  }, []);

  const openDuressPinSettings = useCallback(() => {
    setIsDuressPinSettingsOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeDuressPinSettings = useCallback(() => {
    setIsDuressPinSettingsOpen(false);
  }, []);

  const setAppDisguiseMode = useCallback((mode: AppDisguiseMode) => {
    setAppDisguise((prev) => {
      const next = { ...prev, mode };
      saveToStorage(STORAGE_KEYS.APP_DISGUISE, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const toggleStealthMode = useCallback(() => {
    setStealthMode((prev) => {
      const next = !prev;
      if (next) {
        audioEngine.playStateSwitch("dormant");
      } else {
        audioEngine.playSignalSent();
      }
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      audioEngine.setMuted(!next);
      return next;
    });
  }, []);

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
      safetyBeacon,
      isSafetyBeaconModalOpen,
      openSafetyBeaconModal,
      closeSafetyBeaconModal,
      startSafetyBeacon,
      extendSafetyBeacon,
      deactivateSafetyBeacon,
      triggerSafetyDuress,
      dispatchSosAlert,
      updateSafetyBeaconPins,
      appDisguise,
      isCoverScreenActive,
      setCoverScreenActive,
      toggleCoverScreen,
      isDuressPinSettingsOpen,
      openDuressPinSettings,
      closeDuressPinSettings,
      setAppDisguiseMode,
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
      safetyBeacon,
      isSafetyBeaconModalOpen,
      openSafetyBeaconModal,
      closeSafetyBeaconModal,
      startSafetyBeacon,
      extendSafetyBeacon,
      deactivateSafetyBeacon,
      triggerSafetyDuress,
      dispatchSosAlert,
      updateSafetyBeaconPins,
      appDisguise,
      isCoverScreenActive,
      setCoverScreenActive,
      toggleCoverScreen,
      isDuressPinSettingsOpen,
      openDuressPinSettings,
      closeDuressPinSettings,
      setAppDisguiseMode,
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
