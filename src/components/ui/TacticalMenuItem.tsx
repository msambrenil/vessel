"use client";

import React from "react";
import { TacticalBadge, TacticalBadgeVariant } from "./TacticalBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface TacticalMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  iconBgClass?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  badgeVariant?: TacticalBadgeVariant;
  badgeClassName?: string;
  soundEffect?: "pulse" | "subbass" | "none";
}

/**
 * TacticalMenuItem — Standard brutalist menu item for dropdown menus and action sheets.
 * Guarantees a minimum touch target of 44px, semantic role="menuitem", accessible keyboard states,
 * and optional integrated sub-bass / haptic audio feedback.
 */
export const TacticalMenuItem = React.forwardRef<
  HTMLButtonElement,
  TacticalMenuItemProps
>(
  (
    {
      icon,
      iconBgClass = "bg-white/5 border-white/10 text-neutral-400",
      title,
      subtitle,
      badge,
      badgeVariant,
      badgeClassName = "",
      soundEffect = "pulse",
      onClick,
      disabled = false,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (soundEffect === "pulse") {
        audioEngine.playPulse();
      } else if (soundEffect === "subbass") {
        audioEngine.playSubBass(60);
      }

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        role="menuitem"
        disabled={disabled}
        onClick={handleClick}
        className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          {icon && (
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 transition-transform group-active:scale-95 ${iconBgClass}`}
            >
              {icon}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-neutral-200 group-hover:text-white truncate">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-neutral-400 truncate leading-tight">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {badge && (
          typeof badge === "string" && badgeVariant ? (
            <TacticalBadge
              variant={badgeVariant}
              size="xs"
              className={`flex-shrink-0 font-mono ${badgeClassName}`}
            >
              <span>{badge}</span>
            </TacticalBadge>
          ) : (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${badgeClassName}`}
            >
              {badge}
            </span>
          )
        )}
      </button>
    );
  }
);

TacticalMenuItem.displayName = "TacticalMenuItem";
