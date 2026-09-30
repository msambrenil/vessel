/**
 * VESSEL — Utilidades de Localización Temporal y Zona Horaria Local (UTC-3 / ART)
 * Erradica el bug de desfase horario de `toISOString().split("T")[0]` que adelantaba
 * la fecha al día siguiente después de las 21:00 hs en Argentina.
 * Cero dependencias externas npm: utiliza API nativa Date e Intl.DateTimeFormat.
 */

/**
 * Devuelve la fecha actual (o la provista) en formato ISO local YYYY-MM-DD
 * respetando estrictamente la zona horaria del dispositivo del usuario.
 */
export function getLocalTodayIso(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Devuelve una fecha en formato YYYY-MM-DD desplazada `daysOffset` días
 * respecto a `baseDate`, calculada en hora local.
 */
export function getLocalDaysOffsetIso(daysOffset: number, baseDate: Date = new Date()): string {
  const copy = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  copy.setDate(copy.getDate() + daysOffset);
  return getLocalTodayIso(copy);
}

/**
 * Convierte una cadena YYYY-MM-DD en un objeto Date local a las 00:00:00
 * evitando la interpretación UTC de `new Date("YYYY-MM-DD")`.
 */
export function parseLocalIsoDate(isoDateStr: string): Date | null {
  if (!isoDateStr || typeof isoDateStr !== "string") return null;
  const parts = isoDateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formatea una fecha YYYY-MM-DD en formato humano localizado ("Dom 23 Ago" en es-AR o "Sun, Aug 23" en en-US)
 */
export function formatDiaryDateDisplay(
  isoDateStr: string,
  language: "es" | "en" = "es"
): string {
  const dateObj = parseLocalIsoDate(isoDateStr);
  if (!dateObj) return isoDateStr;

  try {
    const locale = language === "es" ? "es-AR" : "en-US";
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(dateObj);

    // Capitalizar primera letra y limpiar puntos innecesarios para estética brutalista
    const clean = formatted.replace(/\./g, "");
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  } catch {
    return isoDateStr;
  }
}

/**
 * Calcula la cantidad de días restantes desde `baseDate` (hoy local) hasta `targetIsoDateStr`.
 * Retorna negativo si la fecha ya pasó, 0 si es hoy, positivo si es futura.
 */
export function getDaysUntilDate(
  targetIsoDateStr: string,
  baseDate: Date = new Date()
): number {
  const target = parseLocalIsoDate(targetIsoDateStr);
  if (!target) return 0;
  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formatea un timestamp ISO, numérico o cadena horaria ("13:45", "01:45 PM", "Ahora")
 * a hora localizada estricta: 24h ("13:45") para Español Rioplatense ("es-AR")
 * y 12h ("01:45 PM") para Inglés ("en-US").
 */
export function formatLocaleTime24h(
  rawTimestamp?: string | number,
  language: "es" | "en" = "es"
): string | null {
  if (!rawTimestamp) return null;

  if (typeof rawTimestamp === "string") {
    const trimmed = rawTimestamp.trim();
    if (!trimmed) return null;

    // Si es un marcador relativo ("Ahora" / "Now")
    if (trimmed.toLowerCase() === "ahora" || trimmed.toLowerCase() === "now") {
      return language === "es" ? "Ahora" : "Now";
    }

    // Si ya es una cadena horaria tipo "13:45" o "01:45 PM"
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const meridiem = timeMatch[3]?.toUpperCase();

      if (meridiem === "PM" && hours < 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;

      if (hours >= 0 && hours < 24) {
        if (language === "es") {
          return `${String(hours).padStart(2, "0")}:${minutes}`;
        } else {
          const suffix = hours >= 12 ? "PM" : "AM";
          const h12 = hours % 12 || 12;
          return `${String(h12).padStart(2, "0")}:${minutes} ${suffix}`;
        }
      }
    }
  }

  const d = new Date(rawTimestamp);
  if (isNaN(d.getTime())) return null;

  try {
    const locale = language === "es" ? "es-AR" : "en-US";
    return d.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: language !== "es",
    });
  } catch {
    return null;
  }
}

/**
 * Traduce de forma centralizada los enums de Pre-Flight (tempo, protection, dynamics)
 * erradicando la exposición de claves crudas en inglés (ej. "fast_carnal", "bareback_prep").
 */
export function formatLocalizedPreFlightSummary(
  params: {
    tempo?: string;
    protection?: string;
    dynamics?: string[];
    accessNotes?: string;
  },
  language: "es" | "en" = "es"
): string {
  const tempoMap: Record<string, { es: string; en: string }> = {
    fast_carnal: { es: "⚡ Rápido y Carnal", en: "⚡ Fast & Carnal" },
    chill: { es: "🫂 Sensual y Tranqui", en: "🫂 Sensual & Chill" },
    rough_dom: { es: "⛓️ Kink y Dominación", en: "⛓️ Kink & Domination" },
    sensual_slow: { es: "🌙 Pasar la Noche", en: "🌙 Stay the Night" },
  };

  const protectionMap: Record<string, { es: string; en: string }> = {
    bareback_prep: { es: "🛡️ PrEP e I=I", en: "🛡️ PrEP + U=U" },
    condom_only: { es: "🎈 Preservativo Obligatorio", en: "🎈 Condoms Required" },
    condoms: { es: "🎈 Preservativo Estricto", en: "🎈 Strict Condoms" },
    doxy_pep_friendly: { es: "💊 Doxy-PEP Amigable", en: "💊 Doxy-PEP Friendly" },
    prep_doxypep: { es: "💊 PrEP + Doxy-PEP", en: "💊 PrEP + Doxy-PEP" },
    discuss_first: { es: "💬 Charlar en persona", en: "💬 Discuss in person" },
    discuss: { es: "💬 Charlar en persona", en: "💬 Discuss in person" },
  };

  const dynamicsMap: Record<string, { es: string; en: string }> = {
    oral_focus: { es: "👅 Oral", en: "👅 Oral" },
    penetration: { es: "🍆 Penetración", en: "🍆 Penetration" },
    massage: { es: "💆 Masaje", en: "💆 Massage" },
    kink_gear: { es: "⛓️ Fetiche", en: "⛓️ Kink" },
    sensual_kiss: { es: "💋 Besos", en: "💋 Kissing" },
    voyeur_jerk: { es: "👁️ Morbo / Voyeur", en: "👁️ Voyeur" },
  };

  const parts: string[] = [];
  if (params.accessNotes?.trim()) {
    parts.push(`${language === "es" ? "Acceso" : "Access"}: ${params.accessNotes.trim()}`);
  }
  if (params.tempo) {
    const label = tempoMap[params.tempo]?.[language] || params.tempo;
    parts.push(`${language === "es" ? "Ritmo" : "Tempo"}: ${label}`);
  }
  if (params.protection) {
    const label = protectionMap[params.protection]?.[language] || params.protection;
    parts.push(`${language === "es" ? "Cuidado" : "Care"}: ${label}`);
  }
  if (params.dynamics && params.dynamics.length > 0) {
    const labels = params.dynamics.map((d) => dynamicsMap[d]?.[language] || d);
    parts.push(`${language === "es" ? "Prácticas" : "Practices"}: ${labels.join(", ")}`);
  }

  return parts.join(" • ");
}

/**
 * Traduce el enum de BoundaryProtocolType ("polite_archive", "pause", etc.) a etiqueta humana.
 */
export function formatBoundaryProtocolLabel(
  protocol?: string,
  language: "es" | "en" = "es"
): string {
  if (!protocol) return "";
  const map: Record<string, { es: string; en: string }> = {
    polite_archive: { es: "Cierre Respetuoso", en: "Polite Archive" },
    pause: { es: "Pausa Temporal", en: "Temporary Pause" },
    stealth_fade: { es: "Modo Sigilo", en: "Stealth Fade" },
    hard_boundary: { es: "Límite Estricto", en: "Hard Boundary" },
    custom: { es: "Límite a Medida", en: "Custom Boundary" },
  };
  return map[protocol]?.[language] || protocol;
}

/**
 * Devuelve la antigüedad compacta ("5 min", "2 h", "ayer", "3 d") para interpolar
 * en `t.pulses.receivedAgo` o `t.pulses.sentAgo` sin mezcla lingüística.
 */
export function formatRelativePulseTime(
  isoString?: string,
  language: "es" | "en" = "es"
): string {
  if (!isoString) return language === "es" ? "instantes" : "moments";
  const then = new Date(isoString).getTime();
  if (isNaN(then)) return language === "es" ? "instantes" : "moments";

  const diffMin = Math.max(1, Math.floor((Date.now() - then) / (1000 * 60)));

  if (language === "es") {
    if (diffMin < 2) return "un instante";
    if (diffMin < 60) return `${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return "1 h";
    if (diffHours < 24) return `${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 día";
    return `${diffDays} días`;
  } else {
    if (diffMin < 2) return "a moment";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return "1h";
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1d";
    return `${diffDays}d`;
  }
}

/**
 * Evalúa de forma resiliente e independiente del idioma si la movilidad
 * de un perfil incluye lugar/hospedaje propio disponible.
 */
export function hasHostingCapability(mobility?: string): boolean {
  if (!mobility) return false;
  const normalized = mobility.toLowerCase();
  return (
    normalized.includes("tengo depto") ||
    normalized.includes("tengo sitio") ||
    normalized.includes("tengo lugar") ||
    normalized.includes("host")
  );
}


