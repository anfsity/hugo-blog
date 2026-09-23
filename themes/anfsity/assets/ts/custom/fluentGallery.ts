interface ImageProvider {
  getUrl(): string;
  parse(payload: unknown): string | null;
}

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

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    const url = new URL(value.startsWith("//") ? "https:" + value : value, document.baseURI);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

const providers: ImageProvider[] = [
  {
    getUrl: () => {
      const categories = ["neko", "waifu", "kitsune"];
      const category = categories[Math.floor(Math.random() * categories.length)];
      return "https://nekos.best/api/v2/" + category;
    },
    parse: (payload) => normalizeImageUrl(nestedValue(payload, "results", "0", "url")),
  },
  {
    getUrl: () => "https://pic.re/image.json",
    parse: (payload) => {
      const value = nestedValue(payload, "file_url");
      if (typeof value !== "string") return null;
      return normalizeImageUrl(value.startsWith("http") ? value : "https://" + value);
    },
  },
  {
    getUrl: () => "https://api.nekosia.cat/api/v1/images/random",
    parse: (payload) => normalizeImageUrl(nestedValue(payload, "image", "original", "url")),
  },
  {
    getUrl: () => "https://api.waifu.im/search?is_nsfw=false",
    parse: (payload) => normalizeImageUrl(nestedValue(payload, "images", "0", "url")),
  },
];

const maxConcurrentRequests = 3;
const maxQueuedRequests = 6;
let activeGalleryCleanup: (() => void) | null = null;
let activeGalleryRoot: HTMLElement | null = null;

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

  if (activeGalleryRoot === galleryElement) return;
  activeGalleryCleanup?.();
  activeGalleryCleanup = null;
  activeGalleryRoot = galleryElement;

  const abortController = new AbortController();
  const fetchedUrls = new Set<string>();
  let queuedRequests = 0;
  let activeRequests = 0;
  let loaderVisible = false;
  let disposed = false;
  let queueTimer: number | null = null;

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("visible", entry.isIntersecting));
  }, { threshold: 0.05, rootMargin: "50px" });

  const loaderObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      loaderVisible = entry.isIntersecting;
      if (loaderVisible) loadBatch(3);
    });
  }, { rootMargin: "300px" });

  function createSkeletonCard(): HTMLElement {
    const card = document.createElement("div");
    card.className = "fluent-card skeleton";
    card.style.animationDelay = Math.random() * 0.2 + "s";

    const inner = document.createElement("div");
    inner.className = "fluent-card-inner";
    card.appendChild(inner);
    galleryElement.appendChild(card);
    cardObserver.observe(card);
    return card;
  }

  async function fetchOneImage(): Promise<string | null> {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    try {
      const response = await fetch(provider.getUrl(), { signal: abortController.signal });
      if (!response.ok) return null;

      const url = provider.parse(await response.json() as unknown);
      if (!url || fetchedUrls.has(url)) return null;
      fetchedUrls.add(url);
      return url;
    } catch {
      return null;
    }
  }

  async function loadCard(card: HTMLElement): Promise<void> {
    let url: string | null = null;
    for (let attempt = 0; attempt < 2 && !url && !disposed; attempt += 1) {
      url = await fetchOneImage();
    }
    if (!url || disposed) {
      card.remove();
      return;
    }

    const image = new Image();
    image.alt = "Artwork";

    const loaded = await new Promise<boolean>((resolve) => {
      const finish = (result: boolean): void => {
        image.onload = null;
        image.onerror = null;
        abortController.signal.removeEventListener("abort", onAbort);
        resolve(result);
      };
      const onAbort = (): void => finish(false);
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      abortController.signal.addEventListener("abort", onAbort, { once: true });
      if (abortController.signal.aborted) finish(false);
      else image.src = url;
    });

    if (!loaded || disposed) {
      card.remove();
      return;
    }

    card.classList.remove("skeleton");
    card.classList.add("loaded");
    card.querySelector(".fluent-card-inner")?.appendChild(image);
  }

  function processQueue(): void {
    if (disposed || activeRequests >= maxConcurrentRequests || queuedRequests <= 0) return;

    activeRequests += 1;
    queuedRequests -= 1;
    loaderElement.style.opacity = "1";

    const card = createSkeletonCard();
    loadCard(card).finally(() => {
      activeRequests -= 1;
      if (disposed) return;

      if (activeRequests === 0 && queuedRequests === 0) {
        loaderElement.style.opacity = "0";
        if (loaderVisible) loadBatch(3);
      }

      queueTimer = window.setTimeout(processQueue, 300);
    });

    processQueue();
  }

  function loadBatch(count = 3): void {
    queuedRequests = Math.min(maxQueuedRequests, queuedRequests + count);
    processQueue();
  }

  const handleMouseMove = (event: MouseEvent): void => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest<HTMLElement>(".fluent-card:not(.skeleton)");
    if (!card || !galleryElement.contains(card)) return;

    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", event.clientX - rect.left + "px");
    card.style.setProperty("--mouse-y", event.clientY - rect.top + "px");
  };

  wrapper.addEventListener("mousemove", handleMouseMove, { signal: abortController.signal });
  loaderObserver.observe(loaderElement);
  loadBatch(6);

  activeGalleryCleanup = () => {
    disposed = true;
    abortController.abort();
    if (queueTimer !== null) window.clearTimeout(queueTimer);
    cardObserver.disconnect();
    loaderObserver.disconnect();
    loaderElement.style.opacity = "0";
    if (activeGalleryRoot === galleryElement) activeGalleryRoot = null;
  };
}
