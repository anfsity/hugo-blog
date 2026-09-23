import type { BangumiItem, BangumiState } from "./types";

export const itemsPerPage = 30;

function dateValue(value: string | null | undefined): number {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function sortValue(item: BangumiItem, field: BangumiState["sortBy"]): number | string {
  switch (field) {
    case "rate":
      return item.rate ?? 0;
    case "name":
      return item.subject.name_cn || item.subject.name;
    case "updated_at":
      return dateValue(item.updated_at);
    case "date":
      return dateValue(item.subject.date);
  }
}

export function selectBangumiItems(data: BangumiItem[], state: BangumiState): BangumiItem[] {
  const filtered = data.filter((item) => {
    return state.activeStatus === "all" || String(item.type) === state.activeStatus;
  });

  return filtered.sort((left, right) => {
    const a = sortValue(left, state.sortBy);
    const b = sortValue(right, state.sortBy);
    const comparison = typeof a === "string" && typeof b === "string"
      ? a.localeCompare(b)
      : Number(a) - Number(b);
    return state.sortOrder === "desc" ? -comparison : comparison;
  });
}

export function paginateItems(items: BangumiItem[], page: number): BangumiItem[] {
  const start = (page - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}
