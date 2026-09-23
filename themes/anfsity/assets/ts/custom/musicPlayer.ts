import { fetchMetingTracks, parseMusicUrl, type MetingTrack } from "./musicApi";

interface MusicConfig {
  enabled?: boolean;
  api?: string;
  urls?: string[];
  autoplay?: boolean;
  theme?: string;
}

interface APlayerInstance {
  on(event: "play" | "pause", callback: () => void): void;
}

interface APlayerOptions {
  container: HTMLElement;
  audio: MetingTrack[];
  theme: string;
  autoplay: boolean;
  loop: "all";
  order: "list";
  preload: "auto";
  mutex: boolean;
  listFolded: boolean;
}

declare global {
  interface Window {
    APlayer?: new (options: APlayerOptions) => APlayerInstance;
  }
}

let clickHandlerInstalled = false;
const initializedPlayers = new WeakSet<HTMLElement>();

function readMusicConfig(): MusicConfig | null {
  const configElement = document.getElementById("music-config");
  if (!configElement?.textContent) return null;

  try {
    return JSON.parse(configElement.textContent) as MusicConfig;
  } catch {
    return null;
  }
}

function installPanelClickHandler(): void {
  if (clickHandlerInstalled) return;
  clickHandlerInstalled = true;

  document.addEventListener("click", (event) => {
    const button = document.getElementById("music-player-widget");
    const panel = document.getElementById("music-panel");
    if (!button || !panel || !(event.target instanceof Node)) return;

    if (button.contains(event.target)) {
      panel.classList.toggle("show");
      return;
    }

    if (!panel.contains(event.target)) panel.classList.remove("show");
  });
}

export async function initMusicPlayer(): Promise<void> {
  const container = document.getElementById("aplayer-container");
  const button = document.getElementById("music-player-widget");
  const config = readMusicConfig();
  if (!container || !button || !config?.enabled || initializedPlayers.has(container)) return;

  installPanelClickHandler();
  initializedPlayers.add(container);
  const apiUrl = config.api || "https://api.injahow.cn/meting/";
  const urls = Array.isArray(config.urls) ? config.urls : [];
  const tracksByList = await Promise.all(urls.map(async (url) => {
    const request = parseMusicUrl(url);
    return request ? fetchMetingTracks(request, apiUrl) : [];
  }));

  const tracks = tracksByList.flat();
  const APlayer = window.APlayer;
  if (!container.isConnected || tracks.length === 0 || !APlayer) return;

  const player = new APlayer({
    container,
    audio: tracks,
    theme: config.theme || "#2980b9",
    autoplay: config.autoplay ?? false,
    loop: "all",
    order: "list",
    preload: "auto",
    mutex: true,
    listFolded: true,
  });

  player.on("play", () => button.setAttribute("data-play", "true"));
  player.on("pause", () => button.removeAttribute("data-play"));
}
