"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings, FREE_TIER_LIMITS } from "@/context/VesselContext";
import { AlbumPrivacy, MediaType } from "@/types/vessel";
import { compressImage } from "@/lib/firebase/storageService";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";
import {
  X,
  Globe,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  UploadCloud,
  Play,
  Crown,
} from "lucide-react";
import {
  BrutalistButton,
  BrutalistInput,
  BrutalistTextarea,
  TacticalBadge,
  TacticalMorphingLock,
} from "@/components/ui";


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

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({
  onClose,
  defaultPrivacy = "public",
}) => {
  const { userAlbums, userPlan, setUserPlan, createAlbum, language, t } = useSettings();

  const [privacy, setPrivacy] = useState<AlbumPrivacy>(defaultPrivacy);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItemDraft[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

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
        setErrorMessage(
          language === "es"
            ? `El archivo "${file.name}" supera el límite máximo de 50MB.`
            : `File "${file.name}" exceeds 50MB limit.`
        );
        continue;
      }

      try {
        let fileUrl = "";
        let durationSeconds: number | undefined = undefined;

        if (isImage) {
          try {
            const compressed = await compressImage(file);
            fileUrl = compressed.dataUrl;
          } catch {
            fileUrl = await readFileAsDataUrl(file);
          }
        } else if (isVideo) {
          fileUrl = URL.createObjectURL(file);
          try {
            durationSeconds = await getVideoDuration(fileUrl);
          } catch {
            durationSeconds = undefined;
          }
        }

        if (fileUrl) {
          newItems.push({
            url: fileUrl,
            mediaType: isVideo ? "video" : "photo",
            caption: "",
            durationSeconds,
            fileName: file.name,
          });
        }
      } catch (err) {
        console.error("Error processing file:", err);
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
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve(Math.round(video.duration));
      };
      video.onerror = () => resolve(0);
      video.src = url;
    });
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isCurrentSelectionBlocked) {
      setErrorMessage(
        language === "es"
          ? "Alcanzaste el límite de álbumes para tu plan actual."
          : "You have reached the album limit for your current plan."
      );
      return;
    }

    const finalTitle = title.trim();
    if (!finalTitle) {
      setErrorMessage(
        language === "es"
          ? "Por favor ingresá un nombre para el álbum."
          : "Please enter a name for the album."
      );
      return;
    }

    const coverUrl = selectedMedia.length > 0 ? selectedMedia[0].url : "";

    createAlbum({
      title: finalTitle,
      description: description.trim() || undefined,
      privacy,
      coverUrl,
      photos: selectedMedia.map((item, idx) => ({
        id: `photo-${Date.now()}-${idx}`,
        url: item.url,
        caption: item.caption,
        isLocked: privacy === "private",
        mediaType: item.mediaType,
        durationSeconds: item.durationSeconds,
        createdAt: getLocalTodayIso(),
      })),
    });

    onClose();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t?.account?.createAlbumModalTitle || (language === "es" ? "Crear Nuevo Álbum" : "Create New Album")}
      className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-obsidian-deep border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[92vh] animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Cabecera */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                {t?.account?.createAlbumModalTitle || (language === "es" ? "Crear Nuevo Álbum" : "Create New Album")}
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                {language === "es"
                  ? "Fotos y videos desde tu galería o cámara"
                  : "Photos and videos from your gallery"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs font-mono">
          {/* Mensaje de Error */}
          {errorMessage && (
            <div className="bg-bloodNeon/15 border border-bloodNeon/50 p-3 rounded-2xl flex items-start gap-2 text-bloodNeon text-xs animate-fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner de Límite Superado */}
          {isCurrentSelectionBlocked && (
            <div className="bg-gradient-to-r from-electricViolet/20 via-black to-bloodNeon/20 border border-electricViolet/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="flex items-center gap-1.5 text-electricViolet-glow font-bold text-xs uppercase tracking-wider">
                  <Crown className="w-4 h-4" />
                  <span>{language === "es" ? "Cuota Gratuita Alcanzada" : "Free Quota Reached"}</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  {language === "es"
                    ? "Activá VESSEL TOTAL para álbumes y fotos con llave ilimitadas."
                    : "Upgrade to VESSEL TOTAL for unlimited albums and locked keys."}
                </p>
              </div>
              <BrutalistButton
                variant="primary"
                size="sm"
                onClick={() => setUserPlan("unlimited")}
              >
                <Crown className="w-3.5 h-3.5 mr-1" />
                <span>{language === "es" ? "Activar Total" : "Activate Total"}</span>
              </BrutalistButton>
            </div>
          )}

          {/* 1. Selector de Privacidad */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              {language === "es" ? "Tipo de Álbum" : "Album Type"}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Opción Pública */}
              <button
                type="button"
                onClick={() => {
                  setPrivacy("public");
                  setErrorMessage(null);
                }}
                aria-pressed={privacy === "public"}
                className={`min-h-[44px] p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  privacy === "public"
                    ? "bg-purple-950/50 border-electricViolet text-white shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      privacy === "public"
                        ? "bg-electricViolet text-white"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <TacticalBadge variant={privacy === "public" ? "violet" : "neutral"} size="sm">
                    {isUnlimited
                      ? "Ilimitado"
                      : isPublicLimitReached
                      ? "1/1 Límite"
                      : `${publicCount}/1`}
                  </TacticalBadge>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">
                    {language === "es" ? "Álbum Público" : "Public Album"}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                    {language === "es"
                      ? "Visible en tu ficha para quienes te vean en la matrix."
                      : "Visible on your card for all matches."}
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
                className={`min-h-[44px] p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
                  privacy === "private"
                    ? "bg-bloodNeon/15 border-bloodNeon text-white shadow-lg font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center ${
                      privacy === "private"
                        ? "bg-bloodNeon/20 text-white"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    <TacticalMorphingLock
                      isLocked={privacy === "private"}
                      size="sm"
                      variant="blood"
                      soundEffect={true}
                    />

                  </div>

                  <TacticalBadge variant={privacy === "private" ? "blood" : "neutral"} size="sm">
                    {isUnlimited
                      ? "Ilimitado"
                      : isPrivateLimitReached
                      ? "1/1 Límite"
                      : `${privateCount}/1`}
                  </TacticalBadge>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">
                    {language === "es" ? "Álbum con Llave 🔑" : "Key-Locked Album 🔑"}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                    {language === "es"
                      ? "Protegido. Solo visible si das llave en un chat."
                      : "Protected. Only visible if you grant a key."}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Título del Álbum */}
          <BrutalistInput
            label={language === "es" ? "Nombre del Álbum" : "Album Name"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              privacy === "public"
                ? (language === "es" ? "Ej: Salida de noche, Palermo..." : "e.g., Night out...")
                : (language === "es" ? "Ej: Fotos íntimas, arnés..." : "e.g., Intimate, gear...")
            }
          />

          {/* 3. Descripción */}
          <BrutalistTextarea
            label={language === "es" ? "Descripción (Opcional)" : "Description (Optional)"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              language === "es"
                ? "Agregá detalles o requisitos de acceso..."
                : "Add details or access context..."
            }
            rows={2}
          />

          {/* 4. Carga de Archivos */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-electricViolet-glow" />
                <span>{language === "es" ? "Fotos o Videos" : "Photos or Videos"}</span>
              </label>
              <span className="text-[10px] text-neutral-400">
                {selectedMedia.length} {language === "es" ? "archivos listos" : "ready"}
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && processFiles(e.target.files)}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  processFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                isDragging
                  ? "border-electricViolet bg-electricViolet/20"
                  : "border-white/15 bg-black/40 hover:border-electricViolet hover:bg-electricViolet/5"
              }`}
            >
              <UploadCloud className="w-8 h-8 text-electricViolet-glow" />
              <span className="text-xs font-bold text-white">
                {language === "es"
                  ? "Tocá para elegir fotos o videos de tu galería"
                  : "Tap to select photos or videos"}
              </span>
              <span className="text-[10px] text-neutral-400">
                {language === "es"
                  ? "Compresión optimizada en tu dispositivo"
                  : "Optimized compression"}
              </span>

              {isProcessingFiles && (
                <div className="text-xs text-electricViolet-glow font-bold animate-pulse mt-1">
                  {language === "es" ? "Optimizando archivos..." : "Optimizing files..."}
                </div>
              )}
            </div>
          </div>

          {/* Previsualización de Medios */}
          {selectedMedia.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white uppercase font-bold tracking-wider">
                  {language === "es"
                    ? `Contenido (${selectedMedia.length}):`
                    : `Content (${selectedMedia.length}):`}
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
                          <div className="p-1 rounded-full bg-bloodNeon/80 text-white">
                            <Play className="w-3 h-3 fill-current" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      aria-label="Eliminar archivo"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity cursor-pointer"
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
            <BrutalistButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {language === "es" ? "Cancelar" : "Cancel"}
            </BrutalistButton>
            <BrutalistButton
              variant="primary"
              type="submit"
              disabled={isCurrentSelectionBlocked}
              className="flex-1 shadow-violet-soft font-bold"
            >
              <Plus className="w-4 h-4 mr-1 stroke-[3]" />
              <span>
                {language === "es"
                  ? `Guardar Álbum (${selectedMedia.length})`
                  : `Save Album (${selectedMedia.length})`}
              </span>
            </BrutalistButton>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
