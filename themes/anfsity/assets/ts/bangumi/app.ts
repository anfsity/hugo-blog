import { fetchUserCollections } from "./api";
import { readBangumiCache, writeBangumiCache } from "./cache";
import { renderBangumiView } from "./view";
import type { BangumiElements, BangumiItem, BangumiState, CollectionStatus, SortField } from "./types";

function findElements(): BangumiElements | null {
  const container = document.querySelector<HTMLElement>(".bangumi-container");
  const loading = document.getElementById("bangumi-loading");
  const error = document.getElementById("bangumi-error");
  const retry = document.getElementById("bangumi-retry");
  const content = document.getElementById("bangumi-content");
  const heading = document.getElementById("bangumi-head-anime");
  const tabs = document.getElementById("bangumi-tabs");
  const toolbar = document.getElementById("bangumi-toolbar");
  const grid = document.getElementById("bangumi-grid");
  const pagination = document.getElementById("bangumi-pagination");

  if (!container || !loading || !error || !retry || !content || !heading ||
      !tabs || !toolbar || !grid || !pagination) return null;

  return { container, loading, error, retry, content, heading, tabs, toolbar, grid, pagination };
}

class BangumiApp {
  private readonly cacheKey: string;
  private readonly cacheDays: number;
  private readonly userId: string;
  private readonly state: BangumiState = {
    activeStatus: "all",
    sortBy: "updated_at",
    sortOrder: "desc",
    currentPage: 1,
  };
  private data: BangumiItem[] = [];
  private requestVersion = 0;

  constructor(private readonly elements: BangumiElements) {
    this.userId = elements.container.dataset.userid ?? "";
    this.cacheKey = "bangumi_data_anime_" + this.userId;
    const configuredDays = Number.parseInt(elements.container.dataset.cachedays ?? "1", 10);
    this.cacheDays = Number.isFinite(configuredDays) ? Math.max(0, configuredDays) : 1;
    elements.retry.addEventListener("click", () => void this.loadData(true));
    void this.loadData();
  }

  private showLoading(): void {
    this.elements.loading.hidden = false;
    this.elements.loading.classList.toggle("is-refreshing", this.data.length > 0);
    this.elements.error.hidden = true;
    this.elements.content.hidden = this.data.length === 0;
  }

  private showError(keepContent = false): void {
    this.elements.loading.hidden = true;
    this.elements.error.hidden = false;
    this.elements.content.hidden = !keepContent;
  }

  private render(): void {
    this.elements.loading.hidden = true;
    this.elements.loading.classList.remove("is-refreshing");
    this.elements.error.hidden = true;
    this.elements.content.hidden = false;

    renderBangumiView(
      this.elements,
      this.data,
      this.state,
      (status: CollectionStatus) => {
        this.state.activeStatus = status;
        this.state.currentPage = 1;
        this.render();
      },
      (field: SortField) => {
        if (this.state.sortBy === field) {
          this.state.sortOrder = this.state.sortOrder === "desc" ? "asc" : "desc";
        } else {
          this.state.sortBy = field;
          this.state.sortOrder = "desc";
        }
        this.state.currentPage = 1;
        this.render();
      },
      (page: number) => {
        this.state.currentPage = page;
        this.render();
        this.elements.container.scrollIntoView({ behavior: "smooth" });
      },
    );
  }

  private async loadData(force = false): Promise<void> {
    if (!this.userId) {
      this.showError();
      return;
    }

    const requestVersion = ++this.requestVersion;

    if (!force) {
      const cached = readBangumiCache(this.cacheKey, this.cacheDays);
      if (cached) {
        this.data = cached.data;
        this.render();
        if (cached.fresh) return;
      }
    }

    this.showLoading();

    try {
      const data = await fetchUserCollections(this.userId, (partialData) => {
        if (requestVersion !== this.requestVersion) return;
        this.data = partialData;
        this.render();
      });
      if (requestVersion !== this.requestVersion) return;
      this.data = data;
      writeBangumiCache(this.cacheKey, data);
      this.render();
    } catch {
      if (requestVersion !== this.requestVersion) return;
      if (this.data.length > 0) {
        this.render();
        this.showError(true);
      }
      else this.showError();
    }
  }
}

export function initBangumi(): void {
  const elements = findElements();
  if (!elements || elements.container.dataset.initialized === "true") return;

  elements.container.dataset.initialized = "true";
  new BangumiApp(elements);
}
