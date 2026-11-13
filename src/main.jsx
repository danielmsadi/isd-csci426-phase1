import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { brand } from "./data/brand";
import { PortalProvider } from "./data/PortalContext";
import "./styles/global.css";
import "./styles/public.css";
import "./styles/portal.css";
document.title = `${brand.name} · Student Services`;
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortalProvider>
        <App />
      </PortalProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
