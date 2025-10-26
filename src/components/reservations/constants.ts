import type { Service } from "../../types";

export const AVAILABLE_SERVICES: Service[] = [
  {
    service_id: 1,
    name: "Wymiana oleju",
    duration_minutes: 30,
    description: "Wymiana oleju silnikowego wraz z filtrem",
    created_at: new Date().toISOString(),
  },
  {
    service_id: 2,
    name: "Przegląd hamulców",
    duration_minutes: 45,
    description: "Kompleksowy przegląd układu hamulcowego",
    created_at: new Date().toISOString(),
  },
  {
    service_id: 3,
    name: "Wymiana opon",
    duration_minutes: 60,
    description: "Wymiana 4 opon z wyważaniem",
    created_at: new Date().toISOString(),
  },
];
