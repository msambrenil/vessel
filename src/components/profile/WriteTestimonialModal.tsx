"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { EncounterValidationMethod } from "@/types/vessel";
import {
  X,
  MessageSquareHeart,
  Check,
  ShieldCheck,
  Navigation,
  MapPin,
  MessageSquare,
  Lock,
} from "lucide-react";

interface WriteTestimonialModalProps {
  profileId: string;
  profileCodename: string;
  onClose: () => void;
}

export const WriteTestimonialModal: React.FC<WriteTestimonialModalProps> = ({
  profileId,
  profileCodename,
  onClose,
}) => {
  const { addTestimonial } = useVessel();
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [validationMethod, setValidationMethod] =
    useState<EncounterValidationMethod>("geofencing");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    "Excelente Host",
    "Química Total",
    "Físico 10/10",
    "Dominante",
    "Receptivo",
    "Discreto y Seguro",
    "Puntual",
    "Intensidad Pura",
    "Buena Conversación",
    "Sesión Extendida",
    "Espacio Darkroom",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addTestimonial(profileId, content.trim(), selectedTags, validationMethod);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md bg-obsidian-surface rounded-3xl border border-white/15 p-5 shadow-2xl flex flex-col relative space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-electricViolet text-white shadow-violet-soft">
              <MessageSquareHeart className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Testimonio Consensuado
              </h3>
              <p className="text-xs text-electricViolet-glow font-mono font-bold">
                Para {profileCodename}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de testimonio"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          /* Estado de Éxito */
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-electricViolet text-white mx-auto flex items-center justify-center shadow-violet-soft animate-bounce">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              Testimonio Consensuado Enviado
            </h4>
            <p className="text-xs text-neutral-300 max-w-xs mx-auto leading-relaxed">
              Tu reseña fue enviada a <strong className="text-electricViolet-glow">{profileCodename}</strong>. Sumará a su contador de encuentros verificados y se publicará en su perfil cuando otorgue su aprobación.
            </p>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Explicación de Doble Consentimiento */}
            <div className="bg-black/60 border border-electricViolet/30 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-electricViolet-glow font-bold uppercase text-[10px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-mintNeon" />
                <span>Protocolo de Doble Consentimiento</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                Para erradicar campañas de desprestigio o acoso digital, el receptor decide si publica el contenido en su perfil o si lo mantiene en privado. En ambos casos, <strong>valida su actividad real ante la comunidad</strong>.
              </p>
            </div>

            {/* Método de Validación de Encuentro */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block font-mono">
                Método de Validación del Encuentro
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setValidationMethod("geofencing")}
                  aria-pressed={validationMethod === "geofencing"}
                  className={`p-2.5 min-h-[50px] rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    validationMethod === "geofencing"
                      ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-extrabold shadow-violet-soft"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-mono">Geofencing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValidationMethod("rendezvous_pin")}
                  aria-pressed={validationMethod === "rendezvous_pin"}
                  className={`p-2.5 min-h-[50px] rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    validationMethod === "rendezvous_pin"
                      ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-extrabold shadow-violet-soft"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-mono">PIN de Encuentro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValidationMethod("chat_agreement")}
                  aria-pressed={validationMethod === "chat_agreement"}
                  className={`p-2.5 min-h-[50px] rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    validationMethod === "chat_agreement"
                      ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-extrabold shadow-violet-soft"
                      : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-mono">Acuerdo Chat</span>
                </button>
              </div>
            </div>

            {/* Área de Texto Libre */}
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                Tu Reseña / Experiencia
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe cómo fue el encuentro, la química, el espacio, el trato o cualquier detalle relevante..."
                rows={3}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl text-white text-xs p-3 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Aspectos Destacados */}
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                Aspectos Destacados
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={isSelected}
                      className={`px-3 py-1.5 min-h-[34px] rounded-full text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                        isSelected
                          ? "bg-electricViolet text-white border-electricViolet font-bold shadow-violet-soft"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-electricViolet-glow disabled:opacity-40 transition-all shadow-violet-soft mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98 font-mono"
            >
              Enviar Testimonio Consensuado
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
