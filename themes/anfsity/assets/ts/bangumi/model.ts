import type { BangumiLanguage } from "./locale";
import type { BangumiItem, BangumiState } from "./types";

export const itemsPerPage = 30;

export function getDisplayScore(item: BangumiItem): number | null {
  if (typeof item.rate === "number" && item.rate > 0) return item.rate;
  if (typeof item.subject.score === "number" && item.subject.score > 0) return item.subject.score;
  return null;
}

export function getDisplayTitle(item: BangumiItem, language: BangumiLanguage): string {
  return language === "zh"
    ? item.subject.name_cn || item.subject.name
    : item.subject.name;
}

function dateValue(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function sortValue(
  item: BangumiItem,
  field: BangumiState["sortBy"],
  language: BangumiLanguage,
): number | string | null {
  switch (field) {
    case "rate":
      return getDisplayScore(item);
    case "name":
      return getDisplayTitle(item, language);
    case "updated_at":
      return dateValue(item.updated_at);
    case "date":
      return dateValue(item.subject.date);
  }
}

export function selectBangumiItems(
  data: BangumiItem[],
  state: BangumiState,
  language: BangumiLanguage,
): BangumiItem[] {
  const filtered = data.filter((item) => {
    return state.activeStatus === "all" || String(item.type) === state.activeStatus;
  });

  return filtered.sort((left, right) => {
    const a = sortValue(left, state.sortBy, language);
    const b = sortValue(right, state.sortBy, language);

    // Always place items without a valid value (e.g. unrated/unscored or undated) at the end.
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;

    const comparison = typeof a === "string" && typeof b === "string"
      ? a.localeCompare(b, language === "zh" ? "zh-CN" : "en")
      : Number(a) - Number(b);

    if (comparison !== 0) {
      return state.sortOrder === "desc" ? -comparison : comparison;
    }

    const leftUpdated = dateValue(left.updated_at) ?? 0;
    const rightUpdated = dateValue(right.updated_at) ?? 0;
    return rightUpdated - leftUpdated;
  });
}

export function paginateItems(items: BangumiItem[], page: number): BangumiItem[] {
  const start = (page - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}
