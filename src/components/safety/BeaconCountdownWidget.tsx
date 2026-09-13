"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";

export const BeaconCountdownWidget: React.FC = () => {
  const { safetyBeacon, openSafetyBeaconModal, extendSafetyBeacon } = useVessel();

  const [timeLeftStr, setTimeLeftStr] = useState<string>("--:--");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
    if (!safetyBeacon.isActive || !safetyBeacon.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(safetyBeacon.expiresAt!).getTime();
      const diffMs = expiry - now;

      if (diffMs <= 0) {
        setTimeLeftStr("00:00");
        setIsUrgent(true);
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setTimeLeftStr(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
      setIsUrgent(mins < 10);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [safetyBeacon.isActive, safetyBeacon.expiresAt]);

  if (!safetyBeacon.isActive) return null;

  return (
    <div
      onClick={openSafetyBeaconModal}
      className={`cursor-pointer inline-flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border shadow-lg transition-all ${
        safetyBeacon.isAlarmTriggered || isUrgent
          ? "bg-red-950/80 border-red-500 text-red-300 animate-pulse shadow-red-500/30"
          : "bg-neutral-900/90 border-amber-500/50 text-amber-400 hover:border-amber-400"
      }`}
      title="Guardián Silencioso Activo. Toca para gestionar o desactivar."
    >
      <span className="text-xs">🛡️</span>
      <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider">{timeLeftStr}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          extendSafetyBeacon(30);
        }}
        className="hidden sm:inline px-1.5 py-0.2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[9px] uppercase transition-colors"
      >
        +30m
      </button>
    </div>
  );
};
