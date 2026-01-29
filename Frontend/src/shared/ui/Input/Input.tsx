"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={twMerge(
          "w-full rounded-lg border border-secondary bg-white px-3 py-2 text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
