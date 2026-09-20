"use client";

import React, { useState } from "react";
import { useVessel, FREE_TIER_LIMITS } from "@/context/VesselContext";
import { UserAlbum, AlbumPrivacy } from "@/types/vessel";
import { CreateAlbumModal } from "./CreateAlbumModal";
import { AlbumDetailModal } from "./AlbumDetailModal";
import {
  FolderLock,
  Globe,
  Lock,
  Plus,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Crown,
  Film,
  Image as ImageIcon,
  Zap,
  Shield,
  Star,
  Camera,
  Check,
  ShieldOff,
  Share2,
} from "lucide-react";

export const UserAlbumManager: React.FC = () => {
  const {
    userAlbums,
    userPlan,
    setUserPlan,
    myProfile,
    setProfileCoverPhoto,
    revokeAlbumAccessGlobally,
    unshareAlbumGlobally,
    getSharedChatIdsForAlbum,
  } = useVessel();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultPrivacy, setCreateDefaultPrivacy] = useState<AlbumPrivacy>("public");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [filterPrivacy, setFilterPrivacy] = useState<"all" | "public" | "private">("all");

  const isUnlimited = userPlan === "unlimited" || userPlan === "pro";
  const selectedAlbum = userAlbums.find((a) => a.id === selectedAlbumId) || null;

  const publicAlbums = userAlbums.filter((a) => a.privacy === "public");
  const privateAlbums = userAlbums.filter((a) => a.privacy === "private");

  const publicCount = publicAlbums.length;
  const privateCount = privateAlbums.length;

  const isPublicLimitReached =
    !isUnlimited && publicCount >= FREE_TIER_LIMITS.maxPublicAlbums;
  const isPrivateLimitReached =
    !isUnlimited && privateCount >= FREE_TIER_LIMITS.maxPrivateAlbums;
  const isAllLimitsReached = isPublicLimitReached && isPrivateLimitReached;

  const filteredList = userAlbums.filter((album) => {
    if (filterPrivacy === "public") return album.privacy === "public";
    if (filterPrivacy === "private") return album.privacy === "private";
    return true;
  });

  const handleOpenCreateModal = (privacy: AlbumPrivacy = "public") => {
    setCreateDefaultPrivacy(privacy);
    setIsCreateModalOpen(true);
  };

  const handleRevokeAlbumGlobally = (albumId: string, albumTitle: string) => {
    revokeAlbumAccessGlobally(albumId);
    unshareAlbumGlobally(albumId);
    setToastMessage(`Acceso a "${albumTitle}" revocado en todas las conversaciones.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/5 space-y-4 select-none">
      {/* Cabecera Principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Gestor de Álbumes // Media Vault</span>
              {isUnlimited && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-electricViolet text-white font-extrabold shadow-violet-soft">
                  UNLIMITED
                </span>
              )}
            </h3>
            <p className="text-[10px] text-neutral-400">
              {isUnlimited
                ? 'VESSEL UNLIMITED: "Álbumes públicos, privados y señales ilimitadas."'
                : "Plan Gratuito: 1 Álbum Público • 1 Álbum Privado (Nudes)"}
            </p>
          </div>
        </div>

        {/* Badge del Plan con toggle interactivo para testing */}
        <button
          type="button"
          onClick={() => setUserPlan(isUnlimited ? "free" : "unlimited")}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
            isUnlimited
              ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
              : "bg-white/5 border-white/15 text-neutral-300 hover:border-electricViolet/50"
          }`}
          title="Toca para alternar entre Plan Gratuito y VESSEL UNLIMITED"
        >
          {isUnlimited ? (
            <>
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Vessel Unlimited</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Plan Gratuito</span>
            </>
          )}
        </button>
      </div>

      {/* Sección Foto de Portada Principal */}
      {(() => {
        const allPhotos = userAlbums
          .flatMap((a) => a.photos)
          .filter((p) => p.mediaType !== "video");

        return (
          <div className="p-3.5 bg-black/60 border border-electricViolet/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-electricViolet/20 text-electricViolet-glow">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Foto Principal de Portada (Avatar en Cards)
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {allPhotos.length <= 1
                      ? "Asignada automáticamente al haber 1 sola foto"
                      : "Tocá una foto para seleccionarla como tu portada en las tarjetas y radar"}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-electricViolet/15 text-electricViolet-glow font-bold border border-electricViolet/30">
                {allPhotos.length} {allPhotos.length === 1 ? "foto disponible" : "fotos disponibles"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {allPhotos.length === 0 ? (
                <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Aún no cargaste fotos en tus álbumes. Creá o abrí tu álbum para añadir fotos.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (publicAlbums.length > 0) {
                        setSelectedAlbumId(publicAlbums[0].id);
                      } else {
                        handleOpenCreateModal("public");
                      }
                    }}
                    className="px-3 py-1.5 bg-electricViolet text-white rounded-xl font-bold text-[10px] uppercase font-mono flex items-center gap-1 cursor-pointer hover:bg-electricViolet-glow shadow-violet-soft transition-all whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Abrir Álbum</span>
                  </button>
                </div>
              ) : (
                allPhotos.map((photo) => {
                  const isCurrentCover = myProfile.avatarUrl === photo.url;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setProfileCoverPhoto(photo.url)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer group ${
                        isCurrentCover
                          ? "border-electricViolet shadow-violet-soft ring-2 ring-electricViolet/60 scale-105"
                          : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/40"
                      }`}
                      title={isCurrentCover ? "Foto de portada actual" : "Clic para establecer como portada"}
                    >
                      <img
                        src={photo.url}
                        alt="foto"
                        className="w-full h-full object-cover"
                      />
                      {isCurrentCover ? (
                        <div className="absolute inset-x-0 bottom-0 bg-electricViolet text-white py-0.5 text-[8px] font-mono font-black uppercase text-center flex items-center justify-center gap-0.5">
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
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Tarjetas de Cuotas / Estado del Plan */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Cuota Pública */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isPublicLimitReached
              ? "bg-black/60 border-white/10"
              : "bg-black/40 border-electricViolet/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
              <Globe className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>Público</span>
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isUnlimited
                  ? "bg-electricViolet/20 text-electricViolet-glow font-mono"
                  : isPublicLimitReached
                  ? "bg-neutral-800 text-neutral-400 border border-white/10"
                  : "bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30 font-mono"
              }`}
            >
              {isUnlimited
                ? `${publicCount} activos (Sin límite)`
                : `${publicCount}/${FREE_TIER_LIMITS.maxPublicAlbums}`}
            </span>
          </div>

          <div className="text-[10px] text-neutral-400">
            {isPublicLimitReached ? (
              <span className="text-neutral-500">Cuota 1/1 completada</span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreateModal("public")}
                className="text-electricViolet-glow font-bold hover:underline flex items-center gap-0.5 mt-0.5"
              >
                + Crear público
              </button>
            )}
          </div>
        </div>

        {/* Cuota Privada / Bóveda */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isPrivateLimitReached
              ? "bg-black/60 border-white/10"
              : "bg-black/40 border-bloodNeon/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-bloodNeon" />
              <span>Privado</span>
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                isUnlimited
                  ? "bg-bloodNeon/20 text-bloodNeon font-mono"
                  : isPrivateLimitReached
                  ? "bg-neutral-800 text-neutral-400 border border-white/10"
                  : "bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/30 font-mono"
              }`}
            >
              {isUnlimited
                ? `${privateCount} activos (Sin límite)`
                : `${privateCount}/${FREE_TIER_LIMITS.maxPrivateAlbums}`}
            </span>
          </div>

          <div className="text-[10px] text-neutral-400">
            {isPrivateLimitReached ? (
              <span className="text-neutral-500">Cuota 1/1 completada</span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreateModal("private")}
                className="text-bloodNeon font-bold hover:underline flex items-center gap-0.5 mt-0.5"
              >
                + Crear álbum privado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banner Promocional de VESSEL UNLIMITED cuando está en Plan Gratuito */}
      {!isUnlimited && (
        <div className="bg-gradient-to-br from-neutral-900 via-obsidian-surface to-black p-4 rounded-2xl border border-electricViolet/30 relative overflow-hidden space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-electricViolet/20 text-electricViolet-glow">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Desbloqueá VESSEL UNLIMITED
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30">
              ACCESO TOTAL
            </span>
          </div>

          <p className="text-[11px] text-neutral-300 italic">
            "Álbumes, nudes y señales ilimitadas."
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-300 pt-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-electricViolet-glow flex-shrink-0" />
              <span>Multi-Álbumes Ilimitados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Film className="w-3 h-3 text-bloodNeon flex-shrink-0" />
              <span>Clips de Video en HD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-electricViolet-glow flex-shrink-0" />
              <span>Llaves Granulares por Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-bloodNeon flex-shrink-0" />
              <span>Radar Táctico & Boost</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUserPlan("unlimited")}
            className="w-full py-3 bg-gradient-to-r from-electricViolet via-purple-500 to-electricViolet hover:from-purple-500 hover:to-electricViolet text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.6)] border border-purple-400/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-1"
          >
            <Crown className="w-4 h-4 fill-current animate-pulse text-amber-300" />
            <span>Activar Membresía Unlimited</span>
          </button>
        </div>
      )}

      {/* Filtros de Pestañas */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <div className="flex bg-black/60 p-0.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setFilterPrivacy("all")}
            aria-selected={filterPrivacy === "all"}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              filterPrivacy === "all"
                ? "bg-white/15 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Todos ({userAlbums.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterPrivacy("public")}
            aria-selected={filterPrivacy === "public"}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              filterPrivacy === "public"
                ? "bg-electricViolet text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Públicos ({publicCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterPrivacy("private")}
            aria-selected={filterPrivacy === "private"}
            className={`px-3 py-1.5 min-h-[38px] rounded-lg transition-all font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon ${
              filterPrivacy === "private"
                ? "bg-bloodNeon text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Privados ({privateCount})
          </button>
        </div>

        {/* Botón Crear Álbum */}
        <button
          type="button"
          onClick={() => handleOpenCreateModal(isPublicLimitReached ? "private" : "public")}
          disabled={isAllLimitsReached}
          aria-label="Crear nuevo álbum o bóveda"
          className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-95 ${
            isAllLimitsReached
              ? "bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed"
              : "bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft font-extrabold"
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nuevo Álbum</span>
        </button>
      </div>

      {/* Listado de Álbumes */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="p-6 text-center bg-black/40 rounded-2xl border border-white/5 space-y-2">
            <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-xs font-bold text-neutral-300">
              No hay álbumes creados en esta categoría
            </div>
            <p className="text-[10px] text-neutral-500">
              {isUnlimited
                ? "Crea álbumes temáticos ilimitados con fotos y videos desde tu celular o notebook."
                : "En la versión gratuita puedes crear hasta 1 álbum público y 1 álbum privado."}
            </p>
            <button
              type="button"
              onClick={() => handleOpenCreateModal(filterPrivacy === "private" ? "private" : "public")}
              className="mt-2 px-4 py-2 min-h-[40px] bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              + Crear Álbum
            </button>
          </div>
        ) : (
          filteredList.map((album) => {
            const isPrivate = album.privacy === "private";
            const videos = album.photos.filter((p) => p.mediaType === "video").length;
            const photos = album.photos.filter((p) => p.mediaType !== "video").length;
            const sharedChatIds = getSharedChatIdsForAlbum(album.id);
            const allSharedIds = Array.from(new Set([...(album.sharedWithProfileIds || []), ...sharedChatIds]));
            const sharedCount = allSharedIds.length;

            return (
              <div
                key={album.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAlbumId(album.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAlbumId(album.id);
                  }
                }}
                aria-label={`Abrir álbum ${album.title}`}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  isPrivate
                    ? "bg-black/50 border-bloodNeon/20 hover:border-bloodNeon/50"
                    : "bg-black/50 border-white/10 hover:border-electricViolet/50"
                }`}
              >
                {/* Portada */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 relative border border-white/10">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Layers className="w-6 h-6" />
                    </div>
                  )}

                  {/* Icono de Privacidad superpuesto */}
                  <div
                    className={`absolute top-1 left-1 p-1 rounded-md ${
                      isPrivate
                        ? "bg-black/80 text-bloodNeon"
                        : "bg-black/80 text-electricViolet-glow"
                    }`}
                  >
                    {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                  </div>
                </div>

                {/* Información del Álbum */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-white truncate">
                      {album.title}
                    </h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 ${
                        isPrivate
                          ? "bg-bloodNeon/20 text-bloodNeon"
                          : "bg-electricViolet/20 text-electricViolet-glow"
                      }`}
                    >
                      {isPrivate ? "Bóveda" : "Público"}
                    </span>
                    {sharedCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 flex items-center gap-1 font-mono">
                        <Share2 className="w-2.5 h-2.5" />
                        <span>Compartido ({sharedCount})</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {album.description || `${album.photos.length} medios protegidos`}
                  </p>

                  <div className="flex items-center gap-2 text-[9px] text-neutral-500 mt-1">
                    <span>
                      {photos > 0 && `${photos} foto${photos > 1 ? "s" : ""}`}
                      {photos > 0 && videos > 0 && " • "}
                      {videos > 0 && `${videos} video${videos > 1 ? "s" : ""}`}
                      {photos === 0 && videos === 0 && "0 medios"}
                    </span>
                    <span>•</span>
                    <span>{album.createdAt}</span>
                  </div>
                </div>

                {/* Botón de Revocar Globalmente & Flecha Chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {sharedCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevokeAlbumGlobally(album.id, album.title);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-bloodNeon/15 hover:bg-bloodNeon/30 border border-bloodNeon/40 text-bloodNeon font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Dejar de compartir este álbum con todos los usuarios"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Dejar de compartir con todos</span>
                      <span className="sm:hidden">Revocar</span>
                    </button>
                  )}
                  <div className="p-1.5 rounded-full text-neutral-500 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast de Notificación Táctica */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-obsidian-surface border border-bloodNeon/50 text-white rounded-2xl shadow-blood-glow flex items-center gap-2.5 font-mono text-xs animate-in fade-in slide-in-from-bottom-3">
          <ShieldOff className="w-4 h-4 text-bloodNeon flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modales */}
      {isCreateModalOpen && (
        <CreateAlbumModal
          defaultPrivacy={createDefaultPrivacy}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbumId(null)}
        />
      )}
    </div>
  );
};
