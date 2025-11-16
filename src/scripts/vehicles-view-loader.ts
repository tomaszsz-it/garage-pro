// src/scripts/vehicles-view-loader.ts
import { VehiclesView } from "../components/vehicles/VehiclesView";
import { createRoot } from "react-dom/client";
import { createElement } from "react";

const container = document.getElementById("vehicles-view");
if (container) {
  const root = createRoot(container);
  root.render(createElement(VehiclesView));
}
