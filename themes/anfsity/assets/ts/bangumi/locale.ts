import type { CollectionStatus, SortField } from "./types";

export type BangumiLanguage = "zh" | "en";

const statusLabels: Record<BangumiLanguage, Record<CollectionStatus, string>> = {
  zh: {
    all: "概览",
    "1": "想看",
    "2": "看过",
    "3": "在看",
    "4": "搁置",
    "5": "抛弃",
  },
  en: {
    all: "Overview",
    "1": "Wish",
    "2": "Collected",
    "3": "Watching",
    "4": "OnHold",
    "5": "Dropped",
  },
};

const sortLabels: Record<BangumiLanguage, Record<SortField, string>> = {
  zh: { rate: "评价", updated_at: "收藏时间", date: "发售日", name: "名称" },
  en: { rate: "Rate", updated_at: "Collection Date", date: "Release Date", name: "Name" },
};

export function getBangumiLanguage(): BangumiLanguage {
  return document.documentElement.lang.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getStatusLabel(status: CollectionStatus, language = getBangumiLanguage()): string {
  return statusLabels[language][status];
}

export function getSortLabel(field: SortField, language = getBangumiLanguage()): string {
  return sortLabels[language][field];
}
