"use client";

import React, { useState, useRef } from "react";
import { useVessel, FREE_TIER_LIMITS } from "@/context/VesselContext";
import { AlbumPrivacy, AlbumPhoto, MediaType } from "@/types/vessel";
import { compressImage } from "@/lib/firebase/storageService";
import {
  X,
  Globe,
  Lock,
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  Sparkles,
  UploadCloud,
  Film,
  Smartphone,
  Laptop,
  Play,
  Crown,
} from "lucide-react";

interface CreateAlbumModalProps {
  onClose: () => void;
  defaultPrivacy?: AlbumPrivacy;
}

interface MediaItemDraft {
  url: string;
  caption?: string;
  mediaType: MediaType;
  durationSeconds?: number;
  fileName?: string;
}

const PRESET_SAMPLE_PHOTOS: { url: string; caption: string; mediaType: MediaType }[] = [
  {
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    caption: "Retrato Brutalista // Kreuzberg",
    mediaType: "photo",
  },
  {
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    caption: "Tensión Corporal // Studio",
    mediaType: "photo",
  },
  {
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
    caption: "Espalda & Silueta",
    mediaType: "photo",
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    caption: "Iluminación Tenue // Darkroom",
    mediaType: "photo",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    caption: "Presencia Física // Gym Raw",
    mediaType: "photo",
  },
];

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({
  onClose,
  defaultPrivacy = "public",
}) => {
  const { userAlbums, userPlan, setUserPlan, createAlbum } = useVessel();

  const [privacy, setPrivacy] = useState<AlbumPrivacy>(defaultPrivacy);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItemDraft[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [customCaption, setCustomCaption] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isUnlimited = userPlan === "unlimited" || userPlan === "pro";
  const publicCount = userAlbums.filter((a) => a.privacy === "public").length;
  const privateCount = userAlbums.filter((a) => a.privacy === "private").length;

  const isPublicLimitReached =
    !isUnlimited && publicCount >= FREE_TIER_LIMITS.maxPublicAlbums;
  const isPrivateLimitReached =
    !isUnlimited && privateCount >= FREE_TIER_LIMITS.maxPrivateAlbums;

  const isCurrentSelectionBlocked =
    (privacy === "public" && isPublicLimitReached) ||
    (privacy === "private" && isPrivateLimitReached);

  // Procesamiento de archivos seleccionados o arrastrados (Fotos o Videos)
  const processFiles = async (files: FileList | File[]) => {
    setIsProcessingFiles(true);
    setErrorMessage(null);

    const newItems: MediaItemDraft[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) {
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage(`El archivo "${file.name}" supera el límite máximo de 50MB.`);
        continue;
      }

      try {
        let fileUrl = "";
        let durationSeconds: number | undefined = undefined;

        if (isImage) {
          // Comprimir imagen a WebP optimizado (~35-50KB) preservando aspect ratio
          try {
            const compressed = await compressImage(file);
            fileUrl = compressed.dataUrl;
          } catch (compressionErr) {
            console.warn("Fallo en compresión de imagen, usando lectura estándar:", compressionErr);
            fileUrl = await readFileAsDataUrl(file);
          }
        } else {
          fileUrl = await readFileAsDataUrl(file);
          durationSeconds = await getVideoDuration(fileUrl);
        }

        newItems.push({
          url: fileUrl,
          mediaType: isVideo ? "video" : "photo",
          fileName: file.name,
          caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          durationSeconds,
        });
      } catch (err) {
        console.error("Error al procesar archivo:", err);
      }
    }

    if (newItems.length > 0) {
      setSelectedMedia((prev) => [...prev, ...newItems]);
    }
    setIsProcessingFiles(false);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration));
      };
      video.onerror = () => resolve(15);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    const isVideo =
      customPhotoUrl.endsWith(".mp4") ||
      customPhotoUrl.endsWith(".webm") ||
      customPhotoUrl.endsWith(".mov");
    setSelectedMedia((prev) => [
      ...prev,
      {
        url: customPhotoUrl.trim(),
        caption: customCaption.trim() || undefined,
        mediaType: isVideo ? "video" : "photo",
      },
    ]);
    setCustomPhotoUrl("");
    setCustomCaption("");
  };

  const handleTogglePresetPhoto = (preset: {
    url: string;
    caption: string;
    mediaType: MediaType;
  }) => {
    const exists = selectedMedia.some((p) => p.url === preset.url);
    if (exists) {
      setSelectedMedia((prev) => prev.filter((p) => p.url !== preset.url));
    } else {
      setSelectedMedia((prev) => [...prev, preset]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Por favor ingresa un nombre para el álbum.");
      return;
    }

    const photosToSave: AlbumPhoto[] = selectedMedia.map((p, idx) => {
      const item: AlbumPhoto = {
        id: `media-${Date.now()}-${idx}`,
        url: p.url,
        blurredUrl: p.url.startsWith("data:") ? "" : p.url,
        createdAt: "Ahora",
      };
      if (p.caption?.trim()) item.caption = p.caption.trim();
      if (p.mediaType) item.mediaType = p.mediaType;
      if (typeof p.durationSeconds === "number" && !isNaN(p.durationSeconds)) {
        item.durationSeconds = p.durationSeconds;
      }
      return item;
    });


    const result = createAlbum({
      title,
      description,
      privacy,
      coverUrl: photosToSave.length > 0 ? photosToSave[0].url : undefined,
      photos: photosToSave,
    });

    if (!result.success) {
      setErrorMessage(result.error || "No se pudo crear el álbum.");
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-xl bg-obsidian-deep border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Crear Nuevo Álbum // Media Vault
              </h2>
              <p className="text-[10px] text-neutral-400">
                Fotos y Videos desde Celular o Computadora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de Cuota / Upgrade a VESSEL UNLIMITED */}
        <div className="px-4 py-2.5 bg-black/60 border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-300">
            {isUnlimited ? (
              <>
                <Crown className="w-4 h-4 text-electricViolet-glow" />
                <span className="text-[11px] font-bold text-electricViolet-glow">
                  VESSEL UNLIMITED: <span className="text-white">Álbumes Ilimitados</span>
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span className="text-[11px] font-semibold">
                  Plan Gratuito: <span className="text-white">1 Público</span> • <span className="text-white">1 Privado</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            {isUnlimited ? (
              <span className="text-electricViolet-glow font-bold">SIN LÍMITES</span>
            ) : (
              <>
                <span className={publicCount >= FREE_TIER_LIMITS.maxPublicAlbums ? "text-neutral-400 font-bold" : "text-electricViolet-glow font-bold"}>
                  PUB: {publicCount}/{FREE_TIER_LIMITS.maxPublicAlbums}
                </span>
                <span className="text-neutral-600">|</span>
                <span className={privateCount >= FREE_TIER_LIMITS.maxPrivateAlbums ? "text-neutral-400 font-bold" : "text-bloodNeon font-bold"}>
                  PRIV: {privateCount}/{FREE_TIER_LIMITS.maxPrivateAlbums}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Mensaje de Error si se excede la cuota */}
          {errorMessage && (
            <div className="bg-bloodNeon/15 border border-bloodNeon/50 p-3 rounded-xl flex items-start gap-2 text-bloodNeon text-[11px]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner de Límite Superado con Botón a VESSEL UNLIMITED */}
          {isCurrentSelectionBlocked && (
            <div className="bg-gradient-to-r from-electricViolet/15 via-black to-bloodNeon/15 border border-electricViolet/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="flex items-center gap-1.5 text-electricViolet-glow font-bold text-xs uppercase tracking-wider">
                  <Crown className="w-4 h-4" />
                  <span>Cuota Gratuita Alcanzada</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Activá <strong className="text-white">VESSEL UNLIMITED</strong> para álbumes, bóvedas y señales ilimitadas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserPlan("unlimited")}
                className="px-3 py-1.5 bg-electricViolet hover:bg-electricViolet-glow text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-violet-soft self-end sm:self-auto"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Activar UNLIMITED</span>
              </button>
            </div>
          )}

          {/* 1. Selector de Privacidad */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Tipo de Álbum / Bóveda
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción Pública */}
              <button
                type="button"
                onClick={() => {
                  setPrivacy("public");
                  setErrorMessage(null);
                }}
                aria-pressed={privacy === "public"}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  privacy === "public"
                    ? "bg-purple-950/50 border-electricViolet text-white shadow-violet-soft font-bold"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      privacy === "public"
                        ? "bg-electricViolet text-white font-bold"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlimited
                        ? "bg-electricViolet/20 text-electricViolet-glow"
                        : isPublicLimitReached
                        ? "bg-red-900/60 text-red-300 border border-red-500/40"
                        : "bg-electricViolet/20 text-electricViolet-glow"
                    }`}
                  >
                    {isUnlimited ? "Ilimitado" : isPublicLimitReached ? "1/1 Límite" : `${publicCount}/1 Disp.`}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Álbum Público</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                    Visible en la matriz y radar para todos los usuarios.
                  </div>
                </div>
              </button>

              {/* Opción Privada */}
              <button
                type="button"
                onClick={() => {
                  setPrivacy("private");
                  setErrorMessage(null);
                }}
                aria-pressed={privacy === "private"}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
                  privacy === "private"
                    ? "bg-bloodNeon/15 border-bloodNeon text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      privacy === "private"
                        ? "bg-bloodNeon text-white font-bold"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlimited
                        ? "bg-bloodNeon/20 text-bloodNeon"
                        : isPrivateLimitReached
                        ? "bg-red-900/60 text-red-300 border border-red-500/40"
                        : "bg-bloodNeon/20 text-bloodNeon"
                    }`}
                  >
                    {isUnlimited ? "Ilimitado" : isPrivateLimitReached ? "1/1 Límite" : `${privateCount}/1 Disp.`}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Álbum Privado (Nudes 🔒)</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                    Cifrado bajo autorización y temporizador efímero.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Título del Álbum */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Nombre del Álbum <span className="text-electricViolet-glow">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                privacy === "public"
                  ? "Ej. Sesión Nocturna // Palermo"
                  : "Ej. Álbum de Nudes // Arnés, Tensión & Darkroom"
              }
              className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3.5 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-medium"
            />
          </div>

          {/* 3. Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Descripción / Notas de Contexto (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles sobre el contenido, atmósfera o requisitos de acceso..."
              rows={2}
              className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs p-3 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all resize-none"
            />
          </div>

          {/* 4. CARGA DE ARCHIVOS MULTIMEDIA */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-electricViolet-glow" />
                <span>Cargar Fotos o Videos desde Dispositivo</span>
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {selectedMedia.length} archivo(s) listo(s)
              </span>
            </div>

            {/* Input oculto nativo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            {/* Zona Drag and Drop Táctica */}
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Seleccionar o arrastrar archivos para el álbum"
              className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                isDragging
                  ? "bg-electricViolet/20 border-electricViolet scale-[0.99] shadow-violet-soft"
                  : "bg-black/50 border-white/15 hover:border-electricViolet/50 hover:bg-black/70"
              }`}
            >
              <div className="flex items-center gap-2 text-electricViolet-glow">
                <div className="p-2.5 rounded-xl bg-electricViolet/15 border border-electricViolet/30 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-white group-hover:text-electricViolet-glow transition-colors">
                  Toca para seleccionar fotos o videos
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Soporta cámara y carrete en celulares o arrastrar archivos en notebook/PC (JPG, PNG, WebP, MP4, MOV)
                </p>
              </div>

              {/* Badges de Compatibilidad */}
              <div className="flex items-center gap-2 text-[9px] text-neutral-400 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-electricViolet-glow" /> Móvil / Celu
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-electricViolet-glow" /> Notebook / PC
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                  <Film className="w-3 h-3 text-bloodNeon" /> Videos HD
                </span>
              </div>

              {isProcessingFiles && (
                <div className="text-xs text-electricViolet-glow font-bold animate-pulse mt-1">
                  Procesando archivos multimedia...
                </div>
              )}
            </div>
          </div>

          {/* 5. Selector de Fotos de Muestra Presets */}
          <div className="space-y-2 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                O elegir muestras de catálogo:
              </label>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRESET_SAMPLE_PHOTOS.map((preset, idx) => {
                const isSelected = selectedMedia.some((p) => p.url === preset.url);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTogglePresetPhoto(preset)}
                    aria-label={`Seleccionar foto de muestra ${preset.caption}`}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      isSelected
                        ? "border-electricViolet scale-95 shadow-violet-soft ring-2 ring-electricViolet/40"
                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.caption}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-electricViolet/30 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-electricViolet text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Añadir Foto/Video con URL Directa */}
          <div className="space-y-2 pt-1 border-t border-white/5">
            <label className="text-[11px] font-bold text-neutral-400 block">
              O añadir por URL directa:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="https://ejemplo.com/media.mp4 o .jpg"
                className="flex-1 bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3 py-2.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                className="px-4 py-2.5 min-h-[40px] bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Previsualización de Medios Seleccionados */}
          {selectedMedia.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white uppercase font-bold tracking-wider">
                  Contenido de este Álbum ({selectedMedia.length}):
                </span>
                <span className="text-[9px] text-neutral-400">
                  {selectedMedia.filter((m) => m.mediaType === "video").length} videos • {selectedMedia.filter((m) => m.mediaType === "photo").length} fotos
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {selectedMedia.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group bg-black"
                  >
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full relative bg-neutral-900 flex items-center justify-center">
                        <video
                          src={item.url}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="p-1.5 rounded-full bg-bloodNeon/80 text-white shadow-lg">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>
                        {item.durationSeconds && (
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-white">
                            {item.durationSeconds}s
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || "Preview"}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      aria-label="Eliminar este archivo de la selección"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-3 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCurrentSelectionBlocked}
              className={`flex-1 min-h-[44px] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98 ${
                isCurrentSelectionBlocked
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5"
                  : "bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft font-extrabold"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Guardar Álbum ({selectedMedia.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
