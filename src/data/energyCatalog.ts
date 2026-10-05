import { EnergyVibe, KindClosureMessage } from "@/types/vessel";

export interface EnergyVibeItem {
  id: EnergyVibe;
  label: string;
  emoji: string;
  description: string;
  tagColor: string; // Tailwind class
  accentHex: string;
}

export const ENERGY_VIBE_CATALOG: EnergyVibeItem[] = [
  {
    id: "fogoso",
    label: "Al hueso",
    emoji: "⚡",
    description: "Directo, sin vueltas, vamos a lo que vamos",
    tagColor: "bg-bloodNeon/15 border-bloodNeon/40 text-bloodNeon",
    accentHex: "#E61937",
  },
  {
    id: "suave",
    label: "Tranqui",
    emoji: "☕",
    description: "Cerveza, charla previa y mimos, sin apuro",
    tagColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
    accentHex: "#10B981",
  },
  {
    id: "emocional",
    label: "Pegar onda",
    emoji: "✨",
    description: "Piel, miradas y química para conectar",
    tagColor: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    accentHex: "#A855F7",
  },
  {
    id: "kinky",
    label: "Morbos / Fetiches",
    emoji: "⛓️",
    description: "Arnés, cuero, fantasías y fetiches sin tabú",
    tagColor: "bg-electricViolet/15 border-electricViolet/40 text-electricViolet-glow",
    accentHex: "#8B5CF6",
  },
  {
    id: "voyeur",
    label: "Mirón / Morbo visual",
    emoji: "👁️",
    description: "Mirar, mostrarse o sumarse a ver",
    tagColor: "bg-cyan-500/15 border-cyan-500/40 text-cyan-400",
    accentHex: "#06B6D4",
  },
  {
    id: "intenso",
    label: "Boliches y Lugares",
    emoji: "🍸",
    description: "Boliches, saunas, fiestas y noche",
    tagColor: "bg-pink-500/15 border-pink-500/40 text-pink-300",
    accentHex: "#EC4899",
  },
  {
    id: "jugueton",
    label: "Juegos & Rol",
    emoji: "🎭",
    description: "Dinámicas de poder, disfraces o roles",
    tagColor: "bg-pink-500/15 border-pink-500/40 text-pink-400",
    accentHex: "#EC4899",
  },
];

export const GENDER_IDENTITY_OPTIONS = [
  "Hombre Cis",
  "Hombre Trans",
  "No Binarie",
  "Queer",
  "Género Fluido",
  "Agénero",
  "Hombre",
  "Disidente u Otro",
] as const;

export const PRONOUN_OPTIONS = [
  "Él",
  "Elle",
  "Ella",
  "Él o Elle",
  "Cualquiera",
  "Preguntame",
] as const;

export const DESIRE_OPTIONS = [
  "Conexión carnal al palo",
  "Mimos, besos y calentura lenta",
  "Exploración de fetiches y morbo",
  "Dominación y marcar la cancha",
  "Entrega y sumisión consentida",
  "Previa, cerveza y buena música",
  "Morbo visual y contemplación",
  "Devoción oral plena",
  "Juegos de rol y fantasías",
  "Contacto físico sin etiquetas",
  "Sudor, entrenamiento y piel",
  "Sala oscura sin caretas",
] as const;

export const INTENTION_OPTIONS = [
  "Pinta algo ya (Inmediato)",
  "Solo por esta noche",
  "Vínculo frecuente sin vueltas",
  "Exploración libre y cuidada",
  "Charlar y ver qué onda",
  "Sin vueltas, lo que pinte",
  "Amistad y comunidad fetiche",
] as const;

export const BOUNDARY_OPTIONS = [
  "Sin fotos de cara (Cero exposición)",
  "Siempre con preservativo (Cuidado mutuo)",
  "Sin besos (Directo al grano)",
  "Cero dolor físico (Límites claros)",
  "Ambiente libre de humo y sustancias",
  "Respeto total a la palabra de seguridad",
  "Charlar los límites antes de arrancar",
  "Solo lugares limpios y de confianza",
  "Doble consentimiento explícito siempre",
] as const;

export const KIND_CLOSURE_MESSAGES: KindClosureMessage[] = [
  {
    id: "kc-1",
    title: "Sos un fuego",
    text: "Sos un fuego total, pero hoy no tengo chispa. ¡Gracias por la re buena onda y que tengas una gran noche!",
    emoji: "🔥",
  },
  {
    id: "kc-2",
    title: "Sigo de largo",
    text: "Che, sigo de largo por hoy. Gracias por escribir y la mejor onda.",
    emoji: "🚀",
  },
  {
    id: "kc-3",
    title: "Otra vibra",
    text: "Re linda vibra, pero hoy ando buscando otra cosa. Te libero el chat con todo el respeto. ✨",
    emoji: "✨",
  },
  {
    id: "kc-4",
    title: "Cierre con onda",
    text: "Me cayó re bien tu charla, pero hoy busco otra dinámica. ¡Éxitos con la búsqueda!",
    emoji: "🖤",
  },
  {
    id: "kc-5",
    title: "Paso por esta",
    text: "Paso por esta vuelta con la mejor. ¡Un gusto conectar y nos cruzamos en el radar!",
    emoji: "⚡",
  },
];

// ==========================================
// CATÁLOGO DE PROTOCOLOS DE CIERRE & LÍMITES
// ==========================================

import {
  BoundaryProtocolType,
  ChatBoundaryStatus,
  RadarBoundaryVisibility,
} from "@/types/vessel";

export interface BoundaryProtocolItem {
  id: BoundaryProtocolType;
  title: string;
  emoji: string;
  badge: string;
  tagColor: string;
  shortDesc: string;
  fullDesc: string;
  chatStatus: ChatBoundaryStatus;
  publicAlbumsVisible: boolean;
  privateVaultRevoked: boolean;
  radarVisibility: RadarBoundaryVisibility;
  karmaBonus?: number;
  recommendedFor: string;
}

export const BOUNDARY_PROTOCOLS_CATALOG: BoundaryProtocolItem[] = [
  {
    id: "cooldown",
    title: "Pausa Temporal",
    emoji: "🌿",
    badge: "MODO PAUSA",
    tagColor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
    shortDesc: "Silencia el chat sin cortar el lazo. Fotos públicas visibles.",
    fullDesc:
      "Silencia notificaciones acústicas y hápticas. Conserva el historial intacto y las fotos públicas. Bóvedas privadas quedan en pausa por seguridad.",
    chatStatus: "muted",
    publicAlbumsVisible: true,
    privateVaultRevoked: true,
    radarVisibility: "normal",
    recommendedFor: "Cuando necesitás espacio o no tenés batería social hoy.",
  },
  {
    id: "polite_archive",
    title: "Cierre Amable y Archivo",
    emoji: "🖤",
    badge: "CIERRE RESPETUOSO",
    tagColor: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    shortDesc: "Salida elegante en 1 toque. Chat en Solo Lectura. +5 Respeto.",
    fullDesc:
      "Envía automáticamente una salida cordial y clara. El chat se archiva en Solo Lectura (sin nuevos mensajes) y el perfil se muestra atenuado con dignidad.",
    chatStatus: "readonly",
    publicAlbumsVisible: true,
    privateVaultRevoked: true,
    radarVisibility: "attenuated",
    karmaBonus: 5,
    recommendedFor: "Incompatibilidad o desinterés mutuo con respeto total.",
  },
  {
    id: "stealth_fade",
    title: "Desvanecimiento Silencioso",
    emoji: "🌫️",
    badge: "MODO SIGILO",
    tagColor: "bg-neutral-500/15 border-neutral-500/40 text-neutral-300",
    shortDesc: "Sin confrontación. Mensajes a buzón secundario.",
    fullDesc:
      "Los mensajes del otro entran a un buzón silenciado sin alertas ni confirmación de lectura. Tu presencia en el radar aparece de incógnito.",
    chatStatus: "muted",
    publicAlbumsVisible: false,
    privateVaultRevoked: true,
    radarVisibility: "attenuated",
    recommendedFor: "Para evitar discusiones o ante insistencia sin agresión.",
  },
  {
    id: "hard_boundary",
    title: "Límite Estricto",
    emoji: "🛡️",
    badge: "LÍMITE ESTRICTO",
    tagColor: "bg-bloodNeon/15 border-bloodNeon/40 text-bloodNeon",
    shortDesc: "Desconexión total mutua. Álbumes y chat bloqueados.",
    fullDesc:
      "Cierra el canal permanentemente. Oculta todos los álbumes públicos y privados. Hace invisible tu posición en el radar e incluye botón de reporte rápido.",
    chatStatus: "disconnected",
    publicAlbumsVisible: false,
    privateVaultRevoked: true,
    radarVisibility: "hidden",
    recommendedFor: "Falta de respeto a las palabras de seguridad, acoso o transgresión del consentimiento.",
  },
];

export interface KinkItemDefinition {
  id: string;
  name: string;
  category: "bdsm" | "sensual" | "roleplay" | "dynamics" | "safety" | "gear" | "bodily";
  emoji: string;
  description: string;
  isActive?: boolean;
  isCustom?: boolean;
}

export const KINK_ITEMS_CATALOG: KinkItemDefinition[] = [
  { id: "armpits", name: "Axilas", category: "bodily", emoji: "💪", description: "Veneración, oler y lamer axilas masculinas con sudor natural" },
  { id: "musk", name: "Olor corporal", category: "bodily", emoji: "👃", description: "Atracción por feromonas masculinas, sudor y aromas corporales intensos" },
  { id: "jockstrap", name: "Suspensores", category: "gear", emoji: "🩲", description: "Fetiche por suspensores deportivos, elásticos y prendas atléticas" },
  { id: "thongs", name: "Lencería masculina", category: "gear", emoji: "👙", description: "Uso o devoción por prendas ceñidas, seda, encajes o tangas" },
  { id: "sweaty_gear", name: "Ropa transpirada y medias", category: "gear", emoji: "🎽", description: "Prendas usadas de gimnasio, medias deportivas y camisetas transpiradas" },
  { id: "feet", name: "Pies", category: "sensual", emoji: "👣", description: "Fascinación y culto por los pies, masajes y caricias" },
  { id: "body_worship", name: "Veneración corporal", category: "sensual", emoji: "🛐", description: "Besos y culto devocional a músculos, pecho, bíceps y glúteos" },
  { id: "bears", name: "Hombres con vello", category: "sensual", emoji: "🐻", description: "Fascinación por vello corporal abundante, robustez y corpulencia" },
  { id: "leather", name: "Cuero y arnés", category: "gear", emoji: "🥋", description: "Estética y prendas de cuero, arneses, correas y botas" },
  { id: "rubber", name: "Látex y goma", category: "gear", emoji: "🥽", description: "Brillo, tacto hermético y aroma de trajes de goma y látex" },
  { id: "uniforms", name: "Uniformes", category: "roleplay", emoji: "👮", description: "Prendas de autoridad, deporte, construcción o tácticas" },
  { id: "bdsm", name: "BDSM", category: "bdsm", emoji: "⛓️", description: "Dominación, sumisión y dinámicas de poder explícitas" },
  { id: "bondage", name: "Ataduras y cuerdas", category: "bdsm", emoji: "🪢", description: "Inmovilización consensuada con cuerdas, arnés o correas" },
  { id: "spanking", name: "Azotes", category: "bdsm", emoji: "✋", description: "Impacto físico erótico, paletas o manos desnudas" },
  { id: "choking", name: "Control de respiración", category: "bdsm", emoji: "🛑", description: "Juegos consensuados de respiración con extrema seguridad" },
  { id: "chastity", name: "Castidad", category: "bdsm", emoji: "🗝️", description: "Bloqueo de erección con dispositivo de castidad y control del placer" },
  { id: "fisting", name: "Dilatación profunda", category: "dynamics", emoji: "✊", description: "Penetración manual profunda, relajación total y confianza extrema" },
  { id: "waterplay", name: "Lluvia dorada", category: "bodily", emoji: "💧", description: "Juegos eróticos con orina, desinhibición total y marcado de territorio" },
  { id: "verbal", name: "Charla sucia", category: "roleplay", emoji: "🗣️", description: "Lenguaje procaz explícito, humillación consentida y sumisión verbal" },
  { id: "cruising", name: "Encuentros al aire libre", category: "dynamics", emoji: "🌲", description: "Encuentros espontáneos al aire libre o zonas de tránsito" },
  { id: "darkroom", name: "Sala oscura", category: "dynamics", emoji: "🌑", description: "Anonimato en penumbra total, tacto y pulsión sensorial" },
  { id: "gloryhole", name: "Cabina anónima", category: "dynamics", emoji: "🕳️", description: "Placer anónimo a través de barreras físicas" },
  { id: "group", name: "Encuentros grupales", category: "dynamics", emoji: "👥", description: "Encuentros de más de 2 personas, tríos o dinámicas colectivas" },
  { id: "cuckold", name: "Tercero dominante", category: "dynamics", emoji: "🐂", description: "Dinámica donde un tercero dominante toma a uno frente a su pareja" },
  { id: "voyeurism", name: "Voyeurismo", category: "dynamics", emoji: "👁️", description: "Ver a otros tener intimidad con consentimiento" },
  { id: "exhibitionism", name: "Exhibicionismo", category: "dynamics", emoji: "🪞", description: "Ser observado mientras disfrutás o te tocás" },
  { id: "roleplay", name: "Juego de rol", category: "roleplay", emoji: "🎭", description: "Escenarios de personajes, jerarquías y fantasías actuadas" },
  { id: "daddy_boy", name: "Roles de edad", category: "roleplay", emoji: "🧔", description: "Diferencia de edad, roles paternales, autoridad y protección erotizada" },
  { id: "pup_play", name: "Juego de cachorros", category: "roleplay", emoji: "🐶", description: "Dinámica de juego de rol canino, cachorros y cuidadores" },
  { id: "edging", name: "Control del clímax", category: "sensual", emoji: "⏳", description: "Postergación del orgasmo prolongando la tensión" },
  { id: "toys", name: "Juguetes eróticos", category: "sensual", emoji: "⚡", description: "Incorporación de juguetes eróticos y estimulación prostática" },
  { id: "sensual_slow", name: "Masaje y tántrico", category: "sensual", emoji: "🕯️", description: "Caricias lentas, aceites corporales y respiración compartida" },
  { id: "rough", name: "Intensidad ruda", category: "dynamics", emoji: "💥", description: "Intensidad física alta, empujones y fuerza pactada" },
  { id: "bareback", name: "Sin preservativo (con PrEP)", category: "safety", emoji: "🛡️", description: "Encuentros sin preservativo bajo protocolo preventivo biomédico" },
  { id: "condom_only", name: "Preservativo obligatorio", category: "safety", emoji: "🔒", description: "Uso estricto de preservativo y barreras de látex sin excepción" },
];
