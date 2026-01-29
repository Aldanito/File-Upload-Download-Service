import { env } from "@/config";

/**
 * Returns the backend API base URL. Prefers runtime-injected value (window.__API_URL__)
 * so the same build works in any environment. Falls back to config (env) then default.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const injected = (window as { __API_URL__?: string }).__API_URL__;
    if (typeof injected === "string" && injected) return injected;
  }
  return env.apiUrl;
}
