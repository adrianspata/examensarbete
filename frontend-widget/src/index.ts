import "./styles.css";
import { initWidget, type WidgetConfig } from "./widget";

export type { WidgetConfig } from "./widget";

export const PPFE = {
  init(config: WidgetConfig) {
    return initWidget(config);
  },
};

declare global {
  interface Window {
    PPFE?: typeof PPFE;
    PPFEWidget?: typeof PPFE; // alias for older docs / demos
  }
}

if (typeof window !== "undefined") {
  window.PPFE = PPFE;
  window.PPFEWidget = PPFE;
}
