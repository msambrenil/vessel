export type BodyState = "open" | "occupied" | "dormant";

export type RoleType =
  | "Top"
  | "Bottom"
  | "Versatile"
  | "Vers Top"
  | "Vers Bottom"
  | "Side"
  | "Dominant"
  | "Submissive"
  | "Oral Focus";

export type MobilityType =
  | "Pongo casa 🏠"
  | "Voy a la tuya / Viajo 🚗"
  | "Pongo casa o viajo 🏠/🚗"
  | "En boliche / cruising / telo"
  | "Tengo depto / lugar"
  | "Me muevo / voy"
  | "Tengo lugar y me muevo"
  | "En boliche / darkroom / cruising"
  | "Tengo sitio"
  | "Me muevo"
  | "Tengo sitio/me desplazo"
  | "En club / darkroom";

export type HivStatusType =
  | "VIH Negativo"
  | "Negativo en PrEP"
  | "Positivo Indetectable (I=I)"
  | "VIH Positivo"
  | "Lo charlamos por privado"
  | "VIH negativo"
  | "Negativo bajo PrEP"
  | "Positivo Indetectable"
  | "VIH positivo"
  | "Lo guardo para mí";

export type YoSoyType =
  | "Musculoso / Gym"
  | "Leather / Arnés"
  | "Nutria / Peludo"
  | "Oso / Bear"
  | "Atlético / Deportista"
  | "Twink / Joven"
  | "Maduro / Daddy"
  | "Dominante / Amo"
  | "Sumiso / Entregado"
  | "Pup / Fetish"
  | "Discreto / Perfil bajo"
  | "Morbo / Carnal"
  | "Musculado / Gym"
  | "Nutria / Otter"
  | "Atlético / Jock"
  | "Joven / Twink"
  | "Dominante / Master"
  | "Receptivo / Sub"
  | "Discreto / Casual"
  | "Darkroom / Carnal";

export type IntensityLevel = 1 | 2 | 3 | 4; // 1: Sensual, 2: Carnal, 3: Raw, 4: Extreme

export interface KinkTag {
  id: string;
  label: string;
  category: "gear" | "intensity" | "fetish" | "scene" | "dynamic";
  color?: string;
}

export interface PrivateVaultItem {
  id: string;
  url: string;
  blurredUrl: string;
  caption: string;
  isUnlocked?: boolean;
  mediaType?: "photo" | "video";
  durationSeconds?: number;
}

export type AlbumPrivacy = "public" | "private";

export type MediaType = "photo" | "video";

export interface AlbumPhoto {
  id: string;
  url: string;
  blurredUrl?: string;
  caption?: string;
  createdAt: string;
  mediaType?: "photo" | "video";
  durationSeconds?: number;
  thumbnailUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface UserAlbum {
  id: string;
  title: string;
  description?: string;
  privacy: AlbumPrivacy;
  coverUrl?: string;
  photos: AlbumPhoto[];
  createdAt: string;
  sharedWithProfileIds?: string[];
}

export type UserSubscriptionTier = "free" | "unlimited" | "pro";

export type VerificationMethod =
  | "biometric_liveness"
  | "biometric_3d"
  | "oauth_google"
  | "id_document"
  | "email"
  | "phone_sms";

export interface IdentityVerification {
  isVerified: boolean;
  method?: VerificationMethod;
  verifiedAt?: string;
  hasFacialPrivacy: boolean; // True si optó por un avatar estilizado para proteger su identidad visual pública
  badgeLabel: string; // Ej: "ID VERIFIED // HUMANO REAL"
  trustScore: number; // 99% - 100%
  certificateHash?: string; // Hash criptográfico de verificación Zero-Knowledge
}

export interface StyledAvatar {
  id: string;
  name: string;
  category: "leather" | "neon" | "silhouette" | "cyber" | "darkroom";
  url: string;
  description: string;
}

export type EncounterValidationMethod = "geofencing" | "rendezvous_pin" | "chat_agreement";
export type TestimonialStatus = "approved" | "pending" | "hidden" | "rejected";

export interface EncounterTestimonial {
  id: string;
  authorId: string;
  authorCodename: string;
  authorAvatar: string;
  content: string;
  tags: string[];
  createdAt: string;
  rating?: number; // 1 to 5 estrellas
  karmaAwarded?: number; // Puntos de Respect Karma aportados (+5, etc.)
  validationMethod?: EncounterValidationMethod;
  status: TestimonialStatus;
  encounterVerified?: boolean;
}

export interface EncounterRecord {
  profileId: string;
  validatedAt: string;
  method: EncounterValidationMethod;
  isCompleted: boolean;
}

export type EnergyVibe =
  | "fogoso"
  | "suave"
  | "emocional"
  | "kinky"
  | "voyeur"
  | "intenso"
  | "jugueton";

export interface KindClosureMessage {
  id: string;
  title: string;
  text: string;
  emoji: string;
}

export type GenderInterest = "gay" | "bi" | "trans" | "cis" | "non_binary" | "all";

export interface VesselProfile {
  id: string;
  codename: string;
  age: number;
  showAge: boolean; // Control para mostrar/ocultar edad
  twitterHandle?: string; // Nickname de X (opcional)
  yoSoy: YoSoyType; // Opción Yo Soy
  mobility: MobilityType; // Movilidad
  hivStatus: HivStatusType; // Estado VIH
  genderIdentity?: string; // Identidad de género (ej: "Hombre Cis", "No Binarie", "Queer", etc.)
  orientation?: string; // Orientación sexual / Colectivo (ej: "Gay", "Bisexual", "Queer", etc.)
  genderInterests?: GenderInterest[]; // Intereses de encuentro definidos por el usuario
  pronouns?: string; // Pronombres (ej: "Él / He", "Elle / They", etc.)
  desires?: string[]; // Deseos y fantasías (ej: "Conexión carnal intensa", "Sensualidad pausada")
  intentions?: string[]; // Intenciones (ej: "Ahora mismo", "Solo esta noche", "Follamigos")
  boundaries?: string[]; // Límites y consentimientos (ej: "Sin fotos de cara", "Solo con protección")
  energyVibes?: EnergyVibe[]; // Filtros de energía deseada (ej: ["fogoso", "kinky"])
  respectScore?: number; // Puntuación de respeto / Anti-Ghosteo (0 a 100)
  isAntiGhost?: boolean; // True si posee la insignia Anti-Fantasma
  responseRateMinutes?: number; // Tiempo promedio de respuesta en minutos
  distanceMeters: number;
  bodyState: BodyState;
  role: RoleType;
  heightCm: number;
  weightKg: number;
  bodyArchetype: string;
  intensity: IntensityLevel;
  hosting: MobilityType;
  tagline: string;
  statement: string;
  avatarUrl: string;
  isStylizedAvatar?: boolean; // True si usa un avatar estilizado para proteger privacidad facial
  isFogMode?: boolean; // True si la foto de perfil está en Modo Niebla (difuminada para privacidad)
  isCurrentUser?: boolean; // True si corresponde al usuario activo de la app
  verification: IdentityVerification; // Sistema de Verificación de Identidad Digital
  totalEncountersVerified: number; // Contador total público de verificaciones de encuentros físicos
  galleryUrls: string[];
  privateVault: PrivateVaultItem[];
  testimonials: EncounterTestimonial[];
  kinks: string[];
  healthStatus: {
    prep: boolean;
    testedDate: string;
    details: string;
  };
  audioNote?: {
    duration: string;
    label: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  geohash?: string; // Geohash jerárquico (Precisión 7 / 8)
  s2CellId?: string; // Token de celda S2 representativo
  discretizedDistance?: DiscretizedDistance; // Distancia procesada y ofuscada para protección anti-triangulación
  hostCard?: HostCardInfo; // Ficha de Hospedaje Táctica
  voiceVibe?: VoiceSnippet; // Audio de voz de 5 segundos con ecualizador
  exitProtocol?: ExitProtocol; // Expectativa de salida post-encuentro
  isLivenessVerified?: boolean; // Validación biométrica 3D anti-catfish
  livenessVerifiedDate?: string; // Fecha del último escaneo biométrico
  isDuo?: boolean; // Modo Pareja / Dúo
  duoInfo?: DuoLink; // Información de la pareja vinculada
  onTheClock?: OnTheClockState; // Estado táctico "Listo Ahora Mismo"
  kinkMatrix?: KinkMatrixMap; // Preferencias secretas en la Kink Matrix
  ambientVibe?: AmbientSoundVibeType; // Clima sonoro / Frecuencia de hospedaje
  isStealth?: boolean; // Modo submarino / Espectro
  hasSafetyAlert?: boolean; // Alerta de centinela preventivo
  substanceAtmosphere?: SubstanceAtmosphere; // Atmósfera de sustancias ('sober' | 'social_drinks' | 'green_420' | 'party_play')
  nightlifeCheckin?: EventCheckin; // Check-in activo en evento o boliche
  userPlan?: UserSubscriptionTier; // Plan de suscripción ('free' | 'unlimited' | 'pro')
  isUnlimited?: boolean; // Flag de membresía activa VESSEL UNLIMITED
}

export interface FilterState {
  bodyStates: BodyState[];
  roles: RoleType[];
  minIntensity: number;
  maxDistanceKm: number;
  immediateHostOnly: boolean;
  selectedKinks: string[];
  energyVibes: EnergyVibe[];
  onlyAntiGhost: boolean;
  searchQuery: string;
  substanceAtmospheres?: SubstanceAtmosphere[];
  nightlifeEventId?: string | null;
  onlyVerified?: boolean;
  onlyMutualKinks?: boolean;
  genderInterests?: GenderInterest[];
}

export interface RendezvousPin {
  id: string;
  profileId: string;
  profileCodename: string;
  locationName: string;
  distanceMeters: number;
  expiresInMinutes: number;
  instructions: string;
}

export type ChatMediaMode = "permanent" | "view_once" | "privacy_blur" | "timed_expiry";

export interface ChatMediaAttachment {
  url: string;
  mediaType: "photo" | "video";
  caption?: string;
  mode: ChatMediaMode;
  isViewed?: boolean;
  isBurned?: boolean;
  isRevoked?: boolean;
  revokedAt?: string;
  expiresInMinutes?: number;
  expiresAt?: string;
  sharedAlbumId?: string;
  albumTitle?: string;
  albumPhotoCount?: number;
  albumPrivacy?: "public" | "private";
  albumPhotosPreview?: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaAttachment?: ChatMediaAttachment;
  isBurnOnView?: boolean;
  isBurned?: boolean;
  isRevoked?: boolean;
  revokedAt?: string;
  isKindClosure?: boolean; // True si fue enviado mediante el protocolo de salida amable Anti-Ghost
  timestamp: string;
  isRendezvousPin?: boolean;
  rendezvousData?: RendezvousPin;
  isCancelledRendezvous?: boolean;
  isPreFlightChecklist?: boolean;
  preFlightData?: PreFlightChecklist;
  isEnRouteAlert?: boolean;
  enRouteData?: { etaMinutes: number; status: "started" | "arrived" | "cancelled" };
  isRead?: boolean;
  isSecureWaypoint?: boolean;
  waypointData?: SecureWaypoint;
  isItsExposureAlert?: boolean;
  itsExposureData?: ItsExposureAlert;
  isVoiceMessage?: boolean;
  voiceData?: {
    audioUrl: string; // data URI base64 para persistencia en localStorage
    durationSeconds: number;
    waveform: number[]; // Alturas normalizadas [20, 80, 45, 100, 60...]
  };
}

// ==========================================
// DIARIO DE CITAS & CALENDARIO INTELIGENTE
// ==========================================

export type DiaryLocationCategory =
  | "my_place"
  | "their_place"
  | "club_darkroom"
  | "bar_lounge"
  | "hotel"
  | "outdoor_cruising"
  | "other";

export type DiaryEncounterType =
  | "casual"
  | "intense_carnal"
  | "first_date"
  | "darkroom_session"
  | "kink_leather"
  | "regular_playmate"
  | "chill_talk";

export type DiaryWouldRepeat = "yes" | "maybe" | "never" | "only_darkroom";

export interface DiaryLocation {
  name: string; // Ej: "Darkroom KitKat Club", "Apartamento Kreuzberg"
  category: DiaryLocationCategory;
  address?: string;
  notes?: string;
}

export interface DiarySatisfaction {
  expectationsRating: number; // 1 to 5 (1: Muy baja, 5: Superó todas las expectativas)
  chemistryLevel: number; // 1 to 5
  boundariesRespect: number; // 1 to 5
  overallScore: number; // 1 to 5
  wouldRepeat: DiaryWouldRepeat;
}

export interface DiaryPersonProfile {
  profileId?: string; // Vinculado a un VesselProfile existente
  codename: string;
  avatarUrl?: string;
  age?: number;
  role?: RoleType;
  yoSoy?: YoSoyType;
  privateNotes?: string; // Notas privadas locales sobre la persona
  isExternalProfile?: boolean; // True si es un contacto añadido manualmente
}

export interface DiaryEntry {
  id: string;
  person: DiaryPersonProfile;
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:mm
  isUpcoming: boolean; // True si es cita programada a futuro en el calendario
  location: DiaryLocation;
  encounterType: DiaryEncounterType;
  satisfaction?: DiarySatisfaction; // Opcional si es futura o aún no evaluada
  privateNotes: string; // Bitácora personal privada confidencial
  tags: string[]; // Ej: ["Química Brutal", "Puntual", "Protección Acordada", "Darkroom"]
  healthRoutineReminder?: {
    enabled: boolean;
    dueDate: string; // Ej: "2026-11-23" para control a 90 días
    testType: "prep_screening" | "general_check" | "follow_up";
    isResolved?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DiaryStats {
  totalEncounters: number;
  averageSatisfaction: number;
  averageChemistry: number;
  repeatPercentage: number;
  topLocationCategory: string;
  upcomingDatesCount: number;
  pendingHealthChecksCount: number;
}

// ==========================================
// ARQUITECTURA GEOESPACIAL & MOTOR DE BATERÍA
// ==========================================

export type GeoPrivacyLevel =
  | "exact_discretized" // Discretización Haversine (<100m, ~300m...)
  | "geohash_cell_150m" // Anclaje a celda Geohash 7 (~152m)
  | "strict_stealth"; // Ocultamiento total de distancia relativa

export type BatteryMode =
  | "foreground_active" // Primer plano: GPS Alta precisión (15-30s) + Animación
  | "background_coarse" // Segundo plano: Red/Wi-Fi (15 min) + Animación pausada
  | "passive_geofence" // Modo Reposo: Solo disparos por cruce de celda Geohash
  | "eco_saver"; // Ahorro Batería (<20% o manual): Throttling y renderizado estático

export interface BatteryEngineState {
  mode: BatteryMode;
  level: number; // 0 a 100%
  isCharging: boolean;
  lastSampledAt: string;
  updateIntervalSeconds: number;
  highAccuracyGps: boolean;
  autoEcoActive: boolean;
  hasHardwareApi?: boolean;
}

export interface VesselPaymentReceipt {
  id: string;
  tier: "annual" | "monthly" | "weekend" | "party";
  planName: string;
  amount: number;
  currency: string;
  timestamp: string;
  cardBrand?: string;
  cardLast4?: string;
  paymentMethod: "card" | "mercadopago" | "apple_pay" | "google_pay";
  authCode: string;
  status: "approved";
}

export type DiscretizedDistanceRange =
  | "<50m"
  | "50-150m"
  | "150-300m"
  | "300-600m"
  | "600m-1.2km"
  | "1.2-2.5km"
  | ">2.5km";

export interface DiscretizedDistance {
  rawMeters: number;
  displayLabel: string; // ej: "< 50 m // Inmediato", "~150 m", "~300 m", "~1 km"
  rangeCategory: DiscretizedDistanceRange;
  isObfuscated: boolean;
}

export interface GeohashCell {
  hash: string; // ej: "u33d7x"
  s2Token?: string; // ej: "479a0b"
  precision: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  neighbors: string[]; // 8 celdas circundantes
}

// ==========================================
// PROTOCOLOS DE CIERRE & LÍMITES GRADUALES (ANTI-GHOST)
// ==========================================

export type BoundaryProtocolType =
  | "cooldown" // Pausa Temporal / Enfriamiento (24h, 48h, 7d)
  | "polite_archive" // Cierre Amable Definitivo & Solo Lectura (+5 Respeto)
  | "stealth_fade" // Desvanecimiento Silencioso / Shadow Stealth
  | "hard_boundary" // Límite Estricto / Cortafuegos Total
  | "custom"; // Ajuste Fino Personalizado

export type ChatBoundaryStatus =
  | "active" // Chat abierto normal
  | "muted" // Silenciado (sin notificaciones de 45Hz)
  | "readonly" // Archivado / Solo lectura (no permite nuevos mensajes)
  | "disconnected"; // Desconectado / Bloqueado

export type RadarBoundaryVisibility =
  | "normal" // Visible normal en radar/matriz
  | "attenuated" // Atenuado / Ghost-Signal ("Conexión Finalizada")
  | "hidden"; // Oculto / Invisible en radar

export interface UserBoundarySetting {
  targetProfileId: string;
  protocol: BoundaryProtocolType;
  chatStatus: ChatBoundaryStatus;
  publicAlbumsVisible: boolean;
  privateVaultRevoked: boolean;
  radarVisibility: RadarBoundaryVisibility;
  cooldownUntil?: string; // Fecha ISO si aplica pausa temporal
  reason?: string;
  appliedAt: string;
  kindClosureMessageSent?: string;
}

// ==========================================
// CONFIGURACIÓN DE LA APP & MULTI-IDIOMA
// ==========================================

export type SupportedLanguage = "es" | "en";
export type UnitSystem = "metric" | "imperial";

export interface AppSettings {
  language: SupportedLanguage;
  unitSystem: UnitSystem;
  cloudSyncEnabled: boolean;
  lastCloudSyncAt?: string;
  autoBackupEnabled: boolean;
  lastBackupAt?: string;
  soundEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  highPrecisionGps: boolean;
  antiTriangulationStrict: boolean;
  chatRetentionMode?: "ephemeral" | "persistent";
}

// ==========================================
// DOSSIER PRIVADO & NOTAS CONFIDENCIALES
// ==========================================

export type ProfileRankingTier = "S" | "A" | "B" | "C" | "D" | "F";

export interface ProfileDossier {
  profileId: string;
  customAlias?: string; // Nombre / apodo personalizado que le da el usuario (ej: "Nico (Gym)")
  privateNotes?: string; // Notas privadas, tips, dirección, recordatorios
  rating?: number; // 1 a 5 estrellas
  rankingTier?: ProfileRankingTier; // Tier táctico (S/A/B/C/D/F)
  redFlags: string[]; // Banderas rojas / alertas preventivas
  greenFlags: string[]; // Banderas verdes / puntos positivos
  updatedAt: string; // ISO timestamp
}

// ==========================================
// SISTEMA DE PULSOS & NAVEGACIÓN
// ==========================================

export type ActiveNavView = "grid" | "pulses" | "chat" | "diary" | "account";

export interface ReceivedPulse {
  id: string;
  fromProfileId: string;
  timestamp: string; // ISO string
  isRead: boolean;
  returned?: boolean; // True si el usuario ya le devolvió el pulso
}

// ==========================================
// 1. FICHA DE HOSPEDAJE TÁCTICA (HOST CARD)
// ==========================================

export type HostLivingArrangement = "solo" | "roommates" | "partner_aware" | "hotel" | "other";
export type HostSpaceType = "private_apt" | "shared_apt" | "private_room" | "hotel_room";
export type HostPets = "none" | "friendly_dog" | "friendly_cat" | "other";

export interface HostAmenities {
  cleanTowels: boolean;
  showerReady: boolean;
  elevator: boolean;
  easyParking: boolean;
  acOrHeating: boolean;
}

export interface HostSupplies {
  condoms: boolean;
  lube: boolean;
  poppers: boolean;
  wipes: boolean;
}

export interface HostCardInfo {
  hasPlace: boolean;
  livingArrangement: HostLivingArrangement;
  spaceType: HostSpaceType;
  amenities: HostAmenities;
  pets: HostPets;
  supplies: HostSupplies;
  notes?: string;
  updatedAt?: string;
  ambientVibe?: AmbientSoundVibeType;
}

// ==========================================
// 2. PRE-FLIGHT CHECKLIST (SINTONÍA SEXUAL)
// ==========================================

export type PreFlightTempo = "sensual_slow" | "fast_carnal" | "rough_dom" | "chill";
export type PreFlightProtection = "condoms" | "bareback_prep" | "prep_doxypep" | "undetectable" | "discuss";
export type PreFlightVibe = "100_sober" | "drinks" | "420_friendly";

export interface PreFlightChecklist {
  id: string;
  senderId: string;
  receiverId: string;
  tempo: PreFlightTempo;
  dynamics: string[]; // ["oral_focus", "penetration", "massage", "kink_gear", "sensual_touch"]
  protection: PreFlightProtection;
  vibe: PreFlightVibe;
  isMutualMatch?: boolean;
  createdAt: string;
}

// ==========================================
// 3. VOICE VIBE (AUDIO 5 SEGUNDOS)
// ==========================================

export interface VoiceSnippet {
  id: string;
  audioUrl: string;
  durationSeconds: number;
  waveform: number[]; // Alturas normalizadas [20, 80, 45, 100, 60...]
  recordedAt: string;
  label?: string;
}

// ==========================================
// 4. MODO "VOY EN CAMINO" (EN-ROUTE TELEMETRY)
// ==========================================

export interface EnRouteState {
  isActive: boolean;
  targetProfileId: string | null;
  targetCodename: string | null;
  startedAt: string | null;
  etaMinutes: number;
  distanceMeters: number;
  isArrived: boolean;
  destinationCoords?: { lat: number; lng: number };
}

// ==========================================
// 5. GUARDIÁN SILENCIOSO & DEAD-MAN SWITCH
// ==========================================

export interface SafetyBeaconState {
  isActive: boolean;
  durationMinutes: number;
  startedAt: string | null;
  expiresAt: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyTelegramUser?: string;
  lastLocationText: string;
  targetProfileCodename: string;
  pinCode: string; // PIN para apagar el guardián
  duressCode: string; // PIN de coacción que dispara pánico y abre bloc de notas
  isAlarmTriggered: boolean;
}

// ==========================================
// 6. ICONO CAMALEÓN & PANTALLA DE COBERTURA
// ==========================================

export type AppDisguiseMode = "normal" | "notes" | "calculator" | "weather";

export interface AppDisguiseConfig {
  mode: AppDisguiseMode;
  flipToCoverEnabled: boolean;
  tripleTapHeaderEnabled: boolean;
}

// ==========================================
// 7. EXPECTATIVA DE SALIDA (EXIT PROTOCOL)
// ==========================================

export type ExitProtocol = "fast_encounter" | "chill_cuddle" | "sleepover";

// ==========================================
// 8. SALUD SEXUAL & BOTIQUÍN DOXY-PEP
// ==========================================

export interface DoxyPepTracker {
  id: string;
  encounterId?: string;
  partnerCodename: string;
  encounterDate: string; // YYYY-MM-DD
  encounterTime: string; // HH:mm
  due24h: string; // ISO
  due72h: string; // ISO
  taken24h: boolean;
  taken72h: boolean;
  isDismissed: boolean;
  createdAt: string;
}

// ==========================================
// 9. SALAS DE SESIÓN & MODO DÚO
// ==========================================

export type SessionRoomCategory = "trio" | "group_session" | "kink_lab" | "chill_hangout";

export interface SessionRoom {
  id: string;
  hostProfileId: string;
  hostCodename: string;
  hostAvatarUrl: string;
  title: string;
  description: string;
  category: SessionRoomCategory;
  capacity: number;
  guestIds: string[];
  locationName: string;
  isActive: boolean;
  createdAt: string;
}

export interface DuoLink {
  isLinked: boolean;
  partnerProfileId: string | null;
  partnerCodename: string | null;
  partnerAvatarUrl: string | null;
  jointTitle: string | null;
}

// ==========================================
// 10. MAPA DE CALOR TÁCTICO & HOTSPOTS
// ==========================================

export type HotspotCategory = "sauna" | "darkroom_club" | "cruising_area" | "queer_bar";

export interface TacticalHotspot {
  id: string;
  name: string;
  category: HotspotCategory;
  address: string;
  activeVesselsCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  geohash: string;
  description: string;
  isCheckedIn: boolean;
}

// ==========================================
// 11. AUDITORÍA DE BÓVEDAS PRIVADAS
// ==========================================

export interface VaultAuditLog {
  id: string;
  vaultTitle: string;
  viewerProfileId: string;
  viewerCodename: string;
  viewerAvatarUrl: string;
  timestamp: string; // ISO string
  durationSeconds: number;
}

// ==========================================
// 12. RADAR DE TELEPORTACIÓN (TRAVEL MODE)
// ==========================================

export interface TravelModeConfig {
  isActive: boolean;
  cityName: string;
  country: string;
  virtualCoords: {
    lat: number;
    lng: number;
  };
}

// ==========================================
// 13. RADAR ON-THE-CLOCK (DISPONIBILIDAD INMEDIATA)
// ==========================================

export interface OnTheClockState {
  isActive: boolean;
  expiresAt: string | null; // Timestamp ISO de expiración
  durationMinutes: number; // 15, 30, 45
  statusNote?: string; // Ej: "Listo en 10 min // Tengo lugar"
  startedAt?: string;
}

// ==========================================
// 14. WAYPOINT SEGURO (LIBERACIÓN EN 2 FASES)
// ==========================================

export interface SecureWaypoint {
  id: string;
  senderId: string;
  senderCodename: string;
  receiverId: string;
  phase1PublicCorner: string; // Ej: "Av. Santa Fe y Callao (Frente a la farmacia)"
  phase2ExactAddress: string; // Ej: "Piso 4 Depto B, Timbre 12"
  phase2AccessNotes?: string; // Ej: "Portón negro, ascensor a la izquierda"
  isPhase2Unlocked: boolean;
  unlockedAt?: string;
  isCancelled: boolean;
  createdAt: string;
}

// ==========================================
// 15. KINK MATRIX CIEGA (SECRET DESIRE SYNC)
// ==========================================

export type KinkPreferenceLevel = "love" | "curious" | "pass";
export type KinkMatrixMap = Record<string, KinkPreferenceLevel>;

export interface KinkMutualMatch {
  kinkId: string;
  myPreference: KinkPreferenceLevel;
  theirPreference: KinkPreferenceLevel;
}

// ==========================================
// 16. SOUNDTRACK & AMBIENT SYNCHRO
// ==========================================

export type AmbientSoundVibeType =
  | "subbass_50hz"
  | "dark_techno"
  | "berlin_industrial"
  | "sensual_downtempo"
  | "ambient_chill";

export interface HostAmbientVibeInfo {
  type: AmbientSoundVibeType;
  label: string;
  description: string;
  frequencyHz?: number;
  bpm?: number;
}

// ==========================================
// 17. PASE DE FIN DE SEMANA (WEEKEND WARRIOR PASS)
// ==========================================

export interface WeekendPassState {
  isActive: boolean;
  expiresAt: string | null; // ISO timestamp
  purchasedAt?: string;
}

// ==========================================
// 18. ASISTENTE DE REDUCCIÓN DE DAÑOS (HARM REDUCTION)
// ==========================================

export interface HarmReductionDose {
  id: string;
  timestamp: string; // HH:mm
  substanceLabel: string;
  notes?: string;
}

export interface HarmReductionSession {
  isActive: boolean;
  startedAt: string | null;
  waterIntervalMinutes: number; // 45 min default
  lastWaterPromptAt: string | null;
  totalWaterCups: number;
  doses: HarmReductionDose[];
}

// ==========================================
// 19. ALERTA ANÓNIMA DE EXPOSICIÓN A ITS
// ==========================================

export type ItsExposureType =
  | "syphilis"
  | "gonorrhea"
  | "chlamydia"
  | "mpox"
  | "hepatitis_a"
  | "other";

export interface ItsExposureAlert {
  id: string;
  conditionType: ItsExposureType;
  conditionLabel: string;
  diagnosedDate: string; // YYYY-MM-DD
  anonymousToken: string; // Token irreversible
  sentAt: string;
  adviceText: string;
}

// ==========================================
// 20. ATMÓSFERA DE SUSTANCIAS (SUBSTANCE ATMOSPHERE)
// ==========================================

export type SubstanceAtmosphere =
  | "sober"          // 🛡️ Sobrio / Clean (Cero sustancias, sobriedad)
  | "social_drinks"  // 🍸 Tragos & Previa (Alcohol social, cócteles, vino, cerveza)
  | "green_420"      // 🍃 420 Friendly (Cannabis, porro, vape, edibles)
  | "party_play";    // ⚡ Party & Play (Sesión intensa, chemsex consentido con reducción de daños)

// ==========================================
// 21. SUITE NIGHTLIFE, EVENTOS Y BOLICHES
// ==========================================

export type ClubZoneType =
  | "dancefloor"    // 📍 Pista Principal
  | "bar"           // 🍸 Barra Principal
  | "smoking_patio" // 🚬 Patio / Fumadero
  | "darkroom"      // 🌑 Darkroom / Zona Roja
  | "bathrooms";    // 🚻 Zona de Baños

export interface NightlifeEvent {
  id: string;
  name: string;
  venueName: string;
  address: string;
  neighborhood: string;
  city: string;
  dateLabel: string;
  timeRange: string;
  genre: string;
  coverPriceEstimate?: string;
  description: string;
  flyerUrl: string;
  isHotTonight?: boolean;
  activeAttendeesCount: number;
  confirmedAttendees: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  hasDarkroom?: boolean;
}

export interface EventCheckin {
  eventId: string;
  eventName: string;
  venueName: string;
  zone: ClubZoneType;
  checkedInAt: string;
  expiresAt: string;
  isIncognito?: boolean;
}

// ==========================================
// 22. REGISTRO DE CRUCES EN LA PISTA (MISSED CONNECTIONS)
// ==========================================

export interface MissedConnection {
  id: string;
  eventId: string;
  eventName: string;
  venueName: string;
  peerProfileId: string;
  peerCodename: string;
  peerAvatarUrl: string;
  peerRole: RoleType;
  peerAge: number;
  overlappedAt: string;
  approximateTimeWindow: string;
  mutualZone?: ClubZoneType;
  pulseSent?: boolean;
  pulseReceived?: boolean;
  pulseNote?: string;
  expiresAt: string; // 48h
}

// ==========================================
// 23. MODO WINGMAN (SALGO CON AMIGO)
// ==========================================

export interface WingmanPair {
  isActive: boolean;
  partnerId: string;
  partnerCodename: string;
  partnerAvatarUrl: string;
  pinCode: string;
  pairedAt: string;
  lastSafetyCheckAt?: string;
  status: "partying_together" | "separated_safely" | "on_hookup" | "needs_help";
}

// ==========================================
// 24. PASE DE FIESTA NOCTURNA (PARTY PASS)
// ==========================================

export interface PartyPassState {
  isActive: boolean;
  expiresAt: string | null;
  eventId?: string;
}


