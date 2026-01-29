"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Button, Input, PasswordInput } from "@/shared/ui";
import { createFileRequest } from "@/helpers/api";

const COPY_FEEDBACK_MS = 2500;

export default function NewSharePage() {
  const [uploadPassword, setUploadPassword] = useState("");
  const [downloadPassword, setDownloadPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    id: string;
    uploadLink: string;
    uploadPassword: string;
    downloadLink: string;
    downloadPassword: string;
  } | null>(null);
  const [showUploadPwd, setShowUploadPwd] = useState(false);
  const [showDownloadPwd, setShowDownloadPwd] = useState(false);
  const [copiedUploadLink, setCopiedUploadLink] = useState(false);
  const [copiedDownloadLink, setCopiedDownloadLink] = useState(false);

  const handleCopyUploadLink = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.uploadLink);
    setCopiedUploadLink(true);
    setTimeout(() => setCopiedUploadLink(false), COPY_FEEDBACK_MS);
  }, [result]);

  const handleCopyDownloadLink = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.downloadLink);
    setCopiedDownloadLink(true);
    setTimeout(() => setCopiedDownloadLink(false), COPY_FEEDBACK_MS);
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await createFileRequest(uploadPassword, downloadPassword, name || undefined);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-8 px-4">
        <h1 className="text-2xl font-semibold text-primary">Share created</h1>
        <p className="text-secondary text-sm">
          Send the <strong>upload</strong> link and its password to contributors. Share the <strong>download</strong> link and its password with anyone who should be able to view and download the collected files.
        </p>

        <div className="space-y-4 rounded-xl border border-secondary/30 bg-white p-4 transition-shadow">
          <h2 className="text-lg font-medium text-primary">Contributor access (upload)</h2>
          <div>
            <label className="text-secondary text-xs uppercase">Upload link</label>
            <p className="mt-1 break-all font-mono text-sm text-primary">{result.uploadLink}</p>
          </div>
          <div>
            <label className="text-secondary text-xs uppercase">Contributor password</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-primary">
                {showUploadPwd ? result.uploadPassword : "••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowUploadPwd((s) => !s)}
                className="min-h-[44px] min-w-[44px] text-sm text-primary underline hover:no-underline"
              >
                {showUploadPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <Button
            variant="primary"
            className={`w-full min-h-[44px] uppercase transition-opacity duration-200 ${copiedUploadLink ? "animate-copied" : ""}`}
            onClick={handleCopyUploadLink}
          >
            {copiedUploadLink ? "Copied!" : "Copy upload link"}
          </Button>
        </div>

        <div className="space-y-4 rounded-xl border border-secondary/30 bg-white p-4 transition-shadow">
          <h2 className="text-lg font-medium text-primary">Viewer access (view and download)</h2>
          <div>
            <label className="text-secondary text-xs uppercase">Download link</label>
            <p className="mt-1 break-all font-mono text-sm text-primary">{result.downloadLink}</p>
          </div>
          <div>
            <label className="text-secondary text-xs uppercase">Download password</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-primary">
                {showDownloadPwd ? result.downloadPassword : "••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowDownloadPwd((s) => !s)}
                className="min-h-[44px] min-w-[44px] text-sm text-primary underline hover:no-underline"
              >
                {showDownloadPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <Button
            variant="default"
            className={`w-full min-h-[44px] uppercase transition-opacity duration-200 ${copiedDownloadLink ? "animate-copied" : ""}`}
            onClick={handleCopyDownloadLink}
          >
            {copiedDownloadLink ? "Copied!" : "Copy download link"}
          </Button>
        </div>

        <Link href="/" className="block text-center text-sm text-primary underline min-h-[44px] flex items-center justify-center">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4">
      <h1 className="text-2xl font-semibold text-primary">Create share</h1>
      <p className="text-secondary text-sm">
        Choose two passwords: one for <strong>contributors</strong> (who will upload files) and one for <strong>viewers</strong> (anyone with the download link and this password can view and download the collected files).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Contributor password"
          value={uploadPassword}
          onChange={(e) => setUploadPassword(e.target.value)}
          placeholder="For people who will upload files (min 8 characters)"
          required
          minLength={8}
        />
        <PasswordInput
          label="Download password"
          value={downloadPassword}
          onChange={(e) => setDownloadPassword(e.target.value)}
          placeholder="For anyone who will view and download files (min 8 characters)"
          required
          minLength={8}
        />
        <Input
          type="text"
          label="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Project files, Q4 reports"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full uppercase"
        >
          {loading ? "Creating…" : "Create"}
        </Button>
      </form>
      <Link href="/" className="block text-center text-sm text-primary underline">
        Back to home
      </Link>
    </div>
  );
}
