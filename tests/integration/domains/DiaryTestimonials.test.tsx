import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { DiaryProvider, useDiary } from "@/context/domains/DiaryContext";
import * as testimonialService from "@/lib/firebase/testimonialService";

// Mock de AuthContext y SettingsContext para aislar el dominio de Diario
vi.mock("@/context/domains/AuthContext", () => ({
  useAuth: () => ({
    currentUserUid: "user-alpha-001",
    myProfile: {
      codename: "TestVesselUser",
      avatarUrl: "https://example.com/avatar.jpg",
    },
  }),
}));

vi.mock("@/context/domains/SettingsContext", () => ({
  useSettings: () => ({
    language: "es",
  }),
}));

// Mock del servicio de testimonios en Firebase
vi.mock("@/lib/firebase/testimonialService", () => ({
  submitTestimonialToCloud: vi.fn().mockResolvedValue("test-id-123"),
  subscribeToReceivedTestimonials: vi.fn((_uid, _cb) => () => {}),
  updateTestimonialStatusCloud: vi.fn().mockResolvedValue(undefined),
}));

describe("DiaryTestimonials — Integración de Testimonios Consensuados & Botiquín Doxy-PEP", () => {
  const mockOnProfileEncounterVerified = vi.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DiaryProvider onProfileEncounterVerified={mockOnProfileEncounterVerified}>
      {children}
    </DiaryProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Testimonios de Encuentros Consensuados", () => {
    it("debe registrar un testimonio nuevo con estado 'pending' y método de validación", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.addTestimonial(
          "partner-profile-42",
          "Excelente encuentro, súper respetuoso y puntual.",
          ["Cero Ghosteo", "Hospeda Cómodo"],
          "rendezvous_pin"
        );
      });

      // Debe haber notificado al perfil externo
      expect(mockOnProfileEncounterVerified).toHaveBeenCalledTimes(1);
      const [, passedTestimonial] = mockOnProfileEncounterVerified.mock.calls[0];
      expect(passedTestimonial.content).toContain("Excelente encuentro");
      expect(passedTestimonial.status).toBe("pending");
      expect(passedTestimonial.validationMethod).toBe("rendezvous_pin");
      expect(passedTestimonial.encounterVerified).toBe(true);

      // Debe haber llamado a la persistencia en Firebase
      expect(testimonialService.submitTestimonialToCloud).toHaveBeenCalled();
    });

    it("debe permitir aprobar un testimonio recibido", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.approveTestimonial("me", "testimonial-123", true);
      });

      expect(testimonialService.updateTestimonialStatusCloud).toHaveBeenCalledWith(
        "testimonial-123",
        "approved"
      );
    });

    it("debe permitir ocultar un testimonio (makePublic = false)", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.hideTestimonial("me", "testimonial-123");
      });

      expect(testimonialService.updateTestimonialStatusCloud).toHaveBeenCalledWith(
        "testimonial-123",
        "hidden"
      );
    });

    it("debe permitir rechazar un testimonio", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.rejectTestimonial("me", "testimonial-456");
      });

      expect(testimonialService.updateTestimonialStatusCloud).toHaveBeenCalledWith(
        "testimonial-456",
        "rejected"
      );
    });
  });

  describe("Botiquín Preventivo Doxy-PEP", () => {
    it("debe registrar un recordatorio Doxy-PEP calculando ventanas de 24h y 72h", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.addDoxyPepTracker({
          partnerCodename: "ShadowDancer",
          encounterDate: "2026-09-06",
          encounterTime: "22:30",
        });
      });

      expect(result.current.doxyPepTrackers.length).toBeGreaterThan(0);
      const tracker = result.current.doxyPepTrackers[0];
      expect(tracker.partnerCodename).toBe("ShadowDancer");
      expect(tracker.taken24h).toBe(false);
      expect(tracker.taken72h).toBe(false);
      expect(tracker.isDismissed).toBe(false);
      expect(new Date(tracker.due24h).getTime()).toBeGreaterThan(Date.now());
      expect(new Date(tracker.due72h).getTime()).toBeGreaterThan(new Date(tracker.due24h).getTime());
    });

    it("debe alternar la toma de dosis de 24h y 72h", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.addDoxyPepTracker({
          partnerCodename: "ShadowDancer",
          encounterDate: "2026-09-06",
          encounterTime: "22:30",
        });
      });

      const trackerId = result.current.doxyPepTrackers[0].id;

      // Marcar dosis de 24h
      await act(async () => {
        result.current.toggleDoxyPepDose(trackerId, "24h");
      });

      expect(result.current.doxyPepTrackers.find((t) => t.id === trackerId)?.taken24h).toBe(true);

      // Marcar dosis de 72h
      await act(async () => {
        result.current.toggleDoxyPepDose(trackerId, "72h");
      });

      expect(result.current.doxyPepTrackers.find((t) => t.id === trackerId)?.taken72h).toBe(true);
    });

    it("debe descartar el recordatorio Doxy-PEP", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      await act(async () => {
        result.current.addDoxyPepTracker({
          partnerCodename: "ShadowDancer",
          encounterDate: "2026-09-06",
          encounterTime: "22:30",
        });
      });

      const trackerId = result.current.doxyPepTrackers[0].id;

      await act(async () => {
        result.current.dismissDoxyPepTracker(trackerId);
      });

      expect(result.current.doxyPepTrackers.find((t) => t.id === trackerId)).toBeUndefined();
    });
  });

  describe("Entradas del Diario de Citas", () => {
    it("debe crear, actualizar y eliminar una entrada del diario", async () => {
      const { result } = renderHook(() => useDiary(), { wrapper });

      let createdEntry: any;
      await act(async () => {
        createdEntry = result.current.addDiaryEntry({
          person: { codename: "NeonPhantom" },
          date: "2026-09-06",
          time: "23:00",
          isUpcoming: false,
          location: { name: "Palermo", category: "their_place" },
          encounterType: "intense_carnal",
          privateNotes: "Noche increíble, conexión brutal",
          tags: ["Química Total", "Seguro"],
          satisfaction: {
            expectationsRating: 5,
            chemistryLevel: 5,
            boundariesRespect: 5,
            overallScore: 5,
            wouldRepeat: "yes",
          },
        });
      });

      expect(createdEntry).toBeDefined();
      expect(result.current.diaryEntries.some((e) => e.id === createdEntry.id)).toBe(true);

      // Actualizar
      await act(async () => {
        result.current.updateDiaryEntry(createdEntry.id, {
          privateNotes: "Notas actualizadas tras el encuentro",
        });
      });

      const updated = result.current.diaryEntries.find((e) => e.id === createdEntry.id);
      expect(updated?.privateNotes).toBe("Notas actualizadas tras el encuentro");

      // Eliminar
      await act(async () => {
        result.current.deleteDiaryEntry(createdEntry.id);
      });

      expect(result.current.diaryEntries.some((e) => e.id === createdEntry.id)).toBe(false);
    });
  });
});
