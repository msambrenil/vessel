"use client";

import React from "react";

export type SectionHeroVariant =
  | "violet"
  | "mint"
  | "blood"
  | "amber"
  | "cyan"
  | "neutral";

export interface SectionHeroHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tag?: string;
  icon?: React.ReactNode;
  variant?: SectionHeroVariant;
  actions?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const SectionHeroHeader: React.FC<SectionHeroHeaderProps> = ({
  title,
  subtitle,
  tag,
  icon,
  variant = "violet",
  actions,
  compact = false,
  className = "",
}) => {
  // 1. Variantes cromáticas semánticas (Dark Luxury & Queer Vanguard)
  const variantConfig: Record<
    SectionHeroVariant,
    {
      topLine: string;
      bgGradient: string;
      border: string;
      iconBg: string;
      iconBorder: string;
      iconText: string;
      tagBg: string;
      tagBorder: string;
      tagText: string;
      shadow: string;
    }
  > = {
    violet: {
      topLine: "bg-gradient-to-r from-electricViolet via-purple-500 to-transparent",
      bgGradient: "bg-gradient-to-r from-electricViolet/10 via-obsidian-surface to-obsidian-surface",
      border: "border-electricViolet/30",
      iconBg: "bg-electricViolet/15",
      iconBorder: "border-electricViolet/40",
      iconText: "text-electricViolet-glow",
      tagBg: "bg-electricViolet/15",
      tagBorder: "border-electricViolet/30",
      tagText: "text-electricViolet-glow",
      shadow: "shadow-[0_4px_20px_rgba(139,92,246,0.12)]",
    },
    mint: {
      topLine: "bg-gradient-to-r from-mintNeon via-emerald-400 to-transparent",
      bgGradient: "bg-gradient-to-r from-mintNeon/10 via-obsidian-surface to-obsidian-surface",
      border: "border-mintNeon/30",
      iconBg: "bg-mintNeon/15",
      iconBorder: "border-mintNeon/40",
      iconText: "text-mintNeon",
      tagBg: "bg-mintNeon/15",
      tagBorder: "border-mintNeon/30",
      tagText: "text-mintNeon",
      shadow: "shadow-[0_4px_20px_rgba(16,185,129,0.12)]",
    },
    blood: {
      topLine: "bg-gradient-to-r from-bloodNeon via-red-500 to-transparent",
      bgGradient: "bg-gradient-to-r from-bloodNeon/10 via-obsidian-surface to-obsidian-surface",
      border: "border-bloodNeon/30",
      iconBg: "bg-bloodNeon/15",
      iconBorder: "border-bloodNeon/40",
      iconText: "text-bloodNeon",
      tagBg: "bg-bloodNeon/15",
      tagBorder: "border-bloodNeon/30",
      tagText: "text-bloodNeon",
      shadow: "shadow-[0_4px_20px_rgba(230,25,55,0.12)]",
    },
    amber: {
      topLine: "bg-gradient-to-r from-champagneGold via-yellow-400 to-transparent",
      bgGradient: "bg-gradient-to-r from-champagneGold/10 via-obsidian-surface to-obsidian-surface",
      border: "border-champagneGold/30",
      iconBg: "bg-champagneGold/15",
      iconBorder: "border-champagneGold/40",
      iconText: "text-champagneGold",
      tagBg: "bg-champagneGold/15",
      tagBorder: "border-champagneGold/30",
      tagText: "text-champagneGold",
      shadow: "shadow-[0_4px_20px_rgba(245,158,11,0.12)]",
    },
    cyan: {
      topLine: "bg-gradient-to-r from-cyan-400 via-sky-500 to-transparent",
      bgGradient: "bg-gradient-to-r from-cyan-500/10 via-obsidian-surface to-obsidian-surface",
      border: "border-cyan-500/30",
      iconBg: "bg-cyan-500/15",
      iconBorder: "border-cyan-500/40",
      iconText: "text-cyan-400",
      tagBg: "bg-cyan-500/15",
      tagBorder: "border-cyan-500/30",
      tagText: "text-cyan-400",
      shadow: "shadow-[0_4px_20px_rgba(6,182,212,0.12)]",
    },
    neutral: {
      topLine: "bg-gradient-to-r from-white/30 via-white/10 to-transparent",
      bgGradient: "bg-obsidian-surface",
      border: "border-white/10",
      iconBg: "bg-white/5",
      iconBorder: "border-white/15",
      iconText: "text-neutral-300",
      tagBg: "bg-white/5",
      tagBorder: "border-white/10",
      tagText: "text-neutral-400",
      shadow: "shadow-card-elevation",
    },
  };

  const current = variantConfig[variant];

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border ${current.border} ${current.bgGradient} ${current.shadow} backdrop-blur-md overflow-hidden transition-all duration-200 ${
        compact ? "p-3 sm:p-3.5" : "p-4 sm:p-5"
      } ${className}`}
    >
      {/* Línea Neón Superior de Acento Cromático */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${current.topLine}`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {/* Contenedor Táctico de Icono */}
          {icon && (
            <div
              className={`p-2 sm:p-2.5 rounded-2xl border flex-shrink-0 flex items-center justify-center shadow-sm ${current.iconBg} ${current.iconBorder} ${current.iconText}`}
            >
              {icon}
            </div>
          )}

          {/* Textos y Tags */}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono truncate">
                {title}
              </h2>
              {tag && (
                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1 ${current.tagBg} ${current.tagBorder} ${current.tagText}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {tag}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-[11px] sm:text-xs text-neutral-400 font-sans leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Acciones y Controles a la derecha */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end flex-shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
