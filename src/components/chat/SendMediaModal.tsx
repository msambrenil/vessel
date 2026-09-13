"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  X,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Flame,
  EyeOff,
  Clock,
  CheckCircle2,
  FolderLock,
  Sparkles,
  Trash2,
  Check,
  MessageSquare,
  Zap,
  History,
} from "lucide-react";
import { useVessel } from "@/context/VesselContext";
import { ChatMediaAttachment, ChatMediaMode, UserAlbum } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface SendMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfileId: string;
  targetCodename: string;
}

// Fallback preset samples if no photos have been shared yet
const SAMPLE_PHOTOS = [
  {
    id: "sample-1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80",
    badge: "ESTUDIO",
    label: "Retrato Estudio // Contrast",
    mediaType: "photo" as const,
  },
  {
    id: "sample-2",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80",
    badge: "SILUETA",
    label: "Torso & Sombra // Silhouette",
    mediaType: "photo" as const,
  },
  {
    id: "sample-3",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80",
    badge: "RAW",
    label: "Perfil Brutalista // Amber",
    mediaType: "photo" as const,
  },
];

export const SendMediaModal: React.FC<SendMediaModalProps> = ({
  isOpen,
  onClose,
  targetProfileId,
  targetCodename,
}) => {
  const { t, userAlbums, sendMediaChatMessage, registerAlbumSharedWith, chatMessages } = useVessel();

  const [activeTab, setActiveTab] = useState<"device" | "albums">("device");
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>("");
  const [selectedMediaType, setSelectedMediaType] = useState<"photo" | "video">("photo");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [mediaMode, setMediaMode] = useState<ChatMediaMode>("permanent");
  const [expiryMinutes, setExpiryMinutes] = useState<number>(15);

  // Album selection state
  const [selectedAlbum, setSelectedAlbum] = useState<UserAlbum | null>(null);
  const [selectedAlbumPhotos, setSelectedAlbumPhotos] = useState<string[]>([]);
  const [sendWholeAlbum, setSendWholeAlbum] = useState<boolean>(true);

  // Calcular las últimas fotos compartidas en los mensajes (o álbumes / presets si no hay suficientes)
  const recentSharedPhotos = useMemo(() => {
    const list: {
      id: string;
      url: string;
      badge: string;
      label: string;
      mediaType: "photo" | "video";
    }[] = [];
    const seenUrls = new Set<string>();

    // 1. Fotos enviadas por el usuario en cualquier chat
    if (chatMessages) {
      Object.values(chatMessages).forEach((thread) => {
        thread.forEach((msg) => {
          if (
            msg.senderId === "me" &&
            msg.mediaAttachment?.url &&
            !msg.isBurned &&
            msg.mediaAttachment.mediaType === "photo"
          ) {
            if (!seenUrls.has(msg.mediaAttachment.url)) {
              seenUrls.add(msg.mediaAttachment.url);
              list.push({
                id: msg.id,
                url: msg.mediaAttachment.url,
                badge: "ENVIADA",
                label: msg.mediaAttachment.caption || "Foto compartida en chat",
                mediaType: "photo",
              });
            }
          }
        });
      });
    }

    // 2. Fotos de álbumes del usuario
    userAlbums.forEach((album) => {
      album.photos.forEach((photo) => {
        if (!seenUrls.has(photo.url) && list.length < 3) {
          seenUrls.add(photo.url);
          list.push({
            id: photo.id,
            url: photo.url,
            badge: album.privacy === "private" ? "BÓVEDA" : "ÁLBUM",
            label: album.title,
            mediaType: "photo",
          });
        }
      });
    });

    // 3. Relleno con muestras de estudio si hay menos de 3
    SAMPLE_PHOTOS.forEach((sample) => {
      if (!seenUrls.has(sample.url) && list.length < 3) {
        seenUrls.add(sample.url);
        list.push(sample);
      }
    });

    return list.slice(0, 3);
  }, [chatMessages, userAlbums]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setSelectedMediaType(isVideo ? "video" : "photo");
    setSelectedSampleId(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedFileUrl(event.target.result as string);
        audioEngine.playPulse();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: {
    id: string;
    url: string;
    mediaType: "photo" | "video";
  }) => {
    setSelectedFileUrl(sample.url);
    setSelectedMediaType(sample.mediaType);
    setSelectedSampleId(sample.id);
    audioEngine.playPulse();
  };

  const handleClearSelectedMedia = () => {
    setSelectedFileUrl("");
    setSelectedSampleId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    audioEngine.playError();
  };

  const handleSend = () => {
    if (activeTab === "device") {
      if (!selectedFileUrl) return;

      const attachment: ChatMediaAttachment = {
        url: selectedFileUrl,
        mediaType: selectedMediaType,
        caption: caption.trim() || undefined,
        mode: mediaMode,
        isViewed: false,
        isBurned: false,
        expiresInMinutes: mediaMode === "timed_expiry" ? expiryMinutes : undefined,
        expiresAt:
          mediaMode === "timed_expiry"
            ? new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()
            : undefined,
      };

      sendMediaChatMessage(targetProfileId, attachment, caption.trim());
      audioEngine.playSuccess();
      onClose();
      resetForm();
    } else {
      // Send from albums
      if (!selectedAlbum) return;

      if (sendWholeAlbum) {
        const attachment: ChatMediaAttachment = {
          url: selectedAlbum.coverUrl || selectedAlbum.photos[0]?.url || "",
          mediaType: "photo",
          caption: caption.trim() || undefined,
          mode: mediaMode,
          sharedAlbumId: selectedAlbum.id,
          albumTitle: selectedAlbum.title,
          albumPhotoCount: selectedAlbum.photos.length,
          albumPrivacy: selectedAlbum.privacy,
          albumPhotosPreview: selectedAlbum.photos.slice(0, 4).map((p) => p.url),
        };

        sendMediaChatMessage(targetProfileId, attachment, caption.trim());
        registerAlbumSharedWith(selectedAlbum.id, targetProfileId);
        audioEngine.playSuccess();
        onClose();
        resetForm();
      } else if (selectedAlbumPhotos.length > 0) {
        // Send selected photos individually
        const cleanCaption = caption.trim();
        selectedAlbumPhotos.forEach((photoUrl) => {
          const attachment: ChatMediaAttachment = {
            url: photoUrl,
            mediaType: "photo",
            caption: cleanCaption || undefined,
            mode: mediaMode,
            isViewed: false,
            isBurned: false,
          };
          sendMediaChatMessage(targetProfileId, attachment, cleanCaption);
        });
        audioEngine.playSuccess();
        onClose();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setSelectedFileUrl("");
    setSelectedSampleId(null);
    setCaption("");
    setMediaMode("permanent");
    setSelectedAlbum(null);
    setSelectedAlbumPhotos([]);
    setSendWholeAlbum(true);
  };

  const isFormValid =
    (activeTab === "device" && !!selectedFileUrl) ||
    (activeTab === "albums" && !!selectedAlbum && (sendWholeAlbum || selectedAlbumPhotos.length > 0));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-media-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in p-0 sm:p-4 select-none"
    >
      <div
        className="w-full max-w-lg bg-obsidian-surface border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-card-elevation flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA TÁCTICA */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-obsidian-deep/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="send-media-modal-title"
                  className="text-xs font-mono font-bold tracking-widest text-white uppercase"
                >
                  {t.chat.sendMediaTitle}
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-electricViolet-glow border border-electricViolet/30 font-bold">
                  TRANSMIT
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DESTINATARIO: <strong className="text-electricViolet-glow font-bold">{targetCodename}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONMUTADOR SEGMENTADO DE PESTAÑAS */}
        <div className="p-2.5 border-b border-white/10 bg-obsidian-deep/60">
          <div className="bg-obsidian-card p-1 rounded-2xl border border-white/5 flex gap-1.5">
            <button
              onClick={() => {
                setActiveTab("device");
                audioEngine.playPulse();
              }}
              className={`flex-1 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "device"
                  ? "bg-white/10 text-electricViolet-glow border border-electricViolet/40 shadow-violet-soft"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              {t.chat.tabDevice}
            </button>
            <button
              onClick={() => {
                setActiveTab("albums");
                audioEngine.playPulse();
              }}
              className={`flex-1 py-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "albums"
                  ? "bg-white/10 text-electricViolet-glow border border-electricViolet/40 shadow-violet-soft"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <FolderLock className="w-4 h-4" />
              {t.chat.tabMyAlbums} ({userAlbums.length})
            </button>
          </div>
        </div>

        {/* CUERPO MODAL CON SCROLL FLUIDO */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* ============================================================ */}
          {/* TAB 1: SUBIDA DESDE DISPOSITIVO / CÁMARA */}
          {/* ============================================================ */}
          {activeTab === "device" && (
            <div className="space-y-4">
              {/* Dropzone / Preview de Archivo */}
              {!selectedFileUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  className="border border-dashed border-white/20 hover:border-electricViolet/70 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-obsidian-card/70 hover:bg-obsidian-card transition-all group shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-electricViolet/20 border border-white/10 group-hover:border-electricViolet/50 flex items-center justify-center text-neutral-400 group-hover:text-electricViolet-glow transition-all shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-mono font-bold text-white uppercase tracking-wider group-hover:text-electricViolet-glow transition-colors">
                      {t.chat.uploadOrPick}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      PNG, JPG, WEBP, MP4 // MÁX. 25MB
                    </p>
                  </div>
                  <div className="mt-1 px-3 py-1.5 rounded-full bg-white/5 group-hover:bg-electricViolet/15 border border-white/10 group-hover:border-electricViolet/30 text-[10px] font-mono font-bold text-neutral-300 group-hover:text-electricViolet-glow transition-colors flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>EXPLORAR / CÁMARA</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Previsualización del archivo cargado */
                <div className="relative rounded-2xl overflow-hidden border border-electricViolet/40 bg-black group shadow-card-elevation">
                  {selectedMediaType === "video" ? (
                    <video
                      src={selectedFileUrl}
                      controls
                      className="w-full max-h-56 object-cover bg-black"
                    />
                  ) : (
                    <img
                      src={selectedFileUrl}
                      alt="Vista previa de archivo seleccionado"
                      className="w-full max-h-56 object-cover bg-black"
                    />
                  )}
                  <button
                    onClick={handleClearSelectedMedia}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-obsidian-deep/90 hover:bg-bloodNeon text-white border border-white/10 hover:border-bloodNeon transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon"
                    title="Eliminar archivo seleccionado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-obsidian-deep/90 border border-white/15 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 backdrop-blur-md">
                    {selectedMediaType === "video" ? "📹 VIDEO MP4" : "📷 FOTO HD"}
                  </div>
                </div>
              )}

              {/* Grid de Últimas Fotos Compartidas en Mensajes */}
              {!selectedFileUrl && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-electricViolet-glow" />
                      // {t.chat.selectRecentPhotos}:
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {recentSharedPhotos.map((photo) => {
                      const isSelected = selectedSampleId === photo.id;
                      return (
                        <button
                          key={photo.id}
                          onClick={() => handleSelectSample(photo)}
                          className={`group relative rounded-2xl overflow-hidden border aspect-[3/4] transition-all cursor-pointer text-left ${
                            isSelected
                              ? "border-electricViolet ring-2 ring-electricViolet shadow-violet-soft scale-[1.02]"
                              : "border-white/10 hover:border-electricViolet/60 hover:scale-[1.02]"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-between p-2">
                            <span className="self-end px-1.5 py-0.5 rounded-lg bg-black/80 border border-white/15 text-[8px] font-mono font-bold text-electricViolet-glow uppercase shadow-sm">
                              {photo.badge}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-white line-clamp-2 leading-tight">
                              {photo.label.split("//")[0].trim()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: MIS ÁLBUMES DE LA BÓVEDA & GALERÍA */}
          {/* ============================================================ */}
          {activeTab === "albums" && (
            <div className="space-y-4">
              {userAlbums.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/15 rounded-2xl bg-obsidian-card/50 space-y-2">
                  <FolderLock className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-xs font-mono font-bold text-neutral-300 uppercase">
                    {t.chat.noAlbumsAvailable}
                  </p>
                </div>
              ) : !selectedAlbum ? (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
                    // SELECCIONÁ UN ÁLBUM PARA COMPARTIR:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userAlbums.map((album) => {
                      const cover = album.coverUrl || album.photos[0]?.url || "";
                      const isPrivate = album.privacy === "private";

                      return (
                        <button
                          key={album.id}
                          onClick={() => {
                            setSelectedAlbum(album);
                            setSelectedFileUrl(cover);
                            audioEngine.playPulse();
                          }}
                          className="flex gap-3 p-3 rounded-2xl border border-white/10 hover:border-electricViolet/60 bg-obsidian-card/60 hover:bg-obsidian-card transition-all text-left group cursor-pointer active:scale-[0.98]"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0 relative">
                            {cover ? (
                              <img
                                src={cover}
                                alt={album.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            {isPrivate && (
                              <div className="absolute top-1 left-1 p-1 rounded-md bg-black/90 text-purple-400 border border-purple-400/30">
                                <FolderLock className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="text-xs font-mono font-bold text-white truncate group-hover:text-electricViolet-glow transition-colors">
                              {album.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  isPrivate
                                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                                    : "bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30"
                                }`}
                              >
                                {isPrivate ? t.chat.privateVaultBadge : t.chat.publicAlbumBadge}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {album.photos.length} {t.chat.photosCount}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Configuración del Álbum Seleccionado */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-obsidian-card border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                        <img
                          src={selectedAlbum.coverUrl || selectedAlbum.photos[0]?.url || ""}
                          alt={selectedAlbum.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-mono font-bold text-white truncate">
                          {selectedAlbum.title}
                        </h4>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {selectedAlbum.photos.length} {t.chat.photosCount} •{" "}
                          {selectedAlbum.privacy === "private"
                            ? t.chat.privateVaultBadge
                            : t.chat.publicAlbumBadge}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAlbum(null);
                        setSelectedFileUrl("");
                        setSelectedAlbumPhotos([]);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase text-electricViolet-glow hover:bg-electricViolet/10 border border-electricViolet/30 transition-colors cursor-pointer flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>

                  {/* Conmutador: Enviar Álbum Completo vs Seleccionar Fotos */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSendWholeAlbum(true);
                        audioEngine.playPulse();
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                        sendWholeAlbum
                          ? "bg-white/10 text-electricViolet-glow border-electricViolet/50 shadow-violet-soft"
                          : "bg-obsidian-card text-neutral-400 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {t.chat.sendAlbumTitle}
                    </button>
                    <button
                      onClick={() => {
                        setSendWholeAlbum(false);
                        audioEngine.playPulse();
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                        !sendWholeAlbum
                          ? "bg-white/10 text-electricViolet-glow border-electricViolet/50 shadow-violet-soft"
                          : "bg-obsidian-card text-neutral-400 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {t.chat.sendSelectedPhotos}
                    </button>
                  </div>

                  {/* Cuadrícula de Selección Individual de Fotos */}
                  {!sendWholeAlbum && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-mono text-neutral-400">
                          {selectedAlbumPhotos.length} de {selectedAlbum.photos.length} seleccionadas
                        </span>
                        {selectedAlbumPhotos.length > 0 && (
                          <button
                            onClick={() => setSelectedAlbumPhotos([])}
                            className="text-[10px] font-mono text-neutral-400 hover:text-white"
                          >
                            Deseleccionar todas
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {selectedAlbum.photos.map((photo) => {
                          const isSelected = selectedAlbumPhotos.includes(photo.url);

                          return (
                            <button
                              key={photo.id}
                              onClick={() => {
                                setSelectedAlbumPhotos((prev) =>
                                  isSelected
                                    ? prev.filter((u) => u !== photo.url)
                                    : [...prev, photo.url]
                                );
                                audioEngine.playPulse();
                              }}
                              className={`relative rounded-xl overflow-hidden border aspect-square transition-all cursor-pointer ${
                                isSelected
                                  ? "border-electricViolet ring-2 ring-electricViolet shadow-violet-soft"
                                  : "border-white/10 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={photo.url}
                                alt="Foto de álbum"
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-electricViolet text-white flex items-center justify-center shadow-md">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* MATRIZ DE PRIVACIDAD & PERMANENCIA (CUATRICROMÁTICA) */}
          {/* ============================================================ */}
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
              // MODO DE VISUALIZACIÓN & PRIVACIDAD:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1. PERMANENTE (ESMERALDA) */}
              <button
                type="button"
                onClick={() => {
                  setMediaMode("permanent");
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] ${
                  mediaMode === "permanent"
                    ? "bg-emerald-950/35 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-obsidian-card border-white/5 text-neutral-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${mediaMode === "permanent" ? "text-emerald-400" : "text-neutral-400"}`}
                />
                <span className="text-[11px] font-mono font-bold uppercase">
                  {t.chat.modePermanent}
                </span>
                <span className="text-[9px] text-neutral-400 leading-tight">
                  {t.chat.modePermanentDesc}
                </span>
              </button>

              {/* 2. 1 SOLA VISTA (NEÓN SANGRE) */}
              <button
                type="button"
                onClick={() => {
                  setMediaMode("view_once");
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] ${
                  mediaMode === "view_once"
                    ? "bg-bloodNeon/20 border-bloodNeon/60 text-bloodNeon shadow-[0_0_15px_rgba(230,25,55,0.25)]"
                    : "bg-obsidian-card border-white/5 text-neutral-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <Flame
                  className={`w-4 h-4 ${mediaMode === "view_once" ? "text-bloodNeon animate-pulse" : "text-neutral-400"}`}
                />
                <span className="text-[11px] font-mono font-bold uppercase">
                  {t.chat.modeViewOnce}
                </span>
                <span className="text-[9px] text-neutral-400 leading-tight">
                  {t.chat.modeViewOnceDesc}
                </span>
              </button>

              {/* 3. DESENFOCADA (PÚRPURA TÁCTICO) */}
              <button
                type="button"
                onClick={() => {
                  setMediaMode("privacy_blur");
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] ${
                  mediaMode === "privacy_blur"
                    ? "bg-purple-950/35 border-purple-500/60 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.2)]"
                    : "bg-obsidian-card border-white/5 text-neutral-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <EyeOff
                  className={`w-4 h-4 ${mediaMode === "privacy_blur" ? "text-purple-400" : "text-neutral-400"}`}
                />
                <span className="text-[11px] font-mono font-bold uppercase">
                  {t.chat.modePrivacyBlur}
                </span>
                <span className="text-[9px] text-neutral-400 leading-tight">
                  {t.chat.modePrivacyBlurDesc}
                </span>
              </button>

              {/* 4. EXPIRACIÓN (CIAN TEMPORIZADO) */}
              <button
                type="button"
                onClick={() => {
                  setMediaMode("timed_expiry");
                  audioEngine.playPulse();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer select-none active:scale-[0.98] ${
                  mediaMode === "timed_expiry"
                    ? "bg-cyan-950/35 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-obsidian-card border-white/5 text-neutral-400 hover:border-white/15 hover:text-white"
                }`}
              >
                <Clock
                  className={`w-4 h-4 ${mediaMode === "timed_expiry" ? "text-cyan-400" : "text-neutral-400"}`}
                />
                <span className="text-[11px] font-mono font-bold uppercase">
                  {t.chat.modeTimedExpiry}
                </span>
                <span className="text-[9px] text-neutral-400 leading-tight">
                  {t.chat.modeTimedExpiryDesc}
                </span>
              </button>
            </div>

            {/* Selector de Tiempo si se elige Expiración */}
            {mediaMode === "timed_expiry" && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-cyan-500/20 animate-in fade-in">
                <span className="text-[10px] font-mono text-cyan-300 font-bold">EXPIRAR EN:</span>
                {[5, 15, 1440].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setExpiryMinutes(mins)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-bold border transition-colors cursor-pointer ${
                      expiryMinutes === mins
                        ? "bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-sm"
                        : "bg-obsidian-card text-neutral-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {mins === 5 ? t.chat.expiry5min : mins === 15 ? t.chat.expiry15min : t.chat.expiry24h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* EPÍGRAFE O MENSAJE ADJUNTO */}
          {/* ============================================================ */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
              // EPÍGRAFE O MENSAJE ADJUNTO (OPCIONAL):
            </span>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-neutral-500 pointer-events-none">
                <MessageSquare className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t.chat.captionPlaceholder}
                className="w-full bg-obsidian-card border border-white/10 focus:border-electricViolet rounded-2xl pl-9 pr-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* PIE DE MODAL ERGONÓMICO & STICKY */}
        <div className="p-4 border-t border-white/10 bg-obsidian-deep/95 backdrop-blur-md flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 text-xs font-mono uppercase transition-colors cursor-pointer min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isFormValid}
            className={`flex-1 py-3 px-5 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
              isFormValid
                ? "bg-electricViolet hover:bg-electricViolet-glow text-white shadow-violet-soft active:scale-[0.98]"
                : "opacity-30 cursor-not-allowed bg-white/5 text-neutral-500 border border-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t.chat.sendMediaButton}
          </button>
        </div>
      </div>
    </div>
  );
};
