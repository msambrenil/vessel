"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Download, Upload, AlertCircle, Check, FileText } from "lucide-react";
import { BrutalistModal, BrutalistInput, BrutalistButton } from "@/components/ui";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  encryptDiaryBackup,
  decryptDiaryBackup,
  downloadBackupFile,
} from "@/lib/security/diaryBackupCrypto";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";
import { TranslationType } from "@/lib/i18n/translations";
import { DiaryEntry, ProfileDossier } from "@/types/vessel";

export interface DiaryRestoredBackupPayload {
  entries?: DiaryEntry[];
  dossiers?: Record<string, Partial<ProfileDossier>>;
  lovers?: Record<string, unknown>[];
}

export interface DiaryBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "export" | "import";
  exportPayload: Record<string, unknown>;
  onRestoreBackup?: (backup: DiaryRestoredBackupPayload) => void;
  initialFileContent?: string | null;
  language: "es" | "en";
  t: TranslationType;
}

export const DiaryBackupModal: React.FC<DiaryBackupModalProps> = ({
  isOpen,
  onClose,
  initialMode = "export",
  exportPayload,
  onRestoreBackup,
  initialFileContent = null,
  language,
  t,
}) => {
  const [mode, setMode] = useState<"export" | "import">(initialMode);
  const [password, setPassword] = useState("");
  const [importContent, setImportContent] = useState<string | null>(initialFileContent);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setPassword("");
      setImportContent(initialFileContent);
      setSelectedFileName(initialFileContent ? "backup.json" : null);
      setErrorMessage(null);
      setStatusMessage(null);
    }
  }, [isOpen, initialMode, initialFileContent]);

  const handleModeChange = (newMode: "export" | "import") => {
    setMode(newMode);
    setPassword("");
    setErrorMessage(null);
    setStatusMessage(null);
    audioEngine.playPulse();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportContent(content);
      setErrorMessage(null);
      audioEngine.playPulse();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.trim().length === 0) {
      setErrorMessage(
        language === "es"
          ? "Ingresá una contraseña para cifrar el archivo."
          : "Enter a password to encrypt the file."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const envelope = await encryptDiaryBackup(exportPayload, password);
      const blob = new Blob([JSON.stringify(envelope, null, 2)], {
        type: "application/json",
      });
      const filename = `vessel-diary-backup-${getLocalTodayIso()}.json`;
      downloadBackupFile(blob, filename);

      audioEngine.playSubBass(75);
      setStatusMessage(
        t.diary?.backupSuccess ||
          (language === "es"
            ? "Respaldo exportado exitosamente"
            : "Backup exported successfully")
      );

      setTimeout(() => {
        onClose();
        setPassword("");
        setStatusMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMessage(
        msg ||
          (language === "es"
            ? "Error al cifrar el respaldo"
            : "Error encrypting backup")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent) {
      setErrorMessage(
        language === "es"
          ? "Seleccioná un archivo de respaldo primero."
          : "Select a backup file first."
      );
      return;
    }

    if (!password || password.trim().length === 0) {
      setErrorMessage(
        language === "es"
          ? "Ingresá la contraseña del archivo."
          : "Enter file password."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const parsedEnvelope = JSON.parse(importContent);
      const restored = await decryptDiaryBackup(parsedEnvelope, password);

      if (onRestoreBackup) {
        onRestoreBackup(restored as DiaryRestoredBackupPayload);
      }

      audioEngine.playSubBass(75);
      setStatusMessage(
        t.diary?.backupRestoreSuccess ||
          (language === "es"
            ? "Respaldo restaurado exitosamente"
            : "Backup restored successfully")
      );

      setTimeout(() => {
        onClose();
        setPassword("");
        setImportContent(null);
        setSelectedFileName(null);
        setStatusMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMessage(
        msg ||
          (language === "es"
            ? "Contraseña incorrecta o archivo inválido"
            : "Invalid password or corrupted file")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const modalTitle =
    mode === "export"
      ? language === "es"
        ? "Exportar Respaldo Cifrado"
        : "Export Encrypted Backup"
      : language === "es"
      ? "Restaurar Respaldo Cifrado"
      : "Restore Encrypted Backup";

  return (
    <BrutalistModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={
        language === "es"
          ? "Cifrado Militar AES-GCM 256-bit"
          : "Military AES-GCM 256-bit Encryption"
      }
      icon={<ShieldCheck className="w-5 h-5 text-mintNeon" />}
      maxWidth="md"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Selector de modo */}
        <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => handleModeChange("export")}
            className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "export"
                ? "bg-mintNeon text-black font-black shadow-mint-soft"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === "es" ? "Exportar" : "Export"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("import")}
            className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "import"
                ? "bg-electricViolet text-white font-black shadow-violet-soft"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === "es" ? "Restaurar" : "Restore"}</span>
          </button>
        </div>

        {/* Descripción informativa */}
        <p className="text-xs text-neutral-400 font-mono leading-relaxed">
          {mode === "export"
            ? language === "es"
              ? "Tus datos (citas, notas íntimas de amantes y fotos) se cifrarán con AES-GCM 256 bits antes de descargarse. Solo quien conozca la contraseña podrá descifrarlos."
              : "Your data (encounters, lovers' notes and photos) will be encrypted with AES-GCM 256-bit before downloading. Only those with the password can decrypt it."
            : language === "es"
            ? "Ingresá la contraseña con la que protegiste el archivo para restaurar tus registros en este dispositivo."
            : "Enter the password you used to protect the file to restore your records on this device."}
        </p>

        {/* En modo Import: Selector de archivo si aún no hay o para cambiarlo */}
        {mode === "import" && (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileSelect}
            />
            {importContent ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-200">
                  <FileText className="w-4 h-4 text-electricViolet-glow" />
                  <span className="truncate max-w-[200px]">
                    {selectedFileName || "backup.json"}
                  </span>
                </div>
                <BrutalistButton
                  variant="ghost"
                  size="compact"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {language === "es" ? "Cambiar" : "Change"}
                </BrutalistButton>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-white/20 hover:border-electricViolet rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-all cursor-pointer bg-black/40"
              >
                <Upload className="w-5 h-5 text-electricViolet-glow" />
                <span className="text-xs font-mono font-bold">
                  {language === "es"
                    ? "Seleccionar archivo de respaldo (.json)"
                    : "Select backup file (.json)"}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Formulario con campo de contraseña */}
        <form
          onSubmit={mode === "export" ? handleExport : handleImport}
          className="space-y-4"
        >
          <BrutalistInput
            type="password"
            required
            autoFocus
            data-testid="diary-backup-password-input"
            label={language === "es" ? "Contraseña del Archivo" : "File Password"}
            placeholder={
              language === "es" ? "Ingresá contraseña segura" : "Enter secure password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && (
            <div
              data-testid="diary-backup-error-msg"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div
              data-testid="diary-backup-success-msg"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <BrutalistButton variant="ghost" size="default" onClick={onClose}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </BrutalistButton>
            <BrutalistButton
              type="submit"
              variant={mode === "export" ? "mint" : "primary"}
              size="default"
              data-testid="diary-backup-submit-btn"
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? (
                <span>{language === "es" ? "Procesando..." : "Processing..."}</span>
              ) : mode === "export" ? (
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "Descargar .json" : "Download .json"}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === "es" ? "Descifrar e Importar" : "Decrypt & Import"}</span>
                </span>
              )}
            </BrutalistButton>
          </div>
        </form>
      </div>
    </BrutalistModal>
  );
};
