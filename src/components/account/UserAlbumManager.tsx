"use client";

import React, { useState } from "react";
import { useSettings, useChat, FREE_TIER_LIMITS } from "@/context/VesselContext";
import { AlbumPrivacy } from "@/types/vessel";
import { formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import { CreateAlbumModal } from "./CreateAlbumModal";
import { AlbumDetailModal } from "./AlbumDetailModal";
import {
  FolderLock,
  Globe,
  Lock,
  Plus,
  Layers,
  ChevronRight,
  Crown,
  ShieldCheck,
  ShieldOff,
  Share2,
  Sparkles,
} from "lucide-react";
import {
  BrutalistButton,
  SegmentedTabGroup,
  SegmentedTabItem,
  TacticalBadge,
  TacticalMorphingLock,
} from "@/components/ui";


type FilterPrivacy = "all" | "public" | "private";

export const UserAlbumManager: React.FC = () => {
  const {
    userAlbums,
    userPlan,
    openUnlimitedModal,
    unshareAlbumGlobally,
    language,
  } = useSettings();
  const {
    revokeAlbumAccessGlobally,
    getSharedChatIdsForAlbum,
  } = useChat();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultPrivacy, setCreateDefaultPrivacy] = useState<AlbumPrivacy>("public");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [filterPrivacy, setFilterPrivacy] = useState<FilterPrivacy>("all");

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
    setToastMessage(`Llaves de acceso a "${albumTitle}" revocadas en todos los chats.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filterTabs: SegmentedTabItem<FilterPrivacy>[] = [
    {
      id: "all",
      label: language === "es" ? `Todos (${userAlbums.length})` : `All (${userAlbums.length})`,
    },
    {
      id: "public",
      label: language === "es" ? `Públicos (${publicCount})` : `Public (${publicCount})`,
    },
    {
      id: "private",
      label: language === "es" ? `Con Llave (${privateCount})` : `Key-Locked (${privateCount})`,
    },
  ];

  return (
    <div className="bg-obsidian-surface rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 select-none shadow-card-elevation backdrop-blur-md animate-fade-in">
      {/* =========================================================================
          1. CABECERA PRINCIPAL (GESTOR DE ÁLBUMES)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <span>{language === "es" ? "Tus Álbumes" : "Your Albums"}</span>
              {isUnlimited && (
                <TacticalBadge variant="violet" size="sm">
                  TOTAL
                </TacticalBadge>
              )}
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
              {isUnlimited
                ? (language === "es"
                    ? "VESSEL TOTAL: Álbumes públicos, fotos con llave y señales ilimitadas"
                    : "VESSEL TOTAL: Unlimited public and private albums")
                : (language === "es"
                    ? "Plan Gratuito: 1 Álbum Público • 1 Álbum con Llave"
                    : "Free Plan: 1 Public Album • 1 Key-Locked Album")}
            </p>
          </div>
        </div>

        {/* Badge del Plan */}
        <TacticalBadge variant={isUnlimited ? "violet" : "neutral"} size="sm">
          {isUnlimited ? (
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current text-amber-300" />
              <span>Total</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-neutral-400" />
              <span>Gratuito</span>
            </span>
          )}
        </TacticalBadge>
      </div>

      {/* =========================================================================
          2. TARJETAS DE CUOTAS COMPACTAS
          ========================================================================= */}
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
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold font-mono">
              <Globe className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{language === "es" ? "Públicos" : "Public"}</span>
            </div>
            <TacticalBadge
              variant={isUnlimited ? "violet" : isPublicLimitReached ? "neutral" : "cyan"}
              size="sm"
            >
              {isUnlimited
                ? `${publicCount}`
                : `${publicCount}/${FREE_TIER_LIMITS.maxPublicAlbums}`}
            </TacticalBadge>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono">
            {isPublicLimitReached ? (
              <span className="text-neutral-500">
                {language === "es" ? "Cuota completada" : "Quota reached"}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreateModal("public")}
                className="text-electricViolet-glow font-bold hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
              >
                + {language === "es" ? "Crear público" : "Create public"}
              </button>
            )}
          </div>
        </div>

        {/* Cuota Privada (Con Llave) */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            isPrivateLimitReached
              ? "bg-black/60 border-white/10"
              : "bg-black/40 border-bloodNeon/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold font-mono">
              <TacticalMorphingLock isLocked={true} size="sm" variant="blood" soundEffect={false} />
              <span>{language === "es" ? "Con Llave" : "Locked"}</span>
            </div>

            <TacticalBadge
              variant={isUnlimited ? "blood" : isPrivateLimitReached ? "neutral" : "blood"}
              size="sm"
            >
              {isUnlimited
                ? `${privateCount}`
                : `${privateCount}/${FREE_TIER_LIMITS.maxPrivateAlbums}`}
            </TacticalBadge>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono">
            {isPrivateLimitReached ? (
              <span className="text-neutral-500">
                {language === "es" ? "Cuota completada" : "Quota reached"}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenCreateModal("private")}
                className="text-bloodNeon font-bold hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
              >
                + {language === "es" ? "Crear con llave" : "Create locked"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. BANNER COMPACTO DE MEMBRESÍA (PLAN GRATUITO)
          ========================================================================= */}
      {!isUnlimited && (
        <div className="p-3 bg-gradient-to-r from-purple-950/40 via-black/60 to-purple-950/40 border border-electricViolet/30 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-electricViolet/20 text-electricViolet-glow flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-mono font-bold text-white truncate">
                {language === "es" ? "Membresía Vessel Total" : "Vessel Total Membership"}
              </h4>
              <p className="text-[10px] text-neutral-400 font-mono truncate">
                {language === "es"
                  ? "Álbumes temáticos ilimitados y llaves por chat"
                  : "Unlimited albums and per-chat keys"}
              </p>
            </div>
          </div>

          <BrutalistButton
            variant="primary"
            size="sm"
            onClick={() => openUnlimitedModal()}
            className="flex-shrink-0 text-[10px] h-8 px-2.5 shadow-violet-soft"
          >
            <Crown className="w-3 h-3 mr-1 text-amber-300" />
            <span>{language === "es" ? "Mejorar" : "Upgrade"}</span>
          </BrutalistButton>
        </div>
      )}

      {/* =========================================================================
          4. BARRA DE FILTROS & CREAR ÁLBUM (DESIGN SYSTEM STANDARDS)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <SegmentedTabGroup<FilterPrivacy>
          tabs={filterTabs}
          activeTab={filterPrivacy}
          onChange={setFilterPrivacy}
          size="default"
          className="w-full sm:w-auto"
        />

        <BrutalistButton
          variant="primary"
          size="sm"
          onClick={() => handleOpenCreateModal(isPublicLimitReached ? "private" : "public")}
          disabled={isAllLimitsReached}
          className="w-full sm:w-auto min-h-[40px] text-xs font-mono font-bold uppercase shadow-violet-soft"
        >
          <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" />
          <span>{language === "es" ? "Nuevo Álbum" : "New Album"}</span>
        </BrutalistButton>
      </div>

      {/* =========================================================================
          5. LISTADO DE ÁLBUMES
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredList.length === 0 ? (
          <div className="p-6 text-center bg-black/40 rounded-2xl border border-white/5 space-y-2.5 md:col-span-2">
            <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-xs font-mono font-bold text-neutral-300">
              {language === "es"
                ? "No tenés álbumes en esta categoría"
                : "No albums found in this category"}
            </div>
            <p className="text-[10px] text-neutral-500 font-mono max-w-sm mx-auto">
              {isUnlimited
                ? (language === "es"
                    ? "Creá álbumes temáticos con fotos y videos desde tu galería o cámara."
                    : "Create thematic albums with photos and videos from your gallery.")
                : (language === "es"
                    ? "En el plan gratuito podés crear 1 álbum público y 1 álbum con llave."
                    : "On the free plan you can create 1 public album and 1 key-locked album.")}
            </p>
            <BrutalistButton
              variant="secondary"
              size="sm"
              onClick={() =>
                handleOpenCreateModal(filterPrivacy === "private" ? "private" : "public")
              }
              className="mt-1"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{language === "es" ? "Crear Álbum" : "Create Album"}</span>
            </BrutalistButton>
          </div>
        ) : (
          filteredList.map((album) => {
            const isPrivate = album.privacy === "private";
            const videos = album.photos.filter((p) => p.mediaType === "video").length;
            const photos = album.photos.filter((p) => p.mediaType !== "video").length;
            const sharedChatIds = getSharedChatIdsForAlbum(album.id);
            const allSharedIds = Array.from(
              new Set([...(album.sharedWithProfileIds || []), ...sharedChatIds])
            );
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
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.99] select-none ${
                  isPrivate
                    ? "bg-black/50 border-bloodNeon/25 hover:border-bloodNeon/50 hover:bg-black/70"
                    : "bg-black/50 border-white/10 hover:border-electricViolet/50 hover:bg-black/70"
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
                        ? "bg-black/85 text-bloodNeon"
                        : "bg-black/85 text-electricViolet-glow"
                    }`}
                  >
                    {isPrivate ? (
                      <TacticalMorphingLock isLocked={true} size="sm" variant="blood" soundEffect={false} />
                    ) : (
                      <Globe className="w-2.5 h-2.5" />
                    )}

                  </div>
                </div>

                {/* Información del Álbum */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-mono font-bold text-white truncate">
                      {album.title}
                    </h4>
                    <TacticalBadge variant={isPrivate ? "blood" : "violet"} size="sm">
                      {isPrivate
                        ? (language === "es" ? "Con Llave" : "Locked")
                        : (language === "es" ? "Público" : "Public")}
                    </TacticalBadge>
                    {sharedCount > 0 && (
                      <TacticalBadge variant="cyan" size="sm">
                        <span className="flex items-center gap-1 font-mono">
                          <Share2 className="w-2.5 h-2.5" />
                          <span>{language === "es" ? `Compartido (${sharedCount})` : `Shared (${sharedCount})`}</span>
                        </span>
                      </TacticalBadge>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">
                    {album.description || `${album.photos.length} fotos y videos guardados`}
                  </p>

                  <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono mt-1">
                    <span>
                      {photos > 0 && `${photos} foto${photos > 1 ? "s" : ""}`}
                      {photos > 0 && videos > 0 && " • "}
                      {videos > 0 && `${videos} video${videos > 1 ? "s" : ""}`}
                      {photos === 0 && videos === 0 && (language === "es" ? "Vacío" : "Empty")}
                    </span>
                    <span>•</span>
                    <span>{formatDiaryDateDisplay(album.createdAt, language)}</span>
                  </div>
                </div>

                {/* Botón de Revocar Globalmente & Flecha Chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {sharedCount > 0 && (
                    <BrutalistButton
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevokeAlbumGlobally(album.id, album.title);
                      }}
                      className="text-[9px] h-7 px-2"
                      title={language === "es" ? "Dejar de compartir este álbum con todos" : "Revoke sharing"}
                    >
                      <ShieldOff className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">
                        {language === "es" ? "Revocar llaves" : "Revoke"}
                      </span>
                    </BrutalistButton>
                  )}
                  <div className="p-1 rounded-full text-neutral-500 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast Táctico */}
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
