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
      role: "Pasivo",
      icon: "🍑",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
    en: {
      role: "Bottom",
      icon: "🍑",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🍑",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
  },
  "Vers Bottom": {
    es: {
      role: "Versátil Pasivo",
      icon: "🍑",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
    en: {
      role: "Vers Bottom",
      icon: "🍑",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🍑",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(251,146,60,0.6)] border-orange-400/60 text-orange-300",
    },
  },
  Top: {
    es: {
      role: "Activo",
      icon: "🍆",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
    en: {
      role: "Top",
      icon: "🍆",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🍆",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
  },
  "Vers Top": {
    es: {
      role: "Versátil Activo",
      icon: "🍆",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
    en: {
      role: "Vers Top",
      icon: "🍆",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🍆",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400/60 text-purple-300",
    },
  },
  Versatile: {
    es: {
      role: "Versátil",
      icon: "⚡",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
    },
    en: {
      role: "Versatile",
      icon: "⚡",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent ⚡",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
    },
  },
  Side: {
    es: {
      role: "Sin penetración",
      icon: "🫦",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(244,114,182,0.6)] border-pink-400/60 text-pink-300",
    },
    en: {
      role: "Side",
      icon: "🫦",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🫦",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(244,114,182,0.6)] border-pink-400/60 text-pink-300",
    },
  },
  "Oral Focus": {
    es: {
      role: "Enfoque oral",
      icon: "👅",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.6)] border-red-400/60 text-red-300",
    },
    en: {
      role: "Oral Focus",
      icon: "👅",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 👅",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.6)] border-red-400/60 text-red-300",
    },
  },
  Dominant: {
    es: {
      role: "Dominante",
      icon: "⛓️",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(139,92,246,0.6)] border-electricViolet/60 text-violet-300",
    },
    en: {
      role: "Dominant",
      icon: "⛓️",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent ⛓️",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(139,92,246,0.6)] border-electricViolet/60 text-violet-300",
    },
  },
  Submissive: {
    es: {
      role: "Sumiso",
      icon: "🧎",
      actionLabel: "Me Hotea 🔥",
      shortLabel: "Hotea",
      sentLabel: "Te Hotea 🔥",
      tooltipTemplate: "Avisale a {name} que te hotea",
      glowClass: "shadow-[0_0_12px_rgba(96,165,250,0.6)] border-blue-400/60 text-blue-300",
    },
    en: {
      role: "Submissive",
      icon: "🧎",
      actionLabel: "Send Nudge",
      shortLabel: "Nudge",
      sentLabel: "Nudge sent 🧎",
      tooltipTemplate: "Send nudge to {name}",
      glowClass: "shadow-[0_0_12px_rgba(96,165,250,0.6)] border-blue-400/60 text-blue-300",
    },
  },
};

export const ALL_ROLE_TYPES: RoleType[] = [
  "Top",
  "Bottom",
  "Versatile",
  "Vers Top",
  "Vers Bottom",
  "Side",
  "Dominant",
  "Submissive",
  "Oral Focus",
];

export const ROLE_DISPLAY_NAMES: Record<string, { es: string; en: string }> = {
  Top: { es: "Activo", en: "Top" },
  "Vers Top": { es: "Versátil Activo", en: "Vers Top" },
  Bottom: { es: "Pasivo", en: "Bottom" },
  "Vers Bottom": { es: "Versátil Pasivo", en: "Vers Bottom" },
  Versatile: { es: "Versátil", en: "Versatile" },
  Side: { es: "Sin penetración", en: "Side" },
  "Oral Focus": { es: "Enfoque oral", en: "Oral Focus" },
  Dominant: { es: "Dominante", en: "Dominant" },
  Submissive: { es: "Sumiso", en: "Submissive" },
};

export const getRoleDisplayLabel = (
  role: RoleType | string | undefined,
  lang: "es" | "en" = "es",
  t?: { roles?: Record<string, string> }
): string => {
  if (!role) return lang === "en" ? "Versatile" : "Versátil";
  if (t?.roles) {
    const keyMap: Record<string, string> = {
      Top: "top",
      Bottom: "bottom",
      Versatile: "versatile",
      "Vers Top": "versTop",
      "Vers Bottom": "versBottom",
      Side: "side",
      Dominant: "dominant",
      Submissive: "submissive",
      "Oral Focus": "oralFocus",
    };
    const key = keyMap[role];
    if (key && t.roles[key]) return t.roles[key];
  }
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
    actionLabel: language === "es" ? "Me Hotea 🔥" : "Send Nudge",
    shortLabel: language === "es" ? "Hotea" : "Nudge",
    sentLabel: language === "es" ? "Te Hotea 🔥" : "Nudge sent ⚡",
    tooltipTemplate: targetName
      ? language === "es"
        ? `Avisale a ${targetName} que te hotea`
        : `Send nudge to ${targetName}`
      : language === "es"
      ? "Me Hotea 🔥"
      : "Send Nudge",
    glowClass: "shadow-violet-soft border-electricViolet text-electricViolet",
  };
};
