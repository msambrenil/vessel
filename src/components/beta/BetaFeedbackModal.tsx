"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { submitBetaFeedbackReport } from "@/lib/firebase/betaFeedbackService";
import { BetaReportType } from "@/types/vessel";
import {
  Bug,
  Sparkles,
  Zap,
  Activity,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Cpu,
} from "lucide-react";

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { myProfile, currentUserUid, language, batteryEngineState } = useVessel();

  const [reportType, setReportType] = useState<BetaReportType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      audioEngine.playSubBass(60);

      await submitBetaFeedbackReport({
        userId: currentUserUid || "anonymous_tester",
        userCodename: myProfile.codename || "Beta Tester",
        userAvatar: myProfile.avatarUrl || "",
        type: reportType,
        title: title.trim() || `${reportType.toUpperCase()} en ${pathname}`,
        description: description.trim(),
        currentPath: pathname || "/",
        deviceInfo: {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "SSR",
          screenResolution:
            typeof window !== "undefined"
              ? `${window.innerWidth}x${window.innerHeight} (dpr: ${window.devicePixelRatio})`
              : "Unknown",
          batteryLevel: batteryEngineState?.level,
          batteryCharging: batteryEngineState?.isCharging,
          batteryMode: batteryEngineState?.mode,
        },
        recentLogs: [],
      });

      audioEngine.playVesselCrescendoAlert();
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setTitle("");
        setDescription("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Error al enviar reporte:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex justify-center items-end sm:items-center p-0 sm:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-obsidian-surface border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[88vh] sm:max-h-[92vh] overflow-hidden shadow-card-elevation relative animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Cabecera */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  {language === "es" ? "HERRAMIENTAS BETA // REPORTE TÁCTICO" : "BETA TOOLS // TACTICAL REPORT"}
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet text-white font-extrabold uppercase">
                  TESTER
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {language === "es"
                  ? "Reportá errores, cuellos de botella o mejoras directamente a ingeniería."
                  : "Report bugs, bottlenecks or UX issues directly to engineering."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Formulario */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              {language === "es" ? "Reporte Recibido en Consola" : "Report Received in Console"}
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs">
              {language === "es"
                ? "Los metadatos de tu sesión fueron registrados en Firestore para su análisis."
                : "Session telemetry has been registered in Firestore for triage."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
            {/* Selector de Tipo de Reporte */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                {language === "es" ? "Categoría del Reporte" : "Report Category"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "bug", label: "Bug / Error", icon: Bug },
                  { id: "ui_ux", label: "UI / Diseño", icon: Sparkles },
                  { id: "performance", label: "Rendimiento", icon: Activity },
                  { id: "suggestion", label: "Sugerencia", icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = reportType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReportType(item.id as BetaReportType)}
                      className={`p-2.5 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-electricViolet/20 border-electricViolet text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                          : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/8"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título opcional */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                {language === "es" ? "Título Breve" : "Short Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  language === "es"
                    ? "Ej: El audio sub-bass no sonó al enviar pulso"
                    : "e.g.: Sub-bass audio did not play on pulse"
                }
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet"
              />
            </div>

            {/* Descripción detallada */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                {language === "es" ? "¿Qué sucedió? (Detalles)" : "What happened? (Details)"} *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === "es"
                    ? "Describí qué estabas haciendo, qué esperabas y qué ocurrió..."
                    : "Describe what you were doing, what you expected, and what happened..."
                }
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white font-sans text-xs placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet leading-relaxed"
              />
            </div>

            {/* Metadatos capturados automáticamente */}
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2 text-[10px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5 text-neutral-300 font-bold uppercase">
                <Cpu className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>Telemetría de Sesión Capturada Automáticamente</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-neutral-500">Ruta: </span>
                  <span className="text-white">{pathname}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Batería: </span>
                  <span className="text-white">
                    {batteryEngineState ? `${batteryEngineState.level}% (${batteryEngineState.mode})` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Tester ID: </span>
                  <span className="text-white truncate block">{currentUserUid?.slice(0, 10)}...</span>
                </div>
                <div>
                  <span className="text-neutral-500">Resolución: </span>
                  <span className="text-white">
                    {typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full h-11 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>{language === "es" ? "Enviando telemetría..." : "Sending..."}</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "Transmitir Reporte a Ingeniería" : "Submit Report to Ops"}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
