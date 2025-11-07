import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  const handleFilterChange = (key: keyof ReservationFiltersViewModel, value: string | number | null) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      vehicleLicensePlate: null,
      serviceId: null,
      status: null,
    });
  };

  return (
    <section
      aria-label="Filtry rezerwacji"
      className="bg-card p-[var(--spacing-2xl)] rounded-[var(--radius-lg)] shadow-[var(--elevation-2)] border border-[var(--neutral-30)] space-y-[var(--spacing-2xl)] animate-[fadeIn_300ms_ease-out]"
      data-testid="filter-panel"
    >
      <div
        className="flex flex-col md:flex-row gap-[var(--spacing-lg)]"
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
              {vehicles?.map((vehicle) => (
                <SelectItem
                  key={vehicle.license_plate}
                  value={vehicle.license_plate}
                  aria-label={`${vehicle.brand} ${vehicle.model}, numer rejestracyjny ${vehicle.license_plate}`}
                >
                  {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
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
              {services.map((service) => (
                <SelectItem
                  key={service.service_id}
                  value={service.service_id.toString()}
                  aria-label={`${service.name}, czas trwania ${service.duration_minutes} minut`}
                >
                  {service.name}
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
      </div>

      <div
        className="flex justify-end gap-[var(--spacing-lg)] flex-wrap"
        role="group"
        aria-label="Akcje"
        data-testid="buttons-container"
      >
        <Button
          variant="outline"
          onClick={handleClearFilters}
          aria-label="Wyczyść wszystkie filtry"
          className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
        >
          Wyczyść filtry
        </Button>
        <Button
          variant="default"
          onClick={() => (window.location.href = "/reservations/available")}
          disabled={!vehicles?.length}
          aria-label={!vehicles?.length ? "Dodaj pojazd aby móc znaleźć termin" : "Znajdź dostępny termin"}
          className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
        >
          Znajdź termin
        </Button>
        {vehicles?.length ? (
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/vehicles")}
            aria-label="Zarządzaj swoimi pojazdami"
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
          >
            Zarządzaj pojazdami
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => (window.location.href = "/vehicles/new")}
            aria-label="Dodaj nowy pojazd"
            className="hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
          >
            Dodaj pojazd
          </Button>
        )}
      </div>
    </section>
  );
}
