"use client";

import React, { useState } from "react";
import { useSettings, useAuth, useLogistics, useRadarMatrix } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { checkIsAdminAuthorized } from "@/lib/admin/adminService";
import { createVipInviteCode } from "@/lib/firebase/inviteService";
import {
  Sparkles,
  Zap,
  Volume2,
  LayoutDashboard,
  Check,
  Copy,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { TacticalBadge, BrutalistButton } from "@/components/ui";

export interface TestEnvironmentMenuSectionProps {
  onCloseMenu?: () => void;
}

export const TestEnvironmentMenuSection: React.FC<TestEnvironmentMenuSectionProps> = ({
  onCloseMenu,
}) => {
  const { appMode, setAppMode, language } = useSettings();
  const { authUser, currentUserUid } = useAuth();
  const {
    isGpsHibernating,
    activeCheckin,
    confirmPartyArrivalLock,
    checkOutOfEvent,
  } = useLogistics();
  const { profiles } = useRadarMatrix();

  const [customVipCode, setCustomVipCode] = useState("VESSEL-VIP-01");
  const [isCreatingVip, setIsCreatingVip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateAndCopyVipLink = async () => {
    setIsCreatingVip(true);
    audioEngine.playPulse();
    try {
      const res = await createVipInviteCode({
        code: customVipCode || "VESSEL-VIP",
        maxUses: 20,
        createdByUid: authUser?.uid || currentUserUid,
      });
      await navigator.clipboard.writeText(res.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast(
        language === "es"
          ? `Link VIP (${res.code}) copiado`
          : `VIP Link (${res.code}) copied`
      );
    } catch {
      showToast(language === "es" ? "Error al copiar link" : "Error copying link");
    } finally {
      setIsCreatingVip(false);
    }
  };

  const handleTestSound = () => {
    audioEngine.playVesselCrescendoAlert();
    showToast(
      language === "es"
        ? "Vibración Crescendo + Sub-Bass emitido"
        : "Crescendo & Sub-Bass emitted"
    );
  };

  const isAdminUser = Boolean(
    isLocalEnvironment() || (authUser?.email && checkIsAdminAuthorized(authUser.email))
  );

  return (
    <div
      data-testid="test-environment-section"
      className="p-2.5 bg-black/60 rounded-xl border border-electricViolet/30 space-y-2 mb-1"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-electricViolet text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded-full shadow-violet-soft animate-in fade-in zoom-in-95 pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Cabecera del Bloque */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200">
          <Terminal className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
          <span>{language === "es" ? "VERSIÓN DE PRUEBA" : "TEST ENVIRONMENT"}</span>
        </div>
        <TacticalBadge
          variant={appMode === "real" ? "emerald" : "violet"}
          size="xs"
          className="!px-1.5 !py-0.2 font-mono font-bold"
        >
          {appMode === "real" ? "MODO REAL" : "SANDBOX"}
        </TacticalBadge>
      </div>

      {/* 1-Tap Switch: Modo Real vs Modo Prueba (Entorno local o sandbox) */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setAppMode("real");
            audioEngine.playPulse();
          }}
          className={`py-1.5 px-2 rounded-lg text-[9.5px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border ${
            appMode === "real"
              ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
              : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${appMode === "real" ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
          <span>{language === "es" ? "Modo Real" : "Real Mode"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAppMode("test");
            audioEngine.playPulse();
          }}
          className={`py-1.5 px-2 rounded-lg text-[9.5px] font-mono font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer border ${
            appMode === "test"
              ? "bg-electricViolet/30 border-electricViolet text-electricViolet-glow shadow-violet-soft"
              : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${appMode === "test" ? "bg-electricViolet animate-pulse" : "bg-neutral-500"}`} />
          <span>{language === "es" ? "Modo Prueba" : "Test Mode"}</span>
        </button>
      </div>

      {/* Control de GPS en Fiesta & Vibración Crescendo */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            if (isGpsHibernating || activeCheckin) {
              checkOutOfEvent();
              showToast(
                language === "es"
                  ? "Saliste del Modo Fiesta · GPS reactivado"
                  : "Party Mode exited · GPS woken"
              );
            } else {
              confirmPartyArrivalLock("CLUB VESSEL");
              showToast(
                language === "es"
                  ? "¡Llegaste a la fiesta! GPS en hibernación"
                  : "Party arrival confirmed! GPS hibernated"
              );
            }
          }}
          className={`min-h-[44px] py-2 px-2.5 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isGpsHibernating || activeCheckin
              ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft"
              : "bg-white/5 border-white/10 text-neutral-300 hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">
            {isGpsHibernating || activeCheckin
              ? language === "es"
                ? "Salir Fiesta"
                : "Leave Party"
              : language === "es"
              ? "Llegué Fiesta"
              : "Arrived"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleTestSound}
          className="min-h-[44px] py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-electricViolet-glow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{language === "es" ? "Crescendo" : "Haptic Test"}</span>
        </button>
      </div>

      {/* Generador de Links VIP para Testers */}
      <div className="pt-2 border-t border-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
          <span>{language === "es" ? "Link VIP Testers (?vip=...):" : "VIP Tester Link (?vip=...):"}</span>
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customVipCode}
            onChange={(e) => setCustomVipCode(e.target.value.toUpperCase())}
            placeholder="VESSEL-VIP-01"
            className="flex-1 min-h-[44px] px-3 rounded-lg bg-black/70 border border-white/15 text-[10px] font-mono uppercase text-white focus:border-electricViolet focus:outline-none"
          />
          <button
            type="button"
            disabled={isCreatingVip}
            onClick={handleCreateAndCopyVipLink}
            className="px-3 min-h-[44px] rounded-lg bg-electricViolet hover:bg-electricViolet-glow text-white text-[10px] font-mono font-bold uppercase transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>{language === "es" ? "Copiado" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Copiar" : "Copy"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Acceso a Consola Admin si corresponde */}
      {isAdminUser && (
        <div className="pt-1 border-t border-white/10">
          <Link
            href="/admin"
            onClick={() => onCloseMenu?.()}
            className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-electricViolet/20 border border-white/10 text-neutral-300 hover:text-white text-[9.5px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            <LayoutDashboard className="w-3 h-3 text-electricViolet-glow" />
            <span>{language === "es" ? "Consola Admin (/admin)" : "Admin Console (/admin)"}</span>
          </Link>
        </div>
      )}
    </div>
  );
};
