"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Validación de variables de entorno de seguridad (P0)
if (typeof window !== "undefined" && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  console.warn(
    "[VESSEL Security] Faltan variables de entorno NEXT_PUBLIC_FIREBASE_*. Verificá tu archivo .env.local para habilitar sincronización en la nube."
  );
}

// Inicialización Singleton segura de Firebase
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de Auth
export const auth: Auth = getAuth(app);

// Inicialización de Firestore segura para SSR y Navegador
const targetDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
export const db: Firestore = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);

// Inicialización de Storage
export const storage: FirebaseStorage = getStorage(app);

/**
 * Inicia sesión anónima rápida si el usuario no tiene una sesión activa
 * Garantiza persistencia inmediata sin fricción para el usuario.
 */
export const ensureAnonymousSession = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe();
          if (user) {
            resolve(user);
          } else {
            try {
              const userCredential = await signInAnonymously(auth);
              resolve(userCredential.user);
            } catch (error) {
              console.warn("Autenticación anónima offline/silenciosa:", error);
              resolve(null);
            }
          }
        },
        (error) => {
          console.warn("Observador de autenticación:", error);
          resolve(null);
        }
      );
    } catch (err) {
      console.warn("Excepción en ensureAnonymousSession:", err);
      resolve(null);
    }
  });
};
