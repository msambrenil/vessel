"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  HostCardInfo,
  VoiceSnippet,
  EnRouteState,
  GeoPrivacyLevel,
  BatteryEngineState,
  GeohashCell,
  TravelModeConfig,
  SessionRoom,
  DuoLink,
  TacticalHotspot,
  ExitProtocol,
  NightlifeEvent,
  EventCheckin,
  MissedConnection,
  WingmanPair,
  PartyPassState,
} from "@/types/vessel";
import { VesselProfile, ClubZoneType, ActiveNavView } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { audioPlayerService } from "@/lib/audio/audioPlayerService";
import { getGeohashCell, calculateHaversineDistance } from "@/lib/geo/GeospatialEngine";
import { batteryStateEngine, INITIAL_BATTERY_STATE } from "@/lib/geo/BatteryStateEngine";
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS, getActiveAppMode } from "@/lib/storage/localStorageSync";
import { MOCK_HOTSPOTS } from "@/data/mockHotspots";
import { MOCK_NIGHTLIFE_EVENTS, MOCK_INITIAL_MISSED_CONNECTIONS } from "@/data/mockNightlifeEvents";
import {
  subscribeToHotspots,
  checkInHotspotCloud,
  checkOutHotspotCloud,
} from "@/lib/firebase/hotspotService";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";

const INITIAL_MY_HOST_CARD: HostCardInfo = {
  hasPlace: true,
  livingArrangement: "solo",
  spaceType: "private_apt",
  amenities: {
    cleanTowels: true,
    showerReady: true,
    elevator: true,
    easyParking: false,
    acOrHeating: true,
  },
  pets: "none",
  supplies: {
    condoms: true,
    lube: true,
    poppers: true,
    wipes: true,
  },
  notes: "Depto en Palermo con aire acondicionado, luces bajas y sonido ambiente listo.",
  updatedAt: new Date().toISOString(),
};

const INITIAL_EN_ROUTE: EnRouteState = {
  isActive: false,
  targetProfileId: null,
  targetCodename: null,
  startedAt: null,
  etaMinutes: 15,
  distanceMeters: 1200,
  isArrived: false,
};

const INITIAL_TRAVEL_MODE: TravelModeConfig = {
  isActive: false,
  cityName: "Buenos Aires",
  country: "Argentina",
  virtualCoords: { lat: -34.5885, lng: -58.4376 },
};

const INITIAL_DUO_LINK: DuoLink = {
  isLinked: false,
  partnerProfileId: null,
  partnerCodename: null,
  partnerAvatarUrl: null,
  jointTitle: "",
};

export interface LogisticsContextType {
  // Ficha de Hospedaje Táctica
  myHostCard: HostCardInfo;
  updateMyHostCard: (updates: Partial<HostCardInfo>) => void;
  isHostCardModalOpen: boolean;
  selectedHostCardProfile: VesselProfile | null;
  openHostCardModal: (profile?: VesselProfile) => void;
  closeHostCardModal: () => void;

  // Voice Vibe (5s)
  myVoiceVibe: VoiceSnippet | null;
  isVoiceRecorderOpen: boolean;
  openVoiceRecorder: () => void;
  closeVoiceRecorder: () => void;
  saveMyVoiceVibe: (snippet: VoiceSnippet) => void;
  deleteMyVoiceVibe: () => void;
  activePlayingVoiceId: string | null;
  playVoiceVibe: (voice: VoiceSnippet) => void;
  stopVoiceVibe: () => void;

  // Modo En Ruta
  enRouteState: EnRouteState;
  isEnRouteModalOpen: boolean;
  openEnRouteModal: (targetProfile?: VesselProfile) => void;
  closeEnRouteModal: () => void;
  startEnRoute: (targetProfile: VesselProfile, etaMinutes: number) => void;
  cancelEnRoute: () => void;
  arrivedEnRoute: () => void;

  // Arquitectura Geoespacial & Motor de Batería
  geoPrivacyLevel: GeoPrivacyLevel;
  setGeoPrivacyLevel: (level: GeoPrivacyLevel) => void;
  batteryEngineState: BatteryEngineState;
  manualEcoSaver: boolean;
  toggleEcoSaverMode: () => void;
  myGeohashCell: GeohashCell;
  myCoordinates: { lat: number; lng: number };
  isGeoBatteryModalOpen: boolean;
  openGeoBatteryModal: () => void;
  closeGeoBatteryModal: () => void;
  travelMode: TravelModeConfig;
  toggleTravelMode: () => void;
  updateTravelCity: (cityName: string, country: string, coords: { lat: number; lng: number }) => void;
  setTravelModeCity: (cityName: string, country: string, coords: { lat: number; lng: number }) => void;
  resetTravelMode: () => void;
  isTravelModalOpen: boolean;
  openTravelModal: () => void;
  closeTravelModal: () => void;
  isLocating: boolean;
  geoError: string | null;
  refreshRealGeolocation: () => Promise<boolean>;

  // Expectativa de Salida (Exit Protocol)
  myExitProtocol: ExitProtocol;
  setMyExitProtocol: (protocol: ExitProtocol) => void;

  // Salas de Sesión & Modo Dúo
  sessionRooms: SessionRoom[];
  isSessionRoomModalOpen: boolean;
  openSessionRoomModal: () => void;
  closeSessionRoomModal: () => void;
  createSessionRoom: (room: Omit<SessionRoom, "id" | "hostProfileId" | "hostCodename" | "hostAvatarUrl" | "guestIds" | "isActive" | "createdAt">) => void;
  joinSessionRoom: (roomId: string) => void;
  leaveSessionRoom: (roomId: string) => void;
  isDuoModalOpen: boolean;
  openDuoModal: () => void;
  closeDuoModal: () => void;
  myDuoLink: DuoLink;
  linkDuoPartner: (partnerProfile: VesselProfile, jointTitle: string) => void;
  unlinkDuoPartner: () => void;

  // Hotspots Tácticos & Cruising
  tacticalHotspots: TacticalHotspot[];
  checkInHotspot: (hotspotId: string) => void;
  checkOutHotspot: (hotspotId: string) => void;
  selectedHotspot: TacticalHotspot | null;
  setSelectedHotspot: (hotspot: TacticalHotspot | null) => void;
  isHotspotsModalOpen: boolean;
  openHotspotsModal: () => void;
  closeHotspotsModal: () => void;
  checkinHotspot: (hotspotId: string) => void;

  // Suite Nightlife
  nightlifeEvents: NightlifeEvent[];
  activeCheckin: EventCheckin | null;
  missedConnections: MissedConnection[];
  wingmanPair: WingmanPair | null;
  partyPass: PartyPassState;
  isNightlifeModalOpen: boolean;
  openNightlifeModal: (preselectedEventId?: string) => void;
  closeNightlifeModal: () => void;
  toggleEventRsvp: (eventId: string, isStealth?: boolean) => void;
  checkInToEvent: (eventId: string, zone?: ClubZoneType, isIncognito?: boolean) => void;
  checkOutOfEvent: () => void;
  updateEventZone: (zone: ClubZoneType) => void;
  isMissedConnectionsModalOpen: boolean;
  openMissedConnectionsModal: () => void;
  closeMissedConnectionsModal: () => void;
  sendMissedConnectionPulse: (missedConnectionId: string, note?: string) => void;
  isOpticalBeaconOpen: boolean;
  openOpticalBeacon: () => void;
  closeOpticalBeacon: () => void;
  isAfterHoursModalOpen: boolean;
  openAfterHoursModal: () => void;
  closeAfterHoursModal: () => void;
  isWingmanModalOpen: boolean;
  openWingmanModal: () => void;
  closeWingmanModal: () => void;
  pairWingman: (partnerId: string, codename: string, avatarUrl: string, pin: string) => boolean;
  unpairWingman: () => void;
  updateWingmanStatus: (status: WingmanPair["status"]) => void;
  isSpikedAlertModalOpen: boolean;
  openSpikedAlertModal: () => void;
  closeSpikedAlertModal: () => void;
  triggerSpikedAlert: (customNotes?: string) => void;
  activatePartyPass: (eventId?: string) => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

interface LogisticsProviderProps {
  children: React.ReactNode;
  activeView?: ActiveNavView;
  onSendChatMessage?: (profileId: string, text: string) => void;
}

export const LogisticsProvider: React.FC<LogisticsProviderProps> = ({
  children,
  activeView = "grid",
  onSendChatMessage,
}) => {
  const { currentUserUid, myProfile, myBodyState } = useAuth();
  let appMode: "test" | "real" = "test";
  try {
    const settings = useSettings();
    if (settings && settings.appMode) appMode = settings.appMode;
  } catch {
    appMode = getActiveAppMode();
  }

  // Host Card
  const [myHostCard, setMyHostCard] = useState<HostCardInfo>(INITIAL_MY_HOST_CARD);
  const [isHostCardModalOpen, setIsHostCardModalOpen] = useState(false);
  const [selectedHostCardProfile, setSelectedHostCardProfile] = useState<VesselProfile | null>(null);

  // Voice Vibe
  const [myVoiceVibe, setMyVoiceVibe] = useState<VoiceSnippet | null>(null);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [activePlayingVoiceId, setActivePlayingVoiceId] = useState<string | null>(null);

  // En Route
  const [enRouteState, setEnRouteState] = useState<EnRouteState>(INITIAL_EN_ROUTE);
  const [isEnRouteModalOpen, setIsEnRouteModalOpen] = useState(false);

  // Geo & Battery
  const [geoPrivacyLevel, setGeoPrivacyLevelState] = useState<GeoPrivacyLevel>("exact_discretized");
  const [manualEcoSaver, setManualEcoSaver] = useState<boolean>(false);
  const [isGeoBatteryModalOpen, setIsGeoBatteryModalOpen] = useState<boolean>(false);
  const [myCoordinates, setMyCoordinates] = useState<{ lat: number; lng: number }>(() =>
    loadFromStorage<{ lat: number; lng: number }>(STORAGE_KEYS.COORDINATES, {
      lat: 52.52,
      lng: 13.405,
    })
  );
  const [myGeohashCell, setMyGeohashCell] = useState<GeohashCell>(() =>
    getGeohashCell(myCoordinates.lat, myCoordinates.lng, 7)
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isDocVisible, setIsDocVisible] = useState(true);
  const [batteryEngineState, setBatteryEngineState] = useState<BatteryEngineState>(INITIAL_BATTERY_STATE);

  const [travelMode, setTravelMode] = useState<TravelModeConfig>(INITIAL_TRAVEL_MODE);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);

  // Exit Protocol
  const [myExitProtocol, setMyExitProtocolState] = useState<ExitProtocol>("fast_encounter");

  // Sessions & Duo
  const [sessionRooms, setSessionRooms] = useState<SessionRoom[]>([]);
  const [isSessionRoomModalOpen, setIsSessionRoomModalOpen] = useState(false);
  const [myDuoLink, setMyDuoLink] = useState<DuoLink>(INITIAL_DUO_LINK);
  const [isDuoModalOpen, setIsDuoModalOpen] = useState(false);

  // Hotspots
  const [tacticalHotspots, setTacticalHotspots] = useState<TacticalHotspot[]>(() =>
    getActiveAppMode() === "real" ? [] : MOCK_HOTSPOTS
  );
  const [selectedHotspot, setSelectedHotspot] = useState<TacticalHotspot | null>(null);
  const [isHotspotsModalOpen, setIsHotspotsModalOpen] = useState(false);

  // Nightlife
  const [nightlifeEvents, setNightlifeEvents] = useState<NightlifeEvent[]>(() =>
    getActiveAppMode() === "real" ? [] : MOCK_NIGHTLIFE_EVENTS
  );
  const [activeCheckin, setActiveCheckin] = useState<EventCheckin | null>(null);
  const [missedConnections, setMissedConnections] = useState<MissedConnection[]>(() =>
    getActiveAppMode() === "real" ? [] : MOCK_INITIAL_MISSED_CONNECTIONS
  );
  const [wingmanPair, setWingmanPair] = useState<WingmanPair | null>(null);
  const [partyPass, setPartyPass] = useState<PartyPassState>({ isActive: false, expiresAt: null });

  const [isNightlifeModalOpen, setIsNightlifeModalOpen] = useState(false);
  const [isMissedConnectionsModalOpen, setIsMissedConnectionsModalOpen] = useState(false);
  const [isOpticalBeaconOpen, setIsOpticalBeaconOpen] = useState(false);
  const [isAfterHoursModalOpen, setIsAfterHoursModalOpen] = useState(false);
  const [isWingmanModalOpen, setIsWingmanModalOpen] = useState(false);
  const [isSpikedAlertModalOpen, setIsSpikedAlertModalOpen] = useState(false);

  // Hidratación local-first según el modo
  useEffect(() => {
    const localHostCard = loadFromStorage<HostCardInfo>(STORAGE_KEYS.HOST_CARD, INITIAL_MY_HOST_CARD, appMode);
    if (localHostCard) setMyHostCard(localHostCard);

    const localVoiceVibe = loadFromStorage<VoiceSnippet | null>(STORAGE_KEYS.VOICE_VIBE, null, appMode);
    if (localVoiceVibe) setMyVoiceVibe(localVoiceVibe);

    const localExitProtocol = loadFromStorage<ExitProtocol>(STORAGE_KEYS.EXIT_PROTOCOL, "fast_encounter", appMode);
    if (localExitProtocol) setMyExitProtocolState(localExitProtocol);

    const localDuoLink = loadFromStorage<DuoLink>(STORAGE_KEYS.DUO_LINK, INITIAL_DUO_LINK, appMode);
    if (localDuoLink) setMyDuoLink(localDuoLink);

    const localTravelMode = loadFromStorage<TravelModeConfig>(STORAGE_KEYS.TRAVEL_MODE, INITIAL_TRAVEL_MODE, appMode);
    if (localTravelMode) setTravelMode(localTravelMode);

    const fallbackNightlife = appMode === "real" ? [] : MOCK_NIGHTLIFE_EVENTS;
    const localNightlifeEvents = loadFromStorage<NightlifeEvent[]>(STORAGE_KEYS.NIGHTLIFE_EVENTS, fallbackNightlife, appMode);
    if (localNightlifeEvents) setNightlifeEvents(localNightlifeEvents);

    const localCheckin = loadFromStorage<EventCheckin | null>(STORAGE_KEYS.NIGHTLIFE_CHECKIN, null, appMode);
    if (localCheckin && new Date(localCheckin.expiresAt).getTime() > Date.now()) {
      setActiveCheckin(localCheckin);
    }

    const fallbackMissed = appMode === "real" ? [] : MOCK_INITIAL_MISSED_CONNECTIONS;
    const localMissed = loadFromStorage<MissedConnection[]>(STORAGE_KEYS.MISSED_CONNECTIONS, fallbackMissed, appMode);
    const validMissed = (localMissed || []).filter((m) => new Date(m.expiresAt).getTime() > Date.now());
    if (validMissed.length > 0) setMissedConnections(validMissed);

    const localWingman = loadFromStorage<WingmanPair | null>(STORAGE_KEYS.WINGMAN_PAIR, null, appMode);
    if (localWingman && localWingman.isActive) setWingmanPair(localWingman);

    const localPartyPass = loadFromStorage<PartyPassState>(STORAGE_KEYS.PARTY_PASS, { isActive: false, expiresAt: null }, appMode);
    if (localPartyPass.isActive && localPartyPass.expiresAt && new Date(localPartyPass.expiresAt).getTime() > Date.now()) {
      setPartyPass(localPartyPass);
    }
  }, [appMode]);

  // Sincronización en tiempo real de Hotspots urbanos desde Firestore
  useEffect(() => {
    const unsubscribe = subscribeToHotspots((cloudHotspots) => {
      setTacticalHotspots((prevLocal) => {
        const checkedInMap = new Map<string, boolean>();
        prevLocal.forEach((h) => {
          if (h.isCheckedIn) checkedInMap.set(h.id, true);
        });

        return cloudHotspots.map((spot) => ({
          ...spot,
          isCheckedIn: checkedInMap.has(spot.id),
        }));
      });
    }, appMode);

    return () => unsubscribe();
  }, [appMode]);

  // Sincronización con Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setIsDocVisible(visible);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Actualización reactiva del motor de batería
  useEffect(() => {
    const updateBattery = () => {
      const state = batteryStateEngine.resolveEngineState({
        isDocumentVisible: isDocVisible,
        myBodyState,
        manualEcoSaver,
        activeView,
      });
      setBatteryEngineState(state);
    };

    batteryStateEngine.initBatteryListener(updateBattery);
    updateBattery();
  }, [isDocVisible, myBodyState, manualEcoSaver, activeView]);

  // Actualizar Celda Geohash cuando cambian coordenadas
  useEffect(() => {
    setMyGeohashCell(getGeohashCell(myCoordinates.lat, myCoordinates.lng, 7));
  }, [myCoordinates]);

  const updateMyHostCard = useCallback((updates: Partial<HostCardInfo>) => {
    setMyHostCard((prev) => {
      const next = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      saveToStorage(STORAGE_KEYS.HOST_CARD, next);
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const openHostCardModal = useCallback((profile?: VesselProfile) => {
    setSelectedHostCardProfile(profile || null);
    setIsHostCardModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeHostCardModal = useCallback(() => {
    setIsHostCardModalOpen(false);
    setSelectedHostCardProfile(null);
  }, []);

  const openVoiceRecorder = useCallback(() => {
    setIsVoiceRecorderOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeVoiceRecorder = useCallback(() => {
    setIsVoiceRecorderOpen(false);
  }, []);

  const saveMyVoiceVibe = useCallback((snippet: VoiceSnippet) => {
    setMyVoiceVibe(snippet);
    saveToStorage(STORAGE_KEYS.VOICE_VIBE, snippet);
    setIsVoiceRecorderOpen(false);
    audioEngine.playSubBass(75);
  }, []);

  const deleteMyVoiceVibe = useCallback(() => {
    setMyVoiceVibe(null);
    removeFromStorage(STORAGE_KEYS.VOICE_VIBE);
    audioEngine.playPulse();
  }, []);

  const playVoiceVibe = useCallback((voice: VoiceSnippet) => {
    setActivePlayingVoiceId(voice.id);
    if (voice.audioUrl && voice.audioUrl.startsWith("data:")) {
      audioPlayerService.play(voice.audioUrl, voice.id);
      audioPlayerService.onStateChange = (state, id) => {
        if ((state === "ended" || state === "idle" || state === "error") && id === voice.id) {
          setActivePlayingVoiceId(null);
        }
      };
    } else {
      audioEngine.playSubBass(65);
      setTimeout(() => {
        setActivePlayingVoiceId((curr) => (curr === voice.id ? null : curr));
      }, (voice.durationSeconds || 5) * 1000);
    }
  }, []);

  const stopVoiceVibe = useCallback(() => {
    setActivePlayingVoiceId(null);
    audioPlayerService.stop();
  }, []);

  const openEnRouteModal = useCallback((targetProfile?: VesselProfile) => {
    if (targetProfile) {
      setEnRouteState((prev) => ({
        ...prev,
        targetProfileId: targetProfile.id,
        targetCodename: targetProfile.codename,
      }));
    }
    setIsEnRouteModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeEnRouteModal = useCallback(() => {
    setIsEnRouteModalOpen(false);
  }, []);

  const startEnRoute = useCallback(
    (targetProfile: VesselProfile, etaMinutes: number) => {
      let initialDist = targetProfile.distanceMeters || 1200;
      if (targetProfile.coordinates && myCoordinates) {
        const computedDist = calculateHaversineDistance(
          myCoordinates.lat,
          myCoordinates.lng,
          targetProfile.coordinates.lat,
          targetProfile.coordinates.lng
        );
        if (computedDist > 0) initialDist = computedDist;
      }

      const startedState: EnRouteState = {
        isActive: true,
        targetProfileId: targetProfile.id,
        targetCodename: targetProfile.codename,
        startedAt: new Date().toISOString(),
        etaMinutes,
        distanceMeters: initialDist,
        isArrived: false,
        destinationCoords: targetProfile.coordinates,
      };
      setEnRouteState(startedState);

      if (onSendChatMessage) {
        onSendChatMessage(
          targetProfile.id,
          `🚗 Voy en camino hacia el encuentro. Llegada estimada en ~${etaMinutes} min. Telemetría de viaje activa (${initialDist}m).`
        );
      }
      audioEngine.playSubBass(70);
      setIsEnRouteModalOpen(false);
    },
    [onSendChatMessage, myCoordinates]
  );

  const cancelEnRoute = useCallback(() => {
    if (enRouteState.targetProfileId && onSendChatMessage) {
      onSendChatMessage(enRouteState.targetProfileId, `⚠️ Notificación: He cancelado el trayecto en camino.`);
    }
    setEnRouteState(INITIAL_EN_ROUTE);
    audioEngine.playPulse();
  }, [enRouteState.targetProfileId, onSendChatMessage]);

  const arrivedEnRoute = useCallback(() => {
    setEnRouteState((prev) => ({ ...prev, isArrived: true, distanceMeters: 25 }));
    if (enRouteState.targetProfileId && onSendChatMessage) {
      onSendChatMessage(
        enRouteState.targetProfileId,
        `📍 ¡Llegué al domicilio! Estoy a menos de 50 metros en la puerta.`
      );
    }
    audioEngine.playSubBass(90);
  }, [enRouteState.targetProfileId, onSendChatMessage]);

  // Telemetría en Vivo de Viaje "En Camino" (Recálculo dinámico de ETA y Distancia)
  useEffect(() => {
    if (!enRouteState.isActive || enRouteState.isArrived || !enRouteState.startedAt) return;

    const startedTime = new Date(enRouteState.startedAt).getTime();
    const initialEta = enRouteState.etaMinutes || 15;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - startedTime) / 1000;
      const elapsedMinutes = elapsedSeconds / 60;
      const remainingMinutes = Math.max(0, Math.ceil(initialEta - elapsedMinutes));

      // 1. Si hay coordenadas de destino y del usuario, recalcular distancia en metros
      let currentDistance = enRouteState.distanceMeters;
      if (enRouteState.destinationCoords && myCoordinates) {
        currentDistance = calculateHaversineDistance(
          myCoordinates.lat,
          myCoordinates.lng,
          enRouteState.destinationCoords.lat,
          enRouteState.destinationCoords.lng
        );
      } else if (enRouteState.distanceMeters > 50) {
        // Reducción proporcional según tiempo transcurrido
        const ratio = Math.max(0.05, remainingMinutes / Math.max(1, initialEta));
        currentDistance = Math.max(40, Math.round(enRouteState.distanceMeters * ratio));
      }

      // 2. Comprobar auto-llegada (menos de 50 metros o tiempo agotado)
      if (currentDistance <= 50 || remainingMinutes <= 0) {
        arrivedEnRoute();
        return;
      }

      setEnRouteState((prev) => {
        if (!prev.isActive || prev.isArrived) return prev;
        return {
          ...prev,
          etaMinutes: remainingMinutes,
          distanceMeters: currentDistance,
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [
    enRouteState.isActive,
    enRouteState.isArrived,
    enRouteState.startedAt,
    enRouteState.destinationCoords,
    myCoordinates,
    arrivedEnRoute,
  ]);

  const setGeoPrivacyLevel = useCallback((level: GeoPrivacyLevel) => {
    setGeoPrivacyLevelState(level);
    audioEngine.playSignalSent();
  }, []);

  const toggleEcoSaverMode = useCallback(() => {
    setManualEcoSaver((prev) => !prev);
    audioEngine.playPulse();
  }, []);

  const refreshRealGeolocation = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Tu dispositivo o navegador no soporta geolocalización GPS.");
      audioEngine.playError();
      return false;
    }

    setIsLocating(true);
    setGeoError(null);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMyCoordinates(coords);
          saveToStorage(STORAGE_KEYS.COORDINATES, coords);
          setIsLocating(false);
          audioEngine.playSignalSent();
          resolve(true);
        },
        (err) => {
          setIsLocating(false);
          let msg = "No se pudo obtener la posición GPS.";
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Permiso de ubicación GPS denegado por el usuario.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = "Señal GPS no disponible actualmente.";
          } else if (err.code === err.TIMEOUT) {
            msg = "Tiempo de espera agotado al consultar GPS.";
          }
          setGeoError(msg);
          audioEngine.playError();
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, []);

  const openGeoBatteryModal = useCallback(() => setIsGeoBatteryModalOpen(true), []);
  const closeGeoBatteryModal = useCallback(() => setIsGeoBatteryModalOpen(false), []);

  const toggleTravelMode = useCallback(() => {
    setTravelMode((prev) => {
      const next = { ...prev, isActive: !prev.isActive };
      saveToStorage(STORAGE_KEYS.TRAVEL_MODE, next);
      return next;
    });
    audioEngine.playSubBass(80);
  }, []);

  const updateTravelCity = useCallback(
    (cityName: string, country: string, coords: { lat: number; lng: number }) => {
      const next: TravelModeConfig = {
        isActive: true,
        cityName,
        country,
        virtualCoords: coords,
      };
      setTravelMode(next);
      saveToStorage(STORAGE_KEYS.TRAVEL_MODE, next);
      audioEngine.playPulse();
    },
    []
  );

  const openTravelModal = useCallback(() => setIsTravelModalOpen(true), []);
  const closeTravelModal = useCallback(() => setIsTravelModalOpen(false), []);

  const setTravelModeCity = updateTravelCity;

  const resetTravelMode = useCallback(() => {
    const next: TravelModeConfig = {
      isActive: false,
      cityName: "",
      country: "",
      virtualCoords: { lat: 0, lng: 0 },
    };
    setTravelMode(next);
    saveToStorage(STORAGE_KEYS.TRAVEL_MODE, next);
    audioEngine.playPulse();
  }, []);

  const setMyExitProtocol = useCallback((protocol: ExitProtocol) => {
    setMyExitProtocolState(protocol);
    saveToStorage(STORAGE_KEYS.EXIT_PROTOCOL, protocol);
    audioEngine.playPulse();
  }, []);

  const openSessionRoomModal = useCallback(() => {
    setIsSessionRoomModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeSessionRoomModal = useCallback(() => {
    setIsSessionRoomModalOpen(false);
  }, []);

  const createSessionRoom = useCallback(
    (roomData: Omit<SessionRoom, "id" | "hostProfileId" | "hostCodename" | "hostAvatarUrl" | "guestIds" | "isActive" | "createdAt">) => {
      const newRoom: SessionRoom = {
        id: `room-${Date.now()}`,
        hostProfileId: currentUserUid,
        hostCodename: myProfile.codename,
        hostAvatarUrl: myProfile.avatarUrl,
        title: roomData.title,
        description: roomData.description,
        category: roomData.category,
        capacity: roomData.capacity,
        guestIds: [currentUserUid],
        locationName: roomData.locationName,
        isActive: true,
        createdAt: "Ahora",
      };
      setSessionRooms((prev) => [newRoom, ...prev]);
      setIsSessionRoomModalOpen(false);
      audioEngine.playSubBass(85);
    },
    [currentUserUid, myProfile.codename, myProfile.avatarUrl]
  );

  const joinSessionRoom = useCallback(
    (roomId: string) => {
      setSessionRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId && !r.guestIds.includes(currentUserUid)) {
            return { ...r, guestIds: [...r.guestIds, currentUserUid] };
          }
          return r;
        })
      );
      audioEngine.playSubBass(75);
    },
    [currentUserUid]
  );

  const leaveSessionRoom = useCallback(
    (roomId: string) => {
      setSessionRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            return { ...r, guestIds: r.guestIds.filter((id) => id !== currentUserUid) };
          }
          return r;
        })
      );
      audioEngine.playPulse();
    },
    [currentUserUid]
  );

  const openDuoModal = useCallback(() => {
    setIsDuoModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeDuoModal = useCallback(() => {
    setIsDuoModalOpen(false);
  }, []);

  const linkDuoPartner = useCallback((partnerProfile: VesselProfile, jointTitle: string) => {
    const nextDuo: DuoLink = {
      isLinked: true,
      partnerProfileId: partnerProfile.id,
      partnerCodename: partnerProfile.codename,
      partnerAvatarUrl: partnerProfile.avatarUrl,
      jointTitle,
    };
    setMyDuoLink(nextDuo);
    saveToStorage(STORAGE_KEYS.DUO_LINK, nextDuo);
    audioEngine.playSubBass(80);
    setIsDuoModalOpen(false);
  }, []);

  const unlinkDuoPartner = useCallback(() => {
    setMyDuoLink(INITIAL_DUO_LINK);
    removeFromStorage(STORAGE_KEYS.DUO_LINK);
    audioEngine.playPulse();
    setIsDuoModalOpen(false);
  }, []);

  const openHotspotsModal = useCallback(() => {
    setIsHotspotsModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeHotspotsModal = useCallback(() => {
    setIsHotspotsModalOpen(false);
  }, []);

  const checkInHotspot = useCallback((hotspotId: string) => {
    setTacticalHotspots((prev) =>
      prev.map((h) =>
        h.id === hotspotId
          ? { ...h, isCheckedIn: true, activeVesselsCount: h.activeVesselsCount + 1 }
          : h
      )
    );
    audioEngine.playSubBass(70);
    checkInHotspotCloud(hotspotId).catch((err) => {
      console.warn("Fallo al registrar check-in en Firestore:", err);
    });
  }, []);

  const checkOutHotspot = useCallback((hotspotId: string) => {
    setTacticalHotspots((prev) =>
      prev.map((h) =>
        h.id === hotspotId
          ? { ...h, isCheckedIn: false, activeVesselsCount: Math.max(0, h.activeVesselsCount - 1) }
          : h
      )
    );
    audioEngine.playPulse();
    checkOutHotspotCloud(hotspotId).catch((err) => {
      console.warn("Fallo al registrar check-out en Firestore:", err);
    });
  }, []);

  const checkinHotspot = checkInHotspot;

  const openNightlifeModal = useCallback((preselectedEventId?: string) => {
    setIsNightlifeModalOpen(true);
  }, []);

  const closeNightlifeModal = useCallback(() => {
    setIsNightlifeModalOpen(false);
  }, []);

  const toggleEventRsvp = useCallback((eventId: string, isStealth: boolean = false) => {
    setNightlifeEvents((prev) => {
      const next = prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const myId = currentUserUid || "my-user-id";
        const isAlreadyGoing = ev.confirmedAttendees.includes(myId);
        let updatedAttendees: string[];
        if (isAlreadyGoing) {
          updatedAttendees = ev.confirmedAttendees.filter((id) => id !== myId);
        } else {
          updatedAttendees = [...ev.confirmedAttendees, myId];
        }
        return {
          ...ev,
          confirmedAttendees: updatedAttendees,
          activeAttendeesCount: updatedAttendees.length,
        };
      });
      saveToStorage(STORAGE_KEYS.NIGHTLIFE_EVENTS, next);
      return next;
    });
    audioEngine.playSubBass(60);
  }, [currentUserUid]);

  const checkInToEvent = useCallback((eventId: string, zone: ClubZoneType = "dancefloor", isIncognito: boolean = false) => {
    const ev = nightlifeEvents.find((e) => e.id === eventId);
    if (!ev) return;
    const newCheckin: EventCheckin = {
      eventId,
      eventName: ev.name,
      venueName: ev.venueName,
      zone,
      checkedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      isIncognito,
    };
    setActiveCheckin(newCheckin);
    saveToStorage(STORAGE_KEYS.NIGHTLIFE_CHECKIN, newCheckin);
    audioEngine.playSubBass(75);
  }, [nightlifeEvents]);

  const checkOutOfEvent = useCallback(() => {
    setActiveCheckin(null);
    removeFromStorage(STORAGE_KEYS.NIGHTLIFE_CHECKIN);
    audioEngine.playSubBass(45);
  }, []);

  const updateEventZone = useCallback((zone: ClubZoneType) => {
    setActiveCheckin((prev) => {
      if (!prev) return null;
      const next = { ...prev, zone };
      saveToStorage(STORAGE_KEYS.NIGHTLIFE_CHECKIN, next);
      return next;
    });
  }, []);

  const openMissedConnectionsModal = useCallback(() => {
    setIsMissedConnectionsModalOpen(true);
  }, []);

  const closeMissedConnectionsModal = useCallback(() => {
    setIsMissedConnectionsModalOpen(false);
  }, []);

  const sendMissedConnectionPulse = useCallback((missedConnectionId: string, note?: string) => {
    setMissedConnections((prev) => {
      const next = prev.map((conn) => {
        if (conn.id !== missedConnectionId) return conn;
        return {
          ...conn,
          pulseSent: true,
          pulseNote: note || "Te vi en la pista // Pulso de reencuentro",
        };
      });
      saveToStorage(STORAGE_KEYS.MISSED_CONNECTIONS, next);
      return next;
    });
    audioEngine.playSubBass(80);
  }, []);

  const openOpticalBeacon = useCallback(() => {
    setIsOpticalBeaconOpen(true);
  }, []);

  const closeOpticalBeacon = useCallback(() => {
    setIsOpticalBeaconOpen(false);
  }, []);

  const openAfterHoursModal = useCallback(() => {
    setIsAfterHoursModalOpen(true);
  }, []);

  const closeAfterHoursModal = useCallback(() => {
    setIsAfterHoursModalOpen(false);
  }, []);

  const openWingmanModal = useCallback(() => {
    setIsWingmanModalOpen(true);
  }, []);

  const closeWingmanModal = useCallback(() => {
    setIsWingmanModalOpen(false);
  }, []);

  const pairWingman = useCallback((partnerId: string, codename: string, avatarUrl: string, pin: string) => {
    const newPair: WingmanPair = {
      isActive: true,
      partnerId,
      partnerCodename: codename,
      partnerAvatarUrl: avatarUrl,
      pinCode: pin,
      pairedAt: new Date().toISOString(),
      lastSafetyCheckAt: new Date().toISOString(),
      status: "partying_together",
    };
    setWingmanPair(newPair);
    saveToStorage(STORAGE_KEYS.WINGMAN_PAIR, newPair);
    audioEngine.playSubBass(65);
    return true;
  }, []);

  const unpairWingman = useCallback(() => {
    setWingmanPair(null);
    removeFromStorage(STORAGE_KEYS.WINGMAN_PAIR);
  }, []);

  const updateWingmanStatus = useCallback((status: WingmanPair["status"]) => {
    setWingmanPair((prev) => {
      if (!prev) return null;
      const next = { ...prev, status, lastSafetyCheckAt: new Date().toISOString() };
      saveToStorage(STORAGE_KEYS.WINGMAN_PAIR, next);
      return next;
    });
  }, []);

  const openSpikedAlertModal = useCallback(() => {
    setIsSpikedAlertModalOpen(true);
  }, []);

  const closeSpikedAlertModal = useCallback(() => {
    setIsSpikedAlertModalOpen(false);
  }, []);

  const triggerSpikedAlert = useCallback((customNotes?: string) => {
    audioEngine.playSubBass(85);
    if (wingmanPair) {
      updateWingmanStatus("needs_help");
    }
  }, [wingmanPair, updateWingmanStatus]);

  const activatePartyPass = useCallback((eventId?: string) => {
    const newPass: PartyPassState = {
      isActive: true,
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      eventId,
    };
    setPartyPass(newPass);
    saveToStorage(STORAGE_KEYS.PARTY_PASS, newPass);
    audioEngine.playSubBass(70);
  }, []);

  const value = useMemo<LogisticsContextType>(
    () => ({
      myHostCard,
      updateMyHostCard,
      isHostCardModalOpen,
      selectedHostCardProfile,
      openHostCardModal,
      closeHostCardModal,
      myVoiceVibe,
      isVoiceRecorderOpen,
      openVoiceRecorder,
      closeVoiceRecorder,
      saveMyVoiceVibe,
      deleteMyVoiceVibe,
      activePlayingVoiceId,
      playVoiceVibe,
      stopVoiceVibe,
      enRouteState,
      isEnRouteModalOpen,
      openEnRouteModal,
      closeEnRouteModal,
      startEnRoute,
      cancelEnRoute,
      arrivedEnRoute,
      geoPrivacyLevel,
      setGeoPrivacyLevel,
      batteryEngineState,
      manualEcoSaver,
      toggleEcoSaverMode,
      myGeohashCell,
      myCoordinates,
      isGeoBatteryModalOpen,
      openGeoBatteryModal,
      closeGeoBatteryModal,
      travelMode,
      toggleTravelMode,
      updateTravelCity,
      setTravelModeCity,
      resetTravelMode,
      isTravelModalOpen,
      openTravelModal,
      closeTravelModal,
      isLocating,
      geoError,
      refreshRealGeolocation,
      myExitProtocol,
      setMyExitProtocol,
      sessionRooms,
      isSessionRoomModalOpen,
      openSessionRoomModal,
      closeSessionRoomModal,
      createSessionRoom,
      joinSessionRoom,
      leaveSessionRoom,
      isDuoModalOpen,
      openDuoModal,
      closeDuoModal,
      myDuoLink,
      linkDuoPartner,
      unlinkDuoPartner,
      tacticalHotspots,
      checkInHotspot,
      checkOutHotspot,
      selectedHotspot,
      setSelectedHotspot,
      isHotspotsModalOpen,
      openHotspotsModal,
      closeHotspotsModal,
      checkinHotspot,
      nightlifeEvents,
      activeCheckin,
      missedConnections,
      wingmanPair,
      partyPass,
      isNightlifeModalOpen,
      openNightlifeModal,
      closeNightlifeModal,
      toggleEventRsvp,
      checkInToEvent,
      checkOutOfEvent,
      updateEventZone,
      isMissedConnectionsModalOpen,
      openMissedConnectionsModal,
      closeMissedConnectionsModal,
      sendMissedConnectionPulse,
      isOpticalBeaconOpen,
      openOpticalBeacon,
      closeOpticalBeacon,
      isAfterHoursModalOpen,
      openAfterHoursModal,
      closeAfterHoursModal,
      isWingmanModalOpen,
      openWingmanModal,
      closeWingmanModal,
      pairWingman,
      unpairWingman,
      updateWingmanStatus,
      isSpikedAlertModalOpen,
      openSpikedAlertModal,
      closeSpikedAlertModal,
      triggerSpikedAlert,
      activatePartyPass,
    }),
    [
      myHostCard,
      updateMyHostCard,
      isHostCardModalOpen,
      selectedHostCardProfile,
      openHostCardModal,
      closeHostCardModal,
      myVoiceVibe,
      isVoiceRecorderOpen,
      openVoiceRecorder,
      closeVoiceRecorder,
      saveMyVoiceVibe,
      deleteMyVoiceVibe,
      activePlayingVoiceId,
      playVoiceVibe,
      stopVoiceVibe,
      enRouteState,
      isEnRouteModalOpen,
      openEnRouteModal,
      closeEnRouteModal,
      startEnRoute,
      cancelEnRoute,
      arrivedEnRoute,
      geoPrivacyLevel,
      setGeoPrivacyLevel,
      batteryEngineState,
      manualEcoSaver,
      toggleEcoSaverMode,
      myGeohashCell,
      myCoordinates,
      isGeoBatteryModalOpen,
      openGeoBatteryModal,
      closeGeoBatteryModal,
      travelMode,
      toggleTravelMode,
      updateTravelCity,
      resetTravelMode,
      isTravelModalOpen,
      openTravelModal,
      closeTravelModal,
      isLocating,
      geoError,
      refreshRealGeolocation,
      myExitProtocol,
      setMyExitProtocol,
      sessionRooms,
      isSessionRoomModalOpen,
      openSessionRoomModal,
      closeSessionRoomModal,
      createSessionRoom,
      joinSessionRoom,
      leaveSessionRoom,
      isDuoModalOpen,
      openDuoModal,
      closeDuoModal,
      myDuoLink,
      linkDuoPartner,
      unlinkDuoPartner,
      tacticalHotspots,
      selectedHotspot,
      isHotspotsModalOpen,
      openHotspotsModal,
      closeHotspotsModal,
      checkinHotspot,
      nightlifeEvents,
      activeCheckin,
      missedConnections,
      wingmanPair,
      partyPass,
      isNightlifeModalOpen,
      openNightlifeModal,
      closeNightlifeModal,
      toggleEventRsvp,
      checkInToEvent,
      checkOutOfEvent,
      updateEventZone,
      isMissedConnectionsModalOpen,
      openMissedConnectionsModal,
      closeMissedConnectionsModal,
      sendMissedConnectionPulse,
      isOpticalBeaconOpen,
      openOpticalBeacon,
      closeOpticalBeacon,
      isAfterHoursModalOpen,
      openAfterHoursModal,
      closeAfterHoursModal,
      isWingmanModalOpen,
      openWingmanModal,
      closeWingmanModal,
      pairWingman,
      unpairWingman,
      updateWingmanStatus,
      isSpikedAlertModalOpen,
      openSpikedAlertModal,
      closeSpikedAlertModal,
      triggerSpikedAlert,
      activatePartyPass,
    ]
  );

  return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>;
};

export const useLogistics = (): LogisticsContextType => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error("useLogistics must be used within a LogisticsProvider");
  }
  return context;
};
