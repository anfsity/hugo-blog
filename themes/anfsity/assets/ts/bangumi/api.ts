import type { BangumiItem } from "./types";

const apiBase = "https://api.bgm.tv/v0";
const pageSize = 50;
const requestTimeoutMs = 12000;

interface CollectionResponse {
  data: BangumiItem[];
  total: number;
}

async function fetchCollectionPage(userId: string, offset: number): Promise<CollectionResponse> {
  const url = new URL(apiBase + "/users/" + encodeURIComponent(userId) + "/collections");
  url.search = new URLSearchParams({
    subject_type: "2",
    limit: String(pageSize),
    offset: String(offset),
  }).toString();

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Bangumi API request failed: " + response.status);

    const payload = await response.json() as CollectionResponse;
    if (!Array.isArray(payload.data)) throw new Error("Invalid Bangumi response");
    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchUserCollections(
  userId: string,
  onProgress?: (items: BangumiItem[]) => void,
): Promise<BangumiItem[]> {
  const items: BangumiItem[] = [];
  let offset = 0;

  while (true) {
    const payload = await fetchCollectionPage(userId, offset);
    items.push(...payload.data);
    onProgress?.([...items]);
    if (payload.data.length < pageSize || items.length >= payload.total) return items;
    offset += pageSize;
  }
}
