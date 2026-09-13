"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldAlert, Eye, Lock, RefreshCw } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface DrmBlackoutProtectorProps {
  isActive: boolean;
  children: React.ReactNode;
  requireHoldToReveal?: boolean;
  onSecurityAlert?: (reason: string) => void;
  className?: string;
}

export const DrmBlackoutProtector: React.FC<DrmBlackoutProtectorProps> = ({
  isActive,
  children,
  requireHoldToReveal = true,
  onSecurityAlert,
  className = "",
}) => {
  const [isDrmTriggered, setIsDrmTriggered] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [alertReason, setAlertReason] = useState<string>("Atajo de captura interceptado");

  const triggerBlackout = useCallback(
    (reason: string) => {
      setIsDrmTriggered(true);
      setIsHolding(false);
      setAlertReason(reason);
      audioEngine.playPulse();
      if (onSecurityAlert) onSecurityAlert(reason);
    },
    [onSecurityAlert]
  );

  // Escudo Multi-Capa Anti-Captura (macOS, Windows, Linux, iOS, Android)
  useEffect(() => {
    if (!isActive) return;

    // 1. Interceptación Pre-Emptiva de Teclas Modificadoras
    // En macOS, Cmd+Shift+4 requiere presionar Command y Shift antes del 4.
    // Al interceptar Meta y Shift en keydown, el blackout ocurre ANTES de que el OS procese el disparo.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detección de teclas de captura
      if (
        e.key === "Meta" ||
        e.key === "Shift" ||
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "PrintScreen" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout("Tecla modificadora o atajo de captura detectado (Cmd/Shift/PrtScn)");
      }
    };

    // 2. Pérdida de foco de ventana (Snipping Tool, Lightshot, CleanShot, cambio de app)
    const handleBlur = () => {
      triggerBlackout("Pérdida de foco de pantalla o selector de área externo");
    };

    // 3. Cambio de visibilidad (Minimizar, conmutador de tareas, nueva pestaña)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerBlackout("Cambio de pestaña o captura de miniatura del SO");
      }
    };

    // 4. Cursor fuera de la ventana (movimiento hacia barra de menú para capturar)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        triggerBlackout("Puntero fuera del área de visualización");
      }
    };

    // 5. Intento de Impresión / Guardar como PDF (Cmd+P)
    const handleBeforePrint = () => {
      triggerBlackout("Intento de impresión de pantalla bloqueado");
    };

    // 6. Intento de Copiar al portapapeles
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerBlackout("Intento de copiado al portapapeles bloqueado");
    };

    // 7. Click derecho (Menú contextual)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerBlackout("Menú contextual bloqueado");
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, triggerBlackout]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Si ya hay DRM activo o se presionan teclas, no permitir
    if (isDrmTriggered || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      triggerBlackout("Intento de captura simultánea");
      return;
    }
    setIsHolding(true);
    audioEngine.playStateSwitch("occupied");
  };

  const handlePointerUp = () => {
    setIsHolding(false);
  };

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
        triggerBlackout("Menú contextual bloqueado");
      }}
    >
      {/* 1. CORTINA NEGRA DRM BLACKOUT (DISPARADA POR ATRIBUTO O SEGURIDAD) */}
      {isDrmTriggered ? (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-bloodNeon/20 border-2 border-bloodNeon flex items-center justify-center mb-3.5 animate-pulse shadow-[0_0_20px_rgba(230,25,55,0.4)]">
            <ShieldAlert className="w-7 h-7 text-bloodNeon" />
          </div>

          <h4 className="font-mono font-black text-bloodNeon text-xs sm:text-sm uppercase tracking-widest leading-tight">
            ⚠️ CAPTURA RECHAZADA // PROTOCOLO DRM VESSEL
          </h4>

          <p className="text-[11px] text-neutral-400 mt-2.5 font-mono max-w-sm leading-relaxed">
            Por seguridad estricta y protección anti-extorsión, el sistema oscurece la pantalla inmediatamente ante cualquier combinación de teclas o herramienta de captura.
          </p>

          <span className="mt-2 text-[9px] font-mono text-neutral-500 bg-neutral-900/80 px-2 py-1 rounded border border-white/10">
            Motivo: {alertReason}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsDrmTriggered(false);
              setIsHolding(false);
              audioEngine.playPulse();
            }}
            className="mt-5 px-5 py-2.5 bg-neutral-900 border border-bloodNeon/50 hover:bg-neutral-800 text-neutral-200 font-mono text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reanudar Visualización Protegida</span>
          </button>
        </div>
      ) : requireHoldToReveal && !isHolding ? (
        /* 2. CORTINA 'HOLD TO REVEAL' (MANTENER PRESIONADO PARA VER) */
        <div
          onPointerDown={handlePointerDown}
          className="absolute inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all active:scale-[0.99] border-2 border-dashed border-white/20 hover:border-bloodNeon/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-bloodNeon/15 border border-bloodNeon/40 text-bloodNeon flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h4 className="font-mono font-black text-white text-xs uppercase tracking-wider">
            CONTENIDO PROTEGIDO // MODO TÁCTIL
          </h4>

          <p className="text-[10px] text-neutral-400 font-mono mt-1.5 max-w-xs leading-relaxed">
            Mantén presionado con el dedo o ratón para ver. Al soltar o presionar cualquier atajo, la imagen se ocultará.
          </p>

          <div className="mt-4 px-4 py-2 rounded-xl bg-bloodNeon text-white font-mono font-extrabold text-xs tracking-wider uppercase shadow-blood-glow flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>MANTENER PRESIONADO PARA REVELAR</span>
          </div>
        </div>
      ) : null}

      {/* 3. CONTENIDO REAL (IMAGEN O VIDEO) */}
      <div
        className={`w-full h-full transition-all duration-150 ${
          requireHoldToReveal && !isHolding ? "filter blur-2xl opacity-0 pointer-events-none" : "filter-none opacity-100"
        }`}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </div>
    </div>
  );
};
