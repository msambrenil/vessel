"use client";

import React from "react";

export type TacticalBadgeVariant =
  | "violet"
  | "amber"
  | "blood"
  | "emerald"
  | "purple"
  | "gold"
  | "neutral";

export type TacticalBadgeSize = "sm" | "default" | "lg";

export interface TacticalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TacticalBadgeVariant;
  size?: TacticalBadgeSize;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export const TacticalBadge: React.FC<TacticalBadgeProps> = ({
  variant = "neutral",
  size = "default",
  pulse = false,
  icon,
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center font-mono font-bold uppercase tracking-wider rounded-full border select-none transition-all";

  const variantClasses: Record<TacticalBadgeVariant, string> = {
    violet:
      "bg-purple-950/70 text-electricViolet-glow border-electricViolet/40 shadow-[0_0_10px_rgba(139,92,246,0.25)]",
    amber:
      "bg-amber-950/70 text-champagneGold border-champagneGold/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    gold:
      "bg-amber-950/70 text-champagneGold border-champagneGold/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    blood:
      "bg-red-950/70 text-bloodNeon border-bloodNeon/40 shadow-[0_0_10px_rgba(230,25,55,0.15)]",
    emerald:
      "bg-emerald-950/70 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.15)]",
    purple:
      "bg-purple-950/70 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(192,132,252,0.15)]",
    neutral: "bg-obsidian-surface text-neutral-300 border-white/10",
  };

  const sizeClasses: Record<TacticalBadgeSize, string> = {
    sm: "text-[9px] px-2 py-0.5 gap-1",
    default: "text-[10px] px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-2",
  };

  const pulseColorMap: Record<TacticalBadgeVariant, string> = {
    violet: "bg-electricViolet",
    amber: "bg-champagneGold",
    gold: "bg-champagneGold",
    blood: "bg-bloodNeon",
    emerald: "bg-emerald-400",
    purple: "bg-purple-400",
    neutral: "bg-neutral-400",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColorMap[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColorMap[variant]}`}
          />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
