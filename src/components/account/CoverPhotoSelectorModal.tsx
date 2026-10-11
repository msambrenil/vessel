"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { uploadMediaFile, compressImage } from "@/lib/firebase/storageService";
import {
  X,
  Camera,
  Star,
  Check,
  Plus,
  UploadCloud,
  FolderLock,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { BrutalistButton } from "@/components/ui";

interface CoverPhotoSelectorModalProps {
  onClose: () => void;
  onGoToAlbums: () => void;
}

export const CoverPhotoSelectorModal: React.FC<CoverPhotoSelectorModalProps> = ({
  onClose,
  onGoToAlbums,
}) => {
  const {
    myProfile,
    updateUserAvatar,
    currentUserUid,
  } = useAuth();
  const {
    userAlbums,
    setProfileCoverPhoto,
    createAlbum,
    addPhotoToAlbum,
    language,
    t,
  } = useSettings();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  // Obtener todas las fotos disponibles en los álbumes del usuario
  const albumPhotos = userAlbums
    .flatMap((a) => a.photos)
    .filter((p) => p.mediaType !== "video");

  const publicAlbum = userAlbums.find((a) => a.privacy === "public") || userAlbums[0];

  const handleSelectPhoto = (url: string) => {
    setProfileCoverPhoto(url);
    updateUserAvatar(url, false);
    setSuccessToast("¡Foto de portada actualizada!");
    audioEngine.playVaultUnlock();
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 600);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    audioEngine.playPulse();

    try {
      const file = files[0];
      const targetAlbumId = publicAlbum?.id || "album-pub-01";

      // 1. Si no existe álbum público, crearlo automáticamente
      if (!publicAlbum) {
        createAlbum({
          title: "Galería Pública Principal",
          privacy: "public",
          description: "Fotos visibles para todos en el radar y la matriz.",
        });
      }

      // 2. Comprimir en WebP de alta definición (1080x1080 a 85% calidad)
      const { blob, dataUrl } = await compressImage(file, 1080, 1080, 0.85);
      const tempId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // 3. Asignar inmediatamente la foto HD como avatar y portada
      updateUserAvatar(dataUrl, false);
      setProfileCoverPhoto(dataUrl);

      // 4. Agregar a la galería pública del usuario
      addPhotoToAlbum(targetAlbumId, {
        id: tempId,
        url: dataUrl,
        blurredUrl: dataUrl,
        caption: "Foto de Portada",
        mediaType: "photo",
      });

      // 5. Subida a Firebase Storage en segundo plano
      try {
        const uploadResult = await uploadMediaFile(
          currentUserUid,
          targetAlbumId,
          blob
        );
        if (uploadResult?.url) {
          updateUserAvatar(uploadResult.url, false);
          setProfileCoverPhoto(uploadResult.url);
        }
      } catch (cloudErr) {
        console.warn("Subida en nube con fallback local HD:", cloudErr);
      }

      setSuccessToast("¡Foto en alta definición asignada como portada!");
      audioEngine.playVaultUnlock();
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Error al procesar archivo:", err);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto Principal de Portada"
      className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl bg-obsidian-deep border-t sm:border border-electricViolet/40 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[92vh] animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />
        {/* Cabecera */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-electricViolet/15 text-electricViolet border border-electricViolet/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                  Foto Principal de Portada
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow font-bold border border-electricViolet/40">
                  {t.account?.cardCoverBadge || "PORTADA"}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Esta es la foto que todos verán en tu tarjeta de la matriz y el radar
              </p>
            </div>
          </div>

          <BrutalistButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar selector de portada"
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </BrutalistButton>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {successToast && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Opciones 1-Tap: Sacar Foto Directa o Elegir del Carrete */}
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="image/*"
              capture="user"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <BrutalistButton
                variant="primary"
                size="default"
                disabled={isUploading}
                onClick={() => cameraInputRef.current?.click()}
                className="w-full min-h-[52px] justify-start text-left px-3.5"
              >
                <div className="p-2 rounded-xl bg-white/20 text-white mr-2 flex-shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-xs uppercase font-mono truncate">
                    {isUploading
                      ? language === "es" ? "Subiendo..." : "Uploading..."
                      : language === "es" ? "Sacar Foto Ya" : "Take Photo Now"}
                  </span>
                  <span className="block text-[10px] opacity-80 font-normal truncate">
                    {language === "es" ? "1 toque con tu cámara" : "1 tap with camera"}
                  </span>
                </div>
              </BrutalistButton>

              <BrutalistButton
                variant="tactical"
                size="default"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[52px] justify-start text-left px-3.5"
              >
                <div className="p-2 rounded-xl bg-electricViolet/20 text-electricViolet-glow mr-2 flex-shrink-0">
                  {isUploading ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-xs uppercase font-mono truncate text-white">
                    {isUploading
                      ? language === "es" ? "Optimizando..." : "Optimizing..."
                      : language === "es" ? "Elegir de Galería" : "Choose from Gallery"}
                  </span>
                  <span className="block text-[10px] text-neutral-400 font-normal truncate">
                    {language === "es" ? "JPG, PNG o WebP en HD" : "JPG, PNG or WebP in HD"}
                  </span>
                </div>
              </BrutalistButton>
            </div>
          </div>

          {/* Sección 1: Fotos de tus Álbumes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  {language === "es"
                    ? `Fotos de tus Álbumes (${albumPhotos.length})`
                    : `Photos in Albums (${albumPhotos.length})`}
                </span>
              </div>
              <BrutalistButton
                variant="ghost"
                size="compact"
                onClick={() => {
                  onClose();
                  onGoToAlbums();
                }}
                className="text-[10px] text-electricViolet-glow font-bold"
              >
                {language === "es" ? "+ Ver Todos los Álbumes" : "+ View All Albums"}
              </BrutalistButton>
            </div>

            {albumPhotos.length === 0 ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                <ImageIcon className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="text-[11px] text-neutral-300">
                  {language === "es"
                    ? "No tenés fotos en tus álbumes todavía."
                    : "No photos in your albums yet."}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {language === "es"
                    ? "Sacate una foto o subí una desde tu galería con los botones de arriba."
                    : "Take a photo or upload from gallery with the buttons above."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {albumPhotos.map((photo) => {
                  const isCurrent = myProfile.avatarUrl === photo.url;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleSelectPhoto(photo.url)}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                        isCurrent
                          ? "border-electricViolet shadow-violet-soft ring-2 ring-electricViolet/70 scale-102"
                          : "border-white/15 opacity-75 hover:opacity-100 hover:border-white/40"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt="foto de álbum"
                        className="w-full h-full object-cover"
                      />
                      {isCurrent ? (
                        <div className="absolute inset-x-0 bottom-0 bg-electricViolet text-white py-0.5 text-[8px] font-mono font-bold uppercase text-center flex items-center justify-center gap-0.5 shadow-violet-soft">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Portada</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-black/80 px-1.5 py-0.5 rounded border border-electricViolet/40">
                            Elegir
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
