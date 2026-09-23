const imageSelector = ".article-content img:not(.no-lightbox), .fluent-card img";
const excludedImageAncestors = "a, button, .highlight, .chroma, .copy-code, .icon, nav, header";

interface LightboxElements {
  root: HTMLElement;
  image: HTMLImageElement;
  close: HTMLElement;
  previous: HTMLElement;
  next: HTMLElement;
  backdrop: HTMLElement;
}

function findLightboxElements(): LightboxElements | null {
  const root = document.getElementById("elegant-lightbox");
  const image = document.getElementById("lightbox-img");
  const close = document.getElementById("lightbox-close");
  const previous = document.getElementById("lightbox-prev");
  const next = document.getElementById("lightbox-next");
  const backdrop = root?.querySelector<HTMLElement>(".lightbox-backdrop");

  if (!(root instanceof HTMLElement) || !(image instanceof HTMLImageElement) ||
      !close || !previous || !next || !backdrop) return null;

  return { root, image, close, previous, next, backdrop };
}

function isLightboxImage(image: HTMLImageElement): boolean {
  if (!image.matches(imageSelector) || image.closest(excludedImageAncestors)) return false;
  if (image.clientWidth > 0 && image.clientWidth < 40) return false;
  if (image.naturalWidth > 0 && image.naturalWidth < 40) return false;
  return true;
}

function findImages(): HTMLImageElement[] {
  return Array.from(document.querySelectorAll<HTMLImageElement>(imageSelector)).filter(isLightboxImage);
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

  elements.image.loading = "eager";
  elements.image.decoding = "async";
  elements.image.setAttribute("fetchpriority", "high");

  const cancelFullResolutionLoad = (): void => {
    imageRequestVersion += 1;
    pendingFullResolutionImage?.removeAttribute("src");
    pendingFullResolutionImage = null;
  };

  const close = (): void => {
    cancelFullResolutionLoad();
    elements.root.classList.remove("active");
    elements.root.inert = true;
    elements.root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    previousFocus?.focus();
    window.setTimeout(() => {
      if (!elements.root.classList.contains("active")) elements.image.removeAttribute("src");
    }, 200);
  };

  const showImage = (index: number): void => {
    if (currentImages.length === 0) return;
    cancelFullResolutionLoad();
    currentIndex = (index + currentImages.length) % currentImages.length;
    const image = currentImages[currentIndex];
    const previewUrl = image.currentSrc || image.src;
    elements.image.src = previewUrl;
    elements.image.alt = image.alt;

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
      }
    }).catch(() => undefined).finally(() => {
      if (pendingFullResolutionImage === fullResolutionImage) pendingFullResolutionImage = null;
    });
  };

  const showPrevious = (event?: Event): void => {
    event?.stopPropagation();
    showImage(currentIndex - 1);
  };

  const showNext = (event?: Event): void => {
    event?.stopPropagation();
    showImage(currentIndex + 1);
  };

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    const clickedImage = event.target;
    if (!isLightboxImage(clickedImage)) return;

    currentImages = findImages();

    const index = currentImages.indexOf(clickedImage);
    if (index < 0) return;

    event.preventDefault();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    elements.root.classList.add("active");
    elements.root.inert = false;
    elements.root.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    elements.root.focus();
    showImage(index);
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
  elements.previous.addEventListener("click", showPrevious);
  elements.next.addEventListener("click", showNext);
  elements.image.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("keydown", (event) => {
    if (!elements.root.classList.contains("active")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") showPrevious();
    if (event.key === "ArrowRight") showNext();
  });
}
