import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DialogAccessibility } from "./components/DialogAccessibility";
import "@fontsource-variable/manrope";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DialogAccessibility />
    <App />
  </StrictMode>,
);
