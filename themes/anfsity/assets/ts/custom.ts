import { initBackToTop } from "./custom/backToTop";
import { initCodeBlockToggles } from "./custom/codeBlocks";
import { initDynamicQuote } from "./custom/dynamicQuote";
import { initFluentGallery } from "./custom/fluentGallery";
import { initLightbox } from "./custom/lightbox";
import { renderPageMath } from "./custom/math";
import { initMermaid } from "./custom/mermaid";
import { initMusicPlayer } from "./custom/musicPlayer";
import { initSubsectionScroll } from "./custom/subsectionScroll";
import { initSwup } from "./custom/swup";
import { initTableOfContents } from "./custom/toc";

declare global {
  interface Window {
    __anfsityCustomInitialized?: boolean;
  }
}

function initPageFeatures(): void {
  initTableOfContents();
  initCodeBlockToggles();
  initSubsectionScroll();
  initFluentGallery();
  initDynamicQuote();
  void initMermaid();
  void renderPageMath();
}

function initCustomFeatures(): void {
  if (window.__anfsityCustomInitialized) return;
  window.__anfsityCustomInitialized = true;

  initBackToTop();
  initLightbox();
  void initMusicPlayer();
  initPageFeatures();
  initSwup(initPageFeatures);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomFeatures, { once: true });
} else {
  initCustomFeatures();
}
