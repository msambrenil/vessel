"use client";

import React, { useState } from "react";
import { useDiary, useSettings } from "@/context/VesselContext";
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
import { BrutalistButton, BrutalistModal } from "@/components/ui";

export const ItsExposureModal: React.FC = () => {
  const {
    isItsExposureModalOpen,
    closeItsExposureModal,
    sendAnonymousItsAlert,
    diaryEntries,
  } = useDiary();
  const { language, t } = useSettings();

  const [itsType, setItsType] = useState<ItsExposureType>("gonorrhea");
  const [daysWindow, setDaysWindow] = useState<number>(14);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isItsExposureModalOpen) return null;

  // Contactos únicos recientes de la agenda
  const recentPartners = Array.from(
    new Set(diaryEntries.map((e) => e.person?.codename || "ANÓNIMO"))
  );

  const itsList: { id: ItsExposureType; name: string; icon: string }[] = [
    { id: "gonorrhea", name: language === "es" ? "Gonorrea" : "Gonorrhea", icon: "🦠" },
    { id: "chlamydia", name: language === "es" ? "Clamidia" : "Chlamydia", icon: "🔬" },
    { id: "syphilis", name: language === "es" ? "Sífilis" : "Syphilis", icon: "🩸" },
    { id: "mpox", name: "MPOX", icon: "🛡️" },
    { id: "hepatitis_a", name: language === "es" ? "Hepatitis A" : "Hepatitis A", icon: "💉" },
    { id: "other", name: language === "es" ? "Otra ETS / Infección" : "Other STI / Infection", icon: "⚠️" },
  ];

  const handleSend = () => {
    audioEngine.playPulse();
    const item = itsList.find((x) => x.id === itsType);
    sendAnonymousItsAlert(itsType, item?.name || itsType, daysWindow, selectedPartners);
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
    <BrutalistModal
      isOpen={isItsExposureModalOpen}
      onClose={closeItsExposureModal}
      icon={
        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
      }
      title={
        <div className="flex items-center gap-2">
          <span>{language === "es" ? "Alerta Clínica Anónima" : "Anonymous Health Alert"}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
            {language === "es" ? "100% ANÓNIMO" : "100% ANONYMOUS"}
          </span>
        </div>
      }
      subtitle={
        language === "es"
          ? "Cuidado colectivo de salud sexual sin revelar tu identidad"
          : "Collective sexual health care without disclosing your identity"
      }
      maxWidth="lg"
      ariaLabel={language === "es" ? "Alerta Clínica Anónima" : "Anonymous Health Alert"}
      contentClassName="p-4 space-y-4 text-xs"
      footer={
        !sentSuccess ? (
          <div className="flex items-center justify-end gap-2">
            <BrutalistButton
              variant="ghost"
              size="compact"
              onClick={closeItsExposureModal}
              className="text-xs font-mono"
            >
              {language === "es" ? "Cancelar" : "Cancel"}
            </BrutalistButton>
            <BrutalistButton
              variant="danger"
              size="compact"
              onClick={handleSend}
              className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === "es" ? "ENVIAR ALERTA ANÓNIMA" : "SEND ANONYMOUS ALERT"}</span>
            </BrutalistButton>
          </div>
        ) : undefined
      }
    >
      {sentSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                {language === "es" ? "Alerta Clínica Despachada" : "Health Alert Dispatched"}
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-xs leading-relaxed">
                {language === "es"
                  ? "Tus contactos han recibido el aviso médico preventivo de forma 100% anónima. Gracias por cuidar a la comunidad."
                  : "Your contacts received the preventive medical alert 100% anonymously. Thank you for protecting the community."}
              </p>
            </div>
          ) : (
            <>
              {/* Explicación de Privacidad & Cero Culpa */}
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1.5 font-mono text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase">
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {language === "es"
                      ? "Protocolo de Cero Identificación (100% Anónimo)"
                      : "Zero-Knowledge Anonymous Protocol"}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? "Las enfermedades de transmisión sexual son parte de la vida sexual activa. Este sistema permite avisar a quienes compartieron encuentros con vos para que se revisen a tiempo, sin que nadie sepa jamás quién envió la alerta."
                    : "Sexually transmitted infections can happen with active sex lives. This protocol allows you to notify past partners so they can get tested early, without anyone ever knowing who sent the alert."}
                </p>
              </div>

              {/* Selector de ETS */}
              <div>
                <label className="font-mono text-[11px] font-bold text-red-300 uppercase tracking-wider block mb-2">
                  {language === "es" ? "1. Diagnóstico o Sospecha Clínica:" : "1. Clinical Diagnosis or Suspicion:"}
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
                  {language === "es" ? "2. Período Aproximado del Encuentro:" : "2. Approximate Encounter Period:"}
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {[
                    { label: language === "es" ? "Últimos 7 días" : "Last 7 days", days: 7 },
                    { label: language === "es" ? "Últimos 14 días" : "Last 14 days", days: 14 },
                    { label: language === "es" ? "Últimos 30 días" : "Last 30 days", days: 30 },
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
                    {language === "es" ? "3. Contactos a Notificar:" : "3. Contacts to Notify:"}
                  </label>
                  {recentPartners.length > 0 && (
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-[10px] font-mono text-electricViolet-glow hover:underline font-bold cursor-pointer"
                    >
                      {language === "es" ? `Seleccionar Todos (${recentPartners.length})` : `Select All (${recentPartners.length})`}
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
                    {language === "es"
                      ? "No tenés contactos registrados en la Agenda de Encuentros. La alerta se transmitirá como difusión general preventiva en tus chats recientes."
                      : "No contacts logged in your Date Diary yet. The alert will be sent as a preventive broadcast to your recent chats."}
                  </p>
                )}
              </div>
            </>
          )}
    </BrutalistModal>
  );
};
