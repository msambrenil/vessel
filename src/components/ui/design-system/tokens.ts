/**
 * VESSEL Design System — Strict Design Tokens (v2.0)
 * Sistema unificado de tokens visuales, espaciales, táctiles y cinéticos.
 */

export const VESSEL_TOKENS = {
  colors: {
    obsidianDeep: "#040405",
    obsidianSurface: "#121216",
    obsidianCard: "#18181D",
    electricViolet: "#8B5CF6",
    electricVioletGlow: "#A78BFA",
    bloodNeon: "#E61937",
    mintNeon: "#10B981",
    champagneGold: "#F59E0B",
    purple400: "#C084FC",
    concrete: "#24242B",
    whiteAlpha10: "rgba(255, 255, 255, 0.10)",
    whiteAlpha15: "rgba(255, 255, 255, 0.15)",
    whiteAlpha20: "rgba(255, 255, 255, 0.20)",
    blackAlpha60: "rgba(0, 0, 0, 0.60)",
    blackAlpha85: "rgba(0, 0, 0, 0.85)",
  },
  typography: {
    fontSans: "font-sans",
    fontMono: "font-mono",
    scale: {
      micro: "text-[9px] font-mono",
      meta: "text-[10px] sm:text-xs",
      body: "text-xs sm:text-sm",
      subhead: "text-sm sm:text-base font-bold",
      headline: "text-base sm:text-lg font-black",
      display: "text-xl sm:text-2xl font-black font-mono",
    },
  },
  touch: {
    minSize: "min-h-[44px] min-w-[44px]",
    compactMinSize: "min-h-[36px]",
    thumbZonePadding: "pb-24 sm:pb-28",
  },
  radii: {
    xs: "rounded-md",
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
    full: "rounded-full",
    sheetTop: "rounded-t-3xl",
  },
  elevation: {
    subtle: "shadow-xs",
    medium: "shadow-md",
    large: "shadow-xl",
    sheet: "shadow-[0_-12px_40px_rgba(0,0,0,0.85)]",
    glowViolet: "shadow-[0_0_20px_rgba(139,92,246,0.35)]",
    glowBlood: "shadow-[0_0_20px_rgba(230,25,55,0.35)]",
    glowMint: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
  },
  zIndex: {
    radarGrid: 10,
    stickyHeader: 30,
    bottomSheetPeek: 35,
    bottomNavigation: 40,
    bottomSheetExpanded: 45,
    modalBackdrop: 50,
    modalHost: 60,
    toastNotification: 70,
  },
  motion: {
    springFast: "transition-all duration-200 ease-out",
    springNormal: "transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
    pulseTactile: "active:scale-[0.97]",
  },
} as const;

export type VesselColorToken = keyof typeof VESSEL_TOKENS.colors;
export type VesselTypographyToken = keyof typeof VESSEL_TOKENS.typography.scale;
