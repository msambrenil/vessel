"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  ChevronLeft,
  ChevronRight,
  FolderLock,
  FolderOpen,
  Camera,
  Film,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useVessel } from "@/context/VesselContext";
import { ChatMediaAttachment, UserAlbum } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { DrmBlackoutProtector } from "@/components/security/DrmBlackoutProtector";
import { SteganographicWatermark } from "@/components/security/SteganographicWatermark";

interface ChatMediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: ChatMediaAttachment;
  messageId: string;
  senderCodename: string;
  targetProfileId: string;
}

export const ChatMediaViewerModal: React.FC<ChatMediaViewerModalProps> = ({
  isOpen,
  onClose,
  media,
  messageId,
  senderCodename,
  targetProfileId,
}) => {
  const { userAlbums, burnMediaMessage, markMediaMessageAsViewed } = useVessel();

  // If viewing a shared album, resolve album object
  const sharedAlbum: UserAlbum | undefined = media.sharedAlbumId
    ? userAlbums.find((a) => a.id === media.sharedAlbumId)
    : undefined;

  const albumPhotos = sharedAlbum ? sharedAlbum.photos : [];
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState<number>(0);

  // View-once timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15);
  const [isDrmTriggered, setIsDrmTriggered] = useState<boolean>(false);
  const isViewOnce = media.mode === "view_once";
  const isPrivateMedia = isViewOnce || media.albumPrivacy === "private";

  // DRM Anti-Capture: Detección de atajos de captura, pérdida de foco y visibilidad
  useEffect(() => {
    if (!isOpen || !isPrivateMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5", "i", "I", "s", "S"].includes(e.key))
      ) {
        e.preventDefault();
        setIsDrmTriggered(true);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) setIsDrmTriggered(true);
    };

    const handleBlur = () => {
      setIsDrmTriggered(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isOpen, isPrivateMedia]);

  useEffect(() => {
    if (!isOpen) return;

    // Mark as viewed in context
    markMediaMessageAsViewed(targetProfileId, messageId);

    if (isViewOnce) {
      setRemainingSeconds(15);
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleBurnAndClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, isViewOnce]);

  if (!isOpen) return null;

  const handleBurnAndClose = () => {
    burnMediaMessage(targetProfileId, messageId);
    onClose();
  };

  const handleManualClose = () => {
    if (isViewOnce) {
      handleBurnAndClose();
    } else {
      onClose();
    }
  };

  // Determine current active display URL
  const activeUrl =
    sharedAlbum && albumPhotos.length > 0
      ? albumPhotos[currentAlbumIndex]?.url || media.url
      : media.url;

  const isVideo = media.mediaType === "video" && !media.sharedAlbumId;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-viewer-title"
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-between p-3 sm:p-5 backdrop-blur-2xl animate-fade-in select-none"
      onClick={handleManualClose}
    >
      {/* BARRA TÁCTICA SUPERIOR */}
      <div
        className="w-full max-w-4xl flex items-center justify-between py-2 px-3 rounded-2xl bg-obsidian-surface/90 border border-white/10 backdrop-blur-md z-10 shadow-card-elevation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isViewOnce ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon/50 text-bloodNeon shadow-blood-glow">
              <Flame className="w-4 h-4 animate-pulse text-bloodNeon" />
              <span
                id="media-viewer-title"
                className="text-xs font-mono font-bold tracking-widest uppercase"
              >
                VISTA ÚNICA // AUTODESTRUCCIÓN EN {remainingSeconds}s
              </span>
            </div>
          ) : media.sharedAlbumId ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 flex-shrink-0 shadow-violet-soft">
                {media.albumPrivacy === "private" ? (
                  <FolderLock className="w-4 h-4" />
                ) : (
                  <FolderOpen className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h4
                  id="media-viewer-title"
                  className="text-xs font-mono font-bold text-white uppercase truncate"
                >
                  {media.albumTitle || "Álbum Compartido"}
                </h4>
                <p className="text-[10px] font-mono text-neutral-400">
                  Foto {currentAlbumIndex + 1} de {albumPhotos.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/5 text-electricViolet-glow border border-white/10">
                {isVideo ? <Film className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </div>
              <span id="media-viewer-title" className="text-xs font-mono text-neutral-300">
                // TRANSMISIÓN DE: <strong className="text-electricViolet-glow font-bold">{senderCodename}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isViewOnce && (
            <button
              onClick={handleBurnAndClose}
              className="px-3.5 py-1.5 rounded-xl bg-bloodNeon hover:bg-bloodNeon-glow text-white border border-bloodNeon text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-blood-glow flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Flame className="w-3.5 h-3.5" />
              Quemar Ahora
            </button>
          )}
          <button
            onClick={handleManualClose}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            aria-label="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL DE VISUALIZACIÓN CINEMATOGRÁFICA */}
      <div
        className="relative w-full max-w-4xl flex-1 flex items-center justify-center py-4 select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {media.isRevoked ? (
          <div className="flex flex-col items-center justify-center p-8 bg-black/90 border border-bloodNeon/50 rounded-3xl max-w-md text-center space-y-4 shadow-blood-glow animate-fade-in">
            <div className="p-4 rounded-2xl bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/40">
              <FolderLock className="w-12 h-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Acceso Revocado // Bóveda Cerrada
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                El remitente ha dejado de compartir esta galería en esta conversación. Las fotos y videos ya no están disponibles.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualClose}
              className="px-5 py-2.5 rounded-xl bg-bloodNeon/20 hover:bg-bloodNeon/30 border border-bloodNeon/50 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cerrar Visor
            </button>
          </div>
        ) : isPrivateMedia ? (
          <DrmBlackoutProtector
            isActive={isOpen && isPrivateMedia}
            requireHoldToReveal={isViewOnce}
            className="max-h-[72vh] w-auto max-w-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/10"
          >
            {isVideo ? (
              <video
                src={activeUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[72vh] w-auto max-w-full rounded-2xl border border-white/10 shadow-card-elevation bg-black pointer-events-none select-none"
              />
            ) : (
              <img
                src={activeUrl}
                alt="Contenido Privado"
                className="max-h-[72vh] w-auto max-w-full object-contain pointer-events-none select-none"
              />
            )}
          </DrmBlackoutProtector>
        ) : (
          <div className="relative group max-h-[72vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-card-elevation">
            {isVideo ? (
              <video
                src={activeUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[72vh] w-auto max-w-full rounded-2xl border border-white/10 shadow-card-elevation bg-black pointer-events-none select-none"
              />
            ) : (
              <img
                src={activeUrl}
                alt="Contenido"
                className="max-h-[72vh] w-auto max-w-full object-contain pointer-events-none select-none"
              />
            )}
            {/* Escudo Esteganográfico Sutil */}
            <SteganographicWatermark
              ownerCodename={senderCodename}
              variant="subtle"
              showBadge={false}
            />
          </div>
        )}

        {/* Flechas de Navegación para Álbum */}
        {sharedAlbum && albumPhotos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAlbumIndex((prev) => (prev > 0 ? prev - 1 : albumPhotos.length - 1));
                audioEngine.playPulse();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-electricViolet text-white border border-white/20 hover:border-electricViolet transition-all shadow-2xl cursor-pointer active:scale-95 shadow-violet-soft"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAlbumIndex((prev) => (prev < albumPhotos.length - 1 ? prev + 1 : 0));
                audioEngine.playPulse();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/80 hover:bg-electricViolet text-white border border-white/20 hover:border-electricViolet transition-all shadow-2xl cursor-pointer active:scale-95 shadow-violet-soft"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* PIE DEL VISOR // BARRA DE PROGRESO Y TIRA DE MINIATURAS */}
      <div
        className="w-full max-w-4xl flex flex-col items-center gap-2.5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Epígrafe */}
        {media.caption && (
          <div className="px-4 py-2 rounded-2xl bg-obsidian-surface/90 border border-white/10 text-xs font-mono text-white max-w-md text-center backdrop-blur-md shadow-lg">
            "{media.caption}"
          </div>
        )}

        {/* Barra de progreso de autodestrucción */}
        {isViewOnce && (
          <div className="w-full max-w-md bg-black/80 rounded-full h-2 overflow-hidden border border-bloodNeon/40 p-0.5 shadow-blood-glow">
            <div
              className="bg-bloodNeon h-full rounded-full transition-all duration-1000 ease-linear shadow-sm"
              style={{ width: `${(remainingSeconds / 15) * 100}%` }}
            />
          </div>
        )}

        {/* Tira de Miniaturas para Álbum Compartido */}
        {sharedAlbum && albumPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto max-w-full p-2 bg-obsidian-surface/80 rounded-2xl border border-white/10 backdrop-blur-md custom-scrollbar">
            {albumPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => {
                  setCurrentAlbumIndex(idx);
                  audioEngine.playPulse();
                }}
                className={`w-12 h-12 rounded-xl overflow-hidden border flex-shrink-0 transition-all cursor-pointer ${
                  currentAlbumIndex === idx
                    ? "border-electricViolet ring-2 ring-electricViolet shadow-violet-soft scale-105"
                    : "border-white/10 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={photo.url} alt="Miniatura" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
