import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DiaryEntryCard } from "@/components/diary/DiaryEntryCard";
import { DiaryEntry, DiaryLocation } from "@/types/vessel";
import { TRANSLATIONS } from "@/lib/i18n/translations";

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    updateDiaryEntry: vi.fn(),
    deleteDiaryEntry: vi.fn(),
    sendChatMessage: vi.fn(),
    language: "es",
    t: TRANSLATIONS.es,
  });
  return {
    useVessel: mockCtx,
    useAuth: mockCtx,
    useSettings: mockCtx,
    useRadarMatrix: mockCtx,
    useChat: mockCtx,
    useLogistics: mockCtx,
    useDiary: mockCtx,
    useSafety: mockCtx,
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
  },
}));

describe("DiaryEntryCard — Micro-Evaluación en 1 Toque", () => {
  const t = TRANSLATIONS.es;
  const mockLocation: DiaryLocation = {
    name: "Bar Privado",
    category: "bar_lounge",
  };

  const unratedPastEntry: DiaryEntry = {
    id: "entry-past-1",
    person: {
      profileId: "lover-1",
      codename: "NeonWolf",
      role: "Versatile",
    },
    date: "2026-09-20",
    time: "22:00",
    isUpcoming: false,
    location: mockLocation,
    encounterType: "intense_carnal",
    privateNotes: "Nota confidencial",
    tags: ["Encuentro"],
    createdAt: "2026-09-20T22:00:00Z",
    updatedAt: "2026-09-20T22:00:00Z",
  };

  const defaultProps = {
    isRevealed: false,
    onToggleReveal: vi.fn(),
    onInspectExternal: vi.fn(),
    onOpenDossier: vi.fn(),
    onSelectProfile: vi.fn(),
    onOpenChat: vi.fn(),
    onExportDecoy: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    language: "es" as const,
    t,
  };

  it("renderiza los 3 botones de evaluación rápida para citas pasadas sin evaluar", () => {
    render(<DiaryEntryCard {...defaultProps} entry={unratedPastEntry} />);

    expect(screen.getByTestId("diary-quick-review-fire")).toBeDefined();
    expect(screen.getByTestId("diary-quick-review-good")).toBeDefined();
    expect(screen.getByTestId("diary-quick-review-bad")).toBeDefined();
  });

  it("llama a onQuickReview con química 5 y repetir 'yes' al presionar 🔥", () => {
    const onQuickReview = vi.fn();
    render(
      <DiaryEntryCard
        {...defaultProps}
        entry={unratedPastEntry}
        onQuickReview={onQuickReview}
      />
    );

    const fireBtn = screen.getByTestId("diary-quick-review-fire");
    fireEvent.click(fireBtn);

    expect(onQuickReview).toHaveBeenCalledTimes(1);
    const [calledEntry, satisfaction] = onQuickReview.mock.calls[0];
    expect(calledEntry.id).toBe("entry-past-1");
    expect(satisfaction.chemistryLevel).toBe(5);
    expect(satisfaction.expectationsRating).toBe(5);
    expect(satisfaction.wouldRepeat).toBe("yes");
  });

  it("llama a onQuickReview con química 3 al presionar 👍", () => {
    const onQuickReview = vi.fn();
    render(
      <DiaryEntryCard
        {...defaultProps}
        entry={unratedPastEntry}
        onQuickReview={onQuickReview}
      />
    );

    const goodBtn = screen.getByTestId("diary-quick-review-good");
    fireEvent.click(goodBtn);

    expect(onQuickReview).toHaveBeenCalledTimes(1);
    const [, satisfaction] = onQuickReview.mock.calls[0];
    expect(satisfaction.chemistryLevel).toBe(3);
    expect(satisfaction.wouldRepeat).toBe("maybe");
  });

  it("llama a onQuickReview con química 1 y repetir 'never' al presionar 👎", () => {
    const onQuickReview = vi.fn();
    render(
      <DiaryEntryCard
        {...defaultProps}
        entry={unratedPastEntry}
        onQuickReview={onQuickReview}
      />
    );

    const badBtn = screen.getByTestId("diary-quick-review-bad");
    fireEvent.click(badBtn);

    expect(onQuickReview).toHaveBeenCalledTimes(1);
    const [, satisfaction] = onQuickReview.mock.calls[0];
    expect(satisfaction.chemistryLevel).toBe(1);
    expect(satisfaction.wouldRepeat).toBe("never");
  });

  it("muestra el botón 'Evaluar Cita' cuando la cita es futura (isUpcoming = true)", () => {
    const upcomingEntry: DiaryEntry = {
      ...unratedPastEntry,
      id: "entry-future-1",
      isUpcoming: true,
      date: "2026-09-30",
    };

    render(<DiaryEntryCard {...defaultProps} entry={upcomingEntry} />);

    expect(screen.queryByTestId("diary-quick-review-fire")).toBeNull();
    expect(screen.getByText(t.diary.evaluateDateBtn || "Evaluar Cita")).toBeDefined();
  });

  it("muestra las calificaciones guardadas si la cita ya fue evaluada", () => {
    const evaluatedEntry: DiaryEntry = {
      ...unratedPastEntry,
      satisfaction: {
        expectationsRating: 5,
        chemistryLevel: 5,
        boundariesRespect: 5,
        overallScore: 5,
        wouldRepeat: "yes",
      },
    };

    render(<DiaryEntryCard {...defaultProps} entry={evaluatedEntry} />);

    expect(screen.queryByTestId("diary-quick-review-fire")).toBeNull();
    expect(screen.getByText("5.0")).toBeDefined();
    expect(screen.getByText("5/5")).toBeDefined();
    expect(screen.getByText("✓ Repetir")).toBeDefined();
  });
});
