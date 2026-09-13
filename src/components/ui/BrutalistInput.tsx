"use client";

import React from "react";

export interface BrutalistInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const BrutalistInput = React.forwardRef<
  HTMLInputElement,
  BrutalistInputProps
>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = "",
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-neutral-400 pointer-events-none text-sm">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full min-h-[44px] bg-obsidian-card text-neutral-100 placeholder:text-neutral-500 font-mono text-xs
              border rounded-xl transition-all duration-150
              ${leftIcon ? "pl-10" : "pl-3.5"}
              ${rightIcon ? "pr-10" : "pr-3.5"}
              py-2.5
              ${
                error
                  ? "border-bloodNeon focus-visible:ring-2 focus-visible:ring-bloodNeon"
                  : "border-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:border-electricViolet"
              }
              focus-visible:outline-none
              disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-neutral-400 text-sm">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[10px] font-mono text-bloodNeon">{error}</p>
        ) : hint ? (
          <p className="text-[10px] text-neutral-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

BrutalistInput.displayName = "BrutalistInput";
