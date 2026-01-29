import type { AuthResponse, CreateFileRequestResponse } from "@/types/api";
import { fetchWithAuth } from "./fetchWithAuth";
import { parseJsonResponse } from "./parseResponse";

export async function createFileRequest(
  uploadPassword: string,
  downloadPassword: string,
  name?: string
): Promise<CreateFileRequestResponse> {
  const res = await fetchWithAuth("/file-requests", {
    method: "POST",
    body: JSON.stringify({ uploadPassword, downloadPassword, name }),
  });
  return parseJsonResponse<CreateFileRequestResponse>(res);
}

export async function authFileRequest(id: string, password: string): Promise<AuthResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/auth`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return parseJsonResponse<AuthResponse>(res);
}

export async function authFileRequestDownload(id: string, password: string): Promise<AuthResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/auth-download`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return parseJsonResponse<AuthResponse>(res);
}
