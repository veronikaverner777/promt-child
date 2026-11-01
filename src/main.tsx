import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DialogAccessibility } from "./components/DialogAccessibility";
import { CatalogProvider } from "./catalog/CatalogProvider";
import "@fontsource-variable/manrope";
import "./styles.css";
import "./admin/admin.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DialogAccessibility />
    <CatalogProvider>
      <App />
    </CatalogProvider>
  </StrictMode>,
);
