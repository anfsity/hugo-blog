import type { BangumiItem } from "./types";

const apiBase = "https://api.bgm.tv/v0";
const pageSize = 50;
const requestTimeoutMs = 12000;

interface CollectionResponse {
  data: BangumiItem[];
  total: number;
}

async function fetchCollectionPage(
  userId: string,
  offset: number,
  signal?: AbortSignal,
): Promise<CollectionResponse> {
  const url = new URL(apiBase + "/users/" + encodeURIComponent(userId) + "/collections");
  url.search = new URLSearchParams({
    subject_type: "2",
    limit: String(pageSize),
    offset: String(offset),
  }).toString();

  const controller = new AbortController();
  const abortRequest = (): void => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener("abort", abortRequest, { once: true });
  }
  const timeoutId = window.setTimeout(abortRequest, requestTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Bangumi API request failed: " + response.status);

    const payload = await response.json() as CollectionResponse;
    if (!Array.isArray(payload.data)) throw new Error("Invalid Bangumi response");
    return payload;
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
}

export async function fetchUserCollections(
  userId: string,
  onProgress?: (items: BangumiItem[]) => void,
  signal?: AbortSignal,
): Promise<BangumiItem[]> {
  const items: BangumiItem[] = [];
  let offset = 0;

  while (true) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const payload = await fetchCollectionPage(userId, offset, signal);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    items.push(...payload.data);
    onProgress?.([...items]);
    if (payload.data.length < pageSize || items.length >= payload.total) return items;
    offset += pageSize;
  }
}
