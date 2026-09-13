import { KinkTag } from "@/types/vessel";

export const KINK_CATALOG: KinkTag[] = [
  // Dinámicas de Poder y Contacto
  { id: "raw-carnal", label: "RAW / UNFILTERED", category: "intensity" },
  { id: "dominant", label: "DOMINANT / CONTROL", category: "dynamic" },
  { id: "submissive", label: "YIELDING / SUB", category: "dynamic" },
  { id: "switch", label: "VERS SWITCH", category: "dynamic" },
  { id: "physical-wrestling", label: "HEAVY TOUCH", category: "intensity" },

  // Indumentaria & Texturas (Gear)
  { id: "leather", label: "HEAVY LEATHER", category: "gear" },
  { id: "rubber-latex", label: "RUBBER / LATEX", category: "gear" },
  { id: "sport-gear", label: "SPORT / SNEAKERS", category: "gear" },
  { id: "harness", label: "CHEST HARNESS", category: "gear" },
  { id: "boots", label: "COMBAT BOOTS", category: "gear" },

  // Escena & Entorno
  { id: "darkroom", label: "DARKROOM ONLY", category: "scene" },
  { id: "techno-afters", label: "BERLIN AFTERHOURS", category: "scene" },
  { id: "immediate-host", label: "HOSTING RIGHT NOW", category: "scene" },
  { id: "car-outdoor", label: "CRUISING / CAR", category: "scene" },
  { id: "stealth-discrete", label: "ULTRA DISCRETE", category: "scene" },

  // Prácticas Específicas & Fetiche
  { id: "sensory-deprivation", label: "BLINDFOLD / SENSORY", category: "fetish" },
  { id: "bondage-rope", label: "BONDAGE / RESTRAINT", category: "fetish" },
  { id: "sweat-scent", label: "SWEAT & SCENT", category: "fetish" },
  { id: "oral-worship", label: "ORAL DEVOTION", category: "fetish" },
  { id: "endurance", label: "EXTENDED SESSION", category: "intensity" },
  { id: "breathplay", label: "EDGE PLAY", category: "fetish" },
];

export const ROLE_OPTIONS = [
  "Top",
  "Bottom",
  "Versatile",
  "Vers Top",
  "Vers Bottom",
  "Side",
  "Dominant",
  "Submissive",
  "Oral Focus",
] as const;

export const INTENSITY_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: "SENSUAL", desc: "Tacto pausado, piel y respiración", color: "#8E8E98" },
  2: { label: "CARNAL", desc: "Contacto directo, calor corporal intenso", color: "#E5A93C" },
  3: { label: "RAW", desc: "Sin filtros, ritmo acelerado y entrega física", color: "#FF9800" },
  4: { label: "EXTREME", desc: "Darkroom total, alta intensidad y fetiche pesado", color: "#D90429" },
};
