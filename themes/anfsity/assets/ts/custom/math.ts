interface MathDelimiter {
  left: string;
  right: string;
  display: boolean;
}

type MathRenderer = (element: HTMLElement, options: {
  delimiters: MathDelimiter[];
  ignoredClasses: string[];
}) => void;

type MathWindow = Window & { renderMathInElement?: MathRenderer };

const autoRenderSelector = 'script[src*="katex"][src*="auto-render"]';
let rendererReady: Promise<MathRenderer | null> | null = null;

function waitForMathRenderer(): Promise<MathRenderer | null> {
  const currentRenderer = (window as MathWindow).renderMathInElement;
  if (currentRenderer) return Promise.resolve(currentRenderer);
  if (rendererReady) return rendererReady;

  const script = document.querySelector<HTMLScriptElement>(autoRenderSelector);
  if (!script) return Promise.resolve(null);

  const pendingRenderer = new Promise<MathRenderer | null>((resolve) => {
    const onLoad = () => resolve((window as MathWindow).renderMathInElement ?? null);
    const onError = () => resolve(null);
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
  }).then((renderer) => {
    if (!renderer) rendererReady = null;
    return renderer;
  });

  rendererReady = pendingRenderer;
  return pendingRenderer;
}

export async function renderPageMath(): Promise<void> {
  const renderer = await waitForMathRenderer();
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
