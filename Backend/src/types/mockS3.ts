/** JWT payloads for mock-s3 signed URLs */

export type UploadTokenPayload = {
  key: string;
  action: "upload";
};

export type UploadPartTokenPayload = {
  key: string;
  uploadId: string;
  partNumber: number;
  action: "uploadPart";
};

export type DownloadTokenPayload = {
  key: string;
  action: "download";
};

export type UploadTokenDecoded = { key: string };
export type UploadPartTokenDecoded = { key: string; uploadId: string; partNumber: number };
export type DownloadTokenDecoded = { key: string };
