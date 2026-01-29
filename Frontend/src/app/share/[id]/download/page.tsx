"use client";

import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PasswordForm } from "@/widgets/PasswordForm";
import { FileList } from "@/widgets/FileList";
import { useFileList, useShareAuth } from "@/hooks";
import { authFileRequestDownload, listFiles, getDownloadUrl } from "@/helpers/api";

export default function ShareDownloadPage() {
  const params = useParams();
  const id = params.id as string;
  const { token, authLoading, handleAuth: authOnly } = useShareAuth(id, authFileRequestDownload);
  const { files, loadFiles, handleDownload, downloadingId } = useFileList(
    id,
    token,
    listFiles,
    getDownloadUrl
  );

  const handleAuth = useCallback(
    async (password: string) => {
      const newToken = await authOnly(password);
      if (newToken) await loadFiles(newToken);
    },
    [authOnly, loadFiles]
  );

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4">
        <h1 className="text-2xl font-semibold text-primary">Download share</h1>
        <p className="text-secondary text-sm">
          Enter the download password to view and download the files collected in this share.
        </p>
        <PasswordForm onSubmit={handleAuth} label="Download password" loading={authLoading} />
        <Link href="/" className="block text-center text-sm text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-primary">Download files</h1>
        <button
          type="button"
          onClick={() => loadFiles()}
          className="min-h-[44px] rounded border border-primary px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-light"
        >
          Refresh
        </button>
      </div>
      <FileList
        files={files}
        onDownload={handleDownload}
        downloadingId={downloadingId}
      />
      <Link href="/" className="block text-center text-sm text-primary underline">
        Back to home
      </Link>
    </div>
  );
}
