interface MermaidApi {
  initialize(options: { startOnLoad: boolean; theme: string }): void;
  run(options: { nodes: Element[] }): Promise<void>;
}

interface PanZoomOptions {
  zoomEnabled: boolean;
  fit: boolean;
  center: boolean;
  contain: boolean;
  minZoom: number;
  maxZoom: number;
}

type PanZoom = (svg: SVGElement, options: PanZoomOptions) => unknown;
type MermaidWindow = Window & { mermaid?: MermaidApi; svgPanZoom?: PanZoom };

const mermaidScriptUrl = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
const panZoomScriptUrl = "https://cdn.jsdelivr.net/npm/svg-pan-zoom@3/dist/svg-pan-zoom.min.js";
const renderedNodes = new WeakSet<Element>();
const initializedSvgs = new WeakSet<SVGElement>();
let librariesReady: Promise<boolean> | null = null;

function loadScript(url: string, isReady: () => boolean): Promise<boolean> {
  if (isReady()) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.addEventListener("load", () => resolve(isReady()), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    document.head.appendChild(script);
  });
}

function loadLibraries(): Promise<boolean> {
  if (librariesReady) return librariesReady;

  const pending = Promise.all([
    loadScript(mermaidScriptUrl, () => Boolean((window as MermaidWindow).mermaid)),
    loadScript(panZoomScriptUrl, () => Boolean((window as MermaidWindow).svgPanZoom)),
  ]).then(([mermaidReady, panZoomReady]) => {
    const ready = mermaidReady && panZoomReady;
    if (!ready) librariesReady = null;
    return ready;
  });

  librariesReady = pending;
  return pending;
}

export async function initMermaid(): Promise<void> {
  const nodes = Array.from(document.querySelectorAll(".mermaid"))
    .filter((node) => !renderedNodes.has(node));
  if (nodes.length === 0 || !(await loadLibraries())) return;

  const mermaidWindow = window as MermaidWindow;
  const mermaid = mermaidWindow.mermaid;
  const panZoom = mermaidWindow.svgPanZoom;
  if (!mermaid || !panZoom) return;

  try {
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });
    await mermaid.run({ nodes });
    nodes.forEach((node) => renderedNodes.add(node));

    nodes.forEach((node) => {
      const container = node.closest<HTMLElement>(".mermaid-container");
      const svg = container?.querySelector<SVGElement>("svg");
      if (!svg || initializedSvgs.has(svg)) return;

      panZoom(svg, {
        zoomEnabled: true,
        fit: false,
        center: true,
        contain: true,
        minZoom: 0.2,
        maxZoom: 10,
      });
      initializedSvgs.add(svg);
    });
  } catch (error) {
    console.error("Could not initialize Mermaid diagram:", error);
  }
}
