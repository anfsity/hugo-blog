import { fetchMetingTracks, parseMusicUrl, type MetingTrack } from "./musicApi";

interface MusicConfig {
  enabled?: boolean;
  api?: string;
  urls?: string[];
  autoplay?: boolean;
  autoPlay?: boolean;
  theme?: string;
}

interface APlayerInstance {
  on(event: "play" | "pause" | "ended" | "error", callback: () => void): void;
}

interface APlayerOptions {
  container: HTMLElement;
  audio: MetingTrack[];
  theme: string;
  autoplay: boolean;
  loop: "all";
  order: "list";
  preload: "none" | "metadata" | "auto";
  mutex: boolean;
  listFolded: boolean;
}

declare global {
  interface Window {
    APlayer?: new (options: APlayerOptions) => APlayerInstance;
  }
}

let interactionHandlersInstalled = false;
let loadState: "idle" | "loading" | "ready" | "error" = "idle";

function readMusicConfig(): MusicConfig | null {
  const configElement = document.getElementById("music-config");
  if (!configElement?.textContent) return null;

  try {
    return JSON.parse(configElement.textContent) as MusicConfig;
  } catch {
    return null;
  }
}

function setPanelOpen(open: boolean): void {
  const button = document.getElementById("music-player-widget");
  const panel = document.getElementById("music-panel");
  if (!button || !panel) return;

  panel.classList.toggle("show", open);
  panel.setAttribute("aria-hidden", String(!open));
  button.setAttribute("aria-expanded", String(open));
}

function updateStatus(mode: "loading" | "error" | "hidden", message = ""): void {
  const status = document.getElementById("music-status");
  const text = document.getElementById("music-status-text");
  const retry = document.getElementById("music-retry");
  if (!status || !text || !(retry instanceof HTMLButtonElement)) return;

  if (mode === "hidden") {
    status.hidden = true;
    status.classList.remove("is-error");
    retry.hidden = true;
    return;
  }

  status.hidden = false;
  status.classList.toggle("is-error", mode === "error");
  text.textContent = message;
  retry.hidden = mode !== "error";
}

function setPlayingState(playing: boolean): void {
  const button = document.getElementById("music-player-widget");
  if (!button) return;

  if (playing) button.setAttribute("data-play", "true");
  else button.removeAttribute("data-play");
}

function installPanelHandlers(onRetry: () => void): void {
  if (interactionHandlersInstalled) return;
  interactionHandlersInstalled = true;

  document.addEventListener("click", (event) => {
    const button = document.getElementById("music-player-widget");
    const panel = document.getElementById("music-panel");
    const retryButton = document.getElementById("music-retry");
    if (!button || !panel) return;

    // APlayer synchronously replaces button SVG children on click; use composedPath()
    // so clicks on detached SVG nodes inside the panel do not collapse it.
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    const target = event.target instanceof Node ? event.target : null;
    const isInside = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      return path.includes(el) || (target !== null && el.contains(target));
    };

    if (isInside(retryButton)) {
      onRetry();
      return;
    }

    if (isInside(button)) {
      setPanelOpen(!panel.classList.contains("show"));
      return;
    }

    if (panel.classList.contains("show") && !isInside(panel)) {
      setPanelOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const lightbox = document.getElementById("elegant-lightbox");
    if (lightbox?.classList.contains("active")) return;

    const panel = document.getElementById("music-panel");
    if (panel?.classList.contains("show")) {
      setPanelOpen(false);
      document.getElementById("music-player-widget")?.focus();
    }
  });
}

async function mountPlayer(container: HTMLElement, config: MusicConfig): Promise<void> {
  if (loadState === "loading" || loadState === "ready") return;

  loadState = "loading";
  updateStatus("loading", "Loading playlist...");

  const apiUrl = config.api || "https://api.injahow.cn/meting/";
  const urls = Array.isArray(config.urls) ? config.urls : [];
  const tracksByList = await Promise.all(urls.map(async (url) => {
    const request = parseMusicUrl(url);
    return request ? fetchMetingTracks(request, apiUrl) : [];
  }));

  const tracks = tracksByList.flat();
  const APlayer = window.APlayer;
  if (!container.isConnected || tracks.length === 0 || !APlayer) {
    loadState = "error";
    updateStatus("error", !APlayer ? "Player unavailable." : "Failed to load playlist.");
    return;
  }

  updateStatus("hidden");
  loadState = "ready";

  const player = new APlayer({
    container,
    audio: tracks,
    theme: config.theme || "#34495e",
    autoplay: config.autoplay ?? config.autoPlay ?? false,
    loop: "all",
    order: "list",
    preload: "none",
    mutex: true,
    listFolded: true,
  });

  player.on("play", () => setPlayingState(true));
  player.on("pause", () => setPlayingState(false));
  player.on("ended", () => setPlayingState(false));
  player.on("error", () => setPlayingState(false));
}

export async function initMusicPlayer(): Promise<void> {
  const container = document.getElementById("aplayer-container");
  const button = document.getElementById("music-player-widget");
  const config = readMusicConfig();
  if (!container || !button || !config?.enabled) return;

  installPanelHandlers(() => {
    void mountPlayer(container, config);
  });

  await mountPlayer(container, config);
}
