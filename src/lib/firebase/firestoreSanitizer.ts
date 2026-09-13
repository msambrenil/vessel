/**
 * Utilidad de saneamiento recursivo para payloads enviados a Firebase Firestore.
 * Firestore rechaza estrictamente cualquier propiedad con valor `undefined` lanzando:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 *
 * Esta función limpia recursivamente todas las propiedades con valor `undefined`, filtra elementos
 * `undefined` en arrays y preserva intactos tipos especiales de Firestore (FieldValue, Timestamp, Date).
 */

export const sanitizeForFirestore = <T>(data: T): T => {
  // Manejo de valores nulos o primitivos
  if (data === null || typeof data !== "object") {
    return data;
  }

  // Preservar instancias nativas de Date
  if (data instanceof Date) {
    return data;
  }

  // Preservar valores especiales de Firestore FieldValue (serverTimestamp, arrayUnion, deleteField, etc.)
  if (
    "_methodName" in (data as object) ||
    (data as Record<string, unknown>).constructor?.name === "FieldValue" ||
    (data as Record<string, unknown>).constructor?.name?.includes("FieldValue")
  ) {
    return data;
  }

  // Preservar instancias de Firestore Timestamp ({ seconds: number, nanoseconds: number })
  if (
    "seconds" in (data as object) &&
    "nanoseconds" in (data as object) &&
    typeof (data as Record<string, unknown>).seconds === "number" &&
    typeof (data as Record<string, unknown>).nanoseconds === "number"
  ) {
    return data;
  }

  // Manejo recursivo de Arrays: filtrar elementos undefined y sanitizar cada ítem
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  // Manejo de Objetos / Maps planos
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }

  return result as T;
};
