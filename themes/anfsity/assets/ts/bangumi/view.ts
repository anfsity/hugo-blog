import { getBangumiLanguage, getSortLabel, getStatusLabel, type BangumiLanguage } from "./locale";
import { paginateItems, selectBangumiItems, itemsPerPage } from "./model";
import type { BangumiElements, BangumiItem, BangumiState, CollectionStatus, SortField } from "./types";

const statusKeys: CollectionStatus[] = ["all", "1", "2", "3", "4", "5"];
const sortFields: SortField[] = ["rate", "updated_at", "date", "name"];

function countStatuses(items: BangumiItem[]): Record<CollectionStatus, number> {
  const counts: Record<CollectionStatus, number> = {
    all: items.length,
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  items.forEach((item) => {
    const status = String(item.type) as CollectionStatus;
    if (status in counts && status !== "all") counts[status] += 1;
  });
  return counts;
}

function renderHeading(element: HTMLElement, count: number, language: BangumiLanguage): void {
  element.replaceChildren(document.createTextNode(language === "zh" ? "动画 " : "Anime "));
  const countElement = document.createElement("span");
  countElement.textContent = String(count);
  element.appendChild(countElement);
}

function renderTabs(
  element: HTMLElement,
  items: BangumiItem[],
  state: BangumiState,
  language: BangumiLanguage,
  onChange: (status: CollectionStatus) => void,
): void {
  element.replaceChildren();
  const counts = countStatuses(items);

  statusKeys.forEach((status) => {
    if (status !== "all" && counts[status] === 0) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "bangumi-tab-btn" + (state.activeStatus === status ? " active" : "");
    button.textContent = getStatusLabel(status, language) + " (" + counts[status] + ")";
    button.setAttribute("aria-pressed", String(state.activeStatus === status));
    button.addEventListener("click", () => onChange(status));
    element.appendChild(button);
  });
}

function renderToolbar(
  element: HTMLElement,
  state: BangumiState,
  language: BangumiLanguage,
  onChange: (field: SortField) => void,
): void {
  element.replaceChildren();

  const label = document.createElement("span");
  label.textContent = language === "zh" ? "按 " : "By ";
  element.appendChild(label);

  sortFields.forEach((field) => {
    const button = document.createElement("button");
    const active = state.sortBy === field;
    button.type = "button";
    button.className = "bangumi-sort-btn" + (active ? " active" : "");
    button.textContent = getSortLabel(field, language);
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", () => onChange(field));
    element.appendChild(button);
  });

  const direction = document.createElement("span");
  direction.textContent = language === "zh" ? " 排序" : " Sort";
  element.appendChild(direction);
}

function safeImageUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, document.baseURI);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function createBangumiCard(item: BangumiItem, language: BangumiLanguage): HTMLAnchorElement {
  const card = document.createElement("a");
  card.className = "bangumi-card";
  card.href = "https://bgm.tv/subject/" + encodeURIComponent(String(item.subject.id));
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const coverContainer = document.createElement("div");
  coverContainer.className = "bangumi-card-cover-container";
  const cover = document.createElement("div");
  cover.className = "bangumi-card-cover";
  const imageUrl = safeImageUrl(item.subject.images?.large);
  if (imageUrl) cover.style.backgroundImage = "url(" + JSON.stringify(imageUrl) + ")";

  const overlay = document.createElement("div");
  overlay.className = "bangumi-card-overlay";

  const status = String(item.type);
  const statusLabel = ["1", "2", "3", "4", "5"].includes(status)
    ? getStatusLabel(status as CollectionStatus, language)
    : language === "zh" ? "未知" : "Unknown";
  const statusElement = document.createElement("div");
  statusElement.className = "bangumi-card-status status-" + status;
  statusElement.textContent = statusLabel;
  overlay.appendChild(statusElement);

  const score = item.rate || item.subject.score;
  if (score) {
    const scoreElement = document.createElement("div");
    scoreElement.className = "bangumi-card-score";
    scoreElement.textContent = "★ " + score;
    overlay.appendChild(scoreElement);
  }

  const bottomInfo = document.createElement("div");
  bottomInfo.className = "bangumi-card-bottom-info";
  const title = document.createElement("div");
  title.className = "bangumi-card-title";
  title.textContent = language === "zh"
    ? item.subject.name_cn || item.subject.name
    : item.subject.name;
  const year = document.createElement("div");
  year.className = "bangumi-card-year";
  year.textContent = item.subject.date ? item.subject.date.slice(0, 4) : "-";
  bottomInfo.append(title, year);
  overlay.appendChild(bottomInfo);

  cover.appendChild(overlay);
  coverContainer.appendChild(cover);
  card.appendChild(coverContainer);

  const tags = item.subject.tags ?? [];
  if (tags.length > 0) {
    const tagContainer = document.createElement("div");
    tagContainer.className = "bangumi-card-tags";
    tags.slice(0, 3).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "bangumi-card-tag";
      tagElement.textContent = tag.name;
      tagContainer.appendChild(tagElement);
    });
    if (tags.length > 3) {
      const more = document.createElement("span");
      more.className = "bangumi-card-tag";
      more.textContent = "+ " + (tags.length - 3);
      tagContainer.appendChild(more);
    }
    card.appendChild(tagContainer);
  }

  return card;
}

function renderGrid(
  element: HTMLElement,
  pagination: HTMLElement,
  items: BangumiItem[],
  state: BangumiState,
  language: BangumiLanguage,
  onPageChange: (page: number) => void,
): void {
  element.replaceChildren();
  const sorted = selectBangumiItems(items, state);
  const pageItems = paginateItems(sorted, state.currentPage);

  if (pageItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "bangumi-empty";
    empty.textContent = language === "zh" ? "没有数据" : "No data";
    element.appendChild(empty);
  } else {
    pageItems.forEach((item) => element.appendChild(createBangumiCard(item, language)));
  }

  renderPagination(pagination, sorted.length, state, language, onPageChange);
}

function renderPagination(
  element: HTMLElement,
  totalItems: number,
  state: BangumiState,
  language: BangumiLanguage,
  onPageChange: (page: number) => void,
): void {
  element.replaceChildren();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return;

  const addButton = (page: number, label: string): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bangumi-page-btn" + (state.currentPage === page ? " active" : "");
    button.textContent = label;
    if (state.currentPage === page) {
      button.setAttribute("aria-current", "page");
    } else {
      button.addEventListener("click", () => onPageChange(page));
    }
    element.appendChild(button);
  };

  if (state.currentPage > 1) addButton(state.currentPage - 1, language === "zh" ? "上一页" : "Prev");

  const start = Math.max(1, state.currentPage - 2);
  const end = Math.min(totalPages, state.currentPage + 2);
  if (start > 1) addButton(1, "1");
  if (start > 2) element.appendChild(document.createTextNode("..."));
  for (let page = start; page <= end; page += 1) addButton(page, String(page));
  if (end < totalPages - 1) element.appendChild(document.createTextNode("..."));
  if (end < totalPages) addButton(totalPages, String(totalPages));

  if (state.currentPage < totalPages) addButton(state.currentPage + 1, language === "zh" ? "下一页" : "Next");
}

export function renderBangumiView(
  elements: BangumiElements,
  items: BangumiItem[],
  state: BangumiState,
  onStatusChange: (status: CollectionStatus) => void,
  onSortChange: (field: SortField) => void,
  onPageChange: (page: number) => void,
): void {
  const language = getBangumiLanguage();
  renderHeading(elements.heading, items.length, language);
  renderTabs(elements.tabs, items, state, language, onStatusChange);
  renderToolbar(elements.toolbar, state, language, onSortChange);
  renderGrid(elements.grid, elements.pagination, items, state, language, onPageChange);
}
