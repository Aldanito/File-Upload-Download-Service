import type { ApiErrorResponse } from "@/types/api";

/**
 * Parses JSON response; on !res.ok throws with server error message.
 * Use when the success response body is JSON you need.
 */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    throw new Error(data.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

/**
 * Throws with server error message when !res.ok. Use when success body is not needed.
 */
export async function throwIfNotOk(
  res: Response,
  fallbackMessage?: string
): Promise<void> {
  if (res.ok) return;
  const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
  throw new Error(data.error ?? res.statusText ?? fallbackMessage ?? "Request failed");
}
