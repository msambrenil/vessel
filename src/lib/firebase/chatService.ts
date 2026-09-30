"use client";

import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDocs,
  where,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { ChatMessage, UserBoundarySetting } from "@/types/vessel";

const CHATS_COLLECTION = "vessel_chats";
const BOUNDARIES_COLLECTION = "vessel_boundaries";

/**
 * Escucha los mensajes en tiempo real de una conversación
 */
export const subscribeToChatMessages = (
  chatId: string,
  onUpdate: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, "messages");
  const q = query(messagesRef, orderBy("timestampRaw", "asc"), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text,
          mediaUrl: data.mediaUrl,
          mediaAttachment: data.mediaAttachment,
          isBurnOnView: data.isBurnOnView || false,
          isBurned: data.isBurned || false,
          isRevoked: data.isRevoked || false,
          revokedAt: data.revokedAt,
          isKindClosure: data.isKindClosure || false,
          timestamp: data.timestamp || "Ahora",
          isRendezvousPin: data.isRendezvousPin || false,
          rendezvousData: data.rendezvousData,
          isVoiceMessage: data.isVoiceMessage || false,
          voiceData: data.voiceData,
          isPreFlightChecklist: data.isPreFlightChecklist || false,
          preFlightData: data.preFlightData,
          isEnRouteAlert: data.isEnRouteAlert || false,
          enRouteData: data.enRouteData,
          isSecureWaypoint: data.isSecureWaypoint || false,
          waypointData: data.waypointData,
          isItsExposureAlert: data.isItsExposureAlert || false,
          itsExposureData: data.itsExposureData,
        };
      });
      onUpdate(messages);
    },
    (error) => {
      console.warn("Error escuchando mensajes de chat en Firestore:", error);
    }
  );
};

import { sanitizeForFirestore } from "./firestoreSanitizer";
export { sanitizeForFirestore };



/**
 * Escucha todos los canales de chat donde participa el usuario actual
 * Permite descubrir conversaciones entrantes sin haber abierto manualmente el modal del remitente
 */
export const subscribeToUserActiveChats = (
  myUid: string,
  onPartnersUpdate: (partnerUids: string[]) => void
): Unsubscribe => {
  if (!myUid || myUid === "local-user" || myUid === "unauthenticated") {
    return () => {};
  }

  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(chatsRef, where("participants", "array-contains", myUid), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const partners = new Set<string>();
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const list: string[] = Array.isArray(data.participants)
          ? data.participants
          : docSnap.id.split("_");
        list.forEach((uid) => {
          if (uid && uid !== myUid) partners.add(uid);
        });
      });
      onPartnersUpdate(Array.from(partners));
    },
    (error) => {
      console.warn("Aviso en suscripción de bandeja de chats activos:", error);
    }
  );
};

/**
 * Envía un mensaje a la conversación en Firestore y actualiza el índice de participantes del canal
 */
export const sendCloudMessage = async (
  chatId: string,
  message: Omit<ChatMessage, "id">,
  customMessageId?: string
): Promise<string | null> => {
  try {
    const participants = chatId.split("_").filter(Boolean);
    const chatDocRef = doc(db, CHATS_COLLECTION, chatId);

    // Registrar metadatos del canal padre para que aparezca en la bandeja del destinatario en tiempo real
    await setDoc(
      chatDocRef,
      sanitizeForFirestore({
        chatId,
        participants,
        lastSenderId: message.senderId,
        lastMessagePreview: (message.text ?? "").slice(0, 80),
        updatedAtRaw: serverTimestamp(),
      }),
      { merge: true }
    ).catch(() => {});

    // Asegurar que text no sea undefined y sanitizar recursivamente para Firestore
    const payload = sanitizeForFirestore({
      ...message,
      text: message.text ?? "",
      timestampRaw: serverTimestamp(),
    });

    if (customMessageId) {
      const docRef = doc(db, CHATS_COLLECTION, chatId, "messages", customMessageId);
      await setDoc(docRef, payload, { merge: true });
      return customMessageId;
    } else {
      const messagesRef = collection(db, CHATS_COLLECTION, chatId, "messages");
      const docRef = await addDoc(messagesRef, payload);
      return docRef.id;
    }
  } catch (error) {
    console.warn("Aviso enviando mensaje a Firestore:", error);
    return null;
  }
};

/**
 * Quema o autodestruye un mensaje efímero
 */
export const burnCloudMessage = async (
  chatId: string,
  messageId: string
): Promise<boolean> => {
  try {
    const msgRef = doc(db, CHATS_COLLECTION, chatId, "messages", messageId);
    await updateDoc(msgRef, {
      isBurned: true,
      text: "[CONTENIDO AUTODESTRUIDO TRAS LECTURA]",
      mediaUrl: null,
      burnedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn("Aviso destruyendo mensaje en Firestore:", error);
    return false;
  }
};

/**
 * Revoca o restaura el acceso a un álbum compartido en un mensaje específico o por ID de álbum
 */
export const revokeCloudSharedAlbum = async (
  chatId: string,
  messageId: string,
  isRevoked: boolean = true,
  albumId?: string
): Promise<boolean> => {
  try {
    const msgRef = doc(db, CHATS_COLLECTION, chatId, "messages", messageId);
    try {
      await updateDoc(msgRef, sanitizeForFirestore({
        isRevoked,
        "mediaAttachment.isRevoked": isRevoked,
        revokedAt: isRevoked ? serverTimestamp() : null,
      }));
      return true;
    } catch (directErr) {
      // Fallback resiliente: si el mensaje con ese ID específico no existe en Firestore
      // (por ejemplo por desincronización de IDs locales o mensajes legacy),
      // buscar por albumId en la conversación para actualizar el/los mensajes correspondientes
      if (albumId) {
        const messagesRef = collection(db, CHATS_COLLECTION, chatId, "messages");
        const q = query(messagesRef, where("mediaAttachment.sharedAlbumId", "==", albumId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const updates = snapshot.docs.map((docSnap) =>
            updateDoc(docSnap.ref, sanitizeForFirestore({
              isRevoked,
              "mediaAttachment.isRevoked": isRevoked,
              revokedAt: isRevoked ? serverTimestamp() : null,
            }))
          );
          await Promise.all(updates);
          return true;
        }
      }
      throw directErr;
    }
  } catch (error) {
    console.warn("Aviso actualizando revocación de álbum en Firestore:", error);
    return false;
  }
};

/**
 * Sincroniza la configuración de límites graduales (Soft-Block) en Firestore
 */
export const syncBoundarySetting = async (
  uid: string,
  targetProfileId: string,
  setting: UserBoundarySetting
): Promise<boolean> => {
  try {
    const boundaryRef = doc(db, "vessel_users", uid, "boundaries", targetProfileId);
    await setDoc(boundaryRef, sanitizeForFirestore({
      ...setting,
      updatedAt: serverTimestamp(),
    }));
    return true;
  } catch (error) {
    console.error("Error guardando protocolo de límites en Firestore:", error);
    return false;
  }
};
