/**
 * VESSEL — Respaldo Cifrado de la Agenda de Encuentros y Agenda Íntima
 * Implementación de grado táctico con PBKDF2 (100.000 iteraciones) + AES-GCM 256-bit nativo.
 * Cero dependencias npm externas: utiliza exclusivamente Web Crypto API.
 */

export interface EncryptedBackupEnvelope {
  app: "vessel";
  version: number;
  type: "diary_full_backup";
  exportedAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

function toHex(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.trim();
  const match = cleanHex.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

/**
 * Deriva una clave AES-GCM de 256 bits a partir de una contraseña y un salt usando PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra el contenido completo de la agenda con la contraseña indicada
 */
export async function encryptDiaryBackup(
  payload: Record<string, unknown>,
  password: string
): Promise<EncryptedBackupEnvelope> {
  if (!password || password.trim().length === 0) {
    throw new Error("Se requiere una contraseña para cifrar el respaldo.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(payload));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return {
    app: "vessel",
    version: 1,
    type: "diary_full_backup",
    exportedAt: new Date().toISOString(),
    salt: toHex(salt),
    iv: toHex(iv),
    ciphertext: toHex(ciphertextBuffer),
  };
}

/**
 * Descifra un sobre de respaldo y devuelve la estructura de datos restaurada
 */
export async function decryptDiaryBackup(
  envelope: EncryptedBackupEnvelope,
  password: string
): Promise<Record<string, unknown>> {
  if (!envelope || envelope.app !== "vessel" || envelope.type !== "diary_full_backup") {
    throw new Error("El archivo no corresponde a un respaldo válido de VESSEL.");
  }

  if (!password || password.trim().length === 0) {
    throw new Error("Se requiere la contraseña para descifrar el respaldo.");
  }

  const salt = fromHex(envelope.salt);
  const iv = fromHex(envelope.iv);
  const ciphertext = fromHex(envelope.ciphertext);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("Contraseña incorrecta o archivo de respaldo corrupto.");
  }
}

/**
 * Dispara la descarga de un archivo Blob en el navegador
 */
export function downloadBackupFile(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
