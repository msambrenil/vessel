"use client";

import React, { useEffect } from "react";
import { BrutalistButton } from "./BrutalistButton";

export interface BrutalistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  hideCloseButton?: boolean;
}

export const BrutalistModal: React.FC<BrutalistModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "md",
  className = "",
  hideCloseButton = false,
}) => {
  // Manejo de tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueo de scroll en body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-2 sm:m-4",
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClasses} bg-obsidian-surface border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Estándar Táctica */}
        <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-lg">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100 truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] text-neutral-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {!hideCloseButton && (
            <BrutalistButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-neutral-400 hover:text-white shrink-0"
            >
              ✕
            </BrutalistButton>
          )}
        </div>

        {/* Contenido scrolleable con clearance táctico */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
