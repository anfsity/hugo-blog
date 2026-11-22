import { getBangumiLanguage, getSortLabel, getStatusLabel, type BangumiLanguage } from "./locale";
import { getDisplayScore, getDisplayTitle, paginateItems, selectBangumiItems, itemsPerPage } from "./model";
import type { BangumiElements, BangumiItem, BangumiState, CollectionStatus, SortField } from "./types";

const statusKeys: CollectionStatus[] = ["all", "3", "2", "1", "4", "5"];
const sortFields: SortField[] = ["updated_at", "rate", "date", "name"];

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
  element.textContent = language === "zh"
    ? `动画 · ${count}`
    : `${count} Anime`;
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
    const active = state.activeStatus === status;
    button.type = "button";
    button.role = "tab";
    button.className = "bangumi-tab-btn" + (active ? " active" : "");
    button.setAttribute("aria-selected", String(active));

    const label = document.createElement("span");
    label.textContent = getStatusLabel(status, language);

    const countEl = document.createElement("span");
    countEl.className = "bangumi-tab-count";
    countEl.textContent = String(counts[status]);

    button.append(label, countEl);
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

  sortFields.forEach((field) => {
    const button = document.createElement("button");
    const active = state.sortBy === field;
    button.type = "button";
    button.className = "bangumi-sort-btn" + (active ? " active" : "");
    button.setAttribute("aria-pressed", String(active));

    const label = document.createElement("span");
    label.textContent = getSortLabel(field, language);
    button.appendChild(label);

    if (active) {
      const dir = document.createElement("span");
      dir.className = "bangumi-sort-dir" + (state.sortOrder === "asc" ? " is-asc" : "");
      dir.setAttribute("aria-hidden", "true");
      dir.innerHTML =
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 5v14" />' +
        '<path d="M16 15l-4 4" />' +
        '<path d="M8 15l4 4" />' +
        "</svg>";
      button.appendChild(dir);
    }

    button.addEventListener("click", () => onChange(field));
    element.appendChild(button);
  });
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

  const cover = document.createElement("div");
  cover.className = "bangumi-card-cover";

  const imageUrl = safeImageUrl(item.subject.images?.common) ??
    safeImageUrl(item.subject.images?.medium) ??
    safeImageUrl(item.subject.images?.small) ??
    safeImageUrl(item.subject.images?.large);
  if (imageUrl) {
    const image = document.createElement("img");
    image.className = "bangumi-card-cover-image";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.setAttribute("fetchpriority", "low");
    image.src = imageUrl;
    cover.appendChild(image);
  }

  const badges = document.createElement("div");
  badges.className = "bangumi-card-badges";

  const status = String(item.type);
  const statusLabel = ["1", "2", "3", "4", "5"].includes(status)
    ? getStatusLabel(status as CollectionStatus, language)
    : language === "zh" ? "未知" : "Unknown";
  const statusElement = document.createElement("span");
  statusElement.className = "bangumi-card-status status-" + status;

  const statusDot = document.createElement("span");
  statusDot.className = "bangumi-status-dot";
  statusDot.setAttribute("aria-hidden", "true");
  statusElement.append(statusDot, document.createTextNode(statusLabel));
  badges.appendChild(statusElement);

  const score = getDisplayScore(item);
  if (score !== null) {
    const scoreElement = document.createElement("span");
    scoreElement.className = "bangumi-card-score";
    const star = document.createElement("span");
    star.className = "bangumi-score-star";
    star.setAttribute("aria-hidden", "true");
    star.textContent = "★";
    scoreElement.append(star, document.createTextNode(String(score)));
    badges.appendChild(scoreElement);
  }

  cover.appendChild(badges);
  card.appendChild(cover);

  const body = document.createElement("div");
  body.className = "bangumi-card-body";

  const title = document.createElement("div");
  title.className = "bangumi-card-title";
  title.textContent = getDisplayTitle(item, language);
  body.appendChild(title);

  const metaRow = document.createElement("div");
  metaRow.className = "bangumi-card-meta-row";

  const year = document.createElement("span");
  year.className = "bangumi-card-year";
  year.textContent = item.subject.date ? item.subject.date.slice(0, 4) : "—";
  metaRow.appendChild(year);

  const tags = item.subject.tags ?? [];
  if (tags.length > 0) {
    const tagContainer = document.createElement("div");
    tagContainer.className = "bangumi-card-tags";
    tags.slice(0, 2).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "bangumi-card-tag";
      tagElement.textContent = tag.name;
      tagContainer.appendChild(tagElement);
    });
    metaRow.appendChild(tagContainer);
  }

  body.appendChild(metaRow);
  card.appendChild(body);

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
  const sorted = selectBangumiItems(items, state, language);
  const pageItems = paginateItems(sorted, state.currentPage);

  if (pageItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "bangumi-empty";
    empty.textContent = language === "zh" ? "暂无条目" : "No entries";
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

  const addButton = (page: number, content: string | HTMLElement, ariaLabel?: string): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bangumi-page-btn" + (state.currentPage === page ? " active" : "");
    if (typeof content === "string") button.textContent = content;
    else button.appendChild(content);
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);

    if (state.currentPage === page) {
      button.setAttribute("aria-current", "page");
    } else {
      button.addEventListener("click", () => onPageChange(page));
    }
    element.appendChild(button);
  };

  const addEllipsis = (): void => {
    const span = document.createElement("span");
    span.className = "bangumi-page-ellipsis";
    span.setAttribute("aria-hidden", "true");
    span.textContent = "…";
    element.appendChild(span);
  };

  const makeChevron = (direction: "prev" | "next"): HTMLElement => {
    const wrap = document.createElement("span");
    wrap.style.display = "inline-flex";
    wrap.innerHTML = direction === "prev"
      ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6l6 6" /></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6l-6 6" /></svg>';
    return wrap;
  };

  if (state.currentPage > 1) {
    addButton(
      state.currentPage - 1,
      makeChevron("prev"),
      language === "zh" ? "上一页" : "Previous page",
    );
  }

  const start = Math.max(1, state.currentPage - 2);
  const end = Math.min(totalPages, state.currentPage + 2);
  if (start > 1) addButton(1, "1");
  if (start > 2) addEllipsis();
  for (let page = start; page <= end; page += 1) addButton(page, String(page));
  if (end < totalPages - 1) addEllipsis();
  if (end < totalPages) addButton(totalPages, String(totalPages));

  if (state.currentPage < totalPages) {
    addButton(
      state.currentPage + 1,
      makeChevron("next"),
      language === "zh" ? "下一页" : "Next page",
    );
  }
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
