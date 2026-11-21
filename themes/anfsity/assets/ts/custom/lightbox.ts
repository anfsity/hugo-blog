const imageSelector = ".article-content img:not(.no-lightbox), .fluent-card img";
const excludedImageAncestors = "button, .highlight, .chroma, .copy-code, .icon, nav, header";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const CLICK_ZOOM_SCALE = 2;
const ZOOM_STEPS = [1, 1.5, 2, 3, 4, 6];
const DRAG_THRESHOLD_PX = 5;
const SWIPE_X_THRESHOLD_PX = 56;
const SWIPE_Y_THRESHOLD_PX = 96;

declare global {
  interface Window {
    __anfsityLightbox?: {
      openImage(image: HTMLImageElement): boolean;
    };
  }
}

interface LightboxElements {
  root: HTMLElement;
  backdrop: HTMLElement;
  stage: HTMLElement;
  content: HTMLElement;
  image: HTMLImageElement;
  close: HTMLButtonElement;
  previous: HTMLButtonElement;
  next: HTMLButtonElement;
  counter: HTMLElement;
  counterIndex: HTMLElement;
  counterTotal: HTMLElement;
  zoomOut: HTMLButtonElement;
  zoomReset: HTMLButtonElement;
  zoomIn: HTMLButtonElement;
  openOriginal: HTMLAnchorElement;
  captionBar: HTMLElement;
  caption: HTMLElement;
}

function findLightboxElements(): LightboxElements | null {
  const root = document.getElementById("elegant-lightbox");
  const backdrop = root?.querySelector<HTMLElement>(".lightbox-backdrop");
  const stage = document.getElementById("lightbox-stage");
  const content = document.getElementById("lightbox-content");
  const image = document.getElementById("lightbox-img");
  const close = document.getElementById("lightbox-close");
  const previous = document.getElementById("lightbox-prev");
  const next = document.getElementById("lightbox-next");
  const counter = document.getElementById("lightbox-counter");
  const counterIndex = document.getElementById("lightbox-index");
  const counterTotal = document.getElementById("lightbox-total");
  const zoomOut = document.getElementById("lightbox-zoom-out");
  const zoomReset = document.getElementById("lightbox-zoom-reset");
  const zoomIn = document.getElementById("lightbox-zoom-in");
  const openOriginal = document.getElementById("lightbox-open-original");
  const captionBar = document.getElementById("lightbox-caption-bar");
  const caption = document.getElementById("lightbox-caption");

  if (
    !(root instanceof HTMLElement) ||
    !backdrop ||
    !(stage instanceof HTMLElement) ||
    !(content instanceof HTMLElement) ||
    !(image instanceof HTMLImageElement) ||
    !(close instanceof HTMLButtonElement) ||
    !(previous instanceof HTMLButtonElement) ||
    !(next instanceof HTMLButtonElement) ||
    !(counter instanceof HTMLElement) ||
    !(counterIndex instanceof HTMLElement) ||
    !(counterTotal instanceof HTMLElement) ||
    !(zoomOut instanceof HTMLButtonElement) ||
    !(zoomReset instanceof HTMLButtonElement) ||
    !(zoomIn instanceof HTMLButtonElement) ||
    !(openOriginal instanceof HTMLAnchorElement) ||
    !(captionBar instanceof HTMLElement) ||
    !(caption instanceof HTMLElement)
  ) {
    return null;
  }

  return {
    root,
    backdrop,
    stage,
    content,
    image,
    close,
    previous,
    next,
    counter,
    counterIndex,
    counterTotal,
    zoomOut,
    zoomReset,
    zoomIn,
    openOriginal,
    captionBar,
    caption,
  };
}

function isLightboxImage(image: HTMLImageElement): boolean {
  if (!image.matches(imageSelector) || image.closest(excludedImageAncestors)) return false;
  if (image.closest("a") && !image.closest("figure.gallery-image")) return false;
  if (image.clientWidth > 0 && image.clientWidth < 40) return false;
  if (image.naturalWidth > 0 && image.naturalWidth < 40) return false;
  return true;
}

function findImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>(imageSelector)).filter(isLightboxImage);
}

function getImageCaption(image: HTMLImageElement): string {
  const explicitCaption = image.dataset.caption?.trim();
  if (explicitCaption) return explicitCaption;

  const figcaption = image.closest("figure")?.querySelector("figcaption")?.textContent?.trim();
  if (figcaption) return figcaption;

  const alt = image.alt.trim();
  if (!alt || alt === "image" || alt === "Artwork" || /^https?:\/\//i.test(alt)) {
    return "";
  }
  return alt;
}

function formatCounter(value: number, total: number): string {
  const digits = Math.max(2, String(total).length);
  return String(value).padStart(digits, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function initLightbox(): void {
  const elements = findLightboxElements();
  if (!elements || elements.root.dataset.initialized === "true") return;
  elements.root.dataset.initialized = "true";

  let currentImages: HTMLImageElement[] = [];
  let currentIndex = 0;
  let previousFocus: HTMLElement | null = null;
  let imageRequestVersion = 0;
  let pendingFullResolutionImage: HTMLImageElement | null = null;
  let clearImageTimer: number | null = null;
  let instantTransformFrame: number | null = null;

  let scale = MIN_SCALE;
  let panX = 0;
  let panY = 0;

  let activePointerId: number | null = null;
  let activePointerType = "mouse";
  let pointerStartX = 0;
  let pointerStartY = 0;
  let panStartX = 0;
  let panStartY = 0;
  let pointerMoved = false;
  let suppressStageClose = false;
  let savedHtmlOverflow = "";
  let savedHtmlPaddingRight = "";
  let savedBodyOverflow = "";
  let scrollLocked = false;

  const lockPageScroll = (): void => {
    if (scrollLocked) return;
    scrollLocked = true;
    const html = document.documentElement;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    savedHtmlOverflow = html.style.overflow;
    savedHtmlPaddingRight = html.style.paddingRight;
    savedBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = parseFloat(window.getComputedStyle(html).paddingRight) || 0;
      html.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  };

  const unlockPageScroll = (): void => {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.documentElement.style.paddingRight = savedHtmlPaddingRight;
    document.body.style.overflow = savedBodyOverflow;
  };

  const getNextZoomStep = (direction: 1 | -1): number => {
    if (direction > 0) {
      return ZOOM_STEPS.find((step) => step > scale + 0.05) ?? MAX_SCALE;
    }
    for (let i = ZOOM_STEPS.length - 1; i >= 0; i -= 1) {
      if (ZOOM_STEPS[i] < scale - 0.05) return ZOOM_STEPS[i];
    }
    return MIN_SCALE;
  };

  elements.image.loading = "eager";
  elements.image.decoding = "async";
  elements.image.setAttribute("fetchpriority", "high");

  const setInstantTransform = (instant: boolean): void => {
    if (instantTransformFrame !== null) {
      window.cancelAnimationFrame(instantTransformFrame);
      instantTransformFrame = null;
    }

    if (instant) {
      elements.root.dataset.instantTransform = "true";
      instantTransformFrame = window.requestAnimationFrame(() => {
        instantTransformFrame = null;
        delete elements.root.dataset.instantTransform;
      });
    } else {
      delete elements.root.dataset.instantTransform;
    }
  };

  const clampPan = (nextX: number, nextY: number, nextScale: number): { x: number; y: number } => {
    if (nextScale <= MIN_SCALE + 0.001) return { x: 0, y: 0 };

    const scaledWidth = elements.image.offsetWidth * nextScale;
    const scaledHeight = elements.image.offsetHeight * nextScale;
    const maxX = scaledWidth > window.innerWidth ? (scaledWidth - window.innerWidth) / 2 + 24 : 0;
    const maxY = scaledHeight > window.innerHeight ? (scaledHeight - window.innerHeight) / 2 + 24 : 0;

    return {
      x: clamp(nextX, -maxX, maxX),
      y: clamp(nextY, -maxY, maxY),
    };
  };

  const applyTransform = (instant = false): void => {
    if (instant) setInstantTransform(true);

    const isZoomed = scale > MIN_SCALE + 0.005;
    elements.image.style.setProperty("--lb-x", `${panX.toFixed(1)}px`);
    elements.image.style.setProperty("--lb-y", `${panY.toFixed(1)}px`);
    elements.image.style.setProperty("--lb-scale", scale.toFixed(3));

    elements.root.dataset.zoomed = isZoomed ? "true" : "false";
    elements.zoomReset.textContent = `${Math.round(scale * 100)}%`;
    elements.zoomOut.disabled = !isZoomed;
    elements.zoomIn.disabled = scale >= MAX_SCALE - 0.01;
  };

  const resetTransform = (instant = false): void => {
    scale = MIN_SCALE;
    panX = 0;
    panY = 0;
    applyTransform(instant);
  };

  const zoomTo = (
    nextScale: number,
    focalClientX?: number,
    focalClientY?: number,
    instant = false,
  ): void => {
    const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    const normalizedScale = clampedScale < MIN_SCALE + 0.02 ? MIN_SCALE : clampedScale;

    if (normalizedScale <= MIN_SCALE) {
      resetTransform(instant);
      return;
    }

    let nextPanX = panX * (normalizedScale / scale);
    let nextPanY = panY * (normalizedScale / scale);

    if (focalClientX !== undefined && focalClientY !== undefined) {
      const rect = elements.image.getBoundingClientRect();
      const originX = rect.left + rect.width / 2 - panX;
      const originY = rect.top + rect.height / 2 - panY;
      const dx = focalClientX - originX;
      const dy = focalClientY - originY;
      const ratio = normalizedScale / scale;
      nextPanX = dx - (dx - panX) * ratio;
      nextPanY = dy - (dy - panY) * ratio;
    }

    const bounded = clampPan(nextPanX, nextPanY, normalizedScale);
    scale = normalizedScale;
    panX = bounded.x;
    panY = bounded.y;
    applyTransform(instant);
  };

  const cancelFullResolutionLoad = (): void => {
    imageRequestVersion += 1;
    pendingFullResolutionImage?.removeAttribute("src");
    pendingFullResolutionImage = null;
  };

  const clearSwitchAnimation = (): void => {
    elements.content.classList.remove("is-switching-next", "is-switching-prev");
  };

  const triggerSwitchAnimation = (direction: "next" | "prev"): void => {
    clearSwitchAnimation();
    void elements.content.offsetWidth;
    elements.content.classList.add(direction === "next" ? "is-switching-next" : "is-switching-prev");
  };

  const updateMeta = (image: HTMLImageElement): void => {
    const total = currentImages.length;
    const isSingle = total <= 1;
    elements.root.dataset.single = isSingle ? "true" : "false";
    elements.counter.hidden = isSingle;
    if (!isSingle) {
      elements.counterIndex.textContent = formatCounter(currentIndex + 1, total);
      elements.counterTotal.textContent = formatCounter(total, total);
    }

    const captionText = getImageCaption(image);
    const hasCaption = captionText.length > 0;
    elements.root.dataset.hasCaption = hasCaption ? "true" : "false";
    elements.captionBar.hidden = !hasCaption;
    elements.caption.textContent = captionText;

    elements.openOriginal.href = image.src;
  };

  const close = (): void => {
    if (!elements.root.classList.contains("active")) return;

    cancelFullResolutionLoad();
    clearSwitchAnimation();
    activePointerId = null;
    delete elements.root.dataset.dragging;
    delete elements.root.dataset.loading;

    elements.root.classList.remove("active");
    elements.root.inert = true;
    elements.root.setAttribute("aria-hidden", "true");
    unlockPageScroll();
    previousFocus?.focus();
    previousFocus = null;

    if (clearImageTimer !== null) window.clearTimeout(clearImageTimer);
    clearImageTimer = window.setTimeout(() => {
      clearImageTimer = null;
      if (!elements.root.classList.contains("active")) {
        resetTransform(true);
        elements.image.removeAttribute("src");
      }
    }, 240);
  };

  const showImage = (index: number, direction?: "next" | "prev"): void => {
    if (currentImages.length === 0) return;

    cancelFullResolutionLoad();
    if (clearImageTimer !== null) {
      window.clearTimeout(clearImageTimer);
      clearImageTimer = null;
    }

    currentIndex = (index + currentImages.length) % currentImages.length;
    const image = currentImages[currentIndex];
    const previewUrl = image.currentSrc || image.src;

    resetTransform(true);
    updateMeta(image);

    if (direction) triggerSwitchAnimation(direction);
    else clearSwitchAnimation();

    elements.root.dataset.loading = "true";
    elements.image.src = previewUrl;
    elements.image.alt = image.alt || "Fullscreen view";

    if (elements.image.complete && elements.image.naturalWidth > 0) {
      delete elements.root.dataset.loading;
    }

    if (image.src === previewUrl) return;

    const requestVersion = imageRequestVersion;
    const fullResolutionImage = new Image();
    fullResolutionImage.decoding = "async";
    fullResolutionImage.setAttribute("fetchpriority", "high");
    fullResolutionImage.src = image.src;
    pendingFullResolutionImage = fullResolutionImage;

    void fullResolutionImage.decode().then(() => {
      if (requestVersion === imageRequestVersion && elements.root.classList.contains("active")) {
        elements.image.src = fullResolutionImage.src;
        delete elements.root.dataset.loading;
      }
    }).catch(() => undefined).finally(() => {
      if (pendingFullResolutionImage === fullResolutionImage) pendingFullResolutionImage = null;
    });
  };

  const openForImage = (clickedImage: HTMLImageElement): boolean => {
    if (!isLightboxImage(clickedImage)) return false;

    currentImages = findImages();
    const index = currentImages.indexOf(clickedImage);
    if (index < 0) return false;

    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockPageScroll();
    elements.root.classList.add("active");
    elements.root.inert = false;
    elements.root.setAttribute("aria-hidden", "false");
    elements.root.focus();
    showImage(index);
    return true;
  };

  const showPrevious = (event?: Event): void => {
    event?.stopPropagation();
    if (currentImages.length <= 1) return;
    showImage(currentIndex - 1, "prev");
  };

  const showNext = (event?: Event): void => {
    event?.stopPropagation();
    if (currentImages.length <= 1) return;
    showImage(currentIndex + 1, "next");
  };

  window.__anfsityLightbox = {
    openImage: openForImage,
  };

  elements.image.addEventListener("load", () => {
    delete elements.root.dataset.loading;
  });

  elements.image.addEventListener("error", () => {
    delete elements.root.dataset.loading;
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    const clickedImage = event.target;
    if (!isLightboxImage(clickedImage)) return;

    event.preventDefault();
    openForImage(clickedImage);
  });

  const markImageForZoom = (event: Event): void => {
    if (event.target instanceof HTMLImageElement && isLightboxImage(event.target)) {
      event.target.classList.add("lightbox-enabled");
    }
  };
  document.querySelectorAll<HTMLImageElement>(imageSelector).forEach((image) => {
    if (isLightboxImage(image)) image.classList.add("lightbox-enabled");
  });
  document.addEventListener("pointerover", markImageForZoom);

  elements.close.addEventListener("click", close);
  elements.backdrop.addEventListener("click", close);
  elements.stage.addEventListener("click", (event) => {
    if (suppressStageClose) {
      suppressStageClose = false;
      return;
    }
    if (event.target === elements.stage || event.target === elements.content) {
      close();
    }
  });
  elements.previous.addEventListener("click", showPrevious);
  elements.next.addEventListener("click", showNext);

  elements.zoomIn.addEventListener("click", (event) => {
    event.stopPropagation();
    zoomTo(getNextZoomStep(1));
  });

  elements.zoomOut.addEventListener("click", (event) => {
    event.stopPropagation();
    zoomTo(getNextZoomStep(-1));
  });

  elements.zoomReset.addEventListener("click", (event) => {
    event.stopPropagation();
    if (scale > MIN_SCALE + 0.005) resetTransform();
    else zoomTo(CLICK_ZOOM_SCALE);
  });

  elements.image.addEventListener("click", (event) => event.stopPropagation());

  elements.image.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (activePointerId !== null) return;

    activePointerId = event.pointerId;
    activePointerType = event.pointerType;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    panStartX = panX;
    panStartY = panY;
    pointerMoved = false;

    elements.image.setPointerCapture(event.pointerId);
    if (scale > MIN_SCALE + 0.005) {
      elements.root.dataset.dragging = "true";
    }
  });

  elements.image.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) return;

    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    if (!pointerMoved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      pointerMoved = true;
    }

    if (scale > MIN_SCALE + 0.005) {
      const bounded = clampPan(panStartX + dx, panStartY + dy, scale);
      panX = bounded.x;
      panY = bounded.y;
      applyTransform();
    }
  });

  const finishPointer = (event: PointerEvent, cancelled: boolean): void => {
    if (event.pointerId !== activePointerId) return;

    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    const wasMoved = pointerMoved;
    const pointerType = activePointerType;

    activePointerId = null;
    delete elements.root.dataset.dragging;
    if (elements.image.hasPointerCapture(event.pointerId)) {
      elements.image.releasePointerCapture(event.pointerId);
    }

    if (wasMoved) {
      suppressStageClose = true;
      window.requestAnimationFrame(() => {
        suppressStageClose = false;
      });
    }

    if (cancelled) return;

    if (!wasMoved) {
      if (scale > MIN_SCALE + 0.005) resetTransform();
      else zoomTo(CLICK_ZOOM_SCALE, event.clientX, event.clientY);
      return;
    }

    if (scale <= MIN_SCALE + 0.005 && pointerType === "touch") {
      if (Math.abs(dx) > SWIPE_X_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) showNext();
        else showPrevious();
      } else if (dy > SWIPE_Y_THRESHOLD_PX && dy > Math.abs(dx) * 1.4) {
        close();
      }
    }
  };

  elements.image.addEventListener("pointerup", (event) => finishPointer(event, false));
  elements.image.addEventListener("pointercancel", (event) => finishPointer(event, true));

  elements.root.addEventListener("wheel", (event) => {
    if (!elements.root.classList.contains("active")) return;
    event.preventDefault();

    const factor = Math.exp(-event.deltaY * 0.0022);
    const nextScale = scale * factor;
    if (nextScale < MIN_SCALE + 0.03 && event.deltaY > 0) {
      resetTransform(true);
      return;
    }
    zoomTo(nextScale, event.clientX, event.clientY, true);
  }, { passive: false });

  window.addEventListener("resize", () => {
    if (!elements.root.classList.contains("active") || scale <= MIN_SCALE + 0.005) return;
    const bounded = clampPan(panX, panY, scale);
    panX = bounded.x;
    panY = bounded.y;
    applyTransform(true);
  });

  window.addEventListener("popstate", close);

  document.addEventListener("keydown", (event) => {
    if (!elements.root.classList.contains("active")) return;
    if (event.key === "Escape") close();
    else if (event.key === "ArrowLeft") showPrevious();
    else if (event.key === "ArrowRight") showNext();
    else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(getNextZoomStep(1));
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomTo(getNextZoomStep(-1));
    } else if (event.key === "0") {
      event.preventDefault();
      resetTransform();
    }
  });
}
