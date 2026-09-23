interface SwupVisit {
  to?: {
    document?: Document;
  };
}

interface SwupHooks {
  on(name: "content:replace", callback: (visit: SwupVisit) => void): void;
  on(name: "page:view", callback: () => void): void;
}

interface SwupInstance {
  hooks: SwupHooks;
}

interface SwupOptions {
  containers: string[];
  plugins: object[];
}

type SwupWindow = Window & {
  Swup?: new (options: SwupOptions) => SwupInstance;
  SwupScriptsPlugin?: new (options: Record<string, boolean>) => object;
  SwupBodyClassPlugin?: new () => object;
  SwupHeadPlugin?: new () => object;
  __anfsitySwup?: SwupInstance;
};

type PageInitializer = () => void;

function syncDocumentMetadata(visit: SwupVisit): void {
  const nextDocument = visit.to?.document;
  if (!nextDocument) return;

  document.body.className = nextDocument.body.className;
  document.title = nextDocument.title;
}

export function initSwup(onPageView: PageInitializer): void {
  const swupWindow = window as SwupWindow;
  const Swup = swupWindow.Swup;
  if (!Swup || swupWindow.__anfsitySwup) return;

  const plugins: object[] = [];
  if (swupWindow.SwupScriptsPlugin) {
    plugins.push(new swupWindow.SwupScriptsPlugin({ head: true, body: true, optin: false }));
  }
  if (swupWindow.SwupBodyClassPlugin) plugins.push(new swupWindow.SwupBodyClassPlugin());
  if (swupWindow.SwupHeadPlugin) plugins.push(new swupWindow.SwupHeadPlugin());

  try {
    const swup = new Swup({ containers: ["#swup"], plugins });
    swupWindow.__anfsitySwup = swup;
    swup.hooks.on("content:replace", syncDocumentMetadata);
    swup.hooks.on("page:view", () => {
      const stackWindow = window as Window & { Stack?: { init?: () => void } };
      stackWindow.Stack?.init?.();
      onPageView();
    });
  } catch (error) {
    console.error("Swup initialization failed:", error);
  }
}
