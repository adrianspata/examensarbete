import React from "react";
import ReactDOM from "react-dom/client";
import { Storefront } from "./storefront";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Storefront />
  </React.StrictMode>
);
