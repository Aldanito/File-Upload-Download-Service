"use client";

import React, { useState } from "react";
import { Button, PasswordInput } from "@/shared/ui";

type PasswordFormProps = {
  onSubmit: (password: string) => void | Promise<void>;
  loading?: boolean;
  label?: string;
};

export function PasswordForm({
  onSubmit,
  loading = false,
  label = "Password",
}: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid password");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <PasswordInput
        label={label}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
        placeholder="Enter password"
        autoComplete="current-password"
        disabled={loading}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full uppercase"
      >
        {loading ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
