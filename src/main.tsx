import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root element");
}

createRoot(container).render(
  <StrictMode>
    <h1 className="p-6 text-2xl font-semibold">DGT Tests</h1>
  </StrictMode>,
);
