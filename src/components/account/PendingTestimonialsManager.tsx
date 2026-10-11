"use client";

import React, { useState } from "react";
import { useDiary, useAuth, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import {
  MessageSquareHeart,
  Check,
  X,
  ShieldCheck,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { SegmentedTabGroup, SegmentedTabItem, BrutalistButton } from "@/components/ui";

export const PendingTestimonialsManager: React.FC = () => {
  const {
    myReceivedTestimonials,
    approveTestimonial,
    hideTestimonial,
    toggleTestimonialVisibility,
    rejectTestimonial,
  } = useDiary();
  const { myProfile } = useAuth();
  const { t, language } = useSettings();

  const [tab, setTab] = useState<"pending" | "approved" | "hidden">("pending");

  const pendingList = myReceivedTestimonials.filter((t) => t.status === "pending");
  const approvedList = myReceivedTestimonials.filter((t) => t.status === "approved");
  const hiddenList = myReceivedTestimonials.filter((t) => t.status === "hidden");

  const totalVerifiedEncounters = Math.max(
    myProfile.totalEncountersVerified || 0,
    approvedList.length + hiddenList.length
  );

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/5 space-y-4 select-none">
      {/* Cabecera & Métricas de Doble Consentimiento */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Testimonios & Doble Consentimiento
              </h3>
              <p className="text-[10px] text-neutral-400">
                Visibilidad Selectiva • Carta de Presentación Real
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-mintNeon bg-mintNeon/15 border border-mintNeon/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-mint-glow">
            <CheckCircle2 className="w-3 h-3" />
            <span>{totalVerifiedEncounters} Verificados</span>
          </span>
        </div>

        {/* Resumen de Contadores */}
        <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-xl p-2 border border-white/5 text-center text-xs">
          <div>
            <span className="text-sm font-extrabold text-white font-mono block">
              {totalVerifiedEncounters}
            </span>
            <span className="text-[9px] text-neutral-400 uppercase">Total Verificados</span>
          </div>
          <div className="border-x border-white/5">
            <span className="text-sm font-extrabold text-electricViolet-glow font-mono block">
              {approvedList.length}
            </span>
            <span className="text-[9px] text-neutral-400 uppercase">Públicos</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-neutral-300 font-mono block">
              {hiddenList.length}
            </span>
            <span className="text-[9px] text-neutral-400 uppercase">Ocultos</span>
          </div>
        </div>

        {/* Selector de Pestañas con SegmentedTabGroup */}
        <SegmentedTabGroup<"pending" | "approved" | "hidden">
          tabs={[
            {
              id: "pending",
              label: "Pendientes",
              badge:
                pendingList.length > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-electricViolet text-white font-bold ml-1">
                    {pendingList.length}
                  </span>
                ) : undefined,
            },
            {
              id: "approved",
              label: `Públicos (${approvedList.length})`,
            },
            {
              id: "hidden",
              label: `Ocultos (${hiddenList.length})`,
            },
          ]}
          activeTab={tab}
          onChange={(newTab) => setTab(newTab)}
          variant="glass"
          size="default"
        />
      </div>

      {/* PESTAÑA 1: TESTIMONIOS PENDIENTES */}
      {tab === "pending" && (
        <div className="space-y-3">
          {pendingList.length > 0 ? (
            pendingList.map((item) => (
              <div
                key={item.id}
                className="bg-black/60 border border-electricViolet/40 rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorCodename}
                      className="w-10 h-10 rounded-full object-cover border border-white/15"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {item.authorCodename}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {formatDiaryDateDisplay(item.createdAt, language)} •{" "}
                        {item.validationMethod === "geofencing"
                          ? (t.account.proximityVerified || "Proximidad verificada (<50m)")
                          : "PIN de Encuentro"}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Requiere Consentimiento</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5 font-sans">
                  "{item.content}"
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-electricViolet/10 border border-electricViolet/20 text-[10px] text-electricViolet-glow font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acciones de Doble Consentimiento y Visibilidad Selectiva (44px) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <BrutalistButton
                    variant="ghost"
                    size="compact"
                    onClick={() => rejectTestimonial("me", item.id)}
                    className="border border-white/10 hover:border-bloodNeon text-neutral-400 hover:text-bloodNeon"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rechazar</span>
                  </BrutalistButton>

                  <BrutalistButton
                    variant="secondary"
                    size="compact"
                    onClick={() => hideTestimonial("me", item.id)}
                    className="border border-white/10"
                    title="Mantiene el texto privado pero suma al contador de encuentros verificados"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Guardar Privado</span>
                  </BrutalistButton>

                  <BrutalistButton
                    variant="primary"
                    size="compact"
                    onClick={() => approveTestimonial("me", item.id, true)}
                    className="shadow-violet-soft"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Publicar</span>
                  </BrutalistButton>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center text-xs text-neutral-400 space-y-1">
              <p className="font-semibold text-white">Bandeja al día</p>
              <p>No tienes testimonios pendientes por moderar.</p>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: TESTIMONIOS PÚBLICOS */}
      {tab === "approved" && (
        <div className="space-y-3">
          {approvedList.length > 0 ? (
            approvedList.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorCodename}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {item.authorCodename}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.createdAt} • Visible en tu perfil público
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <BrutalistButton
                      variant="ghost"
                      size="compact"
                      onClick={() => toggleTestimonialVisibility("me", item.id)}
                      className="text-[10px] text-neutral-400 hover:text-white"
                      title="Ocultar de tu perfil público manteniendo la verificación de actividad"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                      <span className="hidden sm:inline">Ocultar</span>
                    </BrutalistButton>
                    <BrutalistButton
                      variant="danger"
                      size="compact-icon"
                      onClick={() => rejectTestimonial("me", item.id)}
                      title="Eliminar de mi perfil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </BrutalistButton>
                  </div>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
                  "{item.content}"
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-electricViolet/10 border border-electricViolet/20 text-[10px] text-electricViolet-glow font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center text-xs text-neutral-400">
              Aún no tienes testimonios públicos activos en tu perfil.
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: TESTIMONIOS OCULTOS PERO VERIFICADOS */}
      {tab === "hidden" && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-950/20 border border-electricViolet/25 rounded-xl text-xs space-y-1">
            <div className="font-bold text-electricViolet-glow flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Visibilidad Selectiva Activa</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
              Estas reseñas permanecen privadas para ti. <strong>Validadas por Doble Consentimiento</strong>, continúan sumando al contador público de tus encuentros reales sin exponer el texto.
            </p>
          </div>

          {hiddenList.length > 0 ? (
            hiddenList.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorCodename}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 opacity-70"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {item.authorCodename}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.createdAt} • Privado
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <BrutalistButton
                      variant="secondary"
                      size="compact"
                      onClick={() => toggleTestimonialVisibility("me", item.id)}
                      className="text-[10px] text-electricViolet-glow font-bold"
                      title="Hacer visible este testimonio en tu perfil"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hacer Público</span>
                    </BrutalistButton>
                    <BrutalistButton
                      variant="danger"
                      size="compact-icon"
                      onClick={() => rejectTestimonial("me", item.id)}
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </BrutalistButton>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
                  "{item.content}"
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-neutral-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center text-xs text-neutral-400">
              No tienes reseñas en modo oculto.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
