export class BackendUnavailableError extends Error {
  constructor() {
    super("This service is not connected yet. Nothing has been saved or sent.");
    this.name = "BackendUnavailableError";
  }
}
// Proposed endpoints are documented in docs/backend-integration.md.
// No simulated responses or browser record persistence.
export function createApi(baseUrl = "") {
  const base = baseUrl.replace(/\/$/, "");
  return {
    configured: Boolean(base),
    async request(path, { method = "GET", body, signal, binary = false } = {}) {
      if (!base) throw new BackendUnavailableError();
      const multipart =
        typeof FormData !== "undefined" && body instanceof FormData;
      const response = await fetch(`${base}${path}`, {
        method,
        signal,
        credentials: "include",
        headers:
          body && !multipart
            ? { "Content-Type": "application/json" }
            : undefined,
        body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.message ||
            `Request failed (${response.status}). Please try again.`,
        );
      }
      if (binary) return response.blob();
      if (response.status === 204) return null;
      return response.json();
    },
  };
}
export const api = createApi(import.meta.env?.VITE_API_BASE_URL || "");
