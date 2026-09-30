import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCard } from "@/components/matrix/ProfileCard";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { MOCK_PROFILES } from "@/data/mockProfiles";

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBassDrop: vi.fn(),
    playTacticalBlip: vi.fn(),
  },
}));

const mockToggleFavorite = vi.fn();
let mockFavoriteIds: string[] = [];
const testProfiles = MOCK_PROFILES.slice(0, 4);

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    profiles: testProfiles,
    filteredProfiles: testProfiles,
    filters: {
      bodyStates: ["open", "occupied", "dormant"],
      roles: [],
      minIntensity: 1,
      maxDistanceKm: 5,
      immediateHostOnly: false,
      selectedKinks: [],
      energyVibes: [],
      onlyAntiGhost: false,
      searchQuery: "",
      onlyFavorites: false,
    },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
    transmissions: {},
    transmitSignal: vi.fn(),
    getMutualKinkMatches: vi.fn().mockReturnValue([]),
    hasMutualPulse: vi.fn().mockReturnValue(false),
    matrixTab: "people",
    setMatrixTab: vi.fn(),
    favoriteProfileIds: mockFavoriteIds,
    isFavoriteProfile: (id: string) => mockFavoriteIds.includes(id),
    toggleFavoriteProfile: (id: string) => mockToggleFavorite(id),
    isOnTheClockFilterActive: false,
    setIsOnTheClockFilterActive: vi.fn(),
    setIsFilterDrawerOpen: vi.fn(),
    setActiveView: vi.fn(),
  }),
  useChat: () => ({
    getBoundaryForProfile: vi.fn().mockReturnValue(null),
  }),
  useDiary: () => ({
    diaryEntries: [],
    diaryStats: { totalEncounters: 0, completedEncounters: 0, repeatPercentage: 80 },
    doxyPepTrackers: [],
    addDoxyPepTracker: vi.fn(),
    deleteDiaryEntry: vi.fn(),
    myReceivedTestimonials: [],
    toggleTestimonialVisibility: vi.fn(),
    openCreateDiaryModal: vi.fn(),
    closeCreateDiaryModal: vi.fn(),
    addDiaryEntry: vi.fn(),
    updateDiaryEntry: vi.fn(),
    getProfileDossier: vi.fn().mockReturnValue(null),
    diaryModalPreselectedProfileId: null,
    editingDiaryEntry: null,
  }),
  useSettings: () => ({
    t: TRANSLATIONS.es,
    language: "es",
    isUnlimited: false,
    openUnlimitedModal: vi.fn(),
    appMode: "test",
    setAppMode: vi.fn(),
  }),
  useAuth: () => ({
    openAuthModal: vi.fn(),
    currentUserUid: "local-user",
  }),
  useLogistics: () => ({
    openNightlifeModal: vi.fn(),
    travelMode: { isActive: false },
    openTravelModal: vi.fn(),
    tacticalHotspots: [],
    nightlifeEvents: [],
  }),
  useVessel: () => ({
    profiles: testProfiles,
    filteredProfiles: testProfiles,
    transmissions: {},
    validatedEncounters: {},
    unlockedVaults: {},
    filters: {
      bodyStates: ["open", "occupied", "dormant"],
      roles: [],
      minIntensity: 1,
      maxDistanceKm: 5,
      immediateHostOnly: false,
      selectedKinks: [],
      energyVibes: [],
      onlyAntiGhost: false,
      searchQuery: "",
      onlyFavorites: false,
    },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
    openCreateDiaryModal: vi.fn(),
    openItsExposureModal: vi.fn(),
    diaryEntries: [],
    diaryStats: { totalEncounters: 0, completedEncounters: 0, repeatPercentage: 80 },
    doxyPepTrackers: [],
    addDoxyPepTracker: vi.fn(),
    deleteDiaryEntry: vi.fn(),
    myReceivedTestimonials: [],
    toggleTestimonialVisibility: vi.fn(),
    setSelectedProfile: vi.fn(),
    setActiveChatProfileId: vi.fn(),
    myProfile: {
      codename: "TEST_USER",
      respectScore: 98,
    },
    language: "es",
    t: TRANSLATIONS.es,
    isUnlimited: false,
    openUnlimitedModal: vi.fn(),
    favoriteProfileIds: mockFavoriteIds,
    isFavoriteProfile: (id: string) => mockFavoriteIds.includes(id),
    toggleFavoriteProfile: (id: string) => mockToggleFavorite(id),
    diaryModalPreselectedProfileId: null,
    editingDiaryEntry: null,
    addDiaryEntry: vi.fn(),
    updateDiaryEntry: vi.fn(),
    hasMutualPulse: vi.fn().mockReturnValue(false),
    getMutualKinkMatches: vi.fn().mockReturnValue([]),
    getBoundaryForProfile: vi.fn().mockReturnValue(null),
    getProfileDossier: vi.fn().mockReturnValue(null),
  }),
}));

describe("Sistema de Perfiles Favoritos (Matrix & Encuentros)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoriteIds = [];
  });

  it("permite marcar como favorito un perfil desde la ProfileCard llamando a toggleFavoriteProfile", () => {
    const profile = MOCK_PROFILES[1];
    render(
      <ProfileCard
        profile={profile}
        onSelect={vi.fn()}
        onOpenChat={vi.fn()}
      />
    );

    const favButton = screen.getByTestId(`profile-favorite-toggle-${profile.id}`);
    expect(favButton).toBeInTheDocument();
    fireEvent.click(favButton);

    expect(mockToggleFavorite).toHaveBeenCalledWith(profile.id);
  });

  it("muestra el estado activo de favorito cuando el perfil está en la lista de favoritos", () => {
    const profile = MOCK_PROFILES[1];
    mockFavoriteIds = [profile.id];
    render(
      <ProfileCard
        profile={profile}
        onSelect={vi.fn()}
        onOpenChat={vi.fn()}
      />
    );

    const favButton = screen.getByTestId(`profile-favorite-toggle-${profile.id}`);
    expect(favButton).toHaveAttribute("aria-pressed", "true");
  });
});
