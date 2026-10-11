"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth, useLogistics, useChat, useSettings, useDiary } from "@/context/VesselContext";
import {
  VesselProfile,
  PreFlightTempo,
  PreFlightProtection,
  PreFlightVibe,
  DiaryLocationCategory,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  getLocalTodayIso,
  getLocalDaysOffsetIso,
  formatLocalizedPreFlightSummary,
} from "@/lib/calendar/dateLocale";
import {
  X,
  Zap,
  MapPin,
  Clock,
  Car,
  Navigation,
  Shield,
  Sparkles,
  Lock,
  Phone,
  UserCheck,
} from "lucide-react";
import {
  BrutalistButton,
  BrutalistInput,
  TacticalAvatar,
  TacticalBadge,
} from "@/components/ui";

interface RendezvousSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: VesselProfile;
}

export const RendezvousSheet: React.FC<RendezvousSheetProps> = ({
  isOpen,
  onClose,
  targetProfile,
}) => {
  const { myProfile } = useAuth();
  const { myHostCard, startEnRoute } = useLogistics();
  const {
    sendPreFlightChecklist,
    sendSecureWaypoint,
    sendRendezvousPin,
    sendEncounterTicketMessage,
  } = useChat();
  const { createEncounterTicket } = useDiary();
  const { language, t } = useSettings();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Bloqueo de scroll en body y soporte para tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // --- SINTONÍA Y ACUERDO (Pre-Flight) ---
  const [tempo, setTempo] = useState<PreFlightTempo>("fast_carnal");
  const [selectedDynamics, setSelectedDynamics] = useState<string[]>(() => {
    const base = ["oral_focus", "penetration"];
    if (targetProfile.kinks?.includes("massage") && !base.includes("massage")) {
      base.push("massage");
    }
    return base;
  });

  const [protection, setProtection] = useState<PreFlightProtection>(() => {
    if (targetProfile.healthStatus?.prep) return "bareback_prep";
    return "bareback_prep";
  });

  const [vibe] = useState<PreFlightVibe>("100_sober");

  // --- LOGÍSTICA & UBICACIÓN & FECHA/HORA ---
  const [scheduledDate, setScheduledDate] = useState<string>(() => getLocalTodayIso());
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const [hostingMode, setHostingMode] = useState<"i_host" | "they_host" | "neutral_corner" | "rendezvous_pin">(
    "i_host"
  );
  const [cornerText, setCornerText] = useState<string>("");
  const [exactAddress, setExactAddress] = useState<string>("");
  const [doorNotes, setDoorNotes] = useState<string>(() => myHostCard?.notes || "");

  // --- TELEMETRÍA EN CAMINO ---
  const [isEnRouteActive, setIsEnRouteActive] = useState<boolean>(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);

  // Estado de confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDynamic = (id: string) => {
    audioEngine.playSubBass(70, 0.05);
    setSelectedDynamics((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const applyQuickTimePreset = (mode: "now30" | "tonight22" | "late01") => {
    audioEngine.playPulse();
    const now = new Date();
    if (mode === "now30") {
      const plus30 = new Date(now.getTime() + 30 * 60 * 1000);
      setScheduledDate(getLocalTodayIso(plus30));
      setScheduledTime(
        `${String(plus30.getHours()).padStart(2, "0")}:${String(plus30.getMinutes()).padStart(2, "0")}`
      );
    } else if (mode === "tonight22") {
      setScheduledDate(getLocalTodayIso(now));
      setScheduledTime("22:00");
    } else if (mode === "late01") {
      const targetDate = now.getHours() >= 4 ? getLocalDaysOffsetIso(1, now) : getLocalTodayIso(now);
      setScheduledDate(targetDate);
      setScheduledTime("01:00");
    }
  };

  // Confirmar y despachar el encuentro
  const executeDispatch = useCallback(
    async (overrideConfig?: {
      targetHostingMode?: "i_host" | "they_host" | "neutral_corner" | "rendezvous_pin";
      skipGuardian?: boolean;
    }) => {
      setIsSubmitting(true);
      audioEngine.playSubBass(60, 0.4);

      try {
        const activeHosting = overrideConfig?.targetHostingMode || hostingMode;

        // 1. Despachar Waypoint en 2 fases o PIN efímero si aplica
        if (activeHosting === "i_host" || activeHosting === "neutral_corner") {
          const corner =
            cornerText.trim() ||
            (activeHosting === "i_host"
              ? (language === "es" ? "Esquina de mi domicilio" : "My neighborhood corner")
              : (language === "es" ? "Punto de encuentro público" : "Public meeting corner"));
          const address = exactAddress.trim() || corner;
          const notes = doorNotes.trim() || undefined;
          sendSecureWaypoint(targetProfile.id, corner, address, notes);
        } else if (activeHosting === "rendezvous_pin") {
          sendRendezvousPin(targetProfile.id);
        }

        // 2. Activar En-Route si se seleccionó
        if (isEnRouteActive) {
          startEnRoute(targetProfile, estimatedMinutes);
        }

        // 4. Generar Ticket de Encuentro Maestro con etiquetas 100% localizadas
        const locationCategory: DiaryLocationCategory =
          activeHosting === "i_host"
            ? "my_place"
            : activeHosting === "they_host"
            ? "their_place"
            : activeHosting === "neutral_corner"
            ? "bar_lounge"
            : "other";

        const locName =
          cornerText.trim() ||
          (activeHosting === "i_host"
            ? (language === "es" ? "Mi depto" : "My Place")
            : activeHosting === "they_host"
            ? (language === "es" ? "Su lugar" : "Their Place")
            : (language === "es" ? "Esquina acordada" : "Agreed Spot"));

        if (createEncounterTicket) {
          const preFlightNotes = formatLocalizedPreFlightSummary(
            {
              tempo,
              protection,
              dynamics: selectedDynamics,
              accessNotes: doorNotes.trim() || undefined,
            },
            language
          );

          const ticket = createEncounterTicket(
            {
              senderId: myProfile?.codename || "me",
              partnerId: targetProfile.id,
              scheduledDate,
              scheduledTime,
              locationCategory,
              locationName: locName,
              notes: preFlightNotes || undefined,
            },
            {
              codename: targetProfile.codename,
              avatarUrl: targetProfile.avatarUrl,
              role: targetProfile.role,
              yoSoy: targetProfile.yoSoy,
            }
          );

          sendEncounterTicketMessage?.(targetProfile.id, ticket);
        } else if (sendPreFlightChecklist) {
          sendPreFlightChecklist(targetProfile.id, {
            tempo,
            dynamics: selectedDynamics,
            protection,
            vibe,
            isMutualMatch: true,
          });
        }

        audioEngine.playSignalSent();
        onClose();
      } catch (err) {
        console.error("Error confirming rendezvous:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      hostingMode,
      cornerText,
      language,
      exactAddress,
      doorNotes,
      sendSecureWaypoint,
      targetProfile,
      sendRendezvousPin,
      myProfile,
      isEnRouteActive,
      startEnRoute,
      estimatedMinutes,
      createEncounterTicket,
      tempo,
      protection,
      selectedDynamics,
      scheduledDate,
      scheduledTime,
      sendEncounterTicketMessage,
      onClose,
    ]
  );

  // Atajo táctico: "Pactar Express (1 Toque)"
  const handleExpressConfirm = () => {
    applyQuickTimePreset("now30");
    const expressHosting = myHostCard?.hasPlace ? "i_host" : "rendezvous_pin";
    executeDispatch({
      targetHostingMode: expressHosting,
    });
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asistente de Encuentro Táctico"
      className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-2xl flex justify-center items-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-3xl lg:max-w-4xl h-full md:h-[90vh] md:max-h-[880px] bg-obsidian-deep md:border md:border-white/10 md:rounded-3xl flex flex-col relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            HEADER APP-BAR (Estandarizado con TacticalAvatar y Badges)
            ========================================================= */}
        <header className="flex-shrink-0 z-30 bg-obsidian-deep/95 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between shadow-md">
          {/* Identidad del Partner */}
          <div className="flex items-center gap-3 min-w-0">
            <TacticalAvatar
              src={targetProfile.avatarUrl}
              alt={targetProfile.codename}
              size="default"
              borderVariant="violet"
              isFogMode={targetProfile.isFogMode}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black tracking-wider uppercase text-white truncate">
                  ASISTENTE DE ENCUENTRO
                </span>
                <TacticalBadge variant="violet" size="sm">
                  {language === "es" ? "PACTO BENTO" : "BENTO PACT"}
                </TacticalBadge>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans truncate">
                {language === "es" ? "Coordinar y blindar cita con " : "Coordinate & secure date with "}
                <strong className="text-white font-semibold">{targetProfile.codename}</strong>
                {targetProfile.age && <span className="ml-1 text-neutral-400 font-mono">({targetProfile.age})</span>}
              </p>
            </div>
          </div>

          {/* Botón Cerrar */}
          <BrutalistButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar asistente"
            className="rounded-full w-10 h-10 min-w-[40px] min-h-[40px] border border-white/10"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </BrutalistButton>
        </header>

        {/* =========================================================
            CUERPO BENTO EN PANTALLA ÚNICA (Scrollable)
            ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 text-xs text-neutral-300">
          {/* BANNER TÁCTICO: MODO EXPRESS (1 TOQUE) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-electricViolet/15 via-purple-900/25 to-electricViolet/10 border border-electricViolet/30 flex items-center justify-between gap-3 shadow-violet-soft">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-electricViolet-glow fill-electricViolet flex-shrink-0" />
                <span className="font-mono text-xs font-black uppercase text-white tracking-wider">
                  {language === "es" ? "Pactar Express (1 Toque)" : "Express Match (1 Tap)"}
                </span>
                <TacticalBadge variant="violet" size="sm">
                  {language === "es" ? "RÁPIDO" : "FAST"}
                </TacticalBadge>
              </div>
              <p className="text-[11px] text-neutral-300 font-sans mt-0.5 truncate">
                {language === "es"
                  ? (myHostCard?.hasPlace
                      ? "Manda cita directa a tu depto con horario automático (+30m)."
                      : "Manda PIN efímero seguro con horario automático (+30m).")
                  : "Send immediate encounter ticket with auto schedule (+30m)."}
              </p>
            </div>
            <BrutalistButton
              variant="primary"
              size="sm"
              soundEffect="subbass"
              onClick={handleExpressConfirm}
              disabled={isSubmitting}
              className="flex-shrink-0 text-xs px-3.5 py-2 font-black uppercase"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{language === "es" ? "Mandar Ya" : "Send Now"}</span>
            </BrutalistButton>
          </div>

          {/* -----------------------------------------------------
              BENTO 1: LUGAR & LOGÍSTICA (¿Dónde nos vemos?)
              ----------------------------------------------------- */}
          <section className="p-4 md:p-5 rounded-2xl bg-obsidian-surface/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-electricViolet" />
                <span>{language === "es" ? "1. ¿Quién Pone el Lugar o Punto de Encuentro?" : "1. Where do we meet?"}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {language === "es" ? "Logística de encuentro" : "Meeting logistics"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                {
                  key: "i_host" as const,
                  label: language === "es" ? "Recibo en mi lugar" : "I can host",
                  sub: language === "es" ? "Pongo mi depto / casa" : "Have place",
                  icon: "🏠",
                },
                {
                  key: "they_host" as const,
                  label: language === "es" ? "Voy para allá" : "They host",
                  sub: language === "es" ? "Pone su lugar" : "Can travel",
                  icon: "🚗",
                },
                {
                  key: "neutral_corner" as const,
                  label: language === "es" ? "Esquina neutra" : "Public corner",
                  sub: language === "es" ? "Punto público seguro" : "Safe public point",
                  icon: "📍",
                },
                {
                  key: "rendezvous_pin" as const,
                  label: language === "es" ? "PIN de Encuentro" : "Meeting PIN",
                  sub: language === "es" ? "Código efímero <50m" : "Ephemeral <50m",
                  icon: "⚡",
                },
              ].map((opt) => {
                const isSelected = hostingMode === opt.key;
                return (
                  <BrutalistButton
                    key={opt.key}
                    variant="ghost"
                    soundEffect="none"
                    aria-pressed={isSelected}
                    onClick={() => {
                      audioEngine.playSubBass(60, 0.08);
                      setHostingMode(opt.key);
                    }}
                    className={`min-h-[58px] p-3 rounded-2xl border text-left !justify-between !items-start flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "!bg-electricViolet/20 !border-electricViolet text-white shadow-violet-soft font-bold ring-1 ring-electricViolet"
                        : "!bg-white/[0.04] !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-bold block truncate">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      {opt.sub}
                    </span>
                  </BrutalistButton>
                );
              })}
            </div>

            {/* Inputs de Waypoint si recibe o esquina neutra */}
            {(hostingMode === "i_host" || hostingMode === "neutral_corner") && (
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-electricViolet-glow">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{language === "es" ? "Dirección Segura en 2 Fases" : "Safe 2-Phase Waypoint"}</span>
                  </div>
                  {hostingMode === "i_host" && (myHostCard?.hasPlace || myHostCard?.notes) && (
                    <TacticalBadge variant="emerald" size="sm">
                      ✓ {language === "es" ? "Datos de mi depto" : "Saved Place"}
                    </TacticalBadge>
                  )}
                </div>

                <p className="text-[10.5px] text-neutral-400 leading-relaxed font-sans">
                  {language === "es"
                    ? "Privacidad Táctica: Se comparte primero la esquina pública. Tu dirección exacta se libera únicamente cuando avisa que llegó a la zona."
                    : "Privacy: Public intersection is shared first. Your exact address is only released once partner confirms arrival."}
                </p>

                <BrutalistInput
                  label={language === "es" ? "Fase 1: Esquina pública (Visible al inicio)" : "Phase 1: Public Corner"}
                  placeholder={language === "es" ? "Ej: Av. Santa Fe y Thames" : "E.g.: 5th Ave & 42nd St"}
                  value={cornerText}
                  onChange={(e) => setCornerText(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4 text-neutral-400" />}
                />

                {hostingMode === "i_host" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-white/5">
                    <BrutalistInput
                      label={language === "es" ? "Fase 2: Dirección Exacta y Depto" : "Phase 2: Exact Address & Apt"}
                      placeholder={language === "es" ? "Ej: Thames 1840, Piso 4 Depto B" : "E.g.: 123 Main St, Apt 4B"}
                      value={exactAddress}
                      onChange={(e) => setExactAddress(e.target.value)}
                    />
                    <BrutalistInput
                      label={language === "es" ? "Notas de Acceso / Timbre" : "Access Notes / Buzzer"}
                      placeholder={language === "es" ? "Ej: Tocar timbre 4B y esperar" : "E.g.: Buzzer 4B"}
                      value={doorNotes}
                      onChange={(e) => setDoorNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {hostingMode === "rendezvous_pin" && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-neutral-300 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Navigation className="w-3.5 h-3.5 text-purple-400" />
                  <span>{language === "es" ? "PIN de Encuentro Seguro (<50m)" : "Ephemeral PIN (<50m)"}</span>
                </div>
                <p className="text-[10.5px] text-neutral-400 font-sans">
                  {language === "es"
                    ? "Se generará un código criptográfico de 4 dígitos. Ambos deben estar a menos de 50 metros para validar el encuentro físico sin guardar direcciones permanentes."
                    : "Both must be within 50 meters to validate the physical encounter without storing permanent addresses."}
                </p>
              </div>
            )}

            {hostingMode === "they_host" && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Car className="w-3.5 h-3.5 text-electricViolet-glow" />
                  <span>{language === "es" ? "Te desplazás hacia su lugar" : "You travel to their place"}</span>
                </div>
                <p className="text-[10.5px] text-neutral-400 font-sans">
                  {language === "es"
                    ? `Le pedirás a ${targetProfile.codename} que te mande su esquina o depto por el chat seguro.`
                    : `You will ask ${targetProfile.codename} to send their corner or address in the secure chat.`}
                </p>
              </div>
            )}
          </section>

          {/* -----------------------------------------------------
              BENTO 2: FECHA & HORA (¿Cuándo?)
              ----------------------------------------------------- */}
          <section className="p-4 md:p-5 rounded-2xl bg-obsidian-surface/60 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <Clock className="w-4 h-4 text-electricViolet-glow" />
                <span>{language === "es" ? "2. Fecha & Hora del Encuentro" : "2. Encounter Date & Time"}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {scheduledDate} • {scheduledTime} hs
              </span>
            </div>

            {/* Presets Rápidos de Horario */}
            <div className="grid grid-cols-3 gap-2">
              <BrutalistButton
                variant="outline"
                size="sm"
                onClick={() => applyQuickTimePreset("now30")}
                className="min-h-[44px] text-xs font-mono font-bold"
              >
                ⚡ {language === "es" ? "Ahora (+30m)" : "Now (+30m)"}
              </BrutalistButton>
              <BrutalistButton
                variant="outline"
                size="sm"
                onClick={() => applyQuickTimePreset("tonight22")}
                className="min-h-[44px] text-xs font-mono font-bold"
              >
                🌙 22:00 hs
              </BrutalistButton>
              <BrutalistButton
                variant="outline"
                size="sm"
                onClick={() => applyQuickTimePreset("late01")}
                className="min-h-[44px] text-xs font-mono font-bold"
              >
                🔥 01:00 hs
              </BrutalistButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <BrutalistInput
                type="date"
                min={getLocalTodayIso()}
                label={language === "es" ? "Fecha" : "Date"}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <BrutalistInput
                type="time"
                label={language === "es" ? "Hora" : "Time"}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </section>

          {/* -----------------------------------------------------
              BENTO 3: PUNTOS CLAROS (Ritmo, Prácticas & Cuidados)
              ----------------------------------------------------- */}
          <section className="p-4 md:p-5 rounded-2xl bg-obsidian-surface/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-electricViolet" />
                <span>{language === "es" ? "3. Puntos Claros (Ritmo y Cuidados)" : "3. Clear Terms (Vibe & Care)"}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {language === "es" ? "Acuerdo mutuo" : "Mutual agreement"}
              </span>
            </div>

            {/* Ritmo y Duración */}
            <div>
              <label className="font-mono text-[11px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                {language === "es" ? "Ritmo y Duración del Encuentro" : "Encounter Tempo & Duration"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    key: "fast_carnal" as PreFlightTempo,
                    label: language === "es" ? "Directo al grano" : "Quick & Carnal",
                    sub: language === "es" ? "Touch & go / Sin vueltas" : "Direct / No lingering",
                    icon: "⚡",
                  },
                  {
                    key: "chill" as PreFlightTempo,
                    label: language === "es" ? "Tranqui & Conexión" : "Sensual & Chill",
                    sub: language === "es" ? "Ducha, charla y mimos" : "Shower, talk & cuddle",
                    icon: "🫂",
                  },
                  {
                    key: "rough_dom" as PreFlightTempo,
                    label: language === "es" ? "Kink & Dominación" : "Kink & Domination",
                    sub: language === "es" ? "Fetiches y dinámica" : "Fetish & dynamics",
                    icon: "⛓️",
                  },
                  {
                    key: "sensual_slow" as PreFlightTempo,
                    label: language === "es" ? "Quedarse a dormir" : "Stay the Night",
                    sub: language === "es" ? "Si pinta la noche" : "If chemistry is right",
                    icon: "🌙",
                  },
                ].map((item) => {
                  const isSelected = tempo === item.key;
                  return (
                    <BrutalistButton
                      key={item.key}
                      variant="ghost"
                      soundEffect="none"
                      aria-pressed={isSelected}
                      onClick={() => {
                        audioEngine.playSubBass(65, 0.08);
                        setTempo(item.key);
                      }}
                      className={`min-h-[58px] p-3 rounded-2xl border text-left !justify-between !items-start flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? "!bg-electricViolet/20 !border-electricViolet text-white shadow-violet-soft font-bold ring-1 ring-electricViolet"
                          : "!bg-white/[0.04] !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-bold block truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        {item.sub}
                      </span>
                    </BrutalistButton>
                  );
                })}
              </div>
            </div>

            {/* Prácticas en Sintonía */}
            <div>
              <label className="font-mono text-[11px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                {language === "es" ? "Prácticas Deseadas (Tocá para marcar)" : "Desired Practices (Tap to toggle)"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "oral_focus", label: language === "es" ? "Solo Oral" : "Oral Only", icon: "👅" },
                  { id: "penetration", label: language === "es" ? "Penetración" : "Penetration", icon: "🍆" },
                  { id: "massage", label: language === "es" ? "Masaje / Relax" : "Massage", icon: "💆" },
                  { id: "kink_gear", label: language === "es" ? "Fetiche / Arnés" : "Kink & Gear", icon: "⛓️" },
                  { id: "sensual_kiss", label: language === "es" ? "Besos & Franela" : "Kissing & Cuddle", icon: "💋" },
                  { id: "voyeur_jerk", label: language === "es" ? "Voyeur / Morbo" : "Voyeur / Kinky", icon: "👁️" },
                ].map((dyn) => {
                  const isSelected = selectedDynamics.includes(dyn.id);
                  return (
                    <BrutalistButton
                      key={dyn.id}
                      variant="ghost"
                      soundEffect="none"
                      aria-pressed={isSelected}
                      onClick={() => toggleDynamic(dyn.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? "!bg-electricViolet/25 !border-electricViolet/80 text-white font-bold shadow-violet-soft ring-1 ring-electricViolet/40"
                          : "!bg-white/[0.04] !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/[0.08]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-sm">{dyn.icon}</span>
                        <span className="text-xs truncate">{dyn.label}</span>
                      </span>
                      <span
                        className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-electricViolet text-white" : "text-neutral-500 bg-white/5"
                        }`}
                      >
                        {isSelected ? "✓" : "+"}
                      </span>
                    </BrutalistButton>
                  );
                })}
              </div>
            </div>

            {/* Salud Sexual y Barreras */}
            <div>
              <label className="font-mono text-[11px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                {language === "es" ? "Salud Sexual & Barreras" : "Sexual Health & Barriers"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  {
                    key: "bareback_prep" as PreFlightProtection,
                    label: language === "es" ? "A pelo + PrEP" : "Bareback + PrEP",
                    icon: "🛡️",
                  },
                  {
                    key: "condoms" as PreFlightProtection,
                    label: language === "es" ? "Preservativo" : "Condoms Required",
                    icon: "🎈",
                  },
                  {
                    key: "prep_doxypep" as PreFlightProtection,
                    label: language === "es" ? "Doxy-PEP / PrEP" : "Doxy-PEP / PrEP",
                    icon: "💊",
                  },
                  {
                    key: "discuss" as PreFlightProtection,
                    label: language === "es" ? "Charlar en persona" : "Discuss in person",
                    icon: "💬",
                  },
                ].map((item) => {
                  const isSelected = protection === item.key;
                  return (
                    <BrutalistButton
                      key={item.key}
                      variant="ghost"
                      soundEffect="none"
                      aria-pressed={isSelected}
                      onClick={() => {
                        audioEngine.playSubBass(60, 0.08);
                        setProtection(item.key);
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? "!bg-mintNeon/15 !border-mintNeon/60 text-mintNeon font-bold shadow-mint-glow ring-1 ring-mintNeon/40"
                          : "!bg-white/[0.04] !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/[0.08]"
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      <span className="text-xs truncate">{item.label}</span>
                    </BrutalistButton>
                  );
                })}
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------
              BENTO 4: TELEMETRÍA "EN CAMINO"
              ----------------------------------------------------- */}
          <section className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Car className="w-4 h-4 text-electricViolet-glow" />
                <span>{language === "es" ? "4. Telemetría \"Voy en Camino\"" : "4. \"En Route\" Telemetry"}</span>
              </div>
              <BrutalistButton
                variant={isEnRouteActive ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  audioEngine.playSubBass(65, 0.08);
                  setIsEnRouteActive(!isEnRouteActive);
                }}
                className={`min-h-[44px] px-3.5 text-xs font-mono font-bold ${
                  !isEnRouteActive ? "border border-white/10" : ""
                }`}
              >
                {isEnRouteActive ? (language === "es" ? "ACTIVADO ✓" : "ACTIVE ✓") : (language === "es" ? "APAGADO" : "OFF")}
              </BrutalistButton>
            </div>

            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              {language === "es"
                ? "Notifica en vivo a la otra persona cuando salís y le avisa discretamente cuando estás a menos de 50 metros."
                : "Live notification showing when you depart and discreet arrival alert when <50m away."}
            </p>

            {isEnRouteActive && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-mono text-neutral-400">
                  {language === "es" ? "Tiempo de viaje estimado:" : "Estimated travel time:"}
                </span>
                <div className="flex items-center gap-2">
                  {[15, 25, 40].map((m) => (
                    <BrutalistButton
                      key={m}
                      variant={estimatedMinutes === m ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setEstimatedMinutes(m)}
                      className="min-h-[44px] px-4 text-xs font-mono font-bold"
                    >
                      {m}m
                    </BrutalistButton>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* FICHA RESUMEN PREVIEW DEL TICKET */}
          <div className="p-3.5 rounded-2xl bg-obsidian border border-electricViolet/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-electricViolet-glow uppercase tracking-wider">
                {language === "es" ? "📋 Resumen del Ticket Táctico" : "📋 Tactical Ticket Summary"}
              </span>
              <TacticalBadge variant="violet" size="sm">
                {scheduledDate} • {scheduledTime} hs
              </TacticalBadge>
            </div>
            <div className="text-[11px] font-mono text-neutral-300 space-y-1">
              <div>
                <span className="text-neutral-500">{language === "es" ? "Onda: " : "Vibe: "}</span>
                <strong>{tempo === "fast_carnal" ? "Directo al grano" : tempo}</strong> •{" "}
                {protection === "bareback_prep" ? "A pelo + PrEP" : protection}
              </div>
              <div>
                <span className="text-neutral-500">{language === "es" ? "Lugar: " : "Place: "}</span>
                {hostingMode === "i_host"
                  ? (language === "es" ? "Mi depto" : "My Place")
                  : hostingMode === "they_host"
                  ? (language === "es" ? "Su lugar" : "Their Place")
                  : hostingMode === "neutral_corner"
                  ? (language === "es" ? "Esquina neutra" : "Neutral corner")
                  : (language === "es" ? "PIN Efímero" : "Meeting PIN")}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTONERA INFERIOR (Sticky Footer Bar con BrutalistButton)
            ========================================================= */}
        <footer className="flex-shrink-0 bg-obsidian-deep/95 backdrop-blur-xl border-t border-white/10 p-4 md:px-6 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.9)]">
          <BrutalistButton
            variant="ghost"
            size="default"
            onClick={onClose}
            className="min-h-[46px] px-5 border border-white/10"
          >
            {language === "es" ? "Cancelar" : "Cancel"}
          </BrutalistButton>

          <BrutalistButton
            variant="primary"
            size="default"
            soundEffect="subbass"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            onClick={() => executeDispatch()}
            className="min-h-[48px] px-6 ml-auto flex-1 max-w-md shadow-violet-soft"
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">
              {isSubmitting
                ? (language === "es" ? "Blindando..." : "Securing...")
                : (language === "es" ? "Confirmar y Blindar Encuentro 🔥" : "Confirm & Secure Encounter 🔥")}
            </span>
          </BrutalistButton>
        </footer>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
