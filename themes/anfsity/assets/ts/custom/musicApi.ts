export interface ParsedMusicUrl {
  server: "netease" | "tencent";
  type: "song" | "album" | "playlist";
  id: string;
}

export interface MetingTrack {
  url: string;
  [key: string]: unknown;
}

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
  try {
    const url = new URL(apiUrl, document.baseURI);
    url.search = new URLSearchParams({
      server: request.server,
      type: request.type,
      id: request.id,
    }).toString();

    const response = await fetch(url);
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return [];

    return payload.filter((track): track is MetingTrack => {
      return typeof track === "object" && track !== null &&
        "url" in track && typeof track.url === "string" && track.url.length > 0;
    });
  } catch {
    return [];
  }
}
