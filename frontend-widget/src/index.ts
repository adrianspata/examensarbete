// frontend-widget/src/index.ts
import "./styles.css";
import { initWidget, type WidgetConfig } from "./widget";

export type { WidgetConfig } from "./widget";

// Publikt API för butiker
export const PPFE = {
  init(config: WidgetConfig) {
    return initWidget(config);
  },
};

// Gör tillgänglig på window för script-tag användning
declare global {
  interface Window {
    PPFE?: typeof PPFE;
  }
}

if (typeof window !== "undefined") {
  window.PPFE = PPFE;
}
