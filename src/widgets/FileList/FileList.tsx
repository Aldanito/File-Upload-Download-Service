"use client";

import React from "react";
import type { FileItem } from "@/types/api";
import { formatSize } from "@/helpers/formatting";

export type { FileItem } from "@/types/api";

type FileListProps = {
  files: FileItem[];
  onDownload?: (fileId: string, originalName: string) => void;
  onDelete?: (fileId: string) => void;
  downloadingId?: string | null;
  deletingId?: string | null;
};

export function FileList({
  files,
  onDownload,
  onDelete,
  downloadingId = null,
  deletingId = null,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-secondary text-sm">No files yet.</p>
    );
  }
  return (
    <ul className="divide-y divide-secondary/30 rounded-lg border border-secondary/30 bg-white/50">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <span className="min-w-0 truncate text-primary" title={f.originalName}>
            {f.originalName}
          </span>
          <span className="text-secondary shrink-0 text-sm">
            {formatSize(f.size)}
          </span>
          <div className="flex shrink-0 gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(f.id, f.originalName)}
                disabled={downloadingId === f.id}
                className="rounded border border-primary px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-light disabled:opacity-50"
              >
                {downloadingId === f.id ? "Downloading…" : "Download"}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(f.id)}
                disabled={deletingId === f.id}
                className="rounded border border-red-600 px-3 py-1 text-sm text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
              >
                {deletingId === f.id ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
