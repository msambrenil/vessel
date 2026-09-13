"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserAlbum, AlbumPhoto, MediaType } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import {
  X,
  Globe,
  Lock,
  Plus,
  Trash2,
  Eye,
  Clock,
  ShieldAlert,
  Calendar,
  Image as ImageIcon,
  UploadCloud,
  Film,
  Play,
  Volume2,
  VolumeX,
  Star,
  Check,
  Sparkles,
  Share2,
  ShieldOff,
} from "lucide-react";

import { uploadMediaFile } from "@/lib/firebase/storageService";
import { DrmBlackoutProtector } from "@/components/security/DrmBlackoutProtector";
import { SteganographicWatermark } from "@/components/security/SteganographicWatermark";

interface AlbumDetailModalProps {
  album: UserAlbum;
  onClose: () => void;
}

const PRESET_ADDITIONAL_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    caption: "Retrato 01 // Luz cenital",
    mediaType: "photo" as MediaType,
  },
  {
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    caption: "Sesión 02 // Tensión corporal",
    mediaType: "photo" as MediaType,
  },
  {
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
    caption: "Espalda // Musculatura",
    mediaType: "photo" as MediaType,
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    caption: "Atmósfera // Kreuzberg",
    mediaType: "photo" as MediaType,
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    caption: "Gym // Presencia",
    mediaType: "photo" as MediaType,
  },
];

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  album: initialAlbum,
  onClose,
}) => {
  const {
    userAlbums,
    deleteAlbum,
    addPhotoToAlbum,
    updatePhotoInAlbum,
    removePhotoFromAlbum,
    currentUserUid,
    myProfile,
    setProfileCoverPhoto,
    revokeAlbumAccessGlobally,
    unshareAlbumGlobally,
    getSharedChatIdsForAlbum,
  } = useVessel();

  // Obtener el álbum vivo y reactivo desde el estado global
  const album = userAlbums.find((a) => a.id === initialAlbum.id) || initialAlbum;

  // Calcular usuarios y chats donde este álbum está activamente compartido
  const sharedChatIds = getSharedChatIdsForAlbum(album.id);
  const allSharedIds = Array.from(new Set([...(album.sharedWithProfileIds || []), ...sharedChatIds]));

  // Estados para gestión de accesos compartidos
  const [confirmRevokeGlobal, setConfirmRevokeGlobal] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState<string | null>(null);

  // Estados para visualización en detalle de fotos/videos (sin restricciones para el propietario)
  const [activePhoto, setActivePhoto] = useState<AlbumPhoto | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Estados para añadir fotos/videos
  const [showAddSection, setShowAddSection] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manejo de tecla Escape para cerrar visor o modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePhoto) {
          setActivePhoto(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, onClose]);

  const processUploadedFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) continue;

      const tempId = `media-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
      const previewUrl = URL.createObjectURL(file);
      const cleanCaption = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      let durationSeconds: number | undefined = undefined;
      if (isVideo) {
        durationSeconds = await getVideoDuration(previewUrl);
      }

      // 1. Mostrar de inmediato en la UI con barra de progreso inicial
      addPhotoToAlbum(album.id, {
        id: tempId,
        url: previewUrl,
        blurredUrl: previewUrl,
        caption: cleanCaption,
        mediaType: isVideo ? "video" : "photo",
        durationSeconds,
        isUploading: true,
        uploadProgress: 15,
      });

      // 2. Subir y optimizar para Firestore / Cloud Storage
      try {
        const uploadResult = await uploadMediaFile(
          currentUserUid,
          album.id,
          file,
          (percent) => {
            updatePhotoInAlbum(album.id, tempId, {
              uploadProgress: Math.max(15, percent),
            });
          }
        );

        // 3. Completar al 100% y persistir
        updatePhotoInAlbum(album.id, tempId, {
          url: uploadResult.url,
          blurredUrl: uploadResult.url,
          uploadProgress: 100,
        });

        // Breve transición para desvanecer la barra
        setTimeout(() => {
          updatePhotoInAlbum(album.id, tempId, {
            isUploading: false,
          });
        }, 200);
      } catch (err) {
        console.error("Error al procesar archivo:", err);
        updatePhotoInAlbum(album.id, tempId, {
          isUploading: false,
          uploadProgress: 100,
        });
      }
    }
    setIsProcessing(false);
    setShowAddSection(false);
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
      video.onloadedmetadata = () => resolve(Math.round(video.duration));
      video.onerror = () => resolve(15);
    });
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const isVideo =
      newPhotoUrl.endsWith(".mp4") ||
      newPhotoUrl.endsWith(".webm") ||
      newPhotoUrl.endsWith(".mov");

    addPhotoToAlbum(album.id, {
      url: newPhotoUrl.trim(),
      blurredUrl: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || undefined,
      mediaType: isVideo ? "video" : "photo",
    });
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setShowAddSection(false);
  };

  const handleAddPresetPhoto = (preset: { url: string; caption: string; mediaType: MediaType }) => {
    addPhotoToAlbum(album.id, {
      url: preset.url,
      blurredUrl: preset.url,
      caption: preset.caption,
      mediaType: preset.mediaType,
    });
  };

  const handleDeleteAlbum = () => {
    deleteAlbum(album.id);
    onClose();
  };

  const isPrivate = album.privacy === "private";
  const videoCount = album.photos.filter((p) => p.mediaType === "video").length;
  const photoCount = album.photos.filter((p) => p.mediaType !== "video").length;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in">
        <div className="w-full max-w-xl bg-obsidian-deep border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Cabecera del Álbum */}
        <div className="p-4 bg-obsidian-surface border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isPrivate
                  ? "bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30"
                  : "bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30"
              }`}
            >
              {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  {album.title}
                </h2>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isPrivate
                      ? "bg-bloodNeon/20 text-bloodNeon"
                      : "bg-electricViolet/20 text-electricViolet-glow font-bold"
                  }`}
                >
                  {isPrivate ? "Bóveda Privada" : "Público"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {album.createdAt}
                </span>
                <span>•</span>
                <span>
                  {album.photos.length} medios ({photoCount} fotos, {videoCount} videos)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Descripción si existe */}
          {album.description && (
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-neutral-300 text-xs font-sans italic">
              "{album.description}"
            </div>
          )}

          {/* Banner explicativo de Bóveda Privada */}
          {isPrivate && (
            <div className="bg-bloodNeon/10 border border-bloodNeon/30 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-bloodNeon">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] font-medium leading-relaxed">
                  Bóveda Cifrada Privada · Acceso ilimitado para ti como propietario. Al compartir acceso en el chat, los destinatarios tendrán visualización efímera protegida.
                </span>
              </div>
            </div>
          )}

          {/* Cuadrícula de Fotos y Videos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Contenido Multimedia ({album.photos.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddSection(!showAddSection)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddSection ? "Cerrar" : "Cargar Fotos o Videos"}</span>
              </button>
            </div>

            {/* Sección expandible para agregar fotos/videos */}
            {showAddSection && (
              <div className="bg-obsidian-surface border border-white/10 p-3.5 rounded-2xl space-y-3 animate-in fade-in">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && processUploadedFiles(e.target.files)}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />

                {/* Zona de Arrastrar y Soltar */}
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
                    if (e.dataTransfer.files) processUploadedFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isDragging
                      ? "bg-electricViolet/20 border-electricViolet"
                      : "bg-black/40 border-white/15 hover:border-electricViolet/50"
                  }`}
                >
                  <UploadCloud className="w-6 h-6 text-electricViolet-glow mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-white block">
                    Toca para cargar desde tu Celular o Notebook
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Cámara, carrete, o arrastrar archivos (JPG, PNG, MP4, MOV)
                  </span>
                  {isProcessing && (
                    <div className="text-xs text-electricViolet-glow font-bold mt-2 animate-pulse">
                      Procesando y cargando medios...
                    </div>
                  )}
                </div>

                {/* Muestras rápidas */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-400 block">
                    O añadir foto rápida de catálogo:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ADDITIONAL_PHOTOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetPhoto(preset)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-electricViolet transition-all group"
                      >
                        <img
                          src={preset.url}
                          alt="preset"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-electricViolet-glow font-bold transition-opacity">
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-400 block">
                    O por URL directa:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/media.mp4 o .jpg"
                      className="flex-1 bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3 py-2 focus:outline-none focus:border-electricViolet"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-3 py-2 bg-electricViolet text-white rounded-xl font-bold text-xs hover:bg-electricViolet-glow transition-all"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Listado de Fotos y Videos */}
            {album.photos.length === 0 ? (
              <div className="p-8 text-center bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-8 h-8 text-neutral-600" />
                <span className="text-xs text-neutral-400 font-medium">
                  Este álbum no tiene fotos ni videos todavía.
                </span>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="mt-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Cargar primer archivo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {album.photos.map((photo) => {
                  const isVideo = photo.mediaType === "video";

                  return (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 group"
                    >
                      {isVideo ? (
                        <div className="w-full h-full relative bg-neutral-950">
                          <video
                            src={photo.url}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-bloodNeon flex items-center gap-1">
                            <Film className="w-2.5 h-2.5" />
                            <span>VIDEO</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={photo.url}
                          alt={photo.caption || album.title}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                      )}

                      {/* Watermark esteganográfica sobre fotos de álbum público */}
                      {!isPrivate && (
                        <SteganographicWatermark variant="subtle" showBadge={false} />
                      )}

                      {/* Overlay interactivo para el Propietario (Acceso permanente sin temporizadores) */}
                      <div
                        onClick={() => setActivePhoto(photo)}
                        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5 cursor-pointer opacity-90 group-hover:opacity-100 transition-all z-10"
                        title="Toca para ver en pantalla completa"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          {photo.caption ? (
                            <span className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-sm">
                              {photo.caption}
                            </span>
                          ) : (
                            <span className="text-[9px] text-neutral-400 font-mono">
                              {isVideo ? "Clip de video" : "Foto"}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1 font-bold ${
                              isPrivate
                                ? "text-white bg-bloodNeon/80 border-bloodNeon hover:bg-bloodNeon"
                                : "text-white bg-electricViolet border-electricViolet hover:bg-electricViolet-glow shadow-violet-soft"
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver</span>
                          </span>
                        </div>
                      </div>

                      {/* Badge / Botón de Foto de Portada Principal */}
                      {!isVideo && (
                        <>
                          {myProfile.avatarUrl === photo.url ? (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-electricViolet text-white font-mono font-black text-[9px] shadow-violet-soft flex items-center gap-1 z-20 border border-electricViolet/80 uppercase tracking-wider">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Foto de Portada</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProfileCoverPhoto(photo.url);
                              }}
                              className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 hover:bg-electricViolet text-neutral-300 hover:text-white border border-white/20 hover:border-electricViolet font-mono font-bold text-[9px] flex items-center gap-1 transition-all shadow-md z-20 cursor-pointer active:scale-95"
                              title="Establecer como Foto de Portada Principal"
                            >
                              <Star className="w-3 h-3" />
                              <span>Elegir como Portada</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Botón Eliminar Foto/Video */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhotoFromAlbum(album.id, photo.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/80 hover:bg-bloodNeon text-neutral-300 hover:text-white border border-white/20 transition-all shadow-lg z-20"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Barrita de progreso super fina en la parte inferior durante la carga */}
                      {photo.isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/80 overflow-hidden z-30 pointer-events-none">
                          <div
                            className="h-full bg-electricViolet transition-all duration-150 shadow-[0_0_8px_#8B5CF6]"
                            style={{ width: `${Math.max(8, photo.uploadProgress || 0)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sección de Control de Accesos Compartidos */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  allSharedIds.length > 0
                    ? "bg-electricViolet/15 text-electricViolet-glow border-electricViolet/30"
                    : "bg-white/5 text-neutral-400 border-white/10"
                }`}>
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block uppercase tracking-wider font-mono">
                    Control de Accesos Compartidos
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {allSharedIds.length > 0
                      ? `Compartido activamente con ${allSharedIds.length} contacto(s) / chat(s)`
                      : "Este álbum no está compartido con ningún usuario actualmente"}
                  </span>
                </div>
              </div>

              {allSharedIds.length > 0 && (
                confirmRevokeGlobal ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmRevokeGlobal(false)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        revokeAlbumAccessGlobally(album.id);
                        unshareAlbumGlobally(album.id);
                        setConfirmRevokeGlobal(false);
                        setRevokeFeedback("Acceso revocado en todas las conversaciones.");
                        setTimeout(() => setRevokeFeedback(null), 3000);
                      }}
                      className="px-3.5 py-1.5 bg-bloodNeon hover:bg-bloodNeon-glow text-white font-extrabold rounded-xl text-xs uppercase font-mono tracking-wider transition-all cursor-pointer shadow-blood-glow active:scale-95"
                    >
                      Confirmar Revocación
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeGlobal(true)}
                    className="px-3.5 py-2 min-h-[40px] bg-bloodNeon/15 hover:bg-bloodNeon/25 border border-bloodNeon/40 text-bloodNeon rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <ShieldOff className="w-3.5 h-3.5" />
                    <span>Dejar de compartir con todos</span>
                  </button>
                )
              )}
            </div>

            {revokeFeedback && (
              <div className="px-3 py-2 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 text-bloodNeon text-[11px] font-mono font-bold animate-in fade-in">
                ✓ {revokeFeedback}
              </div>
            )}
          </div>

          {/* Sección de Eliminación de Álbum */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-red-400 block">
                Zona de Peligro
              </span>
              <span className="text-[10px] text-neutral-400">
                Eliminar este álbum liberará tu cuota de la versión gratuita.
              </span>
            </div>

            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3.5 py-2 min-h-[40px] bg-white/10 hover:bg-white/20 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAlbum}
                  className="px-4 py-2 min-h-[40px] bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95"
                >
                  Confirmar Eliminación
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Eliminar este álbum"
                className="px-3.5 py-2 min-h-[40px] bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Eliminar Álbum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Modal de Vista en Detalle de Fotos/Videos para el Propietario (Desacoplado con z-[100] de pantalla completa) */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-obsidian-surface rounded-3xl border border-white/20 p-4 sm:p-5 flex flex-col shadow-2xl relative overflow-hidden max-h-[92vh]"
          >
            {/* Header de Vista en Detalle */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <div className="flex items-center gap-1.5 text-bloodNeon font-bold">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      BÓVEDA PRIVADA // {album.title}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-electricViolet-glow font-bold">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      ÁLBUM PÚBLICO // {album.title}
                    </span>
                  </div>
                )}
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-neutral-300 border border-white/10">
                  ACCESO PROPIETARIO
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Cerrar visor"
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenedor Multimedia */}
            <div
              className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-black flex items-center justify-center select-none flex-1 min-h-0 border border-white/5 shadow-inner"
              onContextMenu={(e) => e.preventDefault()}
            >
              {activePhoto.mediaType === "video" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={activePhoto.url}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-contain pointer-events-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition-all cursor-pointer z-10"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <img
                  src={activePhoto.url}
                  alt={activePhoto.caption || "Foto de Álbum"}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}

              {/* Trama Esteganográfica Sutil */}
              <SteganographicWatermark
                ownerCodename={myProfile.codename}
                variant="subtle"
                showBadge={false}
              />
            </div>

            {/* Footer con Metadatos y Acciones */}
            <div className="flex items-center justify-between text-xs flex-shrink-0 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 truncate mr-2">
                <span className="text-neutral-200 font-medium truncate">
                  {activePhoto.caption || (activePhoto.mediaType === "video" ? "Clip de Video" : "Foto")}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {activePhoto.createdAt || "Hoy"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {activePhoto.mediaType !== "video" && myProfile.avatarUrl !== activePhoto.url && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileCoverPhoto(activePhoto.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-electricViolet/20 hover:bg-electricViolet/30 text-electricViolet-glow border border-electricViolet/40 font-mono text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-violet-soft"
                  >
                    <Star className="w-3 h-3" />
                    <span>Hacer Portada</span>
                  </button>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">
                  Visualización Permanente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
