"use client";

import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PasswordForm } from "@/widgets/PasswordForm";
import { UploadZone } from "@/widgets/UploadZone";
import { FileList } from "@/widgets/FileList";
import { useFileList, useShareAuth } from "@/hooks";
import { authFileRequest, listFiles, getDownloadUrl, deleteFileRequestFile } from "@/helpers/api";

export default function ShareUploadPage() {
  const params = useParams();
  const id = params.id as string;
  const { token, authLoading, handleAuth: authOnly } = useShareAuth(id, authFileRequest);
  const {
    files,
    loadFiles,
    handleDownload,
    handleDelete,
    downloadingId,
    deletingId,
  } = useFileList(id, token, listFiles, getDownloadUrl, deleteFileRequestFile);

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
        <h1 className="text-2xl font-semibold text-primary">Upload to share</h1>
        <p className="text-secondary text-sm">
          Enter the contributor password to upload files to this share.
        </p>
        <PasswordForm onSubmit={handleAuth} label="Contributor password" loading={authLoading} />
        <Link href="/" className="block text-center text-sm text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4">
      <h1 className="text-2xl font-semibold text-primary">Upload files</h1>
      <UploadZone id={id} token={token} onUploaded={loadFiles} />
      <div>
        <h2 className="mb-3 text-lg font-medium text-primary">Files</h2>
        <FileList
          files={files}
          onDownload={handleDownload}
          onDelete={handleDelete}
          downloadingId={downloadingId}
          deletingId={deletingId}
        />
      </div>
      <Link href="/" className="block text-center text-sm text-primary underline">
        Back to home
      </Link>
    </div>
  );
}
