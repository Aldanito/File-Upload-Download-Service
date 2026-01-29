import type {
  MultipartCompleteResponse,
  MultipartInitResponse,
  MultipartPart,
  PartUrlResponse,
  UploadCompleteResponse,
  UploadUrlResponse,
} from "@/types/api";
import { fetchWithAuth } from "./fetchWithAuth";
import { parseJsonResponse } from "./parseResponse";

export async function getUploadUrl(
  id: string,
  token: string,
  fileName: string,
  contentType: string
): Promise<UploadUrlResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/upload-url`, {
    method: "POST",
    token,
    body: JSON.stringify({ fileName, contentType }),
  });
  return parseJsonResponse<UploadUrlResponse>(res);
}

export async function completeFileRequestUpload(
  id: string,
  token: string,
  fileId: string,
  size: number
): Promise<UploadCompleteResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/upload-complete`, {
    method: "POST",
    token,
    body: JSON.stringify({ fileId, size }),
  });
  return parseJsonResponse<UploadCompleteResponse>(res);
}

export async function createMultipart(
  id: string,
  token: string,
  fileName: string,
  contentType: string
): Promise<MultipartInitResponse> {
  const res = await fetchWithAuth(`/file-requests/${id}/multipart/init`, {
    method: "POST",
    token,
    body: JSON.stringify({ fileName, contentType }),
  });
  return parseJsonResponse<MultipartInitResponse>(res);
}

export async function getPartUrl(
  id: string,
  token: string,
  uploadId: string,
  partNumber: number
): Promise<PartUrlResponse> {
  const res = await fetchWithAuth(
    `/file-requests/${id}/multipart/${uploadId}/part-url`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ partNumber }),
    }
  );
  return parseJsonResponse<PartUrlResponse>(res);
}

export async function completeMultipart(
  id: string,
  token: string,
  uploadId: string,
  parts: MultipartPart[]
): Promise<MultipartCompleteResponse> {
  const res = await fetchWithAuth(
    `/file-requests/${id}/multipart/${uploadId}/complete`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ parts }),
    }
  );
  return parseJsonResponse<MultipartCompleteResponse>(res);
}
