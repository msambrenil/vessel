"use client";

import React, { useState, useRef } from "react";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { DiaryEntry, ProfileDossier } from "@/types/vessel";
import { DiaryBackupModal } from "./DiaryBackupModal";
import {
  Flame,
  Zap,
  Lock,
  Sparkles,
  Download,
  Upload,
} from "lucide-react";
import { formatDiaryDateDisplay, getLocalTodayIso } from "@/lib/calendar/dateLocale";
import { VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
import { TranslationType } from "@/lib/i18n/translations";

export interface LoverVaultItem {
  profileId: string;
  codename: string;
  avatarUrl: string;
  role: string;
  encounterCount: number;
  lastDate: string;
  chemistryLevel: number;
  wouldRepeat: boolean;
  photosCount: number;
  badges: string[];
}

interface DiaryLoversVaultSectionProps {
  lovers: LoverVaultItem[];
  diaryEntries?: DiaryEntry[];
  profileDossiers?: Record<string, Partial<ProfileDossier>>;
  onRestoreBackup?: (backup: { entries?: DiaryEntry[]; dossiers?: Record<string, Partial<ProfileDossier>> }) => void;
  onOpenDossier: (profileId: string) => void;
  onSendRevancha: (lover: { profileId: string; codename: string }) => void;
  language: "es" | "en";
  t: TranslationType;
}

export const DiaryLoversVaultSection: React.FC<DiaryLoversVaultSectionProps> = ({
  lovers,
  diaryEntries = [],
  profileDossiers = {},
  onRestoreBackup,
  onOpenDossier,
  onSendRevancha,
  language,
  t,
}) => {
  const [revanchaSentIds, setRevanchaSentIds] = useState<Record<string, boolean>>({});

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalMode, setBackupModalMode] = useState<"export" | "import">("export");

  const handleRevanchaClick = (lover: LoverVaultItem) => {
    audioEngine.playSubBass(55);
    setRevanchaSentIds((prev) => ({ ...prev, [lover.profileId]: true }));
    onSendRevancha({ profileId: lover.profileId, codename: lover.codename });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* CABECERA: AGENDA ÍNTIMA */}
      <div className="bg-gradient-to-br from-obsidian-surface via-obsidian-deep to-black border border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-mono font-black text-sm sm:text-base uppercase tracking-wider text-white">
                {t.diary.blackVaultTitle || (language === "es" ? "Agenda Íntima // Agenda de Amantes" : "Lovers Agenda // Private Archive")}
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 font-bold">
                {language === "es" ? "LOCAL CIFRADO" : "ENCRYPTED LOCAL"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              {t.diary.blackVaultSub ||
                (language === "es"
                  ? "Archivo privado e inborrable de amantes: química comprobada, fotos del chat, medallas íntimas y revancha en 1 toque."
                  : "Private archive of lovers: verified chemistry, chat photos, intimate badges and 1-tap rematch.")}
            </p>
          </div>
        </div>

        {/* BOTONERA DE RESPALDO CIFRADO LOCAL */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
          <button
            type="button"
            data-testid="diary-export-backup-btn"
            onClick={() => {
              setBackupModalMode("export");
              setIsBackupModalOpen(true);
              audioEngine.playPulse();
            }}
            className="px-3 py-1.5 min-h-[38px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-xs font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.diary.backupExportBtn || (language === "es" ? "Exportar Respaldo 🔒" : "Export Backup 🔒")}</span>
          </button>
          <button
            type="button"
            data-testid="diary-import-backup-btn"
            onClick={() => {
              setBackupModalMode("import");
              setIsBackupModalOpen(true);
              audioEngine.playPulse();
            }}
            className="px-3 py-1.5 min-h-[38px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricViolet/40 text-xs font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-electricViolet-glow" />
            <span>{t.diary.backupImportBtn || (language === "es" ? "Restaurar Respaldo 📥" : "Restore Backup 📥")}</span>
          </button>
        </div>
      </div>

      {lovers.length === 0 ? (
        <div className="bg-obsidian-surface/80 p-10 rounded-3xl border border-white/10 text-center space-y-3 shadow-card-elevation">
          <Flame className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="font-mono font-bold text-sm text-white uppercase">
            {language === "es"
              ? "Tu Agenda Íntima está esperando su primer registro"
              : "Your Lovers Agenda awaits its first conquest"}
          </h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {language === "es"
              ? "Registrá un encuentro o archivá fotos recibidas en el chat para construir el expediente privado de cada amante."
              : "Log an encounter or archive received chat photos to build each lover's private file."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {lovers.map((lover, idx) => {
            const isSent = !!revanchaSentIds[lover.profileId];

            return (
              <div
                key={lover.profileId}
                className="bg-obsidian-surface/95 border border-white/10 hover:border-amber-400/50 rounded-3xl p-4 space-y-3.5 shadow-card-elevation transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => {
                        onOpenDossier(lover.profileId);
                        audioEngine.playPulse();
                      }}
                      className="flex items-center gap-3 cursor-pointer group min-w-0"
                    >
                      <div className="relative flex-shrink-0">
                        <VaultEncryptedImage
                          src={lover.avatarUrl}
                          alt={lover.codename}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 group-hover:border-electricViolet transition-all"
                        />
                        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-black border border-amber-400/60 text-champagneGold font-mono text-[10px] font-black flex items-center justify-center shadow-md">
                          #{idx + 1}
                        </span>
                        {lover.photosCount > 0 && (
                          <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-lg bg-obsidian border border-electricViolet/60 text-[9px] font-mono font-black text-electricViolet-glow shadow-md">
                            📸 {lover.photosCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-mono font-black text-base text-white group-hover:text-electricViolet-glow truncate">
                          {lover.codename}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                            {getRoleDisplayLabel(lover.role, language)}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {lover.encounterCount} {language === "es" ? "sesiones" : "sessions"}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 mt-1">
                          {language === "es" ? "Última vez:" : "Last seen:"} {formatDiaryDateDisplay(lover.lastDate, language)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-black">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lover.chemistryLevel}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Medallas Íntimas */}
                  {lover.badges.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {lover.badges.map((badge) => (
                        <span
                          key={badge}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-purple-950/50 border border-electricViolet/30 text-electricViolet-glow"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botonera Táctica */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDossier(lover.profileId);
                      audioEngine.playPulse();
                    }}
                    className="flex-1 py-2.5 px-3 min-h-[44px] bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === "es" ? "Ficha Íntima" : "Lover File"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRevanchaClick(lover)}
                    className={`flex-1 py-2.5 px-3 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isSent
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                        : "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {isSent
                        ? lover.profileId.startsWith("ext-")
                          ? (language === "es" ? "Agendando..." : "Scheduling...")
                          : (t.diary.revanchaPulseSent || (language === "es" ? "Pulso Enviado" : "Pulse Sent"))
                        : lover.profileId.startsWith("ext-")
                        ? (language === "es" ? "Agendar Revancha" : "Schedule Rematch")
                        : (t.diary.revanchaBtn || "Quiero la Revancha")}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE RESPALDO CIFRADO (EXPORTAR / IMPORTAR) */}
      <DiaryBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        initialMode={backupModalMode}
        exportPayload={{
          entries: diaryEntries,
          dossiers: profileDossiers,
          lovers,
        }}
        onRestoreBackup={onRestoreBackup}
        language={language}
        t={t}
      />
    </div>
  );
};
