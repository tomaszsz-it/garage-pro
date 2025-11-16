// src/scripts/vehicle-form-create-loader.ts
import { VehicleForm } from "../components/vehicles/VehicleForm";
import { createRoot } from "react-dom/client";
import { createElement } from "react";

const container = document.getElementById("vehicle-form");
if (container) {
  const root = createRoot(container);
  root.render(createElement(VehicleForm, { mode: "create" }));
}
