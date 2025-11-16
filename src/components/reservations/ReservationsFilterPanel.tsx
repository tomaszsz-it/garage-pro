import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMemo, useCallback } from "react";
import type { VehicleDto, Service, ReservationStatus } from "../../types";

interface ReservationFiltersViewModel {
  vehicleLicensePlate: string | null;
  serviceId: number | null;
  status: ReservationStatus | null;
}

interface ReservationsFilterPanelProps {
  vehicles: VehicleDto[] | null;
  services: Service[];
  filters: ReservationFiltersViewModel;
  onFilterChange: (filters: ReservationFiltersViewModel) => void;
}

const RESERVATION_STATUSES: { value: ReservationStatus; label: string }[] = [
  { value: "New", label: "Nowa" },
  { value: "Cancelled", label: "Anulowana" },
  { value: "Completed", label: "Zakończona" },
];

const ALL_VALUE = "all";

export function ReservationsFilterPanel({ vehicles, services, filters, onFilterChange }: ReservationsFilterPanelProps) {
  const handleFilterChange = useCallback(
    (key: keyof ReservationFiltersViewModel, value: string | number | null) => {
      const newFilters = {
        ...filters,
        [key]: value,
      };
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange({
      vehicleLicensePlate: null,
      serviceId: null,
      status: null,
    });
  }, [onFilterChange]);

  // Memoize vehicle options to prevent re-renders
  const vehicleOptions = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.map((vehicle) => ({
      value: vehicle.license_plate,
      label: `${vehicle.license_plate} - ${vehicle.brand} ${vehicle.model}`,
      ariaLabel: `${vehicle.brand} ${vehicle.model}, numer rejestracyjny ${vehicle.license_plate}`,
    }));
  }, [vehicles]);

  // Memoize service options to prevent re-renders
  const serviceOptions = useMemo(() => {
    return services.map((service) => ({
      value: service.service_id.toString(),
      label: service.name,
      ariaLabel: `${service.name}, czas trwania ${service.duration_minutes} minut`,
    }));
  }, [services]);

  return (
    <section
      aria-label="Filtry rezerwacji"
      className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] space-y-[var(--spacing-2xl)]"
      data-testid="filter-panel"
    >
      <div
        className="flex flex-col md:flex-row gap-[var(--spacing-lg)] items-end"
        role="group"
        aria-label="Opcje filtrowania"
        data-testid="filters-container"
      >
        <div className="flex-1">
          <Select
            value={filters.vehicleLicensePlate || ALL_VALUE}
            onValueChange={(value) => handleFilterChange("vehicleLicensePlate", value === ALL_VALUE ? null : value)}
            name="vehicle-filter"
            aria-label="Filtruj po pojeździe"
          >
            <SelectTrigger aria-label="Wybierz pojazd">
              <SelectValue placeholder="Wybierz pojazd" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE} aria-label="Pokaż wszystkie pojazdy">
                Wszystkie pojazdy
              </SelectItem>
              {vehicleOptions.map((vehicle) => (
                <SelectItem key={vehicle.value} value={vehicle.value} aria-label={vehicle.ariaLabel}>
                  {vehicle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select
            value={filters.serviceId?.toString() || ALL_VALUE}
            onValueChange={(value) =>
              handleFilterChange("serviceId", value === ALL_VALUE ? null : value ? parseInt(value, 10) : null)
            }
            name="service-filter"
            aria-label="Filtruj po usłudze"
          >
            <SelectTrigger aria-label="Wybierz usługę">
              <SelectValue placeholder="Wybierz usługę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE} aria-label="Pokaż wszystkie usługi">
                Wszystkie usługi
              </SelectItem>
              {serviceOptions.map((service) => (
                <SelectItem key={service.value} value={service.value} aria-label={service.ariaLabel}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select
            value={filters.status || ALL_VALUE}
            onValueChange={(value) =>
              handleFilterChange("status", value === ALL_VALUE ? null : (value as ReservationStatus))
            }
            name="status-filter"
            aria-label="Filtruj po statusie"
          >
            <SelectTrigger aria-label="Wybierz status">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE} aria-label="Pokaż wszystkie statusy">
                Wszystkie statusy
              </SelectItem>
              {RESERVATION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} aria-label={`Status: ${status.label}`}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            aria-label="Wyczyść wszystkie filtry"
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
          >
            <X className="w-4 h-4 mr-2" />
            Wyczyść filtry
          </Button>
        </div>
      </div>
    </section>
  );
}
