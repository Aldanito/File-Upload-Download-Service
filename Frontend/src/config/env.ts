/**
 * Central env config. Use this file for all environment variables.
 * - API_URL: runtime (e.g. Railway); set on server so same build works everywhere.
 * - NEXT_PUBLIC_API_URL: build-time fallback for client.
 */

const DEFAULT_API_URL = "http://localhost:3001";

/**
 * API base URL for server-side use (e.g. layout script injection).
 * Prefer API_URL (runtime) so Railway/deployment env is used without rebuild.
 */
export function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_URL
  );
}

export const env = {
  get apiUrl(): string {
    return getApiBaseUrl();
  },
  defaultApiUrl: DEFAULT_API_URL,
} as const;
