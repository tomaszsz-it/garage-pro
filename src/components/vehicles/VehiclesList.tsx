import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { VehicleDto } from "../../types";
import { VehicleListItem } from "./VehicleListItem";

interface VehiclesListProps {
  vehicles: VehicleDto[];
  onEdit: (vehicle: VehicleDto) => void;
  onDelete: (vehicle: VehicleDto) => void;
}

export function VehiclesList({ vehicles, onEdit, onDelete }: VehiclesListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const view = isDesktop ? "table" : "card";

  if (view === "table") {
    return (
      <div 
        className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--neutral-30)] bg-card shadow-[var(--elevation-2)]" 
        role="region" 
        aria-label="Lista pojazdów"
      >
        <table className="w-full border-collapse" role="grid" aria-label="Pojazdy">
          <thead>
            <tr className="border-b border-[var(--neutral-30)] bg-[var(--neutral-5)]">
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                Numer rejestracyjny
              </th>
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                Marka
              </th>
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                Model
              </th>
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                Rok
              </th>
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                VIN
              </th>
              <th className="p-[var(--spacing-lg)] text-left font-[var(--font-weight-medium)] text-[var(--font-size-body)] text-[var(--neutral-80)]" scope="col">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <VehicleListItem 
                key={vehicle.license_plate} 
                vehicle={vehicle} 
                view="table"
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--spacing-lg)]" role="list" aria-label="Lista pojazdów">
      {vehicles.map((vehicle) => (
        <div key={vehicle.license_plate} role="listitem">
          <VehicleListItem 
            vehicle={vehicle} 
            view="card"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
