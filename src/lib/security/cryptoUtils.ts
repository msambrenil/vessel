/**
 * Utilidades criptográficas de grado de producción
 * Implementación SHA-256 pura y síncrona para protección Anti-Tampering de PINs y Duress Codes.
 */

const DEFAULT_SALT = "vessel_tactical_sec_salt_2026";

// Constantes iniciales SHA-256
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(n: number, x: number) {
  return (x >>> n) | (x << (32 - n));
}

/**
 * Genera hash SHA-256 puro y síncrono de un string
 */
export function sha256Sync(ascii: string): string {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const words: number[] = [];
  const byteLength = ascii.length;

  for (let i = 0; i < byteLength; i++) {
    words[i >>> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }

  words[byteLength >>> 2] |= 0x80 << (24 - (byteLength % 4) * 8);
  words[(((byteLength + 8) >>> 6) << 4) + 15] = byteLength * 8;

  const w = new Array(64);

  for (let i = 0; i < words.length; i += 16) {
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] || 0;
      } else {
        const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const result = [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((val) => (val >>> 0).toString(16).padStart(8, "0"))
    .join("");

  return result;
}

/**
 * Genera el hash de un PIN o código con salt
 */
export function hashPin(pin: string, salt: string = DEFAULT_SALT): string {
  if (!pin) return "";
  return sha256Sync(`${salt}:${pin.trim()}`);
}

/**
 * Compara un PIN ingresado contra un hash de forma segura (con soporte de migración para hashes y texto plano antiguo)
 */
export function verifyPin(
  enteredPin: string,
  storedValue: string,
  salt: string = DEFAULT_SALT
): boolean {
  if (!enteredPin || !storedValue) return false;

  const trimmed = enteredPin.trim();

  // Si el valor almacenado es un hash SHA-256 (64 hex chars)
  if (storedValue.length === 64 && /^[0-9a-f]{64}$/i.test(storedValue)) {
    const computed = hashPin(trimmed, salt);
    return timingSafeEqual(computed, storedValue.toLowerCase());
  }

  // Soporte de compatibilidad para credenciales no migradas
  return timingSafeEqual(trimmed, storedValue);
}

/**
 * Comparación en tiempo constante para mitigar ataques de temporización
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
