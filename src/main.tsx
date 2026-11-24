import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Heading } from "@/components/ui/Heading";
import "./styles.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root element");
}

createRoot(container).render(
  <StrictMode>
    <div className="p-6">
      <Heading>DGT Tests</Heading>
    </div>
  </StrictMode>,
);
