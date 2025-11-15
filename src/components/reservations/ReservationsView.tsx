import { useState, useMemo, useCallback, useEffect } from "react";
import type { ReservationStatus } from "../../types";
import type { SortField, SortDirection } from "./hooks/useReservations";
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
  const [sorting, setSorting] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: "date",
    direction: "asc",
  });

  // Hydration-safe state to prevent mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Custom hook for data fetching and state management - only after hydration
  const { reservations, vehicles, services, isLoading, error, pagination, refetch } = useReservations({
    page: currentPage,
    filters,
    sorting,
    enabled: isHydrated, // Only fetch data after hydration
  });

  // Memoized event handlers
  const handleFilterChange = useCallback((newFilters: ReservationFiltersViewModel) => {
    setCurrentPage(1); // Reset page on filter change
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((field: SortField) => {
    setSorting((prev) => {
      // If clicking the same field, toggle direction
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      // If clicking a new field, start with ascending
      return {
        field,
        direction: "asc",
      };
    });
    setCurrentPage(1); // Reset page on sort change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Memoize main content to prevent unnecessary re-renders - MUST be after all hooks
  const mainContent = useMemo(
    () => (
      <div className="space-y-6">
        <ReservationsFilterPanel
          vehicles={vehicles}
          services={services}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        {reservations && (
          <ReservationsList reservations={reservations} sorting={sorting} onSortChange={handleSortChange} />
        )}
        {pagination && <PaginationControls pagination={pagination} onPageChange={handlePageChange} />}
      </div>
    ),
    [
      vehicles,
      services,
      filters,
      reservations,
      sorting,
      pagination,
      handleFilterChange,
      handleSortChange,
      handlePageChange,
    ]
  );

  // Show loading during hydration and data fetching
  if (!isHydrated || isLoading) {
    return (
      <div className="space-y-6">
        <LoadingIndicator />
      </div>
    );
  }

  // Error handling
  if (error) {
    return <ErrorNotification onRetry={refetch} />;
  }

  // Loading state is now handled above with hydration

  // Empty state
  if (!isLoading && (!reservations || reservations.length === 0)) {
    const hasFilters = Boolean(filters.vehicleLicensePlate || filters.serviceId || filters.status);
    return <EmptyStateMessage hasVehicles={Boolean(vehicles?.length)} hasFilters={hasFilters} />;
  }

  return mainContent;
}
