"use client";

import React, { useState, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { VesselProfile } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Users,
  X,
  Link as LinkIcon,
  Unlink,
  Search,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export const DuoLinkModal: React.FC = () => {
  const {
    isDuoModalOpen,
    closeDuoModal,
    myDuoLink,
    linkDuoPartner,
    unlinkDuoPartner,
    profiles,
    favoriteProfileIds,
    myProfile,
    language,
  } = useVessel();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<VesselProfile | null>(null);
  const [jointTitle, setJointTitle] = useState("");

  const favIds = favoriteProfileIds || [];

  // Perfiles candidatos (excluyendo al usuario propio)
  const candidateProfiles = useMemo(() => {
    return profiles.filter((p) => p.codename !== myProfile.codename);
  }, [profiles, myProfile.codename]);

  // Perfiles favoritos candidatos
  const favoriteCandidates = useMemo(() => {
    return candidateProfiles.filter((p) => favIds.includes(p.id));
  }, [candidateProfiles, favIds]);

  // Perfiles filtrados por búsqueda
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidateProfiles.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return candidateProfiles.filter(
      (p) =>
        p.codename.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.statement?.toLowerCase().includes(q)
    );
  }, [candidateProfiles, searchQuery]);

  if (!isDuoModalOpen) return null;

  const handleLink = () => {
    if (!selectedPartner) return;
    const finalTitle = jointTitle.trim() || `${myProfile.codename} & ${selectedPartner.codename}`;
    linkDuoPartner(selectedPartner, finalTitle);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo Dúo"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none [overscroll-behavior:contain]"
      onClick={closeDuoModal}
    >
      <div
        className="relative w-full max-w-md bg-obsidian-surface border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-card-elevation overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Header Táctico */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <span>{language === "es" ? "MODO DÚO // PAREJA VINCULADA" : "DUO MODE // PARTNER LINK"}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-electricViolet text-white font-extrabold shadow-violet-soft">
                  {myDuoLink?.isLinked ? "ACTIVO" : "DISPONIBLE"}
                </span>
              </h3>
              <p className="text-[10.5px] text-neutral-400 font-sans">
                {language === "es"
                  ? "Conexión transparente para parejas abiertas y vínculos éticos"
                  : "Transparent connection for open couples and ethical dynamics"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDuoModal}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal de pareja"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {myDuoLink?.isLinked ? (
            /* ESTADO 1: PAREJA ACTUALMENTE VINCULADA */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-electricViolet/40 space-y-3">
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="relative">
                    <img
                      src={myProfile.avatarUrl}
                      alt={myProfile.codename}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-electricViolet shadow-violet-glow"
                    />
                    <span className="absolute -bottom-1 -right-1 text-[9px] font-mono bg-electricViolet text-white font-black px-1.5 py-0.2 rounded-md">
                      VOS
                    </span>
                  </div>

                  <div className="p-2 rounded-full bg-electricViolet/30 text-electricViolet-glow border border-electricViolet/50 animate-pulse">
                    <LinkIcon className="w-4 h-4" />
                  </div>

                  <div className="relative">
                    <img
                      src={myDuoLink.partnerAvatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"}
                      alt={myDuoLink.partnerCodename || "Pareja"}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-electricViolet shadow-violet-glow"
                    />
                    <span className="absolute -bottom-1 -right-1 text-[9px] font-mono bg-electricViolet text-white font-black px-1.5 py-0.2 rounded-md">
                      PAREJA
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="font-mono text-sm font-bold text-white tracking-wide">
                    {myDuoLink.jointTitle || `${myProfile.codename} & ${myDuoLink.partnerCodename}`}
                  </h4>
                  <p className="text-xs text-neutral-400 font-sans">
                    Vinculado con <strong className="text-electricViolet-glow">@{myDuoLink.partnerCodename}</strong>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-electricViolet-glow font-mono font-bold text-[11px] uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Beneficios activos en la Matriz</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Tu perfil ahora muestra la insignia <strong className="text-white">👥 DÚO</strong> en las tarjetas de radar. Ambos pueden coordinar encuentros juntos y acceder a chats compartidos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  audioEngine.playError();
                  unlinkDuoPartner();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-bloodNeon/40 bg-bloodNeon/10 hover:bg-bloodNeon/20 text-bloodNeon font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Unlink className="w-4 h-4" />
                <span>Desvincular Modo Dúo</span>
              </button>
            </div>
          ) : (
            /* ESTADO 2: VINCULAR NUEVA PAREJA */
            <div className="space-y-4">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {language === "es"
                  ? "Vinculá tu perfil con tu pareja para buscar personas, tríos o citas compartidas. Ambos perfiles se mostrarán conectados en la Matriz."
                  : "Link your profile with your partner to find mutual dates, couples or threesomes."}
              </p>

              {/* Título de Pareja */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block">
                  {language === "es" ? "Nombre o Título Conjunto" : "Joint Title"}
                </label>
                <input
                  type="text"
                  value={jointTitle}
                  onChange={(e) => setJointTitle(e.target.value)}
                  placeholder={
                    selectedPartner
                      ? `${myProfile.codename} & ${selectedPartner.codename}`
                      : "Ej: Santi & Nico // Pareja Abierta"
                  }
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet"
                />
              </div>

              {/* Selector de Pareja */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block">
                  {language === "es" ? "Elegir Pareja" : "Select Partner"}
                </label>

                {/* Acceso Rápido desde Favoritos */}
                {favoriteCandidates.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Tus Favoritos (Acceso Rápido)</span>
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {favoriteCandidates.map((p) => {
                        const isSelected = selectedPartner?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              audioEngine.playPulse();
                              setSelectedPartner(p);
                            }}
                            className={`p-1.5 rounded-xl border flex items-center gap-2 flex-shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft"
                                : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                            }`}
                          >
                            <img
                              src={p.avatarUrl}
                              alt={p.codename}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="text-left font-mono pr-1">
                              <div className="text-xs font-bold text-white leading-tight">{p.codename}</div>
                              <div className="text-[9px] text-neutral-400">{p.role || "Perfil"}</div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-electricViolet-glow ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Buscador de Candidatos */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por apodo o bio..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet"
                  />
                </div>

                {/* Lista de Perfiles Candidatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredCandidates.map((p) => {
                    const isSelected = selectedPartner?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setSelectedPartner(p);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-electricViolet/20 border-electricViolet text-white shadow-violet-soft ring-1 ring-electricViolet"
                            : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                        }`}
                      >
                        <img
                          src={p.avatarUrl}
                          alt={p.codename}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white font-mono truncate">{p.codename}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{p.age} años • {p.role}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                disabled={!selectedPartner}
                onClick={handleLink}
                className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPartner
                    ? "bg-electricViolet hover:bg-electricViolet-glow text-white shadow-violet-soft active:scale-95"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {selectedPartner
                    ? `Vincular con @${selectedPartner.codename}`
                    : "Seleccioná una pareja para vincular"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
