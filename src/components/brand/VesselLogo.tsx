"use client";

import React from "react";

interface VesselLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  glow?: boolean;
}

export const VesselLogo: React.FC<VesselLogoProps> = ({
  size = 28,
  className = "",
  showWordmark = true,
  glow = true,
}) => {
  if (showWordmark) {
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        style={{ height: `${size}px` }}
      >
        <img
          src="/brand/vessel-logo.png"
          alt="VESSEL"
          style={{ height: `${size}px`, width: "auto" }}
          className={`object-contain transition-all duration-300 ${
            glow
              ? "filter drop-shadow-[0_0_8px_rgba(255,30,56,0.65)] hover:drop-shadow-[0_0_14px_rgba(255,30,56,0.95)]"
              : ""
          }`}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src="/brand/vessel-glyph.png"
        alt="VESSEL Icon"
        style={{ height: `${size}px`, width: "auto" }}
        className={`object-contain transition-all duration-300 ${
          glow ? "filter drop-shadow-[0_0_8px_rgba(255,30,56,0.7)]" : ""
        }`}
        loading="eager"
      />
    </div>
  );
};
