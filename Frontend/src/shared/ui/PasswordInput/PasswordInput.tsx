"use client";

import React, { useState } from "react";
import { Input } from "@/shared/ui/Input";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  /** Optional; defaults to "password" behavior with Show/Hide toggle */
};

export function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={`pr-20 ${className}`.trim()}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        className="absolute right-2 top-[1.75rem] text-sm text-primary underline hover:no-underline"
        tabIndex={-1}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  );
}
