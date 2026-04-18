const BANGUMI_API_BASE = "https://api.bgm.tv/v0";
const ITEMS_PER_PAGE = 30;

const getLanguage = (): "zh" | "en" => {
  const lang = document.documentElement.lang;
  return lang && (lang === "zh-cn" || lang.includes("zh")) ? "zh" : "en";
};

const COLLECTION_STATUS_MAP: Record<string, string> =
  getLanguage() === "zh"
    ? {
        all: "概览",
        "1": "想看",
        "2": "看过",
        "3": "在看",
        "4": "搁置",
        "5": "抛弃",
      }
    : {
        all: "Overview",
        "1": "Wish",
        "2": "Collected",
        "3": "Watching",
        "4": "OnHold",
        "5": "Dropped",
      };

const TAB_KEYS = ["all", "1", "2", "3", "4", "5"];

interface BangumiItem {
  type: number;
  updated_at: string;
  subject: {
    id: number;
    name: string;
    name_cn: string;
    images: {
      large: string;
      common: string;
      medium: string;
      small: string;
      grid: string;
    } | null;
    score: number;
    tags: { name: string; count: number }[];
    date: string;
  };
  rate: number;
}

class BangumiApp {
  private userId!: string;
  private cacheDays!: number;
  private cacheKey!: string;
  private data: BangumiItem[] = [];
  private activeTab: string = "all";
  private activeTag: string | null = null;
  private sortBy: "rate" | "updated_at" | "date" | "name" = "updated_at";
  private sortOrder: "asc" | "desc" = "desc";
  private currentPage: number = 1;
  private els: Record<string, HTMLElement | null> = {};

  constructor() {
    const ids = [
      "container",
      "loading",
      "error",
      "retry",
      "content",
      "tabs",
      "toolbar",
      "grid",
      "sidebar",
      "pagination",
    ];
    ids.forEach(
      (id) =>
        (this.els[id] =
          id === "container"
            ? document.querySelector(".bangumi-container")
            : document.getElementById(`bangumi-${id}`)),
    );
    if (!this.els.container) return;

    this.userId = this.els.container.dataset.userid || "";
    this.cacheDays = parseInt(this.els.container.dataset.cachedays || "1");
    this.cacheKey = `bangumi_data_anime_${this.userId}`;

    if (this.els.retry)
      this.els.retry.addEventListener("click", () => this.loadData(true));
    this.init();
  }

  private async init() {
    if (!this.userId) {
      this.showError();
      return;
    }
    await this.loadData();
  }

  private async loadData(force: boolean = false) {
    this.showLoading();
    if (!force) {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (
            new Date().getTime() - parsed.timestamp <
            this.cacheDays * 86400000
          ) {
            this.data = parsed.data;
            this.render();
            return;
          }
        } catch (e) {}
      }
    }
    try {
      let items: BangumiItem[] = [];
      let offset = 0;
      while (true) {
        const res = await fetch(
          `${BANGUMI_API_BASE}/users/${encodeURIComponent(this.userId)}/collections?subject_type=2&limit=50&offset=${offset}`,
        );
        if (!res.ok) throw new Error("API limit or error");
        const json = await res.json();
        items = items.concat(json.data);
        if (json.data.length < 50 || items.length >= json.total) break;
        offset += 50;
      }
      this.data = items;
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({ timestamp: new Date().getTime(), data: this.data }),
      );
      this.render();
    } catch (e) {
      if (this.data.length > 0) this.render();
      else this.showError();
    }
  }

  private render() {
    this.hideLoading();
    if (this.els.content) this.els.content.style.display = "flex";
    this.renderTabs();
    this.renderToolbar();
    this.renderSidebar();
    this.renderGrid();
  }

  private renderTabs() {
    if (!this.els.tabs) return;
    this.els.tabs.innerHTML = "";

    const counts: Record<string, number> = { all: this.data.length };
    this.data.forEach(
      (item) =>
        (counts[String(item.type)] = (counts[String(item.type)] || 0) + 1),
    );

    TAB_KEYS.forEach((key) => {
      const count = counts[key] || 0;
      if (key !== "all" && count === 0) return;
      const btn = document.createElement("button");
      btn.className = `bangumi-tab-btn ${this.activeTab === key ? "active" : ""}`;
      btn.innerText = `${COLLECTION_STATUS_MAP[key]} ${key !== "all" ? `(${count})` : ""}`;
      btn.addEventListener("click", () => {
        this.activeTab = key;
        this.activeTag = null;
        this.currentPage = 1;
        this.renderTabs();
        this.renderSidebar();
        this.renderGrid();
      });
      this.els.tabs!.appendChild(btn);
    });
  }

  private renderToolbar() {
    if (!this.els.toolbar) return;
    this.els.toolbar.innerHTML = "";

    const isZh = getLanguage() === "zh";
    const label = document.createElement("span");
    label.innerText = isZh ? "按 " : "By ";
    this.els.toolbar.appendChild(label);

    const sorts = [
      { key: "rate", label: isZh ? "评价" : "Rate" },
      { key: "updated_at", label: isZh ? "收藏时间" : "Collection Date" },
      { key: "date", label: isZh ? "发售日" : "Release Date" },
      { key: "name", label: isZh ? "名称" : "Name" },
    ];

    sorts.forEach((s) => {
      const btn = document.createElement("button");
      const isActive = this.sortBy === s.key;
      btn.className = `bangumi-sort-btn ${isActive ? "active" : ""}`;
      btn.innerText = s.label;
      btn.addEventListener("click", () => {
        if (this.sortBy === s.key) {
          this.sortOrder = this.sortOrder === "desc" ? "asc" : "desc";
        } else {
          this.sortBy = s.key as any;
          this.sortOrder = "desc";
        }
        this.currentPage = 1;
        this.renderToolbar();
        this.renderGrid();
      });
      this.els.toolbar!.appendChild(btn);
    });

    const sortDirLabel = document.createElement("span");
    sortDirLabel.innerText = isZh ? " 排序" : " Sort";
    this.els.toolbar.appendChild(sortDirLabel);
  }

  private renderSidebar() {
    if (!this.els.sidebar) return;
    this.els.sidebar.innerHTML = "";

    const isZh = getLanguage() === "zh";
    const title = document.createElement("h3");
    title.innerText = isZh ? "追番" : "Watching";
    this.els.sidebar.appendChild(title);

    const filtered =
      this.activeTab === "all"
        ? this.data
        : this.data.filter((i) => String(i.type) === this.activeTab);
    const tagCounts: Record<string, number> = {};

    filtered.forEach((item) => {
      if (item.subject.tags) {
        item.subject.tags.forEach((t) => {
          tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    if (sortedTags.length === 0) {
      this.els.sidebar.style.display = "none";
      return;
    }
    this.els.sidebar.style.display = "block";

    const tagList = document.createElement("div");
    tagList.className = "bangumi-tag-list";
    sortedTags.forEach(([name, count]) => {
      const tagBtn = document.createElement("button");
      tagBtn.className = `bangumi-tag-btn ${this.activeTag === name ? "active" : ""}`;
      tagBtn.innerHTML = `<span>${name}</span><span class="count">${count}</span>`;
      tagBtn.addEventListener("click", () => {
        this.activeTag = this.activeTag === name ? null : name;
        this.currentPage = 1;
        this.renderSidebar();
        this.renderGrid();
      });
      tagList.appendChild(tagBtn);
    });
    this.els.sidebar.appendChild(tagList);
  }

  private renderGrid() {
    if (!this.els.grid) return;
    this.els.grid.innerHTML = "";

    let filtered =
      this.activeTab === "all"
        ? this.data
        : this.data.filter((i) => String(i.type) === this.activeTab);

    if (this.activeTag) {
      filtered = filtered.filter(
        (i) =>
          i.subject.tags &&
          i.subject.tags.some((t) => t.name === this.activeTag),
      );
    }

    filtered = filtered.sort((a, b) => {
      let valA: any, valB: any;
      if (this.sortBy === "rate") {
        valA = a.rate || 0;
        valB = b.rate || 0;
      } else if (this.sortBy === "name") {
        valA = a.subject.name_cn || a.subject.name;
        valB = b.subject.name_cn || b.subject.name;
      } else if (this.sortBy === "updated_at") {
        valA = new Date(a.updated_at).getTime() || 0;
        valB = new Date(b.updated_at).getTime() || 0;
      } else {
        valA = new Date(a.subject.date).getTime() || 0;
        valB = new Date(b.subject.date).getTime() || 0;
      }

      if (valA < valB) return this.sortOrder === "desc" ? 1 : -1;
      if (valA > valB) return this.sortOrder === "desc" ? -1 : 1;
      return 0;
    });

    const pageItems = filtered.slice(
      (this.currentPage - 1) * ITEMS_PER_PAGE,
      this.currentPage * ITEMS_PER_PAGE,
    );

    if (pageItems.length === 0) {
      this.els.grid.innerHTML = `<p class="bangumi-empty">${getLanguage() === "zh" ? "没有数据" : "No data"}</p>`;
    } else {
      pageItems.forEach((item) => {
        const el = document.createElement("a");
        el.className = "bangumi-card";
        el.href = `https://bgm.tv/subject/${item.subject.id}`;
        el.target = "_blank";
        el.rel = "noopener noreferrer";

        const isZh = getLanguage() === "zh";
        const title = isZh
          ? item.subject.name_cn || item.subject.name
          : item.subject.name;
        const score = item.rate || item.subject.score;

        el.innerHTML = `
                    <div class="bangumi-card-cover" style="background-image: url('${item.subject.images?.large || ''}')">
                        <div class="bangumi-card-overlay">
                            ${score ? `<div class="bangumi-card-score">★ ${score}</div>` : ''}
                            <div class="bangumi-card-title">${title}</div>
                        </div>
                    </div>`;
        this.els.grid!.appendChild(el);
      });
    }
    this.renderPagination(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }

  private renderPagination(totalPages: number) {
    if (!this.els.pagination) return;
    this.els.pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const addBtn = (p: number, text: string) => {
      const b = document.createElement("button");
      b.innerText = text;
      b.className = `bangumi-page-btn ${this.currentPage === p ? "active" : ""}`;
      if (this.currentPage !== p) {
        b.addEventListener("click", () => {
          this.currentPage = p;
          this.renderGrid();
          this.els.container?.scrollIntoView({ behavior: "smooth" });
        });
      }
      this.els.pagination!.appendChild(b);
    };

    const l = getLanguage() === "zh";
    if (this.currentPage > 1)
      addBtn(this.currentPage - 1, l ? "上一页" : "Prev");

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(totalPages, this.currentPage + 2);

    if (start > 1) addBtn(1, "1");
    if (start > 2) {
      const s = document.createElement("span");
      s.innerText = "...";
      this.els.pagination.appendChild(s);
    }

    for (let p = start; p <= end; p++) addBtn(p, String(p));

    if (end < totalPages - 1) {
      const s = document.createElement("span");
      s.innerText = "...";
      this.els.pagination.appendChild(s);
    }
    if (end < totalPages) addBtn(totalPages, String(totalPages));
    if (this.currentPage < totalPages)
      addBtn(this.currentPage + 1, l ? "下一页" : "Next");
  }

  private showLoading() {
    if (this.els.loading) this.els.loading.style.display = "block";
    if (this.els.content) this.els.content.style.display = "none";
    if (this.els.error) this.els.error.style.display = "none";
  }

  private hideLoading() {
    if (this.els.loading) this.els.loading.style.display = "none";
  }

  private showError() {
    this.hideLoading();
    if (this.els.error) this.els.error.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => new BangumiApp());
