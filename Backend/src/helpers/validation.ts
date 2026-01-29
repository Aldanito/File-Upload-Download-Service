const MAX_NAME_LENGTH = 255;

export function sanitizeFileName(fileName: string): string {
  const base = fileName.replace(/\.\./g, "").replace(/[/\\]/g, "");
  const trimmed = base.slice(0, MAX_NAME_LENGTH);
  return trimmed || "file";
}

export function isValidContentType(contentType: string): boolean {
  if (!contentType || typeof contentType !== "string") return false;
  if (contentType.length > 100) return false;
  return true;
}
