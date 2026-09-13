import { TacticalHotspot } from "@/types/vessel";

export const MOCK_HOTSPOTS: TacticalHotspot[] = [
  {
    id: "hotspot_01",
    name: "Darkroom Niceto / Club 69",
    category: "darkroom_club",
    address: "Niceto Vega 5510, Palermo",
    activeVesselsCount: 19,
    coordinates: {
      lat: -34.5885,
      lng: -58.4376,
    },
    geohash: "69y7pu2",
    description: "Espacio nocturno de alta intensidad carnal. Laberinto con baja iluminación, niebla densa y cabinas.",
    isCheckedIn: false,
  },
  {
    id: "hotspot_02",
    name: "Sauna Le Dôme // Cruising Lab",
    category: "sauna",
    address: "Honduras 4820, Palermo Soho",
    activeVesselsCount: 28,
    coordinates: {
      lat: -34.5912,
      lng: -58.4285,
    },
    geohash: "69y7pvg",
    description: "Sauna seco y vapor con sling room, cabinas privadas, duchas continuas y bar discreto.",
    isCheckedIn: false,
  },
  {
    id: "hotspot_03",
    name: "Bunker San Telmo // Leather Vault",
    category: "darkroom_club",
    address: "Defensa 1120, San Telmo",
    activeVesselsCount: 14,
    coordinates: {
      lat: -34.6205,
      lng: -58.3732,
    },
    geohash: "69y7x4s",
    description: "Espacio underground para fetiche, cuero, arneses y dinámicas de poder explícitas.",
    isCheckedIn: false,
  },
  {
    id: "hotspot_04",
    name: "Bosques de Palermo // Cruising Nocturno",
    category: "cruising_area",
    address: "Av. Infanta Isabel, Rosedal",
    activeVesselsCount: 33,
    coordinates: {
      lat: -34.5718,
      lng: -58.4162,
    },
    geohash: "69y7rcc",
    description: "Zona al aire libre con senderos arbolados, sombras profundas y encuentro relámpago.",
    isCheckedIn: false,
  },
  {
    id: "hotspot_05",
    name: "UnderBar Feliza // Lounge & Darkroom",
    category: "queer_bar",
    address: "Av. Córdoba 3271, Almagro",
    activeVesselsCount: 11,
    coordinates: {
      lat: -34.6011,
      lng: -58.4145,
    },
    geohash: "69y7pqe",
    description: "Espacio social previo al encuentro. Terraza, música electrónica y sótano con cuartos oscuros.",
    isCheckedIn: false,
  },
];
