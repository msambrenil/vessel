import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateDiaryView } from "@/components/diary/DateDiaryView";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockOpenCreateDiaryModal = vi.fn();
const mockOpenItsExposureModal = vi.fn();
const mockDeleteDiaryEntry = vi.fn();
const mockToggleTestimonialVisibility = vi.fn();
const mockSetSelectedProfile = vi.fn();
const mockSetActiveChatProfileId = vi.fn();
const mockAddDoxyPepTracker = vi.fn();

const mockEntries = [
  {
    id: "diary-01",
    person: {
      profileId: "vessel-01",
      codename: "KLAUS_030",
      avatarUrl: "https://example.com/klaus.jpg",
      age: 29,
      role: "Top" as const,
      yoSoy: "Leather / Arnés",
      privateNotes: "Excelente host, arnés impecable.",
      isExternalProfile: false,
    },
    date: "2026-08-23",
    time: "14:15",
    isUpcoming: false,
    location: {
      name: "Departamento Kreuzberg",
      category: "their_place" as const,
      address: "Kreuzberg, Berlín",
    },
    encounterType: "intense_carnal" as const,
    satisfaction: {
      expectationsRating: 5,
      chemistryLevel: 5,
      boundariesRespect: 5,
      overallScore: 5,
      wouldRepeat: "yes" as const,
    },
    privateNotes: "Química total.",
    tags: ["Química Brutal", "Puntual"],
    createdAt: "2026-08-23T14:45:00Z",
    updatedAt: "2026-08-23T14:45:00Z",
  },
  {
    id: "diary-02",
    person: {
      profileId: "vessel-02",
      codename: "RECEPTOR_V",
      avatarUrl: "https://example.com/receptor.jpg",
      age: 32,
      role: "Bottom" as const,
      yoSoy: "Atlético / Jock",
      isExternalProfile: false,
    },
    date: "2026-08-20",
    time: "21:30",
    isUpcoming: false,
    location: {
      name: "Mi Bóveda",
      category: "my_place" as const,
    },
    encounterType: "chill_talk" as const,
    satisfaction: {
      expectationsRating: 4,
      chemistryLevel: 4,
      boundariesRespect: 5,
      overallScore: 4,
      wouldRepeat: "yes" as const,
    },
    privateNotes: "Muy buena conexión.",
    tags: ["Gran Conexión", "Discreto"],
    createdAt: "2026-08-20T22:30:00Z",
    updatedAt: "2026-08-20T22:30:00Z",
  },
  {
    id: "diary-03",
    person: {
      profileId: "vessel-03",
      codename: "VOID_MONOLITH",
      avatarUrl: "https://example.com/void.jpg",
      age: 35,
      role: "Dominant" as const,
      isExternalProfile: false,
    },
    date: "2026-08-26",
    time: "23:00",
    isUpcoming: true,
    location: {
      name: "Basement Darkroom",
      category: "club_darkroom" as const,
    },
    encounterType: "darkroom_session" as const,
    privateNotes: "Cita futura agendada.",
    tags: ["Darkroom"],
    createdAt: "2026-08-23T10:00:00Z",
    updatedAt: "2026-08-23T10:00:00Z",
  },
];

const mockReceivedTestimonials = [
  {
    id: "test-rec-01",
    authorId: "vessel-01",
    authorCodename: "KLAUS_030",
    authorAvatar: "https://example.com/klaus.jpg",
    content: "Increíble anfitrión, lugar súper prolijo y respeto absoluto.",
    tags: ["Excelente Host", "Química Total"],
    createdAt: "Hace 2 días",
    rating: 5,
    status: "approved" as const,
    encounterVerified: true,
  },
];

const mockProfiles = [
  {
    id: "vessel-01",
    codename: "KLAUS_030",
    age: 29,
    role: "Top",
    bodyState: "open" as const,
    mobility: "Tengo depto / lugar" as const,
    exitProtocol: "fast_encounter" as const,
  },
  {
    id: "vessel-02",
    codename: "RECEPTOR_V",
    age: 32,
    role: "Bottom",
    bodyState: "occupied" as const,
    mobility: "Me desplazo" as const,
    exitProtocol: "chill_cuddle" as const,
  },
];

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    openCreateDiaryModal: mockOpenCreateDiaryModal,
    openItsExposureModal: mockOpenItsExposureModal,
    diaryEntries: mockEntries,
    diaryStats: {
      totalEncounters: 3,
      averageSatisfaction: 4.8,
      averageChemistry: 4.7,
      repeatPercentage: 100,
      topLocationCategory: "their_place",
      upcomingDatesCount: 1,
      pendingHealthChecksCount: 0,
    },
    doxyPepTrackers: [],
    addDoxyPepTracker: mockAddDoxyPepTracker,
    deleteDiaryEntry: mockDeleteDiaryEntry,
    myReceivedTestimonials: mockReceivedTestimonials,
    toggleTestimonialVisibility: mockToggleTestimonialVisibility,
    profiles: mockProfiles,
    setSelectedProfile: mockSetSelectedProfile,
    setActiveChatProfileId: mockSetActiveChatProfileId,
    myProfile: {
      respectScore: 98,
    },
    language: "es",
    t: TRANSLATIONS.es,
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
  },
}));

describe("DateDiaryView — Dashboard Táctico de Encuentros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar la cabecera táctica con el título 'Chongos & Citas 📖 (Diario)' y credencial AES-256", () => {
    render(<DateDiaryView />);

    expect(screen.getByText(/Chongos & Citas/i)).toBeInTheDocument();
    expect(screen.getByText(/AES-256 VAULT/i)).toBeInTheDocument();
    expect(screen.getByText(/Documentar Encuentro/i)).toBeInTheDocument();
  });

  it("debe renderizar el Bento Grid de telemetría con contadores y Respect Karma", () => {
    render(<DateDiaryView />);

    expect(screen.getByText(/Total Encuentros/i)).toBeInTheDocument();
    expect(screen.getByText(/Respect Karma/i)).toBeInTheDocument();
    expect(screen.getByText(/98%/i)).toBeInTheDocument();
    expect(screen.getByText(/Valoración Sobre Mí/i)).toBeInTheDocument();
  });

  it("debe renderizar la sección de valoraciones recibidas sobre mí con testimonios", () => {
    render(<DateDiaryView />);

    expect(screen.getByText(/Valoraciones de Onda & Confianza/i)).toBeInTheDocument();
    expect(screen.getByText(/Increíble anfitrión, lugar súper prolijo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Excelente Host/i).length).toBeGreaterThan(0);
  });

  it("debe invocar setSelectedProfile al hacer clic en el rostro de un encuentro", () => {
    render(<DateDiaryView />);

    // Rostro de KLAUS_030
    const klausAvatars = screen.getAllByAltText("KLAUS_030");
    fireEvent.click(klausAvatars[0]);

    expect(mockSetSelectedProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: "vessel-01", codename: "KLAUS_030" })
    );
  });

  it("debe renderizar y filtrar por los presets de fecha", () => {
    render(<DateDiaryView />);

    expect(screen.getByText(TRANSLATIONS.es.diary.filterAll)).toBeInTheDocument();
    expect(screen.getByText(TRANSLATIONS.es.diary.filter7Days)).toBeInTheDocument();
    expect(screen.getByText(TRANSLATIONS.es.diary.filter30Days)).toBeInTheDocument();
    expect(screen.getByText(TRANSLATIONS.es.diary.filterThisYear)).toBeInTheDocument();
    expect(screen.getByText(TRANSLATIONS.es.diary.filterCustomRange)).toBeInTheDocument();
  });

  it("debe invocar openCreateDiaryModal al hacer clic en Documentar Encuentro", () => {
    render(<DateDiaryView />);

    const docBtn = screen.getByRole("button", { name: /Documentar Encuentro/i });
    fireEvent.click(docBtn);

    expect(mockOpenCreateDiaryModal).toHaveBeenCalledTimes(1);
  });

  it("debe conmutar entre la pestaña 'Bitácora de Citas' y 'Salud & Cuidado'", () => {
    render(<DateDiaryView />);

    // Por defecto estamos en Bitácora de Citas
    expect(screen.getByText(/Total Encuentros/i)).toBeInTheDocument();

    // Hacemos clic en la pestaña Salud & Cuidado
    const healthTabBtn = screen.getByRole("button", { name: /Salud & Cuidado/i });
    fireEvent.click(healthTabBtn);

    // Debe mostrar las secciones clínicas de Salud & Cuidado
    expect(screen.getByText(/Control & Calendario PrEP/i)).toBeInTheDocument();
    expect(screen.getByText(/Alerta de Exposición a ITS/i)).toBeInTheDocument();
    expect(screen.getByText(/Reducción de Daños/i)).toBeInTheDocument();
  });

  it("debe invocar openItsExposureModal al hacer clic en Emitir Alerta Anónima", () => {
    render(<DateDiaryView />);

    // Ir a pestaña Salud & Cuidado
    const healthTabBtn = screen.getByRole("button", { name: /Salud & Cuidado/i });
    fireEvent.click(healthTabBtn);

    // Botón de emitir alerta
    const alertBtn = screen.getByRole("button", { name: /Emitir Alerta Anónima/i });
    fireEvent.click(alertBtn);

    expect(mockOpenItsExposureModal).toHaveBeenCalledTimes(1);
  });
});
