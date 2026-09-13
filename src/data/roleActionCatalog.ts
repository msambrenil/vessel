import { RoleType } from "@/types/vessel";

export interface RoleActionMeta {
  role: RoleType | string;
  icon: string;
  actionLabel: string;
  shortLabel: string;
  sentLabel: string;
  tooltipTemplate: string;
  glowClass: string;
}

export const ROLE_ACTION_MAP: Record<string, { es: RoleActionMeta; en: RoleActionMeta }> = {
  Bottom: {
    es: {
      role: "Bottom",
      icon: "🍑",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🍑",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
    en: {
      role: "Bottom",
      icon: "🍑",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🍑",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
  },
  "Vers Bottom": {
    es: {
      role: "Vers Bottom",
      icon: "🍑",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🍑",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
    en: {
      role: "Vers Bottom",
      icon: "🍑",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🍑",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
  },
  Top: {
    es: {
      role: "Top",
      icon: "🍆",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🍆",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
    en: {
      role: "Top",
      icon: "🍆",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🍆",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
  },
  "Vers Top": {
    es: {
      role: "Vers Top",
      icon: "🍆",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🍆",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
    en: {
      role: "Vers Top",
      icon: "🍆",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🍆",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
  },
  Versatile: {
    es: {
      role: "Versatile",
      icon: "⚡",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado ⚡",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
    },
    en: {
      role: "Versatile",
      icon: "⚡",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent ⚡",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
    },
  },
  Side: {
    es: {
      role: "Side",
      icon: "🫦",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🫦",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(244,114,182,0.6)] border-pink-400/60 text-pink-300",
    },
    en: {
      role: "Side",
      icon: "🫦",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🫦",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(244,114,182,0.6)] border-pink-400/60 text-pink-300",
    },
  },
  "Oral Focus": {
    es: {
      role: "Oral Focus",
      icon: "👅",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 👅",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.6)] border-red-400/60 text-red-300",
    },
    en: {
      role: "Oral Focus",
      icon: "👅",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 👅",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.6)] border-red-400/60 text-red-300",
    },
  },
  Dominant: {
    es: {
      role: "Dominant",
      icon: "⛓️",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado ⛓️",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(139,92,246,0.6)] border-electricViolet/60 text-violet-300",
    },
    en: {
      role: "Dominant",
      icon: "⛓️",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent ⛓️",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(139,92,246,0.6)] border-electricViolet/60 text-violet-300",
    },
  },
  Submissive: {
    es: {
      role: "Submissive",
      icon: "🧎",
      actionLabel: "Mandar Pulso",
      shortLabel: "Pulso",
      sentLabel: "Pulso enviado 🧎",
      tooltipTemplate: "Mandar pulso a {name}",
      glowClass: "shadow-[0_0_12px_rgba(96,165,250,0.6)] border-blue-400/60 text-blue-300",
    },
    en: {
      role: "Submissive",
      icon: "🧎",
      actionLabel: "Send Pulse",
      shortLabel: "Pulse",
      sentLabel: "Pulse sent 🧎",
      tooltipTemplate: "Send pulse to {name}",
      glowClass: "shadow-[0_0_12px_rgba(96,165,250,0.6)] border-blue-400/60 text-blue-300",
    },
  },
};

export const ROLE_DISPLAY_NAMES: Record<string, { es: string; en: string }> = {
  Top: { es: "Activo", en: "Top" },
  "Vers Top": { es: "Vers Activo", en: "Vers Top" },
  Bottom: { es: "Pasivo", en: "Bottom" },
  "Vers Bottom": { es: "Vers Pasivo", en: "Vers Bottom" },
  Versatile: { es: "Versátil", en: "Versatile" },
  Side: { es: "Side", en: "Side" },
  "Oral Focus": { es: "Enfoque Oral", en: "Oral Focus" },
  Dominant: { es: "Dominante", en: "Dominant" },
  Submissive: { es: "Sumiso", en: "Submissive" },
};

export const getRoleDisplayLabel = (
  role: RoleType | string | undefined,
  lang: "es" | "en" = "es"
): string => {
  if (!role) return lang === "en" ? "Versatile" : "Versátil";
  const language = lang === "en" ? "en" : "es";
  return ROLE_DISPLAY_NAMES[role]?.[language] || role;
};

export const getRoleActionMeta = (
  role: RoleType | string | undefined,
  lang: "es" | "en" = "es",
  targetName: string = ""
): RoleActionMeta => {
  const language = lang === "en" ? "en" : "es";
  const matched = role ? ROLE_ACTION_MAP[role] : null;

  if (matched) {
    const meta = matched[language];
    return {
      ...meta,
      tooltipTemplate: targetName
        ? meta.tooltipTemplate.replace("{name}", targetName)
        : meta.actionLabel,
    };
  }

  // Fallback genérico estandarizado
  return {
    role: role || (language === "en" ? "Versatile" : "Versátil"),
    icon: "⚡",
    actionLabel: language === "es" ? "Mandar Pulso" : "Send Pulse",
    shortLabel: language === "es" ? "Pulso" : "Pulse",
    sentLabel: language === "es" ? "Pulso enviado ⚡" : "Pulse sent ⚡",
    tooltipTemplate: targetName
      ? language === "es"
        ? `Mandar pulso a ${targetName}`
        : `Send pulse to ${targetName}`
      : language === "es"
      ? "Mandar Pulso"
      : "Send Pulse",
    glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
  };
};
