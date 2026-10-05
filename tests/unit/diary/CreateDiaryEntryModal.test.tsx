import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateDiaryEntryModal } from "@/components/diary/CreateDiaryEntryModal";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockAddDiaryEntry = vi.fn();
const mockUpdateDiaryEntry = vi.fn();
const mockArchivePhotosToDossier = vi.fn();
const mockOnClose = vi.fn();

const mockProfiles = [
  {
    id: "vessel-01",
    codename: "KLAUS_030",
    avatarUrl: "https://example.com/klaus.jpg",
    age: 29,
    role: "Top",
    mobility: "Tengo depto / lugar",
  },
  {
    id: "vessel-02",
    codename: "RECEPTOR_V",
    avatarUrl: "https://example.com/receptor.jpg",
    age: 32,
    role: "Bottom",
    mobility: "Me desplazo",
  },
];

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    profiles: mockProfiles,
    myProfile: {
      id: "my-user",
      codename: "TEST_USER",
      mobility: "Tengo depto / lugar",
    },
    diaryModalPreselectedProfileId: null,
    editingDiaryEntry: null,
    addDiaryEntry: mockAddDiaryEntry,
    updateDiaryEntry: mockUpdateDiaryEntry,
    archivePhotosToDossier: mockArchivePhotosToDossier,
    language: "es",
    t: TRANSLATIONS.es,
    favoriteProfileIds: ["vessel-01"],
    isFavoriteProfile: (id: string) => id === "vessel-01",
    chatMessages: {},
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playError: vi.fn(),
  },
}));

describe("CreateDiaryEntryModal — Flujo Adaptativo Bifurcado en 2 Pasos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el modal en modo 'Agendar Salida' por defecto con progreso Paso 1 de 2", () => {
    render(<CreateDiaryEntryModal onClose={mockOnClose} />);

    expect(screen.getAllByText(/Agendar Salida/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Paso 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Chongo de la App/i)).toBeInTheDocument();
    expect(screen.getByText(/Alguien de afuera/i)).toBeInTheDocument();
  });

  it("debe permitir conmutar entre '📅 Agendar Salida' y '⚡ Pasar en Limpio'", () => {
    render(<CreateDiaryEntryModal onClose={mockOnClose} />);

    const logTab = screen.getByTestId("diary-modal-tab-log");
    fireEvent.click(logTab);

    expect(screen.getByText(/Pasar Cita en Limpio/i)).toBeInTheDocument();
    expect(screen.getByText(/Quién y Dónde fue/i)).toBeInTheDocument();
  });

  it("debe permitir filtrar por 'Solo Favoritos' en el selector de perfiles", () => {
    render(<CreateDiaryEntryModal onClose={mockOnClose} />);

    const favToggle = screen.getByTestId("diary-modal-toggle-only-favorites");
    expect(favToggle).toBeInTheDocument();

    // Al inicio están ambos
    expect(screen.getByText("KLAUS_030")).toBeInTheDocument();
    expect(screen.getByText("RECEPTOR_V")).toBeInTheDocument();

    // Filtramos solo favoritos (solo vessel-01 es fav)
    fireEvent.click(favToggle);
    expect(screen.getByText("KLAUS_030")).toBeInTheDocument();
    expect(screen.queryByText("RECEPTOR_V")).not.toBeInTheDocument();
  });

  it("debe avanzar del Paso 1 al Paso 2 en modo Agendar Salida y guardar", () => {
    render(<CreateDiaryEntryModal onClose={mockOnClose} />);

    // Seleccionamos a KLAUS_030 en Paso 1
    const klausBtn = screen.getByRole("button", { name: /Seleccionar a KLAUS_030/i });
    fireEvent.click(klausBtn);

    // Click en Continuar
    const nextBtn = screen.getByTestId("diary-modal-next-btn");
    fireEvent.click(nextBtn);

    // Ahora estamos en Paso 2 de 2 (Cuándo y Dónde)
    expect(screen.getByText(/Paso 2 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuándo es la salida\?/i)).toBeInTheDocument();
    expect(screen.getByText(/¿Dónde se ven\?/i)).toBeInTheDocument();

    // Guardar
    const scheduleBtn = screen.getByTestId("diary-modal-submit-btn");
    fireEvent.click(scheduleBtn);

    expect(mockAddDiaryEntry).toHaveBeenCalledTimes(1);
    expect(mockAddDiaryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        isUpcoming: true,
        person: expect.objectContaining({
          profileId: "vessel-01",
          codename: "KLAUS_030",
        }),
      })
    );
  });

  it("debe completar la Ficha Íntima en Paso 2 en modo Pasar Cita en Limpio", () => {
    render(<CreateDiaryEntryModal onClose={mockOnClose} />);

    // Conmutamos a Pasar Cita en Limpio
    const logTab = screen.getByTestId("diary-modal-tab-log");
    fireEvent.click(logTab);

    // Paso 1: Avanzar a Paso 2
    const nextBtn = screen.getByTestId("diary-modal-next-btn");
    fireEvent.click(nextBtn);

    // Paso 2: La Ficha & Química
    expect(screen.getByText(/¿Cómo estuvo la cita\?/i)).toBeInTheDocument();
    expect(screen.getByText(/¿Da para revancha\?/i)).toBeInTheDocument();

    // Seleccionamos 5 estrellas
    const star5Btn = screen.getByRole("button", { name: /Calificar con 5 estrellas/i });
    fireEvent.click(star5Btn);

    // Guardar en la Libreta
    const saveBtn = screen.getByTestId("diary-modal-submit-btn");
    fireEvent.click(saveBtn);

    expect(mockAddDiaryEntry).toHaveBeenCalledTimes(1);
    expect(mockAddDiaryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        isUpcoming: false,
        satisfaction: expect.objectContaining({
          expectationsRating: 5,
        }),
      })
    );
  });
});
