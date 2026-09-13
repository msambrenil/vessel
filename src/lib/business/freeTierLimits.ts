/**
 * Reglas de Negocio y Cuotas del Plan Free vs Unlimited (REGLAS_DE_NEGOCIO.md)
 * Define las cuotas estrictas de almacenamiento de medios, biografías y privacidad.
 */
export const FREE_TIER_LIMITS = {
  maxPublicAlbums: 1,
  maxPrivateAlbums: 1,
  maxPhotosPerAlbum: 10,
  maxBioLength: 280,
  canUseVideo: false,
  maxFreeRadarDistanceMeters: 1000,
} as const;

export type FreeTierLimits = typeof FREE_TIER_LIMITS;
