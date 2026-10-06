"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  DiaryLocationCategory,
  DiaryEncounterType,
  DiaryWouldRepeat,
  RoleType,
  VesselProfile,
} from "@/types/vessel";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  Flame,
  ShieldCheck,
  RotateCcw,
  Tag,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  AlertCircle,
  Bell,
  Camera,
  Upload,
  Trash2,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ALL_ROLE_TYPES, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { getLocalTodayIso, getLocalDaysOffsetIso } from "@/lib/calendar/dateLocale";
import { uploadAndEncryptVaultPhoto } from "@/lib/security/encryptedPhotoService";

interface CreateDiaryEntryModalProps {
  onClose: () => void;
}

const LOCATION_CATEGORIES: { id: DiaryLocationCategory; label: string; icon: string }[] = [
  { id: "my_place", label: "Mi Casa / Mi Lugar", icon: "🏠" },
  { id: "their_place", label: "Su Casa / Su Lugar", icon: "🔑" },
  { id: "bar_lounge", label: "Bar / Tragos / Café", icon: "🍸" },
  { id: "club_darkroom", label: "Boliche / Darkroom", icon: "⚡" },
  { id: "hotel", label: "Telo / Hotel", icon: "🏨" },
  { id: "outdoor_cruising", label: "Al Aire Libre", icon: "🌲" },
  { id: "other", label: "Otro Espacio", icon: "📍" },
];

const ENCOUNTER_TYPES: { id: DiaryEncounterType; label: string; desc: string; icon: string }[] = [
  { id: "intense_carnal", label: "Carnal & Fuego", desc: "Encuentro físico directo y pasional", icon: "🔥" },
  { id: "chill_talk", label: "Chill & Charla", desc: "Conexión pausada, tragos y risas", icon: "☕" },
  { id: "first_date", label: "Primera Cita", desc: "Conocimiento previo y primera química", icon: "✨" },
  { id: "regular_playmate", label: "Chongo Fijo", desc: "Encuentro con conocido o habitual", icon: "🔄" },
  { id: "kink_leather", label: "Cuero & Fetiches", desc: "Juego de rol, arnés o fetiches", icon: "⛓️" },
  { id: "darkroom_session", label: "Sala Oscura / Fiesta", desc: "Atmósfera libre y adrenalina", icon: "⚡" },
  { id: "casual", label: "Casual / Espontáneo", desc: "Plan improvisado al paso", icon: "💫" },
];

const QUICK_TAGS = [
  "Química Brutal",
  "Puntual",
  "Respeto a Códigos",
  "Lugar Impecable",
  "Buena Música",
  "Muy Directo",
  "Charla Genial",
  "Para Repetir",
  "Atmósfera Íntima",
];

const EXTERNAL_AVATAR_PRESETS = [
  {
    id: "preset-techno",
    label: "Cyber Mask",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-minimal",
    label: "Silueta",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-urban",
    label: "Urbano",
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-classic",
    label: "B&W",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
];

const getNextRoundedHalfHourTime = (offsetMinutes = 30): string => {
  const d = new Date(Date.now() + offsetMinutes * 60_000);
  const mins = d.getMinutes();
  const roundedMins = mins < 30 ? 30 : 0;
  if (mins >= 30) {
    d.setHours(d.getHours() + 1);
  }
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(roundedMins).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const CreateDiaryEntryModal: React.FC<CreateDiaryEntryModalProps> = ({ onClose }) => {
  const {
    profiles,
    knownProfiles,
    myProfile,
    diaryModalPreselectedProfileId,
    editingDiaryEntry,
    addDiaryEntry,
    updateDiaryEntry,
    language,
    t,
    favoriteProfileIds: favIdsProp,
    isFavoriteProfile: isFavProp,
    chatMessages,
    archivePhotosToDossier,
  } = useVessel();

  const favoriteProfileIds = favIdsProp || [];
  const isFavoriteProfile = isFavProp || (() => false);

  // Modo de Intención: Cita Futura (Agendar) vs Encuentro Pasado (Pasar en limpio)
  const [isUpcoming, setIsUpcoming] = useState<boolean>(
    editingDiaryEntry ? editingDiaryEntry.isUpcoming : true
  );

  // Wizard adaptativo de 2 pasos máximos
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Filtro y búsqueda de perfiles
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [searchProfileQuery, setSearchProfileQuery] = useState<string>("");

  // Modo de contacto: perfil VESSEL o contacto externo
  const [profileMode, setProfileMode] = useState<"vessel_profile" | "custom">(
    editingDiaryEntry?.person.isExternalProfile ? "custom" : "vessel_profile"
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    diaryModalPreselectedProfileId || editingDiaryEntry?.person.profileId || profiles[0]?.id || ""
  );
  const [customCodename, setCustomCodename] = useState<string>(
    editingDiaryEntry?.person.isExternalProfile ? editingDiaryEntry.person.codename : ""
  );
  const [customRole, setCustomRole] = useState<RoleType>(
    editingDiaryEntry?.person.role || "Versatile"
  );
  const [customAge, setCustomAge] = useState<string>(
    editingDiaryEntry?.person.age ? String(editingDiaryEntry.person.age) : ""
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(
    editingDiaryEntry?.person.isExternalProfile ? editingDiaryEntry.person.avatarUrl || "" : ""
  );

  // Foto cifrada
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fotos de chat adjuntas
  const [selectedArchivedPhotos, setSelectedArchivedPhotos] = useState<string[]>(
    editingDiaryEntry?.attachedPhotos || []
  );

  const chatPhotos = useMemo(() => {
    if (!selectedProfileId) return [];
    const msgs = chatMessages?.[selectedProfileId] || [];
    const photos: string[] = [];
    msgs.forEach((m) => {
      if (m.senderId === selectedProfileId) {
        if (m.mediaUrl) photos.push(m.mediaUrl);
        if (m.mediaAttachment?.url) photos.push(m.mediaAttachment.url);
        if (m.mediaAttachment?.albumPhotosPreview) {
          photos.push(...m.mediaAttachment.albumPhotosPreview);
        }
      }
    });
    return Array.from(new Set(photos));
  }, [chatMessages, selectedProfileId]);

  // Notas privadas sobre la persona
  const [personPrivateNotes, setPersonPrivateNotes] = useState<string>(
    editingDiaryEntry?.person.privateNotes || ""
  );

  // Fecha y Hora
  const todayStr = getLocalTodayIso();
  const preselectedProfileObj = profiles.find((p) => p.id === diaryModalPreselectedProfileId);
  const theirHasPlace = Boolean(
    preselectedProfileObj?.mobility &&
      preselectedProfileObj.mobility.toLowerCase().includes("tengo")
  );
  const myHasPlace = Boolean(
    myProfile?.mobility && myProfile.mobility.toLowerCase().includes("tengo")
  );
  const inferredDefaultLocation: DiaryLocationCategory = theirHasPlace
    ? "their_place"
    : myHasPlace
    ? "my_place"
    : "their_place";

  const [date, setDate] = useState<string>(editingDiaryEntry?.date || todayStr);
  const [time, setTime] = useState<string>(
    editingDiaryEntry?.time || getNextRoundedHalfHourTime(30)
  );
  const [locationCategory, setLocationCategory] = useState<DiaryLocationCategory>(
    editingDiaryEntry?.location.category || inferredDefaultLocation
  );
  const [locationName, setLocationName] = useState<string>(
    editingDiaryEntry?.location.name ||
      (diaryModalPreselectedProfileId && preselectedProfileObj
        ? theirHasPlace
          ? `Lugar de ${preselectedProfileObj.codename}`
          : "Mi lugar"
        : "")
  );
  const [encounterType, setEncounterType] = useState<DiaryEncounterType>(
    editingDiaryEntry?.encounterType || "intense_carnal"
  );

  // Satisfacción y Métricas (escala 1 a 5)
  const [expectationsRating, setExpectationsRating] = useState<number>(
    editingDiaryEntry?.satisfaction?.expectationsRating || 5
  );
  const [chemistryLevel, setChemistryLevel] = useState<number>(
    Math.min(5, Math.max(1, editingDiaryEntry?.satisfaction?.chemistryLevel || 5))
  );
  const [boundariesRespect, setBoundariesRespect] = useState<number>(
    editingDiaryEntry?.satisfaction?.boundariesRespect || 5
  );
  const [wouldRepeat, setWouldRepeat] = useState<DiaryWouldRepeat>(
    editingDiaryEntry?.satisfaction?.wouldRepeat || "yes"
  );

  // Notas privadas, tags y acordeón secundario
  const [privateNotes, setPrivateNotes] = useState<string>(
    editingDiaryEntry?.privateNotes || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    editingDiaryEntry?.tags || ["Química Brutal", "Puntual"]
  );
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [isVaultAccordionOpen, setIsVaultAccordionOpen] = useState<boolean>(
    Boolean(editingDiaryEntry?.privateNotes || editingDiaryEntry?.attachedPhotos?.length)
  );

  // Salud Preventiva (90 días)
  const defaultDueDateStr = getLocalDaysOffsetIso(90);
  const [healthReminderEnabled, setHealthReminderEnabled] = useState<boolean>(
    editingDiaryEntry?.healthRoutineReminder?.enabled ?? true
  );
  const [healthDueDate, setHealthDueDate] = useState<string>(
    editingDiaryEntry?.healthRoutineReminder?.dueDate || defaultDueDateStr
  );

  const [isSaving, setIsSaving] = useState(false);

  // Inicialización de perfiles
  useEffect(() => {
    if (diaryModalPreselectedProfileId) {
      setSelectedProfileId(diaryModalPreselectedProfileId);
      setProfileMode("vessel_profile");
    } else if (editingDiaryEntry) {
      if (editingDiaryEntry.person.isExternalProfile) {
        setProfileMode("custom");
        setCustomCodename(editingDiaryEntry.person.codename || "");
        setCustomRole(editingDiaryEntry.person.role || "Versatile");
        setCustomAge(editingDiaryEntry.person.age ? String(editingDiaryEntry.person.age) : "");
        setCustomAvatarUrl(editingDiaryEntry.person.avatarUrl || "");
      } else if (editingDiaryEntry.person.profileId) {
        setProfileMode("vessel_profile");
        setSelectedProfileId(editingDiaryEntry.person.profileId);
      }
    }
  }, [diaryModalPreselectedProfileId, editingDiaryEntry]);

  // Lista de perfiles disponibles combinando radar activo y contactos conocidos
  const availableProfiles = useMemo(() => {
    const map = new Map<string, VesselProfile>();
    Object.values(knownProfiles || {}).forEach((p) => map.set(p.id, p));
    profiles.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [profiles, knownProfiles]);

  // Lista de perfiles filtrados
  const filteredProfiles = useMemo(() => {
    return availableProfiles
      .filter((p) => {
        if (showOnlyFavorites && !isFavoriteProfile(p.id)) return false;
        if (!searchProfileQuery.trim()) return true;
        const q = searchProfileQuery.toLowerCase().trim();
        return (
          p.codename.toLowerCase().includes(q) ||
          p.role?.toLowerCase().includes(q) ||
          p.yoSoy?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aFav = isFavoriteProfile(a.id) ? 1 : 0;
        const bFav = isFavoriteProfile(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.codename.localeCompare(b.codename);
      });
  }, [availableProfiles, showOnlyFavorites, searchProfileQuery, isFavoriteProfile]);

  // Subida de imagen cifrada AES-256
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setPhotoError("Por favor seleccioná un archivo de imagen válido (JPG, PNG o WEBP).");
      audioEngine.playError();
      return;
    }

    try {
      setIsProcessingPhoto(true);
      setPhotoError(null);
      const { encryptedPayload } = await uploadAndEncryptVaultPhoto(file, "local-sovereign-user");
      setCustomAvatarUrl(encryptedPayload);
      audioEngine.playPulse();
    } catch (err) {
      console.error("Error al cifrar y subir foto de contacto:", err);
      setPhotoError("No se pudo procesar la foto. Probá con otra imagen.");
      audioEngine.playError();
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handlePhotoUpload(file);
    }
  };

  const handleRemovePhoto = () => {
    setCustomAvatarUrl("");
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    audioEngine.playPulse();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = customTagInput.trim().replace(/^#/, "");
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTagInput("");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    audioEngine.playSubBass(55, 0.25);

    const linkedVesselProfile =
      profileMode === "vessel_profile"
        ? profiles.find((p) => p.id === selectedProfileId)
        : null;

    const parsedAge = customAge.trim() ? parseInt(customAge.trim(), 10) : undefined;

    const person = {
      profileId: linkedVesselProfile ? linkedVesselProfile.id : undefined,
      codename: linkedVesselProfile
        ? linkedVesselProfile.codename
        : customCodename.trim() || "Contacto Anónimo",
      avatarUrl: linkedVesselProfile
        ? linkedVesselProfile.avatarUrl
        : customAvatarUrl.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      age: linkedVesselProfile
        ? linkedVesselProfile.age
        : parsedAge && !isNaN(parsedAge)
        ? parsedAge
        : undefined,
      role: linkedVesselProfile ? linkedVesselProfile.role : customRole,
      yoSoy: linkedVesselProfile ? linkedVesselProfile.yoSoy : undefined,
      privateNotes: personPrivateNotes.trim() || undefined,
      isExternalProfile: profileMode === "custom",
      sharedPhotos: selectedArchivedPhotos,
    };

    const location = {
      name:
        locationName.trim() ||
        LOCATION_CATEGORIES.find((c) => c.id === locationCategory)?.label ||
        "Ubicación no especificada",
      category: locationCategory,
    };

    const satisfaction = !isUpcoming
      ? {
          expectationsRating,
          chemistryLevel,
          boundariesRespect,
          overallScore: expectationsRating,
          wouldRepeat,
        }
      : undefined;

    const entryData = {
      person,
      date,
      time,
      isUpcoming,
      location,
      encounterType,
      satisfaction,
      privateNotes: privateNotes.trim(),
      tags: selectedTags,
      attachedPhotos: selectedArchivedPhotos,
      healthRoutineReminder: {
        enabled: healthReminderEnabled,
        dueDate: healthDueDate,
        testType: "prep_screening" as const,
        isResolved: false,
      },
    };

    if (editingDiaryEntry) {
      updateDiaryEntry(editingDiaryEntry.id, entryData);
    } else {
      addDiaryEntry(entryData);
    }

    if (person.profileId && selectedArchivedPhotos.length > 0) {
      archivePhotosToDossier(person.profileId, selectedArchivedPhotos);
    }

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 350);
  };

  const getExpectationLabel = (val: number) => {
    switch (val) {
      case 1:
        return t.diary?.modalRatingBad || "Ni ahí / Para el olvido";
      case 2:
        return t.diary?.modalRatingPoor || "Más o menos";
      case 3:
        return t.diary?.modalRatingGood || "Cumplió lo esperado";
      case 4:
        return t.diary?.modalRatingVeryGood || "Muy buena experiencia";
      case 5:
        return t.diary?.modalRatingSuper || "Superó todo 🔥";
      default:
        return "";
    }
  };

  const selectedPersonSummary = useMemo(() => {
    if (profileMode === "vessel_profile") {
      const p = profiles.find((pr) => pr.id === selectedProfileId);
      return p ? { name: p.codename, avatar: p.avatarUrl } : null;
    }
    return {
      name: customCodename.trim() || "Contacto de afuera",
      avatar: customAvatarUrl || null,
    };
  }, [profileMode, selectedProfileId, profiles, customCodename, customAvatarUrl]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cita Agendada"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex justify-center items-end sm:items-center p-0 sm:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-obsidian-surface border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[88vh] sm:max-h-[92vh] overflow-hidden shadow-card-elevation relative animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Cabecera Táctica del Modal */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 bg-obsidian-deep/90 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow shadow-violet-soft">
                {isUpcoming ? <Calendar className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {editingDiaryEntry
                    ? isUpcoming
                      ? t.diary?.modalEditScheduleTitle || "Editar Cita Agendada"
                      : t.diary?.modalEditLogTitle || "Editar Cita Pasada"
                    : isUpcoming
                    ? t.diary?.modalScheduleTitle || "Agendar Salida"
                    : t.diary?.modalLogTitle || "Pasar Cita en Limpio"}
                </h2>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {currentStep === 1
                    ? `${t.diary?.modalStep1Of2 || "Paso 1 de 2"} • ${
                        isUpcoming
                          ? t.diary?.modalStepWho || "¿Con quién?"
                          : t.diary?.modalStepWhoWhere || "¿Quién y Dónde fue?"
                      }`
                    : `${t.diary?.modalStep2Of2 || "Paso 2 de 2"} • ${
                        isUpcoming
                          ? t.diary?.modalStepLogistics || "¿Cuándo y Dónde?"
                          : t.diary?.modalStepChemistry || "La Ficha & Química"
                      }`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Switch de Intención Superior (Agendar vs Pasar en Limpio) */}
          {!editingDiaryEntry && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/5">
              <button
                type="button"
                data-testid="diary-modal-tab-schedule"
                onClick={() => {
                  if (!isUpcoming) {
                    setIsUpcoming(true);
                    audioEngine.playPulse();
                  }
                }}
                aria-pressed={isUpcoming}
                className={`py-2 px-3 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isUpcoming
                    ? "bg-electricViolet text-white shadow-violet-soft font-extrabold border border-electricViolet/50"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{t.diary?.modalModeScheduleTab || "📅 Agendar Salida"}</span>
              </button>

              <button
                type="button"
                data-testid="diary-modal-tab-log"
                onClick={() => {
                  if (isUpcoming) {
                    setIsUpcoming(false);
                    audioEngine.playPulse();
                  }
                }}
                aria-pressed={!isUpcoming}
                className={`py-2 px-3 min-h-[40px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  !isUpcoming
                    ? "bg-electricViolet text-white shadow-violet-soft font-extrabold border border-electricViolet/50"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{t.diary?.modalModeLogTab || "⚡ Pasar en Limpio"}</span>
              </button>
            </div>
          )}

          {/* Barra de progreso de 2 pasos */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              aria-label="Ir al paso 1"
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep >= 1 ? "bg-electricViolet shadow-violet-soft" : "bg-white/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              aria-label="Ir al paso 2"
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentStep === 2 ? "bg-electricViolet shadow-violet-soft" : "bg-white/10"
              }`}
            />
          </div>
        </div>

        {/* ========================================================
            CUERPO DEL MODAL (SCROLLABLE, FLUJO ADAPTATIVO 2 PASOS)
            ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* =======================================================
              RUTA 1: CITA FUTURA (isUpcoming = true)
              ======================================================= */}
          {isUpcoming ? (
            currentStep === 1 ? (
              /* PASO 1 CITA FUTURA: ¿CON QUIÉN SALÍS? */
              <div className="space-y-4 animate-in fade-in">
                {/* Selector Chongo de la App vs Alguien de afuera */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-obsidian-card rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMode("vessel_profile");
                      audioEngine.playPulse();
                    }}
                    aria-pressed={profileMode === "vessel_profile"}
                    className={`py-2 px-3 min-h-[42px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "vessel_profile"
                        ? "bg-electricViolet/20 border-electricViolet text-white font-extrabold shadow-violet-soft"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t.diary?.modalWhoTabVessel || "Chongo de la App"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMode("custom");
                      audioEngine.playPulse();
                    }}
                    aria-pressed={profileMode === "custom"}
                    className={`py-2 px-3 min-h-[42px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "custom"
                        ? "bg-electricViolet/20 border-electricViolet text-white font-extrabold shadow-violet-soft"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t.diary?.modalWhoTabExternal || "Alguien de afuera"}
                  </button>
                </div>

                {/* Contenido: Si es Chongo de VESSEL */}
                {profileMode === "vessel_profile" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          value={searchProfileQuery}
                          onChange={(e) => setSearchProfileQuery(e.target.value)}
                          placeholder={t.diary?.modalSearchPlaceholder || "Buscar por nombre, apodo..."}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian-card border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                        />
                      </div>

                      {/* Toggle Solo Favoritos */}
                      <button
                        type="button"
                        data-testid="diary-modal-toggle-only-favorites"
                        onClick={() => setShowOnlyFavorites((prev) => !prev)}
                        aria-pressed={showOnlyFavorites}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          showOnlyFavorites
                            ? "bg-amber-500/25 border-amber-400 text-amber-300 font-black shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-amber-300"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-amber-400 text-amber-400" : "text-amber-400/70"}`} />
                        <span>{t.diary?.filterFavoritesOnly || "Favoritos"}</span>
                        {favoriteProfileIds.length > 0 && (
                          <span className="text-[10px] px-1 rounded-full bg-white/10 text-neutral-300">
                            {favoriteProfileIds.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Lista táctil de perfiles */}
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                      {filteredProfiles.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500 text-xs font-mono">
                          No encontramos contactos con ese nombre.
                        </div>
                      ) : (
                        filteredProfiles.map((p) => {
                          const isSelected = selectedProfileId === p.id;
                          const isFav = isFavoriteProfile(p.id);
                          return (
                            <div
                              key={p.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedProfileId(p.id);
                                audioEngine.playPulse();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedProfileId(p.id);
                                }
                              }}
                              aria-label={`Seleccionar a ${p.codename}`}
                              className={`p-3 min-h-[52px] rounded-2xl border flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                                isSelected
                                  ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft font-bold"
                                  : isFav
                                  ? "bg-amber-950/20 border-amber-500/30 text-neutral-200 hover:border-amber-400/50"
                                  : "bg-obsidian-card border-white/5 text-neutral-300 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={p.avatarUrl}
                                    alt={p.codename}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                  />
                                  {isFav && (
                                    <Star className="w-3.5 h-3.5 absolute -top-1 -right-1 fill-amber-400 text-amber-400 drop-shadow" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{p.codename}</span>
                                    {p.age && <span className="text-[10px] font-mono text-neutral-400 font-normal">({p.age})</span>}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-mono">
                                    {p.role ? getRoleDisplayLabel(p.role as RoleType, language, t) : "Versátil"}
                                    {p.mobility && ` • ${p.mobility}`}
                                  </div>
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-mintNeon flex-shrink-0 stroke-[2.5]" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  /* Formulario de Contacto Externo */
                  <div className="space-y-3 bg-obsidian-card p-3.5 rounded-2xl border border-white/5">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        {t.diary?.modalExternalNameLabel || "Nombre o apodo del contacto"}
                      </label>
                      <input
                        type="text"
                        value={customCodename}
                        onChange={(e) => setCustomCodename(e.target.value)}
                        placeholder={t.diary?.modalExternalNamePlaceholder || "Ej: Lucas del gym, Facu after..."}
                        className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">
                          {t.diary?.modalExternalRoleLabel || "Rol en la cama"}
                        </label>
                        <select
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value as RoleType)}
                          className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet cursor-pointer"
                        >
                          {ALL_ROLE_TYPES.map((r) => (
                            <option key={r} value={r}>
                              {getRoleDisplayLabel(r, language, t)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-300 block mb-1">
                          {t.diary?.modalExternalAgeLabel || "Edad (opcional)"}
                        </label>
                        <input
                          type="number"
                          min={18}
                          max={99}
                          value={customAge}
                          onChange={(e) => setCustomAge(e.target.value)}
                          placeholder="Ej: 28"
                          className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet font-mono"
                        />
                      </div>
                    </div>

                    {/* Presets rápidos de avatar para contacto de afuera */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5 font-bold">
                        Avatar de referencia:
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {EXTERNAL_AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setCustomAvatarUrl(preset.url);
                              audioEngine.playPulse();
                            }}
                            className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                              customAvatarUrl === preset.url
                                ? "border-electricViolet bg-electricViolet/20"
                                : "border-white/5 bg-black/40 hover:border-white/20"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <span className="text-[9px] font-mono text-neutral-400 truncate max-w-full">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas privadas de la persona (solo para tus ojos) */}
                <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-mintNeon" />
                    <span>{t.diary?.modalCustomNotesLabel || "Notas privadas sobre la persona (solo para vos)"}</span>
                  </label>
                  <textarea
                    value={personPrivateNotes}
                    onChange={(e) => setPersonPrivateNotes(e.target.value)}
                    rows={2}
                    placeholder={t.diary?.modalCustomNotesPlaceholder || "Preferencias, gustos, cosas a tener en cuenta..."}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet resize-none"
                  />
                </div>
              </div>
            ) : (
              /* PASO 2 CITA FUTURA: ¿CUÁNDO Y DÓNDE? */
              <div className="space-y-4 animate-in fade-in">
                {/* Badge Resumen de Quién */}
                {selectedPersonSummary && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-electricViolet/10 border border-electricViolet/30">
                    <div className="flex items-center gap-2.5">
                      {selectedPersonSummary.avatar ? (
                        <img
                          src={selectedPersonSummary.avatar}
                          alt={selectedPersonSummary.name}
                          className="w-8 h-8 rounded-xl object-cover border border-electricViolet/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-electricViolet/20 flex items-center justify-center text-electricViolet-glow">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 block uppercase">Cita con</span>
                        <span className="text-xs font-bold text-white">{selectedPersonSummary.name}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] text-electricViolet-glow font-mono font-bold hover:underline cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                )}

                {/* Selector Cuándo: Fecha y Hora */}
                <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-electricViolet-glow" />
                      <span>{t.diary?.modalWhenLabel || "¿Cuándo es la salida?"}</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-electricViolet-glow">
                      {date === todayStr ? "Hoy" : date} • {time}hs
                    </span>
                  </div>

                  {/* Chips rápidos de fecha */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className={`py-2 px-2.5 min-h-[38px] rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        date === todayStr
                          ? "bg-electricViolet text-white border-electricViolet font-black shadow-violet-soft"
                          : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t.diary?.modalDateToday || "Hoy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getLocalDaysOffsetIso(1))}
                      className={`py-2 px-2.5 min-h-[38px] rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        date === getLocalDaysOffsetIso(1)
                          ? "bg-electricViolet text-white border-electricViolet font-black shadow-violet-soft"
                          : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t.diary?.modalDateTomorrow || "Mañana"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getLocalDaysOffsetIso(2))}
                      className={`py-2 px-2.5 min-h-[38px] rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        date === getLocalDaysOffsetIso(2)
                          ? "bg-electricViolet text-white border-electricViolet font-black shadow-violet-soft"
                          : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {t.diary?.modalDateIn2Days || "En 2 días"}
                    </button>
                  </div>

                  {/* Inputs manuales compactos */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                    />
                  </div>

                  {/* Chips de hora rápida */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { label: "+30m", val: getNextRoundedHalfHourTime(30) },
                      { label: "+1h", val: getNextRoundedHalfHourTime(60) },
                      { label: "22:00", val: "22:00" },
                      { label: "01:00", val: "01:00" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setTime(item.val);
                          audioEngine.playPulse();
                        }}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                          time === item.val
                            ? "bg-electricViolet/30 text-white border-electricViolet"
                            : "bg-white/5 text-neutral-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector Dónde: Lugar */}
                <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-3">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-electricViolet-glow" />
                    <span>{t.diary?.modalWhereLabel || "¿Dónde se ven?"}</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LOCATION_CATEGORIES.map((loc) => {
                      const isSelected = locationCategory === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setLocationCategory(loc.id);
                            if (!locationName || locationName === LOCATION_CATEGORIES.find((c) => c.id === locationCategory)?.label) {
                              setLocationName(loc.label);
                            }
                            audioEngine.playPulse();
                          }}
                          className={`p-2 min-h-[44px] rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                              : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span className="text-base">{loc.icon}</span>
                          <span className="truncate">{loc.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t.diary?.modalWhereLocationNamePlaceholder || "Nombre del lugar, dirección o referencia..."}
                    className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                  />
                </div>

                {/* Tipo de Salida & Notas de Preparación */}
                <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-3">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-electricViolet-glow" />
                    <span>{t.diary?.modalEncounterTypeLabel || "Tipo de salida"}</span>
                  </label>

                  <div className="grid grid-cols-2 gap-1.5">
                    {ENCOUNTER_TYPES.slice(0, 4).map((type) => {
                      const isSelected = encounterType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setEncounterType(type.id);
                            audioEngine.playPulse();
                          }}
                          className={`p-2 min-h-[42px] rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-electricViolet/20 text-white border-electricViolet shadow-violet-soft font-extrabold"
                              : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>{type.icon}</span>
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      {t.diary?.modalUpcomingNotesLabel || "Notas de preparación (timbre, cosas a llevar, acuerdos):"}
                    </label>
                    <textarea
                      rows={2}
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      placeholder={t.diary?.modalUpcomingNotesPlaceholder || "Timbre, cosas que llevar (forros, toalla), indicaciones..."}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet resize-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            /* =======================================================
               RUTA 2: ENCUENTRO PASADO (isUpcoming = false)
               ======================================================= */
            currentStep === 1 ? (
              /* PASO 1 ENCUENTRO PASADO: ¿QUIÉN Y DÓNDE FUE? */
              <div className="space-y-4 animate-in fade-in">
                {/* Selector Chongo de la App vs Alguien de afuera */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-obsidian-card rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMode("vessel_profile");
                      audioEngine.playPulse();
                    }}
                    aria-pressed={profileMode === "vessel_profile"}
                    className={`py-2 px-3 min-h-[42px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "vessel_profile"
                        ? "bg-electricViolet/20 border-electricViolet text-white font-extrabold shadow-violet-soft"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t.diary?.modalWhoTabVessel || "Chongo de la App"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMode("custom");
                      audioEngine.playPulse();
                    }}
                    aria-pressed={profileMode === "custom"}
                    className={`py-2 px-3 min-h-[42px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "custom"
                        ? "bg-electricViolet/20 border-electricViolet text-white font-extrabold shadow-violet-soft"
                        : "border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t.diary?.modalWhoTabExternal || "Alguien de afuera"}
                  </button>
                </div>

                {/* Si es Perfil VESSEL */}
                {profileMode === "vessel_profile" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          value={searchProfileQuery}
                          onChange={(e) => setSearchProfileQuery(e.target.value)}
                          placeholder={t.diary?.modalSearchPlaceholder || "Buscar por nombre, apodo..."}
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian-card border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                        />
                      </div>

                      <button
                        type="button"
                        data-testid="diary-modal-toggle-only-favorites"
                        onClick={() => setShowOnlyFavorites((prev) => !prev)}
                        aria-pressed={showOnlyFavorites}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          showOnlyFavorites
                            ? "bg-amber-500/25 border-amber-400 text-amber-300 font-black shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-amber-300"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-amber-400 text-amber-400" : "text-amber-400/70"}`} />
                        <span>{t.diary?.filterFavoritesOnly || "Favoritos"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                      {filteredProfiles.map((p) => {
                        const isSelected = selectedProfileId === p.id;
                        return (
                          <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedProfileId(p.id);
                              audioEngine.playPulse();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedProfileId(p.id);
                              }
                            }}
                            aria-label={`Seleccionar a ${p.codename}`}
                            className={`p-2.5 min-h-[48px] rounded-2xl border flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                              isSelected
                                ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft font-bold"
                                : "bg-obsidian-card border-white/5 text-neutral-300 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={p.avatarUrl} alt={p.codename} className="w-9 h-9 rounded-xl object-cover" />
                              <div className="text-xs font-bold text-white">{p.codename}</div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-mintNeon stroke-[2.5]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Formulario Externo */
                  <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      {t.diary?.modalExternalNameLabel || "Nombre o apodo del contacto"}
                    </label>
                    <input
                      type="text"
                      value={customCodename}
                      onChange={(e) => setCustomCodename(e.target.value)}
                      placeholder={t.diary?.modalExternalNamePlaceholder || "Ej: Lucas del gym, Facu after..."}
                      className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet"
                    />
                  </div>
                )}

                {/* Fecha y Lugar del Encuentro Pasado */}
                <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-electricViolet-glow" />
                      <span>¿Cuándo fue el encuentro?</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-obsidian border border-white/10 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LOCATION_CATEGORIES.slice(0, 6).map((loc) => {
                      const isSelected = locationCategory === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setLocationCategory(loc.id);
                            setLocationName(loc.label);
                            audioEngine.playPulse();
                          }}
                          className={`p-2 min-h-[40px] rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                              : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span>{loc.icon}</span>
                          <span className="truncate">{loc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* PASO 2 ENCUENTRO PASADO: LA FICHA ÍNTIMA & QUÍMICA */
              <div className="space-y-4 animate-in fade-in">
                {/* 1. ¿CÓMO ESTUVO LA CITA? (ESTRELLAS GRANDES) */}
                <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>{t.diary?.modalRatingLabel || "¿Cómo estuvo la cita?"}</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-white">{expectationsRating} / 5</span>
                  </div>

                  <div className="flex justify-between gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setExpectationsRating(val);
                          audioEngine.playPulse();
                        }}
                        aria-label={`Calificar con ${val} estrellas`}
                        className={`flex-1 py-3 min-h-[46px] rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
                          expectationsRating >= val
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-sm"
                            : "bg-obsidian border-white/10 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${expectationsRating >= val ? "fill-amber-400 text-amber-400" : ""}`} />
                        <span className="text-[10px] mt-0.5 font-mono font-bold">{val}</span>
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] font-medium text-center text-neutral-300 pt-0.5">
                    {getExpectationLabel(expectationsRating)}
                  </div>
                </div>

                {/* 2. QUÍMICA Y RESPETO EN GRILLA */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Nivel de Química */}
                  <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Química</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-amber-400">{chemistryLevel} / 5</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setChemistryLevel(v);
                            audioEngine.playPulse();
                          }}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                            chemistryLevel >= v
                              ? "bg-amber-500/20 border-amber-400 text-amber-300"
                              : "bg-obsidian border-white/5 text-neutral-500"
                          }`}
                        >
                          🔥
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Respeto a Códigos */}
                  <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-mintNeon" />
                        <span>Códigos</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-mintNeon">{boundariesRespect} / 5</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setBoundariesRespect(v);
                            audioEngine.playPulse();
                          }}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                            boundariesRespect >= v
                              ? "bg-mintNeon/20 border-mintNeon text-mintNeon"
                              : "bg-obsidian border-white/5 text-neutral-500"
                          }`}
                        >
                          🛡️
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. ¿DA PARA REVANCHA? */}
                <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-electricViolet-glow" />
                    <span>{t.diary?.modalRepeatLabel || "¿Da para revancha?"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "yes", label: t.diary?.modalRepeatYes || "🔥 Sí, de una", activeClass: "bg-electricViolet text-white border-electricViolet font-extrabold shadow-violet-soft" },
                      { id: "maybe", label: t.diary?.modalRepeatMaybe || "🤔 Veremos", activeClass: "bg-white/20 text-white border-white/30 font-bold" },
                      { id: "only_darkroom", label: t.diary?.modalRepeatDarkroom || "⚡ Solo en fiesta", activeClass: "bg-amber-500/30 text-amber-300 border-amber-400 font-bold" },
                      { id: "never", label: t.diary?.modalRepeatNever || "⛔ Paso / Ni ahí", activeClass: "bg-neutral-800 text-neutral-300 border-neutral-700 font-bold" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setWouldRepeat(item.id as DiaryWouldRepeat);
                          audioEngine.playPulse();
                        }}
                        aria-pressed={wouldRepeat === item.id}
                        className={`p-2.5 min-h-[44px] rounded-xl border text-xs transition-all text-left truncate cursor-pointer ${
                          wouldRepeat === item.id
                            ? item.activeClass
                            : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. BLOQUE DESPLEGABLE OPCIONAL: BÓVEDA PRIVADA & CUIDADOS */}
                <div className="bg-obsidian-card rounded-2xl border border-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsVaultAccordionOpen((prev) => !prev)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-mintNeon" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {t.diary?.modalCollapsibleVault || "Bóveda Privada, Recuerdos & Cuidados"}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {t.diary?.modalCollapsibleVaultSub || "Notas íntimas cifradas, fotos del chat y recordatorio PrEP"}
                        </div>
                      </div>
                    </div>
                    {isVaultAccordionOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {isVaultAccordionOpen && (
                    <div className="p-3.5 pt-0 space-y-3.5 border-t border-white/5">
                      {/* Notas Íntimas Cifradas */}
                      <div className="pt-2">
                        <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                          Notas íntimas confidenciales (solo para tus ojos):
                        </label>
                        <textarea
                          rows={3}
                          value={privateNotes}
                          onChange={(e) => setPrivateNotes(e.target.value)}
                          placeholder={t.diary?.modalPrivateNotesPlaceholder || "Escribí libremente lo que quieras recordar de este encuentro..."}
                          className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet resize-none"
                        />
                      </div>

                      {/* Etiquetas de Contexto */}
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                          <Tag className="w-3.5 h-3.5 text-electricViolet-glow" />
                          <span>{t.diary?.modalTagsLabel || "Etiquetas & Morbos"}</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`px-2.5 py-1 min-h-[32px] rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow font-bold"
                                    : "bg-obsidian border-white/10 text-neutral-400 hover:text-neutral-200"
                                }`}
                              >
                                #{tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fotos del Chat si hay */}
                      {chatPhotos.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-electricViolet-glow" />
                              <span>{t.diary?.modalChatPhotosLabel || "Fotos del Chat (Tocar para archivar)"}</span>
                            </label>
                            <span className="text-[10px] font-mono text-electricViolet-glow">
                              {selectedArchivedPhotos.length} guardadas
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {chatPhotos.map((url, idx) => {
                              const isChecked = selectedArchivedPhotos.includes(url);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    audioEngine.playPulse();
                                    setSelectedArchivedPhotos((prev) =>
                                      isChecked ? prev.filter((u) => u !== url) : [...prev, url]
                                    );
                                  }}
                                  className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                    isChecked
                                      ? "border-electricViolet ring-2 ring-electricViolet/50 scale-[1.02]"
                                      : "border-white/10 opacity-60 hover:opacity-100"
                                  }`}
                                >
                                  <img src={url} alt={`Foto chat ${idx}`} className="w-full h-full object-cover" />
                                  {isChecked && (
                                    <div className="absolute top-1 right-1 p-0.5 rounded-full bg-electricViolet text-white shadow-sm">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Alarma Preventiva PrEP */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-mintNeon" />
                          <div>
                            <div className="text-xs font-bold text-white">
                              {t.diary?.modalHealthReminderTitle || "Alarma Preventiva de Salud (PrEP)"}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {t.diary?.modalHealthReminderSub || "Recordatorio a los 90 días para control de rutina"}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={healthReminderEnabled}
                          onChange={(e) => setHealthReminderEnabled(e.target.checked)}
                          className="w-4 h-4 accent-mintNeon cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* ========================================================
            BARRA DE NAVEGACIÓN INFERIOR (Paso 1 -> Paso 2 -> Guardar)
            ======================================================== */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-obsidian-deep/95 backdrop-blur-md flex items-center justify-between gap-3">
          {currentStep === 2 ? (
            <button
              type="button"
              data-testid="diary-modal-back-btn"
              onClick={() => {
                setCurrentStep(1);
                audioEngine.playPulse();
              }}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.diary?.modalBtnBack || "Volver"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              {t.diary?.modalBtnCancel || "Cancelar"}
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              data-testid="diary-modal-next-btn"
              onClick={() => {
                setCurrentStep(2);
                audioEngine.playPulse();
              }}
              className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-mono font-bold flex items-center gap-1.5 shadow-violet-soft transition-all ml-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <span>{t.diary?.modalBtnNext || "Continuar"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              data-testid="diary-modal-submit-btn"
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-2.5 min-h-[44px] rounded-2xl bg-gradient-to-r from-electricViolet to-purple-600 text-white hover:opacity-95 text-xs font-mono font-bold flex items-center gap-2 shadow-violet-soft transition-all ml-auto disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSaving
                  ? t.diary?.modalBtnSaving || "Guardando..."
                  : editingDiaryEntry
                  ? t.diary?.modalBtnSaveChanges || "Guardar Cambios"
                  : isUpcoming
                  ? t.diary?.modalBtnScheduleNow || "📅 Agendar Salida"
                  : t.diary?.modalBtnSaveLog || "✓ Guardar en la Libreta"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
