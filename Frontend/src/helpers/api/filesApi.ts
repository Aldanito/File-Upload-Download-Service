import type {
  DeleteFileResponse,
  DownloadUrlResponse,
  ListFilesResponse,
} from "@/types/api";
import { fetchWithAuth } from "./fetchWithAuth";
import { parseJsonResponse } from "./parseResponse";

export async function listFiles(id: string, token: string): Promise<ListFilesResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/files`, {
    method: "GET",
    token,
  });
  return parseJsonResponse<ListFilesResponse>(res);
}

export async function getDownloadUrl(
  id: string,
  token: string,
  fileId: string
): Promise<DownloadUrlResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/download-url/${fileId}`, {
    method: "GET",
    token,
  });
  return parseJsonResponse<DownloadUrlResponse>(res);
}

export async function deleteFileRequestFile(
  id: string,
  token: string,
  fileId: string
): Promise<DeleteFileResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/files/${fileId}`, {
    method: "DELETE",
    token,
  });
  return parseJsonResponse<DeleteFileResponse>(res);
}
