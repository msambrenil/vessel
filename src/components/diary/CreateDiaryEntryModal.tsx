"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  DiaryLocationCategory,
  DiaryEncounterType,
  DiaryWouldRepeat,
  RoleType,
  YoSoyType,
} from "@/types/vessel";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  Flame,
  Shield,
  ShieldCheck,
  RotateCcw,
  Tag,
  Lock,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Plus,
  AlertCircle,
  Bell,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface CreateDiaryEntryModalProps {
  onClose: () => void;
}

const LOCATION_CATEGORIES: { id: DiaryLocationCategory; label: string; icon: string }[] = [
  { id: "my_place", label: "Mi Sitio / Mi Bóveda", icon: "🏠" },
  { id: "their_place", label: "Su Sitio / Su Lugar", icon: "🔑" },
  { id: "club_darkroom", label: "Club / Darkroom", icon: "⚡" },
  { id: "bar_lounge", label: "Bar / Tragos / Café", icon: "🍸" },
  { id: "hotel", label: "Hotel / Alojamiento", icon: "🏨" },
  { id: "outdoor_cruising", label: "Cruising / Aire Libre", icon: "🌲" },
  { id: "other", label: "Otro Espacio", icon: "📍" },
];

const ENCOUNTER_TYPES: { id: DiaryEncounterType; label: string; desc: string }[] = [
  { id: "intense_carnal", label: "Carnal // Alta Intensidad", desc: "Encuentro físico directo y pasional" },
  { id: "darkroom_session", label: "Sesión Darkroom", desc: "Atmósfera oscura y dinámica libre" },
  { id: "kink_leather", label: "Kink // Leather // Fetish", desc: "Juego de rol, arnés o fetiches acordados" },
  { id: "first_date", label: "Primera Cita", desc: "Conocimiento previo y primera química" },
  { id: "regular_playmate", label: "Playmate Recurrente", desc: "Encuentro con conocido o amigo" },
  { id: "casual", label: "Casual / Espontáneo", desc: "Momento improvisado" },
  { id: "chill_talk", label: "Relax // Buena Charla", desc: "Conexión pausada y tranquila" },
];

const QUICK_TAGS = [
  "Química Brutal",
  "Puntual",
  "Respeto a Límites",
  "Protección Acordada",
  "Lugar Impecable",
  "Música Top",
  "Muy Directo",
  "Conversación Genial",
  "Intensidad 4",
  "Repetir Pronto",
  "Darkroom Vibe",
];

const EXTERNAL_AVATAR_PRESETS = [
  {
    id: "preset-techno",
    label: "Cyber Mask",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-minimal",
    label: "Shadow Profile",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-urban",
    label: "Urban Vibe",
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-classic",
    label: "Tactical B&W",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
];

/**
 * Optimiza y comprime la foto del contacto en el navegador mediante HTMLCanvasElement.
 * Reduce fotos de smartphones de 10-20MB a ~30-50KB en WebP/JPEG manteniendo nitidez
 * para garantizar almacenamiento offline seguro y evitar agotar la cuota de almacenamiento.
 */
const compressAvatarImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Solo se admiten archivos de imagen"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 640;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webp = canvas.toDataURL("image/webp", 0.82);
          if (webp.startsWith("data:image/webp")) {
            resolve(webp);
            return;
          }
        } catch {
          // fallback
        }
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const CreateDiaryEntryModal: React.FC<CreateDiaryEntryModalProps> = ({ onClose }) => {
  const {
    profiles,
    diaryModalPreselectedProfileId,
    editingDiaryEntry,
    addDiaryEntry,
    updateDiaryEntry,
  } = useVessel();

  // Paso actual (1: Perfil, 2: Calendario & Lugar, 3: Satisfacción & Métricas, 4: Notas & Salud)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Modo de perfil: 'vessel_profile' o 'custom'
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
    editingDiaryEntry?.person.isExternalProfile ? (editingDiaryEntry.person.avatarUrl || "") : ""
  );
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [personPrivateNotes, setPersonPrivateNotes] = useState<string>(
    editingDiaryEntry?.person.privateNotes || ""
  );

  // Fecha, Hora y Tipo
  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(editingDiaryEntry?.date || todayStr);
  const [time, setTime] = useState<string>(
    editingDiaryEntry?.time ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
  );
  const [isUpcoming, setIsUpcoming] = useState<boolean>(editingDiaryEntry?.isUpcoming || false);
  const [locationCategory, setLocationCategory] = useState<DiaryLocationCategory>(
    editingDiaryEntry?.location.category || "their_place"
  );
  const [locationName, setLocationName] = useState<string>(
    editingDiaryEntry?.location.name || ""
  );
  const [encounterType, setEncounterType] = useState<DiaryEncounterType>(
    editingDiaryEntry?.encounterType || "intense_carnal"
  );

  // Satisfacción y Métricas
  const [expectationsRating, setExpectationsRating] = useState<number>(
    editingDiaryEntry?.satisfaction?.expectationsRating || 5
  );
  const [chemistryLevel, setChemistryLevel] = useState<number>(
    editingDiaryEntry?.satisfaction?.chemistryLevel || 5
  );
  const [boundariesRespect, setBoundariesRespect] = useState<number>(
    editingDiaryEntry?.satisfaction?.boundariesRespect || 5
  );
  const [overallScore, setOverallScore] = useState<number>(
    editingDiaryEntry?.satisfaction?.overallScore || 5
  );
  const [wouldRepeat, setWouldRepeat] = useState<DiaryWouldRepeat>(
    editingDiaryEntry?.satisfaction?.wouldRepeat || "yes"
  );

  // Notas, Tags y Salud
  const [privateNotes, setPrivateNotes] = useState<string>(
    editingDiaryEntry?.privateNotes || ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    editingDiaryEntry?.tags || ["Química Brutal", "Puntual"]
  );
  const [customTagInput, setCustomTagInput] = useState<string>("");

  // Recordatorio de Salud (por defecto 90 días después para control)
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 90);
  const defaultDueDateStr = defaultDueDate.toISOString().split("T")[0];

  const [healthReminderEnabled, setHealthReminderEnabled] = useState<boolean>(
    editingDiaryEntry?.healthRoutineReminder?.enabled ?? true
  );
  const [healthDueDate, setHealthDueDate] = useState<string>(
    editingDiaryEntry?.healthRoutineReminder?.dueDate || defaultDueDateStr
  );

  const [isSaving, setIsSaving] = useState(false);

  // Si hay perfil preseleccionado o entrada en edición al abrir
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

  // Manejador de subida de imagen para contacto externo
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setPhotoError("Por favor seleccioná un archivo de imagen válido (JPG, PNG o WEBP).");
      audioEngine.playError();
      return;
    }

    try {
      setIsProcessingPhoto(true);
      setPhotoError(null);
      const compressedDataUrl = await compressAvatarImage(file);
      setCustomAvatarUrl(compressedDataUrl);
      audioEngine.playPulse();
    } catch (err) {
      console.error("Error al optimizar foto de contacto:", err);
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
      age: linkedVesselProfile ? linkedVesselProfile.age : (parsedAge && !isNaN(parsedAge) ? parsedAge : undefined),
      role: linkedVesselProfile ? linkedVesselProfile.role : customRole,
      yoSoy: linkedVesselProfile ? linkedVesselProfile.yoSoy : undefined,
      privateNotes: personPrivateNotes.trim() || undefined,
      isExternalProfile: profileMode === "custom",
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
          overallScore,
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

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 400);
  };

  const getExpectationLabel = (val: number) => {
    switch (val) {
      case 1:
        return "Muy por debajo";
      case 2:
        return "Por debajo de lo esperado";
      case 3:
        return "Cumplió lo esperado";
      case 4:
        return "Muy buena experiencia";
      case 5:
        return "Superó todas las expectativas 🔥";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex justify-center items-center p-2 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-obsidian-surface border border-white/10 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-card-elevation relative">
        {/* Cabecera del Modal */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                {editingDiaryEntry ? "Editar Entrada de Diario" : "Documentar Encuentro // Diario"}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Paso {currentStep} de 4 •{" "}
                {currentStep === 1
                  ? "Persona & Perfil"
                  : currentStep === 2
                  ? "Fecha, Hora & Lugar"
                  : currentStep === 3
                  ? "Satisfacción & Métricas"
                  : "Notas Privadas & Salud"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de diario"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Pasos (Progreso) */}
        <div className="grid grid-cols-4 gap-1.5 p-3 bg-black/40 border-b border-white/5">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              aria-label={`Ir al paso ${step}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                currentStep >= step ? "bg-electricViolet shadow-violet-soft" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Contenido Modular con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ==========================================
              PASO 1: PERFIL DE LA PERSONA (PEOPLE PROFILES)
              ========================================== */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5">
                <label className="text-xs font-bold text-electricViolet-glow uppercase tracking-wider block mb-2 font-mono">
                  Tipo de Vinculación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileMode("vessel_profile")}
                    aria-pressed={profileMode === "vessel_profile"}
                    className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "vessel_profile"
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Vessel Profile (Matriz)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileMode("custom")}
                    aria-pressed={profileMode === "custom"}
                    className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      profileMode === "custom"
                        ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Contacto Externo
                  </button>
                </div>
              </div>

              {profileMode === "vessel_profile" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-electricViolet-glow" />
                    Selecciona el perfil encontrado
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {profiles.map((p) => {
                      const isSelected = selectedProfileId === p.id;
                      return (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedProfileId(p.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedProfileId(p.id);
                            }
                          }}
                          aria-label={`Seleccionar a ${p.codename}`}
                          className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                            isSelected
                              ? "bg-electricViolet/15 border-electricViolet text-white shadow-violet-soft font-bold"
                              : "bg-obsidian-card border-white/5 text-neutral-300 hover:border-white/20"
                          }`}
                        >
                          <img
                            src={p.avatarUrl}
                            alt={p.codename}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white truncate">
                                {p.codename}
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                {p.age} años
                              </span>
                            </div>
                            <p className="text-[11px] text-electricViolet-glow truncate">
                              {p.role} • {p.yoSoy}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {p.hosting}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-mintNeon flex-shrink-0 stroke-[2.5]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-obsidian-card p-4 rounded-2xl border border-white/5">
                  {/* Zona de Carga / Visualización de Foto */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-electricViolet-glow" />
                        Foto o Fisonomía del Contacto
                        <span className="text-[10px] text-neutral-500 font-normal">
                          (Opcional)
                        </span>
                      </label>
                      {customAvatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-[11px] font-mono text-bloodNeon hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Quitar foto
                        </button>
                      )}
                    </div>

                    {/* Input de archivo oculto para disparar cámara / galería */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handlePhotoUpload(e.target.files[0]);
                        }
                      }}
                    />

                    {customAvatarUrl ? (
                      <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 border border-electricViolet/30">
                        <div className="relative group shrink-0">
                          <img
                            src={customAvatarUrl}
                            alt={customCodename || "Contacto Externo"}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-electricViolet shadow-violet-soft"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Cambiar foto del contacto"
                            className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-mono gap-1 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            Cambiar
                          </button>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-mintNeon font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Foto cargada con éxito
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-tight">
                            Comprimida y guardada localmente en tu dispositivo. 100% privada.
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                            >
                              <Camera className="w-3 h-3 text-electricViolet-glow" />
                              Reemplazar
                            </button>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-2.5 py-1.5 rounded-xl bg-bloodNeon/10 hover:bg-bloodNeon/20 border border-bloodNeon/20 text-bloodNeon text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`relative p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                          isDraggingOver
                            ? "border-electricViolet bg-electricViolet/15 scale-[0.99]"
                            : "border-white/15 hover:border-electricViolet/60 bg-black/30 hover:bg-white/5"
                        }`}
                      >
                        {isProcessingPhoto ? (
                          <div className="flex flex-col items-center gap-2 py-3">
                            <Loader2 className="w-7 h-7 animate-spin text-electricViolet-glow" />
                            <span className="text-xs font-mono text-neutral-300">
                              Optimizando y comprimiendo foto...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-electricViolet/15 border border-electricViolet/30 text-electricViolet-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white tracking-wide">
                                Subir Foto o Fisonomía del Contacto
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                Tocá aquí para abrir cámara/galería o arrastrá un archivo
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                              <ShieldCheck className="w-3.5 h-3.5 text-mintNeon" />
                              100% Cifrado local // Jamás compartido con la red
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Presets de avatar tácticos opcionales */}
                    {!customAvatarUrl && !isProcessingPhoto && (
                      <div className="pt-1">
                        <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1.5 font-bold">
                          O seleccioná un avatar táctico de referencia:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {EXTERNAL_AVATAR_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomAvatarUrl(preset.url);
                                audioEngine.playPulse();
                              }}
                              className="group p-1.5 rounded-xl bg-black/40 border border-white/5 hover:border-electricViolet/60 transition-all flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-11 h-11 rounded-xl object-cover border border-white/10 group-hover:border-electricViolet transition-colors"
                              />
                              <span className="text-[9px] font-mono text-neutral-400 group-hover:text-white truncate max-w-full">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {photoError && (
                      <div className="p-2.5 rounded-xl bg-bloodNeon/15 border border-bloodNeon/30 text-bloodNeon text-xs flex items-center gap-2 font-mono">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{photoError}</span>
                      </div>
                    )}
                  </div>

                  {/* Campos de Nombre / Identificación */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Nombre / Codename del Contacto
                    </label>
                    <input
                      type="text"
                      value={customCodename}
                      onChange={(e) => setCustomCodename(e.target.value)}
                      placeholder="Ej: MARCO_TECHNO, ALEX_GYM..."
                      className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                    />
                  </div>

                  {/* Edad y Rol Preferido en Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Edad (Años)
                        <span className="text-[10px] text-neutral-500 font-normal ml-1">
                          (Opcional)
                        </span>
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={99}
                        value={customAge}
                        onChange={(e) => setCustomAge(e.target.value)}
                        placeholder="Ej: 29"
                        className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Rol Preferido
                      </label>
                      <select
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value as RoleType)}
                        className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 cursor-pointer"
                      >
                        <option value="Top">Top</option>
                        <option value="Bottom">Bottom</option>
                        <option value="Versatile">Versatile</option>
                        <option value="Vers Top">Vers Top</option>
                        <option value="Vers Bottom">Vers Bottom</option>
                        <option value="Dominant">Dominant</option>
                        <option value="Submissive">Submissive</option>
                        <option value="Side">Side</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas privadas locales sobre la persona */}
              <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-mintNeon" />
                  Notas Privadas del Perfil (Solo visibles para ti)
                </label>
                <textarea
                  value={personPrivateNotes}
                  onChange={(e) => setPersonPrivateNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalles fisionómicos, preferencias específicas, límites comentados en persona..."
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* ==========================================
              PASO 2: SMART CALENDAR (FECHA, HORA, LUGAR & DINÁMICA)
              ========================================== */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Toggle Pasado vs Futuro */}
              <div className="grid grid-cols-2 gap-2 bg-obsidian-card p-2 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setIsUpcoming(false)}
                  aria-pressed={!isUpcoming}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    !isUpcoming
                      ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                      : "bg-transparent border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Encuentro Concretado
                </button>
                <button
                  type="button"
                  onClick={() => setIsUpcoming(true)}
                  aria-pressed={isUpcoming}
                  className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-bold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
                    isUpcoming
                      ? "bg-bloodNeon text-white border-bloodNeon shadow-blood-glow font-extrabold"
                      : "bg-transparent border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Cita Futura (Agendada)
                </button>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                  />
                </div>

                <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
                    Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-2.5 py-2 min-h-[40px] rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                  />
                </div>
              </div>

              {/* Categoría del Lugar */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-electricViolet-glow" />
                  Categoría de Ubicación
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LOCATION_CATEGORIES.map((loc) => {
                    const isSelected = locationCategory === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setLocationCategory(loc.id)}
                        aria-pressed={isSelected}
                        className={`p-2.5 min-h-[44px] rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                          isSelected
                            ? "bg-electricViolet/15 border-electricViolet text-white font-bold shadow-violet-soft"
                            : "bg-obsidian-card border-white/5 text-neutral-400 hover:text-white hover:border-white/15"
                        }`}
                      >
                        <span className="text-sm">{loc.icon}</span>
                        <span className="text-[11px] truncate">{loc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre / Detalle del Venue */}
              <div className="bg-obsidian-card p-3 rounded-2xl border border-white/5">
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Nombre del Lugar / Venue (Opcional)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ej: Depto Kreuzberg, Laberinto KitKat, Suite Hotel..."
                  className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                />
              </div>

              {/* Tipo de Dinámica / Encuentro */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-electricViolet-glow" />
                  Tipo de Encuentro
                </label>
                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {ENCOUNTER_TYPES.map((type) => {
                    const isSelected = encounterType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEncounterType(type.id)}
                        aria-pressed={isSelected}
                        className={`p-2.5 min-h-[44px] rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                          isSelected
                            ? "bg-electricViolet/15 border-electricViolet text-white font-bold shadow-violet-soft"
                            : "bg-obsidian-card border-white/5 text-neutral-400 hover:text-white hover:border-white/15"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{type.label}</div>
                          <div className="text-[10px] text-neutral-400">{type.desc}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-mintNeon flex-shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              PASO 3: SATISFACCIÓN DE EXPECTATIVAS & MÉTRICAS
              ========================================== */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {isUpcoming ? (
                <div className="p-4 bg-obsidian-card border border-white/10 rounded-2xl text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-electricViolet-glow mx-auto" />
                  <h3 className="text-sm font-bold text-white">Cita Programada a Futuro</h3>
                  <p className="text-xs text-neutral-400">
                    Las métricas de satisfacción y química se completarán una vez que el encuentro
                    haya concluido. Puedes pasar directo al paso de notas.
                  </p>
                </div>
              ) : (
                <>
                  {/* Nivel de Satisfacción de Expectativas */}
                  <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Nivel de Satisfacción vs Expectativas
                      </label>
                      <span className="text-xs font-mono font-bold text-white">
                        {expectationsRating} / 5
                      </span>
                    </div>

                    <div className="flex justify-between gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setExpectationsRating(val)}
                          aria-label={`Calificar con ${val} estrellas`}
                          className={`flex-1 py-3 min-h-[44px] rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                            expectationsRating >= val
                              ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-sm"
                              : "bg-obsidian border-white/10 text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              expectationsRating >= val ? "fill-amber-400 text-amber-400" : ""
                            }`}
                          />
                          <span className="text-[10px] mt-1 font-bold">{val}</span>
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-medium text-center text-neutral-300 pt-1">
                      {getExpectationLabel(expectationsRating)}
                    </div>
                  </div>

                  {/* Slider de Química Corporal */}
                  <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-bloodNeon" />
                        Química Corporal & Tensión Física
                      </label>
                      <span className="text-xs font-mono font-bold text-bloodNeon">
                        {chemistryLevel} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={chemistryLevel}
                      onChange={(e) => setChemistryLevel(parseInt(e.target.value))}
                      className="w-full accent-bloodNeon cursor-pointer"
                    />
                  </div>

                  {/* Respeto a Límites y Seguridad */}
                  <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Respeto a Límites & Seguridad Acordada
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {boundariesRespect} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={boundariesRespect}
                      onChange={(e) => setBoundariesRespect(parseInt(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Decisión de Repetición */}
                  <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-electricViolet-glow" />
                      ¿Repetirías este encuentro?
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { id: "yes", label: "🔥 Sí, definitivamente", activeClass: "bg-electricViolet text-white border-electricViolet font-bold shadow-violet-soft" },
                        { id: "maybe", label: "🤔 Tal vez / Depende", activeClass: "bg-white/20 text-white border-white/30 font-bold" },
                        { id: "only_darkroom", label: "⚡ Solo en Darkroom", activeClass: "bg-bloodNeon/30 text-bloodNeon border-bloodNeon font-bold" },
                        { id: "never", label: "⛔ No repetiría", activeClass: "bg-neutral-800 text-neutral-300 border-neutral-700 font-bold" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setWouldRepeat(item.id as DiaryWouldRepeat)}
                          aria-pressed={wouldRepeat === item.id}
                          className={`p-2.5 min-h-[44px] rounded-xl border text-xs transition-all text-left truncate cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                            wouldRepeat === item.id
                              ? `${item.activeClass} shadow-md`
                              : "bg-obsidian border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==========================================
              PASO 4: NOTAS PRIVADAS, TAGS & SMART HEALTH
              ========================================== */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Bitácora de Impresiones Privadas */}
              <div className="bg-obsidian-card p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-mintNeon" />
                    Bitácora Personal & Impresiones Privadas
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">100% Cifrado Local</span>
                </div>
                <textarea
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  rows={4}
                  placeholder="Escribe libremente tus impresiones íntimas, anécdotas del encuentro, cosas que te encantaron, límites descubiertos o detalles para recordar..."
                  className="w-full px-3 py-2.5 rounded-xl bg-obsidian border border-white/10 text-neutral-200 text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 leading-relaxed resize-none"
                />
              </div>

              {/* Tags de Contexto */}
              <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-2.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-electricViolet-glow" />
                  Etiquetas de la Cita
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                          isSelected
                            ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow font-bold shadow-violet-soft"
                            : "bg-obsidian border-white/10 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleAddCustomTag} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Añadir etiqueta propia..."
                    className="flex-1 px-3 py-2 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 min-h-[38px] bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                  >
                    + Tag
                  </button>
                </form>
              </div>

              {/* Recordatorio de Rutina de Salud Preventiva */}
              <div className="bg-obsidian-card p-3.5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-mintNeon" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Recordatorio Smart // Chequeo de Salud
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Alerta a los 90 días para screening preventivo / rutina PrEP
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={healthReminderEnabled}
                    onChange={(e) => setHealthReminderEnabled(e.target.checked)}
                    aria-label="Activar recordatorio de chequeo de salud preventivo"
                    className="w-5 h-5 accent-mintNeon cursor-pointer"
                  />
                </div>

                {healthReminderEnabled && (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">Fecha de control sugerida:</span>
                    <input
                      type="date"
                      value={healthDueDate}
                      onChange={(e) => setHealthDueDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-obsidian border border-white/10 text-white text-xs focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Barra de Navegación Inferior del Modal */}
        <div className="p-4 border-t border-white/10 bg-obsidian-deep/90 backdrop-blur-md flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => {
                setCurrentStep(currentStep - 1);
                audioEngine.playPulse();
              }}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              Cancelar
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                setCurrentStep(currentStep + 1);
                audioEngine.playPulse();
              }}
              className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-mono font-bold flex items-center gap-1.5 shadow-violet-soft transition-all ml-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-2.5 min-h-[44px] rounded-2xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-mono font-bold flex items-center gap-2 shadow-violet-soft transition-all ml-auto disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? "Guardando..." : editingDiaryEntry ? "Guardar Cambios" : "Guardar en Diario"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
