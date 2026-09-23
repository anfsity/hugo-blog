import type { BangumiItem } from "./types";

const apiBase = "https://api.bgm.tv/v0";
const pageSize = 50;

interface CollectionResponse {
  data: BangumiItem[];
  total: number;
}

export async function fetchUserCollections(userId: string): Promise<BangumiItem[]> {
  const items: BangumiItem[] = [];
  let offset = 0;

  while (true) {
    const url = new URL(apiBase + "/users/" + encodeURIComponent(userId) + "/collections");
    url.search = new URLSearchParams({
      subject_type: "2",
      limit: String(pageSize),
      offset: String(offset),
    }).toString();

    const response = await fetch(url);
    if (!response.ok) throw new Error("Bangumi API request failed: " + response.status);

    const payload = await response.json() as CollectionResponse;
    if (!Array.isArray(payload.data)) throw new Error("Invalid Bangumi response");

    items.push(...payload.data);
    if (payload.data.length < pageSize || items.length >= payload.total) return items;
    offset += pageSize;
  }
}
