import type { BangumiItem } from "./types";

interface BangumiCache {
  timestamp: number;
  data: BangumiItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBangumiItem(value: unknown): value is BangumiItem {
  if (!isRecord(value) || !isRecord(value.subject)) return false;
  return typeof value.type === "number" && typeof value.updated_at === "string" &&
    typeof value.subject.id === "number" && typeof value.subject.name === "string";
}

export function readBangumiCache(key: string, maxAgeDays: number): BangumiItem[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.timestamp !== "number" || !Array.isArray(parsed.data)) {
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    if (age < 0 || age >= maxAgeDays * 86400000) return null;

    const items = parsed.data.filter(isBangumiItem);
    return items.length === parsed.data.length ? items : null;
  } catch {
    return null;
  }
}

export function writeBangumiCache(key: string, data: BangumiItem[]): void {
  const cache: BangumiCache = { timestamp: Date.now(), data };
  try {
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // The live collection remains usable when browser storage is unavailable.
  }
}
