"use client";

import React, { useEffect } from "react";
import { BrutalistButton } from "./BrutalistButton";

export interface BrutalistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
  customHeader?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "standard" | "fullscreen";
  ariaLabel?: string;
  closeButtonAriaLabel?: string;
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
  headerClassName = "",
  contentClassName = "",
  hideCloseButton = false,
  customHeader,
  footer,
  variant = "standard",
  ariaLabel,
  closeButtonAriaLabel = "Cerrar modal",
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const subtitleId = React.useId();

  // Gestión de foco (Focus Trap & Restoration) y atajos de teclado (Escape / Tab)
  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== "undefined") {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus Trap accesible en Tab / Shift+Tab
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Auto-enfoque accesible del contenedor modal o primer interactivo
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 30);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      // Restauración de foco al elemento disparador
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
        previousActiveElement.current.focus();
      }
    };
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

  // Mobile touch gesture handler para drag-to-dismiss desde la manija
  const dragTouchStartYRef = React.useRef<number | null>(null);

  const handleDragTouchStart = (e: React.TouchEvent) => {
    dragTouchStartYRef.current = e.touches[0].clientY;
  };

  const handleDragTouchEnd = (e: React.TouchEvent) => {
    if (dragTouchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - dragTouchStartYRef.current;
    dragTouchStartYRef.current = null;
    if (deltaY > 40) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg md:max-w-xl lg:max-w-2xl",
    xl: "max-w-xl md:max-w-2xl lg:max-w-3xl",
    "2xl": "max-w-2xl lg:max-w-3xl",
    "3xl": "max-w-3xl lg:max-w-4xl xl:max-w-5xl",
    "4xl": "max-w-4xl lg:max-w-5xl xl:max-w-6xl",
    full: "max-w-full m-2 sm:m-4",
  }[maxWidth];

  if (variant === "fullscreen") {
    return (
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        aria-label={!title ? (ariaLabel || "Modal de pantalla completa") : undefined}
        tabIndex={-1}
        className={`fixed inset-0 z-[60] bg-obsidian-deep flex flex-col w-full h-[100dvh] overflow-hidden select-none animate-in fade-in duration-200 outline-none ${className}`}
      >
        {customHeader ? (
          customHeader
        ) : title ? (
          <div className={`p-4 pt-[max(env(safe-area-inset-top,0px),1rem)] border-b border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0 ${headerClassName}`}>
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-lg">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h2 id={titleId} className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p id={subtitleId} className="text-[11px] text-neutral-400 truncate">
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
                aria-label={closeButtonAriaLabel}
                className="text-neutral-400 hover:text-white shrink-0"
              >
                ✕
              </BrutalistButton>
            )}
          </div>
        ) : null}

        <div className={`flex-1 overflow-y-auto overscroll-contain ${contentClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-white/10 bg-obsidian-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={subtitle ? subtitleId : undefined}
      aria-label={!title ? (ariaLabel || "Diálogo táctico") : undefined}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses} bg-obsidian-surface border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88dvh] sm:max-h-[90dvh] overflow-hidden animate-in slide-in-from-bottom duration-200 sm:animate-none outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle with gesture support */}
        <div
          onTouchStart={handleDragTouchStart}
          onTouchEnd={handleDragTouchEnd}
          onClick={onClose}
          className="pt-2.5 pb-1 px-4 flex flex-col items-center justify-center cursor-pointer select-none sm:hidden flex-shrink-0 touch-none active:opacity-75"
          aria-label="Deslizar hacia abajo para cerrar"
        >
          <div className="w-12 h-1.5 bg-neutral-600 hover:bg-neutral-500 rounded-full transition-colors" />
        </div>

        {/* Cabecera Estándar Táctica o Personalizada */}
        {customHeader ? (
          customHeader
        ) : title ? (
          <div className={`p-4 border-b border-white/10 bg-black/40 flex items-center justify-between gap-3 shrink-0 ${headerClassName}`}>
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-lg">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h2 id={titleId} className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p id={subtitleId} className="text-[11px] text-neutral-400 truncate">
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
                aria-label={closeButtonAriaLabel}
                className="text-neutral-400 hover:text-white shrink-0"
              >
                ✕
              </BrutalistButton>
            )}
          </div>
        ) : null}

        {/* Contenido scrolleable con clearance táctico */}
        <div className={`p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 ${contentClassName}`}>
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-white/10 bg-obsidian-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
