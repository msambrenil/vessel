"use client";

import React, { useMemo } from "react";
import { DoxyPepTracker, VesselProfile, DiaryEntry } from "@/types/vessel";
import { MyProfileState } from "@/context/VesselContext";
import { DoxyPepTrackerCard } from "./DoxyPepTrackerCard";
import { SectionHeroHeader } from "@/components/ui/SectionHeroHeader";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getLocalTodayIso, getDaysUntilDate, formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import { Plus, ShieldCheck, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { TranslationType } from "@/lib/i18n/translations";

interface DiaryHealthSectionProps {
  doxyPepTrackers: DoxyPepTracker[];
  addDoxyPepTracker: (encounter: { partnerCodename: string; encounterDate: string; encounterTime: string }) => void;
  openItsExposureModal: () => void;
  myProfile: MyProfileState | VesselProfile;
  diaryEntries?: DiaryEntry[];
  toggleHealthReminderResolved?: (id: string) => void;
  language: "es" | "en";
  t: TranslationType;
}

/**
 * DiaryHealthSection — Módulo Desacoplado de Salud Sexual, Prevención y Cuidados
 * Aísla el botiquín Doxy-PEP (ventana 72h), alertas anónimas de ITS y pautas de reducción de daños.
 */
export const DiaryHealthSection: React.FC<DiaryHealthSectionProps> = ({
  doxyPepTrackers,
  addDoxyPepTracker,
  openItsExposureModal,
  myProfile,
  diaryEntries = [],
  toggleHealthReminderResolved,
  language,
  t,
}) => {
  // Buscar el recordatorio de laboratorio PrEP 90 días más próximo activo en diaryEntries
  const nextHealthReminder = useMemo(() => {
    const activeReminders = diaryEntries
      .filter((e) => e.healthRoutineReminder?.enabled && !e.healthRoutineReminder?.isResolved && e.healthRoutineReminder?.dueDate)
      .sort((a, b) => (a.healthRoutineReminder!.dueDate > b.healthRoutineReminder!.dueDate ? 1 : -1));
    return activeReminders[0] || null;
  }, [diaryEntries]);

  const nextCheckupLabel = useMemo(() => {
    if (!nextHealthReminder?.healthRoutineReminder?.dueDate) {
      return language === "es" ? "En 45 días" : "In 45 days";
    }
    const days = getDaysUntilDate(nextHealthReminder.healthRoutineReminder.dueDate);
    if (days < 0) {
      return language === "es" ? `Vencido (${Math.abs(days)}d)` : `Overdue (${Math.abs(days)}d)`;
    }
    if (days === 0) return language === "es" ? "Hoy" : "Today";
    return language === "es"
      ? `En ${days} días (${formatDiaryDateDisplay(nextHealthReminder.healthRoutineReminder.dueDate, language)})`
      : `In ${days} days (${formatDiaryDateDisplay(nextHealthReminder.healthRoutineReminder.dueDate, language)})`;
  }, [nextHealthReminder, language]);

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* BOTIQUÍN CLÍNICO DOXY-PEP */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-emerald-500/30 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <SectionHeroHeader
          variant="mint"
          icon={<span className="text-xl leading-none">💊</span>}
          title={t.diary.doxyPepTitle}
          tag={language === "es" ? "VENTANA 72H" : "72H WINDOW"}
          subtitle={t.diary.doxyPepSub}
          actions={
            <button
              type="button"
              onClick={() => {
                addDoxyPepTracker({
                  partnerCodename: language === "es" ? "Contacto del Encuentro" : "Encounter Contact",
                  encounterDate: getLocalTodayIso(),
                  encounterTime: new Date().toTimeString().slice(0, 5),
                });
                audioEngine.playPulse();
              }}
              className="px-3 py-1.5 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{language === "es" ? "Nuevo Recordatorio" : "New Reminder"}</span>
            </button>
          }
        />

        {doxyPepTrackers.length > 0 ? (
          <div className="space-y-3 pt-1">
            {doxyPepTrackers.map((tracker) => (
              <DoxyPepTrackerCard key={tracker.id} tracker={tracker} />
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
            <span className="text-2xl block">🛡️</span>
            <p className="text-xs font-mono font-bold text-white">
              {language === "es" ? "Sin seguimientos Doxy-PEP activos" : "No active Doxy-PEP trackers"}
            </p>
            <p className="text-[11px] text-neutral-400 font-mono max-w-md mx-auto">
              {language === "es"
                ? "La profilaxis post-exposición con Doxiciclina (200mg) es más efectiva tomada dentro de las 24hs y hasta 72hs después de un encuentro sexual de riesgo."
                : "Post-exposure prophylaxis with Doxycycline (200mg) is most effective when taken within 24h to 72h after a sexual encounter."}
            </p>
            <button
              type="button"
              onClick={() => {
                addDoxyPepTracker({
                  partnerCodename: "CONTACTO",
                  encounterDate: getLocalTodayIso(),
                  encounterTime: new Date().toTimeString().slice(0, 5),
                });
                audioEngine.playPulse();
              }}
              className="mt-2 px-4 py-2 min-h-[44px] rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              + {language === "es" ? "Iniciar Seguimiento Doxy-PEP (72h)" : "Start Doxy-PEP Tracker (72h)"}
            </button>
          </div>
        )}
      </div>

      {/* CALENDARIO & CONTROL PrEP 90 DÍAS */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          variant="violet"
          icon={<ShieldCheck className="w-5 h-5 text-electricViolet-glow" />}
          title={language === "es" ? "Control & Calendario PrEP" : "PrEP Tracking & Calendar"}
          tag={language === "es" ? "CICLO 90 DÍAS" : "90-DAY CYCLE"}
          subtitle={
            language === "es"
              ? "Monitoreo preventivo trimestral, adherencia y recordatorio de laboratorio"
              : "Quarterly preventative monitoring, adherence and lab reminders"
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
              {language === "es" ? "Pauta Terapéutica" : "Regimen"}
            </span>
            <span className="text-sm font-mono font-black text-white block">
              {myProfile.hivStatus?.includes("PrEP")
                ? language === "es" ? "PrEP Diaria Activa" : "Daily PrEP Active"
                : language === "es" ? "PrEP No Registrada" : "No PrEP Registered"}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {language === "es" ? "Protección comprobada >99%" : "Protection verified >99%"}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                {language === "es" ? "Próximo Chequeo Clínico" : "Next Lab Checkup"}
              </span>
              <span className="text-sm font-mono font-black text-amber-300 block">
                {nextCheckupLabel}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                VIH, Creatinina, Sífilis, VHB/VHC
              </span>
            </div>
            {nextHealthReminder && toggleHealthReminderResolved && (
              <button
                type="button"
                onClick={() => {
                  toggleHealthReminderResolved(nextHealthReminder.id);
                  audioEngine.playPulse();
                }}
                className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1 w-fit cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{language === "es" ? "Marcar Chequeo Realizado" : "Mark Lab Completed"}</span>
              </button>
            )}
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
              {language === "es" ? "Stock & Cobertura" : "Prescription & Stock"}
            </span>
            <span className="text-sm font-mono font-black text-electricViolet-glow block">
              {language === "es" ? "Vigente (Hospital / Centro)" : "Valid (Public Health)"}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {language === "es" ? "Acceso gratuito Ley Nacional" : "Free national coverage"}
            </span>
          </div>
        </div>
      </div>

      {/* ALERTA ANÓNIMA DE EXPOSICIÓN A ETS */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-red-500/30 space-y-3.5 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <SectionHeroHeader
          variant="blood"
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
          title={language === "es" ? "ALERTA DE EXPOSICIÓN A ETS - 100% ANÓNIMA" : "Anonymous STI Exposure Alert"}
          tag={language === "es" ? "PROTECCIÓN COLECTIVA" : "COMMUNITY CARE"}
          subtitle={
            language === "es"
              ? "Avisá a tus contactos recientes para que puedan testearse a tiempo sin revelar tu identidad"
              : "Notify recent partners so they can get tested in time without revealing your identity"
          }
        />

        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-mono text-neutral-200">
              {language === "es"
                ? "Cero estigma, máxima responsabilidad. VESSEL envía un aviso criptográfico anónimo a los perfiles con los que registraste encuentros en los últimos 30 días."
                : "Zero stigma, maximum responsibility. VESSEL sends an anonymous cryptographic alert to partners you logged encounters with in the last 30 days."}
            </p>
            <p className="text-[10px] font-mono text-neutral-400">
              🔒 {language === "es" ? "Ni tu nombre, ni tu perfil, ni la fecha exacta son revelados." : "Neither your name, profile, nor the exact date are ever revealed."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              openItsExposureModal();
              audioEngine.playPulse();
            }}
            className="px-4 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === "es" ? "Emitir Alerta Anónima" : "Broadcast Anonymous Alert"}</span>
          </button>
        </div>
      </div>

      {/* PROTOCOLO DE REDUCCIÓN DE DAÑOS */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          variant="violet"
          icon={<Sparkles className="w-4 h-4 text-champagneGold" />}
          title={language === "es" ? "Reducción de Daños • Pautas de Cuidado" : "Harm Reduction • Care Protocol"}
          tag={language === "es" ? "CUIDADO & BIENESTAR" : "CARE & WELLBEING"}
          subtitle={
            language === "es"
              ? "Información basada en evidencia para encuentros placenteros, informados y seguros"
              : "Evidence-based guidelines for pleasurable, informed, and safe encounters"
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>💧</span>
              <span>{language === "es" ? "Hidratación & Sales" : "Hydration & Electrolytes"}</span>
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === "es"
                ? "Tomá agua en sorbos pequeños. Si la sesión se extiende, sumá bebidas isotónicas para no descompensar."
                : "Sip water regularly. For longer sessions, add electrolyte drinks to prevent dehydration."}
            </p>
          </div>

          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>🤝</span>
              <span>{language === "es" ? "Consentimiento Continuo" : "Ongoing Consent"}</span>
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === "es"
                ? "Un 'sí' inicial no es un cheque en blanco. Chequeá periódicamente cómo se siente el otro y comunicá tus límites."
                : "An initial yes is not permanent. Check in periodically and communicate your boundaries clearly."}
            </p>
          </div>

          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>⏱️</span>
              <span>{language === "es" ? "Tiempos & Espaciado" : "Timing & Spacing"}</span>
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === "es"
                ? "Evitá redosificaciones apresuradas. Dale tiempo al cuerpo para procesar y descansá entre rondas."
                : "Avoid rushing redosing. Allow your body time to metabolize and rest between rounds."}
            </p>
          </div>

          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>🛡️</span>
              <span>{language === "es" ? "Línea de Auxilio 24h" : "24/7 Helpline"}</span>
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === "es"
                ? "Ante dudas de salud o emergencias médicas, llamá al 107 (SAME) o al 144 en Argentina."
                : "For medical emergencies in Argentina, dial 107 (SAME) or 144."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
