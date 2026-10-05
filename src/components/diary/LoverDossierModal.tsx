"use client";

import React, { useState, useMemo, useRef } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { uploadAndEncryptVaultPhoto, VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
import {
  X,
  Star,
  Flame,
  Lock,
  Trash2,
  Plus,
  Zap,
  MessageCircle,
  Calendar,
  Sparkles,
  Camera,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const INTIMATE_BADGES = [
  { id: "chem_nuclear", label: "🔥 Química Nuclear", desc: "Atracción animal fuera de serie" },
  { id: "oral_god", label: "👑 Gran Sexo Oral", desc: "Técnica y entrega excepcional" },
  { id: "hot_kisses", label: "⚡ Besos Inolvidables", desc: "Conexión perfecta" },
  { id: "punctual", label: "🎯 Puntualidad Exacta", desc: "Llegó en el horario acordado" },
  { id: "impeccable_place", label: "🛋️ Lugar Impecable", desc: "Espacio limpio, toallas y buena onda" },
  { id: "kink_master", label: "⛓️ Maestro de Fetiches", desc: "Dominio absoluto del juego acordado" },
  { id: "post_cuddle", label: "🫂 Sobremesa y Mimos", desc: "Charla, ducha y trato digno" },
];

export const LoverDossierModal: React.FC = () => {
  const {
    isDossierModalOpen,
    closeLoverDossierModal,
    selectedDossierProfileId,
    getProfileDossier,
    saveProfileDossier,
    archivePhotosToDossier,
    removePhotoFromDossier,
    profiles,
    myProfile,
    chatMessages,
    userAlbums,
    unlockedVaults,
    setActiveChatProfileId,
    openCreateDiaryModal,
    diaryEntries,
    language,
    t,
  } = useVessel();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Perfil vinculado (por ID directo o por alias normalizado si fue agendado como externo)
  const linkedProfile = useMemo(() => {
    if (!selectedDossierProfileId) return undefined;
    const direct = profiles.find((p) => p.id === selectedDossierProfileId);
    if (direct) return direct;
    const normalizedAlias = selectedDossierProfileId.replace(/^ext-/, "").toLowerCase();
    return profiles.find((p) => p.codename.toLowerCase() === normalizedAlias);
  }, [profiles, selectedDossierProfileId]);

  // Encuentros históricos con esta persona
  const loverEncounters = useMemo(() => {
    if (!selectedDossierProfileId) return [];
    return diaryEntries.filter(
      (e) =>
        e.person.profileId === selectedDossierProfileId ||
        (linkedProfile && e.person.profileId === linkedProfile.id) ||
        (linkedProfile && e.person.codename.toLowerCase() === linkedProfile.codename.toLowerCase())
    );
  }, [diaryEntries, selectedDossierProfileId, linkedProfile]);

  // 1. Fotos enviadas en el Chat (tanto fotos comunes como álbumes enviados en la conversación)
  const availableChatPhotos = useMemo(() => {
    if (!selectedDossierProfileId) return [];
    const threadIds = Array.from(
      new Set([selectedDossierProfileId, linkedProfile?.id].filter(Boolean) as string[])
    );
    const items: { url: string; label: string }[] = [];
    const seen = new Set<string>();

    const addItem = (url: string | undefined, label: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({ url, label });
    };

    threadIds.forEach((tid) => {
      const msgs = chatMessages?.[tid] || [];
      msgs.forEach((m) => {
        if (m.isRevoked || m.mediaAttachment?.isRevoked) return;

        // Foto común enviada en el chat
        if (m.mediaUrl) {
          addItem(m.mediaUrl, "Chat");
        }
        if (m.mediaAttachment?.url && !m.mediaAttachment?.sharedAlbumId) {
          addItem(m.mediaAttachment.url, "Chat");
        }

        // Álbum público o privado enviado dentro del chat
        if (m.mediaAttachment?.albumPhotosPreview?.length) {
          const isPublicAlbum = m.mediaAttachment.albumPrivacy === "public";
          m.mediaAttachment.albumPhotosPreview.forEach((previewUrl) =>
            addItem(previewUrl, isPublicAlbum ? "Álbum Público Chat" : "Álbum en Chat")
          );
        } else if (m.mediaAttachment?.sharedAlbumId && m.mediaAttachment?.url) {
          addItem(m.mediaAttachment.url, "Álbum en Chat");
        }

        // Si se compartió un álbum propio o del contacto con ID referenciado
        if (m.mediaAttachment?.sharedAlbumId && userAlbums?.length) {
          const matchedAlbum = userAlbums.find((a) => a.id === m.mediaAttachment?.sharedAlbumId);
          matchedAlbum?.photos?.forEach((p) =>
            addItem(p.url, matchedAlbum.privacy === "public" ? "Álbum Público Chat" : "Álbum en Chat")
          );
        }
      });
    });

    return items;
  }, [chatMessages, selectedDossierProfileId, linkedProfile, userAlbums]);

  // 2. Fotos de Álbumes Públicos del Perfil (Galería pública, Avatar y Bóveda desbloqueada)
  const availablePublicAlbumPhotos = useMemo(() => {
    const items: { url: string; label: string }[] = [];
    const seen = new Set<string>(availableChatPhotos.map((c) => c.url));

    const addItem = (url: string | undefined, label: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      items.push({ url, label });
    };

    if (linkedProfile) {
      addItem(linkedProfile.avatarUrl, "Foto Perfil");
      (linkedProfile.galleryUrls || []).forEach((url, idx) =>
        addItem(url, `Álbum Público #${idx + 1}`)
      );

      // Si algún ítem del álbum del perfil está desbloqueado o accesible, incluirlo
      (linkedProfile.privateVault || []).forEach((v) => {
        if (v.isUnlocked || unlockedVaults?.[v.id] || unlockedVaults?.[linkedProfile.id]) {
          addItem(v.url, "Álbum Desbloqueado");
        }
      });
    }

    // Fotos adjuntas en citas previas con esta persona
    loverEncounters.forEach((enc) => {
      addItem(enc.person.avatarUrl, "Foto Cita");
      (enc.person.sharedPhotos || []).forEach((u) => addItem(u, "Foto Cita"));
      (enc.attachedPhotos || []).forEach((u) => addItem(u, "Foto Cita"));
    });

    return items;
  }, [linkedProfile, unlockedVaults, loverEncounters, availableChatPhotos]);

  // Dossier existente o inicial
  const dossier = useMemo(() => {
    if (!selectedDossierProfileId) return undefined;
    return getProfileDossier(selectedDossierProfileId);
  }, [getProfileDossier, selectedDossierProfileId]);

  // Estados locales de edición reactiva (Escala de Química 1 a 5 unificada)
  const normalizedInitChemistry = useMemo(() => {
    const raw = dossier?.chemistryLevel || 5;
    return raw > 5 ? Math.min(5, Math.max(1, Math.round(raw / 2))) : Math.min(5, Math.max(1, raw));
  }, [dossier?.chemistryLevel]);

  const [privateNotes, setPrivateNotes] = useState(dossier?.privateNotes || "");
  const [chemistryLevel, setChemistryLevel] = useState(normalizedInitChemistry);
  const [rating, setRating] = useState(dossier?.rating || 5);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(dossier?.badges || ["🔥 Química Nuclear"]);
  const [revealedPhotoUrl, setRevealedPhotoUrl] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState<boolean>(
    () => (dossier?.sharedPhotos?.length || 0) === 0
  );
  const [isEncryptingPhoto, setIsEncryptingPhoto] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  if (!isDossierModalOpen || !selectedDossierProfileId) return null;

  const codename = linkedProfile?.codename || dossier?.customAlias || "Amante VESSEL";
  const avatarUrl =
    linkedProfile?.avatarUrl ||
    (dossier?.sharedPhotos && dossier.sharedPhotos[0]) ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80";

  const sharedPhotos = dossier?.sharedPhotos || [];

  // Guardar cambios al vuelo
  const persistChanges = (updates: Record<string, unknown>) => {
    if (!selectedDossierProfileId) return;
    saveProfileDossier(selectedDossierProfileId, updates);
  };

  const handleToggleBadge = (badgeLabel: string) => {
    audioEngine.playPulse();
    const exists = selectedBadges.includes(badgeLabel);
    const next = exists
      ? selectedBadges.filter((b) => b !== badgeLabel)
      : [...selectedBadges, badgeLabel];
    setSelectedBadges(next);
    persistChanges({ badges: next });
  };

  const handleChemistryChange = (val: number) => {
    const clamped = Math.min(5, Math.max(1, val));
    setChemistryLevel(clamped);
    audioEngine.playSubBass(55 + clamped * 4);
    persistChanges({ chemistryLevel: clamped });
  };

  const handleRatingChange = (val: number) => {
    setRating(val);
    audioEngine.playPulse();
    persistChanges({ rating: val });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDossierProfileId) return;
    try {
      setIsEncryptingPhoto(true);
      const { encryptedPayload } = await uploadAndEncryptVaultPhoto(file, "local-sovereign-user");
      archivePhotosToDossier(selectedDossierProfileId, [encryptedPayload]);
      audioEngine.playSubBass(65);
      setIsAddingPhoto(false);
    } catch (err) {
      console.error("Error al cifrar y subir foto a la ficha:", err);
      audioEngine.playError();
    } finally {
      setIsEncryptingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lover-dossier-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none [overscroll-behavior:contain]"
      onClick={closeLoverDossierModal}
    >
      <div
        className="relative w-full max-w-2xl bg-obsidian-surface/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[88vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />
        {/* CABECERA TÁCTICA */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-obsidian to-obsidian-surface">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <VaultEncryptedImage
                src={avatarUrl}
                alt={codename}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-electricViolet/50 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-electricViolet text-white shadow-sm">
                <Flame className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="lover-dossier-title"
                  className="text-base sm:text-lg font-mono font-black text-white truncate"
                >
                  {codename}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40">
                  {t.diary?.tabLoversVault || "Agenda Íntima"}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {loverEncounters.length} encuentros registrados · Química {chemistryLevel}/5
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              closeLoverDossierModal();
            }}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar Ficha del Amante"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 no-scrollbar">
          {/* 1. BÓVEDA VISUAL DEL AMANTE (CIFRADA EN SERVIDOR AES-GCM 256) */}
          <div className="bg-black/50 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-950/40 text-electricViolet-glow border border-purple-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                      {t.diary?.loverVaultTitle || "Bóveda Visual del Amante"}
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-mintNeon/15 text-mintNeon border border-mintNeon/30 font-bold">
                      ☁️🔒 AES-256 SERVER
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {language === "es"
                      ? "Fotos cifradas en el servidor y protegidas (mantené presionado para ver)"
                      : "Server-encrypted photos protected with Hold to Reveal"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsAddingPhoto(!isAddingPhoto);
                }}
                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-electricViolet/20 hover:bg-electricViolet/30 text-electricViolet-glow border border-electricViolet/40 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Panel para subir fotos cifradas al servidor o archivar desde el chat */}
            {isAddingPhoto && (
              <div className="p-3.5 rounded-2xl bg-obsidian border border-electricViolet/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-mono text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-mintNeon shrink-0" />
                    <span>Cifrado extremo a extremo (AES-GCM 256 bits) en el servidor de VESSEL:</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isEncryptingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isEncryptingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cifrando y subiendo al servidor...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Subir Foto Cifrada desde Dispositivo</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* 1. Fotos enviadas en el Chat (comunes y álbumes compartidos en chat) */}
                {availableChatPhotos.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-electricViolet-glow flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>
                          {language === "es"
                            ? `Fotos y álbumes enviados en el chat (${availableChatPhotos.length}):`
                            : `Photos & albums sent in chat (${availableChatPhotos.length}):`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const unsaved = availableChatPhotos
                            .map((item) => item.url)
                            .filter((u) => !sharedPhotos.includes(u));
                          if (unsaved.length > 0 && selectedDossierProfileId) {
                            archivePhotosToDossier(selectedDossierProfileId, unsaved);
                            audioEngine.playSubBass(65);
                          }
                        }}
                        className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 transition-all cursor-pointer"
                      >
                        {language === "es" ? "+ Archivar todas del chat" : "+ Archive all chat photos"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {availableChatPhotos.map((item, i) => {
                        const alreadySaved = sharedPhotos.includes(item.url);
                        return (
                          <button
                            key={`chat-photo-${i}`}
                            type="button"
                            onClick={() => {
                              if (!selectedDossierProfileId) return;
                              if (alreadySaved) {
                                removePhotoFromDossier(selectedDossierProfileId, item.url);
                              } else {
                                archivePhotosToDossier(selectedDossierProfileId, [item.url]);
                              }
                              audioEngine.playPulse();
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                              alreadySaved
                                ? "border-mintNeon shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : "border-white/15 hover:border-electricViolet"
                            }`}
                          >
                            <VaultEncryptedImage
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono font-bold text-white uppercase">
                              {item.label}
                            </span>
                            <div
                              className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 ${
                                alreadySaved
                                  ? "bg-mintNeon text-obsidian-deep"
                                  : "bg-black/80 text-white border border-white/20"
                              }`}
                            >
                              {alreadySaved ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{language === "es" ? "En Bóveda" : "Saved"}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>{language === "es" ? "Agregar" : "Add"}</span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Fotos de Álbumes Públicos y Galería del Perfil */}
                {availablePublicAlbumPhotos.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {language === "es"
                            ? `Fotos de sus Álbumes Públicos y Perfil (${availablePublicAlbumPhotos.length}):`
                            : `Public Albums & Profile Photos (${availablePublicAlbumPhotos.length}):`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const unsaved = availablePublicAlbumPhotos
                            .map((item) => item.url)
                            .filter((u) => !sharedPhotos.includes(u));
                          if (unsaved.length > 0 && selectedDossierProfileId) {
                            archivePhotosToDossier(selectedDossierProfileId, unsaved);
                            audioEngine.playSubBass(65);
                          }
                        }}
                        className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 transition-all cursor-pointer"
                      >
                        {language === "es" ? "+ Archivar álbum público" : "+ Archive public album"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {availablePublicAlbumPhotos.map((item, i) => {
                        const alreadySaved = sharedPhotos.includes(item.url);
                        return (
                          <button
                            key={`public-photo-${i}`}
                            type="button"
                            onClick={() => {
                              if (!selectedDossierProfileId) return;
                              if (alreadySaved) {
                                removePhotoFromDossier(selectedDossierProfileId, item.url);
                              } else {
                                archivePhotosToDossier(selectedDossierProfileId, [item.url]);
                              }
                              audioEngine.playPulse();
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                              alreadySaved
                                ? "border-mintNeon shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : "border-white/15 hover:border-amber-400"
                            }`}
                          >
                            <VaultEncryptedImage
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono font-bold text-amber-200 uppercase">
                              {item.label}
                            </span>
                            <div
                              className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 ${
                                alreadySaved
                                  ? "bg-mintNeon text-obsidian-deep"
                                  : "bg-black/80 text-white border border-white/20"
                              }`}
                            >
                              {alreadySaved ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{language === "es" ? "En Bóveda" : "Saved"}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>{language === "es" ? "Agregar" : "Add"}</span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cuadrícula de fotos con Hold to Reveal */}
            {sharedPhotos.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/30 border border-dashed border-white/10 text-center space-y-1">
                <p className="text-xs font-mono text-neutral-400">
                  Sin fotos archivadas en esta ficha aún.
                </p>
                <p className="text-[10px] text-neutral-500">
                  Las fotos se cifran con AES-GCM 256 bits antes de guardarse en el servidor de la app.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {sharedPhotos.map((photoUrl, idx) => {
                    const isRevealed = revealedPhotoUrl === photoUrl;
                    const isConfirmingDelete = photoToDelete === photoUrl;
                    return (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer select-none"
                        onMouseDown={() => {
                          setRevealedPhotoUrl(photoUrl);
                          audioEngine.playSubBass(65);
                        }}
                        onMouseUp={() => setRevealedPhotoUrl(null)}
                        onMouseLeave={() => setRevealedPhotoUrl(null)}
                        onTouchStart={() => {
                          setRevealedPhotoUrl(photoUrl);
                          audioEngine.playSubBass(65);
                        }}
                        onTouchEnd={() => setRevealedPhotoUrl(null)}
                      >
                        <VaultEncryptedImage
                          src={photoUrl}
                          alt={`Recuerdo de ${codename}`}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isRevealed ? "blur-0 scale-105" : "blur-md opacity-80"
                          }`}
                        />
                        {!isRevealed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-black/30 pointer-events-none">
                            <Lock className="w-5 h-5 text-white/80 drop-shadow" />
                            <span className="text-[8px] font-mono text-white/70 uppercase tracking-widest mt-1">
                              {language === "es" ? "Mantener" : "Hold"}
                            </span>
                          </div>
                        )}
                        {/* Botón borrar foto accesible en mobile y desktop */}
                        {isConfirmingDelete ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-1.5 p-2 z-10"
                          >
                            <span className="text-[9px] font-mono font-bold text-red-300 text-center">
                              {language === "es" ? "¿Borrar foto?" : "Delete?"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  removePhotoFromDossier(selectedDossierProfileId, photoUrl);
                                  setPhotoToDelete(null);
                                  audioEngine.playPulse();
                                }}
                                className="px-2 py-1 rounded bg-red-500 text-white font-mono text-[10px] font-black cursor-pointer"
                              >
                                {language === "es" ? "Sí" : "Yes"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPhotoToDelete(null)}
                                className="px-2 py-1 rounded bg-white/15 text-neutral-200 font-mono text-[10px] font-bold cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoToDelete(photoUrl);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="absolute top-1.5 right-1.5 p-1.5 min-w-[28px] min-h-[28px] rounded-lg bg-black/75 hover:bg-bloodNeon/80 text-white/90 transition-opacity flex items-center justify-center"
                            title="Eliminar foto"
                            aria-label="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[10px] font-mono text-neutral-400 tracking-wider">
                  👆 {t.diary?.holdToRevealHint || (language === "es" ? "MANTENÉ PRESIONADO PARA REVELAR" : "HOLD TO REVEAL")}
                </p>
              </div>
            )}
          </div>

          {/* 2. TELEMETRÍA DE QUÍMICA & DESEMPEÑO (ESCALA UNIFICADA 1 A 5) */}
          <div className="bg-black/50 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-champagneGold" />
              <span>Dossier de Química Corporal & Satisfacción</span>
            </h3>

            {/* Slider de Química (1 a 5) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Química & Intensidad Carnal</span>
                </span>
                <span className="font-bold text-amber-400">{chemistryLevel} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={chemistryLevel}
                onChange={(e) => handleChemistryChange(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Calificación en Estrellas */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Valoración General</span>
                </span>
                <span className="font-bold text-amber-400">{rating} ★</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRatingChange(val)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex-1 flex justify-center ${
                      val <= rating
                        ? "bg-amber-400/20 border-amber-400/60 text-amber-400"
                        : "bg-white/5 border-white/10 text-neutral-500"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Medallas de desempeño íntimo */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono font-bold text-neutral-300 block">
                {t.diary?.topBadges || "Medallas de Desempeño Íntimo"}:
              </span>
              <div className="flex flex-wrap gap-2">
                {INTIMATE_BADGES.map((b) => {
                  const isSelected = selectedBadges.includes(b.label);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleToggleBadge(b.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. NOTAS PRIVADAS CONFIDENCIALES */}
          <div className="bg-black/50 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
              Notas Tácticas Secretas (Solo para vos)
            </h3>
            <textarea
              rows={3}
              value={privateNotes}
              onChange={(e) => {
                setPrivateNotes(e.target.value);
                persistChanges({ privateNotes: e.target.value });
              }}
              placeholder="Ej: Le gusta el juego con arnés, perfume Tom Ford, piso 14 en Palermo..."
              className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 text-neutral-200 font-mono text-xs focus:outline-none focus:border-electricViolet resize-none"
            />
          </div>

          {/* 4. BOTONERA DE REVANCHA */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-electricViolet/15 to-purple-950/40 border border-electricViolet/30 space-y-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electricViolet-glow animate-pulse" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {t.diary?.revanchaTactical || "Quiero la Revancha"}
              </h4>
            </div>
            <p className="text-[11px] font-mono text-neutral-300">
              {language === "es"
                ? "Coordiná un nuevo encuentro con este amante sin perder tiempo en el radar."
                : "Coordinate a new encounter with this lover without losing time on radar."}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  closeLoverDossierModal();
                  if (linkedProfile) {
                    setActiveChatProfileId(linkedProfile.id);
                  }
                }}
                className="py-2.5 px-3 min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Abrir Chat" : "Open Chat"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(70);
                  closeLoverDossierModal();
                  openCreateDiaryModal(selectedDossierProfileId);
                }}
                className="py-2.5 px-3 min-h-[44px] rounded-2xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-violet-soft"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.diary?.revanchaBtn || "Quiero la Revancha"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
