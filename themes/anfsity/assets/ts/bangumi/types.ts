export type CollectionStatus = "all" | "1" | "2" | "3" | "4" | "5";
export type SortField = "rate" | "updated_at" | "date" | "name";
export type SortOrder = "asc" | "desc";

export interface BangumiImageSet {
  large?: string;
  common?: string;
  medium?: string;
  small?: string;
  grid?: string;
}

export interface BangumiSubject {
  id: number;
  name: string;
  name_cn?: string;
  images?: BangumiImageSet | null;
  score?: number;
  tags?: Array<{ name: string; count?: number }>;
  date?: string | null;
}

export interface BangumiItem {
  type: number;
  updated_at: string;
  subject: BangumiSubject;
  rate?: number;
}

export interface BangumiState {
  activeStatus: CollectionStatus;
  sortBy: SortField;
  sortOrder: SortOrder;
  currentPage: number;
}

export interface BangumiElements {
  container: HTMLElement;
  loading: HTMLElement;
  error: HTMLElement;
  retry: HTMLElement;
  content: HTMLElement;
  heading: HTMLElement;
  tabs: HTMLElement;
  toolbar: HTMLElement;
  grid: HTMLElement;
  pagination: HTMLElement;
}
