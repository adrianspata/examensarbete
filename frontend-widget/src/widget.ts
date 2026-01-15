export interface WidgetConfig {
  apiBaseUrl: string; // e.g. "http://localhost:4000"
  containerId: string;
  sessionId: string;
  limit?: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
}

type AnyProduct = Product & { image_url?: string | null };

interface RecommendationsResponse {
  items: AnyProduct[];
  strategy?: string;
  reason?: string;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function fetchRecommendations(
  baseUrl: string,
  sessionId: string,
  limit?: number
): Promise<RecommendationsResponse> {
  const params = new URLSearchParams({ sessionId });
  if (limit) params.set("limit", String(limit));

  return fetchJSON<RecommendationsResponse>(
    `${baseUrl}/recommendations?${params.toString()}`
  );
}

async function fetchFallbackProducts(
  baseUrl: string,
  limit?: number
): Promise<AnyProduct[]> {
  const products = await fetchJSON<AnyProduct[]>(`${baseUrl}/products`);
  if (limit) return products.slice(0, limit);
  return products;
}

async function sendEvent(
  baseUrl: string,
  sessionId: string,
  productId: number,
  eventType: "click" | "view" | "add_to_cart"
): Promise<void> {
  try {
    await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        productId,
        eventType,
        metadata: { source: "widget" },
      }),
    });
  } catch {
    // silent fail
  }
}

function resolveImageSrc(apiBaseUrl: string, url: string): string {
  // absolute already
  if (/^https?:\/\//i.test(url)) return url;

  // if it's a relative path like "/images/..."
  if (url.startsWith("/")) return `${apiBaseUrl}${url}`;

  // fallback: treat as relative to apiBaseUrl
  return `${apiBaseUrl}/${url}`;
}

function renderProducts(
  container: HTMLElement,
  products: AnyProduct[],
  opts: { baseUrl: string; sessionId: string }
): void {
  container.innerHTML = "";

  if (!products.length) {
    container.appendChild(
      el("div", "ppfe-widget-empty", "Inga rekommendationer tillgängliga just nu.")
    );
    return;
  }

  const list = el("div", "ppfe-widget-grid");

  products.forEach((product) => {
    const card = el("article", "ppfe-widget-card");

    const imgArea = el("div", "ppfe-widget-image");

    const rawImage =
      product.imageUrl ?? (product.image_url ?? null);

    if (rawImage) {
      const img = el("img", "ppfe-widget-image-tag") as HTMLImageElement;
      img.src = resolveImageSrc(opts.baseUrl, rawImage);
      img.alt = product.name;
      img.loading = "lazy";
      imgArea.appendChild(img);
    } else {
      imgArea.appendChild(
        el("div", "ppfe-widget-image-fallback", product.name.charAt(0).toUpperCase())
      );
    }

    const body = el("div", "ppfe-widget-body");
    body.appendChild(el("div", "ppfe-widget-sku", product.sku));
    body.appendChild(el("div", "ppfe-widget-name", product.name));

    const meta = el("div", "ppfe-widget-meta");
    if (product.category) {
      meta.appendChild(el("span", "ppfe-widget-pill", product.category.toLowerCase()));
    }
    if (product.price != null) {
      meta.appendChild(el("span", "ppfe-widget-price", `${product.price.toFixed(0)} kr`));
    }
    body.appendChild(meta);

    const btn = el("button", "ppfe-widget-button", "Visa produkt");
    btn.addEventListener("click", () => {
      sendEvent(opts.baseUrl, opts.sessionId, product.id, "click");
    });

    card.appendChild(imgArea);
    card.appendChild(body);
    card.appendChild(btn);
    list.appendChild(card);
  });

  container.appendChild(list);
}

export async function initWidget(config: WidgetConfig): Promise<void> {
  const { apiBaseUrl, containerId, sessionId, limit } = config;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[PPFE] Hittar ingen container med id="${containerId}". Avbryter render.`);
    return;
  }

  container.classList.add("ppfe-widget-root");
  container.innerHTML = "";

  const header = el("div", "ppfe-widget-header");
  header.appendChild(el("div", "ppfe-widget-title", "Rekommenderat för dig"));
  header.appendChild(
    el("div", "ppfe-widget-subtitle")
  );

  const content = el("div", "ppfe-widget-content");
  const state = el("div", "ppfe-widget-state", "Laddar rekommendationer...");

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(state);

  try {
    let recs: AnyProduct[] = [];

    try {
      const res = await fetchRecommendations(apiBaseUrl, sessionId, limit);
      recs = res.items;
    } catch {
      recs = await fetchFallbackProducts(apiBaseUrl, limit);
    }

    renderProducts(content, recs, { baseUrl: apiBaseUrl, sessionId });
    state.textContent = "";
  } catch (err) {
    console.error("[PPFE] Misslyckades ladda widget", err);
    state.textContent = "Kunde inte hämta rekommendationer just nu. Försök igen senare.";
  }
}
