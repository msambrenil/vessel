"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  X,
  HeartHandshake,
} from "lucide-react";
import { ItsExposureType } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const ItsExposureModal: React.FC = () => {
  const {
    isItsExposureModalOpen,
    closeItsExposureModal,
    sendAnonymousItsAlert,
    diaryEntries,
    t,
  } = useVessel();

  const [itsType, setItsType] = useState<ItsExposureType>("gonorrhea");
  const [daysWindow, setDaysWindow] = useState<number>(14);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isItsExposureModalOpen) return null;

  // Contactos únicos recientes del diario
  const recentPartners = Array.from(
    new Set(diaryEntries.map((e) => e.person?.codename || "ANONYMOUS"))
  );

  const itsList: { id: ItsExposureType; name: string; icon: string }[] = [
    { id: "gonorrhea", name: "Gonorrea", icon: "🦠" },
    { id: "chlamydia", name: "Clamidia", icon: "🔬" },
    { id: "syphilis", name: "Sífilis", icon: "🩸" },
    { id: "mpox", name: "MPOX", icon: "🛡️" },
    { id: "hepatitis_a", name: "Hepatitis A", icon: "💉" },
    { id: "other", name: "Otra ITS / Infección", icon: "⚠️" },
  ];

  const handleSend = () => {
    audioEngine.playPulse();
    const item = itsList.find((x) => x.id === itsType);
    sendAnonymousItsAlert(itsType, item?.name || itsType, daysWindow);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      closeItsExposureModal();
    }, 2200);
  };

  const togglePartner = (partnerName: string) => {
    if (selectedPartners.includes(partnerName)) {
      setSelectedPartners(selectedPartners.filter((p) => p !== partnerName));
    } else {
      setSelectedPartners([...selectedPartners, partnerName]);
    }
  };

  const selectAll = () => {
    setSelectedPartners([...recentPartners]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className="relative w-full max-w-lg bg-[#0c0c0c] border border-red-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Táctico */}
        <div className="p-4 border-b border-red-500/30 bg-red-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-white flex items-center gap-2">
                <span>Alerta Clínica Anónima</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  100% ANÓNIMO
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                Cuidado colectivo de salud sexual sin revelar tu identidad
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeItsExposureModal}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {sentSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Alerta Clínica Despachada
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-xs leading-relaxed">
                Tus contactos han recibido el aviso médico preventivo de forma 100% anónima. Gracias por cuidar a la comunidad.
              </p>
            </div>
          ) : (
            <>
              {/* Explicación de Privacidad & Cero Culpa */}
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1.5 font-mono text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Protocolo Zero-Knowledge (Cero Identificación)</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Las infecciones de transmisión sexual son parte de la vida sexual activa. Este sistema permite avisar a quienes compartieron encuentros contigo para que se revisen a tiempo, sin que nadie sepa jamás quién envió la alerta.
                </p>
              </div>

              {/* Selector de ITS */}
              <div>
                <label className="font-mono text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-2">
                  1. Diagnóstico o Sospecha Clínica:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {itsList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setItsType(item.id)}
                      className={`p-2.5 rounded-xl border text-left font-mono transition-all flex items-center gap-2 cursor-pointer ${
                        itsType === item.id
                          ? "bg-red-950/40 border-red-500 text-red-200 shadow-sm"
                          : "bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="font-bold text-xs truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ventana Temporal */}
              <div>
                <label className="font-mono text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-1.5">
                  2. Período Aproximado del Encuentro:
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {[
                    { label: "Últimos 7 días", days: 7 },
                    { label: "Últimos 14 días", days: 14 },
                    { label: "Últimos 30 días", days: 30 },
                  ].map((period) => (
                    <button
                      key={period.days}
                      type="button"
                      onClick={() => setDaysWindow(period.days)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        daysWindow === period.days
                          ? "bg-red-950/40 border-red-500 text-red-200 font-bold"
                          : "bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinatarios */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-[11px] font-bold text-red-300 uppercase tracking-wider">
                    3. Contactos a Notificar:
                  </label>
                  {recentPartners.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-[10px] font-mono text-electricViolet-glow hover:underline font-bold"
                    >
                      Seleccionar Todos ({recentPartners.length})
                    </button>
                  )}
                </div>

                {recentPartners.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {recentPartners.map((partner) => {
                      const isSelected = selectedPartners.includes(partner);
                      return (
                        <button
                          key={partner}
                          type="button"
                          onClick={() => togglePartner(partner)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-red-500 text-white border-red-400 shadow-sm"
                              : "bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                          }`}
                        >
                          <span>{partner}</span>
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-[11px] text-neutral-500 font-mono">
                    No tienes contactos registrados en el Date Diary. La alerta se transmitirá como difusión general preventiva en tus chats recientes.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sentSuccess && (
          <div className="p-3 border-t border-white/10 bg-neutral-950 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeItsExposureModal}
              className="px-4 py-2 rounded-xl font-mono text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ENVIAR ALERTA ANÓNIMA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
