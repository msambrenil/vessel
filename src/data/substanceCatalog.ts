import { SubstanceAtmosphere } from "@/types/vessel";

export interface SubstanceVibeMeta {
  id: SubstanceAtmosphere;
  title: {
    es: string;
    en: string;
  };
  subtitle: {
    es: string;
    en: string;
  };
  icon: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  description: {
    es: string;
    en: string;
  };
  harmReductionTip?: {
    es: string;
    en: string;
  };
}

export const SUBSTANCE_ATMOSPHERE_CATALOG: Record<SubstanceAtmosphere, SubstanceVibeMeta> = {
  sober: {
    id: "sober",
    title: {
      es: "Sobrio / Cero Sustancias",
      en: "Sober / Substance-Free",
    },
    subtitle: {
      es: "Claridad & Sobriedad",
      en: "Clarity & Sobriety",
    },
    icon: "🛡️",
    badgeClass: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    borderClass: "border-emerald-500/50",
    textClass: "text-emerald-400",
    description: {
      es: "Encuentros con lucidez absoluta, sin alcohol ni estupefacientes. Respeto para personas en recuperación o estilo de vida limpio.",
      en: "Encounters with absolute lucidity, zero alcohol or substances. Respect for people in recovery or clean lifestyle.",
    },
  },
  social_drinks: {
    id: "social_drinks",
    title: {
      es: "Tragos & Previa",
      en: "Social Drinks & Warmup",
    },
    subtitle: {
      es: "Vino, Cóctel o Cerveza",
      en: "Wine, Cocktails or Beer",
    },
    icon: "🍸",
    badgeClass: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    borderClass: "border-amber-500/50",
    textClass: "text-amber-400",
    description: {
      es: "Una copa de vino, gin tonic o birra para romper el hielo y entrar en sintonía de previa antes de pasar a la acción.",
      en: "A glass of wine, gin & tonic or beer to break the ice and set the mood before getting intimate.",
    },
    harmReductionTip: {
      es: "Intercalá siempre un vaso de agua por cada trago para evitar deshidratación.",
      en: "Alternate with a glass of water for every alcoholic drink to prevent dehydration.",
    },
  },
  green_420: {
    id: "green_420",
    title: {
      es: "420 Friendly",
      en: "420 Friendly",
    },
    subtitle: {
      es: "Cannabis & Chill",
      en: "Cannabis & Chill",
    },
    icon: "🍃",
    badgeClass: "bg-teal-950/60 border-teal-500/40 text-teal-300",
    borderClass: "border-teal-500/50",
    textClass: "text-teal-400",
    description: {
      es: "Abierto a fumar, vapear o gomitas de cannabis para relajar el cuerpo, bajar revoluciones y potenciar la sensibilidad táctil.",
      en: "Open to smoking, vaping or edibles to relax the body, unwind, and enhance tactile sensitivity.",
    },
    harmReductionTip: {
      es: "Comenzá con dosis bajas si consumís comestibles (los efectos tardan hasta 90 min en manifestarse).",
      en: "Start with low doses if taking edibles (effects may take up to 90 mins to peak).",
    },
  },
  party_play: {
    id: "party_play",
    title: {
      es: "Party & Play / Sesión",
      en: "Party & Play / Chem Session",
    },
    subtitle: {
      es: "Sesión Intensa & Caravana",
      en: "Intense Session & Party",
    },
    icon: "⚡",
    badgeClass: "bg-purple-950/60 border-purple-500/40 text-purple-300",
    borderClass: "border-purple-500/50",
    textClass: "text-purple-400",
    description: {
      es: "Encuentros de alta intensidad y cultura chemsex. Exige consenso mutuo estricto, límites pactados y reducción de daños activa.",
      en: "High-intensity sessions and chemsex culture. Requires strict mutual consent, agreed boundaries, and active harm reduction.",
    },
    harmReductionTip: {
      es: "Activá el asistente Chem-Chill de VESSEL: hidratación cada 45 min y jamás redosifiques a ciegas.",
      en: "Activate VESSEL Chem-Chill assistant: hydrate every 45 mins and never redose blindly.",
    },
  },
};
