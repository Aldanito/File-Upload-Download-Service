import { getApiUrl } from "./getApiUrl";

export async function fetchWithAuth(
  path: string,
  options: RequestInit & { token?: string | null }
): Promise<Response> {
  const { token, ...rest } = options;
  const url = `${getApiUrl()}${path}`;
  const headers = new Headers(rest.headers as HeadersInit);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (rest.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  return fetch(url, { ...rest, headers });
}
