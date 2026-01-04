// frontend-widget/src/widget.ts

export interface WidgetConfig {
  apiBaseUrl: string;          // t.ex. "http://localhost:4000"
  containerId: string;         // id på <div> där widgeten ska renderas
  sessionId: string;           // sessions-id från butiken
  limit?: number;              // max antal rekommendationer
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
}

interface RecommendationsResponse {
  items: Product[];
  strategy?: string;
  reason?: string;
}

// Hjälp: skapa element med klass
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
): Promise<Product[]> {
  const products = await fetchJSON<Product[]>(`${baseUrl}/products`);
  if (limit) return products.slice(0, limit);
  return products;
}

async function sendEvent(
  baseUrl: string,
  sessionId: string,
  productId: number,
  eventType: "product_click" | "product_view"
): Promise<void> {
  try {
    await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        productId,
        eventType,
      }),
    });
  } catch {
    // tyst fail – widgeten ska aldrig krascha butiken
  }
}

function renderProducts(
  container: HTMLElement,
  products: Product[],
  opts: { baseUrl: string; sessionId: string }
): void {
  container.innerHTML = "";

  if (!products.length) {
    const empty = el(
      "div",
      "ppfe-widget-empty",
      "Inga rekommendationer tillgängliga just nu."
    );
    container.appendChild(empty);
    return;
  }

  const list = el("div", "ppfe-widget-grid");

  products.forEach((product) => {
    const card = el("article", "ppfe-widget-card");

    const imgArea = el("div", "ppfe-widget-image");
    if (product.imageUrl) {
      const img = el("img", "ppfe-widget-image-tag") as HTMLImageElement;
      img.src = product.imageUrl;
      img.alt = product.name;
      imgArea.appendChild(img);
    } else {
      const fallback = el(
        "div",
        "ppfe-widget-image-fallback",
        product.name.charAt(0).toUpperCase()
      );
      imgArea.appendChild(fallback);
    }

    const body = el("div", "ppfe-widget-body");
    const sku = el("div", "ppfe-widget-sku", product.sku);
    const name = el("div", "ppfe-widget-name", product.name);
    const meta = el("div", "ppfe-widget-meta");

    if (product.category) {
      meta.appendChild(
        el("span", "ppfe-widget-pill", product.category.toLowerCase())
      );
    }

    if (product.price != null) {
      meta.appendChild(
        el("span", "ppfe-widget-price", `${product.price.toFixed(0)} kr`)
      );
    }

    const btn = el("button", "ppfe-widget-button", "Visa produkt");
    btn.addEventListener("click", () => {
      sendEvent(opts.baseUrl, opts.sessionId, product.id, "product_click");
      // Här skulle en riktig butik t.ex. navigera till PDP
    });

    body.appendChild(sku);
    body.appendChild(name);
    body.appendChild(meta);
    body.appendChild(btn);

    card.appendChild(imgArea);
    card.appendChild(body);
    list.appendChild(card);
  });

  container.appendChild(list);
}

/**
 * Publik init-funktion.
 */
export async function initWidget(config: WidgetConfig): Promise<void> {
  const { apiBaseUrl, containerId, sessionId, limit } = config;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(
      `[PPFE] Hittar ingen container med id="${containerId}". Avbryter render.`
    );
    return;
  }

  container.classList.add("ppfe-widget-root");
  container.innerHTML = "";

  const header = el("div", "ppfe-widget-header");
  header.appendChild(el("div", "ppfe-widget-title", "Rekommenderat för dig"));
  header.appendChild(
    el(
      "div",
      "ppfe-widget-subtitle",
      "Byggt med ett enkelt regelbaserat rekommendationsflöde."
    )
  );

  const content = el("div", "ppfe-widget-content");
  const state = el("div", "ppfe-widget-state", "Laddar rekommendationer...");

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(state);

  try {
    let recs: Product[] = [];

    try {
      const res = await fetchRecommendations(apiBaseUrl, sessionId, limit);
      recs = res.items;
    } catch {
      // om rekommendationer failar → fallback till produkter
      recs = await fetchFallbackProducts(apiBaseUrl, limit);
    }

    renderProducts(content, recs, { baseUrl: apiBaseUrl, sessionId });
    state.textContent = "";
  } catch (err) {
    console.error("[PPFE] Misslyckades ladda widget", err);
    state.textContent =
      "Kunde inte hämta rekommendationer just nu. Försök igen senare.";
  }
}
