interface ArtworkCandidate {
  url: string;
  artist?: string;
  sourceUrl?: string;
  color?: string;
}

interface LoadedArtwork {
  url: string;
  width: number;
  height: number;
  ratio: number;
  artist?: string;
  sourceUrl?: string;
  color?: string;
  index: number;
  element: HTMLElement;
}

interface ImageProvider {
  getUrl(): string;
  parse(payload: unknown): ArtworkCandidate | null;
}

type GalleryDensity = "cozy" | "compact";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function nestedValue(value: unknown, ...keys: string[]): unknown {
  let current = value;
  for (const key of keys) {
    const record = asRecord(current);
    if (!record) return null;
    current = record[key];
  }
  return current;
}

function asText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;

  try {
    const prefixed = value.startsWith("//")
      ? "https:" + value
      : value.startsWith("http://") || value.startsWith("https://")
        ? value
        : "https://" + value;
    const url = new URL(prefixed, document.baseURI);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function normalizeColor(value: unknown): string | undefined {
  const text = asText(value);
  if (!text) return undefined;
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text) ? text : undefined;
}

const providers: ImageProvider[] = [
  {
    getUrl: () => {
      const categories = ["neko", "waifu", "kitsune"];
      const category = categories[Math.floor(Math.random() * categories.length)];
      return "https://nekos.best/api/v2/" + category;
    },
    parse: (payload) => {
      const item = nestedValue(payload, "results", "0");
      const url = normalizeHttpUrl(nestedValue(item, "url"));
      if (!url) return null;
      return {
        url,
        artist: asText(nestedValue(item, "artist_name")),
        sourceUrl: normalizeHttpUrl(nestedValue(item, "source_url")),
      };
    },
  },
  {
    getUrl: () => "https://pic.re/image.json",
    parse: (payload) => {
      const url = normalizeHttpUrl(nestedValue(payload, "file_url"));
      if (!url) return null;
      return {
        url,
        artist: asText(nestedValue(payload, "author")),
        sourceUrl: normalizeHttpUrl(nestedValue(payload, "source")),
      };
    },
  },
  {
    getUrl: () => "https://api.nekosia.cat/api/v1/images/random",
    parse: (payload) => {
      const url = normalizeHttpUrl(nestedValue(payload, "image", "original", "url"));
      if (!url) return null;
      return {
        url,
        artist: asText(nestedValue(payload, "attribution", "artist", "username")),
        sourceUrl: normalizeHttpUrl(nestedValue(payload, "source", "url")),
        color: normalizeColor(nestedValue(payload, "colors", "main")),
      };
    },
  },
  {
    getUrl: () => "https://api.waifu.im/search?is_nsfw=false",
    parse: (payload) => {
      const item = nestedValue(payload, "images", "0");
      const url = normalizeHttpUrl(nestedValue(item, "url"));
      if (!url) return null;
      return {
        url,
        artist: asText(nestedValue(item, "artist", "name")),
        sourceUrl: normalizeHttpUrl(nestedValue(item, "source")),
        color: normalizeColor(nestedValue(item, "dominant_color")),
      };
    },
  },
];

const MAX_CONCURRENT_REQUESTS = 4;
const MAX_QUEUED_REQUESTS = 9;
const INITIAL_BATCH_SIZE = 9;
const SCROLL_BATCH_SIZE = 6;
const MAX_CONSECUTIVE_FAILURES = 4;
const PROVIDER_TIMEOUT_MS = 8000;
const IMAGE_TIMEOUT_MS = 15000;
const DENSITY_STORAGE_KEY = "anfsity_photo_density";

let activeGalleryCleanup: (() => void) | null = null;
let activeGalleryRoot: HTMLElement | null = null;

function readSavedDensity(): GalleryDensity {
  try {
    return window.localStorage.getItem(DENSITY_STORAGE_KEY) === "compact" ? "compact" : "cozy";
  } catch {
    return "cozy";
  }
}

function saveDensity(density: GalleryDensity): void {
  try {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  } catch {
    // Ignore storage unavailability in private browsing modes.
  }
}

function getLayoutMetrics(containerWidth: number, density: GalleryDensity): {
  gap: number;
  targetHeight: number;
  minHeight: number;
  maxHeight: number;
  maxItemsPerRow: number;
} {
  if (containerWidth < 560) {
    return {
      gap: 10,
      targetHeight: 220,
      minHeight: 155,
      maxHeight: 460,
      maxItemsPerRow: 2,
    };
  }

  if (containerWidth < 860) {
    return density === "compact"
      ? { gap: 10, targetHeight: 190, minHeight: 145, maxHeight: 265, maxItemsPerRow: 4 }
      : { gap: 12, targetHeight: 245, minHeight: 180, maxHeight: 330, maxItemsPerRow: 3 };
  }

  return density === "compact"
    ? { gap: 14, targetHeight: 215, minHeight: 165, maxHeight: 285, maxItemsPerRow: 5 }
    : { gap: 14, targetHeight: 295, minHeight: 215, maxHeight: 390, maxItemsPerRow: 4 };
}

interface RowPlan {
  items: LoadedArtwork[];
  height: number;
  justified: boolean;
}

function computeJustifiedRows(
  artworks: LoadedArtwork[],
  containerWidth: number,
  density: GalleryDensity,
): RowPlan[] {
  if (artworks.length === 0 || containerWidth <= 0) return [];

  const { gap, targetHeight, minHeight, maxHeight, maxItemsPerRow } = getLayoutMetrics(
    containerWidth,
    density,
  );

  const rows: RowPlan[] = [];
  let rowItems: LoadedArtwork[] = [];
  let ratioSum = 0;

  const flushHeightFor = (count: number, sum: number): number => {
    const availableWidth = Math.max(1, containerWidth - gap * Math.max(0, count - 1));
    return availableWidth / Math.max(0.1, sum);
  };

  for (const item of artworks) {
    const nextCount = rowItems.length + 1;
    const nextSum = ratioSum + item.ratio;
    const nextHeight = flushHeightFor(nextCount, nextSum);

    if (rowItems.length > 0 && nextHeight < minHeight) {
      const prevHeight = flushHeightFor(rowItems.length, ratioSum);
      if (prevHeight <= maxHeight) {
        rows.push({ items: rowItems, height: prevHeight, justified: true });
        rowItems = [item];
        ratioSum = item.ratio;
        const singleHeight = flushHeightFor(1, ratioSum);
        if (singleHeight <= targetHeight) {
          rows.push({ items: rowItems, height: Math.max(minHeight, singleHeight), justified: true });
          rowItems = [];
          ratioSum = 0;
        }
        continue;
      }
    }

    rowItems.push(item);
    ratioSum = nextSum;

    if (nextHeight <= targetHeight || rowItems.length >= maxItemsPerRow) {
      rows.push({
        items: rowItems,
        height: Math.min(maxHeight, Math.max(minHeight * 0.85, nextHeight)),
        justified: true,
      });
      rowItems = [];
      ratioSum = 0;
    }
  }

  if (rowItems.length > 0) {
    const flushHeight = flushHeightFor(rowItems.length, ratioSum);
    const shouldJustify = flushHeight <= maxHeight;
    rows.push({
      items: rowItems,
      height: shouldJustify ? flushHeight : Math.min(targetHeight, flushHeight),
      justified: shouldJustify,
    });
  }

  return rows;
}

function createTileElement(artwork: Omit<LoadedArtwork, "element">): HTMLElement {
  const figure = document.createElement("figure");
  figure.className = "photo-tile";
  if (artwork.color) {
    figure.style.backgroundColor = artwork.color;
  }

  const image = document.createElement("img");
  image.className = "photo-tile-img lightbox-enabled";
  image.src = artwork.url;
  image.width = artwork.width;
  image.height = artwork.height;
  image.decoding = "async";
  image.alt = artwork.artist ? `Artwork by ${artwork.artist}` : "Artwork";
  if (artwork.artist) {
    image.dataset.caption = artwork.artist;
  }
  figure.appendChild(image);

  const meta = document.createElement("figcaption");
  meta.className = "photo-tile-meta";

  const info = document.createElement("span");
  info.className = "photo-tile-info";

  const indexEl = document.createElement("span");
  indexEl.className = "photo-tile-index";
  indexEl.textContent = String(artwork.index).padStart(2, "0");
  info.appendChild(indexEl);

  const labelEl = document.createElement("span");
  labelEl.className = "photo-tile-label";
  labelEl.textContent = artwork.artist || `${artwork.width} × ${artwork.height}`;
  info.appendChild(labelEl);

  meta.appendChild(info);

  if (artwork.sourceUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.className = "photo-tile-source";
    sourceLink.href = artwork.sourceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.title = "View original source";
    sourceLink.setAttribute("aria-label", "View original source");
    sourceLink.innerHTML =
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />' +
      '<path d="M11 13l9 -9" />' +
      '<path d="M15 4h5v5" />' +
      "</svg>";
    sourceLink.addEventListener("click", (event) => event.stopPropagation());
    meta.appendChild(sourceLink);
  }

  figure.appendChild(meta);
  return figure;
}

export function initFluentGallery(): void {
  const wrapper = document.getElementById("fluent-gallery-wrapper");
  const gallery = document.getElementById("fluent-gallery");
  const loader = document.getElementById("loading-indicator");
  if (!wrapper || !gallery || !loader) {
    activeGalleryCleanup?.();
    activeGalleryCleanup = null;
    activeGalleryRoot = null;
    return;
  }

  const galleryElement = gallery;
  const loaderElement = loader;
  const skeletonElement = document.getElementById("photo-wall-skeleton");
  const countElement = document.getElementById("photo-wall-count");
  const retryButton = loaderElement.querySelector<HTMLButtonElement>("#fluent-gallery-retry");
  const loaderStatus = loaderElement.querySelector<HTMLElement>("#fluent-gallery-status");
  const refreshButton = document.getElementById("photo-wall-refresh");
  const densityButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".photo-density-group [data-density]"),
  );

  if (activeGalleryRoot === galleryElement) return;
  activeGalleryCleanup?.();
  activeGalleryCleanup = null;
  activeGalleryRoot = galleryElement;

  const lifecycleController = new AbortController();
  let batchController = new AbortController();
  const fetchedUrls = new Set<string>();
  const artworks: LoadedArtwork[] = [];

  let density: GalleryDensity = readSavedDensity();
  let queuedRequests = 0;
  let activeRequests = 0;
  let loaderVisible = false;
  let autoLoadingPaused = false;
  let consecutiveFailures = 0;
  let disposed = false;
  let generation = 0;
  let lastLayoutWidth = 0;
  let layoutFrame: number | null = null;

  function applyDensityState(nextDensity: GalleryDensity): void {
    density = nextDensity;
    wrapper.dataset.density = density;
    densityButtons.forEach((btn) => {
      const active = btn.dataset.density === density;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function updateCount(): void {
    if (!countElement) return;
    if (artworks.length === 0) {
      countElement.hidden = true;
      return;
    }
    countElement.hidden = false;
    countElement.textContent = `${String(artworks.length).padStart(2, "0")} works`;
  }

  function updateLoader(): void {
    const loading = activeRequests > 0 || queuedRequests > 0;
    loaderElement.classList.toggle("is-paused", autoLoadingPaused);
    loaderElement.style.opacity = loading || autoLoadingPaused ? "1" : "0";
    refreshButton?.classList.toggle("is-refreshing", loading && artworks.length === 0);

    if (loaderStatus) {
      loaderStatus.textContent = autoLoadingPaused
        ? (artworks.length === 0 ? "Unable to load artworks." : "Image loading paused.")
        : "Curating works...";
    }
    if (retryButton) retryButton.hidden = !autoLoadingPaused;
  }

  function renderRows(): void {
    const width = galleryElement.clientWidth;
    if (width <= 0) return;
    lastLayoutWidth = width;

    const plans = computeJustifiedRows(artworks, width, density);
    const existingRows = Array.from(galleryElement.children) as HTMLElement[];

    for (let rowIndex = 0; rowIndex < plans.length; rowIndex += 1) {
      const plan = plans[rowIndex];
      const nextHeight = `${Math.round(plan.height)}px`;
      let row = existingRows[rowIndex];

      // Preserve already-sealed rows untouched so active hovers and scroll stay rock-steady.
      const isSameRow = Boolean(row) &&
        row.style.height === nextHeight &&
        row.children.length === plan.items.length &&
        plan.items.every((item, idx) => row.children[idx] === item.element);

      if (isSameRow) continue;

      if (!row) {
        row = document.createElement("div");
        row.className = "photo-row";
        galleryElement.appendChild(row);
      }

      row.style.height = nextHeight;

      const rowFragment = document.createDocumentFragment();
      for (const item of plan.items) {
        if (plan.justified) {
          item.element.style.flex = `${item.ratio.toFixed(4)} 0 0%`;
        } else {
          const itemWidth = Math.min(width, Math.round(plan.height * item.ratio));
          item.element.style.flex = `0 0 ${itemWidth}px`;
        }
        rowFragment.appendChild(item.element);
      }
      row.replaceChildren(rowFragment);
    }

    while (galleryElement.children.length > plans.length) {
      galleryElement.lastElementChild?.remove();
    }

    window.requestAnimationFrame(() => {
      if (disposed) return;
      for (const item of artworks) {
        item.element.classList.add("is-revealed");
      }
    });
  }

  function scheduleLayout(): void {
    if (layoutFrame !== null) return;
    layoutFrame = window.requestAnimationFrame(() => {
      layoutFrame = null;
      if (!disposed) renderRows();
    });
  }

  async function fetchOneCandidate(signal: AbortSignal): Promise<ArtworkCandidate | null> {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    if (signal.aborted) return null;

    const requestController = new AbortController();
    const abortRequest = (): void => requestController.abort();
    signal.addEventListener("abort", abortRequest, { once: true });
    const timeoutId = window.setTimeout(abortRequest, PROVIDER_TIMEOUT_MS);

    try {
      const response = await fetch(provider.getUrl(), { signal: requestController.signal });
      if (!response.ok) return null;

      const candidate = provider.parse(await response.json() as unknown);
      if (!candidate || fetchedUrls.has(candidate.url)) return null;
      fetchedUrls.add(candidate.url);
      return candidate;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeoutId);
      signal.removeEventListener("abort", abortRequest);
    }
  }

  async function loadOneArtwork(currentGen: number, signal: AbortSignal): Promise<boolean> {
    let candidate: ArtworkCandidate | null = null;
    for (let attempt = 0; attempt < 2 && !candidate && !disposed && currentGen === generation; attempt += 1) {
      candidate = await fetchOneCandidate(signal);
    }
    if (!candidate || disposed || currentGen !== generation || signal.aborted) {
      return false;
    }

    const preload = new Image();
    preload.decoding = "async";
    preload.setAttribute("fetchpriority", artworks.length < 6 ? "high" : "low");

    const loaded = await new Promise<boolean>((resolve) => {
      let timeoutId: number | null = null;
      const finish = (result: boolean): void => {
        preload.onload = null;
        preload.onerror = null;
        signal.removeEventListener("abort", onAbort);
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        if (!result) preload.removeAttribute("src");
        resolve(result);
      };
      const onAbort = (): void => finish(false);
      preload.onload = () => finish(true);
      preload.onerror = () => finish(false);
      signal.addEventListener("abort", onAbort, { once: true });
      timeoutId = window.setTimeout(() => finish(false), IMAGE_TIMEOUT_MS);
      if (signal.aborted) finish(false);
      else preload.src = candidate.url;
    });

    if (!loaded || disposed || currentGen !== generation || signal.aborted) {
      return false;
    }

    await preload.decode().catch(() => undefined);
    if (disposed || currentGen !== generation || signal.aborted) {
      return false;
    }

    const width = preload.naturalWidth;
    const height = preload.naturalHeight;
    if (width === 0 || height === 0) return false;

    const index = artworks.length + 1;
    const baseArtwork = {
      url: candidate.url,
      width,
      height,
      ratio: width / height,
      artist: candidate.artist,
      sourceUrl: candidate.sourceUrl,
      color: candidate.color,
      index,
    };

    const element = createTileElement(baseArtwork);
    artworks.push({ ...baseArtwork, element });

    if (skeletonElement) skeletonElement.hidden = true;
    updateCount();
    renderRows();
    return true;
  }

  function processQueue(): void {
    if (
      disposed ||
      autoLoadingPaused ||
      activeRequests >= MAX_CONCURRENT_REQUESTS ||
      queuedRequests <= 0
    ) {
      return;
    }

    const currentGen = generation;
    const currentSignal = batchController.signal;
    activeRequests += 1;
    queuedRequests -= 1;
    updateLoader();

    void loadOneArtwork(currentGen, currentSignal).catch(() => false).then((loaded) => {
      if (disposed || currentGen !== generation) return;
      consecutiveFailures = loaded ? 0 : consecutiveFailures + 1;
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        autoLoadingPaused = true;
        queuedRequests = 0;
      }
    }).finally(() => {
      if (currentGen !== generation) return;
      activeRequests = Math.max(0, activeRequests - 1);
      if (disposed) return;

      if (queuedRequests === 0 && loaderVisible && !autoLoadingPaused) {
        loadBatch(SCROLL_BATCH_SIZE);
      } else {
        processQueue();
      }
      updateLoader();
    });

    processQueue();
  }

  function loadBatch(count = SCROLL_BATCH_SIZE): void {
    if (autoLoadingPaused) return;
    queuedRequests = Math.min(MAX_QUEUED_REQUESTS, queuedRequests + count);
    processQueue();
  }

  function resetAndShuffle(): void {
    generation += 1;
    batchController.abort();
    batchController = new AbortController();

    artworks.length = 0;
    fetchedUrls.clear();
    galleryElement.replaceChildren();
    if (skeletonElement) skeletonElement.hidden = false;

    activeRequests = 0;
    queuedRequests = 0;
    consecutiveFailures = 0;
    autoLoadingPaused = false;
    updateCount();
    loadBatch(INITIAL_BATCH_SIZE);
    updateLoader();
  }

  const loaderObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      loaderVisible = entry.isIntersecting;
      if (loaderVisible && !autoLoadingPaused && artworks.length > 0) {
        loadBatch(SCROLL_BATCH_SIZE);
      }
    });
  }, { rootMargin: "320px" });

  const resizeObserver = new ResizeObserver(() => {
    const nextWidth = galleryElement.clientWidth;
    if (nextWidth > 0 && Math.abs(nextWidth - lastLayoutWidth) >= 4) {
      scheduleLayout();
    }
  });

  densityButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextDensity: GalleryDensity = btn.dataset.density === "compact" ? "compact" : "cozy";
      if (nextDensity === density) return;
      applyDensityState(nextDensity);
      saveDensity(nextDensity);
      scheduleLayout();
    }, { signal: lifecycleController.signal });
  });

  refreshButton?.addEventListener("click", () => {
    if (disposed) return;
    resetAndShuffle();
  }, { signal: lifecycleController.signal });

  retryButton?.addEventListener("click", () => {
    if (disposed) return;
    consecutiveFailures = 0;
    autoLoadingPaused = false;
    loadBatch(artworks.length === 0 ? INITIAL_BATCH_SIZE : SCROLL_BATCH_SIZE);
    updateLoader();
  }, { signal: lifecycleController.signal });

  applyDensityState(density);
  resizeObserver.observe(galleryElement);
  loaderObserver.observe(loaderElement);
  loadBatch(INITIAL_BATCH_SIZE);
  updateLoader();

  activeGalleryCleanup = () => {
    disposed = true;
    generation += 1;
    lifecycleController.abort();
    batchController.abort();
    if (layoutFrame !== null) window.cancelAnimationFrame(layoutFrame);
    resizeObserver.disconnect();
    loaderObserver.disconnect();
    loaderElement.style.opacity = "0";
    if (activeGalleryRoot === galleryElement) activeGalleryRoot = null;
  };
}
