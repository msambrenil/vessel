"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { VesselProfile, PreFlightTempo, PreFlightProtection, PreFlightVibe, DiaryLocationCategory } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  getLocalTodayIso,
  getLocalDaysOffsetIso,
  formatLocalizedPreFlightSummary,
} from "@/lib/calendar/dateLocale";
import {
  X,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Car,
  Home,
  Flame,
  Check,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Shield,
  HeartPulse,
  Sparkles,
} from "lucide-react";

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
  const {
    myProfile,
    myHostCard,
    sendPreFlightChecklist,
    sendSecureWaypoint,
    sendRendezvousPin,
    startSafetyBeacon,
    safetyBeacon,
    startEnRoute,
    createEncounterTicket,
    sendEncounterTicketMessage,
    language,
    t,
  } = useVessel();

  // Paso activo del asistente (1: Sintonía, 2: Lugar & Dirección, 3: Blindaje SOS)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // --- PASO 1: SINTONÍA ERÓTICA (Pre-Flight) ---
  const [tempo, setTempo] = useState<PreFlightTempo>("fast_carnal");
  const [selectedDynamics, setSelectedDynamics] = useState<string[]>([
    "oral_focus",
    "penetration",
  ]);
  const [protection, setProtection] = useState<PreFlightProtection>("bareback_prep");
  const [vibe, setVibe] = useState<PreFlightVibe>("100_sober");

  // --- PASO 2: LOGÍSTICA & UBICACIÓN & FECHA/HORA (Con Autocompletado desde myHostCard) ---
  const [scheduledDate, setScheduledDate] = useState<string>(() => getLocalTodayIso());
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [hostingMode, setHostingMode] = useState<"i_host" | "they_host" | "neutral_corner" | "rendezvous_pin">("i_host");
  const [cornerText, setCornerText] = useState<string>("");
  const [exactAddress, setExactAddress] = useState<string>("");
  const [doorNotes, setDoorNotes] = useState<string>(() => myHostCard?.notes || "");

  // --- PASO 3: BLINDAJE & EN CAMINO ---
  const [guardianDuration, setGuardianDuration] = useState<number>(60); // 0 = sin guardián, 45, 60, 90, 120
  const [emergencyPhone, setEmergencyPhone] = useState(safetyBeacon?.emergencyContactPhone || "");
  const [emergencyName, setEmergencyName] = useState(safetyBeacon?.emergencyContactName || "");
  const [isEnRouteActive, setIsEnRouteActive] = useState<boolean>(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);

  // Estado de confirmación
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDynamic = (id: string) => {
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

  const handleConfirmAll = async () => {
    setIsSubmitting(true);
    audioEngine.playSubBass(60, 0.4);

    try {
      // 1. Si no existe soporte de EncounterTicket maestro, despachar Pre-Flight suelto como fallback
      if (!createEncounterTicket) {
        sendPreFlightChecklist(targetProfile.id, {
          tempo,
          dynamics: selectedDynamics,
          protection,
          vibe,
          isMutualMatch: true,
        });
      }

      // 2. Despachar Waypoint en 2 fases o PIN efímero
      if (hostingMode === "i_host" || hostingMode === "neutral_corner") {
        if (cornerText.trim() || exactAddress.trim() || !createEncounterTicket) {
          const corner =
            cornerText.trim() ||
            (hostingMode === "i_host"
              ? (language === "es" ? "Esquina de mi domicilio" : "My neighborhood corner")
              : (language === "es" ? "Punto de encuentro público" : "Public meeting corner"));
          const address = exactAddress.trim() || corner;
          const notes = doorNotes.trim() || undefined;
          sendSecureWaypoint(targetProfile.id, corner, address, notes);
        }
      } else if (hostingMode === "rendezvous_pin") {
        sendRendezvousPin(targetProfile.id);
      }

      // 3. Activar Guardián Silencioso local si se seleccionó duración
      if (guardianDuration > 0) {
        startSafetyBeacon({
          durationMinutes: guardianDuration,
          emergencyPhone:
            emergencyPhone.trim() ||
            (t.safety?.localContact || (language === "es" ? "Contacto de Seguridad Local" : "Local Safety Contact")),
          emergencyName:
            emergencyName.trim() || (language === "es" ? "Contacto de Confianza" : "Trusted Contact"),
          locationText:
            cornerText.trim() ||
            exactAddress.trim() ||
            (language === "es" ? "Cita en curso" : "Encounter in progress"),
          targetCodename: targetProfile.codename,
          pinCode: "1234",
        });
      }

      // 4. Activar En-Route si se seleccionó
      if (isEnRouteActive) {
        startEnRoute(targetProfile, estimatedMinutes);
      }

      // 5. Generar Ticket de Encuentro Maestro con etiquetas 100% localizadas (cero enums crudos)
      const locationCategory: DiaryLocationCategory =
        hostingMode === "i_host"
          ? "my_place"
          : hostingMode === "they_host"
          ? "their_place"
          : hostingMode === "neutral_corner"
          ? "bar_lounge"
          : "other";

      const locName =
        cornerText.trim() ||
        (hostingMode === "i_host"
          ? (language === "es" ? "Mi Lugar Acordado" : "My Place")
          : hostingMode === "they_host"
          ? (language === "es" ? "Su Lugar Acordado" : "Their Place")
          : (language === "es" ? "Punto de Encuentro Acordado" : "Agreed Spot"));

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
            senderId: myProfile.codename || "me",
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
      }

      audioEngine.playSignalSent();
      onClose();
    } catch (err) {
      console.error("Error confirming rendezvous:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asistente de Encuentro Táctico"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-obsidian-surface border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            HEADER DE LA SHEET & INDICADOR DE PASOS
            ========================================================= */}
        <div className="p-4 border-b border-white/10 bg-obsidian-deep/90 backdrop-blur-md">
          {/* Barra arrastre táctil móvil */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center text-base shadow-violet-soft flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-mono font-black tracking-wider uppercase text-white">
                    ASISTENTE DE ENCUENTRO
                  </h2>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-electricViolet/20 text-electricViolet-glow font-bold border border-electricViolet/40">
                    PASO {currentStep} DE 3
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Coordinar y blindar cita con <strong className="text-white">{targetProfile.codename}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar asistente"
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper horizontal táctil */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-white/5">
            {[
              { num: 1 as const, title: language === "es" ? "1. Sintonía" : "1. Tuning", icon: "📋" },
              { num: 2 as const, title: language === "es" ? "2. Lugar / PIN" : "2. Place / PIN", icon: "📍" },
              { num: 3 as const, title: language === "es" ? "3. Blindaje" : "3. Safety", icon: "🛡️" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-electricViolet text-white shadow-violet-soft font-black"
                      : isPassed
                      ? "bg-white/10 text-emerald-300 font-semibold"
                      : "bg-white/5 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <span>{isPassed ? "✓" : step.icon}</span>
                  <span className="truncate">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            CUERPO CON SCROLL DEL ASISTENTE
            ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* -----------------------------------------------------
              PASO 1: SINTONÍA Y ACUERDO PREVIO
              ----------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Ritmo */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                  Ritmo y Duración del Encuentro
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "fast_carnal" as PreFlightTempo, label: t.rendezvous?.tempoFastCarnal || (language === "es" ? "Rápido y Carnal" : "Quick & Carnal"), sub: language === "es" ? "Sin sobremesa" : "Direct / No lingering", icon: "⚡" },
                    { key: "chill" as PreFlightTempo, label: t.rendezvous?.tempoSensualChill || (language === "es" ? "Sensual & Tranqui" : "Sensual & Chill"), sub: language === "es" ? "Ducha y mimos" : "Shower & cuddle", icon: "🫂" },
                    { key: "rough_dom" as PreFlightTempo, label: t.rendezvous?.tempoKinkDom || (language === "es" ? "Kink & Dominación" : "Kink & Domination"), sub: language === "es" ? "Fetiches y poder" : "Fetish & dynamics", icon: "⛓️" },
                    { key: "sensual_slow" as PreFlightTempo, label: t.rendezvous?.tempoSleepover || (language === "es" ? "Pasar la Noche" : "Stay the Night"), sub: language === "es" ? "Si hay química" : "If chemistry is right", icon: "🌙" },
                  ].map((item) => {
                    const isSelected = tempo === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTempo(item.key)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-electricViolet/15 border-electricViolet text-white shadow-violet-soft font-bold"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">{item.label}</span>
                            <span className="text-[10px] text-neutral-400 block font-mono truncate">{item.sub}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prácticas en Sintonía */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                  Prácticas Deseadas (Toca para seleccionar)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "oral_focus", label: "Solo Oral", icon: "👅" },
                    { id: "penetration", label: "Penetración", icon: "🍆" },
                    { id: "massage", label: "Masaje / Relax", icon: "💆" },
                    { id: "kink_gear", label: "Fetiche / Arnés", icon: "⛓️" },
                    { id: "sensual_kiss", label: "Besos & Quiebre", icon: "💋" },
                    { id: "voyeur_jerk", label: "Voyeur / Morbo", icon: "👁️" },
                  ].map((dyn) => {
                    const isSelected = selectedDynamics.includes(dyn.id);
                    return (
                      <button
                        key={dyn.id}
                        type="button"
                        onClick={() => toggleDynamic(dyn.id)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/15 border-electricViolet/60 text-white font-bold"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{dyn.icon}</span>
                          <span className="text-xs truncate">{dyn.label}</span>
                        </span>
                        <span className={`font-mono text-xs font-bold ${isSelected ? "text-electricViolet-glow" : "text-neutral-600"}`}>
                          {isSelected ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Salud y Barreras */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                  Salud Sexual & Barreras
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "bareback_prep" as PreFlightProtection, label: t.rendezvous?.protectionBarebackPrep || (language === "es" ? "A pelo + PrEP" : "Bareback + PrEP"), icon: "🛡️" },
                    { key: "condom_only" as PreFlightProtection, label: language === "es" ? "Preservativo Obligatorio" : "Condoms Required", icon: "🎈" },
                    { key: "doxy_pep_friendly" as PreFlightProtection, label: language === "es" ? "Doxy-PEP Amigable" : "Doxy-PEP Friendly", icon: "💊" },
                    { key: "discuss_first" as PreFlightProtection, label: language === "es" ? "Charlar en persona" : "Discuss in person", icon: "💬" },
                  ].map((item) => {
                    const isSelected = protection === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setProtection(item.key)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-mintNeon/15 border-mintNeon/60 text-mintNeon font-bold shadow-mint-glow"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------
              PASO 2: LOGÍSTICA & DIRECCIÓN (Lugar & Waypoint)
              ----------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">
                  ¿Quién Pone el Lugar o Punto de Encuentro?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "i_host" as const, label: language === "es" ? "Recibo en mi lugar" : "I can host", sub: language === "es" ? "Pongo depto" : "Have place", icon: "🏠" },
                    { key: "they_host" as const, label: language === "es" ? "Voy a su lugar" : "They host", sub: language === "es" ? "Me desplazo" : "Can travel", icon: "🚗" },
                    { key: "neutral_corner" as const, label: language === "es" ? "Esquina neutra" : "Public corner", sub: language === "es" ? "Punto público seguro" : "Safe public point", icon: "📍" },
                    { key: "rendezvous_pin" as const, label: t.safety?.pinOfMeeting || (language === "es" ? "PIN de Encuentro Seguro" : "Meeting PIN"), sub: t.safety?.pinEphemeralDesc || (language === "es" ? "Código efímero de 4 dígitos" : "Ephemeral location"), icon: "⚡" },
                  ].map((opt) => {
                    const isSelected = hostingMode === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setHostingMode(opt.key)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-electricViolet/15 border-electricViolet text-white shadow-violet-soft font-bold"
                            : "bg-white/5 border-white/10 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opt.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">{opt.label}</span>
                            <span className="text-[10px] text-neutral-400 font-mono block truncate">{opt.sub}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fecha y Hora del Ticket de Encuentro con Presets de 1 Toque */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-electricViolet-glow">
                    <Clock className="w-4 h-4" />
                    <span>{language === "es" ? "Fecha & Hora del Encuentro" : "Encounter Date & Time"}</span>
                  </div>
                </div>

                {/* Chips Rápidos de Horario Táctico */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyQuickTimePreset("now30")}
                    className="py-1.5 px-2 rounded-xl bg-electricViolet/15 hover:bg-electricViolet/30 border border-electricViolet/40 text-electricViolet-glow text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                  >
                    ⚡ {language === "es" ? "Ahora (+30m)" : "Now (+30m)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTimePreset("tonight22")}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                  >
                    🌙 22:00 hs
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickTimePreset("late01")}
                    className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                  >
                    🔥 01:00 hs
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      {language === "es" ? "Fecha" : "Date"}
                    </label>
                    <input
                      type="date"
                      min={getLocalTodayIso()}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-obsidian border border-white/15 focus:border-electricViolet rounded-xl px-3 py-2 text-xs text-white font-mono focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      {language === "es" ? "Hora" : "Time"}
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full bg-obsidian border border-white/15 focus:border-electricViolet rounded-xl px-3 py-2 text-xs text-white font-mono focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Si recibo o es esquina neutra: Formulario de Waypoint en 2 fases */}
              {(hostingMode === "i_host" || hostingMode === "neutral_corner") && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-electricViolet-glow">
                      <MapPin className="w-4 h-4" />
                      <span>{language === "es" ? "Dirección Segura en 2 Fases" : "Safe 2-Phase Waypoint"}</span>
                    </div>
                    {hostingMode === "i_host" && (myHostCard?.hasPlace || myHostCard?.notes) && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        ✓ {language === "es" ? "Ficha de Casa" : "Host Card"}
                      </span>
                    )}
                  </div>

                  {/* Fase 1: Esquina pública */}
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      {language === "es" ? "Fase 1: Esquina o Intersección Pública (Visible al inicio)" : "Phase 1: Public Corner or Intersection (Visible initially)"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "es" ? "Ej: Av. Santa Fe y Thames" : "E.g.: 5th Ave & 42nd St"}
                      value={cornerText}
                      onChange={(e) => setCornerText(e.target.value)}
                      className="w-full bg-obsidian border border-white/15 focus:border-electricViolet rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-600 focus-visible:outline-none"
                    />
                  </div>

                  {/* Fase 2: Dirección y timbre (Solo para quien recibe) */}
                  {hostingMode === "i_host" && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                          {language === "es" ? "Fase 2: Dirección Exacta y Timbre (Se revela cuando avisa llegada)" : "Phase 2: Exact Address & Doorbell (Revealed upon arrival)"}
                        </label>
                        <input
                          type="text"
                          placeholder={language === "es" ? "Ej: Thames 1840, Piso 4 Depto B" : "E.g.: 123 Main St, Apt 4B"}
                          value={exactAddress}
                          onChange={(e) => setExactAddress(e.target.value)}
                          className="w-full bg-obsidian border border-white/15 focus:border-electricViolet rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-600 focus-visible:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                          {language === "es" ? "Notas de Acceso (Opcional)" : "Access Notes (Optional)"}
                        </label>
                        <input
                          type="text"
                          placeholder={language === "es" ? "Ej: Portero no anda, tocar timbre y esperar" : "E.g.: Buzzer broken, ring twice and wait"}
                          value={doorNotes}
                          onChange={(e) => setDoorNotes(e.target.value)}
                          className="w-full bg-obsidian border border-white/15 focus:border-electricViolet rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-600 focus-visible:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Si es Rendezvous PIN */}
              {hostingMode === "rendezvous_pin" && (
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-neutral-300 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Navigation className="w-4 h-4 text-purple-400" />
                    <span>{t.safety?.pinEphemeral || (language === "es" ? "PIN de Encuentro Seguro (<50m)" : "Ephemeral PIN with Geofencing")}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {language === "es"
                      ? "Se generará un código seguro de 4 dígitos. Ambos deben estar a menos de 50 metros para validar el encuentro físico sin guardar direcciones permanentes."
                      : "A 4-digit cryptographic PIN will be generated. Both must be within 50 meters to validate the physical encounter without storing permanent addresses."}
                  </p>
                </div>
              )}

              {/* Si hostea el otro */}
              {hostingMode === "they_host" && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Car className="w-4 h-4 text-electricViolet-glow" />
                    <span>{language === "es" ? "Te Desplazas hacia su Lugar" : "You travel to their place"}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {language === "es"
                      ? `Le pedirás a ${targetProfile.codename} que te envíe su esquina o dirección por el chat seguro.`
                      : `You will ask ${targetProfile.codename} to send their corner or address in the secure chat.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* -----------------------------------------------------
              PASO 3: BLINDAJE & SEGURIDAD (Guardián SOS & ETA)
              ----------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Guardián Silencioso */}
              <div className="p-3.5 rounded-2xl bg-bloodNeon/10 border border-bloodNeon/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-bloodNeon font-mono text-xs font-bold">
                    <Shield className="w-4 h-4" />
                    <span>{t.safety?.guardianLabel || (language === "es" ? "Guardián Silencioso" : "Silent Guardian")}</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon font-black">
                    {t.system?.localOnly || (language === "es" ? "SOLO EN TU CELU 🔒" : "LOCAL ONLY 🔒")}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 font-mono">
                  {language === "es"
                    ? "Si el tiempo expira sin que introduzcas tu PIN de seguridad, se activará la alerta de auxilio silenciosa hacia tu contacto."
                    : "If timer expires without entering your safety PIN, a silent distress alert will trigger to your emergency contact."}
                </p>

                {/* Opciones de temporizador */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { mins: 0, label: language === "es" ? "Sin SOS" : "No SOS" },
                    { mins: 45, label: "45 min" },
                    { mins: 60, label: "60 min" },
                    { mins: 90, label: "90 min" },
                  ].map((item) => {
                    const isSelected = guardianDuration === item.mins;
                    return (
                      <button
                        key={item.mins}
                        type="button"
                        onClick={() => setGuardianDuration(item.mins)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-bloodNeon text-white shadow-blood-glow font-black"
                            : "bg-black/40 text-neutral-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Campos de contacto si activa el guardián */}
                {guardianDuration > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-bloodNeon/20">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                        {language === "es" ? "Nombre de Confianza" : "Trusted Contact Name"}
                      </label>
                      <input
                        type="text"
                        placeholder={language === "es" ? "Ej: Hermano / Amigo" : "E.g.: Sibling / Friend"}
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full bg-black/60 border border-bloodNeon/40 focus:border-bloodNeon rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus-visible:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                        {language === "es" ? "Teléfono WhatsApp / SMS" : "WhatsApp / SMS Phone"}
                      </label>
                      <input
                        type="tel"
                        placeholder={language === "es" ? "+54 9 11 ..." : "+1 ..."}
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full bg-black/60 border border-bloodNeon/40 focus:border-bloodNeon rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus-visible:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Voy en Camino (ETA) */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                    <Car className="w-4 h-4 text-electricViolet-glow" />
                    <span>{language === "es" ? "Compartir Telemetría \"Voy en Camino\"" : "Share \"En Route\" Telemetry"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEnRouteActive(!isEnRouteActive)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      isEnRouteActive
                        ? "bg-electricViolet text-white shadow-violet-soft font-black"
                        : "bg-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {isEnRouteActive ? (language === "es" ? "ACTIVADO ✓" : "ACTIVE ✓") : (language === "es" ? "APAGADO" : "OFF")}
                  </button>
                </div>

                {isEnRouteActive && (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {language === "es" ? "Tiempo de viaje estimado:" : "Estimated travel time:"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[15, 25, 40].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEstimatedMinutes(m)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                            estimatedMinutes === m
                              ? "bg-electricViolet/20 border border-electricViolet text-electricViolet-glow"
                              : "bg-white/5 border border-white/10 text-neutral-400"
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            BOTONERA INFERIOR (NAVEGACIÓN DE PASOS / CONFIRMACIÓN)
            ========================================================= */}
        <div className="p-4 border-t border-white/10 bg-obsidian-deep/95 backdrop-blur-md flex items-center justify-between gap-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === "es" ? "Atrás" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-violet-soft cursor-pointer active:scale-95 transition-all ml-auto"
            >
              <span>{language === "es" ? "Continuar" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmAll}
              className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-electricViolet via-purple-600 to-electricViolet text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer active:scale-95 transition-all flex-1 ml-auto disabled:opacity-50"
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? (language === "es" ? "Blindando..." : "Securing...") : (language === "es" ? "Confirmar y Blindar Encuentro 🔥" : "Confirm & Secure Encounter 🔥")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
