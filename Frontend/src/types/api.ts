/** File-requests API response types (matches backend contract) */

export type CreateFileRequestResponse = {
  id: string;
  uploadLink: string;
  uploadPassword: string;
  downloadLink: string;
  downloadPassword: string;
};

export type AuthResponse = {
  token: string;
};

export type FileItem = {
  id: string;
  originalName: string;
  size: number;
  contentType: string;
  createdAt?: string;
};

export type ListFilesResponse = {
  files: FileItem[];
};

export type UploadUrlResponse = {
  url: string;
  method: string;
  expiresIn: number;
  fileId: string;
  key: string;
};

export type UploadCompleteResponse = {
  fileId: string;
  completed: boolean;
};

export type MultipartInitResponse = {
  uploadId: string;
  fileId: string;
  key: string;
};

export type PartUrlResponse = {
  url: string;
  method: string;
  partNumber: number;
};

export type MultipartCompleteResponse = {
  fileId: string;
  completed: boolean;
};

export type DownloadUrlResponse = {
  url: string;
  method: string;
  expiresIn: number;
  originalName: string;
};

export type DeleteFileResponse = {
  deleted: boolean;
  fileId: string;
};

export type ApiErrorResponse = {
  error?: string;
};

export type MultipartPart = {
  partNumber: number;
  etag: string;
};

/** Mock-s3 part upload response (etag) */
export type MockS3PartResponse = {
  etag?: string;
};
