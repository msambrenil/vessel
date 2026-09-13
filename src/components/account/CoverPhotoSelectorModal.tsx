"use client";

import React, { useRef, useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { uploadMediaFile } from "@/lib/firebase/storageService";
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

interface CoverPhotoSelectorModalProps {
  onClose: () => void;
  onGoToAlbums: () => void;
}

const PRESET_PROFILE_PHOTOS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
];

export const CoverPhotoSelectorModal: React.FC<CoverPhotoSelectorModalProps> = ({
  onClose,
  onGoToAlbums,
}) => {
  const {
    myProfile,
    userAlbums,
    setProfileCoverPhoto,
    addPhotoToAlbum,
    currentUserUid,
  } = useVessel();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Obtener todas las fotos disponibles en los álbumes del usuario
  const albumPhotos = userAlbums
    .flatMap((a) => a.photos)
    .filter((p) => p.mediaType !== "video");

  const publicAlbum = userAlbums.find((a) => a.privacy === "public") || userAlbums[0];

  const handleSelectPhoto = (url: string) => {
    setProfileCoverPhoto(url);
    setSuccessToast("¡Foto de portada actualizada!");
    audioEngine.playVaultUnlock();
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 600);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !publicAlbum) return;

    setIsUploading(true);
    audioEngine.playPulse();

    try {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      const tempId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // 1. Agregar a la galería del usuario y asignar automáticamente como portada
      addPhotoToAlbum(publicAlbum.id, {
        id: tempId,
        url: previewUrl,
        blurredUrl: previewUrl,
        caption: "Foto de Portada",
        mediaType: "photo",
      });

      setProfileCoverPhoto(previewUrl);

      // 2. Subida a Firebase Storage en segundo plano
      try {
        const uploadResult = await uploadMediaFile(
          currentUserUid,
          publicAlbum.id,
          file
        );
        if (uploadResult?.url) {
          setProfileCoverPhoto(uploadResult.url);
        }
      } catch (cloudErr) {
        console.warn("Subida local completada con preview:", cloudErr);
      }

      setSuccessToast("¡Foto subida y asignada como portada!");
      audioEngine.playVaultUnlock();
      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Error al procesar archivo:", err);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in">
      <div className="w-full max-w-lg bg-obsidian-deep border border-electricViolet/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
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
                  CARD COVER
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Esta es la foto que todos verán en tu tarjeta de la matriz y el radar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de portada"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {successToast && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center gap-2 text-emerald-200 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Botón Subir Foto Directa desde Dispositivo */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-purple-950/20 hover:bg-purple-950/40 border-2 border-dashed border-electricViolet/50 hover:border-electricViolet rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group active:scale-98"
            >
              <div className="p-2.5 rounded-xl bg-electricViolet text-white font-bold group-hover:scale-110 transition-transform shadow-violet-soft">
                <UploadCloud className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-mono text-white group-hover:text-electricViolet-glow transition-colors block uppercase">
                  Subir Nueva Foto desde tu Dispositivo
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  JPG, PNG o WEBP • Se agrega a tu álbum y se define como portada
                </span>
              </div>
            </button>
          </div>

          {/* Sección 1: Fotos de tus Álbumes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Fotos en tus Álbumes ({albumPhotos.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToAlbums();
                }}
                className="text-[10px] font-mono text-electricViolet-glow hover:underline font-bold"
              >
                + Gestionar Álbumes
              </button>
            </div>

            {albumPhotos.length === 0 ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
                <ImageIcon className="w-6 h-6 text-neutral-500 mx-auto" />
                <p className="text-[11px] text-neutral-400">
                  No tenés fotos en tus álbumes todavía.
                </p>
                <p className="text-[10px] text-neutral-500">
                  Subí una foto con el botón de arriba o seleccioná uno de los presets a continuación.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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

          {/* Sección 2: Presets de Demostración Rápida */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Fotos de Prueba // Presets Rápidos
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Tocá cualquiera para asignarla de inmediato como tu portada de perfil:
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_PROFILE_PHOTOS.map((url, idx) => {
                const isCurrent = myProfile.avatarUrl === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPhoto(url)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      isCurrent
                        ? "border-electricViolet shadow-violet-soft ring-2 ring-electricViolet/60 scale-105"
                        : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preset ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-electricViolet/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
