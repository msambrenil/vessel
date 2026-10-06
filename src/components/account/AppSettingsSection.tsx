"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";
import {
  Globe,
  Ruler,
  Cloud,
  RefreshCw,
  Download,
  Upload,
  Volume2,
  Shield,
  Trash2,
  Sliders,
  Sparkles,
  Lock,
  LogOut,
  UserCheck,
  Zap,
  CheckCircle2,
  LayoutDashboard,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { AppModeModal } from "@/components/settings/AppModeModal";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { checkIsAdminAuthorized } from "@/lib/admin/adminService";

import { createVipInviteCode } from "@/lib/firebase/inviteService";

export const AppSettingsSection: React.FC = () => {
  const {
    appMode,
    setAppMode,
    appSettings,
    updateAppSettings,
    language,
    setLanguage,
    unitSystem,
    setUnitSystem,
    t,
    isSyncingCloud,
    syncCloudNow,
    exportBackupData,
    logout,
    currentUserUid,
    isCloudConnected,
    authUser,
    isAuthenticated,
    isAnonymous,
    openAuthModal,
    isGpsHibernating,
    confirmPartyArrivalLock,
    checkOutOfEvent,
    activeCheckin,
    profiles,
  } = useVessel();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppModeModalOpen, setIsAppModeModalOpen] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [customVipCode, setCustomVipCode] = useState("VESSEL-VIP-01");
  const [isCreatingVip, setIsCreatingVip] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateAndCopyVipLink = async () => {
    setIsCreatingVip(true);
    audioEngine.playPulse();
    const res = await createVipInviteCode({
      code: customVipCode || "VESSEL-VIP",
      maxUses: 20,
      createdByUid: authUser?.uid || currentUserUid,
    });
    setIsCreatingVip(false);
    try {
      await navigator.clipboard.writeText(res.shareUrl);
      showToast(
        language === "es"
          ? `Link VIP (${res.code}) copiado al portapapeles`
          : `VIP Link (${res.code}) copied to clipboard`
      );
    } catch {
      showToast(res.shareUrl);
    }
  };

  const handleTestSound = () => {
    audioEngine.playVesselCrescendoAlert();
    showToast(
      language === "es"
        ? "Crescendo Háptico VESSEL (15ms ➔ 180ms + Sub-Bass 45-88Hz) emitido"
        : "VESSEL Crescendo Haptic & Sub-Bass emitted"
    );
  };

  const handleExportBackup = () => {
    const data = exportBackupData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vessel-backup-${getLocalTodayIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audioEngine.playSignalSent();
    showToast(t.settings.backupExportedSuccess);
  };

  const handleConfirmPurge = () => {
    audioEngine.playPulse();
    setIsPurgeConfirmOpen(false);
    showToast(t.settings.purgedSuccess);
  };

  return (
    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-6 shadow-card-elevation">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-electricViolet text-white font-bold text-xs px-4 py-2 rounded-full shadow-violet-soft animate-in fade-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* 0. PANEL DE CONTROL ADMIN: CONMUTADOR DE MODO + PASES VIP + GPS 30M / FIESTA */}
      <div className="bg-electricViolet/10 rounded-2xl p-3.5 border border-electricViolet/35 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-electricViolet" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {language === "es" ? "Consola Admin & Control de Entorno" : "Admin Console & Mode Control"}
            </span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-electricViolet/25 text-white border border-electricViolet/40">
            ADMIN
          </span>
        </div>

        {/* 1-Tap Switch: Modo Real vs Modo Prueba (Habilitado para pruebas y desarrollo) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-300">
            <span>{language === "es" ? "Entorno de Ejecución" : "Runtime Environment"}</span>
            <span className={appMode === "real" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {appMode === "real"
                ? `LIVE MATRIX (${profiles.length} ACTIVOS <30M)`
                : "SANDBOX LOCAL (BETA)"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAppMode("real");
                audioEngine.playVesselCrescendoAlert();
                showToast(
                  language === "es"
                    ? "Modo Real Activado (Firestore + TTL 30m)"
                    : "Real Mode Activated (Firestore + 30m TTL)"
                );
              }}
              className={`h-11 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appMode === "real"
                  ? "bg-emerald-500/25 border-emerald-400 text-white shadow-sm"
                  : "bg-black/50 border-white/15 text-neutral-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === "es" ? "Modo Real" : "Real Mode"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAppMode("test");
                audioEngine.playPulse();
                showToast(
                  language === "es"
                    ? "Modo Beta Activado (Río Cuarto / Sandbox)"
                    : "Beta Mode Activated (Río Cuarto / Sandbox)"
                );
              }}
              className={`h-11 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appMode === "test"
                  ? "bg-amber-500/25 border-amber-400 text-white shadow-sm"
                  : "bg-black/50 border-white/15 text-neutral-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{language === "es" ? "Modo Beta" : "Beta Mode"}</span>
            </button>
          </div>
        </div>

        {/* Estado de GPS 30m & Modo Fiesta ("Llegué" -> Hibernación de GPS) */}
        <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300">
              {language === "es" ? "Estado de Radar & GPS" : "Radar & GPS State"}
            </span>
            <span className="text-[10px] font-mono font-bold text-electricViolet">
              {isGpsHibernating || activeCheckin
                ? language === "es"
                  ? "⚡ ANCLADO EN FIESTA (GPS EN HIBERNACIÓN · TTL 4H)"
                  : "⚡ PARTY ANCHORED (GPS HIBERNATING · 4H TTL)"
                : language === "es"
                ? "📡 WAKE-ON-OPEN ACTIVO (EXPIRA EN 30 MIN)"
                : "📡 WAKE-ON-OPEN ACTIVE (30M TTL)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isGpsHibernating || activeCheckin) {
                  checkOutOfEvent();
                  showToast(
                    language === "es"
                      ? "Saliste del Modo Fiesta. GPS Wake-on-Open (30m) restaurado."
                      : "Party Mode exited. 30m Wake-on-Open GPS restored."
                  );
                } else {
                  confirmPartyArrivalLock("CLUB VESSEL");
                  showToast(
                    language === "es"
                      ? "¡Llegaste a la Fiesta! Perfil anclado 4h y GPS en hibernación para cuidar tu batería."
                      : "Party Arrival Confirmed! Profile anchored 4h & GPS hibernated."
                  );
                }
              }}
              className={`h-10 px-2.5 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isGpsHibernating || activeCheckin
                  ? "bg-electricViolet text-white border-electricViolet"
                  : "bg-white/5 border-white/15 text-white hover:bg-white/10"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isGpsHibernating || activeCheckin
                  ? language === "es"
                    ? "Salir de Fiesta (Reactivar GPS)"
                    : "Leave Party (Wake GPS)"
                  : language === "es"
                  ? "📍 Llegué a la Fiesta (Apagar GPS)"
                  : "📍 Arrived at Party (Hibernate GPS)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTestSound}
              className="h-10 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-electricViolet flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Vibración Crescendo" : "Crescendo Haptic"}</span>
            </button>
          </div>
        </div>

        {/* Generador de Códigos VIP */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            {language === "es"
              ? "Generar y copiar link VIP (?vip=CODIGO) para asignar testers en Modo Real:"
              : "Generate and copy VIP link (?vip=CODE) to assign testers in Real Mode:"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customVipCode}
              onChange={(e) => setCustomVipCode(e.target.value.toUpperCase())}
              placeholder="VESSEL-VIP-01"
              className="flex-1 h-11 px-3 rounded-xl bg-black/70 border border-white/20 text-xs font-mono uppercase tracking-wider text-white focus:border-electricViolet focus:outline-none"
            />
            <button
              type="button"
              disabled={isCreatingVip}
              onClick={handleCreateAndCopyVipLink}
              className="px-4 h-11 rounded-xl bg-electricViolet hover:bg-electricViolet/90 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              {isCreatingVip
                ? "..."
                : language === "es"
                ? "Crear y Copiar Link"
                : "Create & Copy Link"}
            </button>
          </div>
        </div>
      </div>


      {/* 1. PREFERENCIAS GENERALES: IDIOMA & UNIDADES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-electricViolet-glow uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>{t.settings.sectionGeneral}</span>
        </div>

        {/* Selector de Idioma */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">
              {t.settings.languageLabel}
            </span>
            <span className="text-[10px] text-neutral-400">
              {t.settings.languageDesc}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setLanguage("es");
                audioEngine.playPulse();
              }}
              aria-pressed={language === "es"}
              className={`p-3 min-h-[44px] rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                language === "es"
                  ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow shadow-[0_0_10px_rgba(139,92,246,0.2)] font-extrabold"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <span>🇦🇷</span>
              <span>Español (Rioplatense)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                audioEngine.playPulse();
              }}
              aria-pressed={language === "en"}
              className={`p-3 min-h-[44px] rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                language === "en"
                  ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow shadow-[0_0_10px_rgba(139,92,246,0.2)] font-extrabold"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Selector de Sistema de Unidad */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-bold text-white">
                {t.settings.unitSystemLabel}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {t.settings.unitSystemDesc}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setUnitSystem("metric");
                audioEngine.playPulse();
              }}
              aria-pressed={unitSystem === "metric"}
              className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                unitSystem === "metric"
                  ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-bold shadow-violet-soft"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <span>📏 {t.settings.metricOption}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUnitSystem("imperial");
                audioEngine.playPulse();
              }}
              aria-pressed={unitSystem === "imperial"}
              className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98 ${
                unitSystem === "imperial"
                  ? "bg-electricViolet/15 border-electricViolet text-electricViolet-glow font-bold shadow-violet-soft"
                  : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              <span>📐 {t.settings.imperialOption}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ALMACENAMIENTO & SINCRONIZACIÓN */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-electricViolet-glow uppercase tracking-wider font-mono">
          <Cloud className="w-4 h-4" />
          <span>{t.settings.sectionStorage}</span>
        </div>

        {/* Cloud Sync */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.settings.cloudSyncLabel}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${isCloudConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-purple-950/40 text-purple-300 border border-purple-800/40"}`}>
                  {isCloudConnected
                    ? (language === "es" ? "NUBE CONECTADA" : "CLOUD ONLINE")
                    : (language === "es" ? "MEMORIA LOCAL" : "LOCAL CACHE")}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {t.settings.cloudSyncDesc}
              </p>
              {currentUserUid && currentUserUid !== "local-user" && (
                <p className="text-[9px] text-neutral-500 font-mono mt-0.5 truncate">
                  UID: {currentUserUid}
                </p>
              )}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={appSettings.cloudSyncEnabled}
              onClick={() =>
                updateAppSettings({
                  cloudSyncEnabled: !appSettings.cloudSyncEnabled,
                })
              }
              aria-label="Activar o desactivar sincronización en la nube"
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                appSettings.cloudSyncEnabled ? "bg-emerald-500" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  appSettings.cloudSyncEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
            <span className="text-neutral-400">
              {t.settings.lastSyncLabel}{" "}
              <strong className="text-neutral-200">
                {appSettings.lastCloudSyncAt || t.settings.neverSynced}
              </strong>
            </span>

            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={syncCloudNow}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 min-h-[40px] rounded-lg flex items-center gap-1.5 font-bold transition-all disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncingCloud ? "animate-spin text-electricViolet-glow" : ""}`}
              />
              <span>{isSyncingCloud ? t.settings.syncing : t.settings.syncNowBtn}</span>
            </button>
          </div>
        </div>

        {/* Backup Local */}
        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">
                {t.settings.autoBackupLabel}
              </span>
              <p className="text-[10px] text-neutral-400">
                {t.settings.autoBackupDesc}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={appSettings.autoBackupEnabled}
              onClick={() =>
                updateAppSettings({
                  autoBackupEnabled: !appSettings.autoBackupEnabled,
                })
              }
              aria-label="Activar o desactivar backup automático"
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                appSettings.autoBackupEnabled ? "bg-electricViolet" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  appSettings.autoBackupEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-2.5 min-h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{t.settings.exportBackupBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => showToast("Restauración de backup lista para importar")}
              className="p-2.5 min-h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-medium text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.settings.importBackupBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. EXPERIENCIA SENSORIAL */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-electricViolet-glow uppercase tracking-wider font-mono">
          <Volume2 className="w-4 h-4" />
          <span>{t.settings.sectionSensory}</span>
        </div>

        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">
                {t.settings.soundLabel}
              </span>
              <p className="text-[10px] text-neutral-400">
                {t.settings.soundDesc}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={appSettings.soundEnabled}
              onClick={() =>
                updateAppSettings({ soundEnabled: !appSettings.soundEnabled })
              }
              aria-label="Activar o desactivar sonido analógico"
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                appSettings.soundEnabled ? "bg-electricViolet" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  appSettings.soundEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Toggle Háptico Táctil */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <span className="text-xs font-bold text-white">
                {t.settings.hapticLabel}
              </span>
              <p className="text-[10px] text-neutral-400">
                {t.settings.hapticDesc}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={appSettings.hapticFeedbackEnabled}
              onClick={() => {
                const nextVal = !appSettings.hapticFeedbackEnabled;
                updateAppSettings({ hapticFeedbackEnabled: nextVal });
                if (nextVal) {
                  audioEngine.triggerTacticalPulse();
                }
              }}
              aria-label="Activar o desactivar respuesta háptica vibratoria"
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                appSettings.hapticFeedbackEnabled ? "bg-electricViolet" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  appSettings.hapticFeedbackEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleTestSound}
              className="py-1 px-2.5 min-h-[36px] text-xs font-bold text-electricViolet-glow hover:text-white bg-electricViolet/10 hover:bg-electricViolet/20 rounded-xl border border-electricViolet/30 flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.settings.testToneBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRIVACIDAD & PURGA */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-bloodNeon uppercase tracking-wider font-mono">
          <Shield className="w-4 h-4" />
          <span>{t.settings.sectionPrivacy}</span>
        </div>

        <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">
                {t.settings.strictAntiTriangulationLabel}
              </span>
              <p className="text-[10px] text-neutral-400">
                {t.settings.strictAntiTriangulationDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateAppSettings({
                  antiTriangulationStrict: !appSettings.antiTriangulationStrict,
                })
              }
              aria-pressed={appSettings.antiTriangulationStrict}
              aria-label="Activar o desactivar anti-triangulación estricta"
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                appSettings.antiTriangulationStrict ? "bg-emerald-500" : "bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  appSettings.antiTriangulationStrict ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-bloodNeon">
                {t.settings.purgeTitle}
              </span>
              <p className="text-[10px] text-neutral-400">
                {t.settings.purgeDesc}
              </p>
            </div>

            {isPurgeConfirmOpen ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPurgeConfirmOpen(false)}
                  className="px-3 py-1.5 min-h-[36px] bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurge}
                  className="px-3 py-1.5 min-h-[36px] bg-bloodNeon hover:bg-bloodNeon/80 text-white text-xs font-bold rounded-xl shadow-blood-glow transition-all cursor-pointer active:scale-95"
                >
                  Sí, Purgar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPurgeConfirmOpen(true)}
                className="px-3.5 py-2 min-h-[38px] bg-bloodNeon/15 hover:bg-bloodNeon/25 border border-bloodNeon/40 text-bloodNeon text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.settings.purgeBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. SESIÓN & CUENTA DE LA APP */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
          <UserCheck className="w-4 h-4 text-electricViolet-glow" />
          <span>{t.settings.sectionSession}</span>
        </div>

        {/* Información del Estado de Cuenta */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                {isAuthenticated ? (authUser?.email || "Cuenta Permanente") : "Cuenta Temporal (Invitado)"}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {isAuthenticated ? `UID: ${currentUserUid}` : "Modo Exploración Anónima"}
              </span>
            </div>

            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isAuthenticated
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-purple-950/40 text-purple-300 border-purple-800/40"
              }`}
            >
              {isAuthenticated ? "VERIFICADA" : "TEMPORAL"}
            </span>
          </div>

          {/* Banner y Botón de Vinculación si no está autenticado */}
          {!isAuthenticated ? (
            <div className="p-3 bg-purple-950/20 border border-electricViolet/30 rounded-2xl space-y-2.5">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t.auth.guestWarning}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openAuthModal("link")}
                  className="py-2.5 px-3 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-extrabold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-violet-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Vincular Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="py-2.5 px-3 min-h-[44px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-all text-center cursor-pointer border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-98"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="text-[10px] text-neutral-400">
                Proveedor: <strong className="text-white uppercase font-mono">{authUser?.providerData[0]?.providerId.split(".")[0] || "Email"}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.settings.logoutConfirmDesc)) {
                    logout();
                    showToast(language === "es" ? "Sesión cerrada de forma segura" : "Logged out securely");
                  }
                }}
                className="px-3.5 py-2 min-h-[40px] bg-bloodNeon/15 hover:bg-bloodNeon text-bloodNeon hover:text-white border border-bloodNeon/40 font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.settings.logoutBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. CONSOLA OPERATIVA & PERSONAL (ADMIN / STAFF) */}
      {(isLocalEnvironment() || (authUser?.email && checkIsAdminAuthorized(authUser.email))) && (
        <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
          <Terminal className="w-4 h-4 text-electricViolet-glow" />
          <span>Acceso Operativo // Staff & Admin</span>
        </div>

        <div className="bg-obsidian-deep/80 rounded-2xl p-4 border border-electricViolet/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <span>VESSEL OPS // COMMAND CENTER</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow font-bold border border-electricViolet/40">
                  STAFF
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Portal de administración con telemetría en vivo, gestión 360° de usuarios, asignación de membresías y resolución de denuncias.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/admin"
              className="flex-1 py-2.5 px-4 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-extrabold text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>CONSOLA ADMIN (/admin)</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsAppModeModalOpen(true);
                audioEngine.playPulse();
              }}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10 font-bold text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-electricViolet-glow" />
              <span>{language === "es" ? "MODO DE ENTORNO (REAL / TEST)" : "ENVIRONMENT (REAL / TEST)"}</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Kernel & Version info */}
      <div className="pt-2 text-center text-[10px] font-mono text-neutral-500">
        <span>{t.settings.systemStatus}</span>
      </div>

      {/* Modal de Selector de Entorno Operativo */}
      <AppModeModal
        isOpen={isAppModeModalOpen}
        onClose={() => setIsAppModeModalOpen(false)}
      />
    </div>
  );
};
