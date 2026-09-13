import { ProfileRankingTier } from "@/types/vessel";

export interface FlagPreset {
  id: string;
  label: {
    es: string;
    en: string;
  };
  icon?: string;
}

export interface TierMeta {
  tier: ProfileRankingTier;
  label: {
    es: string;
    en: string;
  };
  shortDescription: {
    es: string;
    en: string;
  };
  badgeColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

export const PRESET_RED_FLAGS: FlagPreset[] = [
  {
    id: "impuntual",
    label: {
      es: "Impuntual / Cuelgue",
      en: "Unpunctual / Flaky",
    },
    icon: "⏰",
  },
  {
    id: "ghoster",
    label: {
      es: "Ghostea sin avisar",
      en: "Frequent ghoster",
    },
    icon: "👻",
  },
  {
    id: "fotos_falsas",
    label: {
      es: "Fotos engañosas / Fake",
      en: "Misleading photos / Catfish",
    },
    icon: "📸",
  },
  {
    id: "no_respeta_limites",
    label: {
      es: "No respeta límites",
      en: "Ignores boundaries",
    },
    icon: "🚫",
  },
  {
    id: "insistente",
    label: {
      es: "Insistente / Pesado",
      en: "Pushy / Overbearing",
    },
    icon: "⚠️",
  },
  {
    id: "higiene_dudosa",
    label: {
      es: "Higiene descuidada",
      en: "Poor hygiene",
    },
    icon: "🧼",
  },
  {
    id: "exige_sin_ofrecer",
    label: {
      es: "Exige sin ofrecer lugar",
      en: "Demanding / One-sided",
    },
    icon: "🏠",
  },
  {
    id: "cancela_ultimo_momento",
    label: {
      es: "Cancela sobre la hora",
      en: "Last-minute canceller",
    },
    icon: "❌",
  },
  {
    id: "mala_vibra",
    label: {
      es: "Mala vibra / Actitud agresiva",
      en: "Bad vibe / Aggressive",
    },
    icon: "⚡",
  },
];

export const PRESET_GREEN_FLAGS: FlagPreset[] = [
  {
    id: "buena_quimica",
    label: {
      es: "Excelente química",
      en: "Insane chemistry",
    },
    icon: "🔥",
  },
  {
    id: "fotos_reales",
    label: {
      es: "100% como en las fotos",
      en: "100% like their photos",
    },
    icon: "✨",
  },
  {
    id: "super_respetuoso",
    label: {
      es: "Súper respetuoso & claro",
      en: "Very respectful & clear",
    },
    icon: "🛡️",
  },
  {
    id: "puntual",
    label: {
      es: "Puntualidad exacta",
      en: "Perfect punctuality",
    },
    icon: "⏱️",
  },
  {
    id: "lugar_impecable",
    label: {
      es: "Lugar propio e impecable",
      en: "Own place & pristine clean",
    },
    icon: "🏠",
  },
  {
    id: "buena_onda",
    label: {
      es: "Cálido / Muy buena onda",
      en: "Great vibe / Welcoming",
    },
    icon: "🖤",
  },
  {
    id: "salud_al_dia",
    label: {
      es: "Salud & PrEP al día",
      en: "Tested & on PrEP",
    },
    icon: "🩺",
  },
  {
    id: "cumplio_acordado",
    label: {
      es: "Cumplió todo lo pactado",
      en: "Honored all agreements",
    },
    icon: "🤝",
  },
];

export interface VerdictMeta {
  rating: number;
  key: string;
  icon: string;
  shortTag: {
    es: string;
    en: string;
  };
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  badgeColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

export const DOSSIER_VERDICT_CONFIG: Record<number, VerdictMeta> = {
  5: {
    rating: 5,
    key: "chongazo",
    icon: "👑",
    shortTag: {
      es: "CHONGAZO",
      en: "TOP MATCH",
    },
    title: {
      es: "Chongazo Fijo",
      en: "Top Match",
    },
    description: {
      es: "Química brutal, favorito absoluto",
      en: "Insane chemistry, absolute favorite",
    },
    badgeColor: "bg-electricViolet text-white font-bold",
    textColor: "text-electricViolet-glow",
    borderColor: "border-electricViolet",
    glowColor: "shadow-[0_0_12px_rgba(139,92,246,0.5)]",
  },
  4: {
    rating: 4,
    key: "repetir",
    icon: "🔥",
    shortTag: {
      es: "REPETIR",
      en: "REPEAT",
    },
    title: {
      es: "Pinta Repetir",
      en: "Definitely Repeat",
    },
    description: {
      es: "Muy buena química, para volver a verse",
      en: "Great chemistry, see each other again",
    },
    badgeColor: "bg-emerald-500 text-obsidian-deep font-black",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500",
    glowColor: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
  },
  3: {
    rating: 3,
    key: "casual",
    icon: "👌",
    shortTag: {
      es: "CUMPLIDOR",
      en: "SOLID",
    },
    title: {
      es: "Cumplidor / Casual",
      en: "Solid / Casual",
    },
    description: {
      es: "Buen polvo, todo en orden",
      en: "Good casual encounter, solid",
    },
    badgeColor: "bg-cyan-500 text-obsidian-deep font-black",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500",
    glowColor: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
  },
  2: {
    rating: 2,
    key: "dudoso",
    icon: "🥱",
    shortTag: {
      es: "DUDOSO",
      en: "MEH",
    },
    title: {
      es: "Ni Fu Ni Fa",
      en: "Meh / Low Chemistry",
    },
    description: {
      es: "Poca onda o no terminó de convencer",
      en: "Low chemistry or didn't quite click",
    },
    badgeColor: "bg-amber-700 text-white",
    textColor: "text-amber-400",
    borderColor: "border-amber-700",
    glowColor: "shadow-none",
  },
  1: {
    rating: 1,
    key: "no_va",
    icon: "⛔",
    shortTag: {
      es: "NO VA MÁS",
      en: "NEVER AGAIN",
    },
    title: {
      es: "No Va Más",
      en: "Never Again",
    },
    description: {
      es: "Mala experiencia, no repetir",
      en: "Bad experience, do not repeat",
    },
    badgeColor: "bg-bloodNeon text-white",
    textColor: "text-bloodNeon",
    borderColor: "border-bloodNeon",
    glowColor: "shadow-[0_0_12px_rgba(255,0,51,0.5)]",
  },
};

export const RANKING_TIER_CONFIG: Record<ProfileRankingTier, TierMeta> = {
  S: {
    tier: "S",
    label: {
      es: "👑 Chongazo Fijo",
      en: "👑 Top Match",
    },
    shortDescription: {
      es: "Química brutal, favorito absoluto",
      en: "Insane chemistry, absolute favorite",
    },
    badgeColor: "bg-electricViolet text-white font-bold",
    textColor: "text-electricViolet-glow",
    borderColor: "border-electricViolet",
    glowColor: "shadow-[0_0_12px_rgba(139,92,246,0.5)]",
  },
  A: {
    tier: "A",
    label: {
      es: "🔥 Pinta Repetir",
      en: "🔥 Definitely Repeat",
    },
    shortDescription: {
      es: "Muy buena química, para volver a verse",
      en: "Great chemistry, see each other again",
    },
    badgeColor: "bg-mintNeon text-obsidian-deep font-black",
    textColor: "text-mintNeon",
    borderColor: "border-mintNeon",
    glowColor: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
  },
  B: {
    tier: "B",
    label: {
      es: "👌 Cumplidor",
      en: "👌 Solid / Casual",
    },
    shortDescription: {
      es: "Buen polvo, todo en orden",
      en: "Good casual encounter, solid",
    },
    badgeColor: "bg-cyan-500 text-obsidian-deep font-bold",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500",
    glowColor: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
  },
  C: {
    tier: "C",
    label: {
      es: "👌 Casual",
      en: "👌 Casual",
    },
    shortDescription: {
      es: "Encuentro casual estándar",
      en: "Standard casual encounter",
    },
    badgeColor: "bg-neutral-500 text-white",
    textColor: "text-neutral-300",
    borderColor: "border-neutral-500",
    glowColor: "shadow-none",
  },
  D: {
    tier: "D",
    label: {
      es: "🥱 Ni Fu Ni Fa",
      en: "🥱 Meh",
    },
    shortDescription: {
      es: "Poca onda o no convenció",
      en: "Low chemistry or didn't click",
    },
    badgeColor: "bg-amber-700 text-white",
    textColor: "text-amber-500",
    borderColor: "border-amber-700",
    glowColor: "shadow-none",
  },
  F: {
    tier: "F",
    label: {
      es: "⛔ No Va Más",
      en: "⛔ Never Again",
    },
    shortDescription: {
      es: "Mala experiencia, no repetir",
      en: "Bad experience, do not repeat",
    },
    badgeColor: "bg-bloodNeon text-white",
    textColor: "text-bloodNeon",
    borderColor: "border-bloodNeon",
    glowColor: "shadow-[0_0_12px_rgba(255,0,51,0.5)]",
  },
};

