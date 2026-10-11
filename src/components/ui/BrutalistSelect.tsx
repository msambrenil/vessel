"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export interface BrutalistSelectOption {
  value: string;
  label: string;
}

export interface BrutalistSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: BrutalistSelectOption[];
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const BrutalistSelect: React.FC<BrutalistSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  icon,
  className = "",
  containerClassName = "",
  disabled = false,
  id,
  ...rest
}) => {
  const reactId = React.useId();
  const generatedId = id || reactId;
  const errorId = `${generatedId}-error`;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={generatedId}
          className="text-xs font-mono font-bold text-white flex items-center gap-1.5"
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{label}</span>
        </label>
      )}

      <div className="relative">
        <select
          id={generatedId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full min-h-[44px] bg-black/60 border rounded-xl text-white text-base sm:text-xs font-mono p-3 pr-9 appearance-none transition-colors cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
            error
              ? "border-bloodNeon text-bloodNeon focus:border-bloodNeon"
              : "border-white/15 hover:border-white/30 focus:border-electricViolet focus:ring-1 focus:ring-electricViolet"
          } ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" className="bg-obsidian-deep text-neutral-500 font-mono">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-obsidian-deep text-white font-mono py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform"
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-[10px] text-bloodNeon font-mono font-bold animate-fade-in">
          ✕ {error}
        </p>
      )}
    </div>
  );
};
