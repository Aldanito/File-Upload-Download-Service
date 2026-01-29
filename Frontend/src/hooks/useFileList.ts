"use client";

import { useCallback, useState } from "react";
import type { DownloadUrlResponse, FileItem, ListFilesResponse } from "@/types/api";

type ListFilesFn = (id: string, token: string) => Promise<ListFilesResponse>;
type GetDownloadUrlFn = (id: string, token: string, fileId: string) => Promise<DownloadUrlResponse>;
type DeleteFileFn = (id: string, token: string, fileId: string) => Promise<unknown>;

export type FileListApi = {
  listFiles: ListFilesFn;
  getDownloadUrl: GetDownloadUrlFn;
  deleteFile?: DeleteFileFn;
};

export function useFileList(
  id: string,
  token: string | null,
  listFiles: ListFilesFn,
  getDownloadUrl: GetDownloadUrlFn,
  deleteFile?: DeleteFileFn
) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFiles = useCallback(
    async (overrideToken?: string) => {
      const t = overrideToken ?? token;
      if (!t) return;
      const list = await listFiles(id, t);
      setFiles(list.files);
    },
    [id, token, listFiles]
  );

  const handleDownload = useCallback(
    async (fileId: string, originalName: string) => {
      if (!token) return;
      setDownloadingId(fileId);
      try {
        const data = await getDownloadUrl(id, token, fileId);
        const res = await fetch(data.url);
        if (!res.ok) throw new Error("Download failed");
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = data.originalName ?? originalName;
        a.click();
        URL.revokeObjectURL(a.href);
      } finally {
        setDownloadingId(null);
      }
    },
    [id, token, getDownloadUrl]
  );

  const handleDelete = useCallback(
    async (fileId: string) => {
      if (!token || !deleteFile) return;
      setDeletingId(fileId);
      try {
        await deleteFile(id, token, fileId);
        await loadFiles();
      } finally {
        setDeletingId(null);
      }
    },
    [id, token, deleteFile, loadFiles]
  );

  return {
    files,
    loadFiles,
    handleDownload,
    handleDelete: deleteFile ? handleDelete : undefined,
    downloadingId,
    deletingId,
  };
}
