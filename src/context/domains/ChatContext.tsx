"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChatMessage,
  ChatMediaAttachment,
  RendezvousPin,
  UserBoundarySetting,
  PreFlightChecklist,
  SecureWaypoint,
  VesselProfile,
  EncounterTicket,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  subscribeToChatMessages,
  subscribeToUserActiveChats,
  sendCloudMessage,
  burnCloudMessage,
  revokeCloudSharedAlbum,
  syncBoundarySetting,
  markCloudMessagesAsRead,
} from "@/lib/firebase/chatService";
import {
  loadFromStorage,
  saveToStorage,
  scheduleDeferredSave,
  loadHeavyCollection,
  STORAGE_KEYS,
} from "@/lib/storage/localStorageSync";
import { BOUNDARY_PROTOCOLS_CATALOG } from "@/data/energyCatalog";
import { fetchPublicProfileById } from "@/lib/firebase/profileService";
import { useAuth } from "./AuthContext";

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
const INITIAL_BOUNDARIES: Record<string, UserBoundarySetting> = {};

const persistChatMessages = (next: Record<string, ChatMessage[]>) => {
  scheduleDeferredSave(STORAGE_KEYS.CHAT_MESSAGES, next, 100);
};

export interface ChatContextType {
  chatMessages: Record<string, ChatMessage[]>;
  unreadMessagesCount: number;
  activeChatProfileId: string | null;
  setActiveChatProfileId: (id: string | null) => void;
  markMessagesAsRead: (profileId: string) => void;
  sendChatMessage: (profileId: string, text: string, isBurnOnView?: boolean) => void;
  retryChatMessage: (profileId: string, messageId: string) => void;
  sendVoiceMessage: (profileId: string, audioDataUri: string, durationSeconds: number, waveform: number[], isBurnOnView?: boolean) => void;
  sendMediaChatMessage: (profileId: string, media: ChatMediaAttachment, text?: string) => void;
  sendKindClosureMessage: (profileId: string, messageText: string) => void;
  sendRendezvousPin: (profileId: string, profileCodename?: string, distanceMeters?: number) => void;
  burnMessage: (profileId: string, messageId: string) => void;
  burnMediaMessage: (profileId: string, messageId: string) => void;
  markMediaMessageAsViewed: (profileId: string, messageId: string) => void;
  revokeAlbumAccessInChat: (targetProfileId: string, albumId: string, messageId?: string) => void;
  unrevokeAlbumAccessInChat: (targetProfileId: string, albumId: string, messageId?: string) => void;
  revokeAlbumAccessGlobally: (albumId: string) => void;
  getSharedChatIdsForAlbum: (albumId: string) => string[];
  clearChatHistory: (profileId: string) => void;
  chatRetentionMode: "ephemeral" | "persistent";
  perChatRetention: Record<string, "ephemeral" | "persistent">;
  getChatRetentionForProfile: (profileId: string) => "ephemeral" | "persistent";
  toggleChatRetention: (profileId?: string) => void;
  activeRendezvous: RendezvousPin | null;
  dismissRendezvous: () => void;
  cancelRendezvousPin: (profileId: string) => void;
  boundaries: Record<string, UserBoundarySetting>;
  applyBoundaryProtocol: (targetProfileId: string, setting: Partial<UserBoundarySetting>) => void;
  removeBoundaryProtocol: (targetProfileId: string) => void;
  getBoundaryForProfile: (targetProfileId: string) => UserBoundarySetting | null;
  isBoundaryModalOpen: boolean;
  boundaryModalTargetProfileId: string | null;
  openBoundaryModal: (profileId: string) => void;
  closeBoundaryModal: () => void;
  isPreFlightModalOpen: boolean;
  preFlightTargetProfile: VesselProfile | null;
  openPreFlightModal: (profile: VesselProfile) => void;
  closePreFlightModal: () => void;
  sendPreFlightChecklist: (
    profileId: string,
    checklist: Omit<PreFlightChecklist, "id" | "senderId" | "receiverId" | "createdAt">
  ) => void;
  sendEncounterTicketMessage: (profileId: string, ticket: EncounterTicket) => void;
  isSendMediaModalOpen: boolean;
  openSendMediaModal: () => void;
  closeSendMediaModal: () => void;
  activeMediaViewerAttachment: ChatMediaAttachment | null;
  openMediaViewer: (media: ChatMediaAttachment) => void;
  closeMediaViewer: () => void;
  secureWaypoints: Record<string, SecureWaypoint>;
  sendSecureWaypoint: (
    targetProfileId: string,
    phase1Corner: string,
    phase2Address: string,
    accessNotes?: string
  ) => void;
  unlockPhase2Waypoint: (waypointId: string, targetProfileId: string) => void;
  cancelSecureWaypoint: (waypointId: string, targetProfileId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
  onRevokeVault?: (targetProfileId: string) => void;
  onRespectBoost?: () => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  onRevokeVault,
  onRespectBoost,
}) => {
  const { authUser, currentUserUid, myProfile } = useAuth();

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const chatMessagesRef = useRef(chatMessages);
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);
  const [activeChatProfileId, setActiveChatProfileId] = useState<string | null>(null);
  const [discoveredPartnerIds, setDiscoveredPartnerIds] = useState<string[]>([]);
  const [chatRetentionMode, setChatRetentionMode] = useState<"ephemeral" | "persistent">("persistent");
  const [perChatRetention, setPerChatRetention] = useState<Record<string, "ephemeral" | "persistent">>({});
  const [activeRendezvous, setActiveRendezvous] = useState<RendezvousPin | null>(null);

  const [boundaries, setBoundaries] = useState<Record<string, UserBoundarySetting>>(INITIAL_BOUNDARIES);
  const [isBoundaryModalOpen, setIsBoundaryModalOpen] = useState(false);
  const [boundaryModalTargetProfileId, setBoundaryModalTargetProfileId] = useState<string | null>(null);

  const [isPreFlightModalOpen, setIsPreFlightModalOpen] = useState(false);
  const [preFlightTargetProfile, setPreFlightTargetProfile] = useState<VesselProfile | null>(null);

  const [isSendMediaModalOpen, setIsSendMediaModalOpen] = useState(false);
  const [activeMediaViewerAttachment, setActiveMediaViewerAttachment] = useState<ChatMediaAttachment | null>(null);

  const [secureWaypoints, setSecureWaypoints] = useState<Record<string, SecureWaypoint>>({});

  const unreadMessagesCount = useMemo(() => {
    let count = 0;
    const allMsgs = Object.values(chatMessages);
    for (let i = 0; i < allMsgs.length; i++) {
      const thread = allMsgs[i];
      for (let j = 0; j < thread.length; j++) {
        const m = thread[j];
        if (m.senderId !== "me" && m.senderId !== "system" && !m.isRead) {
          count++;
        }
      }
    }
    return count;
  }, [chatMessages]);

  // Hidratación local-first
  useEffect(() => {
    const localChatMessages = loadFromStorage<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_MESSAGES);
    if (localChatMessages && Object.keys(localChatMessages).length > 0) setChatMessages(localChatMessages);

    // Hidratación profunda asíncrona desde IndexedDB para colecciones voluminosas (>5MB)
    loadHeavyCollection<Record<string, ChatMessage[]>>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_MESSAGES)
      .then((idbMessages) => {
        if (idbMessages && Object.keys(idbMessages).length > 0) {
          setChatMessages((prev) => ({ ...idbMessages, ...prev }));
        }
      })
      .catch(() => {});

    const localChatRetention = loadFromStorage<"ephemeral" | "persistent">(STORAGE_KEYS.CHAT_RETENTION, "persistent");
    if (localChatRetention) setChatRetentionMode(localChatRetention);

    const localPerChat = loadFromStorage<Record<string, "ephemeral" | "persistent">>(STORAGE_KEYS.CHAT_RETENTION + "_per_chat", {});
    if (localPerChat && Object.keys(localPerChat).length > 0) setPerChatRetention(localPerChat);

    const localBoundaries = loadFromStorage<Record<string, UserBoundarySetting>>(STORAGE_KEYS.BOUNDARIES, INITIAL_BOUNDARIES);
    if (localBoundaries && Object.keys(localBoundaries).length > 0) setBoundaries(localBoundaries);

    const localWaypoints = loadFromStorage<Record<string, SecureWaypoint>>(STORAGE_KEYS.SECURE_WAYPOINTS, {});
    if (localWaypoints) setSecureWaypoints(localWaypoints);
  }, []);

  // Descubrimiento en tiempo real de todos los canales de chat donde participa el usuario
  useEffect(() => {
    if (!authUser || authUser.uid === "local-user") return;
    const unsubActiveChats = subscribeToUserActiveChats(authUser.uid, (partnerUids) => {
      setDiscoveredPartnerIds(partnerUids);
    });
    return () => {
      unsubActiveChats();
    };
  }, [authUser]);

  // Hidratar perfiles públicos de interlocutores descubiertos en almacenamiento conocido
  useEffect(() => {
    if (!authUser || authUser.uid === "local-user" || discoveredPartnerIds.length === 0) return;
    discoveredPartnerIds.forEach((pid) => {
      if (pid === "me" || pid === "system") return;
      fetchPublicProfileById(pid)
        .then((fetched) => {
          if (fetched) {
            const current = loadFromStorage<Record<string, VesselProfile>>(STORAGE_KEYS.KNOWN_PROFILES, {});
            if (
              !current[pid] ||
              current[pid].avatarUrl !== fetched.avatarUrl ||
              current[pid].codename !== fetched.codename
            ) {
              saveToStorage(STORAGE_KEYS.KNOWN_PROFILES, { ...current, [pid]: fetched });
            }
          }
        })
        .catch(() => {});
    });
  }, [discoveredPartnerIds, authUser]);

  // Suscripción en tiempo real a mensajes para todos los chats activos descubiertos y el chat abierto
  useEffect(() => {
    if (!authUser || authUser.uid === "local-user") return;

    const myUid = authUser.uid;
    const allTargets = new Set<string>(discoveredPartnerIds);
    if (activeChatProfileId) allTargets.add(activeChatProfileId);

    if (allTargets.size === 0) return;

    const unsubscribers: (() => void)[] = [];

    allTargets.forEach((targetUid) => {
      const chatId = [myUid, targetUid].sort().join("_");
      const unsub = subscribeToChatMessages(chatId, (cloudMsgs) => {
        if (!cloudMsgs || cloudMsgs.length === 0) return;
        const unreadCloudIdsToMark: string[] = [];

        const currentLocal = chatMessagesRef.current[targetUid] || [];
        const existingIds = new Set(currentLocal.map((m) => m.id));
        const hasNewIncoming = cloudMsgs.some((m) => {
          const isFromMe = m.senderId === myUid || m.senderId === "me";
          return !existingIds.has(m.id) && !isFromMe;
        });

        setChatMessages((prev) => {
          const localList = prev[targetUid] || [];
          const mergedMap = new Map<string, ChatMessage>();
          localList.forEach((m) => mergedMap.set(m.id, m));
          cloudMsgs.forEach((m) => {
            const existing = mergedMap.get(m.id);
            const isFromMe = m.senderId === myUid || m.senderId === "me";
            const isRead = Boolean(
              existing?.isRead || m.isRead || isFromMe || activeChatProfileId === targetUid
            );
            if (activeChatProfileId === targetUid && !isFromMe && !m.isRead) {
              unreadCloudIdsToMark.push(m.id);
            }
            mergedMap.set(m.id, {
              ...m,
              senderId: isFromMe ? "me" : m.senderId,
              isRead,
            });
          });

          const mergedList = Array.from(mergedMap.values());
          const next = { ...prev, [targetUid]: mergedList };
          persistChatMessages(next);
          return next;
        });

        if (hasNewIncoming) {
          audioEngine.playChatMessageSound();
        }

        if (unreadCloudIdsToMark.length > 0 && authUser && authUser.uid !== "local-user") {
          markCloudMessagesAsRead(chatId, unreadCloudIdsToMark).catch(() => {});
        }
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }, [activeChatProfileId, discoveredPartnerIds, authUser]);

  const getChatChannelId = useCallback((targetProfileId: string) => {
    const myUid = authUser?.uid || "local-user";
    return [myUid, targetProfileId].sort().join("_");
  }, [authUser]);

  const markMessagesAsRead = useCallback((profileId: string) => {
    let unreadIds: string[] = [];
    setChatMessages((prev) => {
      const msgs = prev[profileId];
      if (!msgs || msgs.length === 0) return prev;
      let hasUnread = false;
      const updated = msgs.map((m) => {
        if (m.senderId !== "me" && m.senderId !== "system" && !m.isRead) {
          hasUnread = true;
          unreadIds.push(m.id);
          return { ...m, isRead: true };
        }
        return m;
      });
      if (!hasUnread) return prev;
      const next = { ...prev, [profileId]: updated };
      persistChatMessages(next);
      return next;
    });

    if (authUser && authUser.uid !== "local-user" && unreadIds.length > 0) {
      const chatId = getChatChannelId(profileId);
      markCloudMessagesAsRead(chatId, unreadIds).catch((err) => {
        console.error("[ChatContext] Failed to mark messages as read in cloud:", err);
      });
    }
  }, [authUser, getChatChannelId]);

  const sendChatMessage = useCallback(
    (profileId: string, text: string, isBurnOnView = false) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: "me",
        text,
        isBurnOnView,
        isBurned: false,
        isRead: true,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), newMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: text ?? "",
            isBurnOnView: isBurnOnView || false,
            isBurned: false,
            isRead: false,
            timestamp: newMsg.timestamp,
          },
          newMsg.id
        ).catch((err) => {
          console.warn("[ChatContext] Sync cloud message error, marking failed:", err);
          setChatMessages((prev) => {
            const list = prev[profileId] || [];
            const updated = list.map((m) => (m.id === newMsg.id ? { ...m, isFailed: true, deliveryStatus: "failed" as const } : m));
            const next = { ...prev, [profileId]: updated };
            persistChatMessages(next);
            return next;
          });
        });
      }

      audioEngine.playChatMessageSound();
    },
    [authUser, getChatChannelId]
  );

  const retryChatMessage = useCallback(
    (profileId: string, messageId: string) => {
      const msg = (chatMessages[profileId] || []).find((m) => m.id === messageId);
      if (!msg) return;

      setChatMessages((prev) => {
        const list = prev[profileId] || [];
        const updated = list.map((m) =>
          m.id === messageId
            ? {
                ...m,
                isFailed: false,
                deliveryStatus: "sending" as const,
                timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
              }
            : m
        );
        const next = { ...prev, [profileId]: updated };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: msg.text ?? "",
            isBurnOnView: msg.isBurnOnView || false,
            isBurned: false,
            isRead: false,
            timestamp: msg.timestamp,
          },
          msg.id
        )
          .then(() => {
            setChatMessages((prev) => {
              const list = prev[profileId] || [];
              const updated = list.map((m) => (m.id === messageId ? { ...m, isFailed: false, deliveryStatus: "sent" as const } : m));
              const next = { ...prev, [profileId]: updated };
              persistChatMessages(next);
              return next;
            });
          })
          .catch((err) => {
            console.warn("[ChatContext] Retry cloud message error:", err);
            setChatMessages((prev) => {
              const list = prev[profileId] || [];
              const updated = list.map((m) => (m.id === messageId ? { ...m, isFailed: true, deliveryStatus: "failed" as const } : m));
              const next = { ...prev, [profileId]: updated };
              persistChatMessages(next);
              return next;
            });
          });
      } else {
        audioEngine.playChatMessageSound();
      }
    },
    [chatMessages, authUser, getChatChannelId]
  );

  const sendVoiceMessage = useCallback(
    (profileId: string, audioDataUri: string, durationSeconds: number, waveform: number[], isBurnOnView = false) => {
      const newMsg: ChatMessage = {
        id: `msg-voice-${Date.now()}`,
        senderId: "me",
        isVoiceMessage: true,
        voiceData: { audioUrl: audioDataUri, durationSeconds, waveform },
        isBurnOnView,
        isBurned: false,
        isRead: true,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), newMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            isVoiceMessage: true,
            voiceData: { audioUrl: audioDataUri, durationSeconds, waveform },
            isBurnOnView: isBurnOnView || false,
            isBurned: false,
            isRead: false,
            timestamp: newMsg.timestamp,
          },
          newMsg.id
        ).catch((err) => console.warn("Sync cloud message error:", err));
      }

      audioEngine.playChatMessageSound();
    },
    [authUser, getChatChannelId]
  );

  const sendKindClosureMessage = useCallback(
    (profileId: string, messageText: string) => {
      const newMsg: ChatMessage = {
        id: `msg-kc-${Date.now()}`,
        senderId: "me",
        text: messageText,
        isKindClosure: true,
        isBurnOnView: false,
        isBurned: false,
        isRead: true,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };

      const sysMsg: ChatMessage = {
        id: `sys-respect-${Date.now()}`,
        senderId: "system",
        text: "⚡ PROTOCOLO CERO PLANTONES CUMPLIDO // +5 Puntos de Respeto sumados a tu perfil. Mayor visibilidad en el radar.",
        isRead: true,
        timestamp: "Ahora",
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), newMsg, sysMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: messageText,
            isKindClosure: true,
            isBurnOnView: false,
            isBurned: false,
            isRead: false,
            timestamp: newMsg.timestamp,
          },
          newMsg.id
        ).catch((err) => console.warn("Sync kind closure cloud error:", err));
      }

      if (onRespectBoost) {
        onRespectBoost();
      }

      audioEngine.playVaultUnlock();
    },
    [authUser, getChatChannelId, onRespectBoost]
  );

  const sendRendezvousPin = useCallback(
    (profileId: string, profileCodename?: string, distanceMeters?: number) => {
      const pin: RendezvousPin = {
        id: `pin-${Date.now()}`,
        profileId,
        profileCodename: profileCodename || "Contacto",
        locationName: "Zona Oscura // Coordenada Temporal Cifrada",
        distanceMeters: distanceMeters || 300,
        expiresInMinutes: 15,
        instructions: "Ubicación temporal generada. Se autodestruye en 15 minutos.",
      };

      setActiveRendezvous(pin);

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: "me",
        text: "📍 Punto de Encuentro Seguro Activado",
        isRendezvousPin: true,
        rendezvousData: pin,
        isRead: true,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), newMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: "📍 Punto de Encuentro Seguro Activado",
            isRendezvousPin: true,
            rendezvousData: pin,
            isBurnOnView: false,
            isBurned: false,
            isRead: false,
            timestamp: newMsg.timestamp,
          },
          newMsg.id
        ).catch((err) => console.warn("Sync rendezvous pin cloud error:", err));
      }

      audioEngine.playVaultUnlock();
    },
    [authUser, getChatChannelId]
  );

  const burnMessage = useCallback(
    (profileId: string, messageId: string) => {
      setChatMessages((prev) => {
        const thread = prev[profileId] || [];
        const updated = thread.map((m) =>
          m.id === messageId ? { ...m, isBurned: true, text: "[CONTENIDO AUTODESTRUIDO TRAS LECTURA]" } : m
        );
        const next = { ...prev, [profileId]: updated };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        burnCloudMessage(chatId, messageId).catch((err) =>
          console.warn("Burn cloud message error:", err)
        );
      }
    },
    [authUser, getChatChannelId]
  );

  const sendMediaChatMessage = useCallback(
    (profileId: string, media: ChatMediaAttachment, text?: string) => {
      const cleanText = text?.trim() || media.caption?.trim() || "";
      const newMsg: ChatMessage = {
        id: `msg-media-${Date.now()}`,
        senderId: "me",
        text: cleanText,
        mediaAttachment: media,
        isBurnOnView: media.mode === "view_once",
        isBurned: false,
        isRead: true,
        timestamp: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), newMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: cleanText,
            mediaAttachment: media,
            isBurnOnView: media.mode === "view_once",
            isBurned: false,
            isRead: false,
            timestamp: newMsg.timestamp,
          },
          newMsg.id
        ).catch((err) => console.warn("Sync cloud media message error:", err));
      }

      audioEngine.playChatMessageSound();
    },
    [authUser, getChatChannelId]
  );

  const burnMediaMessage = useCallback(
    (profileId: string, messageId: string) => {
      setChatMessages((prev) => {
        const thread = prev[profileId] || [];
        const updated = thread.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              isBurned: true,
              mediaAttachment: m.mediaAttachment
                ? {
                    ...m.mediaAttachment,
                    url: "",
                    previewUrl: undefined,
                    photos: undefined,
                  }
                : undefined,
            };
          }
          return m;
        });
        const next = { ...prev, [profileId]: updated };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        burnCloudMessage(chatId, messageId).catch((err) =>
          console.warn("Burn cloud media error:", err)
        );
      }
    },
    [authUser, getChatChannelId]
  );

  const markMediaMessageAsViewed = useCallback((profileId: string, messageId: string) => {
    setChatMessages((prev) => {
      const thread = prev[profileId] || [];
      const updated = thread.map((m) => {
        if (m.id === messageId && m.mediaAttachment) {
          return {
            ...m,
            mediaAttachment: { ...m.mediaAttachment, isViewed: true },
          };
        }
        return m;
      });
      const next = { ...prev, [profileId]: updated };
      persistChatMessages(next);
      return next;
    });
  }, []);

  const revokeAlbumAccessInChat = useCallback(
    (profileId: string, albumId: string, messageId?: string) => {
      setChatMessages((prev) => {
        const thread = prev[profileId] || [];
        const updated = thread.map((m) => {
          const isTarget = messageId
            ? m.id === messageId
            : m.mediaAttachment?.sharedAlbumId === albumId;
          if (isTarget) {
            return {
              ...m,
              isRevoked: true,
              revokedAt: new Date().toISOString(),
              mediaAttachment: m.mediaAttachment
                ? {
                    ...m.mediaAttachment,
                    isRevoked: true,
                    revokedAt: new Date().toISOString(),
                  }
                : undefined,
            };
          }
          return m;
        });
        const next = { ...prev, [profileId]: updated };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        if (messageId) {
          revokeCloudSharedAlbum(chatId, messageId, true, albumId).catch((err) =>
            console.warn("Fallo al revocar mensaje en Firestore:", err)
          );
        } else {
          const thread = chatMessages[profileId] || [];
          thread.forEach((m) => {
            if (m.mediaAttachment?.sharedAlbumId === albumId) {
              revokeCloudSharedAlbum(chatId, m.id, true, albumId).catch((err) =>
                console.warn("Fallo al revocar mensaje en Firestore:", err)
              );
            }
          });
        }
      }

      audioEngine.playStateSwitch("dormant");
    },
    [authUser, getChatChannelId, chatMessages]
  );

  const unrevokeAlbumAccessInChat = useCallback(
    (profileId: string, albumId: string, messageId?: string) => {
      setChatMessages((prev) => {
        const thread = prev[profileId] || [];
        const updated = thread.map((m) => {
          const isTarget = messageId
            ? m.id === messageId
            : m.mediaAttachment?.sharedAlbumId === albumId;
          if (isTarget) {
            return {
              ...m,
              isRevoked: false,
              revokedAt: undefined,
              mediaAttachment: m.mediaAttachment
                ? {
                    ...m.mediaAttachment,
                    isRevoked: false,
                    revokedAt: undefined,
                  }
                : undefined,
            };
          }
          return m;
        });
        const next = { ...prev, [profileId]: updated };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        if (messageId) {
          revokeCloudSharedAlbum(chatId, messageId, false, albumId).catch((err) =>
            console.warn("Fallo al restaurar mensaje en Firestore:", err)
          );
        } else {
          const thread = chatMessages[profileId] || [];
          thread.forEach((m) => {
            if (m.mediaAttachment?.sharedAlbumId === albumId) {
              revokeCloudSharedAlbum(chatId, m.id, false, albumId).catch((err) =>
                console.warn("Fallo al restaurar mensaje en Firestore:", err)
              );
            }
          });
        }
      }

      audioEngine.playVaultUnlock();
    },
    [authUser, getChatChannelId, chatMessages]
  );

  const revokeAlbumAccessGlobally = useCallback(
    (albumId: string) => {
      setChatMessages((prev) => {
        let hasChanges = false;
        const next: Record<string, ChatMessage[]> = {};

        Object.entries(prev).forEach(([profId, thread]) => {
          let threadChanged = false;
          const updatedThread = thread.map((m) => {
            if (m.mediaAttachment?.sharedAlbumId === albumId && !m.isRevoked) {
              hasChanges = true;
              threadChanged = true;
              return {
                ...m,
                isRevoked: true,
                revokedAt: new Date().toISOString(),
                mediaAttachment: {
                  ...m.mediaAttachment,
                  isRevoked: true,
                  revokedAt: new Date().toISOString(),
                },
              };
            }
            return m;
          });

          next[profId] = threadChanged ? updatedThread : thread;

          if (threadChanged && authUser && authUser.uid !== "local-user") {
            const chatId = getChatChannelId(profId);
            thread.forEach((m) => {
              if (m.mediaAttachment?.sharedAlbumId === albumId && !m.isRevoked) {
                revokeCloudSharedAlbum(chatId, m.id, true, albumId).catch((err) =>
                  console.warn("Fallo al revocar mensaje global en Firestore:", err)
                );
              }
            });
          }
        });

        if (hasChanges) {
          persistChatMessages(next);
          return next;
        }
        return prev;
      });

      audioEngine.playStateSwitch("dormant");
    },
    [authUser, getChatChannelId]
  );

  const getSharedChatIdsForAlbum = useCallback(
    (albumId: string): string[] => {
      const activeChatIds = new Set<string>();

      Object.entries(chatMessages).forEach(([profId, thread]) => {
        const hasActiveShare = thread.some(
          (m) =>
            m.mediaAttachment?.sharedAlbumId === albumId &&
            !m.isRevoked &&
            !m.mediaAttachment?.isRevoked
        );
        if (hasActiveShare) {
          activeChatIds.add(profId);
        }
      });

      return Array.from(activeChatIds);
    },
    [chatMessages]
  );

  const getChatRetentionForProfile = useCallback(
    (profileId: string): "ephemeral" | "persistent" => {
      return perChatRetention[profileId] || chatRetentionMode;
    },
    [perChatRetention, chatRetentionMode]
  );

  const toggleChatRetention = useCallback((profileId?: string) => {
    if (profileId) {
      setPerChatRetention((prev) => {
        const current = prev[profileId] || "persistent";
        const nextMode: "ephemeral" | "persistent" = current === "ephemeral" ? "persistent" : "ephemeral";
        const next: Record<string, "ephemeral" | "persistent"> = { ...prev, [profileId]: nextMode };
        saveToStorage(STORAGE_KEYS.CHAT_RETENTION + "_per_chat", next);
        return next;
      });
    } else {
      setChatRetentionMode((prev) => {
        const nextMode: "ephemeral" | "persistent" = prev === "ephemeral" ? "persistent" : "ephemeral";
        saveToStorage(STORAGE_KEYS.CHAT_RETENTION, nextMode);
        return nextMode;
      });
    }
    audioEngine.playStateSwitch("open");
  }, []);

  const clearChatHistory = useCallback((profileId: string) => {
    setChatMessages((prev) => {
      const next = { ...prev, [profileId]: [] };
      persistChatMessages(next);
      return next;
    });
    audioEngine.playError();
  }, []);

  const dismissRendezvous = useCallback(() => {
    setActiveRendezvous(null);
  }, []);

  const cancelRendezvousPin = useCallback(
    (profileId: string) => {
      setActiveRendezvous(null);

      const cancelMsg: ChatMessage = {
        id: `msg-cancel-${Date.now()}`,
        senderId: "system",
        text: "🚫 Punto de encuentro anulado por el usuario.",
        isRead: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => {
        const list = prev[profileId] || [];
        const updated = list.map((m) => {
          if (m.isRendezvousPin) {
            return {
              ...m,
              isCancelledRendezvous: true,
            };
          }
          return m;
        });

        const next = {
          ...prev,
          [profileId]: [...updated, cancelMsg],
        };
        persistChatMessages(next);
        return next;
      });

      if (authUser && authUser.uid !== "local-user") {
        const chatId = getChatChannelId(profileId);
        sendCloudMessage(
          chatId,
          {
            senderId: authUser.uid,
            text: "🚫 Punto de encuentro anulado por el usuario.",
            isBurnOnView: false,
            isBurned: false,
            isRead: false,
            timestamp: cancelMsg.timestamp,
          },
          cancelMsg.id
        ).catch((err) => console.warn("Sync cancel rendezvous pin cloud error:", err));
      }

      audioEngine.playSignalSent();
    },
    [authUser, getChatChannelId]
  );

  const openBoundaryModal = useCallback((profileId: string) => {
    setBoundaryModalTargetProfileId(profileId);
    setIsBoundaryModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closeBoundaryModal = useCallback(() => {
    setIsBoundaryModalOpen(false);
    setBoundaryModalTargetProfileId(null);
  }, []);

  const applyBoundaryProtocol = useCallback(
    (targetProfileId: string, setting: Partial<UserBoundarySetting>) => {
      const protoDef = BOUNDARY_PROTOCOLS_CATALOG.find((p) => p.id === setting.protocol);

      const fullSetting: UserBoundarySetting = {
        targetProfileId,
        protocol: setting.protocol || "polite_archive",
        chatStatus: setting.chatStatus || protoDef?.chatStatus || "readonly",
        publicAlbumsVisible: setting.publicAlbumsVisible ?? protoDef?.publicAlbumsVisible ?? true,
        privateVaultRevoked: setting.privateVaultRevoked ?? protoDef?.privateVaultRevoked ?? true,
        radarVisibility: setting.radarVisibility || protoDef?.radarVisibility || "attenuated",
        cooldownUntil: setting.cooldownUntil,
        reason: setting.reason,
        appliedAt: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
        kindClosureMessageSent: setting.kindClosureMessageSent,
      };

      setBoundaries((prev) => {
        const next = {
          ...prev,
          [targetProfileId]: fullSetting,
        };
        saveToStorage(STORAGE_KEYS.BOUNDARIES, next);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("vessel_boundaries_changed", { detail: next }));
        }
        return next;
      });

      if (fullSetting.privateVaultRevoked && onRevokeVault) {
        onRevokeVault(targetProfileId);
      }

      if (fullSetting.kindClosureMessageSent) {
        sendKindClosureMessage(targetProfileId, fullSetting.kindClosureMessageSent);
      }

      if (currentUserUid && currentUserUid !== "local-user") {
        syncBoundarySetting(currentUserUid, targetProfileId, fullSetting).catch((err) =>
          console.warn("Sync boundary setting error:", err)
        );
      }

      audioEngine.playStateSwitch("dormant");
    },
    [currentUserUid, onRevokeVault, sendKindClosureMessage]
  );

  const removeBoundaryProtocol = useCallback((targetProfileId: string) => {
    setBoundaries((prev) => {
      const next = { ...prev };
      delete next[targetProfileId];
      saveToStorage(STORAGE_KEYS.BOUNDARIES, next);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vessel_boundaries_changed", { detail: next }));
      }
      return next;
    });
    audioEngine.playPulse();
  }, []);

  const getBoundaryForProfile = useCallback(
    (targetProfileId: string): UserBoundarySetting | null => {
      return boundaries[targetProfileId] || null;
    },
    [boundaries]
  );

  const openPreFlightModal = useCallback((profile: VesselProfile) => {
    setPreFlightTargetProfile(profile);
    setIsPreFlightModalOpen(true);
    audioEngine.playPulse();
  }, []);

  const closePreFlightModal = useCallback(() => {
    setIsPreFlightModalOpen(false);
  }, []);

  const sendPreFlightChecklist = useCallback(
    (
      profileId: string,
      checklist: Omit<PreFlightChecklist, "id" | "senderId" | "receiverId" | "createdAt">
    ) => {
      const fullChecklist: PreFlightChecklist = {
        ...checklist,
        id: `preflight-${Date.now()}`,
        senderId: currentUserUid,
        receiverId: profileId,
        createdAt: new Date().toISOString(),
      };

      const msg: ChatMessage = {
        id: `msg-preflight-${Date.now()}`,
        senderId: "me",
        text: "📋 Acuerdo previo de encuentro enviado.",
        isPreFlightChecklist: true,
        preFlightData: fullChecklist,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), msg],
        };
        persistChatMessages(next);
        return next;
      });

      audioEngine.playSignalSent();
      setIsPreFlightModalOpen(false);
    },
    [currentUserUid]
  );

  const sendEncounterTicketMessage = useCallback(
    (profileId: string, ticket: EncounterTicket) => {
      const msg: ChatMessage = {
        id: `msg-ticket-${Date.now()}`,
        senderId: "me",
        text: `🎫 Ticket de Encuentro: ${ticket.scheduledDate} a las ${ticket.scheduledTime} hs en ${ticket.locationName}`,
        isEncounterTicket: true,
        encounterTicketData: ticket,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };

      setChatMessages((prev) => {
        const next = {
          ...prev,
          [profileId]: [...(prev[profileId] || []), msg],
        };
        persistChatMessages(next);
        return next;
      });

      audioEngine.playSignalSent();
    },
    []
  );

  const openSendMediaModal = useCallback(() => setIsSendMediaModalOpen(true), []);
  const closeSendMediaModal = useCallback(() => setIsSendMediaModalOpen(false), []);

  const openMediaViewer = useCallback((media: ChatMediaAttachment) => {
    setActiveMediaViewerAttachment(media);
    audioEngine.playPulse();
  }, []);

  const closeMediaViewer = useCallback(() => {
    setActiveMediaViewerAttachment(null);
  }, []);

  const sendSecureWaypoint = useCallback(
    (targetProfileId: string, phase1Corner: string, phase2Address: string, accessNotes?: string) => {
      const waypoint: SecureWaypoint = {
        id: `wp-${Date.now()}`,
        senderId: currentUserUid,
        senderCodename: myProfile.codename,
        receiverId: targetProfileId,
        phase1PublicCorner: phase1Corner,
        phase2ExactAddress: phase2Address,
        phase2AccessNotes: accessNotes,
        isPhase2Unlocked: false,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      };

      setSecureWaypoints((prev) => {
        const next = { ...prev, [waypoint.id]: waypoint };
        saveToStorage(STORAGE_KEYS.SECURE_WAYPOINTS, next);
        return next;
      });

      const chatMsg: ChatMessage = {
        id: `msg-wp-${Date.now()}`,
        senderId: currentUserUid,
        text: `📍 [Waypoint Seguro] Punto de aproximación: ${phase1Corner}`,
        isSecureWaypoint: true,
        waypointData: waypoint,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };

      setChatMessages((prev) => {
        const existing = prev[targetProfileId] || [];
        const next = { ...prev, [targetProfileId]: [...existing, chatMsg] };
        persistChatMessages(next);
        return next;
      });

      audioEngine.playSubBass(85);
    },
    [currentUserUid, myProfile.codename]
  );

  const unlockPhase2Waypoint = useCallback((waypointId: string, targetProfileId: string) => {
    setSecureWaypoints((prev) => {
      const target = prev[waypointId];
      if (!target) return prev;
      const updated = { ...target, isPhase2Unlocked: true, unlockedAt: new Date().toISOString() };
      const next = { ...prev, [waypointId]: updated };
      saveToStorage(STORAGE_KEYS.SECURE_WAYPOINTS, next);
      return next;
    });

    setChatMessages((prev) => {
      const chat = prev[targetProfileId] || [];
      const updatedChat = chat.map((msg) => {
        if (msg.isSecureWaypoint && msg.waypointData?.id === waypointId) {
          return {
            ...msg,
            waypointData: {
              ...msg.waypointData,
              isPhase2Unlocked: true,
              unlockedAt: new Date().toISOString(),
            },
            text: `🔓 [Waypoint Seguro] Fase 2 Desbloqueada: ${msg.waypointData.phase2ExactAddress}`,
          };
        }
        return msg;
      });
      const next = { ...prev, [targetProfileId]: updatedChat };
      persistChatMessages(next);
      return next;
    });

    audioEngine.playSuccess();
  }, []);

  const cancelSecureWaypoint = useCallback((waypointId: string, targetProfileId: string) => {
    setSecureWaypoints((prev) => {
      const target = prev[waypointId];
      if (!target) return prev;
      const updated = { ...target, isCancelled: true };
      const next = { ...prev, [waypointId]: updated };
      saveToStorage(STORAGE_KEYS.SECURE_WAYPOINTS, next);
      return next;
    });

    setChatMessages((prev) => {
      const chat = prev[targetProfileId] || [];
      const updatedChat = chat.map((msg) => {
        if (msg.isSecureWaypoint && msg.waypointData?.id === waypointId) {
          return {
            ...msg,
            waypointData: { ...msg.waypointData, isCancelled: true },
            text: `🚫 [Waypoint Seguro] Punto de encuentro anulado por seguridad.`,
          };
        }
        return msg;
      });
      const next = { ...prev, [targetProfileId]: updatedChat };
      persistChatMessages(next);
      return next;
    });

    audioEngine.playError();
  }, []);

  const value = useMemo<ChatContextType>(
    () => ({
      chatMessages,
      unreadMessagesCount,
      activeChatProfileId,
      setActiveChatProfileId,
      markMessagesAsRead,
      sendChatMessage,
      retryChatMessage,
      sendVoiceMessage,
      sendMediaChatMessage,
      sendKindClosureMessage,
      sendRendezvousPin,
      burnMessage,
      burnMediaMessage,
      markMediaMessageAsViewed,
      revokeAlbumAccessInChat,
      unrevokeAlbumAccessInChat,
      revokeAlbumAccessGlobally,
      getSharedChatIdsForAlbum,
      clearChatHistory,
      chatRetentionMode,
      perChatRetention,
      getChatRetentionForProfile,
      toggleChatRetention,
      activeRendezvous,
      dismissRendezvous,
      cancelRendezvousPin,
      boundaries,
      applyBoundaryProtocol,
      removeBoundaryProtocol,
      getBoundaryForProfile,
      isBoundaryModalOpen,
      boundaryModalTargetProfileId,
      openBoundaryModal,
      closeBoundaryModal,
      isPreFlightModalOpen,
      preFlightTargetProfile,
      openPreFlightModal,
      closePreFlightModal,
      sendPreFlightChecklist,
      isSendMediaModalOpen,
      openSendMediaModal,
      closeSendMediaModal,
      activeMediaViewerAttachment,
      openMediaViewer,
      closeMediaViewer,
      secureWaypoints,
      sendSecureWaypoint,
      unlockPhase2Waypoint,
      cancelSecureWaypoint,
      sendEncounterTicketMessage,
    }),
    [
      chatMessages,
      unreadMessagesCount,
      activeChatProfileId,
      markMessagesAsRead,
      sendChatMessage,
      retryChatMessage,
      sendVoiceMessage,
      sendMediaChatMessage,
      sendKindClosureMessage,
      sendRendezvousPin,
      burnMessage,
      burnMediaMessage,
      markMediaMessageAsViewed,
      revokeAlbumAccessInChat,
      unrevokeAlbumAccessInChat,
      revokeAlbumAccessGlobally,
      getSharedChatIdsForAlbum,
      clearChatHistory,
      chatRetentionMode,
      perChatRetention,
      getChatRetentionForProfile,
      toggleChatRetention,
      activeRendezvous,
      dismissRendezvous,
      cancelRendezvousPin,
      boundaries,
      applyBoundaryProtocol,
      removeBoundaryProtocol,
      getBoundaryForProfile,
      isBoundaryModalOpen,
      boundaryModalTargetProfileId,
      openBoundaryModal,
      closeBoundaryModal,
      isPreFlightModalOpen,
      preFlightTargetProfile,
      openPreFlightModal,
      closePreFlightModal,
      sendPreFlightChecklist,
      isSendMediaModalOpen,
      openSendMediaModal,
      closeSendMediaModal,
      activeMediaViewerAttachment,
      openMediaViewer,
      closeMediaViewer,
      secureWaypoints,
      sendSecureWaypoint,
      unlockPhase2Waypoint,
      cancelSecureWaypoint,
      sendEncounterTicketMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
