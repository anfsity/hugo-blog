interface Quote {
  content: string;
  source?: string;
}

interface QuoteProvider {
  name: string;
  url: string;
  parse(payload: unknown): Quote | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

const quoteProviders: QuoteProvider[] = [
  {
    name: "TheQuotesHub",
    url: "https://thequoteshub.com/api/",
    parse: (payload) => {
      const content = asText(asRecord(payload)?.text);
      if (!content) return null;
      return { content, source: asText(asRecord(payload)?.author) ?? undefined };
    },
  },
  {
    name: "HitoKoto",
    url: "https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g",
    parse: (payload) => {
      const record = asRecord(payload);
      const content = asText(record?.hitokoto);
      if (!content) return null;
      return { content, source: asText(record?.from_who) ?? asText(record?.from) ?? undefined };
    },
  },
  {
    name: "Anime Quotes API",
    url: "https://yurippe.vercel.app/api/quotes?random=1",
    parse: (payload) => {
      const record = Array.isArray(payload) ? asRecord(payload[0]) : null;
      const content = asText(record?.quote);
      if (!content) return null;
      const character = asText(record?.character);
      const show = asText(record?.show);
      const source = character && show
        ? character + " (" + show + ")"
        : character ?? show ?? undefined;
      return { content, source };
    },
  },
];

let activeRequest: AbortController | null = null;

function renderQuote(element: HTMLElement, quote: Quote): void {
  const content = document.createElement("p");
  content.textContent = quote.content;
  element.replaceChildren(content);

  if (quote.source) {
    const source = document.createElement("cite");
    source.textContent = quote.source;
    element.appendChild(source);
  }
}

export function initDynamicQuote(): void {
  const element = document.getElementById("dynamic-quote");
  if (!element || element.dataset.initialized === "true") return;
  element.dataset.initialized = "true";

  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  const provider = quoteProviders[Math.floor(Math.random() * quoteProviders.length)];

  fetch(provider.url, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error("Quote request failed: " + response.status);
      return response.json() as Promise<unknown>;
    })
    .then((payload) => {
      const quote = provider.parse(payload);
      if (!quote) throw new Error("Invalid response from " + provider.name);
      renderQuote(element, quote);
    })
    .catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Quote request failed:", error);
      element.textContent = "今天的会长也很可爱";
    });
}
