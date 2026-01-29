"use client";

import React, { useCallback, useState } from "react";
import type { MockS3PartResponse, MultipartPart } from "@/types/api";
import {
  getUploadUrl,
  putWithProgress,
  createMultipart,
  getPartUrl,
  completeMultipart,
  completeFileRequestUpload,
} from "@/helpers/api";
import { throwIfNotOk, parseJsonResponse } from "@/helpers/api/parseResponse";
import { formatSize } from "@/helpers/formatting";

const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5 MB
const PART_SIZE = 5 * 1024 * 1024; // 5 MB per part

export type UploadProgress = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  percent: number;
  error?: string;
};

type UploadZoneProps = {
  id: string;
  token: string;
  onUploaded?: () => void;
};

export function UploadZone({ id, token, onUploaded }: UploadZoneProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadSingle = useCallback(
    async (
      file: File,
      onProgress?: (percent: number) => void
    ): Promise<void> => {
      const { url, fileId } = await getUploadUrl(id, token, file.name, file.type);
      const res = await putWithProgress(
        url,
        file,
        onProgress,
        { "Content-Type": file.type || "application/octet-stream" }
      );
      await throwIfNotOk(res, "Upload failed");
      await completeFileRequestUpload(id, token, fileId, file.size);
    },
    [id, token]
  );

  const uploadMultipart = useCallback(
    async (
      file: File,
      onPartDone?: (partsDone: number, totalParts: number) => void
    ): Promise<void> => {
      const { uploadId } = await createMultipart(id, token, file.name, file.type);
      const totalParts = Math.ceil(file.size / PART_SIZE);
      const parts: MultipartPart[] = [];

      for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        const start = i * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const chunk = file.slice(start, end);
        const { url } = await getPartUrl(id, token, uploadId, partNumber);
        const res = await fetch(url, {
          method: "PUT",
          body: chunk,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        const data = await parseJsonResponse<MockS3PartResponse>(res);
        parts.push({ partNumber, etag: data.etag ?? `"${partNumber}"` });
        onPartDone?.(parts.length, totalParts);
      }

      await completeMultipart(id, token, uploadId, parts);
    },
    [id, token]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const progressId = `${file.name}-${Date.now()}`;
      setProgress((prev) => [
        ...prev,
        { id: progressId, file, status: "uploading", percent: 0 },
      ]);
      const setStatus = (update: Partial<UploadProgress>) => {
        setProgress((p) =>
          p.map((item) => (item.id === progressId ? { ...item, ...update } : item))
        );
      };
      try {
        if (file.size <= MULTIPART_THRESHOLD) {
          await uploadSingle(file, (percent) => setStatus({ percent }));
        } else {
          await uploadMultipart(file, (done, total) =>
            setStatus({ percent: Math.round((done / total) * 100) })
          );
        }
        setStatus({ status: "done", percent: 100 });
        onUploaded?.();
      } catch (err) {
        setStatus({
          status: "error",
          percent: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    [uploadSingle, uploadMultipart, onUploaded]
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setPendingFiles((prev) => [...prev, ...files]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }, []);

  const removePending = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const startUpload = useCallback(() => {
    const toUpload = [...pendingFiles];
    setPendingFiles([]);
    setUploading(true);
    if (toUpload.length === 0) {
      setUploading(false);
      return;
    }
    const runAll = async () => {
      try {
        await Promise.all(toUpload.map((file) => uploadFile(file)));
      } finally {
        setUploading(false);
      }
    };
    runAll();
  }, [pendingFiles, uploadFile]);

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 sm:p-8 ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-secondary/50 bg-white/30"
        }`}
      >
        <input
          type="file"
          multiple
          onChange={onInputChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-primary hover:underline"
        >
          Drop files here or click to browse
        </label>
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-secondary text-sm font-medium">Pending</h3>
          <ul className="space-y-2">
            {pendingFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-secondary/30 bg-white/50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-primary">{file.name}</span>
                <span className="text-secondary shrink-0 text-xs">
                  {formatSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  className="shrink-0 rounded border border-secondary/50 px-2 py-0.5 text-secondary hover:bg-secondary/20"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={startUpload}
            disabled={uploading}
            className="rounded border border-primary bg-primary px-4 py-2 text-sm text-light transition hover:bg-primary-hover disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      {progress.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-secondary text-sm font-medium">Status</h3>
          <ul className="space-y-2">
            {progress.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-secondary/30 bg-white/50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-primary">{p.file.name}</span>
                <span className="shrink-0 text-secondary">
                  {p.status === "done" && "Done"}
                  {p.status === "uploading" && `${p.percent}%`}
                  {p.status === "error" && (p.error ?? "Error")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
