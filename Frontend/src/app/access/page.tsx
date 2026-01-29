"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";

export default function AccessPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste your link");
      return;
    }
    try {
      const u = new URL(trimmed);
      let path = u.pathname;
      if (path.startsWith("/file-request/")) {
        path = path.replace("/file-request/", "/share/");
      }
      if (path.startsWith("/share/")) {
        router.push(path);
        return;
      }
      setError("Link should be a share URL (e.g. .../share/...)");
    } catch {
      setError("Invalid URL. Paste the full link (e.g. http://localhost:3000/share/...)");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4">
      <h1 className="text-2xl font-semibold text-primary">Access with link</h1>
      <p className="text-secondary text-sm">
        Paste the share link you received to upload files or download collected files.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="url"
          label="Link"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error}
        />
        <Button type="submit" variant="primary" className="w-full min-h-[44px] uppercase transition-opacity duration-200">
          Go
        </Button>
      </form>
    </div>
  );
}
