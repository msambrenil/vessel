"use client";

import React, { useState, useEffect } from "react";
import { PrivateVaultItem } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { Lock, Eye, Clock, ShieldAlert, X, Film, Volume2, VolumeX } from "lucide-react";
import { DrmBlackoutProtector } from "@/components/security/DrmBlackoutProtector";

interface PrivateVaultProps {
  items: PrivateVaultItem[];
  profileCodename: string;
  isOwner?: boolean;
}

export const PrivateVault: React.FC<PrivateVaultProps> = ({
  items,
  profileCodename,
  isOwner = false,
}) => {
  const { unlockedVaults, unlockVault } = useVessel();
  const [activeItem, setActiveItem] = useState<PrivateVaultItem | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [isViewing, setIsViewing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDrmTriggered, setIsDrmTriggered] = useState(false);

  const handleUnlock = (item: PrivateVaultItem) => {
    if (!isOwner) {
      unlockVault(item.id);
    }
    setActiveItem(item);
    setIsViewing(true);
    setIsDrmTriggered(false);
    if (!isOwner) {
      setCountdown(item.durationSeconds ? Math.max(10, item.durationSeconds) : 10);
    }
  };

  // DRM Anti-Capture: Detección de atajos de captura, pérdida de foco y cambios de visibilidad
  useEffect(() => {
    if (!isViewing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detección de PrintScreen, Cmd+Shift+3/4 en Mac, Ctrl+Shift+I
      if (
        e.key === "PrintScreen" ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5", "i", "I", "s", "S"].includes(e.key))
      ) {
        e.preventDefault();
        setIsDrmTriggered(true);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsDrmTriggered(true);
      }
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
  }, [isViewing]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isOwner && isViewing && !isDrmTriggered && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (!isOwner && countdown === 0) {
      setIsViewing(false);
      setActiveItem(null);
    }
    return () => clearTimeout(timer);
  }, [isOwner, isViewing, isDrmTriggered, countdown]);

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 select-none space-y-3 shadow-card-elevation">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-bloodNeon/15 text-bloodNeon">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Álbum Privado ({items.length})
            </div>
            <div className="text-[10px] text-neutral-400">
              {isOwner
                ? "Tus fotos y videos de bóveda privada · Acceso permanente de propietario"
                : "Fotos y videos protegidos con temporizador de visualización"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => {
          const isAccessible = isOwner || unlockedVaults[item.id];
          const isVideo = item.mediaType === "video";

          return (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl bg-black border border-white/10 group overflow-hidden"
            >
              {isVideo && isAccessible ? (
                <video
                  src={item.url}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={isAccessible ? item.url : item.blurredUrl}
                  alt={item.caption}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isOwner
                      ? "scale-100 group-hover:scale-105"
                      : isAccessible
                      ? "blur-[6px] scale-105"
                      : "blur-xl scale-110 grayscale"
                  }`}
                />
              )}

              {isVideo && (
                <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[8px] font-mono text-bloodNeon flex items-center gap-1">
                  <Film className="w-2.5 h-2.5" />
                  <span>VIDEO</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => handleUnlock(item)}
                    aria-label="Ver archivo en pantalla completa"
                    className="px-4 py-2.5 min-h-[40px] bg-bloodNeon text-white font-extrabold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5 hover:bg-bloodNeon/80 shadow-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                ) : isAccessible ? (
                  <button
                    type="button"
                    onClick={() => handleUnlock(item)}
                    aria-label={`Ver archivo desbloqueado por ${item.durationSeconds || 10} segundos`}
                    className="px-4 py-2.5 min-h-[40px] bg-electricViolet text-white font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5 hover:bg-electricViolet-glow shadow-violet-soft transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver ({item.durationSeconds || 10}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnlock(item)}
                    aria-label="Desbloquear foto o video de bóveda privada"
                    className="px-4 py-2.5 min-h-[40px] bg-white/10 hover:bg-bloodNeon text-white border border-white/20 hover:border-bloodNeon rounded-full font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-bloodNeon group-hover:text-white" />
                    <span>Desbloquear</span>
                  </button>
                )}
                <span className="text-[10px] text-neutral-400 mt-2 line-clamp-1">
                  {item.caption}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de visualización */}
      {isViewing && activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none"
          onClick={() => {
            setIsViewing(false);
            setActiveItem(null);
          }}
        >
          <div
            className="relative max-w-sm w-full bg-obsidian-surface border border-white/10 rounded-2xl p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-400">
                BÓVEDA PRIVADA // {activeItem.mediaType === "video" ? "VIDEO" : "FOTO"}
              </span>
              <div className="flex items-center gap-2">
                {countdown !== null && (
                  <div className="flex items-center gap-1 bg-bloodNeon/20 border border-bloodNeon/40 px-2 py-0.5 rounded text-bloodNeon font-mono text-xs font-bold animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>{countdown}s</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsViewing(false);
                    setActiveItem(null);
                  }}
                  aria-label="Cerrar visor"
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <DrmBlackoutProtector
              isActive={isViewing}
              requireHoldToReveal={!isOwner}
              className="aspect-[4/5] rounded-xl mb-3"
            >
              {activeItem.mediaType === "video" ? (
                <div className="relative w-full h-full">
                  <video
                    src={activeItem.url}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <img
                  src={activeItem.url}
                  alt={activeItem.caption}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </DrmBlackoutProtector>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium truncate">
                {activeItem.caption || "Sin descripción"}
              </span>
              <span className="text-[10px] text-bloodNeon font-mono font-bold flex-shrink-0 ml-2">
                {isOwner ? "Visualización Permanente" : "🔒 Vista Única Protegida"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
