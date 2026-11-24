import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root element");
}

createRoot(container).render(
  <StrictMode>
    <h1>Test DGT</h1>
  </StrictMode>,
);
