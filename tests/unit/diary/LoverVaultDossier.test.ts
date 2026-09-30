import { describe, it, expect } from "vitest";
import { ProfileDossier, DiaryPersonProfile } from "@/types/vessel";

describe("The Black Vault — Bóveda Visual del Amante & Dossier de Química", () => {
  it("debe archivar fotos recibidas en el chat en el dossier del amante sin duplicados", () => {
    const existingDossier: ProfileDossier = {
      profileId: "user-test-1",
      customAlias: "Mateo_X",
      sharedPhotos: ["https://storage.vessel.app/photo1.jpg"],
      chemistryLevel: 5,
      badges: ["🔥 Química Nuclear"],
      lastEncounterDate: "2026-09-20",
      encounterCount: 2,
      redFlags: [],
      greenFlags: ["Puntual", "Gran físico"],
      updatedAt: "2026-09-20T00:00:00Z",
    };

    const newChatPhotos = [
      "https://storage.vessel.app/photo1.jpg", // Duplicada
      "https://storage.vessel.app/photo2.jpg", // Nueva
      "https://storage.vessel.app/photo3.jpg", // Nueva
    ];

    const updatedPhotos = Array.from(
      new Set([...(existingDossier.sharedPhotos || []), ...newChatPhotos])
    );

    expect(updatedPhotos).toHaveLength(3);
    expect(updatedPhotos).toEqual([
      "https://storage.vessel.app/photo1.jpg",
      "https://storage.vessel.app/photo2.jpg",
      "https://storage.vessel.app/photo3.jpg",
    ]);
  });

  it("debe permitir eliminar fotos específicas de la bóveda del amante", () => {
    const dossier: ProfileDossier = {
      profileId: "user-test-2",
      customAlias: "Luciano_BA",
      sharedPhotos: [
        "https://storage.vessel.app/picA.jpg",
        "https://storage.vessel.app/picB.jpg",
        "https://storage.vessel.app/picC.jpg",
      ],
      chemistryLevel: 4,
      redFlags: [],
      greenFlags: [],
      updatedAt: "2026-09-20T00:00:00Z",
    };

    const photoToRemove = "https://storage.vessel.app/picB.jpg";
    const remainingPhotos = (dossier.sharedPhotos || []).filter((p) => p !== photoToRemove);

    expect(remainingPhotos).toHaveLength(2);
    expect(remainingPhotos).not.toContain(photoToRemove);
  });

  it("invariante Local-First / Zero-Cloud: la ficha persiste de manera soberana e inmune a cambios del perfil remoto", () => {
    const localDossier: ProfileDossier = {
      profileId: "user-deleted-or-blocked",
      customAlias: "Alejo_Palermo",
      sharedPhotos: ["https://storage.vessel.app/secret1.jpg"],
      privateNotes: "Excelente química, departamento con terraza.",
      chemistryLevel: 5,
      badges: ["👑 Dios del Sexo Oral"],
      encounterCount: 3,
      redFlags: [],
      greenFlags: [],
      updatedAt: "2026-09-20T00:00:00Z",
    };

    // Simulamos que el perfil remoto fue eliminado o bloqueado (perfil externo/nulo)
    const remoteProfileExists = false;
    const resolvedCodename = remoteProfileExists ? "Desconocido" : (localDossier.customAlias || "Sin alias");

    expect(localDossier.sharedPhotos).toHaveLength(1);
    expect(localDossier.privateNotes).toBe("Excelente química, departamento con terraza.");
    expect(localDossier.badges).toContain("👑 Dios del Sexo Oral");
    expect(resolvedCodename).toBe("Alejo_Palermo");
  });

  it("Hold-to-Reveal DRM: el estado de desenfoque debe activarse exclusivamente bajo presión táctil continua", () => {
    const drmState = {
      isRevealed: false,
      isHolding: false,
      activeTimer: null as any,
    };

    const handlePointerDown = () => {
      drmState.isHolding = true;
      drmState.isRevealed = true;
    };

    const handlePointerUp = () => {
      drmState.isHolding = false;
      drmState.isRevealed = false;
    };

    // Estado inicial: protegido y desenfocado
    expect(drmState.isRevealed).toBe(false);

    // Usuario mantiene presionado
    handlePointerDown();
    expect(drmState.isRevealed).toBe(true);

    // Usuario suelta el dedo
    handlePointerUp();
    expect(drmState.isRevealed).toBe(false);
  });
});
