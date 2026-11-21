interface MathDelimiter {
  left: string;
  right: string;
  display: boolean;
}

type MathRenderer = (element: HTMLElement, options: {
  delimiters: MathDelimiter[];
  ignoredClasses: string[];
}) => void;

type MathWindow = Window & {
  katex?: unknown;
  renderMathInElement?: MathRenderer;
};

const katexScriptSelector = 'script[src*="katex"][src*="katex.min.js"]';
const autoRenderSelector = 'script[src*="katex"][src*="auto-render"]';
const katexStyleSelector = 'link[rel="stylesheet"][href*="katex"]';
let rendererReady: Promise<MathRenderer | null> | null = null;

function ensureStylesheet(sourceLink: HTMLLinkElement | null): void {
  if (!sourceLink?.href) return;
  if (document.head.querySelector(`link[rel="stylesheet"][href="${sourceLink.href}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = sourceLink.href;
  if (sourceLink.integrity) link.integrity = sourceLink.integrity;
  if (sourceLink.crossOrigin) link.crossOrigin = sourceLink.crossOrigin;
  document.head.appendChild(link);
}

function loadScriptFromSource(sourceScript: HTMLScriptElement | null, isReady: () => boolean): Promise<boolean> {
  if (isReady()) return Promise.resolve(true);
  if (!sourceScript?.src) return Promise.resolve(false);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = sourceScript.src;
    script.async = false;
    script.setAttribute("data-swup-ignore-script", "");
    if (sourceScript.integrity) script.integrity = sourceScript.integrity;
    if (sourceScript.crossOrigin) script.crossOrigin = sourceScript.crossOrigin;
    script.addEventListener("load", () => resolve(isReady()), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    document.head.appendChild(script);
  });
}

function ensureMathRenderer(): Promise<MathRenderer | null> {
  ensureStylesheet(document.querySelector<HTMLLinkElement>(katexStyleSelector));

  const mathWindow = window as MathWindow;
  if (mathWindow.katex && mathWindow.renderMathInElement) {
    return Promise.resolve(mathWindow.renderMathInElement);
  }
  if (rendererReady) return rendererReady;

  const katexScript = document.querySelector<HTMLScriptElement>(katexScriptSelector);
  const autoRenderScript = document.querySelector<HTMLScriptElement>(autoRenderSelector);
  if (!katexScript && !autoRenderScript) return Promise.resolve(null);

  const pendingRenderer = (async (): Promise<MathRenderer | null> => {
    const katexLoaded = await loadScriptFromSource(katexScript, () => Boolean(mathWindow.katex));
    if (!katexLoaded) return null;

    const autoRenderLoaded = await loadScriptFromSource(
      autoRenderScript,
      () => Boolean(mathWindow.renderMathInElement),
    );
    return autoRenderLoaded ? (mathWindow.renderMathInElement ?? null) : null;
  })().then((renderer) => {
    if (!renderer) rendererReady = null;
    return renderer;
  });

  rendererReady = pendingRenderer;
  return pendingRenderer;
}

export async function renderPageMath(): Promise<void> {
  const renderer = await ensureMathRenderer();
  if (!renderer) return;

  const options = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ],
    ignoredClasses: ["gist"],
  };

  [".main-article", ".widget--toc"].forEach((selector) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) renderer(element, options);
  });
}
