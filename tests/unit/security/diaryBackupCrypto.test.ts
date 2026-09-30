import { describe, it, expect } from "vitest";
import {
  encryptDiaryBackup,
  decryptDiaryBackup,
  EncryptedBackupEnvelope,
} from "@/lib/security/diaryBackupCrypto";

describe("diaryBackupCrypto — Respaldo Cifrado de Agenda", () => {
  const sampleData = {
    entries: [
      { id: "entry-1", partnerCodename: "Shadow", date: "2026-09-25", time: "22:00" },
    ],
    lovers: [
      { id: "lover-1", codename: "Shadow", chemistry: 5, encountersCount: 3 },
    ],
    privateNotes: {
      "lover-1": "Notas íntimas sumamente confidenciales.",
    },
  };

  it("cifra exitosamente y genera un sobre de respaldo estándar", async () => {
    const envelope = await encryptDiaryBackup(sampleData, "clave-secreta-1234");

    expect(envelope.app).toBe("vessel");
    expect(envelope.version).toBe(1);
    expect(envelope.type).toBe("diary_full_backup");
    expect(envelope.salt).toBeDefined();
    expect(envelope.iv).toBeDefined();
    expect(envelope.ciphertext).toBeDefined();
    expect(typeof envelope.ciphertext).toBe("string");
  });

  it("descifra el sobre con la contraseña correcta y recupera exactamente la estructura", async () => {
    const envelope = await encryptDiaryBackup(sampleData, "clave-secreta-1234");
    const restored = await decryptDiaryBackup(envelope, "clave-secreta-1234");

    expect(restored).toEqual(sampleData);
  });

  it("falla al intentar descifrar con una contraseña incorrecta", async () => {
    const envelope = await encryptDiaryBackup(sampleData, "clave-secreta-1234");

    await expect(
      decryptDiaryBackup(envelope, "contraseña-equivocada")
    ).rejects.toThrow("Contraseña incorrecta");
  });

  it("rechaza intentos con contraseñas vacías", async () => {
    await expect(encryptDiaryBackup(sampleData, "   ")).rejects.toThrow(
      "Se requiere una contraseña"
    );

    const envelope = await encryptDiaryBackup(sampleData, "clave-valida");
    await expect(decryptDiaryBackup(envelope, "")).rejects.toThrow(
      "Se requiere la contraseña"
    );
  });

  it("rechaza sobres que no pertenecen a VESSEL", async () => {
    const fakeEnvelope: EncryptedBackupEnvelope = {
      app: "vessel",
      version: 1,
      type: "diary_full_backup",
      exportedAt: new Date().toISOString(),
      salt: "00",
      iv: "00",
      ciphertext: "00",
    };

    (fakeEnvelope as any).app = "otro_sistema";

    await expect(
      decryptDiaryBackup(fakeEnvelope, "clave-cualquiera")
    ).rejects.toThrow("no corresponde a un respaldo válido");
  });
});
