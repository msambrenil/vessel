import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#09090B",
          deep: "#040405",
          surface: "#121216",
          card: "#18181D",
          hover: "#22222A",
        },
        // Token Primario Unificado (Electric Violet / Dark Luxury)
        // rawAmber se mapea a Electric Violet para transformar automáticamente todos los componentes existentes
        primary: {
          DEFAULT: "#8B5CF6",
          glow: "#A78BFA",
          dim: "#6D28D9",
          subtle: "rgba(139, 92, 246, 0.14)",
          border: "rgba(139, 92, 246, 0.35)",
        },
        // Anulación global del espectro Amber (anti-Grindr):
        // Mapeamos todas las clases amber-* de Tailwind a la gama Electric Violet / Nocturnal Violet
        // para garantizar que ningún componente o dependencia quede con el color amarillo original.
        amber: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#1A0F2E",
        },
        rawAmber: {
          DEFAULT: "#8B5CF6",
          glow: "#A78BFA",
          dim: "#6D28D9",
          subtle: "rgba(139, 92, 246, 0.14)",
          border: "rgba(139, 92, 246, 0.35)",
        },
        electricViolet: {
          DEFAULT: "#8B5CF6",
          glow: "#A78BFA",
          dim: "#6D28D9",
          subtle: "rgba(139, 92, 246, 0.14)",
          border: "rgba(139, 92, 246, 0.35)",
        },
        mintNeon: {
          DEFAULT: "#10B981",
          glow: "#34D399",
          dim: "#047857",
          subtle: "rgba(16, 185, 129, 0.14)",
          border: "rgba(16, 185, 129, 0.35)",
        },
        champagneGold: {
          DEFAULT: "#F59E0B",
          glow: "#FBBF24",
          dim: "#B45309",
          subtle: "rgba(245, 158, 11, 0.14)",
          border: "rgba(245, 158, 11, 0.35)",
        },
        bloodNeon: {
          DEFAULT: "#E61937",
          glow: "#FF2A4B",
          dim: "#8A021A",
          subtle: "rgba(230, 25, 55, 0.15)",
          border: "rgba(230, 25, 55, 0.4)",
        },
        concrete: {
          DEFAULT: "#24242B",
          dark: "#141418",
          mid: "#2A2A33",
          light: "#3F3F4D",
          border: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "primary-glow": "0 0 25px -2px rgba(139, 92, 246, 0.4)",
        "violet-glow": "0 0 25px -2px rgba(139, 92, 246, 0.4)",
        "violet-soft": "0 4px 20px 0 rgba(139, 92, 246, 0.22)",
        "mint-glow": "0 0 25px -2px rgba(16, 185, 129, 0.4)",
        "gold-glow": "0 0 20px -2px rgba(245, 158, 11, 0.4)",
        "amber-glow": "0 0 25px -2px rgba(139, 92, 246, 0.4)",
        "amber-soft": "0 4px 20px 0 rgba(139, 92, 246, 0.22)",
        "blood-glow": "0 0 25px -2px rgba(230, 25, 55, 0.4)",
        "card-elevation": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "radar-sweep": "radar-sweep 4s linear infinite",
        "spin-slow": "spin-slow 7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
