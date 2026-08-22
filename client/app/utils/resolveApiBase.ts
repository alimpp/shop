const DEFAULT_API_BASE = "http://localhost:4000/";

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

export function resolveApiBase(fallback?: string): string {
  const configured = fallback?.trim().replace(/^['"]|['"]$/g, "");

  if (import.meta.client) {
    const { hostname, protocol } = window.location;

    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return normalizeBaseUrl(`${protocol}//${hostname}:4000`);
    }
  }

  return normalizeBaseUrl(configured || DEFAULT_API_BASE);
}

export function resolveAssetUrl(url?: string | null): string {
  if (!url) {
    return "";
  }

  if (!import.meta.client) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const isLocalHost =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    if (isLocalHost) {
      parsed.hostname = window.location.hostname;
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}
