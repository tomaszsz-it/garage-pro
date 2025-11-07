import { useState } from "react";
import type { ReservationStatus } from "../../types";
import { ReservationsFilterPanel } from "./ReservationsFilterPanel";
import { ReservationsList } from "./ReservationsList";
import { PaginationControls } from "../shared/PaginationControls";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorNotification } from "./ErrorNotification";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { useReservations } from "./hooks/useReservations";

interface ReservationFiltersViewModel {
  vehicleLicensePlate: string | null;
  serviceId: number | null;
  status: ReservationStatus | null;
}

export function ReservationsView() {
  // State management
  const [filters, setFilters] = useState<ReservationFiltersViewModel>({
    vehicleLicensePlate: null,
    serviceId: null,
    status: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Custom hook for data fetching and state management
  const { reservations, vehicles, services, isLoading, error, pagination, refetch } = useReservations({
    page: currentPage,
    filters,
  });

  // Event handlers
  const handleFilterChange = (newFilters: ReservationFiltersViewModel) => {
    setCurrentPage(1); // Reset page on filter change
    setFilters(newFilters);
  };

  // Error handling
  if (error) {
    return <ErrorNotification onRetry={refetch} />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Empty state
  if (!isLoading && (!reservations || reservations.length === 0)) {
    const hasFilters = Boolean(filters.vehicleLicensePlate || filters.serviceId || filters.status);
    return <EmptyStateMessage hasVehicles={Boolean(vehicles?.length)} hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-6">
      <ReservationsFilterPanel
        vehicles={vehicles}
        services={services}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      {reservations && <ReservationsList reservations={reservations} />}
      {pagination && <PaginationControls pagination={pagination} onPageChange={setCurrentPage} />}
    </div>
  );
}
