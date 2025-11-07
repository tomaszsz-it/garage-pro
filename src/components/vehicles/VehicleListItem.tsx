import { Button } from "@/components/ui/button";
import { Edit, Trash2, Car } from "lucide-react";
import type { VehicleDto } from "../../types";

interface VehicleListItemProps {
  vehicle: VehicleDto;
  view: "table" | "card";
  onEdit: (vehicle: VehicleDto) => void;
  onDelete: (vehicle: VehicleDto) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getVehicleDisplayName(vehicle: VehicleDto): string {
  const parts = [vehicle.brand, vehicle.model, vehicle.production_year?.toString()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : vehicle.license_plate;
}

function TableRow({ vehicle, onEdit, onDelete }: Omit<VehicleListItemProps, "view">) {
  const displayName = getVehicleDisplayName(vehicle);
  const formattedDate = formatDate(vehicle.created_at);

  return (
    <tr
      className="border-b border-[var(--neutral-20)] hover:bg-[var(--neutral-5)] transition-all duration-150 ease-out group"
      role="row"
    >
      <td className="p-[var(--spacing-lg)] font-[var(--font-weight-medium)] text-foreground">
        <div className="flex items-center gap-[var(--spacing-sm)]">
          <Car className="h-4 w-4 text-[var(--neutral-60)]" />
          {vehicle.license_plate}
        </div>
      </td>
      <td className="p-[var(--spacing-lg)] text-[var(--neutral-70)]">
        {vehicle.brand || "—"}
      </td>
      <td className="p-[var(--spacing-lg)] text-[var(--neutral-70)]">
        {vehicle.model || "—"}
      </td>
      <td className="p-[var(--spacing-lg)] text-[var(--neutral-70)]">
        {vehicle.production_year || "—"}
      </td>
      <td className="p-[var(--spacing-lg)] text-[var(--neutral-70)] font-mono text-sm">
        {vehicle.vin ? (
          <span title={vehicle.vin}>
            {vehicle.vin.substring(0, 8)}...
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="p-[var(--spacing-lg)]">
        <div className="flex gap-[var(--spacing-sm)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
            }}
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
            aria-label={`Edytuj pojazd ${vehicle.license_plate}`}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle);
            }}
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out text-destructive hover:text-destructive hover:border-destructive"
            aria-label={`Usuń pojazd ${vehicle.license_plate}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function CardView({ vehicle, onEdit, onDelete }: Omit<VehicleListItemProps, "view">) {
  const displayName = getVehicleDisplayName(vehicle);
  const formattedDate = formatDate(vehicle.created_at);

  return (
    <div className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] hover:shadow-[var(--elevation-4)] transition-all duration-200 ease-out">
      <div className="flex justify-between items-start mb-[var(--spacing-lg)]">
        <div className="flex items-center gap-[var(--spacing-sm)]">
          <Car className="h-5 w-5 text-[var(--neutral-60)]" />
          <h3 className="text-[var(--font-size-title-4)] font-[var(--font-weight-semibold)] text-foreground">
            {vehicle.license_plate}
          </h3>
        </div>
        <div className="flex gap-[var(--spacing-sm)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(vehicle)}
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
            aria-label={`Edytuj pojazd ${vehicle.license_plate}`}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(vehicle)}
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out text-destructive hover:text-destructive hover:border-destructive"
            aria-label={`Usuń pojazd ${vehicle.license_plate}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-[var(--spacing-sm)] mb-[var(--spacing-lg)]">
        <p className="text-[var(--font-size-body)] text-[var(--neutral-70)]">
          <strong className="text-foreground">{displayName}</strong>
        </p>
        {vehicle.car_type && (
          <p className="text-[var(--font-size-body-small)] text-[var(--neutral-60)]">
            Typ: {vehicle.car_type}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-[var(--spacing-lg)] text-[var(--font-size-body-small)]">
        <div>
          <span className="text-[var(--neutral-60)] block">Marka</span>
          <span className="text-foreground font-[var(--font-weight-medium)]">
            {vehicle.brand || "—"}
          </span>
        </div>
        <div>
          <span className="text-[var(--neutral-60)] block">Model</span>
          <span className="text-foreground font-[var(--font-weight-medium)]">
            {vehicle.model || "—"}
          </span>
        </div>
        <div>
          <span className="text-[var(--neutral-60)] block">Rok</span>
          <span className="text-foreground font-[var(--font-weight-medium)]">
            {vehicle.production_year || "—"}
          </span>
        </div>
        <div>
          <span className="text-[var(--neutral-60)] block">Dodano</span>
          <span className="text-foreground font-[var(--font-weight-medium)]">
            {formattedDate}
          </span>
        </div>
      </div>

      {vehicle.vin && (
        <div className="mt-[var(--spacing-lg)] pt-[var(--spacing-lg)] border-t border-[var(--neutral-20)]">
          <span className="text-[var(--neutral-60)] text-[var(--font-size-body-small)] block">VIN</span>
          <span className="text-foreground font-mono text-[var(--font-size-body-small)] font-[var(--font-weight-medium)]">
            {vehicle.vin}
          </span>
        </div>
      )}
    </div>
  );
}

export function VehicleListItem({ vehicle, view, onEdit, onDelete }: VehicleListItemProps) {
  if (view === "table") {
    return <TableRow vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} />;
  }

  return <CardView vehicle={vehicle} onEdit={onEdit} onDelete={onDelete} />;
}
