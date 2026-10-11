"use client";

import React, { useState } from "react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export type TacticalAvatarSize = "xs" | "sm" | "default" | "lg" | "xl";
export type TacticalAvatarBorder = "violet" | "emerald" | "amber" | "neutral" | "blood";
export type TacticalAvatarPing = "blood" | "violet" | "emerald";

export interface TacticalAvatarProps {
  src?: string | null;
  alt: string;
  codename?: string;
  size?: TacticalAvatarSize;
  borderVariant?: TacticalAvatarBorder;
  isFogMode?: boolean;
  hasUnreadPing?: boolean;
  pingVariant?: TacticalAvatarPing;
  bodyState?: "open" | "occupied" | "dormant" | null;
  statusBadge?: React.ReactNode;
  onClick?: () => void;
  soundEffect?: "pulse" | "subbass" | "none";
  ariaLabel?: string;
  className?: string;
  testId?: string;
}

export const TacticalAvatar: React.FC<TacticalAvatarProps> = ({
  src,
  alt,
  codename,
  size = "default",
  borderVariant = "violet",
  isFogMode = false,
  hasUnreadPing = false,
  pingVariant = "blood",
  bodyState,
  statusBadge,
  onClick,
  soundEffect = "pulse",
  ariaLabel,
  className = "",
  testId = "tactical-avatar",
}) => {
  const [imgError, setImgError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    if (soundEffect === "pulse") {
      audioEngine.playPulse();
    } else if (soundEffect === "subbass") {
      audioEngine.playSubBass(60);
    }
    onClick();
  };

  const sizeClasses: Record<TacticalAvatarSize, string> = {
    xs: "w-8 h-8 rounded-xl text-xs",
    sm: "w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-xs",
    default: "w-14 h-14 min-w-[48px] min-h-[48px] rounded-2xl text-sm",
    lg: "w-16 h-16 min-w-[56px] min-h-[56px] rounded-2xl text-base",
    xl: "w-20 h-20 min-w-[64px] min-h-[64px] rounded-3xl text-lg",
  };

  const borderClasses: Record<TacticalAvatarBorder, string> = {
    violet: "border-2 border-electricViolet/50 hover:border-electricViolet focus-visible:ring-electricViolet",
    emerald: "border-2 border-emerald-500/50 hover:border-emerald-400 focus-visible:ring-emerald-400",
    amber: "border-2 border-amber-500/50 hover:border-amber-400 focus-visible:ring-amber-400",
    blood: "border-2 border-bloodNeon/50 hover:border-bloodNeon focus-visible:ring-bloodNeon",
    neutral: "border-2 border-white/20 hover:border-white/40 focus-visible:ring-white/50",
  };

  const pingColorClasses: Record<TacticalAvatarPing, string> = {
    blood: "bg-bloodNeon",
    violet: "bg-electricViolet",
    emerald: "bg-emerald-400",
  };

  const initials = (codename || alt || "??").slice(0, 2).toUpperCase();

  const baseContainerClasses = `relative shrink-0 select-none transition-all duration-200 ${sizeClasses[size]} ${className}`;

  const renderContent = () => (
    <>
      <div className={`w-full h-full overflow-hidden bg-neutral-900 ${sizeClasses[size].split(" ").filter(c => c.startsWith("rounded-")).join(" ")} ${borderClasses[borderVariant]}`}>
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isFogMode ? "filter blur-[3px]" : ""
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono font-black bg-purple-950/80 text-electricViolet-glow">
            {initials}
          </div>
        )}
      </div>

      {hasUnreadPing && (
        <span
          data-testid="tactical-avatar-ping"
          className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full animate-ping border border-black pointer-events-none z-10 ${pingColorClasses[pingVariant]}`}
        />
      )}

      {bodyState === "open" && (
        <span
          data-testid="tactical-avatar-bodystate-open"
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mintNeon rounded-full border-2 border-black z-10 pointer-events-none"
        />
      )}

      {bodyState === "occupied" && (
        <span
          data-testid="tactical-avatar-bodystate-occupied"
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-bloodNeon rounded-full border-2 border-black z-10 pointer-events-none"
        />
      )}

      {statusBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 z-10 pointer-events-none">
          {statusBadge}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        data-testid={testId}
        onClick={handleClick}
        aria-label={ariaLabel || alt}
        title={ariaLabel || alt}
        className={`${baseContainerClasses} cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <div
      data-testid={testId}
      className={baseContainerClasses}
      {...(!src || imgError ? { role: "img", "aria-label": ariaLabel || alt } : {})}
    >
      {renderContent()}
    </div>
  );
};
