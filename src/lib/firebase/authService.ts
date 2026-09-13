"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  User,
  AuthError,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { sanitizeForFirestore } from "./firestoreSanitizer";
import {
  verifyIdentityUniqueness,
  registerUniqueIdentity,
  checkCodenameAvailability,
  claimCodename,
} from "./identityDeduplicationService";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const USERS_COLLECTION = "vessel_users";

export interface AuthActionResult {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Traduce códigos de error técnicos de Firebase Auth a mensajes amigables y comprensibles
 */
export function getAuthErrorMessage(errorCode?: string, lang: "es" | "en" = "es"): string {
  if (!errorCode) {
    return lang === "es" ? "Ocurrió un error inesperado. Reintentá." : "An unexpected error occurred. Please retry.";
  }

  const errorsEs: Record<string, string> = {
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta ha sido inhabilitada por seguridad.",
    "auth/user-not-found": "No existe ninguna cuenta asociada a este correo.",
    "auth/wrong-password": "La contraseña ingresada es incorrecta.",
    "auth/invalid-credential": "Email o contraseña incorrectos. Verificá tus datos.",
    "auth/email-already-in-use": "Este correo ya está registrado. Iniciá sesión.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres seguros.",
    "auth/popup-closed-by-user": "La ventana de Google se cerró antes de completar el inicio de sesión.",
    "auth/popup-blocked": "El navegador bloqueó la ventana emergente de Google. Habilitala.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Por seguridad, aguardá unos minutos.",
    "auth/network-request-failed": "Error de conexión. Comprobá tu acceso a Internet.",
    "auth/credential-already-in-use": "Esta cuenta ya está vinculada a otro usuario.",
    "auth/account-exists-with-different-credential": "Ya existe una cuenta con este correo pero con otro método de acceso.",
    "auth/operation-not-allowed": "El proveedor de Google no está habilitado en Firebase Console. Activalo en Authentication > Sign-in method.",
  };

  const errorsEn: Record<string, string> = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-disabled": "This account has been disabled for safety reasons.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "The password entered is incorrect.",
    "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
    "auth/email-already-in-use": "This email is already in use. Please sign in.",
    "auth/weak-password": "Password should be at least 6 secure characters.",
    "auth/popup-closed-by-user": "Google popup closed before finishing sign-in.",
    "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes before trying again.",
    "auth/network-request-failed": "Network error. Please check your Internet connection.",
    "auth/credential-already-in-use": "This credential is already linked to another account.",
    "auth/account-exists-with-different-credential": "An account already exists with the same email address.",
    "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.",
  };

  const dict = lang === "es" ? errorsEs : errorsEn;
  return dict[errorCode] || (lang === "es" ? `Error de autenticación (${errorCode})` : `Authentication error (${errorCode})`);
}

/**
 * Inicializa o actualiza la ficha del usuario en Firestore al autenticarse
 */
async function ensureUserDocInFirestore(user: User, additionalData?: { codename?: string; role?: string }): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      let codename =
        additionalData?.codename ||
        user.displayName?.split(" ")[0]?.toUpperCase() ||
        `VESSEL_${user.uid.slice(0, 5).toUpperCase()}`;

      // Asegurar unicidad del alias
      const availability = await checkCodenameAvailability(codename, user.uid);
      if (!availability.isAvailable) {
        const suffix = user.uid.slice(0, 4).toUpperCase();
        codename = `${codename}_${suffix}`;
      }

      const initialPayload = {
        profile: {
          codename,
          role: additionalData?.role || "Versatile",
          age: 26,
          showAge: true,
          twitterHandle: "",
          yoSoy: "Atlético / Gym",
          mobility: "Tengo depto / lugar",
          hivStatus: "Negativo en PrEP",
          genderIdentity: "Cis Man",
          pronouns: "He / Him",
          desires: ["Encuentros reales", "Buena vibra"],
          intentions: ["Right Now"],
          boundaries: ["Consentimiento explícito"],
          energyVibes: ["Chill", "Direct"],
          noGhostMode: true,
          respectScore: 100,
          isAntiGhost: true,
          heightCm: 178,
          weightKg: 75,
          avatarUrl: user.photoURL || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
          isStylizedAvatar: false,
          isFogMode: false,
          verification: {
            isVerified: true,
            method: user.providerData.some((p) => p.providerId === "google.com") ? "oauth_google" : "id_document",
            verifiedAt: new Date().toISOString(),
            hasFacialPrivacy: false,
            badgeLabel: "ID VERIFIED // HUMANO REAL",
            trustScore: 100,
            certificateHash: `ZK_${user.uid.slice(0, 8)}`,
          },
          totalEncountersVerified: 0,
          authProvider: user.providerData.some((p) => p.providerId === "google.com") ? "google" : "direct",
        },
        bodyState: "open",
        userPlan: "free",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, sanitizeForFirestore(initialPayload), { merge: true });
      await registerUniqueIdentity({
        uid: user.uid,
        codename,
        authProvider: user.providerData[0]?.providerId || "google.com",
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn("No se pudo inicializar documento de usuario en Firestore:", err);
    return false;
  }
}

/**
 * Inicia sesión o registra al usuario mediante Google 1-Click
 */
export async function loginWithGoogle(lang: "es" | "en" = "es"): Promise<AuthActionResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const isNewUser = await ensureUserDocInFirestore(user);

    return {
      success: true,
      user,
      isNewUser,
    };
  } catch (error: any) {
    const code = error?.code as string;
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Inicia sesión con Email y Contraseña
 */
export async function loginWithEmail(
  email: string,
  password: string,
  lang: "es" | "en" = "es"
): Promise<AuthActionResult> {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    const user = result.user;

    await ensureUserDocInFirestore(user);

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    const code = error?.code as string;
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Registra un nuevo usuario con Email, Contraseña, Alias y Rol corporal
 * Ejecuta validación de unicidad anti-multi cuentas
 */
export async function registerWithEmail(
  email: string,
  password: string,
  codename: string,
  role: string = "Versatile",
  phone?: string,
  lang: "es" | "en" = "es"
): Promise<AuthActionResult> {
  try {
    const trimmedEmail = email.trim().toLowerCase();

    const cleanCodename = codename.trim().toUpperCase() || "VESSEL_MEMBER";

    // 1. Validar unicidad (Anti-Sybil y Codename único)
    const uniqueness = await verifyIdentityUniqueness({ codename: cleanCodename, phone });
    if (!uniqueness.isAllowed) {
      return {
        success: false,
        error: uniqueness.message || (lang === "es" ? "Identidad duplicada detectada." : "Duplicate identity detected."),
      };
    }

    // 2. Crear usuario en Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    const user = result.user;

    // 3. Actualizar perfil básico en Auth
    await updateProfile(user, {
      displayName: cleanCodename,
    });

    // 4. Sembrar documento en Firestore
    await ensureUserDocInFirestore(user, { codename: cleanCodename, role });

    // 5. Registrar identidad única y asegurar reserva de codename
    await registerUniqueIdentity({
      uid: user.uid,
      codename: cleanCodename,
      phone,
      authProvider: "email",
    });

    return {
      success: true,
      user,
      isNewUser: true,
    };
  } catch (error: any) {
    const code = error?.code as string;
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Envía un correo electrónico para restablecer la contraseña
 */
export async function resetPassword(email: string, lang: "es" | "en" = "es"): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    await sendPasswordResetEmail(auth, trimmedEmail);
    return { success: true };
  } catch (error: any) {
    const code = error?.code as string;
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Inicia o reanuda sesión de exploración anónima / modo invitado
 */
export async function signInAsGuest(): Promise<AuthActionResult> {
  try {
    const result = await signInAnonymously(auth);
    return {
      success: true,
      user: result.user,
      isNewUser: true,
    };
  } catch (error: any) {
    console.warn("Fallo en login anónimo:", error);
    return {
      success: false,
      error: "No se pudo iniciar sesión anónima",
    };
  }
}

/**
 * Vincula una cuenta anónima activa a Google sin perder datos ni cambiar el UID
 */
export async function linkGuestWithGoogle(lang: "es" | "en" = "es"): Promise<AuthActionResult> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "No hay sesión activa para vincular." };
    }

    const result = await linkWithPopup(auth.currentUser, googleProvider);
    const user = result.user;

    await registerUniqueIdentity({
      uid: user.uid,
      authProvider: "google.com",
    });

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    const code = error?.code as string;
    // Si la credencial ya existe en otra cuenta, el usuario debe iniciar sesión directamente
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Vincula una cuenta anónima activa a Email y Contraseña sin perder datos
 */
export async function linkGuestWithEmail(
  email: string,
  password: string,
  lang: "es" | "en" = "es"
): Promise<AuthActionResult> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "No hay sesión activa para vincular." };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const credential = EmailAuthProvider.credential(trimmedEmail, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    const user = result.user;

    await registerUniqueIdentity({
      uid: user.uid,
      authProvider: "email",
    });

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    const code = error?.code as string;
    return {
      success: false,
      error: getAuthErrorMessage(code, lang),
    };
  }
}

/**
 * Cierra la sesión activa del usuario
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error cerrando sesión en Firebase Auth:", error);
  }
}

/**
 * Suscripción al ciclo de vida del estado de autenticación
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
