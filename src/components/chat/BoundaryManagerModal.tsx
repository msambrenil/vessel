"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  X,
  ShieldCheck,
  Ghost,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  AlertTriangle,
  RotateCcw,
  Sliders,
} from "lucide-react";
import {
  BOUNDARY_PROTOCOLS_CATALOG,
  BoundaryProtocolItem,
} from "@/data/energyCatalog";
import {
  BoundaryProtocolType,
  ChatBoundaryStatus,
  RadarBoundaryVisibility,
  UserBoundarySetting,
} from "@/types/vessel";
import { KIND_CLOSURE_MESSAGES } from "@/data/energyCatalog";

interface BoundaryManagerModalProps {
  profileId: string;
  onClose: () => void;
}

export const BoundaryManagerModal: React.FC<BoundaryManagerModalProps> = ({
  profileId,
  onClose,
}) => {
  const {
    profiles,
    getBoundaryForProfile,
    applyBoundaryProtocol,
    removeBoundaryProtocol,
    t,
  } = useVessel();

  const profile = profiles.find((p) => p.id === profileId);
  const existingBoundary = getBoundaryForProfile(profileId);

  const [activeTab, setActiveTab] = useState<"presets" | "custom">(
    existingBoundary?.protocol === "custom" ? "custom" : "presets"
  );

  // Estados para Protocolos 1-Tap
  const [selectedPresetId, setSelectedPresetId] = useState<BoundaryProtocolType>(
    existingBoundary?.protocol || "polite_archive"
  );
  const [selectedClosureMessage, setSelectedClosureMessage] = useState<string>(
    KIND_CLOSURE_MESSAGES[0].text
  );
  const [includeClosureMessage, setIncludeClosureMessage] = useState(true);

  // Estados para Matriz Personalizada (Custom)
  const [customChatStatus, setCustomChatStatus] = useState<ChatBoundaryStatus>(
    existingBoundary?.chatStatus || "readonly"
  );
  const [customPublicAlbums, setCustomPublicAlbums] = useState<boolean>(
    existingBoundary?.publicAlbumsVisible ?? true
  );
  const [customPrivateVaultRevoked, setCustomPrivateVaultRevoked] = useState<boolean>(
    existingBoundary?.privateVaultRevoked ?? true
  );
  const [customRadarVisibility, setCustomRadarVisibility] = useState<RadarBoundaryVisibility>(
    existingBoundary?.radarVisibility || "attenuated"
  );
  const [customReason, setCustomReason] = useState<string>(
    existingBoundary?.reason || ""
  );

  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!profile) return null;

  const handleApplyPreset = (preset: BoundaryProtocolItem) => {
    applyBoundaryProtocol(profileId, {
      protocol: preset.id,
      chatStatus: preset.chatStatus,
      publicAlbumsVisible: preset.publicAlbumsVisible,
      privateVaultRevoked: preset.privateVaultRevoked,
      radarVisibility: preset.radarVisibility,
      kindClosureMessageSent:
        preset.id === "polite_archive" && includeClosureMessage
          ? selectedClosureMessage
          : undefined,
      reason: `Protocolo ${preset.title}`,
    });

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleApplyCustom = () => {
    applyBoundaryProtocol(profileId, {
      protocol: "custom",
      chatStatus: customChatStatus,
      publicAlbumsVisible: customPublicAlbums,
      privateVaultRevoked: customPrivateVaultRevoked,
      radarVisibility: customRadarVisibility,
      reason: customReason.trim() || "Ajuste personalizado de límites",
    });

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRestoreConnection = () => {
    removeBoundaryProtocol(profileId);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.boundaries.modalTitle}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {t.boundaries.modalSub} — <strong>{profile.codename}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de gestión de límites"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner de Estado Existente si ya hay límite */}
        {existingBoundary && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protocolo Activo: {existingBoundary.protocol.toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-neutral-300 block">
                Chat: {existingBoundary.chatStatus} • Radar: {existingBoundary.radarVisibility} • Desde {existingBoundary.appliedAt}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRestoreConnection}
              aria-label={t.boundaries.restoreBtn}
              className="px-2.5 py-1.5 min-h-[36px] bg-white/10 hover:bg-mintNeon hover:text-obsidian-deep border border-white/15 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95"
              title={t.boundaries.restoreBtn}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.boundaries.restoreBtn.split(" ")[0]}</span>
            </button>
          </div>
        )}

        {/* Selector de Pestañas (Presets vs Custom) */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            aria-selected={activeTab === "presets"}
            className={`py-2.5 min-h-[44px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "presets"
                ? "bg-electricViolet text-white shadow-violet-soft font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Ghost className="w-3.5 h-3.5" />
            <span>{t.boundaries.tabPresets}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            aria-selected={activeTab === "custom"}
            className={`py-2.5 min-h-[44px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "custom"
                ? "bg-electricViolet text-white shadow-violet-soft font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.boundaries.tabCustom}</span>
          </button>
        </div>

        {/* PESTAÑA 1: PROTOCOLOS RÁPIDOS (1-TAP) */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Elegí cómo querés cerrar o pausar la charla. Cero desaparecer de la nada; se manejan reglas claras con respeto mutuo.
            </p>

            <div className="space-y-2">
              {BOUNDARY_PROTOCOLS_CATALOG.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPresetId(preset.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPresetId(preset.id);
                      }
                    }}
                    aria-label={`${preset.title}: ${preset.shortDesc}`}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                      isSelected
                        ? "bg-white/10 border-electricViolet ring-1 ring-electricViolet/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{preset.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {preset.title}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${preset.tagColor}`}>
                              {preset.badge}
                            </span>
                            {preset.karmaBonus && (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                                +{preset.karmaBonus} Karma
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-300 mt-0.5">
                            {preset.shortDesc}
                          </p>
                        </div>
                      </div>

                      <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {isSelected && <div className="w-2 h-2 rounded-full bg-electricViolet" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-400 mt-2 pl-7 italic">
                      "{preset.recommendedFor}"
                    </p>

                    {/* Opciones adicionales para Cierre Amable */}
                    {isSelected && preset.id === "polite_archive" && (
                      <div className="mt-3 pt-3 border-t border-white/10 pl-7 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-300">
                          <span>Enviar mensaje de salida amable:</span>
                          <input
                            type="checkbox"
                            checked={includeClosureMessage}
                            onChange={(e) => setIncludeClosureMessage(e.target.checked)}
                            className="rounded accent-electricViolet"
                          />
                        </div>

                        {includeClosureMessage && (
                          <div className="space-y-1">
                            <select
                              value={selectedClosureMessage}
                              onChange={(e) => setSelectedClosureMessage(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-[11px] p-2 focus:border-electricViolet"
                            >
                              {KIND_CLOSURE_MESSAGES.map((msg) => (
                                <option key={msg.id} value={msg.text} className="bg-obsidian">
                                  {msg.emoji} {msg.title}: "{msg.text.slice(0, 45)}..."
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const preset = BOUNDARY_PROTOCOLS_CATALOG.find((p) => p.id === selectedPresetId);
                if (preset) handleApplyPreset(preset);
              }}
              disabled={appliedSuccess}
              className="w-full py-3 bg-electricViolet text-white hover:bg-electricViolet-glow font-bold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft flex items-center justify-center gap-2 transition-all mt-3 font-mono cursor-pointer"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Protocolo Activado con Éxito</span>
                </>
              ) : (
                <span>Aplicar Protocolo de Cierre</span>
              )}
            </button>
          </div>
        )}

        {/* PESTAÑA 2: MATRIZ A MEDIDA (CUSTOM) */}
        {activeTab === "custom" && (
          <div className="space-y-4">
            {/* 1. Estado del Chat */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>Permisos del Canal de Chat</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "active", label: "Activo Normal", desc: "Permite nuevos mensajes" },
                  { id: "muted", label: "Silenciado", desc: "Sin notificaciones de 45Hz" },
                  { id: "readonly", label: "Solo Lectura", desc: "Conserva historial, bloquea nuevos" },
                  { id: "disconnected", label: "Desconectado", desc: "Canal bloqueado al 100%" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setCustomChatStatus(opt.id as ChatBoundaryStatus)}
                    aria-pressed={customChatStatus === opt.id}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      customChatStatus === opt.id
                        ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-bold shadow-violet-soft"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-neutral-400 block">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Álbumes Públicos y Bóveda Privada */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>Privacidad de Galería & Bóveda</span>
              </label>

              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Álbumes Públicos</span>
                    <span className="text-[10px] text-neutral-400 block">
                      Permitir que siga viendo tus fotos públicas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomPublicAlbums(!customPublicAlbums)}
                    aria-label={`Álbumes públicos: ${customPublicAlbums ? "Visibles" : "Ocultos"}`}
                    aria-pressed={customPublicAlbums}
                    className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
                      customPublicAlbums
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-white/10 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {customPublicAlbums ? "Visibles" : "Ocultos"}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="font-bold text-white block">Bóveda Privada</span>
                    <span className="text-[10px] text-neutral-400 block">
                      Revocar acceso y destruir llaves privadas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomPrivateVaultRevoked(!customPrivateVaultRevoked)}
                    aria-label={`Bóveda privada: ${customPrivateVaultRevoked ? "Revocada" : "Conservar Llave"}`}
                    aria-pressed={customPrivateVaultRevoked}
                    className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 ${
                      customPrivateVaultRevoked
                        ? "bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40"
                        : "bg-white/10 text-neutral-400 border border-white/10"
                    }`}
                  >
                    {customPrivateVaultRevoked ? "Revocada" : "Conservar Llave"}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Visibilidad en Radar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>Presencia en Radar & Matriz</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "normal", label: "Normal", desc: "Visibilidad total" },
                  { id: "attenuated", label: "Atenuado", desc: "Ghost-signal sutil" },
                  { id: "hidden", label: "Invisible", desc: "Fuera de radar" },
                ].map((vis) => (
                  <button
                    type="button"
                    key={vis.id}
                    onClick={() => setCustomRadarVisibility(vis.id as RadarBoundaryVisibility)}
                    aria-pressed={customRadarVisibility === vis.id}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                      customRadarVisibility === vis.id
                        ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-bold shadow-violet-soft"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-xs font-bold">{vis.label}</span>
                    <span className="text-[9px] text-neutral-400 block">{vis.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo Opcional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Motivo / Nota Confidencial (Solo para ti)
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Ej: Incompatibilidad de horarios, falta de química..."
                className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs px-3 py-2.5 placeholder:text-neutral-500 focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyCustom}
              disabled={appliedSuccess}
              className="w-full py-3.5 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Matriz de Límites Guardada</span>
                </>
              ) : (
                <span>Guardar Ajustes Personalizados</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
