// src/scripts/vehicle-form-edit-loader.ts
import { VehicleForm } from "../components/vehicles/VehicleForm";
import { createRoot } from "react-dom/client";
import { createElement } from "react";

const container = document.getElementById("vehicle-form");
if (container) {
  const licensePlate = container.getAttribute("data-license-plate");
  if (licensePlate) {
    const root = createRoot(container);
    root.render(
      createElement(VehicleForm, {
        mode: "edit",
        licensePlate: licensePlate,
      })
    );
  }
}
