"use client";

import React, { useState } from "react";
import { VesselProfile } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { WriteTestimonialModal } from "./WriteTestimonialModal";
import {
  MessageSquareHeart,
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Lock,
  Eye,
  Info,
} from "lucide-react";

interface TestimonialsSectionProps {
  profile: VesselProfile;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  profile,
}) => {
  const { validatedEncounters, validateEncounter } = useVessel();
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  const isEncounterValidated = !!validatedEncounters[profile.id];

  const approvedTestimonials = profile.testimonials.filter(
    (t) => t.status === "approved"
  );
  const pendingByMe = profile.testimonials.find(
    (t) => t.authorId === "me" && t.status === "pending"
  );

  const totalVerifiedCount = Math.max(
    profile.totalEncountersVerified || 0,
    profile.testimonials.length
  );

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3.5 select-none shadow-card-elevation">
      {/* Cabecera de la Sección con Métricas de Verificación */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow shadow-violet-soft">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Testimonios Consensuados
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoBanner(!showInfoBanner)}
                className="text-neutral-400 hover:text-electricViolet-glow transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-md"
                title="Conoce las reglas de Doble Consentimiento"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-mintNeon font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-mintNeon" />
              <span>
                {totalVerifiedCount} Encuentros Físicos Verificados
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isEncounterValidated) {
              validateEncounter(profile.id, "geofencing");
            }
            setIsWriteModalOpen(true);
          }}
          className="px-4 py-2 min-h-[38px] bg-electricViolet text-white hover:bg-electricViolet-glow rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-violet-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 font-mono"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Opinar</span>
        </button>
      </div>

      {/* Banner Informativo Desplegable de Doble Consentimiento */}
      {showInfoBanner && (
        <div className="bg-black/60 border border-electricViolet/30 rounded-2xl p-3.5 text-[11px] text-neutral-300 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[10px] tracking-wider text-electricViolet-glow font-mono">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-mintNeon" />
            <span>Principio de Doble Consentimiento & Visibilidad Selectiva</span>
          </div>
          <p className="leading-relaxed font-sans">
            Inspirado en el sistema de alta reputación de TheBlowers: Para evitar difamaciones y bots, solo se redactan reseñas tras concretar un encuentro real validado por proximidad. El receptor decide qué comentarios hacer públicos en su perfil, acumulando siempre la verificación pública de actividad real.
          </p>
        </div>
      )}

      {/* Indicador de Estado de Encuentro Físico */}
      {isEncounterValidated && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-neutral-300">
            <Navigation className="w-3.5 h-3.5 text-electricViolet-glow" />
            <span>
              Encuentro físico validado con <strong className="text-white">{profile.codename}</strong>
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-mintNeon uppercase bg-mintNeon/15 px-2 py-0.5 rounded-full border border-mintNeon/30">
            Geofencing OK
          </span>
        </div>
      )}

      {/* Resumen de Reputación */}
      <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-2.5 border border-white/5 text-center">
        <div className="border-r border-white/5 pr-2">
          <div className="text-sm font-extrabold text-white font-mono">
            {totalVerifiedCount}
          </div>
          <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">
            Encuentros Reales
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold text-electricViolet-glow font-mono">
            {approvedTestimonials.length}
          </div>
          <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">
            Reseñas Públicas
          </div>
        </div>
      </div>

      {/* Aviso si el usuario actual tiene un testimonio pendiente */}
      {pendingByMe && (
        <div className="bg-purple-950/40 border border-electricViolet/30 rounded-xl p-3 flex items-center gap-2 text-xs text-purple-200 font-sans shadow-violet-soft">
          <Clock className="w-4 h-4 flex-shrink-0 text-electricViolet-glow" />
          <span>
            Tu testimonio ha sido enviado bajo Doble Consentimiento. Se publicará en cuanto {profile.codename} lo apruebe.
          </span>
        </div>
      )}

      {/* Lista de Testimonios Aprobados y Públicos */}
      {approvedTestimonials.length > 0 ? (
        <div className="space-y-3">
          {approvedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={testimonial.authorAvatar}
                    alt={testimonial.authorCodename}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {testimonial.authorCodename}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {testimonial.createdAt}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold font-mono text-mintNeon bg-mintNeon/10 border border-mintNeon/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Encuentro Verificado</span>
                </span>
              </div>

              <p className="text-xs text-neutral-200 leading-relaxed font-sans italic">
                "{testimonial.content}"
              </p>

              {/* Tags del testimonio */}
              {testimonial.tags && testimonial.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {testimonial.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/20 text-[10px] font-medium text-purple-200 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center space-y-2">
          <p className="text-xs text-neutral-400">
            {totalVerifiedCount > 0
              ? `${profile.codename} cuenta con ${totalVerifiedCount} verificaciones de encuentros físicos pero mantiene sus reseñas en modo reservado.`
              : "Aún no hay testimonios públicos en este perfil."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (!isEncounterValidated) {
                validateEncounter(profile.id, "geofencing");
              }
              setIsWriteModalOpen(true);
            }}
            className="text-xs text-electricViolet-glow font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-md py-1 px-2 font-mono"
          >
            Validar encuentro y dejar una reseña consensuada
          </button>
        </div>
      )}

      {/* Modal para redactar testimonio */}
      {isWriteModalOpen && (
        <WriteTestimonialModal
          profileId={profile.id}
          profileCodename={profile.codename}
          onClose={() => setIsWriteModalOpen(false)}
        />
      )}
    </div>
  );
};
