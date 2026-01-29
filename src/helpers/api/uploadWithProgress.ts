/**
 * PUT request with upload progress via XMLHttpRequest (fetch does not expose upload progress).
 * Returns a Response-like object so throwIfNotOk / parseJsonResponse work as with fetch.
 */
export function putWithProgress(
  url: string,
  body: Blob | ArrayBuffer,
  onProgress?: (percent: number) => void,
  headers?: Record<string, string>
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0 && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(
            xhr
              .getAllResponseHeaders()
              .split("\r\n")
              .filter(Boolean)
              .map((line) => {
                const [name, ...parts] = line.split(": ");
                return [name ?? "", parts.join(": ")];
              }) as [string, string][]
          ),
        })
      );
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Request timeout"));
    xhr.send(body);
  });
}
