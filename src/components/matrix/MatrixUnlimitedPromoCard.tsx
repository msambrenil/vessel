"use client";

import React from "react";
import { Sparkles, Zap, Lock, ArrowRight, ShieldCheck, Eye } from "lucide-react";
import { useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface MatrixUnlimitedPromoCardProps {
  totalProfilesCount?: number;
}

export const MatrixUnlimitedPromoCard: React.FC<MatrixUnlimitedPromoCardProps> = ({
  totalProfilesCount = 110,
}) => {
  const { language, openUnlimitedModal } = useSettings();

  const handleCtaClick = () => {
    audioEngine.playSubBass(60);
    openUnlimitedModal();
  };

  const remainingCount = Math.max(0, totalProfilesCount - 99);

  return (
    <div
      data-testid="matrix-unlimited-promo-card"
      className="col-span-full my-2.5 sm:my-3.5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-deep via-purple-950/30 to-obsidian-card border border-electricViolet/50 shadow-[0_0_30px_rgba(157,0,255,0.2)] p-4 sm:p-5 transition-all"
    >
      {/* Luz ambiental sutil en esquina */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 bg-electricViolet/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Lado Izquierdo: Badges, Título y Descripción */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electricViolet/20 border border-electricViolet/60 text-electricViolet-glow font-mono text-[10px] font-black uppercase tracking-wider shadow-violet-soft">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>VESSEL UNLIMITED</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bloodNeon/15 border border-bloodNeon/40 text-bloodNeon font-mono text-[9.5px] font-bold">
              <Lock className="w-2.5 h-2.5" />
              <span>
                {language === "es"
                  ? `Límite Gratuito: 99 personas`
                  : `Free Limit: 99 people`}
              </span>
            </span>

            {remainingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[9.5px] font-bold">
                <Eye className="w-2.5 h-2.5 text-purple-300" />
                <span>
                  {language === "es"
                    ? `+${remainingCount} personas más adelante`
                    : `+${remainingCount} more people ahead`}
                </span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-mono flex items-center gap-2">
              <span>
                {language === "es"
                  ? "DESBLOQUEÁ TODA LA MATRIZ"
                  : "UNLOCK THE FULL MATRIX"}
              </span>
              <span className="text-electricViolet-glow text-sm sm:text-base">⚡</span>
            </h3>
            <p className="text-xs sm:text-[13px] text-neutral-300 font-sans leading-relaxed">
              {language === "es"
                ? "Alcanzaste el límite de las primeras 99 personas del radar libre. Para acceder a los perfiles restantes, álbumes ilimitados y chat satelital inmediato sin esperas, activá tu membresía."
                : "You reached the 99 people free radar threshold. To view remaining profiles, unlimited albums, and instant satellite chat without waiting, activate your membership."}
            </p>
          </div>

          {/* Micro-beneficios tácticos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono text-neutral-300">
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1">
              <Zap className="w-3 h-3 text-electricViolet-glow flex-shrink-0" />
              <span className="truncate">
                {language === "es" ? "Perfiles 100+ desbloqueados" : "100+ profiles unlocked"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {language === "es" ? "Álbumes & Bóvedas ilimitadas" : "Unlimited vaults & albums"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1">
              <span className="text-xs">🛰️</span>
              <span className="truncate">
                {language === "es" ? "Chat satelital > 1.0 km" : "Satellite chat > 1.0 km"}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Botón CTA Ergonómico de 1-Tap */}
        <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            data-testid="matrix-promo-unlock-btn"
            onClick={handleCtaClick}
            className="w-full md:w-auto px-5 py-3.5 min-h-[46px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-black text-xs uppercase tracking-wider shadow-violet-soft hover:shadow-violet-glow flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all border border-electricViolet-glow"
          >
            <span>
              {language === "es" ? "DESBLOQUEAR MATRIZ" : "UNLOCK FULL MATRIX"}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
