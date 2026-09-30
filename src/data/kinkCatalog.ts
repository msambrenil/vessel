import { KinkTag } from "@/types/vessel";

export const KINK_CATALOG: KinkTag[] = [
  // Dinámicas de Poder y Contacto
  { id: "raw-carnal", label: "Sin Filtros", category: "intensity" },
  { id: "dominant", label: "Dominante", category: "dynamic" },
  { id: "submissive", label: "Sumiso", category: "dynamic" },
  { id: "switch", label: "Versátil", category: "dynamic" },
  { id: "physical-wrestling", label: "Lucha Corporal", category: "intensity" },

  // Indumentaria & Texturas (Gear)
  { id: "leather", label: "Cuero Pesado", category: "gear" },
  { id: "rubber-latex", label: "Látex y Goma", category: "gear" },
  { id: "sport-gear", label: "Ropa Deportiva", category: "gear" },
  { id: "harness", label: "Arnés de Pecho", category: "gear" },
  { id: "boots", label: "Botas Fuertes", category: "gear" },

  // Escena & Entorno
  { id: "darkroom", label: "Sala Oscura", category: "scene" },
  { id: "techno-afters", label: "Música y Baile", category: "scene" },
  { id: "immediate-host", label: "Pone Casa Ya", category: "scene" },
  { id: "car-outdoor", label: "Encuentro en Auto", category: "scene" },
  { id: "stealth-discrete", label: "Ultra Discreto", category: "scene" },

  // Prácticas Específicas & Fetiche
  { id: "sensory-deprivation", label: "Ojos Vendados", category: "fetish" },
  { id: "bondage-rope", label: "Ataduras y Cuerdas", category: "fetish" },
  { id: "sweat-scent", label: "Sudor y Feromonas", category: "fetish" },
  { id: "oral-worship", label: "Devoción Oral", category: "fetish" },
  { id: "endurance", label: "Sesión Larga", category: "intensity" },
  { id: "breathplay", label: "Juegos de Respiración", category: "fetish" },
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
  3: { label: "SIN FILTRO", desc: "Sin filtros, ritmo acelerado y entrega física", color: "#FF9800" },
  4: { label: "EXTREMO", desc: "Sala oscura total, alta intensidad y fetiche pesado", color: "#D90429" },
};
