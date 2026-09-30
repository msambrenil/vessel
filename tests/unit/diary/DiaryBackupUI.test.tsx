import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiaryLoversVaultSection, LoverVaultItem } from "@/components/diary/DiaryLoversVaultSection";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import * as diaryCrypto from "@/lib/security/diaryBackupCrypto";

describe("DiaryLoversVaultSection — Respaldo Cifrado UI", () => {
  const t = TRANSLATIONS.es;
  const mockLovers: LoverVaultItem[] = [
    {
      profileId: "lover-101",
      codename: "Valkyrie",
      avatarUrl: "https://example.com/avatar.jpg",
      role: "Dominant",
      encounterCount: 4,
      lastDate: "2026-09-18",
      chemistryLevel: 5,
      wouldRepeat: true,
      photosCount: 2,
      badges: ["Química Nuclear"],
    },
  ];

  const defaultProps = {
    lovers: mockLovers,
    onOpenDossier: vi.fn(),
    onSendRevancha: vi.fn(),
    language: "es" as const,
    t,
  };

  it("renderiza los botones de exportar e importar respaldo en la cabecera", () => {
    render(<DiaryLoversVaultSection {...defaultProps} />);

    expect(screen.getByTestId("diary-export-backup-btn")).toBeDefined();
    expect(screen.getByTestId("diary-import-backup-btn")).toBeDefined();
  });

  it("abre el modal de exportación al presionar 'Exportar Respaldo 🔒'", () => {
    render(<DiaryLoversVaultSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId("diary-export-backup-btn"));

    expect(screen.getByText("Exportar Respaldo Cifrado")).toBeDefined();
    expect(screen.getByTestId("diary-backup-password-input")).toBeDefined();
    expect(screen.getByTestId("diary-backup-submit-btn")).toBeDefined();
  });

  it("llama a encryptDiaryBackup y downloadBackupFile al confirmar exportación con contraseña", async () => {
    const encryptSpy = vi.spyOn(diaryCrypto, "encryptDiaryBackup").mockResolvedValue({
      app: "vessel",
      version: 1,
      type: "diary_full_backup",
      exportedAt: "2026-09-22T00:00:00Z",
      salt: "aabb",
      iv: "ccdd",
      ciphertext: "eeff",
    });
    const downloadSpy = vi.spyOn(diaryCrypto, "downloadBackupFile").mockImplementation(() => {});

    render(<DiaryLoversVaultSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId("diary-export-backup-btn"));

    const passwordInput = screen.getByTestId("diary-backup-password-input");
    fireEvent.change(passwordInput, { target: { value: "mi-clave-tactica-99" } });

    const submitBtn = screen.getByTestId("diary-backup-submit-btn");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(encryptSpy).toHaveBeenCalledWith(
        expect.objectContaining({ lovers: mockLovers }),
        "mi-clave-tactica-99"
      );
      expect(downloadSpy).toHaveBeenCalledTimes(1);
    });

    encryptSpy.mockRestore();
    downloadSpy.mockRestore();
  });
});

import { DiaryScheduleSection } from "@/components/diary/DiaryScheduleSection";

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    updateDiaryEntry: vi.fn(),
    deleteDiaryEntry: vi.fn(),
    sendChatMessage: vi.fn(),
    language: "es",
    t: TRANSLATIONS.es,
  }),
}));

describe("DiaryScheduleSection — Vista Unificada Citas & Agenda Íntima", () => {
  const t = TRANSLATIONS.es;

  it("integra los botones de respaldo cifrado, medallas íntimas y revancha en la tarjeta unificada", () => {
    const onSendRevancha = vi.fn();
    render(
      <DiaryScheduleSection
        diaryEntries={[
          {
            id: "entry-1",
            person: {
              profileId: "lover-101",
              codename: "Valkyrie",
              role: "Dominant",
              avatarUrl: "https://example.com/avatar.jpg",
            },
            date: "2026-09-18",
            time: "23:00",
            isUpcoming: false,
            location: { name: "Depto Palermo", category: "their_place" },
            encounterType: "intense_carnal",
            privateNotes: "Sesión épica",
            tags: ["BDSM"],
            createdAt: "2026-09-18T23:00:00Z",
            updatedAt: "2026-09-18T23:00:00Z",
          },
        ]}
        profiles={[]}
        profileDossiers={{
          "lover-101": {
            badges: ["🔥 Química Nuclear"],
            sharedPhotos: ["https://example.com/photo-hero.jpg"],
          },
        }}
        favoriteProfileIds={[]}
        isFavoriteProfile={() => false}
        onSelectProfile={vi.fn()}
        onOpenChat={vi.fn()}
        onOpenDossier={vi.fn()}
        onInspectExternal={vi.fn()}
        onEditEntry={vi.fn()}
        onDeleteEntry={vi.fn()}
        onCompleteEntry={vi.fn()}
        onSendRevancha={onSendRevancha}
        onScheduleNew={vi.fn()}
        averageRating={4.9}
        respectScore={100}
        language="es"
        t={t}
      />
    );

    expect(screen.getByTestId("diary-export-backup-btn")).toBeDefined();
    expect(screen.getByTestId("diary-import-backup-btn")).toBeDefined();
    expect(screen.getByText("🔥 Química Nuclear")).toBeDefined();
    expect(screen.getByText("1 fotos")).toBeDefined();

    const revanchaBtn = screen.getByText("Quiero la Revancha");
    fireEvent.click(revanchaBtn);
    expect(onSendRevancha).toHaveBeenCalledWith({
      profileId: "lover-101",
      codename: "Valkyrie",
    });
  });
});

