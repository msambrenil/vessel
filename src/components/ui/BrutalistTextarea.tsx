"use client";

import React from "react";

export interface BrutalistTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const BrutalistTextarea = React.forwardRef<
  HTMLTextAreaElement,
  BrutalistTextareaProps
>(
  (
    {
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      className = "",
      disabled = false,
      id,
      value,
      defaultValue,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const reactId = React.useId();
    const textareaId = id || reactId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={textareaId}
              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300"
            >
              {label}
            </label>
            {showCount && maxLength && (
              <span className="text-[10px] font-mono text-neutral-500">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`
              w-full bg-obsidian-card text-neutral-100 placeholder:text-neutral-500 font-sans text-base sm:text-xs
              border rounded-xl transition-all duration-150 p-3 leading-relaxed resize-none
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
        </div>

        <div className="flex items-center justify-between gap-2 min-h-[16px]">
          {error ? (
            <p id={errorId} role="alert" className="text-[10px] font-mono text-bloodNeon">{error}</p>
          ) : hint ? (
            <p id={hintId} className="text-[10px] text-neutral-400">{hint}</p>
          ) : (
            <span />
          )}

          {!label && showCount && maxLength && (
            <span className="text-[10px] font-mono text-neutral-500 ml-auto">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

BrutalistTextarea.displayName = "BrutalistTextarea";
