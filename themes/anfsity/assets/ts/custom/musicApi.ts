export interface ParsedMusicUrl {
  server: "netease" | "tencent";
  type: "song" | "album" | "playlist";
  id: string;
}

export interface MetingTrack {
  url: string;
  title: string;
  artist: string;
  cover?: string;
}

const REQUEST_TIMEOUT_MS = 8000;

const urlRules: Array<[RegExp, ParsedMusicUrl["server"], ParsedMusicUrl["type"]]> = [
  [/music\.163\.com.*song.*id=(\d+)/, "netease", "song"],
  [/music\.163\.com.*album.*id=(\d+)/, "netease", "album"],
  [/music\.163\.com.*playlist.*id=(\d+)/, "netease", "playlist"],
  [/music\.163\.com.*discover\/toplist.*id=(\d+)/, "netease", "playlist"],
  [/y\.qq\.com.*song\/(\w+)/, "tencent", "song"],
  [/y\.qq\.com.*album\/(\w+)/, "tencent", "album"],
  [/y\.qq\.com.*playsquare\/(\w+)/, "tencent", "playlist"],
  [/y\.qq\.com.*playlist\/(\w+)/, "tencent", "playlist"],
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeTrackUrl(value: unknown): string | undefined {
  const raw = asNonEmptyString(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw.startsWith("//") ? "https:" + raw : raw, document.baseURI);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function parseMusicUrl(url: string): ParsedMusicUrl | null {
  for (const [pattern, server, type] of urlRules) {
    const match = url.match(pattern);
    if (match?.[1]) return { server, type, id: match[1] };
  }
  return null;
}

export async function fetchMetingTracks(
  request: ParsedMusicUrl,
  apiUrl: string,
): Promise<MetingTrack[]> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = new URL(apiUrl, document.baseURI);
    url.search = new URLSearchParams({
      server: request.server,
      type: request.type,
      id: request.id,
    }).toString();

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return [];

    const tracks: MetingTrack[] = [];
    for (const entry of payload) {
      if (typeof entry !== "object" || entry === null) continue;
      const record = entry as Record<string, unknown>;
      const trackUrl = normalizeTrackUrl(record.url);
      if (!trackUrl) continue;

      tracks.push({
        url: trackUrl,
        title: asNonEmptyString(record.title) ?? asNonEmptyString(record.name) ?? "Untitled",
        artist: asNonEmptyString(record.author) ?? asNonEmptyString(record.artist) ?? "Unknown",
        cover: normalizeTrackUrl(record.pic) ?? normalizeTrackUrl(record.cover),
      });
    }
    return tracks;
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeoutId);
  }
}
