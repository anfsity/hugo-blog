import { fetchMetingTracks, parseMusicUrl, type MetingTrack } from "./musicApi";

interface MusicConfig {
  enabled?: boolean;
  api?: string;
  urls?: string[];
  autoplay?: boolean;
  autoPlay?: boolean;
}

type PlayMode = "list" | "shuffle" | "single";

const VOLUME_STORAGE_KEY = "anfsity_music_volume";
const MODE_STORAGE_KEY = "anfsity_music_mode";

const ICONS = {
  play: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true" style="transform:translateX(0.75px)"><path d="M7 5.14v13.72a1 1 0 0 0 1.52.85l10.86-6.86a1 1 0 0 0 0-1.7L8.52 4.29A1 1 0 0 0 7 5.14z" /></svg>',
  pause: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" /></svg>',
  prev: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 6l-9 6l9 6z" /><path d="M5 6v12" /></svg>',
  next: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6l9 6l-9 6z" /><path d="M19 6v12" /></svg>',
  volumeHigh: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 8a5 5 0 0 1 0 8" /><path d="M17.7 5a9 9 0 0 1 0 14" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" /></svg>',
  volumeLow: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 8a5 5 0 0 1 0 8" /><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" /></svg>',
  volumeMute: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" /><path d="M16 10l4 4m0 -4l-4 4" /></svg>',
  modeList: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" /></svg>',
  modeShuffle: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 4l3 3l-3 3" /><path d="M18 20l3 -3l-3 -3" /><path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" /><path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3" /></svg>',
  modeSingle: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" /><path d="M11 11l1 -1v4" /></svg>',
  playlist: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></svg>',
  disc: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /></svg>',
};

const MODE_LABELS: Record<PlayMode, string> = {
  list: "Loop playlist",
  shuffle: "Shuffle",
  single: "Repeat one",
};

const MODE_ORDER: PlayMode[] = ["list", "shuffle", "single"];

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

function readStoredVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw === null) return 0.7;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.7;
  } catch {
    return 0.7;
  }
}

function writeStoredVolume(value: number): void {
  try {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, value.toFixed(2));
  } catch {
    // Ignore storage unavailability.
  }
}

function readStoredMode(): PlayMode {
  try {
    const raw = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (raw === "shuffle" || raw === "single" || raw === "list") return raw;
  } catch {
    // Ignore storage unavailability.
  }
  return "list";
}

function writeStoredMode(mode: PlayMode): void {
  try {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage unavailability.
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function setPanelOpen(open: boolean): void {
  const button = document.getElementById("music-player-widget");
  const panel = document.getElementById("music-panel");
  if (!button || !panel) return;

  panel.classList.toggle("show", open);
  panel.setAttribute("aria-hidden", String(!open));
  button.setAttribute("aria-expanded", String(open));
}

function setWidgetPlaying(playing: boolean): void {
  const button = document.getElementById("music-player-widget");
  if (!button) return;

  if (playing) button.setAttribute("data-play", "true");
  else button.removeAttribute("data-play");
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

function installPanelHandlers(onRetry: () => void): void {
  if (interactionHandlersInstalled) return;
  interactionHandlersInstalled = true;

  document.addEventListener("click", (event) => {
    const button = document.getElementById("music-player-widget");
    const panel = document.getElementById("music-panel");
    const retryButton = document.getElementById("music-retry");
    if (!button || !panel) return;

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

class NativeMusicPlayer {
  private readonly audio: HTMLAudioElement;
  private currentIndex = 0;
  private playMode: PlayMode = readStoredMode();
  private lastNonZeroVolume = readStoredVolume() || 0.7;
  private isSeeking = false;
  private seekRatio = 0;
  private isPlaylistOpen = false;
  private consecutiveErrors = 0;

  private readonly coverImg: HTMLImageElement;
  private readonly coverWrap: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly artistEl: HTMLElement;
  private readonly playBtn: HTMLButtonElement;
  private readonly prevBtn: HTMLButtonElement;
  private readonly nextBtn: HTMLButtonElement;
  private readonly volumeWrap: HTMLElement;
  private readonly volumeBtn: HTMLButtonElement;
  private readonly volumePopover: HTMLElement;
  private readonly volumeTrack: HTMLElement;
  private readonly volumeFill: HTMLElement;
  private readonly modeBtn: HTMLButtonElement;
  private readonly listBtn: HTMLButtonElement;
  private readonly progressWrap: HTMLElement;
  private readonly progressTrack: HTMLElement;
  private readonly progressBuffered: HTMLElement;
  private readonly progressPlayed: HTMLElement;
  private readonly currentTimeEl: HTMLElement;
  private readonly durationEl: HTMLElement;
  private readonly listDrawer: HTMLElement;
  private readonly listItems: HTMLLIElement[] = [];

  constructor(
    container: HTMLElement,
    private readonly tracks: MetingTrack[],
    autoplay: boolean,
  ) {
    this.audio = new Audio();
    this.audio.preload = "none";
    const initialVolume = readStoredVolume();
    this.audio.volume = initialVolume;
    if (initialVolume > 0) this.lastNonZeroVolume = initialVolume;

    container.innerHTML = `
      <div class="mp-main">
        <div class="mp-head">
          <button type="button" class="mp-cover" aria-label="Play or pause">
            <span class="mp-cover-fallback" aria-hidden="true">${ICONS.disc}</span>
            <img class="mp-cover-img" alt="" decoding="async" hidden />
          </button>
          <div class="mp-meta">
            <div class="mp-title"></div>
            <div class="mp-artist"></div>
          </div>
          <button type="button" class="mp-btn mp-list-toggle" aria-label="Toggle playlist" aria-expanded="false" title="Playlist">${ICONS.playlist}</button>
        </div>
        <div class="mp-scrubber">
          <span class="mp-time mp-time-current">00:00</span>
          <div class="mp-progress-wrap" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
            <div class="mp-progress-track">
              <div class="mp-progress-buffered"></div>
              <div class="mp-progress-played"><span class="mp-progress-thumb"></span></div>
            </div>
          </div>
          <span class="mp-time mp-time-duration">00:00</span>
        </div>
        <div class="mp-controls">
          <div class="mp-volume-wrap">
            <button type="button" class="mp-btn mp-volume-btn" aria-label="Mute or unmute" title="Volume"></button>
            <div class="mp-volume-popover" role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" tabindex="0">
              <div class="mp-volume-track">
                <div class="mp-volume-fill"></div>
              </div>
            </div>
          </div>
          <div class="mp-transport">
            <button type="button" class="mp-btn mp-prev" aria-label="Previous track" title="Previous">${ICONS.prev}</button>
            <button type="button" class="mp-btn mp-play" aria-label="Play" title="Play">${ICONS.play}</button>
            <button type="button" class="mp-btn mp-next" aria-label="Next track" title="Next">${ICONS.next}</button>
          </div>
          <button type="button" class="mp-btn mp-mode" aria-label="Switch play mode"></button>
        </div>
      </div>
      <div class="mp-playlist" hidden>
        <ol class="mp-playlist-list"></ol>
      </div>
    `;

    this.coverWrap = container.querySelector<HTMLElement>(".mp-cover")!;
    this.coverImg = container.querySelector<HTMLImageElement>(".mp-cover-img")!;
    this.titleEl = container.querySelector<HTMLElement>(".mp-title")!;
    this.artistEl = container.querySelector<HTMLElement>(".mp-artist")!;
    this.playBtn = container.querySelector<HTMLButtonElement>(".mp-play")!;
    this.prevBtn = container.querySelector<HTMLButtonElement>(".mp-prev")!;
    this.nextBtn = container.querySelector<HTMLButtonElement>(".mp-next")!;
    this.volumeWrap = container.querySelector<HTMLElement>(".mp-volume-wrap")!;
    this.volumeBtn = container.querySelector<HTMLButtonElement>(".mp-volume-btn")!;
    this.volumePopover = container.querySelector<HTMLElement>(".mp-volume-popover")!;
    this.volumeTrack = container.querySelector<HTMLElement>(".mp-volume-track")!;
    this.volumeFill = container.querySelector<HTMLElement>(".mp-volume-fill")!;
    this.modeBtn = container.querySelector<HTMLButtonElement>(".mp-mode")!;
    this.listBtn = container.querySelector<HTMLButtonElement>(".mp-list-toggle")!;
    this.progressWrap = container.querySelector<HTMLElement>(".mp-progress-wrap")!;
    this.progressTrack = container.querySelector<HTMLElement>(".mp-progress-track")!;
    this.progressBuffered = container.querySelector<HTMLElement>(".mp-progress-buffered")!;
    this.progressPlayed = container.querySelector<HTMLElement>(".mp-progress-played")!;
    this.currentTimeEl = container.querySelector<HTMLElement>(".mp-time-current")!;
    this.durationEl = container.querySelector<HTMLElement>(".mp-time-duration")!;
    this.listDrawer = container.querySelector<HTMLElement>(".mp-playlist")!;

    this.renderPlaylist(container.querySelector<HTMLOListElement>(".mp-playlist-list")!);
    this.bindControls();
    this.bindAudioEvents();
    this.bindMediaSession();
    this.syncVolumeUI();
    this.syncModeUI();
    this.loadTrack(0, autoplay);
  }

  private renderPlaylist(listEl: HTMLOListElement): void {
    const fragment = document.createDocumentFragment();
    const digits = Math.max(2, String(this.tracks.length).length);

    this.tracks.forEach((track, idx) => {
      const li = document.createElement("li");
      li.className = "mp-track-item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mp-track-btn";

      const indexSpan = document.createElement("span");
      indexSpan.className = "mp-track-index";
      indexSpan.textContent = String(idx + 1).padStart(digits, "0");

      const titleSpan = document.createElement("span");
      titleSpan.className = "mp-track-title";
      titleSpan.textContent = track.title;

      const artistSpan = document.createElement("span");
      artistSpan.className = "mp-track-artist";
      artistSpan.textContent = track.artist;

      button.append(indexSpan, titleSpan, artistSpan);
      button.addEventListener("click", () => {
        if (idx === this.currentIndex) {
          this.togglePlay();
        } else {
          this.consecutiveErrors = 0;
          this.loadTrack(idx, true);
        }
      });

      li.appendChild(button);
      this.listItems.push(li);
      fragment.appendChild(li);
    });

    listEl.replaceChildren(fragment);
  }

  private bindControls(): void {
    this.coverWrap.addEventListener("click", () => this.togglePlay());
    this.playBtn.addEventListener("click", () => this.togglePlay());
    this.prevBtn.addEventListener("click", () => this.stepTrack(-1, true));
    this.nextBtn.addEventListener("click", () => this.stepTrack(1, true));

    this.modeBtn.addEventListener("click", () => {
      const nextIndex = (MODE_ORDER.indexOf(this.playMode) + 1) % MODE_ORDER.length;
      this.playMode = MODE_ORDER[nextIndex];
      writeStoredMode(this.playMode);
      this.syncModeUI();
    });

    this.listBtn.addEventListener("click", () => {
      this.isPlaylistOpen = !this.isPlaylistOpen;
      this.listDrawer.hidden = !this.isPlaylistOpen;
      this.listBtn.classList.toggle("is-active", this.isPlaylistOpen);
      this.listBtn.setAttribute("aria-expanded", String(this.isPlaylistOpen));
      if (this.isPlaylistOpen) {
        this.listItems[this.currentIndex]?.scrollIntoView({ block: "nearest" });
      }
    });

    this.volumeBtn.addEventListener("click", () => {
      if (this.audio.volume > 0.001) {
        this.lastNonZeroVolume = this.audio.volume;
        this.setVolume(0);
      } else {
        this.setVolume(this.lastNonZeroVolume || 0.7);
      }
    });

    this.bindProgressScrubber();
    this.bindVolumeSlider();
  }

  private bindProgressScrubber(): void {
    let activePointerId: number | null = null;

    const ratioFromClientX = (clientX: number): number => {
      const rect = this.progressTrack.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    };

    const previewRatio = (ratio: number): void => {
      this.seekRatio = ratio;
      const percent = ratio * 100;
      this.progressPlayed.style.width = `${percent.toFixed(2)}%`;
      this.progressWrap.setAttribute("aria-valuenow", String(Math.round(percent)));
      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.currentTimeEl.textContent = formatTime(ratio * this.audio.duration);
      }
    };

    this.progressWrap.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      activePointerId = event.pointerId;
      this.isSeeking = true;
      this.progressWrap.classList.add("is-seeking");
      this.progressWrap.setPointerCapture(event.pointerId);
      previewRatio(ratioFromClientX(event.clientX));
    });

    this.progressWrap.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointerId) return;
      previewRatio(ratioFromClientX(event.clientX));
    });

    const endSeek = (event: PointerEvent, commit: boolean): void => {
      if (event.pointerId !== activePointerId) return;
      activePointerId = null;
      this.isSeeking = false;
      this.progressWrap.classList.remove("is-seeking");
      if (this.progressWrap.hasPointerCapture(event.pointerId)) {
        this.progressWrap.releasePointerCapture(event.pointerId);
      }
      if (commit && Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.audio.currentTime = this.seekRatio * this.audio.duration;
      }
    };

    this.progressWrap.addEventListener("pointerup", (event) => endSeek(event, true));
    this.progressWrap.addEventListener("pointercancel", (event) => endSeek(event, false));

    this.progressWrap.addEventListener("keydown", (event) => {
      if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
      }
    });
  }

  private bindVolumeSlider(): void {
    let activePointerId: number | null = null;

    const updateFromClientY = (clientY: number): void => {
      const rect = this.volumeTrack.getBoundingClientRect();
      if (rect.height <= 0) return;
      const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
      this.setVolume(ratio);
    };

    this.volumePopover.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopPropagation();
      activePointerId = event.pointerId;
      this.volumeWrap.classList.add("is-dragging");
      this.volumePopover.setPointerCapture(event.pointerId);
      updateFromClientY(event.clientY);
    });

    this.volumePopover.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointerId) return;
      updateFromClientY(event.clientY);
    });

    const endDrag = (event: PointerEvent): void => {
      if (event.pointerId !== activePointerId) return;
      activePointerId = null;
      this.volumeWrap.classList.remove("is-dragging");
      if (this.volumePopover.hasPointerCapture(event.pointerId)) {
        this.volumePopover.releasePointerCapture(event.pointerId);
      }
    };

    this.volumePopover.addEventListener("pointerup", endDrag);
    this.volumePopover.addEventListener("pointercancel", endDrag);

    this.volumePopover.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.setVolume(this.audio.volume + 0.1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.setVolume(this.audio.volume - 0.1);
      }
    });
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener("play", () => {
      this.consecutiveErrors = 0;
      this.syncPlayUI(true);
    });

    this.audio.addEventListener("pause", () => {
      this.syncPlayUI(false);
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.durationEl.textContent = formatTime(this.audio.duration);
    });

    this.audio.addEventListener("timeupdate", () => {
      if (this.isSeeking) return;
      const duration = this.audio.duration;
      const current = this.audio.currentTime;
      this.currentTimeEl.textContent = formatTime(current);
      if (Number.isFinite(duration) && duration > 0) {
        const percent = Math.min(100, Math.max(0, (current / duration) * 100));
        this.progressPlayed.style.width = `${percent.toFixed(2)}%`;
        this.progressWrap.setAttribute("aria-valuenow", String(Math.round(percent)));
      }
    });

    this.audio.addEventListener("progress", () => {
      const duration = this.audio.duration;
      if (!Number.isFinite(duration) || duration <= 0 || this.audio.buffered.length === 0) return;
      const end = this.audio.buffered.end(this.audio.buffered.length - 1);
      const percent = Math.min(100, Math.max(0, (end / duration) * 100));
      this.progressBuffered.style.width = `${percent.toFixed(2)}%`;
    });

    this.audio.addEventListener("ended", () => {
      if (this.playMode === "single") {
        this.audio.currentTime = 0;
        void this.playAudio();
        return;
      }
      this.stepTrack(1, true);
    });

    this.audio.addEventListener("error", () => {
      this.syncPlayUI(false);
      if (this.tracks.length <= 1) return;
      this.consecutiveErrors += 1;
      if (this.consecutiveErrors < Math.min(this.tracks.length, 5)) {
        this.stepTrack(1, true);
      }
    });
  }

  private bindMediaSession(): void {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler("play", () => void this.playAudio());
      navigator.mediaSession.setActionHandler("pause", () => this.audio.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => this.stepTrack(-1, true));
      navigator.mediaSession.setActionHandler("nexttrack", () => this.stepTrack(1, true));
    } catch {
      // Ignore unsupported MediaSession action handlers.
    }
  }

  private syncMediaSessionMetadata(track: MetingTrack): void {
    if (!("mediaSession" in navigator) || typeof window.MediaMetadata !== "function") return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: track.cover ? [{ src: track.cover }] : [],
      });
    } catch {
      // Ignore MediaMetadata errors.
    }
  }

  private setVolume(next: number): void {
    const clamped = Math.min(1, Math.max(0, next));
    this.audio.volume = clamped;
    if (clamped > 0.001) this.lastNonZeroVolume = clamped;
    writeStoredVolume(clamped);
    this.syncVolumeUI();
  }

  private syncVolumeUI(): void {
    const volume = this.audio.volume;
    const percent = Math.round(volume * 100);
    this.volumeFill.style.height = `${percent}%`;
    this.volumePopover.setAttribute("aria-valuenow", String(percent));
    this.volumeBtn.innerHTML = volume <= 0.001
      ? ICONS.volumeMute
      : volume < 0.5
        ? ICONS.volumeLow
        : ICONS.volumeHigh;
  }

  private syncModeUI(): void {
    const label = MODE_LABELS[this.playMode];
    this.modeBtn.title = label;
    this.modeBtn.setAttribute("aria-label", label);
    this.modeBtn.classList.toggle("is-active", this.playMode !== "list");
    this.modeBtn.innerHTML = this.playMode === "shuffle"
      ? ICONS.modeShuffle
      : this.playMode === "single"
        ? ICONS.modeSingle
        : ICONS.modeList;
  }

  private syncPlayUI(playing: boolean): void {
    setWidgetPlaying(playing);
    this.playBtn.innerHTML = playing ? ICONS.pause : ICONS.play;
    this.playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    this.playBtn.title = playing ? "Pause" : "Play";
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    }
  }

  private loadTrack(index: number, shouldPlay: boolean): void {
    const count = this.tracks.length;
    if (count === 0) return;

    this.currentIndex = ((index % count) + count) % count;
    const track = this.tracks[this.currentIndex];

    this.titleEl.textContent = track.title;
    this.artistEl.textContent = track.artist;
    this.currentTimeEl.textContent = "00:00";
    this.durationEl.textContent = "00:00";
    this.progressPlayed.style.width = "0%";
    this.progressBuffered.style.width = "0%";
    this.progressWrap.setAttribute("aria-valuenow", "0");

    if (track.cover) {
      this.coverImg.hidden = false;
      this.coverImg.src = track.cover;
      this.coverImg.onerror = () => {
        this.coverImg.hidden = true;
      };
    } else {
      this.coverImg.hidden = true;
      this.coverImg.removeAttribute("src");
    }

    this.listItems.forEach((item, idx) => {
      item.classList.toggle("is-active", idx === this.currentIndex);
    });
    if (this.isPlaylistOpen) {
      this.listItems[this.currentIndex]?.scrollIntoView({ block: "nearest" });
    }

    this.audio.src = track.url;
    this.syncMediaSessionMetadata(track);

    if (shouldPlay) {
      void this.playAudio();
    } else {
      this.syncPlayUI(false);
    }
  }

  private stepTrack(delta: 1 | -1, shouldPlay: boolean): void {
    const count = this.tracks.length;
    if (count === 0) return;

    if (this.playMode === "shuffle" && count > 1) {
      let nextIndex = this.currentIndex;
      while (nextIndex === this.currentIndex) {
        nextIndex = Math.floor(Math.random() * count);
      }
      this.loadTrack(nextIndex, shouldPlay);
      return;
    }

    this.loadTrack(this.currentIndex + delta, shouldPlay);
  }

  private async playAudio(): Promise<void> {
    try {
      await this.audio.play();
    } catch {
      this.syncPlayUI(false);
    }
  }

  private togglePlay(): void {
    if (this.audio.paused) {
      this.consecutiveErrors = 0;
      void this.playAudio();
    } else {
      this.audio.pause();
    }
  }
}

async function mountPlayer(container: HTMLElement, config: MusicConfig): Promise<void> {
  if (loadState === "loading" || loadState === "ready") return;

  loadState = "loading";
  container.hidden = true;
  updateStatus("loading", "Loading playlist...");

  const apiUrl = config.api || "https://api.injahow.cn/meting/";
  const urls = Array.isArray(config.urls) ? config.urls : [];
  const tracksByList = await Promise.all(urls.map(async (url) => {
    const request = parseMusicUrl(url);
    return request ? fetchMetingTracks(request, apiUrl) : [];
  }));

  const tracks = tracksByList.flat();
  if (!container.isConnected || tracks.length === 0) {
    loadState = "error";
    updateStatus("error", "Failed to load playlist.");
    return;
  }

  updateStatus("hidden");
  container.hidden = false;
  loadState = "ready";

  new NativeMusicPlayer(
    container,
    tracks,
    config.autoplay ?? config.autoPlay ?? false,
  );
}

export async function initMusicPlayer(): Promise<void> {
  const container = document.getElementById("music-player-body");
  const button = document.getElementById("music-player-widget");
  const config = readMusicConfig();
  if (!container || !button || !config?.enabled) return;

  installPanelHandlers(() => {
    void mountPlayer(container, config);
  });

  await mountPlayer(container, config);
}
