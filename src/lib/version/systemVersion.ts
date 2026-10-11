export interface SystemVersionEntry {
  version: string;
  releaseDate: string; // ISO String o formato legible
  formattedDate: string; // Formato Rioplatense amigable
  title: string;
  type: "feature" | "bugfix" | "security" | "performance" | "core";
  modules: string[];
  description: string;
  changes: string[];
  isCurrent?: boolean;
}

export const CURRENT_SYSTEM_VERSION = "v2.7.0";
export const SYSTEM_BUILD_TIMESTAMP = "2026-10-09T01:30:00-03:00";
export const SYSTEM_BUILD_FORMATTED = "09/10/2026, 01:30:00 ART";

export const SYSTEM_CHANGELOG: SystemVersionEntry[] = [
  {
    version: "v2.7.0",
    releaseDate: "2026-10-09T01:30:00-03:00",
    formattedDate: "09/10/2026, 01:30 ART",
    title: "Poda Táctica del Core: Extirpación de 7 Módulos Satélite y Arquitectura Zen",
    type: "core",
    modules: ["Poda de Módulos", "Seguridad Ligera", "Autenticación", "Nightlife", "Clean Architecture"],
    description:
      "Auditoría integral y poda profunda de 7 características satélite para lograr una experiencia de usuario despojada, ágil y de máxima concentración en el valor central (encuentros inmediatos sin fricción y privacidad biométrica real con foto obligatoria).",
    changes: [
      "Eliminación de Alerta de Trago Adulterado, Baliza Óptica, Wingman AI, Conexiones Perdidas y After Hours modal de la suite de fiesta.",
      "Derogación de Guardián Silencioso y PIN de Coacción: erradicación de temporizadores invasivos, falsos positivos y Dead-Man switches.",
      "Eliminación de Avatares Estilizados de Catálogo: consolidación del estándar de fotos 100% reales de usuarios humanos con Modo Niebla opcional.",
      "Optimización de SafetyContext y LogisticsContext: remoción de más de 600 líneas de estado huérfano, timers y listeners parásitos.",
      "Preservación y blindaje de características nucleares: Testimonios y Vessel Wrapped preservados para próxima etapa de refinamiento.",
    ],
    isCurrent: true,
  },
  {
    version: "v2.6.0",
    releaseDate: "2026-10-07T02:35:00-03:00",
    formattedDate: "07/10/2026, 02:35 ART",
    title: "Estandarización Total del Design System, Reingeniería Modular de Chat, Toques In-Place y Asistente Express",
    type: "core",
    modules: ["Design System", "Chat Darkroom", "Toques", "Asistente de Encuentro", "Seguridad SOS", "PWA Cache"],
    description:
      "Despliegue mayor con adopción 100% de la biblioteca de componentes UI (@/components/ui), descomposición modular del chat, respuesta in-place en toques sin bouncing, Asistente de Encuentro con Modo Express (1 Toque), persistencia reactiva de contactos SOS y forzado de última versión en producción.",
    changes: [
      "Invariante de Versión en Main: todo push a 'main' actualiza la versión del sistema y fuerza la purga de caché y recarga en navegadores.",
      "Asistente de Encuentro (RendezvousSheet): estandarizado con BrutalistButton, BrutalistInput, SegmentedTabGroup, TacticalAvatar, Modo Express (1 Toque) y PIN SOS configurable.",
      "Chat Darkroom: descomposición de monolito de 2.232 líneas en 5 submódulos atómicos y erradicación de botones anidados.",
      "Toques (Pulses): respuesta en el lugar a 60Hz sin expulsión forzada al chat y modal de confirmación antiborrado.",
      "Estandarización en Design System: erradicación total de controles ad-hoc en ProfileDetailModal, Radar, PlacesGrid y App Shell.",
    ],
    isCurrent: false,
  },
  {
    version: "v2.5.0",
    releaseDate: "2026-10-06T19:30:00-03:00",
    formattedDate: "06/10/2026, 19:30 ART",
    title: "Garantía de Última Versión Permanente, Control Remoto de Sesiones y Telemetría de Despliegues",
    type: "core",
    modules: ["Core", "PWA", "Admin", "Seguridad", "Cache-Busting"],
    description:
      "Solución definitiva al estancamiento de caché en navegadores móviles (iOS Safari / Android Chrome), garantizando que todo usuario que ingrese a la app cargue siempre la versión más reciente. Incorporación de panel de control en Admin con versión, fecha/hora, changelog, forzado de recarga global y forzado de cierre de sesión.",
    changes: [
      "Headers HTTP no-cache, no-store, must-revalidate permanentes para todas las páginas HTML y navegación en next.config.ts.",
      "Service Worker con estrategia Network-First obligatoria para navegación, cache dinámico y purga total en activación.",
      "Vigilante de versión en cliente que intercepta el montaje, visibilitychange, focus y el bfcache (pageshow) de Safari iOS.",
      "Endpoint dedicado /api/system/version con timestamp en tiempo real y anti-caché de 0 segundos.",
      "Consola de Administración: nueva pestaña 'Versión & Despliegues' con fecha, hora, uptime y registro histórico completo de versiones.",
      "Comando remoto en Admin para forzar la recarga inmediata de la última versión en todos los clientes conectados.",
      "Comando remoto en Admin para forzar el cierre seguro de sesiones activas de usuarios en toda la plataforma.",
    ],
    isCurrent: false,
  },
  {
    version: "v2.4.0",
    releaseDate: "2026-10-06T17:30:00-03:00",
    formattedDate: "06/10/2026, 17:30 ART",
    title: "Ergonomía Mobile de 5 Ejes Tácticos: Headers Descomprimidos y Terminología Inclusiva",
    type: "feature",
    modules: ["Mobile UX/UI", "Chat Darkroom", "Toques", "Agenda", "i18n"],
    description:
      "Reorganización de cabeceras en chat darkroom (+120px de espacio útil), selector horizontal de 3 pestañas en Toques, adaptación responsiva en Ficha y adopción del término 'Vínculos' en la agenda íntima.",
    changes: [
      "Chat Darkroom: reubicación de controles secundarios a menú contextual, liberando el ancho para alias y badges en pantallas de 360px.",
      "Toques: unificación de pestañas en selector horizontal con contadores numéricos y limpieza ergonómica.",
      "Agenda: actualización oficial a 'Citas (Agenda)' y adopción inclusiva de 'Vínculos' preservando data-testid intactos.",
      "Mi Perfil: optimización de barra sticky de 4 solapas con prevención de truncamiento en pantallas pequeñas.",
    ],
  },
  {
    version: "v2.3.0",
    releaseDate: "2026-10-06T15:00:00-03:00",
    formattedDate: "06/10/2026, 15:00 ART",
    title: "Auditoría Profunda 4 Fases: Ergonomía Mobile 360px, Descompresión y Rescate Táctico SOS",
    type: "performance",
    modules: ["Mobile UX/UI", "Viewport", "Chat", "Seguridad"],
    description:
      "Poda exhaustiva de imports muertos, descompresión de viewport con auto-ocultamiento de barras rápidas en foco de teclado y rescate de la Alerta de Trago SOS.",
    changes: [
      "Ocultamiento automático de respuestas rápidas al hacer foco en input de chat con teclado virtual desplegado.",
      "Responsive short labels en sintonías del IntentHub evitando saltos de línea.",
      "Integración de SpikedDrinkAlertModal en herramientas de cartelera nocturna.",
      "Estandarización de touch targets mínimos de 44x44px en toda la interfaz móvil.",
    ],
  },
  {
    version: "v2.2.0",
    releaseDate: "2026-10-06T12:00:00-03:00",
    formattedDate: "06/10/2026, 12:00 ART",
    title: "Auditoría 100% Mobile, Rendimiento, Poda de Código Muerto y Vernáculo Rioplatense 2026",
    type: "performance",
    modules: ["Performance", "Memoria", "Radar", "i18n"],
    description:
      "Eliminación de componentes huérfanos, elevación de RendezvousSheet a singleton dinámico ahorrando RAM masiva en móviles, y unificación rioplatense.",
    changes: [
      "RendezvousSheet elevado a singleton dinámico en ProfileGrid, eliminando 40+ instancias duplicadas en memoria.",
      "Poda definitiva de StatusToggle y CalculatorCoverScreen residuales.",
      "Optimización de thumbnails de imágenes reduciendo ancho de banda en ~60%.",
      "Vernáculo rioplatense gay 2026: 'Cuartos Oscuros', 'Tocá para...', 'Boliche y Cuarto Oscuro'.",
    ],
  },
  {
    version: "v2.1.0",
    releaseDate: "2026-10-06T09:00:00-03:00",
    formattedDate: "06/10/2026, 09:00 ART",
    title: "Optimización de Rendimiento Móvil y Batería: Desacople Reactivo de Temporizadores",
    type: "performance",
    modules: ["BatteryEngine", "Timers", "Header", "RadarMatrix"],
    description:
      "Aislamiento y erradicación de re-renders por segundo en la cabecera, suspensión inteligente de timers con visibilitychange y cero consumo en reposo.",
    changes: [
      "Extracción memoizada de ActiveReadyNowBadge evitando re-renderizado total de cabecera cada 1000ms.",
      "Detección de document.hidden para congelar timers cuando la pantalla está apagada.",
      "Reemplazo de polling de 5s por timeouts atómicos al milisegundo exacto de expiración.",
    ],
  },
  {
    version: "v2.0.0",
    releaseDate: "2026-10-06T04:00:00-03:00",
    formattedDate: "06/10/2026, 04:00 ART",
    title: "Reingeniería de Mi Perfil (Navegación 4-Tab) y Desacoplamiento de Modales Nocturnos",
    type: "feature",
    modules: ["Perfil", "ProtocolView", "ModalHost", "Nightlife"],
    description:
      "Desacoplamiento de submodales nocturnos como ciudadanos de primera clase con code-splitting y armonización simétrica de Mi Perfil.",
    changes: [
      "Extracción de los 5 submodales nocturnos al nivel raíz de ModalHost con importación dinámica.",
      "Erradicación de backdrops anidados y GPU stutter en animaciones de modales.",
      "Inclusión de tarjeta 'Mi Ficha & Bio' en EasyProfileCardView cubriendo las 4 solapas macro.",
    ],
  },
  {
    version: "v1.9.0",
    releaseDate: "2026-10-06T01:00:00-03:00",
    formattedDate: "06/10/2026, 01:00 ART",
    title: "Racionalización de Acciones (Hick's Law) en Perfil y Auto-Promoción de Onda Mutua",
    type: "feature",
    modules: ["Perfil", "Chat Darkroom", "Toques", "Onda Mutua"],
    description:
      "Poda de la botonera inferior a tríada ergonómica limpia y promoción automática de perfiles con toques mutuos a la bandeja de chat.",
    changes: [
      "Botonera inferior de ProfileDetailModal reducida a Toque Cinético, CTA Principal y Menú Táctico.",
      "Auto-promoción de coincidencias de onda mutua directamente a la bandeja de conversaciones.",
      "Insignia destacada [ 🔥 ONDA MUTUA ] en tarjetas de conversación.",
    ],
  },
  {
    version: "v1.8.0",
    releaseDate: "2026-10-05T21:00:00-03:00",
    formattedDate: "05/10/2026, 21:00 ART",
    title: "Desasfixia del Viewport Mobile y Rediseño de Tarjetas Zen",
    type: "feature",
    modules: ["Radar", "Viewport", "ProfileCard", "IntentHub"],
    description:
      "Unificación de cabeceras en único sticky header y reducción de altura fija superior de ~210px a ~86px (59% más de viewport útil).",
    changes: [
      "Consolidación de BrutalistHeader e IntentHubSelector en único header sticky.",
      "Píldoras tácticas de cristal oscuro brutalista con stopPropagation en tarjetas de perfil.",
      "Soporte nativo para safe area insets en notch y Dynamic Island de iPhone.",
    ],
  },
  {
    version: "v1.7.0",
    releaseDate: "2026-10-05T18:00:00-03:00",
    formattedDate: "05/10/2026, 18:00 ART",
    title: "Sinceramiento Lingüístico Rioplatense y Denominación Oficial de Áreas de Cruising",
    type: "feature",
    modules: ["i18n", "Navegación", "Pulsos", "Hotspots"],
    description:
      "Reemplazo integral de 'Al Aire Libre' por 'Áreas de Cruising' y adopción definitiva de 'Toques' en lugar de 'Zumbidos'.",
    changes: [
      "Adopción oficial del término 'Áreas de Cruising' en todo el catálogo de hotspots.",
      "Erradicación total de 'Zumbidos' sustituido por 'Toques' en 12 componentes y vistas.",
    ],
  },
  {
    version: "v1.6.0",
    releaseDate: "2026-10-05T14:00:00-03:00",
    formattedDate: "05/10/2026, 14:00 ART",
    title: "Aislamiento Estricto de Pulsos Reales, Fotos OAuth y Membresía Unlimited en Vivo",
    type: "security",
    modules: ["Pulsos", "Fotos", "Admin", "Membresías", "Firestore"],
    description:
      "Filtrado hermético de perfiles demo en Modo Real, soporte de fotos OAuth de Google con referrerPolicy='no-referrer' y sincronización atómica de planes.",
    changes: [
      "Aislamiento hermético de toques/pulsos mock en Modo Real.",
      "Solución al bloqueo 403 Forbidden de fotos de perfil de Google en chats y tarjetas.",
      "Sincronización en tiempo real de membresías UNLIMITED sin requerir recarga manual.",
    ],
  },
  {
    version: "v1.0.0",
    releaseDate: "2026-10-04T00:00:00-03:00",
    formattedDate: "04/10/2026, 00:00 ART",
    title: "Lanzamiento Inicial de VESSEL — Matriz Brutalista & Cifrado Zero-Knowledge",
    type: "core",
    modules: ["Matriz", "Radar", "Audio", "Web Audio API", "PWA"],
    description:
      "Arquitectura base del ecosistema VESSEL: radar geocodificado con Google S2, audio analógico sub-bass de 45-80Hz, modo camuflaje y privacidad radical.",
    changes: [
      "Despliegue inicial de la Matriz Radar con discretización espacial (~152m).",
      "Síntesis analógica de audio Sub-Bass y patrones hápticos cinéticos.",
      "Bóvedas privadas de fotos con consentimiento recíproco y PIN de coacción.",
    ],
  },
];
