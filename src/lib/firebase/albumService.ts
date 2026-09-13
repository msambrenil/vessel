"use client";

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  Unsubscribe,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import { UserAlbum, AlbumPhoto, AlbumPrivacy, MediaType } from "@/types/vessel";

const USERS_COLLECTION = "vessel_users";
const ALBUMS_SUBCOLLECTION = "albums";

/**
 * Escucha en tiempo real los álbumes de un usuario
 */
export const subscribeToUserAlbums = (
  uid: string,
  onUpdate: (albums: UserAlbum[]) => void
): Unsubscribe => {
  const albumsRef = collection(db, USERS_COLLECTION, uid, ALBUMS_SUBCOLLECTION);
  const q = query(albumsRef, orderBy("createdAtRaw", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const albums: UserAlbum[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Álbum",
          description: data.description || "",
          privacy: data.privacy || "public",
          coverUrl: data.coverUrl || "",
          photos: data.photos || [],
          createdAt: data.createdAt || "Hoy",
        };
      });
      onUpdate(albums);
    },
    (error) => {
      console.warn("Error en suscripción de álbumes de Firestore:", error);
    }
  );
};

/**
 * Crea o guarda un álbum en Firestore
 */
export const saveCloudAlbum = async (
  uid: string,
  album: UserAlbum
): Promise<{ success: boolean; error?: string }> => {
  try {
    const albumRef = doc(db, USERS_COLLECTION, uid, ALBUMS_SUBCOLLECTION, album.id);
    const payload = sanitizeForFirestore({
      ...album,
      createdAtRaw: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await setDoc(albumRef, payload, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Error guardando álbum en Firestore:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Elimina un álbum en Firestore
 */
export const deleteCloudAlbum = async (uid: string, albumId: string): Promise<boolean> => {
  try {
    const albumRef = doc(db, USERS_COLLECTION, uid, ALBUMS_SUBCOLLECTION, albumId);
    await deleteDoc(albumRef);
    return true;
  } catch (error) {
    console.error("Error eliminando álbum en Firestore:", error);
    return false;
  }
};

/**
 * Añade una foto o video a un álbum existente en Firestore (Upsert)
 */
export const addMediaToCloudAlbum = async (
  uid: string,
  albumId: string,
  newMedia: AlbumPhoto,
  currentPhotos?: AlbumPhoto[]
): Promise<boolean> => {
  try {
    const albumRef = doc(db, USERS_COLLECTION, uid, ALBUMS_SUBCOLLECTION, albumId);
    const sanitizedMedia = sanitizeForFirestore(newMedia);
    if (currentPhotos) {
      const updatedPhotos = [...currentPhotos, sanitizedMedia];
      const payload = sanitizeForFirestore({
        id: albumId,
        photos: updatedPhotos,
        coverUrl: updatedPhotos[0]?.url || sanitizedMedia.url,
        updatedAt: serverTimestamp(),
      });
      await setDoc(albumRef, payload, { merge: true });
    } else {
      const payload = sanitizeForFirestore({
        id: albumId,
        photos: arrayUnion(sanitizedMedia),
        updatedAt: serverTimestamp(),
      });
      await setDoc(albumRef, payload, { merge: true });
    }
    return true;
  } catch (error) {
    console.error("Error agregando foto a álbum en Firestore:", error);
    return false;
  }
};

/**
 * Elimina una foto o video de un álbum en Firestore (Upsert)
 */
export const removeMediaFromCloudAlbum = async (
  uid: string,
  albumId: string,
  currentPhotos: AlbumPhoto[],
  photoId: string
): Promise<boolean> => {
  try {
    const albumRef = doc(db, USERS_COLLECTION, uid, ALBUMS_SUBCOLLECTION, albumId);
    const updatedPhotos = currentPhotos.filter((p) => p.id !== photoId);
    const payload = sanitizeForFirestore({
      id: albumId,
      photos: updatedPhotos,
      coverUrl: updatedPhotos.length > 0 ? updatedPhotos[0].url : "",
      updatedAt: serverTimestamp(),
    });
    await setDoc(albumRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error("Error eliminando foto de álbum en Firestore:", error);
    return false;
  }
};

/**
 * Sube un archivo (foto o video) a Firebase Storage y retorna la URL pública de descarga
 */
export const uploadMediaToStorage = async (
  uid: string,
  albumId: string,
  file: File | Blob,
  fileName: string
): Promise<string> => {
  const fileExt = fileName.split(".").pop() || "media";
  const storagePath = `vessel_users/${uid}/albums/${albumId}/${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = await uploadBytesResumable(storageRef, file);
  const downloadUrl = await getDownloadURL(uploadTask.ref);
  return downloadUrl;
};
