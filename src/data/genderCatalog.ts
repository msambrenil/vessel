import { GenderInterest, VesselProfile } from "@/types/vessel";

export interface GenderInterestOption {
  id: GenderInterest;
  label: string;
  sublabel: string;
  emoji: string;
  tagColor: string;
}

export const GENDER_INTEREST_OPTIONS: GenderInterestOption[] = [
  {
    id: "gay",
    label: "Gays",
    sublabel: "Hombres gay",
    emoji: "🏳️‍🌈",
    tagColor: "bg-blue-500/15 border-blue-500/40 text-blue-300",
  },
  {
    id: "bi",
    label: "Bisexuales / Pan",
    sublabel: "Atracción fluida / múltiple",
    emoji: "💜",
    tagColor: "bg-purple-500/15 border-purple-500/40 text-purple-300",
  },
  {
    id: "trans",
    label: "Trans",
    sublabel: "Hombres trans / transmasculinos",
    emoji: "⚧️",
    tagColor: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  },
  {
    id: "cis",
    label: "Hombres Cis",
    sublabel: "Hombres cisgénero",
    emoji: "⚡",
    tagColor: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  },
  {
    id: "non_binary",
    label: "No Binaries / Queer",
    sublabel: "Disidencias y género fluido",
    emoji: "🧬",
    tagColor: "bg-pink-500/15 border-pink-500/40 text-pink-300",
  },
  {
    id: "all",
    label: "Todos",
    sublabel: "Sin filtro de género",
    emoji: "🌐",
    tagColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  },
];

/**
 * Evalúa si un perfil de VESSEL coincide con los intereses de género seleccionados.
 * 
 * Reglas deterministas:
 * 1. Si no hay intereses definidos o incluye 'all', devuelve true (abierto a todo el radar).
 * 2. Si el perfil coincide con al menos uno de los intereses seleccionados, devuelve true.
 * 3. El usuario propio (isCurrentUser) siempre coincide para no ocultarse a sí mismo.
 */
export function checkGenderInterestMatch(
  profile: VesselProfile,
  selectedInterests?: GenderInterest[]
): boolean {
  if (profile.isCurrentUser) return true;
  if (!selectedInterests || selectedInterests.length === 0 || selectedInterests.includes("all")) {
    return true;
  }

  const identity = (profile.genderIdentity || "").toLowerCase();
  const orientation = (profile.orientation || "").toLowerCase();

  for (const interest of selectedInterests) {
    switch (interest) {
      case "trans":
        if (identity.includes("trans") || orientation.includes("trans")) {
          return true;
        }
        break;

      case "cis":
        if (identity.includes("cis") || identity === "hombre") {
          return true;
        }
        break;

      case "non_binary":
        if (
          identity.includes("binari") ||
          identity.includes("queer") ||
          identity.includes("fluido") ||
          identity.includes("disidente") ||
          identity.includes("agénero") ||
          identity.includes("agenero") ||
          orientation.includes("queer")
        ) {
          return true;
        }
        break;

      case "gay":
        if (
          orientation === "gay" ||
          (!orientation && (identity.includes("hombre") || !identity))
        ) {
          return true;
        }
        break;

      case "bi":
        if (orientation.includes("bi") || orientation.includes("pan")) {
          return true;
        }
        break;

      case "all":
        return true;
    }
  }

  return false;
}
