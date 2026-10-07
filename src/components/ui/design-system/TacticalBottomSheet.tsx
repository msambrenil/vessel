"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { VESSEL_TOKENS } from "./tokens";

export interface TacticalBottomSheetProps {
  children: React.ReactNode;
  peekContent?: React.ReactNode;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  title?: string;
  badge?: React.ReactNode;
  className?: string;
  testId?: string;
  fullscreen?: boolean;
  footer?: React.ReactNode;
}

export const TacticalBottomSheet: React.FC<TacticalBottomSheetProps> = ({
  children,
  peekContent,
  isExpanded: controlledExpanded,
  onExpandedChange,
  title = "Filtros & Sintonías",
  badge,
  className = "",
  testId = "tactical-bottom-sheet",
  fullscreen = true,
  footer,
}) => {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const setExpanded = useCallback(
    (nextState: boolean) => {
      audioEngine.playSubBass(nextState ? 65 : 55, 0.1);
      if (onExpandedChange) {
        onExpandedChange(nextState);
      } else {
        setInternalExpanded(nextState);
      }
    },
    [onExpandedChange]
  );

  // Cierre por tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setExpanded(false);
      }
    };
    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, setExpanded]);

  // Touch gesture handler para deslizar hacia arriba o abajo
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;

    // Deslizar arriba (delta negativo significativo)
    if (deltaY < -40 && !isExpanded) {
      setExpanded(true);
    }
    // Deslizar abajo (delta positivo significativo)
    if (deltaY > 50 && isExpanded) {
      setExpanded(false);
    }
  };

  return (
    <>
      {/* Backdrop oscuro translúcido cuando el Sheet está expandido */}
      {isExpanded && (
        <div
          data-testid="bottom-sheet-backdrop"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-45 transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Contenedor Flotante del BottomSheet (Docked con respiro sobre BrutalistNav) */}
      <div
        data-testid={testId}
        role="region"
        aria-label="Panel Táctico de Exploración y Filtros"
        aria-expanded={isExpanded}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`fixed left-0 right-0 max-w-4xl mx-auto transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
          isExpanded
            ? fullscreen
              ? "inset-0 h-[100dvh] max-h-[100dvh] rounded-none sm:rounded-t-3xl sm:top-auto sm:h-auto sm:max-h-[92vh] sm:bottom-0 sm:border-x border-t border-white/15 bg-obsidian-deep/98 backdrop-blur-2xl flex flex-col z-50 shadow-[0_-16px_50px_rgba(0,0,0,0.98)]"
              : "bottom-0 max-h-[85vh] rounded-t-3xl shadow-[0_-16px_40px_rgba(0,0,0,0.95)] border-t border-x border-white/15 bg-obsidian-surface/95 backdrop-blur-xl flex flex-col z-50"
            : "bottom-[calc(76px+env(safe-area-inset-bottom,0px))] sm:bottom-[82px] px-3 sm:px-4 pointer-events-none z-38"
        } ${className}`}
      >
        {/* =========================================================
            MODO PEEKING: BARRA FLOTANTE COMPACTA (100% THUMB ZONE)
           ========================================================= */}
        {!isExpanded && (
          <div
            data-testid="bottom-sheet-peek-bar"
            onClick={() => setExpanded(true)}
            className="pointer-events-auto w-full bg-obsidian-surface/95 hover:bg-obsidian-deep border border-white/20 hover:border-electricViolet/50 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-xl px-3.5 py-2.5 cursor-pointer transition-all duration-200 active:scale-[0.99] select-none group ring-1 ring-white/5"
          >
            {peekContent ? (
              peekContent
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-white tracking-wide truncate">
                    {title}
                  </span>
                  {badge}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 group-hover:text-electricViolet-glow transition-colors flex-shrink-0">
                  <span>Explorar</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            MODO EXPANDIDO: CABECERA TÁCTIL + CONTENIDO COMPLETO
           ========================================================= */}
        <div
          className={
            isExpanded
              ? "flex flex-col flex-1 min-h-0 overflow-hidden"
              : "hidden"
          }
        >
          {/* Manija táctil de arrastre (Handle) + Cabecera */}
          <div
            data-testid="bottom-sheet-drag-handle"
            onClick={() => setExpanded(false)}
            className="pt-2.5 pb-2 px-4 flex flex-col items-center justify-center cursor-pointer select-none border-b border-white/5 active:opacity-75"
          >
            <div className="w-10 h-1.2 rounded-full bg-white/25 hover:bg-white/40 transition-colors mb-2" />
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  {title}
                </span>
                {badge}
              </div>
              <button
                type="button"
                data-testid="bottom-sheet-collapse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                aria-label="Colapsar panel de filtros"
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuerpo desplazable con filtros, sintonías y búsqueda */}
          <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden p-3 sm:p-5 space-y-4 pb-16 no-scrollbar">
            {children}
          </div>

          {/* Footer con acciones primarias fijas si se proporciona */}
          {footer && (
            <div className="sticky bottom-0 bg-obsidian-surface/95 border-t border-white/10 p-3 sm:p-4 backdrop-blur-xl pb-[calc(1rem+env(safe-area-inset-bottom,0px))] z-10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
